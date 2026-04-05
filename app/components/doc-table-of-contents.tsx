import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router";

type Heading = { id: string; text: string; depth: number };

/** Sticky in-page TOC with scroll-spy; reads h2/h3 ids from the rendered MDX article. */
export function DocTableOfContents() {
  const location = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useLayoutEffect(() => {
    setHeadings([]);
    setActiveId("");
    const article = document.querySelector("article.docs-prose");
    if (!article) return;
    const nodes = [...article.querySelectorAll("h2[id], h3[id]")];
    setHeadings(
      nodes.map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? "",
        depth: el.tagName === "H2" ? 2 : 3,
      })),
    );
  }, [location.pathname]);

  useEffect(() => {
    if (headings.length === 0) return;

    const offset = 96;

    const update = () => {
      if (window.scrollY < 24) {
        setActiveId(headings[0]?.id ?? "");
        return;
      }
      let current = headings[0]?.id ?? "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= offset) current = h.id;
      }
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <aside className="hidden w-54 shrink-0 xl:block">
      <nav className="sticky top-24 space-y-3" aria-label="On this page">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          On this page
        </p>
        <ul className="space-y-0.5 border-l border-zinc-200 dark:border-zinc-700">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={[
                  "block border-l-2 py-1.5 text-sm leading-snug transition-colors -ml-px",
                  h.depth === 3 ? "pl-5" : "pl-3",
                  activeId === h.id
                    ? "border-violet-500 font-medium text-violet-700 dark:border-violet-400 dark:text-violet-300"
                    : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100",
                ].join(" ")}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(h.id);
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
