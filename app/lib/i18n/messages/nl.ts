import type { MessageTree } from "./en";

export const nl: MessageTree = {
  meta: {
    homeTitle: "inta.dev · Intastellar Developers",
    homeDescription:
      "Documentatie, API-sleutels en integratiegidsen op inta.dev voor Intastellar Consents en Intastellar Accounts — beide producten van Intastellar Solutions International.",
  },
  seo: {
    searchTitle: "Zoeken · inta.dev",
    searchDescription: "Zoek in de Intastellar-ontwikkelaarsdocumentatie.",
    changelogTitle: "Changelog · inta.dev",
    changelogDescription:
      "Versiegeschiedenis voor Intastellar Consents (GitHub) en Intastellar Sign-In (npm + GitHub).",
    legalIndexTitle: "Juridisch · inta.dev",
    legalIndexDescription:
      "Juridische informatie over inta.dev: privacy, voorwaarden en links naar beleid en DPA van Intastellar Solutions.",
    legalPrivacyTitle: "Privacybeleid · inta.dev",
    legalPrivacyDescription:
      "Hoe inta.dev persoonsgegevens, cookies, Google Tag Manager, Intastellar Consents en aanmelding afhandelt.",
    legalTermsTitle: "Gebruiksvoorwaarden · inta.dev",
    legalTermsDescription:
      "Gebruiksvoorwaarden voor het inta.dev-ontwikkelaarsportaal, de documentatie en accountfuncties.",
    accountLoginTitle: "Inloggen · inta.dev",
    notFoundTitle: "Pagina niet gevonden · inta.dev",
    notFoundDescription: "Deze pagina bestaat niet op inta.dev.",
  },
  lang: {
    label: "Taal",
    en: "English",
    de: "Deutsch",
    da: "Dansk",
    fr: "Français",
    nl: "Nederlands",
    "pt-br": "Portugees (Brazilië)",
  },
  nav: {
    docs: "Documentatie",
    apiKeys: "API-sleutels",
    signIn: "Inloggen",
    signOut: "Uitloggen",
    signingIn: "Bezig met inloggen…",
    searchAria: "Zoek in documentatie",
    searchTitle: "Zoeken (⌘K)",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten",
    siteMenu: "Sitemenu",
    menu: "Menu",
    main: "Hoofd",
    mainNav: "Hoofdnavigatie",
    colorTheme: "Kleurthema",
    intastellarSolutions: "Intastellar Solutions",
    intastellarSolutionsTitle: "Intastellar Solutions (opent nieuw tabblad)",
    opensNewTab: "(opent nieuw tabblad)",
    logoHomeTitle: "Intastellar Developers — start",
    changelog: "Changelog",
    changelogTitle: "Consents en Sign-In — npm- en GitHub-releases",
    documentation: "Documentatie",
    intastellarConsents: "Intastellar Consents",
    profile: "Profiel",
  },
  footer: {
    tagline:
      "Documentatie, API-sleutels en integratiegidsen voor Intastellar Consents en Intastellar Accounts — beide producten van Intastellar Solutions International.",
    documentation: "Documentatie",
    allDocs: "Alle documentatie",
    intastellarConsents: "Intastellar Consents",
    accountsSignIn: "Accounts — Inloggen",
    searchDocs: "Zoek in documentatie",
    platform: "Platform",
    home: "Home",
    changelog: "Changelog",
    signIn: "Inloggen",
    apiKeys: "API-sleutels",
    legal: "Juridisch",
    legalOverview: "Juridisch overzicht",
    privacy: "Privacy (inta.dev)",
    terms: "Voorwaarden (inta.dev)",
    dpaCorporate: "DPA (concern)",
    intastellar: "Intastellar",
    intastellarSolutions: "Intastellar Solutions",
    cookieConsentsProduct: "Cookie consent-product",
    copyright: "© {{year}} Intastellar Solutions. Alle rechten voorbehouden.",
    statusOk: "Systeemstatus",
    statusDegraded: "Sommige controles falen",
  },
  home: {
    heroTitle: "Gebouwd met Intastellar",
    heroLead1: "Documentatie, gidsen en tools om ",
    heroLeadConsent: "AVG-conforme toestemming",
    heroLead2: " en ",
    heroLeadSignin: "veilige login",
    heroLead3: " te leveren met dezelfde stack als Intastellar — alles op ",
    heroLeadBrand: "inta.dev",
    heroLead4: ".",
    searchDocs: "Zoek in documentatie",
    cardConsentsTitle: "Intastellar Consents",
    cardConsentsBody:
      "Cookiebanner, CMP en consent-API’s voor web, WordPress, GTM, Shopify en meer.",
    cardConsentsCta: "Documentatie openen",
    cardAccountsTitle: "Intastellar Accounts",
    cardAccountsBody:
      "React-SDK op inta.dev, OAuth-achtige flows, PKCE, sessies en beveiligingspatronen voor uw apps en sites.",
    cardAccountsCta: "Documentatie openen",
    cardAllTitle: "Alle documentatie en API-sleutels",
    cardAllBody:
      "Blader door productgidsen, volg releases en beheer sleutels voor het ontwikkelaarsportaal.",
    cardAllCta: "Alles bekijken",
    quickConsents: "Consents — snelstart",
    quickAccounts: "Accounts — snelstart",
    signInPortal: "Inloggen op het portaal",
    bandTitle: "Sneller werken met zoeken en releases",
    bandBody:
      "Ga naar elke pagina met full-text search, volg productupdates op de changelog (Consents en Intastellar Sign-In), en houd API-sleutels op één plek na inloggen.",
    openSearch: "Zoeken openen",
    changelog: "Changelog",
    apiKeys: "API-sleutels",
  },
  intaTryout: {
    introBeforePrivacy:
      "Bewerk de JSON hieronder om window.INTA te wijzigen. De voorbeeldweergave herlaadt zodra de JSON geldig is. Beleids-URL's verwijzen standaard naar de ",
    privacyPage: "privacy-pagina",
    introAfterPrivacy:
      " van deze site. De voorbeeldweergave gebruikt dezelfde origin en localStorage als deze documentatie.",
    minimumSetupTitle: "Minimale installatie",
    minimumSetupLeadBeforeRoot: "U heeft alleen een geldige beleids-URL nodig, ",
    minimumSetupLeadBetweenRootCompany: ", ",
    minimumSetupLeadBeforeUc: ", en de ",
    minimumSetupLeadAfterUc:
      "-tag. Verder is alles optionele branding of integraties.",
    copyMinimumSnippet: "Minimaal fragment kopiëren",
    whatNextTitle: "Wat gebeurt er daarna",
    whatNextStep1:
      "U plakt de twee scripttags hoog in <head>, vóór analyse- of marketingtags.",
    whatNextStep2:
      "uc.js leest window.INTA en toont de banner als de beleids-URL reageert.",
    whatNextStep3:
      "De bezoeker accepteert, weigert of kiest granulair; de CMP slaat de beslissing op (cookies / opslag voor uw domein).",
    whatNextStep4:
      "Bij wijzigingen van toestemming wordt cookie_consent_update naar dataLayer voor GTM gestuurd — zie het hieronder in de console.",
    whatNextStep5Before: "Koppel GTM / vendor-tags aan die signalen (zie ",
    whatNextStep5Between: ", ",
    whatNextStep5After: ").",
    docLinkQuickstart: "Snelstart",
    docLinkEventsApi: "Gebeurtenissen en API",
    editorLabel: "window.INTA (JSON)",
    format: "Formatteren",
    reset: "Herstellen",
    copyHtmlSnippet: "HTML-fragment kopiëren",
    copied: "Gekopieerd",
    jsonErrorPrefix: "JSON: ",
    fieldReferenceTitle: "Veldreferentie",
    fieldReferenceAria: "Veldreferentie",
    fieldHints: {
      policy_link:
        "Openbare HTTPS-URL van uw privacybeleid. Ongeldige of tijdelijke URL's voorkomen meestal dat de banner verschijnt.",
      settingsPrivacyPolicy:
        "Alternatieve beleids-URL die sommige builds lezen; gelijk houden met policy_link als beide zijn ingesteld.",
      settingsRootDomain:
        "Registreerbaar domein voor cookies (bijv. example.com). Moet overeenkomen met de site die bezoekers gebruiken.",
      settingsCompany: "Naam in de toestemmings-UI.",
      settingsColor: "Primaire accentkleur (CSS-hex of token).",
      settingsLogo: "Absolute URL naar logo; weglaten of leeg als er geen is.",
      settingsDesign: "Layout-voorinstelling (bijv. overlay).",
      settingsArrange: "ltr of rtl voor lay-outrichting.",
      settingsGtagId:
        "GA4 / Google-tag-ID voor Consent Mode via de CMP; weglaten tot u Google-tags gebruikt.",
      settingsRequiredCookies: "Namen van strikt noodzakelijke cookies die uw site plaatst.",
      settingsKeepInLocalStorage:
        "localStorage-sleutels die de CMP bij toestemmingswijzigingen niet mag wissen.",
    },
    fullSchema: "Volledig schema",
    fullSchemaExtra: "staat extra sleutels toe.",
    pasteFooterBefore:
      "Plak het gekopieerde fragment in <head> vóór andere tracking-scripts. ",
    pasteFooterAfter: " bevat plaatsingsregels.",
    quickstartLink: "Snelstart",
    debugConsoleTitle: "Gebeurtenis- / debugconsole",
    clear: "Wissen",
    debugEmpty:
      "dataLayer-pushes, voorbeeldberichten en doorgestuurde console-output uit de iframe verschijnen hier. Werk met de banner om ",
    debugEmptyCode: "cookie_consent_update",
    debugEmptyAfter: " te zien.",
    bannerPreview: "Bannervoorbeeld",
    wideFrameHint:
      "Brede desktopframe (1280 px) — horizontaal scrollen als het paneel smaller is.",
    iframeDocumentTitle: "Bannervoorbeeld",
    iframePreviewHint:
      "Live voorbeeld — het echte CMP-script van onze CDN draait hier. Het frame heeft dezelfde origin als de docs-app, dus localStorage werkt; toestemmingssleutels kunnen in de opslag van deze site blijven tot u ze wist.",
    previewUpdated: "Voorbeeld-HTML bijgewerkt — iframe herlaadt.",
    fixJsonPreview: "Corrigeer de JSON om het voorbeeld te laden.",
    loadingPreview: "Voorbeeld laden…",
    configMustBeObject:
      "De configuratie moet een JSON-object zijn (geen array of primitief).",
    iframeBannerPreviewTitle: "Intastellar Consents bannervoorbeeld",
    dataLayer: "dataLayer",
    dataLayerConsent: "dataLayer (cookie_consent_update)",
    windowError: "window.error",
    preview: "voorbeeld",
    demoCompany: "Acme Demo",
  },
  legacy: {
    line1Strong: "Voorheen developers.intastellarsolutions.com",
    line1Mid: " — ontwikkelaarsdocumentatie en -tools staan nu hier op ",
    line1Brand: "inta.dev",
    line1AfterBrand: ".",
    line2Before: "De oude site had alleen focus op ",
    badge: "Ontwikkelaarsaccounts",
    line2After:
      " — er werd geen facturering of betaalde producten aangeboden.",
  },
  a11y: {
    colorTheme: "Kleurthema",
    lightTheme: "Licht thema",
    darkTheme: "Donker thema",
  },
  docs: {
    breadcrumbDocumentation: "Documentatie",
    hubMetaTitleCore: "Documentatie",
    hubMetaDescription:
      "Documentatie voor Intastellar-ontwikkelaarsproducten: Intastellar Consents, web-login en API’s.",
    hubEyebrow: "Intastellar developers",
    hubHeading: "Documentatie",
    hubLead:
      "Gidsen voor cookietoestemming en weblogin met Intastellar Accounts — plus API-sleutels en patronen die u op sites en backends hergebruikt.",
    hubVersionNote:
      "Doc-URL’s bevatten een versiesegment (bijv. /v1/) zodat we nieuwe hoofdgidsen kunnen publiceren zonder bladwijzers te breken.",
    hubSearchDocs: "Zoek in documentatie",
    hubChangelog: "Changelog",
    hubApiKeys: "API-sleutels",
    popularGuides: "Populaire gidsen",
    popularGuidesHint: "Spring direct naar veelvoorkomende integratiepaden.",
    allProducts: "Alle producten",
    allProductsHint:
      "Volledige inhoudsopgave, versies en kruislinks in elke ruimte.",
    sidebarOverview: "Overzicht",
    sidebarAccounts: "Inloggen (Web)",
    sidebarJavascript: "JavaScript",
    sidebarWordpress: "WordPress",
    sidebarIntegrations: "Integraties",
    sidebarMore: "Meer",
    relatedHeading: "Gerelateerd",
    relatedAccountsSignIn: "Accounts — Inloggen (Web)",
    ql1Label: "Consents — JavaScript",
    ql1Hint: "Snippet, window.INTA, eerste uitrol",
    ql2Label: "Consents — WordPress",
    ql2Hint: "Plugin installeren en configureren",
    ql3Label: "Accounts — React en plain JS",
    ql3Hint: "SDK op npm, HTML/JS op inta.dev, placeholder-voorbeelden",
    ql4Label: "Accounts — Platte HTML / CSS / JS",
    ql4Hint: "Statische sites zonder framework — gemigreerde js-docs",
    ql5Label: "Accounts — Aan de slag",
    ql5Hint: "Client registreren, SDK vs. handmatige OAuth, flows",
    ql6Label: "Accounts — Authorization code-flow",
    ql6Hint: "PKCE, callback, token-uitwisseling",
    docPageFallbackDescription:
      "{{title}} — Intastellar-ontwikkelaarsdocumentatie op inta.dev.",
    saveToProfile: "Opslaan in profiel",
    removeFromProfile: "Verwijderen uit profiel",
    bookmarkToastSaved: "Opgeslagen op uw profiel.",
    bookmarkToastRemoved: "Verwijderd uit uw opgeslagen lijst.",
    saveToProfileHint:
      "Log in met een portalsessie (zelfde account als API-sleutels) om deze pagina op uw profiel te bewaren.",
    onYourProfile: "Deze pagina staat op uw opgeslagen lijst onder Account → Profiel.",
    saveLoginModalTitle: "Deze pagina in uw profiel opslaan",
    saveLoginModalClose: "Sluiten",
    saveLoginModalSignInPopup: "Inloggen met Intastellar",
    saveLoginModalSignInGitHub: "Doorgaan met GitHub",
    saveLoginModalOpenLoginPage: "Inlogpagina openen",
    saveLoginModalOpenProfile: "Accountprofiel openen",
  },
  search: {
    inputAria: "Zoek in documentatie",
    placeholder: "Zoek in documentatie…",
    noIndexRun: "Geen zoekindex gevonden. Voer uit",
    noIndexOr: "(of",
    noIndexRestart: ") en start de dev-server opnieuw.",
    noResults: "Geen resultaten. Probeer een kortere term of controleer spelling.",
    title: "Zoek in documentatie",
    overlayHelp:
      "Esc om te sluiten · ⌘K / Ctrl+K vanaf de pagina · pijltoetsen en Enter om te openen",
    pageIntro:
      "Filter op titel, product-slug en pagina-inhoud. Toetsenbord: ⌘K / Ctrl+K opent de zoek-overlay; met overlay gebruikt u pijlen en Enter om te kiezen.",
  },
  profile: {
    metaTitle: "Profiel · inta.dev",
    heading: "Profiel",
    loading: "Sessie laden…",
    ssoBefore: "Stel",
    ssoAfter: "in uw omgeving in om Intastellar SSO te koppelen.",
    seeSignInBefore: "Zie de",
    seeSignInAfter: "pagina voor details.",
    signedOut:
      "U bent uitgelogd. Log in met uw Intastellar-account om hier uw profiel te zien.",
    signInWithIntastellar: "Inloggen met Intastellar",
    openSignInPage: "Inlogpagina openen",
    intro:
      "Uw ontwikkelaarsidentiteit komt van Intastellar Accounts. Gebruik API-sleutels voor serverreferenties en sla documentatiepagina’s hier op voor snelle toegang tijdens het bouwen.",
    manageAccount: "Uw Intastellar-account beheren",
    savedDocsHeading: "Opgeslagen documentatie",
    savedDocsEmpty:
      "Nog geen pagina’s opgeslagen. Open een handleiding en gebruik onderaan «Opslaan in profiel».",
    savedDocsRemove: "Verwijderen",
    savedDocsMongoOff:
      "Opgeslagen documentatie vereist MongoDB op deze server. Inloggen blijft werken.",
    savedDocsNeedAccount:
      "Voltooi het inloggen zodat het portaal uw account kan koppelen (bezoek API-sleutels of vernieuw na inloggen) om opgeslagen docs in te schakelen.",
    savedDocsErrorGeneric:
      "Opgeslagen documentatie bijwerken mislukt. Probeer het opnieuw.",
    savedDocsErrorInvalid: "Die documentatielink is ongeldig.",
    linkGitHubHeading: "GitHub-inloggen",
    linkGitHubDescription:
      "Koppel je GitHub-account om later met GitHub in te loggen. Je GitHub-profiel moet een geverifieerd e-mailadres tonen dat bij dit portalaccount hoort (zelfde als Intastellar).",
    linkGitHubButton: "GitHub-account koppelen",
    githubLinkedBadge: "GitHub gekoppeld als @{{login}}",
    githubLinkedNotice: "GitHub is nu aan dit account gekoppeld.",
    linkGitHubErrorEmailMismatch:
      "Het geverifieerde GitHub-e-mailadres hoort niet bij dit account. Gebruik hetzelfde geverifieerde adres op GitHub als bij Intastellar.",
    linkGitHubErrorNoVerifiedEmail:
      "GitHub leverde geen geverifieerd e-mailadres. Stel een openbaar adres in of verleen de scope user:email.",
    linkGitHubErrorGithubTaken:
      "Dit GitHub-account is al gekoppeld aan een andere portalgebruiker.",
    linkGitHubErrorNotFound: "Portalaccount niet gevonden.",
    linkGitHubErrorSessionMismatch:
      "Je sessie veranderde tijdens het koppelen. Sluit andere tabbladen en probeer opnieuw.",
    linkGitHubErrorInvalid: "Ongeldig koppelverzoek. Probeer opnieuw via je profiel.",
    linkGitHubErrorRequiresMongo:
      "GitHub koppelen vereist MongoDB op deze server.",
  },
  account: {
    layoutTitle: "Account",
    layoutDescription:
      "Log in met Intastellar of GitHub, beheer je profiel en ontwikkelaars-API-sleutels.",
    loginHeading: "Inloggen",
    loginIntro:
      "Gebruik je Intastellar-account (SSO) of je GitHub-account om in te loggen.",
    loginAriaBusy: "Laden",
    loginIntastellarLogoAlt: "Intastellar-logo",
    loginSignInIntastellar: "Inloggen met Intastellar",
    loginCheckingSession: "Sessie controleren…",
    loginSsoNotConfiguredLead: "SSO is niet geconfigureerd. Stel",
    loginSsoNotConfiguredMid: "(en optioneel",
    loginSsoNotConfiguredTail:
      ") in je omgeving in en start de ontwikkelingsserver opnieuw.",
    loginLegalPrefix: "Door in te loggen ga je akkoord met de",
    loginLegalTermsLabel: "servicevoorwaarden",
    loginLegalBetween: "en het",
    loginLegalPrivacyLabel: "privacybeleid",
    loginLegalSuffix: ".",
    loginGitHubSignIn: "Doorgaan met GitHub",
    loginGitHubHint:
      "Zelfde portalaccount en opgeslagen docs als Intastellar na autorisatie op GitHub.",
    loginGitHubErrorDisabled:
      "GitHub-inloggen is op deze server niet geconfigureerd.",
    loginGitHubErrorDenied: "GitHub-autorisatie geannuleerd.",
    loginGitHubErrorState: "Aanmeldstatus kwam niet overeen. Probeer opnieuw.",
    loginGitHubErrorToken:
      "GitHub-inloggen kon niet worden voltooid. Probeer opnieuw.",
    loginGitHubErrorUser:
      "Kon je GitHub-profiel niet laden. Probeer opnieuw.",
    loginGitHubErrorUnknown: "GitHub-inloggen mislukt. Probeer opnieuw.",
    loginGitHubErrorLinkRequiresLogin:
      "Log eerst in op het portal en koppel GitHub daarna via je profiel.",
    loginGitHubErrorLinkRequiresMongo:
      "GitHub koppelen vereist MongoDB op deze server.",
  },
  apiKeys: {
    metaTitle: "API-sleutels · inta.dev",
    heading: "API-sleutels",
    loading: "Laden…",
    setSsoBefore: "Stel",
    setSsoAfterCode: "in uw omgeving in ",
    setSsoAfter:
      "om inloggen in te schakelen en configureer MongoDB hieronder.",
    signInToManageAfter:
      "met Intastellar om sleutels aan te maken en in te trekken. Sleutels zijn gekoppeld aan het e-mailadres van uw account.",
    mongoBeforeUri: "Voeg",
    mongoAfterUri:
      "(Atlas-connection string) toe aan uw serveromgeving. Optioneel:",
    mongoBeforeDb: "(",
    mongoDefaultWord: "standaard",
    mongoAfterDb: "),",
    mongoAfterPepper:
      "(verplicht in productie — hashing en versleutelde opslag voor opnieuw tonen in dit portaal).",
    sessionSyncing: "Uw sessie synchroniseren met de server…",
    sessionHardFailP1:
      "In de app ingelogd, maar het API-sleutelsverzoek heeft geen portaal-sessiecookie. Veelvoorkomende oorzaken: verouderde loader-cache,",
    sessionHardFailVs: "vs.",
    sessionHardFailP2: ", of ontbrekende",
    sessionHardFailP3:
      "in productie (de ondertekende sessiecookie kan niet worden aangemaakt).",
    sessionHardFailBulletRefresh:
      "Vernieuw deze pagina volledig of open API-sleutels in een nieuw tabblad.",
    sessionHardFailBulletHostOpen: "Gebruik in dev slechts één host (",
    sessionHardFailBulletHostClose: ").",
    sessionHardFailBulletSecretBefore: "Stel",
    sessionHardFailBulletSecretAfter: "in productie in.",
    signInAgain: "Opnieuw inloggen",
    sessionAligning:
      "Server-sessie afstemmen op uw account… Blijft dit zo, laad de pagina opnieuw.",
    sessionVerifyBefore:
      "De server kon uw sessiecookie niet verifiëren. Vernieuw na inloggen, of",
    sessionVerifyLink: "log uit en log opnieuw in",
    sessionVerifyAfter: ".",
    newKeyBanner:
      "Sleutel aangemaakt. Het volledige geheim staat in de tabel hieronder — gebruik daar {{copyKey}}. Verberg het met het oogpictogram; open het oog op elk moment terwijl u bent ingelogd om opnieuw te tonen en te kopiëren (we bewaren een versleutelde kopie op de server).",
    dismiss: "Sluiten",
    optionalHintBeforeHttps:
      "Optioneel inlogdomein en logo-URL worden gebruikt met Intastellar Sign-In (we slaan de hostnaam op; logo moet ",
    optionalHintAfterHttps: " zijn).",
    labelField: "Label",
    requiredMark: "*",
    placeholderLabel: "bijv. productiewebsite",
    signInDomain: "Inlogdomein",
    logoUrl: "Logo-URL",
    placeholderDomain: "app.voorbeeld.nl",
    placeholderLogo: "https://cdn.voorbeeld.nl/logo.svg",
    createKey: "Sleutel aanmaken",
    busyEllipsis: "…",
    emptyList:
      "Nog geen sleutels. Maak er een voor een geheim voor servers of tooling. We slaan een hash voor validatie en een versleutelde kopie op zodat u later opnieuw kunt tonen en kopiëren.",
    colLabel: "Label",
    colKey: "Sleutel",
    colSignInDomain: "Inlogdomein",
    colLogo: "Logo",
    colCreated: "Aangemaakt",
    colActions: "Acties",
    copyKey: "Sleutel kopiëren",
    copied: "Gekopieerd",
    copyFailed: "Kopiëren mislukt",
    logoUnloaded: "Niet geladen",
    hideKey: "Sleutel verbergen",
    revealKey: "Sleutel tonen om te kopiëren",
    revealLoading: "Laden…",
    noSecretStored:
      "Geen versleuteld geheim in bestand (vaak een oudere sleutel). Maak een nieuwe sleutel om tonen en kopiëren mogelijk te maken.",
    openSignInRow: "Inloggen",
    closeEditor: "Sluiten",
    revoke: "Intrekken",
    editSignInTitle: "Intastellar Sign-In — domein en logo voor deze sleutel",
    logoUrlHttps: "Logo-URL (https)",
    placeholderLogoShort: "https://…",
    saveSignInSettings: "Inloginstellingen opslaan",
    cancel: "Annuleren",
    errors: {
      signInAgain: "Log opnieuw in om API-sleutels te beheren.",
      dbNotConfiguredOnServer: "Database is niet geconfigureerd op de server.",
      unknownAction: "Onbekende actie.",
      dbNotConfigured: "Database is niet geconfigureerd.",
      enterLabel: "Voer een label voor deze sleutel in.",
      domainInvalidCreate:
        "Inlogdomein lijkt ongeldig. Gebruik een hostnaam zoals app.voorbeeld.nl (u kunt een volledige https-URL plakken — we slaan alleen de host op).",
      logoInvalidCreateImage:
        "Inloglogo moet een geldige https://-afbeeldings-URL zijn (of leeg blijven).",
      pepperMissing:
        "Serverfout: stel API_KEY_PEPPER (lang willekeurig geheim) in productie in.",
      invalidKeyId: "Ongeldige sleutel-id.",
      keyNotFound: "Sleutel niet gevonden of al ingetrokken.",
      noEncryptedOnFile:
        "Deze sleutel heeft geen versleuteld geheim in bestand (vaak vóór weergave-ondersteuning). Maak een nieuwe sleutel.",
      decryptFailed:
        "Kon deze sleutel niet ontsleutelen (servergeheim kan zijn gewijzigd). Maak een nieuwe sleutel.",
      domainInvalidUpdate:
        "Inlogdomein lijkt ongeldig. Gebruik een hostnaam zoals app.voorbeeld.nl.",
      logoInvalidUpdateUrl:
        "Inloglogo moet een geldige https://-URL zijn of leeg blijven.",
    },
  },
  status: {
    metaTitle: "Systeemstatus · inta.dev",
    metaDescription:
      "Beschikbaarheidscontroles voor openbare Intastellar-endpoints (Consents, CDN, inta.dev).",
    heading: "Systeemstatus",
    introBeforeLink:
      "Geautomatiseerde HTTP-controles vanaf inta.dev. Machineleesbare momentopname:",
    introAfterLink: ".",
    ariaUptimeStored: "Beschikbaarheid uit opgeslagen geplande controles",
    uptimeWord: "beschikbaarheid",
    uptimeStoredRunsBefore:
      "We voeren deze controles automatisch volgens een schema uit. In de laatste {{hours}} uur (UTC) hebben we",
    uptimeStoredRunsMid: "runs opgeslagen ·",
    uptimeStoredRunsAfter:
      "tellen als volledig up (alle services OK in die run, zonder van toepassing zijnde teammelding of onderhoud op dat moment).",
    devLiveProbeBefore: "Ontwikkelmodus:",
    devLiveProbeStrong: "live-controle",
    devLiveProbeAfter:
      "(niet opgeslagen). In productie geldt de laatste door de cron geschreven momentopname.",
    ariaUptimeDev: "Beschikbaarheid alleen uit ontwikkelingscontrole",
    onThisPageLoad: "bij het laden van deze pagina",
    devUptimeNote:
      "Ontwikkelmodus — niet gemiddeld over opgeslagen geschiedenis. Productie toont beschikbaarheid uit geplande cron-runs.",
    uptimePending:
      "Het beschikbaarheidspercentage verschijnt hier nadat de status-cron minstens één rij naar de geschiedenis heeft geschreven (tijdlijnen gebruiken dezelfde opslag).",
    noSnapshotCron:
      "Nog geen momentopname. Roep de cron-route één keer aan (zie Vercel Cron) of wacht op de volgende geplande run.",
    noSnapshotMongo:
      "MongoDB is niet geconfigureerd — momentopnamen worden niet opgeslagen. In ontwikkeling voert deze pagina controles uit bij elke load; stel MONGODB_URI en CRON_SECRET in op Vercel voor productiemonitoring.",
    allChecksPassing: "Alle controles geslaagd",
    someChecksFailing: "Sommige controles mislukken",
    updated: "Bijgewerkt",
    storedUtc: " (opgeslagen, UTC)",
    utcOnly: " (UTC)",
    httpStatus: "HTTP {{code}}",
    noResponse: "Geen antwoord",
    footnoteAria: "Technische details voor beheer van deze statuspagina",
    footnoteTitle: "Voetnoot — hosting en configuratie",
    footnoteP1Before: "Deze pagina is openbaar. Onderstaande is bedoeld voor",
    footnoteP1Strong: "teams die inta.dev uitrollen",
    footnoteP1After: "(omgevingsvariabelen, gegevensbewaring).",
    footnoteP2a: "Configureer doelen met",
    footnoteP2b: "(volledige vervanging) of",
    footnoteP2c:
      "(toevoegen). Een controle telt als geslaagd als de HTTP-status onder 500 is. Het incidentlog toont mislukte cron-runs in dat venster, inclusief probetekst indien opgeslagen.",
    footnoteP2d:
      "Tijdlijnen, incidentlog en latentietrends delen dezelfde rollende opslag: de laatste {{hours}} uur (UTC), tot {{maxRows}} samples per aanvraag (14 dagen TTL in Mongo). Het kop-beschikbaarheidspercentage gebruikt hetzelfde venster: een run telt alleen als up als alle doelen slaagden en het tijdstip buiten van toepassing zijnde teammeldingen en onderhoud valt. Stel in met STATUS_HISTORY_WINDOW_HOURS en STATUS_HISTORY_MAX_ROWS. Tijden zijn UTC. Nieuwe geschiedenisrijen slaan per doel",
    footnoteP2e:
      " op; oudere rijen sturen nog steeds omhoog/omlaag-segmenten tot ze verlopen.",
    incidentHeading: "Incidentlog",
    incidentEmptyBody:
      "Een incident is een opgeslagen cron-run waarin minstens één doel uitviel (HTTP 5xx, time-out of geen antwoord — dezelfde regels als live controles). Als recente geschiedenis overal slaagde, blijft deze lijst leeg.",
    incidentListIntro:
      "Gegroepeerd per monitor. Per doel worden opeenvolgende mislukte runs met hetzelfde probebericht samengevoegd tot één rij met een UTC-tijdsvenster (nieuwste groepen eerst), binnen hetzelfde rollende venster als tijdlijnen en uptime. Berichten komen van de probe indien beschikbaar; oudere geschiedenis kan alleen een generieke reden tonen.",
    degraded: "Verstoord",
    timelineNoHistory:
      "Nog geen geschiedenis. Zodra MongoDB en cron runs opslaan, verschijnen recente controles hier.",
    timelineCurrentCheckDev: "Alleen huidige controle (dev)",
    timelineRecentChecks:
      "Recente controles — afgelopen {{window}} ({{count}} metingen)",
    timelineAriaSummary:
      "{{n}} controles: {{clear}} volledig OK, {{flagged}} met storing, melding of onderhoud",
    timelineTooltipUp: "{{time}} — OK",
    timelineTooltipDown: "{{time}} — Mislukt",
    timelineTooltipNotice: "{{time}} — Operateursmelding",
    timelineTooltipMaintenance: "{{time}} — Gepland onderhoud",
    timelineIssueListIntro: "Niet volledig OK (UTC)",
    timelineIssueLabelDown: "Controle mislukt",
    timelineIssueLabelNotice: "Operateursmelding",
    timelineIssueLabelMaintenance: "Gepland onderhoud",
    timelineIssueMore: "+ {{n}} meer…",
    latencyNeedsTwoRuns:
      "Responstijd-trend heeft minstens twee opgeslagen runs met latentie nodig (nadat de volgende cron latencyMs schrijft).",
    latencyResponseTime: "Responstijd ({{label}})",
    latencyAriaTrend:
      "Latentietrend voor {{label}}: {{min}}–{{max}} ms over {{n}} controles",
    latencyMin: "Min",
    latencyMax: "Max",
    latencyLatest: "Laatste",
    latencyByRegionCaption: "Responstijd per probelocatie",
    latencyDefaultRegionLabel: "Deze probe",
    badgeMainUptime:
      "Servicebetrouwbaarheid: {{percent}} beschikbaarheid (afgelopen {{window}})",
    badgeSubMonitored:
      "Continu bewaakt via wereldwijde eindpunten",
    badgePlaceholder: "Servicebetrouwbaarheid",
    badgeCollecting: "Geplande controles verzamelen…",
    badgeLink: "Live status bekijken →",
    badgeLogoAlt: "Intastellar Consents",
    badgePoweredBy: "Mogelijk gemaakt door inta.dev",
    uptimeJsonWidgetDescription:
      "In de laatste {{hours}} uur werden {{totalRuns}} geplande runs opgeslagen; {{passedRuns}} tellen als volledig up (alle probes OK, geen van toepassing zijnde teammelding of onderhoud).",
    uptimeJsonNoHistoryDescription:
      "Beschikbaarheid verschijnt hier zodra geplande healthchecks zijn opgeslagen.",
    embedBadgeButton: "Badge insluiten",
    embedModalTitle: "Uptime-badge insluiten",
    embedModalIntro:
      "Kopieer een iframe-fragment of de JSON-API-URL. Taal: ?locale= (en, de, da, fr, nl, pt-br). Thema: ?theme=light of ?theme=dark voor vast licht of donker — zonder theme (of theme=auto) volgt de badge de systeeminstelling van de bezoeker.",
    embedPreviewHeading: "Voorbeeld",
    embedThemeLabel: "Uiterlijk van de badge",
    embedIframeHeading: "iframe-insluiting",
    embedIframeTitle: "Uptime-badge",
    embedJsonHeading: "JSON-API",
    embedJsonHint:
      "Gebruik deze URL in fetch() of curl — levert widgetTitle, widgetDescription, statusPageUrl en badgeEmbedUrl.",
    embedCopy: "Kopiëren",
    embedCopied: "Gekopieerd",
    embedModalClose: "Sluiten",
    embedOpenOnSite: "Open deze pagina op uw site om URL’s te genereren.",
    maintenanceHeading: "Gepland onderhoud",
    maintenanceEmpty:
      "Er zijn momenteel geen lopende of aankomende onderhoudsvensters gepubliceerd.",
    maintenanceActiveBadge: "Bezig",
    maintenanceUpcomingBadge: "Gepland",
    maintenanceRange: "{{start}} → {{end}}",
    deployHeading: "Laatste deployment",
    deployUnavailable:
      "De laatste commit komt uit de Intastellar Consents GitHub-repo (niet van de deploy van deze site). Leeg als de GitHub-API niet bereikbaar is of gelimiteerd — zet GITHUB_TOKEN voor hogere limieten.",
    deployCommit: "Commit",
    deployBranch: "Branch",
    deployMessage: "Bericht",
    deployViewCommit: "Commit op GitHub bekijken",
    trustHeading: "Hoe we uptime meten",
    trustIntro: "Korte toelichting bij wat deze pagina laat zien.",
    trustBulletSynthetic:
      "Synthetische checks: geautomatiseerde HTTP-verzoeken vanaf onze hostingprovider naar elke openbare URL hieronder — geen echte gebruikersmeting (RUM).",
    trustBulletFrequency:
      "Schema: in productie ongeveer eens per minuut (cron-configuratie van uw project).",
    trustBulletPass:
      "Een check slaagt als de HTTP-status lager is dan 500; timeouts en netwerkfouten tellen als mislukt.",
    trustBulletHistory:
      "Tijdlijnen, incidentlog, latentietrends en het uptime-percentage bovenaan gebruiken opgeslagen controles van de laatste {{hours}} uur (UTC), tot {{maxRows}} metingen per laden (MongoDB-TTL ongeveer 14 dagen). Actieve teammeldingen en onderhoud tellen als downtime wanneer van toepassing.",
    trustBulletUtc: "Alle tijden op deze pagina zijn UTC.",
    manualNoticesHeading: "Mededelingen van het team",
    manualNoticesIntro:
      "Updates van het team bij incidenten of vervolg (los van de automatische probe-geschiedenis hieronder).",
    manualPostedBy: "Geplaatst door {{email}}",
    manualResolvedPrefix: "Opgelost",
    manualSeverityInvestigating: "Onderzoek",
    manualSeverityIdentified: "Geïdentificeerd",
    manualSeverityMonitoring: "Monitoring",
    manualSeverityResolved: "Opgelost",
    manualUpdateMeta: "Update · {{atLabel}} · {{email}}",
    manualUpdatesHeading: "Updates",
    affectedMonitorsLabel: "Monitors",
    subscribeRss: "Abonneren (RSS)",
    subscribeRssTitle: "RSS-feed met operatorberichten en gepland onderhoud",
    subscribeSectionHeading: "Abonneren op updates",
    subscribeSectionIntro:
      "Kies welke updates je wilt. RSS-readers halen nieuwe items op via de feed-URL; e-mail wordt verstuurd wanneer we een passend onderhoudsvenster of operatorbericht publiceren.",
    subscribeTopicsLabel: "Opnemen",
    subscribeTopicMaintenance: "Gepland onderhoud",
    subscribeTopicIncidents: "Operatorberichten en monitoringalerts",
    subscribePickTopicsError: "Kies minstens één soort update.",
    subscribeRssUrlHelp: "RSS (plak in je reader of kopieer de URL)",
    subscribeOpenRss: "RSS-feed openen",
    subscribeCopyFeedUrl: "Feed-URL kopiëren",
    subscribeCopied: "Gekopieerd",
    subscribeEmailHelp: "E-mail",
    subscribeEmailCheckbox: "Stuur waarschuwingen naar mijn e-mail (dubbele opt-in)",
    subscribeEmailUnavailable:
      "E-mailwaarschuwingen vereisen MongoDB en Resend (RESEND_API_KEY en STATUS_NOTIFY_FROM). RSS hierboven werkt nog steeds.",
    subscribeEmailInputLabel: "E-mailadres",
    subscribeEmailPlaceholder: "jij@voorbeeld.nl",
    subscribeEmailSubmit: "E-mailwaarschuwingen aanvragen",
    subscribeEmailVerifySent:
      "Controleer je inbox en klik op de bevestigingslink om te voltooien.",
    subscribeEmailUpdated: "Je e-mailvoorkeuren zijn bijgewerkt.",
    subscribeEmailErrorGeneric: "Er ging iets mis. Probeer het opnieuw.",
    notifyFlashVerified: "Je e-mailabonnement is bevestigd.",
    notifyFlashUnsubscribed: "Je bent uitgeschreven voor statusmails.",
    notifyFlashVerifyMissing: "Bevestigingslink mist een token.",
    notifyFlashVerifyInvalid: "Ongeldige of al gebruikte bevestigingslink.",
    notifyFlashUnsubMissing: "Uitschrijflink mist een token.",
    notifyFlashUnsubInvalid: "Ongeldige uitschrijflink.",
  },
};
