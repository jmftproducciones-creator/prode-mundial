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

function appBasePath() {
  const configured = "/prode/global";
  return window.location.pathname === configured || window.location.pathname.startsWith(`${configured}/`) ? configured : "";
}

function appPath(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${appBasePath()}${normalized}`;
}

function localAppPath() {
  const base = appBasePath();
  if (!base) return window.location.pathname;
  return window.location.pathname.slice(base.length) || "/";
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
  paymentStatus: null,
  currentPhaseId: "all",
  currentResultsPhaseId: "group1",
  tenant: null,
  tenantId: "",
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
  return "";
}

function tenantQuery() {
  return state.tenantId ? `tenant=${encodeURIComponent(state.tenantId)}` : "";
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
  if (tournamentsHeading) tournamentsHeading.textContent = "Leaderboard";
  if (tournamentsIntro) tournamentsIntro.textContent = `Ranking propio de ${tenant.name}. Solo aparecen los prodes guardados desde este link.`;
  document.title = tenant.title || tenant.name;
}

async function loadTenant() {
  const tenantId = initialTenantId();
  if (!tenantId) return;
  state.tenantId = tenantId;
  try {
    const data = await apiJson(`/api/tenant?tenant=${encodeURIComponent(tenantId)}`);
    applyTenantTheme(data.tenant);
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

function resultsAdminPassword() {
  return sessionStorage.getItem("resultsAdminPassword") || "";
}

function askResultsAdminPassword() {
  const saved = resultsAdminPassword();
  if (saved) return saved;
  const password = window.prompt("Contraseña para cargar resultados reales:");
  if (password) sessionStorage.setItem("resultsAdminPassword", password);
  return password || "";
}

function invitePathFor(tournament) {
  return tournament.invitePath || appPath(`/join/${encodeURIComponent(tournament.code || "")}`);
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
  const pathMatch = localAppPath().match(/^\/join\/([^/]+)/);
  return pathMatch ? decodeURIComponent(pathMatch[1]) : params.get("torneo") || params.get("tournament") || "";
}

function initialContinueToken() {
  const params = new URLSearchParams(window.location.search);
  const pathMatch = localAppPath().match(/^\/continuar\/([^/]+)/);
  return pathMatch ? decodeURIComponent(pathMatch[1]) : params.get("continuar") || params.get("token") || "";
}

function phaseFromUrl() {
  const phase = new URLSearchParams(window.location.search).get("fase") || "";
  return phase === "groups" ? "group1" : phase;
}

function isResultsAdminPath() {
  const path = localAppPath().replace(/\/$/, "");
  return path === "/resultados" || path === "/cargar-resultados";
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

function resultPhases() {
  return state.phases.filter(phase => phase.id !== "all");
}

function currentResultsPhase() {
  return resultPhases().find(phase => phase.id === state.currentResultsPhaseId) || resultPhases()[0] || { id: "group1", name: "Fecha 1 - Grupos", type: "groups" };
}

function renderPhaseSelector() {
  const select = document.getElementById("predictionPhase");
  if (!select) return;
  const phase = currentPhase();
  let options = [
    { id: "all", name: "Prode completo" },
    { id: "group1", name: "Pronosticar poco a poco" }
  ];
  if (!options.some(option => option.id === phase.id)) {
    options = [{ id: phase.id, name: phase.name }];
  }
  select.innerHTML = options.map(option => `<option value="${option.id}">${option.name}</option>`).join("");
  select.value = state.currentPhaseId;
  select.disabled = !options.some(option => option.id === "all") || isEntryClosed();
  renderPhaseStatus();
}

function renderResultsPhaseControls() {
  const select = document.getElementById("resultsPhase");
  if (!select) return;
  const phases = resultPhases();
  if (!phases.some(phase => phase.id === state.currentResultsPhaseId)) {
    state.currentResultsPhaseId = phases[0]?.id || "group1";
  }
  const phase = currentResultsPhase();
  const index = phases.findIndex(item => item.id === phase.id);
  select.innerHTML = phases.map(item => `<option value="${item.id}">${item.name}</option>`).join("");
  select.value = phase.id;
  const previous = document.getElementById("previousResultsPhase");
  const next = document.getElementById("nextResultsPhase");
  if (previous) previous.disabled = index <= 0;
  if (next) next.disabled = index < 0 || index >= phases.length - 1;
  const status = document.getElementById("resultsPhaseStatus");
  if (status) {
    status.textContent = phase.type === "groups"
      ? "Carga los marcadores reales de esta fecha. En Fecha 3 tambien podes ordenar la tabla final de grupos."
      : "Carga los cruces reales de esta ronda. Al guardar, se avisa por email a quienes tengan que pronosticar la siguiente fase.";
  }
}

function renderPhaseStatus() {
  const status = document.getElementById("phaseStatus");
  if (!status) return;
  const phase = currentPhase();
  const tournament = currentTournament();
  const usingReal = usesWorldCupEditor(tournament) && phase.id !== "all" && phase.type === "matches" && Boolean(tournament?.realResults);
  status.textContent = phase.description || phase.name;
  if (usingReal) {
    status.textContent += " Los cruces se arman con los resultados reales cargados por el administrador.";
  } else if (usesWorldCupEditor(tournament) && phase.type === "matches") {
    status.textContent += " Cuando el administrador cargue resultados reales, esta ronda usara esos cruces automaticamente.";
  }
}

function setPredictionLocked(locked) {
  document.querySelectorAll("#predictor input, #predictor select, #predictor button").forEach(element => {
    element.disabled = locked;
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
    teams: tournament?.customTemplate?.teams || tournament?.teams || template.teams || []
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

function allowedThirdPlaceTeams(model, matchId) {
  const allowedGroups = THIRD_PLACE_SLOTS[matchId] || [];
  return allowedGroups
    .map(group => ({ group, team: model.groups[group]?.[2] || "" }))
    .filter(item => item.team);
}

function thirdMatchIds() {
  return R32_MATCHES.filter(([, , rightSlot]) => rightSlot === "3*").map(([id]) => id);
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

  const usedTeams = Object.values(model.thirdAssignments || {}).filter(Boolean);
  container.innerHTML = `
    <div class="thirds-head">
      <h3>Asignacion de mejores terceros</h3>
      <p>Cada llave muestra solo los terceros de grupos permitidos para ese cruce.</p>
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
    row.innerHTML = `<span>${id.toUpperCase()} vs ${teamLabel(left) || leftSlot}</span>`;
    const select = document.createElement("select");
    select.innerHTML = `<option value="">Elegir tercero</option>${allowedThirds.map(item => {
      const disabled = usedTeams.includes(item.team) && item.team !== current ? "disabled" : "";
      return `<option value="${item.team}" ${disabled}>${item.team} (3${item.group})</option>`;
    }).join("")}`;
    select.value = model.thirdAssignments[id] || "";
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
  const showSelectors = options.showSelectors ?? !matchdayOnly;
  const showStandings = options.showStandings ?? !matchdayOnly;
  const showOrderButton = options.showOrderButton ?? showStandings;
  const title = options.title || currentPhase().name;

  groupKeys().forEach(group => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".group-title").innerHTML = `
      <strong>Grupo ${group}</strong>
      <span>${WORLD_CUP_GROUPS[group].map(teamBadge).join("")}</span>
    `;
    const selectors = node.querySelector(".selectors");

    if (showSelectors) {
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
        <span>${matchdayOnly ? title : "Resultados de grupo"}</span>
        ${showOrderButton ? `<button class="mini-button" type="button">Ordenar por tabla</button>` : ""}
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
    if (showStandings) {
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
      card.innerHTML = `
        <div class="match-title">${id.toUpperCase()}</div>
        <div class="teams-line">
          <span>${teamBadge(left) || leftSlot}</span>
          <b>vs</b>
          <span>${teamBadge(right) || rightSlot}</span>
        </div>
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
    card.className = "custom-match-card";
    card.innerHTML = `
      <div class="match-title">${match.id.toUpperCase()}</div>
      <div class="custom-match-line">
        <span>${teamBadge(match.home)}</span>
        <input type="number" min="0" max="99" placeholder="0" value="${saved.homeScore}">
        <b>-</b>
        <input type="number" min="0" max="99" placeholder="0" value="${saved.awayScore}">
        <span>${teamBadge(match.away)}</span>
      </div>
      <label>
        Ganador
        <select>
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
    custom.champion = definition.teams[0] || "";
    customFixtures(definition).forEach(match => {
      custom.matches[match.id] = {
        home: match.home,
        away: match.away,
        homeScore: "1",
        awayScore: "0",
        winner: match.home
      };
    });
    renderAll();
    return;
  }
  groupKeys().forEach(group => {
    model.groups[group] = [...WORLD_CUP_GROUPS[group]];
    groupFixtures(group).forEach(match => {
      const score = getGroupMatch(model, match.id, match.home, match.away);
      score.home = "1";
      score.away = "0";
    });
  });
  model.thirdAssignments = {};
  thirdMatchIds().forEach((id, index) => {
    model.thirdAssignments[id] = thirdPlaceTeams(model)[index]?.team || "";
  });
  renderAll();
  setTimeout(() => {
    ALL_BRACKET_MATCHES.forEach(([id, leftSlot]) => {
      model.winners[id] = resolveSlot(leftSlot, model, id);
      model.scores[id] = { left: "1", right: "0" };
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
  const groupMatchdayId = worldCupEditor && GROUP_PHASE_IDS.includes(phase.id) ? phase.id : "";
  const matchIds = worldCupEditor && phase.type === "matches" ? (phase.matchIds || []) : null;
  const waitingForRealBracket = worldCupEditor && phase.type === "matches" && !tournament?.realResults;
  const showGroups = !worldCupEditor || phase.id === "all" || phase.type === "groups";
  const showBracket = worldCupEditor && (phase.id === "all" || phase.type === "matches");
  const showThirds = worldCupEditor && (phase.id === "all" || (phase.id === "r32" && tournament?.realResults));
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
    const resultsPhase = currentResultsPhase();
    const resultsGroupMatchdayId = GROUP_PHASE_IDS.includes(resultsPhase.id) ? resultsPhase.id : "";
    const resultsMatchIds = resultsPhase.type === "matches" ? (resultsPhase.matchIds || []) : null;
    const showRealGroups = resultsPhase.type === "groups";
    const showRealBracket = resultsPhase.type === "matches";
    const showRealThirds = resultsPhase.id === "r32";
    const groupsGrid = document.getElementById("groupsGrid");
    const realGroupsGrid = document.getElementById("realGroupsGrid");
    const thirdsPanel = document.getElementById("thirdsPanel");
    const realThirdsPanel = document.getElementById("realThirdsPanel");
    const bracket = document.getElementById("bracket");
    const realBracket = document.getElementById("realBracket");
    if (groupsGrid) groupsGrid.hidden = !showGroups;
    if (realGroupsGrid) realGroupsGrid.hidden = !showRealGroups;
    if (thirdsPanel) thirdsPanel.hidden = !showThirds;
    if (realThirdsPanel) realThirdsPanel.hidden = !showRealThirds;
    if (bracket) bracket.hidden = !showBracket;
    if (realBracket) realBracket.hidden = !showRealBracket;
    renderGroups("groupsGrid", state.prediction, "prediction", { matchdayId: groupMatchdayId });
    renderGroups("realGroupsGrid", state.real, "real", {
      matchdayId: resultsGroupMatchdayId,
      title: resultsPhase.name,
      showSelectors: resultsPhase.id === "group3",
      showStandings: resultsPhase.id === "group3",
      showOrderButton: resultsPhase.id === "group3"
    });
    renderThirdAssignments("thirdsPanel", predictionModel);
    renderThirdAssignments("realThirdsPanel", state.real);
    if (waitingForRealBracket) {
      if (bracket) {
        bracket.innerHTML = `<p class="empty">Esta fase se habilita cuando el administrador cargue los resultados reales y queden armados los cruces verdaderos.</p>`;
      }
    } else {
      renderBracket("bracket", predictionModel, "prediction", { matchIds });
    }
    renderBracket("realBracket", state.real, "real", { matchIds: resultsMatchIds });
  } else {
    renderCustomSheet("customSheet", state.prediction, "prediction");
    renderCustomSheet("realCustomSheet", state.real, "real");
  }
  renderPhaseStatus();
  renderResultsPhaseControls();
  setPredictionLocked(isEntryClosed());
}

function buildPayload() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    tournamentId: state.currentTournamentId,
    player: {
      name: document.getElementById("playerName").value.trim(),
      email: document.getElementById("playerEmail").value.trim()
    },
    phaseId: state.currentPhaseId,
    tournament: state.prediction
  };
}

async function apiJson(url, options = {}) {
  const response = await fetch(url.startsWith("/api/") ? appPath(url) : url, {
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
    list.innerHTML = "";
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
  const admin = document.getElementById("resultsAdmin");
  if (admin) admin.hidden = true;
  const title = document.getElementById("selectedTournamentTitle");
  if (title) title.textContent = `Leaderboard - ${currentTournament()?.name || "Torneo"}`;
  await loadLeaderboard();
  if (!state.tenantId) panel?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function openResultsAdmin() {
  const password = askResultsAdminPassword();
  if (!password) return;
  state.currentTournamentId = "global";
  const tournament = currentTournament();
  state.real = tournament?.realResults
    ? JSON.parse(JSON.stringify(tournament.realResults))
    : createEmptyTournament();
  setActiveView("tournaments");
  renderTournamentControls();
  renderAll();
  const panel = document.getElementById("tournamentResults");
  const admin = document.getElementById("resultsAdmin");
  const title = document.getElementById("selectedTournamentTitle");
  if (panel) panel.hidden = false;
  if (admin) admin.hidden = false;
  if (title) title.textContent = "Carga manual de resultados reales";
  await loadLeaderboard();
  admin?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadTournaments() {
  try {
    const joined = joinedTournamentCodes().join(",");
    const params = new URLSearchParams();
    params.set("joined", joined);
    if (state.tenantId) params.set("tenant", state.tenantId);
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
      if (title) title.textContent = `Leaderboard - ${currentTournament()?.name || state.tenant?.name || "Empresa"}`;
      const admin = document.getElementById("resultsAdmin");
      if (admin) admin.hidden = true;
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

async function submitProde(payload) {
  return apiJson("/api/submit-prode", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      tenantId: state.tenantId,
      phaseId: state.currentPhaseId,
      payload
    })
  });
}

async function loadPaymentStatus(payload) {
  const params = new URLSearchParams({
    tournamentId: state.currentTournamentId,
    email: payload.player.email
  });
  if (state.tenantId) params.set("tenant", state.tenantId);
  const data = await apiJson(`/api/payment-status?${params.toString()}`);
  state.paymentStatus = data;
  renderPaymentGate(data);
  return data;
}

function renderPaymentGate(data = state.paymentStatus) {
  const gate = document.getElementById("paymentGate");
  if (!gate) return;
  const required = Boolean(data?.required && !data?.canSubmit);
  gate.hidden = !required;
  if (!required) return;
  const settings = data.settings || currentTournament()?.payment || {};
  document.getElementById("paymentTitle").textContent = settings.title || "Pago de inscripcion";
  document.getElementById("paymentDescription").textContent = "Paga con Checkout Pro. Cuando Mercado Pago confirme el cobro, este torneo queda habilitado para tu email.";
  document.getElementById("paymentAmount").textContent = settings.amount ? `Monto: ${settings.amount}` : "Monto a confirmar";
  document.getElementById("paymentAlias").textContent = data.payment?.status === "pending"
    ? "Pago pendiente de confirmacion."
    : "";
  const qr = document.getElementById("paymentQr");
  qr.innerHTML = "Checkout Pro";
  const status = document.getElementById("paymentStatus");
  if (status) status.hidden = true;
}

async function createMercadoPagoPayment(payload) {
  return apiJson("/api/create-payment", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      tenantId: state.tenantId,
      name: payload.player.name,
      email: payload.player.email
    })
  });
}

async function ensurePaymentBeforeSubmit(payload) {
  const status = await loadPaymentStatus(payload);
  if (status.canSubmit || !status.required) return true;
  document.getElementById("paymentGate")?.scrollIntoView({ behavior: "smooth", block: "center" });
  alert("Antes de guardar tu primer prode en este torneo tenes que completar el pago por Mercado Pago.");
  return false;
}

async function saveRealResults() {
  const adminPassword = askResultsAdminPassword();
  if (!adminPassword) throw new Error("Falta la contraseña de resultados.");
  if (state.currentResultsPhaseId === "group3") {
    groupKeys().forEach(group => applyGroupStandings(state.real, group));
  }
  const result = await apiJson("/api/real-results", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      tenantId: state.tenantId,
      creatorKey: creatorKeyFor(state.currentTournamentId),
      adminPassword,
      resultsPhaseId: state.currentResultsPhaseId,
      realResults: state.real
    })
  });
  await loadLeaderboard();
  return result;
}

async function loadLeaderboard() {
  const panel = document.getElementById("leaderboardPanel");
  if (!panel) return;
  const tournament = currentTournament();
  panel.innerHTML = `<p class="empty">Cargando tabla de ${tournament?.name || "torneo"}...</p>`;
  try {
    const params = new URLSearchParams({ tournamentId: state.currentTournamentId });
    if (state.tenantId) params.set("tenant", state.tenantId);
    const data = await apiJson(`/api/leaderboard?${params.toString()}`);
    if (!data.leaderboard.length) {
      panel.innerHTML = `<p class="empty">Todavia no hay prodes guardados en ${data.tournament.name}.</p>`;
      return;
    }
    panel.innerHTML = `
      <div class="leaderboard-head">
        <div>
          <h3>${data.tournament.name}</h3>
          <p>${data.hasRealResults ? "Puntaje calculado con resultados reales guardados." : "Sin resultados reales guardados: todos figuran con 0 puntos."}</p>
        </div>
        <strong>${data.tournament.players} jugadores</strong>
      </div>
      <div class="leaderboard-table">
        ${data.leaderboard.map((row, index) => `
          <div class="leaderboard-row">
            <b>${index + 1}</b>
            <span>${row.player.name}<small>Participante</small></span>
            <strong>${row.score.points} pts</strong>
            <em>Campeon: ${row.champion || "Sin elegir"} | Grupo:${row.score.groupHits} Cruces:${row.score.winnerHits} Exactos:${row.score.exactScoreHits}</em>
          </div>
        `).join("")}
      </div>
    `;
  } catch (error) {
    panel.innerHTML = `<p class="empty">No se pudo cargar el leaderboard.</p>`;
  }
}

function validatePayload(payload) {
  if (isEntryClosed()) {
    alert("La carga de prodes ya esta cerrada.");
    return false;
  }
  if (!payload.player.name || !payload.player.email) {
    alert("Completa nombre y email antes de generar el PDF.");
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
    if (!currentTournament()?.realResults) {
      alert("Todavia no estan cargados los cruces reales para esta fase.");
      return false;
    }
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
    const response = await fetch(`${appPath(APP_CONFIG.liveResultsUrl)}?t=${Date.now()}`);
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

function hasCustomResults(model) {
  const custom = model?.custom;
  if (!custom) return false;
  return Boolean(custom.champion || Object.keys(custom.matches || {}).length);
}

function scoreTournament(prediction, real) {
  if (hasCustomResults(real)) {
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

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    setActiveView(tab.dataset.view);
  });
});

function setActiveView(view) {
  document.querySelectorAll(".tab").forEach(item => item.classList.toggle("is-active", item.dataset.view === view));
  document.querySelectorAll(".view").forEach(item => item.classList.toggle("is-visible", item.id === view));
  if (view === "live") loadLiveResults();
  if (view === "tournaments") renderTournamentControls();
}

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
  if (!askResultsAdminPassword()) return;
  state.real = currentTournament()?.realResults
    ? JSON.parse(JSON.stringify(currentTournament().realResults))
    : state.real;
  renderAll();
  const admin = document.getElementById("resultsAdmin");
  admin.hidden = !admin.hidden;
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
    if (String(error.message || "").includes("incorrecta")) {
      sessionStorage.removeItem("resultsAdminPassword");
    }
    alert(`No se pudieron guardar los resultados: ${error.message}`);
  }
});
document.getElementById("tournamentSelect").addEventListener("change", event => {
  state.currentTournamentId = event.target.value;
  state.paymentStatus = null;
  renderPaymentGate({ required: false, canSubmit: true });
  renderTournamentControls();
  renderAll();
  loadLeaderboard();
});
document.getElementById("playerEmail").addEventListener("input", () => {
  state.paymentStatus = null;
  renderPaymentGate({ required: false, canSubmit: true });
});
document.getElementById("predictionPhase").addEventListener("change", event => {
  state.currentPhaseId = event.target.value;
  renderAll();
});
document.getElementById("resultsPhase")?.addEventListener("change", event => {
  state.currentResultsPhaseId = event.target.value;
  renderAll();
});
document.getElementById("previousResultsPhase")?.addEventListener("click", event => {
  event.preventDefault();
  const phases = resultPhases();
  const index = phases.findIndex(phase => phase.id === state.currentResultsPhaseId);
  if (index > 0) {
    state.currentResultsPhaseId = phases[index - 1].id;
    renderAll();
  }
});
document.getElementById("nextResultsPhase")?.addEventListener("click", event => {
  event.preventDefault();
  const phases = resultPhases();
  const index = phases.findIndex(phase => phase.id === state.currentResultsPhaseId);
  if (index >= 0 && index < phases.length - 1) {
    state.currentResultsPhaseId = phases[index + 1].id;
    renderAll();
  }
});
document.getElementById("startMercadoPago").addEventListener("click", async event => {
  event.preventDefault();
  const payload = buildPayload();
  const status = document.getElementById("paymentStatus");
  if (!payload.player.name || !payload.player.email) {
    status.hidden = false;
    status.textContent = "Completa nombre y email antes de iniciar el pago.";
    return;
  }
  status.hidden = false;
  status.textContent = "Creando pago en Mercado Pago...";
  try {
    const data = await createMercadoPagoPayment(payload);
    if (data.canSubmit) {
      await loadPaymentStatus(payload);
      status.textContent = "Pago aprobado. Ya podes guardar tu prode.";
      return;
    }
    if (!data.initPoint) throw new Error("Mercado Pago no devolvio link de pago");
    window.location.href = data.initPoint;
  } catch (error) {
    status.textContent = `No se pudo iniciar el pago: ${error.message}`;
  }
});
document.getElementById("refreshPaymentStatus").addEventListener("click", async event => {
  event.preventDefault();
  const payload = buildPayload();
  const status = document.getElementById("paymentStatus");
  status.hidden = false;
  status.textContent = "Verificando pago...";
  try {
    const data = await loadPaymentStatus(payload);
    status.hidden = false;
    status.textContent = data.canSubmit
      ? "Pago confirmado. Ya podes guardar tu prode."
      : "Todavia no figura aprobado en Mercado Pago.";
  } catch (error) {
    status.textContent = `No se pudo verificar el pago: ${error.message}`;
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
    alert(nextPhase
      ? `Prode guardado. Te vamos a avisar por email cuando se habilite ${nextPhase.name}.`
      : "Prode guardado.");
  } catch (error) {
    alert(`No se pudo guardar el prode: ${error.message}`);
  }
});

document.getElementById("downloadPdf").addEventListener("click", async event => {
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

document.getElementById("sendEmail").addEventListener("click", async event => {
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
    .then(pdfBase64 => fetch(appPath("/api/send-prode"), {
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

async function init() {
  renderAll();
  await loadTenant();
  await loadTemplates();
  if (initialContinueToken()) {
    await loadContinuation();
  } else {
    await loadTournaments();
  }
  if (isResultsAdminPath()) {
    await openResultsAdmin();
  }
  loadLiveResults();
  setInterval(loadLiveResults, 30 * 60 * 1000);
}

init();
