/** “Formerly developers.intastellarsolutions.com” strip — parent decides visibility (from root loader). */
export function LegacyDevelopersBanner() {
  return (
    <div
      role="note"
      className="fixed inset-x-0 top-15 z-40 border-b border-brand/25 bg-brand/10 px-4 py-2.5 dark:border-brand/30 dark:bg-brand/15"
    >
      <div className="mx-auto max-w-6xl text-center text-xs leading-snug text-zinc-700 sm:text-left sm:text-sm dark:text-zinc-200">
        <p>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            Formerly developers.intastellarsolutions.com
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">
            {" "}
            — developer documentation and tools now live here on{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-100">
              inta.dev
            </strong>
            .
          </span>
        </p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          The legacy site showed a{" "}
          <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white/80 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300 sm:text-[0.7rem]">
            Developer accounts
          </span>{" "}
          focus only — no billing or paid products were offered there.
        </p>
      </div>
    </div>
  );
}
