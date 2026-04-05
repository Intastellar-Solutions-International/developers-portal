/**
 * Mirrors `@intastellar/signin-sdk-react` cookie domain logic so we can expire
 * cookies the same way they were set (the SDK clears with `domain=.` prefix only,
 * which may not match `domain=` without the dot).
 */
function intastellarCookieHostDomain(): string {
  if (typeof window === "undefined") return "";
  let domain = window.location.hostname || "";
  const domainParts = domain.split(".");
  if (domainParts.length > 2) {
    domainParts.shift();
  }
  if (Number.isNaN(Number(domainParts[0]))) {
    domain = domainParts.join(".");
  }
  return domain.split(":")[0];
}

const INTA_COOKIE_NAMES = ["inta_acc", "inta_state"] as const;

/**
 * Deletion must match how the cookie was set. The SDK sets `inta_acc` without
 * `Secure`; only using `; Secure` on expire can fail to remove it on HTTPS.
 */
function cookieSecureSuffixes(): string[] {
  if (typeof window === "undefined") return [""];
  if (window.location.protocol === "https:") {
    return ["", "; Secure"];
  }
  return [""];
}

/** Expire Intastellar SSO cookies on this site (all common domain/path variants). */
export function clearIntastellarBrowserSession(): void {
  if (typeof document === "undefined") return;

  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";

  for (const name of INTA_COOKIE_NAMES) {
    for (const sec of cookieSecureSuffixes()) {
      document.cookie = `${name}=; ${expire}; path=/${sec}`;
      const d = intastellarCookieHostDomain();
      if (d) {
        document.cookie = `${name}=; ${expire}; path=/; domain=${d}${sec}`;
        document.cookie = `${name}=; ${expire}; path=/; domain=.${d}${sec}`;
      }
    }
  }

  if (typeof window !== "undefined" && "intastellarCleanup" in window) {
    const cleanup = (window as unknown as { intastellarCleanup?: () => void })
      .intastellarCleanup;
    try {
      cleanup?.();
    } catch {
      /* ignore */
    }
    delete (window as unknown as { intastellarCleanup?: () => void })
      .intastellarCleanup;
  }
}
