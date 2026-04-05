import type { SidebarSection } from "~/lib/docs.server";

import { DocsVersionSwitcher } from "~/components/docs-version-switcher";
import {
  DocsNavSections,
  type ExtraNavSection,
} from "~/components/docs-nav-sections";

export function DocsSidebar({
  product,
  productRootHref,
  sections,
  extraSections,
}: {
  product: string;
  productRootHref: string;
  sections: SidebarSection[];
  extraSections?: ExtraNavSection[];
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 space-y-6 pr-4" aria-label="Documentation">
        <div className="flex justify-end">
          <DocsVersionSwitcher product={product} />
        </div>
        <DocsNavSections
          product={product}
          productRootHref={productRootHref}
          sections={sections}
          extraSections={extraSections}
        />
      </nav>
    </aside>
  );
}
