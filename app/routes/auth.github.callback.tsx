import { redirect, type LoaderFunctionArgs } from "react-router";
import { ObjectId } from "mongodb";

import {
  exchangeGitHubOAuthCode,
  fetchGitHubUserInput,
  isGitHubOAuthConfigured,
} from "~/lib/github-oauth.server";
import {
  destroyGithubOAuthStateSession,
  getGithubOAuthStateSession,
} from "~/lib/github-oauth-session.server";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import {
  serializePortalSessionClearCookie,
  serializeSsoSnapshotClearCookie,
} from "~/lib/portal-session.server";
import { isSafeInternalRedirect } from "~/lib/safe-redirect-path";
import { commitPortalSession, getPortalSession } from "~/sessions.server";
import {
  ensureUserFromGitHub,
  linkGitHubIdentityToPortalAccount,
} from "~/lib/user-accounts.server";

function sessionEmailFromGitHubUser(input: {
  email: string | null;
  verifiedEmails?: string[];
  id: number | string;
  login: string;
}): string {
  const e = input.email?.trim().toLowerCase();
  if (e) return e;
  const firstVerified = input.verifiedEmails?.find((x) => x.trim());
  if (firstVerified) return firstVerified.trim().toLowerCase();
  return `${String(input.id)}+${input.login}@users.noreply.github.com`;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = resolveLocaleFromRequest(request);
  const loginHref = withLocalePrefix("/account/login", locale);
  const profileHref = withLocalePrefix("/account/profile", locale);

  const oauthErrorLogin = async (code: string) => {
    const st = await getGithubOAuthStateSession(request.headers.get("Cookie"));
    const headers = new Headers();
    if (st.get("state")) {
      headers.append(
        "Set-Cookie",
        await destroyGithubOAuthStateSession(request, st),
      );
    }
    return redirect(`${loginHref}?github_error=${encodeURIComponent(code)}`, {
      headers,
    });
  };

  if (!isGitHubOAuthConfigured()) {
    return oauthErrorLogin("disabled");
  }

  const url = new URL(request.url);
  if (url.searchParams.get("error")) {
    return oauthErrorLogin("denied");
  }

  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const st = await getGithubOAuthStateSession(request.headers.get("Cookie"));
  const expected = st.get("state");
  const returnTo = st.get("returnTo");
  const linkAccountIdHex = st.get("linkAccountIdHex");

  if (!code || !stateParam || !expected || stateParam !== expected) {
    const headers = new Headers();
    if (expected) {
      headers.append(
        "Set-Cookie",
        await destroyGithubOAuthStateSession(request, st),
      );
    }
    return redirect(`${loginHref}?github_error=state`, { headers });
  }

  let accessToken: string;
  try {
    accessToken = await exchangeGitHubOAuthCode(request, code);
  } catch {
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      await destroyGithubOAuthStateSession(request, st),
    );
    return redirect(`${loginHref}?github_error=token`, { headers });
  }

  let ghUser: Awaited<ReturnType<typeof fetchGitHubUserInput>>;
  try {
    ghUser = await fetchGitHubUserInput(accessToken);
  } catch {
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      await destroyGithubOAuthStateSession(request, st),
    );
    return redirect(`${loginHref}?github_error=user`, { headers });
  }

  const portalSession = await getPortalSession(request.headers.get("Cookie"));

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    await destroyGithubOAuthStateSession(request, st),
  );

  /** Link GitHub to the signed-in Intastellar-backed account (no new session cookie). */
  if (linkAccountIdHex?.trim()) {
    const sessionAccountId = portalSession.get("accountId")?.trim();
    if (sessionAccountId !== linkAccountIdHex.trim()) {
      return redirect(
        `${profileHref}?github_error=link_session_mismatch`,
        { headers },
      );
    }
    let oid: ObjectId;
    try {
      oid = new ObjectId(linkAccountIdHex.trim());
    } catch {
      return redirect(`${profileHref}?github_error=link_invalid`, { headers });
    }
    const linkResult = await linkGitHubIdentityToPortalAccount(oid, ghUser);
    if (!linkResult.ok) {
      return redirect(
        `${profileHref}?github_error=link_${linkResult.error}`,
        { headers },
      );
    }
    const destBase = isSafeInternalRedirect(returnTo) ? returnTo! : profileHref;
    const dest = destBase.includes("?")
      ? `${destBase}&github_linked=1`
      : `${destBase}?github_linked=1`;
    return redirect(dest, { headers });
  }

  portalSession.set("email", sessionEmailFromGitHubUser(ghUser));
  portalSession.set("displayName", ghUser.name?.trim() || ghUser.login);
  if (ghUser.avatarUrl?.trim()) {
    portalSession.set("avatarUrl", ghUser.avatarUrl.trim());
  } else {
    portalSession.unset("avatarUrl");
  }

  if (!isMongoConfigured()) {
    portalSession.unset("accountId");
    headers.append("Set-Cookie", await commitPortalSession(request, portalSession));
    headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
    headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
    const dest = isSafeInternalRedirect(returnTo) ? returnTo! : profileHref;
    return redirect(dest, { headers });
  }

  const accountId = await ensureUserFromGitHub(ghUser);
  if (!accountId) {
    portalSession.unset("accountId");
    headers.append("Set-Cookie", await commitPortalSession(request, portalSession));
    headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
    headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
    const dest = isSafeInternalRedirect(returnTo) ? returnTo! : profileHref;
    return redirect(dest, { headers });
  }

  portalSession.set("accountId", accountId.toHexString());
  headers.append("Set-Cookie", await commitPortalSession(request, portalSession));
  headers.append("Set-Cookie", serializePortalSessionClearCookie(request));
  headers.append("Set-Cookie", serializeSsoSnapshotClearCookie(request));
  const dest = isSafeInternalRedirect(returnTo) ? returnTo! : profileHref;
  return redirect(dest, { headers });
}

export default function AuthGitHubCallback() {
  return null;
}
