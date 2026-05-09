const http = require("http");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const net = require("net");

function loadEnvFile() {
  const envPath = [path.join(__dirname, ".env"), path.join(__dirname, "..", ".env")]
    .find(candidate => fs.existsSync(candidate));
  if (!envPath) return;
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && line.includes("="))
    .forEach(line => {
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    });
}

loadEnvFile();

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const LIVE_RESULTS_FILE = process.env.LIVE_RESULTS_FILE ? path.resolve(process.env.LIVE_RESULTS_FILE) : path.join(DATA_DIR, "live-results.json");
const STORE_FILE = process.env.STORE_FILE ? path.resolve(process.env.STORE_FILE) : path.join(DATA_DIR, "prode-store.json");
const GLOBAL_ONLY = true;
const APP_BASE_PATH = (process.env.APP_BASE_PATH || "/prode/global").replace(/\/$/, "");
const RESULTS_ADMIN_PASSWORD = process.env.RESULTS_ADMIN_PASSWORD || "resultados2026";

function envFlag(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "si", "on"].includes(String(value).toLowerCase());
}

function envTenantValue(tenantId, key, fallback = "") {
  const scoped = process.env[`${key}_${String(tenantId || "").toUpperCase()}`];
  return scoped !== undefined ? scoped : (process.env[key] ?? fallback);
}

function envPaymentValue(tenantId, key, fallback = "") {
  const scoped = envTenantValue(tenantId, key, "");
  if (scoped !== "") return scoped;
  if (GLOBAL_ONLY && process.env[`${key}_ACME`] !== undefined) return process.env[`${key}_ACME`];
  return fallback;
}

const TENANTS = {
  acme: {
    id: "acme",
    name: "ACME Energia",
    eyebrow: "Prode corporativo",
    title: "Prode ACME",
    description: "Predicciones y ranking exclusivo para ACME Energia.",
    payment: {
      required: true,
      provider: "mercadopago",
      title: "Inscripcion Prode ACME",
      amount: "Configurar monto",
      alias: "",
      qrUrl: "",
      requireApproval: false
    },
    theme: {
      bg: "#F2E6CF",
      ink: "#323232",
      muted: "#6f6259",
      line: "#d8c8ad",
      panel: "#fff8ec",
      accent: "#631009",
      accent2: "#323232",
      gold: "#b98d3d",
      blue: "#6b5d56",
      image: "/th.webp",
      tintRgb: "99, 16, 9"
    }
  },
  norte: {
    id: "norte",
    name: "Setup Soluciones IT",
    eyebrow: "Liga interna",
    title: "Prode Setup Soluciones IT",
    description: "Ranking privado para colaboradores de Setup Soluciones IT.",
    theme: {
      bg: "#edf6f1",
      ink: "#2f3432",
      muted: "#68716d",
      line: "#bfd8ca",
      panel: "#ffffff",
      accent: "#137a3f",
      accent2: "#285d43",
      gold: "#b6a05a",
      blue: "#47766a",
      image: "/OIP.webp",
      tintRgb: "19, 122, 63"
    }
  },
  sur: {
    id: "sur",
    name: "Setup SRL",
    eyebrow: "Mundial 2026",
    title: "Prode Setup SRL",
    description: "Predicciones, tabla y resultados solo para Setup SRL.",
    theme: {
      bg: "#fff3e8",
      ink: "#323232",
      muted: "#6e6e6a",
      line: "#efd1b4",
      panel: "#ffffff",
      accent: "#f07a18",
      accent2: "#9b4a10",
      gold: "#d69038",
      blue: "#7d817f",
      image: "/descargar.webp",
      tintRgb: "240, 122, 24"
    }
  }
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp"
};

const TOURNAMENT_TEMPLATES = [
  { id: "worldcup-2026", name: "Mundial 2026", mode: "groups-knockout", teams: [] },
  { id: "champions", name: "Champions League", mode: "fixture", teams: ["Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Bayern Munich", "PSG", "Inter", "Arsenal", "Atletico Madrid", "Borussia Dortmund", "Juventus", "Benfica", "Porto", "Napoli", "Bayer Leverkusen", "Chelsea"] },
  { id: "libertadores", name: "Copa Libertadores", mode: "groups-knockout", teams: ["River Plate", "Boca Juniors", "Flamengo", "Palmeiras", "Sao Paulo", "Fluminense", "Gremio", "Atletico Mineiro", "Nacional", "Penarol", "Colo-Colo", "Universidad de Chile", "Olimpia", "Cerro Porteno", "Liga de Quito", "Independiente del Valle"] },
  { id: "sudamericana", name: "Copa Sudamericana", mode: "groups-knockout", teams: ["Lanus", "Defensa y Justicia", "Racing", "Independiente", "Corinthians", "Cruzeiro", "Internacional", "Fortaleza", "Universidad Catolica", "Emelec", "Barcelona SC", "America de Cali", "Junior", "Sporting Cristal", "Bolivar", "The Strongest"] },
  { id: "argentina", name: "Liga Argentina", mode: "league", teams: ["River Plate", "Boca Juniors", "Racing", "Independiente", "San Lorenzo", "Huracan", "Velez", "Estudiantes", "Gimnasia", "Lanus", "Banfield", "Rosario Central", "Newell's", "Talleres", "Belgrano", "Godoy Cruz"] },
  { id: "premier", name: "Premier League", mode: "league", teams: ["Arsenal", "Aston Villa", "Chelsea", "Liverpool", "Manchester City", "Manchester United", "Newcastle", "Tottenham", "Everton", "West Ham", "Brighton", "Crystal Palace", "Fulham", "Brentford", "Wolves", "Nottingham Forest"] },
  { id: "laliga", name: "LaLiga", mode: "league", teams: ["Real Madrid", "Barcelona", "Atletico Madrid", "Athletic Club", "Real Sociedad", "Villarreal", "Betis", "Sevilla", "Valencia", "Celta", "Osasuna", "Getafe", "Mallorca", "Girona", "Espanyol", "Rayo Vallecano"] },
  { id: "serie-a", name: "Serie A", mode: "league", teams: ["Inter", "Milan", "Juventus", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", "Bologna", "Torino", "Genoa", "Udinese", "Sassuolo", "Cagliari", "Parma", "Verona"] },
  { id: "bundesliga", name: "Bundesliga", mode: "league", teams: ["Bayern Munich", "Borussia Dortmund", "Bayer Leverkusen", "RB Leipzig", "Eintracht Frankfurt", "Stuttgart", "Wolfsburg", "Werder Bremen", "Freiburg", "Mainz", "Augsburg", "Hoffenheim", "Union Berlin", "Koln", "Hamburg", "Borussia Monchengladbach"] },
  { id: "ligue-1", name: "Ligue 1", mode: "league", teams: ["PSG", "Marseille", "Lyon", "Monaco", "Lille", "Lens", "Rennes", "Nice", "Strasbourg", "Nantes", "Toulouse", "Montpellier", "Brest", "Reims", "Auxerre", "Angers"] },
  { id: "custom", name: "Custom", mode: "fixture", teams: [] }
];

const DEFAULT_SCORING = {
  groupPosition: 1,
  knockoutWinner: 3,
  exactScore: 2,
  champion: 10
};

const DEFAULT_PHASES = [
  { id: "all", name: "Prode completo", type: "all", description: "Permite cargar grupos y todos los cruces." },
  { id: "group1", name: "Fecha 1 - Grupos", type: "groups", groupMatchday: 1, description: "Carga solo los primeros enfrentamientos de cada grupo." },
  { id: "group2", name: "Fecha 2 - Grupos", type: "groups", groupMatchday: 2, description: "Carga solo la segunda fecha de la fase de grupos." },
  { id: "group3", name: "Fecha 3 - Grupos", type: "groups", groupMatchday: 3, description: "Carga solo la tercera fecha de la fase de grupos." },
  { id: "r32", name: "16avos", type: "matches", matchIds: ["m73", "m74", "m75", "m76", "m77", "m78", "m79", "m80", "m81", "m82", "m83", "m84", "m85", "m86", "m87", "m88"], description: "Cruces de 16avos usando los clasificados reales si ya fueron cargados." },
  { id: "r16", name: "8avos", type: "matches", matchIds: ["m89", "m90", "m91", "m92", "m93", "m94", "m95", "m96"], description: "Cruces de octavos." },
  { id: "qf", name: "4tos", type: "matches", matchIds: ["m97", "m98", "m99", "m100"], description: "Cruces de cuartos." },
  { id: "sf", name: "Semis", type: "matches", matchIds: ["m101", "m102"], description: "Semifinales." },
  { id: "third", name: "3er puesto", type: "matches", matchIds: ["m103"], description: "Partido por el tercer puesto." },
  { id: "final", name: "Final", type: "matches", matchIds: ["m104"], description: "Final y campeon." }
];

const GROUP_MATCHDAY_FIXTURES = {
  group1: [[0, 1], [2, 3]],
  group2: [[0, 2], [1, 3]],
  group3: [[0, 3], [1, 2]]
};

const WORLD_CUP_GROUP_KEYS = "ABCDEFGHIJKL".split("");

function groupMatchId(group, firstIndex, secondIndex) {
  return `${group}-${firstIndex}-${secondIndex}`;
}

function groupMatchIdsForPhase(phaseId) {
  const pairs = GROUP_MATCHDAY_FIXTURES[phaseId];
  if (!pairs) return [];
  return WORLD_CUP_GROUP_KEYS.flatMap(group => pairs.map(([firstIndex, secondIndex]) => groupMatchId(group, firstIndex, secondIndex)));
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function emptyStore() {
  return {
    tournaments: [
      {
        id: "global",
        name: "Global",
        code: "GLOBAL",
        isGlobal: true,
        createdAt: new Date().toISOString(),
        realResults: null,
        templateId: "worldcup-2026",
        mode: "groups-knockout",
        scoring: DEFAULT_SCORING,
        submissions: []
      }
    ],
    tenants: {}
  };
}

function tenantFromValue(value) {
  if (GLOBAL_ONLY) return null;
  const id = slug(value);
  return TENANTS[id] || null;
}

function tenantTournamentId(tenantId) {
  return `empresa-${tenantId}`;
}

function paymentSettings(tournament) {
  if (!GLOBAL_ONLY && tournament?.tenantId !== "acme") return { required: false };
  const tenant = tournament?.tenantId ? TENANTS[tournament.tenantId] : null;
  const base = tournament?.payment || tenant?.payment || {};
  const tenantId = tournament?.tenantId || "GLOBAL";
  const hasGlobalAmount = Boolean(process.env.PAYMENT_AMOUNT_GLOBAL || (GLOBAL_ONLY && process.env.PAYMENT_AMOUNT_ACME));
  const required = Boolean(base.required) || envFlag(`PAYMENT_REQUIRED_${String(tenantId).toUpperCase()}`, hasGlobalAmount);
  if (!required) return { required: false };
  return {
    required: true,
    provider: "mercadopago",
    title: envTenantValue(tenantId, "PAYMENT_TITLE", base.title || `Inscripcion ${tournament?.name || "Prode"}`),
    amount: envPaymentValue(tenantId, "PAYMENT_AMOUNT", base.amount || ""),
    currency: envPaymentValue(tenantId, "PAYMENT_CURRENCY", base.currency || "ARS"),
    alias: envTenantValue(tenantId, "MERCADOPAGO_ALIAS", base.alias || ""),
    qrUrl: envTenantValue(tenantId, "MERCADOPAGO_QR_URL", base.qrUrl || ""),
    requireApproval: envFlag(`PAYMENT_REQUIRE_APPROVAL_${String(tenantId).toUpperCase()}`, Boolean(base.requireApproval))
  };
}

function paymentAmountNumber(value) {
  const normalized = String(value || "")
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function normalizePaymentReference(value) {
  return String(value || "").trim().slice(0, 120);
}

function paymentKey(email) {
  return normalizeEmail(email);
}

function validResultsAdminPassword(value) {
  return String(value || "") === RESULTS_ADMIN_PASSWORD;
}

function paymentFor(tournament, email) {
  const key = paymentKey(email);
  return key && tournament?.payments ? tournament.payments[key] : null;
}

function paymentAllowsFirstSubmission(tournament, email) {
  const settings = paymentSettings(tournament);
  if (!settings.required) return true;
  const payment = paymentFor(tournament, email);
  if (!payment) return false;
  return payment.status === "approved";
}

function ensureTenantTournaments(store) {
  if (GLOBAL_ONLY) {
    store.tenants = {};
    store.tournaments = (store.tournaments || []).filter(tournament => !tournament.tenantId);
    return;
  }
  if (!store.tenants || typeof store.tenants !== "object") store.tenants = {};
  Object.values(TENANTS).forEach(tenant => {
    store.tenants[tenant.id] = {
      id: tenant.id,
      name: tenant.name
    };
    const existing = store.tournaments.find(tournament => tournament.id === tenantTournamentId(tenant.id));
    if (existing) {
      existing.name = tenant.name;
      existing.code = `EMPRESA-${tenant.id.toUpperCase()}`;
      existing.tenantId = tenant.id;
      existing.isGlobal = false;
      existing.templateId = existing.templateId || "worldcup-2026";
      existing.mode = existing.mode || "groups-knockout";
      existing.scoring = existing.scoring || DEFAULT_SCORING;
      if (!Array.isArray(existing.submissions)) existing.submissions = [];
      if (tenant.payment && !existing.payment) existing.payment = tenant.payment;
      if (!existing.payments || typeof existing.payments !== "object") existing.payments = {};
    } else {
      store.tournaments.push({
        id: tenantTournamentId(tenant.id),
        name: tenant.name,
        code: `EMPRESA-${tenant.id.toUpperCase()}`,
        tenantId: tenant.id,
        isGlobal: false,
        createdAt: new Date().toISOString(),
        realResults: null,
        templateId: "worldcup-2026",
        mode: "groups-knockout",
        scoring: DEFAULT_SCORING,
        payment: tenant.payment || null,
        payments: {},
        submissions: []
      });
    }
  });
}

function ensureDataDir() {
  fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
}

function readStore() {
  ensureDataDir();
  try {
    const store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    if (!Array.isArray(store.tournaments)) return emptyStore();
    if (!store.tournaments.some(tournament => tournament.id === "global")) {
      store.tournaments.unshift(emptyStore().tournaments[0]);
    }
    ensureTenantTournaments(store);
    return store;
  } catch {
    const store = emptyStore();
    ensureTenantTournaments(store);
    writeStore(store);
    return store;
  }
}

function writeStore(store) {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function publicTournament(tournament, options = {}) {
  const template = TOURNAMENT_TEMPLATES.find(item => item.id === tournament.templateId) || TOURNAMENT_TEMPLATES[0];
  const payment = paymentSettings(tournament);
  const data = {
    id: tournament.id,
    name: tournament.name,
    tenantId: tournament.tenantId || "",
    isGlobal: Boolean(tournament.isGlobal),
    templateId: tournament.templateId || template.id,
    templateName: template.name,
    mode: tournament.mode || template.mode,
    teams: tournament.customTemplate?.teams || template.teams || [],
    customTemplate: tournament.customTemplate || null,
    scoring: tournament.scoring || DEFAULT_SCORING,
    createdAt: tournament.createdAt,
    realResults: tournament.realResults || null,
    payment: payment.required ? payment : { required: false },
    players: Array.isArray(tournament.submissions) ? tournament.submissions.length : 0
  };
  if (options.includePrivateCode || tournament.isGlobal) {
    data.code = tournament.code;
    data.invitePath = `${APP_BASE_PATH}/join/${encodeURIComponent(tournament.code)}`;
  }
  return data;
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 34);
}

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 24);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function scoringNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function normalizeScoring(value) {
  return {
    groupPosition: scoringNumber(value?.groupPosition, DEFAULT_SCORING.groupPosition),
    knockoutWinner: scoringNumber(value?.knockoutWinner, DEFAULT_SCORING.knockoutWinner),
    exactScore: scoringNumber(value?.exactScore, DEFAULT_SCORING.exactScore),
    champion: scoringNumber(value?.champion, DEFAULT_SCORING.champion)
  };
}

function normalizeTeams(value) {
  const teams = Array.isArray(value) ? value : String(value || "").split(/\r?\n|,/);
  return [...new Set(teams
    .map(team => String(team || "").trim())
    .filter(Boolean))]
    .slice(0, 64);
}

function normalizeCustomTemplate(value, fallbackTemplate) {
  const teams = normalizeTeams(value?.teams);
  if (!teams.length) return null;
  return {
    name: String(value?.name || fallbackTemplate?.name || "Custom").trim().slice(0, 80),
    mode: value?.mode || fallbackTemplate?.mode || "fixture",
    teams
  };
}

function randomSecret() {
  return `${randomCode()}-${randomCode()}-${Date.now().toString(36)}`;
}

function normalizePhaseId(value) {
  if (value === "groups") return "group1";
  const phase = DEFAULT_PHASES.find(item => item.id === value);
  return phase ? phase.id : "all";
}

function phaseById(value) {
  return DEFAULT_PHASES.find(item => item.id === normalizePhaseId(value)) || DEFAULT_PHASES[0];
}

function nextPhaseId(value) {
  const current = normalizePhaseId(value);
  const phaseIds = DEFAULT_PHASES
    .map(phase => phase.id)
    .filter(id => id !== "all");
  const index = phaseIds.indexOf(current);
  return index >= 0 && index < phaseIds.length - 1 ? phaseIds[index + 1] : "";
}

function expectedStepPhase(completedPhases = []) {
  const phaseIds = DEFAULT_PHASES
    .map(phase => phase.id)
    .filter(id => id !== "all");
  return phaseIds.find(id => !completedPhases.includes(id)) || "";
}

function validatePredictionFlow(previous, phaseId) {
  if (!previous) {
    return phaseId === "all" || phaseId === "group1"
      ? ""
      : "Para empezar solo podes elegir prode completo o pronosticar poco a poco desde Fecha 1.";
  }
  const completed = previous.completedPhases || [];
  if (completed.includes("all")) {
    return phaseId === "all" ? "" : "Este participante ya cargo el prode completo.";
  }
  if (phaseId === "all") {
    return "Este participante ya empezo el modo poco a poco y no puede mezclarlo con prode completo.";
  }
  const expected = expectedStepPhase(completed);
  if (!expected) return "Este participante ya completo todas las fases.";
  return phaseId === expected
    ? ""
    : `La proxima fase habilitada es ${phaseById(expected).name}.`;
}

function configuredPhaseSchedule() {
  try {
    const schedule = JSON.parse(process.env.PRODE_PHASE_SCHEDULE || "[]");
    return Array.isArray(schedule) ? schedule : [];
  } catch {
    return [];
  }
}

function reminderKey(phaseId) {
  return new Date().toISOString().slice(0, 10) + `:${phaseId}`;
}

function dueReminderPhases(now = new Date()) {
  const nowTime = now.getTime();
  const day = 24 * 60 * 60 * 1000;
  return configuredPhaseSchedule()
    .map(item => ({ ...item, id: normalizePhaseId(item.id) }))
    .filter(item => {
      const start = new Date(item.startAt).getTime();
      return Number.isFinite(start) && start - nowTime > 0 && start - nowTime <= day;
    });
}

function copyMatchFields(target, source, matchIds) {
  if (!target.winners) target.winners = {};
  if (!target.scores) target.scores = {};
  (matchIds || []).forEach(id => {
    if (source.winners && Object.prototype.hasOwnProperty.call(source.winners, id)) {
      target.winners[id] = source.winners[id];
    }
    if (source.scores && Object.prototype.hasOwnProperty.call(source.scores, id)) {
      target.scores[id] = source.scores[id];
    }
  });
}

function mergePredictionByPhase(previousPrediction, incomingPrediction, phaseId) {
  const phase = phaseById(phaseId);
  if (!previousPrediction || phase.id === "all" || incomingPrediction?.custom) return incomingPrediction;
  const merged = JSON.parse(JSON.stringify(previousPrediction));
  if (phase.type === "groups") {
    if (!merged.groupMatches) merged.groupMatches = {};
    const groupMatchIds = groupMatchIdsForPhase(phase.id);
    if (groupMatchIds.length) {
      groupMatchIds.forEach(id => {
        if (incomingPrediction.groupMatches?.[id]) merged.groupMatches[id] = incomingPrediction.groupMatches[id];
      });
    } else {
      merged.groups = incomingPrediction.groups || merged.groups || {};
      merged.groupMatches = incomingPrediction.groupMatches || merged.groupMatches || {};
      merged.thirdAssignments = incomingPrediction.thirdAssignments || merged.thirdAssignments || {};
    }
    return merged;
  }
  if (phase.type === "matches") {
    if (phase.id === "r32") merged.thirdAssignments = incomingPrediction.thirdAssignments || merged.thirdAssignments || {};
    copyMatchFields(merged, incomingPrediction, phase.matchIds);
    return merged;
  }
  return incomingPrediction;
}

function siteBaseUrl(req) {
  return (process.env.PUBLIC_BASE_URL || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host || `localhost:${PORT}`}${APP_BASE_PATH}`).replace(/\/$/, "");
}

async function mercadoPagoRequest(pathname, options = {}) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN");
  const response = await fetch(`https://api.mercadopago.com${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
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
  if (!response.ok) throw new Error(data.message || data.error || `Mercado Pago returned ${response.status}`);
  return data;
}

function scoreLabel(score) {
  if (!score || score.left === "" || score.right === "" || score.left === undefined || score.right === undefined) return "";
  return `${score.left}-${score.right}`;
}

function scorePair(value, homeKey = "home", awayKey = "away") {
  if (!value) return null;
  const hasHome = value[homeKey] !== "" && value[homeKey] !== null && value[homeKey] !== undefined;
  const hasAway = value[awayKey] !== "" && value[awayKey] !== null && value[awayKey] !== undefined;
  if (!hasHome || !hasAway) return null;
  const home = Number(value[homeKey]);
  const away = Number(value[awayKey]);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

function hasCustomResults(model) {
  const custom = model?.custom;
  if (!custom) return false;
  return Boolean(custom.champion || Object.keys(custom.matches || {}).length);
}

function scoreSubmission(prediction, real, scoring = DEFAULT_SCORING) {
  if (!prediction || !real) {
    return { points: 0, groupHits: 0, winnerHits: 0, exactScoreHits: 0, championHit: false };
  }
  const rules = normalizeScoring(scoring);
  if (hasCustomResults(real)) {
    const realMatches = real.custom.matches || {};
    const predictedMatches = prediction.custom?.matches || {};
    let winnerHits = 0;
    let exactScoreHits = 0;
    Object.keys(realMatches).forEach(id => {
      if (realMatches[id]?.winner && predictedMatches[id]?.winner === realMatches[id].winner) winnerHits += 1;
      const realScore = `${realMatches[id]?.homeScore ?? ""}-${realMatches[id]?.awayScore ?? ""}`;
      const predictedScore = `${predictedMatches[id]?.homeScore ?? ""}-${predictedMatches[id]?.awayScore ?? ""}`;
      if (realScore !== "-" && realScore === predictedScore) exactScoreHits += 1;
    });
    const championHit = Boolean(real.custom.champion && prediction.custom?.champion === real.custom.champion);
    return {
      points: winnerHits * rules.knockoutWinner + exactScoreHits * rules.exactScore + (championHit ? rules.champion : 0),
      groupHits: 0,
      winnerHits,
      exactScoreHits,
      championHit
    };
  }

  const groups = Object.keys(real.groups || {});
  let groupHits = 0;
  groups.forEach(group => {
    [0, 1, 2, 3].forEach(index => {
      if (prediction.groups?.[group]?.[index] && prediction.groups[group][index] === real.groups[group]?.[index]) {
        groupHits += 1;
      }
    });
  });

  const matchIds = Object.keys(real.winners || {});
  let winnerHits = 0;
  let exactScoreHits = 0;
  Object.keys(real.groupMatches || {}).forEach(id => {
    const realScore = scorePair(real.groupMatches[id]);
    const predictedScore = scorePair(prediction.groupMatches?.[id]);
    if (!realScore || !predictedScore) return;
    if (Math.sign(realScore.home - realScore.away) === Math.sign(predictedScore.home - predictedScore.away)) {
      winnerHits += 1;
    }
    if (realScore.home === predictedScore.home && realScore.away === predictedScore.away) {
      exactScoreHits += 1;
    }
  });
  matchIds.forEach(id => {
    if (real.winners[id] && prediction.winners?.[id] === real.winners[id]) winnerHits += 1;
    if (scoreLabel(real.scores?.[id]) && scoreLabel(prediction.scores?.[id]) === scoreLabel(real.scores[id])) {
      exactScoreHits += 1;
    }
  });

  const championHit = Boolean(real.winners?.m104 && prediction.winners?.m104 === real.winners.m104);
  return {
    points:
      groupHits * rules.groupPosition +
      winnerHits * rules.knockoutWinner +
      exactScoreHits * rules.exactScore +
      (championHit ? rules.champion : 0),
    groupHits,
    winnerHits,
    exactScoreHits,
    championHit
  };
}

function yesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function normalizeName(value) {
  return value || "";
}

function normalizeWorldCupApiMatch(match) {
  const homeScore = match.home_score ?? match.homeScore ?? match.score_home ?? match.home?.score;
  const awayScore = match.away_score ?? match.awayScore ?? match.score_away ?? match.away?.score;
  return {
    id: String(match.id ?? match.fixture_id ?? match.match_id ?? ""),
    date: match.date ?? match.match_date ?? match.kickoff ?? match.start_time ?? "",
    stage: match.stage ?? match.round ?? match.competition_name ?? "Mundial 2026",
    group: match.group ?? "",
    home: normalizeName(match.home_team ?? match.homeTeam ?? match.home?.name ?? match.home ?? match.localteam_name),
    away: normalizeName(match.away_team ?? match.awayTeam ?? match.away?.name ?? match.away ?? match.visitorteam_name),
    homeScore,
    awayScore,
    status: match.status ?? match.time_status ?? (homeScore !== undefined ? "finalizado" : "programado")
  };
}

function normalizeTheSportsDbMatch(match) {
  return {
    id: String(match.idEvent ?? ""),
    date: match.dateEvent ?? "",
    stage: match.strLeague ?? "Mundial 2026",
    group: match.strRound ?? "",
    home: normalizeName(match.strHomeTeam),
    away: normalizeName(match.strAwayTeam),
    homeScore: match.intHomeScore ?? undefined,
    awayScore: match.intAwayScore ?? undefined,
    status: match.strStatus || (match.intHomeScore !== null && match.intHomeScore !== undefined ? "finalizado" : "programado")
  };
}

function readLocalLiveResults() {
  try {
    return JSON.parse(fs.readFileSync(LIVE_RESULTS_FILE, "utf8"));
  } catch {
    return { updatedAt: new Date().toISOString(), source: "Sin datos", matches: [] };
  }
}

async function loadWorldCupApiResults() {
  const key = process.env.WORLDCUP_API_KEY;
  const base = process.env.WORLDCUP_API_BASE || "https://worldcupapi.com";
  if (!key) throw new Error("Missing WORLDCUP_API_KEY");

  const date = yesterdayDate();
  const url = `${base.replace(/\/$/, "")}/fixtures?key=${encodeURIComponent(key)}&date=${date}&lang=es`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`WorldCupAPI returned ${response.status}`);
  const data = await response.json();
  const items = Array.isArray(data) ? data : data.fixtures || data.matches || data.data || [];
  return {
    updatedAt: new Date().toISOString(),
    source: `WorldCupAPI - ${date}`,
    matches: items.map(normalizeWorldCupApiMatch)
  };
}

async function loadTheSportsDbResults() {
  const key = process.env.THESPORTSDB_API_KEY || "123";
  const league = (process.env.THESPORTSDB_LEAGUE_FILTER || "World Cup").toLowerCase();
  const date = yesterdayDate();
  const url = `https://www.thesportsdb.com/api/v1/json/${encodeURIComponent(key)}/eventsday.php?d=${date}&s=Soccer`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TheSportsDB returned ${response.status}`);
  const data = await response.json();
  const events = Array.isArray(data.events) ? data.events : [];
  return {
    updatedAt: new Date().toISOString(),
    source: `TheSportsDB - ${date}`,
    matches: events
      .filter(event => String(event.strLeague || "").toLowerCase().includes(league))
      .map(normalizeTheSportsDbMatch)
  };
}

async function loadLiveResults() {
  const provider = (process.env.LIVE_RESULTS_PROVIDER || "local").toLowerCase();
  if (provider === "worldcupapi") return loadWorldCupApiResults();
  if (provider === "thesportsdb") return loadTheSportsDbResults();
  return readLocalLiveResults();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 12_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function smtpCommand(socket, command, expected) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = chunk => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";
      if (/^\d{3} /.test(last)) {
        socket.off("data", onData);
        const code = Number(last.slice(0, 3));
        if (expected.includes(code)) resolve(buffer);
        else reject(new Error(`SMTP ${command || "read"} failed: ${buffer}`));
      }
    };
    socket.on("data", onData);
    if (command) socket.write(`${command}\r\n`);
  });
}

function connectSmtp() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true") !== "false";

  if (!host || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP_HOST, SMTP_USER or SMTP_PASS");
  }

  return secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendMail({ to, subject, text, filename, pdfBase64 }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const envelopeFrom = (String(from).match(/<([^>]+)>/)?.[1] || from).trim();
  const socket = connectSmtp();
  const boundary = `prode-${Date.now()}`;
  const auth = Buffer.from(`\0${process.env.SMTP_USER}\0${process.env.SMTP_PASS}`).toString("base64");
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    pdfBase64 ? `Content-Type: multipart/mixed; boundary="${boundary}"` : "Content-Type: text/plain; charset=utf-8",
    ""
  ];
  if (pdfBase64) {
    const attachment = pdfBase64.replace(/(.{76})/g, "$1\r\n");
    messageParts.push(
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
      "",
      `--${boundary}`,
      `Content-Type: application/pdf; name="${filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${filename}"`,
      "",
      attachment,
      "",
      `--${boundary}--`,
      ""
    );
  } else {
    messageParts.splice(5, 0, "Content-Transfer-Encoding: 8bit");
    messageParts.push(text, "");
  }
  const message = messageParts.join("\r\n");

  await smtpCommand(socket, "", [220]);
  await smtpCommand(socket, "EHLO prodemundial.local", [250]);
  await smtpCommand(socket, `AUTH PLAIN ${auth}`, [235]);
  await smtpCommand(socket, `MAIL FROM:<${envelopeFrom}>`, [250]);
  await smtpCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
  await smtpCommand(socket, "DATA", [354]);
  await smtpCommand(socket, `${message}\r\n.`, [250]);
  await smtpCommand(socket, "QUIT", [221]);
  socket.end();
}

async function sendNextPhaseLinksAfterRealResults(req, tournament, savedPhaseId = "") {
  if (!smtpConfigured()) {
    return { sent: 0, skipped: 0, failed: 0, error: "SMTP no configurado" };
  }
  const targetPhase = savedPhaseId ? nextPhaseId(savedPhaseId) : "";
  if (savedPhaseId && !targetPhase) {
    return { sent: 0, skipped: tournament.submissions?.length || 0, failed: 0 };
  }
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const submission of tournament.submissions || []) {
    const completed = submission.completedPhases || [];
    if (!submission.continuationToken || !submission.player?.email || completed.includes("all")) {
      skipped += 1;
      continue;
    }
    const nextPhase = expectedStepPhase(completed);
    if (!nextPhase || (targetPhase && nextPhase !== targetPhase)) {
      skipped += 1;
      continue;
    }
    if (!submission.phaseLinksSent || typeof submission.phaseLinksSent !== "object") {
      submission.phaseLinksSent = {};
    }
    if (submission.phaseLinksSent[nextPhase]) {
      skipped += 1;
      continue;
    }
    const phase = phaseById(nextPhase);
    const link = `${siteBaseUrl(req)}/continuar/${encodeURIComponent(submission.continuationToken)}?fase=${encodeURIComponent(nextPhase)}`;
    try {
      await sendMail({
        to: submission.player.email,
        subject: `${tournament.name}: ya podes pronosticar ${phase.name}`,
        text: [
          `Hola ${submission.player.name || ""},`,
          "",
          `Ya estan cargados los resultados reales y se habilito ${phase.name}.`,
          "Entra con este link para continuar tu prode:",
          link,
          "",
          "Si ya lo cargaste, podes ignorar este aviso."
        ].join("\n")
      });
      submission.phaseLinksSent[nextPhase] = new Date().toISOString();
      sent += 1;
    } catch {
      failed += 1;
    }
  }
  return { sent, skipped, failed };
}

async function handleApi(req, res) {
  try {
    const { payload, pdfBase64, filename } = JSON.parse(await readBody(req));
    if (!payload?.player?.email || !pdfBase64 || !filename) {
      send(res, 400, JSON.stringify({ error: "Invalid payload" }));
      return;
    }
    await sendMail({
      to: payload.player.email,
      subject: `Prode Mundial 2026 - ${payload.player.name}`,
      text: "Adjunto el PDF generado por la web del Prode Mundial 2026.",
      filename,
      pdfBase64
    });
    send(res, 200, JSON.stringify({ ok: true }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleLiveResults(req, res) {
  try {
    const data = await loadLiveResults();
    send(res, 200, JSON.stringify(data));
  } catch (error) {
    const fallback = readLocalLiveResults();
    fallback.source = `${fallback.source || "JSON local"} (fallback: ${error.message})`;
    send(res, 200, JSON.stringify(fallback));
  }
}

async function handleSaveLiveResults(req, res) {
  try {
    const secret = process.env.LIVE_RESULTS_SECRET;
    const url = new URL(req.url, "http://localhost");
    if (secret && url.searchParams.get("secret") !== secret) {
      send(res, 403, JSON.stringify({ error: "Invalid live results secret" }));
      return;
    }
    const body = JSON.parse(await readBody(req));
    const matches = Array.isArray(body.matches) ? body.matches.map(normalizeWorldCupApiMatch) : [];
    const payload = {
      updatedAt: body.updatedAt || new Date().toISOString(),
      source: body.source || "Carga manual",
      matches
    };
    fs.mkdirSync(path.dirname(LIVE_RESULTS_FILE), { recursive: true });
    fs.writeFileSync(LIVE_RESULTS_FILE, JSON.stringify(payload, null, 2));
    send(res, 200, JSON.stringify({ ok: true, matches: matches.length }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function handleTournaments(req, res) {
  const store = readStore();
  const url = new URL(req.url, "http://localhost");
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const joinedCodes = String(url.searchParams.get("joined") || "")
    .split(",")
    .map(normalizeCode)
    .filter(Boolean);
  const tournaments = store.tournaments
    .filter(tournament => {
      if (tenant) return tournament.tenantId === tenant.id;
      return tournament.isGlobal || (!tournament.tenantId && joinedCodes.includes(tournament.code));
    })
    .map(tournament => publicTournament(tournament, { includePrivateCode: tenant || joinedCodes.includes(tournament.code) }));
  send(res, 200, JSON.stringify({ tournaments }));
}

function handleTemplates(req, res) {
  send(res, 200, JSON.stringify({
    templates: TOURNAMENT_TEMPLATES,
    phases: DEFAULT_PHASES,
    defaultScoring: DEFAULT_SCORING
  }));
}

function findTournament(store, identifier) {
  const value = String(identifier || "").trim();
  const code = normalizeCode(value);
  return store.tournaments.find(item => item.id === value || item.code === code);
}

async function handleCreateTournament(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const name = String(body.name || "").trim();
    const requestedCode = normalizeCode(body.code);
    const creatorEmail = normalizeEmail(body.creatorEmail);
    const tenant = tenantFromValue(body.tenantId);
    const template = TOURNAMENT_TEMPLATES.find(item => item.id === body.templateId) || TOURNAMENT_TEMPLATES[0];
    const customTemplate = normalizeCustomTemplate(body.customTemplate, template);
    if (!name) {
      send(res, 400, JSON.stringify({ error: "Tournament name is required" }));
      return;
    }
    if (!requestedCode) {
      send(res, 400, JSON.stringify({ error: "Tournament key is required" }));
      return;
    }
    if (!creatorEmail) {
      send(res, 400, JSON.stringify({ error: "Creator email is required" }));
      return;
    }
    if (template.id === "custom" && (!customTemplate || customTemplate.teams.length < 2)) {
      send(res, 400, JSON.stringify({ error: "Custom tournaments need at least 2 teams or players" }));
      return;
    }

    const store = readStore();
    if (store.tournaments.some(tournament => tournament.code === requestedCode)) {
      send(res, 409, JSON.stringify({ error: "Tournament key already exists" }));
      return;
    }
    let id = slug(name);
    if (!id) id = `torneo-${Date.now()}`;
    const baseId = id;
    let index = 2;
    while (store.tournaments.some(tournament => tournament.id === id)) {
      id = `${baseId}-${index}`;
      index += 1;
    }

    const tournament = {
      id,
      name,
      code: requestedCode,
      tenantId: tenant?.id || "",
      isGlobal: false,
      creatorEmail,
      creatorKey: randomSecret(),
      templateId: template.id,
      mode: customTemplate?.mode || body.mode || template.mode,
      customTemplate,
      scoring: normalizeScoring(body.scoring),
      payment: body.payment || null,
      payments: {},
      createdAt: new Date().toISOString(),
      realResults: null,
      submissions: []
    };
    store.tournaments.push(tournament);
    writeStore(store);
    send(res, 201, JSON.stringify({
      tournament: publicTournament(tournament, { includePrivateCode: true }),
      creatorKey: tournament.creatorKey
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleJoinTournament(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const name = String(body.name || "").trim();
    const code = normalizeCode(body.code);
    const tenant = tenantFromValue(body.tenantId);
    const store = readStore();
    const tournament = store.tournaments.find(item =>
      !item.isGlobal &&
      (!tenant || item.tenantId === tenant.id) &&
      item.code === code &&
      item.name.toLowerCase() === name.toLowerCase()
    );
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament name and key do not match" }));
      return;
    }
    send(res, 200, JSON.stringify({
      tournament: publicTournament(tournament, { includePrivateCode: true })
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleSubmitProde(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tournamentId = body.tournamentId || body.tournamentCode || "global";
    const tenant = tenantFromValue(body.tenantId);
    const payload = body.payload;
    const phaseId = normalizePhaseId(body.phaseId || payload?.phaseId);
    if (!payload?.player?.email || !payload?.player?.name || !payload?.tournament) {
      send(res, 400, JSON.stringify({ error: "Invalid prode payload" }));
      return;
    }

    const store = readStore();
    const tournament = findTournament(store, tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if ((tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    const phase = phaseById(phaseId);
    if (phase.type === "matches" && !tournament.realResults) {
      send(res, 409, JSON.stringify({ error: "Esta fase se habilita cuando esten cargados los cruces reales." }));
      return;
    }

    const email = payload.player.email.toLowerCase();
    const existingIndex = tournament.submissions.findIndex(item => String(item.player?.email || "").toLowerCase() === email);
    const previous = existingIndex >= 0 ? tournament.submissions[existingIndex] : null;
    const flowError = validatePredictionFlow(previous, phaseId);
    if (flowError) {
      send(res, 409, JSON.stringify({ error: flowError }));
      return;
    }
    if (!previous && !paymentAllowsFirstSubmission(tournament, email)) {
      send(res, 402, JSON.stringify({ error: "Payment is required before first prediction", payment: paymentSettings(tournament) }));
      return;
    }
    const continuationToken = previous?.continuationToken || randomSecret();
    const prediction = mergePredictionByPhase(previous?.prediction, payload.tournament, phaseId);
    const submission = {
      id: `${Date.now()}-${slug(payload.player.email)}`,
      createdAt: previous?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phaseId,
      completedPhases: [...new Set([...(previous?.completedPhases || []), phaseId])],
      continuationToken,
      player: payload.player,
      prediction
    };
    if (existingIndex >= 0) tournament.submissions[existingIndex] = submission;
    else tournament.submissions.push(submission);

    writeStore(store);
    const continuationUrl = `${siteBaseUrl(req)}/continuar/${encodeURIComponent(continuationToken)}`;
    const nextPhase = nextPhaseId(phaseId);
    const nextPhaseUrl = nextPhase ? `${continuationUrl}?fase=${encodeURIComponent(nextPhase)}` : continuationUrl;
    send(res, 200, JSON.stringify({
      ok: true,
      tournament: publicTournament(tournament),
      submissionId: submission.id,
      continuationToken,
      continuationUrl,
      nextPhaseId: nextPhase,
      nextPhaseUrl
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function handleContinueProde(req, res) {
  const url = new URL(req.url, "http://localhost");
  const token = String(url.searchParams.get("token") || "").trim();
  if (!token) {
    send(res, 400, JSON.stringify({ error: "Continuation token is required" }));
    return;
  }
  const store = readStore();
  for (const tournament of store.tournaments) {
    const submission = (tournament.submissions || []).find(item => item.continuationToken === token);
    if (submission) {
      send(res, 200, JSON.stringify({
        tournament: publicTournament(tournament, { includePrivateCode: true }),
        player: submission.player,
        prediction: submission.prediction,
        completedPhases: submission.completedPhases || [],
        phaseId: submission.phaseId || "all"
      }));
      return;
    }
  }
  send(res, 404, JSON.stringify({ error: "Continuation link not found" }));
}

function handlePaymentStatus(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tournamentId = url.searchParams.get("tournamentId") || "global";
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const email = normalizeEmail(url.searchParams.get("email"));
  const store = readStore();
  const tournament = findTournament(store, tournamentId);
  if (!tournament || (tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
    send(res, 404, JSON.stringify({ error: "Tournament not found" }));
    return;
  }
  const existingSubmission = (tournament.submissions || []).some(item => normalizeEmail(item.player?.email) === email);
  const payment = paymentFor(tournament, email);
  send(res, 200, JSON.stringify({
    required: paymentSettings(tournament).required && !existingSubmission,
    canSubmit: existingSubmission || paymentAllowsFirstSubmission(tournament, email),
    existingSubmission,
    payment: payment || null,
    settings: paymentSettings(tournament)
  }));
}

async function handleCreatePayment(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tournamentId = body.tournamentId || "global";
    const tenant = tenantFromValue(body.tenantId);
    const email = normalizeEmail(body.email);
    const name = String(body.name || "").trim().slice(0, 100);
    if (!email || !name) {
      send(res, 400, JSON.stringify({ error: "Name and email are required" }));
      return;
    }
    const store = readStore();
    const tournament = findTournament(store, tournamentId);
    if (!tournament || (tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    const settings = paymentSettings(tournament);
    if (!settings.required) {
      send(res, 200, JSON.stringify({ ok: true, canSubmit: true }));
      return;
    }
    const amount = paymentAmountNumber(settings.amount);
    if (!amount) {
      send(res, 500, JSON.stringify({ error: "PAYMENT_AMOUNT_GLOBAL must be a valid amount" }));
      return;
    }
    if (!tournament.payments || typeof tournament.payments !== "object") tournament.payments = {};
    const key = paymentKey(email);
    const existing = tournament.payments[key];
    if (existing?.status === "approved") {
      send(res, 200, JSON.stringify({ ok: true, canSubmit: true, payment: existing }));
      return;
    }
    const reference = existing?.reference || `${tournament.id}-${Date.now()}-${slug(email)}`.slice(0, 64);
    const baseUrl = siteBaseUrl(req);
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
    const notificationUrl = `${baseUrl}/api/mercadopago-webhook${webhookSecret ? `?secret=${encodeURIComponent(webhookSecret)}` : ""}`;
    const preference = await mercadoPagoRequest("/checkout/preferences", {
      method: "POST",
      headers: { "X-Idempotency-Key": reference },
      body: JSON.stringify({
        items: [{
          title: settings.title || `Inscripcion ${tournament.name}`,
          quantity: 1,
          currency_id: settings.currency || "ARS",
          unit_price: amount
        }],
        payer: { name, email },
        external_reference: reference,
        notification_url: notificationUrl,
        back_urls: {
          success: `${baseUrl}/?mp=success`,
          pending: `${baseUrl}/?mp=pending`,
          failure: `${baseUrl}/?mp=failure`
        },
        metadata: {
          tournament_id: tournament.id,
          tenant_id: tournament.tenantId || "",
          player_email: email,
          player_name: name
        }
      })
    });
    const payment = {
      id: existing?.id || `${Date.now()}-${slug(email)}`,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: "mercadopago-checkout-pro",
      status: "pending",
      player: { name, email },
      reference,
      preferenceId: preference.id || "",
      initPoint: preference.init_point || preference.sandbox_init_point || "",
      amount: settings.amount || "",
      tournamentId: tournament.id
    };
    tournament.payments[key] = payment;
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, payment, initPoint: payment.initPoint, canSubmit: false }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function markMercadoPagoPayment(store, mpPayment) {
  const reference = String(mpPayment.external_reference || "");
  if (!reference) return false;
  for (const tournament of store.tournaments || []) {
    const payments = tournament.payments || {};
    const entry = Object.entries(payments).find(([, payment]) => payment.reference === reference);
    if (!entry) continue;
    const [key, payment] = entry;
    const approved = mpPayment.status === "approved";
    payments[key] = {
      ...payment,
      updatedAt: new Date().toISOString(),
      status: approved ? "approved" : (mpPayment.status || payment.status || "pending"),
      mercadoPagoPaymentId: String(mpPayment.id || payment.mercadoPagoPaymentId || ""),
      paidAt: approved ? (mpPayment.date_approved || new Date().toISOString()) : payment.paidAt || ""
    };
    tournament.payments = payments;
    return true;
  }
  return false;
}

async function handleMercadoPagoWebhook(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (secret && url.searchParams.get("secret") !== secret) {
      send(res, 403, JSON.stringify({ error: "Invalid Mercado Pago webhook secret" }));
      return;
    }
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};
    const paymentId = body?.data?.id || body?.resource || url.searchParams.get("data.id") || url.searchParams.get("id");
    const topic = body?.type || body?.topic || url.searchParams.get("type") || url.searchParams.get("topic");
    if (!paymentId || !String(topic || "payment").includes("payment")) {
      send(res, 200, JSON.stringify({ ok: true, ignored: true }));
      return;
    }
    const mpPayment = await mercadoPagoRequest(`/v1/payments/${encodeURIComponent(paymentId)}`);
    const store = readStore();
    const updated = markMercadoPagoPayment(store, mpPayment);
    if (updated) writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, updated }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleRegisterPayment(req, res) {
  send(res, 410, JSON.stringify({ error: "Manual payment registration is disabled. Use Checkout Pro." }));
}

async function handlePhaseReminders(req, res) {
  try {
    const secret = process.env.REMINDER_SECRET;
    const url = new URL(req.url, "http://localhost");
    if (secret && url.searchParams.get("secret") !== secret) {
      send(res, 403, JSON.stringify({ error: "Invalid reminder secret" }));
      return;
    }
    const phases = dueReminderPhases();
    if (!phases.length) {
      send(res, 200, JSON.stringify({ ok: true, sent: 0, phases: [] }));
      return;
    }
    const store = readStore();
    let sent = 0;
    for (const tournament of store.tournaments) {
      for (const submission of tournament.submissions || []) {
        if (!submission.continuationToken || !submission.player?.email) continue;
        if (!submission.remindersSent || typeof submission.remindersSent !== "object") submission.remindersSent = {};
        for (const phase of phases) {
          const key = reminderKey(phase.id);
          if (submission.remindersSent[key]) continue;
          const link = `${siteBaseUrl(req)}/continuar/${encodeURIComponent(submission.continuationToken)}?fase=${encodeURIComponent(phase.id)}`;
          await sendMail({
            to: submission.player.email,
            subject: `${tournament.name}: continua tu prode`,
            text: [
              `Hola ${submission.player.name || ""},`,
              "",
              `Manana empieza ${phaseById(phase.id).name}. Ya podes entrar y continuar tu pronostico con los cruces actualizados:`,
              link,
              "",
              "Si ya lo cargaste, podes ignorar este aviso."
            ].join("\n")
          });
          submission.remindersSent[key] = new Date().toISOString();
          sent += 1;
        }
      }
    }
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, sent, phases: phases.map(item => item.id) }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleSaveRealResults(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tournamentId = body.tournamentId || "global";
    const tenant = tenantFromValue(body.tenantId);
    const realResults = body.realResults;
    if ((!realResults?.groups || !realResults?.winners) && !realResults?.custom) {
      send(res, 400, JSON.stringify({ error: "Invalid real results" }));
      return;
    }
    const store = readStore();
    const tournament = store.tournaments.find(item => item.id === tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if ((tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if ((GLOBAL_ONLY || tournament.isGlobal) && !validResultsAdminPassword(body.adminPassword)) {
      send(res, 403, JSON.stringify({ error: "Password de resultados incorrecta" }));
      return;
    }
    if (!tournament.isGlobal && tournament.creatorKey && body.creatorKey !== tournament.creatorKey) {
      send(res, 403, JSON.stringify({ error: "Creator key is required to edit results" }));
      return;
    }
    tournament.realResults = realResults;
    tournament.realResultsUpdatedAt = new Date().toISOString();
    const resultsPhaseId = normalizePhaseId(body.resultsPhaseId || "");
    const mail = await sendNextPhaseLinksAfterRealResults(req, tournament, resultsPhaseId === "all" ? "" : resultsPhaseId);
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, mail }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function handleLeaderboard(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tournamentId = url.searchParams.get("tournamentId") || "global";
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const store = readStore();
  const tournament = store.tournaments.find(item => item.id === tournamentId);
  if (!tournament) {
    send(res, 404, JSON.stringify({ error: "Tournament not found" }));
    return;
  }
  if ((tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
    send(res, 404, JSON.stringify({ error: "Tournament not found" }));
    return;
  }
  const leaderboard = (tournament.submissions || [])
    .map(submission => ({
      player: {
        name: submission.player?.name || ""
      },
      createdAt: submission.createdAt,
      champion: submission.prediction?.custom?.champion || submission.prediction?.winners?.m104 || "",
      score: scoreSubmission(submission.prediction, tournament.realResults, tournament.scoring)
    }))
    .sort((a, b) => b.score.points - a.score.points || new Date(a.createdAt) - new Date(b.createdAt));
  send(res, 200, JSON.stringify({
    tournament: publicTournament(tournament),
    hasRealResults: Boolean(tournament.realResults),
    leaderboard
  }));
}

function serveStatic(req, res) {
  const cleanUrl = decodeURIComponent(req.url.split("?")[0]);
  const isCompanyView = !GLOBAL_ONLY && /^\/empresa\/[^/.]+\/?$/.test(cleanUrl);
  const isResultsAdminView = cleanUrl === "/resultados" || cleanUrl === "/resultados/" || cleanUrl === "/cargar-resultados" || cleanUrl === "/cargar-resultados/";
  const requested = req.url === "/" || cleanUrl.startsWith("/join/") || cleanUrl.startsWith("/continuar/") || isCompanyView || isResultsAdminView ? "/index.html" : cleanUrl;
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    send(res, 200, data, MIME[path.extname(filePath)] || "application/octet-stream");
  });
}

function stripBasePath(req) {
  if (!APP_BASE_PATH) return true;
  const [pathname, query = ""] = req.url.split("?");
  if (pathname === APP_BASE_PATH) {
    req.__redirectTo = `${APP_BASE_PATH}/${query ? `?${query}` : ""}`;
    return true;
  }
  if (pathname === APP_BASE_PATH || pathname === `${APP_BASE_PATH}/`) {
    req.url = `/${query ? `?${query}` : ""}`;
    return true;
  }
  if (pathname.startsWith(`${APP_BASE_PATH}/`)) {
    req.url = pathname.slice(APP_BASE_PATH.length) + (query ? `?${query}` : "");
    return true;
  }
  if (pathname === "/healthz") return true;
  return false;
}

http.createServer((req, res) => {
  if (!stripBasePath(req)) {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
    return;
  }
  if (req.__redirectTo) {
    res.writeHead(302, { Location: req.__redirectTo });
    res.end();
    return;
  }
  if (req.method === "GET" && req.url === "/healthz") {
    send(res, 200, JSON.stringify({ ok: true }));
    return;
  }
  if (req.method === "POST" && req.url === "/api/send-prode") {
    handleApi(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/continue-prode")) {
    handleContinueProde(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/payment-status")) {
    handlePaymentStatus(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/create-payment") {
    handleCreatePayment(req, res);
    return;
  }
  if (req.method === "POST" && req.url.startsWith("/api/mercadopago-webhook")) {
    handleMercadoPagoWebhook(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/register-payment") {
    handleRegisterPayment(req, res);
    return;
  }
  if (req.method === "POST" && req.url.startsWith("/api/send-phase-reminders")) {
    handlePhaseReminders(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/live-results")) {
    handleLiveResults(req, res);
    return;
  }
  if (req.method === "POST" && req.url.startsWith("/api/live-results")) {
    handleSaveLiveResults(req, res);
    return;
  }
  if (req.method === "GET" && req.url === "/api/templates") {
    handleTemplates(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/tenant")) {
    const url = new URL(req.url, "http://localhost");
    const tenant = tenantFromValue(url.searchParams.get("tenant"));
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Company not found" }));
      return;
    }
    send(res, 200, JSON.stringify({ tenant }));
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/tournaments")) {
    handleTournaments(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/tournaments") {
    handleCreateTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/join-tournament") {
    handleJoinTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/submit-prode") {
    handleSubmitProde(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/real-results") {
    handleSaveRealResults(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/leaderboard")) {
    handleLeaderboard(req, res);
    return;
  }
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`Prode Mundial listo en http://localhost:${PORT}`);
});
