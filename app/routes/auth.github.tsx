import { redirect, type LoaderFunctionArgs } from "react-router";
import { ObjectId } from "mongodb";

import { githubOAuthAuthorizeUrl, isGitHubOAuthConfigured } from "~/lib/github-oauth.server";
import {
  commitGithubOAuthStateSession,
  getGithubOAuthStateSession,
} from "~/lib/github-oauth-session.server";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { resolveLocaleFromRequest } from "~/lib/i18n/resolve-locale.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { resolvePortalSessionForRequest } from "~/lib/portal-account.server";
import { isSafeInternalRedirect } from "~/lib/safe-redirect-path";

/**
 * Starts GitHub OAuth (non-localized `/auth/github` so callback URL is stable for every locale).
 * Use `?link=1` while signed in with a portal `accountId` to attach GitHub to that user (verified email must match).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const locale = resolveLocaleFromRequest(request);
  const login = withLocalePrefix("/account/login", locale);
  const profile = withLocalePrefix("/account/profile", locale);

  if (!isGitHubOAuthConfigured()) {
    return redirect(`${login}?github_error=disabled`);
  }

  const url = new URL(request.url);
  const rawReturn = url.searchParams.get("redirect");
  const returnTo = isSafeInternalRedirect(rawReturn) ? rawReturn : undefined;
  const link = url.searchParams.get("link") === "1";

  const state = crypto.randomUUID();
  const st = await getGithubOAuthStateSession(request.headers.get("Cookie"));
  st.set("state", state);

  if (link) {
    if (!isMongoConfigured()) {
      return redirect(`${profile}?github_error=link_requires_mongo`);
    }
    const { account } = await resolvePortalSessionForRequest(request);
    const hex = account?.accountId?.trim();
    if (!hex) {
      return redirect(`${login}?github_error=link_requires_login`);
    }
    try {
      new ObjectId(hex);
    } catch {
      return redirect(`${login}?github_error=link_requires_login`);
    }
    st.set("linkAccountIdHex", hex);
    st.set("returnTo", returnTo ?? profile);
  } else if (returnTo) {
    st.set("returnTo", returnTo);
  }

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    await commitGithubOAuthStateSession(request, st),
  );
  return redirect(githubOAuthAuthorizeUrl(request, state), { headers });
}

export default function AuthGitHubStart() {
  return null;
}
