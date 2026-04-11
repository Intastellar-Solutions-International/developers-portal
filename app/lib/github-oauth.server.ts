import type { GitHubUserInput } from "~/lib/user-accounts.server";

const GITHUB_USER_AGENT = "inta.dev-developers-portal";

export function isGitHubOAuthConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_OAUTH_CLIENT_ID?.trim() &&
      process.env.GITHUB_OAUTH_CLIENT_SECRET?.trim(),
  );
}

function githubClientId(): string {
  return process.env.GITHUB_OAUTH_CLIENT_ID?.trim() ?? "";
}

function githubClientSecret(): string {
  return process.env.GITHUB_OAUTH_CLIENT_SECRET?.trim() ?? "";
}

/** Must match the GitHub OAuth App “Authorization callback URL” exactly. */
export function githubOAuthRedirectUri(request: Request): string {
  const override = process.env.GITHUB_OAUTH_REDIRECT_URI?.trim();
  if (override) return override;
  const u = new URL(request.url);
  return `${u.origin}/auth/github/callback`;
}

export function githubOAuthAuthorizeUrl(request: Request, state: string): string {
  const redirectUri = githubOAuthRedirectUri(request);
  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", githubClientId());
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("scope", "read:user user:email");
  u.searchParams.set("state", state);
  return u.toString();
}

export async function exchangeGitHubOAuthCode(
  request: Request,
  code: string,
): Promise<string> {
  const redirectUri = githubOAuthRedirectUri(request);
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": GITHUB_USER_AGENT,
    },
    body: JSON.stringify({
      client_id: githubClientId(),
      client_secret: githubClientSecret(),
      code,
      redirect_uri: redirectUri,
    }),
  });
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || json.error) {
    throw new Error(
      json.error_description ?? json.error ?? "github_token_exchange_failed",
    );
  }
  if (!json.access_token) {
    throw new Error("github_token_missing");
  }
  return json.access_token;
}

type GitHubApiUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

type GitHubApiEmail = {
  email: string;
  primary?: boolean;
  verified?: boolean;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function fetchGitHubUserInput(
  accessToken: string,
): Promise<GitHubUserInput> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "User-Agent": GITHUB_USER_AGENT,
  };
  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) {
    throw new Error(`github_user_status_${userRes.status}`);
  }
  const user = (await userRes.json()) as GitHubApiUser;

  let emails: GitHubApiEmail[] = [];
  const emailsRes = await fetch("https://api.github.com/user/emails", {
    headers,
  });
  if (emailsRes.ok) {
    emails = (await emailsRes.json()) as GitHubApiEmail[];
  }

  const verifiedRaw = emails
    .filter((e) => e.verified && typeof e.email === "string" && e.email.trim())
    .map((e) => normalizeEmail(e.email));
  const verifiedEmails = [...new Set(verifiedRaw)];

  const primaryVerified = emails.find((e) => e.primary && e.verified)?.email;
  const email =
    primaryVerified != null && String(primaryVerified).trim()
      ? normalizeEmail(String(primaryVerified))
      : verifiedEmails[0] ?? null;

  return {
    id: user.id,
    login: user.login,
    email,
    verifiedEmails,
    name: user.name,
    avatarUrl: user.avatar_url,
  };
}
