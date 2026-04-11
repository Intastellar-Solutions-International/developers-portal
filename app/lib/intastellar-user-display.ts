/**
 * Minimal user shape for UI copy (avoids importing the SDK in route modules — helps Vite HMR).
 */
export type IntastellarUserLike = {
  email: string;
  image?: string;
  name?: unknown;
};

function trimStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Human-readable display name from Intastellar Accounts / `POST /auth/session` user JSON.
 * Handles `name` as string, `{ first, last }`, OIDC-style `given_name` / `family_name`, and
 * common top-level fields the API may return instead of `first` / `last`.
 */
export function intastellarDisplayNameFromSessionUserJson(
  raw: Record<string, unknown>,
): string {
  const email = trimStr(raw.email);

  for (const key of ["displayName", "preferred_username", "nickname"] as const) {
    const s = trimStr(raw[key]);
    if (s) return s;
  }

  const name = raw.name;
  if (typeof name === "string" && trimStr(name)) return trimStr(name);

  if (name && typeof name === "object") {
    const n = name as Record<string, unknown>;
    const first =
      trimStr(n.first) ||
      trimStr(n.givenName) ||
      trimStr(n.given_name);
    const last =
      trimStr(n.last) ||
      trimStr(n.familyName) ||
      trimStr(n.family_name);
    const combined = `${first} ${last}`.trim();
    if (combined) return combined;
    for (const key of [
      "displayName",
      "fullName",
      "fullname",
      "formatted",
      "name",
    ] as const) {
      const s = trimStr(n[key]);
      if (s) return s;
    }
  }

  return email;
}

export function intastellarUserDisplayLine(user: IntastellarUserLike): string {
  const rec = user as Record<string, unknown>;
  return intastellarDisplayNameFromSessionUserJson({
    ...rec,
    email: user.email,
    name: user.name,
  });
}
