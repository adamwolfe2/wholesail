import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { InvoicePDF } from "@/lib/pdf/invoice-pdf"
import { getOrganizationByUserId } from "@/lib/db/organizations"
import React from "react"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Fetch user's org for access control (admins have no org — they get full access)
  const userOrg = await getOrganizationByUserId(userId).catch(() => null)

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      organization: { select: { id: true, name: true, email: true } },
      order: {
        include: {
          items: {
            select: {
              name: true,
              quantity: true,
              unitPrice: true,
              total: true,
            },
          },
        },
      },
    },
  })

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Access control: clients can only download their own invoices
  if (userOrg && invoice.organization.id !== userOrg.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Build items array from the linked order's line items
  const items = invoice.order.items.map((item) => ({
    description: item.name,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    total: Number(item.total),
  }))

  const pdfBuffer = await renderToBuffer(
    React.createElement(InvoicePDF, {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issuedAt: invoice.createdAt.toISOString(),
      dueAt: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString() ?? null,
      clientName: invoice.organization.name,
      clientEmail: invoice.organization.email,
      items,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      notes: null,
    }) as React.ReactElement<DocumentProps>
  )

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Wholesail-Invoice-${invoice.invoiceNumber}.pdf"`,
    },
  })
}
