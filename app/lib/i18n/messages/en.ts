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
      "Documentation, API keys, and integration guides on inta.dev for Intastellar Consents and Intastellar Accounts — both products of Intastellar Solutions International.",
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
      "Documentation, API keys, and integration guides for Intastellar Consents and Intastellar Accounts — both products of Intastellar Solutions International.",
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
  intaTryout: {
    introBeforePrivacy:
      "Edit the JSON below to change window.INTA. The preview reloads when the JSON is valid. Policy URLs default to this site's ",
    privacyPage: "privacy page",
    introAfterPrivacy:
      ". Preview uses same-origin localStorage as these docs.",
    minimumSetupTitle: "Minimum setup",
    minimumSetupLeadBeforeRoot: "You only need a valid policy URL, ",
    minimumSetupLeadBetweenRootCompany: ", ",
    minimumSetupLeadBeforeUc: ", and the ",
    minimumSetupLeadAfterUc:
      " tag. Everything else is optional branding or integrations.",
    copyMinimumSnippet: "Copy minimum snippet",
    whatNextTitle: "What happens next",
    whatNextStep1:
      "You paste the two script tags high in <head>, before analytics or marketing tags.",
    whatNextStep2:
      "uc.js reads window.INTA and shows the banner if the policy URL responds.",
    whatNextStep3:
      "The visitor accepts, rejects, or changes granular choices; the CMP stores the decision (cookies / storage per your domain).",
    whatNextStep4:
      "On consent changes, cookie_consent_update is pushed to dataLayer for GTM — watch it in the console below.",
    whatNextStep5Before: "Wire GTM / vendor tags to those signals (see ",
    whatNextStep5Between: ", ",
    whatNextStep5After: ").",
    docLinkQuickstart: "Quickstart",
    docLinkEventsApi: "Events and API",
    editorLabel: "window.INTA (JSON)",
    format: "Format",
    reset: "Reset",
    copyHtmlSnippet: "Copy HTML snippet",
    copied: "Copied",
    jsonErrorPrefix: "JSON: ",
    fieldReferenceTitle: "Field reference",
    fieldReferenceAria: "Field reference",
    fieldHints: {
      policy_link:
        "Public HTTPS URL of your privacy policy. Broken or placeholder URLs usually prevent the banner from showing.",
      settingsPrivacyPolicy:
        "Alternate policy URL some builds read; keep in sync with policy_link when both are set.",
      settingsRootDomain:
        "Registrable domain for cookies (e.g. example.com). Must match the site visitors use.",
      settingsCompany: "Name shown in the consent UI.",
      settingsColor: "Primary accent colour (CSS hex or token).",
      settingsLogo: "Absolute URL to a logo image; omit or empty if none.",
      settingsDesign: "Layout preset (e.g. overlay).",
      settingsArrange: "ltr or rtl for layout direction.",
      settingsGtagId:
        "GA4 / Google tag ID when you want Consent Mode wired from the CMP; omit until you use Google tags.",
      settingsRequiredCookies: "Names of strictly necessary cookies your site sets.",
      settingsKeepInLocalStorage:
        "localStorage keys the CMP should not wipe on consent changes.",
    },
    fullSchema: "Full schema",
    fullSchemaExtra: "allows extra keys.",
    pasteFooterBefore:
      "Paste the copied snippet in <head> before other tracking scripts. ",
    pasteFooterAfter: " has placement rules.",
    quickstartLink: "Quickstart",
    debugConsoleTitle: "Event / debug console",
    clear: "Clear",
    debugEmpty:
      "dataLayer pushes, preview messages, and forwarded console output from the iframe appear here. Interact with the banner to see ",
    debugEmptyCode: "cookie_consent_update",
    debugEmptyAfter: ".",
    bannerPreview: "Banner preview",
    wideFrameHint:
      "Wide desktop frame (1280px) — scroll horizontally if the panel is narrower.",
    iframeDocumentTitle: "Banner preview",
    iframePreviewHint:
      "Live preview — the real CMP script from our CDN runs here. This frame is same-origin as the docs app so localStorage works; consent keys may appear in this site's storage until you clear them.",
    previewUpdated: "Preview HTML updated — iframe will reload.",
    fixJsonPreview: "Fix the JSON to load the preview.",
    loadingPreview: "Loading preview…",
    configMustBeObject:
      "Configuration must be a JSON object (not an array or primitive).",
    iframeBannerPreviewTitle: "Intastellar Consents banner preview",
    dataLayer: "dataLayer",
    dataLayerConsent: "dataLayer (cookie_consent_update)",
    windowError: "window.error",
    preview: "preview",
    demoCompany: "Acme Demo",
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
    saveToProfile: "Save to profile",
    removeFromProfile: "Remove from profile",
    saveToProfileHint:
      "Sign in with a portal session (same account as API keys) to bookmark this page on your profile.",
    onYourProfile: "This page is on your saved list in Account → Profile.",
    saveLoginModalTitle: "Save this page to your profile",
    saveLoginModalClose: "Close",
    saveLoginModalSignInPopup: "Sign in with Intastellar",
    saveLoginModalSignInGitHub: "Continue with GitHub",
    saveLoginModalOpenLoginPage: "Open sign-in page",
    saveLoginModalOpenProfile: "Open account profile",
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
    intro:
      "Your developer identity comes from Intastellar Accounts. Use API keys for server credentials, and save documentation pages here for quick access while you build.",
    manageAccount: "Manage your Intastellar account",
    savedDocsHeading: "Saved documentation",
    savedDocsEmpty:
      "No pages saved yet. Open any guide and use “Save to profile” at the bottom of the page.",
    savedDocsRemove: "Remove",
    savedDocsMongoOff:
      "Saved documentation requires MongoDB on this server. Your session still works for sign-in.",
    savedDocsNeedAccount:
      "Complete a full sign-in so the portal can link your account (visit API keys or reload after signing in) to enable saved docs.",
    savedDocsErrorGeneric: "Could not update saved documentation. Try again.",
    savedDocsErrorInvalid: "That documentation link is not valid.",
    linkGitHubHeading: "GitHub sign-in",
    linkGitHubDescription:
      "Link your GitHub account so you can sign in with GitHub later. Your GitHub profile must show a verified email that matches this portal account (same as Intastellar).",
    linkGitHubButton: "Link GitHub account",
    githubLinkedBadge: "GitHub linked as @{{login}}",
    githubLinkedNotice: "GitHub is now linked to this account.",
    linkGitHubErrorEmailMismatch:
      "GitHub’s verified email did not match this account. Use the same verified email on GitHub as on your Intastellar account.",
    linkGitHubErrorNoVerifiedEmail:
      "GitHub did not return a verified email. Make sure a public email is set or grant the user:email scope.",
    linkGitHubErrorGithubTaken:
      "This GitHub account is already linked to another portal user.",
    linkGitHubErrorNotFound: "Portal account was not found.",
    linkGitHubErrorSessionMismatch:
      "Your session changed during linking. Close other tabs and try again.",
    linkGitHubErrorInvalid: "Invalid link request. Try again from your profile.",
    linkGitHubErrorRequiresMongo:
      "Linking GitHub requires MongoDB on this server.",
  },
  account: {
    layoutTitle: "Account",
    layoutDescription:
      "Intastellar SSO profile and developer API keys.",
    loginGitHubSignIn: "Continue with GitHub",
    loginGitHubHint:
      "Same portal account and saved docs as Intastellar after you authorize on GitHub.",
    loginGitHubErrorDisabled:
      "GitHub sign-in is not configured on this server.",
    loginGitHubErrorDenied: "GitHub authorization was cancelled.",
    loginGitHubErrorState: "Sign-in state did not match. Try again.",
    loginGitHubErrorToken: "Could not complete GitHub sign-in. Try again.",
    loginGitHubErrorUser: "Could not load your GitHub profile. Try again.",
    loginGitHubErrorUnknown: "GitHub sign-in failed. Try again.",
    loginGitHubErrorLinkRequiresLogin:
      "Sign in to the portal first, then link GitHub from your profile.",
    loginGitHubErrorLinkRequiresMongo:
      "Linking GitHub requires MongoDB on this server.",
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
      "We run these checks automatically on a schedule. Over the last {{window}} (UTC), we stored",
    uptimeStoredRunsMid: "runs, and",
    uptimeStoredRunsAfter:
      "were fully up: every service responded normally in that run, with no active operator notice or scheduled maintenance applying at that moment.",
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
      "(append). A check counts as passing when the HTTP status is below 500. The incident log shows stored cron runs where any target failed in that window, including probe error text when saved.",
    footnoteP2d:
      "Timelines, the incident log, and latency trends use the same rolling store: the last {{hours}} hours (UTC), up to {{maxRows}} samples per request (14-day TTL in Mongo). The headline uptime percentage uses the same window: runs count as up only when every target passed and the run time is outside operator notices and maintenance windows that apply (global or to those targets). Tune with STATUS_HISTORY_WINDOW_HOURS and STATUS_HISTORY_MAX_ROWS. Times on this page are UTC. New history rows store per-target",
    footnoteP2e:
      "; older rows still drive up/down segments until they expire.",
    incidentHeading: "Incident log",
    incidentEmptyBody:
      "An incident is a stored cron run where at least one target was down (HTTP 5xx, timeout, or no response — same rules as the live checks). If everything in recent history passed, this list stays empty.",
    incidentListIntro:
      "Grouped by monitor. For each target, consecutive failed runs with the same probe message are merged into one row with a UTC time window (newest groups first), within the same rolling window as timelines and uptime. Messages come from the probe when available; older history rows may only show a generic reason.",
    degraded: "Degraded",
    timelineNoHistory:
      "No history yet. After MongoDB and cron store runs, recent checks appear here.",
    timelineCurrentCheckDev: "Current check only (dev)",
    timelineRecentChecks:
      "Recent checks — last {{window}} ({{count}} samples)",
    timelineAriaSummary:
      "{{n}} checks: {{clear}} all clear, {{flagged}} with downtime, notice, or maintenance",
    timelineTooltipUp: "{{time}} — Up",
    timelineTooltipDown: "{{time}} — Down",
    timelineTooltipNotice: "{{time}} — Operator notice",
    timelineTooltipMaintenance: "{{time}} — Scheduled maintenance",
    timelineIssueListIntro: "Not fully clear (UTC)",
    timelineIssueLabelDown: "Failed check",
    timelineIssueLabelNotice: "Operator notice",
    timelineIssueLabelMaintenance: "Scheduled maintenance",
    timelineIssueMore: "+ {{n}} more…",
    latencyNeedsTwoRuns:
      "Response-time trend needs at least two stored runs with latency (after the next cron writes latencyMs).",
    latencyResponseTime: "Response time ({{label}})",
    latencyAriaTrend:
      "Latency trend for {{label}}: {{min}}–{{max}} ms over {{n}} checks",
    latencyMin: "Min",
    latencyMax: "Max",
    latencyLatest: "Latest",
    latencyByRegionCaption: "Response time by probe location",
    latencyDefaultRegionLabel: "This probe",
    badgeMainUptime:
      "Service reliability: {{percent}} uptime (last {{window}})",
    badgeSubMonitored:
      "Continuously monitored across global endpoints",
    badgePlaceholder: "Service reliability",
    badgeCollecting: "Collecting scheduled checks…",
    badgeLink: "View live status →",
    badgeLogoAlt: "Intastellar Consents",
    badgePoweredBy: "Powered by inta.dev",
    uptimeJsonWidgetDescription:
      "In the last {{hours}} hours we stored {{totalRuns}} scheduled runs; {{passedRuns}} count as fully up (all probes OK, no applying operator notice or maintenance at that time).",
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
    maintenanceHeading: "Scheduled maintenance",
    maintenanceEmpty:
      "No in-progress or upcoming maintenance windows are published right now.",
    maintenanceActiveBadge: "In progress",
    maintenanceUpcomingBadge: "Upcoming",
    maintenanceRange: "{{start}} → {{end}}",
    deployHeading: "Last deploy",
    deployUnavailable:
      "Latest commit is loaded from the Intastellar Consents GitHub repository (not this site’s deploy). This stays empty if the GitHub API is unreachable or rate-limited — set GITHUB_TOKEN for higher limits.",
    deployCommit: "Commit",
    deployBranch: "Branch",
    deployMessage: "Message",
    deployViewCommit: "View commit on GitHub",
    trustHeading: "How we measure uptime",
    trustIntro: "Short notes so you know what this page represents.",
    trustBulletSynthetic:
      "Synthetic checks: automated HTTP requests from our hosting provider to each public URL below — not real-user (RUM) monitoring.",
    trustBulletFrequency:
      "Schedule: production runs about once per minute (your project’s cron configuration).",
    trustBulletPass:
      "A check passes when the HTTP status is below 500; timeouts and network errors count as failed.",
    trustBulletHistory:
      "Timelines, incident log, latency trends, and the headline uptime percentage use stored checks from the last {{hours}} hours (UTC), up to {{maxRows}} samples per load (MongoDB TTL about 14 days). The headline figure also treats active operator notices and scheduled maintenance (when they apply) like downtime for that run.",
    trustBulletUtc: "All times on this page are UTC.",
    manualNoticesHeading: "Operator notices",
    manualNoticesIntro:
      "Updates posted by the team when we communicate an issue or follow-up (separate from automated probe history below).",
    manualPostedBy: "Posted by {{email}}",
    manualResolvedPrefix: "Resolved",
    manualSeverityInvestigating: "Investigating",
    manualSeverityIdentified: "Identified",
    manualSeverityMonitoring: "Monitoring",
    manualSeverityResolved: "Resolved",
    manualUpdateMeta: "Update · {{atLabel}} · {{email}}",
    manualUpdatesHeading: "Updates",
    affectedMonitorsLabel: "Monitors",
    subscribeRss: "Subscribe (RSS)",
    subscribeRssTitle: "RSS feed of operator notices and scheduled maintenance",
    subscribeSectionHeading: "Subscribe to updates",
    subscribeSectionIntro:
      "Choose which kinds of updates you want. RSS readers fetch new items from the feed URL; email sends when we publish a matching maintenance window or operator notice.",
    subscribeTopicsLabel: "Include",
    subscribeTopicMaintenance: "Scheduled maintenance",
    subscribeTopicIncidents: "Operator notices & monitoring alerts",
    subscribePickTopicsError: "Select at least one update type.",
    subscribeRssUrlHelp: "RSS (paste into your reader or copy the URL)",
    subscribeOpenRss: "Open RSS feed",
    subscribeCopyFeedUrl: "Copy feed URL",
    subscribeCopied: "Copied",
    subscribeEmailHelp: "Email",
    subscribeEmailCheckbox: "Send alerts to my email (double opt-in)",
    subscribeEmailUnavailable:
      "Email alerts require MongoDB and Resend (set RESEND_API_KEY and STATUS_NOTIFY_FROM). RSS above still works.",
    subscribeEmailInputLabel: "Email address",
    subscribeEmailPlaceholder: "you@example.com",
    subscribeEmailSubmit: "Request email alerts",
    subscribeEmailVerifySent:
      "Check your inbox and click the confirmation link to finish subscribing.",
    subscribeEmailUpdated: "Your email alert preferences were updated.",
    subscribeEmailErrorGeneric: "Something went wrong. Please try again.",
    notifyFlashVerified: "Your email subscription is confirmed.",
    notifyFlashUnsubscribed: "You are unsubscribed from status emails.",
    notifyFlashVerifyMissing: "Confirmation link is missing a token.",
    notifyFlashVerifyInvalid: "This confirmation link is invalid or already used.",
    notifyFlashUnsubMissing: "Unsubscribe link is missing a token.",
    notifyFlashUnsubInvalid: "This unsubscribe link is invalid.",
  },
} as const;

export type MessageTree = DeepStringTree<typeof en>;
