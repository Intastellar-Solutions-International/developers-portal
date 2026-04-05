import { useLoaderData } from "react-router";

import type { Route } from "./+types/changelog";

export type ChangelogEntry = {
  tag: string;
  title: string;
  body: string;
  date: string | null;
  url: string;
  prerelease: boolean;
  source: "release" | "tag";
};

const DEFAULT_REPO = "felixaschultz/intastellar-cookie-solutions";

export async function loader(_: Route.LoaderArgs) {
  const repo = (process.env.CHANGELOG_GITHUB_REPO ?? DEFAULT_REPO).trim();
  const parts = repo.split("/").filter(Boolean);
  const owner = parts[0];
  const name = parts[1];
  if (!owner || !name) {
    return {
      entries: [] as ChangelogEntry[],
      repo: DEFAULT_REPO,
      error: "Set CHANGELOG_GITHUB_REPO to owner/name (e.g. org/repo).",
    };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const base = `https://api.github.com/repos/${owner}/${name}`;
  const entries: ChangelogEntry[] = [];
  let fetchError: string | null = null;

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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Changelog · inta.dev" },
    {
      name: "description",
      content: "Release history from the Intastellar Consents GitHub repository.",
    },
  ];
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ChangelogPage() {
  const { entries, repo, error } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Changelog
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Pulled from GitHub{" "}
        <a
          href={`https://github.com/${repo}`}
          className="text-brand hover:text-brand-hover"
          target="_blank"
          rel="noreferrer noopener"
        >
          {repo}
        </a>
        . Published{" "}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          releases
        </strong>{" "}
        are preferred; if none exist,{" "}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          tags
        </strong>{" "}
        are listed without release notes.
      </p>
      {/* <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Optional env:{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          CHANGELOG_GITHUB_REPO
        </code>{" "}
        (default <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{DEFAULT_REPO}</code>
        ),{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          GITHUB_TOKEN
        </code>{" "}
        for higher API rate limits on Vercel.
      </p> */}
      {error && entries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {error}
        </p>
      ) : null}
      <ol className="mt-10 space-y-10">
        {entries.map((e) => (
          <li key={e.tag} className="border-b border-zinc-200 pb-10 dark:border-zinc-700">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-lg font-semibold text-brand hover:text-brand-hover"
              >
                {e.title}
              </a>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(e.date) ?? e.tag}
                {e.prerelease ? (
                  <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                    Pre-release
                  </span>
                ) : null}
                {e.source === "tag" ? (
                  <span className="ml-2 text-xs">(tag only)</span>
                ) : null}
              </span>
            </div>
            {e.body ? (
              <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                {e.body.split("\n").map((line, i) =>
                  line.trim() === "" ? (
                    <br key={i} />
                  ) : (
                    <p key={i}>{line}</p>
                  ),
                )}
              </div>
            ) : e.source === "tag" ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                No GitHub release notes for this tag—open the link to compare on
                GitHub.
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      {entries.length === 0 && !error ? (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          No releases or tags returned for this repository.
        </p>
      ) : null}
    </div>
  );
}
