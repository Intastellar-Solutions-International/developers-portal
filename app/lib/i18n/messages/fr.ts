import type { MessageTree } from "./en";

export const fr: MessageTree = {
  meta: {
    homeTitle: "inta.dev · Intastellar Developers",
    homeDescription:
      "Documentation, clés API et guides d’intégration sur inta.dev pour Intastellar Consents et Intastellar Accounts — tous deux des produits d’Intastellar Solutions International.",
  },
  seo: {
    searchTitle: "Recherche · inta.dev",
    searchDescription: "Rechercher dans la documentation développeur Intastellar.",
    changelogTitle: "Journal des versions · inta.dev",
    changelogDescription:
      "Historique des versions pour Intastellar Consents, Intastellar Analytics et Intastellar Sign-In.",
    legalIndexTitle: "Mentions légales · inta.dev",
    legalIndexDescription:
      "Informations juridiques pour inta.dev : confidentialité, conditions et liens vers les politiques Intastellar Solutions et le DPA.",
    legalPrivacyTitle: "Politique de confidentialité · inta.dev",
    legalPrivacyDescription:
      "Comment inta.dev traite les données personnelles, les cookies, Google Tag Manager, Intastellar Consents et la connexion.",
    legalTermsTitle: "Conditions d’utilisation · inta.dev",
    legalTermsDescription:
      "Conditions d’utilisation du portail développeur inta.dev, de la documentation et des fonctionnalités de compte.",
    accountLoginTitle: "Connexion · inta.dev",
    notFoundTitle: "Page introuvable · inta.dev",
    notFoundDescription: "Cette page n’existe pas sur inta.dev.",
  },
  lang: {
    label: "Langue",
    en: "English",
    de: "Deutsch",
    da: "Dansk",
    fr: "Français",
    nl: "Nederlands",
    "pt-br": "Portugais (Brésil)",
  },
  nav: {
    docs: "Documentation",
    apiKeys: "Clés API",
    signIn: "Connexion",
    signOut: "Déconnexion",
    signingIn: "Connexion…",
    searchAria: "Rechercher dans la documentation",
    searchTitle: "Recherche (⌘K)",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    siteMenu: "Menu du site",
    menu: "Menu",
    main: "Principal",
    mainNav: "Navigation principale",
    colorTheme: "Thème de couleur",
    intastellarSolutions: "Intastellar Solutions",
    intastellarSolutionsTitle: "Intastellar Solutions (ouvre un nouvel onglet)",
    opensNewTab: "(ouvre un nouvel onglet)",
    logoHomeTitle: "Intastellar Developers — accueil",
    changelog: "Journal des modifications",
    changelogTitle: "Consents, Analytics et Sign-In — versions npm et GitHub",
    documentation: "Documentation",
    intastellarConsents: "Intastellar Consents",
    intastellarAnalytics: "Intastellar Analytics",
    profile: "Profil",
  },
  footer: {
    tagline:
      "Documentation, clés API et guides d’intégration pour Intastellar Consents et Intastellar Accounts — tous deux des produits d’Intastellar Solutions International.",
    documentation: "Documentation",
    allDocs: "Toute la documentation",
    intastellarConsents: "Intastellar Consents",
    intastellarAnalytics: "Intastellar Analytics",
    accountsSignIn: "Accounts — Connexion",
    searchDocs: "Rechercher dans la documentation",
    platform: "Plateforme",
    home: "Accueil",
    changelog: "Journal des modifications",
    signIn: "Connexion",
    apiKeys: "Clés API",
    legal: "Mentions légales",
    legalOverview: "Vue d’ensemble juridique",
    privacy: "Confidentialité (inta.dev)",
    terms: "Conditions (inta.dev)",
    dpaCorporate: "DPA (groupe)",
    intastellar: "Intastellar",
    intastellarSolutions: "Intastellar Solutions",
    cookieConsentsProduct: "Produit cookie consents",
    copyright: "© {{year}} Intastellar Solutions. Tous droits réservés.",
    statusOk: "État du système",
    statusDegraded: "Certaines vérifications échouent",
  },
  home: {
    heroTitle: "Construit avec Intastellar",
    heroLead1: "Documentation, guides et outils pour déployer un ",
    heroLeadConsent: "consentement aligné RGPD",
    heroLead2: " et une ",
    heroLeadSignin: "connexion sécurisée",
    heroLead3: " avec la même stack qu’Intastellar — le tout sur ",
    heroLeadBrand: "inta.dev",
    heroLead4: ".",
    searchDocs: "Rechercher dans la documentation",
    cardConsentsTitle: "Intastellar Consents",
    cardConsentsBody:
      "Bannière cookies, CMP et API de consentement pour le web, WordPress, GTM, Shopify, etc.",
    cardConsentsCta: "Ouvrir la documentation",
    cardAnalyticsTitle: "Intastellar Analytics",
    cardAnalyticsBody:
      "Pages vues, rage clicks, profondeur de défilement, événements e-commerce et insights SEO — aucun setup côté serveur.",
    cardAnalyticsCta: "Ouvrir la documentation",
    cardAccountsTitle: "Intastellar Accounts",
    cardAccountsBody:
      "SDK React sur inta.dev, flux de type OAuth, PKCE, sessions et modèles de sécurité pour vos apps et sites.",
    cardAccountsCta: "Ouvrir la documentation",
    cardAllTitle: "Toute la documentation et clés API",
    cardAllBody:
      "Parcourez les guides produit, suivez les versions et gérez les clés du portail développeur.",
    cardAllCta: "Tout parcourir",
    quickConsents: "Consents — démarrage rapide",
    quickAccounts: "Accounts — démarrage rapide",
    signInPortal: "Se connecter au portail",
    bandTitle: "Gagnez du temps avec la recherche et les versions",
    bandBody:
      "Accédez à n’importe quelle page par recherche plein texte, suivez les mises à jour sur le changelog et centralisez vos clés API après connexion.",
    openSearch: "Ouvrir la recherche",
    changelog: "Journal des modifications",
    apiKeys: "Clés API",
  },
  intaTryout: {
    introBeforePrivacy:
      "Modifiez le JSON ci-dessous pour changer window.INTA. L’aperçu se recharge lorsque le JSON est valide. Les URL de politique pointent par défaut vers la ",
    privacyPage: "page de confidentialité",
    introAfterPrivacy:
      " de ce site. L’aperçu utilise la même origine et le même localStorage que cette documentation.",
    minimumSetupTitle: "Configuration minimale",
    minimumSetupLeadBeforeRoot: "Il vous suffit d’une URL de politique valide, ",
    minimumSetupLeadBetweenRootCompany: ", ",
    minimumSetupLeadBeforeUc: ", et de la balise ",
    minimumSetupLeadAfterUc:
      ". Tout le reste est du branding ou des intégrations facultatifs.",
    copyMinimumSnippet: "Copier l’extrait minimal",
    whatNextTitle: "Ensuite",
    whatNextStep1:
      "Vous collez les deux balises script en haut du <head>, avant les tags d’analyse ou marketing.",
    whatNextStep2:
      "uc.js lit window.INTA et affiche la bannière si l’URL de politique répond.",
    whatNextStep3:
      "Le visiteur accepte, refuse ou affine ; la CMP enregistre la décision (cookies / stockage pour votre domaine).",
    whatNextStep4:
      "Lors des changements de consentement, cookie_consent_update est envoyé au dataLayer pour GTM — voyez-le dans la console ci-dessous.",
    whatNextStep5Before: "Reliez GTM / tags fournisseurs à ces signaux (voir ",
    whatNextStep5Between: ", ",
    whatNextStep5After: ").",
    docLinkQuickstart: "Démarrage rapide",
    docLinkEventsApi: "Événements et API",
    editorLabel: "window.INTA (JSON)",
    format: "Formater",
    reset: "Réinitialiser",
    copyHtmlSnippet: "Copier l’extrait HTML",
    copied: "Copié",
    jsonErrorPrefix: "JSON : ",
    fieldReferenceTitle: "Référence des champs",
    fieldReferenceAria: "Référence des champs",
    fieldHints: {
      policy_link:
        "URL HTTPS publique de votre politique de confidentialité. Des URL invalides ou factices empêchent souvent l’affichage de la bannière.",
      settingsPrivacyPolicy:
        "URL de politique alternative lue par certaines builds ; alignez-la sur policy_link si les deux sont définis.",
      settingsRootDomain:
        "Domaine enregistrable pour les cookies (p. ex. example.com). Doit correspondre au site utilisé par les visiteurs.",
      settingsCompany: "Nom affiché dans l’interface de consentement.",
      settingsColor: "Couleur d’accent principale (hex CSS ou jeton).",
      settingsLogo: "URL absolue du logo ; omettre ou vide si aucun.",
      settingsDesign: "Préréglage de mise en page (p. ex. overlay).",
      settingsArrange: "ltr ou rtl pour la direction de mise en page.",
      settingsGtagId:
        "ID de balise GA4 / Google pour le mode consentement via la CMP ; omettre tant que vous n’utilisez pas les balises Google.",
      settingsRequiredCookies: "Noms des cookies strictement nécessaires définis par votre site.",
      settingsKeepInLocalStorage:
        "Clés localStorage que la CMP ne doit pas effacer lors des changements de consentement.",
    },
    fullSchema: "Schéma complet",
    fullSchemaExtra: "autorise des clés supplémentaires.",
    pasteFooterBefore:
      "Collez l’extrait copié dans le <head> avant les autres scripts de suivi. ",
    pasteFooterAfter: " décrit les règles de placement.",
    quickstartLink: "Démarrage rapide",
    debugConsoleTitle: "Console événements / débogage",
    clear: "Effacer",
    debugEmpty:
      "Les envois dataLayer, les messages d’aperçu et la sortie console transférée depuis l’iframe apparaissent ici. Interagissez avec la bannière pour voir ",
    debugEmptyCode: "cookie_consent_update",
    debugEmptyAfter: ".",
    bannerPreview: "Aperçu de la bannière",
    wideFrameHint:
      "Cadre bureau large (1280 px) — faites défiler horizontalement si le panneau est plus étroit.",
    iframeDocumentTitle: "Aperçu de la bannière",
    iframePreviewHint:
      "Aperçu en direct — le vrai script CMP de notre CDN s’exécute ici. Le cadre est de même origine que l’app docs, donc localStorage fonctionne ; des clés de consentement peuvent rester dans le stockage de ce site jusqu’à suppression.",
    previewUpdated: "HTML d’aperçu mis à jour — l’iframe se recharge.",
    fixJsonPreview: "Corrigez le JSON pour charger l’aperçu.",
    loadingPreview: "Chargement de l’aperçu…",
    configMustBeObject:
      "La configuration doit être un objet JSON (pas un tableau ni une valeur primitive).",
    iframeBannerPreviewTitle: "Aperçu bannière Intastellar Consents",
    dataLayer: "dataLayer",
    dataLayerConsent: "dataLayer (cookie_consent_update)",
    windowError: "window.error",
    preview: "aperçu",
    demoCompany: "Acme Demo",
  },
  legacy: {
    line1Strong: "Anciennement developers.intastellarsolutions.com",
    line1Mid: " — la documentation et les outils développeur sont maintenant sur ",
    line1Brand: "inta.dev",
    line1AfterBrand: ".",
    line2Before: "L’ancien site mettait l’accent sur les ",
    badge: "comptes développeur",
    line2After:
      " uniquement — aucune facturation ni produit payant n’y était proposé.",
  },
  a11y: {
    colorTheme: "Thème de couleur",
    lightTheme: "Thème clair",
    darkTheme: "Thème sombre",
  },
  docs: {
    breadcrumbDocumentation: "Documentation",
    hubMetaTitleCore: "Documentation",
    hubMetaDescription:
      "Documentation des produits développeur Intastellar : Intastellar Consents, connexion web et API.",
    hubEyebrow: "Intastellar developers",
    hubHeading: "Documentation",
    hubLead:
      "Guides pour le consentement cookies et la connexion web avec Intastellar Accounts — plus les clés API et modèles réutilisables sur sites et backends.",
    hubVersionNote:
      "Les URL incluent un segment de version (ex. /v1/) pour publier de nouveaux guides majeurs sans casser les favoris.",
    hubSearchDocs: "Rechercher dans la documentation",
    hubChangelog: "Journal des modifications",
    hubApiKeys: "Clés API",
    popularGuides: "Guides populaires",
    popularGuidesHint: "Accès direct aux parcours d’intégration courants.",
    allProducts: "Tous les produits",
    allProductsHint:
      "Table des matières complète, versions et liens croisés dans chaque espace.",
    sidebarOverview: "Vue d’ensemble",
    sidebarAccounts: "Connexion (Web)",
    sidebarJavascript: "JavaScript",
    sidebarWordpress: "WordPress",
    sidebarIntegrations: "Intégrations",
    sidebarMore: "Plus",
    relatedHeading: "Voir aussi",
    relatedAccountsSignIn: "Accounts — Connexion (Web)",
    ql1Label: "Consents — JavaScript",
    ql1Hint: "Snippet, window.INTA, premier déploiement",
    ql2Label: "Consents — WordPress",
    ql2Hint: "Installation et configuration du plugin",
    ql3Label: "Accounts — React et JS pur",
    ql3Hint: "SDK sur npm, HTML/JS sur inta.dev, exemples placeholder",
    ql4Label: "Accounts — HTML / CSS / JS",
    ql4Hint: "Sites statiques sans framework — js-docs migrés",
    ql5Label: "Accounts — Premiers pas",
    ql5Hint: "Enregistrer le client, SDK vs OAuth manuel, flux",
    ql6Label: "Accounts — Flux authorization code",
    ql6Hint: "PKCE, callback, échange de jetons",
    copyCode: "Copier le code",
    copied: "Copié",
    copyFailed: "Échec",
    onThisPage: "Sur cette page",
    docPageFallbackDescription:
      "{{title}} — Documentation développeur Intastellar sur inta.dev.",
    saveToProfile: "Enregistrer dans le profil",
    removeFromProfile: "Retirer du profil",
    bookmarkToastSaved: "Enregistré sur votre profil.",
    bookmarkToastRemoved: "Retiré de votre liste enregistrée.",
    saveToProfileHint:
      "Connectez-vous avec une session portail (même compte que les clés API) pour ajouter cette page à votre profil.",
    onYourProfile:
      "Cette page figure dans vos enregistrements (Compte → Profil).",
    saveLoginModalTitle: "Enregistrer cette page dans votre profil",
    saveLoginModalClose: "Fermer",
    saveLoginModalSignInPopup: "Se connecter avec Intastellar",
    saveLoginModalSignInGitHub: "Continuer avec GitHub",
    saveLoginModalOpenLoginPage: "Ouvrir la page de connexion",
    saveLoginModalOpenProfile: "Ouvrir le profil du compte",
  },
  search: {
    inputAria: "Rechercher dans la documentation",
    placeholder: "Rechercher dans la documentation…",
    noIndexRun: "Aucun index de recherche. Exécutez",
    noIndexOr: "(ou",
    noIndexRestart: ") puis redémarrez le serveur de dev.",
    noResults: "Aucun résultat. Essayez un terme plus court ou vérifiez l’orthographe.",
    title: "Rechercher dans la documentation",
    overlayHelp:
      "Échap pour fermer · ⌘K / Ctrl+K depuis la page · Flèches et Entrée pour ouvrir un résultat",
    pageIntro:
      "Filtrer par titre, slug produit et contenu. Raccourcis : ⌘K / Ctrl+K ouvre l’overlay ; flèches et Entrée pour choisir.",
  },
  profile: {
    metaTitle: "Profil · inta.dev",
    heading: "Profil",
    loading: "Chargement de la session…",
    ssoBefore: "Pour activer le SSO Intastellar, définissez",
    ssoAfter: "dans votre environnement.",
    seeSignInBefore: "Voir la",
    seeSignInAfter: "page pour plus de détails.",
    signedOut:
      "Vous êtes déconnecté. Connectez-vous avec votre compte Intastellar pour voir votre profil ici.",
    signInWithIntastellar: "Se connecter avec Intastellar",
    openSignInPage: "Ouvrir la page de connexion",
    intro:
      "Votre identité développeur provient d’Intastellar Accounts. Utilisez les clés API pour l’authentification serveur et enregistrez ici des pages de documentation pour y accéder rapidement pendant le développement.",
    manageAccount: "Gérer votre compte Intastellar",
    savedDocsHeading: "Documentation enregistrée",
    savedDocsEmpty:
      "Aucune page enregistrée pour l’instant. Ouvrez un guide et utilisez « Enregistrer dans le profil » en bas de page.",
    savedDocsRemove: "Retirer",
    savedDocsMongoOff:
      "La documentation enregistrée nécessite MongoDB sur ce serveur. La connexion reste disponible.",
    savedDocsNeedAccount:
      "Terminez la connexion pour que le portail associe votre compte (visitez les clés API ou rechargez après connexion) et activez les pages enregistrées.",
    savedDocsErrorGeneric:
      "Impossible de mettre à jour la documentation enregistrée. Réessayez.",
    savedDocsErrorInvalid: "Ce lien de documentation n’est pas valide.",
    linkGitHubHeading: "Connexion GitHub",
    linkGitHubDescription:
      "Liez votre compte GitHub pour pouvoir vous connecter avec GitHub ensuite. Votre profil GitHub doit afficher un e-mail vérifié qui correspond à ce compte portail (comme Intastellar).",
    linkGitHubButton: "Lier le compte GitHub",
    githubLinkedBadge: "GitHub lié en tant que @{{login}}",
    githubLinkedNotice: "GitHub est maintenant lié à ce compte.",
    linkGitHubErrorEmailMismatch:
      "L’e-mail vérifié GitHub ne correspond pas à ce compte. Utilisez le même e-mail vérifié sur GitHub que sur Intastellar.",
    linkGitHubErrorNoVerifiedEmail:
      "GitHub n’a pas renvoyé d’e-mail vérifié. Définissez un e-mail public ou accordez la portée user:email.",
    linkGitHubErrorGithubTaken:
      "Ce compte GitHub est déjà lié à un autre utilisateur du portail.",
    linkGitHubErrorNotFound: "Compte portail introuvable.",
    linkGitHubErrorSessionMismatch:
      "Votre session a changé pendant la liaison. Fermez les autres onglets et réessayez.",
    linkGitHubErrorInvalid: "Demande de liaison invalide. Réessayez depuis votre profil.",
    linkGitHubErrorRequiresMongo:
      "La liaison GitHub nécessite MongoDB sur ce serveur.",
  },
  account: {
    layoutTitle: "Compte",
    layoutDescription:
      "Connectez-vous avec Intastellar ou GitHub, gérez votre profil et vos clés API développeur.",
    loginHeading: "Connexion",
    loginIntro:
      "Utilisez votre compte Intastellar (SSO) ou votre compte GitHub pour vous connecter.",
    loginAriaBusy: "Chargement",
    loginIntastellarLogoAlt: "Logo Intastellar",
    loginSignInIntastellar: "Se connecter avec Intastellar",
    loginCheckingSession: "Vérification de la session…",
    loginSsoNotConfiguredLead: "Le SSO n’est pas configuré. Définissez",
    loginSsoNotConfiguredMid: "(et éventuellement",
    loginSsoNotConfiguredTail:
      ") dans votre environnement, puis redémarrez le serveur de développement.",
    loginLegalPrefix: "En vous connectant, vous acceptez les",
    loginLegalTermsLabel: "Conditions d’utilisation",
    loginLegalBetween: "et la",
    loginLegalPrivacyLabel: "Politique de confidentialité",
    loginLegalSuffix: ".",
    loginGitHubSignIn: "Continuer avec GitHub",
    loginGitHubHint:
      "Même compte portail et docs enregistrés qu’avec Intastellar après autorisation GitHub.",
    loginGitHubErrorDisabled:
      "La connexion GitHub n’est pas configurée sur ce serveur.",
    loginGitHubErrorDenied: "Autorisation GitHub annulée.",
    loginGitHubErrorState: "État de connexion incorrect. Réessayez.",
    loginGitHubErrorToken:
      "Impossible de terminer la connexion GitHub. Réessayez.",
    loginGitHubErrorUser:
      "Impossible de charger votre profil GitHub. Réessayez.",
    loginGitHubErrorUnknown: "Échec de la connexion GitHub. Réessayez.",
    loginGitHubErrorLinkRequiresLogin:
      "Connectez-vous d’abord au portail, puis liez GitHub depuis votre profil.",
    loginGitHubErrorLinkRequiresMongo:
      "La liaison GitHub nécessite MongoDB sur ce serveur.",
  },
  apiKeys: {
    metaTitle: "Clés API · inta.dev",
    heading: "Clés API",
    loading: "Chargement…",
    setSsoBefore: "Définissez",
    setSsoAfterCode: "dans votre environnement ",
    setSsoAfter:
      "pour activer la connexion, puis configurez MongoDB ci-dessous.",
    signInToManageAfter:
      "avec Intastellar pour créer et révoquer des clés. Elles sont liées à l’e-mail de votre compte.",
    mongoBeforeUri: "Ajoutez",
    mongoAfterUri:
      "(chaîne de connexion Atlas) à l’environnement serveur. Optionnel :",
    mongoBeforeDb: "(",
    mongoDefaultWord: "par défaut",
    mongoAfterDb: "),",
    mongoAfterPepper:
      "(obligatoire en production — hachage et stockage chiffré pour réafficher dans ce portail).",
    sessionSyncing: "Synchronisation de la session avec le serveur…",
    sessionHardFailP1:
      "Connecté dans l’app, mais la requête clés API n’a pas de cookie de session portail. Causes fréquentes : cache loader obsolète,",
    sessionHardFailVs: "vs",
    sessionHardFailP2: ", ou absence de",
    sessionHardFailP3:
      "en production (le cookie de session signé ne peut pas être créé).",
    sessionHardFailBulletRefresh:
      "Rechargez complètement la page ou ouvrez les clés API dans un nouvel onglet.",
    sessionHardFailBulletHostOpen: "N’utilisez qu’un seul hôte en dev (",
    sessionHardFailBulletHostClose: ").",
    sessionHardFailBulletSecretBefore: "Définissez",
    sessionHardFailBulletSecretAfter: "en production.",
    signInAgain: "Se reconnecter",
    sessionAligning:
      "Alignement de la session serveur avec votre compte… Si cela persiste, rechargez la page.",
    sessionVerifyBefore:
      "Le serveur n’a pas pu vérifier votre cookie de session. Actualisez après connexion, ou",
    sessionVerifyLink: "déconnectez-vous et reconnectez-vous",
    sessionVerifyAfter: ".",
    newKeyBanner:
      "Clé créée. Le secret complet est dans le tableau ci-dessous — utilisez {{copyKey}} là. Masquez-le avec l’icône œil ; rouvrez l’œil une fois connecté pour réafficher et copier (nous conservons une copie chiffrée côté serveur).",
    dismiss: "Fermer",
    optionalHintBeforeHttps:
      "Le domaine de connexion et l’URL du logo (optionnels) sont utilisés avec Intastellar Sign-In (nous stockons le nom d’hôte ; le logo doit être en ",
    optionalHintAfterHttps: ").",
    labelField: "Libellé",
    requiredMark: "*",
    placeholderLabel: "ex. Site de production",
    signInDomain: "Domaine de connexion",
    logoUrl: "URL du logo",
    placeholderDomain: "app.exemple.fr",
    placeholderLogo: "https://cdn.exemple.fr/logo.svg",
    createKey: "Créer une clé",
    busyEllipsis: "…",
    emptyList:
      "Aucune clé pour l’instant. Créez-en une pour un secret serveur ou outil. Nous stockons un hachage pour validation et une copie chiffrée pour réafficher et copier plus tard.",
    colLabel: "Libellé",
    colKey: "Clé",
    colSignInDomain: "Domaine de connexion",
    colLogo: "Logo",
    colCreated: "Créée",
    colActions: "Actions",
    copyKey: "Copier la clé",
    copied: "Copié",
    copyFailed: "Échec de la copie",
    logoUnloaded: "Non chargé",
    hideKey: "Masquer la clé",
    revealKey: "Afficher la clé pour copier",
    revealLoading: "Chargement…",
    noSecretStored:
      "Aucun secret chiffré enregistré (souvent une ancienne clé). Créez une nouvelle clé pour activer l’affichage et la copie.",
    openSignInRow: "Connexion",
    closeEditor: "Fermer",
    revoke: "Révoquer",
    editSignInTitle: "Intastellar Sign-In — domaine et logo pour cette clé",
    logoUrlHttps: "URL du logo (https)",
    placeholderLogoShort: "https://…",
    saveSignInSettings: "Enregistrer les paramètres de connexion",
    cancel: "Annuler",
    errors: {
      signInAgain: "Reconnectez-vous pour gérer les clés API.",
      dbNotConfiguredOnServer: "La base de données n’est pas configurée sur le serveur.",
      unknownAction: "Action inconnue.",
      dbNotConfigured: "Base de données non configurée.",
      enterLabel: "Saisissez un libellé pour cette clé.",
      domainInvalidCreate:
        "Le domaine de connexion semble invalide. Utilisez un nom d’hôte comme app.exemple.fr (vous pouvez coller une URL https complète — nous ne stockons que l’hôte).",
      logoInvalidCreateImage:
        "Le logo doit être une URL d’image https:// valide (ou laisser vide).",
      pepperMissing:
        "Mauvaise configuration serveur : définissez API_KEY_PEPPER (secret aléatoire long) en production.",
      invalidKeyId: "Identifiant de clé invalide.",
      keyNotFound: "Clé introuvable ou déjà révoquée.",
      noEncryptedOnFile:
        "Cette clé n’a pas de secret chiffré (souvent créée avant la fonction d’affichage). Créez une nouvelle clé.",
      decryptFailed:
        "Impossible de déchiffrer cette clé (le secret serveur a peut‑être changé). Créez une nouvelle clé.",
      domainInvalidUpdate:
        "Le domaine de connexion semble invalide. Utilisez un nom d’hôte comme app.exemple.fr.",
      logoInvalidUpdateUrl:
        "Le logo doit être une URL https:// valide ou rester vide.",
    },
  },
  status: {
    metaTitle: "État du système · inta.dev",
    metaDescription:
      "Vérifications de disponibilité des points d’accès publics Intastellar (Consents, CDN, inta.dev).",
    heading: "État du système",
    introBeforeLink:
      "Vérifications HTTP automatisées depuis inta.dev. Instantané lisible par machine :",
    introAfterLink: ".",
    ariaUptimeStored: "Disponibilité à partir des vérifications planifiées stockées",
    uptimeWord: "disponibilité",
    uptimeStoredRunsBefore:
      "Nous exécutons ces vérifications automatiquement selon un planning. Au cours des {{hours}} dernières heures (UTC), nous comptons",
    uptimeStoredRunsMid: "exécutions stockées ·",
    uptimeStoredRunsAfter:
      "comptent comme entièrement opérationnelles (tous les services OK sur l’exécution, sans incident opérateur ni maintenance applicable à cet instant).",
    devLiveProbeBefore: "Mode développement : affichage d’une sonde",
    devLiveProbeStrong: "en direct",
    devLiveProbeAfter:
      "(non enregistrée). En production, c’est le dernier instantané écrit par la tâche cron qui s’applique.",
    ariaUptimeDev: "Disponibilité issue uniquement d’une vérification de développement",
    onThisPageLoad: "sur ce chargement de page",
    devUptimeNote:
      "Mode développement — pas de moyenne sur l’historique stocké. En production, la disponibilité affichée provient des exécutions cron planifiées.",
    uptimePending:
      "Le pourcentage de disponibilité s’affichera ici après qu’au moins une ligne ait été écrite dans l’historique par le cron de statut (les chronologies utilisent le même stockage).",
    noSnapshotCron:
      "Pas encore d’instantané. Déclenchez la route cron une fois (voir Vercel Cron) ou attendez la prochaine exécution planifiée.",
    noSnapshotMongo:
      "MongoDB n’est pas configuré — les instantanés ne sont pas stockés. En développement, cette page exécute des vérifications à chaque chargement ; définissez MONGODB_URI et CRON_SECRET sur Vercel pour la surveillance en production.",
    allChecksPassing: "Toutes les vérifications OK",
    someChecksFailing: "Certaines vérifications échouent",
    updated: "Mis à jour",
    storedUtc: " (stocké, UTC)",
    utcOnly: " (UTC)",
    httpStatus: "HTTP {{code}}",
    noResponse: "Pas de réponse",
    footnoteAria: "Détails techniques pour l’exploitation de cette page de statut",
    footnoteTitle: "Note — hébergement et configuration",
    footnoteP1Before: "Cette page est publique. Les informations ci-dessous s’adressent aux",
    footnoteP1Strong: "équipes qui déploient inta.dev",
    footnoteP1After: "(variables d’environnement, conservation des données).",
    footnoteP2a: "Configurez les cibles avec",
    footnoteP2b: "(remplacement complet) ou",
    footnoteP2c:
      "(ajout). Une vérification est considérée comme réussie lorsque le statut HTTP est strictement inférieur à 500. Le journal d’incidents liste les exécutions en échec dans cette fenêtre, avec le texte d’erreur de la sonde lorsqu’il est enregistré.",
    footnoteP2d:
      "Chronologies, journal d’incidents et tendances de latence partagent le même stock roulant : les {{hours}} dernières heures (UTC), jusqu’à {{maxRows}} échantillons par requête (TTL Mongo ~14 jours). Le pourcentage de disponibilité en tête utilise la même fenêtre : une exécution ne compte comme « up » que si toutes les cibles ont réussi et que l’instant est hors incidents opérateur et maintenance applicables. Réglez STATUS_HISTORY_WINDOW_HOURS et STATUS_HISTORY_MAX_ROWS. Heures en UTC. Les nouvelles lignes d’historique enregistrent par cible",
    footnoteP2e:
      " ; les lignes plus anciennes alimentent encore les segments haut/bas jusqu’à expiration.",
    incidentHeading: "Journal des incidents",
    incidentEmptyBody:
      "Un incident est une exécution cron stockée où au moins une cible était indisponible (HTTP 5xx, délai dépassé ou pas de réponse — mêmes règles que les vérifications en direct). Si tout l’historique récent a réussi, cette liste reste vide.",
    incidentListIntro:
      "Regroupées par moniteur. Pour chaque cible, les exécutions échouées consécutives avec le même message de sonde sont fusionnées sur une ligne avec une plage horaire UTC (groupes les plus récents en premier), dans la même fenêtre glissante que les chronologies et la disponibilité. Les messages proviennent de la sonde lorsque c’est possible ; les entrées plus anciennes peuvent n’indiquer qu’une raison générique.",
    degraded: "Dégradé",
    timelineNoHistory:
      "Pas encore d’historique. Une fois MongoDB et le cron enregistrés, les vérifications récentes apparaissent ici.",
    timelineCurrentCheckDev: "Vérification actuelle uniquement (dev)",
    timelineRecentChecks:
      "Vérifications récentes — {{window}} ({{count}} échantillons)",
    timelineAriaSummary:
      "{{n}} vérifications : {{clear}} entièrement OK, {{flagged}} avec panne, avis opérateur ou maintenance",
    timelineTooltipUp: "{{time}} — OK",
    timelineTooltipDown: "{{time}} — Échec",
    timelineTooltipNotice: "{{time}} — Avis opérateur",
    timelineTooltipMaintenance: "{{time}} — Maintenance planifiée",
    timelineIssueListIntro: "Pas entièrement OK (UTC)",
    timelineIssueLabelDown: "Vérification en échec",
    timelineIssueLabelNotice: "Avis opérateur",
    timelineIssueLabelMaintenance: "Maintenance planifiée",
    timelineIssueMore: "+ {{n}} de plus…",
    latencyNeedsTwoRuns:
      "La tendance des temps de réponse nécessite au moins deux exécutions stockées avec latence (après que le prochain cron ait écrit latencyMs).",
    latencyResponseTime: "Temps de réponse ({{label}})",
    latencyAriaTrend:
      "Tendance de latence pour {{label}} : {{min}}–{{max}} ms sur {{n}} vérifications",
    latencyMin: "Min",
    latencyMax: "Max",
    latencyLatest: "Dernier",
    latencyByRegionCaption: "Temps de réponse par lieu de sonde",
    latencyDefaultRegionLabel: "Cette sonde",
    badgeMainUptime:
      "Fiabilité du service : {{percent}} de disponibilité ({{window}})",
    badgeSubMonitored:
      "Surveillance continue des points de terminaison mondiaux",
    badgePlaceholder: "Fiabilité du service",
    badgeCollecting: "Collecte des vérifications planifiées…",
    badgeLink: "Voir le statut en direct →",
    badgeLogoAlt: "Intastellar Consents",
    badgePoweredBy: "Propulsé par inta.dev",
    uptimeJsonWidgetDescription:
      "Au cours des {{hours}} dernières heures, {{totalRuns}} exécutions planifiées ont été stockées ; {{passedRuns}} comptent comme entièrement opérationnelles (toutes les sondes OK, sans incident opérateur ni maintenance applicable).",
    uptimeJsonNoHistoryDescription:
      "La disponibilité apparaîtra ici une fois les contrôles de santé planifiés enregistrés.",
    embedBadgeButton: "Intégrer le badge",
    embedModalTitle: "Intégrer le badge de disponibilité",
    embedModalIntro:
      "Copiez un extrait iframe ou l’URL de l’API JSON. Langue : ?locale= (en, de, da, fr, nl, pt-br). Apparence : ?theme=light ou ?theme=dark pour forcer clair ou sombre — sans theme (ou theme=auto), le badge suit le réglage système du visiteur.",
    embedPreviewHeading: "Aperçu",
    embedThemeLabel: "Apparence du badge",
    embedIframeHeading: "Intégration iframe",
    embedIframeTitle: "Badge de disponibilité",
    embedJsonHeading: "API JSON",
    embedJsonHint:
      "Utilisez cette URL dans fetch() ou curl — renvoie widgetTitle, widgetDescription, statusPageUrl et badgeEmbedUrl.",
    embedCopy: "Copier",
    embedCopied: "Copié",
    embedModalClose: "Fermer",
    embedOpenOnSite: "Ouvrez cette page sur votre site pour générer les URL.",
    maintenanceHeading: "Maintenance planifiée",
    maintenanceEmpty:
      "Aucune fenêtre de maintenance en cours ou à venir n’est publiée pour le moment.",
    maintenanceActiveBadge: "En cours",
    maintenanceUpcomingBadge: "À venir",
    maintenanceRange: "{{start}} → {{end}}",
    deployHeading: "Dernier déploiement",
    deployUnavailable:
      "Le dernier commit provient du dépôt GitHub Intastellar Consents (pas du déploiement de ce site). Vide si l’API GitHub est indisponible ou limitée — définissez GITHUB_TOKEN pour des quotas plus élevés.",
    deployCommit: "Commit",
    deployBranch: "Branche",
    deployMessage: "Message",
    deployViewCommit: "Voir le commit sur GitHub",
    trustHeading: "Comment nous mesurons la disponibilité",
    trustIntro: "Quelques précisions sur ce que représente cette page.",
    trustBulletSynthetic:
      "Contrôles synthétiques : requêtes HTTP automatisées depuis notre hébergeur vers chaque URL publique ci-dessous — pas de mesure utilisateur réelle (RUM).",
    trustBulletFrequency:
      "Cadence : en production environ une fois par minute (configuration cron de votre projet).",
    trustBulletPass:
      "Un contrôle est réussi lorsque le statut HTTP est strictement inférieur à 500 ; timeouts et erreurs réseau comptent comme échecs.",
    trustBulletHistory:
      "Chronologies, journal d’incidents, tendances de latence et pourcentage de disponibilité en tête utilisent les vérifications stockées sur les {{hours}} dernières heures (UTC), jusqu’à {{maxRows}} échantillons par chargement (TTL MongoDB ~14 jours). Les incidents opérateur et la maintenance active comptent comme indisponibilité lorsqu’ils s’appliquent.",
    trustBulletUtc: "Toutes les heures de cette page sont en UTC.",
    manualNoticesHeading: "Messages d’exploitation",
    manualNoticesIntro:
      "Mises à jour publiées par l’équipe en cas d’incident ou de suivi (séparées de l’historique automatique des sondes ci-dessous).",
    manualPostedBy: "Publié par {{email}}",
    manualResolvedPrefix: "Résolu",
    manualSeverityInvestigating: "Analyse en cours",
    manualSeverityIdentified: "Identifié",
    manualSeverityMonitoring: "Surveillance",
    manualSeverityResolved: "Résolu",
    manualUpdateMeta: "Mise à jour · {{atLabel}} · {{email}}",
    manualUpdatesHeading: "Mises à jour",
    affectedMonitorsLabel: "Surveillances",
    subscribeRss: "S’abonner (RSS)",
    subscribeRssTitle: "Flux RSS des avis opérateur et de la maintenance planifiée",
    subscribeSectionHeading: "S’abonner aux mises à jour",
    subscribeSectionIntro:
      "Choisissez les types de mises à jour. Les lecteurs RSS récupèrent les nouveaux éléments depuis l’URL du flux ; un e-mail est envoyé lorsque nous publions une fenêtre de maintenance ou un avis opérateur correspondant.",
    subscribeTopicsLabel: "Inclure",
    subscribeTopicMaintenance: "Maintenance planifiée",
    subscribeTopicIncidents: "Avis opérateur et alertes de surveillance",
    subscribePickTopicsError: "Sélectionnez au moins un type de mise à jour.",
    subscribeRssUrlHelp: "RSS (coller dans votre lecteur ou copier l’URL)",
    subscribeOpenRss: "Ouvrir le flux RSS",
    subscribeCopyFeedUrl: "Copier l’URL du flux",
    subscribeCopied: "Copié",
    subscribeEmailHelp: "E-mail",
    subscribeEmailCheckbox: "Recevoir des alertes par e-mail (double opt-in)",
    subscribeEmailUnavailable:
      "Les alertes e-mail nécessitent MongoDB et Resend (RESEND_API_KEY et STATUS_NOTIFY_FROM). Le RSS ci-dessus fonctionne toujours.",
    subscribeEmailInputLabel: "Adresse e-mail",
    subscribeEmailPlaceholder: "vous@example.com",
    subscribeEmailSubmit: "Demander les alertes e-mail",
    subscribeEmailVerifySent:
      "Vérifiez votre boîte de réception et cliquez sur le lien de confirmation.",
    subscribeEmailUpdated: "Vos préférences d’alerte e-mail ont été mises à jour.",
    subscribeEmailErrorGeneric: "Une erreur s’est produite. Réessayez.",
    notifyFlashVerified: "Votre abonnement e-mail est confirmé.",
    notifyFlashUnsubscribed: "Vous êtes désabonné des e-mails de statut.",
    notifyFlashVerifyMissing: "Lien de confirmation sans jeton.",
    notifyFlashVerifyInvalid: "Lien de confirmation invalide ou déjà utilisé.",
    notifyFlashUnsubMissing: "Lien de désabonnement sans jeton.",
    notifyFlashUnsubInvalid: "Lien de désabonnement invalide.",
  },
};
