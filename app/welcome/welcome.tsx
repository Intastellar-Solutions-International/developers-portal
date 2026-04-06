import { Link } from "react-router";

import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { requestOpenSearch } from "~/lib/search-overlay-context";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function SearchSparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m12 3-1.2 4.2L6.6 8.4l4.2 1.2L12 13.8l1.2-4.2 4.2-1.2-4.2-1.2L12 3Z" />
      <path d="M5 19v-2M19 19v-2M5 5V3M19 5V3" />
    </svg>
  );
}

function DecoConsents({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="24"
        y="20"
        width="152"
        height="88"
        rx="10"
        className="fill-sky-200/60 dark:fill-sky-400/20"
      />
      <rect
        x="40"
        y="36"
        width="88"
        height="8"
        rx="4"
        className="fill-sky-400/50 dark:fill-sky-300/40"
      />
      <rect
        x="40"
        y="52"
        width="120"
        height="6"
        rx="3"
        className="fill-sky-300/40 dark:fill-sky-400/25"
      />
      <rect
        x="40"
        y="66"
        width="96"
        height="6"
        rx="3"
        className="fill-sky-300/40 dark:fill-sky-400/25"
      />
      <circle cx="160" cy="78" r="22" className="fill-sky-500/30 dark:fill-sky-400/35" />
      <path
        d="M154 78l6 6 12-14"
        className="stroke-sky-600 dark:stroke-sky-300"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DecoAccounts({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="48"
        y="24"
        width="104"
        height="76"
        rx="12"
        className="fill-violet-200/70 dark:fill-violet-400/15"
      />
      <circle cx="100" cy="52" r="18" className="fill-violet-400/45 dark:fill-violet-300/35" />
      <path
        d="M70 92c6-14 54-14 60 0"
        className="stroke-violet-500/50 dark:stroke-violet-300/45"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="152"
        y="44"
        width="28"
        height="36"
        rx="6"
        className="fill-violet-300/50 dark:fill-violet-500/25"
      />
    </svg>
  );
}

function DecoPlatform({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="28"
        y="28"
        width="144"
        height="64"
        rx="8"
        className="fill-amber-200/50 dark:fill-amber-400/12"
      />
      <path
        d="M44 52h112M44 68h72M44 84h96"
        className="stroke-amber-600/35 dark:stroke-amber-300/30"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="132"
        y="72"
        width="40"
        height="28"
        rx="6"
        className="fill-brand/25 dark:fill-brand/20"
      />
    </svg>
  );
}

export function Welcome() {
  const vCb = getDefaultVersionSlug("cookie-banner");
  const vAcc = getDefaultVersionSlug("accounts-sign-in");

  const consentsHome = docHref("cookie-banner", vCb);
  const accountsHome = docHref("accounts-sign-in", vAcc);
  const jsStart = docHref("cookie-banner", vCb, "javascript/getting-started");
  const accStart = docHref("accounts-sign-in", vAcc, "web/getting-started");

  return (
    <div className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Hero */}
      <section className="border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
                Built with Intastellar
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
                Documentation, guides, and tools to ship{" "}
                <span className="text-zinc-800 dark:text-zinc-200">
                  GDPR-aligned consent
                </span>{" "}
                and{" "}
                <span className="text-zinc-800 dark:text-zinc-200">
                  secure sign-in
                </span>{" "}
                with the same stack Intastellar uses — all on{" "}
                <span className="font-medium text-brand dark:text-brand">inta.dev</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => requestOpenSearch()}
              className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <SearchSparkleIcon className="text-brand" />
              Search docs
              <kbd className="ml-1 hidden rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 sm:inline dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </section>

      {/* Featured cards */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Link
            to={consentsHome}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-sky-200/80 bg-linear-to-b from-sky-50 to-sky-100/50 p-6 shadow-sm transition-shadow hover:shadow-md dark:border-sky-900/50 dark:from-sky-950/40 dark:to-sky-950/20 dark:hover:border-sky-800/60"
          >
            <h2 className="text-lg font-semibold text-sky-900 dark:text-sky-200">
              Intastellar Consents
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-sky-950/70 dark:text-sky-100/70">
              Cookie banner, CMP, and consent APIs for the web, WordPress, GTM,
              Shopify, and more.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 dark:text-sky-200">
              Open documentation
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </span>
            <div className="pointer-events-none -mx-2 mt-4 flex justify-center opacity-90">
              <DecoConsents className="h-28 w-full max-w-[200px]" />
            </div>
          </Link>

          <Link
            to={accountsHome}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-violet-200/80 bg-linear-to-b from-violet-50 to-violet-100/50 p-6 shadow-sm transition-shadow hover:shadow-md dark:border-violet-900/50 dark:from-violet-950/40 dark:to-violet-950/20 dark:hover:border-violet-800/60"
          >
            <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-200">
              Intastellar Accounts
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-violet-950/70 dark:text-violet-100/70">
              OAuth-style sign-in, PKCE, sessions, and security patterns for your
              apps and sites.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-800 dark:text-violet-200">
              Open documentation
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </span>
            <div className="pointer-events-none -mx-2 mt-4 flex justify-center opacity-90">
              <DecoAccounts className="h-28 w-full max-w-[200px]" />
            </div>
          </Link>

          <Link
            to="/docs"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-linear-to-b from-amber-50 to-amber-100/40 p-6 shadow-sm transition-shadow hover:shadow-md dark:border-amber-900/45 dark:from-amber-950/35 dark:to-amber-950/15 dark:hover:border-amber-800/55"
          >
            <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-200">
              All docs &amp; API keys
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-amber-950/70 dark:text-amber-100/70">
              Browse every product guide, track releases, and manage keys for the
              developer portal.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 dark:text-amber-200">
              Browse everything
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </span>
            <div className="pointer-events-none -mx-2 mt-4 flex justify-center opacity-90">
              <DecoPlatform className="h-28 w-full max-w-[200px]" />
            </div>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={jsStart}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Consents — quick start
            <ArrowRightIcon className="ml-1.5 opacity-70" />
          </Link>
          <Link
            to={accStart}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Accounts — quick start
            <ArrowRightIcon className="ml-1.5 opacity-70" />
          </Link>
          <Link
            to="/account/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover"
          >
            Sign in to the portal
          </Link>
        </div>
      </section>

      {/* Secondary band */}
      <section className="border-t border-zinc-200/80 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Move faster with search &amp; releases
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Jump to any page with full-text search, follow product updates on the
            Consents changelog, and keep API keys in one place after you sign in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => requestOpenSearch()}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <SearchSparkleIcon className="size-4" />
              Open search
            </button>
            <Link
              to="/consents/changelog"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Consents changelog
            </Link>
            <Link
              to="/account/api-keys"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              API keys
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
