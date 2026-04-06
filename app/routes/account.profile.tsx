import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/account.profile";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { translatePath } from "~/lib/i18n/messages";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  /** Pre-resolve copy in the loader (same pattern as `account.tsx`) so hydration matches SSR. */
  return {
    locale,
    heading: translatePath(locale, "profile.heading"),
    loading: translatePath(locale, "profile.loading"),
    ssoBefore: translatePath(locale, "profile.ssoBefore"),
    ssoAfter: translatePath(locale, "profile.ssoAfter"),
    seeSignInBefore: translatePath(locale, "profile.seeSignInBefore"),
    seeSignInAfter: translatePath(locale, "profile.seeSignInAfter"),
    navSignIn: translatePath(locale, "nav.signIn"),
    navSignOut: translatePath(locale, "nav.signOut"),
    signedOut: translatePath(locale, "profile.signedOut"),
    signInWithIntastellar: translatePath(locale, "profile.signInWithIntastellar"),
    openSignInPage: translatePath(locale, "profile.openSignInPage"),
  };
}

export function meta({ data, loaderData }: Route.MetaArgs) {
  const payload = loaderData ?? data;
  if (!payload) return [{ title: translatePath("en", "profile.metaTitle") }];
  return [{ title: translatePath(payload.locale, "profile.metaTitle") }];
}

export default function AccountProfile() {
  const labels = useLoaderData<typeof loader>();
  const { locale, ...copy } = labels;
  const loginHref = withLocalePrefix("/account/login", locale);
  const {
    authReady,
    configured,
    isLoading,
    isSignedIn,
    users,
    signin,
    logout,
    error,
  } = useIntastellarAuth();

  const user = users[0];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {copy.heading}
      </h2>

      {!authReady ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {copy.loading}
        </p>
      ) : !configured ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {copy.ssoBefore}{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            VITE_INTASTELLAR_CLIENT_ID
          </code>{" "}
          {copy.ssoAfter}{" "}
          {copy.seeSignInBefore}{" "}
          <Link
            to={loginHref}
            className="font-medium text-brand hover:text-brand-hover"
          >
            {copy.navSignIn}
          </Link>{" "}
          {copy.seeSignInAfter}
        </p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {copy.loading}
        </p>
      ) : !isSignedIn || !user ? (
        <div className="mt-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {copy.signedOut}
          </p>
          {error ? (
            <p
              className="mt-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void signin()}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {copy.signInWithIntastellar}
            </button>
            <Link
              to={loginHref}
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand/50 hover:text-brand dark:border-zinc-600 dark:text-zinc-300"
            >
              {copy.openSignInPage}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-600"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              {user.name.first} {user.name.last}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 text-sm font-medium text-brand hover:text-brand-hover"
            >
              {copy.navSignOut}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
