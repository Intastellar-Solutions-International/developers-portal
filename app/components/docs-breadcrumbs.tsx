import type { ReactNode } from "react";
import { Link } from "react-router";

import type { BreadcrumbItem } from "~/lib/docs.server";

export function DocsBreadcrumbs({
  items,
  className,
  toolbar,
}: {
  items: BreadcrumbItem[];
  /** Extra classes on the inner `<nav>` (outer row owns vertical spacing; `mb-0` is always applied). */
  className?: string;
  /** Optional right column (e.g. save-to-profile control). Root is always a layout `div` so SSR and hydration stay aligned. */
  toolbar?: ReactNode;
}) {
  const hasItems = items.length > 0;
  if (!hasItems && (toolbar == null || toolbar === false)) return null;

  return (
    <div className="not-prose mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {hasItems ? (
          <nav
            className={`text-sm text-zinc-600 dark:text-zinc-400 mb-0${className ? ` ${className}` : ""}`}
            aria-label="Breadcrumb"
          >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {items.map((item, i) => {
                const last = i === items.length - 1;
                return (
                  <li
                    key={`${item.label}-${i}`}
                    className="flex items-center gap-2"
                  >
                    {i > 0 ? (
                      <span className="text-zinc-400 dark:text-zinc-500" aria-hidden>
                        /
                      </span>
                    ) : null}
                    {item.href && !last ? (
                      <Link
                        to={item.href}
                        className="text-brand hover:text-brand-hover hover:underline"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={
                          last
                            ? "font-medium text-zinc-900 dark:text-zinc-100"
                            : undefined
                        }
                        aria-current={last ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </div>
      <div className="shrink-0 self-start pt-0.5">{toolbar}</div>
    </div>
  );
}
