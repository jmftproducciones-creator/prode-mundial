const WORLD_CUP_GROUPS = {
  A: ["Mexico", "Corea del Sur", "Sudafrica", "Republica Checa"],
  B: ["Canada", "Suiza", "Qatar", "Bosnia-Herzegovina"],
  C: ["Brasil", "Marruecos", "Escocia", "Haiti"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquia"],
  E: ["Alemania", "Ecuador", "Costa de Marfil", "Curazao"],
  F: ["Paises Bajos", "Japon", "Tunez", "Suecia"],
  G: ["Belgica", "Iran", "Egipto", "Nueva Zelanda"],
  H: ["Espana", "Uruguay", "Arabia Saudita", "Cabo Verde"],
  I: ["Francia", "Senegal", "Noruega", "Irak"],
  J: ["Argentina", "Austria", "Argelia", "Jordania"],
  K: ["Portugal", "Colombia", "Uzbekistan", "RD Congo"],
  L: ["Inglaterra", "Croacia", "Panama", "Ghana"]
};

const APP_CONFIG = {
  entryDeadline: "2026-06-11T12:00:00-03:00",
  liveResultsUrl: "/api/live-results"
};

function apiUrl(url) {
  if (!String(url || "").startsWith("/api/")) return url;
  return window.location.pathname.startsWith("/prode/")
    ? `/prode${url}`
    : url;
}

const FLAG_CODES = {
  "Mexico": "mx",
  "Corea del Sur": "kr",
  "Sudafrica": "za",
  "Republica Checa": "cz",
  "Canada": "ca",
  "Suiza": "ch",
  "Qatar": "qa",
  "Bosnia-Herzegovina": "ba",
  "Brasil": "br",
  "Marruecos": "ma",
  "Escocia": "gb-sct",
  "Haiti": "ht",
  "Estados Unidos": "us",
  "Paraguay": "py",
  "Australia": "au",
  "Turquia": "tr",
  "Alemania": "de",
  "Ecuador": "ec",
  "Costa de Marfil": "ci",
  "Curazao": "cw",
  "Paises Bajos": "nl",
  "Japon": "jp",
  "Tunez": "tn",
  "Suecia": "se",
  "Belgica": "be",
  "Iran": "ir",
  "Egipto": "eg",
  "Nueva Zelanda": "nz",
  "Espana": "es",
  "Uruguay": "uy",
  "Arabia Saudita": "sa",
  "Cabo Verde": "cv",
  "Francia": "fr",
  "Senegal": "sn",
  "Noruega": "no",
  "Irak": "iq",
  "Argentina": "ar",
  "Austria": "at",
  "Argelia": "dz",
  "Jordania": "jo",
  "Portugal": "pt",
  "Colombia": "co",
  "Uzbekistan": "uz",
  "RD Congo": "cd",
  "Inglaterra": "gb-eng",
  "Croacia": "hr",
  "Panama": "pa",
  "Ghana": "gh"
};

const THIRD_PLACE_SLOTS = {
  m74: ["A", "B", "C", "D", "F"],
  m77: ["C", "D", "F", "G", "H"],
  m79: ["C", "E", "F", "H", "I"],
  m80: ["E", "H", "I", "J", "K"],
  m81: ["B", "E", "F", "I", "J"],
  m82: ["A", "E", "H", "I", "J"],
  m85: ["A", "C", "D", "E", "F"],
  m87: ["E", "F", "G", "I", "J"]
};

const R32_MATCHES = [
  ["m73", "2A", "2B"],
  ["m74", "1E", "3*"],
  ["m75", "1F", "2C"],
  ["m76", "1C", "2F"],
  ["m77", "1I", "3*"],
  ["m78", "2E", "2I"],
  ["m79", "1A", "3*"],
  ["m80", "1L", "3*"],
  ["m81", "1D", "3*"],
  ["m82", "1G", "3*"],
  ["m83", "2K", "2L"],
  ["m84", "1H", "2J"],
  ["m85", "1B", "3*"],
  ["m86", "1J", "2H"],
  ["m87", "1K", "3*"],
  ["m88", "2D", "2G"]
];

const GROUP_MATCHDAY_FIXTURES = {
  group1: [[0, 1], [2, 3]],
  group2: [[0, 2], [1, 3]],
  group3: [[0, 3], [1, 2]]
};

const GROUP_MATCHDAY_DATES = {
  group1: ["11 de Jun", "12 de Jun", "13 de Jun", "14 de Jun", "15 de Jun", "16 de Jun", "17 de Jun", "18 de Jun", "19 de Jun", "20 de Jun", "21 de Jun", "22 de Jun"],
  group2: ["18 de Jun", "19 de Jun", "20 de Jun", "21 de Jun", "22 de Jun", "23 de Jun", "24 de Jun", "25 de Jun", "26 de Jun", "27 de Jun", "28 de Jun", "29 de Jun"],
  group3: ["24 de Jun", "25 de Jun", "26 de Jun", "27 de Jun", "28 de Jun", "29 de Jun", "30 de Jun", "1 de Jul", "2 de Jul", "3 de Jul", "4 de Jul", "5 de Jul"]
};

const GROUP_MATCH_TIMES = ["16:00", "22:00"];
const STADIUM_ROTATION = [
  "Estadio Ciudad de Mexico",
  "Estadio Guadalajara",
  "Estadio Toronto",
  "Estadio Los Angeles",
  "Estadio Bahia de San Francisco",
  "Estadio Nueva York Nueva Jersey",
  "Estadio Boston",
  "Estadio BC Place Vancouver",
  "Estadio Houston",
  "Estadio Dallas",
  "Estadio Filadelfia",
  "Estadio Monterrey",
  "Estadio Atlanta",
  "Estadio Seattle",
  "Estadio Miami",
  "Estadio Kansas City"
];

const KNOCKOUT_SCHEDULE = {
  m73: { number: 73, date: "28 de Jun", venue: "Estadio Los Angeles" },
  m74: { number: 74, date: "29 de Jun", venue: "Estadio Boston" },
  m75: { number: 75, date: "29 de Jun", venue: "Estadio Monterrey" },
  m76: { number: 76, date: "29 de Jun", venue: "Estadio Houston" },
  m77: { number: 77, date: "30 de Jun", venue: "Estadio Nueva York Nueva Jersey" },
  m78: { number: 78, date: "30 de Jun", venue: "Estadio Dallas" },
  m79: { number: 79, date: "30 de Jun", venue: "Estadio Ciudad de Mexico" },
  m80: { number: 80, date: "1 de Jul", venue: "Estadio Atlanta" },
  m81: { number: 81, date: "1 de Jul", venue: "Estadio Bahia de San Francisco" },
  m82: { number: 82, date: "1 de Jul", venue: "Estadio Seattle" },
  m83: { number: 83, date: "2 de Jul", venue: "Estadio Toronto" },
  m84: { number: 84, date: "2 de Jul", venue: "Estadio Los Angeles" },
  m85: { number: 85, date: "2 de Jul", venue: "Estadio BC Place Vancouver" },
  m86: { number: 86, date: "3 de Jul", venue: "Estadio Miami" },
  m87: { number: 87, date: "3 de Jul", venue: "Estadio Kansas City" },
  m88: { number: 88, date: "3 de Jul", venue: "Estadio Dallas" },
  m89: { number: 89, date: "4 de Jul", venue: "Estadio Filadelfia" },
  m90: { number: 90, date: "4 de Jul", venue: "Estadio Houston" },
  m91: { number: 91, date: "5 de Jul", venue: "Estadio Nueva York Nueva Jersey" },
  m92: { number: 92, date: "5 de Jul", venue: "Estadio Ciudad de Mexico" },
  m93: { number: 93, date: "6 de Jul", venue: "Estadio Dallas" },
  m94: { number: 94, date: "6 de Jul", venue: "Estadio Seattle" },
  m95: { number: 95, date: "7 de Jul", venue: "Estadio Atlanta" },
  m96: { number: 96, date: "7 de Jul", venue: "Estadio BC Place Vancouver" },
  m97: { number: 97, date: "9 de Jul", venue: "Estadio Boston" },
  m98: { number: 98, date: "10 de Jul", venue: "Estadio Los Angeles" },
  m99: { number: 99, date: "11 de Jul", venue: "Estadio Miami" },
  m100: { number: 100, date: "11 de Jul", venue: "Estadio Kansas City" },
  m101: { number: 101, date: "14 de Jul", venue: "Estadio Dallas" },
  m102: { number: 102, date: "15 de Jul", venue: "Estadio Atlanta" },
  m103: { number: 103, date: "18 de Jul", venue: "Estadio Miami" },
  m104: { number: 104, date: "19 de Jul", venue: "Estadio Nueva York Nueva Jersey" }
};

const MATCH_SCHEDULE = buildMatchSchedule();

const GROUP_PHASE_IDS = Object.keys(GROUP_MATCHDAY_FIXTURES);

const LATER_ROUNDS = {
  r16: [
    ["m89", "G73", "G74"], ["m90", "G75", "G76"], ["m91", "G77", "G78"], ["m92", "G79", "G80"],
    ["m93", "G81", "G82"], ["m94", "G83", "G84"], ["m95", "G85", "G86"], ["m96", "G87", "G88"]
  ],
  qf: [["m97", "G89", "G90"], ["m98", "G91", "G92"], ["m99", "G93", "G94"], ["m100", "G95", "G96"]],
  sf: [["m101", "G97", "G98"], ["m102", "G99", "G100"]],
  third: [["m103", "P101", "P102"]],
  final: [["m104", "G101", "G102"]]
};

const ALL_BRACKET_MATCHES = [
  ...R32_MATCHES,
  ...LATER_ROUNDS.r16,
  ...LATER_ROUNDS.qf,
  ...LATER_ROUNDS.sf,
  ...LATER_ROUNDS.third,
  ...LATER_ROUNDS.final
];

const state = {
  prediction: createEmptyTournament(),
  real: createEmptyTournament(),
  live: { updatedAt: "", source: "", matches: [] },
  tournaments: [],
  templates: [],
  phases: [],
  currentMode: "date",
  currentPhaseId: "group1",
  tenant: null,
  tenantId: "",
  companySession: null,
  globalSession: null,
  lobbyTournaments: [],
  lobbyTemplates: [],
  pendingUnlockTournamentId: "",
  tenantAccessGranted: false,
  globalGames: null,
  dailyGamePlays: {},
  leaderboardArea: "",
  adminKey: "",
  adminUnlocked: false,
  currentView: "inicio",
  adminSection: "users",
  defaultScoring: {
    groupPosition: 1,
    knockoutWinner: 3,
    exactScore: 2,
    champion: 10
  },
  currentTournamentId: "global",
  inviteHandled: false
};

function initialTenantId() {
  const params = new URLSearchParams(window.location.search);
  const pathMatch = window.location.pathname.match(/(?:^|\/)(?:prode\/)?empresa\/([^/]+)/);
  return pathMatch ? decodeURIComponent(pathMatch[1]) : params.get("empresa") || params.get("tenant") || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 34);
}

function tenantQuery() {
  return state.tenantId ? `tenant=${encodeURIComponent(state.tenantId)}` : "";
}

function companySessionKey() {
  return `companySession:${state.tenantId || "global"}`;
}

function globalSessionKey() {
  return "globalSession";
}

function tenantTournamentId(tenantId = state.tenantId) {
  return tenantId ? `empresa-${tenantId}` : "";
}

function loadStoredGlobalSession() {
  try {
    const session = JSON.parse(localStorage.getItem(globalSessionKey()) || "null");
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
}

function saveGlobalSession(session) {
  state.globalSession = session;
  localStorage.setItem(globalSessionKey(), JSON.stringify(session));
}

function clearGlobalSession() {
  localStorage.removeItem(globalSessionKey());
  state.globalSession = null;
}

function loadStoredCompanySession() {
  if (!state.tenantId) return null;
  try {
    const session = JSON.parse(localStorage.getItem(companySessionKey()) || "null");
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
}

function saveCompanySession(session) {
  if (!state.tenantId) return;
  state.companySession = session;
  localStorage.setItem(companySessionKey(), JSON.stringify(session));
}

function clearCompanySession() {
  if (state.tenantId) localStorage.removeItem(companySessionKey());
  state.companySession = null;
}

function isAdminSession() {
  return Boolean(state.companySession?.user?.isAdmin);
}

function isGlobalAdminSession() {
  return Boolean(state.globalSession?.user?.isAdmin || state.globalSession?.user?.isSuperAdmin);
}

function canUseAdminPanel() {
  return isAdminSession() || (state.tenantAccessGranted && isGlobalAdminSession()) || state.adminUnlocked;
}

function syncAdminNavigation() {
  document.querySelectorAll("[data-admin-tab]").forEach(tab => {
    tab.hidden = !canUseAdminPanel();
  });
  const resultsButton = document.getElementById("toggleResultsAdmin");
  if (resultsButton) resultsButton.hidden = !canUseAdminPanel();
}

function syncTenantNavigation() {
  const isTenantPage = Boolean(state.tenantId);
  const showAccessLobby = false;
  const lobbyTab = document.querySelector('.tab[data-view="lobby"]');
  const tournamentsTab = document.querySelector('.tab[data-view="tournaments"]');
  const lobbyView = document.getElementById("lobby");
  if (lobbyTab) lobbyTab.hidden = isTenantPage && state.tenantAccessGranted;
  if (tournamentsTab) tournamentsTab.hidden = !isTenantPage;
  const globalLogin = document.getElementById("globalLogin");
  const globalSession = document.getElementById("globalSession");
  const globalLobby = document.getElementById("globalTournamentLobby");
  const createGlobalModal = document.getElementById("createGlobalUserModal");
  const unlockModal = document.getElementById("unlockTournamentModal");
  document.body.dataset.authGate = !isTenantPage && !state.globalSession?.token ? "global" : "";
  if (isTenantPage && state.tenantAccessGranted) {
    if (lobbyView) {
      lobbyView.hidden = true;
      lobbyView.classList.remove("is-visible");
    }
    if (globalLogin) globalLogin.hidden = true;
    if (globalSession) globalSession.hidden = true;
    if (globalLobby) globalLobby.innerHTML = "";
    if (createGlobalModal) createGlobalModal.hidden = true;
    if (unlockModal) unlockModal.hidden = true;
    if (state.currentView === "lobby") {
      state.currentView = "predictor";
      document.querySelectorAll(".tab").forEach(item => item.classList.remove("is-active"));
      document.querySelectorAll(".view").forEach(item => item.classList.remove("is-visible"));
      document.querySelector('.tab[data-view="predictor"]')?.classList.add("is-active");
      document.getElementById("predictor")?.classList.add("is-visible");
    }
  } else if (lobbyView) {
    lobbyView.hidden = false;
    if (showAccessLobby && state.currentView !== "lobby") {
      state.currentView = "lobby";
      document.querySelectorAll(".tab").forEach(item => item.classList.remove("is-active"));
      document.querySelectorAll(".view").forEach(item => item.classList.remove("is-visible"));
      document.querySelector('.tab[data-view="lobby"]')?.classList.add("is-active");
      lobbyView.classList.add("is-visible");
    }
  }
}

function updateAdminSections(section = state.adminSection || "users") {
  state.adminSection = section;
  const usersPanel = document.getElementById("adminUsersPanel");
  const resultsPanel = document.getElementById("adminResultsPanel");
  const customizePanel = document.getElementById("adminCustomizePanel");
  const gamesPanel = document.getElementById("adminGamesPanel");
  if (usersPanel) usersPanel.hidden = section !== "users";
  if (resultsPanel) resultsPanel.hidden = section !== "results";
  if (customizePanel) customizePanel.hidden = section !== "customize";
  if (gamesPanel) gamesPanel.hidden = section !== "games";
  document.querySelectorAll(".admin-subtab").forEach(tab => {
    tab.classList.toggle("is-active", tab.dataset.adminSection === section);
  });
}

function addTenantToUrl(url) {
  if (!state.tenantId) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${tenantQuery()}`;
}

function applyTenantTheme(tenant) {
  if (!tenant) return;
  state.tenant = tenant;
  state.tenantId = tenant.id;
  document.body.dataset.tenant = tenant.id;
  const root = document.documentElement;
  const theme = tenant.theme || {};
  const vars = {
    bg: "--bg",
    ink: "--ink",
    muted: "--muted",
    line: "--line",
    panel: "--panel",
    accent: "--accent",
    accent2: "--accent-2",
    gold: "--gold",
    blue: "--blue",
    tintRgb: "--tenant-tint-rgb"
  };
  Object.entries(vars).forEach(([key, cssVar]) => {
    if (theme[key]) root.style.setProperty(cssVar, theme[key]);
  });
  if (theme.image) root.style.setProperty("--tenant-image", `url("${theme.image}")`);
  const eyebrow = document.getElementById("brandEyebrow");
  const title = document.getElementById("brandTitle");
  const description = document.getElementById("brandDescription");
  if (eyebrow) eyebrow.textContent = tenant.eyebrow || tenant.name;
  if (title) title.textContent = tenant.title || tenant.name;
  if (description) {
    description.hidden = !tenant.description;
    description.textContent = tenant.description || "";
  }
  const tournamentsHeading = document.getElementById("tournamentsHeading");
  const tournamentsIntro = document.getElementById("tournamentsIntro");
  if (tournamentsHeading) tournamentsHeading.textContent = "Torneos de empresa";
  if (tournamentsIntro) tournamentsIntro.textContent = `Tabla global de ${tenant.name} y minitorneos por area con las mismas predicciones.`;
  document.title = tenant.title || tenant.name;
  state.companySession = loadStoredCompanySession();
  if (state.companySession?.user) {
    document.getElementById("playerName").value = state.companySession.user.name || "";
    document.getElementById("playerEmail").value = state.companySession.user.email || "";
  }
  renderCompanyAuth();
  syncTenantNavigation();
  renderCompanyAreas();
  renderDailyGames();
  fillAdminThemeForm();
  fillAdminGamesForm();
}

async function refreshCompanySession() {
  if (!state.tenantId || !state.companySession?.token) return;
  try {
    const params = new URLSearchParams({
      tenant: state.tenantId,
      sessionToken: state.companySession.token
    });
    const data = await apiJson(`/api/company-session?${params.toString()}`);
    state.tenant = data.tenant || state.tenant;
    state.dailyGamePlays = data.dailyGamePlays || {};
    saveCompanySession({ token: state.companySession.token, user: data.user });
    document.getElementById("playerName").value = data.user.name || "";
    document.getElementById("playerEmail").value = data.user.email || "";
    state.leaderboardArea = data.user.area || state.leaderboardArea;
  } catch {
    clearCompanySession();
    state.dailyGamePlays = {};
  }
  renderCompanyAuth();
  renderCompanyAreas();
  renderDailyGames();
}

function renderCompanyAuth() {
  const panel = document.getElementById("companyLogin");
  if (!panel) return;
  const session = state.companySession;
  panel.hidden = !state.tenantId || Boolean(session) || state.tenantAccessGranted || state.currentView !== "predictor";
  const topbarSessionAction = document.getElementById("topbarSessionAction");
  if (topbarSessionAction) {
    topbarSessionAction.hidden = !state.tenantId;
    topbarSessionAction.textContent = session ? "Cerrar sesion" : "Ingresar";
  }
  syncAdminNavigation();
  const sessionPanel = document.getElementById("companySession");
  const sessionText = document.getElementById("companySessionText");
  const visibleUser = session?.user || (state.tenantAccessGranted ? state.globalSession?.user : null);
  if (sessionPanel) sessionPanel.hidden = !state.tenantId || !visibleUser;
  if (sessionText && visibleUser) {
    const user = visibleUser;
    sessionText.textContent = `${user.name || user.email} - ${session?.user?.area || state.tenant?.name || "Empresa"}${session?.user?.isAdmin ? " - Admin" : ""}`;
  }
  const form = document.getElementById("companyLoginForm");
  const areaList = document.getElementById("companyAreaOptions");
  if (areaList) {
    areaList.innerHTML = (state.tenant?.areas || []).map(area => `<option value="${area}"></option>`).join("");
  }
  if (form) form.hidden = false;
  const playerName = document.getElementById("playerName");
  const playerEmail = document.getElementById("playerEmail");
  if (playerName) playerName.readOnly = Boolean(state.tenantId && session);
  if (playerEmail) playerEmail.readOnly = Boolean(state.tenantId && session);
  document.querySelectorAll("[data-session-field]").forEach(field => {
    field.hidden = true;
  });
  document.querySelectorAll("[data-user-context-field]").forEach(field => {
    field.hidden = true;
  });
}

function logoutCompanyUser() {
  clearCompanySession();
  state.dailyGamePlays = {};
  const playerName = document.getElementById("playerName");
  const playerEmail = document.getElementById("playerEmail");
  if (playerName) {
    playerName.value = "";
    playerName.readOnly = false;
  }
  if (playerEmail) {
    playerEmail.value = "";
    playerEmail.readOnly = false;
  }
  renderCompanyAuth();
  renderCompanyAreas();
  syncAdminNavigation();
  openView("predictor");
  document.getElementById("companyLogin")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderGlobalLobby() {
  const loginPanel = document.getElementById("globalLogin");
  const sessionPanel = document.getElementById("globalSession");
  const sessionText = document.getElementById("globalSessionText");
  const list = document.getElementById("globalTournamentLobby");
  const adminActions = document.getElementById("lobbyAdminActions");
  const session = state.globalSession;
  syncTenantNavigation();
  if (loginPanel) loginPanel.hidden = Boolean(session);
  if (sessionPanel) sessionPanel.hidden = !session;
  if (sessionText && session?.user) sessionText.textContent = `${session.user.name || session.user.email} - sesion global`;
  if (adminActions) adminActions.hidden = !isGlobalAdminSession();
  if (!list) return;
  list.hidden = !session;
  document.querySelector("#lobby > .section-head")?.toggleAttribute("hidden", !session);
  if (!session) {
    list.innerHTML = "";
    return;
  }
  const templateSelect = document.getElementById("createLobbyTenantTemplate");
  if (templateSelect && state.lobbyTemplates?.length) {
    templateSelect.innerHTML = state.lobbyTemplates
      .map(template => `<option value="${escapeHtml(template.id)}">${escapeHtml(template.name)}</option>`)
      .join("");
  }
  if (!state.lobbyTournaments.length) {
    list.innerHTML = `<p class="empty">Cargando torneos...</p>`;
    return;
  }
  list.innerHTML = state.lobbyTournaments.map(tournament => {
    const action = tournament.hasAccess
      ? `<a class="button-link secondary" href="${tournament.tenantPath || "/"}" data-lobby-open="${escapeHtml(tournament.id)}">${tournament.isGlobal ? "Abrir prode" : "Entrar"}</a>`
      : `<button class="secondary unlock-tournament" type="button" data-tournament-id="${escapeHtml(tournament.id)}">Desbloquear</button>`;
    return `
      <article class="tournament-card lobby-card ${tournament.hasAccess ? "is-open" : "is-locked"}">
        <div>
          <small>${escapeHtml(tournament.lockedLabel || "")}</small>
          <h3>${escapeHtml(tournament.name)}</h3>
          <p>${escapeHtml(tournament.isGlobal ? "Torneo principal publico" : `Cliente privado${tournament.tenantName ? ` - ${tournament.tenantName}` : ""}`)}</p>
        </div>
        <div class="tournament-actions">
          <strong>${Number(tournament.players || 0)} jugadores</strong>
          ${action}
        </div>
      </article>
    `;
  }).join("");
  list.querySelectorAll(".unlock-tournament").forEach(button => {
    button.addEventListener("click", () => unlockTournament(button.dataset.tournamentId));
  });
}

async function loadGlobalLobby() {
  const params = new URLSearchParams();
  if (state.globalSession?.token) params.set("sessionToken", state.globalSession.token);
  const data = await apiJson(`/api/tournament-lobby?${params.toString()}`);
  if (data.user && state.globalSession?.token) saveGlobalSession({ token: state.globalSession.token, user: data.user });
  state.lobbyTournaments = data.tournaments || [];
  state.lobbyTemplates = data.templates || [];
  if (state.tenantId) {
    const currentTenantTournament = state.lobbyTournaments.find(item => item.id === tenantTournamentId());
    state.tenantAccessGranted = Boolean(currentTenantTournament?.hasAccess);
    if (state.tenantAccessGranted) {
      state.currentTournamentId = currentTenantTournament.id;
      if (state.globalSession?.user) {
        document.getElementById("playerName").value = state.globalSession.user.name || "";
        document.getElementById("playerEmail").value = state.globalSession.user.email || "";
      }
      openView("predictor");
    }
  }
  renderGlobalLobby();
}

async function refreshGlobalSession() {
  state.globalSession = loadStoredGlobalSession();
  if (!state.globalSession?.token) {
    renderGlobalLobby();
    loadGlobalGames().catch(() => renderDailyGames());
    return;
  }
  try {
    const data = await apiJson(`/api/global-session?sessionToken=${encodeURIComponent(state.globalSession.token)}`);
    saveGlobalSession({ token: state.globalSession.token, user: data.user });
  } catch {
    clearGlobalSession();
  }
  renderGlobalLobby();
  loadGlobalGames().catch(() => renderDailyGames());
}

async function loginGlobalUser({ name, email, password }) {
  const data = await apiJson("/api/global-login", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
  saveGlobalSession({ token: data.token, user: data.user });
  state.lobbyTournaments = data.tournaments || [];
  state.lobbyTemplates = data.templates || state.lobbyTemplates || [];
  renderGlobalLobby();
  loadGlobalGames().catch(() => renderDailyGames());
  return data.user;
}

async function createLobbyTenant(payload) {
  const data = await apiJson("/api/lobby-tenant", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      sessionToken: state.globalSession?.token || ""
    })
  });
  if (data.tournament) {
    const index = state.lobbyTournaments.findIndex(item => item.id === data.tournament.id);
    if (index >= 0) state.lobbyTournaments[index] = data.tournament;
    else state.lobbyTournaments.push(data.tournament);
  }
  renderGlobalLobby();
  return data;
}

async function unlockTournament(tournamentId) {
  if (!state.globalSession?.token) {
    openView("lobby");
    return;
  }
  const tournament = state.lobbyTournaments.find(item => item.id === tournamentId);
  state.pendingUnlockTournamentId = tournamentId;
  const modal = document.getElementById("unlockTournamentModal");
  const title = document.getElementById("unlockTournamentTitle");
  const intro = document.getElementById("unlockTournamentIntro");
  const passwordInput = document.getElementById("unlockTournamentPassword");
  const status = document.getElementById("unlockTournamentStatus");
  if (title) title.textContent = `Desbloquear ${tournament?.name || "torneo"}`;
  if (intro) intro.textContent = "Ingresa la clave una sola vez. El permiso queda guardado para tu usuario.";
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  if (passwordInput) passwordInput.value = "";
  if (modal) {
    modal.hidden = false;
    setTimeout(() => passwordInput?.focus(), 0);
  }
}

async function submitTournamentUnlock() {
  const tournamentId = state.pendingUnlockTournamentId;
  const passwordInput = document.getElementById("unlockTournamentPassword");
  const password = passwordInput?.value.trim() || "";
  const status = document.getElementById("unlockTournamentStatus");
  if (!tournamentId) return;
  if (!password) {
    if (status) {
      status.hidden = false;
      status.textContent = "Ingresa la clave del torneo.";
    }
    return;
  }
  if (status) {
    status.hidden = false;
    status.textContent = "Validando clave...";
  }
  try {
    const data = await apiJson("/api/tournament-access", {
      method: "POST",
      body: JSON.stringify({ sessionToken: state.globalSession.token, tournamentId, password })
    });
    const index = state.lobbyTournaments.findIndex(item => item.id === data.tournament?.id);
    if (index >= 0) state.lobbyTournaments[index] = data.tournament;
    renderGlobalLobby();
    document.getElementById("unlockTournamentModal").hidden = true;
    state.pendingUnlockTournamentId = "";
    if (status) {
      status.hidden = false;
      status.textContent = `Acceso habilitado para ${data.tournament?.name || "el torneo"}.`;
    }
  } catch (error) {
    if (status) {
      status.hidden = false;
      status.textContent = `No se pudo desbloquear: ${error.message}`;
    }
  }
}


function renderCompanyAreas() {
  const section = document.getElementById("companyAreas");
  const list = document.getElementById("companyAreaList");
  if (!section || !list) return;
  section.hidden = !state.tenantId;
  const areas = state.tenant?.areas || [];
  const currentArea = state.companySession?.user?.area || areas[0] || "";
  list.innerHTML = [
    `<article class="tournament-card">
      <div>
        <h3>Tabla global</h3>
        <p>Todos los usuarios de ${state.tenant?.name || "la empresa"}</p>
      </div>
      <div class="tournament-actions">
        <button class="secondary view-company-leaderboard" type="button" data-area="">Ver tabla</button>
      </div>
    </article>`,
    ...areas.map(area => `
      <article class="tournament-card">
        <div>
          <h3>${area}</h3>
          <p>Minitorneo del area</p>
        </div>
        <div class="tournament-actions">
          <button class="secondary view-company-leaderboard" type="button" data-area="${area}">Ver tabla</button>
        </div>
      </article>
    `)
  ].join("");
  list.querySelectorAll(".view-company-leaderboard").forEach(button => {
    button.addEventListener("click", () => {
      state.leaderboardArea = button.dataset.area || "";
      openTournamentLeaderboard(state.currentTournamentId);
    });
  });
  if (!state.leaderboardArea && currentArea) state.leaderboardArea = currentArea;
}

function todayGameIndex(length) {
  if (!length) return 0;
  return Math.floor(Date.now() / 86400000) % length;
}

function todayGameKey() {
  return new Date().toISOString().slice(0, 10);
}

function scheduledDailyItem(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return list.find(item => item.date === todayGameKey()) || list[todayGameIndex(list.length)] || null;
}

function dailyProgressKey(gameType, itemId) {
  const email = state.companySession?.user?.email || state.globalSession?.user?.email || "guest";
  return `dailyGameProgress:${state.tenantId || "global"}:${email}:${todayGameKey()}:${gameType}:${itemId || "default"}`;
}

function readDailyProgress(gameType, itemId) {
  try {
    return JSON.parse(localStorage.getItem(dailyProgressKey(gameType, itemId)) || "{}");
  } catch {
    return {};
  }
}

function writeDailyProgress(gameType, itemId, progress) {
  localStorage.setItem(dailyProgressKey(gameType, itemId), JSON.stringify(progress || {}));
}

function clearDailyProgress(gameType, itemId) {
  localStorage.removeItem(dailyProgressKey(gameType, itemId));
}

function normalizeGuess(value) {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function teamColor(team) {
  const colors = {
    argentina: ["#75aadb", "#ffffff", "stripes"],
    francia: ["#1f4f9a", "#ffffff", "solid"],
    brasil: ["#f7d917", "#1d7a4f", "solid"],
    mexico: ["#1d7a4f", "#ffffff", "solid"],
    espana: ["#c52828", "#f7d917", "solid"],
    alemania: ["#ffffff", "#111111", "center"],
    uruguay: ["#78b7e5", "#111111", "solid"],
    portugal: ["#b7192b", "#1d7a4f", "center"]
  };
  return colors[normalizeGuess(team)] || ["#1f6dad", "#ffffff", "solid"];
}

function renderShirt(item, revealedNumber = "") {
  const [primary, secondary, pattern] = teamColor(item?.team || "");
  const number = escapeHtml(revealedNumber || Array.from(String(item?.number || "")).map(char => char === " " ? " " : "?").join(""));
  return `<div class="game-shirt-placeholder shirt-${pattern}" style="--shirt-primary:${primary};--shirt-secondary:${secondary}">
    <span class="shirt-neck"></span>
    <strong id="shirtNumberDisplay">${number}</strong>
    <small>${escapeHtml(item?.team || item?.tournament || "Mundial")}</small>
  </div>`;
}

function renderLetterInputs(answer, name, label) {
  return `<fieldset class="letter-guess" data-letter-group="${name}">
    <legend>${label}</legend>
    <div class="letter-grid">
      ${Array.from(String(answer || "")).map((char, index) => char === " "
        ? `<span class="letter-gap"></span>`
        : `<input name="${name}-${index}" maxlength="1" autocomplete="off" aria-label="${label} letra ${index + 1}">`
      ).join("")}
    </div>
  </fieldset>`;
}

function readLetterGuess(group, answer) {
  if (!group) return "";
  return Array.from(String(answer || "")).map((char, index) => {
    if (char === " ") return " ";
    return group.querySelector(`[name$="-${index}"]`)?.value || "";
  }).join("");
}

function paintLetterGuess(group, answer, guess) {
  if (!group) return;
  const normalizedAnswer = normalizeGuess(answer);
  Array.from(String(answer || "")).forEach((char, index) => {
    if (char === " ") return;
    const input = group.querySelector(`[name$="-${index}"]`);
    if (!input) return;
    const value = normalizeGuess(guess[index] || "");
    input.classList.remove("hit", "near", "miss");
    input.classList.add(value === normalizeGuess(char) ? "hit" : normalizedAnswer.includes(value) ? "near" : "miss");
  });
}

function wireLetterInputs(form) {
  form.querySelectorAll(".letter-grid input").forEach(input => {
    input.addEventListener("input", () => {
      input.value = input.value.slice(-1);
      if (!input.value) return;
      const list = Array.from(input.closest(".letter-grid")?.querySelectorAll("input") || []);
      list[list.indexOf(input) + 1]?.focus();
    });
  });
}

function fillLetterGuess(group, answer, guess) {
  if (!group) return;
  Array.from(String(answer || "")).forEach((char, index) => {
    if (char === " ") return;
    const input = group.querySelector(`[name$="-${index}"]`);
    if (input) input.value = String(guess || "")[index] || "";
  });
}

async function submitDailyGamePlay(gameType, guess) {
  if (!state.companySession?.token && !state.globalSession?.token) throw new Error("Primero ingresa con tu usuario.");
  const data = await apiJson("/api/daily-game-play", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      gameType,
      guess
    })
  });
  state.dailyGamePlays = data.dailyGamePlays || state.dailyGamePlays || {};
  return data;
}

function renderDailyGames() {
  const panel = document.getElementById("dailyGames");
  if (!panel) return;
  const section = panel.closest(".home-games");
  if (section) section.hidden = false;
  const games = state.tenantId ? state.tenant?.games : state.globalGames;
  const title = document.getElementById("dailyGamesTitle");
  const intro = document.getElementById("dailyGamesIntro");
  const meta = document.getElementById("dailyGamesMeta");
  if (title) title.textContent = games?.title || (state.tenantId ? "Juegos diarios" : "Centro de minijuegos");
  if (intro) intro.textContent = games?.intro || "Desafios rapidos para sumar ritmo al prode diario.";
  if (meta) {
    const rewardName = games?.rewardName || "Fan Points";
    const camisetadlePoints = Number(games?.points?.camisetadle || 0);
    const challengePoints = Number(games?.points?.desafio || 0);
    meta.innerHTML = `
      <span>${escapeHtml(state.tenant?.name || "Global")}</span>
      <span>Camisetadle +${camisetadlePoints} ${escapeHtml(rewardName)}</span>
      <span>Desafio +${challengePoints} ${escapeHtml(rewardName)}</span>
    `;
  }
  if (!games?.enabled) {
    panel.innerHTML = `<p class="empty">Los juegos diarios todavia no estan activos.</p>`;
    return;
  }
  const camisetas = Array.isArray(games.camisetas) ? games.camisetas : [];
  const item = scheduledDailyItem(camisetas);
  const desafios = Array.isArray(games.desafios) ? games.desafios : [];
  const challenge = scheduledDailyItem(desafios);
  const shirtProgress = readDailyProgress("camisetadle", item?.id);
  const challengeProgress = readDailyProgress("desafio", challenge?.id);
  const camisetadleDone = Boolean(state.dailyGamePlays?.camisetadle?.completed);
  const challengeDone = Boolean(state.dailyGamePlays?.desafio?.completed);
  let revealedNumber = camisetadleDone
    ? String(item?.number || "")
    : shirtProgress.revealedNumber || Array.from(String(item?.number || "")).map(char => char === " " ? " " : "?").join("");
  const visibleChallengeClues = challengeDone
    ? (challenge?.clues || []).length
    : Math.max(1, Number(challengeProgress.visibleClues || 1));
  panel.innerHTML = `
    <article class="game-card camisetadle-card ${camisetadleDone ? "is-completed" : ""}">
      <div>
        <p class="eyebrow">Camisetadle</p>
        <h3>Adivina camiseta, numero y jugador</h3>
        <p>${escapeHtml(item?.hint || "Desafio diario de camisetas mundialistas.")}</p>
      </div>
      <div class="game-shirt-frame">${renderShirt(item, revealedNumber)}</div>
      <form class="camisetadle-form" id="camisetadleForm">
        ${renderLetterInputs(item?.player || "", "player", "Jugador")}
        ${renderLetterInputs(item?.number || "", "number", "Numero")}
        <button ${camisetadleDone ? "disabled" : ""}>${camisetadleDone ? "Completado" : "Probar"}</button>
      </form>
      <div class="game-result" id="camisetadleResult">${camisetadleDone && item ? `Completado: ${escapeHtml(item.player)} #${escapeHtml(item.number)}${item.team ? `, ${escapeHtml(item.team)}` : ""}.` : ""}</div>
      ${camisetadleDone && item ? `
        <div class="game-completed-panel">
          <span class="game-completed-badge">Completado</span>
          <strong>${escapeHtml(item.player)} #${escapeHtml(item.number)}</strong>
          <small>${escapeHtml(item.team || item.tournament || "Desafio diario")}</small>
        </div>
      ` : ""}
    </article>
    <article class="game-card stadium-card ${challengeDone ? "is-completed" : ""}">
      <div>
        <p class="eyebrow">${escapeHtml(challenge?.type || "Desafio")}</p>
        <h3>${escapeHtml(challenge?.title || "Adivina el desafio")}</h3>
        <p>${escapeHtml(challenge?.subtitle || "Usa las pistas del dia.")}</p>
      </div>
      <div class="stadium-clues" id="challengeClues">${(challenge?.clues || ["Pista no cargada"]).slice(0, visibleChallengeClues).map(clue => `<p>${escapeHtml(clue)}</p>`).join("")}</div>
      <form class="game-guess-form stadium-guess-form" id="challengeForm">
        ${renderLetterInputs(challenge?.answer || "", "challenge", "Respuesta")}
        <button ${challengeDone ? "disabled" : ""}>${challengeDone ? "Completado" : "Probar"}</button>
      </form>
      <div class="game-result" id="challengeResult">${challengeDone && challenge ? `Completado: ${escapeHtml(challenge.answer)}${challenge.subtitle ? `, ${escapeHtml(challenge.subtitle)}` : ""}.` : ""}</div>
      ${challengeDone && challenge ? `
        <div class="game-completed-panel">
          <span class="game-completed-badge">Completado</span>
          <strong>${escapeHtml(challenge.answer)}</strong>
          <small>${escapeHtml(challenge.subtitle || challenge.type || "Desafio diario")}</small>
        </div>
      ` : ""}
    </article>
  `;
  const camisetadleForm = document.getElementById("camisetadleForm");
  if (camisetadleForm) {
    const playerGroup = camisetadleForm.querySelector('[data-letter-group="player"]');
    const numberGroup = camisetadleForm.querySelector('[data-letter-group="number"]');
    fillLetterGuess(playerGroup, item?.player || "", camisetadleDone ? item?.player || "" : shirtProgress.playerGuess || "");
    fillLetterGuess(numberGroup, item?.number || "", camisetadleDone ? item?.number || "" : shirtProgress.numberGuess || "");
    if (camisetadleDone) {
      camisetadleForm.querySelectorAll("input").forEach(input => {
        input.disabled = true;
        input.classList.add("hit");
      });
    } else {
      wireLetterInputs(camisetadleForm);
      camisetadleForm.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
          const playerGuess = readLetterGuess(playerGroup, item?.player || "");
          const numberGuess = readLetterGuess(numberGroup, item?.number || "");
          writeDailyProgress("camisetadle", item?.id, { ...readDailyProgress("camisetadle", item?.id), playerGuess, numberGuess, revealedNumber });
        });
      });
    }
  }
  camisetadleForm?.addEventListener("submit", event => {
    event.preventDefault();
    if (!item || camisetadleDone) return;
    const form = event.currentTarget;
    const playerGroup = form.querySelector('[data-letter-group="player"]');
    const numberGroup = form.querySelector('[data-letter-group="number"]');
    const playerGuess = readLetterGuess(playerGroup, item.player);
    const numberGuess = readLetterGuess(numberGroup, item.number);
    const playerOk = normalizeGuess(playerGuess) === normalizeGuess(item.player);
    const numberOk = normalizeGuess(numberGuess) === normalizeGuess(item.number);
    paintLetterGuess(playerGroup, item.player, playerGuess);
    paintLetterGuess(numberGroup, item.number, numberGuess);
    revealedNumber = Array.from(String(item.number || "")).map((char, index) => char === " " ? " " : normalizeGuess(numberGuess[index] || "") === normalizeGuess(char) ? char : revealedNumber[index] || "?").join("");
    const shirtNumber = document.getElementById("shirtNumberDisplay");
    if (shirtNumber) shirtNumber.textContent = revealedNumber;
    const result = document.getElementById("camisetadleResult");
    writeDailyProgress("camisetadle", item.id, { playerGuess, numberGuess, revealedNumber });
    if (!playerOk || !numberOk) {
      result.textContent = `Jugador ${playerOk ? "bien" : "todavia no"} - numero ${numberOk ? "bien" : "todavia no"}.`;
      return;
    }
    submitDailyGamePlay("camisetadle", { player: playerGuess, number: numberGuess })
      .then(() => {
        state.dailyGamePlays.camisetadle = { completed: true };
        clearDailyProgress("camisetadle", item.id);
        renderDailyGames();
      })
      .catch(error => { result.textContent = error.message; });
  });
  let challengeAttempts = Number(challengeProgress.attempts || 0);
  const challengeForm = document.getElementById("challengeForm");
  if (challengeForm) {
    const challengeGroup = challengeForm.querySelector('[data-letter-group="challenge"]');
    fillLetterGuess(challengeGroup, challenge?.answer || "", challengeDone ? challenge?.answer || "" : challengeProgress.answer || "");
    if (challengeDone) {
      challengeForm.querySelectorAll("input").forEach(input => {
        input.disabled = true;
        input.classList.add("hit");
      });
    } else {
      wireLetterInputs(challengeForm);
      challengeForm.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
          const answer = readLetterGuess(challengeGroup, challenge?.answer || "");
          writeDailyProgress("desafio", challenge?.id, {
            ...readDailyProgress("desafio", challenge?.id),
            answer,
            attempts: challengeAttempts,
            visibleClues: Math.max(1, Number(readDailyProgress("desafio", challenge?.id).visibleClues || 1))
          });
        });
      });
    }
  }
  document.getElementById("challengeForm")?.addEventListener("submit", event => {
    event.preventDefault();
    if (!challenge || challengeDone) return;
    challengeAttempts += 1;
    const form = event.currentTarget;
    const challengeGroup = form.querySelector('[data-letter-group="challenge"]');
    const guess = readLetterGuess(challengeGroup, challenge.answer).trim();
    const result = document.getElementById("challengeResult");
    const clues = document.getElementById("challengeClues");
    paintLetterGuess(challengeGroup, challenge.answer, guess);
    if (normalizeGuess(guess) === normalizeGuess(challenge.answer)) {
      submitDailyGamePlay("desafio", { answer: guess })
        .then(() => {
          state.dailyGamePlays.desafio = { completed: true };
          clearDailyProgress("desafio", challenge.id);
          renderDailyGames();
        })
        .catch(error => { result.textContent = error.message; });
      return;
    }
    const visibleClues = Math.min((challenge.clues || []).length, challengeAttempts + 1);
    writeDailyProgress("desafio", challenge.id, { answer: guess, attempts: challengeAttempts, visibleClues });
    clues.innerHTML = (challenge.clues || []).slice(0, visibleClues).map(clue => `<p>${escapeHtml(clue)}</p>`).join("");
    result.textContent = "Todavia no. Se habilito otra pista.";
  });
}

async function loadGlobalGames() {
  if (state.tenantId) return;
  const params = new URLSearchParams();
  if (state.globalSession?.token) params.set("sessionToken", state.globalSession.token);
  const data = await apiJson(`/api/global-games?${params.toString()}`);
  state.globalGames = data.games || state.globalGames;
  state.dailyGamePlays = data.dailyGamePlays || state.dailyGamePlays || {};
  renderDailyGames();
}

async function loadTenant() {
  const tenantId = initialTenantId();
  if (!tenantId) return;
  state.tenantId = tenantId;
  try {
    const data = await apiJson(`/api/tenant?tenant=${encodeURIComponent(tenantId)}`);
    applyTenantTheme(data.tenant);
    await refreshCompanySession();
  } catch (error) {
    console.warn(`No se pudo cargar la empresa ${tenantId}: ${error.message}`);
  }
}

function joinedTournamentCodes() {
  try {
    return JSON.parse(localStorage.getItem("joinedTournamentCodes") || "[]");
  } catch {
    return [];
  }
}

function rememberTournamentCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized || normalized === "GLOBAL") return;
  const codes = joinedTournamentCodes();
  if (!codes.includes(normalized)) {
    codes.push(normalized);
    localStorage.setItem("joinedTournamentCodes", JSON.stringify(codes));
  }
}

function rememberCreatorKey(tournamentId, creatorKey) {
  if (!tournamentId || !creatorKey) return;
  localStorage.setItem(`creatorKey:${tournamentId}`, creatorKey);
}

function creatorKeyFor(tournamentId) {
  return localStorage.getItem(`creatorKey:${tournamentId}`) || "";
}

function invitePathFor(tournament) {
  return tournament.invitePath || `/join/${encodeURIComponent(tournament.code || "")}`;
}

async function loadTemplates() {
  const data = await apiJson("/api/templates");
  state.templates = data.templates || [];
  state.phases = data.phases || [{ id: "all", name: "Prode completo", type: "all" }];
  state.defaultScoring = data.defaultScoring || state.defaultScoring;
  const select = document.getElementById("templateSelect");
  if (select) {
    select.innerHTML = state.templates.map(template => `<option value="${template.id}">${template.name}</option>`).join("");
    const updateTemplateFields = () => {
      const template = state.templates.find(item => item.id === select.value);
      if (template) document.getElementById("modeSelect").value = template.mode;
      const customField = document.getElementById("customTeamsField");
      if (customField) customField.hidden = select.value !== "custom";
    };
    select.addEventListener("change", updateTemplateFields);
    updateTemplateFields();
  }
  renderPhaseSelector();
}

function initialTournamentCode() {
  const params = new URLSearchParams(window.location.search);
  const pathMatch = window.location.pathname.match(/^\/join\/([^/]+)/);
  return pathMatch ? decodeURIComponent(pathMatch[1]) : params.get("torneo") || params.get("tournament") || "";
}

function initialContinueToken() {
  const params = new URLSearchParams(window.location.search);
  const pathMatch = window.location.pathname.match(/^\/continuar\/([^/]+)/);
  return pathMatch ? decodeURIComponent(pathMatch[1]) : params.get("continuar") || params.get("token") || "";
}

function phaseFromUrl() {
  const phase = new URLSearchParams(window.location.search).get("fase") || "";
  return phase === "groups" ? "group1" : phase;
}

function createEmptyTournament() {
  return {
    groups: Object.fromEntries(Object.keys(WORLD_CUP_GROUPS).map(group => [group, ["", "", "", ""]])),
    groupMatches: {},
    thirdAssignments: {},
    winners: {},
    scores: {},
    custom: {
      champion: "",
      matches: {}
    }
  };
}

function groupKeys() {
  return Object.keys(WORLD_CUP_GROUPS);
}

function teamLabel(team) {
  return team || "";
}

function flagUrl(team) {
  const code = FLAG_CODES[team];
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
}

function flagBackgroundUrl(team) {
  const code = FLAG_CODES[team];
  return code ? `https://flagcdn.com/w160/${code}.png` : "";
}

function setFlagBackground(element, team, cssVar = "--team-flag") {
  const url = flagBackgroundUrl(team);
  if (!element || !url) return;
  element.classList.add("has-flag-bg");
  element.style.setProperty(cssVar, `url("${url}")`);
}

function teamBadge(team) {
  if (!team) return "";
  const url = flagUrl(team);
  const flag = url ? `<img class="flag" src="${url}" alt="">` : `<span class="flag-placeholder"></span>`;
  return `<span class="team-badge">${flag}<span>${team}</span></span>`;
}

function groupMatchId(group, firstIndex, secondIndex) {
  return `${group}-${firstIndex}-${secondIndex}`;
}

function buildMatchSchedule() {
  const schedule = { ...KNOCKOUT_SCHEDULE };
  Object.entries(GROUP_MATCHDAY_FIXTURES).forEach(([phaseId, pairs], phaseIndex) => {
    groupKeys().forEach((group, groupIndex) => {
      pairs.forEach(([firstIndex, secondIndex], pairIndex) => {
        const number = phaseIndex * 24 + groupIndex * 2 + pairIndex + 1;
        schedule[groupMatchId(group, firstIndex, secondIndex)] = {
          number,
          date: GROUP_MATCHDAY_DATES[phaseId]?.[groupIndex] || "",
          time: GROUP_MATCH_TIMES[pairIndex] || "",
          venue: STADIUM_ROTATION[(number - 1) % STADIUM_ROTATION.length]
        };
      });
    });
  });
  return schedule;
}

function groupMatchIdsForPhase(phaseId) {
  const pairs = GROUP_MATCHDAY_FIXTURES[phaseId];
  if (!pairs) return [];
  return groupKeys().flatMap(group => pairs.map(([firstIndex, secondIndex]) => groupMatchId(group, firstIndex, secondIndex)));
}

function groupFixtures(group, phaseId = "") {
  const pairs = GROUP_MATCHDAY_FIXTURES[phaseId] || [
    ...GROUP_MATCHDAY_FIXTURES.group1,
    ...GROUP_MATCHDAY_FIXTURES.group2,
    ...GROUP_MATCHDAY_FIXTURES.group3
  ];
  return pairs.map(([firstIndex, secondIndex]) => ({
    id: groupMatchId(group, firstIndex, secondIndex),
    home: WORLD_CUP_GROUPS[group][firstIndex],
    away: WORLD_CUP_GROUPS[group][secondIndex]
  }));
}

function getScheduleHtml(id) {
  const match = MATCH_SCHEDULE[id];
  if (!match) return "";
  const number = match.number ? `Partido ${match.number}` : id.toUpperCase();
  const dateTime = [match.date, match.time].filter(Boolean).join(", ");
  const place = [dateTime, match.venue].filter(Boolean).join(" - ");
  return `<small class="match-schedule">${number}${place ? ` | ${place}` : ""}</small>`;
}

function getGroupMatch(model, id, homeTeam = "", awayTeam = "") {
  if (!model.groupMatches) model.groupMatches = {};
  if (!model.groupMatches[id]) model.groupMatches[id] = { home: "", away: "" };
  model.groupMatches[id].homeTeam = homeTeam || model.groupMatches[id].homeTeam || "";
  model.groupMatches[id].awayTeam = awayTeam || model.groupMatches[id].awayTeam || "";
  return model.groupMatches[id];
}

function numericScore(value) {
  if (value === "" || value === null || value === undefined) return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function matchScores(score) {
  const hasHome = score.home !== "" && score.home !== null && score.home !== undefined;
  const hasAway = score.away !== "" && score.away !== null && score.away !== undefined;
  if (!hasHome && !hasAway) return null;
  return {
    home: numericScore(hasHome ? score.home : 0),
    away: numericScore(hasAway ? score.away : 0)
  };
}

function groupStandings(model, group) {
  const table = Object.fromEntries(WORLD_CUP_GROUPS[group].map(team => [team, {
    team,
    pts: 0,
    gf: 0,
    ga: 0,
    gd: 0
  }]));

  groupFixtures(group).forEach(match => {
    const score = getGroupMatch(model, match.id, match.home, match.away);
    const result = matchScores(score);
    if (!result || result.home === null || result.away === null) return;
    table[match.home].gf += result.home;
    table[match.home].ga += result.away;
    table[match.away].gf += result.away;
    table[match.away].ga += result.home;
    if (result.home > result.away) table[match.home].pts += 3;
    else if (result.away > result.home) table[match.away].pts += 3;
    else {
      table[match.home].pts += 1;
      table[match.away].pts += 1;
    }
  });

  return Object.values(table)
    .map(row => ({ ...row, gd: row.gf - row.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
}

function applyGroupStandings(model, group) {
  model.groups[group] = groupStandings(model, group).map(row => row.team);
  pruneDependentWinners(model, 0);
  autoAssignThirdsIfPossible(model);
}

function syncGroupScoresFromDom(container, model) {
  container.querySelectorAll("[data-group-match-id]").forEach(input => {
    const score = getGroupMatch(model, input.dataset.groupMatchId, input.dataset.homeTeam, input.dataset.awayTeam);
    score[input.dataset.side] = input.value;
  });
}

function standingsMarkup(model, group) {
  return groupStandings(model, group).map((row, index) => `
    <div class="standings-row">
      <b>${index + 1}</b>
      <span>${teamLabel(row.team)}</span>
      <strong>${row.pts}</strong>
      <small>${row.gd >= 0 ? "+" : ""}${row.gd}</small>
      <small>${row.gf}</small>
    </div>
  `).join("");
}

function isEntryClosed() {
  return Date.now() > new Date(APP_CONFIG.entryDeadline).getTime();
}

function formatDeadline() {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date(APP_CONFIG.entryDeadline));
}

function currentPhase() {
  return state.phases.find(phase => phase.id === state.currentPhaseId) || state.phases[0] || { id: "all", name: "Prode completo", type: "all" };
}

function renderPhaseSelector() {
  const select = document.getElementById("predictionPhase");
  if (!select) return;
  const phases = state.currentMode === "full"
    ? state.phases.filter(phase => phase.id === "all")
    : state.phases.filter(phase => phase.id !== "all");
  if (!phases.some(phase => phase.id === state.currentPhaseId)) {
    state.currentPhaseId = phases[0]?.id || "all";
  }
  select.innerHTML = phases.map(phase => `<option value="${phase.id}">${phase.name}</option>`).join("");
  select.value = state.currentPhaseId;
  select.disabled = state.currentMode === "full";
  renderPhaseStatus();
}

function renderPhaseStatus() {
  const status = document.getElementById("phaseStatus");
  if (!status) return;
  const phase = currentPhase();
  const tournament = currentTournament();
  const usingReal = usesWorldCupEditor(tournament) && phase.id !== "all" && phase.type === "matches" && Boolean(tournament?.realResults);
  status.textContent = state.currentMode === "full"
    ? "Modo todo junto: se completan grupos, tabla, cruces y campeon en una sola carga."
    : (phase.description || phase.name);
  if (usingReal) {
    status.textContent += " Los cruces se arman con los resultados reales cargados por el administrador.";
  } else if (usesWorldCupEditor(tournament) && phase.type === "matches") {
    status.textContent += " Cuando el administrador cargue resultados reales, esta ronda usara esos cruces automaticamente.";
  }
}

function setPredictionLocked(locked) {
  document.querySelectorAll("#predictor input, #predictor select, #predictor button").forEach(element => {
    element.disabled = locked || (element.id === "predictionPhase" && state.currentMode === "full");
  });
  const banner = document.getElementById("lockBanner");
  banner.hidden = !locked;
  banner.textContent = locked
    ? `La carga de prodes cerro el ${formatDeadline()}. Ya no se pueden generar ni enviar nuevas jugadas.`
    : `La carga de prodes cierra el ${formatDeadline()}.`;
}

function currentTournament() {
  return state.tournaments.find(tournament => tournament.id === state.currentTournamentId) || state.tournaments[0];
}

function tournamentDefinition(tournament = currentTournament()) {
  const template = state.templates.find(item => item.id === tournament?.templateId) || {};
  return {
    id: tournament?.templateId || template.id || "worldcup-2026",
    name: tournament?.customTemplate?.name || tournament?.templateName || template.name || "Mundial 2026",
    mode: tournament?.customTemplate?.mode || tournament?.mode || template.mode || "groups-knockout",
    teams: tournament?.customTemplate?.teams || tournament?.teams || template.teams || [],
    fixtures: tournament?.customTemplate?.fixtures || tournament?.fixtures || template.fixtures || [],
    timing: tournament?.customTemplate?.timing || tournament?.timing || template.timing || {}
  };
}

function usesWorldCupEditor(tournament = currentTournament()) {
  const definition = tournamentDefinition(tournament);
  return definition.id === "worldcup-2026" || (definition.mode === "groups-knockout" && !definition.teams.length);
}

function phaseRenderModel() {
  const tournament = currentTournament();
  const phase = currentPhase();
  if (!usesWorldCupEditor(tournament) || phase.id === "all" || phase.type !== "matches" || !tournament?.realResults) {
    return state.prediction;
  }
  const model = JSON.parse(JSON.stringify(tournament.realResults));
  const currentIds = new Set(phase.matchIds || []);
  const realWinners = model.winners || {};
  const realScores = model.scores || {};
  if (!state.prediction.winners) state.prediction.winners = {};
  if (!state.prediction.scores) state.prediction.scores = {};
  model.winners = new Proxy(state.prediction.winners, {
    get(target, key) {
      return currentIds.has(key) ? target[key] : realWinners[key];
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
    has(target, key) {
      return currentIds.has(key) ? key in target : key in realWinners;
    }
  });
  model.scores = new Proxy(state.prediction.scores, {
    get(target, key) {
      return currentIds.has(key) ? target[key] : realScores[key];
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
    has(target, key) {
      return currentIds.has(key) ? key in target : key in realScores;
    }
  });
  model.custom = state.prediction.custom;
  return model;
}

function ensureCustomModel(model) {
  if (!model.custom) model.custom = { champion: "", matches: {} };
  if (!model.custom.matches) model.custom.matches = {};
  return model.custom;
}

function customFixtures(definition) {
  if (Array.isArray(definition.fixtures) && definition.fixtures.length) {
    return definition.fixtures.map((match, index) => ({
      id: match.id || `c${index + 1}`,
      home: match.home,
      away: match.away,
      startsAt: match.startsAt || "",
      round: match.round || ""
    }));
  }
  const teams = (definition.teams || []).filter(Boolean);
  const pairs = [];
  const maxMatches = definition.mode === "league" ? 24 : 16;
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      pairs.push({
        id: `c${pairs.length + 1}`,
        home: teams[i],
        away: teams[j]
      });
      if (pairs.length >= maxMatches) return pairs;
    }
  }
  return pairs;
}

function matchLockInfo(match, definition) {
  if (!match?.startsAt) return { locked: false, label: "" };
  const startsAt = new Date(match.startsAt);
  if (Number.isNaN(startsAt.getTime())) return { locked: false, label: "" };
  const lockMinutes = Number(definition.timing?.predictionLockMinutesBefore || 0);
  const lockAt = new Date(startsAt.getTime() - lockMinutes * 60000);
  const locked = Date.now() >= lockAt.getTime();
  const formatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });
  return {
    locked,
    label: locked
      ? `Cerrado desde ${formatter.format(lockAt)}`
      : `Cierra ${formatter.format(lockAt)}`
  };
}

function scoreLabel(score) {
  if (!score || score.left === "" || score.right === "") return "";
  return `${score.left}-${score.right}`;
}

function setWinnerFromScore(model, id, left, right) {
  const score = model.scores[id];
  if (!score || score.left === "" || score.right === "" || Number(score.left) === Number(score.right)) return;
  model.winners[id] = Number(score.left) > Number(score.right) ? left : right;
}

function matchLoser(id, model) {
  const definition = ALL_BRACKET_MATCHES.find(([matchId]) => matchId === `m${id}`);
  if (!definition) return "";
  const [, leftSlot, rightSlot] = definition;
  const left = resolveSlot(leftSlot, model, `m${id}`);
  const right = resolveSlot(rightSlot, model, `m${id}`);
  const winner = model.winners?.[`m${id}`] || "";
  if (!winner) return "";
  if (winner === left) return right || "";
  if (winner === right) return left || "";
  return "";
}

function getQualified(model) {
  const qualified = {};

  groupKeys().forEach(group => {
    const picks = model.groups[group];
    qualified[`1${group}`] = picks[0] || "";
    qualified[`2${group}`] = picks[1] || "";
    qualified[`3${group}`] = picks[2] || "";
  });

  return qualified;
}

function thirdPlaceTeams(model) {
  return groupKeys()
    .map(group => ({ group, team: model.groups[group][2] || "" }))
    .filter(item => item.team);
}

function getThirdPlaceRankings(model) {
  const thirds = [];
  groupKeys().forEach(group => {
    const team = model.groups[group][2];
    if (!team) return;
    const stats = groupStandings(model, group).find(row => row.team === team);
    if (stats) {
      thirds.push({ group, team, pts: stats.pts, gd: stats.gd, gf: stats.gf });
    }
  });
  return thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.group.localeCompare(b.group));
}

function getBestThirds(model) {
  const thirds = getThirdPlaceRankings(model);
  if (thirds.length <= 8) return thirds;
  const eighth = thirds[7];
  return thirds.filter(item =>
    item.pts > eighth.pts ||
    (item.pts === eighth.pts && item.gd > eighth.gd) ||
    (item.pts === eighth.pts && item.gd === eighth.gd && item.gf >= eighth.gf)
  );
}

function allowedThirdPlaceTeams(model, matchId) {
  const allowedGroups = THIRD_PLACE_SLOTS[matchId] || [];
  const bestThirdGroups = getBestThirds(model).map(item => item.group);
  return allowedGroups
    .filter(group => bestThirdGroups.includes(group))
    .map(group => ({ group, team: model.groups[group]?.[2] || "" }))
    .filter(item => item.team);
}

function thirdMatchIds() {
  return R32_MATCHES.filter(([, , rightSlot]) => rightSlot === "3*").map(([id]) => id);
}

function autoAssignThirdsIfPossible(model) {
  const bestThirds = getBestThirds(model);
  if (bestThirds.length !== 8) return false;
  if (!model.thirdAssignments) model.thirdAssignments = {};
  const groups = bestThirds.map(item => item.group);
  const matches = thirdMatchIds();
  const assignment = {};

  function backtrack(index) {
    if (index === matches.length) return true;
    const matchId = matches[index];
    const allowed = THIRD_PLACE_SLOTS[matchId] || [];
    for (const group of groups) {
      if (!Object.values(assignment).includes(group) && allowed.includes(group)) {
        assignment[matchId] = group;
        if (backtrack(index + 1)) return true;
        delete assignment[matchId];
      }
    }
    return false;
  }

  if (!backtrack(0)) return false;
  let changed = false;
  matches.forEach(matchId => {
    const group = assignment[matchId];
    const team = bestThirds.find(item => item.group === group)?.team || "";
    if (team && model.thirdAssignments[matchId] !== team) {
      model.thirdAssignments[matchId] = team;
      model.winners[matchId] = "";
      pruneDependentWinners(model, Number(matchId.slice(1)));
      changed = true;
    }
  });
  return changed;
}

function renderThirdAssignments(containerId, model) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const thirds = thirdPlaceTeams(model);
  const matches = thirdMatchIds();
  container.innerHTML = "";

  if (!thirds.length) {
    container.innerHTML = `<div class="thirds-empty">Completa el tercer puesto de cada grupo para asignar mejores terceros.</div>`;
    return;
  }

  const bestThirds = getBestThirds(model);
  let helpText = "Cada llave muestra solo los terceros de grupos permitidos para ese cruce.";
  if (bestThirds.length === 8) {
    helpText = "Los 8 mejores terceros se detectaron y asignaron automaticamente por puntos, diferencia de gol y goles a favor.";
  } else if (bestThirds.length > 8 && getThirdPlaceRankings(model).length === 12) {
    helpText = "Hay empate en el 8vo puesto. Elegi manualmente para desempatar.";
  }

  const usedTeams = Object.values(model.thirdAssignments || {}).filter(Boolean);
  container.innerHTML = `
    <div class="thirds-head">
      <h3>Asignacion de mejores terceros</h3>
      <p>${helpText}</p>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "thirds-grid";
  matches.forEach(id => {
    if (!model.thirdAssignments) model.thirdAssignments = {};
    const [, leftSlot] = R32_MATCHES.find(([matchId]) => matchId === id);
    const left = resolveSlot(leftSlot, model, id);
    const allowedThirds = allowedThirdPlaceTeams(model, id);
    const current = model.thirdAssignments[id] || "";
    if (current && !allowedThirds.some(item => item.team === current)) {
      model.thirdAssignments[id] = "";
    }
    const row = document.createElement("label");
    row.className = "third-select";
    const matchNumber = MATCH_SCHEDULE[id]?.number;
    row.innerHTML = `<span>${matchNumber ? `Partido ${matchNumber}` : id.toUpperCase()} vs ${teamLabel(left) || leftSlot}</span>`;
    const select = document.createElement("select");
    select.innerHTML = `<option value="">Elegir tercero</option>${allowedThirds.map(item => {
      const disabled = usedTeams.includes(item.team) && item.team !== current ? "disabled" : "";
      return `<option value="${item.team}" ${disabled}>${item.team} (3${item.group})</option>`;
    }).join("")}`;
    select.value = model.thirdAssignments[id] || "";
    select.disabled = bestThirds.length === 8;
    select.addEventListener("change", event => {
      model.thirdAssignments[id] = event.target.value;
      model.winners[id] = "";
      pruneDependentWinners(model, Number(id.slice(1)));
      renderAll();
    });
    row.appendChild(select);
    grid.appendChild(row);
  });
  container.appendChild(grid);
}

function renderGroups(containerId, model, prefix, options = {}) {
  const container = document.getElementById(containerId);
  const template = document.getElementById("groupTemplate");
  container.innerHTML = "";
  const matchdayId = options.matchdayId || "";
  const matchdayOnly = Boolean(matchdayId);

  groupKeys().forEach(group => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".group-title").innerHTML = `
      <strong>Grupo ${group}</strong>
      <span>${WORLD_CUP_GROUPS[group].map(teamBadge).join("")}</span>
    `;
    const selectors = node.querySelector(".selectors");

    if (!matchdayOnly) {
      [0, 1, 2, 3].forEach(index => {
        const row = document.createElement("div");
        row.className = "selector-row";
        setFlagBackground(row, model.groups[group][index]);
        row.innerHTML = `<div class="place">${index + 1}</div>`;
        const select = document.createElement("select");
        select.dataset.group = group;
        select.dataset.index = index;
        select.dataset.model = prefix;
        select.innerHTML = `<option value="">Elegir seleccion</option>${WORLD_CUP_GROUPS[group].map(team => `<option value="${team}">${team}</option>`).join("")}`;
        select.value = model.groups[group][index] || "";
        select.addEventListener("change", event => {
          model.groups[group][index] = event.target.value;
          removeDuplicates(model, group, index);
          renderAll();
        });
        row.appendChild(select);
        selectors.appendChild(row);
      });
    }

    const matches = document.createElement("div");
    matches.className = "group-matches";
    matches.innerHTML = `
      <div class="group-matches-head">
        <span>${matchdayOnly ? currentPhase().name : "Resultados de grupo"}</span>
        ${matchdayOnly ? "" : `<button class="mini-button" type="button">Ordenar por tabla</button>`}
      </div>
    `;
    matches.querySelector("button")?.addEventListener("click", () => {
        syncGroupScoresFromDom(matches, model);
        applyGroupStandings(model, group);
        renderAll();
      });
    groupFixtures(group, matchdayId).forEach(match => {
      const score = getGroupMatch(model, match.id, match.home, match.away);
      const line = document.createElement("div");
      line.className = "group-match";
      line.innerHTML = `
        <span>${teamBadge(match.home)}</span>
        <input type="number" min="0" max="20" value="${score.home}" placeholder="0" data-group-match-id="${match.id}" data-side="home" data-home-team="${match.home}" data-away-team="${match.away}">
        <b>-</b>
        <input type="number" min="0" max="20" value="${score.away}" placeholder="0" data-group-match-id="${match.id}" data-side="away" data-home-team="${match.home}" data-away-team="${match.away}">
        <span>${teamBadge(match.away)}</span>
        ${getScheduleHtml(match.id)}
      `;
      const inputs = line.querySelectorAll("input");
      const updateGroupTable = event => {
        getGroupMatch(model, match.id, match.home, match.away)[event.target.dataset.side] = event.target.value;
        syncGroupScoresFromDom(matches, model);
        const standingsBody = matches.querySelector(".group-standings-body");
        if (standingsBody) standingsBody.innerHTML = standingsMarkup(model, group);
      };
      inputs[0].addEventListener("input", updateGroupTable);
      inputs[0].addEventListener("change", updateGroupTable);
      inputs[1].addEventListener("input", updateGroupTable);
      inputs[1].addEventListener("change", updateGroupTable);
      matches.appendChild(line);
    });
    if (!matchdayOnly) {
      const standings = document.createElement("div");
      standings.className = "group-standings";
      standings.innerHTML = `
        <div class="standings-row standings-header">
          <b>#</b><span>Equipo</span><strong>Pts</strong><small>DG</small><small>GF</small>
        </div>
        <div class="group-standings-body">${standingsMarkup(model, group)}</div>
      `;
      matches.appendChild(standings);
    }
    selectors.appendChild(matches);

    container.appendChild(node);
  });
}

function renderMatchdayMatches(containerId, model, prefix, phaseId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const matches = groupKeys().flatMap(group => groupFixtures(group, phaseId).map(match => ({ ...match, group })));
  matches.sort((a, b) => (MATCH_SCHEDULE[a.id]?.number || 999) - (MATCH_SCHEDULE[b.id]?.number || 999));
  if (!matches.length) {
    container.innerHTML = `<p class="empty">No hay partidos configurados para esta fecha.</p>`;
    return;
  }
  matches.forEach(match => {
    const score = getGroupMatch(model, match.id, match.home, match.away);
    const matchNumber = MATCH_SCHEDULE[match.id]?.number;
    const card = document.createElement("article");
    card.className = "matchday-card";
    card.innerHTML = `
      <div class="matchday-title">
        <span>Grupo ${match.group}</span>
        <strong>${matchNumber ? `Partido ${matchNumber}` : match.id}</strong>
      </div>
      <div class="group-match">
        <span>${teamBadge(match.home)}</span>
        <input type="number" min="0" max="20" value="${score.home}" placeholder="0" data-group-match-id="${match.id}" data-side="home" data-home-team="${match.home}" data-away-team="${match.away}">
        <b>-</b>
        <input type="number" min="0" max="20" value="${score.away}" placeholder="0" data-group-match-id="${match.id}" data-side="away" data-home-team="${match.home}" data-away-team="${match.away}">
        <span>${teamBadge(match.away)}</span>
      </div>
      ${getScheduleHtml(match.id)}
    `;
    card.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", event => {
        getGroupMatch(model, match.id, match.home, match.away)[event.target.dataset.side] = event.target.value;
      });
      input.addEventListener("change", event => {
        getGroupMatch(model, match.id, match.home, match.away)[event.target.dataset.side] = event.target.value;
      });
    });
    container.appendChild(card);
  });
}

function removeDuplicates(model, group, changedIndex) {
  const value = model.groups[group][changedIndex];
  if (!value) return;
  model.groups[group] = model.groups[group].map((team, index) => index !== changedIndex && team === value ? "" : team);
}

function resolveSlot(slot, model, matchId) {
  const qualified = getQualified(model);
  if (slot === "3*") {
    return model.thirdAssignments?.[matchId] || "";
  }
  if (slot.startsWith("G")) {
    return model.winners[`m${slot.slice(1)}`] || "";
  }
  if (slot.startsWith("P")) {
    return matchLoser(slot.slice(1), model);
  }
  return qualified[slot] || "";
}

function renderBracket(containerId, model, prefix, options = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const rounds = [
    ["Dieciseisavos", R32_MATCHES],
    ["Octavos", LATER_ROUNDS.r16],
    ["Cuartos", LATER_ROUNDS.qf],
    ["Semifinales", LATER_ROUNDS.sf],
    ["Tercer puesto", LATER_ROUNDS.third],
    ["Final", LATER_ROUNDS.final]
  ].map(([title, matches]) => [
    title,
    options.matchIds ? matches.filter(([id]) => options.matchIds.includes(id)) : matches
  ]).filter(([, matches]) => matches.length);

  rounds.forEach(([title, matches]) => {
    const round = document.createElement("div");
    round.className = "round";
    round.innerHTML = `<h3>${title}</h3>`;

    matches.forEach(([id, leftSlot, rightSlot]) => {
      const left = resolveSlot(leftSlot, model, id);
      const right = resolveSlot(rightSlot, model, id);
      const options = [left, right].filter(Boolean);
      if (!model.scores[id]) {
        model.scores[id] = { left: "", right: "" };
      }
      if (!options.includes(model.winners[id])) {
        model.winners[id] = "";
      }

      const card = document.createElement("div");
      card.className = "match-card";
      setFlagBackground(card, left, "--team-flag-left");
      setFlagBackground(card, right, "--team-flag-right");
      const matchNumber = MATCH_SCHEDULE[id]?.number;
      card.innerHTML = `
        <div class="match-title">${matchNumber ? `Partido ${matchNumber}` : id.toUpperCase()}</div>
        <div class="teams-line">
          <span>${teamBadge(left) || leftSlot}</span>
          <b>vs</b>
          <span>${teamBadge(right) || rightSlot}</span>
        </div>
        ${getScheduleHtml(id)}
      `;

      const scoreRow = document.createElement("div");
      scoreRow.className = "score-row";
      const leftScore = document.createElement("input");
      leftScore.type = "number";
      leftScore.min = "0";
      leftScore.max = "20";
      leftScore.placeholder = "0";
      leftScore.value = model.scores[id].left;
      leftScore.disabled = options.length < 2;
      const rightScore = document.createElement("input");
      rightScore.type = "number";
      rightScore.min = "0";
      rightScore.max = "20";
      rightScore.placeholder = "0";
      rightScore.value = model.scores[id].right;
      rightScore.disabled = options.length < 2;
      [leftScore, rightScore].forEach((input, index) => {
        input.addEventListener("input", event => {
          model.scores[id][index === 0 ? "left" : "right"] = event.target.value;
          setWinnerFromScore(model, id, left, right);
          renderAll();
        });
      });
      scoreRow.appendChild(leftScore);
      scoreRow.insertAdjacentHTML("beforeend", "<span>-</span>");
      scoreRow.appendChild(rightScore);
      card.appendChild(scoreRow);

      const label = document.createElement("label");
      label.textContent = "Ganador";
      const select = document.createElement("select");
      select.dataset.match = id;
      select.dataset.model = prefix;
      select.innerHTML = `<option value="">Elegir ganador</option>${options.map(team => `<option value="${team}">${team}</option>`).join("")}`;
      select.value = model.winners[id] || "";
      select.disabled = options.length < 2;
      select.addEventListener("change", event => {
        model.winners[id] = event.target.value;
        pruneDependentWinners(model, Number(id.slice(1)));
        renderAll();
      });
      label.appendChild(select);
      card.appendChild(label);
      round.appendChild(card);
    });

    container.appendChild(round);
  });
}

function renderCustomSheet(containerId, model, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const definition = tournamentDefinition();
  const custom = ensureCustomModel(model);
  const fixtures = customFixtures(definition);
  const teams = definition.teams || [];

  if (teams.length < 2) {
    container.innerHTML = `<p class="empty">Esta plantilla necesita al menos 2 equipos o jugadores.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="section-head compact custom-title">
      <div>
        <h2>${definition.name}</h2>
        <p>${definition.mode === "league" ? "Planilla de liga" : "Planilla de partidos"} con ${teams.length} participantes.</p>
      </div>
      <label>
        Campeon / ganador
        <select class="custom-champion" data-model="${prefix}">
          <option value="">Elegir</option>
          ${teams.map(team => `<option value="${team}">${team}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="custom-teams">${teams.map(team => `<span>${team}</span>`).join("")}</div>
    <div class="custom-fixtures"></div>
  `;

  const champion = container.querySelector(".custom-champion");
  champion.value = custom.champion || "";
  champion.addEventListener("change", event => {
    custom.champion = event.target.value;
  });

  const grid = container.querySelector(".custom-fixtures");
  fixtures.forEach(match => {
    const lock = matchLockInfo(match, definition);
    if (!custom.matches[match.id]) {
      custom.matches[match.id] = {
        home: match.home,
        away: match.away,
        homeScore: "",
        awayScore: "",
        winner: ""
      };
    }
    custom.matches[match.id].home = match.home;
    custom.matches[match.id].away = match.away;
    const saved = custom.matches[match.id];
    const options = [match.home, match.away];
    const card = document.createElement("article");
    card.className = `custom-match-card ${lock.locked ? "is-locked" : ""}`;
    card.innerHTML = `
      <div class="match-title">${escapeHtml(match.round || match.id.toUpperCase())}</div>
      ${match.startsAt || lock.label ? `<div class="match-timing">${escapeHtml(lock.label || match.startsAt)}</div>` : ""}
      <div class="custom-match-line">
        <span>${teamBadge(match.home)}</span>
        <input type="number" min="0" max="99" placeholder="0" value="${saved.homeScore}" ${lock.locked ? "disabled" : ""}>
        <b>-</b>
        <input type="number" min="0" max="99" placeholder="0" value="${saved.awayScore}" ${lock.locked ? "disabled" : ""}>
        <span>${teamBadge(match.away)}</span>
      </div>
      <label>
        Ganador
        <select ${lock.locked ? "disabled" : ""}>
          <option value="">Elegir ganador</option>
          ${options.map(team => `<option value="${team}">${team}</option>`).join("")}
        </select>
      </label>
    `;
    const inputs = card.querySelectorAll("input");
    const winner = card.querySelector("select");
    winner.value = saved.winner || "";
    const sync = () => {
      saved.homeScore = inputs[0].value;
      saved.awayScore = inputs[1].value;
      if (saved.homeScore !== "" && saved.awayScore !== "" && Number(saved.homeScore) !== Number(saved.awayScore)) {
        saved.winner = Number(saved.homeScore) > Number(saved.awayScore) ? match.home : match.away;
        winner.value = saved.winner;
      }
    };
    inputs[0].addEventListener("input", sync);
    inputs[1].addEventListener("input", sync);
    winner.addEventListener("change", event => {
      saved.winner = event.target.value;
    });
    grid.appendChild(card);
  });
}

function pruneDependentWinners(model, changedMatch) {
  const changedRef = `G${changedMatch}`;
  const changedLoserRef = `P${changedMatch}`;
  const directDependents = ALL_BRACKET_MATCHES
    .filter(([, leftSlot, rightSlot]) => leftSlot === changedRef || rightSlot === changedRef || leftSlot === changedLoserRef || rightSlot === changedLoserRef)
    .map(([id]) => id);

  directDependents.forEach(matchId => {
    if (model.winners[matchId]) {
      model.winners[matchId] = "";
    }
    pruneDependentWinners(model, Number(matchId.slice(1)));
  });
}

function fillModel(model) {
  if (!usesWorldCupEditor()) {
    const definition = tournamentDefinition();
    const custom = ensureCustomModel(model);
    custom.champion = definition.teams[Math.floor(Math.random() * definition.teams.length)] || "";
    customFixtures(definition).forEach(match => {
      let homeScore = Math.floor(Math.random() * 5);
      let awayScore = Math.floor(Math.random() * 5);
      if (homeScore === awayScore) {
        if (homeScore < 4) homeScore += 1;
        else awayScore -= 1;
      }
      custom.matches[match.id] = {
        home: match.home,
        away: match.away,
        homeScore: String(homeScore),
        awayScore: String(awayScore),
        winner: homeScore > awayScore ? match.home : match.away
      };
    });
    renderAll();
    return;
  }
  groupKeys().forEach(group => {
    model.groups[group] = [...WORLD_CUP_GROUPS[group]];
    groupFixtures(group).forEach(match => {
      const score = getGroupMatch(model, match.id, match.home, match.away);
      score.home = String(Math.floor(Math.random() * 5));
      score.away = String(Math.floor(Math.random() * 5));
    });
    applyGroupStandings(model, group);
  });
  if (!autoAssignThirdsIfPossible(model)) {
    model.thirdAssignments = {};
    const thirds = getBestThirds(model);
    thirdMatchIds().forEach((id, index) => {
      model.thirdAssignments[id] = thirds[index]?.team || "";
    });
  }
  renderAll();
  setTimeout(() => {
    ALL_BRACKET_MATCHES.forEach(([id, leftSlot, rightSlot]) => {
      let leftScore = Math.floor(Math.random() * 5);
      let rightScore = Math.floor(Math.random() * 5);
      if (leftScore === rightScore) {
        if (leftScore < 4) leftScore += 1;
        else rightScore -= 1;
      }
      const left = resolveSlot(leftSlot, model, id);
      const right = resolveSlot(rightSlot, model, id);
      model.scores[id] = { left: String(leftScore), right: String(rightScore) };
      model.winners[id] = leftScore > rightScore ? left : right;
    });
    renderAll();
  }, 0);
}

function clearModel(model) {
  const fresh = createEmptyTournament();
  model.groups = fresh.groups;
  model.groupMatches = fresh.groupMatches;
  model.thirdAssignments = fresh.thirdAssignments;
  model.winners = fresh.winners;
  model.scores = fresh.scores;
  model.custom = fresh.custom;
  renderAll();
}

function renderAll() {
  const worldCupEditor = usesWorldCupEditor();
  const phase = currentPhase();
  const tournament = currentTournament();
  const dateMode = state.currentMode === "date" && phase.id !== "all";
  const groupMatchdayId = worldCupEditor && GROUP_PHASE_IDS.includes(phase.id) ? phase.id : "";
  const matchIds = worldCupEditor && phase.type === "matches" ? (phase.matchIds || []) : null;
  const showGroups = !worldCupEditor || phase.id === "all" || (phase.type === "groups" && !dateMode);
  const showMatchday = worldCupEditor && dateMode && phase.type === "groups";
  const showBracket = worldCupEditor && (phase.id === "all" || phase.type === "matches");
  const showThirds = worldCupEditor && (phase.id === "all" || (phase.id === "r32" && !tournament?.realResults));
  document.querySelectorAll("[data-worldcup-editor]").forEach(element => {
    element.hidden = !worldCupEditor;
  });
  document.querySelectorAll("[data-custom-editor]").forEach(element => {
    element.hidden = worldCupEditor;
  });
  document.querySelectorAll("[data-worldcup-stage='bracket']").forEach(element => {
    element.hidden = !worldCupEditor || !showBracket;
  });
  document.querySelectorAll("[data-worldcup-stage='thirds']").forEach(element => {
    element.hidden = !worldCupEditor || !showThirds;
  });

  if (worldCupEditor) {
    const predictionModel = phaseRenderModel();
    const groupsGrid = document.getElementById("groupsGrid");
    const matchdayGrid = document.getElementById("matchdayGrid");
    const realGroupsGrid = document.getElementById("realGroupsGrid");
    const thirdsPanel = document.getElementById("thirdsPanel");
    const realThirdsPanel = document.getElementById("realThirdsPanel");
    const bracket = document.getElementById("bracket");
    const realBracket = document.getElementById("realBracket");
    if (groupsGrid) groupsGrid.hidden = !showGroups;
    if (matchdayGrid) matchdayGrid.hidden = !showMatchday;
    if (realGroupsGrid) realGroupsGrid.hidden = false;
    if (thirdsPanel) thirdsPanel.hidden = !showThirds;
    if (realThirdsPanel) realThirdsPanel.hidden = false;
    if (bracket) bracket.hidden = !showBracket;
    if (realBracket) realBracket.hidden = false;
    renderGroups("groupsGrid", state.prediction, "prediction", { matchdayId: groupMatchdayId });
    renderMatchdayMatches("matchdayGrid", state.prediction, "prediction", groupMatchdayId);
    renderGroups("realGroupsGrid", state.real, "real");
    renderThirdAssignments("thirdsPanel", predictionModel);
    renderThirdAssignments("realThirdsPanel", state.real);
    renderBracket("bracket", predictionModel, "prediction", { matchIds });
    renderBracket("realBracket", state.real, "real");
  } else {
    renderCustomSheet("customSheet", state.prediction, "prediction");
    renderCustomSheet("realCustomSheet", state.real, "real");
  }
  renderPhaseStatus();
  setPredictionLocked(isEntryClosed());
}

function buildPayload() {
  const activeUser = state.companySession?.user || (state.tenantAccessGranted ? state.globalSession?.user : null);
  const fallbackName = document.getElementById("playerName").value.trim();
  const fallbackEmail = document.getElementById("playerEmail").value.trim();
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    tournamentId: state.currentTournamentId,
    player: {
      name: activeUser?.name || state.globalSession?.user?.name || fallbackName || "Jugador",
      email: activeUser?.email || state.globalSession?.user?.email || fallbackEmail || "",
      area: state.companySession?.user?.area || ""
    },
    phaseId: state.currentPhaseId,
    tournament: state.prediction
  };
}

async function apiJson(url, options = {}) {
  const response = await fetch(apiUrl(url), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? (() => {
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  })() : {};
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
  return data;
}

function renderTournamentControls() {
  const select = document.getElementById("tournamentSelect");
  if (select) {
    select.innerHTML = state.tournaments
      .map(tournament => `<option value="${tournament.id}">${tournament.name}</option>`)
      .join("");
    select.value = state.currentTournamentId;
  }

  const list = document.getElementById("tournamentList");
  if (!list) return;
  if (state.tenantId) {
    renderCompanyAreas();
    return;
  }
  list.innerHTML = state.tournaments.map(tournament => `
    <article class="tournament-card">
        <div>
          <h3>${tournament.name}</h3>
          <p>${tournament.isGlobal ? "Ranking global" : `Torneo privado - ${tournament.templateName || "Plantilla"}`}</p>
        </div>
      <div class="tournament-actions">
        <strong>${tournament.players} jugadores</strong>
        <button class="secondary view-leaderboard" type="button" data-tournament-id="${tournament.id}">Ver leaderboard</button>
      </div>
    </article>
  `).join("");
  list.querySelectorAll(".view-leaderboard").forEach(button => {
    button.addEventListener("click", () => openTournamentLeaderboard(button.dataset.tournamentId));
  });
}

async function openTournamentLeaderboard(tournamentId) {
  state.currentTournamentId = tournamentId;
  renderTournamentControls();
  renderAll();
  const panel = document.getElementById("tournamentResults");
  if (panel) panel.hidden = false;
  const title = document.getElementById("selectedTournamentTitle");
  if (title) title.textContent = state.tenantId && state.leaderboardArea
    ? `Leaderboard - ${state.leaderboardArea}`
    : `Leaderboard - ${currentTournament()?.name || "Torneo"}`;
  await loadLeaderboard();
  if (!state.tenantId) panel?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadTournaments() {
  try {
    const joined = joinedTournamentCodes().join(",");
    const params = new URLSearchParams();
    params.set("joined", joined);
    if (state.tenantId) params.set("tenant", state.tenantId);
    if (state.globalSession?.token) params.set("globalSessionToken", state.globalSession.token);
    const data = await apiJson(`/api/tournaments?${params.toString()}`);
    state.tournaments = data.tournaments || [];
    if (!state.tournaments.some(tournament => tournament.id === state.currentTournamentId)) {
      state.currentTournamentId = state.tournaments[0]?.id || "global";
    }
    renderTournamentControls();
    renderAll();
    if (state.tenantId && state.currentTournamentId) {
      const panel = document.getElementById("tournamentResults");
      if (panel) panel.hidden = false;
      const title = document.getElementById("selectedTournamentTitle");
      if (title) title.textContent = `Leaderboard - ${state.tenant?.name || "Empresa"}`;
      renderCompanyAreas();
    }
    const inviteCode = initialTournamentCode();
    if (inviteCode && !state.inviteHandled) {
      state.inviteHandled = true;
      const name = window.prompt("Nombre exacto del torneo privado:");
      if (!name) return;
      joinTournamentByCode(inviteCode, name, true).catch(error => {
        const status = document.getElementById("tournamentStatus");
        if (status) {
          status.hidden = false;
          status.textContent = `No se pudo unir al torneo: ${error.message}`;
        }
      });
    }
    await loadLeaderboard();
  } catch (error) {
    state.tournaments = [{ id: "global", name: "Global", code: "GLOBAL", isGlobal: true, players: 0 }];
    renderTournamentControls();
  }
}

async function loadContinuation() {
  const token = initialContinueToken();
  if (!token) return;
  try {
    const data = await apiJson(`/api/continue-prode?token=${encodeURIComponent(token)}`);
    if (data.player) {
      document.getElementById("playerName").value = data.player.name || "";
      document.getElementById("playerEmail").value = data.player.email || "";
    }
    if (data.prediction) state.prediction = data.prediction;
    if (data.tournament?.code) rememberTournamentCode(data.tournament.code);
    await loadTournaments();
    if (data.tournament?.id) state.currentTournamentId = data.tournament.id;
    const requestedPhase = phaseFromUrl();
    if (requestedPhase && state.phases.some(phase => phase.id === requestedPhase)) {
      state.currentPhaseId = requestedPhase;
    } else if (data.phaseId && state.phases.some(phase => phase.id === data.phaseId)) {
      state.currentPhaseId = data.phaseId;
    }
    state.currentMode = state.currentPhaseId === "all" ? "full" : "date";
    const modeSelect = document.getElementById("predictionMode");
    if (modeSelect) modeSelect.value = state.currentMode;
    renderTournamentControls();
    renderPhaseSelector();
    renderAll();
    document.getElementById("tournamentSelect").value = state.currentTournamentId;
  } catch (error) {
    alert(`No se pudo abrir el link de continuacion: ${error.message}`);
  }
}

function scoringFromForm() {
  return {
    groupPosition: Number(document.getElementById("scoreGroup").value),
    knockoutWinner: Number(document.getElementById("scoreWinner").value),
    exactScore: Number(document.getElementById("scoreExact").value),
    champion: Number(document.getElementById("scoreChampion").value)
  };
}

function customTemplateFromForm(templateId) {
  if (templateId !== "custom") return null;
  const teams = document.getElementById("customTeams").value
    .split(/\r?\n|,/)
    .map(team => team.trim())
    .filter(Boolean);
  return {
    name: document.getElementById("tournamentName").value.trim(),
    mode: document.getElementById("modeSelect").value,
    teams
  };
}

async function createTournament({ name, code, creatorEmail, templateId, mode, scoring, customTemplate }) {
  const data = await apiJson("/api/tournaments", {
    method: "POST",
    body: JSON.stringify({ name, code, creatorEmail, templateId, mode, scoring, customTemplate, tenantId: state.tenantId })
  });
  state.currentTournamentId = data.tournament.id;
  rememberTournamentCode(data.tournament.code);
  rememberCreatorKey(data.tournament.id, data.creatorKey);
  await loadTournaments();
  await openTournamentLeaderboard(data.tournament.id);
  return data.tournament;
}

async function joinTournamentByCode(code, name = "", showMessage = true) {
  const normalized = String(code || "").trim().toUpperCase();
  const status = document.getElementById("tournamentStatus");
  const data = await apiJson("/api/join-tournament", {
    method: "POST",
    body: JSON.stringify({ name, code: normalized, tenantId: state.tenantId })
  });
  rememberTournamentCode(data.tournament.code);
  await loadTournaments();
  const tournament = state.tournaments.find(item => item.id === data.tournament.id);
  state.currentTournamentId = tournament.id;
  renderTournamentControls();
  renderAll();
  document.getElementById("tournamentSelect").value = tournament.id;
  if (showMessage && status) {
    status.hidden = false;
    status.textContent = `Te uniste a ${tournament.name}. Tu prode quedara asociado al email que cargues.`;
  }
  return true;
}

async function loginCompanyUser({ name, email, password, area }) {
  const data = await apiJson("/api/company-login", {
    method: "POST",
    body: JSON.stringify({ tenantId: state.tenantId, name, email, password, area })
  });
  state.tenant = data.tenant || state.tenant;
  state.dailyGamePlays = data.dailyGamePlays || {};
  saveCompanySession({ token: data.token, user: data.user });
  document.getElementById("playerName").value = data.user.name || "";
  document.getElementById("playerEmail").value = data.user.email || "";
  state.leaderboardArea = data.user.area || "";
  renderCompanyAuth();
  renderCompanyAreas();
  renderDailyGames();
  syncAdminNavigation();
  await loadLeaderboard();
  return data.user;
}

async function createCompanyArea(name) {
  const data = await apiJson("/api/company-areas", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      name
    })
  });
  state.tenant = data.tenant || state.tenant;
  renderCompanyAuth();
  renderCompanyAreas();
}

async function submitProde(payload) {
  return apiJson("/api/submit-prode", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      phaseId: state.currentPhaseId,
      payload
    })
  });
}

async function ensurePaymentBeforeSubmit(payload) {
  return true;
}

async function saveRealResults() {
  const result = await apiJson("/api/real-results", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      tenantId: state.tenantId,
      adminKey: state.adminKey,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      creatorKey: creatorKeyFor(state.currentTournamentId),
      realResults: state.real
    })
  });
  await loadTournaments();
  await loadLeaderboard();
  return result;
}

async function updateAdminUser({ email, name, area, active, isAdmin }) {
  return apiJson("/api/admin-users", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      adminKey: state.adminKey,
      email,
      name,
      area,
      active,
      isAdmin
    })
  });
}

function fillAdminThemeForm() {
  const form = document.getElementById("adminThemeForm");
  if (!form || !state.tenant) return;
  const theme = state.tenant.theme || {};
  document.getElementById("themeTitle").value = state.tenant.title || state.tenant.name || "";
  document.getElementById("themeDescription").value = state.tenant.description || "";
  document.getElementById("themeAccent").value = theme.accent || "#0d6b57";
  document.getElementById("themeBg").value = theme.bg || "#f5f1e8";
  document.getElementById("themePanel").value = theme.panel || "#fffaf1";
  document.getElementById("themeInk").value = theme.ink || "#15221f";
  document.getElementById("themeImage").value = theme.image || "";
}

function fillAdminGamesForm() {
  const form = document.getElementById("adminGamesForm");
  if (!form || !state.tenant) return;
  const games = state.tenant.games || {};
  document.getElementById("gamesEnabled").checked = games.enabled !== false;
  document.getElementById("gamesTitle").value = games.title || "Centro de minijuegos";
  document.getElementById("gamesIntro").value = games.intro || "Desafios rapidos para sumar ritmo al prode diario.";
  document.getElementById("gamesRewardName").value = games.rewardName || "Fan Points";
  document.getElementById("camisetadlePoints").value = Number(games.points?.camisetadle || 20);
  document.getElementById("challengePoints").value = Number(games.points?.desafio || 15);
  document.getElementById("camisetadleItems").value = (games.camisetas || [])
    .map(item => [item.date, item.player, item.number, item.team, item.tournament, item.hint].map(value => value || "").join(" | "))
    .join("\n");
  document.getElementById("challengeItems").value = (games.desafios || [])
    .map(item => [item.date, item.type, item.answer, item.title, item.subtitle, (item.clues || []).join("; ")].map(value => value || "").join(" | "))
    .join("\n");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

async function saveAdminTheme() {
  const imageFile = document.getElementById("themeImageFile").files?.[0];
  const image = imageFile ? await fileToDataUrl(imageFile) : document.getElementById("themeImage").value.trim();
  const data = await apiJson("/api/admin-theme", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      adminKey: state.adminKey,
      title: document.getElementById("themeTitle").value.trim(),
      description: document.getElementById("themeDescription").value.trim(),
      theme: {
        accent: document.getElementById("themeAccent").value,
        bg: document.getElementById("themeBg").value,
        panel: document.getElementById("themePanel").value,
        ink: document.getElementById("themeInk").value,
        image
      }
    })
  });
  applyTenantTheme(data.tenant);
}

function parseCamisetadleItems(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line, index) => {
      const parts = line.split("|").map(item => item.trim());
      const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(parts[0] || "");
      const [date, player, number, team, tournament, hint] = hasDate ? parts : ["", ...parts];
      return { id: `custom-${index + 1}`, date, player, number, team, tournament, hint };
    })
    .filter(item => item.player && item.number);
}

function parseChallengeItems(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line, index) => {
      const parts = line.split("|").map(item => item.trim());
      const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(parts[0] || "");
      const [date, type, answer, title, subtitle, clues] = hasDate ? parts : ["", ...parts];
      return {
        id: `challenge-${index + 1}`,
        date,
        type: type || "otro",
        answer,
        title,
        subtitle,
        clues: String(clues || "").split(";").map(item => item.trim()).filter(Boolean)
      };
    })
    .filter(item => item.answer);
}

async function saveAdminGames() {
  const data = await apiJson("/api/admin-games", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      adminKey: state.adminKey,
      games: {
        enabled: document.getElementById("gamesEnabled").checked,
        title: document.getElementById("gamesTitle").value.trim(),
        intro: document.getElementById("gamesIntro").value.trim(),
        rewardName: document.getElementById("gamesRewardName").value.trim(),
        points: {
          camisetadle: Number(document.getElementById("camisetadlePoints").value || 0),
          desafio: Number(document.getElementById("challengePoints").value || 0)
        },
        camisetas: parseCamisetadleItems(document.getElementById("camisetadleItems").value),
        desafios: parseChallengeItems(document.getElementById("challengeItems").value)
      }
    })
  });
  state.tenant = data.tenant || state.tenant;
  renderDailyGames();
  fillAdminGamesForm();
}

async function loadAdminSummary() {
  const status = document.getElementById("adminStatus");
  const usersPanel = document.getElementById("adminUsers");
  if (!usersPanel) return;
  const params = new URLSearchParams();
  if (state.adminKey) params.set("adminKey", state.adminKey);
  if (state.companySession?.token) params.set("sessionToken", state.companySession.token);
  if (state.globalSession?.token) params.set("globalSessionToken", state.globalSession.token);
  if (state.tenantId) params.set("tenant", state.tenantId);
  const data = await apiJson(`/api/admin-summary?${params.toString()}`);
  document.getElementById("adminDashboard").hidden = false;
  document.getElementById("adminLoginForm").hidden = true;
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  if (!data.users.length) {
    usersPanel.innerHTML = `<p class="empty">Todavia no hay usuarios registrados.</p>`;
    return;
  }
  usersPanel.innerHTML = data.users.map(user => {
    const disabled = user.registered === false ? "disabled" : "";
    const adminDisabled = disabled || !state.companySession?.user?.isSuperAdmin ? "disabled" : "";
    const roleLabel = user.isSuperAdmin ? "Superadmin" : user.isAdmin ? "Admin" : "Jugador";
    return `
    <form class="admin-user-row" data-admin-user="${escapeHtml(user.email)}">
      <span>
        <strong>${escapeHtml(user.email)}</strong>
        <small>${roleLabel} - ${user.registered === false ? "Prode sin usuario registrado" : user.hasPrediction ? "Con prode" : "Sin prode"} - ${user.completedPhases?.length ? escapeHtml(user.completedPhases.join(", ")) : "Sin fechas"}</small>
      </span>
      <label>
        Nombre
        <input name="name" value="${escapeHtml(user.name || "")}" placeholder="Nombre" ${disabled}>
      </label>
      <label>
        Area
        <input name="area" value="${escapeHtml(user.area || "")}" list="companyAreaOptions" placeholder="Area" ${disabled}>
      </label>
      <label class="inline-check">
        <input name="isAdmin" type="checkbox" ${user.isAdmin ? "checked" : ""} ${adminDisabled}>
        Admin
      </label>
      <label class="inline-check">
        <input name="active" type="checkbox" ${user.active === false ? "" : "checked"} ${disabled}>
        Activo
      </label>
      <div class="admin-user-actions">
        <button type="submit" ${disabled}>Guardar</button>
        <button class="secondary admin-toggle-active" type="button" ${disabled}>${user.active === false ? "Reactivar" : "Dar de baja"}</button>
      </div>
    </form>
  `}).join("");
  usersPanel.querySelectorAll("[data-admin-user]").forEach(form => {
    const submit = async activeOverride => {
      const statusText = form.querySelector("small");
      const payload = {
        email: form.dataset.adminUser,
        name: form.elements.name.value.trim(),
        area: form.elements.area.value.trim(),
        active: activeOverride ?? form.elements.active.checked,
        isAdmin: form.elements.isAdmin.checked
      };
      if (!payload.name || !payload.area) {
        alert("Nombre y area son obligatorios.");
        return;
      }
      try {
        await updateAdminUser(payload);
        await loadAdminSummary();
      } catch (error) {
        if (statusText) statusText.textContent = `No se pudo guardar: ${error.message}`;
      }
    };
    form.addEventListener("submit", event => {
      event.preventDefault();
      submit();
    });
    form.querySelector(".admin-toggle-active")?.addEventListener("click", () => {
      submit(!form.elements.active.checked);
    });
  });
}

async function loadLeaderboard() {
  const panel = document.getElementById("leaderboardPanel");
  if (!panel) return;
  const tournament = currentTournament();
  panel.innerHTML = `<p class="empty">Cargando tabla de ${tournament?.name || "torneo"}...</p>`;
  try {
    const fetchLeaderboard = area => {
      const params = new URLSearchParams({ tournamentId: state.currentTournamentId });
      if (state.tenantId) params.set("tenant", state.tenantId);
      if (state.companySession?.token) params.set("sessionToken", state.companySession.token);
      if (state.globalSession?.token) params.set("globalSessionToken", state.globalSession.token);
      if (area) params.set("area", area);
      return apiJson(`/api/leaderboard?${params.toString()}`);
    };
    const data = await fetchLeaderboard("");
    if (state.tenantId) {
      const ownArea = state.leaderboardArea || state.companySession?.user?.area || "";
      const areaData = ownArea ? await fetchLeaderboard(ownArea) : null;
      panel.innerHTML = `
        ${renderLeaderboardBlock(data, "Tabla global", `Todos los usuarios de ${state.tenant?.name || "la empresa"}`)}
        ${areaData ? renderLeaderboardBlock(areaData, `Minitorneo ${ownArea}`, "Solo usuarios de esta area") : ""}
      `;
      return;
    }
    if (!data.leaderboard.length) {
      panel.innerHTML = `<p class="empty">Todavia no hay prodes guardados en ${data.tournament.name}.</p>`;
      return;
    }
    panel.innerHTML = renderLeaderboardBlock(data, data.tournament.name, data.hasRealResults ? "Puntaje calculado con resultados reales guardados." : "Sin resultados reales guardados: todos figuran con 0 puntos.");
  } catch (error) {
    panel.innerHTML = `<p class="empty">No se pudo cargar el leaderboard.</p>`;
  }
}

function renderLeaderboardBlock(data, title, subtitle) {
  if (!data.leaderboard.length) {
    return `<p class="empty">Todavia no hay prodes guardados en ${title}.</p>`;
  }
  return `
      <div class="leaderboard-head">
        <div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
        <strong>${data.leaderboard.length} jugadores</strong>
      </div>
      <div class="leaderboard-table">
        ${data.leaderboard.map((row, index) => `
          <div class="leaderboard-row">
            <b>${index + 1}</b>
            <span>${row.player.name}<small>${row.player.area || "Participante"}</small></span>
            <strong>${row.score.points} pts</strong>
            <em>Campeon: ${row.champion || "Sin elegir"} | Grupo:${row.score.groupHits} Cruces:${row.score.winnerHits} Exactos:${row.score.exactScoreHits}</em>
          </div>
        `).join("")}
      </div>
    `;
}

function validatePayload(payload) {
  if (isEntryClosed()) {
    alert("La carga de prodes ya esta cerrada.");
    return false;
  }
  if (state.tenantId && !state.companySession && !state.tenantAccessGranted) {
    alert("Primero ingresa con tu usuario de empresa.");
    document.getElementById("companyLogin")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }
  if (!payload.player.name || !payload.player.email) {
    alert("Primero ingresa con tu usuario global.");
    openView("lobby");
    return false;
  }
  if (!usesWorldCupEditor()) {
    const custom = payload.tournament.custom || {};
    if (!custom.champion) {
      alert("Falta elegir campeon o ganador del torneo.");
      return false;
    }
    const hasMatch = Object.values(custom.matches || {}).some(match => match.winner || match.homeScore !== "" || match.awayScore !== "");
    if (!hasMatch) {
      alert("Completa al menos un partido de la planilla.");
      return false;
    }
    return true;
  }
  const phase = currentPhase();
  if (phase.type === "groups") {
    if (GROUP_PHASE_IDS.includes(phase.id)) {
      const missingMatch = groupMatchIdsForPhase(phase.id).find(id => {
        const score = payload.tournament.groupMatches?.[id];
        return !score || score.home === "" || score.away === "";
      });
      if (missingMatch) {
        alert(`Falta completar el partido ${missingMatch}.`);
        return false;
      }
      return true;
    }
    const missingGroup = groupKeys().find(group => payload.tournament.groups[group].every(Boolean) === false);
    if (missingGroup) {
      alert(`Falta completar el Grupo ${missingGroup}.`);
      return false;
    }
    return true;
  }
  if (phase.type === "matches") {
    const missingMatch = (phase.matchIds || []).find(id => !payload.tournament.winners[id]);
    if (missingMatch) {
      alert(`Falta elegir ganador en ${missingMatch.toUpperCase()}.`);
      return false;
    }
    return true;
  }
  const missingGroup = groupKeys().find(group => payload.tournament.groups[group].every(Boolean) === false);
  if (missingGroup) {
    alert(`Falta completar el Grupo ${missingGroup}.`);
    return false;
  }
  if (!payload.tournament.winners.m104) {
    alert("Falta elegir el campeon.");
    return false;
  }
  return true;
}

function normalizeLiveMatch(match) {
  return {
    id: match.id || "",
    date: match.date || "",
    stage: match.stage || "Partido",
    group: match.group || "",
    home: match.home || "",
    away: match.away || "",
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status || "programado"
  };
}

function renderLiveResults() {
  const status = document.getElementById("liveStatus");
  const grid = document.getElementById("liveGrid");
  const updated = state.live.updatedAt
    ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(state.live.updatedAt))
    : "sin fecha";
  status.textContent = `Ultima actualizacion: ${updated}. Fuente: ${state.live.source || "sin fuente"}.`;
  grid.innerHTML = "";

  if (!state.live.matches.length) {
    grid.innerHTML = `<div class="empty-live">Todavia no hay resultados cargados. Cuando empiece el Mundial, aca van a aparecer los partidos del dia anterior.</div>`;
    return;
  }

  state.live.matches.map(normalizeLiveMatch).forEach(match => {
    const finished = match.status === "finalizado" || match.homeScore !== undefined || match.awayScore !== undefined;
    const card = document.createElement("article");
    card.className = "live-card";
    card.innerHTML = `
      <div class="live-meta">
        <span>${match.stage}${match.group ? ` - Grupo ${match.group}` : ""}</span>
        <strong>${match.date || "Fecha a confirmar"}</strong>
      </div>
      <div class="live-score">
        ${teamBadge(match.home)}
        <b>${finished ? `${match.homeScore ?? "-"} - ${match.awayScore ?? "-"}` : "vs"}</b>
        ${teamBadge(match.away)}
      </div>
      <div class="live-state">${match.status}</div>
    `;
    grid.appendChild(card);
  });
}

async function loadLiveResults() {
  const status = document.getElementById("liveStatus");
  status.textContent = "Actualizando resultados...";
  try {
    const response = await fetch(`${apiUrl(APP_CONFIG.liveResultsUrl)}?t=${Date.now()}`);
    if (!response.ok) throw new Error("No se pudo leer resultados");
    const data = await response.json();
    state.live = {
      updatedAt: data.updatedAt || "",
      source: data.source || "",
      matches: Array.isArray(data.matches) ? data.matches : []
    };
    renderLiveResults();
  } catch (error) {
    status.textContent = "No se pudieron cargar los resultados en vivo.";
  }
}

function escapePdfText(text) {
  return String(text).replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "");
}

function createPdfBlob(payload) {
  const definition = tournamentDefinition();
  const customLines = payload.tournament.custom ? [
    `Torneo: ${definition.name}`,
    `Ganador: ${payload.tournament.custom.champion || ""}`,
    "",
    "Partidos:",
    ...Object.entries(payload.tournament.custom.matches || {}).map(([match, value]) => {
      const score = value.homeScore !== "" || value.awayScore !== "" ? ` ${value.homeScore || 0}-${value.awayScore || 0}` : "";
      return `${match.toUpperCase()}: ${value.home} vs ${value.away}${score} | ${value.winner || "sin ganador"}`;
    })
  ] : [];
  const worldCupLines = [
    `Campeon: ${payload.tournament.winners.m104}`,
    "",
    ...groupKeys().map(group => `Grupo ${group}: ${payload.tournament.groups[group].join(" | ")}`),
    "",
    "Cruces:",
    ...Object.entries(payload.tournament.winners).map(([match, winner]) => {
      const score = scoreLabel(payload.tournament.scores?.[match]);
      return `${match.toUpperCase()}: ${winner}${score ? ` (${score})` : ""}`;
    })
  ];
  const lines = [
    "Prode",
    `Jugador: ${payload.player.name}`,
    `Email: ${payload.player.email}`,
    ...(usesWorldCupEditor() ? worldCupLines : customLines)
  ].slice(0, 58);

  const stream = [
    "BT",
    "/F1 14 Tf",
    "50 790 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -18 Td",
      `(${escapePdfText(line)}) Tj`
    ]),
    "ET"
  ].filter(Boolean).join("\n");

  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach(object => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xref}\n%%EOF\n`;
  pdf += `\n%%PRODEMUNDIAL_DATA_BEGIN:${encoded}:PRODEMUNDIAL_DATA_END\n`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getFileName(payload) {
  const safeName = payload.player.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `prode-${safeName || "jugador"}.pdf`;
}

function scoreTournament(prediction, real) {
  if (prediction.custom || real.custom) {
    const realMatches = real.custom?.matches || {};
    const predictionMatches = prediction.custom?.matches || {};
    let winnerHits = 0;
    let winnerTotal = 0;
    let exactScoreHits = 0;
    let exactScoreTotal = 0;
    Object.keys(realMatches).forEach(id => {
      if (realMatches[id].winner) {
        winnerTotal += 1;
        if (predictionMatches[id]?.winner === realMatches[id].winner) winnerHits += 1;
      }
      if (realMatches[id].homeScore !== "" || realMatches[id].awayScore !== "") {
        exactScoreTotal += 1;
        if (
          predictionMatches[id]?.homeScore === realMatches[id].homeScore &&
          predictionMatches[id]?.awayScore === realMatches[id].awayScore
        ) {
          exactScoreHits += 1;
        }
      }
    });
    const championHit = Boolean(real.custom?.champion && prediction.custom?.champion === real.custom.champion);
    return {
      groupHits: 0,
      groupTotal: 0,
      winnerHits,
      winnerTotal,
      exactScoreHits,
      exactScoreTotal,
      points: winnerHits * 3 + exactScoreHits * 2 + (championHit ? 10 : 0),
      championHit
    };
  }
  let groupHits = 0;
  let groupTotal = 0;
  groupKeys().forEach(group => {
    [0, 1, 2, 3].forEach(index => {
      groupTotal += 1;
      if (prediction.groups[group][index] && prediction.groups[group][index] === real.groups[group][index]) {
        groupHits += 1;
      }
    });
  });

  const matchIds = ALL_BRACKET_MATCHES.map(item => item[0]);
  let winnerHits = 0;
  let winnerTotal = 0;
  let exactScoreHits = 0;
  let exactScoreTotal = 0;
  Object.keys(real.groupMatches || {}).forEach(id => {
    const realScore = real.groupMatches[id];
    const predictionScore = prediction.groupMatches?.[id];
    const realResult = matchScores(realScore);
    const predictionResult = matchScores(predictionScore || {});
    if (!realResult || realResult.home === null || realResult.away === null) return;
    if (!predictionResult || predictionResult.home === null || predictionResult.away === null) return;
    const realOutcome = Math.sign(realResult.home - realResult.away);
    const predictionOutcome = Math.sign(predictionResult.home - predictionResult.away);
    winnerTotal += 1;
    if (realOutcome === predictionOutcome) winnerHits += 1;
    exactScoreTotal += 1;
    if (realResult.home === predictionResult.home && realResult.away === predictionResult.away) exactScoreHits += 1;
  });
  matchIds.forEach(id => {
    if (real.winners[id]) {
      winnerTotal += 1;
      if (prediction.winners[id] === real.winners[id]) winnerHits += 1;
    }
    if (scoreLabel(real.scores?.[id])) {
      exactScoreTotal += 1;
      if (scoreLabel(prediction.scores?.[id]) === scoreLabel(real.scores?.[id])) {
        exactScoreHits += 1;
      }
    }
  });

  return {
    groupHits,
    groupTotal,
    winnerHits,
    winnerTotal,
    exactScoreHits,
    exactScoreTotal,
    points: groupHits + winnerHits * 3 + exactScoreHits * 2,
    championHit: prediction.winners.m104 && prediction.winners.m104 === real.winners.m104
  };
}

function renderScore(payload) {
  return scoreTournament(payload.tournament, state.real);
}

function extractPayloadFromPdf(text) {
  const match = text.match(/%%PRODEMUNDIAL_DATA_BEGIN:([A-Za-z0-9+/=]+):PRODEMUNDIAL_DATA_END/);
  if (!match) return null;
  return JSON.parse(decodeURIComponent(escape(atob(match[1]))));
}

function openView(viewId) {
  if (state.tenantId && state.tenantAccessGranted && viewId === "lobby") viewId = "predictor";
  const tab = document.querySelector(`.tab[data-view="${viewId}"]`);
  const view = document.getElementById(viewId);
  if (!tab || !view) return;
  state.currentView = viewId;
  document.querySelectorAll(".tab").forEach(item => item.classList.remove("is-active"));
  document.querySelectorAll(".view").forEach(item => item.classList.remove("is-visible"));
  tab.classList.add("is-active");
  view.classList.add("is-visible");
  renderCompanyAuth();
  syncTenantNavigation();
  if (viewId === "lobby") loadGlobalLobby().catch(() => renderGlobalLobby());
  if (viewId === "games") {
    if (state.tenantId) renderDailyGames();
    else loadGlobalGames().catch(() => renderDailyGames());
  }
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    if (!tab.dataset.view) return;
    if (state.tenantId && state.tenantAccessGranted && tab.dataset.view === "lobby") {
      openView("predictor");
      return;
    }
    state.currentView = tab.dataset.view;
    document.querySelectorAll(".tab").forEach(item => item.classList.remove("is-active"));
    document.querySelectorAll(".view").forEach(item => item.classList.remove("is-visible"));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.view).classList.add("is-visible");
    renderCompanyAuth();
    syncTenantNavigation();
    if (tab.dataset.view === "games") {
      if (state.tenantId) renderDailyGames();
      else loadGlobalGames().catch(() => renderDailyGames());
    }
    if (tab.dataset.view === "lobby") loadGlobalLobby().catch(() => renderGlobalLobby());
    if (tab.dataset.view === "live") loadLiveResults();
    if (tab.dataset.view === "tournaments") renderTournamentControls();
    if (tab.dataset.view === "admin") {
      updateAdminSections(state.adminSection);
      fillAdminThemeForm();
      fillAdminGamesForm();
      if (canUseAdminPanel()) {
        state.adminUnlocked = true;
        document.getElementById("adminLoginForm").hidden = true;
        loadAdminSummary();
      } else if (state.adminUnlocked) {
        loadAdminSummary();
      } else {
        document.getElementById("adminLoginForm").hidden = false;
        document.getElementById("adminDashboard").hidden = true;
      }
    }
  });
});

document.querySelectorAll(".admin-subtab").forEach(tab => {
  tab.addEventListener("click", () => {
    updateAdminSections(tab.dataset.adminSection || "users");
    fillAdminThemeForm();
    fillAdminGamesForm();
    if (canUseAdminPanel()) {
      loadAdminSummary().catch(error => {
        const status = document.getElementById("adminStatus");
        if (status) {
          status.hidden = false;
          status.textContent = `No se pudo cargar admin: ${error.message}`;
        }
      });
    }
  });
});

document.getElementById("autoFill").addEventListener("click", () => fillModel(state.prediction));
document.getElementById("clearPredictions").addEventListener("click", () => clearModel(state.prediction));
document.getElementById("autoReal").addEventListener("click", () => {
  state.real = JSON.parse(JSON.stringify(state.prediction));
  renderAll();
});
document.getElementById("clearReal").addEventListener("click", () => clearModel(state.real));
document.getElementById("refreshLive").addEventListener("click", loadLiveResults);
document.getElementById("refreshLeaderboard").addEventListener("click", loadLeaderboard);
document.getElementById("toggleResultsAdmin").addEventListener("click", () => {
  document.querySelector('[data-admin-section="results"]')?.click();
});
document.getElementById("adminLoginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("adminStatus");
  state.adminKey = document.getElementById("adminKey").value;
  status.hidden = false;
  status.textContent = "Validando admin...";
  try {
    await loadAdminSummary();
    state.adminUnlocked = true;
    syncAdminNavigation();
  } catch (error) {
    status.textContent = `No se pudo abrir admin: ${error.message}`;
  }
});
document.getElementById("refreshAdminUsers").addEventListener("click", () => {
  loadAdminSummary().catch(error => {
    const status = document.getElementById("adminStatus");
    status.hidden = false;
    status.textContent = `No se pudo actualizar: ${error.message}`;
  });
});
document.getElementById("adminThemeForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("adminStatus");
  try {
    await saveAdminTheme();
    status.hidden = false;
    status.textContent = "Personalizacion guardada.";
  } catch (error) {
    status.hidden = false;
    status.textContent = `No se pudo guardar la personalizacion: ${error.message}`;
  }
});
document.getElementById("adminGamesForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("adminStatus");
  try {
    await saveAdminGames();
    status.hidden = false;
    status.textContent = "Juegos guardados.";
  } catch (error) {
    status.hidden = false;
    status.textContent = `No se pudieron guardar los juegos: ${error.message}`;
  }
});
document.getElementById("saveRealResults").addEventListener("click", async () => {
  try {
    const result = await saveRealResults();
    const mail = result?.mail;
    const mailText = mail?.error
      ? ` No se enviaron correos: ${mail.error}.`
      : mail
        ? ` Correos enviados: ${mail.sent || 0}.`
        : "";
    alert(`Resultados reales guardados para este torneo.${mailText}`);
  } catch (error) {
    alert(`No se pudieron guardar los resultados: ${error.message}`);
  }
});
document.getElementById("tournamentSelect").addEventListener("change", event => {
  state.currentTournamentId = event.target.value;
  renderTournamentControls();
  renderAll();
  loadLeaderboard();
});
document.getElementById("predictionMode").addEventListener("change", event => {
  state.currentMode = event.target.value;
  state.currentPhaseId = state.currentMode === "full" ? "all" : "group1";
  renderPhaseSelector();
  renderAll();
});
document.getElementById("predictionPhase").addEventListener("change", event => {
  state.currentPhaseId = event.target.value;
  renderAll();
});
document.getElementById("companyLoginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("companyLoginStatus");
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  status.hidden = false;
  if (!email || !password) {
    status.textContent = "Completa email y contrasena.";
    return;
  }
  status.textContent = "Ingresando...";
  try {
    await loginCompanyUser({ name: "", email, password, area: "" });
    document.getElementById("loginPassword").value = "";
    status.textContent = "Usuario listo. Ya podes guardar tu prode.";
  } catch (error) {
    status.textContent = error.message.includes("Name and area")
      ? "Ese email no existe todavia. Usa Crear usuario para darlo de alta."
      : `No se pudo ingresar: ${error.message}`;
  }
});
document.getElementById("globalLoginForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("globalLoginStatus");
  const email = document.getElementById("globalLoginEmail").value.trim();
  const password = document.getElementById("globalLoginPassword").value;
  status.hidden = false;
  if (!email || !password) {
    status.textContent = "Completa email/DNI y contrasena.";
    return;
  }
  status.textContent = "Ingresando al lobby...";
  try {
    await loginGlobalUser({ name: "", email, password });
    document.getElementById("globalLoginPassword").value = "";
    status.textContent = "Sesion global lista.";
  } catch (error) {
    status.textContent = error.message.includes("Name is required")
      ? "Ese usuario no existe todavia. Usa Crear usuario para darlo de alta."
      : `No se pudo ingresar: ${error.message}`;
  }
});
document.getElementById("openCreateGlobalUser")?.addEventListener("click", () => {
  const modal = document.getElementById("createGlobalUserModal");
  document.getElementById("createGlobalUserEmail").value = document.getElementById("globalLoginEmail").value.trim();
  modal.hidden = false;
});
document.getElementById("closeCreateGlobalUser")?.addEventListener("click", () => {
  document.getElementById("createGlobalUserModal").hidden = true;
});
document.getElementById("createGlobalUserModal")?.addEventListener("click", event => {
  if (event.target.id === "createGlobalUserModal") event.currentTarget.hidden = true;
});
document.getElementById("createGlobalUserForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("createGlobalUserStatus");
  const name = document.getElementById("createGlobalUserName").value.trim();
  const email = document.getElementById("createGlobalUserEmail").value.trim();
  const password = document.getElementById("createGlobalUserPassword").value;
  status.hidden = false;
  if (!email || !password || !name) {
    status.textContent = "Completa mail/DNI, contrasena y nombre.";
    return;
  }
  status.textContent = "Creando usuario...";
  try {
    await loginGlobalUser({ name, email, password });
    document.getElementById("createGlobalUserPassword").value = "";
    document.getElementById("createGlobalUserModal").hidden = true;
  } catch (error) {
    status.textContent = `No se pudo crear usuario: ${error.message}`;
  }
});
document.getElementById("closeUnlockTournament")?.addEventListener("click", () => {
  document.getElementById("unlockTournamentModal").hidden = true;
});
document.getElementById("unlockTournamentModal")?.addEventListener("click", event => {
  if (event.target.id === "unlockTournamentModal") event.currentTarget.hidden = true;
});
document.getElementById("unlockTournamentForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  await submitTournamentUnlock();
});
document.getElementById("logoutGlobalUser")?.addEventListener("click", () => {
  clearGlobalSession();
  state.dailyGamePlays = {};
  renderGlobalLobby();
  renderDailyGames();
  loadGlobalLobby().catch(() => {});
});
document.getElementById("openCreateLobbyTenant")?.addEventListener("click", () => {
  const modal = document.getElementById("createLobbyTenantModal");
  const nameInput = document.getElementById("createLobbyTenantName");
  const idInput = document.getElementById("createLobbyTenantId");
  const codeInput = document.getElementById("createLobbyTenantCode");
  const status = document.getElementById("createLobbyTenantStatus");
  if (nameInput) nameInput.value = "";
  if (idInput) idInput.value = "";
  if (codeInput) codeInput.value = "";
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  modal.hidden = false;
  setTimeout(() => nameInput?.focus(), 0);
});
document.getElementById("closeCreateLobbyTenant")?.addEventListener("click", () => {
  document.getElementById("createLobbyTenantModal").hidden = true;
});
document.getElementById("createLobbyTenantModal")?.addEventListener("click", event => {
  if (event.target.id === "createLobbyTenantModal") event.currentTarget.hidden = true;
});
document.getElementById("createLobbyTenantName")?.addEventListener("input", event => {
  const idInput = document.getElementById("createLobbyTenantId");
  const codeInput = document.getElementById("createLobbyTenantCode");
  const id = slugText(event.target.value);
  if (idInput && !idInput.dataset.touched) idInput.value = id;
  if (codeInput && !codeInput.dataset.touched) codeInput.value = id ? `EMPRESA-${id.toUpperCase()}` : "";
});
document.getElementById("createLobbyTenantId")?.addEventListener("input", event => {
  event.currentTarget.dataset.touched = "1";
});
document.getElementById("createLobbyTenantCode")?.addEventListener("input", event => {
  event.currentTarget.dataset.touched = "1";
});
document.getElementById("createLobbyTenantForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("createLobbyTenantStatus");
  const name = document.getElementById("createLobbyTenantName").value.trim();
  const id = document.getElementById("createLobbyTenantId").value.trim();
  const templateId = document.getElementById("createLobbyTenantTemplate").value;
  const code = document.getElementById("createLobbyTenantCode").value.trim();
  status.hidden = false;
  if (!name || !id || !code) {
    status.textContent = "Completa nombre, ID de URL y clave.";
    return;
  }
  status.textContent = "Creando torneo...";
  try {
    const data = await createLobbyTenant({ name, id, templateId, code });
    document.getElementById("createLobbyTenantModal").hidden = true;
    status.textContent = "";
    await loadGlobalLobby();
    const globalStatus = document.getElementById("globalLoginStatus");
    if (globalStatus) {
      globalStatus.hidden = false;
      globalStatus.textContent = `Torneo creado: ${data.tournament?.name || name}.`;
    }
  } catch (error) {
    status.textContent = `No se pudo crear: ${error.message}`;
  }
});
document.getElementById("openCreateUser").addEventListener("click", () => {
  const modal = document.getElementById("createUserModal");
  document.getElementById("createUserEmail").value = document.getElementById("loginEmail").value.trim();
  modal.hidden = false;
});
document.getElementById("closeCreateUser").addEventListener("click", () => {
  document.getElementById("createUserModal").hidden = true;
});
document.getElementById("logoutCompanyUser")?.addEventListener("click", () => {
  logoutCompanyUser();
});
document.getElementById("topbarSessionAction")?.addEventListener("click", () => {
  if (state.companySession) {
    logoutCompanyUser();
    return;
  }
  openView("predictor");
  renderCompanyAuth();
  document.getElementById("companyLogin")?.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.getElementById("createUserModal").addEventListener("click", event => {
  if (event.target.id === "createUserModal") event.currentTarget.hidden = true;
});
document.getElementById("createUserForm").addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("createUserStatus");
  const name = document.getElementById("createUserName").value.trim();
  const email = document.getElementById("createUserEmail").value.trim();
  const password = document.getElementById("createUserPassword").value;
  const area = document.getElementById("createUserArea").value.trim();
  status.hidden = false;
  if (!email || !password || !name || !area) {
    status.textContent = "Completa mail/DNI, contrasena, nombre y area.";
    return;
  }
  status.textContent = "Creando usuario...";
  try {
    await loginCompanyUser({ name, email, password, area });
    document.getElementById("createUserPassword").value = "";
    document.getElementById("createUserModal").hidden = true;
  } catch (error) {
    status.textContent = `No se pudo crear usuario: ${error.message}`;
  }
});
document.getElementById("companyAreaForm").addEventListener("submit", async event => {
  event.preventDefault();
  const input = document.getElementById("companyAreaName");
  const status = document.getElementById("companyAreaStatus");
  status.hidden = false;
  if (!state.companySession) {
    status.textContent = "Primero ingresa con un usuario de empresa.";
    return;
  }
  if (!input.value.trim()) {
    status.textContent = "Escribi el nombre del area.";
    return;
  }
  status.textContent = "Creando minitorneo...";
  try {
    await createCompanyArea(input.value.trim());
    state.leaderboardArea = input.value.trim();
    input.value = "";
    status.textContent = "Minitorneo creado.";
    await loadLeaderboard();
  } catch (error) {
    status.textContent = `No se pudo crear el minitorneo: ${error.message}`;
  }
});
document.getElementById("tournamentForm").addEventListener("submit", async event => {
  event.preventDefault();
  const input = document.getElementById("tournamentName");
  const codeInput = document.getElementById("tournamentCode");
  const creatorEmailInput = document.getElementById("creatorEmail");
  const status = document.getElementById("tournamentStatus");
  const name = input.value.trim();
  const code = codeInput.value.trim();
  const creatorEmail = creatorEmailInput.value.trim();
  if (!name || !code || !creatorEmail) {
    status.hidden = false;
    status.textContent = "Completa nombre, clave y email del creador.";
    return;
  }
  status.hidden = false;
  status.textContent = "Creando torneo...";
  try {
    const templateId = document.getElementById("templateSelect").value;
    const customTemplate = customTemplateFromForm(templateId);
    if (templateId === "custom" && (!customTemplate || customTemplate.teams.length < 2)) {
      status.textContent = "Para una plantilla custom carga al menos 2 equipos o jugadores.";
      return;
    }
    const tournament = await createTournament({
      name,
      code,
      creatorEmail,
      templateId,
      mode: document.getElementById("modeSelect").value,
      scoring: scoringFromForm(),
      customTemplate
    });
    const link = state.tenantId
      ? `${window.location.origin}/empresa/${encodeURIComponent(state.tenantId)}`
      : `${window.location.origin}${invitePathFor(tournament)}`;
    input.value = "";
    codeInput.value = "";
    creatorEmailInput.value = "";
    document.getElementById("customTeams").value = "";
    status.innerHTML = `
      Torneo creado. Guarda esta clave: <strong>${tournament.code}</strong><br>
      Link de invitacion: <strong>${link}</strong>
    `;
  } catch (error) {
    status.textContent = `No se pudo crear el torneo: ${error.message}`;
  }
});

document.getElementById("joinTournamentForm").addEventListener("submit", event => {
  event.preventDefault();
  joinTournamentByCode(
    document.getElementById("joinTournamentCode").value,
    document.getElementById("joinTournamentName").value
  ).catch(error => {
    const status = document.getElementById("tournamentStatus");
    status.hidden = false;
    status.textContent = `No se pudo unir al torneo: ${error.message}`;
  });
});

document.getElementById("savePrediction").addEventListener("click", async event => {
  event.preventDefault();
  const payload = buildPayload();
  if (!validatePayload(payload)) return;
  if (!await ensurePaymentBeforeSubmit(payload)) return;
  try {
    const result = await submitProde(payload);
    await loadTournaments();
    await loadLeaderboard();
    const nextPhase = state.phases.find(phase => phase.id === result.nextPhaseId);
    const link = result.nextPhaseUrl || result.continuationUrl;
    const mailText = result.mail?.sent
      ? " Te enviamos el link por correo."
      : result.mail?.error
        ? ` No se pudo enviar correo: ${result.mail.error}.`
        : "";
    alert(nextPhase
      ? `Prode guardado. Link para continuar con ${nextPhase.name}: ${link}${mailText}`
      : `Prode guardado. Link para continuar: ${link}${mailText}`);
  } catch (error) {
    alert(`No se pudo guardar el prode: ${error.message}`);
  }
});

document.getElementById("downloadPdf")?.addEventListener("click", async event => {
  event.preventDefault();
  const payload = buildPayload();
  if (!validatePayload(payload)) return;
  if (!await ensurePaymentBeforeSubmit(payload)) return;
  try {
    await submitProde(payload);
    await loadTournaments();
  } catch (error) {
    alert(`No se pudo guardar el prode: ${error.message}`);
    return;
  }
  downloadBlob(createPdfBlob(payload), getFileName(payload));
});

document.getElementById("sendEmail")?.addEventListener("click", async event => {
  event.preventDefault();
  const payload = buildPayload();
  if (!validatePayload(payload)) return;
  if (!await ensurePaymentBeforeSubmit(payload)) return;
  try {
    await submitProde(payload);
    await loadTournaments();
  } catch (error) {
    alert(`No se pudo guardar el prode: ${error.message}`);
    return;
  }
  const blob = createPdfBlob(payload);
  const filename = getFileName(payload);

  blobToBase64(blob)
    .then(pdfBase64 => fetch(apiUrl("/api/send-prode"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, pdfBase64, filename })
    }))
    .then(response => {
      if (!response.ok) throw new Error("Email server unavailable");
      alert("PDF enviado por correo.");
    })
    .catch(() => {
      downloadBlob(blob, filename);
      const subject = encodeURIComponent(`Prode Mundial 2026 - ${payload.player.name}`);
      const body = encodeURIComponent("Adjunto el PDF generado por la web del Prode Mundial 2026.");
      window.location.href = `mailto:${payload.player.email}?subject=${subject}&body=${body}`;
    });
});

document.getElementById("btnGoToPredictor")?.addEventListener("click", () => {
  document.querySelector('.tab[data-view="predictor"]')?.click();
});

async function init() {
  const bootTenantId = initialTenantId();
  if (bootTenantId) {
    state.tenantId = bootTenantId;
    syncTenantNavigation();
  }
  renderAll();
  await refreshGlobalSession();
  await loadTenant();
  if (state.tenantId && !state.tenantAccessGranted) openView("predictor");
  await loadTemplates();
  if (initialContinueToken()) {
    await loadContinuation();
  } else {
    await loadTournaments();
  }
  loadGlobalLobby().catch(() => {});
  loadLiveResults();
  setInterval(loadLiveResults, 30 * 60 * 1000);
}

init();
