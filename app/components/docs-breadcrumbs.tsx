import { Link } from "react-router";

import type { BreadcrumbItem } from "~/lib/docs.server";

export function DocsBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav
      className="not-prose mb-6 text-sm text-zinc-600 dark:text-zinc-400"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
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
  );
}
