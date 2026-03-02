/**
 * Sentry Admin API — create a dedicated Sentry project per client portal.
 *
 * Each client gets their own Sentry project so errors, performance issues,
 * and replay sessions are isolated and attributed per client independently.
 *
 * Required env vars (Wholesail master account):
 *   SENTRY_ORG        — your Sentry organization slug (e.g. "am-collective-y0")
 *   SENTRY_TEAM_SLUG  — team to assign projects to (e.g. "engineering")
 *   SENTRY_AUTH_TOKEN — auth token with project:admin + project:read scopes
 *
 * Sentry API docs: https://docs.sentry.io/api/projects/create-a-new-project/
 */

const SENTRY_API = "https://sentry.io/api/0";

export interface SentryProject {
  projectId: string;   // numeric Sentry project ID (for API queries)
  projectSlug: string; // e.g. "tbgc-portal"
  dsn: string;         // full public DSN — set as SENTRY_DSN + NEXT_PUBLIC_SENTRY_DSN
}

function headers() {
  const token = process.env.SENTRY_AUTH_TOKEN;
  if (!token) throw new Error("SENTRY_AUTH_TOKEN not set — cannot provision client Sentry project");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Returns the team slug to use when creating projects.
 * Uses SENTRY_TEAM_SLUG if set, otherwise fetches the first team in the org.
 */
async function resolveTeamSlug(org: string): Promise<string> {
  if (process.env.SENTRY_TEAM_SLUG) return process.env.SENTRY_TEAM_SLUG;

  const res = await fetch(`${SENTRY_API}/organizations/${org}/teams/`, {
    headers: headers(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sentry listTeams failed (${res.status}): ${body}`);
  }
  const teams = await res.json();
  if (!Array.isArray(teams) || teams.length === 0) {
    throw new Error("No Sentry teams found in org — set SENTRY_TEAM_SLUG explicitly");
  }
  return teams[0].slug as string;
}

/**
 * Creates a new Sentry project scoped to a single client portal.
 * Returns the project slug and public DSN (set once — available immediately).
 *
 * @param name  Display name — e.g. "TBGC Portal"
 * @param slug  URL-safe slug — e.g. "tbgc-portal" (must be unique in your org)
 */
export async function createSentryProject(
  name: string,
  slug: string
): Promise<SentryProject> {
  const org = process.env.SENTRY_ORG;
  if (!org) throw new Error("SENTRY_ORG not set");

  const team = await resolveTeamSlug(org);

  // Step 1 — create the project
  const createRes = await fetch(
    `${SENTRY_API}/teams/${org}/${team}/projects/`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name,
        slug,
        platform: "javascript-nextjs",
      }),
    }
  );

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Sentry createProject failed (${createRes.status}): ${body}`);
  }

  const project = await createRes.json();
  const projectSlug = project.slug as string;
  const projectId = String(project.id);

  // Step 2 — fetch the auto-generated DSN for this project
  const keysRes = await fetch(
    `${SENTRY_API}/projects/${org}/${projectSlug}/keys/`,
    { headers: headers() }
  );

  if (!keysRes.ok) {
    const body = await keysRes.text();
    throw new Error(`Sentry fetchKeys failed (${keysRes.status}): ${body}`);
  }

  const keys = await keysRes.json();
  const dsn = keys?.[0]?.dsn?.public as string | undefined;

  if (!dsn) {
    throw new Error(
      `Sentry project created (${projectSlug}) but no DSN returned: ${JSON.stringify(keys)}`
    );
  }

  return { projectId, projectSlug, dsn };
}
