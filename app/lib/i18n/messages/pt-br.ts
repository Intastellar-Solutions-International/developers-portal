import type { MessageTree } from "./en";

export const ptBr: MessageTree = {
  meta: {
    homeTitle: "inta.dev · Intastellar Developers",
    homeDescription:
      "Documentação, chaves de API e guias de integração no inta.dev para Intastellar Consents e Intastellar Accounts — ambos produtos da Intastellar Solutions International.",
  },
  seo: {
    searchTitle: "Busca · inta.dev",
    searchDescription: "Buscar na documentação para desenvolvedores Intastellar.",
    changelogTitle: "Changelog · inta.dev",
    changelogDescription:
      "Histórico de versões do Intastellar Consents (GitHub) e Intastellar Sign-In (npm + GitHub).",
    legalIndexTitle: "Jurídico · inta.dev",
    legalIndexDescription:
      "Informações jurídicas do inta.dev: privacidade, termos e links para políticas da Intastellar Solutions e DPA.",
    legalPrivacyTitle: "Política de privacidade · inta.dev",
    legalPrivacyDescription:
      "Como o inta.dev trata dados pessoais, cookies, Google Tag Manager, Intastellar Consents e login.",
    legalTermsTitle: "Termos de uso · inta.dev",
    legalTermsDescription:
      "Termos de uso do portal do desenvolvedor inta.dev, da documentação e dos recursos de conta.",
    accountLoginTitle: "Entrar · inta.dev",
    notFoundTitle: "Página não encontrada · inta.dev",
    notFoundDescription: "Esta página não existe no inta.dev.",
  },
  lang: {
    label: "Idioma",
    en: "English",
    de: "Deutsch",
    da: "Dansk",
    fr: "Français",
    nl: "Nederlands",
    "pt-br": "Português (Brasil)",
  },
  nav: {
    docs: "Documentação",
    apiKeys: "Chaves de API",
    signIn: "Entrar",
    signOut: "Sair",
    signingIn: "Entrando…",
    searchAria: "Buscar na documentação",
    searchTitle: "Buscar (⌘K)",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    siteMenu: "Menu do site",
    menu: "Menu",
    main: "Principal",
    mainNav: "Navegação principal",
    colorTheme: "Tema de cores",
    intastellarSolutions: "Intastellar Solutions",
    intastellarSolutionsTitle: "Intastellar Solutions (abre em nova aba)",
    opensNewTab: "(abre em nova aba)",
    logoHomeTitle: "Intastellar Developers — início",
    changelog: "Changelog",
    changelogTitle: "Consents e Sign-In — releases npm e GitHub",
    documentation: "Documentação",
    intastellarConsents: "Intastellar Consents",
    profile: "Perfil",
  },
  footer: {
    tagline:
      "Documentação, chaves de API e guias de integração para Intastellar Consents e Intastellar Accounts — ambos produtos da Intastellar Solutions International.",
    documentation: "Documentação",
    allDocs: "Toda a documentação",
    intastellarConsents: "Intastellar Consents",
    accountsSignIn: "Accounts — Entrar",
    searchDocs: "Buscar na documentação",
    platform: "Plataforma",
    home: "Início",
    changelog: "Changelog",
    signIn: "Entrar",
    apiKeys: "Chaves de API",
    legal: "Jurídico",
    legalOverview: "Visão geral jurídica",
    privacy: "Privacidade (inta.dev)",
    terms: "Termos (inta.dev)",
    dpaCorporate: "DPA (corporativo)",
    intastellar: "Intastellar",
    intastellarSolutions: "Intastellar Solutions",
    cookieConsentsProduct: "Produto de consentimento de cookies",
    copyright: "© {{year}} Intastellar Solutions International. Todos os direitos reservados.",
    statusOk: "Status do sistema",
    statusDegraded: "Algumas verificações estão falhando",
  },
  home: {
    heroTitle: "Construído com Intastellar",
    heroLead1: "Documentação, guias e ferramentas para entregar ",
    heroLeadConsent: "consentimento alinhado à LGPD",
    heroLead2: " e ",
    heroLeadSignin: "login seguro",
    heroLead3: " com a mesma stack que a Intastellar usa — tudo em ",
    heroLeadBrand: "inta.dev",
    heroLead4: ".",
    searchDocs: "Buscar na documentação",
    cardConsentsTitle: "Intastellar Consents",
    cardConsentsBody:
      "Banner de cookies, CMP e APIs de consentimento para web, WordPress, GTM, Shopify e mais.",
    cardConsentsCta: "Abrir documentação",
    cardAccountsTitle: "Intastellar Accounts",
    cardAccountsBody:
      "SDK React no inta.dev, fluxos estilo OAuth, PKCE, sessões e padrões de segurança para seus apps e sites.",
    cardAccountsCta: "Abrir documentação",
    cardAllTitle: "Toda a documentação e chaves de API",
    cardAllBody:
      "Navegue por todos os guias de produto, acompanhe releases e gerencie chaves no portal do desenvolvedor.",
    cardAllCta: "Ver tudo",
    quickConsents: "Consents — início rápido",
    quickAccounts: "Accounts — início rápido",
    signInPortal: "Entrar no portal",
    bandTitle: "Vá mais rápido com busca e releases",
    bandBody:
      "Acesse qualquer página com busca em texto integral, acompanhe atualizações no changelog (Consents e Intastellar Sign-In) e mantenha as chaves de API em um só lugar após entrar.",
    openSearch: "Abrir busca",
    changelog: "Changelog",
    apiKeys: "Chaves de API",
  },
  intaTryout: {
    introBeforePrivacy:
      "Edite o JSON abaixo para alterar window.INTA. A pré-visualização recarrega quando o JSON for válido. As URLs de política usam por padrão a ",
    privacyPage: "página de privacidade",
    introAfterPrivacy:
      " deste site. A pré-visualização usa a mesma origem e localStorage desta documentação.",
    minimumSetupTitle: "Configuração mínima",
    minimumSetupLeadBeforeRoot: "Você só precisa de uma URL de política válida, ",
    minimumSetupLeadBetweenRootCompany: ", ",
    minimumSetupLeadBeforeUc: ", e da tag ",
    minimumSetupLeadAfterUc:
      ". Todo o resto é branding ou integrações opcionais.",
    copyMinimumSnippet: "Copiar snippet mínimo",
    whatNextTitle: "O que acontece em seguida",
    whatNextStep1:
      "Você cola as duas tags de script no topo do <head>, antes de tags de análise ou marketing.",
    whatNextStep2:
      "uc.js lê window.INTA e mostra o banner se a URL de política responder.",
    whatNextStep3:
      "O visitante aceita, recusa ou escolhe de forma granular; a CMP armazena a decisão (cookies / armazenamento do seu domínio).",
    whatNextStep4:
      "Em mudanças de consentimento, cookie_consent_update é enviado ao dataLayer para o GTM — veja no console abaixo.",
    whatNextStep5Before: "Conecte tags do GTM / fornecedores a esses sinais (veja ",
    whatNextStep5Between: ", ",
    whatNextStep5After: ").",
    docLinkQuickstart: "Início rápido",
    docLinkEventsApi: "Eventos e API",
    editorLabel: "window.INTA (JSON)",
    format: "Formatar",
    reset: "Redefinir",
    copyHtmlSnippet: "Copiar snippet HTML",
    copied: "Copiado",
    jsonErrorPrefix: "JSON: ",
    fieldReferenceTitle: "Referência de campos",
    fieldReferenceAria: "Referência de campos",
    fieldHints: {
      policy_link:
        "URL HTTPS pública da sua política de privacidade. URLs inválidas ou placeholder costumam impedir o banner.",
      settingsPrivacyPolicy:
        "URL alternativa de política lida por algumas builds; mantenha alinhada a policy_link quando ambas existirem.",
      settingsRootDomain:
        "Domínio registrável para cookies (ex.: example.com). Deve corresponder ao site que os visitantes usam.",
      settingsCompany: "Nome exibido na interface de consentimento.",
      settingsColor: "Cor de destaque principal (hex CSS ou token).",
      settingsLogo: "URL absoluta do logo; omita ou deixe vazio se não houver.",
      settingsDesign: "Predefinição de layout (ex.: overlay).",
      settingsArrange: "ltr ou rtl para direção do layout.",
      settingsGtagId:
        "ID da tag GA4 / Google quando quiser Consent Mode pela CMP; omita até usar tags Google.",
      settingsRequiredCookies: "Nomes dos cookies estritamente necessários que o site define.",
      settingsKeepInLocalStorage:
        "Chaves de localStorage que a CMP não deve apagar ao mudar o consentimento.",
    },
    fullSchema: "Esquema completo",
    fullSchemaExtra: "permite chaves extras.",
    pasteFooterBefore:
      "Cole o snippet copiado no <head> antes de outros scripts de rastreamento. ",
    pasteFooterAfter: " tem regras de posicionamento.",
    quickstartLink: "Início rápido",
    debugConsoleTitle: "Console de eventos / depuração",
    clear: "Limpar",
    debugEmpty:
      "Envios ao dataLayer, mensagens da pré-visualização e saída do console encaminhada do iframe aparecem aqui. Interaja com o banner para ver ",
    debugEmptyCode: "cookie_consent_update",
    debugEmptyAfter: ".",
    bannerPreview: "Pré-visualização do banner",
    wideFrameHint:
      "Quadro desktop largo (1280 px) — role na horizontal se o painel for mais estreito.",
    iframeDocumentTitle: "Pré-visualização do banner",
    iframePreviewHint:
      "Pré-visualização ao vivo — o script real da CMP do nosso CDN roda aqui. O quadro é da mesma origem que o app de documentação, então localStorage funciona; chaves de consentimento podem ficar no armazenamento deste site até você limpar.",
    previewUpdated: "HTML da pré-visualização atualizado — o iframe recarrega.",
    fixJsonPreview: "Corrija o JSON para carregar a pré-visualização.",
    loadingPreview: "Carregando pré-visualização…",
    configMustBeObject:
      "A configuração deve ser um objeto JSON (não um array nem um primitivo).",
    iframeBannerPreviewTitle: "Pré-visualização do banner Intastellar Consents",
    dataLayer: "dataLayer",
    dataLayerConsent: "dataLayer (cookie_consent_update)",
    windowError: "window.error",
    preview: "pré-visualização",
    demoCompany: "Acme Demo",
  },
  legacy: {
    line1Strong: "Antes developers.intastellarsolutions.com",
    line1Mid: " — a documentação e as ferramentas para desenvolvedores estão agora aqui em ",
    line1Brand: "inta.dev",
    line1AfterBrand: ".",
    line2Before: "O site antigo tinha foco apenas em ",
    badge: "contas de desenvolvedor",
    line2After:
      " — não havia cobrança nem produtos pagos por lá.",
  },
  a11y: {
    colorTheme: "Tema de cores",
    lightTheme: "Tema claro",
    darkTheme: "Tema escuro",
  },
  docs: {
    breadcrumbDocumentation: "Documentação",
    hubMetaTitleCore: "Documentação",
    hubMetaDescription:
      "Documentação dos produtos para desenvolvedores Intastellar: Intastellar Consents, login na web e APIs.",
    hubEyebrow: "Desenvolvedores Intastellar",
    hubHeading: "Documentação",
    hubLead:
      "Guias para consentimento de cookies e login na web com Intastellar Accounts — além de chaves de API e padrões reutilizáveis em sites e backends.",
    hubVersionNote:
      "As URLs da documentação incluem um segmento de versão (ex.: /v1/) para publicar novos guias principais sem quebrar favoritos.",
    hubSearchDocs: "Buscar na documentação",
    hubChangelog: "Changelog",
    hubApiKeys: "Chaves de API",
    popularGuides: "Guias populares",
    popularGuidesHint: "Acesse diretamente os caminhos de integração mais comuns.",
    allProducts: "Todos os produtos",
    allProductsHint:
      "Índice completo, versões e links cruzados em cada espaço.",
    sidebarOverview: "Visão geral",
    sidebarAccounts: "Entrar (Web)",
    sidebarJavascript: "JavaScript",
    sidebarWordpress: "WordPress",
    sidebarIntegrations: "Integrações",
    sidebarMore: "Mais",
    relatedHeading: "Relacionados",
    relatedAccountsSignIn: "Accounts — Entrar (Web)",
    ql1Label: "Consents — JavaScript",
    ql1Hint: "Snippet, window.INTA, primeiro deploy",
    ql2Label: "Consents — WordPress",
    ql2Hint: "Instalação e configuração do plugin",
    ql3Label: "Accounts — React e JS puro",
    ql3Hint: "SDK no npm, HTML/JS no inta.dev, exemplos com placeholder",
    ql4Label: "Accounts — HTML / CSS / JS puros",
    ql4Hint: "Sites estáticos, sem framework — docs js migradas",
    ql5Label: "Accounts — Primeiros passos",
    ql5Hint: "Registrar cliente, SDK vs OAuth manual, fluxos",
    ql6Label: "Accounts — Fluxo authorization code",
    ql6Hint: "PKCE, callback, troca de token",
    docPageFallbackDescription:
      "{{title}} — Documentação para desenvolvedores Intastellar no inta.dev.",
    saveToProfile: "Salvar no perfil",
    removeFromProfile: "Remover do perfil",
    bookmarkToastSaved: "Salvo no seu perfil.",
    bookmarkToastRemoved: "Removido da sua lista salva.",
    saveToProfileHint:
      "Entre com uma sessão do portal (mesma conta das chaves de API) para marcar esta página no seu perfil.",
    onYourProfile: "Esta página está na sua lista salva em Conta → Perfil.",
    saveLoginModalTitle: "Salvar esta página no seu perfil",
    saveLoginModalClose: "Fechar",
    saveLoginModalSignInPopup: "Entrar com Intastellar",
    saveLoginModalSignInGitHub: "Continuar com GitHub",
    saveLoginModalOpenLoginPage: "Abrir página de login",
    saveLoginModalOpenProfile: "Abrir perfil da conta",
  },
  search: {
    inputAria: "Buscar na documentação",
    placeholder: "Buscar na documentação…",
    noIndexRun: "Índice de busca não encontrado. Execute",
    noIndexOr: "(ou",
    noIndexRestart: ") e reinicie o servidor de desenvolvimento.",
    noResults: "Nenhum resultado. Tente um termo mais curto ou confira a ortografia.",
    title: "Buscar na documentação",
    overlayHelp:
      "Esc para fechar · ⌘K / Ctrl+K na página · setas e Enter para abrir um resultado",
    pageIntro:
      "Filtre por título, slug do produto e conteúdo da página. Teclado: ⌘K / Ctrl+K abre a busca. Com a busca aberta, use as setas e Enter para escolher um resultado.",
  },
  profile: {
    metaTitle: "Perfil · inta.dev",
    heading: "Perfil",
    loading: "Carregando sessão…",
    ssoBefore: "Conecte o SSO Intastellar definindo",
    ssoAfter: "no seu ambiente.",
    seeSignInBefore: "Acesse",
    seeSignInAfter: "para ver os detalhes.",
    signedOut:
      "Você não está autenticado. Entre com sua conta Intastellar para ver seu perfil aqui.",
    signInWithIntastellar: "Entrar com Intastellar",
    openSignInPage: "Abrir página de login",
    intro:
      "Sua identidade de desenvolvedor vem das Contas Intastellar. Use chaves de API para credenciais de servidor e salve páginas da documentação aqui para acesso rápido enquanto desenvolve.",
    manageAccount: "Gerenciar sua conta Intastellar",
    savedDocsHeading: "Documentação salva",
    savedDocsEmpty:
      "Nenhuma página salva ainda. Abra um guia e use «Salvar no perfil» no final da página.",
    savedDocsRemove: "Remover",
    savedDocsMongoOff:
      "Documentação salva requer MongoDB neste servidor. O login continua funcionando.",
    savedDocsNeedAccount:
      "Conclua o login para o portal vincular sua conta (visite chaves de API ou recarregue após entrar) e ative documentos salvos.",
    savedDocsErrorGeneric:
      "Não foi possível atualizar a documentação salva. Tente novamente.",
    savedDocsErrorInvalid: "Esse link de documentação não é válido.",
    linkGitHubHeading: "Login com GitHub",
    linkGitHubDescription:
      "Vincule sua conta do GitHub para entrar com o GitHub depois. Seu perfil no GitHub deve exibir um e-mail verificado que corresponda a esta conta do portal (o mesmo do Intastellar).",
    linkGitHubButton: "Vincular conta do GitHub",
    githubLinkedBadge: "GitHub vinculado como @{{login}}",
    githubLinkedNotice: "O GitHub agora está vinculado a esta conta.",
    linkGitHubErrorEmailMismatch:
      "O e-mail verificado do GitHub não corresponde a esta conta. Use o mesmo e-mail verificado no GitHub e no Intastellar.",
    linkGitHubErrorNoVerifiedEmail:
      "O GitHub não retornou um e-mail verificado. Defina um e-mail público ou conceda o escopo user:email.",
    linkGitHubErrorGithubTaken:
      "Esta conta do GitHub já está vinculada a outro usuário do portal.",
    linkGitHubErrorNotFound: "Conta do portal não encontrada.",
    linkGitHubErrorSessionMismatch:
      "Sua sessão mudou durante a vinculação. Feche outras abas e tente de novo.",
    linkGitHubErrorInvalid: "Pedido de vinculação inválido. Tente novamente no perfil.",
    linkGitHubErrorRequiresMongo:
      "A vinculação com o GitHub exige MongoDB neste servidor.",
  },
  account: {
    layoutTitle: "Conta",
    layoutDescription:
      "Entre com Intastellar ou GitHub, gerencie seu perfil e chaves de API de desenvolvedor.",
    loginHeading: "Entrar",
    loginIntro:
      "Use sua conta Intastellar (SSO) ou sua conta do GitHub para entrar.",
    loginAriaBusy: "Carregando",
    loginIntastellarLogoAlt: "Logo da Intastellar",
    loginSignInIntastellar: "Entrar com Intastellar",
    loginCheckingSession: "Verificando sessão…",
    loginSsoNotConfiguredLead: "O SSO não está configurado. Defina",
    loginSsoNotConfiguredMid: "(e opcionalmente",
    loginSsoNotConfiguredTail:
      ") no seu ambiente e reinicie o servidor de desenvolvimento.",
    loginLegalPrefix: "Ao entrar, você concorda com os",
    loginLegalTermsLabel: "Termos de serviço",
    loginLegalBetween: "e a",
    loginLegalPrivacyLabel: "Política de privacidade",
    loginLegalSuffix: ".",
    loginGitHubSignIn: "Continuar com GitHub",
    loginGitHubHint:
      "Mesma conta do portal e documentos salvos que com Intastellar após autorizar no GitHub.",
    loginGitHubErrorDisabled:
      "O login com GitHub não está configurado neste servidor.",
    loginGitHubErrorDenied: "A autorização do GitHub foi cancelada.",
    loginGitHubErrorState:
      "O estado do login não correspondeu. Tente novamente.",
    loginGitHubErrorToken:
      "Não foi possível concluir o login com GitHub. Tente novamente.",
    loginGitHubErrorUser:
      "Não foi possível carregar seu perfil do GitHub. Tente novamente.",
    loginGitHubErrorUnknown: "Falha no login com GitHub. Tente novamente.",
    loginGitHubErrorLinkRequiresLogin:
      "Entre no portal primeiro e vincule o GitHub no perfil.",
    loginGitHubErrorLinkRequiresMongo:
      "A vinculação com o GitHub exige MongoDB neste servidor.",
  },
  apiKeys: {
    metaTitle: "Chaves de API · inta.dev",
    heading: "Chaves de API",
    loading: "Carregando…",
    setSsoBefore: "Defina",
    setSsoAfterCode: "",
    setSsoAfter:
      "para habilitar o login e configure o MongoDB abaixo.",
    signInToManageAfter:
      "com a Intastellar para criar e revogar chaves. As chaves ficam vinculadas ao e-mail da sua conta.",
    mongoBeforeUri: "Adicione",
    mongoAfterUri:
      "(string de conexão Atlas) ao ambiente do servidor. Opcional:",
    mongoBeforeDb: "(",
    mongoDefaultWord: "padrão",
    mongoAfterDb: "),",
    mongoAfterPepper:
      "(obrigatório em produção — hash e armazenamento criptografado para revelar neste portal).",
    sessionSyncing: "Sincronizando sua sessão com o servidor…",
    sessionHardFailP1:
      "Você está autenticado no app, mas a requisição de chaves de API ainda não tem cookie de sessão do portal. Causas comuns: cache de loader desatualizado,",
    sessionHardFailVs: "vs",
    sessionHardFailP2: ", ou falta de",
    sessionHardFailP3:
      "em produção (o cookie de sessão assinado não pode ser criado).",
    sessionHardFailBulletRefresh:
      "Recarregue esta página por completo ou abra Chaves de API em uma nova aba.",
    sessionHardFailBulletHostOpen: "Use apenas um host em dev (",
    sessionHardFailBulletHostClose: ").",
    sessionHardFailBulletSecretBefore: "Defina",
    sessionHardFailBulletSecretAfter: "em produção.",
    signInAgain: "Entrar novamente",
    sessionAligning:
      "Alinhando a sessão do servidor com sua conta… Se persistir, recarregue a página.",
    sessionVerifyBefore:
      "O servidor não pôde verificar seu cookie de sessão. Tente atualizar após o login ou",
    sessionVerifyLink: "saia e entre novamente",
    sessionVerifyAfter: ".",
    newKeyBanner:
      "Chave criada. O segredo completo está na tabela abaixo — use {{copyKey}} ali. Você pode ocultar com o ícone de olho; abra o olho a qualquer momento autenticado para revelar e copiar de novo (mantemos uma cópia criptografada no servidor).",
    dismiss: "Dispensar",
    optionalHintBeforeHttps:
      "Domínio de login e URL do logo opcionais são usados com Intastellar Sign-In (armazenamos o hostname; o logo deve ser ",
    optionalHintAfterHttps: ").",
    labelField: "Rótulo",
    requiredMark: "*",
    placeholderLabel: "ex.: site de produção",
    signInDomain: "Domínio de login",
    logoUrl: "URL do logo",
    placeholderDomain: "app.exemplo.com",
    placeholderLogo: "https://cdn.exemplo.com/logo.svg",
    createKey: "Criar chave",
    busyEllipsis: "…",
    emptyList:
      "Ainda não há chaves. Crie uma para obter um segredo para seus servidores ou ferramentas. Armazenamos um hash para validação e uma cópia criptografada para você revelar e copiar depois nesta página.",
    colLabel: "Rótulo",
    colKey: "Chave",
    colSignInDomain: "Domínio de login",
    colLogo: "Logo",
    colCreated: "Criada",
    colActions: "Ações",
    copyKey: "Copiar chave",
    copied: "Copiado",
    copyFailed: "Falha ao copiar",
    logoUnloaded: "Não carregado",
    hideKey: "Ocultar chave",
    revealKey: "Revelar chave para copiar",
    revealLoading: "Carregando…",
    noSecretStored:
      "Nenhum segredo criptografado no arquivo (geralmente chave antiga). Crie uma nova chave para habilitar revelar e copiar depois.",
    openSignInRow: "Login",
    closeEditor: "Fechar",
    revoke: "Revogar",
    editSignInTitle: "Intastellar Sign-In — domínio e logo desta chave",
    logoUrlHttps: "URL do logo (https)",
    placeholderLogoShort: "https://…",
    saveSignInSettings: "Salvar configurações de login",
    cancel: "Cancelar",
    errors: {
      signInAgain: "Entre novamente para gerenciar chaves de API.",
      dbNotConfiguredOnServer: "O banco de dados não está configurado no servidor.",
      unknownAction: "Ação desconhecida.",
      dbNotConfigured: "O banco de dados não está configurado.",
      enterLabel: "Informe um rótulo para esta chave.",
      domainInvalidCreate:
        "O domínio de login parece inválido. Use um hostname como app.exemplo.com (você pode colar uma URL https completa — armazenamos só o host).",
      logoInvalidCreateImage:
        "O logo de login deve ser uma URL de imagem https:// válida (ou deixe em branco).",
      pepperMissing:
        "Configuração incorreta do servidor: defina API_KEY_PEPPER (segredo longo aleatório) em produção.",
      invalidKeyId: "ID de chave inválido.",
      keyNotFound: "Chave não encontrada ou já revogada.",
      noEncryptedOnFile:
        "Esta chave não tem segredo criptografado no arquivo (geralmente criada antes do suporte a revelar). Crie uma nova chave.",
      decryptFailed:
        "Não foi possível descriptografar esta chave (o segredo do servidor pode ter mudado). Crie uma nova chave.",
      domainInvalidUpdate:
        "O domínio de login parece inválido. Use um hostname como app.exemplo.com.",
      logoInvalidUpdateUrl:
        "O logo de login deve ser uma URL https:// válida ou ficar em branco.",
    },
  },
  status: {
    metaTitle: "Status do sistema · inta.dev",
    metaDescription:
      "Verificações de disponibilidade dos endpoints públicos Intastellar (Consents, CDN, inta.dev).",
    heading: "Status do sistema",
    introBeforeLink:
      "Verificações HTTP automatizadas a partir do inta.dev. Snapshot legível por máquina:",
    introAfterLink: ".",
    ariaUptimeStored: "Disponibilidade a partir de verificações agendadas armazenadas",
    uptimeWord: "disponibilidade",
    uptimeStoredRunsBefore:
      "Executamos essas verificações automaticamente em cronograma. Nas últimas {{hours}} horas (UTC), armazenamos",
    uptimeStoredRunsMid: "execuções ·",
    uptimeStoredRunsAfter:
      "contam como totalmente OK (todos os serviços responderam normalmente na execução, sem aviso da equipe ou manutenção aplicável naquele instante).",
    devLiveProbeBefore: "Modo de desenvolvimento: exibindo uma verificação",
    devLiveProbeStrong: "ao vivo",
    devLiveProbeAfter:
      "(não salva). Em produção usa-se o último snapshot gravado pelo job cron.",
    ariaUptimeDev: "Disponibilidade apenas da verificação de desenvolvimento",
    onThisPageLoad: "neste carregamento da página",
    devUptimeNote:
      "Modo de desenvolvimento — não é média sobre histórico armazenado. Em produção mostra disponibilidade das execuções cron agendadas.",
    uptimePending:
      "A porcentagem de disponibilidade aparecerá aqui depois que o cron de status gravar pelo menos uma linha no histórico (as linhas do tempo usam o mesmo armazenamento).",
    noSnapshotCron:
      "Ainda não há snapshot. Dispare a rota cron uma vez (veja Vercel Cron) ou aguarde a próxima execução agendada.",
    noSnapshotMongo:
      "MongoDB não está configurado — snapshots não são armazenados. Em desenvolvimento esta página executa verificações a cada carregamento; defina MONGODB_URI e CRON_SECRET na Vercel para monitoramento em produção.",
    allChecksPassing: "Todas as verificações OK",
    someChecksFailing: "Algumas verificações falhando",
    updated: "Atualizado",
    storedUtc: " (armazenado, UTC)",
    utcOnly: " (UTC)",
    httpStatus: "HTTP {{code}}",
    noResponse: "Sem resposta",
    footnoteAria:
      "Detalhes técnicos para quem opera esta página de status",
    footnoteTitle: "Nota — hospedagem e configuração",
    footnoteP1Before: "Esta página é pública. Os detalhes abaixo são para",
    footnoteP1Strong: "equipes que fazem deploy do inta.dev",
    footnoteP1After: "(variáveis de ambiente, retenção de dados).",
    footnoteP2a: "Configure alvos com",
    footnoteP2b: "(substituição total) ou",
    footnoteP2c:
      "(acrescentar). Uma verificação conta como OK quando o status HTTP é menor que 500. O log de incidentes lista execuções com falha nessa janela, incluindo texto de erro do probe quando salvo.",
    footnoteP2d:
      "Linhas do tempo, log de incidentes e tendências de latência compartilham o mesmo armazenamento deslizante: as últimas {{hours}} horas (UTC), até {{maxRows}} amostras por solicitação (TTL de ~14 dias no Mongo). O percentual de disponibilidade no topo usa a mesma janela: só conta como “up” se todos os alvos passaram e o instante está fora de avisos da equipe e manutenção aplicáveis. Ajuste com STATUS_HISTORY_WINDOW_HOURS e STATUS_HISTORY_MAX_ROWS. Horários em UTC. Novas linhas de histórico armazenam por alvo",
    footnoteP2e:
      "; linhas antigas ainda alimentam segmentos de alta/baixa até expirarem.",
    incidentHeading: "Log de incidentes",
    incidentEmptyBody:
      "Um incidente é uma execução cron armazenada em que pelo menos um alvo estava fora (HTTP 5xx, timeout ou sem resposta — mesmas regras das verificações ao vivo). Se todo o histórico recente passou, esta lista fica vazia.",
    incidentListIntro:
      "Agrupadas por monitor. Para cada alvo, execuções com falha consecutivas com a mesma mensagem do probe são unidas em uma linha com intervalo em UTC (grupos mais recentes primeiro), na mesma janela deslizante das linhas do tempo e da disponibilidade. As mensagens vêm do probe quando disponíveis; histórico antigo pode mostrar apenas um motivo genérico.",
    degraded: "Degradado",
    timelineNoHistory:
      "Ainda não há histórico. Depois que MongoDB e o cron armazenarem execuções, as verificações recentes aparecem aqui.",
    timelineCurrentCheckDev: "Apenas verificação atual (dev)",
    timelineRecentChecks:
      "Verificações recentes — últimos {{window}} ({{count}} amostras)",
    timelineAriaSummary:
      "{{n}} verificações: {{clear}} totalmente OK, {{flagged}} com indisponibilidade, aviso ou manutenção",
    timelineTooltipUp: "{{time}} — OK",
    timelineTooltipDown: "{{time}} — Falha",
    timelineTooltipNotice: "{{time}} — Aviso da operação",
    timelineTooltipMaintenance: "{{time}} — Manutenção programada",
    timelineIssueListIntro: "Não totalmente OK (UTC)",
    timelineIssueLabelDown: "Verificação com falha",
    timelineIssueLabelNotice: "Aviso da operação",
    timelineIssueLabelMaintenance: "Manutenção programada",
    timelineIssueMore: "+ {{n}} a mais…",
    latencyNeedsTwoRuns:
      "A tendência de tempo de resposta precisa de pelo menos duas execuções armazenadas com latência (após o próximo cron gravar latencyMs).",
    latencyResponseTime: "Tempo de resposta ({{label}})",
    latencyAriaTrend:
      "Tendência de latência para {{label}}: {{min}}–{{max}} ms em {{n}} verificações",
    latencyMin: "Mín",
    latencyMax: "Máx",
    latencyLatest: "Última",
    latencyByRegionCaption: "Tempo de resposta por local da sonda",
    latencyDefaultRegionLabel: "Esta sonda",
    badgeMainUptime:
      "Confiabilidade do serviço: {{percent}} de disponibilidade (últimos {{window}})",
    badgeSubMonitored:
      "Monitoramento contínuo em endpoints globais",
    badgePlaceholder: "Confiabilidade do serviço",
    badgeCollecting: "Coletando verificações agendadas…",
    badgeLink: "Ver status ao vivo →",
    badgeLogoAlt: "Intastellar Consents",
    badgePoweredBy: "Oferecido por inta.dev",
    uptimeJsonWidgetDescription:
      "Nas últimas {{hours}} horas foram armazenadas {{totalRuns}} execuções agendadas; {{passedRuns}} contam como totalmente OK (todas as sondas OK, sem aviso da equipe ou manutenção aplicável).",
    uptimeJsonNoHistoryDescription:
      "A disponibilidade aparecerá aqui depois que verificações de saúde agendadas forem armazenadas.",
    embedBadgeButton: "Incorporar badge",
    embedModalTitle: "Incorporar badge de disponibilidade",
    embedModalIntro:
      "Copie um trecho iframe ou a URL da API JSON. O idioma segue esta página; altere ?locale= (en, de, da, fr, nl, pt-br) ou adicione ?theme=light / ?theme=dark para fixar claro ou escuro — omita theme (ou use theme=auto) para seguir o sistema do visitante.",
    embedPreviewHeading: "Pré-visualização",
    embedThemeLabel: "Aparência do badge",
    embedIframeHeading: "Incorporação iframe",
    embedIframeTitle: "Badge de disponibilidade",
    embedJsonHeading: "API JSON",
    embedJsonHint:
      "Use esta URL em fetch() ou curl — retorna widgetTitle, widgetDescription, statusPageUrl e badgeEmbedUrl.",
    embedCopy: "Copiar",
    embedCopied: "Copiado",
    embedModalClose: "Fechar",
    embedOpenOnSite: "Abra esta página no seu site para gerar URLs.",
    maintenanceHeading: "Manutenção agendada",
    maintenanceEmpty:
      "Não há janelas de manutenção em andamento ou futuras publicadas no momento.",
    maintenanceActiveBadge: "Em andamento",
    maintenanceUpcomingBadge: "Próxima",
    maintenanceRange: "{{start}} → {{end}}",
    deployHeading: "Último deploy",
    deployUnavailable:
      "O último commit vem do repositório Intastellar Consents no GitHub (não do deploy deste site). Fica vazio se a API do GitHub estiver indisponível ou limitada — use GITHUB_TOKEN para limites maiores.",
    deployCommit: "Commit",
    deployBranch: "Branch",
    deployMessage: "Mensagem",
    deployViewCommit: "Ver commit no GitHub",
    trustHeading: "Como medimos disponibilidade",
    trustIntro: "Notas rápidas sobre o que esta página representa.",
    trustBulletSynthetic:
      "Verificações sintéticas: requisições HTTP automatizadas do nosso provedor de hospedagem para cada URL pública abaixo — não é monitoramento de usuários reais (RUM).",
    trustBulletFrequency:
      "Agenda: em produção, cerca de uma vez por minuto (configuração de cron do projeto).",
    trustBulletPass:
      "Uma verificação passa quando o status HTTP é menor que 500; timeouts e erros de rede contam como falha.",
    trustBulletHistory:
      "Linhas do tempo, log de incidentes, tendências de latência e o percentual no topo usam verificações armazenadas nas últimas {{hours}} horas (UTC), até {{maxRows}} amostras por carregamento (TTL MongoDB ~14 dias). Avisos da equipe e manutenção ativa contam como indisponibilidade quando aplicáveis.",
    trustBulletUtc: "Todos os horários nesta página estão em UTC.",
    manualNoticesHeading: "Avisos da equipe",
    manualNoticesIntro:
      "Atualizações publicadas pela equipe sobre incidentes ou acompanhamento (separadas do histórico automático de probes abaixo).",
    manualPostedBy: "Publicado por {{email}}",
    manualResolvedPrefix: "Resolvido",
    manualSeverityInvestigating: "Investigando",
    manualSeverityIdentified: "Identificado",
    manualSeverityMonitoring: "Monitorando",
    manualSeverityResolved: "Resolvido",
    manualUpdateMeta: "Atualização · {{atLabel}} · {{email}}",
    manualUpdatesHeading: "Atualizações",
    affectedMonitorsLabel: "Monitores",
    subscribeRss: "Assinar (RSS)",
    subscribeRssTitle: "Feed RSS de avisos do operador e manutenção agendada",
    subscribeSectionHeading: "Inscrever-se para atualizações",
    subscribeSectionIntro:
      "Escolha os tipos de atualização. Leitores RSS buscam novos itens na URL do feed; o e-mail é enviado quando publicamos uma janela de manutenção ou aviso do operador correspondente.",
    subscribeTopicsLabel: "Incluir",
    subscribeTopicMaintenance: "Manutenção agendada",
    subscribeTopicIncidents: "Avisos do operador e alertas de monitoramento",
    subscribePickTopicsError: "Selecione pelo menos um tipo de atualização.",
    subscribeRssUrlHelp: "RSS (cole no leitor ou copie a URL)",
    subscribeOpenRss: "Abrir feed RSS",
    subscribeCopyFeedUrl: "Copiar URL do feed",
    subscribeCopied: "Copiado",
    subscribeEmailHelp: "E-mail",
    subscribeEmailCheckbox: "Enviar alertas para meu e-mail (dupla confirmação)",
    subscribeEmailUnavailable:
      "Alertas por e-mail exigem MongoDB e Resend (RESEND_API_KEY e STATUS_NOTIFY_FROM). O RSS acima continua funcionando.",
    subscribeEmailInputLabel: "Endereço de e-mail",
    subscribeEmailPlaceholder: "voce@example.com",
    subscribeEmailSubmit: "Solicitar alertas por e-mail",
    subscribeEmailVerifySent:
      "Verifique sua caixa de entrada e clique no link de confirmação.",
    subscribeEmailUpdated: "Suas preferências de alerta por e-mail foram atualizadas.",
    subscribeEmailErrorGeneric: "Algo deu errado. Tente novamente.",
    notifyFlashVerified: "Sua inscrição por e-mail foi confirmada.",
    notifyFlashUnsubscribed: "Você cancelou os e-mails de status.",
    notifyFlashVerifyMissing: "Link de confirmação sem token.",
    notifyFlashVerifyInvalid: "Link de confirmação inválido ou já usado.",
    notifyFlashUnsubMissing: "Link de cancelamento sem token.",
    notifyFlashUnsubInvalid: "Link de cancelamento inválido.",
  },
};
