import { redirect } from "react-router";

import type { Route } from "./+types/docs.$product._index";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const product = params.product!;
  const locale = resolveLocaleFromRequest(request);
  return redirect(docHref(locale, product, getDefaultVersionSlug(product)));
}

export default function DocsProductIndexRedirect() {
  return null;
}
