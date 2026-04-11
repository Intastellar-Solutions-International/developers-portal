import { useEffect } from "react";
import type { FetcherWithComponents } from "react-router";
import { Link, useFetcher, useRevalidator } from "react-router";

import { useI18n, useLocalizedHref } from "~/providers/i18n-provider";

export type BookmarkActionData = { ok: true } | { ok: false; error: string };

export type DocProfileSaveVariant =
  | "bookmark"
  | "mongo_off"
  | "sign_in"
  | "link_account";

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

function BookmarkIcon({ filled }: { filled: boolean }) {
  const d = "M7 2h10a2 2 0 0 1 2 2v18l-8-4.9-8 4.9V4a2 2 0 0 1 2-2Z";
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        aria-hidden
      >
        <path fill="currentColor" d={d} />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

/** Top-right save / remove control (documentation pages). */
export function DocSaveProfileHeaderIcon({
  fetcher,
  profileAction,
  canonicalPath,
  title,
  saved,
}: {
  fetcher: FetcherWithComponents<BookmarkActionData>;
  profileAction: string;
  canonicalPath: string;
  title: string;
  saved: boolean;
}) {
  const { t } = useI18n();
  const pending = fetcher.state !== "idle";
  const titleField = title.slice(0, 200);

  return saved ? (
    <fetcher.Form method="post" action={profileAction}>
      <input type="hidden" name="intent" value="removeDoc" />
      <input type="hidden" name="path" value={canonicalPath} />
      <button
        type="submit"
        disabled={pending}
        title={t("docs.removeFromProfile")}
        aria-label={t("docs.removeFromProfile")}
        className="rounded-lg p-2 text-brand transition-colors hover:bg-brand/10 disabled:opacity-50 dark:hover:bg-brand/15"
      >
        <BookmarkIcon filled />
      </button>
    </fetcher.Form>
  ) : (
    <fetcher.Form method="post" action={profileAction}>
      <input type="hidden" name="intent" value="saveDoc" />
      <input type="hidden" name="path" value={canonicalPath} />
      <input type="hidden" name="title" value={titleField} />
      <button
        type="submit"
        disabled={pending}
        title={t("docs.saveToProfile")}
        aria-label={t("docs.saveToProfile")}
        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-brand"
      >
        <BookmarkIcon filled={false} />
      </button>
    </fetcher.Form>
  );
}

export function DocSaveToProfile({
  variant,
  message,
  canonicalPath,
  title,
  initiallySaved,
  profileFormAction,
  bookmarkFetcher: bookmarkFetcherProp,
}: DocSaveToProfileProps) {
  const { t } = useI18n();
  const loginHref = useLocalizedHref("/account/login");
  const profileHref = useLocalizedHref("/account/profile");
  const internalFetcher = useFetcher<BookmarkActionData>();
  const fetcher = bookmarkFetcherProp ?? internalFetcher;
  const revalidator = useRevalidator();

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.ok) return;
    revalidator.revalidate();
  }, [fetcher.data, fetcher.state, revalidator]);

  const saved = initiallySaved;
  const pending = fetcher.state !== "idle";

  if (variant !== "bookmark") {
    return (
      <div className="not-prose mt-10 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
        <p>{message}</p>
        {variant === "sign_in" ? (
          <Link
            to={loginHref}
            className="mt-2 inline-block font-medium text-brand hover:text-brand-hover"
          >
            {t("nav.signIn")}
          </Link>
        ) : null}
        {variant === "link_account" ? (
          <Link
            to={profileHref}
            className="mt-2 inline-block font-medium text-brand hover:text-brand-hover"
          >
            {t("nav.profile")}
          </Link>
        ) : null}
      </div>
    );
  }

  const titleField = title.slice(0, 200);

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
