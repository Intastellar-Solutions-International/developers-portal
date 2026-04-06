import { useMemo, useState } from "react";
import { useFetcher } from "react-router";

import type { StatusPageCopy } from "~/lib/status-page-copy";

function feedUrlForSelection(
  base: string,
  topicMaintenance: boolean,
  topicIncidents: boolean,
): string {
  if (topicMaintenance && topicIncidents) return base;
  if (topicMaintenance && !topicIncidents) {
    return base.includes("?") ? `${base}&topics=maintenance` : `${base}?topics=maintenance`;
  }
  if (!topicMaintenance && topicIncidents) {
    return base.includes("?") ? `${base}&topics=incidents` : `${base}?topics=incidents`;
  }
  return base;
}

type SubscribeFetcherData = {
  ok?: boolean;
  kind?: string;
  error?: string;
};

type Props = {
  copy: StatusPageCopy;
  feedUrl: string;
  subscribeEmailAvailable: boolean;
};

export function StatusSubscribeSection({
  copy,
  feedUrl,
  subscribeEmailAvailable,
}: Props) {
  const fetcher = useFetcher<SubscribeFetcherData>();
  const [topicMaintenance, setTopicMaintenance] = useState(true);
  const [topicIncidents, setTopicIncidents] = useState(true);
  const [wantsEmail, setWantsEmail] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rssUrl = useMemo(
    () => feedUrlForSelection(feedUrl, topicMaintenance, topicIncidents),
    [feedUrl, topicMaintenance, topicIncidents],
  );

  const emailResult =
    fetcher.state === "idle" && fetcher.data?.ok === true
      ? fetcher.data.kind === "updated"
        ? "updated"
        : fetcher.data.kind === "verify_sent"
          ? "verify_sent"
          : null
      : null;
  const emailError =
    fetcher.state === "idle" && fetcher.data && fetcher.data.ok === false
      ? (fetcher.data.error ?? copy.subscribeEmailErrorGeneric)
      : null;

  return (
    <section
      className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900/40"
      aria-labelledby="status-subscribe-heading"
    >
      <h2
        id="status-subscribe-heading"
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {copy.subscribeSectionHeading}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {copy.subscribeSectionIntro}
      </p>

      <fieldset className="mt-3">
        <legend className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {copy.subscribeTopicsLabel}
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={topicMaintenance}
              onChange={(e) => {
                setTopicMaintenance(e.target.checked);
                setClientError(null);
              }}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            {copy.subscribeTopicMaintenance}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={topicIncidents}
              onChange={(e) => {
                setTopicIncidents(e.target.checked);
                setClientError(null);
              }}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            {copy.subscribeTopicIncidents}
          </label>
        </div>
      </fieldset>

      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-600">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {copy.subscribeRssUrlHelp}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={rssUrl}
            className="inline-flex items-center rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            title={copy.subscribeRssTitle}
          >
            {copy.subscribeOpenRss}
          </a>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(rssUrl);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? copy.subscribeCopied : copy.subscribeCopyFeedUrl}
          </button>
        </div>
        <p className="mt-2 break-all font-mono text-[0.65rem] text-zinc-500 dark:text-zinc-500">
          {rssUrl}
        </p>
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-600">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {copy.subscribeEmailHelp}
        </p>
        {!subscribeEmailAvailable ? (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {copy.subscribeEmailUnavailable}
          </p>
        ) : (
          <>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={wantsEmail}
                onChange={(e) => setWantsEmail(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-600"
              />
              {copy.subscribeEmailCheckbox}
            </label>
            {wantsEmail ? (
              <fetcher.Form
                method="post"
                action="/api/status/subscribe"
                className="mt-3 space-y-2"
                onSubmit={(e) => {
                  if (!topicMaintenance && !topicIncidents) {
                    e.preventDefault();
                    setClientError(copy.subscribePickTopicsError);
                    return;
                  }
                  setClientError(null);
                }}
              >
                <input
                  type="hidden"
                  name="notifyMaintenance"
                  value={topicMaintenance ? "1" : "0"}
                />
                <input
                  type="hidden"
                  name="notifyIncidents"
                  value={topicIncidents ? "1" : "0"}
                />
                <label className="block text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {copy.subscribeEmailInputLabel}
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder={copy.subscribeEmailPlaceholder}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  />
                </label>
                <button
                  type="submit"
                  disabled={fetcher.state !== "idle"}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {copy.subscribeEmailSubmit}
                </button>
              </fetcher.Form>
            ) : null}
            {clientError ? (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
                {clientError}
              </p>
            ) : null}
            {emailError ? (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
                {emailError}
              </p>
            ) : null}
            {emailResult === "verify_sent" ? (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400" role="status">
                {copy.subscribeEmailVerifySent}
              </p>
            ) : null}
            {emailResult === "updated" ? (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400" role="status">
                {copy.subscribeEmailUpdated}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
