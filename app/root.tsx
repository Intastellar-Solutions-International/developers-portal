import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useMatches,
  useNavigate,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router";

import type { Route } from "./+types/root";
import { LegacyDevelopersBanner } from "./components/legacy-developers-banner";
import { NotFoundPage } from "./components/not-found-page";
import { SearchOverlay } from "./components/search-overlay";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import type { SearchDocument } from "~/lib/search-index.server";
import {
  gtagConfigScript,
  gtmBootstrapScript,
  GA_MEASUREMENT_ID,
  GTM_CONTAINER_ID,
  isAnalyticsEnabled,
} from "~/lib/analytics";
import { OPEN_SEARCH_EVENT } from "~/lib/search-overlay-context";
import {
  COLOR_SCHEME_STORAGE_KEY,
  getColorSchemeIsDarkServerSnapshot,
  getColorSchemeIsDarkSnapshot,
  subscribeColorScheme,
} from "~/lib/color-scheme";
import { isLegacyBannerActiveAt } from "~/lib/legacy-banner";
import { resolvePortalSessionForRequest } from "~/lib/portal-account.server";
import {
  IntastellarAuthProvider,
  type RootLoaderData,
} from "~/providers/intastellar-auth-provider";
import "./app.css";

const colorSchemeBootScript = `(function(){try{var k=${JSON.stringify(COLOR_SCHEME_STORAGE_KEY)};var v=localStorage.getItem(k);var d=v==="dark"||(v!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

const LegacyBannerLayoutContext = createContext<boolean>(false);

/** Match SSR: read `data-legacy-banner` from the hydrated document before recomputing from env (can differ SSR vs client). */
function layoutLegacyBannerFromEnv(): boolean {
  if (typeof document === "undefined") {
    return isLegacyBannerActiveAt(Date.now());
  }
  const raw = document.body?.getAttribute("data-legacy-banner");
  if (raw === "1") return true;
  if (raw === "0") return false;
  return isLegacyBannerActiveAt(Date.now());
}

function useRootHtmlIsDark(): boolean {
  return useSyncExternalStore(
    subscribeColorScheme,
    getColorSchemeIsDarkSnapshot,
    getColorSchemeIsDarkServerSnapshot,
  );
}

type SearchLoaderData = { documents: SearchDocument[] };

/** Same rule as `getIntastellarClientConfig()` — embedded in SSR payload so SSO UI never disagrees with the server. */
export async function loader({ request }: Route.LoaderArgs) {
  const ssoConfigured = Boolean(
    String(import.meta.env.VITE_INTASTELLAR_CLIENT_ID ?? "").trim(),
  );
  const { account, setCookieHeaders } =
    await resolvePortalSessionForRequest(request);
  const headers = new Headers();
  for (const c of setCookieHeaders) {
    headers.append("Set-Cookie", c);
  }
  return data(
    {
      ssoConfigured,
      portalAccount: account,
    },
    { headers },
  );
}

/** Avoid stale `portalAccount` when navigating under `/account/*` (partial loads vs child loaders). */
export function shouldRevalidate({
  defaultShouldRevalidate,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  if (nextUrl.pathname.startsWith("/account")) {
    return true;
  }
  return defaultShouldRevalidate;
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "preconnect", href: "https://www.intastellarsolutions.com" },
  { rel: "preconnect", href: "https://www.intastellar-consents.com" },
  { rel: "preconnect", href: "https://www.intastellaraccounts.com" },
  { rel: "preconnect", href: "https://apis.intastellaraccounts.com" },
  { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
  { rel: "dns-prefetch", href: "https://www.google-analytics.com" },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-57x57.png",
    sizes: "57x57",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-60x60.png",
    sizes: "60x60",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-72x72.png",
    sizes: "72x72",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-76x76.png",
    sizes: "76x76",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-114x114.png",
    sizes: "114x114",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-120x120.png",
    sizes: "120x120",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-144x144.png",
    sizes: "144x144",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-152x152.png",
    sizes: "152x152",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-180x180.png",
    sizes: "180x180",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/android-icon-192x192.png",
    sizes: "192x192",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/favicon-32x32.png",
    sizes: "32x32",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/favicon-96x96.png",
    sizes: "96x96",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "https://www.intastellarsolutions.com/assets/icons/fav/favicon-16x16.png",
    sizes: "16x16",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

/**
 * `useRouteLoaderData("root")` can be briefly undefined during hydration while `matches` still carries
 * `root` loader data — that mismatch caused the legacy banner (and main padding) to disagree with SSR HTML.
 */
function useResolvedRootLoaderData(): RootLoaderData | undefined {
  const fromRoute = useRouteLoaderData("root") as RootLoaderData | undefined;
  const matches = useMatches();
  if (fromRoute !== undefined) return fromRoute;
  const rootMatch = matches.find((m) => m.id === "root");
  return rootMatch?.loaderData as RootLoaderData | undefined;
}

/**
 * Resolves root loader data next to the data router (with `useMatches` fallback) and wraps the UI shell
 * in `IntastellarAuthProvider` so consumers always see the same context instance as the header.
 */
function IntastellarAppShell({ children }: { children: React.ReactNode }) {
  const rootLoaderData = useResolvedRootLoaderData();

  return (
    <IntastellarAuthProvider rootLoaderData={rootLoaderData}>
      {children}
    </IntastellarAuthProvider>
  );
}

/**
 * Header, search, and scroll restoration wrap all `Layout` children (`App` → `<Outlet />` or `ErrorBoundary`).
 * Search data loading and navigation run here so router hooks match the root route context reliably.
 */
function RootShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  /** Avoid SSR/hydration mismatch: first paint has no banner node; mount it before the browser paints. */
  const [shellReady, setShellReady] = useState(false);
  useLayoutEffect(() => {
    setShellReady(true);
  }, []);
  const wantLegacyBanner = useContext(LegacyBannerLayoutContext);
  const showLegacyBanner = shellReady && wantLegacyBanner;
  const fetcher = useFetcher<SearchLoaderData>();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k" || e.code === "KeyK";
      if (!(e.metaKey || e.ctrlKey) || !isK) return;
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setSearchOpen((open) => !open);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    fetcher.load("/search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  useEffect(() => {
    const open = () => setSearchOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, open);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, open);
  }, []);

  const documents = fetcher.data?.documents ?? [];
  const loading = fetcher.state === "loading" && !fetcher.data;

  const openSearch = () => setSearchOpen(true);

  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader onOpenSearch={openSearch} />
        {showLegacyBanner ? <LegacyDevelopersBanner /> : null}
        <main
          className={
            wantLegacyBanner
              ? "flex-1 pt-[6.75rem]"
              : "flex-1 pt-[3.75rem]"
          }
        >
          {children}
        </main>
        <SiteFooter />
      </div>
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        documents={documents}
        loading={loading}
        onNavigate={(href) => navigate(href)}
      />
      <ScrollRestoration />
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const analytics = isAnalyticsEnabled();
  const htmlIsDark = useRootHtmlIsDark();
  const legacyBannerLayout = layoutLegacyBannerFromEnv();

  return (
    <html
      lang="en"
      className={htmlIsDark ? "dark" : undefined}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          // Apply stored / OS theme before paint (keeps Tailwind `dark:` in sync).
          dangerouslySetInnerHTML={{ __html: colorSchemeBootScript }}
        />
        <Meta />
        <Links />
        {analytics ? (
          <>
            <script
              // GTM — must run early; safe to SSR as static bootstrap
              dangerouslySetInnerHTML={{ __html: gtmBootstrapScript() }}
            />
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{ __html: gtagConfigScript() }}
            />
          </>
        ) : null}
      </head>
      <body
        className="min-h-dvh antialiased"
        data-legacy-banner={legacyBannerLayout ? "1" : "0"}
      >
        {analytics ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
              height="0"
              width="0"
              title="Google Tag Manager"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        <LegacyBannerLayoutContext.Provider value={legacyBannerLayout}>
          <IntastellarAppShell>
            <RootShell>{children}</RootShell>
          </IntastellarAppShell>
        </LegacyBannerLayoutContext.Provider>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = "Error";
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </div>
  );
}
