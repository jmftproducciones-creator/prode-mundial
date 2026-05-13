const http = require("http");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const net = require("net");
const crypto = require("crypto");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
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
const SQL_ENABLED = ["1", "true", "yes", "si", "on"].includes(String(process.env.SQL_ENABLED || process.env.USE_SQL || "").toLowerCase())
  || Boolean(process.env.DATABASE_URL || process.env.DB_HOST || process.env.MYSQL_HOST);
const SQL_TABLE_PREFIX = (process.env.SQL_TABLE_PREFIX || "").replace(/[^a-zA-Z0-9_]/g, "");

function envFlag(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "si", "on"].includes(String(value).toLowerCase());
}

function envTenantValue(tenantId, key, fallback = "") {
  const scoped = process.env[`${key}_${String(tenantId || "").toUpperCase()}`];
  return scoped !== undefined ? scoped : (process.env[key] ?? fallback);
}

const TENANTS = {
  acme: {
    id: "acme",
    name: "ACME Energia",
    eyebrow: "Prode corporativo",
    title: "Prode ACME",
    description: "Predicciones y ranking exclusivo para ACME Energia.",
    areas: ["Sistemas", "RRHH", "Comercial", "Administracion"],
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
  const id = slug(value);
  return TENANTS[id] || null;
}

function tenantTournamentId(tenantId) {
  return `empresa-${tenantId}`;
}

function paymentSettings(tournament) {
  return { required: false };
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
  if (!store.tenants || typeof store.tenants !== "object") store.tenants = {};
  Object.values(TENANTS).forEach(tenant => {
    const previous = store.tenants[tenant.id] && typeof store.tenants[tenant.id] === "object" ? store.tenants[tenant.id] : {};
    const existingAreas = Array.isArray(previous.areas) ? previous.areas : [];
    const baseAreas = Array.isArray(tenant.areas) ? tenant.areas : [];
    store.tenants[tenant.id] = {
      ...previous,
      id: tenant.id,
      name: tenant.name,
      areas: [...new Set([...baseAreas, ...existingAreas].map(normalizeAreaName).filter(Boolean))],
      users: previous.users && typeof previous.users === "object" ? previous.users : {},
      sessions: previous.sessions && typeof previous.sessions === "object" ? previous.sessions : {}
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

function tenantStore(store, tenantId) {
  if (!store.tenants || typeof store.tenants !== "object") store.tenants = {};
  if (!store.tenants[tenantId]) {
    store.tenants[tenantId] = { id: tenantId, name: TENANTS[tenantId]?.name || tenantId, areas: [], users: {}, sessions: {} };
  }
  const tenantData = store.tenants[tenantId];
  if (!Array.isArray(tenantData.areas)) tenantData.areas = [];
  if (!tenantData.users || typeof tenantData.users !== "object") tenantData.users = {};
  if (!tenantData.sessions || typeof tenantData.sessions !== "object") tenantData.sessions = {};
  return tenantData;
}

function ensureDataDir() {
  fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
}

function sqlIdentifier(name) {
  return `\`${String(name).replace(/`/g, "``")}\``;
}

function sqlTable(name) {
  return sqlIdentifier(SQL_TABLE_PREFIX ? `${SQL_TABLE_PREFIX}_${name}` : name);
}

function mysqlConfig() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  return {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "prodemundial",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    charset: "utf8mb4"
  };
}

let sqlPool = null;
let sqlSchemaReady = false;

function getSqlPool() {
  if (!SQL_ENABLED) return null;
  if (!sqlPool) {
    let mysql;
    try {
      mysql = require("mysql2/promise");
    } catch (error) {
      throw new Error("SQL is enabled but mysql2 is not installed. Run: npm install mysql2");
    }
    sqlPool = mysql.createPool(mysqlConfig());
  }
  return sqlPool;
}

async function ensureSqlSchema() {
  if (!SQL_ENABLED || sqlSchemaReady) return;
  const pool = getSqlPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${sqlTable("tournaments")} (
      id VARCHAR(120) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(60) NULL UNIQUE,
      is_global TINYINT(1) NULL DEFAULT 0,
      creator_email VARCHAR(255) NULL,
      creator_key VARCHAR(255) NULL,
      template_id VARCHAR(120) NULL,
      mode VARCHAR(80) NULL,
      custom_template JSON NULL,
      scoring JSON NULL,
      real_results JSON NULL,
      real_results_updated_at DATETIME NULL,
      created_at DATETIME NULL,
      raw_json JSON NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${sqlTable("submissions")} (
      id VARCHAR(160) NOT NULL PRIMARY KEY,
      tournament_id VARCHAR(120) NOT NULL,
      player JSON NOT NULL,
      prediction JSON NOT NULL,
      created_at DATETIME NULL,
      raw_json JSON NULL,
      INDEX (tournament_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${sqlTable("tenants")} (
      id VARCHAR(120) NOT NULL PRIMARY KEY,
      data JSON NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  sqlSchemaReady = true;
}

function parseSqlJson(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function sqlDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function isoDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : String(value);
}

function jsonForSql(value) {
  return value === undefined ? null : JSON.stringify(value);
}

function tournamentFromSqlRow(row, submissions = []) {
  const raw = parseSqlJson(row.raw_json, {});
  return {
    ...raw,
    id: row.id,
    name: row.name,
    code: row.code || raw.code || "",
    isGlobal: Boolean(row.is_global),
    creatorEmail: row.creator_email || raw.creatorEmail || "",
    creatorKey: row.creator_key || raw.creatorKey || "",
    templateId: row.template_id || raw.templateId || "worldcup-2026",
    mode: row.mode || raw.mode || "groups-knockout",
    customTemplate: parseSqlJson(row.custom_template, raw.customTemplate || null),
    scoring: parseSqlJson(row.scoring, raw.scoring || DEFAULT_SCORING),
    realResults: parseSqlJson(row.real_results, raw.realResults || null),
    realResultsUpdatedAt: isoDate(row.real_results_updated_at || raw.realResultsUpdatedAt),
    createdAt: isoDate(row.created_at || raw.createdAt || new Date()),
    submissions
  };
}

function submissionFromSqlRow(row) {
  const raw = parseSqlJson(row.raw_json, {});
  return {
    ...raw,
    id: row.id,
    createdAt: isoDate(row.created_at || raw.createdAt || new Date()),
    player: parseSqlJson(row.player, raw.player || {}),
    prediction: parseSqlJson(row.prediction, raw.prediction || {})
  };
}

function readJsonStore() {
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
    writeJsonStore(store);
    return store;
  }
}

function writeJsonStore(store) {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

async function readSqlStore() {
  await ensureSqlSchema();
  const pool = getSqlPool();
  const [tournamentRows] = await pool.query(`SELECT * FROM ${sqlTable("tournaments")} ORDER BY id`);
  const [submissionRows] = await pool.query(`SELECT * FROM ${sqlTable("submissions")} ORDER BY created_at, id`);
  const [tenantRows] = await pool.query(`SELECT id, data FROM ${sqlTable("tenants")} ORDER BY id`);
  const submissionsByTournament = new Map();
  submissionRows.forEach(row => {
    const submission = submissionFromSqlRow(row);
    const list = submissionsByTournament.get(row.tournament_id) || [];
    list.push(submission);
    submissionsByTournament.set(row.tournament_id, list);
  });
  const store = {
    tournaments: tournamentRows.map(row => tournamentFromSqlRow(row, submissionsByTournament.get(row.id) || [])),
    tenants: {}
  };
  tenantRows.forEach(row => {
    const tenant = parseSqlJson(row.data, null);
    if (tenant) store.tenants[row.id] = tenant;
  });
  if (!store.tournaments.length) {
    const jsonStore = readJsonStore();
    await writeSqlStore(jsonStore);
    return jsonStore;
  }
  if (!store.tournaments.some(tournament => tournament.id === "global")) {
    store.tournaments.unshift(emptyStore().tournaments[0]);
  }
  ensureTenantTournaments(store);
  return store;
}

async function writeSqlStore(store) {
  await ensureSqlSchema();
  const pool = getSqlPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`DELETE FROM ${sqlTable("tenants")}`);
    await connection.query(`DELETE FROM ${sqlTable("submissions")}`);
    for (const tournament of store.tournaments || []) {
      const tournamentRaw = { ...tournament };
      delete tournamentRaw.submissions;
      await connection.query(
        `
          INSERT INTO ${sqlTable("tournaments")} (
            id, name, code, is_global, creator_email, creator_key, template_id, mode,
            custom_template, scoring, real_results, real_results_updated_at, created_at, raw_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            code = VALUES(code),
            is_global = VALUES(is_global),
            creator_email = VALUES(creator_email),
            creator_key = VALUES(creator_key),
            template_id = VALUES(template_id),
            mode = VALUES(mode),
            custom_template = VALUES(custom_template),
            scoring = VALUES(scoring),
            real_results = VALUES(real_results),
            real_results_updated_at = VALUES(real_results_updated_at),
            created_at = VALUES(created_at),
            raw_json = VALUES(raw_json)
        `,
        [
          tournament.id,
          tournament.name || tournament.id,
          tournament.code || null,
          tournament.isGlobal ? 1 : 0,
          tournament.creatorEmail || null,
          tournament.creatorKey || null,
          tournament.templateId || null,
          tournament.mode || null,
          jsonForSql(tournament.customTemplate || null),
          jsonForSql(tournament.scoring || DEFAULT_SCORING),
          jsonForSql(tournament.realResults || null),
          sqlDate(tournament.realResultsUpdatedAt || tournament.real_results_updated_at),
          sqlDate(tournament.createdAt || new Date()),
          jsonForSql(tournamentRaw)
        ]
      );
      for (const submission of tournament.submissions || []) {
        await connection.query(
          `
            INSERT INTO ${sqlTable("submissions")} (
              id, tournament_id, player, prediction, created_at, raw_json
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            submission.id,
            tournament.id,
            jsonForSql(submission.player || {}),
            jsonForSql(submission.prediction || {}),
            sqlDate(submission.createdAt || new Date()),
            jsonForSql(submission)
          ]
        );
      }
    }
    for (const [id, tenant] of Object.entries(store.tenants || {})) {
      await connection.query(
        `INSERT INTO ${sqlTable("tenants")} (id, data) VALUES (?, ?)`,
        [id, JSON.stringify(tenant)]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function readStore() {
  return SQL_ENABLED ? readSqlStore() : readJsonStore();
}

async function writeStore(store) {
  if (SQL_ENABLED) await writeSqlStore(store);
  else writeJsonStore(store);
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
    data.invitePath = `/join/${encodeURIComponent(tournament.code)}`;
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

function normalizeAreaName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);
}

function areaId(value) {
  return slug(normalizeAreaName(value));
}

function publicTenant(tenant, tenantData = {}) {
  return {
    ...tenant,
    areas: Array.isArray(tenantData.areas) ? tenantData.areas : [],
    userEmails: Object.keys(tenantData.users || {})
  };
}

function sessionUser(store, tenant, token) {
  const rawToken = String(token || "").trim();
  if (!tenant || !rawToken) return null;
  const tenantData = tenantStore(store, tenant.id);
  const email = tenantData.sessions[rawToken];
  const user = email ? tenantData.users[email] : null;
  if (!user) return null;
  if (user.active === false) return null;
  return {
    name: user.name || "",
    email: user.email || email,
    area: user.area || "",
    isAdmin: Boolean(user.isAdmin || isAdminEmail(tenant.id, user.email || email))
  };
}

function adminKeyFor(tenantId) {
  return envTenantValue(tenantId || "", "ADMIN_KEY", process.env.ADMIN_KEY || "");
}

function envTenantList(tenantId, key) {
  return envTenantValue(tenantId || "", key, "")
    .split(",")
    .map(item => normalizeEmail(item))
    .filter(Boolean);
}

function isAdminEmail(tenantId, email) {
  const admins = envTenantList(tenantId, "ADMIN_EMAILS");
  return admins.includes(normalizeEmail(email));
}

function adminSessionUser(store, tenant, token) {
  const user = sessionUser(store, tenant, token);
  return user?.isAdmin ? user : null;
}

async function requireAdmin(req, res, tenant, key, sessionToken = "") {
  const store = await readStore();
  if (adminSessionUser(store, tenant, sessionToken)) return true;
  const expected = adminKeyFor(tenant?.id || "");
  if (!expected) {
    send(res, 403, JSON.stringify({ error: "ADMIN_KEY is not configured" }));
    return false;
  }
  if (String(key || "") !== String(expected)) {
    send(res, 401, JSON.stringify({ error: "Invalid admin key" }));
    return false;
  }
  return true;
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

function passwordHash(password, salt) {
  return crypto.pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256").toString("hex");
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return { salt, hash: passwordHash(password, salt) };
}

function verifyPassword(password, user) {
  if (!user?.password?.salt || !user?.password?.hash) return false;
  return crypto.timingSafeEqual(
    Buffer.from(user.password.hash, "hex"),
    Buffer.from(passwordHash(password, user.password.salt), "hex")
  );
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
  return (process.env.PUBLIC_BASE_URL || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host || `localhost:${PORT}`}`).replace(/\/$/, "");
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

function scoreSubmission(prediction, real, scoring = DEFAULT_SCORING) {
  if (!prediction || !real) {
    return { points: 0, groupHits: 0, winnerHits: 0, exactScoreHits: 0, championHit: false };
  }
  const rules = normalizeScoring(scoring);
  if (real.custom) {
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

async function sendMail({ to, subject, text, filename, pdfBase64 }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
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
  await smtpCommand(socket, `MAIL FROM:<${from}>`, [250]);
  await smtpCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
  await smtpCommand(socket, "DATA", [354]);
  await smtpCommand(socket, `${message}\r\n.`, [250]);
  await smtpCommand(socket, "QUIT", [221]);
  socket.end();
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

async function sendSubmissionConfirmation({ to, playerName, tournamentName, phaseId, continuationUrl, nextPhaseUrl }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { skipped: true, reason: "SMTP not configured" };
  }
  const phase = phaseById(phaseId);
  const nextPhase = nextPhaseId(phaseId);
  const lines = [
    `Hola ${playerName || ""},`,
    "",
    `Guardamos tu pronostico de ${phase.name} en ${tournamentName}.`,
    "",
    "Link para continuar o corregir:",
    continuationUrl
  ];
  if (nextPhase && nextPhaseUrl) {
    lines.push(
      "",
      `Cuando corresponda, podes cargar ${phaseById(nextPhase).name} desde este link:`,
      nextPhaseUrl
    );
  }
  lines.push("", "Si ya lo tenias guardado, este correo confirma la ultima version.");
  await sendMail({
    to,
    subject: `${tournamentName}: pronostico guardado`,
    text: lines.join("\n")
  });
  return { sent: true };
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

async function handleTournaments(req, res) {
  const store = await readStore();
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

async function handleCompanyLogin(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const name = String(body.name || "").trim().slice(0, 100);
    const email = normalizeEmail(body.email);
    const area = normalizeAreaName(body.area);
    const password = String(body.password || "");
    const mode = body.mode === "create" ? "create" : "login";
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Company not found" }));
      return;
    }
    if (!email || !password) {
      send(res, 400, JSON.stringify({ error: "Email and password are required" }));
      return;
    }
    const store = await readStore();
    const tenantData = tenantStore(store, tenant.id);
    const previousUser = tenantData.users[email];
    if (previousUser) {
      if (mode === "create") {
        send(res, 409, JSON.stringify({ error: "User already exists" }));
        return;
      }
      if (previousUser.active === false) {
        send(res, 403, JSON.stringify({ error: "User is disabled" }));
        return;
      }
      if (!verifyPassword(password, previousUser)) {
        send(res, 401, JSON.stringify({ error: "Invalid email or password" }));
        return;
      }
    } else if (!name || !area) {
      send(res, 400, JSON.stringify({ error: "Name and area are required for first login" }));
      return;
    }
    const finalName = previousUser?.name || name;
    const finalArea = previousUser?.area || area;
    const isAdmin = Boolean(previousUser?.isAdmin || isAdminEmail(tenant.id, email));
    if (!tenantData.areas.some(item => areaId(item) === areaId(finalArea))) tenantData.areas.push(finalArea);
    const token = randomSecret();
    tenantData.users[email] = {
      ...(previousUser || {}),
      name: finalName,
      email,
      area: finalArea,
      active: previousUser?.active !== false,
      isAdmin,
      password: previousUser?.password || createPasswordRecord(password),
      updatedAt: new Date().toISOString(),
      createdAt: previousUser?.createdAt || new Date().toISOString()
    };
    tenantData.sessions[token] = email;
    await writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      token,
      user: { name: finalName, email, area: finalArea, isAdmin },
      tenant: publicTenant(tenant, tenantData)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleCompanySession(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const token = url.searchParams.get("sessionToken");
  if (!tenant) {
    send(res, 404, JSON.stringify({ error: "Company not found" }));
    return;
  }
  const store = await readStore();
  const user = sessionUser(store, tenant, token);
  if (!user) {
    send(res, 401, JSON.stringify({ error: "Login is required" }));
    return;
  }
  send(res, 200, JSON.stringify({
    ok: true,
    user,
    tenant: publicTenant(tenant, tenantStore(store, tenant.id))
  }));
}

async function handleAdminUpdateUser(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const email = normalizeEmail(body.email);
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Company not found" }));
      return;
    }
    if (!await requireAdmin(req, res, tenant, body.adminKey, body.sessionToken)) return;
    if (!email) {
      send(res, 400, JSON.stringify({ error: "User email is required" }));
      return;
    }
    const store = await readStore();
    const tenantData = tenantStore(store, tenant.id);
    const user = tenantData.users[email];
    if (!user) {
      send(res, 404, JSON.stringify({ error: "User not found" }));
      return;
    }
    const name = String(body.name || "").trim().slice(0, 100);
    const area = normalizeAreaName(body.area);
    if (!name || !area) {
      send(res, 400, JSON.stringify({ error: "Name and area are required" }));
      return;
    }
    const active = body.active !== false;
    user.name = name;
    user.area = area;
    user.active = active;
    user.isAdmin = Boolean(body.isAdmin || isAdminEmail(tenant.id, email));
    user.updatedAt = new Date().toISOString();
    if (!tenantData.areas.some(item => areaId(item) === areaId(area))) tenantData.areas.push(area);
    if (!active) {
      Object.entries(tenantData.sessions).forEach(([token, sessionEmail]) => {
        if (normalizeEmail(sessionEmail) === email) delete tenantData.sessions[token];
      });
    }
    await writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      user: { name: user.name, email: user.email || email, area: user.area, active: user.active !== false, isAdmin: user.isAdmin }
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleCreateCompanyArea(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const name = normalizeAreaName(body.name);
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Company not found" }));
      return;
    }
    const store = await readStore();
    const user = sessionUser(store, tenant, body.sessionToken);
    if (!user) {
      send(res, 401, JSON.stringify({ error: "Login is required" }));
      return;
    }
    if (!name) {
      send(res, 400, JSON.stringify({ error: "Area name is required" }));
      return;
    }
    const tenantData = tenantStore(store, tenant.id);
    if (!tenantData.areas.some(item => areaId(item) === areaId(name))) tenantData.areas.push(name);
    await writeStore(store);
    send(res, 201, JSON.stringify({ ok: true, tenant: publicTenant(tenant, tenantData) }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
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

    const store = await readStore();
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
    await writeStore(store);
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
    const store = await readStore();
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

    const store = await readStore();
    const tournament = findTournament(store, tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if ((tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    let loggedUser = null;
    if (tenant) {
      loggedUser = sessionUser(store, tenant, body.sessionToken);
      if (!loggedUser) {
        send(res, 401, JSON.stringify({ error: "Login is required before saving predictions" }));
        return;
      }
      payload.player = {
        ...payload.player,
        name: loggedUser.name,
        email: loggedUser.email,
        area: loggedUser.area
      };
    }

    const email = payload.player.email.toLowerCase();
    const existingIndex = tournament.submissions.findIndex(item => String(item.player?.email || "").toLowerCase() === email);
    const previous = existingIndex >= 0 ? tournament.submissions[existingIndex] : null;
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

    await writeStore(store);
    const continuationUrl = `${siteBaseUrl(req)}/continuar/${encodeURIComponent(continuationToken)}`;
    const nextPhase = nextPhaseId(phaseId);
    const nextPhaseUrl = nextPhase ? `${continuationUrl}?fase=${encodeURIComponent(nextPhase)}` : continuationUrl;
    let mail = null;
    try {
      mail = await sendSubmissionConfirmation({
        to: submission.player.email,
        playerName: submission.player.name,
        tournamentName: tournament.name,
        phaseId,
        continuationUrl,
        nextPhaseUrl
      });
    } catch (error) {
      mail = { error: error.message };
    }
    send(res, 200, JSON.stringify({
      ok: true,
      tournament: publicTournament(tournament),
      submissionId: submission.id,
      continuationToken,
      continuationUrl,
      nextPhaseId: nextPhase,
      nextPhaseUrl,
      mail
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function materializeApprovedPaymentDraft(req, tournament, payment) {
  if (payment?.status !== "approved" || payment.submissionId || !payment.pendingSubmission?.payload) return null;
  const payload = payment.pendingSubmission.payload;
  const phaseId = normalizePhaseId(payment.pendingSubmission.phaseId || payload?.phaseId);
  if (!payload?.player?.email || !payload?.player?.name || !payload?.tournament) return null;
  const email = normalizeEmail(payload.player.email);
  if (!email || email !== normalizeEmail(payment.player?.email)) return null;
  const existingIndex = tournament.submissions.findIndex(item => normalizeEmail(item.player?.email) === email);
  const previous = existingIndex >= 0 ? tournament.submissions[existingIndex] : null;
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
  payment.submissionId = submission.id;
  payment.submittedAt = new Date().toISOString();
  delete payment.pendingSubmission;
  payment.continuationUrl = `${siteBaseUrl(req)}/continuar/${encodeURIComponent(continuationToken)}`;
  return submission;
}

async function handleContinueProde(req, res) {
  const url = new URL(req.url, "http://localhost");
  const token = String(url.searchParams.get("token") || "").trim();
  if (!token) {
    send(res, 400, JSON.stringify({ error: "Continuation token is required" }));
    return;
  }
  const store = await readStore();
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

async function handlePaymentStatus(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tournamentId = url.searchParams.get("tournamentId") || "global";
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const email = normalizeEmail(url.searchParams.get("email"));
  const store = await readStore();
  const tournament = findTournament(store, tournamentId);
  if (!tournament || (tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
    send(res, 404, JSON.stringify({ error: "Tournament not found" }));
    return;
  }
  const payment = paymentFor(tournament, email);
  if (payment?.status === "approved" && payment.pendingSubmission) {
    const submission = materializeApprovedPaymentDraft(req, tournament, payment);
    if (submission) await writeStore(store);
  }
  const existingSubmission = (tournament.submissions || []).some(item => normalizeEmail(item.player?.email) === email);
  send(res, 200, JSON.stringify({
    required: paymentSettings(tournament).required && !existingSubmission,
    canSubmit: existingSubmission || paymentAllowsFirstSubmission(tournament, email),
    existingSubmission,
    payment: payment || null,
    settings: paymentSettings(tournament)
  }));
}

async function handleRegisterPayment(req, res) {
  send(res, 410, JSON.stringify({ error: "Payments are disabled" }));
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
    const store = await readStore();
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
    await writeStore(store);
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
    const store = await readStore();
    const tournament = store.tournaments.find(item => item.id === tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if ((tenant && tournament.tenantId !== tenant.id) || (!tenant && tournament.tenantId)) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if (tenant && !await requireAdmin(req, res, tenant, body.adminKey, body.sessionToken)) return;
    if (!tournament.isGlobal && tournament.creatorKey && body.creatorKey !== tournament.creatorKey) {
      send(res, 403, JSON.stringify({ error: "Creator key is required to edit results" }));
      return;
    }
    tournament.realResults = realResults;
    tournament.realResultsUpdatedAt = new Date().toISOString();
    await writeStore(store);
    send(res, 200, JSON.stringify({ ok: true }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleLeaderboard(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tournamentId = url.searchParams.get("tournamentId") || "global";
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const area = normalizeAreaName(url.searchParams.get("area"));
  const store = await readStore();
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
    .filter(submission => !area || areaId(submission.player?.area) === areaId(area))
    .map(submission => ({
      player: {
        name: submission.player?.name || "",
        area: submission.player?.area || ""
      },
      createdAt: submission.createdAt,
      champion: submission.prediction?.custom?.champion || submission.prediction?.winners?.m104 || "",
      score: scoreSubmission(submission.prediction, tournament.realResults, tournament.scoring)
    }))
    .sort((a, b) => b.score.points - a.score.points || new Date(a.createdAt) - new Date(b.createdAt));
  send(res, 200, JSON.stringify({
    tournament: publicTournament(tournament),
    area,
    hasRealResults: Boolean(tournament.realResults),
    leaderboard
  }));
}

async function handleAdminSummary(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const adminKey = url.searchParams.get("adminKey");
  const sessionToken = url.searchParams.get("sessionToken");
  if (!tenant) {
    send(res, 404, JSON.stringify({ error: "Company not found" }));
    return;
  }
  if (!await requireAdmin(req, res, tenant, adminKey, sessionToken)) return;
  const store = await readStore();
  const tenantData = tenantStore(store, tenant.id);
  const tournament = store.tournaments.find(item => item.id === tenantTournamentId(tenant.id));
  const submissions = tournament?.submissions || [];
  const byEmail = new Map(submissions.map(submission => [normalizeEmail(submission.player?.email), submission]));
    const users = Object.values(tenantData.users || {})
    .map(user => {
      const submission = byEmail.get(normalizeEmail(user.email));
      const admin = Boolean(user.isAdmin || isAdminEmail(tenant.id, user.email));
      if (admin && !user.isAdmin) user.isAdmin = true;
      return {
        name: user.name || "",
        email: user.email || "",
        area: user.area || "",
        active: user.active !== false,
        isAdmin: admin,
        registered: true,
        registeredAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
        hasPrediction: Boolean(submission),
        predictionUpdatedAt: submission?.updatedAt || "",
        completedPhases: submission?.completedPhases || []
      };
    })
    .sort((a, b) => a.area.localeCompare(b.area) || a.name.localeCompare(b.name));
  const extraPlayers = submissions
    .filter(submission => !tenantData.users?.[normalizeEmail(submission.player?.email)])
    .map(submission => ({
      name: submission.player?.name || "",
      email: submission.player?.email || "",
      area: submission.player?.area || "",
      active: true,
      isAdmin: false,
      registered: false,
      registeredAt: "",
      updatedAt: "",
      hasPrediction: true,
      predictionUpdatedAt: submission.updatedAt || "",
      completedPhases: submission.completedPhases || []
    }));
  send(res, 200, JSON.stringify({
    tenant: publicTenant(tenant, tenantData),
    tournament: tournament ? publicTournament(tournament, { includePrivateCode: true }) : null,
    stats: {
      users: users.length + extraPlayers.length,
      predictions: submissions.length,
      areas: tenantData.areas.length
    },
    users: [...users, ...extraPlayers]
  }));
}

function serveStatic(req, res) {
  const cleanUrl = decodeURIComponent(req.url.split("?")[0]);
  const isCompanyView = /^\/empresa\/[^/.]+\/?$/.test(cleanUrl);
  const requested = req.url === "/" || cleanUrl.startsWith("/join/") || cleanUrl.startsWith("/continuar/") || isCompanyView ? "/index.html" : cleanUrl;
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

http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    send(res, 200, JSON.stringify({ ok: true }));
    return;
  }
  if (req.method === "POST" && req.url === "/api/send-prode") {
    await handleApi(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/continue-prode")) {
    await handleContinueProde(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/register-payment") {
    await handleRegisterPayment(req, res);
    return;
  }
  if (req.method === "POST" && req.url.startsWith("/api/send-phase-reminders")) {
    await handlePhaseReminders(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/live-results")) {
    await handleLiveResults(req, res);
    return;
  }
  if (req.method === "POST" && req.url.startsWith("/api/live-results")) {
    await handleSaveLiveResults(req, res);
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
    const store = await readStore();
    send(res, 200, JSON.stringify({ tenant: publicTenant(tenant, tenantStore(store, tenant.id)) }));
    return;
  }
  if (req.method === "POST" && req.url === "/api/company-login") {
    await handleCompanyLogin(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/company-session")) {
    await handleCompanySession(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/admin-users") {
    await handleAdminUpdateUser(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/company-areas") {
    await handleCreateCompanyArea(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/admin-summary")) {
    await handleAdminSummary(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/tournaments")) {
    await handleTournaments(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/tournaments") {
    await handleCreateTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/join-tournament") {
    await handleJoinTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/submit-prode") {
    await handleSubmitProde(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/real-results") {
    await handleSaveRealResults(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/leaderboard")) {
    await handleLeaderboard(req, res);
    return;
  }
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`Prode Mundial listo en http://localhost:${PORT}`);
});
