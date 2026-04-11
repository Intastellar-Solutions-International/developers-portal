import { useEffect, useState } from "react";
import type { FetcherWithComponents } from "react-router";
import { Link, useFetcher, useLocation, useRevalidator } from "react-router";

import { BookmarkIcon } from "~/components/bookmark-icon";
import type {
  BookmarkActionData,
  DocProfileSaveVariant,
} from "~/components/doc-bookmark-types";
import { DocSaveProfileHeaderIcon } from "~/components/doc-save-profile-header-icon";
import { GitHubSignInCta } from "~/components/github-sign-in-cta";
import { writeDocPendingBookmark } from "~/lib/doc-pending-bookmark";
import { useI18n } from "~/providers/i18n-provider";

export type { BookmarkActionData, DocProfileSaveVariant } from "~/components/doc-bookmark-types";

type DocSaveToProfileProps = {
  variant: DocProfileSaveVariant;
  /** Shown for non-`bookmark` variants (pre-translated in the route loader). */
  message: string | null;
  canonicalPath: string;
  title: string;
  initiallySaved: boolean;
  /** Locale-prefixed `POST` target from the route loader (SSR-stable). */
  profileFormAction: string;
  /**
   * Shared fetcher for bookmark save/remove (e.g. header icon + footer panel).
   * When omitted, an internal fetcher is used.
   */
  bookmarkFetcher?: FetcherWithComponents<BookmarkActionData>;
};

/**
 * Always-visible bookmark control on doc pages: save/remove when allowed, otherwise
 * an icon that opens a sign-in / setup modal.
 */
export function DocSaveBookmarkHeader({
  variant,
  message,
  profileFormAction,
  accountLoginHref,
  canonicalPath,
  title,
  saved,
  bookmarkFetcher,
  bookmarkSaveLabel,
  bookmarkRemoveLabel,
  ssoPopupAvailable,
  onSignInPopup,
  signInPopupLoading,
  githubOAuthAvailable,
}: {
  variant: DocProfileSaveVariant;
  message: string | null;
  profileFormAction: string;
  accountLoginHref: string;
  canonicalPath: string;
  title: string;
  saved: boolean;
  bookmarkFetcher: FetcherWithComponents<BookmarkActionData>;
  /** From doc route loader — stable with doc `locale` for hydration. */
  bookmarkSaveLabel: string;
  bookmarkRemoveLabel: string;
  /** From `useIntastellarAuth()` in the route — avoids SSR/client mismatch inside this subtree. */
  ssoPopupAvailable: boolean;
  onSignInPopup: () => void;
  signInPopupLoading: boolean;
  /** From root loader — GitHub OAuth env configured (`/auth/github`). */
  githubOAuthAvailable: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const loginWithRedirect = `${accountLoginHref}?redirect=${encodeURIComponent(returnTo)}`;
  const profileWithRedirect = `${profileFormAction}?redirect=${encodeURIComponent(returnTo)}`;
  const githubSignInHref = `/auth/github?redirect=${encodeURIComponent(returnTo)}`;

  const stashPendingBookmark = () => {
    writeDocPendingBookmark({
      returnPath: returnTo,
      canonicalPath,
      title,
      profileFormAction,
    });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [variant, canonicalPath]);

  if (variant === "bookmark") {
    return (
      <DocSaveProfileHeaderIcon
        fetcher={bookmarkFetcher}
        profileAction={profileFormAction}
        canonicalPath={canonicalPath}
        title={title}
        saved={saved}
        saveLabel={bookmarkSaveLabel}
        removeLabel={bookmarkRemoveLabel}
      />
    );
  }

  const btnClass =
    "rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-brand";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={bookmarkSaveLabel}
        aria-label={bookmarkSaveLabel}
        aria-haspopup="dialog"
        className={btnClass}
      >
        <BookmarkIcon filled={false} />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doc-save-modal-title"
            className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-600 dark:bg-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="doc-save-modal-title"
              className="text-lg font-medium text-zinc-900 dark:text-zinc-50"
            >
              {t("docs.saveLoginModalTitle")}
            </h2>
            {message ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {message}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 sm:justify-end">
                {githubOAuthAvailable ? (
                  <GitHubSignInCta
                    action={githubSignInHref}
                    label={t("account.loginGitHubSignIn")}
                    variant="login"
                    onBeforeSubmit={stashPendingBookmark}
                  />
                ) : null}
                <button
                  type="button"
                  disabled={signInPopupLoading}
                  onClick={() => {
                    stashPendingBookmark();
                    void onSignInPopup();
                  }}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 cursor-pointer px-5 py-2.5 text-sm font-semibold dark:text-zinc-50 text-zinc-900 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                >
                  <img
                    src="https://www.intastellarsolutions.com/assets/logos/intastellar-new-planet.svg"
                    alt={t("account.loginIntastellarLogoAlt")}
                    width={30}
                    height={30}
                  />
                  {signInPopupLoading
                    ? t("account.loginCheckingSession")
                    : t("account.loginSignInIntastellar")}
                </button>
              </div>
              <p className="text-center text-sm sm:text-right">
                <Link
                  to={loginWithRedirect}
                  onClick={stashPendingBookmark}
                  className="font-medium text-brand hover:text-brand-hover"
                >
                  {t("docs.saveLoginModalOpenLoginPage")}
                </Link>
                {variant === "link_account" ? (
                  <>
                    {" · "}
                    <Link
                      to={profileWithRedirect}
                      onClick={stashPendingBookmark}
                      className="font-medium text-brand hover:text-brand-hover"
                    >
                      {t("docs.saveLoginModalOpenProfile")}
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Footer duplicate for save/remove when the bookmark flow is active. */
export function DocSaveToProfile({
  variant,
  message: _message,
  canonicalPath,
  title,
  initiallySaved,
  profileFormAction,
  bookmarkFetcher: bookmarkFetcherProp,
}: DocSaveToProfileProps) {
  const { t } = useI18n();
  const internalFetcher = useFetcher<BookmarkActionData>();
  const fetcher = bookmarkFetcherProp ?? internalFetcher;
  const revalidator = useRevalidator();

  useEffect(() => {
    if (variant !== "bookmark") return;
    if (fetcher.state !== "idle" || !fetcher.data?.ok) return;
    revalidator.revalidate();
  }, [variant, fetcher.data, fetcher.state, revalidator]);

  const saved = initiallySaved;
  const pending = fetcher.state !== "idle";

  if (variant !== "bookmark") {
    return null;
  }

  const titleField = (title ?? "").slice(0, 200);

  return (
    <div className="not-prose mt-10 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-900/40">
      {fetcher.data?.ok === false ? (
        <p
          className="mb-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {fetcher.data.error}
        </p>
      ) : null}
      {saved ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("docs.onYourProfile")}
          </p>
          <fetcher.Form method="post" action={profileFormAction} className="inline">
            <input type="hidden" name="intent" value="removeDoc" />
            <input type="hidden" name="path" value={canonicalPath} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm hover:border-brand/40 hover:text-brand disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-brand/40"
            >
              {t("docs.removeFromProfile")}
            </button>
          </fetcher.Form>
        </div>
      ) : (
        <fetcher.Form method="post" action={profileFormAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="intent" value="saveDoc" />
          <input type="hidden" name="path" value={canonicalPath} />
          <input type="hidden" name="title" value={titleField} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground shadow-sm hover:bg-brand-hover disabled:opacity-60"
          >
            {t("docs.saveToProfile")}
          </button>
        </fetcher.Form>
      )}
    </div>
  );
}
