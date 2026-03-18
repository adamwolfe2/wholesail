import { NextRequest, NextResponse } from "next/server";
import { captureWithContext } from "@/lib/sentry";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_ORDER = 5;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * POST /api/attachments
 * Upload a file and attach it to an order.
 * Requires admin/rep auth, or client auth if they own the order.
 */
export async function POST(req: NextRequest) {
  try {
    // Try admin auth first, then client auth
    let userId: string | null = null;

    const adminResult = await requireAdminOrRep();
    if (!adminResult.error) {
      userId = adminResult.userId;
    } else {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        userId = clerkUserId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Accepted: PDF, images (JPEG/PNG/WebP), CSV, Excel, Word." },
        { status: 400 },
      );
    }

    // Verify order exists and user has access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, organizationId: true, _count: { select: { attachments: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check file limit per order
    if (order._count.attachments >= MAX_FILES_PER_ORDER) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_ORDER} files per order.` },
        { status: 400 },
      );
    }

    // For client users, verify they own the order
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (user?.role === "CLIENT" && user.organizationId !== order.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Upload to Vercel Blob
    const blob = await put(`attachments/${orderId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Save to database
    const attachment = await prisma.attachment.create({
      data: {
        orderId,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: userId,
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    captureWithContext(error, { route: "attachments", method: "POST" });
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

const deleteSchema = z.object({
  attachmentId: z.string().min(1),
});

/**
 * DELETE /api/attachments
 * Remove an attachment. Admin/rep can delete any, clients can only delete their own.
 */
export async function DELETE(req: NextRequest) {
  try {
    let userId: string | null = null;

    const adminResult = await requireAdminOrRep();
    if (!adminResult.error) {
      userId = adminResult.userId;
    } else {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        userId = clerkUserId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "attachmentId is required" }, { status: 400 });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: parsed.data.attachmentId },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Client users can only delete their own uploads
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === "CLIENT" && attachment.uploadedById !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete from Vercel Blob
    try {
      await del(attachment.fileUrl);
    } catch {
      // Non-fatal — blob may already be gone
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: parsed.data.attachmentId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    captureWithContext(error, { route: "attachments", method: "DELETE" });
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 },
    );
  }
}
