import { ObjectId } from "mongodb";
import type { Session } from "react-router";

import { getPortalAccountSession } from "./intastellar-verify.server";
import { isMongoConfigured } from "./mongodb.server";
import {
  readPortalSessionTokenFromRequest,
  readSsoSnapshotTokenFromRequest,
  serializePortalSessionClearCookie,
  serializeSsoSnapshotClearCookie,
  verifyPortalSessionToken,
  verifySsoSnapshotToken,
} from "./portal-session.server";
import {
  ensureUserFromIntastellar,
  getUserAccountById,
  type UserAccountRecord,
} from "./user-accounts.server";
import {
  commitPortalSession,
  getPortalSession,
  type PortalSessionData,
  type PortalSessionFlash,
} from "~/sessions.server";

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

async function accountFromCookieSession(
  request: Request,
  session: Session<PortalSessionData, PortalSessionFlash>,
  setCookieHeaders: string[],
): Promise<PublicPortalAccount | null> {
  if (!session.has("email")) return null;
  const email = session.get("email")!;
  const displayName = session.get("displayName")?.trim() || email;
  const av = session.get("avatarUrl");
  const avatarUrl =
    typeof av === "string" && av.trim() ? av.trim() : undefined;
  const accountIdHex = session.get("accountId")?.trim();

  if (isMongoConfigured() && accountIdHex) {
    try {
      const oid = new ObjectId(accountIdHex);
      const doc = await getUserAccountById(oid);
      if (doc) return docToPublic(doc);
    } catch {
      /* invalid id */
    }
    session.unset("accountId");
    setCookieHeaders.push(await commitPortalSession(request, session));
    return {
      accountId: "",
      email,
      displayName,
      avatarUrl,
    };
  }

  return {
    accountId: accountIdHex || "",
    email,
    displayName,
    avatarUrl,
  };
}

/** One-time upgrade from pre–React-Router-session cookies. */
async function migrateLegacyPortalCookies(
  request: Request,
  setCookieHeaders: string[],
): Promise<PublicPortalAccount | null> {
  if (isMongoConfigured()) {
    const rawToken = readPortalSessionTokenFromRequest(request);
    if (rawToken) {
      const accountId = verifyPortalSessionToken(rawToken);
      if (accountId) {
        const doc = await getUserAccountById(accountId);
        if (doc) {
          const a = docToPublic(doc);
          const session = await getPortalSession(request.headers.get("Cookie"));
          session.set("email", a.email);
          session.set("displayName", a.displayName);
          if (a.avatarUrl) session.set("avatarUrl", a.avatarUrl);
          session.set("accountId", a.accountId);
          setCookieHeaders.push(await commitPortalSession(request, session));
          setCookieHeaders.push(serializePortalSessionClearCookie(request));
          setCookieHeaders.push(serializeSsoSnapshotClearCookie(request));
          return a;
        }
      }
    }
  }

  const snapTok = readSsoSnapshotTokenFromRequest(request);
  if (snapTok) {
    const snap = verifySsoSnapshotToken(snapTok);
    if (snap) {
      const session = await getPortalSession(request.headers.get("Cookie"));
      session.set("email", snap.email);
      session.set("displayName", snap.displayName);
      if (snap.imageUrl) session.set("avatarUrl", snap.imageUrl);
      session.unset("accountId");
      setCookieHeaders.push(await commitPortalSession(request, session));
      setCookieHeaders.push(serializePortalSessionClearCookie(request));
      setCookieHeaders.push(serializeSsoSnapshotClearCookie(request));
      return {
        accountId: "",
        email: snap.email,
        displayName: snap.displayName,
        avatarUrl: snap.imageUrl,
      };
    }
  }

  return null;
}

async function loadPortalAccountFromRequest(
  request: Request,
  options: LoadOptions,
): Promise<PortalSessionResolution> {
  const setCookieHeaders: string[] = [];
  const cookieHeader = request.headers.get("Cookie");
  const portalSession = await getPortalSession(cookieHeader);

  const fromCookie = await accountFromCookieSession(
    request,
    portalSession,
    setCookieHeaders,
  );
  if (fromCookie) {
    return { account: fromCookie, setCookieHeaders };
  }

  if (!isMongoConfigured()) {
    const migrated = await migrateLegacyPortalCookies(request, setCookieHeaders);
    if (migrated) return { account: migrated, setCookieHeaders };

    const inta = await getPortalAccountSession(request);
    if (!inta) return { account: null, setCookieHeaders };

    if (options.issueSessionCookie) {
      portalSession.set("email", inta.email);
      portalSession.set("displayName", inta.displayName);
      if (inta.imageUrl) portalSession.set("avatarUrl", inta.imageUrl);
      portalSession.unset("accountId");
      setCookieHeaders.push(await commitPortalSession(request, portalSession));
      setCookieHeaders.push(serializePortalSessionClearCookie(request));
      setCookieHeaders.push(serializeSsoSnapshotClearCookie(request));
    }

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

  const migrated = await migrateLegacyPortalCookies(request, setCookieHeaders);
  if (migrated) return { account: migrated, setCookieHeaders };

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
    portalSession.set("email", publicAccount.email);
    portalSession.set("displayName", publicAccount.displayName);
    if (publicAccount.avatarUrl) {
      portalSession.set("avatarUrl", publicAccount.avatarUrl);
    } else {
      portalSession.unset("avatarUrl");
    }
    portalSession.set("accountId", publicAccount.accountId);
    setCookieHeaders.push(await commitPortalSession(request, portalSession));
    setCookieHeaders.push(serializePortalSessionClearCookie(request));
    setCookieHeaders.push(serializeSsoSnapshotClearCookie(request));
  }

  return { account: publicAccount, setCookieHeaders };
}

/** Root loader: may mint signed cookie session after Intastellar verification. */
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
