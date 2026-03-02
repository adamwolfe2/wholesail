/**
 * Vercel Storage API — auto-provision Postgres (Neon) + KV (Upstash) per client portal.
 *
 * Each client gets their own isolated DB and Redis instance, billed through Vercel.
 * Store IDs are saved to the Project record so we can query costs via Vercel API later.
 */

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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PostgresStore {
  storeId: string;
  databaseUrl: string;       // pooled + pgbouncer=true — use as DATABASE_URL
  databaseUrlDirect: string; // direct connection — use as DATABASE_URL_UNPOOLED
}

export interface KVStore {
  storeId: string;
  restApiUrl: string;   // UPSTASH_REDIS_REST_URL
  restApiToken: string; // UPSTASH_REDIS_REST_TOKEN
}

// ── Response parsing helpers ──────────────────────────────────────────────────

/**
 * Extracts Postgres connection strings from the Vercel API response.
 * Handles multiple possible response shapes defensively.
 */
function extractPostgresUrls(
  store: Record<string, unknown>
): { url: string; directUrl: string } {
  // Shape 1: top-level connectionString
  if (typeof store.connectionString === "string") {
    const base = store.connectionString;
    return {
      url: ensurePgbouncer(base),
      directUrl: removePgbouncer(base),
    };
  }

  // Shape 2: dsn as string
  if (typeof store.dsn === "string") {
    return {
      url: ensurePgbouncer(store.dsn),
      directUrl: removePgbouncer(store.dsn),
    };
  }

  // Shape 3: dsn as object { url } or { host, username, password, database }
  const dsn = store.dsn as Record<string, string> | undefined;
  if (dsn) {
    if (typeof dsn.url === "string") {
      return { url: ensurePgbouncer(dsn.url), directUrl: removePgbouncer(dsn.url) };
    }
    if (dsn.host && dsn.username && dsn.password && dsn.database) {
      const base = `postgresql://${dsn.username}:${dsn.password}@${dsn.host}/${dsn.database}`;
      return {
        url: `${base}?pgbouncer=true&sslmode=require`,
        directUrl: `${base}?sslmode=require`,
      };
    }
  }

  // Shape 4: config object
  const config = store.config as Record<string, string> | undefined;
  if (config?.host && config?.username && config?.password && config?.database) {
    const base = `postgresql://${config.username}:${config.password}@${config.host}/${config.database}`;
    return {
      url: `${base}?pgbouncer=true&sslmode=require`,
      directUrl: `${base}?sslmode=require`,
    };
  }

  // Shape 5: postgres object (Vercel Postgres newer API)
  const pg = store.postgres as Record<string, string> | undefined;
  if (pg?.connectionString) {
    return {
      url: ensurePgbouncer(pg.connectionString),
      directUrl: removePgbouncer(pg.connectionString),
    };
  }

  throw new Error(
    `Cannot extract Postgres connection URL. Full store response: ${JSON.stringify(store)}`
  );
}

function extractKVCredentials(
  store: Record<string, unknown>
): { restApiUrl: string; restApiToken: string } {
  // Shape 1: top-level
  if (typeof store.restApiUrl === "string" && typeof store.restApiToken === "string") {
    return { restApiUrl: store.restApiUrl, restApiToken: store.restApiToken };
  }

  // Shape 2: restToken (alternate name)
  if (typeof store.restApiUrl === "string" && typeof store.restToken === "string") {
    return { restApiUrl: store.restApiUrl, restApiToken: store.restToken as string };
  }

  // Shape 3: kv nested object
  const kv = store.kv as Record<string, string> | undefined;
  if (kv?.restApiUrl && kv?.restApiToken) {
    return { restApiUrl: kv.restApiUrl, restApiToken: kv.restApiToken };
  }
  if (kv?.restApiUrl && kv?.restToken) {
    return { restApiUrl: kv.restApiUrl, restApiToken: kv.restToken };
  }

  // Shape 4: endpoint + token
  if (typeof store.endpoint === "string" && typeof store.token === "string") {
    return { restApiUrl: store.endpoint as string, restApiToken: store.token as string };
  }

  throw new Error(
    `Cannot extract KV credentials. Full store response: ${JSON.stringify(store)}`
  );
}

function ensurePgbouncer(url: string): string {
  if (url.includes("pgbouncer=true")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}pgbouncer=true&sslmode=require`;
}

function removePgbouncer(url: string): string {
  let result = url.replace(/[?&]pgbouncer=true/, "");
  if (!result.includes("sslmode=")) {
    result = `${result}${result.includes("?") ? "&" : "?"}sslmode=require`;
  }
  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates a Vercel Postgres (Neon) store for the client.
 * Returns the store ID and connection strings we can set directly as env vars.
 */
export async function createPostgresStore(name: string): Promise<PostgresStore> {
  const res = await fetch(`${VERCEL_API}/v1/storage/stores${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name, type: "postgres" }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel createPostgresStore failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const store = (data.store ?? data) as Record<string, unknown>;
  const storeId = (store.id ?? store.storeId) as string | undefined;
  if (!storeId) {
    throw new Error(`No storeId in Postgres response: ${JSON.stringify(data)}`);
  }

  const { url: databaseUrl, directUrl: databaseUrlDirect } = extractPostgresUrls(store);
  return { storeId, databaseUrl, databaseUrlDirect };
}

/**
 * Creates a Vercel KV (Upstash) store for the client.
 * Returns the store ID and REST API credentials.
 */
export async function createKVStore(name: string): Promise<KVStore> {
  const res = await fetch(`${VERCEL_API}/v1/storage/stores${teamParam()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name, type: "kv" }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel createKVStore failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const store = (data.store ?? data) as Record<string, unknown>;
  const storeId = (store.id ?? store.storeId) as string | undefined;
  if (!storeId) {
    throw new Error(`No storeId in KV response: ${JSON.stringify(data)}`);
  }

  const { restApiUrl, restApiToken } = extractKVCredentials(store);
  return { storeId, restApiUrl, restApiToken };
}

/**
 * Links a storage store to a Vercel project.
 * Vercel automatically injects POSTGRES_* or KV_* env vars into the project.
 */
export async function connectStoreToProject(
  storeId: string,
  projectId: string
): Promise<void> {
  const res = await fetch(
    `${VERCEL_API}/v1/storage/stores/${storeId}/connections${teamParam()}`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        projectId,
        environmentNames: ["production", "preview", "development"],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    if (res.status !== 409) {
      // 409 = already connected, not an error
      throw new Error(`Vercel connectStore failed (${res.status}): ${body}`);
    }
  }
}
