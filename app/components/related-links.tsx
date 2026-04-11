import type { ComponentPropsWithoutRef } from "react";
import { Link } from "react-router";

import type { RelatedLink } from "~/lib/docs.server";
import { useLocalizedHref } from "~/providers/i18n-provider";

function RelatedInternalLink(
  props: ComponentPropsWithoutRef<"a"> & { href: string },
) {
  const { href, children, ...rest } = props;
  const to = useLocalizedHref(href);
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}

function RelatedAnchor(props: ComponentPropsWithoutRef<"a">) {
  const { href, children, ...rest } = props;
  if (href?.startsWith("/")) {
    return (
      <RelatedInternalLink href={href} {...rest}>
        {children}
      </RelatedInternalLink>
    );
  }
  const isExternal = href?.startsWith("http");
  return (
    <a
      href={href}
      {...rest}
      {...(isExternal
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
    >
      {children}
    </a>
  );
}

export function RelatedLinks({ items }: { items: RelatedLink[] | undefined }) {
  const list = items ?? [];
  if (list.length === 0) return null;

  return (
    <nav
      className="not-prose mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-700"
      aria-label="Related pages"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Related
      </h2>
      <ul className="mt-3 space-y-2">
        {list.map((item) => (
          <li key={`${item.href}-${item.title}`}>
            <RelatedAnchor
              href={item.href}
              className="text-brand hover:text-brand-hover hover:underline"
            >
              {item.title}
            </RelatedAnchor>
          </li>
        ))}
      </ul>
    </nav>
  );
}
