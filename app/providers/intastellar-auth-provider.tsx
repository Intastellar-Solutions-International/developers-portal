import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIntastellar } from "@intastellar/signin-sdk-react";
import type { IntastellarUser } from "@intastellar/signin-sdk-react";

import { getIntastellarClientConfig } from "~/lib/intastellar-config";

/** If `getUsers()` never settles (CORS, ad blockers, network), the SDK stays `isLoading` forever — unblock the UI after this. */
const SESSION_PROBE_MS = 10_000;

export type IntastellarAuthContextValue = {
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

const defaultUnconfigured: IntastellarAuthContextValue = {
  configured: false,
  isLoading: false,
  isSignedIn: false,
  users: [],
  error: null,
  signin: noopAsync,
  logout: noop,
};

const IntastellarAuthContext =
  createContext<IntastellarAuthContextValue>(defaultUnconfigured);

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

  const { users, isLoading, error, signin, logout, isSignedIn } =
    useIntastellar(config);

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
  const effectiveError =
    error ??
    (loadingBlocked
      ? "Could not verify your session (request timed out). Check your network, disable ad blockers for this site, or try Sign in — the Accounts API must be reachable from your browser."
      : null);

  const value = useMemo<IntastellarAuthContextValue>(
    () => ({
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
  const hasConfig = getIntastellarClientConfig() !== null;

  if (!hasConfig) {
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
