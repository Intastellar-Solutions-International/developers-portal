"use client";

import {
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from "react";

async function copyToClipboard(text: string): Promise<boolean> {
  if (text.length === 0) return false;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* try fallback */
    }
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.width = "1px";
    ta.style.height = "1px";
    ta.style.padding = "0";
    ta.style.border = "none";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function CopyCodeControl({ getText }: { getText: () => string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const onClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const text = getText();
      const ok = await copyToClipboard(text);
      setState(ok ? "copied" : "failed");
      window.setTimeout(() => setState("idle"), ok ? 2000 : 2500);
    },
    [getText],
  );

  const label =
    state === "copied" ? "Copied" : state === "failed" ? "Failed" : "Copy code";

  return (
    <button
      type="button"
      className="code-copy-btn pointer-events-auto absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white/95 px-2 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:border-brand/50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-zinc-600 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:border-brand/45"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={label}
      title={label}
    >
      <ClipboardIcon className="size-3.5 shrink-0 opacity-80" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function isRehypePrettyCodeFigure(props: Record<string, unknown>): boolean {
  const v =
    props["data-rehype-pretty-code-figure"] ??
    props.dataRehypePrettyCodeFigure;
  return v !== undefined && v !== false;
}

/**
 * Wraps rehype-pretty-code figures so the copy control is real React UI (DOM
 * injection under MDX output is cleared on reconcile).
 */
export function MdxPrettyCodeFigure(
  props: ComponentPropsWithoutRef<"figure">,
) {
  const p = props as Record<string, unknown>;
  if (!isRehypePrettyCodeFigure(p)) {
    return <figure {...props} />;
  }

  const { children, className, ...rest } = props;
  const rootRef = useRef<HTMLDivElement>(null);

  const getText = useCallback(() => {
    const root = rootRef.current;
    if (!root) return "";
    const pre = root.querySelector("pre");
    if (!pre) return "";
    const code = pre.querySelector("code");
    const raw = code?.textContent ?? pre.textContent ?? "";
    return raw.replace(/\u00a0/g, " ");
  }, []);

  return (
    <div ref={rootRef} className="not-prose relative">
      <figure {...rest} className={className}>
        {children}
      </figure>
      <CopyCodeControl getText={getText} />
    </div>
  );
}
