import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useMatches,
  useRevalidator,
  useRouteLoaderData,
} from "react-router";
import { useIntastellar } from "@intastellar/signin-sdk-react";
import type { IntastellarAccount, IntastellarUser } from "@intastellar/signin-sdk-react";

import {
  DEFAULT_UNCONFIGURED_AUTH,
  IntastellarAuthContext,
  SSO_BOOTSTRAPPING_AUTH,
  type IntastellarAuthContextValue,
} from "~/lib/intastellar-auth-context";
import { getIntastellarClientConfig } from "~/lib/intastellar-config";
import {
  readIntaAccFromDocument,
  syncIntastellarPortalSession,
} from "~/lib/intastellar-portal-session-sync.client";
import { clearIntastellarBrowserSession } from "~/lib/intastellar-session";

export type { IntastellarAuthContextValue } from "~/lib/intastellar-auth-context";

export type RootLoaderData = {
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

/**
 * After portal logout, Intastellar `getUsers()` may still return a user (third-party
 * Accounts cookies). Ignore SDK session for UI until the user starts sign-in again.
 */
const IGNORE_SDK_AFTER_PORTAL_LOGOUT_KEY = "inta_portal_ignore_sdk";

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

function resolveRootLoaderData(
  fromProp: RootLoaderData | undefined,
  fromRoute: RootLoaderData | undefined,
  matches: ReturnType<typeof useMatches>,
): RootLoaderData | undefined {
  if (fromProp !== undefined) return fromProp;
  if (fromRoute !== undefined) return fromRoute;
  const rootMatch = matches.find((m) => m.id === "root");
  return rootMatch?.loaderData as RootLoaderData | undefined;
}

function IntastellarAuthEnabled({
  children,
  rootData,
}: {
  children: ReactNode;
  rootData: RootLoaderData | undefined;
}) {
  const revalidator = useRevalidator();

  const { clientId, appName } = getIntastellarClientConfig()!;

  const onIntastellarSignedIn = useCallback(
    async (account: IntastellarAccount) => {
      const ok = await syncIntastellarPortalSession(account.token);
      if (ok) revalidator.revalidate();
    },
    [revalidator.revalidate],
  );

  const config = useMemo(
    () => ({
      clientId,
      appName,
      scopes: "profile,email",
      loginCallback: onIntastellarSignedIn,
    }),
    [clientId, appName, onIntastellarSignedIn],
  );

  const { users, isLoading, error, signin, isSignedIn } = useIntastellar(config);

  const portalAccount = rootData?.portalAccount ?? null;
  const serverSignedIn = Boolean(portalAccount?.email);

  const [ignoreSdkSession, setIgnoreSdkSession] = useState(false);

  useLayoutEffect(() => {
    try {
      setIgnoreSdkSession(
        sessionStorage.getItem(IGNORE_SDK_AFTER_PORTAL_LOGOUT_KEY) === "1",
      );
    } catch {
      /* private mode / no sessionStorage */
    }
  }, []);

  useEffect(() => {
    if (portalAccount == null) return;
    try {
      if (sessionStorage.getItem(IGNORE_SDK_AFTER_PORTAL_LOGOUT_KEY) === "1") {
        sessionStorage.removeItem(IGNORE_SDK_AFTER_PORTAL_LOGOUT_KEY);
      }
    } catch {
      /* ignore */
    }
    setIgnoreSdkSession(false);
  }, [portalAccount]);

  const portalSyncAttempts = useRef(0);

  useEffect(() => {
    if (portalAccount != null) {
      portalSyncAttempts.current = 0;
    }
  }, [portalAccount]);

  useEffect(() => {
    if (ignoreSdkSession) return;
    if (
      portalAccount == null &&
      isSignedIn &&
      users.length > 0 &&
      revalidator.state === "idle" &&
      portalSyncAttempts.current < 5
    ) {
      portalSyncAttempts.current += 1;
      void (async () => {
        const token = readIntaAccFromDocument();
        if (token) await syncIntastellarPortalSession(token);
        revalidator.revalidate();
      })();
    }
  }, [
    ignoreSdkSession,
    portalAccount,
    isSignedIn,
    users.length,
    revalidator.state,
    revalidator.revalidate,
  ]);

  const signinWrapped = useCallback(
    async (email?: string) => {
      try {
        sessionStorage.removeItem(IGNORE_SDK_AFTER_PORTAL_LOGOUT_KEY);
      } catch {
        /* ignore */
      }
      setIgnoreSdkSession(false);
      await signin(email);
    },
    [signin],
  );

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
    try {
      sessionStorage.setItem(IGNORE_SDK_AFTER_PORTAL_LOGOUT_KEY, "1");
    } catch {
      /* ignore */
    }
    window.location.assign("/account/login");
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
  const sdkLoading = isLoading && !sessionProbeTimedOut;
  const ignoreSdkUi = ignoreSdkSession && !serverSignedIn;
  const effectiveLoading = ignoreSdkUi
    ? false
    : serverSignedIn
      ? false
      : sdkLoading;
  const errorAfterSignedOutFilter = suppressBenignSignedOutError(
    isSignedIn,
    users,
    error,
  );
  const effectiveError = ignoreSdkUi
    ? null
    : serverSignedIn
      ? null
      : errorAfterSignedOutFilter ??
        (loadingBlocked
          ? "Could not verify your session (request timed out). Check your network, disable ad blockers for this site, or try Sign in — the Accounts API must be reachable from your browser."
          : null);

  const effectiveSignedIn = ignoreSdkUi
    ? serverSignedIn
    : serverSignedIn || isSignedIn;
  const effectiveUsers =
    ignoreSdkUi && !serverSignedIn
      ? []
      : serverSignedIn && portalAccount
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
      signin: signinWrapped,
      logout,
    }),
    [
      effectiveLoading,
      effectiveSignedIn,
      effectiveUsers,
      effectiveError,
      signinWrapped,
      logout,
    ],
  );

  return (
    <IntastellarAuthContext.Provider value={value}>
      {children}
    </IntastellarAuthContext.Provider>
  );
}

export function IntastellarAuthProvider({
  children,
  rootLoaderData: rootLoaderDataProp,
}: {
  children: ReactNode;
  /** When set (e.g. from `root` Layout), avoids relying on `useRouteLoaderData` alone inside nested trees. */
  rootLoaderData?: RootLoaderData;
}) {
  const fromRoute = useRouteLoaderData("root") as RootLoaderData | undefined;
  const matches = useMatches();
  const rootData = resolveRootLoaderData(
    rootLoaderDataProp,
    fromRoute,
    matches,
  );

  const [authReady, setAuthReady] = useState(false);

  useLayoutEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  if (!authReady) {
    return (
      <IntastellarAuthContext.Provider value={SSO_BOOTSTRAPPING_AUTH}>
        {children}
      </IntastellarAuthContext.Provider>
    );
  }

  const hasConfig = rootData?.ssoConfigured === true;

  if (!hasConfig) {
    return (
      <IntastellarAuthContext.Provider value={DEFAULT_UNCONFIGURED_AUTH}>
        {children}
      </IntastellarAuthContext.Provider>
    );
  }

  if (getIntastellarClientConfig() === null) {
    return (
      <IntastellarAuthContext.Provider value={DEFAULT_UNCONFIGURED_AUTH}>
        {children}
      </IntastellarAuthContext.Provider>
    );
  }

  return (
    <IntastellarAuthEnabled rootData={rootData}>{children}</IntastellarAuthEnabled>
  );
}

export function useIntastellarAuth(): IntastellarAuthContextValue {
  return useContext(IntastellarAuthContext);
}
