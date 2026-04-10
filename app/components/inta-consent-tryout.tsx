import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

const UC_SCRIPT_SRC = "https://consents.cdn.intastellarsolutions.com/uc.js";

export type IntaConsentTryoutProps = {
  previewOrigin: string;
  previewHostname: string;
};

function buildDefaultInta(origin: string, hostname: string): Record<string, unknown> {
  return {
    policy_link: `${origin}/legal/privacy`,
    settings: {
      rootDomain: hostname,
      company: "Acme Demo",
      arrange: "ltr",
      color: "#059669",
      design: "overlay",
      language: "english",
      requiredCookies: [] as string[],
      keepInLocalStorage: [] as string[],
    },
  };
}

function formatIntaJson(inta: Record<string, unknown>): string {
  return `${JSON.stringify(inta, null, 2)}\n`;
}

/** Safe embedding of JSON inside inline `<script>` (closes script tags). */
function intaJsonForInlineScript(inta: Record<string, unknown>): string {
  return JSON.stringify(inta).replace(/</g, "\\u003c");
}

function buildPreviewSrcDoc(inta: Record<string, unknown>): string {
  const payload = intaJsonForInlineScript(inta);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Banner preview</title>
<style>
  html, body { margin: 0; min-height: 100%; font-family: system-ui, sans-serif; background: #fafafa; }
  .inta-preview-hint {
    margin: 0; padding: 10px 14px; font-size: 12px; color: #52525b;
    background: #f4f4f5; border-bottom: 1px solid #e4e4e7;
  }
</style>
<script>window.INTA = ${payload};</script>
<script src="${UC_SCRIPT_SRC}"></script>
</head>
<body>
<p class="inta-preview-hint">Live preview — the real CMP script from our CDN runs here. Consent in this frame does not affect the docs site.</p>
</body>
</html>`;
}

/** Pretty-print for copy (readable); escape &lt; for safe embedding in HTML. */
function buildCopySnippetPretty(inta: Record<string, unknown>): string {
  const inner = JSON.stringify(inta, null, 2).replace(/</g, "\\u003c");
  return `<script>
  window.INTA = ${inner};
</script>
<script src="${UC_SCRIPT_SRC}"></script>
`;
}

export function IntaConsentTryout({
  previewOrigin,
  previewHostname,
}: IntaConsentTryoutProps) {
  const defaultInta = useMemo(
    () => buildDefaultInta(previewOrigin, previewHostname),
    [previewOrigin, previewHostname],
  );

  const [jsonText, setJsonText] = useState(() => formatIntaJson(defaultInta));
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const deferredText = useDeferredValue(jsonText);

  const { inta, deferredError } = useMemo(() => {
    try {
      const parsed = JSON.parse(deferredText) as unknown;
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {
          inta: null,
          deferredError: "Configuration must be a JSON object (not an array or primitive).",
        };
      }
      return { inta: parsed as Record<string, unknown>, deferredError: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      return { inta: null, deferredError: msg };
    }
  }, [deferredText]);

  const [iframeSrcDoc, setIframeSrcDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!inta || deferredError) {
      setIframeSrcDoc(null);
      return;
    }
    setIframeSrcDoc(buildPreviewSrcDoc(inta));
  }, [inta, deferredError]);

  useEffect(() => {
    try {
      JSON.parse(jsonText);
      setParseError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setParseError(msg);
    }
  }, [jsonText]);

  const handleReset = useCallback(() => {
    setJsonText(formatIntaJson(defaultInta));
    setParseError(null);
  }, [defaultInta]);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setJsonText(formatIntaJson(parsed as Record<string, unknown>));
        setParseError(null);
      }
    } catch {
      /* keep text; parse error already shown */
    }
  }, [jsonText]);

  const handleCopy = useCallback(async () => {
    if (!inta) return;
    const text = buildCopySnippetPretty(inta);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [inta]);

  const showPreview = Boolean(inta && !deferredError && iframeSrcDoc);

  return (
    <div className="not-prose mt-8 space-y-6">
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Edit the JSON below to change <code className="text-xs">window.INTA</code>. The preview
        reloads the banner when the JSON is valid. Policy URLs default to this site&apos;s{" "}
        <a className="text-brand underline-offset-2 hover:underline" href="/legal/privacy">
          privacy page
        </a>{" "}
        so the banner can appear in the sandbox—replace with your own URLs before going live.
      </p>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              htmlFor="inta-json-editor"
            >
              window.INTA (JSON)
            </label>
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleFormat}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Format
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={!inta}
                onClick={handleCopy}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {copied ? "Copied" : "Copy HTML snippet"}
              </button>
            </div>
          </div>
          <textarea
            id="inta-json-editor"
            spellCheck={false}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="min-h-[280px] w-full resize-y rounded-xl border border-zinc-300 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-900 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {parseError ? (
            <p
              className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100"
              role="alert"
            >
              JSON: {parseError}
            </p>
          ) : null}
          {inta && deferredError ? (
            <p
              className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100"
              role="alert"
            >
              Preview: {deferredError}
            </p>
          ) : null}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Paste the copied snippet in your page <code className="text-[11px]">&lt;head&gt;</code>, before
            other tracking scripts. See{" "}
            <a className="text-brand underline-offset-2 hover:underline" href="/docs/cookie-banner/quickstart">
              Quickstart
            </a>{" "}
            for placement rules.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Banner preview
          </span>
          <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-md dark:border-zinc-600 dark:bg-zinc-900">
            {showPreview && iframeSrcDoc ? (
              <iframe
                title="Intastellar Consents banner preview"
                className="h-[min(520px,70vh)] w-full border-0 bg-zinc-100 dark:bg-zinc-950"
                sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                srcDoc={iframeSrcDoc}
              />
            ) : (
              <div className="flex h-[min(520px,70vh)] items-center justify-center bg-zinc-100 px-4 text-center text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                {parseError || deferredError
                  ? "Fix the JSON to load the preview."
                  : "Loading preview…"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
