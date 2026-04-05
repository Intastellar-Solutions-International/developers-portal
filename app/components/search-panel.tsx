import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

import { searchDocuments } from "~/lib/docs-search";
import type { SearchDocument } from "~/lib/search-index.server";

const resultClass =
  "block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-brand/50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-brand/45";

export function SearchPanel({
  documents,
  variant = "page",
  autoFocus,
  onPick,
}: {
  documents: SearchDocument[];
  variant?: "page" | "overlay";
  autoFocus?: boolean;
  /** If set, result rows use buttons and call this instead of `<Link>`. */
  onPick?: (href: string) => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [autoFocus]);

  const results = useMemo(() => searchDocuments(q, documents), [q, documents]);
  const list = q.trim() ? results : documents.slice(0, 12);

  const inner = (
    <>
      <label className={variant === "overlay" ? "block p-4 pb-0" : "mt-6 block"}>
        <span className="sr-only">Search</span>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search docs…"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none ring-brand focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </label>
      {documents.length === 0 ? (
        <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">
          No search index found. Run{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            node scripts/build-search-index.mjs
          </code>{" "}
          (or{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            npm run build
          </code>
          ) and restart the dev server.
        </p>
      ) : null}
      <ul
        className={
          variant === "overlay"
            ? "mt-3 flex-1 space-y-2 overflow-y-auto px-4 pb-4"
            : "mt-8 space-y-2"
        }
      >
        {list.map((hit) => (
          <li key={hit.id}>
            {onPick ? (
              <button
                type="button"
                className={resultClass}
                onClick={() => onPick(hit.href)}
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
              </button>
            ) : (
              <Link to={hit.href} className={resultClass}>
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
            )}
          </li>
        ))}
      </ul>
      {q.trim() && results.length === 0 && documents.length > 0 ? (
        <p
          className={
            variant === "overlay"
              ? "px-4 pb-4 text-sm text-zinc-600 dark:text-zinc-400"
              : "mt-8 text-sm text-zinc-600 dark:text-zinc-400"
          }
        >
          No results. Try a shorter term or check spelling.
        </p>
      ) : null}
    </>
  );

  if (variant === "overlay") {
    return (
      <div className="flex min-h-0 flex-1 flex-col" data-search-overlay>
        <div className="border-b border-zinc-200 px-4 pb-3 pt-4 dark:border-zinc-700">
          <h2
            id="search-overlay-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Search documentation
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:border-zinc-600 dark:bg-zinc-800">
              Esc
            </kbd>{" "}
            to close ·{" "}
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:border-zinc-600 dark:bg-zinc-800">
              ⌘K
            </kbd>{" "}
            /{" "}
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:border-zinc-600 dark:bg-zinc-800">
              Ctrl+K
            </kbd>{" "}
            from the page
          </p>
        </div>
        {inner}
      </div>
    );
  }

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
        </kbd>{" "}
        opens the search overlay.
      </p>
      {inner}
    </div>
  );
}
