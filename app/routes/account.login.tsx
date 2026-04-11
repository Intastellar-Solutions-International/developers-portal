import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/account.login";
import { isSafeInternalRedirect } from "~/lib/safe-redirect-path";
import { translatePath } from "~/lib/i18n/messages";
import { resolveMetaLocale } from "~/lib/seo";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";
import { useLocalizedHref } from "~/providers/i18n-provider";

export function meta({ matches, location }: Route.MetaArgs) {
  const locale = resolveMetaLocale(matches, location.pathname);
  return [{ title: translatePath(locale, "seo.accountLoginTitle") }];
}

export default function AccountLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const profileHref = useLocalizedHref("/account/profile");
  const { authReady, configured, isLoading, isSignedIn, signin, error } =
    useIntastellarAuth();

  useEffect(() => {
    if (!authReady || !configured || !isSignedIn) return;
    if (isSafeInternalRedirect(redirectTarget)) {
      navigate(redirectTarget, { replace: true });
      return;
    }
    navigate(profileHref, { replace: true });
  }, [
    authReady,
    configured,
    isSignedIn,
    navigate,
    profileHref,
    redirectTarget,
  ]);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Sign in
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Use your Intastellar account (SSO). Allow the popup if your browser
        blocks it.
      </p>

      {!authReady ? (
        <div
          className="mt-6 h-11 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700"
          aria-busy="true"
          aria-label="Loading"
        />
      ) : !configured ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          SSO is not configured. Set{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-amber-900/60">
            VITE_INTASTELLAR_CLIENT_ID
          </code>{" "}
          (and optionally{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-amber-900/60">
            VITE_INTASTELLAR_APP_NAME
          </code>
          ) in your environment, then restart the dev server.
        </p>
      ) : (
        <>
          {error ? (
            <p
              className="mt-4 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void signin()}
            className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Checking session…" : "Sign in with Intastellar"}
          </button>
        </>
      )}
    </section>
  );
}
