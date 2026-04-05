import { Link } from "react-router";

import { BRAND } from "~/lib/brand";

export function Welcome() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col items-center px-4 pb-24 pt-16 sm:pt-20">
        <div className="flex w-full max-w-2xl flex-col items-center">
          <div className="mb-10 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
            <a
              href="https://www.intastellarsolutions.com"
              target="_blank"
              rel="noreferrer noopener"
              className="opacity-90 transition-opacity hover:opacity-100"
            >
              <img
                src={BRAND.companyLogoBlack}
                alt="Intastellar Solutions"
                className="h-10 w-auto brightness-0 invert"
              />
            </a>
            <span
              className="hidden h-12 w-px bg-white/20 sm:block"
              aria-hidden
            />
            <img
              src={BRAND.developersLogoWhite}
              alt="Intastellar Developers"
              className="h-10 w-auto max-w-[min(100%,14rem)] object-contain sm:h-11"
            />
            <span
              className="hidden h-12 w-px bg-white/20 sm:block"
              aria-hidden
            />
            <img
              src={BRAND.consentsProductLogoWhite}
              alt="Intastellar Consents"
              className="h-9 w-auto max-w-[min(100%,16rem)] object-contain sm:h-10"
            />
          </div>
          <h1 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Intastellar developer platform
          </h1>
          <p className="mt-4 max-w-md text-center text-base text-zinc-400">
            Documentation, API references, and account tools on{" "}
            <span className="font-medium text-brand">inta.dev</span>.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/docs"
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover"
            >
              Browse docs
            </Link>
            <Link
              to="/docs/accounts-sign-in"
              className="rounded-lg border border-white/25 bg-white/5 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-brand/60 hover:bg-brand/15"
            >
              Accounts sign-in
            </Link>
            <Link
              to="/account/profile"
              className="rounded-lg border border-brand/40 bg-transparent px-6 py-2.5 text-sm font-medium text-brand backdrop-blur-sm transition-colors hover:border-brand hover:bg-brand/10"
            >
              Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
