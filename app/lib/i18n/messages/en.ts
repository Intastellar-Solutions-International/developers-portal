/** Widen translated leaves to `string` so `de` / `da` can supply different copy. */
type DeepStringTree<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? DeepStringTree<T[K]>
      : T[K];
};

/** English UI strings — structure mirrored in `de.ts` and `da.ts`. */
export const en = {
  meta: {
    homeTitle: "inta.dev · Intastellar Developers",
    homeDescription:
      "Documentation, API keys, and integration guides for Intastellar Consents and Intastellar Accounts on inta.dev.",
  },
  lang: {
    label: "Language",
    en: "English",
    de: "Deutsch",
    da: "Dansk",
  },
  nav: {
    docs: "Docs",
    apiKeys: "API keys",
    signIn: "Sign in",
    signOut: "Sign out",
    signingIn: "Signing in…",
    searchAria: "Search documentation",
    searchTitle: "Search (⌘K)",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    siteMenu: "Site menu",
    menu: "Menu",
    main: "Main",
    mainNav: "Main navigation",
    colorTheme: "Color theme",
    intastellarSolutions: "Intastellar Solutions",
    intastellarSolutionsTitle: "Intastellar Solutions (opens in new tab)",
    opensNewTab: "(opens in new tab)",
    logoHomeTitle: "Intastellar Developers — home",
    changelog: "Changelog",
    changelogTitle: "Consents & Sign-In — npm and GitHub releases",
    documentation: "Documentation",
    intastellarConsents: "Intastellar Consents",
    profile: "Profile",
  },
  footer: {
    tagline:
      "Documentation, API keys, and integration guides for Intastellar Consents and Intastellar Accounts.",
    documentation: "Documentation",
    allDocs: "All docs",
    intastellarConsents: "Intastellar Consents",
    accountsSignIn: "Accounts — Sign in",
    searchDocs: "Search docs",
    platform: "Platform",
    home: "Home",
    changelog: "Changelog",
    signIn: "Sign in",
    apiKeys: "API keys",
    legal: "Legal",
    legalOverview: "Legal overview",
    privacy: "Privacy (inta.dev)",
    terms: "Terms (inta.dev)",
    dpaCorporate: "DPA (corporate)",
    intastellar: "Intastellar",
    intastellarSolutions: "Intastellar Solutions",
    cookieConsentsProduct: "Cookie consents product",
    copyright: "© {{year}} Intastellar Solutions. All rights reserved.",
    statusOk: "System status",
    statusDegraded: "Some checks are failing",
  },
  home: {
    heroTitle: "Built with Intastellar",
    heroLead1: "Documentation, guides, and tools to ship ",
    heroLeadConsent: "GDPR-aligned consent",
    heroLead2: " and ",
    heroLeadSignin: "secure sign-in",
    heroLead3: " with the same stack Intastellar uses — all on ",
    /** Shown after `heroLead3` (brand domain). */
    heroLeadBrand: "inta.dev",
    heroLead4: ".",
    searchDocs: "Search docs",
    cardConsentsTitle: "Intastellar Consents",
    cardConsentsBody:
      "Cookie banner, CMP, and consent APIs for the web, WordPress, GTM, Shopify, and more.",
    cardConsentsCta: "Open documentation",
    cardAccountsTitle: "Intastellar Accounts",
    cardAccountsBody:
      "React SDK on inta.dev, OAuth-style flows, PKCE, sessions, and security patterns for your apps and sites.",
    cardAccountsCta: "Open documentation",
    cardAllTitle: "All docs & API keys",
    cardAllBody:
      "Browse every product guide, track releases, and manage keys for the developer portal.",
    cardAllCta: "Browse everything",
    quickConsents: "Consents — quick start",
    quickAccounts: "Accounts — quick start",
    signInPortal: "Sign in to the portal",
    bandTitle: "Move faster with search & releases",
    bandBody:
      "Jump to any page with full-text search, follow product updates on the changelog (Consents and Intastellar Sign-In), and keep API keys in one place after you sign in.",
    openSearch: "Open search",
    changelog: "Changelog",
    apiKeys: "API keys",
  },
  legacy: {
    line1Strong: "Formerly developers.intastellarsolutions.com",
    line1Mid: " — developer documentation and tools now live here on ",
    line1Brand: "inta.dev",
    line1AfterBrand: ".",
    line2Before: "The legacy site showed a ",
    badge: "Developer accounts",
    line2After:
      " focus only — no billing or paid products were offered there.",
  },
  a11y: {
    colorTheme: "Color theme",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
  },
} as const;

export type MessageTree = DeepStringTree<typeof en>;
