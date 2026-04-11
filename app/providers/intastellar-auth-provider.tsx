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
  useFetcher,
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
import type { Locale } from "~/lib/i18n/locale";
import { getIntastellarClientConfig } from "~/lib/intastellar-config";
import { clearIntastellarBrowserSession } from "~/lib/intastellar-session";

export type { IntastellarAuthContextValue } from "~/lib/intastellar-auth-context";

export type RootLoaderData = {
  ssoConfigured?: boolean;
  /** UI language (cookie / Accept-Language). */
  locale?: Locale;
  /**
   * Migration strip: legacy developers Referer and/or `?ref=legacy` on the URL (e.g. htaccess 301).
   */
  legacyBannerFromLegacyReferrer?: boolean;
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

const EMPTY_INTASTELLAR_USERS: IntastellarUser[] = [];

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
  const sessionFetcher = useFetcher();
  const logoutFetcher = useFetcher();

  const { clientId, appName } = getIntastellarClientConfig()!;

  /**
   * POSTs `IntastellarUser` to `/auth/session` to mint the signed HttpOnly portal cookie.
   * Identity comes from the SDK (`loginCallback` → `account.user` or `getUsers()`), not from
   * server-side token verification against Intastellar.
   */
  const submitIntastellarUserForPortalSession = useCallback(
    async (user: IntastellarUser) => {
      if (!user.email?.trim()) return;
      /**
       * Send the full SDK user object so `/auth/session` can read every field the API
       * returns (e.g. top-level `given_name`, alternate `name` shapes). A narrow
       * `{ name, email, image }` payload often leaves `displayName` parsing with only
       * email to fall back on.
       */
      await sessionFetcher.submit(
        { user: { ...user } },
        { method: "post", action: "/auth/session", encType: "application/json" },
      );
    },
    [sessionFetcher.submit],
  );

  const onIntastellarSignedIn = useCallback(
    async (account: IntastellarAccount) => {
      await submitIntastellarUserForPortalSession(account.user);
      revalidator.revalidate();
    },
    [submitIntastellarUserForPortalSession, revalidator.revalidate],
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
        const u = users[0];
        if (u) await submitIntastellarUserForPortalSession(u);
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
    submitIntastellarUserForPortalSession,
    users[0]?.email,
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
      await logoutFetcher.submit(new FormData(), {
        method: "post",
        action: "/auth/logout",
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
    /** Stay on the current URL (e.g. documentation); refresh root + route data after portal cookie clears. */
    revalidator.revalidate();
  }, [logoutFetcher.submit, revalidator.revalidate]);

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

  /** Avoid a fresh `[]` / `[user]` every render — unstable refs loop consumers (e.g. login `useEffect`). */
  const effectiveUsers = useMemo((): IntastellarUser[] => {
    if (ignoreSdkUi && !serverSignedIn) return EMPTY_INTASTELLAR_USERS;
    if (serverSignedIn && portalAccount) {
      return [portalAccountToUser(portalAccount)];
    }
    return users;
  }, [
    ignoreSdkUi,
    serverSignedIn,
    portalAccount?.accountId,
    portalAccount?.email,
    portalAccount?.displayName,
    portalAccount?.avatarUrl,
    users,
  ]);

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
