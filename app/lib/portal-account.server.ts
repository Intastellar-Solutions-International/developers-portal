import type { ObjectId } from "mongodb";

import { getPortalAccountSession } from "./intastellar-verify.server";
import { isMongoConfigured } from "./mongodb.server";
import {
  readPortalSessionTokenFromRequest,
  serializePortalSessionSetCookie,
  verifyPortalSessionToken,
} from "./portal-session.server";
import {
  ensureUserFromIntastellar,
  getUserAccountById,
  type UserAccountRecord,
} from "./user-accounts.server";

function emailFromUserDoc(doc: UserAccountRecord): string {
  const p = doc.primaryEmail?.trim();
  if (p) return p.toLowerCase();
  for (const id of doc.identities ?? []) {
    const e = typeof id.email === "string" ? id.email.trim().toLowerCase() : "";
    if (e) return e;
  }
  const subj = doc.identities?.find((i) => i.provider === "intastellar")?.subject;
  if (typeof subj === "string" && subj.trim()) return subj.trim().toLowerCase();
  return "";
}

export type PublicPortalAccount = {
  accountId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
};

function docToPublic(
  doc: UserAccountRecord & { _id: ObjectId },
): PublicPortalAccount {
  const email = emailFromUserDoc(doc);
  return {
    accountId: doc._id.toHexString(),
    email,
    displayName: doc.displayName?.trim() || email || "Account",
    avatarUrl: doc.avatarUrl,
  };
}

export type PortalSessionResolution = {
  account: PublicPortalAccount | null;
  /** Append to response `Set-Cookie` when a new portal session was issued */
  setCookieHeaders: string[];
};

type LoadOptions = { issueSessionCookie: boolean };

async function loadPortalAccountFromRequest(
  request: Request,
  options: LoadOptions,
): Promise<PortalSessionResolution> {
  const setCookieHeaders: string[] = [];

  if (!isMongoConfigured()) {
    const inta = await getPortalAccountSession(request);
    if (!inta) return { account: null, setCookieHeaders };
    return {
      account: {
        accountId: "",
        email: inta.email,
        displayName: inta.displayName,
        avatarUrl: inta.imageUrl,
      },
      setCookieHeaders,
    };
  }

  const rawToken = readPortalSessionTokenFromRequest(request);
  if (rawToken) {
    const accountId = verifyPortalSessionToken(rawToken);
    if (accountId) {
      const doc = await getUserAccountById(accountId);
      if (doc) {
        return { account: docToPublic(doc), setCookieHeaders };
      }
    }
  }

  const inta = await getPortalAccountSession(request);
  if (!inta) {
    return { account: null, setCookieHeaders };
  }

  const accountId = await ensureUserFromIntastellar(inta);
  if (!accountId) {
    return { account: null, setCookieHeaders };
  }

  const doc = await getUserAccountById(accountId);
  const publicAccount = doc
    ? docToPublic(doc)
    : {
        accountId: accountId.toHexString(),
        email: inta.email,
        displayName: inta.displayName,
        avatarUrl: inta.imageUrl,
      };

  if (options.issueSessionCookie) {
    const cookie = serializePortalSessionSetCookie(request, accountId);
    if (cookie) {
      setCookieHeaders.push(cookie);
    }
  }

  return { account: publicAccount, setCookieHeaders };
}

/** Root loader: may mint `inta_portal_sess` after Intastellar verification. */
export async function resolvePortalSessionForRequest(
  request: Request,
): Promise<PortalSessionResolution> {
  return loadPortalAccountFromRequest(request, { issueSessionCookie: true });
}

/** Loaders/actions that must not set cookies — rely on root or prior mint. */
export async function getPortalAccountSnapshot(
  request: Request,
): Promise<PortalSessionResolution> {
  return loadPortalAccountFromRequest(request, { issueSessionCookie: false });
}
