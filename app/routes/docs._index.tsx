import { Link, data, useLoaderData } from "react-router";

import type { Route } from "./+types/docs._index";
import { listProducts } from "~/lib/docs.server";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { buildDocsHubMeta } from "~/lib/seo";

export async function loader(_: Route.LoaderArgs) {
  const products = await listProducts();
  if (products.length === 0) {
    throw data("No documentation published yet.", { status: 404 });
  }
  return { products };
}

export function meta({ location }: Route.MetaArgs) {
  return buildDocsHubMeta(location.pathname);
}

export default function DocsIndex() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Documentation
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Guides and references for Intastellar products. Choose a product to
        get started.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <li key={p.slug}>
            <Link
              to={docHref(p.slug, getDefaultVersionSlug(p.slug))}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-brand/50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-brand/45"
            >
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {p.title}
              </h2>
              {p.description ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.description}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
