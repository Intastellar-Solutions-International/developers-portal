import { getMDXComponent } from "mdx-bundler/client/react";
import { useLayoutEffect, useMemo, useRef } from "react";

import { mdxComponents } from "./mdx-components";

export function MdxContent({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const Component = useMemo(() => getMDXComponent(code), [code]);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const figures = root.querySelectorAll<HTMLElement>(
      "figure[data-rehype-pretty-code-figure]",
    );
    for (const fig of figures) {
      if (fig.dataset.copyUi === "1") continue;
      fig.dataset.copyUi = "1";
      const pre = fig.querySelector("pre");
      if (!pre) continue;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "code-copy-btn absolute right-2 top-2 z-10 rounded-md border border-zinc-300 bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:border-brand/50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-brand/45";
      btn.textContent = "Copy";

      const onCopy = async () => {
        const codeEl = pre.querySelector("code");
        const text = codeEl?.innerText ?? "";
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied";
          window.setTimeout(() => {
            btn.textContent = "Copy";
          }, 2000);
        } catch {
          btn.textContent = "Failed";
          window.setTimeout(() => {
            btn.textContent = "Copy";
          }, 2000);
        }
      };
      btn.addEventListener("click", onCopy);
      fig.appendChild(btn);
    }

    return () => {
      for (const fig of root.querySelectorAll<HTMLElement>(
        "figure[data-rehype-pretty-code-figure]",
      )) {
        fig.querySelector(".code-copy-btn")?.remove();
        delete fig.dataset.copyUi;
      }
    };
  }, [code]);

  return (
    <div ref={ref} className="mdx-content-root">
      <Component components={mdxComponents} />
    </div>
  );
}
