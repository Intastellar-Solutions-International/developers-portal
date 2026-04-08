export type StatusDeployPublic = {
  commitSha: string;
  commitShort: string;
  commitRef: string | null;
  commitMessage: string | null;
  commitUrl: string | null;
};

/** Default: [intastellar-cookie-solutions](https://github.com/felixaschultz/intastellar-cookie-solutions) `development` tip. */
const DEFAULT_GITHUB_REPO = "felixaschultz/intastellar-cookie-solutions";
const DEFAULT_GITHUB_REF = "production";

const CACHE_TTL_OK_MS = 5 * 60 * 1000;
const CACHE_TTL_ERR_MS = 60 * 1000;

type CacheEntry =
  | { ok: true; at: number; data: StatusDeployPublic }
  | { ok: false; at: number; data: null };

let cache: CacheEntry | null = null;

function repoFromEnv(): { owner: string; repo: string } | null {
  const raw = process.env.STATUS_DEPLOY_GITHUB_REPO?.trim();
  const slug = raw && raw.includes("/") ? raw : DEFAULT_GITHUB_REPO;
  const parts = slug.split("/").filter(Boolean);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { owner: parts[0], repo: parts[1] };
}

function refFromEnv(): string {
  return process.env.STATUS_DEPLOY_GITHUB_REF?.trim() || DEFAULT_GITHUB_REF;
}

async function fetchTipCommit(
  owner: string,
  repo: string,
  ref: string,
): Promise<StatusDeployPublic | null> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(ref)}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "inta.dev-status/1 (developers-portal)",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    sha?: string;
    html_url?: string;
    commit?: { message?: string };
  };
  const sha = typeof json.sha === "string" ? json.sha : null;
  if (!sha) return null;
  const short = sha.length >= 7 ? sha.slice(0, 7) : sha;
  const msgRaw = json.commit?.message;
  const commitMessage =
    typeof msgRaw === "string" && msgRaw.trim() ? msgRaw.trim() : null;
  const commitUrl =
    typeof json.html_url === "string" ? json.html_url : null;
  return {
    commitSha: sha,
    commitShort: short,
    commitRef: ref,
    commitMessage,
    commitUrl,
  };
}

/**
 * Latest commit on a tracked GitHub ref (default: cookie-solutions `development`), not this portal’s Vercel deploy.
 * Optional `GITHUB_TOKEN` improves rate limits. Override repo/ref with `STATUS_DEPLOY_GITHUB_*`.
 */
export async function getStatusDeployPublic(): Promise<StatusDeployPublic | null> {
  const now = Date.now();
  if (cache) {
    const ttl = cache.ok ? CACHE_TTL_OK_MS : CACHE_TTL_ERR_MS;
    if (now - cache.at < ttl) return cache.data;
  }
  const parsed = repoFromEnv();
  if (!parsed) {
    cache = { ok: false, at: now, data: null };
    return null;
  }
  const ref = refFromEnv();
  try {
    const data = await fetchTipCommit(parsed.owner, parsed.repo, ref);
    if (data) {
      cache = { ok: true, at: now, data };
    } else {
      cache = { ok: false, at: now, data: null };
    }
    return data;
  } catch {
    cache = { ok: false, at: now, data: null };
    return null;
  }
}
