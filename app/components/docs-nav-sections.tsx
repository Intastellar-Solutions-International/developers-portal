import { NavLink } from "react-router";

import type { SidebarSection } from "~/lib/docs.server";

export type ExtraNavSection = {
  heading: string;
  items: { href: string; label: string; external?: boolean }[];
};

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
      ? "bg-brand/15 font-medium text-brand dark:bg-brand/20 dark:text-brand"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-brand dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-brand",
  ].join(" ");

const externalLinkClass =
  "block rounded-md px-2 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-brand dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-brand";

export function DocsNavSections({
  product,
  sections,
  extraSections,
  onNavigate,
}: {
  product: string;
  sections: SidebarSection[];
  extraSections?: ExtraNavSection[];
  onNavigate?: () => void;
}) {
  return (
    <>
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
                    onClick={onNavigate}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {extraSections?.map((section) => (
          <div key={section.heading}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {section.heading}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      className={externalLinkClass}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={onNavigate}
                    >
                      {item.label}
                      <span className="ml-1 text-xs opacity-70" aria-hidden>
                        ↗
                      </span>
                    </a>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={linkClass}
                      onClick={onNavigate}
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
