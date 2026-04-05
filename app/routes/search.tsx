import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/search";
import { searchDocuments } from "~/lib/docs-search";
import { readSearchIndex } from "~/lib/search-index.server";

export async function loader(_: Route.LoaderArgs) {
  const documents = await readSearchIndex();
  return { documents };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search · inta.dev" },
    { name: "description", content: "Search Intastellar developer documentation." },
  ];
}

export default function SearchPage() {
  const { documents } = useLoaderData<typeof loader>();
  const [q, setQ] = useState("");

  const results = useMemo(
    () => searchDocuments(q, documents),
    [q, documents],
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Search documentation
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Filter by title, product slug, and page content. Keyboard:{" "}
        <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          ⌘K
        </kbd>{" "}
        /{" "}
        <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          Ctrl+K
        </kbd>
      </p>
      <label className="mt-6 block">
        <span className="sr-only">Search</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search docs…"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none ring-brand focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          autoFocus
        />
      </label>
      {documents.length === 0 ? (
        <p className="mt-8 text-sm text-amber-800 dark:text-amber-200">
          No search index found. Run{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            node scripts/build-search-index.mjs
          </code>{" "}
          (or <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run build</code>)
          and restart the dev server.
        </p>
      ) : null}
      <ul className="mt-8 space-y-2">
        {(q.trim() ? results : documents.slice(0, 12)).map((hit) => (
          <li key={hit.id}>
            <Link
              to={hit.href}
              className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-brand/50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-brand/45"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {hit.title}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                {hit.product} · {hit.href}
              </span>
              {hit.description ? (
                <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                  {hit.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      {q.trim() && results.length === 0 && documents.length > 0 ? (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          No results. Try a shorter term or check spelling.
        </p>
      ) : null}
    </div>
  );
}
