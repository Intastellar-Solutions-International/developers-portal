import { useNavigate, useLocation } from "react-router";

import type { DocsVersion } from "~/lib/docs-versions";
import {
  docHref,
  getVersionsForProduct,
  parseDocsProductPath,
} from "~/lib/docs-versions";
import { useI18n } from "~/providers/i18n-provider";

function isSingleVersion(versions: DocsVersion[]) {
  return versions.length <= 1;
}

export function DocsVersionSwitcher({ product }: { product: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const versions = getVersionsForProduct(product);
  const { version: currentVersion, docTail } = parseDocsProductPath(
    pathname,
    product,
  );

  const labelId = `docs-version-label-${product}`;

  if (isSingleVersion(versions)) {
    const v = versions[0]!;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span
          id={labelId}
          className="text-zinc-500 dark:text-zinc-400"
        >
          Version
        </span>
        <span
          className="rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-1 font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          aria-labelledby={labelId}
        >
          {v.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={`docs-version-${product}`} className="text-zinc-500 dark:text-zinc-400">
        Version
      </label>
      <select
        id={`docs-version-${product}`}
        value={currentVersion}
        onChange={(e) => {
          const slug = e.target.value;
          const next = docHref(locale, product, slug, docTail || undefined);
          navigate(next);
        }}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium text-zinc-900 shadow-sm outline-none ring-brand focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {versions.map((v) => (
          <option key={v.slug} value={v.slug}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}
