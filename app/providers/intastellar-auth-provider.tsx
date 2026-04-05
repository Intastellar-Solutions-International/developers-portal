import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useIntastellar } from "@intastellar/signin-sdk-react";
import type { IntastellarUser } from "@intastellar/signin-sdk-react";

import { getIntastellarClientConfig } from "~/lib/intastellar-config";

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

  const value = useMemo<IntastellarAuthContextValue>(
    () => ({
      configured: true,
      isLoading,
      isSignedIn,
      users,
      error,
      signin,
      logout,
    }),
    [isLoading, isSignedIn, users, error, signin, logout],
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
