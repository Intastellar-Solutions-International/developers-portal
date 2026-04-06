import { Link } from "react-router";

import { useLocalizedHref } from "~/providers/i18n-provider";

const linkClass =
  "text-brand hover:text-brand-hover underline-offset-2 hover:underline";

export function NotFoundPage() {
  const home = useLocalizedHref("/");
  const docs = useLocalizedHref("/docs");
  const search = useLocalizedHref("/search");
  return (
    <div className="container mx-auto max-w-xl px-4 py-16 md:py-24">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Error 404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
        Page not found
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        That URL doesn’t exist or may have moved. Try the home page, documentation
        hub, or search.
      </p>
      <ul className="mt-8 flex flex-col gap-3 text-sm">
        <li>
          <Link to={home} className={linkClass}>
            Home
          </Link>
        </li>
        <li>
          <Link to={docs} className={linkClass}>
            Documentation
          </Link>
        </li>
        <li>
          <Link to={search} className={linkClass}>
            Search
          </Link>
        </li>
      </ul>
    </div>
  );
}
