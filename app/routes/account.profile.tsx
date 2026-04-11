import {
  data,
  Link,
  useFetcher,
  useLoaderData,
  useLocation,
  useRevalidator,
  useSearchParams,
} from "react-router";
import { useEffect } from "react";

import type { Route } from "./+types/account.profile";
import { isGitHubOAuthConfigured } from "~/lib/github-oauth.server";
import { getIntastellarClientConfig } from "~/lib/intastellar-config";
import type { Locale } from "~/lib/i18n/locale";
import {
  getLocaleFromPathname,
  withLocalePrefix,
} from "~/lib/i18n/localized-path";
import { translatePath } from "~/lib/i18n/messages";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { intastellarUserDisplayLine } from "~/lib/intastellar-user-display";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { resolvePortalSessionForRequest } from "~/lib/portal-account.server";
import { publicAccountToResolved } from "~/lib/portal-user.server";
import {
  addSavedDocumentationBookmark,
  getUserAccountById,
  removeSavedDocumentationBookmark,
} from "~/lib/user-accounts.server";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";
import { useI18n } from "~/providers/i18n-provider";

const PROFILE_GITHUB_LINK_ERRORS: Record<string, string> = {
  link_email_mismatch: "profile.linkGitHubErrorEmailMismatch",
  link_no_verified_email: "profile.linkGitHubErrorNoVerifiedEmail",
  link_github_taken: "profile.linkGitHubErrorGithubTaken",
  link_not_found: "profile.linkGitHubErrorNotFound",
  link_session_mismatch: "profile.linkGitHubErrorSessionMismatch",
  link_invalid: "profile.linkGitHubErrorInvalid",
  link_requires_mongo: "profile.linkGitHubErrorRequiresMongo",
};

export type ProfileLoaderSavedDoc = {
  path: string;
  title: string;
  savedAt: string;
};

export type ProfileLoaderData = {
  locale: Locale;
  heading: string;
  loading: string;
  ssoBefore: string;
  ssoAfter: string;
  seeSignInBefore: string;
  seeSignInAfter: string;
  navSignIn: string;
  navSignOut: string;
  signedOut: string;
  signInWithIntastellar: string;
  openSignInPage: string;
  intro: string;
  manageAccount: string;
  savedDocsHeading: string;
  savedDocsEmpty: string;
  savedDocsRemove: string;
  savedDocsMongoOff: string;
  savedDocsNeedAccount: string;
  ssoConfigured: boolean;
  mongoConfigured: boolean;
  signedInOnServer: boolean;
  savedDocumentation: ProfileLoaderSavedDoc[];
  canLinkGithub: boolean;
  githubLinkedLogin: string | null;
  linkGitHubHeading: string;
  linkGitHubDescription: string;
  linkGitHubButton: string;
};

function loaderHeadersFromSetCookie(setCookieHeaders: string[]): Headers {
  const headers = new Headers();
  for (const c of setCookieHeaders) {
    headers.append("Set-Cookie", c);
  }
  return headers;
}

export async function loader({ request }: Route.LoaderArgs) {
  const pathname = new URL(request.url).pathname;
  const localeFromPath = getLocaleFromPathname(pathname);
  const ssoConfigured = getIntastellarClientConfig() != null;
  const mongoConfigured = isMongoConfigured();
  const { account, setCookieHeaders } =
    await resolvePortalSessionForRequest(request);
  const resolved = publicAccountToResolved(account);

  let savedDocumentation: ProfileLoaderSavedDoc[] = [];
  let githubLinkedLogin: string | null = null;
  if (mongoConfigured && resolved?.accountId) {
    const doc = await getUserAccountById(resolved.accountId);
    const gh = doc?.identities?.find((i) => i.provider === "github");
    githubLinkedLogin = gh?.login ?? null;
    const raw = doc?.savedDocumentation ?? [];
    savedDocumentation = [...raw]
      .sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      )
      .map((b) => ({
        path: b.path,
        title: b.title,
        savedAt:
          b.savedAt instanceof Date
            ? b.savedAt.toISOString()
            : String(b.savedAt),
      }));
  }

  const hasGithubIdentity = Boolean(githubLinkedLogin);
  const canLinkGithub =
    isGitHubOAuthConfigured() &&
    mongoConfigured &&
    Boolean(resolved?.accountId) &&
    !hasGithubIdentity &&
    ssoConfigured;

  const payload: ProfileLoaderData = {
    locale: localeFromPath,
    heading: translatePath(localeFromPath, "profile.heading"),
    loading: translatePath(localeFromPath, "profile.loading"),
    ssoBefore: translatePath(localeFromPath, "profile.ssoBefore"),
    ssoAfter: translatePath(localeFromPath, "profile.ssoAfter"),
    seeSignInBefore: translatePath(localeFromPath, "profile.seeSignInBefore"),
    seeSignInAfter: translatePath(localeFromPath, "profile.seeSignInAfter"),
    navSignIn: translatePath(localeFromPath, "nav.signIn"),
    navSignOut: translatePath(localeFromPath, "nav.signOut"),
    signedOut: translatePath(localeFromPath, "profile.signedOut"),
    signInWithIntastellar: translatePath(
      localeFromPath,
      "profile.signInWithIntastellar",
    ),
    openSignInPage: translatePath(localeFromPath, "profile.openSignInPage"),
    intro: translatePath(localeFromPath, "profile.intro"),
    manageAccount: translatePath(localeFromPath, "profile.manageAccount"),
    savedDocsHeading: translatePath(localeFromPath, "profile.savedDocsHeading"),
    savedDocsEmpty: translatePath(localeFromPath, "profile.savedDocsEmpty"),
    savedDocsRemove: translatePath(localeFromPath, "profile.savedDocsRemove"),
    savedDocsMongoOff: translatePath(localeFromPath, "profile.savedDocsMongoOff"),
    savedDocsNeedAccount: translatePath(
      localeFromPath,
      "profile.savedDocsNeedAccount",
    ),
    ssoConfigured,
    mongoConfigured,
    signedInOnServer: resolved != null,
    savedDocumentation,
    canLinkGithub,
    githubLinkedLogin,
    linkGitHubHeading: translatePath(localeFromPath, "profile.linkGitHubHeading"),
    linkGitHubDescription: translatePath(
      localeFromPath,
      "profile.linkGitHubDescription",
    ),
    linkGitHubButton: translatePath(localeFromPath, "profile.linkGitHubButton"),
  };

  if (setCookieHeaders.length === 0) {
    return payload;
  }
  return data(payload, { headers: loaderHeadersFromSetCookie(setCookieHeaders) });
}

export type ProfileActionData =
  | { ok: true }
  | { ok: false; error: string };

function actionResponse(
  body: ProfileActionData,
  setCookieHeaders: string[],
): ProfileActionData | ReturnType<typeof data> {
  if (setCookieHeaders.length === 0) return body;
  const headers = loaderHeadersFromSetCookie(setCookieHeaders);
  return data(body, { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const locale = resolveLocaleFromRequest(request);
  const { account, setCookieHeaders } =
    await resolvePortalSessionForRequest(request);
  const user = publicAccountToResolved(account);

  if (!user?.accountId) {
    return actionResponse(
      {
        ok: false,
        error: translatePath(locale, "profile.savedDocsNeedAccount"),
      },
      setCookieHeaders,
    );
  }
  if (!isMongoConfigured()) {
    return actionResponse(
      {
        ok: false,
        error: translatePath(locale, "profile.savedDocsMongoOff"),
      },
      setCookieHeaders,
    );
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const path = String(form.get("path") ?? "");
  const title = String(form.get("title") ?? "");

  if (intent === "saveDoc") {
    const result = await addSavedDocumentationBookmark(
      user.accountId,
      path,
      title,
    );
    if (!result.ok) {
      return actionResponse(
        {
          ok: false,
          error: translatePath(
            locale,
            result.error === "invalid_path"
              ? "profile.savedDocsErrorInvalid"
              : "profile.savedDocsErrorGeneric",
          ),
        },
        setCookieHeaders,
      );
    }
    return actionResponse({ ok: true }, setCookieHeaders);
  }

  if (intent === "removeDoc") {
    const result = await removeSavedDocumentationBookmark(
      user.accountId,
      path,
    );
    if (!result.ok) {
      return actionResponse(
        {
          ok: false,
          error: translatePath(
            locale,
            result.error === "invalid_path"
              ? "profile.savedDocsErrorInvalid"
              : "profile.savedDocsErrorGeneric",
          ),
        },
        setCookieHeaders,
      );
    }
    return actionResponse({ ok: true }, setCookieHeaders);
  }

  return actionResponse(
    { ok: false, error: translatePath(locale, "profile.savedDocsErrorGeneric") },
    setCookieHeaders,
  );
}

export function meta({ data, loaderData }: Route.MetaArgs) {
  const payload = loaderData ?? data;
  if (!payload) return [{ title: translatePath("en", "profile.metaTitle") }];
  return [{ title: translatePath(payload.locale, "profile.metaTitle") }];
}

export default function AccountProfile() {
  const labels = useLoaderData<typeof loader>();
  const removeFetcher = useFetcher<typeof action>();
  const revalidator = useRevalidator();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (removeFetcher.data?.ok === true) {
      revalidator.revalidate();
    }
  }, [removeFetcher.data, revalidator]);

  const {
    locale,
    ssoConfigured,
    mongoConfigured,
    signedInOnServer,
    savedDocumentation,
    canLinkGithub,
    githubLinkedLogin,
    linkGitHubHeading,
    linkGitHubDescription,
    linkGitHubButton,
    ...copy
  } = labels;

  const githubLinkErrorCode = searchParams.get("github_error");
  const githubLinkErrorPath =
    githubLinkErrorCode != null && githubLinkErrorCode !== ""
      ? PROFILE_GITHUB_LINK_ERRORS[githubLinkErrorCode]
      : undefined;
  const githubLinkErrorMessage = githubLinkErrorPath
    ? t(githubLinkErrorPath)
    : null;
  const githubJustLinked = searchParams.get("github_linked") === "1";

  const linkGithubHref = `/auth/github?link=1&redirect=${encodeURIComponent(pathname + search)}`;
  const loginHref = withLocalePrefix("/account/login", locale);
  const profileAction = withLocalePrefix("/account/profile", locale);
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
  const hasValidUser = Boolean(user?.email?.trim());
  const awaitingUserAfterLogin = isSignedIn && !hasValidUser;
  const showSessionLoading = isLoading || awaitingUserAfterLogin;

  const showSavedDocsBlock =
    mongoConfigured &&
    signedInOnServer &&
    hasValidUser &&
    configured &&
    ssoConfigured;
  const removeBusy = removeFetcher.state !== "idle";
  const removeError =
    removeFetcher.data?.ok === false ? removeFetcher.data.error : null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {copy.heading}
      </h2>

      {githubJustLinked ? (
        <p
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-100"
          role="status"
        >
          {t("profile.githubLinkedNotice")}
        </p>
      ) : null}
      {githubLinkErrorMessage ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          {githubLinkErrorMessage}
        </p>
      ) : null}

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
      ) : showSessionLoading ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {copy.loading}
        </p>
      ) : hasValidUser && user ? (
        <div className="mt-6 space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="h-20 w-20 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-600"
              />
            ) : null}
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                {intastellarUserDisplayLine(user)}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {copy.intro}
              </p>
              <a
                href="https://my.intastellaraccounts.com"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-brand hover:text-brand-hover"
              >
                {copy.manageAccount}
              </a>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </p>
              {githubLinkedLogin ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {t("profile.githubLinkedBadge", { login: githubLinkedLogin })}
                </p>
              ) : null}
              {canLinkGithub ? (
                <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-600 dark:bg-zinc-900/40">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {linkGitHubHeading}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {linkGitHubDescription}
                  </p>
                  <Link
                    to={linkGithubHref}
                    className="mt-3 inline-flex rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                  >
                    {linkGitHubButton}
                  </Link>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => void logout()}
                className="mt-2 text-sm font-medium text-brand hover:text-brand-hover"
              >
                {copy.navSignOut}
              </button>
            </div>
          </div>

          {showSavedDocsBlock ? (
            <div className="border-t border-zinc-200 pt-8 dark:border-zinc-600">
              <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                {copy.savedDocsHeading}
              </h3>
              {removeError ? (
                <p
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {removeError}
                </p>
              ) : null}
              {savedDocumentation.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {copy.savedDocsEmpty}
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-600">
                  {savedDocumentation.map((row) => (
                    <li
                      key={row.path}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={withLocalePrefix(row.path, locale)}
                          className="font-medium text-brand hover:text-brand-hover"
                        >
                          {row.title}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {row.path}
                        </p>
                      </div>
                      <removeFetcher.Form method="post" action={profileAction}>
                        <input type="hidden" name="intent" value="removeDoc" />
                        <input type="hidden" name="path" value={row.path} />
                        <button
                          type="submit"
                          disabled={removeBusy}
                          className="text-sm text-zinc-600 underline decoration-zinc-400/60 underline-offset-2 hover:text-brand dark:text-zinc-400"
                        >
                          {copy.savedDocsRemove}
                        </button>
                      </removeFetcher.Form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : mongoConfigured && hasValidUser && !signedInOnServer ? (
            <p className="border-t border-zinc-200 pt-6 text-sm text-amber-800 dark:border-zinc-600 dark:text-amber-200/90">
              {copy.savedDocsNeedAccount}
            </p>
          ) : !mongoConfigured && hasValidUser ? (
            <p className="border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
              {copy.savedDocsMongoOff}
            </p>
          ) : null}
        </div>
      ) : (
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
      )}
    </section>
  );
}
