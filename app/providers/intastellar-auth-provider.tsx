import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRevalidator, useRouteLoaderData } from "react-router";
import { useIntastellar } from "@intastellar/signin-sdk-react";
import type { IntastellarUser } from "@intastellar/signin-sdk-react";

import { getIntastellarClientConfig } from "~/lib/intastellar-config";
import { clearIntastellarBrowserSession } from "~/lib/intastellar-session";

const noopSubscribe = () => () => {};

type RootLoaderData = {
  ssoConfigured?: boolean;
  portalAccount?: {
    accountId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  } | null;
};

function splitDisplayName(displayName: string): {
  first: string;
  last: string;
} {
  const t = displayName.trim();
  const i = t.indexOf(" ");
  if (i === -1) return { first: t || "Member", last: "" };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

function portalAccountToUser(
  portal: NonNullable<RootLoaderData["portalAccount"]>,
): IntastellarUser {
  const { first, last } = splitDisplayName(portal.displayName);
  return {
    name: { first, last },
    email: portal.email,
    image: portal.avatarUrl ?? "",
  };
}

/** If `getUsers()` never settles (CORS, ad blockers, network), the SDK stays `isLoading` forever — unblock the UI after this. */
const SESSION_PROBE_MS = 10_000;

/** After sign-out, Intastellar `getUsers()` may still throw (e.g. Safari “Load failed”); don’t treat that as a blocking error. */
function suppressBenignSignedOutError(
  isSignedIn: boolean,
  users: IntastellarUser[],
  sdkError: string | null,
): string | null {
  if (sdkError == null || isSignedIn || users.length > 0) return sdkError;
  const m = sdkError.toLowerCase();
  if (
    m.includes("load failed") ||
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("network error")
  ) {
    return null;
  }
  return sdkError;
}

export type IntastellarAuthContextValue = {
  /**
   * `false` until the client has mounted. Keeps SSR + first client paint identical
   * so `import.meta.env.VITE_*` cannot diverge between server and browser.
   */
  authReady: boolean;
  configured: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
  users: IntastellarUser[];
  error: string | null;
  signin: (email?: string) => Promise<void>;
  logout: () => void | Promise<void>;
};

const noopAsync = async () => {};
const noop = () => {};

/** Before `authReady` — same on server and client (no env branch). */
const ssoBootstrapping: IntastellarAuthContextValue = {
  authReady: false,
  configured: false,
  isLoading: false,
  isSignedIn: false,
  users: [],
  error: null,
  signin: noopAsync,
  logout: noop,
};

const defaultUnconfigured: IntastellarAuthContextValue = {
  authReady: true,
  configured: false,
  isLoading: false,
  isSignedIn: false,
  users: [],
  error: null,
  signin: noopAsync,
  logout: noop,
};

const IntastellarAuthContext =
  createContext<IntastellarAuthContextValue>(ssoBootstrapping);

function IntastellarAuthEnabled({ children }: { children: ReactNode }) {
  const rootData = useRouteLoaderData("root") as RootLoaderData | undefined;
  const revalidator = useRevalidator();

  const { clientId, appName } = getIntastellarClientConfig()!;

  const config = useMemo(
    () => ({
      clientId,
      appName,
      scopes: "profile,email",
    }),
    [clientId, appName],
  );

  const { users, isLoading, error, signin, logout: sdkLogout, isSignedIn } =
    useIntastellar(config);

  const portalAccount = rootData?.portalAccount ?? null;
  const serverSignedIn = Boolean(portalAccount?.email);

  const portalSyncAttempts = useRef(0);

  useEffect(() => {
    if (portalAccount != null) {
      portalSyncAttempts.current = 0;
    }
  }, [portalAccount]);

  useEffect(() => {
    if (
      portalAccount == null &&
      isSignedIn &&
      users.length > 0 &&
      revalidator.state === "idle" &&
      portalSyncAttempts.current < 5
    ) {
      portalSyncAttempts.current += 1;
      revalidator.revalidate();
    }
  }, [portalAccount, isSignedIn, users.length, revalidator]);

  const logout = useCallback(async () => {
    try {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    clearIntastellarBrowserSession();
    sdkLogout();
  }, [sdkLogout]);

  const [sessionProbeTimedOut, setSessionProbeTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    setSessionProbeTimedOut(false);
    const id = window.setTimeout(() => setSessionProbeTimedOut(true), SESSION_PROBE_MS);
    return () => window.clearTimeout(id);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) setSessionProbeTimedOut(false);
  }, [isLoading]);

  const loadingBlocked = isLoading && sessionProbeTimedOut;
  const sdkLoading = isLoading && !sessionProbeTimedOut;
  const effectiveLoading = serverSignedIn ? false : sdkLoading;
  const errorAfterSignedOutFilter = suppressBenignSignedOutError(
    isSignedIn,
    users,
    error,
  );
  const effectiveError = serverSignedIn
    ? null
    : errorAfterSignedOutFilter ??
      (loadingBlocked
        ? "Could not verify your session (request timed out). Check your network, disable ad blockers for this site, or try Sign in — the Accounts API must be reachable from your browser."
        : null);

  const effectiveSignedIn = serverSignedIn || isSignedIn;
  const effectiveUsers =
    serverSignedIn && portalAccount
      ? [portalAccountToUser(portalAccount)]
      : users;

  const value = useMemo<IntastellarAuthContextValue>(
    () => ({
      authReady: true,
      configured: true,
      isLoading: effectiveLoading,
      isSignedIn: effectiveSignedIn,
      users: effectiveUsers,
      error: effectiveError,
      signin,
      logout,
    }),
    [
      effectiveLoading,
      effectiveSignedIn,
      effectiveUsers,
      effectiveError,
      signin,
      logout,
    ],
  );

  return (
    <IntastellarAuthContext.Provider value={value}>
      {children}
    </IntastellarAuthContext.Provider>
  );
}

export function IntastellarAuthProvider({ children }: { children: ReactNode }) {
  const rootData = useRouteLoaderData("root") as RootLoaderData | undefined;

  const authReady = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!authReady) {
    return (
      <IntastellarAuthContext.Provider value={ssoBootstrapping}>
        {children}
      </IntastellarAuthContext.Provider>
    );
  }

  const hasConfig = rootData?.ssoConfigured === true;

  if (!hasConfig) {
    return (
      <IntastellarAuthContext.Provider value={defaultUnconfigured}>
        {children}
      </IntastellarAuthContext.Provider>
    );
  }

  if (getIntastellarClientConfig() === null) {
    return (
      <IntastellarAuthContext.Provider value={defaultUnconfigured}>
        {children}
      </IntastellarAuthContext.Provider>
    );
  }

  return <IntastellarAuthEnabled>{children}</IntastellarAuthEnabled>;
}

export function useIntastellarAuth(): IntastellarAuthContextValue {
  return useContext(IntastellarAuthContext);
}
