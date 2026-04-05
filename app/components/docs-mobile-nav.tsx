import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { useLocation } from "react-router";

import type { SidebarSection } from "~/lib/docs.server";

import {
  DocsNavSections,
  type ExtraNavSection,
} from "~/components/docs-nav-sections";

export function DocsMobileNav({
  product,
  productRootHref,
  sections,
  extraSections,
  end,
}: {
  product: string;
  productRootHref: string;
  sections: SidebarSection[];
  extraSections?: ExtraNavSection[];
  /** Shown on the right of the mobile top bar (e.g. version switcher). */
  end?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const titleId = useId();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <div className="-mx-4 mb-6 flex items-center justify-between gap-3 border-b border-zinc-200 px-4 pb-4 dark:border-zinc-700">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:border-brand/50 hover:text-brand dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-brand/45"
          aria-expanded={open}
          aria-controls={titleId}
          onClick={() => setOpen(true)}
        >
          <MenuIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
          Browse docs
        </button>
        {end ? <div className="shrink-0">{end}</div> : null}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex justify-start bg-black/50"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            id={titleId}
            role="dialog"
            aria-modal="true"
            aria-label="Documentation menu"
            className="flex h-full w-[min(20rem,88vw)] flex-col border-r border-zinc-200 bg-zinc-50 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Documentation
              </p>
              <button
                type="button"
                className="rounded-md p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <nav
              className="flex-1 overflow-y-auto p-4"
              aria-label="Documentation"
            >
              <DocsNavSections
                product={product}
                productRootHref={productRootHref}
                sections={sections}
                extraSections={extraSections}
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
