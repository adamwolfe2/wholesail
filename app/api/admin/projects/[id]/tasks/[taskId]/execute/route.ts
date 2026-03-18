import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { addNote, updateTask } from "@/lib/db/projects";
import { setEnvVar } from "@/lib/build/vercel-api";
import {
  sendAssetRequestEmail,
  sendReadyForReviewEmail,
  sendPortalLiveEmail,
} from "@/lib/email/project-emails";
import Stripe from "stripe";

// ── Helpers ──────────────────────────────────────────────────────────────────

const VERCEL_API = "https://api.vercel.com";

function vercelHeaders() {
  const token = process.env.WS_VERCEL_TOKEN;
  if (!token) throw new Error("WS_VERCEL_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function vercelTeamParam() {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `?teamId=${teamId}` : "";
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

// ── Required env vars for verification ───────────────────────────────────────

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CRON_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
];

// ── Action Implementations ───────────────────────────────────────────────────

type ActionResult = {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  /** If false, don't auto-complete the task even on "success" */
  autoComplete?: boolean;
};

async function executeStripeWebhook(
  project: {
    id: string;
    vercelUrl: string | null;
    vercelProject: string | null;
    stripeAccountId: string | null;
    customDomain: string | null;
  }
): Promise<ActionResult> {
  const stripe = getStripe();

  const siteUrl = project.customDomain
    ? `https://${project.customDomain}`
    : project.vercelUrl;

  if (!siteUrl) {
    return { success: false, message: "No site URL configured. Deploy the project first." };
  }

  const webhookUrl = `${siteUrl}/api/webhooks/stripe`;

  const createParams: Stripe.WebhookEndpointCreateParams = {
    url: webhookUrl,
    enabled_events: [
      "checkout.session.completed",
      "checkout.session.expired",
      "payment_intent.payment_failed",
      "charge.refunded",
      "charge.dispute.created",
      "charge.dispute.closed",
      "invoice.payment_failed",
    ],
  };

  const stripeOptions: Stripe.RequestOptions | undefined = project.stripeAccountId
    ? { stripeAccount: project.stripeAccountId }
    : undefined;

  const endpoint = await stripe.webhookEndpoints.create(createParams, stripeOptions);

  // Save the signing secret to Vercel env vars
  if (project.vercelProject && endpoint.secret) {
    await setEnvVar(project.vercelProject, "STRIPE_WEBHOOK_SECRET", endpoint.secret);
  }

  return {
    success: true,
    message: `Stripe webhook created for ${webhookUrl}. Signing secret saved to Vercel env vars.`,
    details: {
      endpointId: endpoint.id,
      url: webhookUrl,
      events: endpoint.enabled_events,
      secretSaved: !!project.vercelProject,
    },
  };
}

async function executeVerifyEnvVars(
  project: { id: string; vercelProject: string | null }
): Promise<ActionResult> {
  if (!project.vercelProject) {
    return { success: false, message: "No Vercel project linked. Run the build pipeline first." };
  }

  const res = await fetch(
    `${VERCEL_API}/v10/projects/${project.vercelProject}/env${vercelTeamParam()}`,
    { headers: vercelHeaders() }
  );

  if (!res.ok) {
    const body = await res.text();
    return { success: false, message: `Vercel API error (${res.status}): ${body}` };
  }

  const data = await res.json();
  const envVars: Array<{ key: string; value?: string }> = data.envs ?? [];
  const setKeys = new Set(envVars.map((e) => e.key));

  const configured: string[] = [];
  const missing: string[] = [];
  const pending: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!setKeys.has(key)) {
      missing.push(key);
    } else {
      // Check if it's a placeholder value
      const envVar = envVars.find((e) => e.key === key);
      if (envVar?.value?.startsWith("PENDING_")) {
        pending.push(key);
      } else {
        configured.push(key);
      }
    }
  }

  // Also check for Stripe vars (either Connect or direct)
  const hasStripeConnect = setKeys.has("STRIPE_CONNECT_ACCOUNT_ID");
  const hasStripeSecret = setKeys.has("STRIPE_SECRET_KEY");
  if (!hasStripeConnect && !hasStripeSecret) {
    missing.push("STRIPE_SECRET_KEY (or STRIPE_CONNECT_ACCOUNT_ID)");
  }

  const allGood = missing.length === 0 && pending.length === 0;

  return {
    success: true,
    autoComplete: allGood,
    message: allGood
      ? `All ${configured.length} required env vars are configured.`
      : `${configured.length} configured, ${pending.length} pending, ${missing.length} missing.`,
    details: {
      configured,
      pending,
      missing,
      totalOnVercel: envVars.length,
    },
  };
}

async function executeAddDomain(
  project: { id: string; vercelProject: string | null; customDomain: string | null },
  intake: { targetDomain: string | null } | null
): Promise<ActionResult> {
  const domain = project.customDomain || intake?.targetDomain;
  if (!domain) {
    return { success: false, message: "No custom domain specified in the intake or project." };
  }
  if (!project.vercelProject) {
    return { success: false, message: "No Vercel project linked. Run the build pipeline first." };
  }

  const res = await fetch(
    `${VERCEL_API}/v10/projects/${project.vercelProject}/domains${vercelTeamParam()}`,
    {
      method: "POST",
      headers: vercelHeaders(),
      body: JSON.stringify({ name: domain }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    // 409 means domain already added
    if (res.status === 409) {
      return {
        success: true,
        message: `Domain "${domain}" is already added to the Vercel project.`,
        details: { domain, alreadyAdded: true },
      };
    }
    return { success: false, message: `Vercel API error (${res.status}): ${body}` };
  }

  const responseData = await res.json();

  // Save domain to project if not already set
  if (!project.customDomain) {
    await prisma.project.update({
      where: { id: project.id },
      data: { customDomain: domain },
    });
  }

  return {
    success: true,
    message: `Domain "${domain}" added to Vercel. Client needs to configure DNS records.`,
    details: {
      domain,
      verification: responseData.verification ?? null,
      apexName: responseData.apexName ?? null,
    },
  };
}

async function executeSendEmail(
  action: "send_assets_email" | "send_review_email" | "send_live_email",
  project: {
    id: string;
    company: string;
    contactName: string;
    contactEmail: string;
    vercelUrl: string | null;
    customDomain: string | null;
  }
): Promise<ActionResult> {
  const emailData = {
    company: project.company,
    contactName: project.contactName,
    contactEmail: project.contactEmail,
    vercelUrl: project.vercelUrl,
    customDomain: project.customDomain,
  };

  let result: { success: boolean; error?: string };
  let templateLabel: string;

  switch (action) {
    case "send_assets_email":
      result = await sendAssetRequestEmail(emailData);
      templateLabel = "Asset request";
      break;
    case "send_review_email":
      result = await sendReadyForReviewEmail(emailData);
      templateLabel = "Ready for review";
      break;
    case "send_live_email":
      result = await sendPortalLiveEmail(emailData);
      templateLabel = "Portal is live";
      break;
  }

  if (!result.success) {
    return { success: false, message: `Email failed: ${result.error}` };
  }

  return {
    success: true,
    message: `"${templateLabel}" email sent to ${project.contactEmail}.`,
    details: { template: templateLabel, recipient: project.contactEmail },
  };
}

async function executeVerifyMigration(
  project: { vercelUrl: string | null; customDomain: string | null }
): Promise<ActionResult> {
  const siteUrl = project.customDomain
    ? `https://${project.customDomain}`
    : project.vercelUrl;

  if (!siteUrl) {
    return { success: false, message: "No site URL configured." };
  }

  const statusUrl = `${siteUrl}/api/status`;

  try {
    const res = await fetch(statusUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Status endpoint returned ${res.status}. The deployment may not be ready yet.`,
        details: { url: statusUrl, status: res.status },
      };
    }

    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }

    return {
      success: true,
      message: `Status endpoint returned 200 OK. The application is running.`,
      details: { url: statusUrl, response: body },
    };
  } catch (err) {
    return {
      success: false,
      message: `Could not reach ${statusUrl}: ${err instanceof Error ? err.message : String(err)}`,
      details: { url: statusUrl },
    };
  }
}

async function executeVerifySSL(
  project: { customDomain: string | null; vercelUrl: string | null }
): Promise<ActionResult> {
  const domain = project.customDomain;
  const url = domain ? `https://${domain}` : project.vercelUrl;

  if (!url) {
    return { success: false, message: "No domain or URL configured to verify." };
  }

  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    const isHttps = url.startsWith("https://");
    const status = res.status;
    const isRedirect = status >= 300 && status < 400;

    if (isRedirect) {
      const location = res.headers.get("location");
      return {
        success: false,
        message: `${url} redirects to ${location}. SSL may not be configured yet.`,
        details: { url, status, redirectTo: location },
      };
    }

    if (status >= 200 && status < 400 && isHttps) {
      return {
        success: true,
        message: `HTTPS verification passed for ${url}. Status: ${status}.`,
        details: { url, status, https: true },
      };
    }

    return {
      success: false,
      message: `${url} returned status ${status}. Check the deployment.`,
      details: { url, status },
    };
  } catch (err) {
    return {
      success: false,
      message: `Could not reach ${url}: ${err instanceof Error ? err.message : String(err)}`,
      details: { url },
    };
  }
}

async function executeLighthouseAudit(
  project: { vercelUrl: string | null; customDomain: string | null }
): Promise<ActionResult> {
  const siteUrl = project.customDomain
    ? `https://${project.customDomain}`
    : project.vercelUrl;

  if (!siteUrl) {
    return { success: false, message: "No site URL configured." };
  }

  const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  apiUrl.searchParams.set("url", siteUrl);
  apiUrl.searchParams.set("strategy", "mobile");
  apiUrl.searchParams.append("category", "performance");
  apiUrl.searchParams.append("category", "accessibility");
  apiUrl.searchParams.append("category", "seo");

  try {
    const res = await fetch(apiUrl.toString(), {
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        message: `PageSpeed Insights API error (${res.status}): ${body.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const categories = data.lighthouseResult?.categories ?? {};

    const scores: Record<string, number> = {};
    for (const [key, cat] of Object.entries(categories)) {
      scores[key] = Math.round(((cat as { score?: number }).score ?? 0) * 100);
    }

    const perfOk = (scores.performance ?? 0) >= 80;
    const a11yOk = (scores.accessibility ?? 0) >= 90;
    const seoOk = (scores.seo ?? 0) >= 90;
    const allPass = perfOk && a11yOk && seoOk;

    return {
      success: true,
      autoComplete: allPass,
      message: allPass
        ? `Lighthouse audit passed. Performance: ${scores.performance}, Accessibility: ${scores.accessibility}, SEO: ${scores.seo}.`
        : `Lighthouse audit completed. Performance: ${scores.performance}${perfOk ? "" : " (below 80)"}, Accessibility: ${scores.accessibility}${a11yOk ? "" : " (below 90)"}, SEO: ${scores.seo}${seoOk ? "" : " (below 90)"}.`,
      details: {
        url: siteUrl,
        scores,
        allPass,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: `Lighthouse audit failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function executeMarkLive(
  project: { id: string }
): Promise<ActionResult> {
  await prisma.project.update({
    where: { id: project.id },
    data: {
      status: "LIVE",
      launchDate: new Date(),
    },
  });

  return {
    success: true,
    message: `Project marked as LIVE. Launch date recorded: ${new Date().toISOString().split("T")[0]}.`,
    details: { status: "LIVE", launchDate: new Date().toISOString() },
  };
}

// ── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id: projectId, taskId } = await params;

  // 1. Load task
  const task = await prisma.projectTask.findFirst({
    where: { id: taskId, projectId },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (!task.automationAction) {
    return NextResponse.json(
      { error: "This task does not have an automation action" },
      { status: 400 }
    );
  }

  // 2. Load project with intake
  const project = await prisma.project.findUnique({
    where: { id: projectId, deletedAt: null },
    include: {
      intake: {
        select: {
          targetDomain: true,
          goLiveTimeline: true,
        },
      },
    },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // 3. Execute the action
  let result: ActionResult;

  try {
    switch (task.automationAction) {
      case "stripe_webhook":
        result = await executeStripeWebhook(project);
        break;
      case "verify_env_vars":
        result = await executeVerifyEnvVars(project);
        break;
      case "add_domain":
        result = await executeAddDomain(project, project.intake);
        break;
      case "send_assets_email":
      case "send_review_email":
      case "send_live_email":
        result = await executeSendEmail(task.automationAction, project);
        break;
      case "verify_migration":
        result = await executeVerifyMigration(project);
        break;
      case "verify_ssl":
        result = await executeVerifySSL(project);
        break;
      case "lighthouse_audit":
        result = await executeLighthouseAudit(project);
        break;
      case "mark_live":
        result = await executeMarkLive(project);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown automation action: ${task.automationAction}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error(`[task-execute] Action ${task.automationAction} failed:`, err);
    result = {
      success: false,
      message: `Automation error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 4. Store automation result on the task
  await prisma.projectTask.update({
    where: { id: taskId },
    data: { automationResult: JSON.parse(JSON.stringify(result)) },
  });

  // 5. On success, mark task complete (unless autoComplete is explicitly false)
  const shouldComplete = result.success && result.autoComplete !== false;
  let updatedTask = task;

  if (shouldComplete && !task.completed) {
    updatedTask = await updateTask(taskId, { completed: true });
  }

  // 6. Log a project note
  const noteType = result.success ? "UPDATE" : "NOTE";
  const noteText = result.success
    ? `Automation "${task.automationAction}" completed: ${result.message}`
    : `Automation "${task.automationAction}" failed: ${result.message}`;

  await addNote(projectId, { text: noteText, type: noteType as "UPDATE" | "NOTE" });

  return NextResponse.json({
    success: result.success,
    message: result.message,
    details: result.details ?? null,
    autoCompleted: shouldComplete && !task.completed,
    task: {
      id: updatedTask.id,
      completed: shouldComplete ? true : updatedTask.completed,
      completedAt: shouldComplete ? new Date().toISOString() : updatedTask.completedAt?.toISOString() ?? null,
    },
  });
}
