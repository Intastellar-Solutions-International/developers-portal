import { data, Outlet, useLoaderData } from "react-router";

import type { Route } from "./+types/docs.$product";
import {
  DocTableOfContents,
  DocTableOfContentsMobile,
} from "~/components/doc-table-of-contents";
import { DocsMobileNav } from "~/components/docs-mobile-nav";
import { DocsSidebar } from "~/components/docs-sidebar";
import type { ExtraNavSection } from "~/components/docs-nav-sections";
import { getSidebar, listProducts } from "~/lib/docs.server";

/** Shown on other product docs; sign-in content lives on inta.dev only. */
const DOCS_RELATED_SECTIONS: ExtraNavSection[] = [
  {
    heading: "Related",
    items: [
      {
        href: "/docs/accounts-sign-in",
        label: "Accounts — Sign in (Web)",
      },
    ],
  },
];

export async function loader({ params }: Route.LoaderArgs) {
  const product = params.product;
  const products = await listProducts();
  if (!product || !products.some((p) => p.slug === product)) {
    throw data("Product not found", { status: 404 });
  }
  const sidebar = await getSidebar(product);
  return { product, sidebar };
}

export default function DocsProductLayout() {
  const { product, sidebar } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      <DocsSidebar
        product={product}
        sections={sidebar}
        extraSections={
          product === "accounts-sign-in" ? undefined : DOCS_RELATED_SECTIONS
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-10 xl:flex-row xl:gap-12">
        <div className="flex min-w-0 flex-1 flex-col">
          <DocsMobileNav
            product={product}
            sections={sidebar}
            extraSections={
              product === "accounts-sign-in" ? undefined : DOCS_RELATED_SECTIONS
            }
          />
          <DocTableOfContentsMobile />
          <Outlet />
        </div>
        <DocTableOfContents />
      </div>
    </div>
  );
}
