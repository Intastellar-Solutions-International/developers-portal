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

function isEmailLikeDisplay(s: string, email: string): boolean {
  if (!email || !s) return false;
  return s.toLowerCase() === email.toLowerCase();
}

/** Display line for Accounts user JSON (`POST /auth/session`). Prefers `name.first` + `name.last` over top-level fields that may duplicate `email`. */
export function intastellarDisplayNameFromSessionUserJson(
  raw: Record<string, unknown>,
): string {
  const email = trimStr(raw.email);

  const name = raw.name;
  if (typeof name === "string" && trimStr(name)) return trimStr(name);
  console.log("name", name);
  if (name && typeof name === "object") {
    const n = name as Record<string, unknown>;
    const first =
      trimStr(n.first) ||
      trimStr(n.First) ||
      trimStr(n.givenName) ||
      trimStr(n.firstName) ||
      trimStr(n.given_name);
    const last =
      trimStr(n.last) ||
      trimStr(n.Last) ||
      trimStr(n.familyName) ||
      trimStr(n.lastName) ||
      trimStr(n.family_name);
    const combined = `${first} ${last}`.trim();
    console.log("combined", combined);
    if (combined) return combined;
    for (const key of [
      "displayName",
      "fullName",
      "fullname",
      "formatted",
      "name",
    ] as const) {
      const s = trimStr(n[key]);
      if (s && !isEmailLikeDisplay(s, email)) return s;
    }
  }

  const rootFirst =
    trimStr(raw.firstName) ||
    trimStr(raw.first_name) ||
    trimStr(raw.givenName) ||
    trimStr(raw.given_name) ||
    trimStr(raw.firstName) ||
    trimStr(raw.first_name);
  const rootLast =
    trimStr(raw.lastName) ||
    trimStr(raw.last_name) ||
    trimStr(raw.familyName) ||
    trimStr(raw.family_name) ||
    trimStr(raw.lastName) ||
    trimStr(raw.last_name);
  const rootCombined = `${rootFirst} ${rootLast}`.trim();
  if (rootCombined) return rootCombined;

  for (const key of [
    "displayName",
    "preferred_username",
    "nickname",
    "fullName",
    "full_name",
  ] as const) {
    const s = trimStr(raw[key]);
    if (s && !isEmailLikeDisplay(s, email)) return s;
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
