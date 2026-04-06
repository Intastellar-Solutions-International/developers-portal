/**
 * “Formerly developers.intastellarsolutions.com” strip.
 * Shown only when the document request had a Referer from that host (see root loader) and the
 * migration window in `~/lib/legacy-banner` is still active.
 */
export function LegacyDevelopersBanner() {
  return (
    <div
      role="note"
      className="fixed inset-x-0 top-15 z-40 border-b border-brand/35 bg-zinc-100 px-4 py-2.5 dark:border-brand/40 dark:bg-zinc-800"
    >
      <div className="mx-auto max-w-6xl text-center text-xs leading-snug text-zinc-800 sm:text-left sm:text-sm dark:text-zinc-200">
        <p>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            Formerly developers.intastellarsolutions.com
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {" "}
            — developer documentation and tools now live here on{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">
              inta.dev
            </strong>
            .
          </span>
        </p>
        <p className="mt-1 text-zinc-700 dark:text-zinc-300">
          The legacy site showed a{" "}
          <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-zinc-700 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-200 sm:text-[0.7rem]">
            Developer accounts
          </span>{" "}
          focus only — no billing or paid products were offered there.
        </p>
      </div>
    </div>
  );
}
