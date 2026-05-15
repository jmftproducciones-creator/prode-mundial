const http = require("http");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const net = require("net");
const crypto = require("crypto");
try {
  require("dotenv").config();
} catch {
  // Optional in local runs; loadEnvFile below handles .env without a package.
}
const mysql = require("mysql2/promise");
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
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "root",
  database: process.env.DB_NAME || "prode_mundial_2026",
  port: Number(process.env.DB_PORT || 3306)
};

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

const DEFAULT_DAILY_GAMES = {
  enabled: true,
  title: "Centro de minijuegos",
  intro: "Desafios rapidos para sumar ritmo al prode diario.",
  rewardName: "Fan Points",
  points: {
    camisetadle: 20,
    desafio: 15
  },
  camisetas: [
    { id: "messi-10-arg-2022", player: "Lionel Messi", number: "10", team: "Argentina", tournament: "Mundial 2022", hint: "Campeon en Qatar" },
    { id: "mbappe-10-fra-2018", player: "Kylian Mbappe", number: "10", team: "Francia", tournament: "Mundial 2018", hint: "Campeon en Rusia" },
    { id: "ronaldo-7-por-2006", player: "Cristiano Ronaldo", number: "7", team: "Portugal", tournament: "Mundial 2006", hint: "Debuto mundialista en Alemania" },
    { id: "neymar-10-bra-2014", player: "Neymar", number: "10", team: "Brasil", tournament: "Mundial 2014", hint: "Local y figura de Brasil" },
    { id: "iniesta-6-esp-2010", player: "Andres Iniesta", number: "6", team: "Espana", tournament: "Mundial 2010", hint: "Gol historico en la final" },
    { id: "zidane-10-fra-1998", player: "Zinedine Zidane", number: "10", team: "Francia", tournament: "Mundial 1998", hint: "Dos goles en la final" },
    { id: "ronaldo-9-bra-2002", player: "Ronaldo", number: "9", team: "Brasil", tournament: "Mundial 2002", hint: "Maximo goleador del campeon" },
    { id: "klose-11-ger-2014", player: "Miroslav Klose", number: "11", team: "Alemania", tournament: "Mundial 2014", hint: "Record goleador mundialista" },
    { id: "forlan-10-uru-2010", player: "Diego Forlan", number: "10", team: "Uruguay", tournament: "Mundial 2010", hint: "Balon de oro del torneo" },
    { id: "modric-10-cro-2018", player: "Luka Modric", number: "10", team: "Croacia", tournament: "Mundial 2018", hint: "Condujo a su seleccion a la final" },
    { id: "kane-9-eng-2018", player: "Harry Kane", number: "9", team: "Inglaterra", tournament: "Mundial 2018", hint: "Bota de oro en Rusia" },
    { id: "suarez-9-uru-2014", player: "Luis Suarez", number: "9", team: "Uruguay", tournament: "Mundial 2014", hint: "Figura charrua en Brasil" },
    { id: "robben-11-ned-2014", player: "Arjen Robben", number: "11", team: "Paises Bajos", tournament: "Mundial 2014", hint: "Velocidad por derecha" },
    { id: "james-10-col-2014", player: "James Rodriguez", number: "10", team: "Colombia", tournament: "Mundial 2014", hint: "Golazo de volea ante Uruguay" },
    { id: "maradona-10-arg-1986", player: "Diego Maradona", number: "10", team: "Argentina", tournament: "Mundial 1986", hint: "Mexico y una camiseta eterna" },
    { id: "baggio-10-ita-1994", player: "Roberto Baggio", number: "10", team: "Italia", tournament: "Mundial 1994", hint: "Llevo a Italia a la final" },
    { id: "pirlo-21-ita-2006", player: "Andrea Pirlo", number: "21", team: "Italia", tournament: "Mundial 2006", hint: "Cerebro del campeon" },
    { id: "xavi-8-esp-2010", player: "Xavi", number: "8", team: "Espana", tournament: "Mundial 2010", hint: "Motor del tiki taka" },
    { id: "ozil-8-ger-2010", player: "Mesut Ozil", number: "8", team: "Alemania", tournament: "Mundial 2010", hint: "Zurda fina alemana" },
    { id: "hazard-10-bel-2018", player: "Eden Hazard", number: "10", team: "Belgica", tournament: "Mundial 2018", hint: "Capitan de la generacion dorada" }
  ],
  desafios: [
    {
      id: "azteca",
      type: "estadio",
      answer: "Estadio Azteca",
      title: "Adivina el estadio",
      subtitle: "Mundial 2026",
      clues: ["Fue sede de dos finales mundialistas", "Esta en Ciudad de Mexico", "Tambien recibe partidos del Mundial 2026"]
    },
    {
      id: "maradona",
      type: "jugador",
      answer: "Diego Maradona",
      title: "Adivina el jugador",
      subtitle: "Argentina",
      clues: ["Uso la 10", "Fue campeon del mundo en 1986", "Su gol mas famoso fue en Mexico"]
    },
    {
      id: "lusail",
      type: "estadio",
      answer: "Estadio Lusail",
      title: "Adivina el estadio",
      subtitle: "Qatar 2022",
      clues: ["Recibio la final de 2022", "Argentina levanto alli la copa", "Esta en Lusail"]
    },
    {
      id: "wembley",
      type: "estadio",
      answer: "Wembley",
      title: "Adivina el estadio",
      subtitle: "Inglaterra",
      clues: ["Tiene un arco sobre su techo", "Fue sede de finales europeas", "Esta en Londres"]
    },
    {
      id: "maracana",
      type: "estadio",
      answer: "Maracana",
      title: "Adivina el estadio",
      subtitle: "Brasil",
      clues: ["Fue sede de finales mundialistas", "Esta en Rio de Janeiro", "Su nombre completo homenajea a Mario Filho"]
    },
    {
      id: "bernabeu",
      type: "estadio",
      answer: "Santiago Bernabeu",
      title: "Adivina el estadio",
      subtitle: "Espana",
      clues: ["Casa del Real Madrid", "Esta en Madrid", "Lleva el nombre de un historico presidente"]
    },
    {
      id: "camp-nou",
      type: "estadio",
      answer: "Camp Nou",
      title: "Adivina el estadio",
      subtitle: "Espana",
      clues: ["Casa del Barcelona", "Su nombre significa campo nuevo", "Esta en Catalunya"]
    },
    {
      id: "bombonera",
      type: "estadio",
      answer: "La Bombonera",
      title: "Adivina el estadio",
      subtitle: "Argentina",
      clues: ["Tiene tribunas muy empinadas", "Esta en La Boca", "Casa de Boca Juniors"]
    },
    {
      id: "monumental",
      type: "estadio",
      answer: "Monumental",
      title: "Adivina el estadio",
      subtitle: "Argentina",
      clues: ["Casa de River Plate", "Sede frecuente de la seleccion argentina", "Esta en Nunez"]
    },
    {
      id: "san-siro",
      type: "estadio",
      answer: "San Siro",
      title: "Adivina el estadio",
      subtitle: "Italia",
      clues: ["Lo comparten dos gigantes de Milan", "Tambien se llama Giuseppe Meazza", "Tiene torres exteriores muy reconocibles"]
    },
    {
      id: "allianz-arena",
      type: "estadio",
      answer: "Allianz Arena",
      title: "Adivina el estadio",
      subtitle: "Alemania",
      clues: ["Su fachada se ilumina", "Casa del Bayern Munich", "Esta en Munich"]
    },
    {
      id: "old-trafford",
      type: "estadio",
      answer: "Old Trafford",
      title: "Adivina el estadio",
      subtitle: "Inglaterra",
      clues: ["Conocido como el Teatro de los Suenos", "Casa del Manchester United", "Esta en Greater Manchester"]
    },
    {
      id: "pele",
      type: "jugador",
      answer: "Pele",
      title: "Adivina el jugador",
      subtitle: "Brasil",
      clues: ["Gano tres Mundiales", "Debuto mundialista con 17 anos", "Es una leyenda del Santos"]
    },
    {
      id: "beckenbauer",
      type: "jugador",
      answer: "Franz Beckenbauer",
      title: "Adivina el jugador",
      subtitle: "Alemania",
      clues: ["Fue campeon como jugador y entrenador", "Lo llamaban el Kaiser", "Defensor elegante"]
    },
    {
      id: "cruyff",
      type: "jugador",
      answer: "Johan Cruyff",
      title: "Adivina el jugador",
      subtitle: "Paises Bajos",
      clues: ["Simbolo de la Naranja Mecanica", "Uso la 14", "Influyo en Ajax y Barcelona"]
    },
    {
      id: "zidane",
      type: "jugador",
      answer: "Zinedine Zidane",
      title: "Adivina el jugador",
      subtitle: "Francia",
      clues: ["Campeon mundial en 1998", "Uso la 10", "Marco dos goles de cabeza en una final"]
    },
    {
      id: "marta",
      type: "jugadora",
      answer: "Marta",
      title: "Adivina la jugadora",
      subtitle: "Brasil",
      clues: ["Leyenda del futbol femenino", "Zurda brasileña", "Multiple ganadora del premio FIFA"]
    },
    {
      id: "la-mano-de-dios",
      type: "frase",
      answer: "La mano de Dios",
      title: "Adivina la frase",
      subtitle: "Mundial 1986",
      clues: ["Nacio en Mexico", "Esta ligada a Argentina-Inglaterra", "La dijo Diego Maradona"]
    },
    {
      id: "tiki-taka",
      type: "concepto",
      answer: "Tiki taka",
      title: "Adivina el concepto",
      subtitle: "Espana",
      clues: ["Asociado a posesion y pases cortos", "Marco una epoca en Barcelona y Espana", "Fue clave en 2010"]
    }
  ]
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp"
};

const LALIGA_2025_26_TEAMS = [
  "Athletic Club",
  "Atletico de Madrid",
  "CA Osasuna",
  "Celta",
  "Deportivo Alaves",
  "Elche CF",
  "FC Barcelona",
  "Getafe CF",
  "Girona FC",
  "Levante UD",
  "Rayo Vallecano",
  "RCD Espanyol de Barcelona",
  "RCD Mallorca",
  "Real Betis",
  "Real Madrid",
  "Real Oviedo",
  "Real Sociedad",
  "Sevilla FC",
  "Valencia CF",
  "Villarreal CF"
];

function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60000).toISOString();
}

function fixture(id, home, away, startsAt, round = "Fecha") {
  return { id, home, away, startsAt, round };
}

function laligaTimingLabFixtures() {
  return [
    fixture("c1", "Real Madrid", "FC Barcelona", minutesFromNow(180), "Lab - abierto"),
    fixture("c2", "Atletico de Madrid", "Sevilla FC", minutesFromNow(45), "Lab - cerca del cierre"),
    fixture("c3", "Real Betis", "Valencia CF", minutesFromNow(-120), "Lab - bloqueado"),
    fixture("c4", "Villarreal CF", "Athletic Club", minutesFromNow(-300), "Lab - resultado reciente"),
    fixture("c5", "Real Sociedad", "Celta", minutesFromNow(-1500), "Lab - puntuable"),
    fixture("c6", "Girona FC", "RCD Mallorca", minutesFromNow(1440), "Lab - manana")
  ];
}

const TOURNAMENT_TEMPLATES = [
  { id: "worldcup-2026", name: "Mundial 2026", mode: "groups-knockout", teams: [] },
  { id: "champions", name: "Champions League", mode: "fixture", teams: ["Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Bayern Munich", "PSG", "Inter", "Arsenal", "Atletico Madrid", "Borussia Dortmund", "Juventus", "Benfica", "Porto", "Napoli", "Bayer Leverkusen", "Chelsea"] },
  { id: "libertadores", name: "Copa Libertadores", mode: "groups-knockout", teams: ["River Plate", "Boca Juniors", "Flamengo", "Palmeiras", "Sao Paulo", "Fluminense", "Gremio", "Atletico Mineiro", "Nacional", "Penarol", "Colo-Colo", "Universidad de Chile", "Olimpia", "Cerro Porteno", "Liga de Quito", "Independiente del Valle"] },
  { id: "sudamericana", name: "Copa Sudamericana", mode: "groups-knockout", teams: ["Lanus", "Defensa y Justicia", "Racing", "Independiente", "Corinthians", "Cruzeiro", "Internacional", "Fortaleza", "Universidad Catolica", "Emelec", "Barcelona SC", "America de Cali", "Junior", "Sporting Cristal", "Bolivar", "The Strongest"] },
  { id: "argentina", name: "Liga Argentina", mode: "league", teams: ["River Plate", "Boca Juniors", "Racing", "Independiente", "San Lorenzo", "Huracan", "Velez", "Estudiantes", "Gimnasia", "Lanus", "Banfield", "Rosario Central", "Newell's", "Talleres", "Belgrano", "Godoy Cruz"] },
  { id: "premier", name: "Premier League", mode: "league", teams: ["Arsenal", "Aston Villa", "Chelsea", "Liverpool", "Manchester City", "Manchester United", "Newcastle", "Tottenham", "Everton", "West Ham", "Brighton", "Crystal Palace", "Fulham", "Brentford", "Wolves", "Nottingham Forest"] },
  {
    id: "laliga-2025-26",
    name: "LaLiga EA Sports 2025/26",
    mode: "league",
    teams: LALIGA_2025_26_TEAMS,
    timing: {
      predictionLockMinutesBefore: 60,
      scoringDelayMinutesAfterResult: 120
    },
    fixtures: [
      fixture("c1", "Real Sociedad", "Real Betis", "2026-05-16T16:00:00+02:00", "Fecha 37"),
      fixture("c2", "FC Barcelona", "Villarreal CF", "2026-05-16T18:30:00+02:00", "Fecha 37"),
      fixture("c3", "Valencia CF", "Athletic Club", "2026-05-16T21:00:00+02:00", "Fecha 37"),
      fixture("c4", "Real Madrid", "RCD Mallorca", "2026-05-17T16:00:00+02:00", "Fecha 37"),
      fixture("c5", "Atletico de Madrid", "Real Sociedad", "2026-05-24T18:30:00+02:00", "Fecha 38"),
      fixture("c6", "Athletic Club", "FC Barcelona", "2026-05-24T18:30:00+02:00", "Fecha 38"),
      fixture("c7", "Villarreal CF", "Sevilla FC", "2026-05-24T18:30:00+02:00", "Fecha 38"),
      fixture("c8", "Real Betis", "Valencia CF", "2026-05-24T18:30:00+02:00", "Fecha 38")
    ]
  },
  {
    id: "laliga-timing-lab",
    name: "LaLiga Timing Lab",
    mode: "league",
    teams: LALIGA_2025_26_TEAMS,
    timing: {
      predictionLockMinutesBefore: 60,
      scoringDelayMinutesAfterResult: 180
    },
    fixtures: laligaTimingLabFixtures()
  },
  { id: "laliga", name: "LaLiga clasica", mode: "league", teams: LALIGA_2025_26_TEAMS },
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
    users: {},
    globalSessions: {},
    tournamentAccess: {},
    globalGames: JSON.parse(JSON.stringify(DEFAULT_DAILY_GAMES)),
    globalGamePlays: {},
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
  if (TENANTS[id]) return TENANTS[id];
  try {
    if (!fs.existsSync(STORE_FILE)) return null;
    const store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    const tenantData = store.tenants?.[id];
    if (!tenantData || tenantData.dynamic !== true) return null;
    registerDynamicTenant(id, tenantData);
    return TENANTS[id] || null;
  } catch {
    return null;
  }
}

function tenantTournamentId(tenantId) {
  return `empresa-${tenantId}`;
}

function tenantFromStoredData(id, tenantData = {}) {
  return {
    id,
    name: tenantData.displayName || tenantData.name || id,
    eyebrow: tenantData.eyebrow || "Prode corporativo",
    title: tenantData.title || `Prode ${tenantData.displayName || tenantData.name || id}`,
    description: tenantData.description || `Predicciones y ranking exclusivo para ${tenantData.displayName || tenantData.name || id}.`,
    areas: Array.isArray(tenantData.areas) ? tenantData.areas : [],
    theme: tenantData.baseTheme || tenantData.theme || {}
  };
}

function registerDynamicTenant(id, tenantData = {}) {
  if (!id || TENANTS[id]) return;
  TENANTS[id] = tenantFromStoredData(id, tenantData);
}

function registerDynamicTenants(store) {
  Object.entries(store.tenants || {}).forEach(([id, tenantData]) => {
    if (tenantData?.dynamic === true) registerDynamicTenant(id, tenantData);
  });
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
      sessions: previous.sessions && typeof previous.sessions === "object" ? previous.sessions : {},
      theme: previous.theme && typeof previous.theme === "object" ? previous.theme : {},
      games: previous.games && typeof previous.games === "object" ? previous.games : {},
      gamePlays: previous.gamePlays && typeof previous.gamePlays === "object" ? previous.gamePlays : {}
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
    store.tenants[tenantId] = { id: tenantId, name: TENANTS[tenantId]?.name || tenantId, areas: [], users: {}, sessions: {}, theme: {}, games: {}, gamePlays: {} };
  }
  const tenantData = store.tenants[tenantId];
  if (!Array.isArray(tenantData.areas)) tenantData.areas = [];
  if (!tenantData.users || typeof tenantData.users !== "object") tenantData.users = {};
  if (!tenantData.sessions || typeof tenantData.sessions !== "object") tenantData.sessions = {};
  if (!tenantData.theme || typeof tenantData.theme !== "object") tenantData.theme = {};
  if (!tenantData.games || typeof tenantData.games !== "object") tenantData.games = {};
  if (!tenantData.gamePlays || typeof tenantData.gamePlays !== "object") tenantData.gamePlays = {};
  return tenantData;
}
function toMysqlDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
}

async function getMysqlConnection() {
  const dbName = String(DB_CONFIG.database || "").replace(/[^a-zA-Z0-9_]/g, "");
  if (!dbName) throw new Error("DB_NAME is invalid");
  const rootDb = await mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    port: DB_CONFIG.port,
    multipleStatements: false
  });
  await rootDb.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await rootDb.end();
  const db = await mysql.createConnection({ ...DB_CONFIG, database: dbName });
  await ensureMysqlSchema(db);
  return db;
}

async function ensureMysqlSchema(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id VARCHAR(120) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      code VARCHAR(80),
      is_global BOOLEAN NOT NULL DEFAULT FALSE,
      creator_email VARCHAR(190),
      creator_key VARCHAR(120),
      template_id VARCHAR(80),
      mode VARCHAR(80),
      custom_template JSON,
      scoring JSON,
      real_results JSON,
      real_results_updated_at DATETIME NULL,
      created_at DATETIME NULL,
      raw_json JSON,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id VARCHAR(160) PRIMARY KEY,
      tournament_id VARCHAR(120) NOT NULL,
      player JSON,
      prediction JSON,
      created_at DATETIME NULL,
      raw_json JSON,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_submissions_tournament (tournament_id)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(190) PRIMARY KEY,
      name VARCHAR(160),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      raw_json JSON,
      created_at DATETIME NULL,
      updated_at DATETIME NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tournament_access (
      user_email VARCHAR(190) NOT NULL,
      tournament_id VARCHAR(120) NOT NULL,
      granted_at DATETIME NULL,
      granted_by_password BOOLEAN NOT NULL DEFAULT TRUE,
      raw_json JSON,
      PRIMARY KEY (user_email, tournament_id)
    )
  `);
}

async function syncStoreToMysql(store) {
  const db = await getMysqlConnection();

  try {
    const tournaments = store.tournaments || [];

    for (const t of tournaments) {
      await db.execute(
        `INSERT INTO tournaments
        (id, name, code, is_global, creator_email, creator_key, template_id, mode,
         custom_template, scoring, real_results, real_results_updated_at, created_at, raw_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), ?, ?, CAST(? AS JSON))
         ON DUPLICATE KEY UPDATE
         name=VALUES(name),
         code=VALUES(code),
         is_global=VALUES(is_global),
         creator_email=VALUES(creator_email),
         creator_key=VALUES(creator_key),
         template_id=VALUES(template_id),
         mode=VALUES(mode),
         custom_template=VALUES(custom_template),
         scoring=VALUES(scoring),
         real_results=VALUES(real_results),
         real_results_updated_at=VALUES(real_results_updated_at),
         created_at=VALUES(created_at),
         raw_json=VALUES(raw_json)`,
        [
          t.id,
          t.name || "Sin nombre",
          t.code || null,
          Boolean(t.isGlobal),
          t.creatorEmail || null,
          t.creatorKey || null,
          t.templateId || null,
          t.mode || null,
          JSON.stringify(t.customTemplate ?? null),
          JSON.stringify(t.scoring ?? null),
          JSON.stringify(t.realResults ?? null),
          toMysqlDate(t.realResultsUpdatedAt),
          toMysqlDate(t.createdAt),
          JSON.stringify(t),
        ]
      );

      for (const s of t.submissions || []) {
        await db.execute(
          `INSERT INTO submissions
          (id, tournament_id, player, prediction, created_at, raw_json)
          VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, CAST(? AS JSON))
          ON DUPLICATE KEY UPDATE
          player=VALUES(player),
          prediction=VALUES(prediction),
          created_at=VALUES(created_at),
          raw_json=VALUES(raw_json)`,
          [
            s.id,
            t.id,
            JSON.stringify(s.player || {}),
            JSON.stringify(s.prediction || {}),
            toMysqlDate(s.createdAt),
            JSON.stringify(s),
          ]
        );
      }
    }
    for (const [email, user] of Object.entries(store.users || {})) {
      await db.execute(
        `INSERT INTO users
        (email, name, active, raw_json, created_at, updated_at)
        VALUES (?, ?, ?, CAST(? AS JSON), ?, ?)
        ON DUPLICATE KEY UPDATE
        name=VALUES(name),
        active=VALUES(active),
        raw_json=VALUES(raw_json),
        created_at=VALUES(created_at),
        updated_at=VALUES(updated_at)`,
        [
          normalizeEmail(user.email || email),
          user.name || "",
          user.active !== false,
          JSON.stringify(user),
          toMysqlDate(user.createdAt),
          toMysqlDate(user.updatedAt)
        ]
      );
    }
    for (const [email, accessByTournament] of Object.entries(store.tournamentAccess || {})) {
      for (const [tournamentId, access] of Object.entries(accessByTournament || {})) {
        await db.execute(
          `INSERT INTO tournament_access
          (user_email, tournament_id, granted_at, granted_by_password, raw_json)
          VALUES (?, ?, ?, ?, CAST(? AS JSON))
          ON DUPLICATE KEY UPDATE
          granted_at=VALUES(granted_at),
          granted_by_password=VALUES(granted_by_password),
          raw_json=VALUES(raw_json)`,
          [
            normalizeEmail(email),
            tournamentId,
            toMysqlDate(access.grantedAt),
            access.grantedByPassword !== false,
            JSON.stringify(access)
          ]
        );
      }
    }
  } finally {
    await db.end();
  }
}
function ensureDataDir() {
  fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
}

function readStore() {
  ensureDataDir();
  try {
    const store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    if (!Array.isArray(store.tournaments)) return emptyStore();
    if (!store.users || typeof store.users !== "object") store.users = {};
    if (!store.globalSessions || typeof store.globalSessions !== "object") store.globalSessions = {};
    if (!store.tournamentAccess || typeof store.tournamentAccess !== "object") store.tournamentAccess = {};
    if (!store.globalGames || typeof store.globalGames !== "object") store.globalGames = JSON.parse(JSON.stringify(DEFAULT_DAILY_GAMES));
    if (!store.globalGamePlays || typeof store.globalGamePlays !== "object") store.globalGamePlays = {};
    registerDynamicTenants(store);
    if (!store.tournaments.some(tournament => tournament.id === "global")) {
      store.tournaments.unshift(emptyStore().tournaments[0]);
    }
    ensureTenantTournaments(store);
    return store;
  } catch {
    const store = emptyStore();
    registerDynamicTenants(store);
    ensureTenantTournaments(store);
    writeStore(store);
    return store;
  }
}

function writeStore(store) {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2)); 
  syncStoreToMysql(store).catch((err) => {
  console.error("Error sincronizando store a MySQL:", err);
});
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
    fixtures: tournament.customTemplate?.fixtures || template.fixtures || [],
    timing: tournament.customTemplate?.timing || template.timing || { predictionLockMinutesBefore: 0, scoringDelayMinutesAfterResult: 0 },
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

function safeText(value, max = 100) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function safeDate(value) {
  const date = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function safeColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "";
}

function safeImage(value) {
  const image = String(value || "").trim();
  if (!image) return "";
  if (image.startsWith("/") && !image.includes("..")) return image.slice(0, 120000);
  if (/^https?:\/\//i.test(image)) return image.slice(0, 120000);
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(image) && image.length < 120000) return image;
  return "";
}

function normalizeTheme(value = {}) {
  const theme = {};
  ["bg", "ink", "muted", "line", "panel", "accent", "accent2", "gold", "blue"].forEach(key => {
    const color = safeColor(value[key]);
    if (color) theme[key] = color;
  });
  const image = safeImage(value.image);
  if (image) theme.image = image;
  if (value.image === "") theme.image = "";
  return theme;
}

function mergeGameList(customItems, defaultItems) {
  const merged = [];
  const seen = new Set();
  [...(Array.isArray(customItems) ? customItems : []), ...(Array.isArray(defaultItems) ? defaultItems : [])].forEach(item => {
    const key = `${normalizeEmail(item?.player || item?.answer || item?.id || "")}:${safeText(item?.number || "", 8)}`;
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });
  return merged;
}

function publicGames(tenantData = {}) {
  const custom = tenantData.games && typeof tenantData.games === "object" ? tenantData.games : {};
  return {
    ...DEFAULT_DAILY_GAMES,
    ...custom,
    points: {
      ...DEFAULT_DAILY_GAMES.points,
      ...(custom.points && typeof custom.points === "object" ? custom.points : {})
    },
    camisetas: mergeGameList(custom.camisetas, DEFAULT_DAILY_GAMES.camisetas),
    desafios: mergeGameList(custom.desafios, DEFAULT_DAILY_GAMES.desafios)
  };
}

function globalGames(store = {}) {
  return publicGames({ games: store.globalGames || {} });
}

function publicTenant(tenant, tenantData = {}) {
  const theme = {
    ...(tenant.theme || {}),
    ...(tenantData.theme || {})
  };
  return {
    ...tenant,
    name: tenantData.displayName || tenant.name,
    eyebrow: tenantData.eyebrow || tenant.eyebrow,
    title: tenantData.title || tenant.title,
    description: tenantData.description || tenant.description,
    theme,
    games: publicGames(tenantData),
    areas: Array.isArray(tenantData.areas) ? tenantData.areas : [],
    userEmails: Object.keys(tenantData.users || {})
  };
}

function currentDailyGamePlays(tenantData = {}, email = "", games = publicGames(tenantData)) {
  const normalized = normalizeEmail(email);
  const plays = tenantData.gamePlays?.[normalized]?.[todayKey()] || {};
  const camisetadle = todayGameItem(games, "camisetadle");
  const desafio = todayGameItem(games, "desafio");
  const camisaPlay = plays.camisetadle?.challengeId === camisetadle?.id ? plays.camisetadle : null;
  const desafioPlay = plays.desafio?.challengeId === desafio?.id ? plays.desafio : null;
  return {
    camisetadle: camisaPlay,
    desafio: desafioPlay
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
  const role = userRole(tenant.id, { ...user, email: user.email || email });
  return {
    name: user.name || "",
    email: user.email || email,
    area: user.area || "",
    role,
    isAdmin: role === "admin" || role === "superadmin",
    isSuperAdmin: role === "superadmin"
  };
}

function globalSessionUser(store, token) {
  const rawToken = String(token || "").trim();
  if (!rawToken) return null;
  const email = store.globalSessions?.[rawToken];
  const user = email ? store.users?.[email] : null;
  if (!user || user.active === false) return null;
  return {
    name: user.name || "",
    email: user.email || email,
    role: user.role || "player",
    isAdmin: Boolean(user.isAdmin || user.role === "admin" || user.role === "superadmin"),
    isSuperAdmin: user.role === "superadmin",
    createdAt: user.createdAt || ""
  };
}

function requireGlobalAdmin(req, res, store, token) {
  const user = globalSessionUser(store, token);
  if (user?.isAdmin || user?.isSuperAdmin) return user;
  send(res, 403, JSON.stringify({ error: "Global admin required" }));
  return null;
}

function accessMapFor(store, email) {
  const normalized = normalizeEmail(email);
  if (!store.tournamentAccess || typeof store.tournamentAccess !== "object") store.tournamentAccess = {};
  if (!store.tournamentAccess[normalized] || typeof store.tournamentAccess[normalized] !== "object") {
    store.tournamentAccess[normalized] = {};
  }
  return store.tournamentAccess[normalized];
}

function hasTournamentAccess(store, user, tournament) {
  if (!tournament || tournament.isGlobal) return true;
  if (!user?.email) return false;
  const access = store.tournamentAccess?.[normalizeEmail(user.email)]?.[tournament.id];
  return Boolean(access?.grantedAt);
}

function publicLobbyTournament(store, tournament, user = null) {
  const tenant = tournament.tenantId ? tenantFromValue(tournament.tenantId) : null;
  const access = hasTournamentAccess(store, user, tournament);
  return {
    ...publicTournament(tournament, { includePrivateCode: tournament.isGlobal || access }),
    isPrivate: !tournament.isGlobal,
    hasAccess: access,
    tenantPath: tenant ? `/prode/empresa/${encodeURIComponent(tenant.id)}` : "/prode",
    tenantName: tenant?.name || "",
    lockedLabel: tournament.isGlobal ? "Publico" : access ? "Acceso habilitado" : "Privado"
  };
}

function publicTenantTemplate(id) {
  const tenant = tenantFromValue(id);
  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    title: tenant.title,
    description: tenant.description
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

function isSuperAdminEmail(tenantId, email) {
  const normalized = normalizeEmail(email);
  const configured = envTenantList(tenantId, "SUPERADMIN_EMAILS");
  return configured.includes(normalized) || (tenantId === "acme" && ["admin@acme", "admin@acme.com"].includes(normalized));
}

function userRole(tenantId, user = {}) {
  if (isSuperAdminEmail(tenantId, user.email)) return "superadmin";
  if (user.role === "admin" || user.isAdmin || isAdminEmail(tenantId, user.email)) return "admin";
  return "player";
}

function adminSessionUser(store, tenant, token) {
  const user = sessionUser(store, tenant, token);
  return user?.isAdmin ? user : null;
}

function superAdminSessionUser(store, tenant, token) {
  const user = sessionUser(store, tenant, token);
  return user?.isSuperAdmin ? user : null;
}

function requireAdmin(req, res, tenant, key, sessionToken = "", globalSessionToken = "") {
  const store = readStore();
  if (adminSessionUser(store, tenant, sessionToken)) return true;
  const globalUser = globalSessionUser(store, globalSessionToken);
  if (globalUser?.isAdmin || globalUser?.isSuperAdmin) return true;
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

function requireSuperAdmin(req, res, tenant, sessionToken = "", globalSessionToken = "") {
  const store = readStore();
  if (superAdminSessionUser(store, tenant, sessionToken)) return true;
  const globalUser = globalSessionUser(store, globalSessionToken);
  if (globalUser?.isSuperAdmin) return true;
  send(res, 403, JSON.stringify({ error: "Superadmin required" }));
  return false;
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

function normalizeTiming(value = {}) {
  return {
    predictionLockMinutesBefore: Math.max(0, Math.min(10080, Number(value.predictionLockMinutesBefore ?? 0) || 0)),
    scoringDelayMinutesAfterResult: Math.max(0, Math.min(10080, Number(value.scoringDelayMinutesAfterResult ?? 0) || 0))
  };
}

function normalizeFixtures(value) {
  const fixtures = Array.isArray(value) ? value : [];
  return fixtures
    .map((match, index) => ({
      id: safeText(match?.id, 30) || `c${index + 1}`,
      home: safeText(match?.home, 80),
      away: safeText(match?.away, 80),
      startsAt: safeText(match?.startsAt, 40),
      round: safeText(match?.round, 60)
    }))
    .filter(match => match.home && match.away)
    .slice(0, 380);
}

function normalizeCustomTemplate(value, fallbackTemplate) {
  const teams = normalizeTeams(value?.teams);
  if (!teams.length) return null;
  return {
    name: String(value?.name || fallbackTemplate?.name || "Custom").trim().slice(0, 80),
    mode: value?.mode || fallbackTemplate?.mode || "fixture",
    teams,
    fixtures: normalizeFixtures(value?.fixtures || fallbackTemplate?.fixtures),
    timing: normalizeTiming(value?.timing || fallbackTemplate?.timing)
  };
}

function tournamentTemplate(tournament = {}) {
  return TOURNAMENT_TEMPLATES.find(item => item.id === tournament.templateId) || TOURNAMENT_TEMPLATES[0];
}

function tournamentTiming(tournament = {}) {
  const template = tournamentTemplate(tournament);
  return normalizeTiming(tournament.customTemplate?.timing || template.timing || {});
}

function tournamentFixtures(tournament = {}) {
  const template = tournamentTemplate(tournament);
  return normalizeFixtures(tournament.customTemplate?.fixtures || template.fixtures || []);
}

function customMatchLocked(match, timing = tournamentTiming()) {
  if (!match?.startsAt) return false;
  const startsAt = new Date(match.startsAt);
  if (Number.isNaN(startsAt.getTime())) return false;
  return Date.now() >= startsAt.getTime() - Number(timing.predictionLockMinutesBefore || 0) * 60000;
}

function mergeLockedCustomMatches(previousPrediction, incomingPrediction, tournament) {
  if (!incomingPrediction?.custom?.matches) return incomingPrediction;
  const fixtures = tournamentFixtures(tournament);
  if (!fixtures.length) return incomingPrediction;
  const timing = tournamentTiming(tournament);
  const previousMatches = previousPrediction?.custom?.matches || {};
  const incomingMatches = incomingPrediction.custom.matches;
  fixtures.forEach(match => {
    if (customMatchLocked(match, timing)) {
      if (previousMatches[match.id]) incomingMatches[match.id] = previousMatches[match.id];
      else delete incomingMatches[match.id];
    }
  });
  return incomingPrediction;
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

function scoreSubmission(prediction, real, scoring = DEFAULT_SCORING, tournament = null) {
  if (!prediction || !real) {
    return { points: 0, groupHits: 0, winnerHits: 0, exactScoreHits: 0, championHit: false };
  }
  const rules = normalizeScoring(scoring);
  if (real.custom) {
    const realMatches = real.custom.matches || {};
    const predictedMatches = prediction.custom?.matches || {};
    const timing = tournament ? tournamentTiming(tournament) : { scoringDelayMinutesAfterResult: 0 };
    let winnerHits = 0;
    let exactScoreHits = 0;
    Object.keys(realMatches).forEach(id => {
      const finishedAt = realMatches[id]?.finishedAt || realMatches[id]?.updatedAt || real.updatedAt || "";
      if (finishedAt) {
        const availableAt = new Date(new Date(finishedAt).getTime() + Number(timing.scoringDelayMinutesAfterResult || 0) * 60000);
        if (!Number.isNaN(availableAt.getTime()) && Date.now() < availableAt.getTime()) return;
      }
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

function handleTournaments(req, res) {
  const store = readStore();
  const url = new URL(req.url, "http://localhost");
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const globalUser = globalSessionUser(store, url.searchParams.get("globalSessionToken"));
  const joinedCodes = String(url.searchParams.get("joined") || "")
    .split(",")
    .map(normalizeCode)
    .filter(Boolean);
  const tournaments = store.tournaments
    .filter(tournament => {
      if (tenant) return tournament.tenantId === tenant.id;
      return tournament.isGlobal || (!tournament.tenantId && joinedCodes.includes(tournament.code));
    })
    .map(tournament => publicTournament(tournament, { includePrivateCode: tenant || joinedCodes.includes(tournament.code) || hasTournamentAccess(store, globalUser, tournament) }));
  send(res, 200, JSON.stringify({ tournaments }));
}

function handleTournamentLobby(req, res) {
  const store = readStore();
  const url = new URL(req.url, "http://localhost");
  const user = globalSessionUser(store, url.searchParams.get("sessionToken"));
  const lobbyIds = ["global", ...Object.keys(TENANTS).map(tenantTournamentId)];
  const tournaments = lobbyIds
    .map(id => store.tournaments.find(tournament => tournament.id === id))
    .filter(Boolean)
    .map(tournament => publicLobbyTournament(store, tournament, user));
  send(res, 200, JSON.stringify({
    user,
    isAdmin: Boolean(user?.isAdmin || user?.isSuperAdmin),
    templates: ["acme", "norte", "sur"].map(publicTenantTemplate).filter(Boolean),
    tournaments
  }));
}

async function handleGlobalLogin(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const name = safeText(body.name, 100);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!email || !password) {
      send(res, 400, JSON.stringify({ error: "Email/DNI and password are required" }));
      return;
    }
    const store = readStore();
    const previousUser = store.users[email];
    if (previousUser) {
      if (previousUser.active === false) {
        send(res, 403, JSON.stringify({ error: "User is disabled" }));
        return;
      }
      if (!verifyPassword(password, previousUser)) {
        send(res, 401, JSON.stringify({ error: "Invalid email or password" }));
        return;
      }
    } else if (!name) {
      send(res, 400, JSON.stringify({ error: "Name is required for first login" }));
      return;
    }
    const finalName = previousUser?.name || name;
    const token = randomSecret();
    store.users[email] = {
      ...(previousUser || {}),
      name: finalName,
      email,
      active: previousUser?.active !== false,
      password: previousUser?.password || createPasswordRecord(password),
      updatedAt: new Date().toISOString(),
      createdAt: previousUser?.createdAt || new Date().toISOString()
    };
    store.globalSessions[token] = email;
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      token,
      user: { name: finalName, email, role: store.users[email].role || "player", isAdmin: Boolean(store.users[email].isAdmin), isSuperAdmin: store.users[email].role === "superadmin" },
      tournaments: ["global", ...Object.keys(TENANTS).map(tenantTournamentId)]
        .map(id => store.tournaments.find(tournament => tournament.id === id))
        .filter(Boolean)
        .map(tournament => publicLobbyTournament(store, tournament, { email }))
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function handleGlobalSession(req, res) {
  const store = readStore();
  const url = new URL(req.url, "http://localhost");
  const user = globalSessionUser(store, url.searchParams.get("sessionToken"));
  if (!user) {
    send(res, 401, JSON.stringify({ error: "Login is required" }));
    return;
  }
  send(res, 200, JSON.stringify({ ok: true, user }));
}

async function handleCreateLobbyTenant(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const store = readStore();
    const admin = requireGlobalAdmin(req, res, store, body.sessionToken);
    if (!admin) return;
    const name = safeText(body.name, 80);
    const templateId = slug(body.templateId || "acme");
    const template = tenantFromValue(templateId) || TENANTS.acme;
    let id = slug(body.id || name);
    if (!name) {
      send(res, 400, JSON.stringify({ error: "Company name is required" }));
      return;
    }
    if (!id) id = `empresa-${Date.now()}`;
    if (TENANTS[id] || store.tenants?.[id] || store.tournaments.some(tournament => tournament.id === tenantTournamentId(id))) {
      send(res, 409, JSON.stringify({ error: "Company id already exists" }));
      return;
    }
    const code = normalizeCode(body.code || `EMPRESA-${id.toUpperCase()}`);
    if (!code) {
      send(res, 400, JSON.stringify({ error: "Tournament password is required" }));
      return;
    }
    if (store.tournaments.some(tournament => normalizeCode(tournament.code) === code)) {
      send(res, 409, JSON.stringify({ error: "Tournament password already exists" }));
      return;
    }
    if (!store.tenants || typeof store.tenants !== "object") store.tenants = {};
    const now = new Date().toISOString();
    store.tenants[id] = {
      id,
      dynamic: true,
      templateId,
      name,
      displayName: name,
      eyebrow: template.eyebrow,
      title: `Prode ${name}`,
      description: `Predicciones y ranking exclusivo para ${name}.`,
      areas: [...(template.areas || [])],
      users: {},
      sessions: {},
      theme: { ...(template.theme || {}) },
      baseTheme: { ...(template.theme || {}) },
      games: JSON.parse(JSON.stringify(DEFAULT_DAILY_GAMES)),
      gamePlays: {},
      createdAt: now,
      createdBy: admin.email
    };
    registerDynamicTenant(id, store.tenants[id]);
    store.tournaments.push({
      id: tenantTournamentId(id),
      name,
      code,
      tenantId: id,
      isGlobal: false,
      createdAt: now,
      realResults: null,
      templateId: "worldcup-2026",
      mode: "groups-knockout",
      scoring: DEFAULT_SCORING,
      payment: null,
      payments: {},
      submissions: []
    });
    accessMapFor(store, admin.email)[tenantTournamentId(id)] = {
      tournamentId: tenantTournamentId(id),
      grantedAt: now,
      grantedByPassword: false,
      grantedByAdmin: true
    };
    writeStore(store);
    const tournament = store.tournaments.find(item => item.id === tenantTournamentId(id));
    send(res, 201, JSON.stringify({
      ok: true,
      tenant: publicTenant(TENANTS[id], tenantStore(store, id)),
      tournament: publicLobbyTournament(store, tournament, admin)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleGrantTournamentAccess(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const store = readStore();
    const user = globalSessionUser(store, body.sessionToken);
    if (!user) {
      send(res, 401, JSON.stringify({ error: "Login is required" }));
      return;
    }
    const tournament = findTournament(store, body.tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if (tournament.isGlobal) {
      send(res, 200, JSON.stringify({ ok: true, tournament: publicLobbyTournament(store, tournament, user) }));
      return;
    }
    const code = normalizeCode(body.password || body.code);
    if (!code || code !== normalizeCode(tournament.code)) {
      send(res, 401, JSON.stringify({ error: "Invalid tournament password" }));
      return;
    }
    accessMapFor(store, user.email)[tournament.id] = {
      tournamentId: tournament.id,
      grantedAt: new Date().toISOString(),
      grantedByPassword: true
    };
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, tournament: publicLobbyTournament(store, tournament, user) }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
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
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Company not found" }));
      return;
    }
    if (!email || !password) {
      send(res, 400, JSON.stringify({ error: "Email and password are required" }));
      return;
    }
    const store = readStore();
    const tenantData = tenantStore(store, tenant.id);
    const previousUser = tenantData.users[email];
    if (previousUser) {
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
    const role = userRole(tenant.id, { ...(previousUser || {}), email });
    const isAdmin = role === "admin" || role === "superadmin";
    if (!tenantData.areas.some(item => areaId(item) === areaId(finalArea))) tenantData.areas.push(finalArea);
    const token = randomSecret();
    tenantData.users[email] = {
      ...(previousUser || {}),
      name: finalName,
      email,
      area: finalArea,
      active: previousUser?.active !== false,
      role,
      isAdmin,
      password: previousUser?.password || createPasswordRecord(password),
      updatedAt: new Date().toISOString(),
      createdAt: previousUser?.createdAt || new Date().toISOString()
    };
    tenantData.sessions[token] = email;
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      token,
      user: { name: finalName, email, area: finalArea, role, isAdmin, isSuperAdmin: role === "superadmin" },
      dailyGamePlays: currentDailyGamePlays(tenantData, email),
      tenant: publicTenant(tenant, tenantData)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function handleCompanySession(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const token = url.searchParams.get("sessionToken");
  if (!tenant) {
    send(res, 404, JSON.stringify({ error: "Company not found" }));
    return;
  }
  const store = readStore();
  const user = sessionUser(store, tenant, token);
  if (!user) {
    send(res, 401, JSON.stringify({ error: "Login is required" }));
    return;
  }
  const tenantData = tenantStore(store, tenant.id);
  send(res, 200, JSON.stringify({
    ok: true,
    user,
    dailyGamePlays: currentDailyGamePlays(tenantData, user.email),
    tenant: publicTenant(tenant, tenantData)
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
    if (!requireAdmin(req, res, tenant, body.adminKey, body.sessionToken, body.globalSessionToken)) return;
    if (!email) {
      send(res, 400, JSON.stringify({ error: "User email is required" }));
      return;
    }
    const store = readStore();
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
    const nextIsAdmin = Boolean(body.isAdmin || isAdminEmail(tenant.id, email));
    const currentRole = userRole(tenant.id, { ...user, email });
    const currentIsAdmin = currentRole === "admin" || currentRole === "superadmin";
    if (nextIsAdmin !== currentIsAdmin && !requireSuperAdmin(req, res, tenant, body.sessionToken, body.globalSessionToken)) return;
    user.name = name;
    user.area = area;
    user.active = active;
    user.role = isSuperAdminEmail(tenant.id, email) ? "superadmin" : nextIsAdmin ? "admin" : "player";
    user.isAdmin = user.role === "admin" || user.role === "superadmin";
    user.updatedAt = new Date().toISOString();
    if (!tenantData.areas.some(item => areaId(item) === areaId(area))) tenantData.areas.push(area);
    if (!active) {
      Object.entries(tenantData.sessions).forEach(([token, sessionEmail]) => {
        if (normalizeEmail(sessionEmail) === email) delete tenantData.sessions[token];
      });
    }
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      user: { name: user.name, email: user.email || email, area: user.area, active: user.active !== false, role: user.role, isAdmin: user.isAdmin, isSuperAdmin: user.role === "superadmin" }
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
    const store = readStore();
    let user = sessionUser(store, tenant, body.sessionToken);
    if (!user) {
      const globalUser = globalSessionUser(store, body.globalSessionToken);
      const tournament = store.tournaments.find(item => item.id === tenantTournamentId(tenant.id));
      if (hasTournamentAccess(store, globalUser, tournament)) {
        user = { name: globalUser.name, email: globalUser.email, area: "" };
      }
    }
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
    writeStore(store);
    send(res, 201, JSON.stringify({ ok: true, tenant: publicTenant(tenant, tenantData) }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function normalizeCamisetas(value) {
  const items = Array.isArray(value) ? value : [];
  return items
    .map((item, index) => ({
      id: safeText(item.id, 80) || `camiseta-${index + 1}`,
      player: safeText(item.player, 80),
      number: safeText(item.number, 4),
      team: safeText(item.team, 80),
      tournament: safeText(item.tournament, 80),
      hint: safeText(item.hint, 120),
      date: safeDate(item.date)
    }))
    .filter(item => item.player && item.number)
    .slice(0, 90);
}

function normalizeDesafios(value) {
  const items = Array.isArray(value) ? value : [];
  return items
    .map((item, index) => {
      const clues = Array.isArray(item.clues) ? item.clues : String(item.clues || "").split(";");
      const type = slug(item.type || "otro") || "otro";
      return {
        id: safeText(item.id, 80) || `desafio-${index + 1}`,
        type,
        answer: safeText(item.answer, 90),
        title: safeText(item.title, 90) || `Adivina ${type}`,
        subtitle: safeText(item.subtitle, 90),
        clues: clues.map(clue => safeText(clue, 120)).filter(Boolean).slice(0, 6),
        date: safeDate(item.date)
      };
    })
    .filter(item => item.answer)
    .slice(0, 90);
}

function normalizeDailyGames(value = {}) {
  const camisetas = normalizeCamisetas(value.camisetas);
  const desafios = normalizeDesafios(value.desafios);
  return {
    enabled: value.enabled !== false,
    title: safeText(value.title, 70) || DEFAULT_DAILY_GAMES.title,
    intro: safeText(value.intro, 160) || DEFAULT_DAILY_GAMES.intro,
    rewardName: safeText(value.rewardName, 40) || DEFAULT_DAILY_GAMES.rewardName,
    points: {
      camisetadle: Math.max(0, Math.min(999, Number(value.points?.camisetadle ?? DEFAULT_DAILY_GAMES.points.camisetadle) || 0)),
      desafio: Math.max(0, Math.min(999, Number(value.points?.desafio ?? DEFAULT_DAILY_GAMES.points.desafio) || 0))
    },
    camisetas: camisetas.length ? camisetas : DEFAULT_DAILY_GAMES.camisetas,
    desafios: desafios.length ? desafios : DEFAULT_DAILY_GAMES.desafios
  };
}

async function handleAdminTheme(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Company not found" }));
      return;
    }
    if (!requireAdmin(req, res, tenant, body.adminKey, body.sessionToken, body.globalSessionToken)) return;
    const store = readStore();
    const tenantData = tenantStore(store, tenant.id);
    tenantData.displayName = safeText(body.displayName, 80) || tenant.name;
    tenantData.eyebrow = safeText(body.eyebrow, 80) || tenant.eyebrow;
    tenantData.title = safeText(body.title, 90) || tenant.title;
    tenantData.description = safeText(body.description, 180) || tenant.description;
    tenantData.theme = normalizeTheme(body.theme || {});
    tenantData.updatedAt = new Date().toISOString();
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, tenant: publicTenant(tenant, tenantData) }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleAdminGames(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Company not found" }));
      return;
    }
    if (!requireAdmin(req, res, tenant, body.adminKey, body.sessionToken, body.globalSessionToken)) return;
    const store = readStore();
    const tenantData = tenantStore(store, tenant.id);
    tenantData.games = normalizeDailyGames(body.games || {});
    tenantData.updatedAt = new Date().toISOString();
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, games: publicGames(tenantData), tenant: publicTenant(tenant, tenantData) }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function handleGlobalGames(req, res) {
  const url = new URL(req.url, "http://localhost");
  const store = readStore();
  const user = globalSessionUser(store, url.searchParams.get("sessionToken"));
  const games = globalGames(store);
  send(res, 200, JSON.stringify({
    games,
    dailyGamePlays: user ? currentDailyGamePlays({ gamePlays: store.globalGamePlays }, user.email, games) : {}
  }));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function answerMatches(expected, guess) {
  const clean = value => String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return clean(expected) === clean(guess);
}

function todayGameItem(games, gameType) {
  const list = gameType === "camisetadle" ? games.camisetas : games.desafios;
  if (!Array.isArray(list) || !list.length) return null;
  const dated = list.find(item => item.date === todayKey());
  if (dated) return dated;
  const seed = Math.floor(Date.now() / 86400000);
  return list[seed % list.length];
}

async function handleDailyGamePlay(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const store = readStore();
    const user = tenant
      ? sessionUser(store, tenant, body.sessionToken)
      : globalSessionUser(store, body.globalSessionToken);
    if (!user) {
      send(res, 401, JSON.stringify({ error: "Login is required" }));
      return;
    }
    const tenantData = tenant ? tenantStore(store, tenant.id) : null;
    const games = tenantData ? publicGames(tenantData) : globalGames(store);
    const gameType = body.gameType === "camisetadle" ? "camisetadle" : "desafio";
    const item = todayGameItem(games, gameType);
    if (!item) {
      send(res, 404, JSON.stringify({ error: "Daily game not found" }));
      return;
    }
    const email = normalizeEmail(user.email);
    const date = todayKey();
    const gamePlays = tenantData ? tenantData.gamePlays : store.globalGamePlays;
    if (!gamePlays[email]) gamePlays[email] = {};
    if (!gamePlays[email][date]) gamePlays[email][date] = {};
    const previous = gamePlays[email][date][gameType];
    if (previous?.completed) {
      send(res, 409, JSON.stringify({ error: "Ya completaste este juego diario.", play: previous }));
      return;
    }
    const correct = gameType === "camisetadle"
      ? answerMatches(item.player, body.guess?.player) && answerMatches(item.number, body.guess?.number)
      : answerMatches(item.answer, body.guess?.answer);
    const play = {
      gameType,
      challengeId: item.id,
      date,
      attempts: Number(previous?.attempts || 0) + 1,
      completed: correct,
      completedAt: correct ? new Date().toISOString() : "",
      points: correct ? Number(games.points?.[gameType] || 0) : 0,
      rewardName: games.rewardName || DEFAULT_DAILY_GAMES.rewardName,
      updatedAt: new Date().toISOString()
    };
    gamePlays[email][date][gameType] = play;
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, correct, play, dailyGamePlays: currentDailyGamePlays({ gamePlays }, email, games) }));
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
    let loggedUser = null;
    if (tenant) {
      loggedUser = sessionUser(store, tenant, body.sessionToken);
      if (!loggedUser) {
        const globalUser = globalSessionUser(store, body.globalSessionToken);
        if (hasTournamentAccess(store, globalUser, tournament)) {
          loggedUser = {
            name: globalUser.name,
            email: globalUser.email,
            area: ""
          };
        }
      }
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
    const filteredPayload = mergeLockedCustomMatches(previous?.prediction, payload.tournament, tournament);
    const prediction = mergePredictionByPhase(previous?.prediction, filteredPayload, phaseId);
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
  const filteredPayload = mergeLockedCustomMatches(previous?.prediction, payload.tournament, tournament);
  const prediction = mergePredictionByPhase(previous?.prediction, filteredPayload, phaseId);
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
  const payment = paymentFor(tournament, email);
  if (payment?.status === "approved" && payment.pendingSubmission) {
    const submission = materializeApprovedPaymentDraft(req, tournament, payment);
    if (submission) writeStore(store);
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
    if (tenant && !requireAdmin(req, res, tenant, body.adminKey, body.sessionToken, body.globalSessionToken)) return;
    if (!tournament.isGlobal && tournament.creatorKey && body.creatorKey !== tournament.creatorKey) {
      send(res, 403, JSON.stringify({ error: "Creator key is required to edit results" }));
      return;
    }
    const updatedAt = new Date().toISOString();
    if (realResults.custom?.matches) {
      Object.values(realResults.custom.matches).forEach(match => {
        if (!match || typeof match !== "object") return;
        const hasScore = match.homeScore !== "" && match.awayScore !== "" && match.homeScore !== undefined && match.awayScore !== undefined;
        if (hasScore && !match.finishedAt) match.finishedAt = updatedAt;
      });
      realResults.updatedAt = updatedAt;
    }
    tournament.realResults = realResults;
    tournament.realResultsUpdatedAt = updatedAt;
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
  const area = normalizeAreaName(url.searchParams.get("area"));
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
  if (tenant) {
    const companyUser = sessionUser(store, tenant, url.searchParams.get("sessionToken"));
    const globalUser = globalSessionUser(store, url.searchParams.get("globalSessionToken"));
    if (!companyUser && !hasTournamentAccess(store, globalUser, tournament)) {
      send(res, 403, JSON.stringify({ error: "Tournament access is required" }));
      return;
    }
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
      score: scoreSubmission(submission.prediction, tournament.realResults, tournament.scoring, tournament)
    }))
    .sort((a, b) => b.score.points - a.score.points || new Date(a.createdAt) - new Date(b.createdAt));
  send(res, 200, JSON.stringify({
    tournament: publicTournament(tournament),
    area,
    hasRealResults: Boolean(tournament.realResults),
    leaderboard
  }));
}

function handleAdminSummary(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const adminKey = url.searchParams.get("adminKey");
  const sessionToken = url.searchParams.get("sessionToken");
  const globalSessionToken = url.searchParams.get("globalSessionToken");
  if (!tenant) {
    send(res, 404, JSON.stringify({ error: "Company not found" }));
    return;
  }
  if (!requireAdmin(req, res, tenant, adminKey, sessionToken, globalSessionToken)) return;
  const store = readStore();
  const tenantData = tenantStore(store, tenant.id);
  const tournament = store.tournaments.find(item => item.id === tenantTournamentId(tenant.id));
  const submissions = tournament?.submissions || [];
  const byEmail = new Map(submissions.map(submission => [normalizeEmail(submission.player?.email), submission]));
    const users = Object.values(tenantData.users || {})
    .map(user => {
      const submission = byEmail.get(normalizeEmail(user.email));
      const role = userRole(tenant.id, user);
      const admin = role === "admin" || role === "superadmin";
      if (user.role !== role) user.role = role;
      if (admin && !user.isAdmin) user.isAdmin = true;
      return {
        name: user.name || "",
        email: user.email || "",
        area: user.area || "",
        active: user.active !== false,
        role,
        isAdmin: admin,
        isSuperAdmin: role === "superadmin",
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
      role: "player",
      isAdmin: false,
      isSuperAdmin: false,
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
  const isCompanyView = /^\/(?:prode\/)?empresa\/[^/.]+\/?$/.test(cleanUrl);
  const isProdeView = cleanUrl === "/prode" || cleanUrl === "/prode/";
  const staticMatch = cleanUrl.match(/^\/prode-static\/(.+)$/);
  const requested = req.url === "/" || isProdeView || cleanUrl.startsWith("/join/") || cleanUrl.startsWith("/continuar/") || isCompanyView
    ? "/index.html"
    : staticMatch
      ? `/${staticMatch[1]}`
      : cleanUrl;
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

const server = http.createServer((req, res) => {
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
    const store = readStore();
    send(res, 200, JSON.stringify({ tenant: publicTenant(tenant, tenantStore(store, tenant.id)) }));
    return;
  }
  if (req.method === "POST" && req.url === "/api/company-login") {
    handleCompanyLogin(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/global-login") {
    handleGlobalLogin(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/global-session")) {
    handleGlobalSession(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/tournament-lobby")) {
    handleTournamentLobby(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/tournament-access") {
    handleGrantTournamentAccess(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/lobby-tenant") {
    handleCreateLobbyTenant(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/company-session")) {
    handleCompanySession(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/admin-users") {
    handleAdminUpdateUser(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/admin-theme") {
    handleAdminTheme(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/admin-games") {
    handleAdminGames(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/global-games")) {
    handleGlobalGames(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/daily-game-play") {
    handleDailyGamePlay(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/company-areas") {
    handleCreateCompanyArea(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/admin-summary")) {
    handleAdminSummary(req, res);
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

});

async function startServer() {
  try {
    const store = readStore();
    await syncStoreToMysql(store);
    console.log(`MySQL conectado en ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database} con usuario ${DB_CONFIG.user}`);
    server.listen(PORT, () => {
      console.log(`Prode Mundial listo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar porque MySQL es obligatorio:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
