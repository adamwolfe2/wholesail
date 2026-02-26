import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

const VALID_ROLES = ["CLIENT", "SALES_REP", "OPS", "ADMIN"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

function isValidRole(value: unknown): value is ValidRole {
  return typeof value === "string" && VALID_ROLES.includes(value as ValidRole);
}

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
    public_metadata: Record<string, unknown>;
  };
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const headerPayload = req.headers;
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, public_metadata } =
        event.data;
      const email = email_addresses[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "User";
      const rawRole = public_metadata?.role;
      const role: ValidRole = isValidRole(rawRole) ? rawRole : "CLIENT";

      // Extract organizationId from invite metadata on both created and updated
      // so existing Clerk accounts also get linked when they accept an invite
      const metaOrgId =
        typeof public_metadata?.organizationId === "string"
          ? public_metadata.organizationId
          : undefined;

      // Verify org exists before linking (prevent dangling FK)
      const orgExists = metaOrgId
        ? !!(await prisma.organization.findUnique({ where: { id: metaOrgId } }))
        : false;

      // For user.updated: only apply org from metadata if the user isn't already in an org
      // (avoids overwriting an existing org assignment on routine profile updates)
      let organizationId: string | undefined = orgExists ? metaOrgId : undefined;
      if (event.type === "user.updated" && organizationId) {
        const existing = await prisma.user.findUnique({
          where: { id },
          select: { organizationId: true },
        });
        if (existing?.organizationId) {
          organizationId = undefined; // already linked — don't overwrite
        }
      }

      await prisma.user.upsert({
        where: { id },
        create: {
          id,
          email: email || "",
          name,
          role,
          ...(organizationId
            ? { organization: { connect: { id: organizationId } } }
            : {}),
        },
        update: {
          email: email || undefined,
          name,
          role,
          ...(organizationId
            ? { organization: { connect: { id: organizationId } } }
            : {}),
        },
      });

      // On first sign-up: if no explicit org was linked, auto-link by email
      // so partner form applicants are connected as soon as they create an account
      if (event.type === "user.created" && !organizationId && email) {
        const orgByEmail = await prisma.organization.findFirst({
          where: { email },
          select: { id: true },
        });
        if (orgByEmail) {
          await prisma.user.update({
            where: { id },
            data: { organizationId: orgByEmail.id },
          });
          console.info(`User ${id} auto-linked to org ${orgByEmail.id} by email match`);
        }
      }

      console.info(`User ${id} synced to DB${orgExists ? ` (linked to org ${organizationId})` : ""}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
