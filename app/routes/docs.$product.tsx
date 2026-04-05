import { data, Outlet, useLoaderData } from "react-router";

import type { Route } from "./+types/docs.$product";
import { DocTableOfContents } from "~/components/doc-table-of-contents";
import { DocsSidebar } from "~/components/docs-sidebar";
import { getSidebar, listProducts } from "~/lib/docs.server";

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
      <DocsSidebar product={product} sections={sidebar} />
      <div className="flex min-w-0 flex-1 flex-col gap-10 xl:flex-row xl:gap-12">
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
        <DocTableOfContents />
      </div>
    </div>
  );
}
