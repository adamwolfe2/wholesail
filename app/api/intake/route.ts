import { NextResponse } from "next/server";
import { z } from "zod";
import { createIntakeSubmission } from "@/lib/db/intake";
import {
  notifyAdminNewIntake,
  sendIntakeConfirmation,
} from "@/lib/email/notifications";
import { scrapeIntakeWebsite } from "@/lib/build/firecrawl";

const intakeSchema = z.object({
  // Step 1
  companyName: z.string().min(1),
  shortName: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  contactRole: z.string().optional(),
  annualRevenue: z.string().optional(),

  // Step 2
  industry: z.string().min(1),
  productCategories: z.string().optional(),
  skuCount: z.string().optional(),
  coldChain: z.string().optional(),
  currentOrdering: z.array(z.string()).default([]),
  activeClients: z.string().optional(),
  avgOrderValue: z.string().optional(),
  paymentTerms: z.array(z.string()).default([]),
  deliveryCoverage: z.string().optional(),

  // Step 3
  selectedFeatures: z.array(z.string()).default([]),
  primaryColor: z.string().optional(),
  hasBrandGuidelines: z.string().optional(),
  additionalNotes: z.string().optional(),

  // New intake fields (Phase 1 — pipeline automation)
  targetDomain: z.string().optional(),
  inspirationUrls: z.array(z.string()).default([]),
  logoUrl: z.string().optional(),
  brandSecondaryColor: z.string().optional(),
  minimumOrderValue: z.string().optional(),
  goLiveTimeline: z.string().optional(),

  // Optional scrape data
  scrapeData: z.any().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = intakeSchema.parse(body);

    const submission = await createIntakeSubmission(data);

    // Fire-and-forget: scrape website + inspiration URLs in background
    if (data.website) {
      void scrapeIntakeWebsite(submission.id, data.website, data.inspirationUrls ?? []);
    }

    // Fire-and-forget email notifications
    notifyAdminNewIntake({
      companyName: data.companyName,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      industry: data.industry,
      featureCount: data.selectedFeatures.length,
    });

    sendIntakeConfirmation({
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      companyName: data.companyName,
    });

    return NextResponse.json(
      { id: submission.id, message: "Submission received" },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    console.error("[intake] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
