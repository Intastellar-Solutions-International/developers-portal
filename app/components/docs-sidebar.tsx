import { NavLink } from "react-router";

import type { SidebarItem } from "~/lib/docs.server";

export function DocsSidebar({
  product,
  items,
}: {
  product: string;
  items: SidebarItem[];
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 space-y-1 pr-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {product}
        </p>
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              [
                "block rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
              ].join(" ")
            }
            end={item.href === `/docs/${product}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
