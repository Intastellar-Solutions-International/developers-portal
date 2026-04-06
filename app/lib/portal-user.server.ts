import { ObjectId } from "mongodb";

import {
  getPortalAccountSnapshot,
  type PublicPortalAccount,
} from "./portal-account.server";

export type PortalAuthProvider = "intastellar" | "github";

/**
 * Authenticated portal user for server loaders/actions (API keys, etc.).
 * Prefer data loaded via MongoDB when the portal session or Intastellar bridge applies.
 */
export type ResolvedPortalUser = {
  accountId: ObjectId | null;
  email: string;
  displayName: string;
  authProvider: PortalAuthProvider;
};

export function publicAccountToResolved(
  account: PublicPortalAccount | null,
): ResolvedPortalUser | null {
  if (!account) return null;
  let accountId: ObjectId | null = null;
  if (account.accountId) {
    try {
      accountId = new ObjectId(account.accountId);
    } catch {
      accountId = null;
    }
  }
  const email = account.email?.trim().toLowerCase() ?? "";
  if (!email) return null;
  return {
    accountId,
    email,
    displayName: account.displayName,
    authProvider: "intastellar",
  };
}

/**
 * Resolve user for child routes without issuing Set-Cookie (root loader mints session).
 */
export async function getResolvedPortalUser(
  request: Request,
): Promise<ResolvedPortalUser | null> {
  const { account } = await getPortalAccountSnapshot(request);
  return publicAccountToResolved(account);
}
