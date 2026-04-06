/** GitHub releases / tags (Consents + Sign-In repo). */
export type ChangelogEntry = {
  tag: string;
  title: string;
  body: string;
  date: string | null;
  url: string;
  prerelease: boolean;
  source: "release" | "tag";
};

/** npm publish history for @scope/pkg. */
export type NpmChangelogEntry = {
  version: string;
  date: string | null;
  url: string;
};

export type GithubChangelogResult = {
  entries: ChangelogEntry[];
  repo: string;
  error: string | null;
};

export type NpmChangelogResult = {
  entries: NpmChangelogEntry[];
  packageName: string;
  error: string | null;
};

function parseRepo(repo: string): { owner: string; name: string } | null {
  const parts = repo.split("/").filter(Boolean);
  const owner = parts[0];
  const name = parts[1];
  if (!owner || !name) return null;
  return { owner, name };
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * Fetches GitHub releases, falling back to tags if no releases exist.
 */
export async function fetchGithubChangelog(
  repoFull: string,
): Promise<GithubChangelogResult> {
  const parsed = parseRepo(repoFull);
  if (!parsed) {
    return {
      entries: [],
      repo: repoFull,
      error: "Invalid repo (expected owner/name).",
    };
  }
  const { owner, name } = parsed;
  const base = `https://api.github.com/repos/${owner}/${name}`;
  const entries: ChangelogEntry[] = [];
  let fetchError: string | null = null;
  const headers = githubHeaders();

  try {
    const relRes = await fetch(`${base}/releases?per_page=50`, { headers });
    if (relRes.ok) {
      const data = (await relRes.json()) as Array<{
        tag_name: string;
        name: string;
        body: string | null;
        published_at: string | null;
        html_url: string;
        prerelease: boolean;
        draft: boolean;
      }>;
      for (const r of data) {
        if (r.draft) continue;
        entries.push({
          tag: r.tag_name,
          title: r.name || r.tag_name,
          body: (r.body ?? "").trim(),
          date: r.published_at,
          url: r.html_url,
          prerelease: r.prerelease,
          source: "release",
        });
      }
    } else {
      fetchError = `Releases API ${relRes.status}`;
    }
  } catch {
    fetchError = "Failed to reach GitHub.";
  }

  if (entries.length === 0) {
    try {
      const tagRes = await fetch(`${base}/tags?per_page=50`, { headers });
      if (tagRes.ok) {
        const tags = (await tagRes.json()) as Array<{ name: string }>;
        for (const t of tags) {
          entries.push({
            tag: t.name,
            title: t.name,
            body: "",
            date: null,
            url: `https://github.com/${owner}/${name}/releases/tag/${encodeURIComponent(t.name)}`,
            prerelease: false,
            source: "tag",
          });
        }
        fetchError = null;
      } else if (!fetchError) {
        fetchError = `Tags API ${tagRes.status}`;
      }
    } catch {
      if (!fetchError) fetchError = "Failed to load tags.";
    }
  }

  return {
    entries,
    repo: `${owner}/${name}`,
    error: entries.length === 0 ? fetchError : null,
  };
}

function semverCoreParts(v: string): number[] {
  const core = v.split("-")[0].split(".");
  return core.map((p) => {
    const n = parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

/** Descending semver: a after b => positive. */
function compareSemverDesc(a: string, b: string): number {
  const pa = semverCoreParts(a);
  const pb = semverCoreParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (db !== da) return db - da;
  }
  return b.localeCompare(a);
}

/**
 * Published versions from registry.npmjs.org (newest first).
 */
export async function fetchNpmPackageVersions(
  packageName: string,
): Promise<NpmChangelogResult> {
  const encoded = encodeURIComponent(packageName);
  const url = `https://registry.npmjs.org/${encoded}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return {
        entries: [],
        packageName,
        error: `npm registry ${res.status}`,
      };
    }
    const data = (await res.json()) as {
      versions?: Record<string, unknown>;
      time?: Record<string, string>;
    };
    const versionKeys = Object.keys(data.versions ?? {});
    if (versionKeys.length === 0) {
      return {
        entries: [],
        packageName,
        error: "No versions in registry response.",
      };
    }
    const time = data.time ?? {};
    const sorted = [...versionKeys].sort(compareSemverDesc);
    const pkgEnc = encodeURIComponent(packageName);
    const entries: NpmChangelogEntry[] = sorted.map((version) => ({
      version,
      date: time[version] ?? null,
      url: `https://www.npmjs.com/package/${pkgEnc}/v/${encodeURIComponent(version)}`,
    }));
    return { entries, packageName, error: null };
  } catch {
    return {
      entries: [],
      packageName,
      error: "Failed to reach registry.npmjs.org.",
    };
  }
}
