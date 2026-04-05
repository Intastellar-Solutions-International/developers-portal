import { Link } from "react-router";

import { BRAND } from "~/lib/brand";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { requestOpenSearch } from "~/lib/search-overlay-context";

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
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
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/25 blur-3xl motion-reduce:blur-none"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl motion-reduce:blur-none"
        aria-hidden
      />
      <div className="relative flex flex-col items-center px-4 pb-24 pt-14 sm:pt-20">
        <div className="flex w-full max-w-2xl flex-col items-center">
          <div className="mb-10 flex w-full max-w-lg flex-col items-center gap-6 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-8">
            <a
              href="https://www.intastellarsolutions.com"
              target="_blank"
              rel="noreferrer noopener"
              className="shrink-0 opacity-90 transition-opacity hover:opacity-100"
            >
              <img
                src={BRAND.companyLogoBlack}
                alt="Intastellar Solutions"
                className="h-9 w-auto brightness-0 invert sm:h-10"
              />
            </a>
            <span
              className="hidden h-10 w-px shrink-0 bg-white/20 sm:block"
              aria-hidden
            />
            <img
              src={BRAND.developersLogoWhite}
              alt="Intastellar Developers"
              className="h-9 w-auto max-w-[min(100%,14rem)] object-contain sm:h-11"
            />
            <span
              className="hidden h-10 w-px shrink-0 bg-white/20 lg:block"
              aria-hidden
            />
            <Link
              to={consentsHome}
              className="shrink-0 opacity-95 transition-opacity hover:opacity-100"
              title="Intastellar Consents documentation"
            >
              <img
                src={BRAND.consentsProductLogoWhite}
                alt="Intastellar Consents"
                className="h-8 w-auto max-w-[min(100%,16rem)] object-contain sm:h-10"
              />
            </Link>
          </div>

          <h1 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Intastellar developer platform
          </h1>
          <p className="mt-4 max-w-lg text-center text-base leading-relaxed text-zinc-400">
            Ship <span className="text-zinc-300">GDPR-aligned consent</span> and{" "}
            <span className="text-zinc-300">web sign-in</span> with the same
            stack we use across Intastellar — docs, API keys, and guides on{" "}
            <span className="font-medium text-brand">inta.dev</span>.
          </p>

          <ul className="mt-8 w-full max-w-md list-none space-y-2 text-center text-sm text-zinc-500 sm:text-left">
            <li>
              <span className="text-brand" aria-hidden>
                ·
              </span>{" "}
              Cookie banner &amp; CMP: JavaScript, WordPress, GTM, Shopify
            </li>
            <li>
              <span className="text-brand" aria-hidden>
                ·
              </span>{" "}
              OAuth-style sign-in, PKCE, sessions, and security patterns
            </li>
            <li>
              <span className="text-brand" aria-hidden>
                ·
              </span>{" "}
              Search across all docs with{" "}
              <kbd className="rounded border border-zinc-600 bg-zinc-800/80 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
                ⌘K
              </kbd>
            </li>
          </ul>

          <div className="mt-10 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              to="/docs"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover"
            >
              Browse documentation
            </Link>
            <button
              type="button"
              onClick={() => requestOpenSearch()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-brand/50 hover:bg-brand/15"
            >
              <SearchIcon className="opacity-80" />
              Search docs
            </button>
            <Link
              to={jsStart}
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Consents — quick start
            </Link>
            <Link
              to={accStart}
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Accounts — quick start
            </Link>
            <Link
              to="/account/login"
              className="inline-flex items-center justify-center rounded-lg border border-brand/45 bg-transparent px-6 py-3 text-sm font-medium text-brand transition-colors hover:border-brand hover:bg-brand/10"
            >
              Account
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <Link
              to="/consents/changelog"
              className="text-zinc-500 transition-colors hover:text-brand"
            >
              Consents changelog
            </Link>
            <span className="text-zinc-600" aria-hidden>
              ·
            </span>
            <Link
              to="/account/login"
              className="text-zinc-500 transition-colors hover:text-brand"
            >
              Sign in
            </Link>
            <span className="text-zinc-600" aria-hidden>
              ·
            </span>
            <Link
              to="/account/api-keys"
              className="text-zinc-500 transition-colors hover:text-brand"
            >
              API keys
            </Link>
            <span className="text-zinc-600" aria-hidden>
              ·
            </span>
            <Link
              to={accountsHome}
              className="text-zinc-500 transition-colors hover:text-brand"
            >
              Accounts docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
