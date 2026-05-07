const http = require("http");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const net = require("net");

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

const TENANTS = {
  acme: {
    id: "acme",
    name: "ACME Energia",
    eyebrow: "Prode corporativo",
    title: "Prode ACME",
    description: "Predicciones y ranking exclusivo para ACME Energia.",
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

function ensureTenantTournaments(store) {
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

function scoreLabel(score) {
  if (!score || score.left === "" || score.right === "" || score.left === undefined || score.right === undefined) return "";
  return `${score.left}-${score.right}`;
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
    home: normalizeName(match.home_team ?? match.homeTeam ?? match.home?.name ?? match.localteam_name),
    away: normalizeName(match.away_team ?? match.awayTeam ?? match.away?.name ?? match.visitorteam_name),
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
  const attachment = pdfBase64.replace(/(.{76})/g, "$1\r\n");
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
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
  ].join("\r\n");

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

    const submission = {
      id: `${Date.now()}-${slug(payload.player.email)}`,
      createdAt: new Date().toISOString(),
      player: payload.player,
      prediction: payload.tournament
    };
    const email = payload.player.email.toLowerCase();
    const existingIndex = tournament.submissions.findIndex(item => String(item.player?.email || "").toLowerCase() === email);
    if (existingIndex >= 0) tournament.submissions[existingIndex] = submission;
    else tournament.submissions.push(submission);

    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, tournament: publicTournament(tournament), submissionId: submission.id }));
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
    if (!tournament.isGlobal && tournament.creatorKey && body.creatorKey !== tournament.creatorKey) {
      send(res, 403, JSON.stringify({ error: "Creator key is required to edit results" }));
      return;
    }
    tournament.realResults = realResults;
    tournament.realResultsUpdatedAt = new Date().toISOString();
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true }));
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
  const isCompanyView = /^\/empresa\/[^/.]+\/?$/.test(cleanUrl);
  const requested = req.url === "/" || cleanUrl.startsWith("/join/") || isCompanyView ? "/index.html" : cleanUrl;
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

http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    send(res, 200, JSON.stringify({ ok: true }));
    return;
  }
  if (req.method === "POST" && req.url === "/api/send-prode") {
    handleApi(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/live-results")) {
    handleLiveResults(req, res);
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
