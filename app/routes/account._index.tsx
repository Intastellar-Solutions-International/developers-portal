import { redirect } from "react-router";

import type { Route } from "./+types/account._index";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { resolvePortalSessionForRequest } from "~/lib/portal-account.server";
import { publicAccountToResolved } from "~/lib/portal-user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  const { account } = await resolvePortalSessionForRequest(request);
  const dest =
    publicAccountToResolved(account) != null
      ? withLocalePrefix("/account/profile", locale)
      : withLocalePrefix("/account/login", locale);
  return redirect(dest);
}
