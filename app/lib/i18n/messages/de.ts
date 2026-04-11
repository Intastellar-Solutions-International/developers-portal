import type { MessageTree } from "./en";

export const de: MessageTree = {
  meta: {
    homeTitle: "inta.dev · Intastellar Developers",
    homeDescription:
      "Dokumentation, API-Schlüssel und Integrationsleitfäden auf inta.dev für Intastellar Consents und Intastellar Accounts — beide Produkte der Intastellar Solutions International.",
  },
  seo: {
    searchTitle: "Suche · inta.dev",
    searchDescription: "Intastellar-Entwicklerdokumentation durchsuchen.",
    changelogTitle: "Changelog · inta.dev",
    changelogDescription:
      "Versionsverlauf für Intastellar Consents (GitHub) und Intastellar Sign-In (npm + GitHub).",
    legalIndexTitle: "Rechtliches · inta.dev",
    legalIndexDescription:
      "Rechtliche Informationen zu inta.dev: Datenschutz, Nutzungsbedingungen und Links zu Richtlinien sowie DPA von Intastellar Solutions.",
    legalPrivacyTitle: "Datenschutz · inta.dev",
    legalPrivacyDescription:
      "Wie inta.dev personenbezogene Daten, Cookies, Google Tag Manager, Intastellar Consents und die Anmeldung behandelt.",
    legalTermsTitle: "Nutzungsbedingungen · inta.dev",
    legalTermsDescription:
      "Nutzungsbedingungen für das inta.dev-Entwicklerportal, die Dokumentation und Kontofunktionen.",
    accountLoginTitle: "Anmelden · inta.dev",
    notFoundTitle: "Seite nicht gefunden · inta.dev",
    notFoundDescription: "Diese Seite gibt es auf inta.dev nicht.",
  },
  lang: {
    label: "Sprache",
    en: "English",
    de: "Deutsch",
    da: "Dansk",
    fr: "Français",
    nl: "Nederlands",
    "pt-br": "Portugiesisch (Brasilien)",
  },
  nav: {
    docs: "Dokumentation",
    apiKeys: "API-Schlüssel",
    signIn: "Anmelden",
    signOut: "Abmelden",
    signingIn: "Anmeldung…",
    searchAria: "Dokumentation durchsuchen",
    searchTitle: "Suche (⌘K)",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    siteMenu: "Website-Menü",
    menu: "Menü",
    main: "Haupt",
    mainNav: "Hauptnavigation",
    colorTheme: "Farbschema",
    intastellarSolutions: "Intastellar Solutions",
    intastellarSolutionsTitle: "Intastellar Solutions (öffnet neues Fenster)",
    opensNewTab: "(öffnet neues Fenster)",
    logoHomeTitle: "Intastellar Developers — Startseite",
    changelog: "Änderungsprotokoll",
    changelogTitle: "Consents & Sign-In — npm- und GitHub-Releases",
    documentation: "Dokumentation",
    intastellarConsents: "Intastellar Consents",
    profile: "Profil",
  },
  footer: {
    tagline:
      "Dokumentation, API-Schlüssel und Integrationsleitfäden für Intastellar Consents und Intastellar Accounts — beide Produkte der Intastellar Solutions International.",
    documentation: "Dokumentation",
    allDocs: "Alle Dokumente",
    intastellarConsents: "Intastellar Consents",
    accountsSignIn: "Accounts — Anmeldung",
    searchDocs: "Dokumentation durchsuchen",
    platform: "Plattform",
    home: "Startseite",
    changelog: "Änderungsprotokoll",
    signIn: "Anmelden",
    apiKeys: "API-Schlüssel",
    legal: "Rechtliches",
    legalOverview: "Rechtliche Übersicht",
    privacy: "Datenschutz (inta.dev)",
    terms: "Nutzungsbedingungen (inta.dev)",
    dpaCorporate: "AVV (Unternehmen)",
    intastellar: "Intastellar",
    intastellarSolutions: "Intastellar Solutions",
    cookieConsentsProduct: "Cookie-Consent-Produkt",
    copyright: "© {{year}} Intastellar Solutions. Alle Rechte vorbehalten.",
    statusOk: "Systemstatus",
    statusDegraded: "Einige Prüfungen schlagen fehl",
  },
  home: {
    heroTitle: "Mit Intastellar gebaut",
    heroLead1: "Dokumentation, Anleitungen und Werkzeuge, um ",
    heroLeadConsent: "DSGVO-konforme Einwilligung",
    heroLead2: " und ",
    heroLeadSignin: "sichere Anmeldung",
    heroLead3:
      " mit dem gleichen Stack wie Intastellar auszuliefern — alles auf ",
    heroLeadBrand: "inta.dev",
    heroLead4: ".",
    searchDocs: "Dokumentation durchsuchen",
    cardConsentsTitle: "Intastellar Consents",
    cardConsentsBody:
      "Cookie-Banner, CMP und Consent-APIs für Web, WordPress, GTM, Shopify und mehr.",
    cardConsentsCta: "Dokumentation öffnen",
    cardAccountsTitle: "Intastellar Accounts",
    cardAccountsBody:
      "React-SDK auf inta.dev, OAuth-ähnliche Flows, PKCE, Sitzungen und Sicherheitsmuster für Ihre Apps und Websites.",
    cardAccountsCta: "Dokumentation öffnen",
    cardAllTitle: "Alle Dokumente & API-Schlüssel",
    cardAllBody:
      "Alle Produkthandbücher durchsuchen, Releases verfolgen und Schlüssel für das Entwicklerportal verwalten.",
    cardAllCta: "Alles durchsuchen",
    quickConsents: "Consents — Schnellstart",
    quickAccounts: "Accounts — Schnellstart",
    signInPortal: "Am Portal anmelden",
    bandTitle: "Schneller mit Suche & Releases",
    bandBody:
      "Springen Sie mit Volltextsuche zu jeder Seite, verfolgen Sie Produktupdates im Änderungsprotokoll (Consents und Intastellar Sign-In) und verwalten Sie API-Schlüssel an einem Ort nach der Anmeldung.",
    openSearch: "Suche öffnen",
    changelog: "Änderungsprotokoll",
    apiKeys: "API-Schlüssel",
  },
  intaTryout: {
    introBeforePrivacy:
      "Bearbeiten Sie das JSON unten, um window.INTA zu ändern. Die Vorschau lädt neu, sobald das JSON gültig ist. Richtlinien-URLs verweisen standardmäßig auf die ",
    privacyPage: "Datenschutzseite",
    introAfterPrivacy:
      " dieser Website. Die Vorschau nutzt dieselbe Origin und localStorage wie diese Dokumentation.",
    minimumSetupTitle: "Minimale Einrichtung",
    minimumSetupLeadBeforeRoot: "Sie brauchen nur eine gültige Richtlinien-URL, ",
    minimumSetupLeadBetweenRootCompany: ", ",
    minimumSetupLeadBeforeUc: ", und das ",
    minimumSetupLeadAfterUc:
      "-Tag. Alles andere ist optionales Branding oder Integrationen.",
    copyMinimumSnippet: "Minimales Snippet kopieren",
    whatNextTitle: "Was als Nächstes passiert",
    whatNextStep1:
      "Sie fügen die beiden Script-Tags weit oben im <head> ein, vor Analyse- oder Marketing-Tags.",
    whatNextStep2:
      "uc.js liest window.INTA und zeigt das Banner, wenn die Richtlinien-URL erreichbar ist.",
    whatNextStep3:
      "Der Besucher akzeptiert, lehnt ab oder wählt granular; die CMP speichert die Entscheidung (Cookies / Speicher für Ihre Domain).",
    whatNextStep4:
      "Bei Einwilligungsänderungen wird cookie_consent_update an dataLayer für GTM geschickt — unten in der Konsole sichtbar.",
    whatNextStep5Before: "Verbinden Sie GTM / Vendor-Tags mit diesen Signalen (siehe ",
    whatNextStep5Between: ", ",
    whatNextStep5After: ").",
    docLinkQuickstart: "Schnellstart",
    docLinkEventsApi: "Ereignisse und API",
    editorLabel: "window.INTA (JSON)",
    format: "Formatieren",
    reset: "Zurücksetzen",
    copyHtmlSnippet: "HTML-Snippet kopieren",
    copied: "Kopiert",
    jsonErrorPrefix: "JSON: ",
    fieldReferenceTitle: "Felderreferenz",
    fieldReferenceAria: "Felderreferenz",
    fieldHints: {
      policy_link:
        "Öffentliche HTTPS-URL Ihrer Datenschutzerklärung. Ungültige oder Platzhalter-URLs verhindern oft die Banner-Anzeige.",
      settingsPrivacyPolicy:
        "Alternative Richtlinien-URL, die manche Builds lesen; mit policy_link abgleichen, wenn beide gesetzt sind.",
      settingsRootDomain:
        "Registrierbare Domain für Cookies (z. B. example.com). Muss zur besuchten Site passen.",
      settingsCompany: "Name in der Einwilligungs-Oberfläche.",
      settingsColor: "Primäre Akzentfarbe (CSS-Hex oder Token).",
      settingsLogo: "Absolute URL zum Logo; weglassen oder leer, wenn keins.",
      settingsDesign: "Layout-Voreinstellung (z. B. overlay).",
      settingsArrange: "ltr oder rtl für die Layout-Richtung.",
      settingsGtagId:
        "GA4- / Google-Tag-ID für Consent Mode über die CMP; weglassen, bis Sie Google-Tags nutzen.",
      settingsRequiredCookies: "Namen unbedingt nötiger Cookies Ihrer Site.",
      settingsKeepInLocalStorage:
        "localStorage-Schlüssel, die die CMP bei Einwilligungsänderungen nicht löschen soll.",
    },
    fullSchema: "Vollständiges Schema",
    fullSchemaExtra: "erlaubt zusätzliche Schlüssel.",
    pasteFooterBefore:
      "Fügen Sie das kopierte Snippet im <head> vor anderen Tracking-Skripten ein. ",
    pasteFooterAfter: " enthält Regeln zur Platzierung.",
    quickstartLink: "Schnellstart",
    debugConsoleTitle: "Ereignis- / Debug-Konsole",
    clear: "Leeren",
    debugEmpty:
      "dataLayer-Pushes, Vorschau-Meldungen und weitergeleitete Konsolen-Ausgaben aus dem iframe erscheinen hier. Interagieren Sie mit dem Banner, um ",
    debugEmptyCode: "cookie_consent_update",
    debugEmptyAfter: " zu sehen.",
    bannerPreview: "Banner-Vorschau",
    wideFrameHint:
      "Breiter Desktop-Rahmen (1280px) — bei schmalerem Panel horizontal scrollen.",
    iframeDocumentTitle: "Banner-Vorschau",
    iframePreviewHint:
      "Live-Vorschau — das echte CMP-Skript von unserem CDN läuft hier. Der Frame hat dieselbe Origin wie die Docs-App, daher funktioniert localStorage; Einwilligungs-Schlüssel können im Speicher dieser Site bleiben, bis Sie sie löschen.",
    previewUpdated: "Vorschau-HTML aktualisiert — iframe lädt neu.",
    fixJsonPreview: "JSON korrigieren, um die Vorschau zu laden.",
    loadingPreview: "Vorschau wird geladen…",
    configMustBeObject:
      "Die Konfiguration muss ein JSON-Objekt sein (kein Array und kein Primitiv).",
    iframeBannerPreviewTitle: "Intastellar Consents Banner-Vorschau",
    dataLayer: "dataLayer",
    dataLayerConsent: "dataLayer (cookie_consent_update)",
    windowError: "window.error",
    preview: "Vorschau",
    demoCompany: "Acme Demo",
  },
  legacy: {
    line1Strong: "Früher developers.intastellarsolutions.com",
    line1Mid: " — Entwicklerdokumentation und -werkzeuge finden Sie jetzt hier auf ",
    line1Brand: "inta.dev",
    line1AfterBrand: ".",
    line2Before: "Die frühere Website hatte nur den Schwerpunkt ",
    badge: "Entwicklerkonten",
    line2After:
      " — es wurden dort keine Abrechnung oder kostenpflichtigen Produkte angeboten.",
  },
  a11y: {
    colorTheme: "Farbschema",
    lightTheme: "Helles Design",
    darkTheme: "Dunkles Design",
  },
  docs: {
    breadcrumbDocumentation: "Dokumentation",
    hubMetaTitleCore: "Dokumentation",
    hubMetaDescription:
      "Dokumentation für Intastellar-Entwicklerprodukte: Intastellar Consents, Web-Anmeldung und APIs.",
    hubEyebrow: "Intastellar Developers",
    hubHeading: "Dokumentation",
    hubLead:
      "Leitfäden zu Cookie-Einwilligung und Web-Anmeldung mit Intastellar Accounts — plus API-Schlüssel und Muster für Sites und Backends.",
    hubVersionNote:
      "Dokumentations-URLs enthalten eine Versionsangabe (z. B. /v1/), damit neue Hauptversionen Lesezeichen nicht brechen.",
    hubSearchDocs: "Dokumentation durchsuchen",
    hubChangelog: "Änderungsprotokoll",
    hubApiKeys: "API-Schlüssel",
    popularGuides: "Beliebte Leitfäden",
    popularGuidesHint: "Schnell zu typischen Integrationspfaden.",
    allProducts: "Alle Produkte",
    allProductsHint:
      "Vollständiges Inhaltsverzeichnis, Versionen und Querverweise in jedem Bereich.",
    sidebarOverview: "Überblick",
    sidebarAccounts: "Anmeldung (Web)",
    sidebarJavascript: "JavaScript",
    sidebarWordpress: "WordPress",
    sidebarIntegrations: "Integrationen",
    sidebarMore: "Mehr",
    relatedHeading: "Verwandt",
    relatedAccountsSignIn: "Accounts — Anmeldung (Web)",
    ql1Label: "Consents — JavaScript",
    ql1Hint: "Snippet, window.INTA, erste Einbindung",
    ql2Label: "Consents — WordPress",
    ql2Hint: "Plugin installieren und konfigurieren",
    ql3Label: "Accounts — React & plain JS",
    ql3Hint: "SDK auf npm, HTML/JS auf inta.dev, Platzhalterbeispiele",
    ql4Label: "Accounts — Plain HTML / CSS / JS",
    ql4Hint: "Statische Sites, kein Framework — migrierte js-docs",
    ql5Label: "Accounts — Erste Schritte",
    ql5Hint: "Client registrieren, SDK vs. manuelles OAuth, Flows",
    ql6Label: "Accounts — Authorization-Code-Flow",
    ql6Hint: "PKCE, Callback, Token-Austausch",
    docPageFallbackDescription:
      "{{title}} — Intastellar-Entwicklerdokumentation auf inta.dev.",
    saveToProfile: "Im Profil speichern",
    removeFromProfile: "Aus Profil entfernen",
    saveToProfileHint:
      "Melden Sie sich mit einer Portal-Sitzung an (wie bei API-Schlüsseln), um diese Seite in Ihrem Profil zu merken.",
    onYourProfile:
      "Diese Seite steht unter Konto → Profil auf Ihrer Merkliste.",
    saveLoginModalTitle: "Diese Seite im Profil speichern",
    saveLoginModalClose: "Schließen",
    saveLoginModalSignInPopup: "Mit Intastellar anmelden",
    saveLoginModalSignInGitHub: "Mit GitHub fortfahren",
    saveLoginModalOpenLoginPage: "Anmeldeseite öffnen",
    saveLoginModalOpenProfile: "Konto-Profil öffnen",
  },
  search: {
    inputAria: "Dokumentation durchsuchen",
    placeholder: "Dokumentation durchsuchen…",
    noIndexRun: "Kein Suchindex gefunden. Führen Sie aus",
    noIndexOr: "(oder",
    noIndexRestart: ") und starten Sie den Entwicklungsserver neu.",
    noResults: "Keine Treffer. Kürzeren Begriff versuchen oder Rechtschreibung prüfen.",
    title: "Dokumentation durchsuchen",
    overlayHelp:
      "Esc zum Schließen · ⌘K / Strg+K von der Seite · Pfeiltasten und Eingabe zum Öffnen",
    pageIntro:
      "Filtern nach Titel, Produkt-Slug und Seiteninhalt. Tastatur: ⌘K / Strg+K öffnet die Suchüberlagerung. In der Überlagerung Pfeiltasten und Eingabe zum Auswählen.",
  },
  profile: {
    metaTitle: "Profil · inta.dev",
    heading: "Profil",
    loading: "Sitzung wird geladen…",
    ssoBefore: "Verbinden Sie Intastellar SSO, indem Sie",
    ssoAfter: "in Ihrer Umgebung setzen.",
    seeSignInBefore: "Siehe die",
    seeSignInAfter: "Seite für Details.",
    signedOut:
      "Sie sind abgemeldet. Melden Sie sich mit Ihrem Intastellar-Konto an, um Ihr Profil hier zu sehen.",
    signInWithIntastellar: "Mit Intastellar anmelden",
    openSignInPage: "Anmeldeseite öffnen",
    intro:
      "Ihre Entwickleridentität kommt von Intastellar Accounts. API-Schlüssel dienen Server-Anmeldedaten; gespeicherte Dokumentation finden Sie hier schnell wieder.",
    manageAccount: "Intastellar-Konto verwalten",
    savedDocsHeading: "Gespeicherte Dokumentation",
    savedDocsEmpty:
      "Noch keine Seiten gespeichert. Öffnen Sie eine Anleitung und nutzen Sie unten „Im Profil speichern“.",
    savedDocsRemove: "Entfernen",
    savedDocsMongoOff:
      "Gespeicherte Dokumentation erfordert MongoDB auf diesem Server. Die Anmeldung funktioniert weiterhin.",
    savedDocsNeedAccount:
      "Vervollständigen Sie die Anmeldung, damit das Portal Ihr Konto verknüpfen kann (API-Schlüssel besuchen oder nach der Anmeldung neu laden).",
    savedDocsErrorGeneric:
      "Gespeicherte Dokumentation konnte nicht aktualisiert werden. Bitte erneut versuchen.",
    savedDocsErrorInvalid: "Dieser Dokumentations-Link ist ungültig.",
    linkGitHubHeading: "GitHub-Anmeldung",
    linkGitHubDescription:
      "Verknüpfen Sie Ihr GitHub-Konto, um später mit GitHub einzuloggen. Ihr GitHub-Profil muss eine verifizierte E-Mail zeigen, die mit diesem Portal-Konto übereinstimmt (wie bei Intastellar).",
    linkGitHubButton: "GitHub-Konto verknüpfen",
    githubLinkedBadge: "GitHub verknüpft als @{{login}}",
    githubLinkedNotice: "GitHub ist jetzt mit diesem Konto verknüpft.",
    linkGitHubErrorEmailMismatch:
      "Die verifizierte GitHub-E-Mail passt nicht zu diesem Konto. Verwenden Sie dieselbe verifizierte E-Mail bei GitHub wie bei Intastellar.",
    linkGitHubErrorNoVerifiedEmail:
      "GitHub lieferte keine verifizierte E-Mail. Setzen Sie eine öffentliche E-Mail oder gewähren Sie den Umfang user:email.",
    linkGitHubErrorGithubTaken:
      "Dieses GitHub-Konto ist bereits mit einem anderen Portal-Benutzer verknüpft.",
    linkGitHubErrorNotFound: "Portal-Konto wurde nicht gefunden.",
    linkGitHubErrorSessionMismatch:
      "Ihre Sitzung hat sich während der Verknüpfung geändert. Schließen Sie andere Tabs und versuchen Sie es erneut.",
    linkGitHubErrorInvalid: "Ungültige Verknüpfungsanfrage. Versuchen Sie es erneut über Ihr Profil.",
    linkGitHubErrorRequiresMongo:
      "GitHub-Verknüpfung erfordert MongoDB auf diesem Server.",
  },
  account: {
    layoutTitle: "Mein Konto",
    layoutDescription:
      "Intastellar-SSO-Profil und Entwickler-API-Schlüssel.",
    loginGitHubSignIn: "Mit GitHub fortfahren",
    loginGitHubHint:
      "Gleiches Portal-Konto und gespeicherte Docs wie bei Intastellar nach Autorisierung bei GitHub.",
    loginGitHubErrorDisabled:
      "GitHub-Anmeldung ist auf diesem Server nicht konfiguriert.",
    loginGitHubErrorDenied: "GitHub-Autorisierung wurde abgebrochen.",
    loginGitHubErrorState:
      "Anmeldestatus stimmte nicht überein. Bitte erneut versuchen.",
    loginGitHubErrorToken:
      "GitHub-Anmeldung konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
    loginGitHubErrorUser:
      "GitHub-Profil konnte nicht geladen werden. Bitte erneut versuchen.",
    loginGitHubErrorUnknown: "GitHub-Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
    loginGitHubErrorLinkRequiresLogin:
      "Melden Sie sich zuerst im Portal an und verknüpfen Sie GitHub dann im Profil.",
    loginGitHubErrorLinkRequiresMongo:
      "GitHub-Verknüpfung erfordert MongoDB auf diesem Server.",
  },
  apiKeys: {
    metaTitle: "API-Schlüssel · inta.dev",
    heading: "API-Schlüssel",
    loading: "Wird geladen…",
    setSsoBefore: "Setzen Sie",
    setSsoAfterCode: "in Ihrer Umgebung, ",
    setSsoAfter:
      "um die Anmeldung zu aktivieren, und konfigurieren Sie MongoDB unten.",
    signInToManageAfter:
      "mit Intastellar, um Schlüssel zu erstellen und zu widerrufen. Schlüssel sind an die E-Mail Ihres Kontos gebunden.",
    mongoBeforeUri: "Fügen Sie",
    mongoAfterUri:
      "(Atlas-Verbindungszeichenfolge) in Ihre Serverumgebung ein. Optional:",
    mongoBeforeDb: "(",
    mongoDefaultWord: "Standard",
    mongoAfterDb: "),",
    mongoAfterPepper:
      "(in Produktion erforderlich — Hashing und verschlüsselte Speicherung für die erneute Anzeige in diesem Portal).",
    sessionSyncing: "Sitzung wird mit dem Server synchronisiert…",
    sessionHardFailP1:
      "In der App angemeldet, aber die API-Schlüssel-Anfrage hat kein Portal-Sitzungs-Cookie. Häufige Ursachen: veralteter Loader-Cache,",
    sessionHardFailVs: "vs.",
    sessionHardFailP2: ", oder fehlendes",
    sessionHardFailP3:
      "in Produktion (das signierte Sitzungs-Cookie kann nicht erstellt werden).",
    sessionHardFailBulletRefresh:
      "Seite hart neu laden (vollständiger Reload) oder API-Schlüssel in einem neuen Tab öffnen.",
    sessionHardFailBulletHostOpen:
      "In der Entwicklung nur einen Host verwenden (",
    sessionHardFailBulletHostClose: ").",
    sessionHardFailBulletSecretBefore: "",
    sessionHardFailBulletSecretAfter: "in Produktion setzen.",
    signInAgain: "Erneut anmelden",
    sessionAligning:
      "Server-Sitzung wird mit Ihrem Konto abgeglichen… Falls das anhält, laden Sie die Seite neu.",
    sessionVerifyBefore:
      "Der Server konnte Ihr Sitzungs-Cookie nicht prüfen. Versuchen Sie nach der Anmeldung, diese Seite zu aktualisieren, oder",
    sessionVerifyLink: "melden Sie sich ab und wieder an",
    sessionVerifyAfter: ".",
    newKeyBanner:
      "Schlüssel erstellt. Der vollständige Geheimtext steht in der Tabelle unten — nutzen Sie dort {{copyKey}}. Sie können ihn mit dem Augen-Symbol ausblenden; öffnen Sie das Auge jederzeit bei angemeldeter Sitzung, um erneut anzuzeigen und zu kopieren (wir speichern serverseitig eine verschlüsselte Kopie).",
    dismiss: "Schließen",
    optionalHintBeforeHttps:
      "Optionale Anmeldedomain und Logo-URL werden mit Intastellar Sign-In verwendet (wir speichern den Hostnamen; Logo muss ",
    optionalHintAfterHttps: " sein).",
    labelField: "Bezeichnung",
    requiredMark: "*",
    placeholderLabel: "z. B. Produktions-Website",
    signInDomain: "Anmeldedomain",
    logoUrl: "Logo-URL",
    placeholderDomain: "app.beispiel.de",
    placeholderLogo: "https://cdn.beispiel.de/logo.svg",
    createKey: "Schlüssel erstellen",
    busyEllipsis: "…",
    emptyList:
      "Noch keine Schlüssel. Erstellen Sie einen, um ein Geheimnis für Server oder Tools zu erhalten. Wir speichern einen Hash zur Prüfung und eine verschlüsselte Kopie, damit Sie ihn später auf dieser Seite erneut anzeigen und kopieren können.",
    colLabel: "Bezeichnung",
    colKey: "Schlüssel",
    colSignInDomain: "Anmeldedomain",
    colLogo: "Logo",
    colCreated: "Erstellt",
    colActions: "Aktionen",
    copyKey: "Schlüssel kopieren",
    copied: "Kopiert",
    copyFailed: "Kopieren fehlgeschlagen",
    logoUnloaded: "Nicht geladen",
    hideKey: "Schlüssel ausblenden",
    revealKey: "Schlüssel anzeigen zum Kopieren",
    revealLoading: "Wird geladen…",
    noSecretStored:
      "Kein verschlüsseltes Geheimnis gespeichert (meist ein älterer Schlüssel). Erstellen Sie einen neuen Schlüssel, um Anzeige und Kopieren zu ermöglichen.",
    openSignInRow: "Anmeldung",
    closeEditor: "Schließen",
    revoke: "Widerrufen",
    editSignInTitle: "Intastellar Sign-In — Domain und Logo für diesen Schlüssel",
    logoUrlHttps: "Logo-URL (https)",
    placeholderLogoShort: "https://…",
    saveSignInSettings: "Anmelde-Einstellungen speichern",
    cancel: "Abbrechen",
    errors: {
      signInAgain:
        "Melden Sie sich erneut an, um API-Schlüssel zu verwalten.",
      dbNotConfiguredOnServer:
        "Die Datenbank ist auf dem Server nicht konfiguriert.",
      unknownAction: "Unbekannte Aktion.",
      dbNotConfigured: "Datenbank ist nicht konfiguriert.",
      enterLabel: "Geben Sie eine Bezeichnung für diesen Schlüssel ein.",
      domainInvalidCreate:
        "Die Anmeldedomain scheint ungültig. Verwenden Sie einen Hostnamen wie app.beispiel.de (Sie können eine vollständige https-URL einfügen — wir speichern nur den Host).",
      logoInvalidCreateImage:
        "Das Anmelde-Logo muss eine gültige https://-Bild-URL sein (oder leer bleiben).",
      pepperMissing:
        "Serverfehlkonfiguration: Setzen Sie API_KEY_PEPPER (langes zufälliges Geheimnis) in Produktion.",
      invalidKeyId: "Ungültige Schlüssel-ID.",
      keyNotFound: "Schlüssel nicht gefunden oder bereits widerrufen.",
      noEncryptedOnFile:
        "Für diesen Schlüssel liegt kein verschlüsseltes Geheimnis vor (meist vor Einführung der Anzeige-Funktion). Erstellen Sie einen neuen Schlüssel.",
      decryptFailed:
        "Entschlüsselung fehlgeschlagen (Servergeheimnis könnte sich geändert haben). Erstellen Sie einen neuen Schlüssel.",
      domainInvalidUpdate:
        "Die Anmeldedomain scheint ungültig. Verwenden Sie einen Hostnamen wie app.beispiel.de.",
      logoInvalidUpdateUrl:
        "Das Anmelde-Logo muss eine gültige https://-URL sein oder leer bleiben.",
    },
  },
  status: {
    metaTitle: "Systemstatus · inta.dev",
    metaDescription:
      "Verfügbarkeitsprüfungen für öffentliche Intastellar-Endpunkte (Consents, CDN, inta.dev).",
    heading: "Systemstatus",
    introBeforeLink:
      "Automatisierte HTTP-Prüfungen von inta.dev. Maschinenlesbare Momentaufnahme:",
    introAfterLink: ".",
    ariaUptimeStored: "Verfügbarkeit aus gespeicherten geplanten Prüfungen",
    uptimeWord: "Verfügbarkeit",
    uptimeStoredRunsBefore:
      "Wir führen diese Prüfungen automatisch nach Zeitplan aus. In den letzten {{hours}} Stunden (UTC) wurden",
    uptimeStoredRunsMid: "Läufe erfasst ·",
    uptimeStoredRunsAfter:
      "gelten als vollständig erfolgreich (alle Dienste in dem Lauf normal, ohne zutreffende Betreiber-Hinweise oder Wartung zu diesem Zeitpunkt).",
    devLiveProbeBefore: "Entwicklungsmodus:",
    devLiveProbeStrong: "Live-Prüfung",
    devLiveProbeAfter:
      "(nicht gespeichert). In Produktion gilt die letzte vom Cron geschriebene Momentaufnahme.",
    ariaUptimeDev: "Verfügbarkeit nur aus Entwicklungsprüfung",
    onThisPageLoad: "bei diesem Seitenaufruf",
    devUptimeNote:
      "Entwicklungsmodus — nicht über gespeicherte Historie gemittelt. In Produktion zeigt die Seite die Verfügbarkeit aus geplanten Cron-Läufen.",
    uptimePending:
      "Der Verfügbarkeitsprozentwert erscheint hier, sobald der Status-Cron mindestens einen Eintrag in die Historie geschrieben hat (Zeitlinien nutzen denselben Speicher).",
    noSnapshotCron:
      "Noch keine Momentaufnahme. Cron-Route einmal auslösen (siehe Vercel Cron) oder auf den nächsten Lauf warten.",
    noSnapshotMongo:
      "MongoDB ist nicht konfiguriert — Momentaufnahmen werden nicht gespeichert. In der Entwicklung führt diese Seite Prüfungen bei jedem Laden aus; setzen Sie MONGODB_URI und CRON_SECRET auf Vercel für Produktionsüberwachung.",
    allChecksPassing: "Alle Prüfungen bestanden",
    someChecksFailing: "Einige Prüfungen fehlgeschlagen",
    updated: "Aktualisiert",
    storedUtc: " (gespeichert, UTC)",
    utcOnly: " (UTC)",
    httpStatus: "HTTP {{code}}",
    noResponse: "Keine Antwort",
    footnoteAria: "Technische Details für Betrieb dieser Statusseite",
    footnoteTitle: "Fußnote — Hosting und Konfiguration",
    footnoteP1Before: "Diese Seite ist öffentlich. Die folgenden Angaben richten sich an",
    footnoteP1Strong: "Teams, die inta.dev bereitstellen",
    footnoteP1After: "(Umgebungsvariablen, Datenaufbewahrung).",
    footnoteP2a: "Ziele konfigurieren mit",
    footnoteP2b: "(vollständiger Ersatz) oder",
    footnoteP2c:
      "(anhängen). Eine Prüfung gilt als bestanden, wenn der HTTP-Status unter 500 liegt. Das Incident-Log zeigt fehlgeschlagene Cron-Läufe in diesem Fenster, inkl. Prüftext wenn gespeichert.",
    footnoteP2d:
      "Zeitlinien, Incident-Log und Latenz-Trends nutzen denselben rollierenden Speicher: die letzten {{hours}} Stunden (UTC), bis zu {{maxRows}} Einträge pro Anfrage (14-Tage-TTL in Mongo). Die Kopf-Verfügbarkeit nutzt dasselbe Fenster: Läufe zählen nur als „vollständig up“, wenn alle Ziele bestanden haben und der Zeitpunkt außerhalb zutreffender Betreiber-Hinweise und Wartung liegt. Einstellbar mit STATUS_HISTORY_WINDOW_HOURS und STATUS_HISTORY_MAX_ROWS. Zeiten sind UTC. Neue Historienzeilen speichern pro Ziel",
    footnoteP2e:
      "; ältere Zeilen steuern weiter Hoch/Tief-Segmente bis zum Ablauf.",
    incidentHeading: "Incident-Protokoll",
    incidentEmptyBody:
      "Ein Incident ist ein gespeicherter Cron-Lauf, in dem mindestens ein Ziel ausgefallen ist (HTTP 5xx, Timeout oder keine Antwort — dieselben Regeln wie bei Live-Prüfungen). Wenn die jüngste Historie überall bestanden hat, bleibt diese Liste leer.",
    incidentListIntro:
      "Gruppiert nach Ziel/Monitor. Pro Ziel werden aufeinanderfolgende fehlgeschlagene Läufe mit derselben Prüfmeldung zu einer Zeile mit UTC-Zeitfenster zusammengefasst (neueste Gruppen zuerst), im selben rollierenden Fenster wie Zeitlinien und Verfügbarkeit. Meldungen stammen von der Prüfung wenn vorhanden; ältere Historienzeilen können nur einen generischen Grund zeigen.",
    degraded: "Beeinträchtigt",
    timelineNoHistory:
      "Noch keine Historie. Sobald MongoDB und Cron Läufe speichern, erscheinen die letzten Prüfungen hier.",
    timelineCurrentCheckDev: "Nur aktuelle Prüfung (Dev)",
    timelineRecentChecks:
      "Letzte Prüfungen — letzte {{window}} ({{count}} Messungen)",
    timelineAriaSummary:
      "{{n}} Prüfungen: {{clear}} vollständig OK, {{flagged}} mit Ausfall, Hinweis oder Wartung",
    timelineTooltipUp: "{{time}} — OK",
    timelineTooltipDown: "{{time}} — Ausfall",
    timelineTooltipNotice: "{{time}} — Operatorenhinweis",
    timelineTooltipMaintenance: "{{time}} — Geplante Wartung",
    timelineIssueListIntro: "Nicht vollständig OK (UTC)",
    timelineIssueLabelDown: "Prüfung fehlgeschlagen",
    timelineIssueLabelNotice: "Operatorenhinweis",
    timelineIssueLabelMaintenance: "Geplante Wartung",
    timelineIssueMore: "+ {{n}} weitere…",
    latencyNeedsTwoRuns:
      "Antwortzeit-Trend braucht mindestens zwei gespeicherte Läufe mit Latenz (nachdem der nächste Cron latencyMs schreibt).",
    latencyResponseTime: "Antwortzeit ({{label}})",
    latencyAriaTrend:
      "Latenz-Trend für {{label}}: {{min}}–{{max}} ms über {{n}} Prüfungen",
    latencyMin: "Min",
    latencyMax: "Max",
    latencyLatest: "Zuletzt",
    latencyByRegionCaption: "Antwortzeit je Prüfstandort",
    latencyDefaultRegionLabel: "Diese Prüfung",
    badgeMainUptime:
      "Servicezuverlässigkeit: {{percent}} Verfügbarkeit (letzte {{window}})",
    badgeSubMonitored:
      "Kontinuierlich über globale Endpunkte überwacht",
    badgePlaceholder: "Servicezuverlässigkeit",
    badgeCollecting: "Geplante Prüfungen werden erfasst…",
    badgeLink: "Live-Status ansehen →",
    badgeLogoAlt: "Intastellar Consents",
    badgePoweredBy: "Bereitgestellt von inta.dev",
    uptimeJsonWidgetDescription:
      "In den letzten {{hours}} Stunden wurden {{totalRuns}} geplante Läufe gespeichert; {{passedRuns}} gelten als vollständig erfolgreich (alle Proben OK, keine zutreffende Betreiber-Meldung oder Wartung).",
    uptimeJsonNoHistoryDescription:
      "Die Verfügbarkeit erscheint hier, sobald geplante Health-Checks gespeichert wurden.",
    embedBadgeButton: "Badge einbinden",
    embedModalTitle: "Verfügbarkeits-Badge einbinden",
    embedModalIntro:
      "Kopieren Sie ein iframe-Snippet oder die JSON-API-URL. Sprache: ?locale= (en, de, da, fr, nl, pt-br). Erscheinungsbild: ?theme=light oder ?theme=dark für festes Hell-/Dunkelschema — ohne theme (oder theme=auto) folgt das Badge der Systemeinstellung des Besuchers.",
    embedPreviewHeading: "Vorschau",
    embedThemeLabel: "Badge-Erscheinungsbild",
    embedIframeHeading: "iframe-Einbindung",
    embedIframeTitle: "Verfügbarkeits-Badge",
    embedJsonHeading: "JSON-API",
    embedJsonHint:
      "URL für fetch() oder curl — liefert widgetTitle, widgetDescription, statusPageUrl und badgeEmbedUrl.",
    embedCopy: "Kopieren",
    embedCopied: "Kopiert",
    embedModalClose: "Schließen",
    embedOpenOnSite: "Seite auf Ihrer Installation öffnen, um URLs zu erzeugen.",
    maintenanceHeading: "Geplante Wartung",
    maintenanceEmpty:
      "Derzeit sind keine laufenden oder bevorstehenden Wartungsfenster veröffentlicht.",
    maintenanceActiveBadge: "Läuft",
    maintenanceUpcomingBadge: "Bevorstehend",
    maintenanceRange: "{{start}} → {{end}}",
    deployHeading: "Letztes Deployment",
    deployUnavailable:
      "Der letzte Commit wird aus dem Intastellar-Consents-GitHub-Repository geladen (nicht vom Deploy dieser Seite). Leer, wenn die GitHub-API nicht erreichbar ist oder limitiert — mit GITHUB_TOKEN höhere Limits.",
    deployCommit: "Commit",
    deployBranch: "Branch",
    deployMessage: "Nachricht",
    deployViewCommit: "Commit auf GitHub ansehen",
    trustHeading: "So messen wir Verfügbarkeit",
    trustIntro: "Kurze Hinweise, was diese Seite darstellt.",
    trustBulletSynthetic:
      "Synthetische Prüfungen: automatisierte HTTP-Anfragen von unserem Hosting-Anbieter zu jeder öffentlichen URL unten — kein Real-User-Monitoring (RUM).",
    trustBulletFrequency:
      "Zeitplan: in Produktion etwa einmal pro Minute (Cron-Konfiguration Ihres Projekts).",
    trustBulletPass:
      "Eine Prüfung gilt als bestanden, wenn der HTTP-Status unter 500 liegt; Timeouts und Netzwerkfehler zählen als fehlgeschlagen.",
    trustBulletHistory:
      "Zeitlinien, Incident-Log, Latenz-Trends und die Kopf-Verfügbarkeit nutzen gespeicherte Prüfungen der letzten {{hours}} Stunden (UTC), bis zu {{maxRows}} Messungen pro Abruf (MongoDB-TTL etwa 14 Tage). Betreiber-Hinweise und Wartung werden in der Kopfzahl wie Ausfallzeit behandelt, wenn sie zutreffen.",
    trustBulletUtc: "Alle Zeiten auf dieser Seite sind UTC.",
    manualNoticesHeading: "Hinweise vom Betrieb",
    manualNoticesIntro:
      "Updates vom Team zu Vorfällen oder Nachverfolgung (getrennt von der automatisierten Prüfhistorie unten).",
    manualPostedBy: "Veröffentlicht von {{email}}",
    manualResolvedPrefix: "Gelöst",
    manualSeverityInvestigating: "In Analyse",
    manualSeverityIdentified: "Identifiziert",
    manualSeverityMonitoring: "Überwachung",
    manualSeverityResolved: "Behoben",
    manualUpdateMeta: "Aktualisierung · {{atLabel}} · {{email}}",
    manualUpdatesHeading: "Aktualisierungen",
    affectedMonitorsLabel: "Monitore",
    subscribeRss: "Abonnieren (RSS)",
    subscribeRssTitle: "RSS-Feed mit Betreiberhinweisen und geplanter Wartung",
    subscribeSectionHeading: "Updates abonnieren",
    subscribeSectionIntro:
      "Wählen Sie, welche Arten von Updates Sie möchten. RSS-Reader laden neue Einträge von der Feed-URL; E-Mail wird gesendet, wenn wir ein passendes Wartungsfenster oder einen Betreiberhinweis veröffentlichen.",
    subscribeTopicsLabel: "Einschließen",
    subscribeTopicMaintenance: "Geplante Wartung",
    subscribeTopicIncidents: "Betreiberhinweise & Monitoring-Alarme",
    subscribePickTopicsError: "Mindestens einen Update-Typ auswählen.",
    subscribeRssUrlHelp: "RSS (in den Reader einfügen oder URL kopieren)",
    subscribeOpenRss: "RSS-Feed öffnen",
    subscribeCopyFeedUrl: "Feed-URL kopieren",
    subscribeCopied: "Kopiert",
    subscribeEmailHelp: "E-Mail",
    subscribeEmailCheckbox: "Benachrichtigungen per E-Mail (Double-Opt-in)",
    subscribeEmailUnavailable:
      "E-Mail-Benachrichtigungen benötigen MongoDB und Resend (RESEND_API_KEY und STATUS_NOTIFY_FROM). RSS oben funktioniert weiter.",
    subscribeEmailInputLabel: "E-Mail-Adresse",
    subscribeEmailPlaceholder: "sie@example.com",
    subscribeEmailSubmit: "E-Mail-Benachrichtigung anfordern",
    subscribeEmailVerifySent:
      "Bitte Posteingang prüfen und den Bestätigungslink anklicken.",
    subscribeEmailUpdated: "Ihre E-Mail-Einstellungen wurden aktualisiert.",
    subscribeEmailErrorGeneric: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    notifyFlashVerified: "Ihr E-Mail-Abonnement ist bestätigt.",
    notifyFlashUnsubscribed: "Sie sind von Status-E-Mails abgemeldet.",
    notifyFlashVerifyMissing: "Bestätigungslink ohne Token.",
    notifyFlashVerifyInvalid: "Ungültiger oder bereits genutzter Bestätigungslink.",
    notifyFlashUnsubMissing: "Abmeldelink ohne Token.",
    notifyFlashUnsubInvalid: "Ungültiger Abmeldelink.",
  },
};
