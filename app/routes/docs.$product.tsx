import { data, Outlet, useLoaderData } from "react-router";

import type { Route } from "./+types/docs.$product";
import {
  DocTableOfContents,
  DocTableOfContentsMobile,
} from "~/components/doc-table-of-contents";
import { DocsMobileNav } from "~/components/docs-mobile-nav";
import { DocsSidebar } from "~/components/docs-sidebar";
import { DocsVersionSwitcher } from "~/components/docs-version-switcher";
import type { ExtraNavSection } from "~/components/docs-nav-sections";
import {
  getSidebar,
  listProducts,
  resolveSidebarVersion,
} from "~/lib/docs.server";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";

/** Shown on other product docs; sign-in content lives on inta.dev only. */
function relatedSectionsForProduct(product: string): ExtraNavSection[] | undefined {
  if (product === "accounts-sign-in") return undefined;
  return [
    {
      heading: "Related",
      items: [
        {
          href: docHref(
            "accounts-sign-in",
            getDefaultVersionSlug("accounts-sign-in"),
          ),
          label: "Accounts — Sign in (Web)",
        },
      ],
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const product = params.product;
  const products = await listProducts();
  if (!product || !products.some((p) => p.slug === product)) {
    throw data("Product not found", { status: 404 });
  }
  const pathname = new URL(request.url).pathname;
  const version = resolveSidebarVersion(product, pathname);
  const sidebar = await getSidebar(product, version);
  const productRootHref = docHref(product, version);
  return { product, sidebar, productRootHref };
}

export default function DocsProductLayout() {
  const { product, sidebar, productRootHref } = useLoaderData<typeof loader>();
  const extraSections = relatedSectionsForProduct(product);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      <DocsSidebar
        product={product}
        productRootHref={productRootHref}
        sections={sidebar}
        extraSections={extraSections}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-10 xl:flex-row xl:gap-12">
        <div className="flex min-w-0 flex-1 flex-col">
          <DocsMobileNav
            product={product}
            productRootHref={productRootHref}
            sections={sidebar}
            extraSections={extraSections}
            end={<DocsVersionSwitcher product={product} />}
          />
          <DocTableOfContentsMobile />
          <Outlet />
        </div>
        <DocTableOfContents />
      </div>
    </div>
  );
}
