import type { FetcherWithComponents } from "react-router";

import { BookmarkIcon } from "~/components/bookmark-icon";
import type { BookmarkActionData } from "~/components/doc-bookmark-types";

/** Top-right save / remove control (documentation pages). */
export function DocSaveProfileHeaderIcon({
  fetcher,
  profileAction,
  canonicalPath,
  title,
  saved,
  saveLabel,
  removeLabel,
}: {
  fetcher: FetcherWithComponents<BookmarkActionData>;
  profileAction: string;
  canonicalPath: string;
  title: string;
  saved: boolean;
  /** From doc route loader (`translatePath`) so SSR and first client paint match `I18nProvider`. */
  saveLabel: string;
  removeLabel: string;
}) {
  const pending = fetcher.state !== "idle";
  const titleField = (title ?? "").slice(0, 200);

  return saved ? (
    <fetcher.Form method="post" action={profileAction}>
      <input type="hidden" name="intent" value="removeDoc" />
      <input type="hidden" name="path" value={canonicalPath} />
      <button
        type="submit"
        disabled={pending}
        title={removeLabel}
        aria-label={removeLabel}
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
        title={saveLabel}
        aria-label={saveLabel}
        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-brand"
      >
        <BookmarkIcon filled={false} />
      </button>
    </fetcher.Form>
  );
}
