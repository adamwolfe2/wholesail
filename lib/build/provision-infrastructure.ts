/**
 * Build steps 6-8: Provision Vercel project, Postgres (Neon), and KV (Upstash).
 *
 * Each client gets an isolated Vercel project with dedicated storage instances.
 */

import {
  createProject as createVercelProject,
  setEnvVar,
} from "@/lib/build/vercel-api";
import { createPostgresStore, createKVStore, connectStoreToProject } from "@/lib/build/storage";
import { logCost } from "@/lib/db/costs";
import { prisma } from "@/lib/db";
import { portalConfig } from "@/lib/portal-config";

export interface ProvisionInfraParams {
  projectId: string;
  repoName: string | null;
  vercelProject: string | null;
  neonStoreId: string | null;
  upstashStoreId: string | null;
  buildChecklist: Record<string, boolean>;
  appendLog: (msg: string) => void;
  saveProgress: (extra?: Record<string, unknown>) => Promise<void>;
}

export interface ProvisionInfraResult {
  vercelProjectId: string | null;
  neonStoreId: string | null;
  upstashStoreId: string | null;
}

export async function provisionInfrastructure(
  params: ProvisionInfraParams
): Promise<ProvisionInfraResult> {
  const {
    projectId,
    repoName,
    buildChecklist,
    appendLog,
    saveProgress,
  } = params;

  let vercelProjectId = params.vercelProject;
  let neonStoreId = params.neonStoreId;
  let upstashStoreId = params.upstashStoreId;

  // -- Step 6: Create Vercel project --
  if (!buildChecklist.vercelProjectCreated && process.env.WS_VERCEL_TOKEN && repoName) {
    try {
      const vProject = await createVercelProject(
        repoName,
        `${portalConfig.githubOwner}/${repoName}`
      );
      vercelProjectId = vProject.id;

      await prisma.project.update({
        where: { id: projectId },
        data: {
          vercelProject: vercelProjectId,
          vercelUrl: `https://${repoName}.vercel.app`,
        },
      });

      buildChecklist.vercelProjectCreated = true;
      appendLog(`Vercel project created: ${repoName} (${vercelProjectId})`);
      await saveProgress();
    } catch (vErr) {
      appendLog(`Vercel project error: ${(vErr as Error).message}`);
      await saveProgress();
    }
  }

  // -- Step 7: Provision Vercel Postgres (Neon) --
  if (!buildChecklist.storagePostgresCreated && vercelProjectId && process.env.WS_VERCEL_TOKEN) {
    try {
      appendLog("Provisioning Vercel Postgres (Neon)...");
      const pgStore = await createPostgresStore(`${repoName}-db`);
      neonStoreId = pgStore.storeId;

      // Connect store -> Vercel auto-injects POSTGRES_* env vars
      await connectStoreToProject(pgStore.storeId, vercelProjectId);

      // Also set our template's expected env var names directly
      await setEnvVar(vercelProjectId, "DATABASE_URL", pgStore.databaseUrl);
      await setEnvVar(vercelProjectId, "DATABASE_URL_UNPOOLED", pgStore.databaseUrlDirect);

      await logCost(projectId, {
        service: "vercel-postgres",
        amountCents: 0, // free tier initially
        description: "Vercel Postgres (Neon) -- free tier provisioned",
        metadata: { storeId: pgStore.storeId, plan: "hobby" },
      });

      buildChecklist.storagePostgresCreated = true;
      appendLog(`Postgres provisioned -- store: ${pgStore.storeId}`);
      await saveProgress({ neonStoreId: pgStore.storeId });
    } catch (pgErr) {
      appendLog(`Postgres provisioning error: ${(pgErr as Error).message}`);
      await saveProgress();
    }
  }

  // -- Step 8: Provision Vercel KV (Upstash) --
  if (!buildChecklist.storageKVCreated && vercelProjectId && process.env.WS_VERCEL_TOKEN) {
    try {
      appendLog("Provisioning Vercel KV (Upstash)...");
      const kvStore = await createKVStore(`${repoName}-kv`);
      upstashStoreId = kvStore.storeId;

      // Connect store -> Vercel auto-injects KV_* env vars
      await connectStoreToProject(kvStore.storeId, vercelProjectId);

      // Also set our template's expected env var names
      await setEnvVar(vercelProjectId, "UPSTASH_REDIS_REST_URL", kvStore.restApiUrl);
      await setEnvVar(vercelProjectId, "UPSTASH_REDIS_REST_TOKEN", kvStore.restApiToken);

      await logCost(projectId, {
        service: "vercel-kv",
        amountCents: 0, // free tier initially
        description: "Vercel KV (Upstash) -- free tier provisioned",
        metadata: { storeId: kvStore.storeId, plan: "hobby" },
      });

      buildChecklist.storageKVCreated = true;
      appendLog(`KV provisioned -- store: ${kvStore.storeId}`);
      await saveProgress({ upstashStoreId: kvStore.storeId });
    } catch (kvErr) {
      appendLog(`KV provisioning error: ${(kvErr as Error).message}`);
      await saveProgress();
    }
  }

  return { vercelProjectId, neonStoreId, upstashStoreId };
}
