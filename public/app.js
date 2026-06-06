const toolGrid = document.getElementById("tool-grid");
const toolGridSkeleton = document.getElementById("tool-grid-skeleton");
const toolDirectoryToggle = document.getElementById("tool-directory-toggle");
const toolDirectoryToggleCopy = document.getElementById("tool-directory-toggle-copy");
const toolSelect = document.getElementById("toolId");
const toolTemplate = document.getElementById("tool-card-template");
const form = document.getElementById("convert-form");
const fileInput = document.getElementById("file");
const dropzone = document.getElementById("dropzone");
const workbench = document.getElementById("workbench");
const homeHero = document.getElementById("home-hero");
const routeHero = document.getElementById("route-hero");
const routeKicker = document.getElementById("route-kicker");
const routeTitle = document.getElementById("route-title");
const routeCopy = document.getElementById("route-copy");
const routeHeroBack = document.getElementById("route-hero-back");
const toolHelpButton = document.getElementById("tool-help-button");
const toolDirectory = document.getElementById("tool-directory");
const toolGridWrap = document.querySelector(".tool-grid-wrap");
const themeToggle = document.getElementById("theme-toggle");
const searchInput = document.getElementById("tool-search");
const searchClear = document.getElementById("search-clear");
const searchResults = document.getElementById("search-results");
const dropzoneTitle = document.getElementById("dropzone-title");
const dropzoneCopy = document.getElementById("dropzone-copy");
const fileStage = document.getElementById("file-stage");
const statusText = document.getElementById("status-text");
const toastLiveRegion = document.getElementById("toast-live-region");
const toastViewport = document.getElementById("toast-viewport");
const textLayoutField = document.getElementById("text-layout-field");
const textLayoutHint = document.getElementById("text-layout-hint");
const toolOptions = document.getElementById("tool-options");
const themeColorMeta = document.getElementById("theme-color-meta");
const seoTitle = document.getElementById("seo-title");
const seoDescriptionMeta = document.getElementById("seo-description");
const seoOgTitleMeta = document.getElementById("seo-og-title");
const seoOgDescriptionMeta = document.getElementById("seo-og-description");
const seoOgUrlMeta = document.getElementById("seo-og-url");
const seoOgImageMeta = document.getElementById("seo-og-image");
const seoTwitterTitleMeta = document.getElementById("seo-twitter-title");
const seoTwitterDescriptionMeta = document.getElementById("seo-twitter-description");
const seoTwitterImageMeta = document.getElementById("seo-twitter-image");
const seoToolIdMeta = document.getElementById("seo-tool-id");
const seoCanonicalLink = document.getElementById("seo-canonical");
const seoSoftwareSchema = document.getElementById("seo-software-schema");
const seoHowToSchema = document.getElementById("seo-howto-schema");
const seoFaqSchema = document.getElementById("seo-faq-schema");
const pageDataScript = document.getElementById("vaptdoc-page-data");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const progressValue = document.getElementById("progress-value");
const uploadProgress = document.getElementById("upload-progress");
const backToTopButton = document.getElementById("back-to-top");
const activeToolTitle = document.getElementById("active-tool-title");
const activeToolDescription = document.getElementById("active-tool-description");
const favoriteToggle = document.getElementById("favorite-toggle");
const favoriteToggleCopy = document.getElementById("favorite-toggle-copy");
const accessStrip = document.getElementById("access-strip");
const accessPlanLabel = document.getElementById("access-plan-label");
const accessUsageCopy = document.getElementById("access-usage-copy");
const openBillingButton = document.getElementById("open-billing");
const openRedeemButton = document.getElementById("open-redeem");
const accessLogoutButton = document.getElementById("access-logout");
const accountLauncher = document.getElementById("account-launcher");
const siteHeaderCurrent = document.getElementById("site-header-current");
const accountLauncherCopy = document.getElementById("account-launcher-copy");
const accountLauncherImage = document.getElementById("account-launcher-image");
const accountLauncherInitials = document.getElementById("account-launcher-initials");
const accountPopover = document.getElementById("account-popover");
const accountPopoverAvatarButton = document.getElementById("account-popover-avatar-button");
const accountPopoverImage = document.getElementById("account-popover-image");
const accountPopoverInitials = document.getElementById("account-popover-initials");
const accountPopoverName = document.getElementById("account-popover-name");
const accountPopoverEmail = document.getElementById("account-popover-email");
const accountPopoverPlanBadge = document.getElementById("account-popover-plan-badge");
const accountPopoverPlanMeta = document.getElementById("account-popover-plan-meta");
const accountPopoverPlanTitle = document.getElementById("account-popover-plan-title");
const accountPopoverPlanCopy = document.getElementById("account-popover-plan-copy");
const accountPopoverProgressFill = document.getElementById("account-popover-progress-fill");
const accountPopoverProgressLabel = document.getElementById("account-popover-progress-label");
const accountPopoverProgressMeta = document.getElementById("account-popover-progress-meta");
const accountPopoverCloseButton = document.getElementById("account-popover-close");
const accountSubscriptionPlanBadge = document.getElementById("account-subscription-plan-badge");
const accountSubscriptionPlanMeta = document.getElementById("account-subscription-plan-meta");
const accountSubscriptionPlanTitle = document.getElementById("account-subscription-plan-title");
const accountSubscriptionPlanCopy = document.getElementById("account-subscription-plan-copy");
const accountSubscriptionProgressFill = document.getElementById("account-subscription-progress-fill");
const accountSubscriptionProgressLabel = document.getElementById("account-subscription-progress-label");
const accountSubscriptionProgressMeta = document.getElementById("account-subscription-progress-meta");
const accountMenuOverview = document.getElementById("account-menu-overview");
const accountMenuOverviewLabel = document.getElementById("account-menu-overview-label");
const accountMenuProfile = document.getElementById("account-menu-profile");
const accountMenuSubscription = document.getElementById("account-menu-subscription");
const accountMenuTheme = document.getElementById("account-menu-theme");
const accountMenuThemeLabel = document.getElementById("account-menu-theme-label");
const accountMenuAdmin = document.getElementById("account-menu-admin");
const accountMenuLogout = document.getElementById("account-menu-logout");
const premiumLock = document.getElementById("premium-lock");
const unlockToolButton = document.getElementById("unlock-tool");
const convertButton = document.getElementById("convert-button");
const conversionLifecycle = document.getElementById("conversion-lifecycle");
const conversionLifecycleChips = Array.from(document.querySelectorAll("[data-conversion-stage]"));
const convertSidebar = document.getElementById("convert-sidebar");
const workspaceMainGrid = document.getElementById("workspace-main-grid");
const workspaceCanvasCard = document.getElementById("workspace-canvas-card");
const workspaceInspector = document.getElementById("workspace-inspector");
const workspaceSubmitCard = document.getElementById("workspace-submit-card");
const conversionModal = document.getElementById("conversion-modal");
const conversionModalCloseButton = document.getElementById("conversion-modal-close");
const conversionModalCancelButton = document.getElementById("conversion-modal-cancel");
const conversionModalTitle = document.getElementById("conversion-modal-title");
const conversionModalCopy = document.getElementById("conversion-modal-copy");
const conversionModalBody = document.getElementById("conversion-modal-body");
const conversionModalStatus = document.getElementById("conversion-modal-status");
const conversionSummaryFiles = document.getElementById("conversion-summary-files");
const conversionSummaryOutput = document.getElementById("conversion-summary-output");
const conversionConfirmButton = document.getElementById("conversion-confirm-button");
const toolHelpModal = document.getElementById("tool-help-modal");
const toolHelpCloseButton = document.getElementById("tool-help-close");
const toolHelpTitle = document.getElementById("tool-help-title");
const toolHelpCopy = document.getElementById("tool-help-copy");
const toolHelpList = document.getElementById("tool-help-list");
const billingModal = document.getElementById("billing-modal");
const billingCloseButton = document.getElementById("billing-close");
const billingMonthlyButton = document.getElementById("billing-monthly-button");
const billingYearlyButton = document.getElementById("billing-yearly-button");
const billingStarterButton = document.getElementById("billing-starter-button");
const billingSupportButton = document.getElementById("billing-support-button");
const billingMonthlyPrice = document.getElementById("billing-monthly-price");
const billingMonthlyMeta = document.getElementById("billing-monthly-meta");
const billingYearlyPrice = document.getElementById("billing-yearly-price");
const billingYearlyMeta = document.getElementById("billing-yearly-meta");
const inertableSurfaces = Array.from(document.querySelectorAll(".shell, .site-footer"));
const billingStarterPrice = document.getElementById("billing-starter-price");
const billingStarterMeta = document.getElementById("billing-starter-meta");
const redeemForm = document.getElementById("redeem-form");
const redeemCodeInput = document.getElementById("redeem-code");
const redeemSubmitButton = document.getElementById("redeem-submit");
const billingStatus = document.getElementById("billing-status");
const accountRegisterModal = document.getElementById("account-register-modal");
const accountLoginModal = document.getElementById("account-login-modal");
const accountOverviewModal = document.getElementById("account-overview-modal");
const accountSubscriptionModal = document.getElementById("account-subscription-modal");
const accountProfileModal = document.getElementById("account-profile-modal");
const accountSettingsModal = document.getElementById("account-settings-modal");
const accountVerificationModal = document.getElementById("account-verification-modal");
const accountRegisterCloseButton = document.getElementById("account-register-close");
const accountLoginCloseButton = document.getElementById("account-login-close");
const accountOverviewCloseButton = document.getElementById("account-overview-close");
const accountSubscriptionCloseButton = document.getElementById("account-subscription-close");
const accountProfileCloseButton = document.getElementById("account-profile-close");
const accountSettingsCloseButton = document.getElementById("account-settings-close");
const accountVerificationCloseButton = document.getElementById("account-verification-close");
const accountSwitchToLoginButton = document.getElementById("account-switch-to-login");
const accountSwitchToRegisterButton = document.getElementById("account-switch-to-register");
const accountShortcutProfileButton = document.getElementById("account-shortcut-profile");
const accountShortcutSettingsButton = document.getElementById("account-shortcut-settings");
const accountShortcutAdminButton = document.getElementById("account-shortcut-admin");
const accountFileFilterButtons = Array.from(document.querySelectorAll("[data-account-file-filter]"));
const accountFileCountTotal = document.getElementById("account-file-count-total");
const accountFileCountTemporary = document.getElementById("account-file-count-temporary");
const accountFileCountReady = document.getElementById("account-file-count-ready");
const accountFileCountFailed = document.getElementById("account-file-count-failed");
const accountHistoryList = document.getElementById("account-history-list");
const accountHistoryEmpty = document.getElementById("account-history-empty");
const accountUsageList = document.getElementById("account-usage-list");
const accountUsageEmpty = document.getElementById("account-usage-empty");
const accountNotificationsList = document.getElementById("account-notifications-list");
const accountNotificationsEmpty = document.getElementById("account-notifications-empty");
const accountRegisterForm = document.getElementById("account-register-form");
const accountLoginForm = document.getElementById("account-login-form");
const accountProfileForm = document.getElementById("account-profile-form");
const accountPasswordForm = document.getElementById("account-password-form");
const accountVerificationForm = document.getElementById("account-verification-form");
const accountLogoutButton = document.getElementById("account-logout");
const accountUpgradeButton = document.getElementById("account-upgrade-button");
const accountSubscriptionManageButton = document.getElementById("account-subscription-manage-button");
const accountStatusOutputs = Array.from(document.querySelectorAll("[data-account-status]"));
const accountPlanValue = document.getElementById("account-plan-value");
const accountPlanCopy = document.getElementById("account-plan-copy");
const accountNameDisplay = document.getElementById("account-name-display");
const accountEmailDisplay = document.getElementById("account-email-display");
const accountCreatedDisplay = document.getElementById("account-created-display");
const accountCreditsDisplay = document.getElementById("account-credits-display");
const accountDiscountDisplay = document.getElementById("account-discount-display");
const accountDisplayNameInput = document.getElementById("account-display-name");
const accountEmailInput = document.getElementById("account-email");
const accountCurrentPasswordEmailInput = document.getElementById("account-current-password-email");
const accountPasswordCurrentInput = document.getElementById("account-password-current");
const accountPasswordNewInput = document.getElementById("account-password-new");
const accountAvatarPreview = document.getElementById("account-avatar-preview");
const accountAvatarImage = document.getElementById("account-avatar-image");
const accountAvatarInitials = document.getElementById("account-avatar-initials");
const accountAvatarInput = document.getElementById("account-avatar-input");
const accountAvatarActions = document.getElementById("account-avatar-actions");
const accountAvatarRemoveButton = document.getElementById("account-avatar-remove-button");
const accountSettingsTitle = document.getElementById("account-settings-title");
const accountSettingsCopy = document.getElementById("account-settings-copy");
const accountVerificationKicker = document.getElementById("account-verification-kicker");
const accountVerificationTitle = document.getElementById("account-verification-title");
const accountVerificationCopy = document.getElementById("account-verification-copy");
const accountVerificationDestination = document.getElementById("account-verification-destination");
const accountVerificationExpiry = document.getElementById("account-verification-expiry");
const accountVerificationCodeInput = document.getElementById("account-verification-code");
const accountVerificationSubmitButton = document.getElementById("account-verification-submit");
const accountVerificationResendButton = document.getElementById("account-verification-resend");
const adminPanelModal = document.getElementById("admin-panel-modal");
const adminPanelCloseButton = document.getElementById("admin-panel-close");
const adminStatus = document.getElementById("admin-status");
const adminStatUsers = document.getElementById("admin-stat-users");
const adminStatPremium = document.getElementById("admin-stat-premium");
const adminStatCredits = document.getElementById("admin-stat-credits");
const adminStatRevenue = document.getElementById("admin-stat-revenue");
const adminStatPayments = document.getElementById("admin-stat-payments");
const adminStatQueued = document.getElementById("admin-stat-queued");
const adminStatProcessing = document.getElementById("admin-stat-processing");
const adminRefreshUsersButton = document.getElementById("admin-refresh-users");
const adminUserSearchInput = document.getElementById("admin-user-search");
const adminUserList = document.getElementById("admin-user-list");
const adminUserEmpty = document.getElementById("admin-user-empty");
const adminSelectedUserTitle = document.getElementById("admin-selected-user-title");
const adminSelectedUserPlan = document.getElementById("admin-selected-user-plan");
const adminSelectedUserMeta = document.getElementById("admin-selected-user-meta");
const adminSelectedUserWallet = document.getElementById("admin-selected-user-wallet");
const adminSelectedUserDiscount = document.getElementById("admin-selected-user-discount");
const adminUserProfileForm = document.getElementById("admin-user-profile-form");
const adminUserDisplayNameInput = document.getElementById("admin-user-display-name");
const adminUserEmailInput = document.getElementById("admin-user-email");
const adminUserPlanForm = document.getElementById("admin-user-plan-form");
const adminUserPlanInput = document.getElementById("admin-user-plan");
const adminUserPlanDaysInput = document.getElementById("admin-user-plan-days");
const adminUserCreditsForm = document.getElementById("admin-user-credits-form");
const adminUserCreditsModeInput = document.getElementById("admin-user-credits-mode");
const adminUserCreditsAmountInput = document.getElementById("admin-user-credits-amount");
const adminUserDiscountForm = document.getElementById("admin-user-discount-form");
const adminUserDiscountPercentInput = document.getElementById("admin-user-discount-percent");
const adminUserDiscountDaysInput = document.getElementById("admin-user-discount-days");
const adminUserDeleteButton = document.getElementById("admin-user-delete");
const adminUserPayments = document.getElementById("admin-user-payments");
const adminUserPromos = document.getElementById("admin-user-promos");
const adminUserUsage = document.getElementById("admin-user-usage");
const adminUserConversions = document.getElementById("admin-user-conversions");
const adminPromoForm = document.getElementById("admin-promo-form");
const adminPromoList = document.getElementById("admin-promo-list");
const adminPromoEmpty = document.getElementById("admin-promo-empty");
const adminRefreshPromosButton = document.getElementById("admin-refresh-promos");
const adminDashboardUsage = document.getElementById("admin-dashboard-usage");
const adminTabButtons = Array.from(document.querySelectorAll("[data-admin-pane-target]"));
const adminPanes = Array.from(document.querySelectorAll("[data-admin-pane]"));
const toolToolbarCopy = document.getElementById("tool-toolbar-copy");
const toolEmpty = document.getElementById("tool-empty");
const toolFaqSection = document.getElementById("tool-faq-section");
const toolFaqList = document.getElementById("tool-faq-list");
const toolTabs = Array.from(document.querySelectorAll(".tool-tab"));
const workspaceGuideCopy = document.getElementById("workspace-guide-copy");
const workspaceFromBadge = document.getElementById("workspace-from-badge");
const workspaceToBadge = document.getElementById("workspace-to-badge");
const workspaceModeBadge = document.getElementById("workspace-mode-badge");
const workspaceFilesBadge = document.getElementById("workspace-files-badge");
const workspaceFlowBadge = document.getElementById("workspace-flow-badge");
const workspaceCanvasTitle = document.getElementById("workspace-canvas-title");
const workspaceCanvasCopy = document.getElementById("workspace-canvas-copy");
const workspaceSpecialCard = document.getElementById("workspace-special-card");
const workspaceSpecialKicker = document.getElementById("workspace-special-kicker");
const workspaceSpecialTitle = document.getElementById("workspace-special-title");
const workspaceSpecialCopy = document.getElementById("workspace-special-copy");
const workspaceSpecialStack = document.getElementById("workspace-special-stack");
const workspaceOptionsCard = document.getElementById("workspace-options-card");
const workspaceOptionsTitle = document.getElementById("workspace-options-title");
const workspaceOptionsCopy = document.getElementById("workspace-options-copy");
const workspaceSubmitTitle = document.getElementById("workspace-submit-title");
const workspaceSubmitCopy = document.getElementById("workspace-submit-copy");
const workspaceLoading = document.getElementById("workspace-loading");
const workspaceGuideSteps = Array.from(document.querySelectorAll("[data-workspace-step]"));
const textLayoutInputs = Array.from(document.querySelectorAll('input[name="textLayout"]'));
const accountPaneModals = [
  accountRegisterModal,
  accountLoginModal,
  accountOverviewModal,
  accountSubscriptionModal,
  accountProfileModal,
  accountSettingsModal,
  accountVerificationModal,
  adminPanelModal
].filter(Boolean);

let tools = [];
let activeToolId = "";
let processingTimer = null;
let searchQuery = "";
let activeFilter = "all";
let searchHideTimer = null;
let isSearchResultsOpen = false;
let isToolDirectoryExpanded = false;
let searchPlaceholderTimer = null;
let searchPlaceholderIndex = 0;
let searchPlaceholderText = "";
let searchPlaceholderPhase = "typing";
let stagedFiles = [];
let draggedFileIndex = null;
let toolOptionState = {};
let conversionModalRenderedCards = [];
const filePreviewUrlCache = new Map();
const pdfPreviewUrlCache = new Map();
let pdfJsModulePromise = null;
let currentConversionLifecycleStage = "";
let accessSession = {
  plan: "free",
  premium: false,
  source: "guest",
  dailyLimit: 8,
  usedToday: 0,
  remainingToday: 8,
  upgradeConfigured: false,
  billing: {
    proMonthlyUrl: "",
    proYearlyUrl: "",
    starterPackUrl: "",
    supportUrl: "",
    whatsappUrl: "",
    checkoutEnabled: false,
    checkoutProvider: ""
  },
  billingOffers: [],
  account: {
    authenticated: false,
    user: null,
    plan: null,
    wallet: null,
    isAdmin: false,
    favoriteToolIds: [],
    recentConversions: []
  }
};
let adminState = {
  dashboard: null,
  users: [],
  promos: [],
  selectedUserId: "",
  selectedUser: null,
  search: "",
  activePane: "account"
};
let pendingAccountVerification = null;
let avatarActionReveal = false;
let hasLoadedTools = false;
let accountPollingTimer = null;
let hasHydratedNotifications = false;
const seenNotificationIds = new Set();
const asyncQueueToolIds = new Set(["pdf-ocr", "3d-convert", "mp4-to-mp3"]);
let accountWorkspaceState = {
  fileFilter: "all",
  files: {
    counts: {
      total: 0,
      temporary: 0,
      ready: 0,
      failed: 0
    },
    items: []
  },
  usage: [],
  notifications: []
};
const themeCookieName = "vaptdoc-theme";
const legacyThemeCookieName = "transmuta-theme";
const favoritesStorageKey = "vaptdoc-favorites";
const legacyFavoritesStorageKey = "transmuta-favorites";
const pendingCheckoutStorageKey = "vaptdoc-checkout-pending";
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const compactViewportQuery = window.matchMedia("(max-width: 720px)");
const touchViewportQuery = window.matchMedia("(pointer: coarse)");
const isAndroidUserAgent =
  /Android/i.test(navigator.userAgent || "") ||
  /Android/i.test(navigator.userAgentData?.platform || "");
const internalClientHeader = {
  "X-Vaptdoc-Client": "web"
};
const browserThemeColors = {
  light: "#7d38ff",
  dark: "#5d31c7"
};
const statusSilencePatterns = [
  /^Carregando\b/i,
  /^Preparando\b/i,
  /^Enviando\b/i,
  /^Confirmando\b/i,
  /^Atualizando\b/i,
  /^Salvando\b/i,
  /^Removendo\b/i,
  /^Criando\b/i,
  /^Entrando\b/i,
  /^Conferindo\b/i,
  /^Reenviando\b/i,
  /^Ativando\b/i,
  /^Entre ou crie sua conta\b/i,
  /^Digite o código enviado\b/i,
  /^Sua conta está protegida\b/i,
  /^Sua conta do dono está protegida\b/i
];
const passiveToastPatterns = [
  /^Painel administrativo atualizado\.?$/i,
  /^Carregando os detalhes do usuÃ¡rio\.?$/i,
  /^UsuÃ¡rio carregado com sucesso\.?$/i,
  /^Carregando Painel Administrativo\.?$/i,
  /^Conta carregada com sucesso\.?$/i,
  /^Dados atualizados com seguranÃ§a\.?$/i,
  /^Foto de perfil atualizada com sucesso\.?$/i,
  /^Foto de perfil removida\.?$/i,
  /^Confira seu e-mail e confirme o c[oÃ³]digo\.?$/i,
  /^Conta conectada com sucesso\.?$/i,
  /^Dados da conta atualizados\.?$/i,
  /^Foto de perfil atualizada\.?$/i,
  /^Foto de perfil removida\.?$/i,
  /^Conta encerrada neste navegador\.?$/i,
  /^Acesso premium encerrado neste navegador\.?$/i,
  /^Pagamento n[Ãa]o conclu[ií]do\.?$/i,
  /^Pagamento aguardando confirma[Ãc][Ãa]o\.?$/i,
  /^Selecione um usu[aá]rio\b/i,
  /^Cole um c[oó]digo v[aá]lido\b/i,
  /^Solicite um novo c[oó]digo\b/i,
  /^N[Ãa]o h[aá] nenhum c[oó]digo pendente\b/i,
  /^Adicione um link de pagamento ou suporte\b/i
];
const sensitiveToastPatterns = [
  /\b(password|senha|token|secret|secreto|credential|credencial|credenciais)\b/i,
  /\b(api[-_\s]?key|access[-_\s]?token|refresh[-_\s]?token|client[-_\s]?(id|secret))\b/i,
  /\b(authorization|bearer|cookie|session|sess[aÃ£]o|smtp|dkim|dmarc)\b/i,
  /\b(brevo|mercadopago|railway|admin_owner_emails)\b/i,
  /\b(referenceerror|syntaxerror|typeerror|exception|stack|trace|zoderror)\b/i,
  /\b(sqlite|sql|prisma|node:|econn|etimedout|eai_again|fetch failed|failed to fetch)\b/i
];
const quietStatusMessages = new Set([
  "Pronto para converter.",
  "Aguardando arquivo",
  "Enviando seu arquivo..."
]);
const toastTimers = new Map();
let toastSequence = 0;
const defaultSiteUrl = window.location.origin || "https://transmutalab.up.railway.app";
const initialPageData = (() => {
  try {
    return JSON.parse(pageDataScript?.textContent ?? "{}");
  } catch {
    return {};
  }
})();
const runtimeConfig = {
  siteUrl: String(initialPageData.siteUrl ?? defaultSiteUrl).trim() || defaultSiteUrl,
  maxFileSizeMB: 0
};
const lazyIconObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          hydrateFormatBadge(entry.target);
          lazyIconObserver?.unobserve(entry.target);
        });
      }, { rootMargin: "120px" })
    : null;

const vaptdocIconTrails = `
  <path class="vap-icon-trail vap-icon-trail-long" d="M2.15 8.18c0-.52.42-.94.94-.94h4.08c.52 0 .94.42.94.94s-.42.94-.94.94H3.09a.94.94 0 0 1-.94-.94Z"></path>
  <path class="vap-icon-trail vap-icon-trail-mid" d="M1.9 12.02c0-.45.36-.81.81-.81h3.42c.45 0 .81.36.81.81s-.36.81-.81.81H2.71a.81.81 0 0 1-.81-.81Z"></path>
  <path class="vap-icon-trail vap-icon-trail-short" d="M2.55 15.72c0-.4.33-.73.73-.73h2.5c.4 0 .73.33.73.73s-.33.73-.73.73h-2.5a.73.73 0 0 1-.73-.73Z"></path>
`;

function makeFileGlyph(innerMarkup) {
  return `
    <svg viewBox="0 0 24 24" fill="none" class="vap-icon" aria-hidden="true">
      ${vaptdocIconTrails}
      <path class="vap-icon-surface" d="M8.95 3.5h6.28L19 7.27V17.4c0 1.16-.94 2.1-2.1 2.1H8.95a2.1 2.1 0 0 1-2.1-2.1V5.6c0-1.16.94-2.1 2.1-2.1Z"></path>
      <path class="vap-icon-frame" d="M8.95 3.5h6.28L19 7.27V17.4c0 1.16-.94 2.1-2.1 2.1H8.95a2.1 2.1 0 0 1-2.1-2.1V5.6c0-1.16.94-2.1 2.1-2.1Z"></path>
      <path class="vap-icon-fold" d="M15.22 3.58v2.66c0 .7.57 1.27 1.27 1.27H19"></path>
      ${innerMarkup}
    </svg>
  `;
}

function makePanelGlyph(innerMarkup) {
  return `
    <svg viewBox="0 0 24 24" fill="none" class="vap-icon" aria-hidden="true">
      ${vaptdocIconTrails}
      <rect class="vap-icon-surface" x="6.3" y="5.4" width="12.8" height="13.2" rx="3"></rect>
      <rect class="vap-icon-frame" x="6.3" y="5.4" width="12.8" height="13.2" rx="3"></rect>
      ${innerMarkup}
    </svg>
  `;
}

function makeOrbitGlyph(innerMarkup) {
  return `
    <svg viewBox="0 0 24 24" fill="none" class="vap-icon" aria-hidden="true">
      ${vaptdocIconTrails}
      <path class="vap-icon-orbit" d="M8.15 8.1c1.05-1.02 2.42-1.6 3.85-1.6 3.05 0 5.55 2.5 5.55 5.55S15.05 17.6 12 17.6 6.45 15.1 6.45 12.05c0-.64.11-1.28.34-1.88"></path>
      <circle class="vap-icon-core" cx="12.2" cy="12.05" r="1.5"></circle>
      ${innerMarkup}
    </svg>
  `;
}

function makeCubeGlyph(innerMarkup) {
  return `
    <svg viewBox="0 0 24 24" fill="none" class="vap-icon" aria-hidden="true">
      ${vaptdocIconTrails}
      <path class="vap-icon-surface" d="m12 4.55 5.55 3.08v7.1L12 17.8l-5.55-3.07v-7.1L12 4.55Z"></path>
      <path class="vap-icon-frame" d="m12 4.55 5.55 3.08v7.1L12 17.8l-5.55-3.07v-7.1L12 4.55Z"></path>
      <path class="vap-icon-frame" d="m6.45 7.63 5.55 3.06 5.55-3.06"></path>
      <path class="vap-icon-frame" d="M12 10.69v7.11"></path>
      ${innerMarkup}
    </svg>
  `;
}

const formatVisuals = {
  pdf: makeFileGlyph(`
    <path class="vap-icon-line" d="M10.05 10.2h4.45"></path>
    <path class="vap-icon-line" d="M10.05 13.1h4.05"></path>
    <path class="vap-icon-line" d="M10.05 16h3.05"></path>
    <path class="vap-icon-accent" d="m13.15 11.75 1.05 1.1 1.55-1.9"></path>
  `),
  docx: makeFileGlyph(`
    <path class="vap-icon-line" d="M10 9.9h4.4"></path>
    <path class="vap-icon-line" d="M10 12.85h4.4"></path>
    <path class="vap-icon-line" d="M10 15.8h4.4"></path>
    <path class="vap-icon-accent" d="m10.55 12.1 1.4 1.75 2.6-3.15"></path>
  `),
  office: makeFileGlyph(`
    <path class="vap-icon-line" d="M10 9.65h4.5"></path>
    <path class="vap-icon-line" d="M10 12.5h4.1"></path>
    <path class="vap-icon-line" d="M10 15.35h2.8"></path>
    <circle class="vap-icon-dot" cx="14.55" cy="9.65" r="0.78"></circle>
  `),
  jpg: makePanelGlyph(`
    <circle class="vap-icon-dot" cx="10.25" cy="10.05" r="1.18"></circle>
    <path class="vap-icon-line" d="m9.35 15.1 2.25-2.2 1.7 1.45 1.95-2.2 2 2.38"></path>
  `),
  jpeg: makePanelGlyph(`
    <circle class="vap-icon-dot" cx="10.25" cy="10.05" r="1.18"></circle>
    <path class="vap-icon-line" d="m9.35 15.1 2.25-2.2 1.7 1.45 1.95-2.2 2 2.38"></path>
  `),
  png: makePanelGlyph(`
    <circle class="vap-icon-dot" cx="10.15" cy="10" r="1.1"></circle>
    <path class="vap-icon-line" d="m9.1 15.2 2.2-1.95 1.7 1.4 2.3-2.65 1.6 1.98"></path>
    <path class="vap-icon-accent" d="m13.95 9.2 0.9 0.95 1.55-1.65"></path>
  `),
  mp4: makePanelGlyph(`
    <path class="vap-icon-play" d="m11.05 9.7 4.05 2.35-4.05 2.35Z"></path>
    <path class="vap-icon-line" d="M17.65 10.25 19.2 9.2v5.7l-1.55-1.02"></path>
  `),
  mp3: makeOrbitGlyph(`
    <path class="vap-icon-line" d="M12.25 8.85v4.95"></path>
    <path class="vap-icon-line" d="m12.25 8.85 3.65-.75"></path>
    <circle class="vap-icon-dot" cx="10.35" cy="14.9" r="1.22"></circle>
    <circle class="vap-icon-dot vap-icon-dot-soft" cx="15.95" cy="13.8" r="1.1"></circle>
  `),
  text: makeFileGlyph(`
    <path class="vap-icon-line" d="M10 9.95h4.65"></path>
    <path class="vap-icon-line" d="M10 12.75h4.65"></path>
    <path class="vap-icon-line" d="M10 15.55h3.25"></path>
    <path class="vap-icon-line vap-icon-line-soft" d="M10 18.1h2.15"></path>
  `),
  html: makePanelGlyph(`
    <path class="vap-icon-line" d="m10 10.2-1.65 1.85L10 13.9"></path>
    <path class="vap-icon-line" d="m14 10.2 1.65 1.85L14 13.9"></path>
    <path class="vap-icon-line" d="m12.85 9.1-1.6 5.9"></path>
  `),
  archive: makeFileGlyph(`
    <path class="vap-icon-line" d="M9.55 9.55h5.05"></path>
    <path class="vap-icon-line" d="M9.55 12.15h5.05"></path>
    <path class="vap-icon-line" d="M9.55 14.75h5.05"></path>
    <path class="vap-icon-accent" d="M8.75 8.2h0.01"></path>
  `),
  model3d: makeCubeGlyph(`
    <path class="vap-icon-accent" d="m11.15 12.75 1.2 1.35 2.05-2.35"></path>
  `)
};

const toolSupportCopy = {
  "pdf-to-docx": "Envie seu PDF para receber um DOCX mais facil de editar.",
  "docx-to-pdf": "Envie seu DOCX e receba um PDF pronto para compartilhar.",
  "jpg-to-png": "Transforme sua imagem JPG em PNG em poucos toques.",
  "jpeg-to-png": "Transforme sua imagem JPEG em PNG em poucos toques.",
  "png-to-jpg": "Transforme sua imagem PNG em JPG com rapidez.",
  "png-to-jpeg": "Transforme sua imagem PNG em JPEG com rapidez.",
  "mp4-to-mp3": "Envie seu vídeo e receba somente o áudio em MP3.",
  "pdf-to-text": "Extraia o texto do PDF para ler, copiar ou editar.",
  "3d-convert": "Envie um modelo 3D e escolha o formato de saída para converter com o motor Aspose 3D."
};

const toolHelpContent = {
  "3d-convert": {
    title: "Ajuda do conversor 3D",
    copy: "Cada formato 3D prioriza uma necessidade diferente. Este guia evita que você precise adivinhar a melhor saída.",
    items: [
      {
        title: "Escolha pela finalidade",
        copy: "STL e OBJ são mais comuns para impressão e modelagem leve. GLB e GLTF funcionam melhor para visualização em apps e web."
      },
      {
        title: "Revise a orientação",
        copy: "Se o modelo vier de CAD ou escaneamento, confira a prévia e mantenha o formato mais estável para não perder detalhes."
      },
      {
        title: "Arquivos maiores demoram mais",
        copy: "Modelos com muitas malhas ou texturas podem levar mais tempo. O progresso continua sendo mostrado no painel de resultado."
      }
    ]
  },
  "pdf-extract": {
    title: "Ajuda da extração avançada",
    copy: "Use a extração simples quando quiser texto corrido e a avançada quando precisar organizar blocos ou planilhas depois.",
    items: [
      {
        title: "CSV detalhado",
        copy: "Ative quando precisar reutilizar o conteúdo em planilhas, pipelines ou revisão por colunas."
      },
      {
        title: "Separar por palavra",
        copy: "Ideal para análise fina, mas gera saídas maiores e mais detalhadas."
      },
      {
        title: "PDF escaneado",
        copy: "Se o arquivo for imagem, prefira OCR em PDF ou PDF para texto para uma leitura mais tolerante."
      }
    ]
  },
  "pdf-validate-pdfa": {
    title: "Ajuda da validação PDF/A",
    copy: "Esta ferramenta não converte o arquivo. Ela confirma se o PDF já segue o nível de arquivamento que você espera.",
    items: [
      {
        title: "Relatório em vez de conversão",
        copy: "O resultado mostra a conformidade atual para ajudar na checagem antes de enviar documentos."
      },
      {
        title: "Escolha a regra certa",
        copy: "Use a conformidade esperada que sua instituicao ou fluxo realmente pede, como PDF/A-2b ou PDF/A-3u."
      }
    ]
  }
};

const defaultSeoModel = {
  siteName: "vaptdoc",
    title: "vaptdoc | Converta arquivos sem complicação",
  description:
    "Converta PDF, DOCX, imagens, áudio, vídeo e modelos 3D com rapidez, segurança e uma experiência limpa em qualquer dispositivo.",
  imagePath: "/assets/vaptdoc-logo-transparent.png"
};

const toolThemes = {
  "pdf-to-docx": { from: "rgba(255, 157, 132, 0.95)", to: "rgba(255, 223, 168, 0.9)", glow: "rgba(255, 166, 141, 0.28)" },
  "3d-convert": { from: "rgba(92, 170, 255, 0.95)", to: "rgba(156, 115, 255, 0.92)", glow: "rgba(111, 149, 255, 0.26)" },
  "docx-to-pdf": { from: "rgba(126, 181, 255, 0.95)", to: "rgba(169, 231, 255, 0.9)", glow: "rgba(126, 181, 255, 0.26)" },
  "jpg-to-png": { from: "rgba(116, 217, 208, 0.95)", to: "rgba(171, 245, 226, 0.9)", glow: "rgba(116, 217, 208, 0.24)" },
  "jpeg-to-png": { from: "rgba(116, 217, 208, 0.95)", to: "rgba(171, 245, 226, 0.9)", glow: "rgba(116, 217, 208, 0.24)" },
  "png-to-jpg": { from: "rgba(122, 218, 146, 0.95)", to: "rgba(195, 244, 178, 0.9)", glow: "rgba(122, 218, 146, 0.24)" },
  "png-to-jpeg": { from: "rgba(122, 218, 146, 0.95)", to: "rgba(195, 244, 178, 0.9)", glow: "rgba(122, 218, 146, 0.24)" },
  "mp4-to-mp3": { from: "rgba(164, 156, 255, 0.95)", to: "rgba(223, 197, 255, 0.9)", glow: "rgba(164, 156, 255, 0.24)" },
  "pdf-to-text": { from: "rgba(255, 181, 123, 0.95)", to: "rgba(255, 223, 156, 0.92)", glow: "rgba(255, 181, 123, 0.24)" },
  default: { from: "rgba(142, 193, 224, 0.95)", to: "rgba(193, 229, 238, 0.9)", glow: "rgba(142, 193, 224, 0.24)" }
};

const formatBadgeThemes = {
  pdf: "format-badge-pdf",
  docx: "format-badge-docx",
  office: "format-badge-docx",
  jpg: "format-badge-image",
  jpeg: "format-badge-image",
  png: "format-badge-image",
  tiff: "format-badge-image",
  image: "format-badge-image",
  mp4: "format-badge-video",
  mp3: "format-badge-audio",
  text: "format-badge-text",
  html: "format-badge-video",
  archive: "format-badge-audio",
  model3d: "format-badge-video"
};

const searchPlaceholderExamples = [
  "pdf para docx",
  "png para jpg",
  "docx para pdf",
  "mp4 para mp3",
  "pdf para texto",
  "stl para obj"
];
const searchResultsLimit = 12;
const featuredToolRowDesktopLimit = 5;
const featuredToolRowMobileLimit = 6;
const defaultFeaturedToolIds = [
  "pdf-to-docx",
  "docx-to-pdf",
  "pdf-merge",
  "pdf-split",
  "pdf-compress",
  "image-to-pdf",
  "pdf-to-jpg",
  "jpg-to-png"
];
const orderSensitiveTools = new Set(["pdf-merge", "image-to-pdf"]);
const specializedWorkspaceTools = new Set(["pdf-merge", "pdf-split", "image-to-pdf"]);

const workspaceBlueprints = {
  default: {
    canvasTitle: "Monte sua mesa de conversão",
    canvasCopy: "Envie, arraste, revise e troque arquivos sem sair desta área.",
    submitTitle: "Converter e baixar",
    submitCopy: "Acompanhe o progresso e baixe o arquivo assim que ele estiver pronto."
  },
  "pdf-merge": {
    canvasTitle: "Monte a ordem final do PDF",
    canvasCopy: "Cada card representa um PDF na pilha final. Reordene, remova e complete a grade antes de unir.",
    submitTitle: "Unir e baixar",
    submitCopy: "Quando a ordem estiver certa, junte tudo em um único PDF pronto para download."
  },
  "pdf-split": {
    canvasTitle: "Escolha o PDF que sera dividido",
    canvasCopy: "Use a lateral para decidir o modo de corte e deixe o arquivo de origem aqui no centro para revisar.",
    submitTitle: "Dividir e baixar",
    submitCopy: "O resultado sai como ZIP ou PDF único, conforme o tipo de divisão escolhido."
  },
  "image-to-pdf": {
    canvasTitle: "Organize as páginas do novo PDF",
    canvasCopy: "Cada imagem vira uma página. Ajuste a ordem, complete a grade e refine o layout na lateral.",
    submitTitle: "Gerar PDF e baixar",
    submitCopy: "Feche a montagem do documento e baixe o PDF com o layout escolhido."
  }
};

const specializedWorkspaceCopy = {
  "pdf-merge": {
    kicker: "Mesa de união",
    title: "Ordem final dos PDFs",
    copy: "Atalhos rápidos para organizar a pilha, revisar o peso total e fechar a união com menos cliques."
  },
  "pdf-split": {
    kicker: "Corte guiado",
    title: "Defina como o PDF será dividido",
    copy: "Escolha o tipo de divisão aqui na lateral e receba só os campos necessários para esse modo."
  },
  "image-to-pdf": {
    kicker: "Montagem visual",
    title: "Transforme imagens em páginas",
    copy: "Controle ordem, orientação, tamanho e margem do PDF sem ficar preso a um formulário técnico."
  }
};

const optionPresentation = {
  target3dFormat: {
    variant: "cards",
    choices: {
      stl: { label: "STL", hint: "Impressão 3D e slicers" },
      obj: { label: "OBJ", hint: "Modelagem e textura" },
      fbx: { label: "FBX", hint: "Animação e cena" },
      glb: { label: "GLB", hint: "Visualização rápida" },
      gltf: { label: "GLTF", hint: "Web e apps 3D" },
      dae: { label: "DAE", hint: "Collada" },
      ply: { label: "PLY", hint: "Malha e scan" },
      amf: { label: "AMF", hint: "Impressão 3D" },
      "3ds": { label: "3DS", hint: "Formato legado" },
      u3d: { label: "U3D", hint: "PDF 3D" },
      drc: { label: "DRC", hint: "Draco compactado" },
      rvm: { label: "RVM", hint: "Plantas industriais" },
      pdf: { label: "PDF 3D", hint: "Visualização em PDF" }
    }
  },
  splitMode: {
    variant: "cards",
    choices: {
      ranges: { label: "Separar trechos", hint: "Você escolhe os intervalos" },
      fixed_range: { label: "Dividir em partes", hint: "Mesmo número de páginas" },
      remove_pages: { label: "Remover páginas", hint: "Retira páginas e devolve 1 PDF" }
    }
  },
  compressionLevel: {
    variant: "cards",
    choices: {
      low: { label: "Mais qualidade", hint: "Menos compressão" },
      recommended: { label: "Equilibrado", hint: "Qualidade e tamanho" },
      extreme: { label: "Arquivo menor", hint: "Máxima compressão" }
    }
  },
  rotateAngle: {
    variant: "gesture"
  },
  imagePdfOrientation: {
    variant: "chips",
    choices: {
      portrait: { label: "Retrato" },
      landscape: { label: "Paisagem" }
    }
  },
  imagePdfPageSize: {
    variant: "chips"
  },
  htmlPageSize: {
    variant: "chips"
  },
  htmlPageOrientation: {
    variant: "chips",
    choices: {
      portrait: { label: "Retrato" },
      landscape: { label: "Paisagem" }
    }
  },
  rotateDirection: {
    variant: "chips"
  },
  pdfaConformance: {
    variant: "chips"
  },
  validatePdfaConformance: {
    variant: "chips"
  },
  watermarkVerticalPosition: {
    variant: "chips"
  },
  watermarkHorizontalPosition: {
    variant: "chips"
  },
  pageNumbersVerticalPosition: {
    variant: "chips"
  },
  pageNumbersHorizontalPosition: {
    variant: "chips"
  }
};

const favoriteToolIds = new Set(loadFavoriteToolIds());

function getToolDescription(tool) {
  return toolSupportCopy[tool.id] ?? tool.fileHint ?? "Envie seu arquivo e baixe o resultado no formato escolhido.";
}

function buildAbsoluteSiteUrl(pathname = "/") {
  return new URL(pathname, `${runtimeConfig.siteUrl.replace(/\/$/u, "")}/`).toString();
}

function getToolMetaDescription(tool) {
  const lead = getToolDescription(tool).replace(/\.$/u, "");
  const detail = String(tool.description ?? "").replace(/\.$/u, "");
  return `${lead}. ${detail}.`;
}

function buildToolFaqItems(tool) {
  if (!tool) {
    return [];
  }

  const helpContent = toolHelpContent[tool.id];
  const readableInput = tool.inputKinds.map((kind) => String(kind).toUpperCase()).join(", ");
  const readableOutput = String(tool.outputExtension ?? "").toUpperCase();
  const uploadCopy = tool.allowsMultipleFiles
    ? `Envie ${tool.minFiles && tool.minFiles > 1 ? `pelo menos ${tool.minFiles} arquivos` : "os arquivos necessários"} no formato ${readableInput}.`
    : `Envie um arquivo no formato ${readableInput}.`;

  const items = [
    {
      question: `Como usar ${tool.label}?`,
      answer: `${uploadCopy} Depois disso, revise apenas os ajustes necessários e baixe o resultado em ${readableOutput}.`
    },
    {
      question: `${tool.label} funciona no celular?`,
      answer: "Sim. O fluxo foi enxugado para abrir rápido no mobile, com upload direto, ajustes objetivos e download imediato."
    }
  ];

  if (helpContent?.items?.[0]) {
    items.push({
      question: helpContent.items[0].title,
      answer: helpContent.items[0].copy
    });
  } else {
    items.push({
      question: `O que muda no resultado de ${tool.label}?`,
      answer: `A ferramenta entrega a conversão em ${readableOutput} e só mostra opções extras quando elas realmente ajudam nesse tipo de arquivo.`
    });
  }

  return items;
}

function buildFaqSchemaPayload(tool) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: buildAbsoluteSiteUrl(tool ? getToolPagePath(tool) : "/"),
    mainEntity: buildToolFaqItems(tool).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function getToolPagePath(tool) {
  return String(tool?.routePath ?? `/ferramenta/${encodeURIComponent(tool?.id ?? "")}`);
}

function setMetaContent(element, value) {
  if (element) {
    element.setAttribute("content", value);
  }
}

function setSeoScriptContent(element, payload) {
  if (element) {
    element.textContent = JSON.stringify(payload);
  }
}

function updatePageData(tool) {
  if (!pageDataScript) {
    return;
  }

  pageDataScript.textContent = JSON.stringify({
    toolId: tool?.id ?? "",
    canonicalUrl: buildAbsoluteSiteUrl(tool ? getToolPagePath(tool) : "/"),
    pagePath: tool ? getToolPagePath(tool) : "/",
    siteUrl: runtimeConfig.siteUrl
  });
}

function getRouteToolIdFromLocation() {
  const normalizedPath = window.location.pathname.replace(/\/+$/u, "") || "/";
  const directMatch = tools.find((tool) => getToolPagePath(tool) === normalizedPath);
  if (directMatch) {
    return directMatch.id;
  }

  return normalizedPath.startsWith("/ferramenta/")
    ? decodeURIComponent(normalizedPath.slice("/ferramenta/".length))
    : "";
}

function updatePageModeUi(tool) {
  const isToolPage = Boolean(tool);
  document.body.dataset.pageMode = isToolPage ? "tool" : "home";
  homeHero.hidden = isToolPage;
  toolDirectory.hidden = isToolPage;
  routeHero.hidden = !isToolPage;
  form.hidden = !isToolPage;
  if (toolFaqSection && !isToolPage) {
    toolFaqSection.hidden = true;
  }

  if (toolHelpButton && !isToolPage) {
    toolHelpButton.hidden = true;
  }
  hideConversionModal();
  if (!isToolPage) {
    hideToolHelpModal();
  }

  if (siteHeaderCurrent) {
    siteHeaderCurrent.hidden = !isToolPage;
    siteHeaderCurrent.textContent = tool?.label ?? "";
  }

  if (routeKicker) {
    routeKicker.textContent = isToolPage ? "Ferramenta exclusiva" : "Conversor online rápido e leve";
  }

  if (routeTitle) {
    routeTitle.textContent = tool?.label ?? "Converter arquivo";
  }

  if (routeCopy) {
    routeCopy.textContent = tool
      ? `${getToolDescription(tool)} Envie o arquivo para liberar só os ajustes necessários desta conversão.`
      : "Escolha uma ferramenta, envie seu arquivo e baixe o resultado sem um painel carregado.";
  }

  document.querySelectorAll(".tool-card").forEach((card) => {
    card.classList.toggle("active", isToolPage && card.dataset.toolId === tool?.id);
  });
}

function navigateToTool(tool, options = {}) {
  if (!tool) {
    return;
  }

  const { replace = false } = options;
  applyActiveTool(tool.id, {
    moveToUpload: false,
    resetFiles: false,
    syncHistory: true,
    replaceHistory: replace,
    syncSeo: true
  });
  updatePageModeUi(tool);
  requestAnimationFrame(() => {
    routeHero?.scrollIntoView({
      behavior: getPreferredScrollBehavior(),
      block: "start"
    });
  });
}

function syncSeoForTool(tool) {
  const title = tool ? `Converter ${tool.label} online | ${defaultSeoModel.siteName}` : defaultSeoModel.title;
  const description = tool ? getToolMetaDescription(tool) : defaultSeoModel.description;
  const canonicalUrl = buildAbsoluteSiteUrl(tool ? getToolPagePath(tool) : "/");
  const imageUrl = buildAbsoluteSiteUrl(defaultSeoModel.imagePath);

  document.title = title;
  if (seoTitle) {
    seoTitle.textContent = title;
  }

  setMetaContent(seoDescriptionMeta, description);
  setMetaContent(seoOgTitleMeta, title);
  setMetaContent(seoOgDescriptionMeta, description);
  setMetaContent(seoOgUrlMeta, canonicalUrl);
  setMetaContent(seoOgImageMeta, imageUrl);
  setMetaContent(seoTwitterTitleMeta, title);
  setMetaContent(seoTwitterDescriptionMeta, description);
  setMetaContent(seoTwitterImageMeta, imageUrl);
  setMetaContent(seoToolIdMeta, tool?.id ?? "");
  if (seoCanonicalLink) {
    seoCanonicalLink.setAttribute("href", canonicalUrl);
  }

  setSeoScriptContent(seoSoftwareSchema, {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: defaultSeoModel.siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: canonicalUrl,
    image: imageUrl,
    description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL"
    }
  });

  const howToSteps = tool
    ? [
        `Abra a ferramenta ${tool.label} no vaptdoc.`,
        tool.allowsMultipleFiles
          ? `Envie ${tool.minFiles && tool.minFiles > 1 ? `pelo menos ${tool.minFiles} arquivos` : "seus arquivos"} no formato ${tool.inputKinds.map((kind) => String(kind).toUpperCase()).join(", ")}.`
          : `Envie um arquivo no formato ${tool.inputKinds.map((kind) => String(kind).toUpperCase()).join(", ")}.`,
        Array.isArray(tool.optionFields) && tool.optionFields.length > 0
          ? "Revise os ajustes visiveis no painel lateral antes de converter."
          : "Revise a prévia e siga direto para a conversão.",
        `Baixe o resultado em ${String(tool.outputExtension ?? "").toUpperCase()}.`
      ]
    : [
        "Escolha a conversão ideal na grade principal.",
        "Envie seu arquivo e organize a ordem quando necessário.",
        "Revise os ajustes visíveis e inicie a conversão.",
        "Baixe o resultado assim que o processamento terminar."
      ];

  setSeoScriptContent(seoHowToSchema, {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tool ? `Como ${tool.label.toLowerCase()} no vaptdoc` : "Como converter arquivos no vaptdoc",
    description,
    url: canonicalUrl,
    step: howToSteps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: text,
        text
      }))
  });
  setSeoScriptContent(seoFaqSchema, buildFaqSchemaPayload(tool));

  updatePageData(tool);
}

function syncToolHistory(tool, options = {}) {
  const { replace = false } = options;
  const targetPath = tool ? getToolPagePath(tool) : "/";
  const currentPath = window.location.pathname;

  if (currentPath === targetPath) {
    return;
  }

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", targetPath);
}

function hydrateFormatBadge(element) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const format = element.dataset.lazyFormat ?? "text";
  element.innerHTML = formatVisuals[format] ?? formatVisuals.text;
  delete element.dataset.lazyFormat;
}

function setWorkspaceLoadingState(isLoading, label = "Processando") {
  form?.classList.toggle("is-processing", isLoading);
  form?.setAttribute("aria-busy", String(isLoading));
  if (workspaceLoading) {
    workspaceLoading.hidden = true;
    workspaceLoading.setAttribute("aria-hidden", String(!isLoading));
    const badge = workspaceLoading.querySelector(".workspace-loading-badge");
    if (badge) {
      badge.textContent = label;
    }
  }
  if (convertButton) {
    convertButton.classList.toggle("is-loading", isLoading);
    convertButton.disabled = isLoading;
  }
}

function setToolsLoadingState(isLoading) {
  if (toolGridSkeleton) {
    toolGridSkeleton.hidden = !isLoading;
  }

  if (toolGrid) {
    toolGrid.hidden = isLoading;
  }
}

function getReadableMaxFileSize() {
  const maxFileSizeMB = Number(runtimeConfig.maxFileSizeMB ?? 0);
  return maxFileSizeMB > 0 ? `${maxFileSizeMB} MB` : "";
}

function getFilesOverLimit(files) {
  const maxBytes = Number(runtimeConfig.maxFileSizeMB ?? 0) * 1024 * 1024;
  if (!maxBytes) {
    return [];
  }

  return files.filter((file) => Number(file.size ?? 0) > maxBytes);
}

function renderToolHelp(tool) {
  if (!toolHelpTitle || !toolHelpCopy || !toolHelpList) {
    return;
  }

  const content = tool ? toolHelpContent[tool.id] : null;
  if (toolHelpButton) {
    toolHelpButton.hidden = !content || document.body.dataset.pageMode !== "tool";
  }

  if (!content) {
    toolHelpList.innerHTML = "";
    hideToolHelpModal();
    return;
  }

  toolHelpTitle.textContent = content.title;
  toolHelpCopy.textContent = content.copy;
  toolHelpList.innerHTML = "";

  content.items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "tool-help-item";

    const icon = document.createElement("span");
    icon.className = "tool-help-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M12 10.2v4.6"></path><path d="M12 7.8h.01"></path></svg>';

    const copy = document.createElement("div");
    copy.className = "tool-help-copy";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const text = document.createElement("p");
    text.textContent = item.copy;

    copy.append(title, text);
    article.append(icon, copy);
    toolHelpList.append(article);
  });
}

function renderToolFaq(tool) {
  if (!toolFaqSection || !toolFaqList) {
    return;
  }

  const items = buildToolFaqItems(tool);
  const shouldShow = Boolean(tool && document.body.dataset.pageMode === "tool" && items.length > 0);
  toolFaqSection.hidden = !shouldShow;

  if (!shouldShow) {
    toolFaqList.innerHTML = "";
    return;
  }

  toolFaqList.innerHTML = "";
  items.forEach((item, index) => {
    const entry = document.createElement("details");
    entry.className = "tool-faq-item";
    if (index === 0) {
      entry.open = true;
    }

    const summary = document.createElement("summary");
    summary.textContent = item.question;

    const copy = document.createElement("p");
    copy.textContent = item.answer;

    entry.append(summary, copy);
    toolFaqList.append(entry);
  });
}

function setStatus(message, options = {}) {
  if (!statusText) {
    announceToast(message, options);
    return;
  }

  statusText.textContent = message;
  statusText.hidden = !message || quietStatusMessages.has(message);
  announceToast(message, options);
}

function setConversionLifecycle(stage = "") {
  currentConversionLifecycleStage = stage;

  if (!conversionLifecycle) {
    return;
  }

  const visible = Boolean(stage);
  conversionLifecycle.hidden = !visible;
  conversionLifecycleChips.forEach((chip) => {
    const chipStage = chip.dataset.conversionStage ?? "";
    const isActive = visible && chipStage === stage;
    const isDone =
      visible &&
      ((stage === "processing" && chipStage === "queued") ||
        (stage === "ready" && (chipStage === "queued" || chipStage === "processing")));

    chip.classList.toggle("is-active", isActive);
    chip.classList.toggle("is-done", isDone);
  });
}

function clearConversionLifecycle() {
  setConversionLifecycle("");
}

function setProgress(value, label) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  if (progressFill) {
    progressFill.style.width = `${safeValue}%`;
  }
  if (progressValue) {
    progressValue.textContent = `${safeValue}%`;
  }
  if (progressLabel) {
    progressLabel.textContent = label;
  }
}

function showUploadProgress() {
  if (uploadProgress) {
    uploadProgress.hidden = false;
  }
}

function hideUploadProgress() {
  if (uploadProgress) {
    uploadProgress.hidden = true;
  }
}

function stopProgressAnimation() {
  if (processingTimer) {
    clearInterval(processingTimer);
    processingTimer = null;
  }
}

function startProcessingAnimation(startAt = 72) {
  stopProgressAnimation();
  let current = startAt;

  processingTimer = window.setInterval(() => {
    current = Math.min(94, current + Math.max(1, Math.round((94 - current) / 7)));
    setProgress(current, "Convertendo seu arquivo...");

    if (current >= 94) {
      stopProgressAnimation();
    }
  }, 550);
}

function getSelectedTextLayout() {
  return textLayoutInputs.find((input) => input.checked)?.value ?? "blocks";
}

function setSelectedTextLayout(mode) {
  textLayoutInputs.forEach((input) => {
    input.checked = input.value === mode;
  });
}

function setTextLayoutEnabled(enabled) {
  textLayoutInputs.forEach((input) => {
    input.disabled = !enabled;
  });
}

function getToolOptionInitialValue(field, toolId = activeToolId) {
  const storedValue = toolOptionState[toolId]?.[field.name];
  if (storedValue !== undefined) {
    if (field.type === "checkbox") {
      return storedValue === true || storedValue === "true";
    }

    return String(storedValue);
  }

  if (field.defaultValue !== undefined && field.defaultValue !== null) {
    return field.defaultValue;
  }

  if (field.type === "checkbox") {
    return false;
  }

  return "";
}

function storeCurrentToolOptions(tool = getToolById()) {
  if (!tool || !form) {
    return;
  }

  const nextState = { ...(toolOptionState[tool.id] ?? {}) };
  form.querySelectorAll("[data-option-name]").forEach((field) => {
    if (!field.name) {
      return;
    }

    nextState[field.name] = field.type === "checkbox" ? field.checked : field.value;
  });
  toolOptionState[tool.id] = nextState;
}

function loadFavoriteToolIds() {
  try {
    const stored = localStorage.getItem(favoritesStorageKey) ?? localStorage.getItem(legacyFavoritesStorageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function saveFavoriteToolIds() {
  try {
    localStorage.setItem(favoritesStorageKey, JSON.stringify(Array.from(favoriteToolIds)));
  } catch {
    // Ignore storage failures to keep the converter usable.
  }
}

function isPremiumTool(tool) {
  return tool?.access === "pro";
}

function isToolLocked(tool) {
  return isPremiumTool(tool) && !accessSession?.premium;
}

function shouldRevealUpgradeContext(session = accessSession) {
  if (!session) {
    return false;
  }

  if (session.premium) {
    return true;
  }

  const usedToday = Number(session.usedToday ?? 0);
  const remainingToday = session.remainingToday === null ? null : Number(session.remainingToday ?? 0);

  if (usedToday > 0) {
    return true;
  }

  return remainingToday !== null && remainingToday <= 0;
}

function formatAccessPlanLabel(session) {
  if (session?.plan === "team") {
    return "Team";
  }

  if (session?.plan === "pro") {
    return "Pro";
  }

  return "Gratis";
}

function getAccessUsageLabel(session) {
  if (!session) {
    return "Carregando seu acesso...";
  }

  if (session.plan === "team") {
    return "Uso liberado para equipe e operação contínua.";
  }

  if (session.plan === "pro") {
    if (session.remainingToday === null) {
      return "Tudo liberado hoje para conversões premium.";
    }

    return `${session.remainingToday} convers${session.remainingToday === 1 ? "ao" : "oes"} restantes hoje no Pro.`;
  }

  if (session.remainingToday === null) {
    return "Conversoes disponiveis.";
  }

  if (session.remainingToday <= 0) {
    return "Suas conversões grátis acabaram hoje. Faça upgrade para continuar.";
  }

  return `${session.remainingToday} de ${session.dailyLimit} convers${session.dailyLimit === 1 ? "ão grátis" : "ões grátis"} restantes hoje.`;
}

function getSupportUrl() {
  return accessSession?.billing?.whatsappUrl || accessSession?.billing?.supportUrl || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrencyBRL(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "R$ --";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(numeric);
}

function formatDateTime(value) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium"
  }).format(date);
}

function getOfferById(offerId) {
  return Array.isArray(accessSession?.billingOffers)
    ? accessSession.billingOffers.find((offer) => offer?.id === offerId) ?? null
    : null;
}

function getAccountState() {
  return accessSession?.account ?? {
    authenticated: false,
    user: null,
    plan: null,
    wallet: null,
    isAdmin: false,
    favoriteToolIds: [],
    recentConversions: []
  };
}

function createEmptyAccountWorkspaceState() {
  return {
    fileFilter: "all",
    files: {
      counts: {
        total: 0,
        temporary: 0,
        ready: 0,
        failed: 0
      },
      items: []
    },
    usage: [],
    notifications: []
  };
}

function normalizeAccountFileFilter(value) {
  return ["all", "temporary", "ready", "failed"].includes(String(value)) ? value : "all";
}

function shouldQueueAsyncConversion(tool, files) {
  if (!tool || !isAccountAuthenticated() || !Array.isArray(files) || files.length === 0) {
    return false;
  }

  return asyncQueueToolIds.has(tool.id);
}

function isAccountAuthenticated() {
  return Boolean(getAccountState().authenticated && getAccountState().user);
}

function isAdminAuthorized() {
  return Boolean(isAccountAuthenticated() && getAccountState().isAdmin);
}

function getAccountWallet() {
  return getAccountState().wallet ?? {
    creditBalance: 0,
    discountPercent: 0,
    discountExpiresAt: null
  };
}

function getAccountDiscountCopy() {
  const wallet = getAccountWallet();
  if (!wallet.discountPercent || !wallet.discountExpiresAt) {
    return "Nenhum desconto ativo no momento.";
  }

  return `${wallet.discountPercent}% ativo ate ${formatDateTime(wallet.discountExpiresAt)}.`;
}

function getAccountInitials() {
  const displayName = String(getAccountState().user?.displayName ?? "vaptdoc").trim();
  return getInitialsFromText(displayName, "V");
}

function getInitialsFromText(value, fallback = "V") {
  const parts = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || fallback;
}

function getAccountAvatarUrl() {
  const accountState = getAccountState();
  if (!accountState.user?.hasAvatar) {
    return "";
  }

  const version = encodeURIComponent(accountState.user.avatarUpdatedAt ?? accountState.user.updatedAt ?? "");
  return `/api/account/avatar?v=${version}`;
}

function applyAvatarToElements(imageElement, initialsElement, avatarUrl, initials) {
  if (initialsElement) {
    initialsElement.textContent = initials;
    initialsElement.hidden = Boolean(avatarUrl);
  }

  if (imageElement) {
    if (avatarUrl) {
      imageElement.src = avatarUrl;
      imageElement.hidden = false;
      imageElement.onerror = () => {
        imageElement.hidden = true;
        if (initialsElement) {
          initialsElement.hidden = false;
        }
      };
    } else {
      imageElement.hidden = true;
      imageElement.removeAttribute("src");
    }
  }
}

function getManualOfferUrl(offerId) {
  if (offerId === "pro-monthly") {
    return accessSession?.billing?.proMonthlyUrl ?? "";
  }

  if (offerId === "pro-yearly") {
    return accessSession?.billing?.proYearlyUrl ?? "";
  }

  if (offerId === "starter-pack") {
    return accessSession?.billing?.starterPackUrl ?? "";
  }

  return "";
}

function isManagedCheckoutEnabled() {
  return Boolean(accessSession?.billing?.checkoutEnabled);
}

function applySessionPayload(payload = {}) {
  accessSession = {
    ...accessSession,
    ...payload,
    billing: {
      ...accessSession.billing,
      ...(payload.billing ?? {})
    },
    billingOffers: Array.isArray(payload.billingOffers) ? payload.billingOffers : accessSession.billingOffers,
    account: payload.account
      ? {
          ...getAccountState(),
          ...payload.account
        }
      : getAccountState()
  };

  if (accessSession.account?.authenticated && Array.isArray(accessSession.account?.favoriteToolIds)) {
    favoriteToolIds.clear();
    accessSession.account.favoriteToolIds.forEach((toolId) => {
      if (typeof toolId === "string" && toolId.trim()) {
        favoriteToolIds.add(toolId);
      }
    });
    saveFavoriteToolIds();
  }

  if (!accessSession.account?.authenticated || !accessSession.account?.isAdmin) {
    adminState = {
      dashboard: null,
      users: [],
      promos: [],
      selectedUserId: "",
      selectedUser: null,
      search: "",
      activePane: "account"
    };
  }

  if (!accessSession.account?.authenticated) {
    accountWorkspaceState = createEmptyAccountWorkspaceState();
    hasHydratedNotifications = false;
    seenNotificationIds.clear();
  }

  updateAccessUi();
  renderAccountHistory();
  renderAccountUsage();
  renderAccountNotifications();
  syncAccountPolling();
  return accessSession;
}

function applyBillingButton(button, url, activeLabel, fallbackLabel) {
  if (!button) {
    return;
  }

  button.textContent = url ? activeLabel : fallbackLabel;
  button.disabled = !url;
  button.dataset.targetUrl = url || "";
}

function applyOfferButton(button, offerId, activeLabel, fallbackLabel) {
  if (!button) {
    return;
  }

  const manualUrl = getManualOfferUrl(offerId);
  const enabled = isManagedCheckoutEnabled() || Boolean(manualUrl);
  button.textContent = enabled ? activeLabel : fallbackLabel;
  button.disabled = !enabled;
  button.dataset.offerId = offerId;
  button.dataset.targetUrl = manualUrl;
}

function readPendingCheckout() {
  try {
    const rawValue = localStorage.getItem(pendingCheckoutStorageKey);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      offerId: typeof parsed.offerId === "string" ? parsed.offerId : "",
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : 0
    };
  } catch {
    return null;
  }
}

function storePendingCheckout(offerId) {
  try {
    localStorage.setItem(
      pendingCheckoutStorageKey,
      JSON.stringify({
        offerId,
        startedAt: Date.now()
      })
    );
  } catch {
    // Ignore storage failures and continue with the redirect.
  }
}

function clearPendingCheckout() {
  try {
    localStorage.removeItem(pendingCheckoutStorageKey);
  } catch {
    // Ignore storage failures to keep the checkout flow usable.
  }
}

function setBillingStatus(message, options = {}) {
  if (billingStatus) {
    billingStatus.textContent = message;
    billingStatus.hidden = !String(message ?? "").trim();
  }
  announceToast(message, options);
}

function setAccountStatus(message, options = {}) {
  accountStatusOutputs.forEach((element) => {
    element.textContent = message;
  });
  announceToast(message, options);
}

function getToastTone(message, explicitTone) {
  if (explicitTone) {
    return explicitTone;
  }

  if (/(não foi possível|nao foi possivel|falha|erro|inválid|invalido|ultrapassa|máximo|maximo|selecione|escolha|faz parte do plano pro|não há nenhum código|nao ha nenhum codigo)/i.test(message)) {
    return "error";
  }

  if (/(aprovad|atualizad|ativad|copiad|removid|conectad|encerrad|confirmad|concluíd|concluid|liberad|enviado|salvo|pronto)/i.test(message)) {
    return "success";
  }

  return "info";
}

function sanitizeToastMessage(message, options = {}) {
  const safeMessage = String(options.toastMessage ?? message ?? "").trim();
  if (!safeMessage) {
    return "";
  }

  if (!sensitiveToastPatterns.some((pattern) => pattern.test(safeMessage))) {
    return safeMessage;
  }

  return getToastTone(safeMessage, options.tone) === "error"
    ? "NÃ£o foi possÃ­vel concluir esta aÃ§Ã£o. Revise os dados e tente novamente."
    : null;
}

function shouldShowToast(message, options = {}) {
  if (options.toast === false || !message) {
    return false;
  }

  if (quietStatusMessages.has(message)) {
    return false;
  }

  if (passiveToastPatterns.some((pattern) => pattern.test(message))) {
    return false;
  }

  return !statusSilencePatterns.some((pattern) => pattern.test(message));
}

function clearToastTimer(toastId) {
  const timer = toastTimers.get(toastId);
  if (timer) {
    clearTimeout(timer);
    toastTimers.delete(toastId);
  }
}

function removeToast(toast, immediate = false) {
  if (!toast) {
    return;
  }

  clearToastTimer(toast.dataset.toastId);

  if (immediate) {
    toast.remove();
    return;
  }

  toast.classList.remove("is-visible");
  toast.classList.add("is-leaving");
  window.setTimeout(() => {
    toast.remove();
  }, 180);
}

function announceToast(message, options = {}) {
  const safeMessage = sanitizeToastMessage(message, options);
  if (!shouldShowToast(safeMessage, options)) {
    return;
  }

  if (toastLiveRegion) {
    toastLiveRegion.textContent = "";
    window.setTimeout(() => {
      toastLiveRegion.textContent = safeMessage;
    }, 10);
  }

  if (!toastViewport) {
    return;
  }

  const existingToast = Array.from(toastViewport.children).find((node) => node.dataset?.toastMessage === safeMessage);
  if (existingToast) {
    clearToastTimer(existingToast.dataset.toastId);
    existingToast.classList.remove("is-leaving");
    existingToast.classList.add("is-visible");
    const duration = options.duration ?? (existingToast.classList.contains("toast-error") ? 6200 : 4200);
    const timer = window.setTimeout(() => removeToast(existingToast), duration);
    toastTimers.set(existingToast.dataset.toastId, timer);
    return;
  }

  const tone = getToastTone(safeMessage, options.tone);
  const toastId = `toast-${Date.now()}-${++toastSequence}`;
  const toast = document.createElement("article");
  toast.className = `toast toast-${tone}`;
  toast.dataset.toastId = toastId;
  toast.dataset.toastMessage = safeMessage;
  toast.setAttribute("role", tone === "error" ? "alert" : "status");

  const copy = document.createElement("div");
  copy.className = "toast-copy";

  const heading = document.createElement("strong");
  heading.textContent = tone === "error" ? "Atenção" : tone === "success" ? "Concluído" : "Aviso";

  const text = document.createElement("p");
  text.textContent = safeMessage;
  copy.append(heading, text);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast-close";
  closeButton.setAttribute("aria-label", "Fechar aviso");
  closeButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m18 6-12 12"></path><path d="m6 6 12 12"></path></svg>';
  closeButton.addEventListener("click", () => removeToast(toast));

  toast.append(copy, closeButton);
  toastViewport.append(toast);

  while (toastViewport.children.length > 4) {
    removeToast(toastViewport.firstElementChild, true);
  }

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  const duration = options.duration ?? (tone === "error" ? 6200 : 4200);
  const timer = window.setTimeout(() => removeToast(toast), duration);
  toastTimers.set(toastId, timer);
}

function buildVerificationUiState(verification, context = {}) {
  const purpose = verification?.purpose ?? "register";
  const submitLabel = purpose === "password-change" ? "Atualizar senha" : "Confirmar código";
  const successMessage =
    context.successMessage ??
    (purpose === "register"
      ? "Conta confirmada com sucesso."
      : purpose === "email-change"
        ? "E-mail confirmado com sucesso."
        : "Senha confirmada com sucesso.");

  if (purpose === "email-change") {
    return {
      ...context,
      verification,
      purpose,
      submitLabel,
      successMessage,
      nextFocus: context.nextFocus ?? "profile",
      kicker: "Novo e-mail",
      title: "Confirme seu novo e-mail",
      copy: "Enviamos um código numérico para o novo endereço informado. Digite os 6 dígitos para concluir a troca."
    };
  }

  if (purpose === "password-change") {
    return {
      ...context,
      verification,
      purpose,
      submitLabel,
      successMessage,
      nextFocus: context.nextFocus ?? "profile",
      kicker: "Troca de senha",
      title: "Confirme sua nova senha",
      copy: "Enviamos um código numérico para o e-mail da sua conta. Digite os 6 dígitos para concluir a troca."
    };
  }

  return {
    ...context,
    verification,
    purpose,
    submitLabel,
    successMessage,
    nextFocus: context.nextFocus ?? "overview",
    kicker: "Criar conta",
    title: "Confirme sua conta",
    copy: "Enviamos um código numérico para o e-mail informado. Digite os 6 dígitos para liberar sua conta com segurança."
  };
}

function setPendingVerification(verification, context = {}) {
  pendingAccountVerification = buildVerificationUiState(verification, context);
  renderAccountUi();
}

function clearPendingVerification() {
  pendingAccountVerification = null;
  renderAccountUi();
}

function toggleAvatarActionReveal(visible) {
  avatarActionReveal = Boolean(visible);
  if (accountAvatarActions) {
    accountAvatarActions.hidden = !avatarActionReveal;
  }
  if (accountAvatarRemoveButton) {
    accountAvatarRemoveButton.hidden = !avatarActionReveal || !getAccountState().user?.hasAvatar;
  }
}

function syncAccountMenu(expanded) {
  if (!accountLauncher || !accountPopover) {
    return;
  }

  accountLauncher.setAttribute("aria-expanded", expanded ? "true" : "false");
  accountPopover.hidden = !expanded;
  if ("inert" in accountPopover) {
    accountPopover.inert = !expanded;
  }
  document.body.classList.toggle("account-menu-screen-open", expanded && shouldUseFullscreenAccountMenu());
  updateBodyScrollLock();
}

function hideAccountMenu() {
  syncAccountMenu(false);
}

function syncBackgroundInteractivity(isBlocked) {
  inertableSurfaces.forEach((surface) => {
    if (!surface || !("inert" in surface)) {
      return;
    }
    surface.inert = Boolean(isBlocked);
  });
}

function updateBodyScrollLock() {
  const hasOpenModal =
    (conversionModal && !conversionModal.hidden) ||
    (toolHelpModal && !toolHelpModal.hidden) ||
    (billingModal && !billingModal.hidden) ||
    accountPaneModals.some((modal) => !modal.hidden) ||
    (accountPopover && !accountPopover.hidden && shouldUseFullscreenAccountMenu());

  document.body.style.overflow = hasOpenModal ? "hidden" : "";
  syncBackgroundInteractivity(hasOpenModal);
}

function restoreConversionModalCards() {
  if (!workspaceInspector) {
    return;
  }

  [workspaceSpecialCard, workspaceOptionsCard].forEach((card) => {
    if (card) {
      card.classList.remove("is-modal-mounted");
    }
    if (card && card.parentElement !== workspaceInspector) {
      workspaceInspector.append(card);
    }
  });

  conversionModalRenderedCards = [];
}

function setConversionModalStatus(message) {
  if (!conversionModalStatus) {
    return;
  }

  conversionModalStatus.textContent = message;
}

function getConversionModalCards() {
  const cards = [];

  if (workspaceSpecialCard && !workspaceSpecialCard.hidden) {
    cards.push(workspaceSpecialCard);
  }

  if (workspaceOptionsCard && !workspaceOptionsCard.hidden) {
    cards.push(workspaceOptionsCard);
  }

  return cards;
}

function renderConversionModalCards(tool) {
  if (!conversionModalBody) {
    return;
  }

  restoreConversionModalCards();
  conversionModalBody.innerHTML = "";
  conversionModalRenderedCards = getConversionModalCards();

  if (conversionModalRenderedCards.length === 0) {
    const emptyState = document.createElement("article");
    emptyState.className = "conversion-modal-empty";
    emptyState.innerHTML = `
      <strong>Sem ajustes extras</strong>
      <p>Essa conversão já está pronta. Clique em converter para iniciar o envio real do arquivo.</p>
    `;
    conversionModalBody.append(emptyState);
    return;
  }

  conversionModalRenderedCards.forEach((card) => {
    card.hidden = false;
    card.classList.add("is-modal-mounted");
    conversionModalBody.append(card);
  });
}

function syncConversionModalSummary(tool, files) {
  if (conversionModalTitle) {
    conversionModalTitle.textContent = tool ? `${tool.label} pronto para converter` : "Revise antes de converter";
  }

  if (conversionModalCopy) {
    conversionModalCopy.textContent = tool
      ? "Ajuste apenas o necessário, confirme as opções desta ferramenta e conclua a conversão real."
      : "Revise os ajustes necessários antes de converter.";
  }

  if (conversionSummaryFiles) {
    conversionSummaryFiles.textContent = `${files.length} ${files.length === 1 ? "arquivo" : "arquivos"}`;
  }

  if (conversionSummaryOutput) {
    conversionSummaryOutput.textContent = String(tool?.outputExtension ?? "").toUpperCase() || "Arquivo";
  }

  if (conversionConfirmButton) {
    conversionConfirmButton.textContent = getToolActionLabel(tool);
  }

  setConversionModalStatus("Revise os ajustes e clique em converter para iniciar o envio real do arquivo.");
}

function hideConversionModal() {
  if (!conversionModal) {
    return;
  }

  restoreConversionModalCards();
  conversionModal.hidden = true;
  updateBodyScrollLock();
}

function validateConversionRequest() {
  const toolId = toolSelect.value;
  const tool = getToolById(toolId);
  const files = getSelectedFiles();

  if (!toolId || !tool) {
    throw new Error("Selecione uma conversão antes de continuar.");
  }

  if (isToolLocked(tool)) {
    promptAccountPlanAccess(tool);
    throw new Error(`${tool.label} faz parte do plano Pro.`);
  }

  if (files.length === 0) {
    throw new Error("Selecione uma ferramenta e um arquivo para continuar.");
  }

  const minFiles = tool.minFiles ?? 1;
  const maxFiles = tool.maxFiles ?? (tool.allowsMultipleFiles ? 10 : 1);

  if (files.length < minFiles) {
    throw new Error(
      minFiles === 1
        ? "Envie um arquivo para continuar."
        : `Envie pelo menos ${minFiles} arquivos para usar ${tool.label.toLowerCase()}.`
    );
  }

  if (files.length > maxFiles) {
    throw new Error(`Essa conversão aceita no máximo ${maxFiles} arquivos por vez.`);
  }

  return { toolId, tool, files };
}

function showConversionModal(tool = getToolById()) {
  if (!conversionModal || !conversionModalBody) {
    return;
  }

  let request;
  try {
    request = validateConversionRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível abrir os ajustes.";
    setStatus(message);
    return;
  }

  hideAccountMenu();
  hideToolHelpModal();
  hideBillingModal();
  hideAccountPaneModals();

  renderConversionModalCards(request.tool);
  syncConversionModalSummary(request.tool, request.files);
  conversionModal.hidden = false;
  updateBodyScrollLock();

  window.setTimeout(() => {
    conversionConfirmButton?.focus();
  }, 0);
}

function hideToolHelpModal() {
  if (!toolHelpModal) {
    return;
  }

  toolHelpModal.hidden = true;
  updateBodyScrollLock();
}

function showToolHelpModal(tool = getToolById()) {
  if (!toolHelpModal || !toolHelpTitle || !toolHelpCopy || !toolHelpList) {
    return;
  }

  renderToolHelp(tool);
  const content = tool ? toolHelpContent[tool.id] : null;
  if (!content) {
    return;
  }

  hideAccountMenu();
  hideConversionModal();
  hideBillingModal();
  hideAccountPaneModals();
  toolHelpModal.hidden = false;
  updateBodyScrollLock();

  window.setTimeout(() => {
    toolHelpCloseButton?.focus();
  }, 0);
}

function showAccountMenu() {
  if (!isAccountAuthenticated()) {
    showAccountModal({ focus: "login" });
    return;
  }

  renderAccountUi();
  syncAccountMenu(true);
}

function toggleAccountMenu() {
  if (accountPopover?.hidden === false) {
    hideAccountMenu();
    return;
  }

  showAccountMenu();
}

function showBillingModal(options = {}) {
  const { focusCode = false, tool = null } = options;
  if (!billingModal) {
    return;
  }

  hideAccountMenu();
  hideAccountPaneModals();
  hideConversionModal();
  hideToolHelpModal();
  billingModal.hidden = false;
  updateBodyScrollLock();

  setBillingStatus("", { toast: false });

  window.setTimeout(() => {
    if (focusCode) {
      redeemCodeInput?.focus();
      return;
    }

    billingCloseButton?.focus();
  }, 0);
}

function hideBillingModal() {
  if (!billingModal) {
    return;
  }

  billingModal.hidden = true;
  updateBodyScrollLock();
}

function promptAccountPlanAccess(tool = getToolById()) {
  const toolLabel = tool?.label ?? "Essa ferramenta";
  hideAccountMenu();
  hideBillingModal();

  if (isAccountAuthenticated()) {
    showAccountModal({ focus: "overview" });
    setAccountStatus(`${toolLabel} faz parte do Pro. Gerencie plano, créditos e códigos pela sua conta.`);
    return;
  }

  showAccountModal({ focus: "login" });
  setAccountStatus(`Entre na sua conta para ver planos e liberar ${toolLabel}.`);
}

function hideAccountPaneModals() {
  accountPaneModals.forEach((modal) => {
    modal.hidden = true;
  });
  updateBodyScrollLock();
}

function getAccountModalByFocus(focus) {
  if (focus === "register") {
    return accountRegisterModal;
  }

  if (focus === "login") {
    return accountLoginModal;
  }

  if (focus === "subscription") {
    return accountSubscriptionModal;
  }

  if (focus === "profile") {
    return accountProfileModal;
  }

  if (focus === "verify") {
    return accountVerificationModal;
  }

  if (focus === "settings") {
    return accountSettingsModal;
  }

  if (focus === "admin") {
    return adminPanelModal;
  }

  return accountOverviewModal;
}

function getAccountModalFocusTarget(focus) {
  if (focus === "register") {
    return document.getElementById("register-display-name") ?? accountRegisterCloseButton;
  }

  if (focus === "login") {
    return document.getElementById("login-email") ?? accountLoginCloseButton;
  }

  if (focus === "subscription") {
    return accountSubscriptionManageButton ?? accountSubscriptionCloseButton;
  }

  if (focus === "profile") {
    return accountDisplayNameInput ?? accountProfileCloseButton;
  }

  if (focus === "verify") {
    return accountVerificationCodeInput ?? accountVerificationCloseButton;
  }

  if (focus === "settings") {
    return accountSettingsCloseButton;
  }

  if (focus === "admin") {
    return adminUserSearchInput ?? adminPanelCloseButton;
  }

  return accountOverviewCloseButton;
}

function showAccountModal(options = {}) {
  const requestedFocus = options.focus ?? (isAccountAuthenticated() ? "overview" : "login");
  const allowedGuestFocus = new Set(["register", "login"]);
  const allowedAuthenticatedFocus = new Set(["overview", "subscription", "profile", "verify", "settings", "admin", "close"]);
  let focus = requestedFocus;
  if (!isAccountAuthenticated() && !allowedGuestFocus.has(requestedFocus)) {
    focus = requestedFocus === "verify" ? "verify" : "login";
  }
  if (isAccountAuthenticated() && !allowedAuthenticatedFocus.has(requestedFocus)) {
    focus = "overview";
  }
  if (focus === "admin" && !isAdminAuthorized()) {
    focus = "overview";
  }
  const modal = getAccountModalByFocus(focus);
  if (!modal) {
    return;
  }

  hideAccountMenu();
  hideBillingModal();
  hideConversionModal();
  hideToolHelpModal();
  hideAccountPaneModals();
  modal.hidden = false;
  if (focus !== "profile") {
    toggleAvatarActionReveal(false);
  }
  if (focus === "verify") {
    accountVerificationForm?.reset();
  }
  updateBodyScrollLock();
  renderAccountUi();
  if (focus === "overview" && isAccountAuthenticated()) {
    void refreshAccountWorkspaceData({ silent: true }).catch(() => undefined);
  }
  if (focus === "admin") {
    void loadAdminPanel();
  }

  window.setTimeout(() => {
    getAccountModalFocusTarget(focus)?.focus();
  }, 0);
}

function hideAccountModal() {
  hideAccountPaneModals();
  toggleAvatarActionReveal(false);
}

function renderBillingOffers() {
  const monthlyOffer = getOfferById("pro-monthly");
  const yearlyOffer = getOfferById("pro-yearly");
  const starterOffer = getOfferById("starter-pack");

  if (billingMonthlyPrice) {
    billingMonthlyPrice.textContent = formatCurrencyBRL(monthlyOffer?.amountBRL ?? 19.9);
  }
  if (billingMonthlyMeta) {
    billingMonthlyMeta.textContent = `${monthlyOffer?.accessDays ?? 30} dias de acesso`;
  }

  if (billingYearlyPrice) {
    billingYearlyPrice.textContent = formatCurrencyBRL(yearlyOffer?.amountBRL ?? 149.9);
  }
  if (billingYearlyMeta) {
    billingYearlyMeta.textContent = `${yearlyOffer?.accessDays ?? 365} dias de acesso`;
  }

  if (billingStarterPrice) {
    billingStarterPrice.textContent = formatCurrencyBRL(starterOffer?.amountBRL ?? 9.9);
  }
  if (billingStarterMeta) {
    billingStarterMeta.textContent = `${starterOffer?.accessDays ?? 7} dias de acesso rápido`;
  }
}

function getAccountPlanHeadline() {
  const accountState = getAccountState();

  if (accountState.plan?.status === "active") {
    return accountState.plan.plan === "team" ? "Team ativo" : "Pro ativo";
  }

  if (accessSession?.premium) {
    return accessSession.plan === "team" ? "Team neste dispositivo" : "Pro neste dispositivo";
  }

  return "Gratis";
}

function getAccountPlanDescription() {
  const accountState = getAccountState();

  if (accountState.plan?.status === "active" && accountState.plan.accessExpiresAt) {
    return `Seu acesso vai ate ${formatDateTime(accountState.plan.accessExpiresAt)}.`;
  }

  if (accessSession?.premium && !accountState.plan) {
    return "Você tem acesso premium ativo neste navegador. Entre em um checkout logado para vincular o plano à conta.";
  }

  return "Crie ou atualize um plano para liberar OCR, PDF avançado e conversões 3D.";
}

function getPopoverPlanBadgeLabel() {
  if (accessSession?.plan === "team") {
    return "Team";
  }

  if (accessSession?.plan === "pro") {
    return "Pro";
  }

  return "Gratis";
}

function getPopoverUsageProgress() {
  const dailyLimit = Number(accessSession?.dailyLimit ?? 0);
  const usedToday = Math.max(0, Number(accessSession?.usedToday ?? 0));
  const remainingToday = Math.max(0, Number(accessSession?.remainingToday ?? 0));

  if (!dailyLimit) {
    return {
      percent: accessSession?.premium ? 16 : 10,
      label: accessSession?.premium ? "Acesso premium ativo" : "Pronto para usar",
      meta: accessSession?.premium ? "Seu plano não depende do limite diário grátis." : "Escolha uma conversão e comece agora."
    };
  }

  const percent = Math.max(6, Math.min(100, Math.round((usedToday / dailyLimit) * 100)));
  const remainingLabel =
    remainingToday === 1 ? "1 conversão livre hoje" : `${remainingToday} conversões livres hoje`;

  return {
    percent,
    label: remainingLabel,
    meta: `${usedToday} de ${dailyLimit} conversões usadas hoje`
  };
}

function getPopoverPlanMeta() {
  const accountState = getAccountState();

  if (accountState.plan?.status === "active" && accountState.plan.accessExpiresAt) {
    return `Ativo ate ${formatDateTime(accountState.plan.accessExpiresAt)}`;
  }

  if (accessSession?.premium) {
    return "Premium ativo neste dispositivo";
  }

  return "Uso rápido no navegador";
}

function getConversionStatusLabel(status) {
  if (status === "queued") {
    return "Na fila";
  }
  if (status === "processing") {
    return "Processando";
  }
  if (status === "ready") {
    return "Pronto";
  }
  if (status === "failed") {
    return "Falhou";
  }
  return "Atualizando";
}

function renderAccountHistoryFilters() {
  const counts = accountWorkspaceState.files?.counts ?? {
    total: 0,
    temporary: 0,
    ready: 0,
    failed: 0
  };

  if (accountFileCountTotal) {
    accountFileCountTotal.textContent = String(counts.total ?? 0);
  }
  if (accountFileCountTemporary) {
    accountFileCountTemporary.textContent = String(counts.temporary ?? 0);
  }
  if (accountFileCountReady) {
    accountFileCountReady.textContent = String(counts.ready ?? 0);
  }
  if (accountFileCountFailed) {
    accountFileCountFailed.textContent = String(counts.failed ?? 0);
  }

  accountFileFilterButtons.forEach((button) => {
    const isActive = button.dataset.accountFileFilter === accountWorkspaceState.fileFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function buildAccountFileMeta(item) {
  const parts = [item.toolLabel];
  if (item.sourceLabel) {
    parts.push(item.sourceLabel);
  }
  if (item.completedAt || item.updatedAt || item.createdAt) {
    parts.push(formatDateTime(item.completedAt || item.updatedAt || item.createdAt));
  }
  return parts.filter(Boolean).join(" • ");
}

async function deleteAccountFile(historyId) {
  const response = await fetch(`/api/account/files/${encodeURIComponent(historyId)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível remover este arquivo." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível remover este arquivo.");
  }
}

async function markAccountNotificationsRead(ids) {
  const filteredIds = Array.from(new Set((Array.isArray(ids) ? ids : []).map((value) => String(value || "").trim()).filter(Boolean)));
  if (filteredIds.length === 0) {
    return [];
  }

  const response = await fetch("/api/account/notifications/read", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify({ ids: filteredIds })
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível atualizar as notificações." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível atualizar as notificações.");
  }

  accountWorkspaceState.notifications = Array.isArray(payload.items) ? payload.items : [];
  renderAccountNotifications();
  return accountWorkspaceState.notifications;
}

function renderAccountHistory() {
  if (!accountHistoryList || !accountHistoryEmpty) {
    return;
  }

  renderAccountHistoryFilters();
  accountHistoryList.innerHTML = "";

  if (!isAccountAuthenticated()) {
    accountHistoryEmpty.hidden = false;
    accountHistoryEmpty.textContent = "Entre na sua conta para acompanhar seus arquivos e resultados.";
    return;
  }

  const items = Array.isArray(accountWorkspaceState.files?.items) ? accountWorkspaceState.files.items : [];
  if (items.length === 0) {
    accountHistoryEmpty.hidden = false;
    accountHistoryEmpty.textContent = "Nenhum arquivo apareceu nesta seleção ainda.";
    return;
  }

  accountHistoryEmpty.hidden = true;

  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "account-history-item";

    const copy = document.createElement("div");
    copy.className = "account-history-copy";

    const topline = document.createElement("div");
    topline.className = "account-history-topline";

    const title = document.createElement("strong");
    title.textContent = item.outputFilename || item.toolLabel;

    const status = document.createElement("span");
    status.className = `account-history-status is-${item.status}`;
    status.textContent = getConversionStatusLabel(item.status);

    topline.append(title, status);

    const meta = document.createElement("p");
    meta.className = "account-copy";
    meta.textContent = buildAccountFileMeta(item);

    const detail = document.createElement("p");
    detail.className = "account-copy";
    const inputLabel = item.inputCount === 1 ? "1 arquivo de origem" : `${item.inputCount} arquivos de origem`;
    const outputLabel = item.outputFilename || "Aguardando saída";
    detail.textContent = `${item.mode === "async" ? "Fila assíncrona" : "Conversão imediata"} • ${inputLabel} • ${outputLabel}`;

    copy.append(topline, meta, detail);

    if (item.errorMessage) {
      const errorCopy = document.createElement("p");
      errorCopy.className = "account-copy danger";
      errorCopy.textContent = item.errorMessage;
      copy.append(errorCopy);
    }

    row.append(copy);

    const actions = document.createElement("div");
    actions.className = "account-history-actions";

    if (item.downloadUrl) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost-action";
      button.textContent = "Baixar novamente";
      button.addEventListener("click", async () => {
        try {
          await redownloadHistoryItem(item.id);
          setAccountStatus("Download iniciado.");
        } catch (error) {
          setAccountStatus(error instanceof Error ? error.message : "Não foi possível baixar novamente este arquivo.");
        }
      });
      actions.append(button);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "ghost-action";
    deleteButton.textContent = "Excluir";
    deleteButton.addEventListener("click", async () => {
      try {
        await deleteAccountFile(item.id);
        setAccountStatus("Arquivo removido.");
        await refreshAccountWorkspaceData({ silent: true });
      } catch (error) {
        setAccountStatus(error instanceof Error ? error.message : "Não foi possível excluir este arquivo.");
      }
    });
    actions.append(deleteButton);

    row.append(actions);

    accountHistoryList.append(row);
  });
}

function renderAccountUsage() {
  if (!accountUsageList || !accountUsageEmpty) {
    return;
  }

  accountUsageList.innerHTML = "";
  if (!isAccountAuthenticated()) {
    accountUsageEmpty.hidden = false;
    accountUsageEmpty.textContent = "Entre na sua conta para ver o consumo por ferramenta.";
    return;
  }

  const items = Array.isArray(accountWorkspaceState.usage) ? accountWorkspaceState.usage : [];
  if (items.length === 0) {
    accountUsageEmpty.hidden = false;
    accountUsageEmpty.textContent = "Seu consumo por conversão aparece aqui conforme você usa a plataforma.";
    return;
  }

  accountUsageEmpty.hidden = true;
  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "account-history-item";
    row.innerHTML = `
      <div class="account-history-copy">
        <div class="account-history-topline">
          <strong>${escapeHtml(item.toolLabel)}</strong>
          <span class="account-history-status is-ready">${escapeHtml(String(item.totalConversions))} usos</span>
        </div>
        <p class="account-copy">${escapeHtml(`${item.completedConversions} concluídas • ${item.failedConversions} falhas • ${item.pendingConversions} pendentes`)}</p>
        <p class="account-copy">${escapeHtml(`${Number(item.estimatedCreditsUsed ?? 0).toFixed(2).replace(".", ",")} créditos estimados • Último uso em ${formatDateTime(item.lastUsedAt)}`)}</p>
      </div>
    `;
    accountUsageList.append(row);
  });
}

function renderAccountNotifications() {
  if (!accountNotificationsList || !accountNotificationsEmpty) {
    return;
  }

  accountNotificationsList.innerHTML = "";
  if (!isAccountAuthenticated()) {
    accountNotificationsEmpty.hidden = false;
    accountNotificationsEmpty.textContent = "Entre na sua conta para receber avisos internos.";
    return;
  }

  const items = Array.isArray(accountWorkspaceState.notifications) ? accountWorkspaceState.notifications : [];
  if (items.length === 0) {
    accountNotificationsEmpty.hidden = false;
    accountNotificationsEmpty.textContent = "Quando um OCR, vídeo ou 3D terminar, o aviso aparece aqui.";
    return;
  }

  accountNotificationsEmpty.hidden = true;
  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "account-history-item";

    const copy = document.createElement("div");
    copy.className = "account-history-copy";
    copy.innerHTML = `
      <div class="account-history-topline">
        <strong>${escapeHtml(item.title)}</strong>
        <span class="account-history-status ${item.type === "job-failed" ? "is-failed" : "is-ready"}">${escapeHtml(item.readAt ? "Lido" : "Novo")}</span>
      </div>
      <p class="account-copy">${escapeHtml(item.message)}</p>
      <p class="account-copy">${escapeHtml(formatDateTime(item.createdAt))}</p>
    `;
    row.append(copy);

    const actions = document.createElement("div");
    actions.className = "account-history-actions";

    if (item.actionUrl) {
      const actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.className = "ghost-action";
      actionButton.textContent = "Baixar";
      actionButton.addEventListener("click", async () => {
        try {
          if (item.historyId) {
            await redownloadHistoryItem(item.historyId);
          } else {
            window.open(item.actionUrl, "_self");
          }
          await markAccountNotificationsRead([item.id]).catch(() => undefined);
          setAccountStatus("Download iniciado.");
        } catch (error) {
          setAccountStatus(error instanceof Error ? error.message : "Não foi possível abrir este arquivo.");
        }
      });
      actions.append(actionButton);
    }

    if (!item.readAt) {
      const readButton = document.createElement("button");
      readButton.type = "button";
      readButton.className = "ghost-action";
      readButton.textContent = "Marcar como lido";
      readButton.addEventListener("click", async () => {
        try {
          await markAccountNotificationsRead([item.id]);
        } catch (error) {
          setAccountStatus(error instanceof Error ? error.message : "Não foi possível atualizar este aviso.");
        }
      });
      actions.append(readButton);
    }

    row.append(actions);
    accountNotificationsList.append(row);
  });
}

function renderAccountUi() {
  const accountState = getAccountState();
  const authenticated = isAccountAuthenticated();
  const isAdmin = isAdminAuthorized();
  const avatarUrl = getAccountAvatarUrl();
  const initials = getAccountInitials();
  const wallet = getAccountWallet();

  accountLauncher?.classList.toggle("is-authenticated", authenticated);
  accountLauncher?.classList.toggle("is-guest", !authenticated);
  accountLauncher?.setAttribute("aria-label", authenticated ? "Abrir menu da conta" : "Entrar ou criar conta");
  if (accountLauncherCopy) {
    accountLauncherCopy.textContent = authenticated ? (accountState.user?.displayName ?? "Minha conta") : "Entrar ou criar conta";
  }
  if (accountPopoverName) {
    accountPopoverName.textContent = authenticated ? (accountState.user?.displayName ?? "Minha conta") : "Entrar ou crie sua conta";
  }
  if (accountPopoverEmail) {
    accountPopoverEmail.textContent = authenticated ? (accountState.user?.email ?? "") : "Salve seu plano e seus dados";
  }
  const planBadgeLabel = getPopoverPlanBadgeLabel();
  const planMeta = getPopoverPlanMeta();
  const planTitle = authenticated
    ? `Ola, ${accountState.user?.displayName ?? "sua conta"}`
    : "Seu conversor favorito sempre pronto";
  const planCopy = authenticated
    ? getAccountPlanDescription()
    : "Entre para guardar seu plano, acompanhar o uso e acessar upgrades em poucos toques.";

  [accountPopoverPlanBadge, accountSubscriptionPlanBadge].forEach((element) => {
    if (!element) {
      return;
    }
    element.textContent = planBadgeLabel;
    element.dataset.plan = accessSession?.plan ?? "free";
  });
  [accountPopoverPlanMeta, accountSubscriptionPlanMeta].forEach((element) => {
    if (element) {
      element.textContent = planMeta;
    }
  });
  [accountPopoverPlanTitle, accountSubscriptionPlanTitle].forEach((element) => {
    if (element) {
      element.textContent = planTitle;
    }
  });
  [accountPopoverPlanCopy, accountSubscriptionPlanCopy].forEach((element) => {
    if (element) {
      element.textContent = planCopy;
    }
  });
  const usageProgress = getPopoverUsageProgress();
  [accountPopoverProgressFill, accountSubscriptionProgressFill].forEach((element) => {
    if (element) {
      element.style.width = `${usageProgress.percent}%`;
    }
  });
  [accountPopoverProgressLabel, accountSubscriptionProgressLabel].forEach((element) => {
    if (element) {
      element.textContent = usageProgress.label;
    }
  });
  [accountPopoverProgressMeta, accountSubscriptionProgressMeta].forEach((element) => {
    if (element) {
      element.textContent = usageProgress.meta;
    }
  });
  for (const menuButton of [accountMenuProfile, accountMenuSubscription, accountMenuTheme, accountMenuLogout]) {
    if (menuButton) {
      menuButton.hidden = !authenticated;
    }
  }
  if (accountMenuAdmin) {
    accountMenuAdmin.hidden = !authenticated || !isAdmin;
  }
  if (accountMenuOverviewLabel) {
    accountMenuOverviewLabel.textContent = authenticated ? "Minha conta" : "Entrar ou criar conta";
  } else if (accountMenuOverview) {
    accountMenuOverview.textContent = authenticated ? "Minha conta" : "Entrar ou criar conta";
  }
  if (accountMenuThemeLabel) {
    accountMenuThemeLabel.textContent = document.documentElement.dataset.theme === "dark" ? "Tema claro" : "Tema escuro";
  }
  applyAvatarToElements(accountLauncherImage, accountLauncherInitials, avatarUrl, initials);
  applyAvatarToElements(accountPopoverImage, accountPopoverInitials, avatarUrl, initials);
  applyAvatarToElements(accountAvatarImage, accountAvatarInitials, avatarUrl, initials);
  toggleAvatarActionReveal(avatarActionReveal && authenticated);

  if (pendingAccountVerification?.verification) {
    if (accountVerificationKicker) {
      accountVerificationKicker.textContent = pendingAccountVerification.kicker;
    }
    if (accountVerificationTitle) {
      accountVerificationTitle.textContent = pendingAccountVerification.title;
    }
    if (accountVerificationCopy) {
      accountVerificationCopy.textContent = pendingAccountVerification.copy;
    }
    if (accountVerificationDestination) {
      accountVerificationDestination.textContent = pendingAccountVerification.verification.destination;
    }
    if (accountVerificationExpiry) {
      accountVerificationExpiry.textContent = `Válido até ${formatDateTime(pendingAccountVerification.verification.expiresAt)}.`;
    }
    if (accountVerificationSubmitButton) {
      accountVerificationSubmitButton.textContent = pendingAccountVerification.submitLabel;
    }
  }

  if (!authenticated) {
    hideAccountMenu();
    if (accountSettingsTitle) {
      accountSettingsTitle.textContent = "Preferências e segurança";
    }
    if (accountSettingsCopy) {
      accountSettingsCopy.textContent = "Entre para salvar suas preferências, trocar foto e proteger seus dados.";
    }
    if (accountCreditsDisplay) {
      accountCreditsDisplay.textContent = "0,00 créditos";
    }
    if (accountDiscountDisplay) {
      accountDiscountDisplay.textContent = "Nenhum desconto ativo no momento.";
    }
    if (accountShortcutAdminButton) {
      accountShortcutAdminButton.hidden = true;
    }
    if (accountPopoverAvatarButton) {
      accountPopoverAvatarButton.disabled = true;
    }
    setAccountStatus(
      pendingAccountVerification?.verification
        ? `Digite o código enviado para ${pendingAccountVerification.verification.destination}.`
        : "Entre ou crie sua conta para continuar."
    );
    renderAccountHistory();
    renderAccountUsage();
    renderAccountNotifications();
    return;
  }

  if (accountPopoverAvatarButton) {
    accountPopoverAvatarButton.disabled = false;
  }

  if (accountPlanValue) {
    accountPlanValue.textContent = getAccountPlanHeadline();
  }
  if (accountPlanCopy) {
    accountPlanCopy.textContent = getAccountPlanDescription();
  }
  if (accountNameDisplay) {
    accountNameDisplay.textContent = accountState.user?.displayName ?? "Sua conta";
  }
  if (accountEmailDisplay) {
    accountEmailDisplay.textContent = accountState.user?.email ?? "";
  }
  if (accountCreatedDisplay) {
    accountCreatedDisplay.textContent = accountState.user?.createdAt
      ? `Conta criada em ${formatDateTime(accountState.user.createdAt)}`
      : "Conta ativa agora.";
  }
  if (accountCreditsDisplay) {
    accountCreditsDisplay.textContent = `${wallet.creditBalance.toFixed(2).replace(".", ",")} créditos`;
  }
  if (accountDiscountDisplay) {
    accountDiscountDisplay.textContent = getAccountDiscountCopy();
  }
  if (accountShortcutAdminButton) {
    accountShortcutAdminButton.hidden = !isAdmin;
  }
  if (accountSettingsTitle) {
    accountSettingsTitle.textContent = "Sessão e segurança";
  }
  if (accountSettingsCopy) {
    accountSettingsCopy.textContent = isAdmin
      ? "Sua conta controla o Painel Administrativo. Revise a sessão deste navegador e volte ao painel quando quiser."
      : accountState.user?.hasAvatar
        ? "Sua conta está personalizada. Revise a sessão deste navegador sempre que precisar sair com segurança."
        : "Sua conta está protegida. Use este modal para encerrar a sessão deste navegador.";
  }
  if (accountDisplayNameInput) {
    accountDisplayNameInput.value = accountState.user?.displayName ?? "";
  }
  if (accountEmailInput) {
    accountEmailInput.value = accountState.user?.email ?? "";
  }
  if (accountCurrentPasswordEmailInput) {
    accountCurrentPasswordEmailInput.value = "";
  }
  if (accountPasswordCurrentInput) {
    accountPasswordCurrentInput.value = "";
  }
  if (accountPasswordNewInput) {
    accountPasswordNewInput.value = "";
  }

  setAccountStatus(isAdmin
      ? "Sua conta do dono está protegida. Abra o Painel Administrativo para gerenciar usuários, créditos e promoções."
      : "Sua conta está protegida. Atualize dados ou siga para um upgrade quando quiser.");
  renderAccountHistory();
  renderAccountUsage();
  renderAccountNotifications();
}

function updateAccessUi() {
  const shouldShowAccess = shouldRevealUpgradeContext(accessSession);
  if (accessStrip) {
    accessStrip.hidden = !shouldShowAccess;
  }
  if (accessPlanLabel) {
    accessPlanLabel.textContent = formatAccessPlanLabel(accessSession);
  }
  if (accessUsageCopy) {
    accessUsageCopy.textContent = getAccessUsageLabel(accessSession);
  }
  renderBillingOffers();
  renderAccountUi();

  applyOfferButton(
    billingMonthlyButton,
    "pro-monthly",
    "Abrir plano mensal",
    "Plano mensal em breve"
  );
  applyOfferButton(
    billingYearlyButton,
    "pro-yearly",
    "Abrir plano anual",
    "Plano anual em breve"
  );
  applyOfferButton(
    billingStarterButton,
    "starter-pack",
    "Abrir pacote",
    "Pacote em breve"
  );
  applyBillingButton(
    billingSupportButton,
    getSupportUrl(),
    accessSession?.billing?.whatsappUrl ? "Abrir WhatsApp" : "Abrir suporte",
    "Suporte em breve"
  );

  if (accessLogoutButton) {
    accessLogoutButton.hidden = !accessSession?.premium || isAccountAuthenticated();
  }

  const activeTool = getToolById();
  if (activeTool) {
    applyActiveTool(activeTool.id, { resetFiles: false });
  }
}

async function refreshAccessSession() {
  const response = await fetch("/api/access/session", {
    credentials: "same-origin"
  });
  const payload = await response.json();
  return applySessionPayload(payload);
}

async function updateAccountFavorites(toolIds) {
  const response = await fetch("/api/account/favorites", {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify({ toolIds })
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível salvar os favoritos." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível salvar os favoritos.");
  }

  applySessionPayload(payload);
  return payload;
}

async function fetchAccountFiles(filter = accountWorkspaceState.fileFilter, limit = 30) {
  const normalizedFilter = normalizeAccountFileFilter(filter);
  const target = new URL("/api/account/files", window.location.origin);
  target.searchParams.set("filter", normalizedFilter);
  target.searchParams.set("limit", String(limit));

  const response = await fetch(target, {
    credentials: "same-origin"
  });
  const payload = await response.json().catch(() => ({ counts: null, items: [] }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível carregar seus arquivos.");
  }

  accountWorkspaceState.fileFilter = normalizedFilter;
  accountWorkspaceState.files = {
    counts: payload.counts ?? {
      total: 0,
      temporary: 0,
      ready: 0,
      failed: 0
    },
    items: Array.isArray(payload.items) ? payload.items : []
  };
  renderAccountHistory();
  return accountWorkspaceState.files.items;
}

async function fetchAccountUsage() {
  const response = await fetch("/api/account/usage", {
    credentials: "same-origin"
  });
  const payload = await response.json().catch(() => ({ items: [] }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível carregar o consumo da conta.");
  }

  accountWorkspaceState.usage = Array.isArray(payload.items) ? payload.items : [];
  renderAccountUsage();
  return accountWorkspaceState.usage;
}

function toastNewNotifications(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  const newUnreadItems = items.filter((item) => item && !item.readAt && !seenNotificationIds.has(item.id));
  items.forEach((item) => {
    if (item?.id) {
      seenNotificationIds.add(item.id);
    }
  });

  if (!hasHydratedNotifications) {
    hasHydratedNotifications = true;
    return;
  }

  newUnreadItems.slice(0, 3).forEach((item) => {
    setAccountStatus(item.message, {
      toast: true,
      toastTitle: item.title,
      tone: item.type === "job-failed" ? "error" : "success"
    });
  });
}

async function fetchAccountNotifications(options = {}) {
  const { limit = 20, toastNew = false } = options;
  const target = new URL("/api/account/notifications", window.location.origin);
  target.searchParams.set("limit", String(limit));

  const response = await fetch(target, {
    credentials: "same-origin"
  });
  const payload = await response.json().catch(() => ({ items: [] }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível carregar as notificações da conta.");
  }

  accountWorkspaceState.notifications = Array.isArray(payload.items) ? payload.items : [];
  renderAccountNotifications();

  if (toastNew) {
    toastNewNotifications(accountWorkspaceState.notifications);
  } else {
    accountWorkspaceState.notifications.forEach((item) => {
      if (item?.id) {
        seenNotificationIds.add(item.id);
      }
    });
    hasHydratedNotifications = true;
  }

  return accountWorkspaceState.notifications;
}

async function refreshAccountWorkspaceData(options = {}) {
  const { silent = false, toastNotifications = false } = options;
  if (!isAccountAuthenticated()) {
    accountWorkspaceState = createEmptyAccountWorkspaceState();
    renderAccountHistory();
    renderAccountUsage();
    renderAccountNotifications();
    return null;
  }

  try {
    await Promise.all([
      fetchAccountFiles(accountWorkspaceState.fileFilter, 30),
      fetchAccountUsage(),
      fetchAccountNotifications({ limit: 20, toastNew: toastNotifications })
    ]);
    return accountWorkspaceState;
  } catch (error) {
    if (!silent) {
      setAccountStatus(error instanceof Error ? error.message : "Não foi possível atualizar os dados da sua conta.");
    }
    throw error;
  }
}

function clearAccountPolling() {
  if (accountPollingTimer) {
    window.clearInterval(accountPollingTimer);
    accountPollingTimer = null;
  }
}

function syncAccountPolling() {
  clearAccountPolling();
  if (!isAccountAuthenticated()) {
    return;
  }

  accountPollingTimer = window.setInterval(() => {
    if (document.hidden || !isAccountAuthenticated()) {
      return;
    }

    void refreshAccountWorkspaceData({ silent: true, toastNotifications: true }).catch(() => undefined);
  }, 25000);
}

async function fetchAccountHistory(limit = 12) {
  return fetchAccountFiles(accountWorkspaceState.fileFilter, Math.max(limit, 30));
}

async function redownloadHistoryItem(historyId) {
  const response = await fetch(`/api/account/history/${encodeURIComponent(historyId)}/download`, {
    credentials: "same-origin"
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Não foi possível baixar novamente este arquivo." }));
    throw new Error(payload.message ?? "Não foi possível baixar novamente este arquivo.");
  }

  const blob = await response.blob();
  const filename = extractDownloadFilename(response.headers.get("Content-Disposition") ?? "");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function redeemAccessCode(code) {
  const response = await fetch("/api/access/redeem", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify({ code })
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível ativar o código." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível ativar o código.");
  }

  applySessionPayload(payload);
  return payload;
}

async function logoutAccess() {
  const response = await fetch("/api/access/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => null);
  applySessionPayload(payload ?? {});
}

async function registerAccount(input) {
  const response = await fetch("/api/account/register", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível criar a conta." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível criar a conta.");
  }

  return payload;
}

async function confirmAccountRegistration(input) {
  const response = await fetch("/api/account/register/confirm", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível confirmar sua conta." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível confirmar sua conta.");
  }

  applySessionPayload(payload);
  return payload;
}

async function loginAccount(input) {
  const response = await fetch("/api/account/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível entrar na conta." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível entrar na conta.");
  }

  applySessionPayload(payload);
  return payload;
}

async function updateAccountProfile(input) {
  const response = await fetch("/api/account/profile", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível salvar seus dados." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível salvar seus dados.");
  }

  applySessionPayload(payload);
  return payload;
}

async function requestAccountEmailChange(input) {
  const response = await fetch("/api/account/profile/email", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível enviar o código para o novo e-mail." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível enviar o código para o novo e-mail.");
  }

  return payload;
}

async function confirmAccountEmailChange(input) {
  const response = await fetch("/api/account/profile/confirm", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível confirmar o novo e-mail." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível confirmar o novo e-mail.");
  }

  applySessionPayload(payload);
  return payload;
}

async function updateAccountPassword(input) {
  const response = await fetch("/api/account/password", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível atualizar a senha." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível atualizar a senha.");
  }

  return payload;
}

async function confirmAccountPassword(input) {
  const response = await fetch("/api/account/password/confirm", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível confirmar a nova senha." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível confirmar a nova senha.");
  }

  applySessionPayload(payload);
  return payload;
}

async function resendAccountVerification(input) {
  const response = await fetch("/api/account/verification/resend", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível reenviar o código." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível reenviar o código.");
  }

  return payload;
}

async function updateAccountAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch("/api/account/avatar", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    },
    body: formData
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível atualizar a foto de perfil." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível atualizar a foto de perfil.");
  }

  applySessionPayload(payload);
  return payload;
}

async function removeAccountAvatar() {
  const response = await fetch("/api/account/avatar", {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível remover a foto de perfil." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível remover a foto de perfil.");
  }

  applySessionPayload(payload);
  return payload;
}

async function logoutAccount() {
  const response = await fetch("/api/account/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível encerrar a conta." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível encerrar a conta.");
  }

  applySessionPayload(payload);
  return payload;
}

function setAdminStatus(message, options = {}) {
  if (adminStatus) {
    adminStatus.textContent = message;
  }
  announceToast(message, options);
}

function renderAdminPaneState() {
  const activePane = adminState.activePane || "account";

  adminTabButtons.forEach((button) => {
    const isActive = button.dataset.adminPaneTarget === activePane;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  adminPanes.forEach((pane) => {
    const isActive = pane.dataset.adminPane === activePane;
    pane.hidden = !isActive;
    pane.classList.toggle("is-active", isActive);
  });
}

function setAdminPane(paneName) {
  adminState.activePane = paneName || "account";
  renderAdminPaneState();
}

function formatAdminUserPlan(user) {
  if (!user?.plan || user.plan.status !== "active") {
    return "Sem plano ativo";
  }

  return `${user.plan.plan === "team" ? "Team" : "Pro"} ate ${formatDateTime(user.plan.accessExpiresAt)}`;
}

function formatAdminWallet(user) {
  const wallet = user?.wallet ?? {
    creditBalance: 0,
    discountPercent: 0,
    discountExpiresAt: null
  };

  return {
    credits: `${Number(wallet.creditBalance ?? 0).toFixed(2).replace(".", ",")} créditos`,
    discount: wallet.discountPercent && wallet.discountExpiresAt
      ? `${wallet.discountPercent}% ate ${formatDateTime(wallet.discountExpiresAt)}`
      : "Sem desconto ativo."
  };
}

function renderAdminDashboard() {
  const dashboard = adminState.dashboard ?? {
    totalUsers: 0,
    activePremiumUsers: 0,
    activePromos: 0,
    totalCredits: 0,
    approvedPayments: 0,
    approvedRevenueBRL: 0,
    queuedJobs: 0,
    processingJobs: 0,
    topToolUsage: []
  };

  if (adminStatUsers) {
    adminStatUsers.textContent = String(dashboard.totalUsers ?? 0);
  }
  if (adminStatPremium) {
    adminStatPremium.textContent = String(dashboard.activePremiumUsers ?? 0);
  }
  if (adminStatCredits) {
    adminStatCredits.textContent = `${Number(dashboard.totalCredits ?? 0).toFixed(2).replace(".", ",")}`;
  }
  if (adminStatRevenue) {
    adminStatRevenue.textContent = formatCurrencyBRL(dashboard.approvedRevenueBRL ?? 0);
  }
  if (adminStatPayments) {
    const payments = Number(dashboard.approvedPayments ?? 0);
    adminStatPayments.textContent = `${payments} pagamento${payments === 1 ? "" : "s"} aprovado${payments === 1 ? "" : "s"}.`;
  }
  if (adminStatQueued) {
    adminStatQueued.textContent = String(Number(dashboard.queuedJobs ?? 0));
  }
  if (adminStatProcessing) {
    adminStatProcessing.textContent = String(Number(dashboard.processingJobs ?? 0));
  }

  renderAdminMiniList(
    adminDashboardUsage,
    dashboard.topToolUsage ?? [],
    "O consumo por ferramenta aparece aqui conforme a plataforma é usada.",
    (item) => `
      <strong>${escapeHtml(item.toolLabel)}</strong>
      <span>${escapeHtml(`${item.totalConversions} usos • ${Number(item.estimatedCreditsUsed ?? 0).toFixed(2).replace(".", ",")} créditos • ${formatDateTime(item.lastUsedAt)}`)}</span>
    `
  );
}

function renderAdminUserList() {
  if (!adminUserList) {
    return;
  }

  adminUserList.innerHTML = "";
  const users = Array.isArray(adminState.users) ? adminState.users : [];
  if (adminUserEmpty) {
    adminUserEmpty.hidden = users.length > 0;
  }

  users.forEach((user) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `admin-user-item${adminState.selectedUserId === user.id ? " is-selected" : ""}`;
    button.dataset.userId = user.id;
    const wallet = formatAdminWallet(user);
    const planLabel = formatAdminUserPlan(user);
    const initials = getInitialsFromText(user.displayName || user.email, "U");
    button.innerHTML = `
      <div class="admin-user-leading">
        <span class="admin-user-avatar" aria-hidden="true">${escapeHtml(initials)}</span>
        <div class="admin-user-copy">
          <div class="admin-user-topline">
            <strong>${escapeHtml(user.displayName)}</strong>
            <div class="admin-badge-row">
              <span class="admin-badge" data-tone="${user.plan?.plan ?? "muted"}">${escapeHtml(user.plan?.plan === "team" ? "Team" : user.plan?.plan === "pro" ? "Pro" : "Grátis")}</span>
              ${user.isAdmin ? '<span class="admin-badge" data-tone="danger">Dono</span>' : ""}
            </div>
          </div>
          <span>${escapeHtml(user.email)}</span>
          <span class="account-copy">${escapeHtml(planLabel)}</span>
        </div>
      </div>
      <span class="account-copy">${escapeHtml(wallet.credits)} • ${escapeHtml(wallet.discount)}</span>
    `;
    button.addEventListener("click", () => {
      void selectAdminUser(user.id);
    });
    adminUserList.append(button);
  });
}

function renderAdminMiniList(container, items, emptyCopy, mapper) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "admin-mini-item";
    empty.innerHTML = `<span>${escapeHtml(emptyCopy)}</span>`;
    container.append(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "admin-mini-item";
    card.innerHTML = mapper(item);
    container.append(card);
  });
}

function applyAdminSelectionToForms() {
  const user = adminState.selectedUser;
  const wallet = formatAdminWallet(user);

  if (adminSelectedUserTitle) {
    adminSelectedUserTitle.textContent = user ? user.displayName : "Selecione uma conta";
  }
  if (adminSelectedUserPlan) {
    adminSelectedUserPlan.textContent = user
      ? (user.plan?.status === "active" ? (user.plan.plan === "team" ? "Team" : "Pro") : "Gratis")
      : "Sem selecao";
    adminSelectedUserPlan.dataset.tone = user?.plan?.status === "active"
      ? (user.plan.plan === "team" ? "team" : "pro")
      : "muted";
  }
  if (adminSelectedUserMeta) {
    adminSelectedUserMeta.textContent = user
      ? `${user.email} • criada em ${formatDateTime(user.createdAt)}`
      : "Abra um usuário para ver seus detalhes completos.";
  }
  if (adminSelectedUserWallet) {
    adminSelectedUserWallet.textContent = user ? wallet.credits : "0 créditos";
    adminSelectedUserWallet.dataset.tone = user && Number(user.wallet?.creditBalance ?? 0) > 0 ? "pro" : "muted";
  }
  if (adminSelectedUserDiscount) {
    adminSelectedUserDiscount.textContent = wallet.discount;
  }

  const controls = [
    adminUserDisplayNameInput,
    adminUserEmailInput,
    adminUserPlanInput,
    adminUserPlanDaysInput,
    adminUserCreditsModeInput,
    adminUserCreditsAmountInput,
    adminUserDiscountPercentInput,
    adminUserDiscountDaysInput,
    adminUserDeleteButton
  ].filter(Boolean);

  controls.forEach((control) => {
    control.disabled = !user;
  });

  if (adminUserDisplayNameInput) {
    adminUserDisplayNameInput.value = user?.displayName ?? "";
  }
  if (adminUserEmailInput) {
    adminUserEmailInput.value = user?.email ?? "";
  }
  if (adminUserPlanInput) {
    adminUserPlanInput.value = user?.plan?.plan ?? "free";
  }
  if (adminUserPlanDaysInput) {
    adminUserPlanDaysInput.value = "30";
  }
  if (adminUserCreditsAmountInput) {
    adminUserCreditsAmountInput.value = "10";
  }
  if (adminUserDiscountPercentInput) {
    adminUserDiscountPercentInput.value = user?.wallet?.discountPercent ? String(user.wallet.discountPercent) : "15";
  }
  if (adminUserDiscountDaysInput) {
    adminUserDiscountDaysInput.value = "30";
  }

  renderAdminMiniList(
    adminUserPayments,
    user?.recentPayments ?? [],
    "Nenhum pagamento recente para este usuário.",
    (item) => `
      <strong>${escapeHtml(item.offerId)}</strong>
      <span>${escapeHtml(formatCurrencyBRL(item.amountBRL))} • ${escapeHtml(item.status)} • ${escapeHtml(formatDateTime(item.approvedAt))}</span>
    `
  );

  renderAdminMiniList(
    adminUserPromos,
    user?.promoRedemptions ?? [],
    "Nenhum código usado nesta conta.",
    (item) => `
      <strong>${escapeHtml(item.code)}</strong>
      <span>${escapeHtml(
        [
          item.creditAmount > 0 ? `${item.creditAmount.toFixed(2).replace(".", ",")} créditos` : "",
          item.discountPercent > 0 ? `${item.discountPercent}%` : "",
          item.accessDays > 0 ? `${item.accessDays} dias ${item.accessPlan ?? "pro"}` : ""
        ].filter(Boolean).join(" • ") || "Sem beneficios registrados"
      )}</span>
    `
  );

  renderAdminMiniList(
    adminUserUsage,
    user?.usageBreakdown ?? [],
    "O consumo por ferramenta desta conta aparece aqui.",
    (item) => `
      <strong>${escapeHtml(item.toolLabel)}</strong>
      <span>${escapeHtml(`${item.totalConversions} usos • ${item.completedConversions} concluídas • ${item.failedConversions} falhas • ${Number(item.estimatedCreditsUsed ?? 0).toFixed(2).replace(".", ",")} créditos`)}</span>
    `
  );

  renderAdminMiniList(
    adminUserConversions,
    user?.recentConversions ?? [],
    "Nenhum arquivo recente para esta conta.",
    (item) => `
      <strong>${escapeHtml(item.outputFilename || item.toolLabel)}</strong>
      <span>${escapeHtml(`${item.toolLabel} • ${getConversionStatusLabel(item.status)} • ${formatDateTime(item.completedAt || item.updatedAt || item.createdAt)}`)}</span>
    `
  );
}

function renderAdminPromoList() {
  if (!adminPromoList) {
    return;
  }

  adminPromoList.innerHTML = "";
  const promos = Array.isArray(adminState.promos) ? adminState.promos : [];
  if (adminPromoEmpty) {
    adminPromoEmpty.hidden = promos.length > 0;
  }

  promos.forEach((promo) => {
    const item = document.createElement("article");
    item.className = "admin-promo-item";
    const rewards = [
      promo.creditAmount > 0 ? `${promo.creditAmount.toFixed(2).replace(".", ",")} créditos` : "",
      promo.discountPercent > 0 ? `${promo.discountPercent}% por ${promo.discountDays} dia(s)` : "",
      promo.accessDays > 0 ? `${promo.accessDays} dia(s) ${promo.accessPlan ?? "pro"}` : ""
    ].filter(Boolean).join(" • ");

    item.innerHTML = `
      <div class="admin-promo-topline">
        <div class="admin-promo-copy">
          <strong>${escapeHtml(promo.code)}</strong>
          <span>${escapeHtml(promo.label)}</span>
        </div>
        <div class="admin-badge-row">
          <span class="admin-badge" data-tone="${promo.active ? "pro" : "muted"}">${promo.active ? "Ativo" : "Pausado"}</span>
          <span class="admin-badge" data-tone="muted">${promo.redeemedCount}/${promo.maxRedemptions ?? "∞"}</span>
        </div>
      </div>
      <span class="account-copy">${escapeHtml(promo.description || rewards || "Codigo promocional do vaptdoc")}</span>
      <span class="account-copy">${escapeHtml(rewards || "Sem beneficios configurados")}</span>
      <div class="admin-promo-actions">
        <button type="button" class="ghost-action" data-admin-copy-promo="${escapeHtml(promo.code)}">Copiar código</button>
        <button type="button" class="ghost-action" data-admin-toggle-promo="${escapeHtml(promo.code)}">${promo.active ? "Pausar" : "Reativar"}</button>
        <button type="button" class="ghost-action danger" data-admin-delete-promo="${escapeHtml(promo.code)}">Excluir</button>
      </div>
    `;
    adminPromoList.append(item);
  });

  adminPromoList.querySelectorAll("[data-admin-copy-promo]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.getAttribute("data-admin-copy-promo") ?? "";
      try {
        await navigator.clipboard.writeText(code);
        setAdminStatus(`Codigo ${code} copiado.`);
      } catch {
        setAdminStatus(`Não foi possível copiar ${code}.`);
      }
    });
  });

  adminPromoList.querySelectorAll("[data-admin-toggle-promo]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.getAttribute("data-admin-toggle-promo") ?? "";
      const promo = adminState.promos.find((entry) => entry.code === code);
      if (!promo) {
        return;
      }

      try {
        await updateAdminPromo(code, { active: !promo.active });
        setAdminStatus(`Codigo ${code} atualizado.`);
      } catch (error) {
        setAdminStatus(error instanceof Error ? error.message : "Não foi possível atualizar o código.");
      }
    });
  });

  adminPromoList.querySelectorAll("[data-admin-delete-promo]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.getAttribute("data-admin-delete-promo") ?? "";
      if (!window.confirm(`Excluir o código ${code}?`)) {
        return;
      }

      try {
        await deleteAdminPromo(code);
        setAdminStatus(`Codigo ${code} removido.`);
      } catch (error) {
        setAdminStatus(error instanceof Error ? error.message : "Não foi possível remover o código.");
      }
    });
  });
}

function renderAdminUi() {
  if (adminUserSearchInput && adminUserSearchInput.value !== adminState.search) {
    adminUserSearchInput.value = adminState.search;
  }
  renderAdminDashboard();
  renderAdminUserList();
  applyAdminSelectionToForms();
  renderAdminPromoList();
  renderAdminPaneState();
}

async function fetchAdminDashboard() {
  const response = await fetch("/api/admin/dashboard", {
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível carregar o painel." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível carregar o painel.");
  }

  return payload.dashboard ?? null;
}

async function fetchAdminUsers(query = "") {
  const target = new URL("/api/admin/users", window.location.origin);
  if (query.trim()) {
    target.searchParams.set("q", query.trim());
  }

  const response = await fetch(target, {
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível carregar os usuários." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível carregar os usuários.");
  }

  return Array.isArray(payload.users) ? payload.users : [];
}

async function fetchAdminUserDetail(userId) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível carregar o usuário." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível carregar o usuário.");
  }

  return payload.user ?? null;
}

async function fetchAdminPromos() {
  const response = await fetch("/api/admin/promos", {
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível carregar os códigos promocionais." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível carregar os códigos promocionais.");
  }

  return Array.isArray(payload.promos) ? payload.promos : [];
}

async function selectAdminUser(userId) {
  adminState.selectedUserId = userId;
  renderAdminUserList();
  setAdminStatus("Carregando os detalhes do usuário...", { toast: false });

  try {
    adminState.selectedUser = await fetchAdminUserDetail(userId);
    renderAdminUi();
    setAdminStatus("Usuário carregado com sucesso.", { toast: false });
  } catch (error) {
    adminState.selectedUser = null;
    renderAdminUi();
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível abrir este usuário.");
  }
}

async function loadAdminPanel() {
  if (!isAdminAuthorized()) {
    return;
  }

  setAdminStatus("Carregando Painel Administrativo...", { toast: false });
  try {
    const [dashboard, users, promos] = await Promise.all([
      fetchAdminDashboard(),
      fetchAdminUsers(adminState.search),
      fetchAdminPromos()
    ]);
    adminState.dashboard = dashboard;
    adminState.users = users;
    adminState.promos = promos;

    const selectedUserId = adminState.selectedUserId && users.some((user) => user.id === adminState.selectedUserId)
      ? adminState.selectedUserId
      : users[0]?.id ?? "";
    adminState.selectedUserId = selectedUserId;
    adminState.selectedUser = selectedUserId ? await fetchAdminUserDetail(selectedUserId) : null;
    renderAdminUi();
    setAdminStatus("Painel administrativo atualizado.", { toast: false });
  } catch (error) {
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível carregar o painel administrativo.");
  }
}

async function updateAdminUserProfile(userId, input) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/profile`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível salvar os dados do usuário." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível salvar os dados do usuário.");
  }

  adminState.selectedUser = payload.user ?? null;
  await loadAdminPanel();
}

async function updateAdminUserPlan(userId, input) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/plan`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível atualizar o plano." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível atualizar o plano.");
  }

  adminState.selectedUser = payload.user ?? null;
  await refreshAccessSession();
  await loadAdminPanel();
}

async function updateAdminUserCredits(userId, input) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/credits`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível atualizar os créditos." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível atualizar os créditos.");
  }

  adminState.selectedUser = payload.user ?? null;
  await refreshAccessSession();
  await loadAdminPanel();
}

async function updateAdminUserDiscount(userId, input) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/discount`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível atualizar o desconto." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível atualizar o desconto.");
  }

  adminState.selectedUser = payload.user ?? null;
  await refreshAccessSession();
  await loadAdminPanel();
}

async function deleteAdminUser(userId) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível remover o usuário." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível remover o usuário.");
  }

  adminState.selectedUser = null;
  adminState.selectedUserId = "";
  await loadAdminPanel();
}

async function createAdminPromo(input) {
  const response = await fetch("/api/admin/promos", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível criar o código." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível criar o código.");
  }

  await loadAdminPanel();
  return payload.promo ?? null;
}

async function updateAdminPromo(code, input) {
  const response = await fetch(`/api/admin/promos/${encodeURIComponent(code)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(input)
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível atualizar o código." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível atualizar o código.");
  }

  await loadAdminPanel();
  return payload.promo ?? null;
}

async function deleteAdminPromo(code) {
  const response = await fetch(`/api/admin/promos/${encodeURIComponent(code)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      ...internalClientHeader
    }
  });
  const payload = await response.json().catch(() => ({ message: "Não foi possível remover o código." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível remover o código.");
  }

  await loadAdminPanel();
}

async function startCheckout(offerId) {
  const response = await fetch("/api/billing/checkout", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify({ offerId })
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível abrir o checkout." }));
  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível abrir o checkout.");
  }

  return payload;
}

async function confirmCheckoutReturn(paymentId = "") {
  const response = await fetch("/api/billing/confirm-return", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...internalClientHeader
    },
    body: JSON.stringify(paymentId ? { paymentId } : {})
  });

  const payload = await response.json().catch(() => ({ message: "Não foi possível confirmar o pagamento." }));
  if (response.status === 202) {
    return payload;
  }

  if (!response.ok) {
    throw new Error(payload.message ?? "Não foi possível confirmar o pagamento.");
  }

  applySessionPayload(payload.session ?? {});
  return payload;
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getToolSearchText(tool) {
  return normalizeText(
    [
      tool.label,
      tool.id,
      tool.category,
      tool.outputExtension,
      tool.description,
      toolSupportCopy[tool.id]
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isFavorite(toolId) {
  return favoriteToolIds.has(toolId);
}

function getOrderedTools(source) {
  return [...source].sort((left, right) => {
    const favoriteDelta = Number(isFavorite(right.id)) - Number(isFavorite(left.id));
    if (favoriteDelta !== 0) {
      return favoriteDelta;
    }

    return (left.order ?? 0) - (right.order ?? 0);
  });
}

function getVisibleTools() {
  const normalizedQuery = normalizeText(searchQuery);

  return getOrderedTools(tools).filter((tool) => {
    if (activeFilter === "favorites" && !isFavorite(tool.id)) {
      return false;
    }

    if (activeFilter === "3d" && tool.category !== "3d") {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return getToolSearchText(tool).includes(normalizedQuery);
  });
}

function getPrioritizedTools(source) {
  const orderedTools = getOrderedTools(source);
  const featuredSet = new Set(defaultFeaturedToolIds);
  const featuredTools = orderedTools.filter((tool) => featuredSet.has(tool.id));
  const remainingTools = orderedTools.filter((tool) => !featuredSet.has(tool.id));
  return [...featuredTools, ...remainingTools];
}

function getVisibleDirectoryTools(visibleTools) {
  const canCollapse = activeFilter === "all" && !searchQuery;
  const prioritizedTools = getPrioritizedTools(visibleTools);
  const featuredTools = prioritizedTools.filter((tool) => defaultFeaturedToolIds.includes(tool.id));
  const collapsedLimit = isCompactViewport() ? featuredToolRowMobileLimit : featuredToolRowDesktopLimit;
  const collapsedTools = (featuredTools.length > 0 ? featuredTools : prioritizedTools).slice(0, collapsedLimit);
  const expandedTools = [
    ...collapsedTools,
    ...prioritizedTools.filter((tool) => !collapsedTools.some((entry) => entry.id === tool.id))
  ];

  return {
    canCollapse,
    totalCount: prioritizedTools.length,
    collapsedCount: collapsedTools.length,
    tools: canCollapse && !isToolDirectoryExpanded ? collapsedTools : expandedTools
  };
}

function updateToolDirectoryToggleState(directoryState) {
  if (!toolDirectoryToggle || !toolDirectoryToggleCopy) {
    return;
  }

  const hiddenCount = Math.max(0, directoryState.totalCount - directoryState.collapsedCount);
  const shouldShow = directoryState.canCollapse && hiddenCount > 0;

  toolDirectoryToggle.hidden = !shouldShow;
  toolDirectoryToggle.setAttribute("aria-expanded", String(shouldShow && isToolDirectoryExpanded));

  if (!shouldShow) {
    return;
  }

  toolDirectoryToggleCopy.textContent = isToolDirectoryExpanded
    ? "Ocultar ferramentas"
    : "Exibir todas as ferramentas";
  toolDirectoryToggle.setAttribute(
    "aria-label",
    isToolDirectoryExpanded ? "Ocultar lista completa de ferramentas" : `Exibir mais ${hiddenCount} ferramentas`
  );
}

function getSearchMatches(limit = searchResultsLimit) {
  const normalizedQuery = normalizeText(searchQuery);
  if (!normalizedQuery) {
    return [];
  }

  return getOrderedTools(tools)
    .filter((tool) => getToolSearchText(tool).includes(normalizedQuery))
    .slice(0, limit);
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function getCookie(name) {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function updateThemeButton(theme) {
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
}

function toggleThemePreference() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  renderAccountUi();
}

function updateBrowserThemeColor(theme) {
  themeColorMeta?.setAttribute("content", browserThemeColors[theme] ?? browserThemeColors.light);
}

function extractDownloadFilename(contentDisposition) {
  const encodedMatch = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
  if (encodedMatch) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      // Continue to the simpler fallbacks below.
    }
  }

  const quotedMatch = /filename\s*=\s*"([^"]+)"/i.exec(contentDisposition);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  const plainMatch = /filename\s*=\s*([^;]+)/i.exec(contentDisposition);
  if (plainMatch) {
    return plainMatch[1].trim();
  }

  return `resultado-${Date.now()}`;
}

function applyTheme(theme, options = {}) {
  const { persist = true } = options;
  document.documentElement.dataset.theme = theme;
  if (persist) {
    setCookie(themeCookieName, theme);
  }
  updateBrowserThemeColor(theme);
  updateThemeButton(theme);
}

function initializeTheme() {
  const stored = getCookie(themeCookieName) ?? getCookie(legacyThemeCookieName);
  const fallback = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(stored ?? fallback);
}

function updateSearchClearButton() {
  searchClear.hidden = searchQuery.length === 0;
}

function clearSearchPlaceholderAnimation() {
  if (searchPlaceholderTimer) {
    clearTimeout(searchPlaceholderTimer);
    searchPlaceholderTimer = null;
  }
}

function scheduleSearchPlaceholderAnimation(delay) {
  clearSearchPlaceholderAnimation();
  searchPlaceholderTimer = window.setTimeout(runSearchPlaceholderAnimation, delay);
}

function startSearchPlaceholderAnimation() {
  clearSearchPlaceholderAnimation();

  if (reducedMotionQuery.matches) {
    searchInput.placeholder = searchPlaceholderExamples[0];
    return;
  }

  searchPlaceholderIndex = 0;
  searchPlaceholderText = "";
  searchPlaceholderPhase = "typing";
  runSearchPlaceholderAnimation();
}

function runSearchPlaceholderAnimation() {
  if (reducedMotionQuery.matches) {
    searchInput.placeholder = searchPlaceholderExamples[0];
    return;
  }

  const currentExample = searchPlaceholderExamples[searchPlaceholderIndex];

  if (searchPlaceholderPhase === "typing") {
    searchPlaceholderText = currentExample.slice(0, searchPlaceholderText.length + 1);
    searchInput.placeholder = searchPlaceholderText;

    if (searchPlaceholderText === currentExample) {
      searchPlaceholderPhase = "holding";
      scheduleSearchPlaceholderAnimation(1700);
      return;
    }

    scheduleSearchPlaceholderAnimation(92);
    return;
  }

  if (searchPlaceholderPhase === "holding") {
    searchPlaceholderPhase = "deleting";
    scheduleSearchPlaceholderAnimation(70);
    return;
  }

  searchPlaceholderText = currentExample.slice(0, Math.max(0, searchPlaceholderText.length - 1));
  searchInput.placeholder = searchPlaceholderText;

  if (searchPlaceholderText.length === 0) {
    searchPlaceholderIndex = (searchPlaceholderIndex + 1) % searchPlaceholderExamples.length;
    searchPlaceholderPhase = "typing";
    scheduleSearchPlaceholderAnimation(250);
    return;
  }

  scheduleSearchPlaceholderAnimation(54);
}

function hideSearchResults() {
  isSearchResultsOpen = false;
  searchResults.hidden = true;
  searchResults.innerHTML = "";
}

function updateToolTabs() {
  toolTabs.forEach((tab) => {
    const isActive = tab.dataset.filter === activeFilter;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

function updateToolbarCopy(visibleCount) {
  if (isCompactViewport() && activeFilter === "all" && !searchQuery) {
    toolToolbarCopy.textContent = "Toque numa opção para ir ao envio";
    return;
  }

  if (activeFilter === "favorites") {
    toolToolbarCopy.textContent =
      visibleCount > 0 ? `${visibleCount} favorita${visibleCount > 1 ? "s" : ""}` : "Nenhuma favorita ainda";
    return;
  }

  if (activeFilter === "3d") {
    toolToolbarCopy.textContent =
      visibleCount > 0
        ? `${visibleCount} convers${visibleCount > 1 ? "oes" : "ao"} 3D pronta${visibleCount > 1 ? "s" : ""}`
        : "Nenhuma conversão 3D encontrada";
    return;
  }

  if (searchQuery) {
    toolToolbarCopy.textContent =
      visibleCount > 0 ? `${visibleCount} resultado${visibleCount > 1 ? "s" : ""}` : "Nada encontrado";
    return;
  }

  if (activeFilter === "all") {
    toolToolbarCopy.textContent = isToolDirectoryExpanded ? "Todas as ferramentas" : "Mais usadas no momento";
    return;
  }

  const favoriteCount = favoriteToolIds.size;
  toolToolbarCopy.textContent =
    favoriteCount > 0
      ? `${tools.length} conversões, ${favoriteCount} favorita${favoriteCount > 1 ? "s" : ""}`
      : "Conversões prontas para você";
}

function updateFavoriteButton(toolId) {
  if (!favoriteToggle || !favoriteToggleCopy) {
    return;
  }

  const favorite = isFavorite(toolId);
  favoriteToggle.classList.toggle("active", favorite);
  favoriteToggle.setAttribute("aria-pressed", String(favorite));
  favoriteToggle.setAttribute("aria-label", favorite ? "Remover dos favoritos" : "Favoritar conversão");
  favoriteToggleCopy.textContent = favorite ? "Favorita" : "Favoritar";
}

function getToolById(toolId = activeToolId) {
  return tools.find((item) => item.id === toolId) ?? null;
}

function normalizeFormatKind(value) {
  const normalized = String(value ?? "").toLowerCase();

  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "office"].includes(normalized)) {
    return "office";
  }

  if (["jpg", "jpeg", "png", "tif", "tiff", "image"].includes(normalized)) {
    return normalized === "tif" || normalized === "tiff" ? "image" : normalized;
  }

  if (
    ["stl", "obj", "step", "fbx", "dae", "amf", "ply", "glb", "gltf", "3ds", "u3d", "drc", "rvm", "usd", "usdz", "3d"].includes(
      normalized
    )
  ) {
    return "model3d";
  }

  if (["txt", "text", "csv", "json"].includes(normalized)) {
    return "text";
  }

  if (["zip"].includes(normalized)) {
    return "archive";
  }

  if (["html", "htm"].includes(normalized)) {
    return "html";
  }

  if (["mp3", "audio"].includes(normalized)) {
    return "mp3";
  }

  if (["mp4", "video"].includes(normalized)) {
    return "mp4";
  }

  return normalized || "pdf";
}

function getReadableFormatName(format) {
  const normalized = normalizeFormatKind(format);
  const readable = {
    pdf: "PDF",
    office: "DOCX",
    jpg: "JPG",
    jpeg: "JPEG",
    png: "PNG",
    image: "imagem",
    mp4: "MP4",
    mp3: "MP3",
    text: "texto",
    html: "HTML",
    archive: "ZIP",
    model3d: "modelo 3D"
  };

  return readable[normalized] ?? String(format ?? "").toUpperCase();
}

function isCompactViewport() {
  return compactViewportQuery.matches;
}

function isTouchViewport() {
  return touchViewportQuery.matches;
}

function shouldUseFullscreenAccountMenu() {
  return isCompactViewport() && isTouchViewport();
}

function getToolActionLabel(tool) {
  if (!tool) {
    return "Converter arquivo";
  }

  if (tool.id === "pdf-to-text") {
    return "Extrair texto do PDF";
  }

  if (tool.id === "3d-convert") {
    return "Converter modelo 3D";
  }

  return `Converter ${tool.label}`;
}

function getToolMinimumFiles(tool) {
  return Number(tool?.minFiles ?? 1);
}

function getToolMaximumFiles(tool) {
  return Number(tool?.maxFiles ?? (tool?.allowsMultipleFiles ? 10 : 1));
}

function getWorkspaceGuideCopy(tool) {
  if (!tool) {
    return "Escolha uma ferramenta, monte sua grade e converta sem se perder em campos.";
  }

  if (tool.id === "pdf-merge") {
    return "Monte a pilha final do PDF na grade e use a lateral para acelerar organização e revisão.";
  }

  if (tool.id === "pdf-split") {
    return "Deixe o PDF no centro e use a lateral para escolher o corte sem abrir campos desnecessários.";
  }

  if (tool.id === "image-to-pdf") {
    return "Trate cada imagem como página, organize a ordem e ajuste o layout no inspetor lateral.";
  }

  if (tool.category === "3d") {
    return "Modelos 3D ficam mais confortáveis de revisar quando a prévia e os ajustes vivem no mesmo workspace.";
  }

  if (tool.allowsMultipleFiles || getToolMaximumFiles(tool) > 1 || getToolMinimumFiles(tool) > 1) {
    return "Monte a ordem na grade, confira os cards e so depois siga para o resultado.";
  }

  if (tool.textLayoutSupport?.enabled) {
    return "Ajuste o layout do texto no painel lateral e acompanhe o resultado sem trocar de tela.";
  }

  return "Envie um arquivo, revise a prévia e baixe o resultado em um fluxo mais claro.";
}

function getWorkspaceModeLabel(tool) {
  if (!tool) {
    return "1 arquivo";
  }

  if (tool.id === "pdf-merge") {
    return "Pilha de PDFs";
  }

  if (tool.id === "pdf-split") {
    return "1 PDF de origem";
  }

  if (tool.id === "image-to-pdf") {
    return "Páginas por imagem";
  }

  if (tool.category === "3d") {
    return "Fluxo 3D";
  }

  const minFiles = getToolMinimumFiles(tool);
  const maxFiles = getToolMaximumFiles(tool);

  if (tool.allowsMultipleFiles || maxFiles > 1 || minFiles > 1) {
    if (minFiles > 1) {
      return `${minFiles}+ arquivos`;
    }

    return maxFiles > 1 ? `Ate ${maxFiles} arquivos` : "Varios arquivos";
  }

  if (tool.textLayoutSupport?.enabled) {
    return "Texto flexivel";
  }

  return "1 arquivo";
}

function isSpecializedWorkspaceTool(tool = getToolById()) {
  return Boolean(tool && specializedWorkspaceTools.has(tool.id));
}

function getWorkspaceBlueprint(tool) {
  return workspaceBlueprints[tool?.id] ?? workspaceBlueprints.default;
}

function hasVisibleOptionFields(root = form) {
  return Array.from(root?.querySelectorAll(".option-field") ?? []).some((field) => !field.hidden);
}

function shouldShowWorkspaceOptionsCard(tool = getToolById()) {
  if (isSpecializedWorkspaceTool(tool)) {
    return !textLayoutField.hidden;
  }

  return !textLayoutField.hidden || hasVisibleOptionFields();
}

function getWorkspaceOptionsTitle(tool) {
  if (!tool) {
    return "Ajustes desta conversão";
  }

  if (tool.id === "pdf-rotate") {
    return "Gire o PDF do jeito mais natural";
  }

  if (tool.textLayoutSupport?.enabled && !hasVisibleOptionFields()) {
    return "Escolha como o texto deve sair";
  }

  if (tool.category === "3d") {
    return "Formato e detalhes do modelo";
  }

  return "Ajustes desta conversão";
}

function getWorkspaceOptionsCopy(tool) {
  if (!tool) {
    return "Mostramos apenas os controles que fazem sentido para esta ferramenta.";
  }

  if (tool.id === "pdf-rotate") {
    return "Arraste, toque ou use os botões para girar visualmente antes de converter.";
  }

  if (tool.textLayoutSupport?.enabled && !hasVisibleOptionFields()) {
    return "Defina se o texto deve sair em blocos ou linha por linha e siga com o download.";
  }

  if (tool.category === "3d") {
    return "Escolha o formato de saída e deixe o restante do fluxo visual por conta da grade.";
  }

  return "Os ajustes aparecem aqui apenas quando forem necessários para a conversão escolhida.";
}

function getWorkspaceFilesBadgeLabel(tool) {
  if (!tool || stagedFiles.length === 0) {
    return "Sem arquivos";
  }

  if (!tool.allowsMultipleFiles && getToolMaximumFiles(tool) <= 1) {
    return "1 arquivo pronto";
  }

  return `${stagedFiles.length} na grade`;
}

function getWorkspaceFlowLabel(tool) {
  if (!tool) {
    return "Escolha uma ferramenta";
  }

  if (isToolLocked(tool) && shouldRevealUpgradeContext(accessSession)) {
    return "Desbloqueie para continuar";
  }

  if (stagedFiles.length === 0) {
    return "Pronto para enviar";
  }

  const minFiles = getToolMinimumFiles(tool);
  if (stagedFiles.length < minFiles) {
    return `Faltam ${minFiles - stagedFiles.length}`;
  }

  if (tool.id === "pdf-merge") {
    return "Pilha pronta para unir";
  }

  if (tool.id === "pdf-split") {
    const mode = readOptionFieldValue("splitMode") || "ranges";
    return mode === "remove_pages" ? "Saida em PDF único" : "Saída em pacote ZIP";
  }

  if (tool.id === "image-to-pdf") {
    return "Layout pronto para revisar";
  }

  if (shouldShowWorkspaceOptionsCard()) {
    return "Revise os ajustes";
  }

  return "Pronto para converter";
}

function updateWorkspaceGuide(tool) {
  if (!workspaceGuideSteps.length) {
    return;
  }

  if (!tool) {
    workspaceGuideSteps.forEach((step) => {
      step.dataset.state = step.dataset.workspaceStep === "tool" ? "active" : "idle";
    });
    return;
  }

  const minFiles = getToolMinimumFiles(tool);
  const hasFiles = stagedFiles.length > 0;
  const hasEnoughFiles = stagedFiles.length >= minFiles;
  const hasAdjustments = shouldShowWorkspaceOptionsCard();
  const isLocked = isToolLocked(tool) && shouldRevealUpgradeContext(accessSession);

  const stepStates = {
    tool: "done",
    files: hasFiles ? "done" : "active",
    adjust: hasAdjustments ? (hasEnoughFiles ? "active" : "idle") : "done",
    convert: isLocked ? "locked" : hasEnoughFiles ? "active" : "idle"
  };

  workspaceGuideSteps.forEach((step) => {
    step.dataset.state = stepStates[step.dataset.workspaceStep] ?? "idle";
  });
}

function updateWorkspacePanels(tool = getToolById()) {
  const blueprint = getWorkspaceBlueprint(tool);
  const hasFiles = stagedFiles.length > 0;

  if (workspaceGuideCopy) {
    workspaceGuideCopy.textContent = getWorkspaceGuideCopy(tool);
  }

  if (!tool) {
    if (workspaceFromBadge) {
      workspaceFromBadge.textContent = "Entrada";
    }
    if (workspaceToBadge) {
      workspaceToBadge.textContent = "Saida";
    }
    if (workspaceModeBadge) {
      workspaceModeBadge.textContent = "1 arquivo";
    }
    if (workspaceFilesBadge) {
      workspaceFilesBadge.textContent = "Sem arquivos";
    }
    if (workspaceFlowBadge) {
      workspaceFlowBadge.textContent = "Escolha uma ferramenta";
    }
    if (workspaceCanvasTitle) {
      workspaceCanvasTitle.textContent = blueprint.canvasTitle;
    }
    if (workspaceCanvasCopy) {
      workspaceCanvasCopy.textContent = blueprint.canvasCopy;
    }
    if (workspaceSubmitTitle) {
      workspaceSubmitTitle.textContent = blueprint.submitTitle;
    }
    if (workspaceSubmitCopy) {
      workspaceSubmitCopy.textContent = blueprint.submitCopy;
    }
    if (workspaceSpecialCard) {
      workspaceSpecialCard.hidden = true;
    }
    if (workspaceOptionsCard) {
      workspaceOptionsCard.hidden = true;
    }
    renderToolHelp(null);
    renderToolFaq(null);
    hideConversionModal();
    updateWorkspaceGuide(null);
    return;
  }

  const formats = getToolFormats(tool);

  if (workspaceFromBadge) {
    workspaceFromBadge.textContent = `Entrada ${getReadableFormatName(formats.from)}`;
  }
  if (workspaceToBadge) {
    workspaceToBadge.textContent = `Saida ${getReadableFormatName(formats.to)}`;
  }
  if (workspaceModeBadge) {
    workspaceModeBadge.textContent = getWorkspaceModeLabel(tool);
  }
  if (workspaceFilesBadge) {
    workspaceFilesBadge.textContent = getWorkspaceFilesBadgeLabel(tool);
  }
  if (workspaceFlowBadge) {
    workspaceFlowBadge.textContent = getWorkspaceFlowLabel(tool);
  }
  if (workspaceCanvasTitle) {
    workspaceCanvasTitle.textContent = hasFiles ? blueprint.canvasTitle : getDropzoneTitleForTool(tool);
  }
  if (workspaceCanvasCopy) {
    workspaceCanvasCopy.textContent = hasFiles
      ? blueprint.canvasCopy
      : "Depois do envio, mostramos apenas os ajustes e a ação final desta conversão.";
  }
  if (workspaceSubmitTitle) {
    workspaceSubmitTitle.textContent = blueprint.submitTitle;
  }
  if (workspaceSubmitCopy) {
    workspaceSubmitCopy.textContent = blueprint.submitCopy;
  }
  if (workspaceOptionsTitle) {
    workspaceOptionsTitle.textContent = getWorkspaceOptionsTitle(tool);
  }
  if (workspaceOptionsCopy) {
    workspaceOptionsCopy.textContent = getWorkspaceOptionsCopy(tool);
  }
  renderSpecializedWorkspace(tool);
  if (workspaceOptionsCard) {
    workspaceOptionsCard.hidden = !(hasFiles && shouldShowWorkspaceOptionsCard(tool));
  }

  if (conversionModal && !conversionModal.hidden) {
    if (!hasFiles) {
      hideConversionModal();
    } else {
      syncConversionModalSummary(tool, getSelectedFiles());
    }
  }

  updateWorkspaceGuide(tool);
  updateToolFlowLayout(tool);
}

function updateToolFlowLayout(tool = getToolById()) {
  if (!form) {
    return;
  }

  const isToolPage = document.body.dataset.pageMode === "tool";
  const hasFiles = stagedFiles.length > 0;
  const revealUpgrade = Boolean(tool && isToolLocked(tool) && shouldRevealUpgradeContext(accessSession));
  const isUploadStage = Boolean(isToolPage && tool && !hasFiles && !revealUpgrade);
  const showSidebar = false;
  const showConvertAction = Boolean(tool && hasFiles && !revealUpgrade);

  form.classList.toggle("is-upload-stage", isUploadStage);

  if (convertSidebar) {
    convertSidebar.hidden = !showSidebar;
  }

  if (workspaceInspector) {
    workspaceInspector.hidden = true;
    workspaceInspector.setAttribute("aria-hidden", "true");
  }

  if (workspaceSubmitCard) {
    workspaceSubmitCard.hidden = !showConvertAction;
  }

  workspaceCanvasCard?.classList.toggle("is-upload-focus", isUploadStage);
  workspaceMainGrid?.classList.toggle("is-upload-focus", isUploadStage);

  if (convertButton) {
    convertButton.hidden = !showConvertAction;
  }

  if (!showConvertAction && !form.classList.contains("is-processing")) {
    hideUploadProgress();
    clearConversionLifecycle();
  }
}

function getDropzoneTitleForTool(tool) {
  if (!tool) {
    return "Envie seu arquivo";
  }

  const { from } = getToolFormats(tool);

  if (tool.allowsMultipleFiles || (tool.maxFiles ?? 1) > 1 || (tool.minFiles ?? 1) > 1) {
    return "Envie seus arquivos";
  }

  if (from === "pdf") {
    return "Envie seu PDF";
  }

  if (from === "office") {
    return "Envie seu DOCX";
  }

  if (from === "image" || from === "jpg" || from === "jpeg" || from === "png") {
    return "Envie sua imagem";
  }

  if (from === "mp4") {
    return "Envie seu vídeo";
  }

  if (from === "model3d") {
    return "Envie seu modelo 3D";
  }

  return "Envie seu arquivo";
}

function getDropzoneCopyForTool(tool) {
  const touchCopy = isTouchViewport();
  const tapVerb = touchCopy ? "Toque" : "Clique";

  if (!tool) {
    return `${tapVerb} para escolher seu arquivo`;
  }

  if (tool.allowsMultipleFiles || (tool.maxFiles ?? 1) > 1 || (tool.minFiles ?? 1) > 1) {
    return touchCopy ? "Toque para escolher e organizar os arquivos" : "Clique ou arraste para escolher e organizar os arquivos";
  }

  if (touchCopy) {
    return tool.fileHint ?? "Toque para escolher seu arquivo";
  }

  return tool.fileHint ?? "Clique ou arraste aqui para escolher seu arquivo";
}

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function getFileExtension(fileName) {
  const segments = String(fileName ?? "").trim().split(".");
  if (segments.length <= 1) {
    return "";
  }

  return segments.pop()?.toLowerCase() ?? "";
}

function detectStagedFileFormat(file) {
  const mimeType = String(file?.type ?? "").toLowerCase();
  const extension = getFileExtension(file?.name);

  if (mimeType.startsWith("image/")) {
    if (mimeType.includes("png")) {
      return "png";
    }

    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      return extension === "jpeg" ? "jpeg" : "jpg";
    }

    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "mp4";
  }

  if (mimeType.startsWith("audio/")) {
    return "mp3";
  }

  if (mimeType.includes("pdf")) {
    return "pdf";
  }

  if (mimeType.includes("html")) {
    return "html";
  }

  if (mimeType.includes("json") || mimeType.includes("text") || mimeType.includes("csv")) {
    return "text";
  }

  if (mimeType.includes("zip")) {
    return "archive";
  }

  return normalizeFormatKind(extension || "pdf");
}

function getStagedFileLabel(file, normalizedFormat) {
  const extension = getFileExtension(file?.name);
  return (extension ? extension.toUpperCase() : getReadableFormatName(normalizedFormat)).slice(0, 10);
}

function getFilePreviewUrl(file) {
  if (filePreviewUrlCache.has(file)) {
    return filePreviewUrlCache.get(file) ?? "";
  }

  const previewUrl = URL.createObjectURL(file);
  filePreviewUrlCache.set(file, previewUrl);
  return previewUrl;
}

function syncPreviewUrlCache(files) {
  const activeFiles = new Set(files);

  for (const [file, previewUrl] of filePreviewUrlCache.entries()) {
    if (activeFiles.has(file)) {
      continue;
    }

    URL.revokeObjectURL(previewUrl);
    filePreviewUrlCache.delete(file);
  }

  for (const [file, previewUrl] of pdfPreviewUrlCache.entries()) {
    if (activeFiles.has(file)) {
      continue;
    }

    URL.revokeObjectURL(previewUrl);
    pdfPreviewUrlCache.delete(file);
  }
}

async function loadPdfJsModule() {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = import("/assets/vendor/pdf.mjs").then((module) => {
      const pdfjs = module;
      if (pdfjs?.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/assets/vendor/pdf.worker.mjs";
      }
      return pdfjs;
    });
  }

  return pdfJsModulePromise;
}

async function getPdfPreviewUrl(file) {
  if (pdfPreviewUrlCache.has(file)) {
    return pdfPreviewUrlCache.get(file) ?? "";
  }

  const pdfjs = await loadPdfJsModule();
  const documentTask = pdfjs.getDocument({
    data: await file.arrayBuffer(),
    isEvalSupported: false
  });
  const pdfDocument = await documentTask.promise;
  const page = await pdfDocument.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const targetWidth = 440;
  const scale = targetWidth / Math.max(1, viewport.width);
  const scaledViewport = page.getViewport({ scale: Math.min(1.8, Math.max(0.9, scale)) });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Canvas indisponível para gerar miniatura.");
  }

  canvas.width = Math.ceil(scaledViewport.width);
  canvas.height = Math.ceil(scaledViewport.height);
  await page.render({
    canvasContext: context,
    viewport: scaledViewport
  }).promise;

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  if (!(blob instanceof Blob)) {
    throw new Error("Falha ao gerar miniatura do PDF.");
  }

  const previewUrl = URL.createObjectURL(blob);
  pdfPreviewUrlCache.set(file, previewUrl);
  return previewUrl;
}

function createFileStageIcon(kind) {
  const icon = document.createElement("div");
  icon.className = `file-preview-glyph ${formatBadgeThemes[kind] ?? formatBadgeThemes.text}`;
  icon.innerHTML = formatVisuals[kind] ?? formatVisuals.text;
  return icon;
}

function getFilePreviewOverlayLabel(tool, kind, index, total) {
  if (tool?.id === "pdf-merge" && kind === "pdf") {
    if (index === 0) {
      return "Abre o PDF final";
    }

    if (index === total - 1) {
      return "Fecha o PDF final";
    }

    return `Parte ${index + 1} da pilha`;
  }

  if (tool?.id === "pdf-split" && kind === "pdf") {
    return "PDF que sera dividido";
  }

  if (tool?.id === "image-to-pdf" && ["jpg", "jpeg", "png", "image"].includes(kind)) {
    return index === 0 ? "Capa do PDF" : `Página ${index + 1} do PDF`;
  }

  return kind === "pdf"
    ? "Previa do PDF"
    : kind === "mp4"
      ? "Video pronto"
      : kind === "jpg" || kind === "jpeg" || kind === "png" || kind === "image"
        ? "Imagem pronta"
        : "Pronto para mover";
}

function createFilePreviewSurface(file, kind, tool, index, total) {
  const extensionLabel = getStagedFileLabel(file, kind);
  const surface = document.createElement("div");
  surface.className = `file-preview-surface file-preview-${kind}`;

  const chrome = document.createElement("div");
  chrome.className = "file-preview-chrome";

  const extensionBadge = document.createElement("span");
  extensionBadge.className = "file-preview-extension";
  extensionBadge.textContent = extensionLabel;

  const iconBadge = createFileStageIcon(kind);
  iconBadge.classList.add("file-preview-icon-badge");

  chrome.append(extensionBadge, iconBadge);

  let mediaElement = null;

  if (["jpg", "jpeg", "png", "image"].includes(kind)) {
    const previewUrl = getFilePreviewUrl(file);
    mediaElement = document.createElement("img");
    mediaElement.src = previewUrl;
    mediaElement.alt = "";
    mediaElement.loading = "lazy";
    mediaElement.decoding = "async";
    mediaElement.className = "file-preview-media";
  } else if (kind === "mp4") {
    const previewUrl = getFilePreviewUrl(file);
    mediaElement = document.createElement("video");
    mediaElement.src = previewUrl;
    mediaElement.className = "file-preview-media";
    mediaElement.muted = true;
    mediaElement.playsInline = true;
    mediaElement.preload = "metadata";
  } else if (kind === "pdf") {
    mediaElement = document.createElement("img");
    mediaElement.alt = "";
    mediaElement.loading = "lazy";
    mediaElement.decoding = "async";
    mediaElement.className = "file-preview-media file-preview-document";

    getPdfPreviewUrl(file)
      .then((previewUrl) => {
        if (mediaElement?.isConnected) {
          mediaElement.src = previewUrl;
        }
      })
      .catch(() => {
        const fallbackUrl = getFilePreviewUrl(file);
        if (mediaElement?.isConnected) {
          mediaElement.src = fallbackUrl;
        }
      });
  }

  if (mediaElement) {
    surface.append(mediaElement);
  } else {
    const fallback = document.createElement("div");
    fallback.className = "file-preview-fallback";

    const glyph = createFileStageIcon(kind);
    glyph.classList.add("file-preview-fallback-glyph");

    const fallbackCopy = document.createElement("div");
    fallbackCopy.className = "file-preview-fallback-copy";

    const fallbackTitle = document.createElement("strong");
    fallbackTitle.textContent = getReadableFormatName(kind);

    const fallbackHint = document.createElement("span");
    fallbackHint.textContent =
      kind === "model3d"
        ? "Pronto para converter"
        : kind === "office"
          ? "Documento pronto"
          : kind === "text"
            ? "Conteudo pronto"
            : "Arquivo pronto";

    fallbackCopy.append(fallbackTitle, fallbackHint);
    fallback.append(glyph, fallbackCopy);
    surface.append(fallback);
  }

  const overlay = document.createElement("div");
  overlay.className = "file-preview-overlay";

  const overlayLabel = document.createElement("span");
  overlayLabel.className = "file-preview-overlay-label";
  overlayLabel.textContent = getFilePreviewOverlayLabel(tool, kind, index, total);

  overlay.append(overlayLabel);

  surface.append(chrome, overlay);
  return surface;
}

function createStageActionButton({ label, iconMarkup, className = "", onClick, disabled = false }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `mini-action file-stage-action-button ${className}`.trim();
  button.setAttribute("aria-label", label);
  button.disabled = disabled;
  button.innerHTML = `<span aria-hidden="true">${iconMarkup}</span>`;
  button.addEventListener("click", onClick);
  return button;
}

function getMoveUpIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m7 13 5-5 5 5"></path>
      <path d="M12 9v8"></path>
    </svg>
  `;
}

function getMoveDownIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m7 11 5 5 5-5"></path>
      <path d="M12 7v8"></path>
    </svg>
  `;
}

function getRemoveIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m18 6-12 12"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  `;
}

function getAddIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14"></path>
      <path d="M5 12h14"></path>
    </svg>
  `;
}

function getSelectedFiles() {
  return [...stagedFiles];
}

function reorderStagedFiles(fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= stagedFiles.length || toIndex >= stagedFiles.length) {
    return;
  }

  const nextFiles = [...stagedFiles];
  const [movedFile] = nextFiles.splice(fromIndex, 1);
  nextFiles.splice(toIndex, 0, movedFile);
  stagedFiles = nextFiles;
  renderStagedFiles();
  updateFileLabel();
}

function setStagedFiles(nextFiles) {
  stagedFiles = [...nextFiles];
  renderStagedFiles();
  updateFileLabel();
}

function reverseStagedFiles() {
  if (stagedFiles.length < 2) {
    return;
  }

  setStagedFiles([...stagedFiles].reverse());
}

function sortStagedFilesByName(direction = "asc") {
  if (stagedFiles.length < 2) {
    return;
  }

  const sorted = [...stagedFiles].sort((left, right) => left.name.localeCompare(right.name, "pt-BR", { numeric: true, sensitivity: "base" }));
  if (direction === "desc") {
    sorted.reverse();
  }

  setStagedFiles(sorted);
}

function removeStagedFile(index) {
  stagedFiles = stagedFiles.filter((_, currentIndex) => currentIndex !== index);
  renderStagedFiles();
  updateFileLabel();

  const tool = getToolById();
  if (tool) {
    updateDropzonePrompt(tool);
  }
}

function moveStagedFile(index, direction) {
  reorderStagedFiles(index, index + direction);
}

function addStagedFiles(fileList, options = {}) {
  const { append = false } = options;
  const tool = getToolById();
  const incomingFiles = Array.from(fileList ?? []);

  if (!tool || incomingFiles.length === 0) {
    return;
  }

  if (isToolLocked(tool)) {
    promptAccountPlanAccess(tool);
    return;
  }

  const nonEmptyFiles = incomingFiles.filter((file) => Number(file.size ?? 0) > 0);
  if (nonEmptyFiles.length !== incomingFiles.length) {
    setStatus("Um dos arquivos enviados está vazio. Escolha um arquivo válido para continuar.");
  }

  const oversizedFiles = getFilesOverLimit(nonEmptyFiles);
  const allowedFiles = nonEmptyFiles.filter((file) => !oversizedFiles.includes(file));

  if (oversizedFiles.length > 0) {
    const maxLabel = getReadableMaxFileSize();
    const firstName = oversizedFiles[0]?.name ?? "arquivo";
    setStatus(maxLabel ? `${firstName} ultrapassa o limite de ${maxLabel}.` : `${firstName} ultrapassa o limite permitido.`);
  }

  if (allowedFiles.length === 0) {
    fileInput.value = "";
    return;
  }

  let nextFiles = append && tool.allowsMultipleFiles ? [...stagedFiles, ...allowedFiles] : [...allowedFiles];

  if (!tool.allowsMultipleFiles) {
    nextFiles = nextFiles.slice(0, 1);
  }

  const maxFiles = tool.maxFiles ?? (tool.allowsMultipleFiles ? 10 : 1);
  const trimmedFiles = nextFiles.slice(0, maxFiles);
  const discardedCount = Math.max(0, nextFiles.length - trimmedFiles.length);

  stagedFiles = trimmedFiles;
  renderStagedFiles();
  updateFileLabel();
  fileInput.value = "";

  if (discardedCount > 0) {
    setStatus(`Essa conversão aceita no máximo ${maxFiles} arquivos por vez.`);
  }
}

function clearStagedFiles() {
  stagedFiles = [];
  renderStagedFiles();
  updateFileLabel();
}

function renderStagedFiles() {
  if (!fileStage) {
    return;
  }

  const tool = getToolById();
  const files = getSelectedFiles();
  const totalBytes = files.reduce((sum, file) => sum + Number(file.size || 0), 0);

  fileStage.innerHTML = "";
  fileStage.hidden = files.length === 0;
  if (dropzone) {
    dropzone.hidden = false;
    dropzone.setAttribute("aria-hidden", "false");
  }
  syncPreviewUrlCache(files);

  if (!tool || files.length === 0) {
    updateWorkspacePanels(tool);
    return;
  }

  const canReorder = files.length > 1;
  const header = document.createElement("div");
  header.className = "file-stage-head";

  const heading = document.createElement("div");
  heading.className = "file-stage-heading";

  const title = document.createElement("strong");
  title.textContent =
    tool.id === "pdf-merge"
      ? files.length > 1
        ? "Pilha pronta para unir"
        : "Primeiro PDF na pilha"
      : tool.id === "pdf-split"
        ? "PDF pronto para dividir"
        : tool.id === "image-to-pdf"
          ? files.length > 1
            ? "Páginas prontas para o PDF"
            : "Primeira página pronta"
          : files.length > 1
            ? "Arquivos prontos"
            : "Arquivo pronto";

  const hint = document.createElement("span");
  hint.textContent =
    tool.id === "pdf-merge"
      ? canReorder
        ? "Arraste os cards para definir a sequencia exata do PDF final."
        : "Adicione outro PDF para montar a ordem final do documento."
      : tool.id === "pdf-split"
        ? "Revise o arquivo de origem e finalize os cortes na lateral."
        : tool.id === "image-to-pdf"
          ? canReorder
            ? "Arraste as imagens para decidir a ordem das páginas do PDF."
            : "Envie mais imagens se quiser montar um PDF com várias páginas."
          : canReorder
            ? "Grade pronta para reorganizar, revisar e remover com poucos toques."
            : "Confira a prévia do arquivo e continue quando quiser.";

  heading.append(title, hint);

  const meta = document.createElement("div");
  meta.className = "file-stage-meta";

  const countChip = document.createElement("span");
  countChip.className = "file-stage-chip";
  countChip.textContent = `${files.length} ${files.length === 1 ? "arquivo" : "arquivos"}`;

  const sizeChip = document.createElement("span");
  sizeChip.className = "file-stage-chip";
  sizeChip.textContent = formatFileSize(totalBytes);

  meta.append(countChip, sizeChip);

  if (canReorder) {
    const orderChip = document.createElement("span");
    orderChip.className = "file-stage-chip";
    orderChip.textContent = orderSensitiveTools.has(tool.id) ? "Ordem ativa" : "Arraste para mover";
    meta.append(orderChip);
  }

  heading.append(meta);

  const headerActions = document.createElement("div");
  headerActions.className = "file-stage-head-actions";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "ghost-action";
  clearButton.textContent = "Limpar tudo";
  clearButton.addEventListener("click", clearStagedFiles);
  headerActions.append(clearButton);

  header.append(heading, headerActions);

  const list = document.createElement("div");
  list.className = "file-stage-list";

  files.forEach((file, index) => {
    const item = document.createElement("article");
    item.className = "file-stage-item";
    item.draggable = canReorder;
    item.dataset.fileIndex = String(index);

    item.addEventListener("dragstart", (event) => {
      draggedFileIndex = index;
      item.classList.add("dragging");
      event.dataTransfer?.setData("text/plain", String(index));
      event.dataTransfer.effectAllowed = "move";
    });

    item.addEventListener("dragend", () => {
      draggedFileIndex = null;
      item.classList.remove("dragging");
      fileStage.querySelectorAll(".file-stage-item").forEach((node) => node.classList.remove("drag-target"));
    });

    item.addEventListener("dragover", (event) => {
      if (!canReorder) {
        return;
      }

      event.preventDefault();
      item.classList.add("drag-target");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-target");
    });

    item.addEventListener("drop", (event) => {
      event.preventDefault();
      item.classList.remove("drag-target");
      if (draggedFileIndex === null) {
        return;
      }

      reorderStagedFiles(draggedFileIndex, index);
      draggedFileIndex = null;
    });

    const previewKind = detectStagedFileFormat(file);

    const topBar = document.createElement("div");
    topBar.className = "file-stage-item-topline";

    const orderBadge = document.createElement("span");
    orderBadge.className = "file-order-badge";
    orderBadge.textContent = String(index + 1);

    const formatPill = document.createElement("span");
    formatPill.className = "file-stage-format-pill";
    formatPill.textContent = getStagedFileLabel(file, previewKind);

    const dragHint = document.createElement("span");
    dragHint.className = "file-stage-drag-hint";
    dragHint.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 9h8"></path>
        <path d="M8 15h8"></path>
        <path d="M10 6h4"></path>
        <path d="M10 18h4"></path>
      </svg>
    `;
    dragHint.hidden = !canReorder;

    topBar.append(orderBadge, formatPill, dragHint);

    const preview = createFilePreviewSurface(file, previewKind, tool, index, files.length);

    const copy = document.createElement("div");
    copy.className = "file-stage-copy";

    const name = document.createElement("strong");
    name.textContent = file.name;
    name.title = file.name;

    const metaRow = document.createElement("div");
    metaRow.className = "file-stage-copy-meta";

    const sizeMeta = document.createElement("span");
    sizeMeta.className = "file-stage-copy-chip";
    sizeMeta.textContent = formatFileSize(file.size);

    const formatMeta = document.createElement("span");
    formatMeta.className = "file-stage-copy-chip";
    formatMeta.textContent = getReadableFormatName(previewKind);

    metaRow.append(sizeMeta, formatMeta);

    if (tool.allowsMultipleFiles) {
      const orderMeta = document.createElement("span");
      orderMeta.className = "file-stage-copy-chip";
      orderMeta.textContent =
        tool.id === "pdf-merge"
          ? index === 0
            ? "Abre o PDF"
            : index === files.length - 1
              ? "Fecha o PDF"
              : `${index + 1}/${files.length}`
          : tool.id === "image-to-pdf"
            ? `Página ${index + 1}`
            : `${index + 1}/${files.length}`;
      metaRow.append(orderMeta);
    }

    copy.append(name, metaRow);

    const actions = document.createElement("div");
    actions.className = "file-stage-actions";

    if (canReorder) {
      const reorderActions = document.createElement("div");
      reorderActions.className = "file-stage-reorder-actions";

      const moveUp = createStageActionButton({
        label: "Mover para cima",
        iconMarkup: getMoveUpIcon(),
        onClick: () => moveStagedFile(index, -1),
        disabled: index === 0
      });

      const moveDown = createStageActionButton({
        label: "Mover para baixo",
        iconMarkup: getMoveDownIcon(),
        onClick: () => moveStagedFile(index, 1),
        disabled: index === files.length - 1
      });

      reorderActions.append(moveUp, moveDown);
      actions.append(reorderActions);
    }

    const remove = createStageActionButton({
      label: "Remover arquivo",
      iconMarkup: getRemoveIcon(),
      className: "mini-action-danger",
      onClick: () => removeStagedFile(index)
    });
    actions.append(remove);

    item.append(topBar, preview, copy, actions);
    list.append(item);
  });

  fileStage.append(header, list);
  updateWorkspacePanels(tool);
}

function updateFileInputConfig(tool, options = {}) {
  const { reset = false } = options;

  fileInput.multiple = Boolean(tool.allowsMultipleFiles);
  fileInput.accept = tool.accept ?? "";

  if (reset) {
    fileInput.value = "";
    clearStagedFiles();
  }
}

function updateFileLabel() {
  const tool = getToolById();
  const files = getSelectedFiles();
  dropzone.classList.toggle("has-files", files.length > 0);

  if (files.length === 0) {
    dropzoneTitle.textContent = getDropzoneTitleForTool(tool);
    dropzoneCopy.textContent = getDropzoneCopyForTool(tool);
    return;
  }

  if (!tool?.allowsMultipleFiles) {
    dropzoneTitle.textContent = "Trocar arquivo";
    dropzoneCopy.textContent = `${files[0].name} \u00B7 ${formatFileSize(files[0].size)}`;
    return;
  }

  dropzoneTitle.textContent = "Adicionar mais arquivos";
  dropzoneCopy.textContent = `${files.length} na grade \u00B7 arraste para reorganizar antes de converter`;
}

function getPreferredScrollBehavior() {
  return reducedMotionQuery.matches ? "auto" : "smooth";
}

function moveToUploadArea() {
  const scrollTarget = dropzone ?? form ?? workbench;
  const block = isCompactViewport() ? "start" : "nearest";
  const behavior = getPreferredScrollBehavior();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      scrollTarget?.scrollIntoView({ behavior, block, inline: "nearest" });
      window.setTimeout(() => {
        dropzone?.focus({ preventScroll: true });
      }, behavior === "smooth" ? 280 : 0);
    });
  });
}

function updateBackToTopVisibility() {
  if (!backToTopButton) {
    return;
  }

  const shouldShow = window.scrollY > 280;
  backToTopButton.classList.toggle("is-visible", shouldShow);
  backToTopButton.setAttribute("aria-hidden", String(!shouldShow));
}

function syncDialogPresentationMode() {
  document.body.classList.toggle("android-fullscreen-dialogs", isAndroidUserAgent);
}

function syncResponsiveUi() {
  document.body.classList.toggle("account-menu-screen-open", Boolean(accountPopover && !accountPopover.hidden && shouldUseFullscreenAccountMenu()));
  syncDialogPresentationMode();
  renderTools();
  renderSearchResults();

  const activeTool = getToolById();
  if (activeTool) {
    updateDropzonePrompt(activeTool);
    updateLockedToolState(activeTool);
  }
}

function updateDropzonePrompt(tool) {
  if (isToolLocked(tool) && shouldRevealUpgradeContext(accessSession)) {
    dropzoneTitle.textContent = "Disponivel no Pro";
    dropzoneCopy.textContent = `${tool.label} fica liberado assim que você ativar um plano ou código.`;
    return;
  }

  if (stagedFiles.length > 0) {
    return;
  }

  dropzoneTitle.textContent = getDropzoneTitleForTool(tool);
  dropzoneCopy.textContent = getDropzoneCopyForTool(tool);
}

function updateLockedToolState(tool) {
  const locked = isToolLocked(tool);
  const revealUpgrade = locked && shouldRevealUpgradeContext(accessSession);
  premiumLock.hidden = !revealUpgrade;
  dropzone.classList.toggle("is-locked", revealUpgrade);
  fileInput.disabled = revealUpgrade;
  convertButton.classList.toggle("is-locked", revealUpgrade);
  convertButton.textContent = revealUpgrade ? "Desbloquear esta ferramenta" : getToolActionLabel(tool);

  if (revealUpgrade) {
    clearStagedFiles();
  }

  if (!revealUpgrade && stagedFiles.length === 0) {
    updateDropzonePrompt(tool);
  }

  updateWorkspacePanels(tool);
}

function applyToolTheme(tool, card = null) {
  const theme = toolThemes[tool.id] ?? toolThemes.default;
  const target = card ?? form;
  target.style.setProperty("--tool-from", theme.from);
  target.style.setProperty("--tool-to", theme.to);
  target.style.setProperty("--tool-glow", theme.glow);
}

function getToolFormats(tool) {
  return {
    from: normalizeFormatKind(tool.inputKinds?.[0] ?? "pdf"),
    to: normalizeFormatKind(tool.outputExtension ?? "pdf")
  };
}

function renderFormatBadge(format, element, edgeClass, options = {}) {
  const { lazy = true } = options;
  element.className = `tool-icon ${edgeClass} ${formatBadgeThemes[format] ?? formatBadgeThemes.text}`;

  if (!lazy || !lazyIconObserver) {
    element.innerHTML = formatVisuals[format] ?? formatVisuals.text;
    return;
  }

  element.dataset.lazyFormat = format;
  element.innerHTML = '<span class="tool-icon-skeleton" aria-hidden="true"></span>';
  if (element.isConnected) {
    lazyIconObserver.observe(element);
    return;
  }

  queueMicrotask(() => {
    if (element.isConnected) {
      lazyIconObserver.observe(element);
      return;
    }

    hydrateFormatBadge(element);
  });
}

function getChoiceDisplay(field, choice) {
  const presentation = optionPresentation[field.name]?.choices?.[choice.value] ?? {};
  return {
    label: presentation.label ?? choice.label,
    hint: presentation.hint ?? ""
  };
}

function getOptionFieldElement(fieldName) {
  return form?.querySelector(`[data-option-name="${fieldName}"]`) ?? null;
}

function readOptionFieldValue(fieldName) {
  const field = getOptionFieldElement(fieldName);
  if (!field) {
    const tool = getToolById();
    const optionField = tool ? getToolOptionField(tool, fieldName) : null;
    if (!optionField) {
      return "";
    }

    const fallbackValue = getToolOptionInitialValue(optionField, tool?.id);
    if (optionField.type === "checkbox") {
      return fallbackValue ? "true" : "false";
    }

    return String(fallbackValue ?? "");
  }

  if (field.type === "checkbox") {
    return field.checked ? "true" : "false";
  }

  return field.value ?? "";
}

function readBooleanOptionFieldValue(fieldName, fallbackValue = false) {
  const rawValue = readOptionFieldValue(fieldName);
  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  return fallbackValue;
}

function applyToolOptionVisibilityState(root = form) {
  if (!form) {
    return;
  }

  root.querySelectorAll("[data-option-visibility]").forEach((node) => {
    const visibility = JSON.parse(node.getAttribute("data-option-visibility") ?? "{}");
    const currentValue = readOptionFieldValue(visibility.field);
    const shouldShow = visibility.values.includes(currentValue);
    node.hidden = !shouldShow;
    node.setAttribute("aria-hidden", String(!shouldShow));
    node.querySelectorAll("input, select").forEach((input) => {
      input.disabled = !shouldShow;
    });
  });
}

function updateToolOptionVisibility() {
  applyToolOptionVisibilityState();
  storeCurrentToolOptions();
  updateWorkspacePanels();
}

function createOptionInput(field) {
  const initialValue = getToolOptionInitialValue(field);

  if (field.type === "select") {
    const select = document.createElement("select");
    select.name = field.name;
    select.dataset.optionName = field.name;
    select.setAttribute("aria-label", field.label);

    (field.choices ?? []).forEach((choice) => {
      const option = document.createElement("option");
      option.value = choice.value;
      option.textContent = choice.label;
      if (String(initialValue ?? "") === choice.value) {
        option.selected = true;
      }
      select.append(option);
    });

    return select;
  }

  if (field.type === "checkbox") {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = field.name;
    input.dataset.optionName = field.name;
    input.checked = Boolean(initialValue);
    input.setAttribute("aria-label", field.label);
    return input;
  }

  const input = document.createElement("input");
  input.type = field.type;
  input.name = field.name;
  input.dataset.optionName = field.name;
  input.setAttribute("aria-label", field.label);

  if (field.placeholder) {
    input.placeholder = field.placeholder;
  }

  if (initialValue !== undefined && initialValue !== null && String(initialValue).length > 0) {
    input.value = String(initialValue);
  }

  if (field.type === "number") {
    if (field.min !== undefined) {
      input.min = String(field.min);
    }

    if (field.max !== undefined) {
      input.max = String(field.max);
    }

    if (field.step !== undefined) {
      input.step = String(field.step);
    }
  }

  return input;
}

function createChoiceControl(field, options = {}) {
  const { variant = "chips" } = options;
  const initialValue = getToolOptionInitialValue(field);
  const container = document.createElement("div");
  container.className = `choice-picker choice-picker-${variant}`;

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = field.name;
  hiddenInput.dataset.optionName = field.name;
  hiddenInput.value = String(initialValue ?? field.choices?.[0]?.value ?? "");
  container.append(hiddenInput);

  const setValue = (nextValue) => {
    hiddenInput.value = String(nextValue);

    container.querySelectorAll("[data-choice-value]").forEach((button) => {
      const isActive = button.dataset.choiceValue === hiddenInput.value;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
  };

  (field.choices ?? []).forEach((choice) => {
    const display = getChoiceDisplay(field, choice);
    const button = document.createElement("button");
    button.type = "button";
    button.className = variant === "cards" ? "choice-card" : "choice-chip";
    button.dataset.choiceValue = choice.value;
    button.setAttribute("aria-pressed", "false");

    if (field.name === "target3dFormat") {
      const icon = document.createElement("span");
      renderFormatBadge(normalizeFormatKind(choice.value), icon, "tool-option-icon");
      button.append(icon);
    }

    const copy = document.createElement("span");
    copy.className = "choice-copy";

    const title = document.createElement("strong");
    title.textContent = display.label;
    copy.append(title);

    if (display.hint) {
      const hint = document.createElement("small");
      hint.textContent = display.hint;
      copy.append(hint);
    }

    button.append(copy);
    button.addEventListener("click", () => setValue(choice.value));
    container.append(button);
  });

  setValue(hiddenInput.value);
  return container;
}

function createNumberControl(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "number-stepper";

  const input = createOptionInput(field);
  input.classList.add("stepper-input");

  const step = Number(field.step ?? 1);
  const min = field.min;
  const max = field.max;

  const shiftValue = (direction) => {
    const current = Number(input.value || field.defaultValue || 0);
    let nextValue = current + direction * step;

    if (typeof min === "number") {
      nextValue = Math.max(min, nextValue);
    }

    if (typeof max === "number") {
      nextValue = Math.min(max, nextValue);
    }

    input.value = String(nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const createStepperButton = (label, direction) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stepper-button";
    button.textContent = label;
    button.addEventListener("click", () => shiftValue(direction));
    return button;
  };

  wrapper.append(createStepperButton("−", -1), input, createStepperButton("+", 1));
  return wrapper;
}

function createCheckboxControl(field) {
  const label = document.createElement("label");
  label.className = "toggle-card";

  const input = createOptionInput(field);
  input.classList.add("toggle-card-input");

  const track = document.createElement("span");
  track.className = "toggle-switch";
  track.innerHTML = '<span class="toggle-switch-thumb"></span>';

  const copy = document.createElement("span");
  copy.className = "toggle-copy";

  const title = document.createElement("strong");
  title.textContent = field.label;
  copy.append(title);

  if (field.help) {
    const hint = document.createElement("small");
    hint.textContent = field.help;
    copy.append(hint);
  }

  label.append(input, track, copy);
  return label;
}

function createRotateGestureControl(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "rotate-gesture";

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = field.name;
  hiddenInput.dataset.optionName = field.name;

  const allowedAngles = [90, 180, 270];
  let angle = Number(getToolOptionInitialValue(field) ?? 90);
  if (!allowedAngles.includes(angle)) {
    angle = 90;
  }

  const header = document.createElement("div");
  header.className = "rotate-gesture-header";

  const title = document.createElement("strong");
  title.textContent = "Gire do jeito mais confortavel";

  const angleBadge = document.createElement("span");
  angleBadge.className = "rotate-angle-badge";

  header.append(title, angleBadge);

  const stage = document.createElement("div");
  stage.className = "rotate-stage";
  stage.tabIndex = 0;
  stage.setAttribute("aria-label", "Arraste para girar o PDF");

  const preview = document.createElement("div");
  preview.className = "rotate-sheet";
  preview.innerHTML =
    '<span class="rotate-sheet-badge">PDF</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5"></path><path d="M8 13h8"></path><path d="M8 17h6"></path></svg>';

  const helper = document.createElement("p");
  helper.className = "rotate-helper";
  helper.textContent = "Arraste com o mouse ou toque para escolher a nova direcao.";

  const controls = document.createElement("div");
  controls.className = "rotate-actions";

  const rotateLeft = document.createElement("button");
  rotateLeft.type = "button";
  rotateLeft.className = "ghost-action";
  rotateLeft.textContent = "Girar para a esquerda";

  const rotateRight = document.createElement("button");
  rotateRight.type = "button";
  rotateRight.className = "ghost-action";
  rotateRight.textContent = "Girar para a direita";

  const emitAngle = () => {
    hiddenInput.value = String(angle);
    preview.style.transform = `rotate(${angle}deg)`;
    angleBadge.textContent = `${angle} graus`;
    hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const rotateByStep = (direction) => {
    const currentIndex = allowedAngles.indexOf(angle);
    const nextIndex = (currentIndex + direction + allowedAngles.length) % allowedAngles.length;
    angle = allowedAngles[nextIndex];
    emitAngle();
  };

  let dragging = false;
  let dragOriginX = 0;

  stage.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragOriginX = event.clientX;
    stage.classList.add("dragging");
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }

    const deltaX = event.clientX - dragOriginX;
    if (Math.abs(deltaX) < 34) {
      return;
    }

    rotateByStep(deltaX > 0 ? 1 : -1);
    dragOriginX = event.clientX;
  });

  const finishDrag = () => {
    dragging = false;
    stage.classList.remove("dragging");
  };

  stage.addEventListener("pointerup", finishDrag);
  stage.addEventListener("pointercancel", finishDrag);
  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      rotateByStep(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      rotateByStep(1);
    }
  });

  rotateLeft.addEventListener("click", () => rotateByStep(-1));
  rotateRight.addEventListener("click", () => rotateByStep(1));

  controls.append(rotateLeft, rotateRight);
  stage.append(preview);
  wrapper.append(hiddenInput, header, stage, helper, controls);
  emitAngle();

  return wrapper;
}

function createOptionControl(tool, field) {
  if (tool.id === "pdf-rotate" && field.name === "rotateAngle") {
    return createRotateGestureControl(field);
  }

  if (field.type === "select") {
    const variant = optionPresentation[field.name]?.variant ?? (field.choices?.length > 4 ? "chips" : "cards");
    return createChoiceControl(field, { variant });
  }

  if (field.type === "checkbox") {
    return createCheckboxControl(field);
  }

  if (field.type === "number") {
    return createNumberControl(field);
  }

  return createOptionInput(field);
}

function createOptionFieldWrapper(tool, field) {
  const wrapper = document.createElement("div");
  const variant = optionPresentation[field.name]?.variant;
  const isWideField = field.fullWidth || variant === "cards" || variant === "gesture";
  wrapper.className = `field option-field${isWideField ? " option-field-full" : ""}`;

  if (field.showWhen) {
    wrapper.setAttribute("data-option-visibility", JSON.stringify(field.showWhen));
  }

  if (field.type !== "checkbox" && !(tool.id === "pdf-rotate" && field.name === "rotateAngle")) {
    const label = document.createElement("span");
    label.textContent = field.label;
    wrapper.append(label);
  }

  wrapper.append(createOptionControl(tool, field));

  if (field.help && field.type !== "checkbox") {
    const hint = document.createElement("p");
    hint.className = "field-hint";
    hint.textContent = field.help;
    wrapper.append(hint);
  }

  return wrapper;
}

function getToolOptionField(tool, fieldName) {
  return Array.isArray(tool.optionFields) ? tool.optionFields.find((field) => field.name === fieldName) ?? null : null;
}

function createWorkspaceActionButton({ label, meta = "", iconMarkup, onClick, disabled = false, className = "" }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `ghost-action-rich workspace-side-action ${className}`.trim();
  button.disabled = disabled;

  const icon = document.createElement("span");
  icon.className = "ghost-action-icon workspace-side-action-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = iconMarkup;

  const copy = document.createElement("span");
  copy.className = "workspace-side-action-copy";

  const title = document.createElement("strong");
  title.textContent = label;
  copy.append(title);

  if (meta) {
    const hint = document.createElement("small");
    hint.textContent = meta;
    copy.append(hint);
  }

  button.append(icon, copy);
  button.addEventListener("click", onClick);
  return button;
}

function getOrderReverseIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 8H7"></path>
      <path d="m10 5-3 3 3 3"></path>
      <path d="M7 16h10"></path>
      <path d="m14 13 3 3-3 3"></path>
    </svg>
  `;
}

function getSortAscendingIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 7h10"></path>
      <path d="M6 12h7"></path>
      <path d="M6 17h4"></path>
      <path d="m16 17 2 2 2-2"></path>
      <path d="M18 19V7"></path>
    </svg>
  `;
}

function getSplitModeIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"></rect>
      <path d="M12 4v16"></path>
      <path d="M4 12h8"></path>
    </svg>
  `;
}

function getLayoutPagesIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="5" width="7" height="14" rx="1.6"></rect>
      <rect x="13" y="5" width="7" height="14" rx="1.6"></rect>
    </svg>
  `;
}

function createWorkspaceSpecialSection(title, copy = "") {
  const section = document.createElement("section");
  section.className = "workspace-special-section";

  const header = document.createElement("div");
  header.className = "workspace-special-section-head";

  const heading = document.createElement("strong");
  heading.textContent = title;
  header.append(heading);

  if (copy) {
    const text = document.createElement("p");
    text.textContent = copy;
    header.append(text);
  }

  const body = document.createElement("div");
  body.className = "workspace-special-section-body";

  section.append(header, body);
  return { section, body };
}

function createWorkspaceInfoNote(title, copy, tone = "soft") {
  const note = document.createElement("article");
  note.className = `workspace-special-note workspace-special-note-${tone}`;

  const heading = document.createElement("strong");
  heading.textContent = title;

  const text = document.createElement("p");
  text.textContent = copy;

  note.append(heading, text);
  return note;
}

function createWorkspaceOrderList(tool, files) {
  const list = document.createElement("div");
  list.className = "workspace-special-order-list";

  if (files.length === 0) {
    list.append(
      createWorkspaceInfoNote(
        tool.id === "pdf-split" ? "Envie um PDF para continuar" : "Sua grade aparece aqui",
        tool.id === "pdf-split"
          ? "Assim que você escolher um arquivo, mostramos o resumo do corte nesta lateral."
          : "Depois do envio, a ordem final fica espelhada aqui e na grade central."
      )
    );
    return list;
  }

  files.forEach((file, index) => {
    const row = document.createElement("article");
    row.className = "workspace-special-order-item";

    const badge = document.createElement("span");
    badge.className = "workspace-special-order-badge";
    badge.textContent = String(index + 1);

    const copy = document.createElement("div");
    copy.className = "workspace-special-order-copy";

    const name = document.createElement("strong");
    name.textContent = file.name;
    name.title = file.name;

    const meta = document.createElement("span");
    if (tool.id === "image-to-pdf") {
      meta.textContent = `${index === 0 ? "Capa" : `Página ${index + 1}`} · ${formatFileSize(file.size)}`;
    } else if (tool.id === "pdf-merge") {
      meta.textContent = `${index === 0 ? "Abre o PDF final" : index === files.length - 1 ? "Fecha o PDF final" : "Miolo do documento"} · ${formatFileSize(file.size)}`;
    } else {
      meta.textContent = formatFileSize(file.size);
    }

    copy.append(name, meta);
    row.append(badge, copy);
    list.append(row);
  });

  return list;
}

function appendSpecializedField(body, tool, fieldName) {
  const field = getToolOptionField(tool, fieldName);
  if (!field) {
    return;
  }

  body.append(createOptionFieldWrapper(tool, field));
}

function getSplitModeWorkspaceNote() {
  const mode = readOptionFieldValue("splitMode") || "ranges";

  if (mode === "fixed_range") {
    return createWorkspaceInfoNote(
      "Partes automaticas",
      "Defina quantas páginas cada parte deve ter. O app gera a sequência para você sem precisar escrever intervalos."
    );
  }

  if (mode === "remove_pages") {
    return createWorkspaceInfoNote(
      "PDF único sem páginas escolhidas",
      "Use números ou intervalos, como 2-4,8. O retorno vem como um único PDF já limpo."
    );
  }

  return createWorkspaceInfoNote(
    "Intervalos livres",
    "Exemplos prontos: 1-3,5-8 ou 1,4,9. Se quiser, marque para reunir os trechos de novo em um único PDF."
  );
}

function renderMergeWorkspace(tool) {
  const files = getSelectedFiles();
  const canReorder = files.length > 1;
  const fragment = document.createDocumentFragment();

  const actionsSection = createWorkspaceSpecialSection("Atalhos de montagem", "Use estes controles para fechar a ordem final mais rápido.");
  const actions = document.createElement("div");
  actions.className = "workspace-special-actions";
  actions.append(
    createWorkspaceActionButton({
      label: "Inverter ordem",
      meta: "Troca o primeiro pelo ultimo",
      iconMarkup: getOrderReverseIcon(),
      onClick: reverseStagedFiles,
      disabled: !canReorder
    }),
    createWorkspaceActionButton({
      label: "Ordenar A-Z",
      meta: "Organiza pelos nomes",
      iconMarkup: getSortAscendingIcon(),
      onClick: () => sortStagedFilesByName("asc"),
      disabled: !canReorder
    })
  );
  actionsSection.body.append(actions);
  fragment.append(actionsSection.section);

  fragment.append(
    createWorkspaceInfoNote(
      "Dica rápida",
      "Use os atalhos acima para reorganizar mais rápido e mantenha a revisão visual apenas na grade central."
    )
  );

  return fragment;
}

function renderSplitWorkspace(tool) {
  const fragment = document.createDocumentFragment();
  const splitMode = readOptionFieldValue("splitMode") || "ranges";

  const modeSection = createWorkspaceSpecialSection("Escolha o tipo de corte", "Comece pelo modo e o resto da lateral se adapta ao que você selecionou.");
  const modeField = getToolOptionField(tool, "splitMode");
  if (modeField) {
    modeSection.body.append(createOptionFieldWrapper(tool, modeField));
  }
  fragment.append(modeSection.section);

  const detailsSection = createWorkspaceSpecialSection("Detalhes da divisão", "Mostramos apenas os campos necessários para o modo atual.");
  appendSpecializedField(detailsSection.body, tool, "ranges");
  appendSpecializedField(detailsSection.body, tool, "fixedRange");
  appendSpecializedField(detailsSection.body, tool, "removePages");
  appendSpecializedField(detailsSection.body, tool, "mergeAfter");
  detailsSection.body.append(getSplitModeWorkspaceNote());
  fragment.append(detailsSection.section);

  return fragment;
}

function renderImageToPdfWorkspace(tool) {
  const files = getSelectedFiles();
  const canReorder = files.length > 1;
  const fragment = document.createDocumentFragment();

  const actionsSection = createWorkspaceSpecialSection("Atalhos da montagem", "Organize as páginas do PDF visualmente antes de gerar o arquivo final.");
  const actions = document.createElement("div");
  actions.className = "workspace-special-actions";
  actions.append(
    createWorkspaceActionButton({
      label: "Inverter páginas",
      meta: "Troca capa e sequencia",
      iconMarkup: getOrderReverseIcon(),
      onClick: reverseStagedFiles,
      disabled: !canReorder
    }),
    createWorkspaceActionButton({
      label: "Ordenar A-Z",
      meta: "Ideal para lotes nomeados",
      iconMarkup: getSortAscendingIcon(),
      onClick: () => sortStagedFilesByName("asc"),
      disabled: !canReorder
    })
  );
  actionsSection.body.append(actions);
  fragment.append(actionsSection.section);

  const layoutSection = createWorkspaceSpecialSection("Layout do documento", "Ajuste como as imagens viram páginas sem sair do fluxo principal.");
  const layoutGrid = document.createElement("div");
  layoutGrid.className = "workspace-special-fields";
  appendSpecializedField(layoutGrid, tool, "imagePdfOrientation");
  appendSpecializedField(layoutGrid, tool, "imagePdfPageSize");
  appendSpecializedField(layoutGrid, tool, "imagePdfMargin");
  appendSpecializedField(layoutGrid, tool, "imagePdfMergeAfter");
  layoutSection.body.append(layoutGrid);
  fragment.append(layoutSection.section);

  fragment.append(
    createWorkspaceInfoNote(
      "Layout mais seguro",
      "Use retrato para documentos verticais e paisagem quando suas imagens forem mais largas. Revise a ordem apenas na grade central."
    )
  );

  return fragment;
}

function renderSpecializedWorkspace(tool) {
  if (!workspaceSpecialCard || !workspaceSpecialStack || !workspaceSpecialTitle || !workspaceSpecialCopy || !workspaceSpecialKicker) {
    return;
  }

  workspaceSpecialStack.innerHTML = "";

  if (!tool || !isSpecializedWorkspaceTool(tool) || stagedFiles.length === 0) {
    workspaceSpecialCard.hidden = true;
    return;
  }

  const copy = specializedWorkspaceCopy[tool.id];
  workspaceSpecialKicker.textContent = copy?.kicker ?? "Fluxo guiado";
  workspaceSpecialTitle.textContent = copy?.title ?? "Workspace especializado";
  workspaceSpecialCopy.textContent = copy?.copy ?? "Mostramos aqui os atalhos e ajustes que mais importam para esta operação.";

  if (tool.id === "pdf-merge") {
    workspaceSpecialStack.append(renderMergeWorkspace(tool));
  } else if (tool.id === "pdf-split") {
    workspaceSpecialStack.append(renderSplitWorkspace(tool));
  } else if (tool.id === "image-to-pdf") {
    workspaceSpecialStack.append(renderImageToPdfWorkspace(tool));
  }

  const revealUpgrade = isToolLocked(tool) && shouldRevealUpgradeContext(accessSession);
  workspaceSpecialStack.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("change", updateToolOptionVisibility);
    field.addEventListener("input", updateToolOptionVisibility);
  });
  applyToolOptionVisibilityState(workspaceSpecialCard);
  workspaceSpecialCard.classList.toggle("is-locked", revealUpgrade);
  if (revealUpgrade) {
    workspaceSpecialStack.prepend(
      createWorkspaceInfoNote(
        "Disponivel no plano Pro",
        "Esta lateral continua explicando o fluxo, mas os controles so liberam depois do upgrade.",
        "upgrade"
      )
    );
    workspaceSpecialCard.querySelectorAll("input, select, button").forEach((field) => {
      field.disabled = true;
    });
  }
  workspaceSpecialCard.hidden = false;
}

function renderToolOptions(tool) {
  if (!toolOptions) {
    return;
  }

  toolOptions.innerHTML = "";
  const fields = Array.isArray(tool.optionFields) ? tool.optionFields : [];

  if (fields.length === 0 || isSpecializedWorkspaceTool(tool)) {
    toolOptions.hidden = true;
    updateWorkspacePanels(tool);
    return;
  }

  toolOptions.hidden = false;
  const grid = document.createElement("div");
  grid.className = "tool-options-grid";

  fields.forEach((field) => {
    grid.append(createOptionFieldWrapper(tool, field));
  });

  toolOptions.append(grid);
  toolOptions.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("change", updateToolOptionVisibility);
    field.addEventListener("input", updateToolOptionVisibility);
  });
  updateToolOptionVisibility();
}

function selectToolFromSearch(tool) {
  if (activeFilter === "favorites" && !isFavorite(tool.id)) {
    activeFilter = "all";
  }

  if (activeFilter === "3d" && tool.category !== "3d") {
    activeFilter = "all";
  }

  searchInput.value = tool.label;
  searchQuery = tool.label;
  updateSearchClearButton();
  renderTools();
  hideSearchResults();
  navigateToTool(tool);
}

function renderSearchResults() {
  const matches = getSearchMatches();
  if (!searchQuery || !isSearchResultsOpen) {
    hideSearchResults();
    return;
  }

  searchResults.innerHTML = "";
  searchResults.hidden = false;

  if (matches.length === 0) {
    const empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "Nenhuma conversão encontrada.";
    searchResults.append(empty);
    return;
  }

  matches.forEach((tool) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "search-result-item";
    item.setAttribute("role", "option");
    item.setAttribute("aria-label", `Selecionar ${tool.label}`);

    const formats = getToolFormats(tool);

    const top = document.createElement("span");
    top.className = "search-result-top";

    const left = document.createElement("span");
    renderFormatBadge(formats.from, left, "tool-icon-from");

    const arrow = document.createElement("span");
    arrow.className = "search-result-arrow";
    arrow.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>';

    const right = document.createElement("span");
    renderFormatBadge(formats.to, right, "tool-icon-to");

    top.append(left, arrow, right);

    const title = document.createElement("strong");
    title.className = "search-result-title";
    title.textContent = tool.label;

    const meta = document.createElement("span");
    meta.className = "search-result-meta";
    meta.textContent = isPremiumTool(tool)
      ? "Desbloqueie no Pro"
      : isFavorite(tool.id)
        ? "Favorita"
        : "Conversão pronta";

    if (isPremiumTool(tool)) {
      const planMark = document.createElement("span");
      planMark.className = "search-result-plan";
      planMark.textContent = "Pro";
      item.append(planMark);
    }

    if (isFavorite(tool.id)) {
      const favoriteMark = document.createElement("span");
      favoriteMark.className = "search-result-star";
      favoriteMark.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3.5 2.8 5.67 6.27.91-4.53 4.42 1.07 6.25L12 17.8l-5.62 2.95 1.07-6.25L2.92 10.08l6.27-.91L12 3.5z"></path></svg>';
      item.append(favoriteMark);
    }

    item.append(top, title, meta);
    item.addEventListener("click", () => selectToolFromSearch(tool));
    searchResults.append(item);
  });
}

function applyActiveTool(toolId, options = {}) {
  const previousToolId = activeToolId;
  if (previousToolId) {
    storeCurrentToolOptions(tools.find((item) => item.id === previousToolId));
  }
  const {
    moveToUpload = false,
    resetFiles = previousToolId !== toolId,
    syncHistory = false,
    replaceHistory = false,
    syncSeo = true
  } = options;
  activeToolId = toolId;
  toolSelect.value = toolId;

  document.querySelectorAll(".tool-card").forEach((card) => {
    card.classList.toggle("active", document.body.dataset.pageMode === "tool" && card.dataset.toolId === toolId);
  });

  const tool = tools.find((item) => item.id === toolId);
  if (!tool) {
    return;
  }

  if (activeToolTitle) {
    activeToolTitle.textContent = tool.label;
  }
  if (activeToolDescription) {
    activeToolDescription.textContent = getToolDescription(tool);
  }
  applyToolTheme(tool);
  updateFavoriteButton(tool.id);
  updateFileInputConfig(tool, { reset: resetFiles });
  updateFileLabel();
  updateDropzonePrompt(tool);
  renderToolHelp(tool);
  renderToolFaq(tool);
  if (syncSeo) {
    syncSeoForTool(tool);
  }

  if (syncHistory) {
    syncToolHistory(tool, { replace: replaceHistory });
  }

  if (isToolLocked(tool)) {
    toolOptions.hidden = true;
    toolOptions.innerHTML = "";
  } else {
    renderToolOptions(tool);
  }

  const supportsTextLayout = tool.textLayoutSupport?.enabled;
  const showTextLayout = Boolean(supportsTextLayout) && !isToolLocked(tool);
  textLayoutField.hidden = !showTextLayout;
  textLayoutField.toggleAttribute("hidden", !showTextLayout);
  textLayoutField.setAttribute("aria-hidden", String(!showTextLayout));
  setTextLayoutEnabled(showTextLayout);

  if (showTextLayout) {
    const defaultMode = tool.textLayoutSupport.defaultMode ?? "blocks";
    setSelectedTextLayout(defaultMode);
    textLayoutHint.textContent =
      tool.id === "pdf-to-docx"
        ? "Blocos deixa o documento mais proximo do original. Linha por linha mantem as quebras do texto."
        : "Blocos deixa a leitura mais fluida. Linha por linha mantem cada quebra do texto.";
  } else {
    setSelectedTextLayout("blocks");
  }

  updateLockedToolState(tool);
  updateWorkspacePanels(tool);

  if (moveToUpload) {
    moveToUploadArea();
  }
}

function renderTools() {
  const visibleTools = getVisibleTools();
  const directoryState = getVisibleDirectoryTools(visibleTools);
  const toolsToRender = directoryState.tools;
  const isCollapsedDirectoryRow = Boolean(directoryState.canCollapse && !isToolDirectoryExpanded);
  toolGrid.innerHTML = "";
  updateToolTabs();
  updateToolbarCopy(visibleTools.length);
  toolEmpty.hidden = visibleTools.length > 0;
  updateToolDirectoryToggleState(directoryState);
  toolGrid.classList.toggle("is-collapsed-line", isCollapsedDirectoryRow);
  toolGrid.classList.toggle("is-expanded-grid", !isCollapsedDirectoryRow);
  toolGridWrap?.classList.toggle("is-collapsed-line", isCollapsedDirectoryRow);
  toolGridWrap?.classList.toggle("is-expanded-grid", !isCollapsedDirectoryRow);

  if (!activeToolId && visibleTools[0]) {
    activeToolId = visibleTools[0].id;
  } else if (visibleTools.length > 0 && !visibleTools.some((tool) => tool.id === activeToolId)) {
    activeToolId = visibleTools[0].id;
  }

  toolsToRender.forEach((tool) => {
    const fragment = toolTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".tool-card");
    const fromIcon = fragment.querySelector(".tool-icon-from");
    const toIcon = fragment.querySelector(".tool-icon-to");
    const label = fragment.querySelector(".tool-pill-label");
    const formats = getToolFormats(tool);

    card.dataset.toolId = tool.id;
    card.setAttribute("aria-label", `${tool.label}. Abrir envio de arquivo com essa conversão.`);
    card.title = tool.fileHint ?? tool.label;
    label.textContent = tool.label;
    card.classList.toggle("favorite", isFavorite(tool.id));
    renderFormatBadge(formats.from, fromIcon, "tool-icon-from");
    renderFormatBadge(formats.to, toIcon, "tool-icon-to");
    applyToolTheme(tool, card);

    card.addEventListener("click", () => navigateToTool(tool));
    toolGrid.append(fragment);
  });

  if (activeToolId) {
    applyActiveTool(activeToolId, { syncSeo: false });
  }
}

async function loadTools() {
  setToolsLoadingState(true);
  try {
    const response = await fetch("/api/tools");
    const payload = await response.json();
    runtimeConfig.maxFileSizeMB = Number(payload?.limits?.maxFileSizeMB ?? 0);
    tools = (payload.tools ?? []).map((tool, index) => ({
      ...tool,
      order: index
    }));

    const routeToolId = getRouteToolIdFromLocation();

    if (routeToolId && tools.some((tool) => tool.id === routeToolId)) {
      activeToolId = routeToolId;
    }

    renderTools();
    renderSearchResults();
    hasLoadedTools = true;

    if (routeToolId && tools.some((tool) => tool.id === routeToolId)) {
      const routeTool = tools.find((tool) => tool.id === routeToolId);
      applyActiveTool(routeToolId, { resetFiles: false, syncSeo: true, syncHistory: false });
      updatePageModeUi(routeTool);
      return;
    }

    syncSeoForTool(null);
    updatePageModeUi(null);
  } finally {
    setToolsLoadingState(false);
  }
}

function openBillingTarget(button) {
  const url = button?.dataset?.targetUrl ?? "";
  if (!url) {
    setBillingStatus("Adicione um link de pagamento ou suporte para liberar esse botao.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

async function handleBillingOfferClick(button) {
  const offerId = button?.dataset?.offerId ?? "";
  if (!offerId) {
    setBillingStatus("Escolha um plano válido para continuar.");
    return;
  }

  if (!isManagedCheckoutEnabled()) {
    openBillingTarget(button);
    return;
  }

  const previousLabel = button.textContent;
  billingMonthlyButton.disabled = true;
  billingYearlyButton.disabled = true;
  billingStarterButton.disabled = true;
  setBillingStatus("Preparando checkout seguro...", { toast: false });

  try {
    const payload = await startCheckout(offerId);
    if (!payload.checkoutUrl) {
      throw new Error("O checkout não retornou uma URL válida.");
    }

    if (payload.provider === "mercadopago") {
      storePendingCheckout(offerId);
      window.location.assign(payload.checkoutUrl);
      return;
    }

    openBillingTarget({
      dataset: {
        targetUrl: payload.checkoutUrl
      }
    });
  } catch (error) {
    setBillingStatus(error instanceof Error ? error.message : "Não foi possível abrir o checkout.");
  } finally {
    button.textContent = previousLabel;
    setConversionLifecycle("ready");
    updateAccessUi();
  }
}

async function resumeCheckoutIfNeeded() {
  const pendingCheckout = readPendingCheckout();
  const query = new URLSearchParams(window.location.search);
  const paymentId = query.get("payment_id") || query.get("collection_id") || "";
  const path = window.location.pathname;
  const isCheckoutPath = /^\/checkout\/(success|pending|failure)$/u.test(path);
  const shouldResumeCheckout = isCheckoutPath || Boolean(paymentId);

  if (!shouldResumeCheckout) {
    if (pendingCheckout) {
      clearPendingCheckout();
    }
    return;
  }

  if (path === "/checkout/failure" && !paymentId) {
    clearPendingCheckout();
    hideBillingModal();
    setBillingStatus("", { toast: false });
    setStatus("", { toast: false });
    window.history.replaceState({}, "", "/");
    return;
  }

  if (path === "/checkout/pending" && !paymentId) {
    clearPendingCheckout();
    hideBillingModal();
    setBillingStatus("", { toast: false });
    setStatus("", { toast: false });
    window.history.replaceState({}, "", "/");
    return;
  }

  setBillingStatus("Confirmando pagamento...", { toast: false });

  try {
    const payload = await confirmCheckoutReturn(paymentId);

    if (payload.status === "approved") {
      clearPendingCheckout();
      hideBillingModal();
      setBillingStatus("Pagamento aprovado. Seu acesso premium já foi liberado.", { toast: false });
      setStatus("Pagamento aprovado. Seu plano já está ativo.");
      const activeTool = getToolById();
      if (activeTool) {
        applyActiveTool(activeTool.id, { resetFiles: false });
      }
      if (isCheckoutPath) {
        window.history.replaceState({}, "", "/");
      }
      return;
    }

    if (payload.status === "pending") {
      clearPendingCheckout();
      hideBillingModal();
      setBillingStatus("", { toast: false });
      setStatus("", { toast: false });
      window.history.replaceState({}, "", "/");
      return;
    }
  } catch (error) {
    clearPendingCheckout();
    hideBillingModal();
    setBillingStatus("", { toast: false });
    setStatus("", { toast: false });
    if (isCheckoutPath) {
      window.history.replaceState({}, "", "/");
    }
  }
}

themeToggle?.addEventListener("click", toggleThemePreference);

reducedMotionQuery.addEventListener("change", () => {
  startSearchPlaceholderAnimation();
});

compactViewportQuery.addEventListener("change", syncResponsiveUi);
touchViewportQuery.addEventListener("change", syncResponsiveUi);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && isAccountAuthenticated()) {
    void refreshAccountWorkspaceData({ silent: true, toastNotifications: true }).catch(() => undefined);
  }
});

window.addEventListener("popstate", () => {
  if (!hasLoadedTools) {
    return;
  }

  const routeToolId = getRouteToolIdFromLocation();

  if (routeToolId && tools.some((tool) => tool.id === routeToolId)) {
    const routeTool = tools.find((tool) => tool.id === routeToolId);
    applyActiveTool(routeToolId, {
      moveToUpload: false,
      resetFiles: false,
      syncHistory: false,
      syncSeo: true
    });
    updatePageModeUi(routeTool);
    return;
  }

  syncSeoForTool(null);
  updatePageModeUi(null);
});

window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });

backToTopButton?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: getPreferredScrollBehavior()
  });
});

accountLauncher?.addEventListener("click", () => {
  if (isAccountAuthenticated()) {
    toggleAccountMenu();
    return;
  }

  showAccountModal({ focus: "login" });
});

openRedeemButton?.addEventListener("click", () => {
  showBillingModal({ focusCode: true, tool: getToolById() });
});

unlockToolButton?.addEventListener("click", () => {
  promptAccountPlanAccess(getToolById());
});

convertButton?.addEventListener("click", () => {
  showConversionModal(getToolById());
});

conversionModalCloseButton?.addEventListener("click", hideConversionModal);
conversionModalCancelButton?.addEventListener("click", hideConversionModal);
conversionModal?.addEventListener("click", (event) => {
  if (event.target?.dataset?.closeConversion === "true") {
    hideConversionModal();
  }
});
conversionConfirmButton?.addEventListener("click", async () => {
  await performConversion();
});

toolHelpButton?.addEventListener("click", () => {
  showToolHelpModal(getToolById());
});

toolHelpCloseButton?.addEventListener("click", hideToolHelpModal);
toolHelpModal?.addEventListener("click", (event) => {
  if (event.target?.dataset?.closeToolHelp === "true") {
    hideToolHelpModal();
  }
});

accessLogoutButton?.addEventListener("click", async () => {
  await logoutAccess();
  setStatus("Acesso premium encerrado neste navegador.", { toast: false });
});

billingCloseButton?.addEventListener("click", hideBillingModal);
billingModal?.addEventListener("click", (event) => {
  if (event.target?.dataset?.closeBilling === "true") {
    hideBillingModal();
  }
});
[
  accountRegisterCloseButton,
  accountLoginCloseButton,
  accountOverviewCloseButton,
  accountSubscriptionCloseButton,
  accountProfileCloseButton,
  accountSettingsCloseButton,
  accountVerificationCloseButton,
  adminPanelCloseButton
].forEach((button) => {
  button?.addEventListener("click", hideAccountModal);
});

accountPaneModals.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target?.dataset?.closeAccountPane === "true") {
      hideAccountModal();
    }
  });
});
document.addEventListener("click", (event) => {
  if (!accountPopover || accountPopover.hidden) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (accountPopover.contains(target) || accountLauncher?.contains(target)) {
    return;
  }

  hideAccountMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideConversionModal();
    hideToolHelpModal();
    hideAccountModal();
    hideBillingModal();
    hideAccountMenu();
  }
});

billingMonthlyButton?.addEventListener("click", () => handleBillingOfferClick(billingMonthlyButton));
billingYearlyButton?.addEventListener("click", () => handleBillingOfferClick(billingYearlyButton));
billingStarterButton?.addEventListener("click", () => handleBillingOfferClick(billingStarterButton));
billingSupportButton?.addEventListener("click", () => openBillingTarget(billingSupportButton));
accountSwitchToLoginButton?.addEventListener("click", () => showAccountModal({ focus: "login" }));
accountSwitchToRegisterButton?.addEventListener("click", () => showAccountModal({ focus: "register" }));
accountShortcutProfileButton?.addEventListener("click", () => showAccountModal({ focus: "profile" }));
accountShortcutSettingsButton?.addEventListener("click", () => showAccountModal({ focus: "settings" }));
accountShortcutAdminButton?.addEventListener("click", () => showAccountModal({ focus: "admin" }));
accountFileFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextFilter = normalizeAccountFileFilter(button.dataset.accountFileFilter);
    accountWorkspaceState.fileFilter = nextFilter;
    void fetchAccountFiles(nextFilter, 30).catch((error) => {
      setAccountStatus(error instanceof Error ? error.message : "Não foi possível filtrar seus arquivos.");
    });
  });
});
accountPopoverCloseButton?.addEventListener("click", hideAccountMenu);
accountMenuOverview?.addEventListener("click", () => {
  hideAccountMenu();
  showAccountModal({ focus: "close" });
});
accountMenuProfile?.addEventListener("click", () => {
  hideAccountMenu();
  showAccountModal({ focus: "profile" });
});
accountMenuSubscription?.addEventListener("click", () => {
  hideAccountMenu();
  showAccountModal({ focus: "subscription" });
});
accountMenuTheme?.addEventListener("click", () => {
  hideAccountMenu();
  toggleThemePreference();
});
accountMenuAdmin?.addEventListener("click", () => {
  hideAccountMenu();
  showAccountModal({ focus: "admin" });
});
accountMenuLogout?.addEventListener("click", async () => {
  hideAccountMenu();
  try {
    await logoutAccount();
    setStatus("Conta encerrada neste navegador.", { toast: false });
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Não foi possível sair da conta.");
  }
});
accountUpgradeButton?.addEventListener("click", () => {
  showBillingModal({ tool: getToolById() });
});
accountSubscriptionManageButton?.addEventListener("click", () => {
  showBillingModal({ tool: getToolById() });
});
accountLogoutButton?.addEventListener("click", async () => {
  try {
    await logoutAccount();
    setAccountStatus("Sua conta foi encerrada neste navegador.");
    hideAccountModal();
    setStatus("Conta encerrada neste navegador.", { toast: false });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível sair da conta.");
  }
});

accountRegisterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(accountRegisterForm);
  const input = {
    displayName: String(formData.get("displayName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? "")
  };

  setAccountStatus("Enviando o código para confirmar sua conta...", { toast: false });

  try {
    const payload = await registerAccount(input);
    setPendingVerification(payload.verification, {
      successMessage: "Conta confirmada com sucesso.",
      nextFocus: "overview"
    });
    setAccountStatus(`Codigo enviado para ${payload.verification.destination}.`, { toast: false });
    setStatus("Confira seu e-mail e confirme o código.");
    showAccountModal({ focus: "verify" });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível criar sua conta.");
  }
});

accountLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(accountLoginForm);
  const input = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? "")
  };

  setAccountStatus("Entrando na sua conta...", { toast: false });

  try {
    await loginAccount(input);
    accountLoginForm.reset();
    setAccountStatus("Conta carregada com sucesso.", { toast: false });
    setStatus("Conta conectada com sucesso.", { toast: false });
    showAccountModal({ focus: "overview" });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível entrar na conta.");
  }
});

accountProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(accountProfileForm);
  const input = {
    displayName: String(formData.get("displayName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    currentPassword: String(formData.get("currentPassword") ?? "").trim() || undefined
  };
  const currentEmail = String(getAccountState().user?.email ?? "").trim().toLowerCase();
  const nextEmail = input.email.toLowerCase();
  const changingEmail = Boolean(nextEmail && nextEmail !== currentEmail);

  setAccountStatus(changingEmail ? "Enviando código para confirmar o novo e-mail..." : "Salvando seus dados...", { toast: false });

  try {
    if (changingEmail) {
      const payload = await requestAccountEmailChange(input);
      setPendingVerification(payload.verification, {
        successMessage: "Novo e-mail confirmado com sucesso.",
        nextFocus: "profile"
      });
      setAccountStatus(`Codigo enviado para ${payload.verification.destination}.`, { toast: false });
      setStatus("Confira seu e-mail e confirme o código.");
      showAccountModal({ focus: "verify" });
      return;
    }

    await updateAccountProfile({
      displayName: input.displayName
    });
    setAccountStatus("Dados atualizados com segurança.", { toast: false });
    setStatus("Dados da conta atualizados.", { toast: false });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível salvar seus dados.");
  }
});

accountPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(accountPasswordForm);
  const input = {
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? "")
  };

  setAccountStatus("Enviando código para confirmar sua nova senha...", { toast: false });

  try {
    const payload = await updateAccountPassword(input);
    accountPasswordForm.reset();
    setPendingVerification(payload.verification, {
      successMessage: "Senha atualizada com sucesso.",
      nextFocus: "profile"
    });
    setAccountStatus(`Codigo enviado para ${payload.verification.destination}.`, { toast: false });
    setStatus("Confira seu e-mail e confirme o código.");
    showAccountModal({ focus: "verify" });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
  }
});

accountVerificationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingAccountVerification?.verification?.id) {
    setAccountStatus("Solicite um novo código para continuar.");
    return;
  }

  const formData = new FormData(accountVerificationForm);
  const code = String(formData.get("code") ?? "").trim();
  setAccountStatus("Conferindo o código...");

  try {
    if (pendingAccountVerification.purpose === "register") {
      await confirmAccountRegistration({
        verificationId: pendingAccountVerification.verification.id,
        code
      });
      accountRegisterForm?.reset();
    } else if (pendingAccountVerification.purpose === "email-change") {
      await confirmAccountEmailChange({
        verificationId: pendingAccountVerification.verification.id,
        code
      });
    } else {
      await confirmAccountPassword({
        verificationId: pendingAccountVerification.verification.id,
        code
      });
    }

    const successMessage = pendingAccountVerification.successMessage;
    const nextFocus = pendingAccountVerification.nextFocus ?? "overview";
    accountVerificationForm.reset();
    clearPendingVerification();
    setAccountStatus(successMessage, { toast: false });
    setStatus(successMessage);
    showAccountModal({ focus: nextFocus });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível confirmar o código.");
  }
});

accountVerificationResendButton?.addEventListener("click", async () => {
  if (!pendingAccountVerification?.verification?.id) {
    setAccountStatus("Não há nenhum código pendente para reenviar.");
    return;
  }

  setAccountStatus("Reenviando código...", { toast: false });
  try {
    const payload = await resendAccountVerification({
      verificationId: pendingAccountVerification.verification.id
    });
    setPendingVerification(payload.verification, pendingAccountVerification);
    setAccountStatus(`Novo código enviado para ${payload.verification.destination}.`);
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível reenviar o código.");
  }
});

[accountPopoverAvatarButton, accountAvatarPreview].forEach((avatarTrigger) => {
  avatarTrigger?.addEventListener("click", (event) => {
    event.preventDefault();
    if (!isAccountAuthenticated()) {
      showAccountModal({ focus: "login" });
      return;
    }

    if (avatarTrigger === accountPopoverAvatarButton) {
      hideAccountMenu();
      showAccountModal({ focus: "profile" });
    }

    toggleAvatarActionReveal(true);
    window.setTimeout(() => accountAvatarInput?.click(), 0);
  });
});

accountAvatarInput?.addEventListener("change", async () => {
  const [file] = Array.from(accountAvatarInput.files ?? []);
  if (!file) {
    return;
  }

  setAccountStatus("Atualizando sua foto de perfil...", { toast: false });

  try {
    await updateAccountAvatar(file);
    toggleAvatarActionReveal(true);
    setAccountStatus("Foto de perfil atualizada com sucesso.", { toast: false });
    setStatus("Foto de perfil atualizada.", { toast: false });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível atualizar a foto.");
  } finally {
    accountAvatarInput.value = "";
  }
});

accountAvatarRemoveButton?.addEventListener("click", async () => {
  setAccountStatus("Removendo sua foto de perfil...", { toast: false });

  try {
    await removeAccountAvatar();
    toggleAvatarActionReveal(false);
    setAccountStatus("Foto de perfil removida.", { toast: false });
    setStatus("Foto de perfil removida.", { toast: false });
  } catch (error) {
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível remover a foto.");
  }
});

adminRefreshUsersButton?.addEventListener("click", () => {
  void loadAdminPanel();
});

adminRefreshPromosButton?.addEventListener("click", () => {
  void loadAdminPanel();
});

adminTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAdminPane(button.dataset.adminPaneTarget || "account");
  });
});

adminUserSearchInput?.addEventListener("input", () => {
  adminState.search = String(adminUserSearchInput.value ?? "").trim();
  void loadAdminPanel();
});

adminUserProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!adminState.selectedUserId) {
    setAdminStatus("Selecione um usuário para editar.");
    return;
  }

  setAdminStatus("Salvando dados do usuário...");
  try {
    await updateAdminUserProfile(adminState.selectedUserId, {
      displayName: String(adminUserDisplayNameInput?.value ?? "").trim(),
      email: String(adminUserEmailInput?.value ?? "").trim()
    });
    setAdminStatus("Dados do usuário atualizados.");
  } catch (error) {
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível salvar os dados do usuário.");
  }
});

adminUserPlanForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!adminState.selectedUserId) {
    setAdminStatus("Selecione um usuário para atualizar o plano.");
    return;
  }

  setAdminStatus("Atualizando plano do usuário...");
  try {
    await updateAdminUserPlan(adminState.selectedUserId, {
      plan: String(adminUserPlanInput?.value ?? "free"),
      accessDays: Number(adminUserPlanDaysInput?.value ?? 30)
    });
    setAdminStatus("Plano do usuário atualizado.");
  } catch (error) {
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível atualizar o plano.");
  }
});

adminUserCreditsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!adminState.selectedUserId) {
    setAdminStatus("Selecione um usuário para atualizar os créditos.");
    return;
  }

  setAdminStatus("Atualizando créditos do usuário...");
  try {
    await updateAdminUserCredits(adminState.selectedUserId, {
      mode: String(adminUserCreditsModeInput?.value ?? "add"),
      amount: Number(adminUserCreditsAmountInput?.value ?? 0)
    });
    setAdminStatus("Creditos atualizados.");
  } catch (error) {
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível atualizar os créditos.");
  }
});

adminUserDiscountForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!adminState.selectedUserId) {
    setAdminStatus("Selecione um usuário para atualizar o desconto.");
    return;
  }

  setAdminStatus("Atualizando desconto do usuário...");
  try {
    await updateAdminUserDiscount(adminState.selectedUserId, {
      percent: Number(adminUserDiscountPercentInput?.value ?? 0),
      days: Number(adminUserDiscountDaysInput?.value ?? 0)
    });
    setAdminStatus("Desconto atualizado.");
  } catch (error) {
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível atualizar o desconto.");
  }
});

adminUserDeleteButton?.addEventListener("click", async () => {
  if (!adminState.selectedUserId || !adminState.selectedUser) {
    setAdminStatus("Selecione um usuário para remover.");
    return;
  }

  if (!window.confirm(`Remover a conta ${adminState.selectedUser.email}? Essa acao apaga dados, plano e pagamentos vinculados.`)) {
    return;
  }

  setAdminStatus("Removendo a conta...");
  try {
    await deleteAdminUser(adminState.selectedUserId);
    setAdminStatus("Conta removida com sucesso.");
  } catch (error) {
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível remover a conta.");
  }
});

adminPromoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(adminPromoForm);
  setAdminStatus("Criando código promocional...");

  try {
    const promo = await createAdminPromo({
      code: String(formData.get("code") ?? "").trim() || undefined,
      label: String(formData.get("label") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || undefined,
      creditAmount: Number(formData.get("creditAmount") ?? 0),
      discountPercent: Number(formData.get("discountPercent") ?? 0),
      discountDays: Number(formData.get("discountDays") ?? 0),
      accessDays: Number(formData.get("accessDays") ?? 0),
      accessPlan: String(formData.get("accessPlan") ?? "pro"),
      maxRedemptions: String(formData.get("maxRedemptions") ?? "").trim()
        ? Number(formData.get("maxRedemptions"))
        : null,
      perUserLimit: Number(formData.get("perUserLimit") ?? 1),
      expiresAt: String(formData.get("expiresAt") ?? "").trim() || null
    });
    adminPromoForm.reset();
    if (document.getElementById("admin-promo-access-plan")) {
      document.getElementById("admin-promo-access-plan").value = "pro";
    }
    if (document.getElementById("admin-promo-per-user")) {
      document.getElementById("admin-promo-per-user").value = "1";
    }
    setAdminStatus(`Codigo ${promo?.code ?? "promocional"} criado com sucesso.`);
  } catch (error) {
    setAdminStatus(error instanceof Error ? error.message : "Não foi possível criar o código.");
  }
});

redeemForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = String(redeemCodeInput?.value ?? "").trim();
  if (!code) {
    setBillingStatus("Cole um código válido para ativar seu acesso.");
    redeemCodeInput?.focus();
    return;
  }

  redeemSubmitButton.disabled = true;
  setBillingStatus("Ativando seu código...");

  try {
    await redeemAccessCode(code);
    redeemCodeInput.value = "";
    setBillingStatus("Código ativado com sucesso. Seu plano já foi atualizado.");
    setStatus("Plano Pro ativado neste navegador.");
    const activeTool = getToolById();
    if (activeTool) {
      applyActiveTool(activeTool.id);
    }
    window.setTimeout(() => {
      hideBillingModal();
    }, 900);
  } catch (error) {
    setBillingStatus(error instanceof Error ? error.message : "Não foi possível ativar o código.");
  } finally {
    redeemSubmitButton.disabled = false;
  }
});

favoriteToggle?.addEventListener("click", async () => {
  if (!activeToolId) {
    return;
  }

  const alreadyFavorite = isFavorite(activeToolId);
  if (isFavorite(activeToolId)) {
    favoriteToolIds.delete(activeToolId);
  } else {
    favoriteToolIds.add(activeToolId);
  }

  saveFavoriteToolIds();
  updateFavoriteButton(activeToolId);
  renderTools();
  renderSearchResults();

  if (!isAccountAuthenticated()) {
    return;
  }

  try {
    await updateAccountFavorites(Array.from(favoriteToolIds));
  } catch (error) {
    if (alreadyFavorite) {
      favoriteToolIds.add(activeToolId);
    } else {
      favoriteToolIds.delete(activeToolId);
    }
    saveFavoriteToolIds();
    updateFavoriteButton(activeToolId);
    renderTools();
    renderSearchResults();
    setAccountStatus(error instanceof Error ? error.message : "Não foi possível salvar os favoritos.");
  }
});

toolTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter ?? "all";
    isToolDirectoryExpanded = false;
    renderTools();
    renderSearchResults();
  });
});

searchInput.addEventListener("input", (event) => {
  searchQuery = event.currentTarget.value.trim();
  isSearchResultsOpen = searchQuery.length > 0;
  if (searchQuery.length > 0) {
    isToolDirectoryExpanded = false;
  }
  updateSearchClearButton();
  renderTools();
  renderSearchResults();
});

searchInput.addEventListener("focus", () => {
  if (searchHideTimer) {
    clearTimeout(searchHideTimer);
    searchHideTimer = null;
  }
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSearchResults();
    return;
  }

  if (event.key !== "Enter") {
    return;
  }

  const [firstMatch] = getSearchMatches(1);
  if (!firstMatch) {
    return;
  }

  event.preventDefault();
  selectToolFromSearch(firstMatch);
});

searchInput.addEventListener("blur", () => {
  searchHideTimer = window.setTimeout(() => {
    hideSearchResults();
  }, 120);
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  isSearchResultsOpen = false;
  isToolDirectoryExpanded = false;
  updateSearchClearButton();
  renderTools();
  hideSearchResults();
  searchInput.focus();
});

toolDirectoryToggle?.addEventListener("click", () => {
  isToolDirectoryExpanded = !isToolDirectoryExpanded;
  renderTools();
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragging");
});

dropzone.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  fileInput.click();
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragging");
});

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragging");
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) {
    return;
  }

  addStagedFiles(files, { append: Boolean(getToolById()?.allowsMultipleFiles) });
});

fileInput.addEventListener("change", () => {
  addStagedFiles(fileInput.files, { append: Boolean(getToolById()?.allowsMultipleFiles) });
});

function buildConversionFormData(toolId, files) {
  const formData = new FormData();
  formData.set("toolId", toolId);

  files.forEach((file) => {
    formData.append("file", file);
  });

  if (!textLayoutField.hidden) {
    formData.set("textLayout", getSelectedTextLayout());
  }

  form?.querySelectorAll("[data-option-name]").forEach((field) => {
    if (field.disabled || !field.name) {
      return;
    }

    if (field.type === "checkbox") {
      formData.set(field.name, field.checked ? "true" : "false");
      return;
    }

    const value = String(field.value ?? "").trim();
    if (value.length > 0) {
      formData.set(field.name, value);
    }
  });

  return formData;
}

async function performConversion() {
  let request;
  try {
    request = validateConversionRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível iniciar a conversão.";
    setConversionModalStatus(message);
    setStatus(message);
    return;
  }

  const { toolId, tool, files } = request;
  const shouldUseAsyncQueue = shouldQueueAsyncConversion(tool, files);
  hideConversionModal();
  const formData = buildConversionFormData(toolId, files);
  setConversionLifecycle("queued");
  setStatus("Enviando seu arquivo...");
  setProgress(4, "Preparando conversão...");
  showUploadProgress();
  setWorkspaceLoadingState(true, "Convertendo");
  if (conversionConfirmButton) {
    conversionConfirmButton.disabled = true;
  }

  try {
    if (shouldUseAsyncQueue) {
      const response = await fetch("/api/convert/async", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          ...internalClientHeader
        },
        body: formData
      });
      const payload = await response.json().catch(() => ({ message: "Falha inesperada." }));

      hideUploadProgress();
      if (!response.ok) {
        setProgress(0, "Falha na fila");
        throw new Error(payload.message ?? "Falha inesperada.");
      }

      setConversionLifecycle("processing");
      setProgress(86, "Arquivo enviado para a fila");
      await refreshAccessSession().catch(() => undefined);
      await refreshAccountWorkspaceData({ silent: true, toastNotifications: false }).catch(() => undefined);
      setStatus(payload.message ?? "Arquivo enviado. Você pode sair da página e voltar depois para baixar o resultado.");
      window.setTimeout(clearConversionLifecycle, 2600);
      return;
    }

    const response = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/convert");
      xhr.responseType = "blob";
      xhr.setRequestHeader("X-Vaptdoc-Client", "web");

      xhr.upload.addEventListener("progress", (uploadEvent) => {
        if (!uploadEvent.lengthComputable) {
          setProgress(18, "Enviando arquivo...");
          return;
        }

        const uploadProgress = 8 + (uploadEvent.loaded / uploadEvent.total) * 62;
        setProgress(uploadProgress, "Enviando arquivo...");
      });

      xhr.upload.addEventListener("load", () => {
        hideUploadProgress();
        setConversionLifecycle("processing");
        setProgress(74, "Processando conversão...");
      });

      xhr.addEventListener("load", () => {
        stopProgressAnimation();
        resolve(xhr);
      });

      xhr.addEventListener("error", () => {
        stopProgressAnimation();
        hideUploadProgress();
        reject(new Error("Falha de rede durante a conversão."));
      });

      xhr.addEventListener("abort", () => {
        stopProgressAnimation();
        hideUploadProgress();
        reject(new Error("Conversao cancelada."));
      });

      xhr.send(formData);
    });

    if (response.status < 200 || response.status >= 300) {
      const payload = await response.response.text().then((text) => {
        try {
          return JSON.parse(text);
        } catch {
          return { message: "Falha inesperada." };
        }
      });
      setProgress(0, "Falha na conversão");
      throw new Error(payload.message ?? "Falha inesperada.");
    }

    const blob = response.response;
    const contentDisposition = response.getResponseHeader("Content-Disposition") ?? "";
    const filename = extractDownloadFilename(contentDisposition);
    const accessPlan = response.getResponseHeader("X-Access-Plan");
    const accessRemaining = response.getResponseHeader("X-Access-Remaining");
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    if (accessPlan) {
      accessSession.plan = accessPlan;
      accessSession.premium = accessPlan !== "free";
    }
    if (accessRemaining) {
      accessSession.remainingToday = accessRemaining === "unlimited" ? null : Number(accessRemaining);
    }
    if (typeof accessSession.remainingToday === "number" && typeof accessSession.dailyLimit === "number") {
      accessSession.usedToday = Math.max(0, accessSession.dailyLimit - accessSession.remainingToday);
    }
    setConversionLifecycle("ready");
    updateAccessUi();
    setStatus("Conversao concluida. Download iniciado.");
    await refreshAccessSession().catch(() => undefined);
    await refreshAccountWorkspaceData({ silent: true, toastNotifications: false }).catch(() => undefined);
    window.setTimeout(clearConversionLifecycle, 2600);
  } catch (error) {
    stopProgressAnimation();
    hideUploadProgress();
    clearConversionLifecycle();
    const message = error instanceof Error ? error.message : "Não foi possível concluir a conversão.";
    if (/plano pro|premium|limite gratuito/iu.test(message)) {
      promptAccountPlanAccess(tool);
    }
    setConversionModalStatus(message);
    setStatus(message);
  } finally {
    hideUploadProgress();
    if (conversionConfirmButton) {
      conversionConfirmButton.disabled = false;
    }
    setWorkspaceLoadingState(false);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showConversionModal(getToolById());
});

initializeTheme();
syncDialogPresentationMode();
hideUploadProgress();
setProgress(0, "Aguardando arquivo");
updateSearchClearButton();
startSearchPlaceholderAnimation();
updateBackToTopVisibility();
updateAccessUi();
Promise.allSettled([loadTools(), refreshAccessSession()]).then((results) => {
  const [toolsResult, accessResult] = results;

  if (toolsResult.status === "rejected") {
    setStatus("Não foi possível carregar o catálogo de ferramentas.");
    return;
  }

  if (accessResult.status === "rejected") {
    updateAccessUi();
  } else if (isAccountAuthenticated()) {
    void refreshAccountWorkspaceData({ silent: true, toastNotifications: false }).catch(() => undefined);
  }

  void resumeCheckoutIfNeeded();
});
