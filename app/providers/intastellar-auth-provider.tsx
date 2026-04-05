import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouteLoaderData } from "react-router";
import { useIntastellar } from "@intastellar/signin-sdk-react";
import type { IntastellarUser } from "@intastellar/signin-sdk-react";

import { getIntastellarClientConfig } from "~/lib/intastellar-config";
import { clearIntastellarBrowserSession } from "~/lib/intastellar-session";

const noopSubscribe = () => () => {};

type RootLoaderData = { ssoConfigured?: boolean };

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
  logout: () => void;
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
  const { clientId, appName } = getIntastellarClientConfig()!;

  const config = useMemo(
    () => ({
      clientId,
      appName,
      scopes: "profile,email",
    }),
    [clientId, appName],
  );

  const { users, isLoading, error, signin, isSignedIn } = useIntastellar(config);

  const logout = useCallback(() => {
    clearIntastellarBrowserSession();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

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
  const effectiveLoading = isLoading && !sessionProbeTimedOut;
  const errorAfterSignedOutFilter = suppressBenignSignedOutError(
    isSignedIn,
    users,
    error,
  );
  const effectiveError =
    errorAfterSignedOutFilter ??
    (loadingBlocked
      ? "Could not verify your session (request timed out). Check your network, disable ad blockers for this site, or try Sign in — the Accounts API must be reachable from your browser."
      : null);

  const value = useMemo<IntastellarAuthContextValue>(
    () => ({
      authReady: true,
      configured: true,
      isLoading: effectiveLoading,
      isSignedIn,
      users,
      error: effectiveError,
      signin,
      logout,
    }),
    [effectiveLoading, isSignedIn, users, effectiveError, signin, logout],
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
