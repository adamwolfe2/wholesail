import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
    select: { stripeAccountId: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!project.stripeAccountId) {
    return NextResponse.json({
      status: "not_started",
      detailsSubmitted: false,
      chargesEnabled: false,
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({
      status: "unknown",
      error: "Stripe not configured",
      detailsSubmitted: false,
      chargesEnabled: false,
    });
  }

  try {
    const account = await stripe.accounts.retrieve(project.stripeAccountId);
    const detailsSubmitted = account.details_submitted ?? false;
    const chargesEnabled = account.charges_enabled ?? false;

    let status: string;
    if (detailsSubmitted && chargesEnabled) {
      status = "active";
    } else if (project.stripeAccountId) {
      status = "pending";
    } else {
      status = "not_started";
    }

    return NextResponse.json({ status, detailsSubmitted, chargesEnabled });
  } catch (err) {
    console.error("[stripe-status] Failed to retrieve Stripe account:", err);
    return NextResponse.json({
      status: "error",
      error: String(err),
      detailsSubmitted: false,
      chargesEnabled: false,
    });
  }
}
