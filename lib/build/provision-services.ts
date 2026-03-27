/**
 * Build steps 9-12: Provision per-client Sentry, Resend, Stripe Connect, and Clerk.
 *
 * Each service is provisioned independently with graceful error handling.
 * Failures are non-fatal -- the build continues and logs what needs manual setup.
 */

import { createSentryProject } from "@/lib/build/sentry-admin";
import { createResendApiKey } from "@/lib/build/resend-admin";
import { createConnectedAccount } from "@/lib/build/stripe-connect";
import { provisionClerkApp, isPlatformApiAvailable } from "@/lib/build/clerk-admin";
import { sendStripeOnboardingEmail } from "@/lib/email/notifications";
import { logCost } from "@/lib/db/costs";
import { prisma } from "@/lib/db";

export interface ProvisionServicesParams {
  projectId: string;
  repoName: string | null;
  intake: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    industry: string;
    website: string | null;
    targetDomain: string | null;
  };
  buildChecklist: Record<string, boolean>;
  appendLog: (msg: string) => void;
  saveProgress: (extra?: Record<string, unknown>) => Promise<void>;
}

export interface ProvisionServicesResult {
  sentryDsn: string | null;
  sentryProjectSlug: string | null;
  resendKeyId: string | null;
  resendToken: string | null;
  stripeConnectAccountId: string | null;
  clerkPublishableKey: string | null;
  clerkSecretKey: string | null;
}

export async function provisionServices(
  params: ProvisionServicesParams
): Promise<ProvisionServicesResult> {
  const { projectId, repoName, intake, buildChecklist, appendLog, saveProgress } = params;

  let sentryDsn: string | null = null;
  let sentryProjectSlug: string | null = null;
  let resendKeyId: string | null = null;
  let resendToken: string | null = null;
  let stripeConnectAccountId: string | null = null;
  let clerkPublishableKey: string | null = null;
  let clerkSecretKey: string | null = null;

  // -- Step 9: Provision per-client Sentry project --
  if (
    !buildChecklist.sentryProjectCreated &&
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_TEAM_SLUG &&
    repoName
  ) {
    try {
      const projectName = `${intake.companyName.slice(0, 50)} Portal`;
      const projectSlug = repoName; // already kebab-case
      const sentryProject = await createSentryProject(projectName, projectSlug);
      sentryDsn = sentryProject.dsn;
      sentryProjectSlug = sentryProject.projectSlug;

      await logCost(projectId, {
        service: "sentry",
        amountCents: 0,
        description: `Per-client Sentry project created: ${projectName}`,
        metadata: {
          projectId: sentryProject.projectId,
          projectSlug: sentryProject.projectSlug,
        },
      });

      buildChecklist.sentryProjectCreated = true;
      appendLog(`Sentry project created -- slug: ${sentryProject.projectSlug}`);
      await saveProgress();
    } catch (sentryErr) {
      appendLog(`Sentry project error: ${(sentryErr as Error).message} -- error monitoring will be disabled until manually configured`);
      await saveProgress();
    }
  }

  // -- Step 10: Provision per-client Resend API key --
  if (!buildChecklist.resendKeyCreated && process.env.RESEND_API_KEY) {
    try {
      const keyName = `${intake.companyName.slice(0, 40)} Portal`;
      const resendKey = await createResendApiKey(keyName);
      resendKeyId = resendKey.keyId;
      resendToken = resendKey.token;

      await logCost(projectId, {
        service: "resend",
        amountCents: 0,
        description: `Per-client Resend API key provisioned: ${keyName}`,
        metadata: { keyId: resendKey.keyId },
      });

      buildChecklist.resendKeyCreated = true;
      appendLog(`Resend API key created -- keyId: ${resendKey.keyId}`);
      await saveProgress();
    } catch (resendErr) {
      appendLog(`Resend key error: ${(resendErr as Error).message} -- will fall back to shared key`);
      await saveProgress();
    }
  }

  // -- Step 11: Create Stripe Connect account --
  if (!buildChecklist.stripeConnectCreated && process.env.STRIPE_SECRET_KEY) {
    try {
      appendLog("Creating Stripe Express Connected Account...");
      await saveProgress();

      const connectResult = await createConnectedAccount({
        companyName: intake.companyName,
        contactEmail: intake.contactEmail,
        industry: intake.industry,
        website: intake.website,
      });

      stripeConnectAccountId = connectResult.accountId;

      await prisma.project.update({
        where: { id: projectId },
        data: { stripeAccountId: connectResult.accountId },
      });

      await logCost(projectId, {
        service: "stripe",
        amountCents: 0,
        description: "Stripe Express Connected Account created",
        metadata: { accountId: connectResult.accountId },
      });

      buildChecklist.stripeConnectCreated = true;
      appendLog(
        `Stripe Connect account created: ${connectResult.accountId} -- onboarding link generated`
      );
      await saveProgress();

      // Send onboarding email to client (fire-and-forget)
      Promise.resolve(
        sendStripeOnboardingEmail({
          contactName: intake.contactName,
          contactEmail: intake.contactEmail,
          companyName: intake.companyName,
          onboardingUrl: connectResult.onboardingUrl,
        })
      ).catch((emailErr) => {
        appendLog(
          `Stripe onboarding email error (non-fatal): ${(emailErr as Error).message}`
        );
      });
    } catch (stripeErr) {
      appendLog(
        `Stripe Connect error (non-fatal): ${(stripeErr as Error).message} -- client will need manual Stripe setup`
      );
      await saveProgress();
    }
  } else if (buildChecklist.stripeConnectCreated) {
    // Recover existing Stripe account ID from project
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { stripeAccountId: true },
    });
    stripeConnectAccountId = existingProject?.stripeAccountId ?? null;
  }

  // -- Step 12: Provision Clerk app (Platform API) --
  if (!buildChecklist.clerkAppCreated && isPlatformApiAvailable()) {
    try {
      appendLog("Creating Clerk application via Platform API...");
      await saveProgress();

      const clerkResult = await provisionClerkApp(
        repoName ?? intake.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        intake.targetDomain ?? undefined
      );

      if (clerkResult) {
        clerkPublishableKey = clerkResult.publishableKey;
        clerkSecretKey = clerkResult.secretKey;

        await logCost(projectId, {
          service: "clerk",
          amountCents: 0,
          description: "Clerk application created via Platform API",
          metadata: {
            applicationId: clerkResult.applicationId,
            instanceCount: clerkResult.allInstances.length,
          },
        });

        buildChecklist.clerkAppCreated = true;
        appendLog(
          `Clerk app created: ${clerkResult.applicationId} -- ${clerkResult.allInstances.length} instances (dev + prod)`
        );
        await saveProgress();
      }
    } catch (clerkErr) {
      appendLog(
        `Clerk Platform API error (non-fatal): ${(clerkErr as Error).message} -- will fall back to manual setup`
      );
      await saveProgress();
    }
  }

  return {
    sentryDsn,
    sentryProjectSlug,
    resendKeyId,
    resendToken,
    stripeConnectAccountId,
    clerkPublishableKey,
    clerkSecretKey,
  };
}
