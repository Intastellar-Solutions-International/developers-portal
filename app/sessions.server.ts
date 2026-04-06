import { createCookieSessionStorage, type Session } from "react-router";

/**
 * Cookie-backed portal session (signed). See:
 * https://reactrouter.com/explanation/sessions-and-cookies
 */
export type PortalSessionData = {
  accountId?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
};

export type PortalSessionFlash = {
  error?: string;
};

function portalSessionSecrets(): string[] {
  const s = process.env.SESSION_SECRET?.trim();
  if (s) return [s];
  if (process.env.NODE_ENV === "production") {
    return ["__missing_SESSION_SECRET_configure_env__"];
  }
  return ["dev-inta-portal-session-secret-change-me"];
}

const portalCookieSessionStorage =
  createCookieSessionStorage<PortalSessionData, PortalSessionFlash>({
    cookie: {
      name: "inta_portal_session",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      secrets: portalSessionSecrets(),
    },
  });

function requestIsHttps(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim().toLowerCase();
    if (first === "https") return true;
    if (first === "http") return false;
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Per-request `Secure` flag (localhost HTTP must stay false). */
export function sessionSerializeOptions(request: Request): { secure: boolean } {
  return { secure: requestIsHttps(request) };
}

export async function getPortalSession(
  cookieHeader: string | null,
): Promise<Session<PortalSessionData, PortalSessionFlash>> {
  return portalCookieSessionStorage.getSession(cookieHeader);
}

export async function commitPortalSession(
  request: Request,
  session: Session<PortalSessionData, PortalSessionFlash>,
): Promise<string> {
  return portalCookieSessionStorage.commitSession(
    session,
    sessionSerializeOptions(request),
  );
}

export async function destroyPortalSession(
  request: Request,
  session: Session<PortalSessionData, PortalSessionFlash>,
): Promise<string> {
  return portalCookieSessionStorage.destroySession(
    session,
    sessionSerializeOptions(request),
  );
}
