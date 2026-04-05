import type { SidebarSection } from "~/lib/docs.server";

import {
  DocsNavSections,
  type ExtraNavSection,
} from "~/components/docs-nav-sections";

export function DocsSidebar({
  product,
  sections,
  extraSections,
}: {
  product: string;
  sections: SidebarSection[];
  extraSections?: ExtraNavSection[];
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 pr-4" aria-label="Documentation">
        <DocsNavSections
          product={product}
          sections={sections}
          extraSections={extraSections}
        />
      </nav>
    </aside>
  );
}
