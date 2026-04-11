import { GitHubMarkIcon } from "~/components/github-mark-icon";

export type GitHubSignInCtaVariant = "login" | "compact" | "profile";

const buttonClass: Record<GitHubSignInCtaVariant, string> = {
  login:
    "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800",
  compact:
    "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800",
  profile:
    "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800",
};

const formClass: Record<GitHubSignInCtaVariant, string> = {
  login: "inline-block",
  compact: "inline-block",
  profile: "mt-3 inline-block",
};

/**
 * Starts GitHub OAuth via GET navigation (no RR `Link`), so SSR and hydration stay aligned during Vite HMR.
 */
export function GitHubSignInCta({
  action,
  label,
  variant,
  onBeforeSubmit,
}: {
  action: string;
  label: string;
  variant: GitHubSignInCtaVariant;
  /** Runs immediately before the GET navigation (e.g. stash pending doc bookmark). */
  onBeforeSubmit?: () => void;
}) {
  return (
    <form
      action={action}
      method="get"
      className={formClass[variant]}
      onSubmit={() => {
        onBeforeSubmit?.();
      }}
    >
      <button type="submit" className={buttonClass[variant]}>
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center text-current"
          aria-hidden
        >
          <GitHubMarkIcon />
        </span>
        <span className="leading-snug">{label}</span>
      </button>
    </form>
  );
}
