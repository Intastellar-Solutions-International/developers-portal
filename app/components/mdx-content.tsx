import { getMDXComponent } from "mdx-bundler/client/react";
import { useMemo } from "react";

import { mdxComponents } from "./mdx-components";

export function MdxContent({ code }: { code: string }) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  return <Component components={mdxComponents} />;
}
