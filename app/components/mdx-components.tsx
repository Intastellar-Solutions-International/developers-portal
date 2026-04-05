import type { ComponentPropsWithoutRef } from "react";
import { Link } from "react-router";

import { MdxPrettyCodeFigure } from "~/components/mdx-pretty-code-figure";

export const mdxComponents = {
  figure: MdxPrettyCodeFigure,
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const { href, children, ...rest } = props;
    if (href?.startsWith("/")) {
      return (
        <Link to={href} {...rest}>
          {children}
        </Link>
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
