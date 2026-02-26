import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWelcomePartnerEmail } from "@/lib/email";

const onboardingSchema = z.object({
  businessName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  website: z.string().optional(),
  businessType: z.enum([
    "RESTAURANT",
    "HOTEL",
    "CATERING",
    "RETAIL",
    "DISTRIBUTOR",
    "OTHER",
  ]),
  estimatedMonthlyVolume: z.string().optional(),
  currentSupplier: z.string().optional(),
  productsInterested: z.array(z.string()).optional(),
  deliveryAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  howDidYouHear: z.string().optional(),
  notes: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please fill in all required fields.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Create organization as NEW tier
    try {
      const org = await prisma.organization.create({
        data: {
          name: data.businessName,
          contactPerson: data.contactName,
          email: data.email,
          phone: data.phone,
          website: data.website || null,
          tier: "NEW",
          paymentTerms: "COD",
        },
      });

      // Create shipping address if provided
      if (data.deliveryAddress && data.city && data.state && data.zip) {
        await prisma.address.create({
          data: {
            organizationId: org.id,
            type: "SHIPPING",
            street: data.deliveryAddress,
            city: data.city,
            state: data.state,
            zip: data.zip,
            isDefault: true,
          },
        });
      }

      // Link referral if a referral code was provided
      if (data.referralCode) {
        try {
          const referralOrg = await prisma.organization.findUnique({
            where: { referralCode: data.referralCode.toUpperCase() },
            select: { id: true },
          });
          if (referralOrg) {
            // Find any pending referral for this email
            const existingReferral = await prisma.referral.findFirst({
              where: {
                referrerId: referralOrg.id,
                refereeEmail: data.email.toLowerCase(),
                status: "PENDING",
              },
            });
            if (existingReferral) {
              await prisma.referral.update({
                where: { id: existingReferral.id },
                data: { refereeOrgId: org.id },
              });
            } else {
              // Create referral if they applied via link but no direct invite was sent
              await prisma.referral.create({
                data: {
                  referrerId: referralOrg.id,
                  refereeEmail: data.email.toLowerCase(),
                  refereeName: data.contactName,
                  refereeOrgId: org.id,
                  status: "PENDING",
                },
              });
            }
          }
        } catch (refErr) {
          console.error("Referral linking error (non-fatal):", refErr);
        }
      }

      // Create WholesaleApplication so admin review pipeline works
      await prisma.wholesaleApplication.create({
        data: {
          businessName: data.businessName,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          website: data.website || null,
          businessType: data.businessType.toLowerCase(),
          monthlyVolume: data.estimatedMonthlyVolume || null,
          notes: [
            data.currentSupplier ? `Current supplier: ${data.currentSupplier}` : null,
            data.productsInterested?.length ? `Products interested: ${data.productsInterested.join(', ')}` : null,
            data.howDidYouHear ? `How they heard: ${data.howDidYouHear}` : null,
            data.notes || null,
          ].filter(Boolean).join('\n') || null,
        },
      })

      // Log audit event
      await prisma.auditEvent.create({
        data: {
          entityType: "Organization",
          entityId: org.id,
          action: "partner_application",
          metadata: {
            businessType: data.businessType,
            estimatedVolume: data.estimatedMonthlyVolume,
            currentSupplier: data.currentSupplier,
            productsInterested: data.productsInterested,
            howDidYouHear: data.howDidYouHear,
            notes: data.notes,
            referralCode: data.referralCode || null,
          },
        },
      });

      // Send welcome email (fire-and-forget)
      sendWelcomePartnerEmail({
        name: data.contactName,
        email: data.email,
        businessName: data.businessName,
      }).catch((err) => console.error("Welcome email error:", err));

      return NextResponse.json({
        success: true,
        organizationId: org.id,
        message: "Application submitted successfully",
      });
    } catch (dbError) {
      console.error("DB error during onboarding:", dbError);
      return NextResponse.json(
        { error: "Unable to submit application. Please try again or email us directly." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Error processing application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
