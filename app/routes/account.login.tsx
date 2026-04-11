import { useEffect } from "react";
import {
  Link,
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from "react-router";

import type { Route } from "./+types/account.login";
import { isSafeInternalRedirect } from "~/lib/safe-redirect-path";
import { translatePath } from "~/lib/i18n/messages";
import { resolveMetaLocale } from "~/lib/seo";
import type { RootLoaderData } from "~/providers/intastellar-auth-provider";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";
import { useI18n, useLocalizedHref } from "~/providers/i18n-provider";

export function meta({ matches, location }: Route.MetaArgs) {
  const locale = resolveMetaLocale(matches, location.pathname);
  return [{ title: translatePath(locale, "seo.accountLoginTitle") }];
}

const GITHUB_ERROR_KEYS: Record<string, string> = {
  disabled: "account.loginGitHubErrorDisabled",
  denied: "account.loginGitHubErrorDenied",
  state: "account.loginGitHubErrorState",
  token: "account.loginGitHubErrorToken",
  user: "account.loginGitHubErrorUser",
  link_requires_login: "account.loginGitHubErrorLinkRequiresLogin",
  link_requires_mongo: "account.loginGitHubErrorLinkRequiresMongo",
};

export default function AccountLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const profileHref = useLocalizedHref("/account/profile");
  const { authReady, configured, isLoading, isSignedIn, signin, error } =
    useIntastellarAuth();
  const root = useRouteLoaderData("root") as RootLoaderData | undefined;
  const githubOAuthConfigured = root?.githubOAuthConfigured === true;
  const { t } = useI18n();

  const githubErrorCode = searchParams.get("github_error");
  const githubErrorMessage =
    githubErrorCode != null && githubErrorCode !== ""
      ? t(
          GITHUB_ERROR_KEYS[githubErrorCode] ?? "account.loginGitHubErrorUnknown",
        )
      : null;

  const githubStartHref = `/auth/github${
    redirectTarget && isSafeInternalRedirect(redirectTarget)
      ? `?redirect=${encodeURIComponent(redirectTarget)}`
      : ""
  }`;

  const hasPortalSession =
    Boolean(root?.portalAccount?.email?.trim()) ||
    Boolean(root?.portalAccount?.accountId?.trim());

  useEffect(() => {
    if (!authReady) return;
    /** GitHub (or prior Intastellar) may have minted a portal cookie without the Intastellar SDK session. */
    if (hasPortalSession) {
      if (isSafeInternalRedirect(redirectTarget)) {
        navigate(redirectTarget, { replace: true });
        return;
      }
      navigate(profileHref, { replace: true });
      return;
    }
    if (!configured || !isSignedIn) return;
    if (isSafeInternalRedirect(redirectTarget)) {
      navigate(redirectTarget, { replace: true });
      return;
    }
    navigate(profileHref, { replace: true });
  }, [
    authReady,
    configured,
    hasPortalSession,
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

      {githubErrorMessage ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          {githubErrorMessage}
        </p>
      ) : null}

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

      {githubOAuthConfigured ? (
        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-600">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {t("account.loginGitHubSignIn")}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t("account.loginGitHubHint")}
          </p>
          <Link
            to={githubStartHref}
            className="mt-4 inline-flex rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
          >
            {t("account.loginGitHubSignIn")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
