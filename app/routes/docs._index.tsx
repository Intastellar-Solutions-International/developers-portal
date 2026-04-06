import { Link, data, useLoaderData } from "react-router";

import type { Route } from "./+types/docs._index";
import { listProducts } from "~/lib/docs.server";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { requestOpenSearch } from "~/lib/search-overlay-context";
import { buildDocsHubMeta } from "~/lib/seo";
import { useI18n } from "~/providers/i18n-provider";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleFromRequest(request);
  const products = await listProducts(locale);
  if (products.length === 0) {
    throw data("No documentation published yet.", { status: 404 });
  }
  return { products, locale };
}

export function meta({ data, location }: Route.MetaArgs) {
  if (!data) return [{ title: "Docs · inta.dev" }];
  return buildDocsHubMeta(location.pathname, data.locale);
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
  const { products, locale } = useLoaderData<typeof loader>();
  const { t } = useI18n();
  const lp = (path: string) => withLocalePrefix(path, locale);

  const vCb = getDefaultVersionSlug("cookie-banner");
  const vAcc = getDefaultVersionSlug("accounts-sign-in");

  const quickLinks = [
    {
      labelKey: "docs.ql1Label" as const,
      hintKey: "docs.ql1Hint" as const,
      href: docHref(locale, "cookie-banner", vCb, "javascript/getting-started"),
    },
    {
      labelKey: "docs.ql2Label" as const,
      hintKey: "docs.ql2Hint" as const,
      href: docHref(locale, "cookie-banner", vCb, "wordpress/getting-started"),
    },
    {
      labelKey: "docs.ql3Label" as const,
      hintKey: "docs.ql3Hint" as const,
      href: docHref(
        locale,
        "accounts-sign-in",
        vAcc,
        "web/integrating-react-and-javascript",
      ),
    },
    {
      labelKey: "docs.ql4Label" as const,
      hintKey: "docs.ql4Hint" as const,
      href: docHref(locale, "accounts-sign-in", vAcc, "web/plain-html-css-js"),
    },
    {
      labelKey: "docs.ql5Label" as const,
      hintKey: "docs.ql5Hint" as const,
      href: docHref(locale, "accounts-sign-in", vAcc, "web/getting-started"),
    },
    {
      labelKey: "docs.ql6Label" as const,
      hintKey: "docs.ql6Hint" as const,
      href: docHref(
        locale,
        "accounts-sign-in",
        vAcc,
        "web/authorization-code-flow",
      ),
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
        {t("docs.hubEyebrow")}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        {t("docs.hubHeading")}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t("docs.hubLead")}
      </p>
      <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
        {t("docs.hubVersionNote")}{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          /v1/
        </code>
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => requestOpenSearch()}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:border-brand/50 hover:text-brand dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-brand/45"
        >
          <SearchIcon className="text-zinc-500 dark:text-zinc-400" />
          {t("docs.hubSearchDocs")}
          <kbd className="ml-1 hidden rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 sm:inline dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            ⌘K
          </kbd>
        </button>
        <Link
          to={lp("/changelog")}
          className="rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-brand dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:hover:text-brand"
        >
          {t("docs.hubChangelog")}
        </Link>
        <Link
          to={lp("/account/api-keys")}
          className="rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-brand dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:hover:text-brand"
        >
          {t("docs.hubApiKeys")}
        </Link>
      </div>

      <section className="mt-14" aria-labelledby="docs-quick-start">
        <h2
          id="docs-quick-start"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {t("docs.popularGuides")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("docs.popularGuidesHint")}
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="block rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 transition-all hover:border-brand/50 hover:bg-white hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-brand/45 dark:hover:bg-zinc-800"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {t(item.labelKey)}
                </span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                  {t(item.hintKey)}
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
          {t("docs.allProducts")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("docs.allProductsHint")}
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <li key={p.slug}>
              <Link
                to={docHref(locale, p.slug, getDefaultVersionSlug(p.slug))}
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
