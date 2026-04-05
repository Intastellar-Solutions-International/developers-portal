import { useEffect, useState } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useNavigate,
} from "react-router";

import type { Route } from "./+types/root";
import { SearchOverlay } from "./components/search-overlay";
import { SiteHeader } from "./components/site-header";
import type { SearchDocument } from "~/lib/search-index.server";
import { IntastellarAuthProvider } from "~/providers/intastellar-auth-provider";
import "./app.css";

type SearchLoaderData = { documents: SearchDocument[] };

/** Same rule as `getIntastellarClientConfig()` — embedded in SSR payload so SSO UI never disagrees with the server. */
export async function loader(_: Route.LoaderArgs) {
  return {
    ssoConfigured: Boolean(
      String(import.meta.env.VITE_INTASTELLAR_CLIENT_ID ?? "").trim(),
    ),
  };
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
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

/**
 * Header, search, and scroll restoration wrap all `Layout` children (`App` → `<Outlet />` or `ErrorBoundary`).
 * Search data loading and navigation run here so router hooks match the root route context reliably.
 */
function RootShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
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

  const documents = fetcher.data?.documents ?? [];
  const loading = fetcher.state === "loading" && !fetcher.data;

  return (
    <IntastellarAuthProvider>
      <SiteHeader onOpenSearch={() => setSearchOpen(true)} />
      <main>{children}</main>
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        documents={documents}
        loading={loading}
        onNavigate={(href) => navigate(href)}
      />
      <ScrollRestoration />
    </IntastellarAuthProvider>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh antialiased">
        <RootShell>{children}</RootShell>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
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
