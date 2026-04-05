import { bundleMDX } from "mdx-bundler";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export async function bundleDocMdx(filePath: string) {
  return bundleMDX({
    file: filePath,
    cwd: process.cwd(),
    mdxOptions(options) {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: { className: ["anchor-link"] },
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: {
              dark: "github-dark",
              light: "github-light",
            },
          },
        ],
      ];
      return options;
    },
  });
}
