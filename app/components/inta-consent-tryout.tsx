import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "~/lib/i18n/locale";
import { translatePath } from "~/lib/i18n/messages";
import { useI18n, useLocalizedHref } from "~/providers/i18n-provider";

const UC_SCRIPT_SRC = "https://consents.cdn.intastellarsolutions.com/uc.js";

const PREVIEW_MSG_SOURCE = "inta-consent-preview" as const;

const IFRAME_HTML_LANG: Record<Locale, string> = {
  en: "en",
  de: "de",
  da: "da",
  fr: "fr",
  nl: "nl",
  "pt-br": "pt-BR",
};

/** Maps INTA JSON paths to `intaTryout.fieldHints.*` message keys. */
const FIELD_HELP_KEYS: { path: string; hintKey: string }[] = [
    { path: "policy_link", hintKey: "policy_link" },
    { path: "settings.privacy_policy", hintKey: "settingsPrivacyPolicy" },
    { path: "settings.rootDomain", hintKey: "settingsRootDomain" },
    { path: "settings.company", hintKey: "settingsCompany" },
    { path: "settings.color", hintKey: "settingsColor" },
    { path: "settings.logo", hintKey: "settingsLogo" },
    { path: "settings.design", hintKey: "settingsDesign" },
    { path: "settings.arrange", hintKey: "settingsArrange" },
    { path: "settings.gtagId", hintKey: "settingsGtagId" },
    { path: "settings.requiredCookies", hintKey: "settingsRequiredCookies" },
    { path: "settings.keepInLocalStorage", hintKey: "settingsKeepInLocalStorage" },
  ];

function intlLocaleTag(locale: Locale): string {
  return locale === "pt-br" ? "pt-BR" : locale;
}

/** Injected into preview iframe: tap dataLayer.push + console, postMessage to parent. */
function buildPreviewBridgeScript(parentOrigin: string): string {
  return `(function(){
var O=${JSON.stringify(parentOrigin)};
function safe(v){try{return typeof v==="object"&&v!==null?JSON.stringify(v):String(v)}catch(e){return"[unserializable]"}}
function pm(kind,extra){
  try{if(window.parent!==window)window.parent.postMessage(Object.assign({source:"${PREVIEW_MSG_SOURCE}",kind:kind},extra||{}),O)}catch(e){}
}
window.dataLayer=window.dataLayer||[];
var _push=window.dataLayer.push;
window.dataLayer.push=function(){
  var a=arguments[0];
  pm("datalayer",{detail:safe(a)});
  return _push.apply(window.dataLayer,arguments);
};
["log","warn","error","info"].forEach(function(L){
  var c=console[L];
  console[L]=function(){
    pm("console",{level:L,message:[].slice.call(arguments).map(safe).join(" ")});
    return c.apply(console,arguments);
  };
});
window.addEventListener("error",function(ev){
  pm("error",{message:(ev&&ev.message)||"error",filename:ev&&ev.filename,line:ev&&ev.lineno});
});
pm("system",{message:"Preview bridge ready"});
})();`;
}

const MINIMUM_SETUP_SNIPPET = `<script>
  window.INTA = {
    policy_link: "https://yourdomain.com/privacy",
    settings: {
      rootDomain: "yourdomain.com",
      company: "Your company",
    },
  };
</script>
<script src="${UC_SCRIPT_SRC}"></script>`;

export type IntaConsentTryoutProps = {
  previewOrigin: string;
  previewHostname: string;
};

function buildDefaultInta(
  origin: string,
  hostname: string,
  demoCompany: string,
): Record<string, unknown> {
  return {
    policy_link: `${origin}/legal/privacy`,
    settings: {
      rootDomain: hostname,
      company: demoCompany,
      arrange: "ltr",
      color: "#059669",
      design: "overlay",
      language: "english",
      logo: "https://www.intastellarsolutions.com/assets/logos/intastellar-new-planet.svg",
      requiredCookies: [] as string[],
      keepInLocalStorage: [] as string[],
    },
  };
}

function formatIntaJson(inta: Record<string, unknown>): string {
  return `${JSON.stringify(inta, null, 2)}\n`;
}

function intaJsonForInlineScript(inta: Record<string, unknown>): string {
  return JSON.stringify(inta).replace(/</g, "\\u003c");
}

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildPreviewSrcDoc(
  inta: Record<string, unknown>,
  parentOrigin: string,
  ui: { htmlLang: string; documentTitle: string; hintText: string },
): string {
  const payload = intaJsonForInlineScript(inta);
  const bridge = buildPreviewBridgeScript(parentOrigin);
  const hint = escapeHtmlText(ui.hintText);
  return `<!DOCTYPE html>
<html lang="${escapeHtmlText(ui.htmlLang)}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtmlText(ui.documentTitle)}</title>
<style>
  html, body { margin: 0; min-height: 100%; font-family: system-ui, sans-serif; background: #fafafa; }
  .inta-preview-hint {
    margin: 0; padding: 10px 14px; font-size: 12px; color: #52525b;
    background: #f4f4f5; border-bottom: 1px solid #e4e4e7;
  }
</style>
<script>window.INTA = ${payload};</script>
<script>${bridge}</script>
<script src="${UC_SCRIPT_SRC}"></script>
</head>
<body>
<p class="inta-preview-hint">${hint}</p>
</body>
</html>`;
}

function buildCopySnippetPretty(inta: Record<string, unknown>): string {
  const inner = JSON.stringify(inta, null, 2).replace(/</g, "\\u003c");
  return `<script>
  window.INTA = ${inner};
</script>
<script src="${UC_SCRIPT_SRC}"></script>
`;
}

type DeferredIssue =
  | null
  | { kind: "notObject" }
  | { kind: "syntax"; message: string };

type DebugEntry = { id: number; t: string; kind: string; text: string };

export function IntaConsentTryout({
  previewOrigin,
  previewHostname,
}: IntaConsentTryoutProps) {
  const { t, locale } = useI18n();
  const hrefPrivacy = useLocalizedHref("/legal/privacy");
  const hrefQuickstart = useLocalizedHref("/docs/cookie-banner/quickstart");
  const hrefEvents = useLocalizedHref("/docs/cookie-banner/javascript/events-and-api");
  const hrefSchema = useLocalizedHref("/docs/cookie-banner/javascript/inta-schema");

  const defaultInta = useMemo(
    () =>
      buildDefaultInta(
        previewOrigin,
        previewHostname,
        translatePath(locale, "intaTryout.demoCompany"),
      ),
    [previewOrigin, previewHostname, locale],
  );

  const [jsonText, setJsonText] = useState(() => formatIntaJson(defaultInta));
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [debugLog, setDebugLog] = useState<DebugEntry[]>([]);
  const debugId = useRef(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fieldHelpRows = useMemo(
    () =>
      FIELD_HELP_KEYS.map(({ path, hintKey }) => ({
        path,
        hint: translatePath(locale, `intaTryout.fieldHints.${hintKey}`),
      })),
    [locale],
  );

  const pushDebug = useCallback((kind: string, text: string) => {
    const id = ++debugId.current;
    const timeStr = new Date().toLocaleTimeString(intlLocaleTag(locale), {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    setDebugLog((prev) => {
      const next = [...prev, { id, t: timeStr, kind, text }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, [locale]);

  const { inta, deferredIssue } = useMemo((): {
    inta: Record<string, unknown> | null;
    deferredIssue: DeferredIssue;
  } => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { inta: null, deferredIssue: { kind: "notObject" } };
      }
      return { inta: parsed as Record<string, unknown>, deferredIssue: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      return { inta: null, deferredIssue: { kind: "syntax", message: msg } };
    }
  }, [jsonText]);

  const [iframeSrcDoc, setIframeSrcDoc] = useState<string | null>(null);

  const iframeUi = useMemo(
    () => ({
      htmlLang: IFRAME_HTML_LANG[locale],
      documentTitle: translatePath(locale, "intaTryout.iframeDocumentTitle"),
      hintText: translatePath(locale, "intaTryout.iframePreviewHint"),
    }),
    [locale],
  );

  useEffect(() => {
    if (!inta || deferredIssue) {
      setIframeSrcDoc(null);
      return;
    }
    pushDebug(
      translatePath(locale, "intaTryout.preview"),
      translatePath(locale, "intaTryout.previewUpdated"),
    );
    setIframeSrcDoc(
      buildPreviewSrcDoc(inta, window.location.origin, iframeUi),
    );
  }, [inta, deferredIssue, iframeUi, pushDebug, locale]);

  useEffect(() => {
    try {
      JSON.parse(jsonText);
      setParseError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setParseError(msg);
    }
  }, [jsonText]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const d = event.data as Record<string, unknown> | null;
      if (!d || d.source !== PREVIEW_MSG_SOURCE) return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      const kind = String(d.kind ?? "unknown");
      if (kind === "datalayer") {
        const detail = typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail);
        const label = detail.includes("cookie_consent_update")
          ? translatePath(locale, "intaTryout.dataLayerConsent")
          : translatePath(locale, "intaTryout.dataLayer");
        pushDebug(label, detail);
        return;
      }
      if (kind === "console") {
        pushDebug(`console.${d.level ?? "log"}`, String(d.message ?? ""));
        return;
      }
      if (kind === "error") {
        pushDebug(
          translatePath(locale, "intaTryout.windowError"),
          String(d.message ?? "") + (d.filename ? ` @ ${d.filename}` : ""),
        );
        return;
      }
      if (kind === "system") {
        pushDebug(translatePath(locale, "intaTryout.preview"), String(d.message ?? ""));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [pushDebug, locale]);

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

  const handleCopyMinimum = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MINIMUM_SETUP_SNIPPET);
    } catch {
      /* ignore */
    }
  }, []);

  const clearDebug = useCallback(() => setDebugLog([]), []);

  const showPreview = Boolean(inta && !deferredIssue && iframeSrcDoc);
  const jsonInvalid = Boolean(parseError || deferredIssue);

  return (
    <div className="not-prose mt-8 space-y-6">
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t("intaTryout.introBeforePrivacy")}
        <a className="text-brand underline-offset-2 hover:underline" href={hrefPrivacy}>
          {t("intaTryout.privacyPage")}
        </a>
        {t("intaTryout.introAfterPrivacy")}
      </p>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-4 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-teal-950/20">
          <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
            {t("intaTryout.minimumSetupTitle")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-emerald-900/85 dark:text-emerald-200/90">
            {t("intaTryout.minimumSetupLeadBeforeRoot")}
            <code className="rounded bg-emerald-100/80 px-0.5 dark:bg-emerald-900/60">rootDomain</code>
            {t("intaTryout.minimumSetupLeadBetweenRootCompany")}
            <code className="rounded bg-emerald-100/80 px-0.5 dark:bg-emerald-900/60">company</code>
            {t("intaTryout.minimumSetupLeadBeforeUc")}
            <code className="rounded bg-emerald-100/80 px-0.5 dark:bg-emerald-900/60">uc.js</code>
            {t("intaTryout.minimumSetupLeadAfterUc")}
          </p>
          <pre className="mt-3 max-h-48 overflow-auto rounded-lg border border-emerald-200/70 bg-white/90 p-3 text-[11px] leading-relaxed text-zinc-800 shadow-inner dark:border-emerald-800/50 dark:bg-zinc-950 dark:text-zinc-200">
            {MINIMUM_SETUP_SNIPPET}
          </pre>
          <button
            type="button"
            onClick={handleCopyMinimum}
            className="mt-2 text-xs font-medium text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-300"
          >
            {t("intaTryout.copyMinimumSnippet")}
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("intaTryout.whatNextTitle")}
          </h3>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            <li>{t("intaTryout.whatNextStep1")}</li>
            <li>{t("intaTryout.whatNextStep2")}</li>
            <li>{t("intaTryout.whatNextStep3")}</li>
            <li>{t("intaTryout.whatNextStep4")}</li>
            <li>
              {t("intaTryout.whatNextStep5Before")}
              <a className="text-brand underline-offset-2 hover:underline" href={hrefQuickstart}>
                {t("intaTryout.docLinkQuickstart")}
              </a>
              {t("intaTryout.whatNextStep5Between")}
              <a className="text-brand underline-offset-2 hover:underline" href={hrefEvents}>
                {t("intaTryout.docLinkEventsApi")}
              </a>
              {t("intaTryout.whatNextStep5After")}
            </li>
          </ol>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="order-1 flex min-w-0 flex-col gap-3 lg:order-2">
          <div className="grid gap-4 lg:grid-cols-[1fr_minmax(240px,300px)] lg:items-start">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  htmlFor="inta-json-editor"
                >
                  {t("intaTryout.editorLabel")}
                </label>
                <div className="ml-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleFormat}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {t("intaTryout.format")}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {t("intaTryout.reset")}
                  </button>
                  <button
                    type="button"
                    disabled={!inta}
                    onClick={handleCopy}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  >
                    {copied ? t("intaTryout.copied") : t("intaTryout.copyHtmlSnippet")}
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
                  {t("intaTryout.jsonErrorPrefix")}
                  {parseError}
                </p>
              ) : null}
            </div>

            <aside
              className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/80"
              aria-label={t("intaTryout.fieldReferenceAria")}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("intaTryout.fieldReferenceTitle")}
              </h3>
              <dl className="mt-2 max-h-[min(420px,50vh)] space-y-2.5 overflow-y-auto pr-1 text-[11px] leading-snug">
                {fieldHelpRows.map(({ path, hint }) => (
                  <div key={path}>
                    <dt className="font-mono text-zinc-800 dark:text-zinc-200">{path}</dt>
                    <dd className="mt-0.5 text-zinc-600 dark:text-zinc-400">{hint}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
                <a className="text-brand underline-offset-2 hover:underline" href={hrefSchema}>
                  {t("intaTryout.fullSchema")}
                </a>{" "}
                {t("intaTryout.fullSchemaExtra")}
              </p>
            </aside>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("intaTryout.pasteFooterBefore")}
            <a className="text-brand underline-offset-2 hover:underline" href={hrefQuickstart}>
              {t("intaTryout.quickstartLink")}
            </a>
            {t("intaTryout.pasteFooterAfter")}
          </p>

          <div className="rounded-xl border border-zinc-300 bg-zinc-900 text-zinc-100 shadow-md dark:border-zinc-600">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-700 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {t("intaTryout.debugConsoleTitle")}
              </span>
              <button
                type="button"
                onClick={clearDebug}
                className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700"
              >
                {t("intaTryout.clear")}
              </button>
            </div>
            <div
              className="max-h-44 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed text-emerald-100/95"
              role="log"
              aria-live="polite"
            >
              {debugLog.length === 0 ? (
                <span className="text-zinc-500">
                  {t("intaTryout.debugEmpty")}
                  <code className="text-zinc-400">{t("intaTryout.debugEmptyCode")}</code>
                  {t("intaTryout.debugEmptyAfter")}
                </span>
              ) : (
                debugLog.map((line) => (
                  <div key={line.id} className="border-b border-zinc-800/80 py-1 last:border-0">
                    <span className="text-zinc-500">{line.t}</span>{" "}
                    <span className="text-amber-200/90">{line.kind}</span>
                    <div className="mt-0.5 whitespace-pre-wrap break-all text-zinc-200">{line.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="order-2 flex min-w-0 flex-col gap-2 lg:order-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("intaTryout.bannerPreview")}
            </span>
            <span className="hidden text-[11px] text-zinc-500 lg:inline dark:text-zinc-400">
              {t("intaTryout.wideFrameHint")}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-300 bg-zinc-200/80 shadow-md dark:border-zinc-600 dark:bg-zinc-950/80">
            {showPreview && iframeSrcDoc ? (
              <iframe
                ref={iframeRef}
                title={t("intaTryout.iframeBannerPreviewTitle")}
                className="block h-[min(560px,72vh)] w-full border-0 bg-zinc-100 dark:bg-zinc-950 lg:min-w-[1280px]"
                sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                srcDoc={iframeSrcDoc}
              />
            ) : (
              <div className="flex h-[min(560px,72vh)] w-full items-center justify-center bg-zinc-100 px-4 text-center text-sm text-zinc-500 lg:min-w-[1280px] dark:bg-zinc-950 dark:text-zinc-400">
                {jsonInvalid ? t("intaTryout.fixJsonPreview") : t("intaTryout.loadingPreview")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
