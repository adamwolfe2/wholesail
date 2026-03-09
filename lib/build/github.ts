const GITHUB_API = "https://api.github.com";
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "adamwolfe2";

function headers() {
  const token = process.env.GITHUB_PAT;
  if (!token) throw new Error("GITHUB_PAT not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function createRepo(
  name: string,
  description: string
): Promise<{ fullName: string; htmlUrl: string; cloneUrl: string }> {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name,
      description,
      private: true,
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub createRepo failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return {
    fullName: data.full_name,
    htmlUrl: data.html_url,
    cloneUrl: data.clone_url,
  };
}

export async function commitFile(
  repo: string,
  path: string,
  content: string,
  message: string
): Promise<void> {
  // Get current SHA if file exists (for update)
  let sha: string | undefined;
  try {
    const getRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/contents/${path}`,
      { headers: headers() }
    );
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }
  } catch {
    // File doesn't exist yet — ok
  }

  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GitHub commitFile failed (${res.status}): ${errBody}`);
  }
}
