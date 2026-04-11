import { NavLink, Outlet, useLoaderData } from "react-router";

import type { Route } from "./+types/account.layout";
import {
  getLocaleFromPathname,
  withLocalePrefix,
} from "~/lib/i18n/localized-path";
import { translatePath } from "~/lib/i18n/messages";
import { getPortalAccountSnapshot } from "~/lib/portal-account.server";
import { publicAccountToResolved } from "~/lib/portal-user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = getLocaleFromPathname(new URL(request.url).pathname);
  const { account } = await getPortalAccountSnapshot(request);
  const signedInOnServer = publicAccountToResolved(account) != null;
  /**
   * Resolve copy in the loader so the document embeds final strings. Calling `translatePath` only on
   * the client during hydration has produced English fallbacks (e.g. “Account” vs “Konto”) while
   * client-side `translatePath` could fall back to English during hydration; embedding strings avoids that.
   *
   * `signedInOnServer` is embedded here so SSR and the first client paint use the same payload.
   */
  return {
    locale,
    signedInOnServer,
    layoutTitle: translatePath(locale, "account.layoutTitle"),
    layoutDescription: translatePath(locale, "account.layoutDescription"),
    tabProfile: translatePath(locale, "nav.profile"),
    tabApiKeys: translatePath(locale, "nav.apiKeys"),
  };
}

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand/15 text-brand dark:bg-brand/20 dark:text-brand"
      : "text-zinc-600 hover:text-brand dark:text-zinc-400 dark:hover:text-brand",
  ].join(" ");

export default function AccountLayout() {
  const {
    locale,
    signedInOnServer,
    layoutTitle,
    layoutDescription,
    tabProfile,
    tabApiKeys,
  } = useLoaderData<typeof loader>();
  const lp = (path: string) => withLocalePrefix(path, locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {layoutTitle}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {layoutDescription}
      </p>
      {/* One stable wrapper: avoids sibling swap (tabs vs outlet) that confused HMR + hydration. */}
      <div className="mt-8">
        {signedInOnServer ? (
          <nav
            className="mb-8 flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-700"
            aria-label={layoutTitle}
          >
            <NavLink to={lp("/account/profile")} className={tabClass}>
              {tabProfile}
            </NavLink>
            <NavLink to={lp("/account/api-keys")} className={tabClass}>
              {tabApiKeys}
            </NavLink>
          </nav>
        ) : null}
        <Outlet />
      </div>
    </div>
  );
}
