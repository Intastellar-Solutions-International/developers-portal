import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router";

export type DocHeading = { id: string; text: string; depth: number };

/** Headings inside `article.docs-prose` (from MDX), for in-page TOC. */
export function useDocHeadings(): DocHeading[] {
  const location = useLocation();
  const [headings, setHeadings] = useState<DocHeading[]>([]);

  useLayoutEffect(() => {
    const article = document.querySelector("article.docs-prose");
    if (!article) {
      setHeadings([]);
      return;
    }
    const nodes = [...article.querySelectorAll("h2[id], h3[id]")];
    setHeadings(
      nodes.map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? "",
        depth: el.tagName === "H2" ? 2 : 3,
      })),
    );
  }, [location.pathname]);

  return headings;
}
