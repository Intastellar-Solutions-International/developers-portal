import { useEffect } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/account.login";
import { GitHubSignInCta } from "~/components/github-sign-in-cta";
import { isGitHubOAuthConfigured } from "~/lib/github-oauth.server";
import { translatePath } from "~/lib/i18n/messages";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { isSafeInternalRedirect } from "~/lib/safe-redirect-path";
import { resolveMetaLocale } from "~/lib/seo";
import { useResolvedRootLoaderData } from "~/lib/use-resolved-root-loader-data";
import type { RootLoaderData } from "~/providers/intastellar-auth-provider";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";
import { useI18n, useLocalizedHref } from "~/providers/i18n-provider";

export function meta({ matches, location }: Route.MetaArgs) {
  const locale = resolveMetaLocale(matches, location.pathname);
  return [{ title: translatePath(locale, "seo.accountLoginTitle") }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  return {
    githubOAuthConfigured: isGitHubOAuthConfigured(),
    /** From the request URL so SSR and dehydrated client match (avoids `Link` + `useLocalizedHref` client-only attrs). */
    legalTermsHref: withLocalePrefix("/legal/terms", locale),
    legalPrivacyHref: withLocalePrefix("/legal/privacy", locale),
  };
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
  const { githubOAuthConfigured, legalTermsHref, legalPrivacyHref } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const profileHref = useLocalizedHref("/account/profile");
  const { authReady, configured, isLoading, isSignedIn, signin, error } =
    useIntastellarAuth();
  const root = useResolvedRootLoaderData() as RootLoaderData | undefined;
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
        {t("account.loginHeading")}
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {t("account.loginIntro")}
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
          aria-label={t("account.loginAriaBusy")}
        />
      ) : !configured ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {t("account.loginSsoNotConfiguredLead")}{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-amber-900/60">
            VITE_INTASTELLAR_CLIENT_ID
          </code>{" "}
          {t("account.loginSsoNotConfiguredMid")}{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-amber-900/60">
            VITE_INTASTELLAR_APP_NAME
          </code>
          {t("account.loginSsoNotConfiguredTail")}
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
          <section className="flex items-center mt-6 gap-2">
            {githubOAuthConfigured ? (
              <GitHubSignInCta
                action={githubStartHref}
                label={t("account.loginGitHubSignIn")}
                variant="login"
              />
            ) : null}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void signin()}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 cursor-pointer px-5 py-2.5 text-sm font-semibold dark:text-zinc-50 text-zinc-900 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
            >
              <img
                src="https://www.intastellarsolutions.com/assets/logos/intastellar-new-planet.svg"
                alt={t("account.loginIntastellarLogoAlt")}
                width={30}
                height={30}
              />
              {isLoading
                ? t("account.loginCheckingSession")
                : t("account.loginSignInIntastellar")}
            </button>
          </section>
        </>
      )}
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        {t("account.loginLegalPrefix")}{" "}
        <a href={legalTermsHref} className="text-brand hover:text-brand-hover">
          {t("account.loginLegalTermsLabel")}
        </a>{" "}
        {t("account.loginLegalBetween")}{" "}
        <a
          href={legalPrivacyHref}
          className="text-brand hover:text-brand-hover"
        >
          {t("account.loginLegalPrivacyLabel")}
        </a>
        {t("account.loginLegalSuffix")}
      </p>
    </section>
  );
}
