/** Widen translated leaves to `string` so locale files can supply different copy. */
type DeepStringTree<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? DeepStringTree<T[K]>
      : T[K];
};

/** English UI strings — structure mirrored in `de.ts`, `da.ts`, `fr.ts`, `nl.ts`, and `pt-br.ts`. */
export const en = {
  meta: {
    homeTitle: "inta.dev · Intastellar Developers",
    homeDescription:
      "Documentation, API keys, and integration guides for Intastellar Consents and Intastellar Accounts on inta.dev.",
  },
  seo: {
    searchTitle: "Search · inta.dev",
    searchDescription: "Search Intastellar developer documentation.",
    changelogTitle: "Changelog · inta.dev",
    changelogDescription:
      "Version history for Intastellar Consents (GitHub) and Intastellar Sign-In (npm + GitHub).",
    legalIndexTitle: "Legal · inta.dev",
    legalIndexDescription:
      "Legal information for inta.dev: privacy, terms, and links to Intastellar Solutions policies and DPA.",
    legalPrivacyTitle: "Privacy policy · inta.dev",
    legalPrivacyDescription:
      "How inta.dev handles personal data, cookies, Google Tag Manager, Intastellar Consents, and sign-in.",
    legalTermsTitle: "Terms of use · inta.dev",
    legalTermsDescription:
      "Terms of use for the inta.dev developer portal, documentation, and account features.",
    accountLoginTitle: "Sign in · inta.dev",
    notFoundTitle: "Page not found · inta.dev",
    notFoundDescription: "This page does not exist on inta.dev.",
  },
  lang: {
    label: "Language",
    en: "English",
    de: "Deutsch",
    da: "Dansk",
    fr: "Français",
    nl: "Nederlands",
    "pt-br": "Português (Brasil)",
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
  docs: {
    breadcrumbDocumentation: "Documentation",
    hubMetaTitleCore: "Documentation",
    hubMetaDescription:
      "Documentation for Intastellar developer products: Intastellar Consents, accounts sign-in, and APIs.",
    hubEyebrow: "Intastellar developers",
    hubHeading: "Documentation",
    hubLead:
      "Guides for cookie consent and web sign-in with Intastellar Accounts — plus API keys and patterns you can reuse across sites and backends.",
    hubVersionNote:
      "Doc URLs include a version segment (e.g. /v1/) so we can publish new major guides without breaking bookmarks.",
    hubSearchDocs: "Search docs",
    hubChangelog: "Changelog",
    hubApiKeys: "API keys",
    popularGuides: "Popular guides",
    popularGuidesHint: "Jump straight into common integration paths.",
    allProducts: "All products",
    allProductsHint:
      "Full table of contents, versions, and cross-links inside each space.",
    sidebarOverview: "Overview",
    sidebarAccounts: "Sign in (Web)",
    sidebarJavascript: "JavaScript",
    sidebarWordpress: "WordPress",
    sidebarIntegrations: "Integrations",
    sidebarMore: "More",
    relatedHeading: "Related",
    relatedAccountsSignIn: "Accounts — Sign in (Web)",
    ql1Label: "Consents — JavaScript",
    ql1Hint: "Snippet, window.INTA, first deploy",
    ql2Label: "Consents — WordPress",
    ql2Hint: "Plugin install and config",
    ql3Label: "Accounts — React & plain JS",
    ql3Hint: "SDK on npm, HTML/JS on inta.dev, placeholder examples",
    ql4Label: "Accounts — Plain HTML / CSS / JS",
    ql4Hint: "Static sites, no framework — migrated js-docs",
    ql5Label: "Accounts — Get started",
    ql5Hint: "Register client, SDK vs manual OAuth, flows",
    ql6Label: "Accounts — Auth code flow",
    ql6Hint: "PKCE, callback, token exchange",
    docPageFallbackDescription:
      "{{title}} — Intastellar developer documentation on inta.dev.",
  },
  search: {
    inputAria: "Search documentation",
    placeholder: "Search docs…",
    noIndexRun: "No search index found. Run",
    noIndexOr: "(or",
    noIndexRestart: ") and restart the dev server.",
    noResults: "No results. Try a shorter term or check spelling.",
    title: "Search documentation",
    overlayHelp:
      "Esc to close · ⌘K / Ctrl+K from the page · Arrow keys and Enter to open a result",
    pageIntro:
      "Filter by title, product slug, and page content. Keyboard: ⌘K / Ctrl+K opens the search overlay. With the overlay open, use arrow keys and Enter to choose a result.",
  },
  profile: {
    metaTitle: "Profile · inta.dev",
    heading: "Profile",
    loading: "Loading session…",
    ssoBefore: "Connect Intastellar SSO by setting",
    ssoAfter: "in your environment.",
    seeSignInBefore: "See the",
    seeSignInAfter: "page for details.",
    signedOut:
      "You are signed out. Sign in with your Intastellar account to see your profile here.",
    signInWithIntastellar: "Sign in with Intastellar",
    openSignInPage: "Open sign-in page",
  },
  account: {
    layoutTitle: "Account",
    layoutDescription:
      "Intastellar SSO profile and developer API keys.",
  },
  apiKeys: {
    metaTitle: "API keys · inta.dev",
    heading: "API keys",
    loading: "Loading…",
    setSsoBefore: "Set",
    setSsoAfterCode: "",
    setSsoAfter: "to enable sign-in, then configure MongoDB below.",
    signInToManageAfter:
      "with Intastellar to create and revoke keys. Keys are tied to your account email.",
    mongoBeforeUri: "Add",
    mongoAfterUri:
      "(Atlas connection string) to your server environment. Optional:",
    mongoBeforeDb: "(",
    mongoDefaultWord: "default",
    mongoAfterDb: "),",
    mongoAfterPepper:
      "(required in production — hashing and encrypted-at-rest reveal in this portal).",
    sessionSyncing: "Syncing your session with the server…",
    sessionHardFailP1:
      "Signed in in the app, but the API keys request still has no portal session cookie. Common causes: stale loader cache,",
    sessionHardFailVs: "vs",
    sessionHardFailP2: ", or missing",
    sessionHardFailP3:
      "in production (the signed session cookie cannot be created).",
    sessionHardFailBulletRefresh:
      "Hard-refresh this page (full reload), or open API keys in a new tab.",
    sessionHardFailBulletHostOpen: "Use one host only for dev (",
    sessionHardFailBulletHostClose: ").",
    sessionHardFailBulletSecretBefore: "Set",
    sessionHardFailBulletSecretAfter: "in production.",
    signInAgain: "Sign in again",
    sessionAligning:
      "Aligning server session with your account… If this persists, reload the page.",
    sessionVerifyBefore:
      "The server could not verify your session cookie. Try refreshing this page after sign-in, or",
    sessionVerifyLink: "sign out and sign in again",
    sessionVerifyAfter: ".",
    newKeyBanner:
      "Key created. The full secret is in the table below — use {{copyKey}} there. You can hide it with the eye icon; open the eye anytime while signed in to reveal and copy again (we keep an encrypted copy server-side).",
    dismiss: "Dismiss",
    optionalHintBeforeHttps:
      "Optional Sign-in domain and logo URL are used with Intastellar Sign-In (hostname we store; logo must be ",
    optionalHintAfterHttps: ").",
    labelField: "Label",
    requiredMark: "*",
    placeholderLabel: "e.g. Production website",
    signInDomain: "Sign-in domain",
    logoUrl: "Logo URL",
    placeholderDomain: "app.example.com",
    placeholderLogo: "https://cdn.example.com/logo.svg",
    createKey: "Create key",
    busyEllipsis: "…",
    emptyList:
      "No keys yet. Create one to get a secret for your servers or tooling. We store a hash for validation and an encrypted copy so you can reveal and copy it later from this page.",
    colLabel: "Label",
    colKey: "Key",
    colSignInDomain: "Sign-in domain",
    colLogo: "Logo",
    colCreated: "Created",
    colActions: "Actions",
    copyKey: "Copy key",
    copied: "Copied",
    copyFailed: "Copy failed",
    logoUnloaded: "Unloaded",
    hideKey: "Hide key",
    revealKey: "Reveal key to copy",
    revealLoading: "Loading…",
    noSecretStored:
      "No encrypted secret on file (usually an older key). Create a new key to enable reveal and copy later.",
    openSignInRow: "Sign-in",
    closeEditor: "Close",
    revoke: "Revoke",
    editSignInTitle: "Intastellar Sign-In — domain & logo for this key",
    logoUrlHttps: "Logo URL (https)",
    placeholderLogoShort: "https://…",
    saveSignInSettings: "Save sign-in settings",
    cancel: "Cancel",
    errors: {
      signInAgain: "Sign in again to manage API keys.",
      dbNotConfiguredOnServer: "Database is not configured on the server.",
      unknownAction: "Unknown action.",
      dbNotConfigured: "Database is not configured.",
      enterLabel: "Enter a label for this key.",
      domainInvalidCreate:
        "Sign-in domain looks invalid. Use a hostname such as app.example.com (you may paste a full https URL — we store the host only).",
      logoInvalidCreateImage:
        "Sign-in logo must be a valid https:// image URL (or leave it blank).",
      pepperMissing:
        "Server misconfiguration: set API_KEY_PEPPER (long random secret) in production.",
      invalidKeyId: "Invalid key id.",
      keyNotFound: "Key not found or already revoked.",
      noEncryptedOnFile:
        "This key has no encrypted secret on file (usually created before reveal support). Create a new key to use reveal and copy later.",
      decryptFailed:
        "Could not decrypt this key (server secret may have changed). Create a new key.",
      domainInvalidUpdate:
        "Sign-in domain looks invalid. Use a hostname such as app.example.com.",
      logoInvalidUpdateUrl:
        "Sign-in logo must be a valid https:// URL or left blank.",
    },
  },
  status: {
    metaTitle: "System status · inta.dev",
    metaDescription:
      "Uptime checks for Intastellar public endpoints (Consents, CDN, inta.dev).",
    heading: "System status",
    introBeforeLink:
      "Automated HTTP checks from inta.dev. Machine-readable snapshot:",
    introAfterLink: ".",
    ariaUptimeStored: "Uptime from stored scheduled checks",
    uptimeWord: "uptime",
    uptimeStoredRunsBefore:
      "We run these checks automatically on a schedule. In the last",
    uptimeStoredRunsMid: "runs,",
    uptimeStoredRunsAfter:
      "finished with every service responding normally (no failures in that run).",
    devLiveProbeBefore: "Development mode: showing a",
    devLiveProbeStrong: "live",
    devLiveProbeAfter:
      "probe (not saved). Production uses the last snapshot written by the cron job.",
    ariaUptimeDev: "Uptime from development-only check",
    onThisPageLoad: "on this page load",
    devUptimeNote:
      "Development mode — not averaged over stored history. Production shows uptime from scheduled cron runs.",
    uptimePending:
      "Uptime percentage will show here after the status cron has written at least one row to history (timelines use the same store).",
    noSnapshotCron:
      "No snapshot yet. Trigger the cron route once (see Vercel Cron) or wait for the next scheduled run.",
    noSnapshotMongo:
      "MongoDB is not configured — snapshots are not stored. In development, this page runs checks on each load; set MONGODB_URI and CRON_SECRET on Vercel for production monitoring.",
    allChecksPassing: "All checks passing",
    someChecksFailing: "Some checks failing",
    updated: "Updated",
    storedUtc: " (stored, UTC)",
    utcOnly: " (UTC)",
    httpStatus: "HTTP {{code}}",
    noResponse: "No response",
    footnoteAria:
      "Technical details for people who operate this status page",
    footnoteTitle: "Footnote — hosting and configuration",
    footnoteP1Before: "This page is public. The details below are for",
    footnoteP1Strong: "teams that deploy inta.dev",
    footnoteP1After: "(environment variables, data retention).",
    footnoteP2a: "Configure targets with",
    footnoteP2b: "(full replace) or",
    footnoteP2c:
      "(append). A check counts as passing when the HTTP status is below 500. The incident log shows stored cron runs where any target failed, including probe error text when saved. Timelines, the incident log, and latency trends use the last",
    footnoteP2d:
      "runs (14-day TTL in Mongo). The headline uptime percentage uses the same window: the fraction of those runs where every target passed. Times on this page are UTC. New history rows store per-target",
    footnoteP2e:
      "; older rows still drive up/down segments until they expire.",
    incidentHeading: "Incident log",
    incidentEmptyBody:
      "An incident is a stored cron run where at least one target was down (HTTP 5xx, timeout, or no response — same rules as the live checks). If everything in recent history passed, this list stays empty.",
    incidentListIntro:
      "Each row is one cron run where at least one check failed (newest first). Times are UTC. Messages come from the probe when available; older history rows may only show a generic reason.",
    degraded: "Degraded",
    timelineNoHistory:
      "No history yet. After MongoDB and cron store runs, recent checks appear here.",
    timelineCurrentCheckDev: "Current check only (dev)",
    timelineRecentChecks: "Recent checks ({{count}})",
    timelineAriaSummary: "{{n}} checks: {{ups}} up, {{fails}} down",
    timelineTooltipUp: "{{time}} — Up",
    timelineTooltipDown: "{{time}} — Down",
    latencyNeedsTwoRuns:
      "Response-time trend needs at least two stored runs with latency (after the next cron writes latencyMs).",
    latencyResponseTime: "Response time ({{label}})",
    latencyAriaTrend:
      "Latency trend for {{label}}: {{min}}–{{max}} ms over {{n}} checks",
    latencyMin: "Min",
    latencyMax: "Max",
    latencyLatest: "Latest",
    badgeMainUptime: "{{percent}} uptime",
    badgeSubOk:
      "{{passedRuns}}/{{totalRuns}} runs all OK · up to {{windowMaxRuns}} in view",
    badgePlaceholder: "Uptime",
    badgeCollecting: "Collecting scheduled checks…",
    badgeLink: "System status →",
    badgeLogoAlt: "Intastellar Consents",
    badgePoweredBy: "Powered by inta.dev",
    uptimeJsonWidgetDescription:
      "In the last {{totalRuns}} scheduled runs, {{passedRuns}} finished with every service responding normally.",
    uptimeJsonNoHistoryDescription:
      "Uptime will appear here after scheduled health checks have been stored.",
    embedBadgeButton: "Embed badge",
    embedModalTitle: "Embed uptime badge",
    embedModalIntro:
      "Copy an iframe snippet or the JSON API URL. Language matches this page; change ?locale= (en, de, da, fr, nl, pt-br) or add ?theme=light / ?theme=dark to pin light or dark styling — omit theme (or use theme=auto) to follow the visitor’s system setting.",
    embedPreviewHeading: "Preview",
    embedThemeLabel: "Badge appearance",
    embedIframeHeading: "iframe embed",
    embedIframeTitle: "Uptime badge",
    embedJsonHeading: "JSON API",
    embedJsonHint:
      "Use this URL in fetch() or curl — it returns widgetTitle, widgetDescription, statusPageUrl, and badgeEmbedUrl.",
    embedCopy: "Copy",
    embedCopied: "Copied",
    embedModalClose: "Close",
    embedOpenOnSite: "Open this page on your site to generate URLs.",
  },
} as const;

export type MessageTree = DeepStringTree<typeof en>;
