import { Link } from "react-router";

import type { DocsNavLink } from "~/lib/docs.server";

const cardClass =
  "flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-brand/45 dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:border-brand/40";

export function DocPrevNext({
  prev,
  next,
}: {
  prev?: DocsNavLink;
  next?: DocsNavLink;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      className="not-prose mt-12 flex flex-col gap-3 border-t border-zinc-200 pt-8 sm:flex-row sm:justify-between dark:border-zinc-700"
      aria-label="Previous and next page"
    >
      {prev ? (
        <Link to={prev.href} className={`${cardClass} sm:mr-auto`}>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Previous
          </span>
          <span className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
            {prev.label}
          </span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" aria-hidden />
      )}
      {next ? (
        <Link
          to={next.href}
          className={`${cardClass} sm:ml-auto sm:text-right`}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Next
          </span>
          <span className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
            {next.label}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
