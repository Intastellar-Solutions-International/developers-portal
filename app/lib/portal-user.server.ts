import type { ObjectId } from "mongodb";

import { getPortalAccountSession } from "./intastellar-verify.server";
import { isMongoConfigured } from "./mongodb.server";
import { ensureUserFromIntastellar } from "./user-accounts.server";

export type PortalAuthProvider = "intastellar" | "github";

/**
 * Authenticated portal user for server loaders/actions.
 * - `accountId` is set when MongoDB is configured and the account row was ensured.
 * - Without Mongo, Intastellar session is still valid for UI, but API key storage stays email-scoped only.
 */
export type ResolvedPortalUser = {
  accountId: ObjectId | null;
  email: string;
  displayName: string;
  authProvider: PortalAuthProvider;
};

/**
 * Resolve the current user from the request (Intastellar cookie today; GitHub session can be added here).
 */
export async function getResolvedPortalUser(
  request: Request,
): Promise<ResolvedPortalUser | null> {
  const session = await getPortalAccountSession(request);
  if (!session) return null;

  if (!isMongoConfigured()) {
    return {
      accountId: null,
      email: session.email,
      displayName: session.displayName,
      authProvider: "intastellar",
    };
  }

  const accountId = await ensureUserFromIntastellar(session);
  return {
    accountId,
    email: session.email,
    displayName: session.displayName,
    authProvider: "intastellar",
  };
}
