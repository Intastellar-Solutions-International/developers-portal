import type { ComponentPropsWithoutRef } from "react";
import { Link } from "react-router";

import { MdxPrettyCodeFigure } from "~/components/mdx-pretty-code-figure";
import { useLocalizedHref } from "~/providers/i18n-provider";

function MdxInternalLink(props: ComponentPropsWithoutRef<"a">) {
  const { href, children, ...rest } = props;
  const to = useLocalizedHref(href ?? "/");
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}

export const mdxComponents = {
  figure: MdxPrettyCodeFigure,
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const { href, children, ...rest } = props;
    if (href?.startsWith("/")) {
      return (
        <MdxInternalLink href={href} {...rest}>
          {children}
        </MdxInternalLink>
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
  },
} as const;
