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
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { useI18n } from "~/providers/i18n-provider";

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  const product = params.product;
  const products = await listProducts(locale);
  if (!product || !products.some((p) => p.slug === product)) {
    throw data("Product not found", { status: 404 });
  }
  const pathname = new URL(request.url).pathname;
  const version = resolveSidebarVersion(product, pathname);
  const sidebar = await getSidebar(product, version, locale);
  const productRootHref = docHref(locale, product, version);
  return { product, sidebar, productRootHref };
}

export default function DocsProductLayout() {
  const { product, sidebar, productRootHref } = useLoaderData<typeof loader>();
  const { t, locale } = useI18n();

  const extraSections: ExtraNavSection[] | undefined =
    product === "accounts-sign-in"
      ? undefined
      : [
          {
            heading: t("docs.relatedHeading"),
            items: [
              {
                href: docHref(
                  locale,
                  "accounts-sign-in",
                  getDefaultVersionSlug("accounts-sign-in"),
                ),
                label: t("docs.relatedAccountsSignIn"),
              },
            ],
          },
        ];

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
