export type StatusDeployPublic = {
  commitSha: string;
  commitShort: string;
  commitRef: string | null;
  commitMessage: string | null;
  commitUrl: string | null;
};

/**
 * Vercel (and similar) inject git metadata at build/deploy. Used for “last release” on /status.
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables
 */
export function getStatusDeployPublic(): StatusDeployPublic | null {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (!sha) return null;
  const short = sha.length >= 7 ? sha.slice(0, 7) : sha;
  const ref = process.env.VERCEL_GIT_COMMIT_REF?.trim() || null;
  const msgRaw = process.env.VERCEL_GIT_COMMIT_MESSAGE?.trim();
  const commitMessage = msgRaw || null;
  const slug = process.env.VERCEL_GIT_REPO_SLUG?.trim();
  let commitUrl: string | null = null;
  if (slug && /^[\w.-]+\/[\w.-]+$/.test(slug)) {
    commitUrl = `https://github.com/${slug}/commit/${sha}`;
  }
  return {
    commitSha: sha,
    commitShort: short,
    commitRef: ref,
    commitMessage,
    commitUrl,
  };
}
