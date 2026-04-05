import { NavLink } from "react-router";

import type { SidebarSection } from "~/lib/docs.server";

function formatProductTitle(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-md px-2 py-1.5 text-sm transition-colors",
    isActive
      ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
  ].join(" ");

export function DocsSidebar({
  product,
  sections,
}: {
  product: string;
  sections: SidebarSection[];
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 pr-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {formatProductTitle(product)}
        </p>
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.heading}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {section.heading}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      className={linkClass}
                      end={item.href === `/docs/${product}`}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
