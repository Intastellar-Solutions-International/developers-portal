import { redirect } from "react-router";

import type { Route } from "./+types/docs.$product._index";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";

export async function loader({ params }: Route.LoaderArgs) {
  const product = params.product!;
  return redirect(docHref(product, getDefaultVersionSlug(product)));
}

export default function DocsProductIndexRedirect() {
  return null;
}
