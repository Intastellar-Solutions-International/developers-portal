import { Link, data, useLoaderData } from "react-router";

import type { Route } from "./+types/docs._index";
import { listProducts } from "~/lib/docs.server";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { useOpenSearch } from "~/lib/search-overlay-context";
import { buildDocsHubMeta } from "~/lib/seo";

const HUB_DESCRIPTION =
  "Ship Intastellar Consents (cookie banner) and Intastellar Accounts web sign-in: JavaScript, WordPress, OAuth-style flows, API keys, and integration patterns on inta.dev.";

export async function loader(_: Route.LoaderArgs) {
  const products = await listProducts();
  if (products.length === 0) {
    throw data("No documentation published yet.", { status: 404 });
  }
  return { products };
}

export function meta({ location }: Route.MetaArgs) {
  return buildDocsHubMeta(location.pathname, { description: HUB_DESCRIPTION });
}

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

export default function DocsIndex() {
  const { products } = useLoaderData<typeof loader>();
  const openSearch = useOpenSearch();

  const vCb = getDefaultVersionSlug("cookie-banner");
  const vAcc = getDefaultVersionSlug("accounts-sign-in");

  const quickLinks = [
    {
      label: "Consents — JavaScript",
      hint: "Snippet, window.INTA, first deploy",
      href: docHref("cookie-banner", vCb, "javascript/getting-started"),
    },
    {
      label: "Consents — WordPress",
      hint: "Plugin install and config",
      href: docHref("cookie-banner", vCb, "wordpress/getting-started"),
    },
    {
      label: "Accounts — Get started",
      hint: "Register app, redirects, first flow",
      href: docHref("accounts-sign-in", vAcc, "web/getting-started"),
    },
    {
      label: "Accounts — Auth code flow",
      hint: "PKCE, callback, token exchange",
      href: docHref("accounts-sign-in", vAcc, "web/authorization-code-flow"),
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
        Intastellar developers
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Documentation
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        Guides for <strong className="font-medium text-zinc-800 dark:text-zinc-200">cookie consent</strong>{" "}
        and <strong className="font-medium text-zinc-800 dark:text-zinc-200">web sign-in</strong> with
        Intastellar Accounts — plus API keys and patterns you can reuse across sites and backends.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
        Doc URLs include a version segment (e.g.{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          /v1/
        </code>
        ) so we can publish new major guides without breaking bookmarks.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => openSearch?.()}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:border-brand/50 hover:text-brand dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-brand/45"
        >
          <SearchIcon className="text-zinc-500 dark:text-zinc-400" />
          Search docs
          <kbd className="ml-1 hidden rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 sm:inline dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            ⌘K
          </kbd>
        </button>
        <Link
          to="/changelog"
          className="rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-brand dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:hover:text-brand"
        >
          Changelog
        </Link>
        <Link
          to="/account/api-keys"
          className="rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-brand dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:hover:text-brand"
        >
          API keys
        </Link>
      </div>

      <section className="mt-14" aria-labelledby="docs-quick-start">
        <h2
          id="docs-quick-start"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Popular guides
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Jump straight into common integration paths.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="block rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 transition-all hover:border-brand/50 hover:bg-white hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-brand/45 dark:hover:bg-zinc-800"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                  {item.hint}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="docs-products">
        <h2
          id="docs-products"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          All products
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Full table of contents, versions, and cross-links inside each space.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <li key={p.slug}>
              <Link
                to={docHref(p.slug, getDefaultVersionSlug(p.slug))}
                className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-brand/50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-brand/45"
              >
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {p.title}
                </h3>
                {p.cardSummary ? (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {p.cardSummary}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
