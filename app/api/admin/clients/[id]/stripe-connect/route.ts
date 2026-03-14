import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { getSiteUrl } from "@/lib/get-site-url";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

/**
 * POST — Create a Stripe Connect onboarding link for a client org.
 * If the org doesn't have a stripeAccountId yet, creates a Standard Connect account first.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const stripe = getStripe();

    const org = await prisma.organization.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, stripeAccountId: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let stripeAccountId = org.stripeAccountId;

    // Create a Standard Connect account if none exists
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: org.email,
        metadata: {
          organizationId: org.id,
          organizationName: org.name,
        },
      });

      stripeAccountId = account.id;

      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeAccountId: account.id },
      });
    }

    // Create an account link for onboarding / dashboard access
    const appUrl = getSiteUrl();
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/admin/clients/${org.id}`,
      return_url: `${appUrl}/admin/clients/${org.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url, stripeAccountId });
  } catch (err) {
    console.error("Stripe Connect onboarding error:", err);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect onboarding link" },
      { status: 500 }
    );
  }
}

/**
 * GET — Return the Connect account status for a client org.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const org = await prisma.organization.findUnique({
      where: { id },
      select: { stripeAccountId: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!org.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        stripeAccountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(org.stripeAccountId);

    return NextResponse.json({
      connected: true,
      stripeAccountId: org.stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err) {
    console.error("Stripe Connect status error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Stripe Connect status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Disconnect the Stripe Connect account (nulls out stripeAccountId).
 * Does NOT delete the account on Stripe — just removes the association.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const org = await prisma.organization.findUnique({
      where: { id },
      select: { id: true, stripeAccountId: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!org.stripeAccountId) {
      return NextResponse.json({ error: "No Stripe account connected" }, { status: 400 });
    }

    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeAccountId: null },
    });

    await prisma.auditEvent.create({
      data: {
        entityType: "Organization",
        entityId: org.id,
        action: "stripe_connect_disconnected",
        userId,
        metadata: { stripeAccountId: org.stripeAccountId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Stripe Connect disconnect error:", err);
    return NextResponse.json(
      { error: "Failed to disconnect Stripe account" },
      { status: 500 }
    );
  }
}
