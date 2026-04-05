import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate } from "react-router";

import { searchDocuments } from "~/lib/docs-search";
import type { SearchDocument } from "~/lib/search-index.server";

const resultClass =
  "block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-brand/50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-brand/45";

const resultClassActive =
  "ring-2 ring-brand/35 border-brand/50 dark:border-brand/40";

function hitClass(active: boolean) {
  return [resultClass, active ? resultClassActive : ""].filter(Boolean).join(" ");
}

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
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [autoFocus]);

  const results = useMemo(() => searchDocuments(q, documents), [q, documents]);
  const defaultPreview = useMemo(() => documents.slice(0, 12), [documents]);
  const list = useMemo(
    () => (q.trim() ? results : defaultPreview),
    [q, results, defaultPreview],
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [q]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-search-hit-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  function onResultsKeyDown(e: KeyboardEvent) {
    if (documents.length === 0 || list.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => {
        if (i < 0) return 0;
        return Math.min(list.length - 1, i + 1);
      });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? -1 : i - 1));
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(list.length - 1);
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0 && activeIndex < list.length) {
      e.preventDefault();
      const href = list[activeIndex]!.href;
      if (onPick) onPick(href);
      else navigate(href);
    }
  }

  const inner = (
    <>
      <label className={variant === "overlay" ? "block p-4 pb-0" : "mt-6 block"}>
        <span className="sr-only">Search</span>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onResultsKeyDown}
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
        ref={listRef}
        className={
          variant === "overlay"
            ? "mt-3 flex-1 space-y-2 overflow-y-auto px-4 pb-4"
            : "mt-8 space-y-2"
        }
      >
        {list.map((hit, index) => (
          <li key={hit.id} data-search-hit-index={index}>
            {onPick ? (
              <button
                type="button"
                className={hitClass(activeIndex === index)}
                onClick={() => onPick(hit.href)}
                onMouseEnter={() => setActiveIndex(index)}
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
              <Link
                to={hit.href}
                className={hitClass(activeIndex === index)}
                onMouseEnter={() => setActiveIndex(index)}
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
            from the page · Arrow keys and Enter to open a result
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
        opens the search overlay. With the overlay open, use arrow keys and
        Enter to choose a result.
      </p>
      {inner}
    </div>
  );
}
