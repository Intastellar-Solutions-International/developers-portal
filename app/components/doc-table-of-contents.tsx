import { useEffect, useState } from "react";

import { useDocHeadings } from "~/hooks/use-doc-headings";
import { useI18n } from "~/providers/i18n-provider";

/** Collapsible in-page TOC for viewports below `xl` (sidebar is `lg`; TOC desktop is `xl`). */
export function DocTableOfContentsMobile() {
  const { t } = useI18n();
  const headings = useDocHeadings();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    setOpen(false);
    setActiveId(headings[0]?.id ?? "");
  }, [headings]);

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
    setOpen(false);
  };

  return (
    <div className="not-prose mb-6 xl:hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {t("docs.onThisPage")}
        <span className="text-zinc-500" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <ul className="mt-2 space-y-0.5 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className={[
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  h.depth === 3 ? "pl-6" : "pl-3",
                  activeId === h.id
                    ? "bg-brand/15 font-medium text-brand dark:bg-brand/20"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                ].join(" ")}
                onClick={() => scrollTo(h.id)}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Sticky in-page TOC with scroll-spy; reads h2/h3 ids from the rendered MDX article. */
export function DocTableOfContents() {
  const { t } = useI18n();
  const headings = useDocHeadings();
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    setActiveId(headings[0]?.id ?? "");
  }, [headings]);

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
      <nav className="sticky top-24 space-y-3" aria-label={t("docs.onThisPage")}>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("docs.onThisPage")}
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
                    ? "border-brand font-medium text-brand dark:text-brand"
                    : "border-transparent text-zinc-600 hover:border-brand/40 hover:text-brand dark:text-zinc-400 dark:hover:border-brand/50 dark:hover:text-brand",
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
