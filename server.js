const http = require("http");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const net = require("net");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ba.itsoft26@gmail.com',
    pass: 'fhnipndmbbgksmld'
  }
});
const verificationCodes = {};
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
let STORE_CACHE = null;
let mysqlSyncQueue = Promise.resolve();

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
const FIXED_DAILY_GAME_POINTS = {
  camisetadle: 20,
  desafio: 15,
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/manifest+json; charset=utf-8",
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

const ARGENTINA_2026_ZONES = {
  A: [
    "Platense",
    "Defensa y Justicia",
    "Central Cordoba",
    "Lanus",
    "Deportivo Riestra",
    "Talleres",
    "Boca Juniors",
    "Estudiantes",
    "Instituto",
    "Gimnasia Mendoza",
    "San Lorenzo",
    "Independiente",
    "Newell's",
    "Union",
    "Velez"
  ],
  B: [
    "Argentinos Juniors",
    "Aldosivi",
    "Atletico Tucuman",
    "Banfield",
    "Barracas Central",
    "Belgrano",
    "River Plate",
    "Gimnasia La Plata",
    "Estudiantes de Rio Cuarto",
    "Independiente Rivadavia",
    "Huracan",
    "Racing",
    "Rosario Central",
    "Sarmiento",
    "Tigre"
  ]
};

const ARGENTINA_2026_INTERZONAL = [
  ["Velez", "River Plate"],
  ["Barracas Central", "Platense"],
  ["Talleres", "Rosario Central"],
  ["Sarmiento", "Estudiantes"],
  ["Defensa y Justicia", "Belgrano"],
  ["Argentinos Juniors", "Lanus"],
  ["Boca Juniors", "Racing"],
  ["Independiente Rivadavia", "Independiente"],
  ["Union", "Aldosivi"],
  ["Atletico Tucuman", "Instituto"],
  ["San Lorenzo", "Estudiantes de Rio Cuarto"],
  ["Gimnasia La Plata", "Gimnasia Mendoza"],
  ["Central Cordoba", "Tigre"],
  ["Huracan", "Deportivo Riestra"],
  ["Newell's", "Banfield"]
];

const ARGENTINA_2026_CLASSICS = [
  ["Boca Juniors", "River Plate"],
  ["Independiente", "Racing"],
  ["Huracan", "San Lorenzo"],
  ["Newell's", "Rosario Central"],
  ["Estudiantes", "Gimnasia La Plata"],
  ["Gimnasia Mendoza", "Independiente Rivadavia"],
  ["Banfield", "Lanus"],
  ["Belgrano", "Talleres"],
  ["Argentinos Juniors", "Platense"],
  ["Tigre", "Velez"],
  ["Estudiantes de Rio Cuarto", "Instituto"],
  ["Atletico Tucuman", "Central Cordoba"],
  ["Sarmiento", "Union"],
  ["Barracas Central", "Deportivo Riestra"],
  ["Aldosivi", "Defensa y Justicia"]
];

function zonalRoundRobinFixtures(zoneId, teams) {
  const rotation = teams.length % 2 === 0 ? [...teams] : [...teams, ""];
  const rounds = rotation.length - 1;
  const half = rotation.length / 2;
  const fixtures = [];
  for (let round = 0; round < rounds; round += 1) {
    for (let i = 0; i < half; i += 1) {
      const home = rotation[i];
      const away = rotation[rotation.length - 1 - i];
      if (home && away) {
        const swap = round % 2 === 1;
        fixtures.push(fixture(
          `arg-${zoneId.toLowerCase()}-${round + 1}-${i + 1}`,
          swap ? away : home,
          swap ? home : away,
          "",
          `Zona ${zoneId} - Fecha ${round + 1}`
        ));
      }
    }
    rotation.splice(1, 0, rotation.pop());
  }
  return fixtures;
}

function argentina2026Fixtures() {
  const zonal = [
    ...zonalRoundRobinFixtures("A", ARGENTINA_2026_ZONES.A),
    ...zonalRoundRobinFixtures("B", ARGENTINA_2026_ZONES.B)
  ];
  const interzonal = ARGENTINA_2026_INTERZONAL.map(([home, away], index) => fixture(
    `arg-interzonal-${index + 1}`,
    home,
    away,
    "",
    "Fecha Interzonal"
  ));
  const classics = ARGENTINA_2026_CLASSICS.map(([home, away], index) => fixture(
    `arg-clasicos-${index + 1}`,
    home,
    away,
    "",
    "Fecha Clasicos"
  ));
  return [...zonal, ...classics, ...interzonal];
}

const TOURNAMENT_TEMPLATES = [
  { id: "worldcup-2026", name: "Mundial 2026", mode: "groups-knockout", teams: [] },
  { id: "champions", name: "Champions League", mode: "fixture", teams: ["Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Bayern Munich", "PSG", "Inter", "Arsenal", "Atletico Madrid", "Borussia Dortmund", "Juventus", "Benfica", "Porto", "Napoli", "Bayer Leverkusen", "Chelsea"] },
  { id: "libertadores", name: "Copa Libertadores", mode: "groups-knockout", teams: ["River Plate", "Boca Juniors", "Flamengo", "Palmeiras", "Sao Paulo", "Fluminense", "Gremio", "Atletico Mineiro", "Nacional", "Penarol", "Colo-Colo", "Universidad de Chile", "Olimpia", "Cerro Porteno", "Liga de Quito", "Independiente del Valle"] },
  { id: "sudamericana", name: "Copa Sudamericana", mode: "groups-knockout", teams: ["Lanus", "Defensa y Justicia", "Racing", "Independiente", "Corinthians", "Cruzeiro", "Internacional", "Fortaleza", "Universidad Catolica", "Emelec", "Barcelona SC", "America de Cali", "Junior", "Sporting Cristal", "Bolivar", "The Strongest"] },
  {
    id: "argentina",
    name: "Liga Profesional Argentina 2026",
    mode: "league",
    teams: [...ARGENTINA_2026_ZONES.A, ...ARGENTINA_2026_ZONES.B],
    fixtures: argentina2026Fixtures()
  },
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
  champion: 20
};

const DEFAULT_PHASES = [
  { id: "all", name: "Prode completo", type: "all" },
  { id: "group1", name: "Fecha 1 - Grupos", type: "groups", groupMatchday: 1 },
  { id: "group2", name: "Fecha 2 - Grupos", type: "groups", groupMatchday: 2 },
  { id: "group3", name: "Fecha 3 - Grupos", type: "groups", groupMatchday: 3 },
  { id: "r32", name: "16avos", type: "matches", matchIds: ["m73", "m74", "m75", "m76", "m77", "m78", "m79", "m80", "m81", "m82", "m83", "m84", "m85", "m86", "m87", "m88"] },
  { id: "r16", name: "8avos", type: "matches", matchIds: ["m89", "m90", "m91", "m92", "m93", "m94", "m95", "m96"] },
  { id: "qf", name: "4tos", type: "matches", matchIds: ["m97", "m98", "m99", "m100"] },
  { id: "sf", name: "Semis", type: "matches", matchIds: ["m101", "m102"] },
  { id: "third", name: "3er puesto", type: "matches", matchIds: ["m103"] },
  { id: "final", name: "Final", type: "matches", matchIds: ["m104"] }
];

const GROUP_MATCHDAY_FIXTURES = {
  group1: ["A-0-2", "A-1-3", "B-0-3", "D-0-1", "B-2-1", "C-0-1", "C-3-2", "D-2-3", "E-0-3", "F-0-1", "E-2-1", "F-3-2", "H-0-3", "G-0-2", "H-2-1", "G-1-3", "I-0-1", "I-3-2", "J-0-2", "J-1-3", "K-0-3", "L-0-1", "L-2-3", "K-2-1"],
  group2: ["A-3-2", "B-1-3", "B-0-2", "A-0-1", "D-0-2", "C-2-1", "C-0-3", "D-3-1", "F-0-3", "E-0-2", "E-1-3", "F-2-1", "H-0-2", "G-0-1", "H-1-3", "G-3-2", "J-0-1", "I-0-3", "I-2-1", "J-3-2", "K-0-2", "L-0-2", "L-3-1", "K-1-3"],
  group3: ["B-1-0", "B-3-2", "C-2-0", "C-1-3", "A-3-0", "A-2-1", "E-3-2", "E-1-0", "F-1-3", "F-2-0", "D-3-0", "D-1-2", "I-2-0", "I-1-3", "H-3-2", "H-1-0", "G-2-1", "G-3-0", "L-3-0", "L-1-2", "K-1-0", "K-3-2", "J-2-1", "J-3-0"]
};

const WORLD_CUP_GROUP_KEYS = "ABCDEFGHIJKL".split("");

function groupMatchId(group, firstIndex, secondIndex) {
  return `${group}-${firstIndex}-${secondIndex}`;
}

function groupMatchIdsForPhase(phaseId) {
  const list = GROUP_MATCHDAY_FIXTURES[phaseId];
  return Array.isArray(list) ? list : [];
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
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

const BASE_ADMIN_EMAIL = "admin@prodeglobal.com";

function ensureBaseAdminMemberships(store) {
  if (!store.users || typeof store.users !== "object") store.users = {};
  if (!store.tenants || typeof store.tenants !== "object") store.tenants = {};
  if (!store.tournamentAccess || typeof store.tournamentAccess !== "object") store.tournamentAccess = {};

  const now = new Date().toISOString();
  const previous = store.users[BASE_ADMIN_EMAIL] || {};
  store.users[BASE_ADMIN_EMAIL] = {
    ...previous,
    name: previous.name || "Admin Global",
    email: BASE_ADMIN_EMAIL,
    active: true,
    role: "superadmin",
    ...publicUserFlags("superadmin"),
    updatedAt: now,
    createdAt: previous.createdAt || now
  };

  Object.keys(store.tenants).forEach((tenantId) => {
    const tenantData = tenantStore(store, tenantId);
    const existing = tenantData.users[BASE_ADMIN_EMAIL] || {};
    tenantData.users[BASE_ADMIN_EMAIL] = {
      ...existing,
      name: existing.name || store.users[BASE_ADMIN_EMAIL].name || "Admin Global",
      email: BASE_ADMIN_EMAIL,
      area: existing.area || "General",
      active: true,
      approvalStatus: "approved",
      role: "admin",
      ...publicUserFlags("admin"),
      password: existing.password || store.users[BASE_ADMIN_EMAIL].password,
      updatedAt: now,
      createdAt: existing.createdAt || now
    };
    const tournamentId = tenantTournamentId(tenantId);
    accessMapFor(store, BASE_ADMIN_EMAIL)[tournamentId] = {
      ...(accessMapFor(store, BASE_ADMIN_EMAIL)[tournamentId] || {}),
      tournamentId,
      grantedAt: accessMapFor(store, BASE_ADMIN_EMAIL)[tournamentId]?.grantedAt || now,
      grantedByPassword: false,
      grantedByAdmin: true,
      grantedBy: BASE_ADMIN_EMAIL
    };
  });
}

function tenantFromValue(value) {
  const id = slug(value);
  if (TENANTS[id]) return TENANTS[id];
  const cachedTenant = STORE_CACHE?.tenants?.[id];
  if (cachedTenant?.dynamic === true) {
    registerDynamicTenant(id, cachedTenant);
    return TENANTS[id] || null;
  }
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
  const globalTournament = store.tournaments.find(t => t.id === "global");
  const globalReal = globalTournament?.realResults || null;
  const globalRealUpdatedAt = globalTournament?.realResultsUpdatedAt || null;
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
      existing.code = normalizeCode(existing.code) || `EMPRESA-${tenant.id.toUpperCase()}`;
      existing.tenantId = tenant.id;
      existing.isGlobal = false;
      existing.templateId = existing.templateId || "worldcup-2026";
      existing.mode = existing.mode || "groups-knockout";
      existing.scoring = existing.scoring || DEFAULT_SCORING;
      if (!Array.isArray(existing.submissions)) existing.submissions = [];
      if (tenant.payment && !existing.payment) existing.payment = tenant.payment;
      if (!existing.payments || typeof existing.payments !== "object") existing.payments = {};
      existing.realResults = globalReal;
      existing.realResultsUpdatedAt = globalRealUpdatedAt;
    } else {
      store.tournaments.push({
        id: tenantTournamentId(tenant.id),
        name: tenant.name,
        code: `EMPRESA-${tenant.id.toUpperCase()}`,
        tenantId: tenant.id,
        isGlobal: false,
        createdAt: new Date().toISOString(),
        realResults: globalReal,
        realResultsUpdatedAt: globalRealUpdatedAt,
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

function parseMysqlJson(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function normalizeStoreShape(store) {
  const normalized = store && typeof store === "object" ? store : emptyStore();
  if (!Array.isArray(normalized.tournaments)) normalized.tournaments = [];
  if (!normalized.users || typeof normalized.users !== "object") normalized.users = {};
  if (!normalized.globalSessions || typeof normalized.globalSessions !== "object") normalized.globalSessions = {};
  if (!normalized.passwordResets || typeof normalized.passwordResets !== "object") normalized.passwordResets = {};
  if (!normalized.tournamentAccess || typeof normalized.tournamentAccess !== "object") normalized.tournamentAccess = {};
  if (!normalized.globalGames || typeof normalized.globalGames !== "object") normalized.globalGames = JSON.parse(JSON.stringify(DEFAULT_DAILY_GAMES));
  if (!normalized.globalGamePlays || typeof normalized.globalGamePlays !== "object") normalized.globalGamePlays = {};
  if (!normalized.tenants || typeof normalized.tenants !== "object") normalized.tenants = {};
  registerDynamicTenants(normalized);
  if (!normalized.tournaments.some(tournament => tournament.id === "global")) {
    normalized.tournaments.unshift(emptyStore().tournaments[0]);
  }
  ensureTenantTournaments(normalized);
  ensureBaseAdminMemberships(normalized);
  return normalized;
}

function readStoreFileFallback() {
  try {
    if (!fs.existsSync(STORE_FILE)) return null;
    const store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    return normalizeStoreShape(store);
  } catch {
    return null;
  }
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
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_state (
      state_key VARCHAR(80) PRIMARY KEY,
      raw_json JSON,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

async function syncStoreToMysql(store) {
  const db = await getMysqlConnection();
  let committed = false;

  try {
    await db.beginTransaction();
    const tournaments = store.tournaments || [];
    const tournamentIds = tournaments.map(t => t.id).filter(Boolean);
    const submissionIds = tournaments.flatMap(t => (t.submissions || []).map(s => s.id).filter(Boolean));
    const userEmails = Object.entries(store.users || {}).map(([email, user]) => normalizeEmail(user.email || email)).filter(Boolean);
    const accessPairs = [];
    for (const [email, accessByTournament] of Object.entries(store.tournamentAccess || {})) {
      for (const tournamentId of Object.keys(accessByTournament || {})) {
        accessPairs.push([normalizeEmail(email), tournamentId]);
      }
    }

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
    const appState = {
      globalSessions: store.globalSessions || {},
      passwordResets: store.passwordResets || {},
      globalGames: store.globalGames || {},
      globalGamePlays: store.globalGamePlays || {},
      tenants: store.tenants || {}
    };
    for (const [stateKey, stateValue] of Object.entries(appState)) {
      await db.execute(
        `INSERT INTO app_state (state_key, raw_json)
         VALUES (?, CAST(? AS JSON))
         ON DUPLICATE KEY UPDATE raw_json=VALUES(raw_json)`,
        [stateKey, JSON.stringify(stateValue)]
      );
    }

    if (submissionIds.length) {
      await db.query(`DELETE FROM submissions WHERE id NOT IN (?)`, [submissionIds]);
    } else {
      await db.query(`DELETE FROM submissions`);
    }
    if (tournamentIds.length) {
      await db.query(`DELETE FROM tournaments WHERE id NOT IN (?)`, [tournamentIds]);
    } else {
      await db.query(`DELETE FROM tournaments`);
    }
    if (userEmails.length) {
      await db.query(`DELETE FROM users WHERE email NOT IN (?)`, [userEmails]);
    } else {
      await db.query(`DELETE FROM users`);
    }
    if (accessPairs.length) {
      const clauses = accessPairs.map(() => "(user_email = ? AND tournament_id = ?)").join(" OR ");
      await db.execute(`DELETE FROM tournament_access WHERE NOT (${clauses})`, accessPairs.flat());
    } else {
      await db.query(`DELETE FROM tournament_access`);
    }
    await db.commit();
    committed = true;
  } finally {
    if (!committed) {
      try { await db.rollback(); } catch {}
    }
    await db.end();
  }
}

async function loadStoreFromMysql() {
  const db = await getMysqlConnection();
  try {
    const [[tournamentCount]] = await db.query(`SELECT COUNT(*) AS total FROM tournaments`);
    if (!Number(tournamentCount?.total || 0)) return null;

    const store = emptyStore();
    store.tournaments = [];
    store.users = {};
    store.tournamentAccess = {};

    const [stateRows] = await db.query(`SELECT state_key, raw_json FROM app_state`);
    for (const row of stateRows || []) {
      const value = parseMysqlJson(row.raw_json, {});
      if (row.state_key === "globalSessions") store.globalSessions = value;
      if (row.state_key === "passwordResets") store.passwordResets = value;
      if (row.state_key === "globalGames") store.globalGames = value;
      if (row.state_key === "globalGamePlays") store.globalGamePlays = value;
      if (row.state_key === "tenants") store.tenants = value;
    }

    const fileFallback = readStoreFileFallback();
    if (!store.globalSessions || !Object.keys(store.globalSessions).length) store.globalSessions = fileFallback?.globalSessions || {};
    if (!store.passwordResets || typeof store.passwordResets !== "object") store.passwordResets = fileFallback?.passwordResets || {};
    if (!store.globalGames || typeof store.globalGames !== "object") store.globalGames = fileFallback?.globalGames || JSON.parse(JSON.stringify(DEFAULT_DAILY_GAMES));
    if (!store.globalGamePlays || typeof store.globalGamePlays !== "object") store.globalGamePlays = fileFallback?.globalGamePlays || {};
    if (!store.tenants || !Object.keys(store.tenants).length) store.tenants = fileFallback?.tenants || {};

    const [tournamentRows] = await db.query(`SELECT * FROM tournaments`);
    for (const row of tournamentRows || []) {
      const raw = parseMysqlJson(row.raw_json, null);
      const tournament = raw && typeof raw === "object" ? raw : {
        id: row.id,
        name: row.name,
        code: row.code,
        isGlobal: Boolean(row.is_global),
        creatorEmail: row.creator_email || "",
        creatorKey: row.creator_key || "",
        templateId: row.template_id || "worldcup-2026",
        mode: row.mode || "groups-knockout",
        customTemplate: parseMysqlJson(row.custom_template, null),
        scoring: parseMysqlJson(row.scoring, DEFAULT_SCORING),
        realResults: parseMysqlJson(row.real_results, null),
        realResultsUpdatedAt: row.real_results_updated_at ? new Date(row.real_results_updated_at).toISOString() : null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        submissions: []
      };
      tournament.submissions = [];
      store.tournaments.push(tournament);
    }

    const tournamentById = new Map(store.tournaments.map(tournament => [tournament.id, tournament]));
    const [submissionRows] = await db.query(`SELECT * FROM submissions`);
    for (const row of submissionRows || []) {
      const tournament = tournamentById.get(row.tournament_id);
      if (!tournament) continue;
      const raw = parseMysqlJson(row.raw_json, null);
      const submission = raw && typeof raw === "object" ? raw : {
        id: row.id,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        player: parseMysqlJson(row.player, {}),
        prediction: parseMysqlJson(row.prediction, null)
      };
      tournament.submissions.push(submission);
    }

    const [userRows] = await db.query(`SELECT * FROM users`);
    for (const row of userRows || []) {
      const raw = parseMysqlJson(row.raw_json, null);
      const email = normalizeEmail(row.email || raw?.email);
      if (!email) continue;
      store.users[email] = raw && typeof raw === "object" ? raw : {
        email,
        name: row.name || "",
        active: row.active !== false && row.active !== 0,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : ""
      };
    }

    const [accessRows] = await db.query(`SELECT * FROM tournament_access`);
    for (const row of accessRows || []) {
      const email = normalizeEmail(row.user_email);
      if (!email || !row.tournament_id) continue;
      if (!store.tournamentAccess[email]) store.tournamentAccess[email] = {};
      const raw = parseMysqlJson(row.raw_json, null);
      store.tournamentAccess[email][row.tournament_id] = raw && typeof raw === "object" ? raw : {
        tournamentId: row.tournament_id,
        grantedAt: row.granted_at ? new Date(row.granted_at).toISOString() : new Date().toISOString(),
        grantedByPassword: row.granted_by_password !== false && row.granted_by_password !== 0
      };
    }

    return normalizeStoreShape(store);
  } finally {
    await db.end();
  }
}

async function loadInitialStore() {
  const mysqlStore = await loadStoreFromMysql();
  if (mysqlStore) return mysqlStore;
  return readStoreFileFallback() || normalizeStoreShape(emptyStore());
}

function readStore() {
  if (!STORE_CACHE) STORE_CACHE = normalizeStoreShape(emptyStore());
  return STORE_CACHE;
}

function writeStore(store) {
  STORE_CACHE = normalizeStoreShape(store);
  const snapshot = JSON.parse(JSON.stringify(STORE_CACHE));
  mysqlSyncQueue = mysqlSyncQueue
    .then(() => syncStoreToMysql(snapshot))
    .catch((err) => {
      console.error("Error sincronizando store a MySQL:", err);
    });
  return STORE_CACHE;
}

function publicTournament(tournament, options = {}) {
  const template = TOURNAMENT_TEMPLATES.find(item => item.id === tournament.templateId) || TOURNAMENT_TEMPLATES[0];
  const payment = paymentSettings(tournament);
  const compact = Boolean(options.compact);
  const fixtures = compact ? [] : tournamentFixtures(tournament);
  const data = {
    id: tournament.id,
    name: tournament.name,
    tenantId: tournament.tenantId || "",
    isGlobal: Boolean(tournament.isGlobal),
    templateId: tournament.templateId || template.id,
    templateName: template.name,
    mode: tournament.mode || template.mode,
    teams: compact ? [] : (tournament.customTemplate?.teams || template.teams || []),
    fixtures,
    timing: compact ? null : (tournament.customTemplate?.timing || template.timing || { predictionLockMinutesBefore: 0, scoringDelayMinutesAfterResult: 0 }),
    customTemplate: compact ? null : (tournament.customTemplate || null),
    scoring: tournament.scoring || DEFAULT_SCORING,
    createdAt: tournament.createdAt,
    realResults: compact ? null : (tournament.realResults || null),
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

function emailIdentity(value) {
  const email = normalizeEmail(value);
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;
  let local = email.slice(0, atIndex);
  let domain = email.slice(atIndex + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") {
    local = local.split("+")[0].replace(/\./g, "");
  }
  return `${local}@${domain}`;
}

function sameEmailIdentity(a, b) {
  return emailIdentity(a) && emailIdentity(a) === emailIdentity(b);
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
  if (image.startsWith("/") && !image.includes("..")) return image.slice(0, 5000000);
  if (/^https?:\/\//i.test(image)) return image.slice(0, 5000000);
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(image) && image.length < 5000000) return image;
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

async function handleRequestVerification(req, res) {
  try {
    // En el servidor nativo, leemos el body con tu propia función readBody
    const body = JSON.parse(await readBody(req));
    const email = body.email;
    // Genera un número aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = code;
    // Enviamos el correo
    await transporter.sendMail({
      from: '"Prode Bait" <ba.itsoft26@gmail.com>',
      to: email,
      subject: 'Tu código de verificación - Prode Bait',
      text: `¡Hola!\n\nTu código de acceso de 6 dígitos para registrarte en el Prode es: ${code}\n\nSi no solicitaste esto, ignora este correo.`
    });
    send(res, 200, JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("Error enviando email:", err);
    send(res, 500, JSON.stringify({ error: "Error al enviar el email" }));
  }
}

async function handleVerifyCode(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const { email, code } = body;
    
    if (verificationCodes[email] && verificationCodes[email] === code) {
      delete verificationCodes[email]; // Lo borramos para que no se use 2 veces
      send(res, 200, JSON.stringify({ ok: true }));
    } else {
      send(res, 400, JSON.stringify({ error: "Código incorrecto" }));
    }
  } catch (err) {
    send(res, 500, JSON.stringify({ error: "Error al verificar código" }));
  }
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
  const role = userRole(tenant.id, { ...user, email: user.email || email });
  if (!isApprovedCompanyUser(user, role)) return null;
  return {
    name: user.name || "",
    email: user.email || email,
    area: user.area || "",
    avatar: user.avatar || "",
    profileBorder: user.profileBorder || "",
    role,
    ...publicUserFlags(role)
  };
}

function globalSessionUser(store, token) {
  const rawToken = String(token || "").trim();
  if (!rawToken) return null;
  const email = store.globalSessions?.[rawToken];
  const user = email ? store.users?.[email] : null;
  if (!user || user.active === false) return null;
  const role = userRole(null, { ...user, email: user.email || email });
  return {
    name: user.name || "",
    email: user.email || email,
    avatar: user.avatar || "",
    profileBorder: user.profileBorder || "",
    role,
    ...publicUserFlags(role),
    createdAt: user.createdAt || ""
  };
}

function sanitizeAvatarDataUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(text)) return null;
  if (text.length > 2_500_000) return null;
  return text;
}
function sanitizeProfileBorder(value) {
  const allowed = new Set(["", "border-gold", "border-neon", "border-fire"]);
  const border = String(value || "").trim();
  return allowed.has(border) ? border : null;
}
function totalFanPoints(gamePlays = {}, email = "") {
  const normalized = normalizeEmail(email);
  const byDate = gamePlays?.[normalized] || {};
  return Object.values(byDate).reduce((sum, day) => {
    const camisetadle = Number(day?.camisetadle?.points || 0);
    const desafio = Number(day?.desafio?.points || 0);
    return sum + camisetadle + desafio;
  }, 0);
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

function tournamentAccessMode(tournament = {}) {
  return tournament.accessMode === "code" ? "code" : "account";
}

function hasTournamentAccess(store, user, tournament) {
  if (!tournament || tournament.isGlobal) return true;
  if (!user?.email) return false;
  const email = normalizeEmail(user.email);
  const role = userRole(tournament.tenantId || null, { ...user, email });
  if (tournament.tenantId && tournamentAccessMode(tournament) === "account") {
    const tenantData = store.tenants?.[tournament.tenantId];
    const tenantUser = tenantData?.users?.[email];
    if (tenantUser && !isApprovedCompanyUser(tenantUser, role)) return false;
    if (canApproveCompanyRequestsRole(role)) return true;
  }
  const access = store.tournamentAccess?.[email]?.[tournament.id];
  return Boolean(access?.grantedAt);
}

function publicLobbyTournament(store, tournament, user = null) {
  const tenant = tournament.tenantId ? tenantFromValue(tournament.tenantId) : null;
  const access = hasTournamentAccess(store, user, tournament);
  const email = normalizeEmail(user?.email || "");
  const tenantUser = tournament.tenantId && email ? store.tenants?.[tournament.tenantId]?.users?.[email] : null;
  const tenantRole = userRole(tournament.tenantId || null, { ...(tenantUser || user || {}), email });
  const approvalStatus = tenantUser ? approvalStatusFor(tenantUser, tenantRole) : "";
  return {
    ...publicTournament(tournament, { includePrivateCode: tournament.isGlobal || access, compact: true }),
    isPrivate: !tournament.isGlobal,
    hasAccess: access,
    pendingApproval: approvalStatus === "pending",
    rejectedApproval: approvalStatus === "rejected",
    accessMode: tournamentAccessMode(tournament),
    requiresAccountApproval: tournamentAccessMode(tournament) === "account",
    tenantPath: tenant ? `/prode/empresa/${encodeURIComponent(tenant.id)}` : "/prode",
    tenantName: tenant?.name || "",
    lockedLabel: tournament.isGlobal ? "Publico" : access ? "Acceso habilitado" : approvalStatus === "pending" ? "Solicitud pendiente" : approvalStatus === "rejected" ? "Solicitud rechazada" : "Privado"
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

function publicCompetitionTemplate(template) {
  return {
    id: template.id,
    name: template.name,
    mode: template.mode
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

function isEmpresarioEmail(tenantId, email) {
  const empresarios = envTenantList(tenantId, "EMPRESARIO_EMAILS");
  return empresarios.includes(normalizeEmail(email));
}

function isSuperAdminEmail(tenantId, email) {
  const normalized = normalizeEmail(email);
  const configured = envTenantList(tenantId, "SUPERADMIN_EMAILS");
  return configured.includes(normalized)
    || (!tenantId && normalized === "admin@prodeglobal.com")
    || (tenantId === "acme" && ["admin@acme", "admin@acme.com"].includes(normalized));
}

function isAdminRole(role) {
  return role === "admin" || role === "superadmin";
}

function canApproveCompanyRequestsRole(role) {
  return role === "empresario" || isAdminRole(role);
}

function userRole(tenantId, user = {}) {
  if (isSuperAdminEmail(tenantId, user.email)) return "superadmin";
  if (user.role === "superadmin" || user.isSuperAdmin) return "superadmin";
  if (user.role === "admin" || user.isAdmin || isAdminEmail(tenantId, user.email)) return "admin";
  if (user.role === "empresario" || user.isEmpresario || isEmpresarioEmail(tenantId, user.email)) return "empresario";
  return "player";
}

function approvalStatusFor(user = {}, role = "player") {
  if (canApproveCompanyRequestsRole(role)) return "approved";
  return user.approvalStatus || "approved";
}

function isApprovedCompanyUser(user = {}, role = "player") {
  return user.active !== false && approvalStatusFor(user, role) === "approved";
}

function publicUserFlags(role) {
  return {
    isAdmin: isAdminRole(role),
    isSuperAdmin: role === "superadmin",
    isEmpresario: role === "empresario",
    canApproveRequests: canApproveCompanyRequestsRole(role)
  };
}

function normalizeEditableCompanyRole(value, fallbackIsAdmin = false) {
  const role = String(value || "").trim().toLowerCase();
  if (["player", "empresario", "admin"].includes(role)) return role;
  return fallbackIsAdmin ? "admin" : "player";
}

function adminSessionUser(store, tenant, token) {
  const user = sessionUser(store, tenant, token);
  return user?.isAdmin ? user : null;
}

function superAdminSessionUser(store, tenant, token) {
  const user = sessionUser(store, tenant, token);
  return user?.isSuperAdmin ? user : null;
}

function companyApproverSessionUser(store, tenant, sessionToken = "", globalSessionToken = "") {
  const tenantUser = sessionUser(store, tenant, sessionToken);
  if (tenantUser?.canApproveRequests) return tenantUser;
  const globalUser = globalSessionUser(store, globalSessionToken);
  if (globalUser?.canApproveRequests) return globalUser;
  return null;
}

function requireCompanyApprover(req, res, tenant, sessionToken = "", globalSessionToken = "") {
  const store = readStore();
  const user = companyApproverSessionUser(store, tenant, sessionToken, globalSessionToken);
  if (user) return user;
  send(res, 403, JSON.stringify({ error: "Se requiere rol Empresario o Administrador." }));
  return null;
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
      homeCrest: safeText(match?.homeCrest || match?.homeLogo || match?.homeBadge, 240),
      awayCrest: safeText(match?.awayCrest || match?.awayLogo || match?.awayBadge, 240),
      startsAt: safeText(match?.startsAt, 40),
      round: safeText(match?.round, 60)
    }))
    .filter(match => match.home && match.away)
    .slice(0, 520);
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

function generatedFixturesForTemplate(template = {}) {
  const teams = normalizeTeams(template.teams || []);
  if (!teams.length || template.mode === "groups-knockout") return [];
  const schedule = [];
  const maxMatches = template.mode === "league" ? 24 : 16;
  const rotation = teams.length % 2 === 0 ? [...teams] : [...teams, ""];
  const rounds = rotation.length - 1;
  const half = rotation.length / 2;
  for (let round = 0; round < rounds; round += 1) {
    for (let i = 0; i < half; i += 1) {
      const home = rotation[i];
      const away = rotation[rotation.length - 1 - i];
      if (home && away) {
        const swap = round % 2 === 1;
        schedule.push({
          id: `c${schedule.length + 1}`,
          home: swap ? away : home,
          away: swap ? home : away,
          round: `Fecha ${round + 1}`
        });
        if (schedule.length >= maxMatches) return schedule;
      }
    }
    rotation.splice(1, 0, rotation.pop());
  }
  return schedule;
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
  const explicit = normalizeFixtures(tournament.customTemplate?.fixtures || template.fixtures || []);
  return explicit.length ? explicit : generatedFixturesForTemplate(tournament.customTemplate || template);
}

function footballDataCompetitionCode(templateId) {
  return {
    champions: "CL",
    premier: "PL",
    "laliga-2025-26": "PD",
    laliga: "PD",
    "laliga-timing-lab": "PD",
    "serie-a": "SA",
    bundesliga: "BL1",
    "ligue-1": "FL1",
    worldcup: "WC",
    "worldcup-2026": "WC"
  }[templateId] || "";
}

function espnArgentinaRound(event, regularIndex = 0) {
  const slug = String(event?.season?.slug || "");
  if (slug.includes("round-of-16")) return "Apertura - Octavos";
  if (slug.includes("quarterfinal")) return "Apertura - Cuartos";
  if (slug.includes("semifinal")) return "Apertura - Semifinales";
  if (slug.includes("final")) return "Apertura - Final";
  if (slug === "torneo-clausura") return `Clausura - Fecha ${Math.floor(regularIndex / 15) + 1}`;
  return `Apertura - Fecha ${Math.floor(regularIndex / 15) + 1}`;
}

function espnTeam(competition, homeAway) {
  return competition?.competitors?.find(item => item.homeAway === homeAway) || null;
}

function espnTeamName(competitor) {
  return competitor?.team?.displayName || competitor?.team?.shortDisplayName || competitor?.team?.name || "";
}

function espnTeamLogo(competitor) {
  return competitor?.team?.logo || competitor?.team?.logos?.[0]?.href || "";
}

function espnArgentinaFixtures(events = []) {
  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const regularIndexes = { "torneo-apertura": 0, "torneo-clausura": 0 };
  return sorted
    .map(event => {
      const competition = event.competitions?.[0] || {};
      const home = espnTeam(competition, "home");
      const away = espnTeam(competition, "away");
      const slug = String(event?.season?.slug || "");
      const round = espnArgentinaRound(event, regularIndexes[slug] || 0);
      if (Object.prototype.hasOwnProperty.call(regularIndexes, slug)) regularIndexes[slug] += 1;
      return {
        id: `espn-${event.id}`,
        home: espnTeamName(home),
        away: espnTeamName(away),
        homeCrest: espnTeamLogo(home),
        awayCrest: espnTeamLogo(away),
        startsAt: event.date || "",
        round
      };
    })
    .filter(match => match.home && match.away);
}

function espnArgentinaTeamsFromFixtures(fixtures = []) {
  return [...new Set(fixtures.flatMap(match => [match.home, match.away]).filter(Boolean))].slice(0, 64);
}

async function fetchEspnArgentinaEvents() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard?dates=20260101-20261231&limit=500";
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ESPN Argentina ${response.status}: ${text.slice(0, 180)}`);
  }
  const data = await response.json();
  return Array.isArray(data.events) ? data.events : [];
}

async function syncArgentinaApiResults(store, tournament) {
  const events = await fetchEspnArgentinaEvents();
  const apiFixtures = espnArgentinaFixtures(events);
  if (apiFixtures.length) {
    const template = tournamentTemplate(tournament);
    tournament.customTemplate = {
      ...(tournament.customTemplate || {}),
      name: template.name,
      mode: "fixture",
      teams: espnArgentinaTeamsFromFixtures(apiFixtures),
      fixtures: apiFixtures,
      timing: tournamentTiming(tournament)
    };
    tournament.mode = "fixture";
  }
  const updatedAt = new Date().toISOString();
  const now = Date.now();
  const previous = tournament.realResults?.custom?.matches || {};
  const matches = withoutFutureApiResults(previous, apiFixtures, now);
  let imported = 0;
  events.forEach(event => {
    const status = event.status?.type || {};
    if (!status.completed || !dateIsNotInFuture(event.date, now)) return;
    const competition = event.competitions?.[0] || {};
    const home = espnTeam(competition, "home");
    const away = espnTeam(competition, "away");
    const homeScore = Number(home?.score);
    const awayScore = Number(away?.score);
    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return;
    const homeName = espnTeamName(home);
    const awayName = espnTeamName(away);
    const winner = home?.winner ? homeName : away?.winner ? awayName : homeScore === awayScore ? "draw" : homeScore > awayScore ? homeName : awayName;
    imported += 1;
    const matchId = `espn-${event.id}`;
    const nextMatch = {
      homeScore,
      awayScore,
      winner,
      source: "ESPN",
      apiMatchId: event.id,
      status: status.description || status.name || "",
      updatedAt,
      finishedAt: ""
    };
    nextMatch.finishedAt = status.completed ? apiResultFinishedAt(previous[matchId], nextMatch, estimatedFinishedAt(event.date, updatedAt)) : "";
    matches[matchId] = nextMatch;
  });
  tournament.realResults = {
    ...(tournament.realResults || {}),
    custom: {
      ...(tournament.realResults?.custom || {}),
      matches,
      champion: tournament.realResults?.custom?.champion || ""
    },
    apiSource: {
      provider: "ESPN",
      competitionCode: "arg.1",
      season: "2026",
      syncedAt: updatedAt,
      fixtures: apiFixtures.length,
      matched: imported,
      imported
    },
    updatedAt
  };
  tournament.realResultsUpdatedAt = updatedAt;
  return { provider: "ESPN", competitionCode: "arg.1", season: "2026", fixtures: apiFixtures.length, matched: imported, imported };
}

function normalizeTeamKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|afc|sc|club|de|the)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function teamLooksLike(source, target) {
  const left = normalizeTeamKey(source);
  const right = normalizeTeamKey(target);
  return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
}

function footballDataMatchTeams(match) {
  return {
    home: match?.homeTeam?.name || match?.homeTeam?.shortName || match?.homeTeam?.tla || "",
    away: match?.awayTeam?.name || match?.awayTeam?.shortName || match?.awayTeam?.tla || ""
  };
}

function footballDataMatchRound(match) {
  const stage = safeText(match?.stage, 40);
  const knockoutStageNames = {
    PLAYOFFS: "Playoff knockout",
    PLAY_OFFS: "Playoff knockout",
    KNOCKOUT_ROUND_PLAY_OFFS: "Playoff knockout",
    LAST_16: "Octavos de final",
    QUARTER_FINALS: "Cuartos de final",
    SEMI_FINALS: "Semifinales",
    THIRD_PLACE: "Tercer puesto",
    FINAL: "Final"
  };
  if (knockoutStageNames[stage]) {
    if (stage === "FINAL" || stage === "THIRD_PLACE") return knockoutStageNames[stage];
    if (Number(match?.matchday) === 1) return `${knockoutStageNames[stage]} - Ida`;
    if (Number(match?.matchday) === 2) return `${knockoutStageNames[stage]} - Vuelta`;
    return knockoutStageNames[stage];
  }
  if (match?.matchday) return `Fecha ${match.matchday}`;
  return stage || safeText(match?.group, 40) || "Partidos";
}

function footballDataFixtures(apiMatches = []) {
  return apiMatches
    .map(match => {
      const teams = footballDataMatchTeams(match);
      return {
        id: `fd-${match.id}`,
        home: teams.home,
        away: teams.away,
        homeCrest: match?.homeTeam?.crest || "",
        awayCrest: match?.awayTeam?.crest || "",
        startsAt: match.utcDate || "",
        round: footballDataMatchRound(match)
      };
    })
    .filter(match => match.home && match.away)
    .slice(0, 380);
}

function footballDataTeamsFromFixtures(fixtures = []) {
  return [...new Set(fixtures.flatMap(match => [match.home, match.away]).filter(Boolean))].slice(0, 64);
}

function matchFixtureToApiResult(fixtureItem, apiMatches) {
  const directId = String(fixtureItem.id || "").replace(/^fd-/, "");
  return (apiMatches || []).find(match => String(match.id) === directId) || (apiMatches || []).find(match => {
    const teams = footballDataMatchTeams(match);
    return teamLooksLike(teams.home, fixtureItem.home) && teamLooksLike(teams.away, fixtureItem.away);
  }) || null;
}

function dateIsNotInFuture(value, now = Date.now()) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= now;
}

function withoutFutureApiResults(previousMatches = {}, fixtures = [], now = Date.now()) {
  const matches = { ...(previousMatches || {}) };
  fixtures.forEach(fixture => {
    if (dateIsNotInFuture(fixture.startsAt, now)) return;
    const match = matches[fixture.id];
    if (match?.source === "football-data.org" || match?.source === "ESPN") delete matches[fixture.id];
  });
  return matches;
}

function apiResultFinishedAt(previousMatch, nextMatch, fallback) {
  const previousFinishedAt = previousMatch?.finishedAt || "";
  const sameScore = previousMatch &&
    Number(previousMatch.homeScore) === Number(nextMatch.homeScore) &&
    Number(previousMatch.awayScore) === Number(nextMatch.awayScore) &&
    String(previousMatch.winner || "") === String(nextMatch.winner || "");
  const previousIsSyncTime = previousFinishedAt && previousMatch?.updatedAt && previousFinishedAt === previousMatch.updatedAt;
  return sameScore && previousFinishedAt && !previousIsSyncTime ? previousFinishedAt : fallback;
}

function estimatedFinishedAt(startsAt, fallback, matchMinutes = 120) {
  const start = new Date(startsAt || "").getTime();
  const fallbackTime = new Date(fallback || "").getTime();
  if (!Number.isFinite(start)) return fallback;
  const estimated = new Date(start + Number(matchMinutes || 120) * 60000).toISOString();
  if (Number.isFinite(fallbackTime) && new Date(estimated).getTime() > fallbackTime) return fallback;
  return estimated;
}

async function fetchFootballDataMatches({ code, season }) {
  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.FOOTBALLDATA_TOKEN || "";
  if (!token) throw new Error("FOOTBALL_DATA_TOKEN is not configured");
  const url = new URL(`https://api.football-data.org/v4/competitions/${encodeURIComponent(code)}/matches`);
  if (season) url.searchParams.set("season", season);
  const response = await fetch(url, { headers: { "X-Auth-Token": token } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Football-Data ${response.status}: ${text.slice(0, 180)}`);
  }
  const data = await response.json();
  return Array.isArray(data.matches) ? data.matches : [];
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
  // Collect official results already loaded for this tournament (from the global store)
  const officialMatches = tournament?.realResults?.custom?.matches || {};
  // DEBUG
  console.log("[DEBUG lock] officialMatches keys:", Object.keys(officialMatches));
  console.log("[DEBUG lock] incomingMatches keys:", Object.keys(incomingMatches));
  fixtures.forEach(match => {
    const official = officialMatches[match.id];
    const hasOfficialResult =
      official &&
      official.homeScore !== undefined && official.homeScore !== "" &&
      official.awayScore !== undefined && official.awayScore !== "";
    const timeLocked = customMatchLocked(match, timing);
    console.log(`[DEBUG lock] match=${match.id} hasOfficialResult=${hasOfficialResult} timeLocked=${timeLocked} official=`, official);
    if (hasOfficialResult || timeLocked) {
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

function passwordResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function resetExpiryDate() {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

function verifyPassword(password, user) {
  if (!user?.password?.salt || !user?.password?.hash) return false;
  return crypto.timingSafeEqual(
    Buffer.from(user.password.hash, "hex"),
    Buffer.from(passwordHash(password, user.password.salt), "hex")
  );
}

function syncPasswordAcrossScopes(store, email, passwordRecord) {
  const normalized = normalizeEmail(email);
  if (!normalized || !passwordRecord?.salt || !passwordRecord?.hash) return;
  if (store.users?.[normalized]) {
    store.users[normalized].password = passwordRecord;
    store.users[normalized].updatedAt = new Date().toISOString();
  }
  Object.values(store.tenants || {}).forEach((tenantData) => {
    const tenantUser = tenantData?.users?.[normalized];
    if (tenantUser) {
      tenantUser.password = passwordRecord;
      tenantUser.updatedAt = new Date().toISOString();
    }
  });
}

function findTenantUserWithPassword(store, email, password) {
  const normalized = normalizeEmail(email);
  for (const tenantData of Object.values(store.tenants || {})) {
    const tenantUser = tenantData?.users?.[normalized];
    if (tenantUser && verifyPassword(password, tenantUser)) return tenantUser;
  }
  return null;
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

function dateKeyInTimezone(date = new Date(), timeZone = process.env.REMINDER_TIMEZONE || "America/Argentina/Buenos_Aires") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function reminderKey(phaseId, now = new Date()) {
  return `${dateKeyInTimezone(now)}:${phaseId}`;
}

function dueReminderPhases(now = new Date()) {
  const today = dateKeyInTimezone(now);
  return configuredPhaseSchedule()
    .map(item => ({
      ...item,
      id: normalizePhaseId(item.id)
    }))
    .filter(item => {
      if (!item.id || item.id === "all") return false;
      if (item.date) {
        return String(item.date).slice(0, 10) === today;
      }
      if (item.startAt) {
        return dateKeyInTimezone(new Date(item.startAt)) === today;
      }
      return false;
    });
}

function tournamentReminderRecipients(store, tournament) {
  const recipients = new Map();
  function add(user, extra = {}) {
    const email = normalizeEmail(user?.email || extra.email);
    if (!email) return;
    if (user?.active === false) return;
    const previous = recipients.get(email) || {};
    recipients.set(email, {
      email,
      name: user?.name || previous.name || "",
      continuationToken: extra.continuationToken || previous.continuationToken || ""
    });
  }
  // Usuarios que ya guardaron predicción
  for (const submission of tournament.submissions || []) {
    add(submission.player, {
      continuationToken: submission.continuationToken
    });
  }
  // Torneo global: todos los usuarios globales registrados
  if (tournament.isGlobal) {
    for (const [email, user] of Object.entries(store.users || {})) {
      add({ ...user, email });
    }
  }
  // Torneo de empresa: todos los usuarios registrados en esa empresa
  if (tournament.tenantId) {
    const tenantData = store.tenants?.[tournament.tenantId];
    for (const [email, user] of Object.entries(tenantData?.users || {})) {
      add({ ...user, email });
    }
  }
  // Torneos privados desbloqueados desde el lobby
  for (const [email, accessByTournament] of Object.entries(store.tournamentAccess || {})) {
    if (accessByTournament?.[tournament.id]?.grantedAt) {
      add(store.users?.[email] || { email });
    }
  }
  return [...recipients.values()];
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

const WORLD_CUP_MONTH_MAP = { "Jun": "06", "Jul": "07" };
function isWorldCupMatchTimeLocked(id) {
  const KNOCKOUT_SCHEDULE = {
    m73: { date: "28 de Jun", time: "16:00" }, m74: { date: "29 de Jun", time: "16:00" }, m75: { date: "29 de Jun", time: "16:00" }, m76: { date: "29 de Jun", time: "16:00" },
    m77: { date: "30 de Jun", time: "13:00" }, m78: { date: "30 de Jun", time: "16:00" }, m79: { date: "30 de Jun", time: "19:00" }, m80: { date: "1 de Jul", time: "14:00" },
    m81: { date: "1 de Jul", time: "17:00" }, m82: { date: "1 de Jul", time: "20:00" }, m83: { date: "2 de Jul", time: "14:00" }, m84: { date: "2 de Jul", time: "17:00" },
    m85: { date: "2 de Jul", time: "20:00" }, m86: { date: "3 de Jul", time: "16:00" }, m87: { date: "3 de Jul", time: "19:00" }, m88: { date: "3 de Jul", time: "22:00" },
    m89: { date: "4 de Jul", time: "16:00" }, m90: { date: "4 de Jul", time: "16:00" }, m91: { date: "5 de Jul", time: "16:00" }, m92: { date: "5 de Jul", time: "16:00" },
    m93: { date: "6 de Jul", time: "14:00" }, m94: { date: "6 de Jul", time: "17:00" }, m95: { date: "7 de Jul", time: "14:00" }, m96: { date: "7 de Jul", time: "17:00" },
    m97: { date: "9 de Jul", time: "16:00" }, m98: { date: "10 de Jul", time: "16:00" }, m99: { date: "11 de Jul", time: "14:00" }, m100: { date: "11 de Jul", time: "17:00" },
    m101: { date: "14 de Jul", time: "15:00" }, m102: { date: "15 de Jul", time: "15:00" }, m103: { date: "18 de Jul", time: "15:00" }, m104: { date: "19 de Jul", time: "15:00" }
  };
  const GROUP_SCHEDULE = {
    "A-0-2": { date: "11 de Jun", time: "16:00" }, "A-1-3": { date: "11 de Jun", time: "23:00" }, "B-0-3": { date: "12 de Jun", time: "16:00" }, "D-0-1": { date: "12 de Jun", time: "22:00" },
    "B-2-1": { date: "13 de Jun", time: "16:00" }, "C-0-1": { date: "13 de Jun", time: "19:00" }, "C-3-2": { date: "13 de Jun", time: "22:00" }, "D-2-3": { date: "14 de Jun", time: "01:00" },
    "E-0-3": { date: "14 de Jun", time: "14:00" }, "F-0-1": { date: "14 de Jun", time: "17:00" }, "E-2-1": { date: "14 de Jun", time: "20:00" }, "F-3-2": { date: "14 de Jun", time: "23:00" },
    "H-0-3": { date: "15 de Jun", time: "13:00" }, "G-0-2": { date: "15 de Jun", time: "16:00" }, "H-2-1": { date: "15 de Jun", time: "19:00" }, "G-1-3": { date: "15 de Jun", time: "22:00" },
    "I-0-1": { date: "16 de Jun", time: "16:00" }, "I-3-2": { date: "16 de Jun", time: "19:00" }, "J-0-2": { date: "16 de Jun", time: "22:00" }, "J-1-3": { date: "17 de Jun", time: "01:00" },
    "K-0-3": { date: "17 de Jun", time: "14:00" }, "L-0-1": { date: "17 de Jun", time: "17:00" }, "L-2-3": { date: "17 de Jun", time: "20:00" }, "K-2-1": { date: "17 de Jun", time: "23:00" },
    "A-3-2": { date: "18 de Jun", time: "13:00" }, "B-1-3": { date: "18 de Jun", time: "16:00" }, "B-0-2": { date: "18 de Jun", time: "19:00" }, "A-0-1": { date: "18 de Jun", time: "22:00" },
    "D-0-2": { date: "19 de Jun", time: "16:00" }, "C-2-1": { date: "19 de Jun", time: "19:00" }, "C-0-3": { date: "19 de Jun", time: "22:00" }, "D-3-1": { date: "20 de Jun", time: "01:00" },
    "F-0-3": { date: "20 de Jun", time: "14:00" }, "E-0-2": { date: "20 de Jun", time: "17:00" }, "E-1-3": { date: "20 de Jun", time: "23:00" }, "F-2-1": { date: "21 de Jun", time: "01:00" },
    "H-0-2": { date: "21 de Jun", time: "13:00" }, "G-0-1": { date: "21 de Jun", time: "16:00" }, "H-1-3": { date: "21 de Jun", time: "19:00" }, "G-3-2": { date: "21 de Jun", time: "22:00" },
    "J-0-1": { date: "22 de Jun", time: "14:00" }, "I-0-3": { date: "22 de Jun", time: "18:00" }, "I-2-1": { date: "22 de Jun", time: "21:00" }, "J-3-2": { date: "23 de Jun", time: "00:00" },
    "K-0-2": { date: "23 de Jun", time: "14:00" }, "L-0-2": { date: "23 de Jun", time: "17:00" }, "L-3-1": { date: "23 de Jun", time: "20:00" }, "K-1-3": { date: "23 de Jun", time: "23:00" },
    "B-1-0": { date: "24 de Jun", time: "16:00" }, "B-3-2": { date: "24 de Jun", time: "16:00" }, "C-2-0": { date: "24 de Jun", time: "19:00" }, "C-1-3": { date: "24 de Jun", time: "19:00" },
    "A-3-0": { date: "24 de Jun", time: "22:00" }, "A-2-1": { date: "24 de Jun", time: "22:00" }, "E-3-2": { date: "25 de Jun", time: "17:00" }, "E-1-0": { date: "25 de Jun", time: "17:00" },
    "F-1-3": { date: "25 de Jun", time: "20:00" }, "F-2-0": { date: "25 de Jun", time: "20:00" }, "D-1-2": { date: "25 de Jun", time: "23:00" }, "D-3-0": { date: "25 de Jun", time: "23:00" },
    "I-2-0": { date: "26 de Jun", time: "16:00" }, "I-1-3": { date: "26 de Jun", time: "16:00" }, "H-3-2": { date: "26 de Jun", time: "21:00" }, "H-1-0": { date: "26 de Jun", time: "21:00" },
    "G-2-1": { date: "27 de Jun", time: "00:00" }, "G-3-0": { date: "27 de Jun", time: "00:00" }, "L-3-0": { date: "27 de Jun", time: "18:00" }, "L-1-2": { date: "27 de Jun", time: "18:00" },
    "K-1-0": { date: "27 de Jun", time: "20:30" }, "K-3-2": { date: "27 de Jun", time: "20:30" }, "J-2-1": { date: "27 de Jun", time: "23:00" }, "J-3-0": { date: "27 de Jun", time: "23:00" }
  };
  const match = KNOCKOUT_SCHEDULE[id] || GROUP_SCHEDULE[id];
  if (!match || !match.date || !match.time) return false;
  const parts = match.date.split(" de ");
  const day = parts[0].padStart(2, "0");
  const month = WORLD_CUP_MONTH_MAP[parts[1]];
  if (!month) return false;
  const startsAt = new Date(`2026-${month}-${day}T${match.time}:00-03:00`);
  if (Number.isNaN(startsAt.getTime())) return false;
  return Date.now() >= startsAt.getTime() - 30 * 60000;
}


const CHAMPION_PICK_DEADLINE = new Date("2026-06-28T15:00:00-03:00");
function isChampionPickLocked() {
  return Date.now() >= CHAMPION_PICK_DEADLINE.getTime();
}
function mergeChampionPick(merged, previousPrediction, incomingPrediction) {
  if (!merged.winners) merged.winners = {};
  const incomingChampion = incomingPrediction?.winners?.m104 || "";
  if (incomingChampion && !isChampionPickLocked()) {
    merged.winners.m104 = incomingChampion;
  } else if (previousPrediction?.winners?.m104 && !merged.winners.m104) {
    merged.winners.m104 = previousPrediction.winners.m104;
  }
}

function mergePredictionByPhase(previousPrediction, incomingPrediction, phaseId, tournament = null) {
  const phase = phaseById(phaseId);
  // CORRECCIÓN: Validar que realmente sea una plantilla personalizada con partidos configurados
  if (!previousPrediction || phase.id === "all" || (incomingPrediction?.custom && Object.keys(incomingPrediction.custom.matches || {}).length > 0)) return incomingPrediction;

  const merged = previousPrediction ? JSON.parse(JSON.stringify(previousPrediction)) : {
    groups: {}, groupMatches: {}, thirdAssignments: {}, winners: {}, scores: {}, custom: {}
  };
  const realResults = tournament?.realResults || {};

  if (phase.type === "groups") {
    if (!merged.groupMatches) merged.groupMatches = {};
    const groupMatchIds = groupMatchIdsForPhase(phase.id);
    if (groupMatchIds.length) {
      groupMatchIds.forEach(id => {
        const isPlayed = realResults.groupMatches?.[id]?.home !== "" && realResults.groupMatches?.[id]?.home !== undefined &&
          realResults.groupMatches?.[id]?.away !== "" && realResults.groupMatches?.[id]?.away !== undefined;
        const timeLocked = isWorldCupMatchTimeLocked(id);
        if (!isPlayed && !timeLocked && incomingPrediction.groupMatches?.[id]) {
          merged.groupMatches[id] = incomingPrediction.groupMatches[id];
        }
      });
    }
    mergeChampionPick(merged, previousPrediction, incomingPrediction);
    return merged;
  }
  if (phase.type === "matches") {
    if (phase.id === "r32") merged.thirdAssignments = incomingPrediction.thirdAssignments || merged.thirdAssignments || {};

    copyMatchFields(merged, incomingPrediction, phase.matchIds);

    (phase.matchIds || []).forEach(id => {
      const isPlayed = (realResults.scores?.[id]?.left !== "" && realResults.scores?.[id]?.left !== undefined &&
        realResults.scores?.[id]?.right !== "" && realResults.scores?.[id]?.right !== undefined) ||
        (realResults.winners?.[id] && realResults.winners?.[id] !== "");
      const timeLocked = isWorldCupMatchTimeLocked(id);
      if (isPlayed || timeLocked) {
        if (previousPrediction.scores?.[id]) {
          if (!merged.scores) merged.scores = {};
          merged.scores[id] = previousPrediction.scores[id];
        }
        if (previousPrediction.winners?.[id]) {
          if (!merged.winners) merged.winners = {};
          merged.winners[id] = previousPrediction.winners[id];
        }
      }
    });

    mergeChampionPick(merged, previousPrediction, incomingPrediction);
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
  // CORRECCIÓN: Verificar que tenga partidos personalizados cargados
  if (real.custom && Object.keys(real.custom.matches || {}).length > 0) {
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
    templates: TOURNAMENT_TEMPLATES.map(publicCompetitionTemplate),
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
        const tenantPasswordUser = findTenantUserWithPassword(store, email, password);
        if (tenantPasswordUser?.password) {
          syncPasswordAcrossScopes(store, email, tenantPasswordUser.password);
        } else {
          send(res, 401, JSON.stringify({ error: "Invalid email or password" }));
          return;
        }
      }
    } else if (!name) {
      send(res, 400, JSON.stringify({ error: "Name is required for first login" }));
      return;
    }
    const finalName = previousUser?.name || name;
    const token = randomSecret();
    const role = userRole(null, { ...(previousUser || {}), email });
    store.users[email] = {
      ...(previousUser || {}),
      name: finalName,
      email,
      active: previousUser?.active !== false,
      role,
      ...publicUserFlags(role),
      password: previousUser?.password || createPasswordRecord(password),
      updatedAt: new Date().toISOString(),
      createdAt: previousUser?.createdAt || new Date().toISOString()
    };
    syncPasswordAcrossScopes(store, email, store.users[email].password);
    store.globalSessions[token] = email;
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      token,
      user: { name: finalName, email, avatar: store.users[email]?.avatar || "", profileBorder: store.users[email]?.profileBorder || "", role, ...publicUserFlags(role) },
      templates: TOURNAMENT_TEMPLATES.map(publicCompetitionTemplate),
      tournaments: ["global", ...Object.keys(TENANTS).map(tenantTournamentId)]
        .map(id => store.tournaments.find(tournament => tournament.id === id))
        .filter(Boolean)
        .map(tournament => publicLobbyTournament(store, tournament, { email }))
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleRegistrarGlobal(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const name = safeText(body.name, 100);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!email || !password || !name) {
      send(res, 400, JSON.stringify({ error: "Nombre, email/DNI y contraseña son obligatorios." }));
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      send(res, 400, JSON.stringify({ error: "La contraseña no cumple con los requisitos de seguridad." }));
      return;
    }
    const store = readStore();
    if (store.users[email]) {
      send(res, 409, JSON.stringify({ error: "El usuario ya existe. Intenta iniciar sesión." }));
      return;
    }
    const token = randomSecret();
    const role = userRole(null, { email });
    store.users[email] = {
      name,
      email,
      active: true,
      role,
      ...publicUserFlags(role),
      password: createPasswordRecord(password),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    store.globalSessions[token] = email;
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      token,
      user: { name, email, role, ...publicUserFlags(role) },
      templates: TOURNAMENT_TEMPLATES.map(publicCompetitionTemplate),
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
    const templateId = slug(body.templateId || "worldcup-2026");
    const competitionTemplate = TOURNAMENT_TEMPLATES.find(item => item.id === templateId) || TOURNAMENT_TEMPLATES[0];
    const baseTenant = TENANTS.acme;
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
    const accessMode = body.accessMode === "code" ? "code" : "account";
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
      templateId: "acme-private-shell",
      competitionTemplateId: competitionTemplate.id,
      name,
      displayName: name,
      eyebrow: baseTenant.eyebrow,
      title: `Prode ${name}`,
      description: `Predicciones y ranking exclusivo para ${name}.`,
      areas: [...(baseTenant.areas || [])],
      users: {},
      sessions: {},
      theme: { ...(baseTenant.theme || {}) },
      baseTheme: { ...(baseTenant.theme || {}) },
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
      accessMode,
      createdAt: now,
      realResults: null,
      templateId: competitionTemplate.id,
      mode: competitionTemplate.mode,
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
    ensureBaseAdminMemberships(store);
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

    let tenantSession = null;
    if (tournament.tenantId && tournamentAccessMode(tournament) === "account") {
      const tenant = tenantFromValue(tournament.tenantId);
      const tenantData = tenantStore(store, tenant.id);
      const email = normalizeEmail(user.email);
      const globalUserRecord = store.users?.[email] || null;
      let tenantUser = tenantData.users[email] || null;
      const role = userRole(tenant.id, { ...(tenantUser || {}), email });
      const approvalStatus = tenantUser?.approvalStatus || (canApproveCompanyRequestsRole(role) ? "approved" : "pending");

      if (!tenantUser) {
        tenantUser = tenantData.users[email] = {
          name: user.name || "",
          email,
          area: "General",
          active: true,
          approvalStatus,
          role,
          isAdmin: isAdminRole(role),
          isEmpresario: role === "empresario",
          password: globalUserRecord?.password || createPasswordRecord(""),
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
      } else {
        tenantUser.name = tenantUser.name || user.name || "";
        tenantUser.email = email;
        tenantUser.area = tenantUser.area || "General";
        tenantUser.active = tenantUser.active !== false;
        tenantUser.role = role;
        tenantUser.isAdmin = isAdminRole(role);
        tenantUser.isEmpresario = role === "empresario";
        tenantUser.approvalStatus = approvalStatus;
        tenantUser.updatedAt = new Date().toISOString();
      }

      if (tenantUser.active === false || approvalStatus === "rejected") {
        writeStore(store);
        send(res, 403, JSON.stringify({ error: "Tu solicitud de ingreso a la empresa fue rechazada." }));
        return;
      }
      if (approvalStatus === "pending") {
        writeStore(store);
        send(res, 202, JSON.stringify({
          ok: true,
          pendingApproval: true,
          message: "Solicitud enviada. Un empresario o administrador debe aprobar tu ingreso antes de jugar.",
          tournament: publicLobbyTournament(store, tournament, user)
        }));
        return;
      }

      const token = randomSecret();
      tenantData.sessions[token] = email;
      tenantSession = { token, user: { name: tenantUser.name || user.name || "", email, area: tenantUser.area || "", avatar: tenantUser.avatar || store.users?.[email]?.avatar || "", profileBorder: tenantUser.profileBorder || store.users?.[email]?.profileBorder || "", role, ...publicUserFlags(role) } };
    }

    accessMapFor(store, user.email)[tournament.id] = {
      tournamentId: tournament.id,
      grantedAt: new Date().toISOString(),
      grantedByPassword: true
    };
    syncGlobalSubmissionToTournament(store, user.email, tournament);
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, tournament: publicLobbyTournament(store, tournament, user), tenantSession }));
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
    const area = normalizeAreaName(body.area) || "General";
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
    const globalUser = store.users?.[email] || null;
    const loginFromGlobal = !previousUser && globalUser && verifyPassword(password, globalUser);
    const role = userRole(tenant.id, { ...(previousUser || {}), email });
    const isAdmin = isAdminRole(role);

    if (previousUser) {
      const approvalStatus = approvalStatusFor(previousUser, role);
      if (previousUser.active === false) {
        send(res, 403, JSON.stringify({ error: "User is disabled" }));
        return;
      }
      if (approvalStatus === "pending") {
        send(res, 403, JSON.stringify({ error: "Tu solicitud de ingreso a la empresa esta pendiente de aprobacion." }));
        return;
      }
      if (approvalStatus === "rejected") {
        send(res, 403, JSON.stringify({ error: "Tu solicitud de ingreso a la empresa fue rechazada." }));
        return;
      }
      if (!verifyPassword(password, previousUser)) {
        if (globalUser && verifyPassword(password, globalUser)) {
          previousUser.password = globalUser.password;
        } else {
          send(res, 401, JSON.stringify({ error: "Invalid email or password" }));
          return;
        }
      }
    } else if (!loginFromGlobal && (!name)) {
      send(res, 400, JSON.stringify({ error: "Se requiere el nombre para el primer login" }));
      return;
    }

    const finalName = previousUser?.name || (loginFromGlobal ? globalUser.name : name);
    const finalArea = previousUser?.area || area || "";
    if (finalArea && !tenantData.areas.some(item => areaId(item) === areaId(finalArea))) tenantData.areas.push(finalArea);

    const approvalStatus = previousUser?.approvalStatus || (canApproveCompanyRequestsRole(role) ? "approved" : "pending");
    tenantData.users[email] = {
      ...(previousUser || {}),
      name: finalName,
      email,
      area: finalArea,
      active: previousUser?.active !== false,
      approvalStatus,
      role,
      isAdmin,
      isEmpresario: role === "empresario",
      password: previousUser?.password || (loginFromGlobal ? globalUser.password : createPasswordRecord(password)),
      updatedAt: new Date().toISOString(),
      createdAt: previousUser?.createdAt || new Date().toISOString()
    };
    syncPasswordAcrossScopes(store, email, tenantData.users[email].password);

    if (approvalStatus !== "approved") {
      if (!store.users[email]) {
        const globalRole = userRole(null, { email });
        store.users[email] = {
          name: finalName,
          email,
          active: true,
          role: globalRole,
          ...publicUserFlags(globalRole),
          password: tenantData.users[email].password,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
      }
      writeStore(store);
      send(res, 202, JSON.stringify({
        ok: true,
        pendingApproval: true,
        message: "Solicitud enviada. Un empresario o administrador debe aprobar tu ingreso antes de jugar.",
        tenant: publicTenant(tenant, tenantData)
      }));
      return;
    }

    const token = randomSecret();
    tenantData.sessions[token] = email;
    const globalToken = randomSecret();
    if (!store.users[email]) {
      const globalRole = userRole(null, { email });
      store.users[email] = {
        name: finalName,
        email,
        active: true,
        role: globalRole,
        ...publicUserFlags(globalRole),
        password: tenantData.users[email].password,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    }
    store.globalSessions[globalToken] = email;
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      token,
      globalToken,
      user: { name: finalName, email, area: finalArea, avatar: tenantData.users[email]?.avatar || store.users?.[email]?.avatar || "", profileBorder: tenantData.users[email]?.profileBorder || store.users?.[email]?.profileBorder || "", role, ...publicUserFlags(role) },
      dailyGamePlays: currentDailyGamePlays(tenantData, email),
      tenant: publicTenant(tenant, tenantData)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleRegistrarCompany(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const name = String(body.name || "").trim().slice(0, 100);
    const email = normalizeEmail(body.email);
    const area = normalizeAreaName(body.area) || "General";
    const password = String(body.password || "");
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Empresa no encontrada." }));
      return;
    }
    if (!email || !password || !name) {
      send(res, 400, JSON.stringify({ error: "Todos los campos son obligatorios para registrarse." }));
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      send(res, 400, JSON.stringify({ error: "La contraseña no cumple con los requisitos de seguridad." }));
      return;
    }
    const store = readStore();
    const tenantData = tenantStore(store, tenant.id);
    if (tenantData.users[email]) {
      send(res, 409, JSON.stringify({ error: "El usuario ya existe en esta empresa." }));
      return;
    }
    const role = userRole(tenant.id, { email });
    const isAdmin = isAdminRole(role);
    const approvalStatus = canApproveCompanyRequestsRole(role) ? "approved" : "pending";
    if (!tenantData.areas.some(item => areaId(item) === areaId(area))) tenantData.areas.push(area);
    const passwordRecord = createPasswordRecord(password);
    tenantData.users[email] = {
      name,
      email,
      area,
      active: true,
      approvalStatus,
      role,
      isAdmin,
      isEmpresario: role === "empresario",
      password: passwordRecord,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    syncPasswordAcrossScopes(store, email, passwordRecord);
    if (!store.users[email]) {
      const globalRole = userRole(null, { email });
      store.users[email] = {
        name,
        email,
        active: true,
        role: globalRole,
        ...publicUserFlags(globalRole),
        password: passwordRecord,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    } else {
      syncPasswordAcrossScopes(store, email, passwordRecord);
    }

    if (approvalStatus !== "approved") {
      writeStore(store);
      send(res, 202, JSON.stringify({
        ok: true,
        pendingApproval: true,
        message: "Solicitud enviada. Un empresario o administrador debe aprobar tu ingreso antes de jugar.",
        tenant: publicTenant(tenant, tenantData)
      }));
      return;
    }

    const token = randomSecret();
    tenantData.sessions[token] = email;
    const globalToken = randomSecret();
    store.globalSessions[globalToken] = email;
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      token,
      globalToken,
      user: { name, email, area, avatar: tenantData.users[email]?.avatar || store.users?.[email]?.avatar || "", profileBorder: tenantData.users[email]?.profileBorder || store.users?.[email]?.profileBorder || "", role, ...publicUserFlags(role) },
      dailyGamePlays: currentDailyGamePlays(tenantData, email),
      tenant: publicTenant(tenant, tenantData)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleChangePassword(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const { scope, sessionToken, currentPassword, newPassword } = body;
    const store = readStore();

    let email = null;
    let user = null;

    if (scope === "company") {
      for (const tId of Object.keys(store.tenants || {})) {
        if (store.tenants[tId].sessions && store.tenants[tId].sessions[sessionToken]) {
          email = store.tenants[tId].sessions[sessionToken];
          user = store.tenants[tId].users[email];
          break;
        }
      }
    } else {
      email = store.globalSessions?.[sessionToken];
      user = store.users?.[email];
    }

    if (!user) {
      send(res, 401, JSON.stringify({ error: "Sesión inválida o expirada." }));
      return;
    }

    if (!verifyPassword(currentPassword, user)) {
      send(res, 401, JSON.stringify({ error: "La contraseña actual es incorrecta." }));
      return;
    }

    user.password = createPasswordRecord(newPassword);
    user.updatedAt = new Date().toISOString();

    writeStore(store);
    send(res, 200, JSON.stringify({ success: true }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleProfileAvatar(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const avatar = sanitizeAvatarDataUrl(body.avatar);
    const profileBorder = sanitizeProfileBorder(body.profileBorder);
    if (avatar === null) {
      send(res, 400, JSON.stringify({ error: "Formato de imagen no valido o demasiado grande." }));
      return;
    }
    if (profileBorder === null) {
      send(res, 400, JSON.stringify({ error: "Contorno de perfil invalido." }));
      return;
    }
    const store = readStore();
    const tenant = tenantFromValue(body.tenantId);
    const companyUser = tenant ? sessionUser(store, tenant, body.sessionToken) : null;
    const globalUser = globalSessionUser(store, body.globalSessionToken || body.sessionToken);
    const authUser = companyUser || globalUser;
    if (!authUser?.email) {
      send(res, 401, JSON.stringify({ error: "Sesion invalida." }));
      return;
    }
    const email = normalizeEmail(authUser.email);
    const now = new Date().toISOString();
    if (store.users?.[email]) {
      store.users[email].avatar = avatar;
      store.users[email].profileBorder = profileBorder;
      store.users[email].updatedAt = now;
    }
    Object.values(store.tenants || {}).forEach(tenantData => {
      if (tenantData?.users?.[email]) {
        tenantData.users[email].avatar = avatar;
        tenantData.users[email].profileBorder = profileBorder;
        tenantData.users[email].updatedAt = now;
      }
    });
    writeStore(store);
    const freshTenantUser = tenant ? sessionUser(store, tenant, body.sessionToken) : null;
    const freshGlobalUser = globalSessionUser(store, body.globalSessionToken || body.sessionToken);
    send(res, 200, JSON.stringify({
      ok: true,
      avatar,
      profileBorder,
      companyUser: freshTenantUser || null,
      globalUser: freshGlobalUser || null
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleProfileStats(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");
    const tenant = tenantFromValue(url.searchParams.get("tenantId"));
    const store = readStore();
    const companyUser = tenant
      ? sessionUser(store, tenant, url.searchParams.get("sessionToken"))
      : null;
    const globalUser = globalSessionUser(
      store,
      url.searchParams.get("globalSessionToken") || url.searchParams.get("sessionToken"),
    );
    const user = companyUser || globalUser;
    if (!user?.email) {
      send(res, 401, JSON.stringify({ error: "Sesion invalida." }));
      return;
    }
    const points = tenant
      ? totalFanPoints(tenantStore(store, tenant.id).gamePlays, user.email)
      : totalFanPoints(store.globalGamePlays, user.email);
    const rewardName = tenant
      ? publicGames(tenantStore(store, tenant.id)).rewardName
      : globalGames(store).rewardName;
    send(res, 200, JSON.stringify({ ok: true, fanPoints: points, rewardName }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function sendPasswordResetMail({ to, resetUrl }) {
  await transporter.sendMail({
    from: '"Prode Bait" <ba.itsoft26@gmail.com>',
    to,
    subject: "Recuperar contrasena - Prode Bait",
    text: [
      "Recibimos un pedido para cambiar la contrasena de tu usuario.",
      "",
      "Abri este link para crear una contrasena nueva:",
      resetUrl,
      "",
      "El link vence en 1 hora. Si no pediste este cambio, podes ignorar este correo."
    ].join("\n")
  });
  return { sent: true };
}

async function handleRequestPasswordReset(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const email = normalizeEmail(body.email);
    if (!email || !email.includes("@")) {
      send(res, 400, JSON.stringify({ error: "A valid email is required" }));
      return;
    }
    const store = readStore();
    const user = store.users[email];
    let mail = null;
    if (user && user.active !== false) {
      const token = passwordResetToken();
      store.passwordResets[token] = {
        email,
        expiresAt: resetExpiryDate(),
        createdAt: new Date().toISOString()
      };
      Object.entries(store.passwordResets).forEach(([resetToken, reset]) => {
        if (!reset?.expiresAt || new Date(reset.expiresAt).getTime() < Date.now()) delete store.passwordResets[resetToken];
      });
      writeStore(store);
      const resetUrl = `${siteBaseUrl(req)}/reset-password/${encodeURIComponent(token)}`;
      mail = await sendPasswordResetMail({ to: email, resetUrl });
    }
    send(res, 200, JSON.stringify({ ok: true, mail }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleResetPassword(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const token = String(body.token || "").trim();
    const password = String(body.password || "");
    if (!token || password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      send(res, 400, JSON.stringify({ error: "Token and a valid password are required" }));
      return;
    }
    const store = readStore();
    const reset = store.passwordResets?.[token];
    if (!reset || new Date(reset.expiresAt).getTime() < Date.now()) {
      if (reset) {
        delete store.passwordResets[token];
        writeStore(store);
      }
      send(res, 410, JSON.stringify({ error: "Password reset link expired" }));
      return;
    }
    const email = normalizeEmail(reset.email);
    const user = store.users[email];
    if (!user || user.active === false) {
      delete store.passwordResets[token];
      writeStore(store);
      send(res, 404, JSON.stringify({ error: "User not found" }));
      return;
    }
    user.password = createPasswordRecord(password);
    user.updatedAt = new Date().toISOString();
    delete store.passwordResets[token];
    Object.entries(store.globalSessions || {}).forEach(([sessionToken, sessionEmail]) => {
      if (normalizeEmail(sessionEmail) === email) delete store.globalSessions[sessionToken];
    });
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true }));
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
      const store = readStore();
      const admin = requireGlobalAdmin(req, res, store, body.globalSessionToken);
      if (!admin) return;
      if (!admin.isSuperAdmin && admin.role !== "superadmin") {
        send(res, 403, JSON.stringify({ error: "Superadmin required" }));
        return;
      }
      if (!email) {
        send(res, 400, JSON.stringify({ error: "User email is required" }));
        return;
      }
      const user = store.users[email];
      if (!user) {
        send(res, 404, JSON.stringify({ error: "User not found" }));
        return;
      }
      const name = String(body.name || "").trim().slice(0, 100);
      if (!name) {
        send(res, 400, JSON.stringify({ error: "Name is required" }));
        return;
      }
      const requestedRole = normalizeEditableCompanyRole(body.role, body.isAdmin);
      user.name = name;
      user.active = body.active !== false;
      user.role = requestedRole;
      if (email === normalizeEmail(admin.email)) {
        user.role = "superadmin";
        user.active = true;
      }
      Object.assign(user, publicUserFlags(user.role));
      user.updatedAt = new Date().toISOString();
      if (!user.active) {
        Object.entries(store.globalSessions || {}).forEach(([token, sessionEmail]) => {
          if (normalizeEmail(sessionEmail) === email) delete store.globalSessions[token];
        });
      }
      writeStore(store);
      send(res, 200, JSON.stringify({
        ok: true,
        user: { name: user.name, email: user.email || email, active: user.active !== false, role: user.role, isAdmin: user.isAdmin, isSuperAdmin: user.role === "superadmin" }
      }));
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
    const area = normalizeAreaName(body.area) || "General";
    if (!name) {
      send(res, 400, JSON.stringify({ error: "Name required" }));
      return;
    }
    const active = body.active !== false;
    const requestedRole = normalizeEditableCompanyRole(body.role, body.isAdmin);
    const currentRole = userRole(tenant.id, { ...user, email });
    const nextRole = isSuperAdminEmail(tenant.id, email) ? "superadmin" : requestedRole;
    if (nextRole !== currentRole && !requireSuperAdmin(req, res, tenant, body.sessionToken, body.globalSessionToken)) return;
    user.name = name;
    user.area = area;
    user.active = active;
    user.role = nextRole;
    user.isAdmin = isAdminRole(user.role);
    user.isEmpresario = user.role === "empresario";
    if (canApproveCompanyRequestsRole(user.role)) user.approvalStatus = "approved";
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


async function handleReviewCompanyJoinRequest(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const email = normalizeEmail(body.email);
    const action = String(body.action || "").trim().toLowerCase();
    if (!tenant) {
      send(res, 404, JSON.stringify({ error: "Empresa no encontrada." }));
      return;
    }
    if (!email || !["approve", "reject"].includes(action)) {
      send(res, 400, JSON.stringify({ error: "Email y accion son obligatorios." }));
      return;
    }
    const reviewer = requireCompanyApprover(req, res, tenant, body.sessionToken, body.globalSessionToken);
    if (!reviewer) return;
    const store = readStore();
    const tenantData = tenantStore(store, tenant.id);
    const user = tenantData.users[email];
    if (!user) {
      send(res, 404, JSON.stringify({ error: "User not found" }));
      return;
    }
    const targetRole = userRole(tenant.id, { ...user, email });
    if (canApproveCompanyRequestsRole(targetRole) && !reviewer.isSuperAdmin) {
      send(res, 403, JSON.stringify({ error: "Solo un superadmin puede revisar cuentas con permisos especiales." }));
      return;
    }
    const now = new Date().toISOString();
    user.reviewedAt = now;
    user.reviewedBy = reviewer.email;
    user.updatedAt = now;
    if (action === "approve") {
      user.active = true;
      user.approvalStatus = "approved";
      user.rejectedAt = "";
      user.approvedAt = now;
      const tournamentId = tenantTournamentId(tenant.id);
      accessMapFor(store, email)[tournamentId] = {
        tournamentId,
        grantedAt: now,
        grantedByPassword: false,
        grantedByApproval: true,
        grantedBy: reviewer.email
      };
    } else {
      user.approvalStatus = "rejected";
      user.rejectedAt = now;
      user.approvedAt = "";
      Object.entries(tenantData.sessions || {}).forEach(([token, sessionEmail]) => {
        if (normalizeEmail(sessionEmail) === email) delete tenantData.sessions[token];
      });
      const tournamentId = tenantTournamentId(tenant.id);
      if (store.tournamentAccess?.[email]) delete store.tournamentAccess[email][tournamentId];
    }
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      user: {
        name: user.name || "",
        email: user.email || email,
        area: user.area || "",
        active: user.active !== false,
        approvalStatus: approvalStatusFor(user, targetRole),
        role: targetRole,
        ...publicUserFlags(targetRole)
      },
      tenant: publicTenant(tenant, tenantData)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleAdminDeleteUser(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const email = normalizeEmail(body.email);
    if (!email) {
      send(res, 400, JSON.stringify({ error: "User email is required" }));
      return;
    }
    const store = readStore();

    if (!tenant) {
      const admin = requireGlobalAdmin(req, res, store, body.globalSessionToken);
      if (!admin) return;
      if (!admin.isSuperAdmin && admin.role !== "superadmin") {
        send(res, 403, JSON.stringify({ error: "Superadmin required" }));
        return;
      }
      const user = store.users[email];
      if (!user) {
        send(res, 404, JSON.stringify({ error: "User not found" }));
        return;
      }
      if (email === normalizeEmail(admin.email)) {
        send(res, 403, JSON.stringify({ error: "Cannot delete yourself" }));
        return;
      }

      delete store.users[email];
      Object.entries(store.globalSessions || {}).forEach(([token, sessionEmail]) => {
        if (normalizeEmail(sessionEmail) === email) delete store.globalSessions[token];
      });
      delete store.tournamentAccess?.[email];
      delete store.globalGamePlays?.[email];

      store.tournaments.forEach(tournament => {
        if (tournament.submissions) {
          tournament.submissions = tournament.submissions.filter(s => normalizeEmail(s.player?.email) !== email);
        }
      });

      writeStore(store);
      send(res, 200, JSON.stringify({ ok: true, deleted: email }));
      return;
    }

    if (!requireAdmin(req, res, tenant, body.adminKey, body.sessionToken, body.globalSessionToken)) return;
    const tenantData = tenantStore(store, tenant.id);
    const user = tenantData.users[email];

    const adminUser = sessionUser(store, tenant, body.sessionToken) || globalSessionUser(store, body.globalSessionToken);
    if (adminUser && normalizeEmail(adminUser.email) === email) {
      send(res, 403, JSON.stringify({ error: "Cannot delete yourself" }));
      return;
    }

    if (user) {
      delete tenantData.users[email];
      Object.entries(tenantData.sessions).forEach(([token, sessionEmail]) => {
        if (normalizeEmail(sessionEmail) === email) delete tenantData.sessions[token];
      });
      delete tenantData.gamePlays?.[email];
    }

    const tournament = store.tournaments.find(item => item.id === tenantTournamentId(tenant.id));
    if (tournament && tournament.submissions) {
      tournament.submissions = tournament.submissions.filter(s => normalizeEmail(s.player?.email) !== email);
    }

    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, deleted: email }));
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

async function handleUpdateCompanyArea(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tenant = tenantFromValue(body.tenantId);
    const oldName = normalizeAreaName(body.oldName);
    const newName = normalizeAreaName(body.newName);
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
    if (!oldName || !newName) {
      send(res, 400, JSON.stringify({ error: "Area names are required" }));
      return;
    }
    const tenantData = tenantStore(store, tenant.id);
    const oldId = areaId(oldName);
    if (!tenantData.areas.some(item => areaId(item) === oldId)) {
      send(res, 404, JSON.stringify({ error: "Area not found" }));
      return;
    }
    if (tenantData.areas.some(item => areaId(item) === areaId(newName) && areaId(item) !== oldId)) {
      send(res, 409, JSON.stringify({ error: "Area already exists" }));
      return;
    }
    tenantData.areas = tenantData.areas.map(area => areaId(area) === oldId ? newName : area);
    Object.values(tenantData.users || {}).forEach(item => {
      if (areaId(item.area) === oldId) {
        item.area = newName;
        item.updatedAt = new Date().toISOString();
      }
    });
    const tournament = store.tournaments.find(item => item.id === tenantTournamentId(tenant.id));
    (tournament?.submissions || []).forEach(submission => {
      if (areaId(submission.player?.area) === oldId) submission.player.area = newName;
    });
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, tenant: publicTenant(tenant, tenantData) }));
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
    const tournament = tenant ? store.tournaments.find(item => item.id === tenantTournamentId(tenant.id)) : null;
    const companyUser = tenant ? sessionUser(store, tenant, body.sessionToken) : null;
    const globalUser = globalSessionUser(store, body.globalSessionToken || body.sessionToken);
    const user = tenant
      ? (companyUser || (hasTournamentAccess(store, globalUser, tournament) ? globalUser : null))
      : globalUser;
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
      points: correct ? Number(FIXED_DAILY_GAME_POINTS[gameType] || 0) : 0,
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
  return store.tournaments.find(item => item.id === value || normalizeCode(item.code) === code);
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
    if (store.tournaments.some(tournament => normalizeCode(tournament.code) === requestedCode)) {
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
      accessMode: body.accessMode === "code" ? "code" : "account",
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
      normalizeCode(item.code) === code &&
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

function preferSubmissionForLeaderboard(current, candidate) {
  if (!current) return candidate;
  const currentDate = new Date(current.updatedAt || current.createdAt || 0).getTime();
  const candidateDate = new Date(candidate.updatedAt || candidate.createdAt || 0).getTime();
  if (candidateDate > currentDate) return candidate;
  if (candidateDate < currentDate) return current;
  const currentPhases = Array.isArray(current.completedPhases) ? current.completedPhases.length : 0;
  const candidatePhases = Array.isArray(candidate.completedPhases) ? candidate.completedPhases.length : 0;
  return candidatePhases > currentPhases ? candidate : current;
}

function dedupeTournamentSubmissions(tournament) {
  if (!Array.isArray(tournament?.submissions)) return;
  const byEmail = new Map();
  const withoutEmail = [];
  tournament.submissions.forEach(submission => {
    const email = normalizeEmail(submission.player?.email);
    const identity = emailIdentity(email);
    if (!identity) {
      withoutEmail.push(submission);
      return;
    }
    submission.player = { ...(submission.player || {}), email };
    byEmail.set(identity, preferSubmissionForLeaderboard(byEmail.get(identity), submission));
  });
  tournament.submissions = [...byEmail.values(), ...withoutEmail];
}

function syncGlobalSubmissionToTournament(store, email, tournament) {
  const userEmail = normalizeEmail(email);
  if (!userEmail || !tournament || tournament.isGlobal) return;
  if (tournament.templateId && tournament.templateId !== "worldcup-2026") return;

  const globalTournament = store.tournaments.find(item => item.id === "global");
  const globalSubmission = (globalTournament?.submissions || []).find(item => sameEmailIdentity(item.player?.email, userEmail));
  if (!globalSubmission?.prediction) return;

  if (!Array.isArray(tournament.submissions)) tournament.submissions = [];
  const existingIndex = tournament.submissions.findIndex(item => sameEmailIdentity(item.player?.email, userEmail));
  const previous = existingIndex >= 0 ? tournament.submissions[existingIndex] : null;
  const phaseId = normalizePhaseId(globalSubmission.phaseId || "all");
  const prediction = mergePredictionByPhase(previous?.prediction, globalSubmission.prediction, phaseId, tournament);
  const completedPhases = [...new Set([...(previous?.completedPhases || []), ...(globalSubmission.completedPhases || []), phaseId])];
  const syncedSubmission = {
    id: previous?.id || `${Date.now()}-${slug(userEmail)}`,
    createdAt: previous?.createdAt || globalSubmission.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phaseId,
    completedPhases,
    continuationToken: previous?.continuationToken || globalSubmission.continuationToken || randomSecret(),
    player: {
      ...(globalSubmission.player || {}),
      email: userEmail
    },
    prediction
  };

  if (existingIndex >= 0) tournament.submissions[existingIndex] = syncedSubmission;
  else tournament.submissions.push(syncedSubmission);
  dedupeTournamentSubmissions(tournament);
}

function syncSubmissionAcrossTournaments(store, sourceTournamentId, player, incomingPrediction, phaseId) {
  const userEmail = normalizeEmail(player.email);
  if (!userEmail) return;

  const userForAccessCheck = { email: userEmail, ...(store.users[userEmail] || {}) };

  for (const otherTournament of store.tournaments) {
    if (otherTournament.id === sourceTournamentId) continue;
    if (otherTournament.templateId !== "worldcup-2026") continue;

    if (hasTournamentAccess(store, userForAccessCheck, otherTournament)) {
      if (!otherTournament.submissions) {
        otherTournament.submissions = [];
      }
      const otherExistingIndex = otherTournament.submissions.findIndex(s => sameEmailIdentity(s.player?.email, userEmail));
      const otherPrevious = otherExistingIndex >= 0 ? otherTournament.submissions[otherExistingIndex] : null;

      const predictionForOther = mergePredictionByPhase(otherPrevious?.prediction, incomingPrediction, phaseId, otherTournament);
      const completedPhases = [...new Set([...(otherPrevious?.completedPhases || []), phaseId])];

      const newOtherSubmission = {
        id: otherPrevious?.id || `${Date.now()}-${slug(userEmail)}`,
        createdAt: otherPrevious?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phaseId,
        completedPhases,
        continuationToken: otherPrevious?.continuationToken || randomSecret(),
        player: player,
        prediction: predictionForOther
      };

      if (otherExistingIndex >= 0) {
        otherTournament.submissions[otherExistingIndex] = newOtherSubmission;
      } else {
        otherTournament.submissions.push(newOtherSubmission);
      }
      dedupeTournamentSubmissions(otherTournament);
    }
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
    const prediction = mergePredictionByPhase(previous?.prediction, filteredPayload, phaseId, tournament);
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
    dedupeTournamentSubmissions(tournament);

    if (tournament.templateId === "worldcup-2026") {
      syncSubmissionAcrossTournaments(store, tournament.id, payload.player, payload.tournament, phaseId);
    }

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
  if (!email || !sameEmailIdentity(email, payment.player?.email)) return null;
  const existingIndex = tournament.submissions.findIndex(item => sameEmailIdentity(item.player?.email, email));
  const previous = existingIndex >= 0 ? tournament.submissions[existingIndex] : null;
  const continuationToken = previous?.continuationToken || randomSecret();
  const filteredPayload = mergeLockedCustomMatches(previous?.prediction, payload.tournament, tournament);
  const prediction = mergePredictionByPhase(previous?.prediction, filteredPayload, phaseId, tournament);
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
  dedupeTournamentSubmissions(tournament);
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
  const existingSubmission = (tournament.submissions || []).some(item => sameEmailIdentity(item.player?.email, email));
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
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      send(res, 500, JSON.stringify({ error: "SMTP not configured" }));
      return;
    }
    const store = readStore();
    if (!store.remindersSent || typeof store.remindersSent !== "object") {
      store.remindersSent = {};
    }
    let sent = 0;
    const failed = [];
    for (const tournament of store.tournaments || []) {
      const recipients = tournamentReminderRecipients(store, tournament);
      for (const phase of phases) {
        const phaseName = phaseById(phase.id).name;
        for (const recipient of recipients) {
          const email = normalizeEmail(recipient.email);
          if (!email) continue;
          const sentKey = `${tournament.id}:${email}:${reminderKey(phase.id)}`;
          if (store.remindersSent[sentKey]) continue;
          const link = recipient.continuationToken
            ? `${siteBaseUrl(req)}/continuar/${encodeURIComponent(recipient.continuationToken)}?fase=${encodeURIComponent(phase.id)}`
            : tournament.tenantId
              ? `${siteBaseUrl(req)}/empresa/${encodeURIComponent(tournament.tenantId)}`
              : `${siteBaseUrl(req)}/prode/global`;
          try {
            await sendMail({
              to: email,
              subject: `${tournament.name}: hoy comienza ${phaseName}`,
              text: [
                `Hola ${recipient.name || ""},`,
                "",
                `Te recordamos que hoy comienza ${phaseName}.`,
                "",
                "Entrá al Prode y cargá o revisá tus predicciones antes del inicio de los partidos:",
                link,
                "",
                "Si ya lo cargaste, podés ignorar este aviso.",
                "",
                "¡Gracias por participar!"
              ].join("\n")
            });
            store.remindersSent[sentKey] = new Date().toISOString();
            sent += 1;
          } catch (error) {
            failed.push({
              email,
              tournamentId: tournament.id,
              phaseId: phase.id,
              error: error.message
            });
          }
        }
      }
    }
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      sent,
      failed,
      phases: phases.map(item => item.id)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleSaveRealResults(req, res) {
  try {
    const bodyText = await readBody(req);
    console.log("[DEBUG save-results] Incoming body length:", bodyText.length);
    const body = JSON.parse(bodyText);
    const realResults = body.realResults;
    console.log("[DEBUG save-results] Incoming realResults.groupMatches:", JSON.stringify(realResults?.groupMatches || {}).substring(0, 500));
    if ((!realResults?.groups || !realResults?.winners) && !realResults?.custom) {
      send(res, 400, JSON.stringify({ error: "Invalid real results" }));
      return;
    }
    const store = readStore();
    const globalUser = globalSessionUser(store, body.globalSessionToken);
    if (!globalUser?.isSuperAdmin && !globalUser?.isAdmin) {
      send(res, 403, JSON.stringify({ error: "Se requieren privilegios de administrador global para guardar resultados oficiales." }));
      return;
    }
    const tournament = store.tournaments.find(item => item.id === "global");
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Global tournament not found" }));
      return;
    }
    const updatedAt = new Date().toISOString();
    realResults.updatedAt = updatedAt;
    if (realResults.custom?.matches) {
      const timing = tournamentTiming(tournament);
      const delayMs = Number(timing.scoringDelayMinutesAfterResult || 0) * 60000;
      const manualFinishedAt = new Date(Date.now() - delayMs - 60000).toISOString();
      Object.values(realResults.custom.matches).forEach(match => {
        if (!match || typeof match !== "object") return;
        const homeScore = match.homeScore;
        const awayScore = match.awayScore;
        const hasScore =
          homeScore !== "" && homeScore !== undefined &&
          awayScore !== "" && awayScore !== undefined;
        if (hasScore) {
          match.finishedAt = manualFinishedAt;
          // Derive and store the winner so scoreSubmission can count winnerHits correctly
          const h = Number(homeScore);
          const a = Number(awayScore);
          if (Number.isFinite(h) && Number.isFinite(a)) {
            match.winner = h === a ? "draw" : h > a ? (match.home || "home") : (match.away || "away");
          }
        }
      });
    }
    store.tournaments.forEach(t => {
      t.realResults = realResults;
      t.realResultsUpdatedAt = updatedAt;
    });
    writeStore(store);
    await mysqlSyncQueue;
    const savedGroupMatches = Object.entries(realResults.groupMatches || {})
      .filter(([, m]) => m && m.home !== "" && m.away !== "" && m.home !== undefined && m.away !== undefined)
      .map(([id, m]) => `${id}: ${m.home}-${m.away}`);
    const savedCustomMatches = Object.entries(realResults.custom?.matches || {})
      .filter(([, m]) => m.homeScore !== "" && m.homeScore !== undefined)
      .map(([id, m]) => `${id}: ${m.homeScore}-${m.awayScore} winner=${m.winner}`);
    console.log("[DEBUG save-results] Partidos de grupo guardados:", savedGroupMatches);
    console.log("[DEBUG save-results] Partidos custom guardados:", savedCustomMatches);
    send(res, 200, JSON.stringify({ ok: true }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function syncTournamentApiResults(store, tournament, options = {}) {
  const code = safeText(options.competitionCode, 12) || footballDataCompetitionCode(tournament.templateId);
  if (!code) {
    throw new Error("No API competition code is configured for this template");
  }
  const season = safeText(options.season, 8) || process.env.FOOTBALL_DATA_SEASON || "";
  const allApiMatches = await fetchFootballDataMatches({ code, season });
  const apiFixtures = footballDataFixtures(allApiMatches);
  if (apiFixtures.length && options.rebuildFixtures !== false) {
    const template = tournamentTemplate(tournament);
    tournament.customTemplate = {
      ...(tournament.customTemplate || {}),
      name: template.name,
      mode: tournament.mode || template.mode,
      teams: footballDataTeamsFromFixtures(apiFixtures),
      fixtures: apiFixtures,
      timing: tournamentTiming(tournament)
    };
  }
  const fixtures = tournamentFixtures(tournament);
  if (!fixtures.length) {
    throw new Error("This tournament template has no fixture list to sync");
  }
  const now = Date.now();
  const apiMatches = allApiMatches
    .filter(match => match.status === "FINISHED" && dateIsNotInFuture(match.utcDate, now));
  const updatedAt = new Date().toISOString();
  const previous = tournament.realResults?.custom?.matches || {};
  const matches = withoutFutureApiResults(previous, fixtures, now);
  let imported = 0;
  let matched = 0;
  fixtures.forEach(fixtureItem => {
    if (!dateIsNotInFuture(fixtureItem.startsAt, now)) return;
    const apiMatch = matchFixtureToApiResult(fixtureItem, apiMatches);
    if (!apiMatch) return;
    matched += 1;
    const fullTime = apiMatch.score?.fullTime || {};
    const homeScore = Number(fullTime.home);
    const awayScore = Number(fullTime.away);
    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return;
    imported += 1;
    const nextMatch = {
      homeScore,
      awayScore,
      winner: homeScore === awayScore ? "draw" : homeScore > awayScore ? fixtureItem.home : fixtureItem.away,
      source: "football-data.org",
      apiMatchId: apiMatch.id,
      status: apiMatch.status,
      updatedAt,
      finishedAt: ""
    };
    nextMatch.finishedAt = apiMatch.status === "FINISHED" ? apiResultFinishedAt(previous[fixtureItem.id], nextMatch, estimatedFinishedAt(apiMatch.utcDate || fixtureItem.startsAt, updatedAt)) : "";
    matches[fixtureItem.id] = nextMatch;
  });
  tournament.realResults = {
    ...(tournament.realResults || {}),
    custom: {
      ...(tournament.realResults?.custom || {}),
      matches,
      champion: tournament.realResults?.custom?.champion || ""
    },
    apiSource: {
      provider: "football-data.org",
      competitionCode: code,
      season,
      syncedAt: updatedAt,
      fixtures: apiFixtures.length,
      matched,
      imported
    },
    updatedAt
  };
  tournament.realResultsUpdatedAt = updatedAt;
  return { provider: "football-data.org", competitionCode: code, season, fixtures: apiFixtures.length, matched, imported };
}

async function handleImportApiResults(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const tournamentId = body.tournamentId || "global";
    const tenant = tenantFromValue(body.tenantId);
    const store = readStore();
    if (tournamentId !== "global" || tenant) {
      send(res, 403, JSON.stringify({ error: "Solo se pueden importar resultados en el torneo global." }));
      return;
    }
    const tournament = store.tournaments.find(item => item.id === "global");
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Global tournament not found" }));
      return;
    }
    const globalUser = globalSessionUser(store, body.globalSessionToken);
    if (!globalUser?.isAdmin && !globalUser?.isSuperAdmin) {
      send(res, 403, JSON.stringify({ error: "Global admin required" }));
      return;
    }
    const result = tournament.templateId === "argentina"
      ? await syncArgentinaApiResults(store, tournament)
      : await syncTournamentApiResults(store, tournament, body);
    store.tournaments.forEach(t => {
      t.realResults = tournament.realResults;
      t.realResultsUpdatedAt = tournament.realResultsUpdatedAt;
    });
    writeStore(store);
    send(res, 200, JSON.stringify({
      ok: true,
      ...result,
      tournament: publicTournament(tournament)
    }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleDeletePrivateTournament(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const store = readStore();
    const admin = globalSessionUser(store, body.globalSessionToken || body.sessionToken);
    if (!admin?.isSuperAdmin) {
      send(res, 403, JSON.stringify({ error: "Superadmin required" }));
      return;
    }
    const tournamentId = String(body.tournamentId || "").trim();
    const tournament = store.tournaments.find(item => item.id === tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    if (tournament.isGlobal || tournament.id === "global") {
      send(res, 400, JSON.stringify({ error: "Global tournament cannot be deleted" }));
      return;
    }
    store.tournaments = store.tournaments.filter(item => item.id !== tournamentId);
    Object.values(store.tournamentAccess || {}).forEach(access => {
      if (access && typeof access === "object") delete access[tournamentId];
    });
    if (tournament.tenantId && store.tenants?.[tournament.tenantId]?.dynamic === true) {
      delete store.tenants[tournament.tenantId];
      delete TENANTS[tournament.tenantId];
    }
    writeStore(store);
    send(res, 200, JSON.stringify({ ok: true, deleted: tournamentId }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleGetMiniTournaments(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const match = url.pathname.match(/^\/api\/tournaments\/([^/]+)\/minitournaments$/);
  if (!match) {
    send(res, 404, JSON.stringify({ error: "Invalid path" }));
    return;
  }
  const tournamentId = match[1];
  const store = readStore();
  const tournament = findTournament(store, tournamentId);
  if (!tournament) {
    send(res, 404, JSON.stringify({ error: "Tournament not found" }));
    return;
  }
  const globalSessionToken = url.searchParams.get("globalSessionToken");
  const sessionToken = url.searchParams.get("sessionToken");
  const tenantId = url.searchParams.get("tenantId");

  let user = globalSessionToken ? globalSessionUser(store, globalSessionToken) : null;
  if (!user && sessionToken && tenantId) {
    const tenant = tenantFromValue(tenantId);
    if (tenant) user = sessionUser(store, tenant, sessionToken);
  }
  const userEmail = user ? normalizeEmail(user.email) : null;

  const minitournaments = tournament.minitournaments || [];

  let userMiniTournaments = [];
  let visibleMinitournaments = [];
  if (userEmail) {
    visibleMinitournaments = minitournaments.filter(mt => (mt.participants || []).includes(userEmail) || user.isAdmin || user.isSuperAdmin);
    userMiniTournaments = minitournaments.filter(mt => (mt.participants || []).includes(userEmail)).map(mt => mt.id);
  }

  send(res, 200, JSON.stringify({
    minitournaments: visibleMinitournaments,
    userMiniTournaments,
    currentMiniTournament: userMiniTournaments[0] || null
  }));
}

async function handleCreateMiniTournament(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const store = readStore();
    const tournament = findTournament(store, body.tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    const tenant = tenantFromValue(body.tenantId);
    let user = globalSessionUser(store, body.globalSessionToken);
    if (!user && tenant) {
      user = sessionUser(store, tenant, body.sessionToken);
    }
    if (!user) {
      send(res, 401, JSON.stringify({ error: "Login required" }));
      return;
    }

    if (!tournament.minitournaments) tournament.minitournaments = [];

    const minitournament = {
      id: `mini-${Date.now()}-${randomCode()}`,
      name: safeText(body.name, 100),
      description: safeText(body.description, 200),
      code: normalizeCode(body.code),
      createdAt: new Date().toISOString(),
      creatorEmail: normalizeEmail(user.email),
      participants: [normalizeEmail(user.email)]
    };

    tournament.minitournaments.push(minitournament);
    writeStore(store);

    send(res, 200, JSON.stringify({ ok: true, minitournament }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleJoinMiniTournament(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const store = readStore();
    const tournament = findTournament(store, body.tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    const tenant = tenantFromValue(body.tenantId);
    let user = globalSessionUser(store, body.globalSessionToken);
    if (!user && tenant) {
      user = sessionUser(store, tenant, body.sessionToken);
    }
    if (!user) {
      send(res, 401, JSON.stringify({ error: "Login required" }));
      return;
    }

    const name = safeText(body.name, 100).toLowerCase();
    const code = normalizeCode(body.code);

    const mt = (tournament.minitournaments || []).find(m => m.name.toLowerCase() === name && m.code === code);
    if (!mt) {
      send(res, 404, JSON.stringify({ error: "Nombre o contraseña incorrectos" }));
      return;
    }

    if (!mt.participants) mt.participants = [];
    const email = normalizeEmail(user.email);
    if (!mt.participants.includes(email)) {
      mt.participants.push(email);
      writeStore(store);
    }

    send(res, 200, JSON.stringify({ ok: true, minitournamentId: mt.id }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleDeleteMiniTournament(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const store = readStore();
    const tournament = findTournament(store, body.tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    const tenant = tenantFromValue(body.tenantId);
    let user = globalSessionUser(store, body.globalSessionToken);
    if (!user && tenant) {
      user = sessionUser(store, tenant, body.sessionToken);
    }
    if (!user) {
      send(res, 401, JSON.stringify({ error: "Login required" }));
      return;
    }

    const mtIndex = (tournament.minitournaments || []).findIndex(m => m.id === body.minitournamentId);
    if (mtIndex === -1) {
      send(res, 404, JSON.stringify({ error: "Minitournament not found" }));
      return;
    }

    const mt = tournament.minitournaments[mtIndex];
    if (mt.creatorEmail !== normalizeEmail(user.email) && !user.isAdmin && !user.isSuperAdmin) {
      send(res, 403, JSON.stringify({ error: "Solo el creador o un administrador puede eliminar el minitorneo" }));
      return;
    }

    tournament.minitournaments.splice(mtIndex, 1);
    writeStore(store);

    send(res, 200, JSON.stringify({ ok: true }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

async function handleRemoveMiniTournamentUser(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const store = readStore();
    const tournament = findTournament(store, body.tournamentId);
    if (!tournament) {
      send(res, 404, JSON.stringify({ error: "Tournament not found" }));
      return;
    }
    const tenant = tenantFromValue(body.tenantId);
    let user = globalSessionUser(store, body.globalSessionToken);
    if (!user && tenant) {
      user = sessionUser(store, tenant, body.sessionToken);
    }
    if (!user) {
      send(res, 401, JSON.stringify({ error: "Login required" }));
      return;
    }

    const mt = (tournament.minitournaments || []).find(m => m.id === body.minitournamentId);
    if (!mt) {
      send(res, 404, JSON.stringify({ error: "Minitournament not found" }));
      return;
    }

    if (mt.creatorEmail !== normalizeEmail(user.email) && !user.isAdmin && !user.isSuperAdmin) {
      send(res, 403, JSON.stringify({ error: "Solo el creador o un administrador puede eliminar usuarios" }));
      return;
    }

    const userToRemove = normalizeEmail(body.userEmailToRemove);
    if (!mt.participants) mt.participants = [];
    mt.participants = mt.participants.filter(email => email !== userToRemove);

    writeStore(store);

    send(res, 200, JSON.stringify({ ok: true }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

function handleSelectMiniTournament(req, res) {
  send(res, 200, JSON.stringify({ ok: true }));
}

function handleLeaderboard(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tournamentId = url.searchParams.get("tournamentId") || "global";
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const area = normalizeAreaName(url.searchParams.get("area"));
  const minitournamentId = url.searchParams.get("minitournamentId");
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
  let mtParticipants = null;
  let minitournamentName = null;
  if (minitournamentId && tournament.minitournaments) {
    const mt = tournament.minitournaments.find(m => m.id === minitournamentId);
    if (mt) {
      mtParticipants = mt.participants || [];
      minitournamentName = mt.name;
    }
  }
  const mtParticipantIdentities = mtParticipants ? new Set(mtParticipants.map(emailIdentity)) : null;
  let leaderboard = (tournament.submissions || [])
    .filter(submission => {
      if (!mtParticipants) return true;
      return mtParticipantIdentities.has(emailIdentity(submission.player?.email));
    })
    .map(submission => ({
      player: {
        name: submission.player?.name || "",
        area: submission.player?.area || "",
        email: submission.player?.email || ""
      },
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt || submission.createdAt,
      champion: submission.prediction?.custom?.champion || submission.prediction?.winners?.m104 || "",
      score: scoreSubmission(submission.prediction, tournament.realResults, tournament.scoring, tournament),
      prediction: submission.prediction
    }));
  const preferLeaderboardRow = (current, candidate) => {
    if (!current) return candidate;
    const currentHasPrediction = current.prediction !== null && current.prediction !== undefined;
    const candidateHasPrediction = candidate.prediction !== null && candidate.prediction !== undefined;
    if (candidateHasPrediction && !currentHasPrediction) return candidate;
    if (!candidateHasPrediction && currentHasPrediction) return current;
    const currentDate = new Date(current.updatedAt || current.createdAt || 0).getTime();
    const candidateDate = new Date(candidate.updatedAt || candidate.createdAt || 0).getTime();
    if (candidateDate > currentDate) return candidate;
    if (candidateDate < currentDate) return current;
    return Number(candidate.score?.points || 0) > Number(current.score?.points || 0) ? candidate : current;
  };
  const dedupeLeaderboardRows = rows => {
    const byEmail = new Map();
    const withoutEmail = [];
    rows.forEach(row => {
      const email = normalizeEmail(row.player?.email);
      const identity = emailIdentity(email);
      if (!identity) {
        withoutEmail.push(row);
        return;
      }
      byEmail.set(identity, preferLeaderboardRow(byEmail.get(identity), row));
    });
    return [...byEmail.values(), ...withoutEmail];
  };
  leaderboard = dedupeLeaderboardRows(leaderboard);

  if (mtParticipants) {
    const existingEmails = new Set(leaderboard.map(row => emailIdentity(row.player.email)));
    mtParticipants.forEach(email => {
      email = normalizeEmail(email);
      const identity = emailIdentity(email);
      if (!existingEmails.has(identity)) {
        let name = "Jugador sin prode";
        let area = "";
        if (tenant && store.tenants?.[tenant.id]?.users?.[email]) {
          name = store.tenants[tenant.id].users[email].name || name;
          area = store.tenants[tenant.id].users[email].area || area;
        } else if (store.users?.[email]) {
          name = store.users[email].name || name;
        }
        leaderboard.push({
          player: { name, area, email },
          createdAt: new Date().toISOString(),
          champion: "",
          score: { points: 0, groupHits: 0, winnerHits: 0, exactScoreHits: 0, championHit: false },
          prediction: null
        });
        existingEmails.add(identity);
      }
    });
  } else {
    const existingEmails = new Set(leaderboard.map(row => emailIdentity(row.player.email)));
    if (tenant) {
      const tenantData = store.tenants?.[tenant.id];
      if (tenantData && tenantData.users) {
        Object.values(tenantData.users).forEach(user => {
          const email = normalizeEmail(user.email);
          const identity = emailIdentity(email);
          if (!existingEmails.has(identity) && user.active !== false) {
            leaderboard.push({
              player: { name: user.name, area: user.area || "", email },
              createdAt: user.createdAt || new Date().toISOString(),
              updatedAt: user.updatedAt || user.createdAt || new Date().toISOString(),
              champion: "",
              score: { points: 0, groupHits: 0, winnerHits: 0, exactScoreHits: 0, championHit: false },
              prediction: null
            });
            existingEmails.add(identity);
          }
        });
      }
    } else if (tournament.isGlobal) {
      Object.values(store.users || {}).forEach(user => {
        const email = normalizeEmail(user.email);
        const identity = emailIdentity(email);
        if (!existingEmails.has(identity) && user.active !== false) {
          leaderboard.push({
            player: { name: user.name, area: "Global", email },
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || user.createdAt || new Date().toISOString(),
            champion: "",
            score: { points: 0, groupHits: 0, winnerHits: 0, exactScoreHits: 0, championHit: false },
            prediction: null
          });
          existingEmails.add(identity);
        }
      });
    }
  }
  leaderboard = dedupeLeaderboardRows(leaderboard);
  if (area) {
    leaderboard = leaderboard.filter(row => areaId(row.player?.area || "") === areaId(area));
  }

  leaderboard.sort((a, b) => {
    const aHas = a.prediction !== null;
    const bHas = b.prediction !== null;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return b.score.points - a.score.points || new Date(a.createdAt) - new Date(b.createdAt);
  });

  send(res, 200, JSON.stringify({
    tournament: publicTournament(tournament),
    area,
    hasRealResults: Boolean(tournament.realResults),
    leaderboard,
    minitournamentName
  }));
}

function handleAdminSummary(req, res) {
  const url = new URL(req.url, "http://localhost");
  const tenant = tenantFromValue(url.searchParams.get("tenant"));
  const adminKey = url.searchParams.get("adminKey");
  const sessionToken = url.searchParams.get("sessionToken");
  const globalSessionToken = url.searchParams.get("globalSessionToken");
  const store = readStore();
  if (!tenant) {
    const admin = requireGlobalAdmin(req, res, store, globalSessionToken);
    if (!admin) return;
    const users = Object.values(store.users || {})
      .map(user => {
        const role = userRole(null, user);
        return {
          name: user.name || "",
          email: user.email || "",
          area: "Global",
          active: user.active !== false,
          role,
          isAdmin: role === "admin" || role === "superadmin",
          isSuperAdmin: role === "superadmin",
          registered: true,
          registeredAt: user.createdAt || "",
          updatedAt: user.updatedAt || "",
          hasPrediction: false,
          predictionUpdatedAt: "",
          completedPhases: []
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email));
    send(res, 200, JSON.stringify({
      scope: "global",
      stats: {
        users: users.length,
        predictions: store.tournaments.reduce((total, tournament) => total + (tournament.submissions?.length || 0), 0),
        areas: store.tournaments.length
      },
      tournaments: (store.tournaments || []).map(tournament => publicLobbyTournament(store, tournament, admin)),
      users
    }));
    return;
  }
  const approver = requireCompanyApprover(req, res, tenant, sessionToken, globalSessionToken);
  if (!approver) return;
  const tenantData = tenantStore(store, tenant.id);
  const tournament = store.tournaments.find(item => item.id === tenantTournamentId(tenant.id));
  const submissions = tournament?.submissions || [];
  const byEmail = new Map(submissions.map(submission => [emailIdentity(submission.player?.email), submission]));
  const users = Object.values(tenantData.users || {})
    .map(user => {
      const submission = byEmail.get(emailIdentity(user.email));
      const role = userRole(tenant.id, user);
      const flags = publicUserFlags(role);
      const approvalStatus = approvalStatusFor(user, role);
      if (user.role !== role) user.role = role;
      if (flags.isAdmin && !user.isAdmin) user.isAdmin = true;
      if (flags.isEmpresario && !user.isEmpresario) user.isEmpresario = true;
      return {
        name: user.name || "",
        email: user.email || "",
        area: user.area || "",
        active: user.active !== false,
        approvalStatus,
        role,
        ...flags,
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
      pendingRequests: users.filter(user => user.approvalStatus === "pending").length,
      rejectedRequests: users.filter(user => user.approvalStatus === "rejected").length,
      predictions: submissions.length,
      areas: tenantData.areas.length
    },
    users: [...users, ...extraPlayers]
  }));
}

let apiResultSyncRunning = false;

async function syncApiResultsForAllTournaments() {
  if (apiResultSyncRunning) return;
  apiResultSyncRunning = true;
  try {
    const store = readStore();
    let imported = 0;
    let fixtures = 0;
    const globalTournament = store.tournaments.find(t => t.id === "global");
    if (globalTournament && globalTournament.templateId !== "worldcup-2026") {
      try {
        let result = null;
        if (globalTournament.templateId === "argentina") {
          result = await syncArgentinaApiResults(store, globalTournament);
        } else if (footballDataCompetitionCode(globalTournament.templateId) && (process.env.FOOTBALL_DATA_TOKEN || process.env.FOOTBALLDATA_TOKEN)) {
          result = await syncTournamentApiResults(store, globalTournament);
        }
        if (result) {
          imported += result.imported || 0;
          fixtures += result.fixtures || 0;
          store.tournaments.forEach(t => {
            t.realResults = globalTournament.realResults;
            t.realResultsUpdatedAt = globalTournament.realResultsUpdatedAt;
          });
        }
      } catch (error) {
        console.warn(`No se pudo sincronizar global: ${error.message}`);
      }
    }
    for (const tournament of store.tournaments || []) {
      if (tournament.id === "global") continue;
      if (tournament.templateId === "worldcup-2026") continue;
      try {
        let result = null;
        if (tournament.templateId === "argentina") {
          result = await syncArgentinaApiResults(store, tournament);
        } else {
          if (!footballDataCompetitionCode(tournament.templateId)) continue;
          if (!process.env.FOOTBALL_DATA_TOKEN && !process.env.FOOTBALLDATA_TOKEN) continue;
          result = await syncTournamentApiResults(store, tournament);
        }
        imported += result.imported || 0;
        fixtures += result.fixtures || 0;
      } catch (error) {
        console.warn(`No se pudo sincronizar ${tournament.id}: ${error.message}`);
      }
    }
    if (imported > 0 || fixtures > 0) writeStore(store);
    console.log(`Sync API resultados: ${imported} resultados importados, ${fixtures} fixtures sincronizados`);
  } finally {
    apiResultSyncRunning = false;
  }
}

function serveStatic(req, res) {
  const cleanUrl = decodeURIComponent(req.url.split("?")[0]);
  const isCompanyView = /^\/(?:prode\/)?empresa\/[^/.]+\/?$/.test(cleanUrl);
  const isProdeView = cleanUrl === "/prode" || cleanUrl === "/prode/" || cleanUrl === "/prode/global" || cleanUrl === "/prode/global/";
  const staticMatch = cleanUrl.match(/^\/(?:prode-static|prode-global-static)\/(.+)$/);
  const isResetPasswordView = cleanUrl.startsWith("/reset-password/") || cleanUrl.startsWith("/prode/reset-password/") || cleanUrl.startsWith("/prode/global/reset-password/");
  const requested = req.url === "/" || isProdeView || cleanUrl.startsWith("/join/") || cleanUrl.startsWith("/continuar/") || isResetPasswordView || isCompanyView
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
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/prode/api/")) {
    req.url = req.url.replace(/^\/prode\/api\//, "/api/");
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
  if (req.method === "POST" && req.url === "/api/request-password-reset") {
    handleRequestPasswordReset(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/reset-password") {
    handleResetPassword(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/registrar-global") {
    handleRegistrarGlobal(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/registrar-company") {
    handleRegistrarCompany(req, res);
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
  if (req.method === "POST" && req.url === "/api/change-password") {
    handleChangePassword(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/profile-avatar") {
    handleProfileAvatar(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/profile-stats")) {
    handleProfileStats(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/company-session")) {
    handleCompanySession(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/company-join-requests") {
    handleReviewCompanyJoinRequest(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/admin-users") {
    handleAdminUpdateUser(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/admin-users/delete") {
    handleAdminDeleteUser(req, res);
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
  if (req.method === "POST" && req.url === "/api/company-areas/update") {
    handleUpdateCompanyArea(req, res);
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
  if (req.method === "GET" && /^\/api\/tournaments\/[^/]+\/minitournaments/.test(req.url)) {
    handleGetMiniTournaments(req, res);
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
  if (req.method === "POST" && req.url === "/api/import-api-results") {
    handleImportApiResults(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/minitournaments") {
    handleCreateMiniTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/minitournaments/join") {
    handleJoinMiniTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/minitournaments/delete") {
    handleDeleteMiniTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/minitournaments/remove-user") {
    handleRemoveMiniTournamentUser(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/minitournaments/select") {
    handleSelectMiniTournament(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/delete-private-tournament") {
    handleDeletePrivateTournament(req, res);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/leaderboard")) {
    handleLeaderboard(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/request-verification") { handleRequestVerification(req, res); return; }
  if (req.method === "POST" && req.url === "/api/verify-code") { handleVerifyCode(req, res); return; }
  serveStatic(req, res);

});

async function startServer() {
  try {
    STORE_CACHE = await loadInitialStore();
    await syncStoreToMysql(STORE_CACHE);
    console.log(`MySQL conectado en ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database} con usuario ${DB_CONFIG.user}`);
    server.listen(PORT, () => {
      console.log(`Prode Mundial listo en http://localhost:${PORT}`);
      setTimeout(() => syncApiResultsForAllTournaments().catch(error => console.warn(`Sync API resultados fallo: ${error.message}`)), 5000);
      setInterval(() => syncApiResultsForAllTournaments().catch(error => console.warn(`Sync API resultados fallo: ${error.message}`)), Number(process.env.API_RESULTS_SYNC_INTERVAL_MS || 1800000));
    });
  } catch (error) {
    console.error("No se pudo iniciar porque MySQL es obligatorio:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
