import { createCookieSessionStorage, type Session } from "react-router";

import { portalSessionSecrets, sessionSerializeOptions } from "~/sessions.server";

type GitHubOAuthStateData = {
  state: string;
  returnTo?: string;
  /** When set, callback links GitHub to this Mongo `user_accounts` id (must match portal cookie). */
  linkAccountIdHex?: string;
};

const githubOAuthStateStorage =
  createCookieSessionStorage<GitHubOAuthStateData>({
    cookie: {
      name: "github_oauth_state",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 600,
      secrets: portalSessionSecrets(),
    },
  });

export async function getGithubOAuthStateSession(
  cookieHeader: string | null,
): Promise<Session<GitHubOAuthStateData, never>> {
  return githubOAuthStateStorage.getSession(cookieHeader);
}

export async function commitGithubOAuthStateSession(
  request: Request,
  session: Session<GitHubOAuthStateData, never>,
): Promise<string> {
  return githubOAuthStateStorage.commitSession(
    session,
    sessionSerializeOptions(request),
  );
}

export async function destroyGithubOAuthStateSession(
  request: Request,
  session: Session<GitHubOAuthStateData, never>,
): Promise<string> {
  return githubOAuthStateStorage.destroySession(
    session,
    sessionSerializeOptions(request),
  );
}
