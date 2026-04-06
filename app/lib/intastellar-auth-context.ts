import { createContext } from "react";
import type { IntastellarUser } from "@intastellar/signin-sdk-react";

export type IntastellarAuthContextValue = {
  /**
   * `false` on the server until the client has committed; then follows the active branch.
   */
  authReady: boolean;
  configured: boolean;
  isLoading: boolean;
  /**
   * Signed in to **this portal** (verified `inta_acc` + root loader), not merely the
   * Intastellar SDK session (which can be true before the account picker completes).
   */
  isSignedIn: boolean;
  users: IntastellarUser[];
  error: string | null;
  signin: (email?: string) => Promise<void>;
  logout: () => void | Promise<void>;
};

const noopAsync = async () => {};
const noop = () => {};

/** Default context — used before the provider mounts or if the consumer is outside the tree. */
export const SSO_BOOTSTRAPPING_AUTH: IntastellarAuthContextValue = {
  authReady: false,
  configured: false,
  isLoading: false,
  isSignedIn: false,
  users: [],
  error: null,
  signin: noopAsync,
  logout: noop,
};

export const DEFAULT_UNCONFIGURED_AUTH: IntastellarAuthContextValue = {
  authReady: true,
  configured: false,
  isLoading: false,
  isSignedIn: false,
  users: [],
  error: null,
  signin: noopAsync,
  logout: noop,
};

export const IntastellarAuthContext =
  createContext<IntastellarAuthContextValue>(SSO_BOOTSTRAPPING_AUTH);
