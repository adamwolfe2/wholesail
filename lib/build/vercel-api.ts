const VERCEL_API = "https://api.vercel.com";

function headers() {
  const token = process.env.WS_VERCEL_TOKEN;
  if (!token) throw new Error("WS_VERCEL_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function teamParam() {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `?teamId=${teamId}` : "";
}

function teamParamAnd() {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `&teamId=${teamId}` : "";
}

export async function createProject(
  name: string,
  githubRepo: string
): Promise<{ id: string }> {
  const res = await fetch(`${VERCEL_API}/v10/projects${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: githubRepo,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel createProject failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return { id: data.id };
}

export async function setEnvVar(
  projectId: string,
  key: string,
  value: string
): Promise<void> {
  const res = await fetch(
    `${VERCEL_API}/v10/projects/${projectId}/env${teamParam()}`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        key,
        value,
        type: "plain",
        target: ["production", "preview", "development"],
      }),
    }
  );

  if (res.ok) return;

  // On 409 conflict the env var already exists — update it via PATCH
  if (res.status === 409) {
    // Fetch existing env vars to find the ID for this key
    const listRes = await fetch(
      `${VERCEL_API}/v10/projects/${projectId}/env${teamParam()}`,
      { headers: headers() }
    );

    if (!listRes.ok) {
      const body = await listRes.text();
      throw new Error(
        `Vercel listEnvVars failed during update (${listRes.status}): ${body}`
      );
    }

    const listData = await listRes.json();
    const envVars: Array<{ id: string; key: string }> = listData.envs ?? [];
    const existing = envVars.find((e) => e.key === key);

    if (!existing) {
      throw new Error(
        `Vercel setEnvVar: 409 conflict but could not find existing env var "${key}" to update`
      );
    }

    const patchRes = await fetch(
      `${VERCEL_API}/v10/projects/${projectId}/env/${existing.id}${teamParam()}`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          value,
          type: "plain",
          target: ["production", "preview", "development"],
        }),
      }
    );

    if (!patchRes.ok) {
      const body = await patchRes.text();
      throw new Error(
        `Vercel setEnvVar PATCH failed (${patchRes.status}): ${body}`
      );
    }

    return;
  }

  const body = await res.text();
  throw new Error(`Vercel setEnvVar failed (${res.status}): ${body}`);
}

export interface Deployment {
  uid: string;
  name: string;
  url: string;
  state: string;
  created: number;
}

export async function listDeployments(
  projectId: string
): Promise<Deployment[]> {
  const res = await fetch(
    `${VERCEL_API}/v6/deployments?projectId=${projectId}${teamParamAnd()}`,
    { headers: headers() }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel listDeployments failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.deployments ?? [];
}

export async function getProjectUrl(projectId: string): Promise<string | null> {
  const res = await fetch(
    `${VERCEL_API}/v9/projects/${projectId}${teamParam()}`,
    { headers: headers() }
  );

  if (!res.ok) return null;

  const data = await res.json();
  // Use alias or derive from name
  if (data.alias && data.alias.length > 0) {
    return `https://${data.alias[0].domain}`;
  }
  if (data.name) {
    return `https://${data.name}.vercel.app`;
  }
  return null;
}

// ── Usage & Billing ────────────────────────────────────────────────────────

export interface ProjectUsage {
  bandwidth: { total: number; unit: string };
  builds: { total: number };
  serverlessFunctions: { total: number; unit: string };
  edgeFunctions: { total: number; unit: string };
  sourceImages: { total: number };
  period: { start: string; end: string };
}

/**
 * Fetch usage data for a specific Vercel project.
 * Returns bandwidth, builds, serverless invocations for the current billing period.
 */
export async function getProjectUsage(projectId: string): Promise<ProjectUsage | null> {
  try {
    const res = await fetch(
      `${VERCEL_API}/v1/usage${teamParam()}&projectId=${projectId}`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    return (await res.json()) as ProjectUsage;
  } catch {
    return null;
  }
}

/**
 * List all Vercel integration/store connections for a project.
 * Returns store IDs so we can map storage costs to specific clients.
 */
export async function getProjectIntegrations(
  projectId: string
): Promise<Array<{ id: string; type: string; name: string }>> {
  try {
    const res = await fetch(
      `${VERCEL_API}/v1/storage/stores${teamParam()}&projectId=${projectId}`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.stores ?? []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      type: s.type as string,
      name: s.name as string,
    }));
  } catch {
    return [];
  }
}

/**
 * Triggers a Vercel deployment from the latest commit on the linked GitHub repo.
 * Call this after all env vars are set so the first real deploy has everything it needs.
 */
export async function triggerDeployment(
  projectId: string,
  repoFullName: string // e.g. "adamwolfe2/client-portal"
): Promise<{ deploymentId: string; url: string }> {
  const [, repo] = repoFullName.split("/");
  const res = await fetch(`${VERCEL_API}/v13/deployments${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: repo,
      project: projectId,
      target: "production",
      gitSource: {
        type: "github",
        repoId: repoFullName,
        ref: "main",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel triggerDeployment failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return {
    deploymentId: data.id ?? data.uid ?? "",
    url: data.url ? `https://${data.url}` : "",
  };
}
