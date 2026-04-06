import { redirect } from "react-router";

import type { Route } from "./+types/account._index";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";

export function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  return redirect(withLocalePrefix("/account/profile", locale));
}
