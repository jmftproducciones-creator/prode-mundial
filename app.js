const WORLD_CUP_GROUPS = {
    A: ["México", "República de Corea", "Sudáfrica", "República Checa"],
    B: ["Canadá", "Suiza", "Catar", "Bosnia y Herzegovina"],
    C: ["Brasil", "Marruecos", "Haití", "Escocia"],
    D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
    E: ["Alemania", "Ecuador", "Costa de Marfil", "Curazao"],
    F: ["Países Bajos", "Japón", "Túnez", "Suecia"],
    G: ["Bélgica", "RI de Irán", "Egipto", "Nueva Zelanda"],
    H: ["España", "Uruguay", "Arabia Saudí", "Cabo Verde"],
    I: ["Francia", "Senegal", "Noruega", "Irak"],
    J: ["Argentina", "Austria", "Argelia", "Jordania"],
    K: ["Portugal", "Colombia", "Uzbekistán", "RD Congo"],
    L: ["Inglaterra", "Croacia", "Panamá", "Ghana"],
  },
  APP_CONFIG = {
    entryDeadline: "2026-06-11T12:00:00-03:00",
    liveResultsUrl: "/api/live-results",
  };
function apiUrl(e) {
  const t = String(e || "");
  return t.startsWith("/api/")
    ? window.location.pathname.startsWith("/prode/global")
      ? t
      : window.location.pathname.startsWith("/prode/")
        ? `/prode${e}`
        : e
    : e;
}
const FLAG_CODES = {
    México: "mx",
    "República de Corea": "kr",
    Sudáfrica: "za",
    "República Checa": "cz",
    Canadá: "ca",
    Suiza: "ch",
    Catar: "qa",
    "Bosnia y Herzegovina": "ba",
    Brasil: "br",
    Marruecos: "ma",
    Escocia: "gb-sct",
    Haití: "ht",
    "Estados Unidos": "us",
    Paraguay: "py",
    Australia: "au",
    Turquía: "tr",
    Alemania: "de",
    Ecuador: "ec",
    "Costa de Marfil": "ci",
    Curazao: "cw",
    "Países Bajos": "nl",
    Japón: "jp",
    Túnez: "tn",
    Suecia: "se",
    Bélgica: "be",
    "RI de Irán": "ir",
    Egipto: "eg",
    "Nueva Zelanda": "nz",
    España: "es",
    Uruguay: "uy",
    "Arabia Saudí": "sa",
    "Cabo Verde": "cv",
    Francia: "fr",
    Senegal: "sn",
    Noruega: "no",
    Irak: "iq",
    Argentina: "ar",
    Austria: "at",
    Argelia: "dz",
    Jordania: "jo",
    Portugal: "pt",
    Colombia: "co",
    Uzbekistán: "uz",
    "RD Congo": "cd",
    Inglaterra: "gb-eng",
    Croacia: "hr",
    Panamá: "pa",
    Ghana: "gh",
  },
  FIFA_CODES = {
    México: "MEX",
    "República de Corea": "KOR",
    Sudáfrica: "RSA",
    "República Checa": "CZE",
    Canadá: "CAN",
    Suiza: "SUI",
    Catar: "QAT",
    "Bosnia y Herzegovina": "BIH",
    Brasil: "BRA",
    Marruecos: "MAR",
    Escocia: "SCO",
    Haití: "HAI",
    "Estados Unidos": "USA",
    Paraguay: "PAR",
    Australia: "AUS",
    Turquía: "TUR",
    Alemania: "GER",
    Ecuador: "ECU",
    "Costa de Marfil": "CIV",
    Curazao: "CUW",
    "Países Bajos": "NED",
    Japón: "JPN",
    Túnez: "TUN",
    Suecia: "SWE",
    Bélgica: "BEL",
    "RI de Irán": "IRN",
    Egipto: "EGY",
    "Nueva Zelanda": "NZL",
    España: "ESP",
    Uruguay: "URU",
    "Arabia Saudí": "KSA",
    "Cabo Verde": "CPV",
    Francia: "FRA",
    Senegal: "SEN",
    Noruega: "NOR",
    Irak: "IRQ",
    Argentina: "ARG",
    Austria: "AUT",
    Argelia: "ALG",
    Jordania: "JOR",
    Portugal: "POR",
    Colombia: "COL",
    Uzbekistán: "UZB",
    "RD Congo": "COD",
    Inglaterra: "ENG",
    Croacia: "CRO",
    Panamá: "PAN",
    Ghana: "GHA",
  },
  CREST_URLS = {
    "Real Madrid": "https://crests.football-data.org/86.png",
    "Real Madrid CF": "https://crests.football-data.org/86.png",
    Barcelona: "https://crests.football-data.org/81.png",
    "FC Barcelona": "https://crests.football-data.org/81.png",
    "Manchester City": "https://crests.football-data.org/65.png",
    Liverpool: "https://crests.football-data.org/64.png",
    "Bayern Munich": "https://crests.football-data.org/5.svg",
    PSG: "https://crests.football-data.org/524.png",
    Inter: "https://crests.football-data.org/108.png",
    Arsenal: "https://crests.football-data.org/57.png",
    "Atletico Madrid": "https://crests.football-data.org/78.png",
    "Atletico de Madrid": "https://crests.football-data.org/78.png",
    "Borussia Dortmund": "https://crests.football-data.org/4.png",
    Juventus: "https://crests.football-data.org/109.png",
    Benfica: "https://crests.football-data.org/1903.png",
    Porto: "https://crests.football-data.org/503.png",
    Napoli: "https://crests.football-data.org/113.png",
    "Bayer Leverkusen": "https://crests.football-data.org/3.png",
    Chelsea: "https://crests.football-data.org/61.png",
    "Athletic Club": "https://crests.football-data.org/77.png",
    "CA Osasuna": "https://crests.football-data.org/79.png",
    Celta: "https://crests.football-data.org/558.png",
    "Deportivo Alaves": "https://crests.football-data.org/263.png",
    "Elche CF": "https://crests.football-data.org/285.png",
    "Getafe CF": "https://crests.football-data.org/82.png",
    "Girona FC": "https://crests.football-data.org/298.png",
    "Levante UD": "https://crests.football-data.org/88.png",
    "Rayo Vallecano": "https://crests.football-data.org/87.png",
    "RCD Espanyol de Barcelona": "https://crests.football-data.org/80.png",
    "RCD Mallorca": "https://crests.football-data.org/89.png",
    "Real Betis": "https://crests.football-data.org/90.png",
    "Real Oviedo": "https://crests.football-data.org/117.png",
    "Real Sociedad": "https://crests.football-data.org/92.png",
    "Sevilla FC": "https://crests.football-data.org/559.png",
    "Valencia CF": "https://crests.football-data.org/95.png",
    "Villarreal CF": "https://crests.football-data.org/94.png",
  },
  TEAM_DISPLAY_NAMES = {
    arsenalfc: "Arsenal",
    atalantabc: "Atalanta",
    atleticomadrid: "Atletico Madrid",
    bayer04leverkusen: "Bayer Leverkusen",
    bayernmunchen: "Bayern Munich",
    clubatleticodemadrid: "Atletico Madrid",
    barcelona: "Barcelona",
    fcbarcelona: "Barcelona",
    fcbayernmunchen: "Bayern Munich",
    galatasaraysk: "Galatasaray",
    liverpoolfc: "Liverpool",
    manchestercityfc: "Manchester City",
    newcastleunitedfc: "Newcastle",
    parissaintgermainfc: "PSG",
    realmadridcf: "Real Madrid",
    sportingclubedeportugal: "Sporting CP",
    tottenhamhotspurfc: "Tottenham",
  },
  ARGENTINA_CREST_COLORS = {
    aldosivi: ["#0b8f43", "#f4d03f"],
    argentinosjuniors: ["#d71920", "#ffffff"],
    atleticotucuman: ["#77bce8", "#ffffff"],
    banfield: ["#1b8f45", "#ffffff"],
    barracascentral: ["#d71920", "#ffffff"],
    belgrano: ["#64b5e8", "#111827"],
    bocajuniors: ["#123c8c", "#f6c343"],
    centralcordoba: ["#111827", "#ffffff"],
    defensayjusticia: ["#f4d03f", "#1f9d55"],
    deportivoriestra: ["#111827", "#ffffff"],
    estudiantes: ["#d71920", "#ffffff"],
    estudiantesriocuarto: ["#64b5e8", "#ffffff"],
    gimnasiaplata: ["#ffffff", "#193b7a"],
    gimnasiamendoza: ["#111827", "#ffffff"],
    huracan: ["#ffffff", "#d71920"],
    independiente: ["#d71920", "#ffffff"],
    independienterivadavia: ["#1f4fa3", "#ffffff"],
    instituto: ["#d71920", "#ffffff"],
    lanus: ["#7a1434", "#ffffff"],
    newells: ["#d71920", "#111827"],
    platense: ["#7a4a24", "#ffffff"],
    racing: ["#75aadb", "#ffffff"],
    riverplate: ["#ffffff", "#d71920"],
    rosariocentral: ["#123c8c", "#f6c343"],
    sanlorenzo: ["#123c8c", "#d71920"],
    sarmiento: ["#1b8f45", "#ffffff"],
    talleres: ["#123c8c", "#ffffff"],
    tigre: ["#123c8c", "#d71920"],
    union: ["#d71920", "#ffffff"],
    velez: ["#ffffff", "#1f4fa3"],
  },
  CREST_URLS_BY_KEY = Object.fromEntries(
    Object.entries(CREST_URLS).map(([e, t]) => [teamKey(e), t]),
  ),
  THIRD_PLACE_SLOTS = {
    m74: ["A", "B", "C", "D", "F"],
    m77: ["C", "D", "F", "G", "H"],
    m79: ["C", "E", "F", "H", "I"],
    m80: ["E", "H", "I", "J", "K"],
    m81: ["B", "E", "F", "I", "J"],
    m82: ["A", "E", "H", "I", "J"],
    m85: ["A", "C", "D", "E", "F"],
    m87: ["E", "F", "G", "I", "J"],
  },
  R32_MATCHES = [
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
    ["m88", "2D", "2G"],
  ],
  GROUP_MATCHDAY_FIXTURES = {
    group1: [
      "A-0-2",
      "A-1-3",
      "B-0-3",
      "D-0-1",
      "B-2-1",
      "C-0-1",
      "C-3-2",
      "D-2-3",
      "E-0-3",
      "F-0-1",
      "E-2-1",
      "F-3-2",
      "H-0-3",
      "G-0-2",
      "H-2-1",
      "G-1-3",
      "I-0-1",
      "I-3-2",
      "J-0-2",
      "J-1-3",
      "K-0-3",
      "L-0-1",
      "L-2-3",
      "K-2-1",
    ],
    group2: [
      "A-3-2",
      "B-1-3",
      "B-0-2",
      "A-0-1",
      "D-0-2",
      "C-2-1",
      "C-0-3",
      "D-3-1",
      "F-0-3",
      "E-0-2",
      "E-1-3",
      "F-2-1",
      "H-0-2",
      "G-0-1",
      "H-1-3",
      "G-3-2",
      "J-0-1",
      "I-0-3",
      "I-2-1",
      "J-3-2",
      "K-0-2",
      "L-0-2",
      "L-3-1",
      "K-1-3",
    ],
    group3: [
      "B-1-0",
      "B-3-2",
      "C-2-0",
      "C-1-3",
      "A-3-0",
      "A-2-1",
      "E-3-2",
      "E-1-0",
      "F-1-3",
      "F-2-0",
      "D-3-0",
      "D-1-2",
      "I-2-0",
      "I-1-3",
      "H-3-2",
      "H-1-0",
      "G-2-1",
      "G-3-0",
      "L-3-0",
      "L-1-2",
      "K-1-0",
      "K-3-2",
      "J-2-1",
      "J-3-0",
    ],
  },
  GROUP_MATCHDAY_DATES = {
    group1: [
      "11 de Jun",
      "12 de Jun",
      "13 de Jun",
      "14 de Jun",
      "15 de Jun",
      "16 de Jun",
      "17 de Jun",
      "18 de Jun",
      "19 de Jun",
      "20 de Jun",
      "21 de Jun",
      "22 de Jun",
    ],
    group2: [
      "18 de Jun",
      "19 de Jun",
      "20 de Jun",
      "21 de Jun",
      "22 de Jun",
      "23 de Jun",
      "24 de Jun",
      "25 de Jun",
      "26 de Jun",
      "27 de Jun",
      "28 de Jun",
      "29 de Jun",
    ],
    group3: [
      "24 de Jun",
      "25 de Jun",
      "26 de Jun",
      "27 de Jun",
      "28 de Jun",
      "29 de Jun",
      "30 de Jun",
      "1 de Jul",
      "2 de Jul",
      "3 de Jul",
      "4 de Jul",
      "5 de Jul",
    ],
  },
  GROUP_MATCH_TIMES = ["16:00", "22:00"],
  STADIUM_ROTATION = [
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
    "Estadio Kansas City",
  ],
  KNOCKOUT_SCHEDULE = {
    m73: {
      number: 73,
      date: "28 de Jun",
      time: "16:00",
      venue: "Estadio Los Ángeles",
    },
    m74: {
      number: 74,
      date: "29 de Jun",
      time: "16:00",
      venue: "Estadio Boston",
    },
    m75: {
      number: 75,
      date: "29 de Jun",
      time: "16:00",
      venue: "Estadio Monterrey",
    },
    m76: {
      number: 76,
      date: "29 de Jun",
      time: "16:00",
      venue: "Estadio Houston",
    },
    m77: {
      number: 77,
      date: "30 de Jun",
      time: "13:00",
      venue: "Estadio Nueva York Nueva Jersey",
    },
    m78: {
      number: 78,
      date: "30 de Jun",
      time: "16:00",
      venue: "Estadio Dallas",
    },
    m79: {
      number: 79,
      date: "30 de Jun",
      time: "19:00",
      venue: "Estadio Ciudad de México",
    },
    m80: {
      number: 80,
      date: "1 de Jul",
      time: "14:00",
      venue: "Estadio Atlanta",
    },
    m81: {
      number: 81,
      date: "1 de Jul",
      time: "17:00",
      venue: "Estadio Bahía de San Francisco",
    },
    m82: {
      number: 82,
      date: "1 de Jul",
      time: "20:00",
      venue: "Estadio Seattle",
    },
    m83: {
      number: 83,
      date: "2 de Jul",
      time: "14:00",
      venue: "Estadio Toronto",
    },
    m84: {
      number: 84,
      date: "2 de Jul",
      time: "17:00",
      venue: "Estadio Los Ángeles",
    },
    m85: {
      number: 85,
      date: "2 de Jul",
      time: "20:00",
      venue: "Estadio BC Place Vancouver",
    },
    m86: {
      number: 86,
      date: "3 de Jul",
      time: "16:00",
      venue: "Estadio Miami",
    },
    m87: {
      number: 87,
      date: "3 de Jul",
      time: "19:00",
      venue: "Estadio Kansas City",
    },
    m88: {
      number: 88,
      date: "3 de Jul",
      time: "22:00",
      venue: "Estadio Dallas",
    },
    m89: {
      number: 89,
      date: "4 de Jul",
      time: "16:00",
      venue: "Estadio Filadelfia",
    },
    m90: {
      number: 90,
      date: "4 de Jul",
      time: "16:00",
      venue: "Estadio Houston",
    },
    m91: {
      number: 91,
      date: "5 de Jul",
      time: "16:00",
      venue: "Estadio Nueva York Nueva Jersey",
    },
    m92: {
      number: 92,
      date: "5 de Jul",
      time: "16:00",
      venue: "Estadio Ciudad de México",
    },
    m93: {
      number: 93,
      date: "6 de Jul",
      time: "14:00",
      venue: "Estadio Dallas",
    },
    m94: {
      number: 94,
      date: "6 de Jul",
      time: "17:00",
      venue: "Estadio Seattle",
    },
    m95: {
      number: 95,
      date: "7 de Jul",
      time: "14:00",
      venue: "Estadio Atlanta",
    },
    m96: {
      number: 96,
      date: "7 de Jul",
      time: "17:00",
      venue: "Estadio BC Place Vancouver",
    },
    m97: {
      number: 97,
      date: "9 de Jul",
      time: "16:00",
      venue: "Estadio Boston",
    },
    m98: {
      number: 98,
      date: "10 de Jul",
      time: "16:00",
      venue: "Estadio Los Ángeles",
    },
    m99: {
      number: 99,
      date: "11 de Jul",
      time: "14:00",
      venue: "Estadio Miami",
    },
    m100: {
      number: 100,
      date: "11 de Jul",
      time: "17:00",
      venue: "Estadio Kansas City",
    },
    m101: {
      number: 101,
      date: "14 de Jul",
      time: "15:00",
      venue: "Estadio Dallas",
    },
    m102: {
      number: 102,
      date: "15 de Jul",
      time: "15:00",
      venue: "Estadio Atlanta",
    },
    m103: {
      number: 103,
      date: "18 de Jul",
      time: "15:00",
      venue: "Estadio Miami",
    },
    m104: {
      number: 104,
      date: "19 de Jul",
      time: "15:00",
      venue: "Estadio Nueva York Nueva Jersey",
    },
  },
  MATCH_SCHEDULE = buildMatchSchedule(),
  GROUP_PHASE_IDS = Object.keys(GROUP_MATCHDAY_FIXTURES),
  LATER_ROUNDS = {
    r16: [
      ["m89", "G73", "G74"],
      ["m90", "G75", "G76"],
      ["m91", "G77", "G78"],
      ["m92", "G79", "G80"],
      ["m93", "G81", "G82"],
      ["m94", "G83", "G84"],
      ["m95", "G85", "G86"],
      ["m96", "G87", "G88"],
    ],
    qf: [
      ["m97", "G89", "G90"],
      ["m98", "G91", "G92"],
      ["m99", "G93", "G94"],
      ["m100", "G95", "G96"],
    ],
    sf: [
      ["m101", "G97", "G98"],
      ["m102", "G99", "G100"],
    ],
    third: [["m103", "P101", "P102"]],
    final: [["m104", "G101", "G102"]],
  },
  ALL_BRACKET_MATCHES = [
    ...R32_MATCHES,
    ...LATER_ROUNDS.r16,
    ...LATER_ROUNDS.qf,
    ...LATER_ROUNDS.sf,
    ...LATER_ROUNDS.third,
    ...LATER_ROUNDS.final,
  ],
  state = {
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
    tenantAccessGranted: !1,
    globalGames: null,
    dailyGamePlays: {},
    leaderboardArea: "",
    adminKey: "",
    adminUnlocked: !1,
    currentView: "inicio",
    adminSection: "users",
    defaultScoring: {
      groupPosition: 1,
      knockoutWinner: 3,
      exactScore: 2,
      champion: 10,
    },
    currentTournamentId: "global",
    loadedPredictionForTournament: null,
    currentMiniTournamentId: null,
    userMiniTournaments: {},
    inviteHandled: !1,
  };
function initialTenantId() {
  const e = new URLSearchParams(window.location.search),
    t = window.location.pathname.match(/(?:^|\/)(?:prode\/)?empresa\/([^/]+)/);
  return t
    ? decodeURIComponent(t[1])
    : e.get("empresa") || e.get("tenant") || "";
}
function initialResetToken() {
  const e = new URLSearchParams(window.location.search),
    t = window.location.pathname.match(
      /(?:^|\/)(?:prode\/global\/|prode\/)?reset-password\/([^/]+)/,
    );
  return t ? decodeURIComponent(t[1]) : e.get("resetToken") || "";
}
function escapeHtml(e) {
  return String(e ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function showToast(e, t = !1) {
  let n = document.getElementById("toast-notification");
  (n ||
    ((n = document.createElement("div")),
    (n.id = "toast-notification"),
    (n.style.position = "fixed"),
    (n.style.bottom = "20px"),
    (n.style.left = "50%"),
    (n.style.transform = "translateX(-50%)"),
    (n.style.padding = "12px 24px"),
    (n.style.borderRadius = "8px"),
    (n.style.color = "white"),
    (n.style.zIndex = "10000"),
    (n.style.opacity = "0"),
    (n.style.transition = "opacity 0.4s ease"),
    (n.style.boxShadow = "0 3px 12px rgba(0,0,0,0.25)"),
    document.body.appendChild(n)),
    (n.textContent = e),
    (n.style.backgroundColor = t
      ? "var(--danger, #d71920)"
      : "var(--accent, #0d6b57)"),
    (n.style.opacity = "1"),
    setTimeout(() => {
      n.style.opacity = "0";
    }, 3500));
}
function ensureVerificationCodeModal() {
  let e = document.getElementById("verificationCodeModal");
  return (
    e ||
    ((e = document.createElement("div")),
    (e.className = "modal-backdrop verification-code-modal"),
    (e.id = "verificationCodeModal"),
    (e.hidden = !0),
    (e.innerHTML =
      '\n    <section class="modal-panel verification-code-panel" role="dialog" aria-modal="true" aria-labelledby="verificationCodeTitle">\n      <div class="section-head compact">\n        <div>\n          <h2 id="verificationCodeTitle">Codigo de verificacion</h2>\n          <p id="verificationCodeIntro"></p>\n        </div>\n      </div>\n      <form class="company-login-form verification-code-form" id="verificationCodeForm">\n        <label>\n          PIN\n          <input id="verificationCodeInput" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456">\n        </label>\n        <div class="verification-actions">\n          <button type="button" class="secondary" id="verificationCodeCancel">Cancelar</button>\n          <button type="submit" id="verificationCodeSubmit">Verificar</button>\n        </div>\n        <div class="form-status" id="verificationCodeStatus" hidden></div>\n      </form>\n    </section>'),
    document.body.appendChild(e),
    e)
  );
}
function requestVerificationCode(e) {
  const t = ensureVerificationCodeModal(),
    n = document.getElementById("verificationCodeForm"),
    a = document.getElementById("verificationCodeIntro"),
    o = document.getElementById("verificationCodeInput"),
    s = document.getElementById("verificationCodeStatus"),
    r = document.getElementById("verificationCodeCancel"),
    i = String(e || "").trim();
  return (
    (a.textContent = `Te enviamos un codigo de 6 digitos a ${i}. Revisalo tambien en SPAM.`),
    (o.value = ""),
    (s.hidden = !0),
    (s.textContent = ""),
    (t.hidden = !1),
    setTimeout(() => o.focus(), 0),
    new Promise((e) => {
      const a = (a) => {
          (n.removeEventListener("submit", i),
            r.removeEventListener("click", d),
            t.removeEventListener("click", l),
            (t.hidden = !0),
            e(a));
        },
        i = (e) => {
          e.preventDefault();
          const t = o.value.trim();
          if (!t)
            return (
              (s.hidden = !1),
              (s.textContent = "Ingresa el PIN que recibiste por correo."),
              void o.focus()
            );
          a(t);
        },
        d = () => a(""),
        l = (e) => {
          e.target === t && a("");
        };
      (n.addEventListener("submit", i),
        r.addEventListener("click", d),
        t.addEventListener("click", l));
    })
  );
}
function areaId(e) {
  return String(e || "")
    .trim()
    .toLowerCase();
}
function slugText(e) {
  return String(e || "")
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
function tenantTournamentId(e = state.tenantId) {
  return e ? `empresa-${e}` : "";
}
function loadStoredGlobalSession() {
  try {
    const e = JSON.parse(localStorage.getItem(globalSessionKey()) || "null");
    return e?.token && e?.user ? e : null;
  } catch {
    return null;
  }
}
function saveGlobalSession(e) {
  ((state.globalSession = e),
    localStorage.setItem(globalSessionKey(), JSON.stringify(e)));
}
function clearGlobalSession() {
  (localStorage.removeItem(globalSessionKey()),
    (state.globalSession = null),
    (state.currentMiniTournamentId = null),
    (state.userMiniTournaments = {}),
    (state.adminUnlocked = !1));
}
function loadStoredCompanySession() {
  if (!state.tenantId) return null;
  try {
    const e = JSON.parse(localStorage.getItem(companySessionKey()) || "null");
    return e?.token && e?.user ? e : null;
  } catch {
    return null;
  }
}
function saveCompanySession(e) {
  state.tenantId &&
    ((state.companySession = e),
    localStorage.setItem(companySessionKey(), JSON.stringify(e)));
}
function clearCompanySession() {
  (state.tenantId && localStorage.removeItem(companySessionKey()),
    (state.companySession = null),
    (state.adminUnlocked = !1));
}
function isAdminSession() {
  return Boolean(state.companySession?.user?.isAdmin);
}
function isGlobalAdminSession() {
  return Boolean(
    state.globalSession?.user?.isAdmin ||
    state.globalSession?.user?.isSuperAdmin,
  );
}
function canUseAdminPanel() {
  return isAdminSession() || isGlobalAdminSession() || state.adminUnlocked;
}
function syncAdminNavigation() {
  document.querySelectorAll("[data-admin-tab]").forEach((e) => {
    e.hidden = !canUseAdminPanel();
  });
  const e = document.getElementById("toggleResultsAdmin");
  e && (e.hidden = !canUseAdminPanel());
  const t = document.getElementById("topbarSessionAction");
  t &&
    (t.hidden = !(state.globalSession?.token || state.companySession?.token));
}
function syncTenantNavigation() {
  const e = Boolean(state.tenantId),
    t = document.querySelector('.tab[data-view="lobby"]'),
    n = document.getElementById("lobby");
  t &&
    (t.hidden =
      e && state.tenantAccessGranted && "lobby" !== state.currentView);
  (document.getElementById("globalLogin"),
    document.getElementById("globalSession"),
    document.getElementById("globalTournamentLobby"),
    document.getElementById("createGlobalUserModal"));
  const a = document.getElementById("unlockTournamentModal");
  ((document.body.dataset.authGate =
    e || state.globalSession?.token ? "" : "global"),
    n && (n.hidden = !1),
    e && state.tenantAccessGranted && a && (a.hidden = !0));
}
function updateAdminSections(e = state.adminSection || "users") {
  ("results" !== e ||
    (!state.tenantId && "global" === state.currentTournamentId) ||
    (e = "users"),
    (state.adminSection = e));
  const t = document.getElementById("adminUsersPanel"),
    n = document.getElementById("adminResultsPanel"),
    a = document.getElementById("adminCustomizePanel"),
    o = document.getElementById("adminGamesPanel");
  (t && (t.hidden = "users" !== e),
    n && (n.hidden = "results" !== e),
    a && (a.hidden = "customize" !== e),
    o && (o.hidden = "games" !== e),
    document.querySelectorAll(".admin-subtab").forEach((t) => {
      (t.classList.toggle("is-active", t.dataset.adminSection === e),
        "customize" === t.dataset.adminSection && (t.hidden = !state.tenantId),
        "results" === t.dataset.adminSection &&
          (t.hidden =
            Boolean(state.tenantId) || "global" !== state.currentTournamentId));
    }));
}
function syncTopbarVisibility() {
  const e = document.querySelector(".topbar");
  if (!e) return;
  const t = document.getElementById("companyLogin"),
    n = document.getElementById("globalLogin"),
    a = t && !t.hidden && "predictor" === state.currentView,
    o = n && !n.hidden && "lobby" === state.currentView;
  e.style.display = a || o ? "none" : "";
}
function addTenantToUrl(e) {
  if (!state.tenantId) return e;
  const t = e.includes("?") ? "&" : "?";
  return `${e}${t}${tenantQuery()}`;
}
function applyTenantTheme(e) {
  if (!e) return;
  ((state.tenant = e),
    (state.tenantId = e.id),
    (document.body.dataset.tenant = e.id));
  const t = document.documentElement,
    n = e.theme || {};
  (Object.entries({
    bg: "--bg",
    ink: "--ink",
    muted: "--muted",
    line: "--line",
    panel: "--panel",
    accent: "--accent",
    accent2: "--accent-2",
    gold: "--gold",
    blue: "--blue",
    tintRgb: "--tenant-tint-rgb",
  }).forEach(([e, a]) => {
    n[e] && t.style.setProperty(a, n[e]);
  }),
    n.image && t.style.setProperty("--tenant-image", `url("${n.image}")`));
  const a = document.getElementById("brandEyebrow"),
    o = document.getElementById("brandTitle"),
    s = document.getElementById("brandDescription"),
    r = document.getElementById("brandLogo"),
    i = document.getElementById("loginCompanyLogo");
  (a && (a.textContent = e.eyebrow || e.name),
    o && (o.textContent = e.title || e.name),
    s && ((s.hidden = !e.description), (s.textContent = e.description || "")),
    r && (n.image ? ((r.src = n.image), (r.hidden = !1)) : (r.hidden = !0)),
    i && n.image && ((i.src = n.image), (i.hidden = !1)));
  const d = document.getElementById("tournamentsHeading"),
    l = document.getElementById("tournamentsIntro");
  (d && (d.textContent = "Torneos de empresa"),
    l &&
      (l.textContent = `Tabla global de ${e.name} y minitorneos por area con las mismas predicciones.`),
    (document.title = e.title || e.name),
    (state.companySession = loadStoredCompanySession()),
    state.companySession?.user &&
      ((document.getElementById("playerName").value =
        state.companySession.user.name || ""),
      (document.getElementById("playerEmail").value =
        state.companySession.user.email || "")),
    renderCompanyAuth(),
    syncTenantNavigation(),
    renderCompanyAreas(),
    renderDailyGames(),
    fillAdminThemeForm(),
    fillAdminGamesForm());
}
async function refreshCompanySession() {
  if (state.tenantId && state.companySession?.token) {
    try {
      const e = new URLSearchParams({
          tenant: state.tenantId,
          sessionToken: state.companySession.token,
        }),
        t = await apiJson(`/api/company-session?${e.toString()}`);
      ((state.tenant = t.tenant || state.tenant),
        (state.dailyGamePlays = t.dailyGamePlays || {}),
        saveCompanySession({ token: state.companySession.token, user: t.user }),
        (document.getElementById("playerName").value = t.user.name || ""),
        (document.getElementById("playerEmail").value = t.user.email || ""),
        (state.leaderboardArea = state.leaderboardArea || ""));
    } catch {
      (clearCompanySession(), (state.dailyGamePlays = {}));
    }
    (renderCompanyAuth(), renderCompanyAreas(), renderDailyGames());
  }
}
function renderCompanyAuth() {
  const e = document.getElementById("companyLogin");
  if (!e) return;
  const t = state.companySession;
  ((e.hidden =
    !state.tenantId ||
    Boolean(t) ||
    state.tenantAccessGranted ||
    "predictor" !== state.currentView),
    syncAdminNavigation());
  const n = document.getElementById("companySession"),
    a = document.getElementById("companySessionText"),
    o =
      t?.user || (state.tenantAccessGranted ? state.globalSession?.user : null);
  if ((n && (n.hidden = !state.tenantId || !o), a && o)) {
    const e = o;
    a.textContent = `${e.name || e.email} - ${t?.user?.area || state.tenant?.name || "Empresa"}${t?.user?.isAdmin ? " - Admin" : ""}`;
  }
  const s = document.getElementById("companyLoginForm"),
    r = document.getElementById("companyAreaOptions");
  (r &&
    (r.innerHTML = (state.tenant?.areas || [])
      .map((e) => `<option value="${e}"></option>`)
      .join("")),
    s && (s.hidden = !1));
  const i = document.getElementById("playerName"),
    d = document.getElementById("playerEmail");
  (i && (i.readOnly = Boolean(state.tenantId && t)),
    d && (d.readOnly = Boolean(state.tenantId && t)),
    document.querySelectorAll("[data-session-field]").forEach((e) => {
      e.hidden = !0;
    }),
    document.querySelectorAll("[data-user-context-field]").forEach((e) => {
      e.hidden = !0;
    }),
    syncTopbarVisibility());
}
function logoutCompanyUser() {
  const e = !state.companySession && state.tenantAccessGranted;
  (clearCompanySession(),
    e && (clearGlobalSession(), (state.tenantAccessGranted = !1)),
    (state.dailyGamePlays = {}));
  const t = document.getElementById("playerName"),
    n = document.getElementById("playerEmail");
  (t && ((t.value = ""), (t.readOnly = !1)),
    n && ((n.value = ""), (n.readOnly = !1)),
    renderCompanyAuth(),
    renderCompanyAreas(),
    syncAdminNavigation(),
    openView("predictor"),
    document
      .getElementById("companyLogin")
      ?.scrollIntoView({ behavior: "smooth", block: "center" }));
}
function renderGlobalLobby() {
  const e = document.getElementById("globalLogin"),
    t = document.getElementById("globalSession"),
    n = document.getElementById("globalSessionText"),
    a = document.getElementById("globalTournamentLobby"),
    o = document.getElementById("lobbyAdminActions"),
    s = state.globalSession;
  if (
    (syncTenantNavigation(),
    syncAdminNavigation(),
    e && (e.hidden = Boolean(s)),
    t && (t.hidden = !s),
    n &&
      s?.user &&
      (n.textContent = `${s.user.name || s.user.email} - sesion global`),
    o && (o.hidden = !isGlobalAdminSession()),
    !a)
  )
    return;
  if (
    ((a.hidden = !s),
    document
      .querySelector("#lobby > .section-head")
      ?.toggleAttribute("hidden", !s),
    !s)
  )
    return void (a.innerHTML = "");
  const r = document.getElementById("createLobbyTenantTemplate");
  (r &&
    state.lobbyTemplates?.length &&
    (r.innerHTML = state.lobbyTemplates
      .map(
        (e) =>
          `<option value="${escapeHtml(e.id)}">${escapeHtml(e.name)}</option>`,
      )
      .join("")),
    state.lobbyTournaments.length
      ? ((a.innerHTML = state.lobbyTournaments
          .map((e) => {
            const t = e.hasAccess
                ? `<button class="secondary open-tournament-btn" type="button" data-lobby-open="${escapeHtml(e.id)}" data-tenant-path="${escapeHtml(e.tenantPath || "")}">${e.isGlobal ? "Abrir prode" : "Entrar"}</button>`
                : `<button class="secondary unlock-tournament" type="button" data-tournament-id="${escapeHtml(e.id)}">Desbloquear</button>`,
              n =
                state.globalSession?.user?.isSuperAdmin && !e.isGlobal
                  ? `<button class="secondary danger delete-private-tournament" type="button" style="margin-left:0.5rem;" data-tournament-id="${escapeHtml(e.id)}" data-tournament-name="${escapeHtml(e.name)}">Eliminar</button>`
                  : "";
            return `\n      <article class="tournament-card lobby-card ${e.hasAccess ? "is-open" : "is-locked"}">\n        <div>\n          <small>${escapeHtml(e.lockedLabel || "")}</small>\n          <h3>${escapeHtml(e.name)}</h3>\n          <p>${escapeHtml(e.isGlobal ? "Torneo principal publico" : `${e.templateName || "Competicion"} - privado${e.tenantName ? ` - ${e.tenantName}` : ""}`)}</p>\n        </div>\n        <div class="tournament-actions">\n          <strong>${Number(e.players || 0)} jugadores</strong>\n          ${t}\n          ${n}\n        </div>\n      </article>\n    `;
          })
          .join("")),
        a.querySelectorAll(".unlock-tournament").forEach((e) => {
          e.addEventListener("click", () =>
            unlockTournament(e.dataset.tournamentId),
          );
        }),
        a.querySelectorAll(".open-tournament-btn").forEach((e) => {
          e.addEventListener("click", () => {
            const t = e.dataset.tenantPath;
            if (t) {
              if (state.tenantId && "/prode" === t)
                return void (window.location.href = "/prode/global/");
              if ("/prode" !== t && !window.location.pathname.includes(t))
                return void (window.location.href = t);
            }
            ((state.currentTournamentId = e.dataset.lobbyOpen),
              (document.getElementById("tournamentSelect").value =
                state.currentTournamentId),
              openView("predictor"),
              renderTournamentControls(),
              syncPhaseSelectorForTournament(),
              renderAll(),
              loadLeaderboard(),
              loadMiniTournaments());
          });
        }),
        a.querySelectorAll(".delete-private-tournament").forEach((e) => {
          e.addEventListener("click", async () => {
            const t = e.dataset.tournamentName || "este torneo";
            if (
              !window.confirm(
                `Vas a eliminar "${t}" y sus predicciones. Esta accion no se puede deshacer. ¿Continuar?`,
              )
            )
              return;
            if (
              "ELIMINAR" ===
              window.prompt(
                `Escribi ELIMINAR para confirmar el borrado de "${t}".`,
              )
            )
              try {
                (await deletePrivateTournament(e.dataset.tournamentId),
                  await loadGlobalLobby());
              } catch (e) {
                alert(`No se pudo eliminar el torneo: ${e.message}`);
              }
          });
        }),
        syncTopbarVisibility())
      : (a.innerHTML = '<p class="empty">Cargando torneos...</p>'));
}
async function loadGlobalLobby() {
  const e = new URLSearchParams();
  state.globalSession?.token &&
    e.set("sessionToken", state.globalSession.token);
  const t = await apiJson(`/api/tournament-lobby?${e.toString()}`);
  if (
    (t.user &&
      state.globalSession?.token &&
      saveGlobalSession({ token: state.globalSession.token, user: t.user }),
    (state.lobbyTournaments = t.tournaments || []),
    (state.lobbyTemplates = t.templates || []),
    state.tenantId)
  ) {
    const e = state.lobbyTournaments.find((e) => e.id === tenantTournamentId());
    ((state.tenantAccessGranted = Boolean(e?.hasAccess)),
      state.tenantAccessGranted &&
        "lobby" !== state.currentView &&
        ((state.currentTournamentId = e.id),
        state.globalSession?.user &&
          ((document.getElementById("playerName").value =
            state.globalSession.user.name || ""),
          (document.getElementById("playerEmail").value =
            state.globalSession.user.email || "")),
        openView("predictor")));
  }
  renderGlobalLobby();
}
async function refreshGlobalSession() {
  if (
    ((state.globalSession = loadStoredGlobalSession()),
    !state.globalSession?.token)
  )
    return (
      renderGlobalLobby(),
      void loadGlobalGames().catch(() => renderDailyGames())
    );
  try {
    const e = await apiJson(
      `/api/global-session?sessionToken=${encodeURIComponent(state.globalSession.token)}`,
    );
    saveGlobalSession({ token: state.globalSession.token, user: e.user });
  } catch {
    clearGlobalSession();
  }
  (renderGlobalLobby(), loadGlobalGames().catch(() => renderDailyGames()));
}
async function loginGlobalUser({ name: e, email: t, password: n }) {
  const a = await apiJson("/api/global-login", {
    method: "POST",
    body: JSON.stringify({ name: e, email: t, password: n }),
  });
  return (
    saveGlobalSession({ token: a.token, user: a.user }),
    (state.lobbyTournaments = a.tournaments || []),
    (state.lobbyTemplates = a.templates || state.lobbyTemplates || []),
    renderGlobalLobby(),
    loadGlobalGames().catch(() => renderDailyGames()),
    a.user
  );
}
async function requestPasswordReset(e) {
  return apiJson("/api/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email: e }),
  });
}
async function confirmPasswordReset({ token: e, password: t }) {
  return apiJson("/api/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: e, password: t }),
  });
}
async function registrarGlobalUser({ name: e, email: t, password: n }) {
  if (!/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(n))
    return void showToast(
      "La contraseña debe tener al menos 8 caracteres, una mayuscula y una minuscula.",
      !0,
    );
  const a = document.getElementById("globalRegistrarBtn"),
    o = a.textContent;
  ((a.textContent = "Enviando correo..."), (a.disabled = !0));
  try {
    const s = await apiJson("/api/request-verification", {
      method: "POST",
      body: JSON.stringify({ email: t }),
    });
    if (((a.textContent = o), (a.disabled = !1), s.ok)) {
      const a = await requestVerificationCode(t);
      if (!a)
        return void showToast(
          "Registro cancelado: no ingresaste el codigo de verificacion.",
          !0,
        );
      if (
        (
          await apiJson("/api/verify-code", {
            method: "POST",
            body: JSON.stringify({ email: t, code: a }),
          })
        ).ok
      ) {
        showToast("Correo verificado. Finalizando registro...");
        const a = await apiJson("/api/registrar-global", {
          method: "POST",
          body: JSON.stringify({ name: e, email: t, password: n }),
        });
        return (
          saveGlobalSession({ token: a.token, user: a.user }),
          (state.lobbyTournaments = a.tournaments || []),
          (state.lobbyTemplates = a.templates || state.lobbyTemplates || []),
          renderGlobalLobby(),
          loadGlobalGames().catch(() => renderDailyGames()),
          a.user
        );
      }
      showToast("El codigo ingresado es incorrecto. Intenta nuevamente.", !0);
    } else showToast("No se pudo enviar el correo. Verifica la direccion.", !0);
  } catch (e) {
    ((a.textContent = o),
      (a.disabled = !1),
      showToast("Error de conexion al intentar verificar el correo.", !0));
  }
}
async function createLobbyTenant(e) {
  const t = await apiJson("/api/lobby-tenant", {
    method: "POST",
    body: JSON.stringify({
      ...e,
      sessionToken: state.globalSession?.token || "",
    }),
  });
  if (t.tournament) {
    const e = state.lobbyTournaments.findIndex((e) => e.id === t.tournament.id);
    e >= 0
      ? (state.lobbyTournaments[e] = t.tournament)
      : state.lobbyTournaments.push(t.tournament);
  }
  return (renderGlobalLobby(), t);
}
async function unlockTournament(e) {
  if (!state.globalSession?.token) return void openView("lobby");
  const t = state.lobbyTournaments.find((t) => t.id === e);
  state.pendingUnlockTournamentId = e;
  const n = document.getElementById("unlockTournamentModal"),
    a = document.getElementById("unlockTournamentTitle"),
    o = document.getElementById("unlockTournamentIntro"),
    s = document.getElementById("unlockTournamentPassword"),
    r = document.getElementById("unlockTournamentStatus");
  (a && (a.textContent = `Desbloquear ${t?.name || "torneo"}`),
    o &&
      (o.textContent =
        "Ingresa la clave una sola vez. El permiso queda guardado para tu usuario."),
    r && ((r.hidden = !0), (r.textContent = "")),
    s && (s.value = ""),
    n && ((n.hidden = !1), setTimeout(() => s?.focus(), 0)));
}
async function submitTournamentUnlock() {
  const e = state.pendingUnlockTournamentId,
    t = document.getElementById("unlockTournamentPassword"),
    n = t?.value.trim() || "",
    a = document.getElementById("unlockTournamentStatus");
  if (e)
    if (n) {
      a && ((a.hidden = !1), (a.textContent = "Validando clave..."));
      try {
        const t = await apiJson("/api/tournament-access", {
            method: "POST",
            body: JSON.stringify({
              sessionToken: state.globalSession.token,
              tournamentId: e,
              password: n,
            }),
          }),
          o = state.lobbyTournaments.findIndex(
            (e) => e.id === t.tournament?.id,
          );
        if (
          (o >= 0 && (state.lobbyTournaments[o] = t.tournament),
          renderGlobalLobby(),
          (document.getElementById("unlockTournamentModal").hidden = !0),
          (state.pendingUnlockTournamentId = ""),
          a &&
            ((a.hidden = !1),
            (a.textContent = `Acceso habilitado para ${t.tournament?.name || "el torneo"}.`)),
          t.tenantSession)
        ) {
          (!state.tenantId &&
            t.tournament?.tenantId &&
            ((state.tenantId = t.tournament.tenantId),
            (document.body.dataset.tenant = state.tenantId)),
            saveCompanySession({
              token: t.tenantSession.token,
              user: t.tenantSession.user,
            }),
            (document.getElementById("playerName").value =
              t.tenantSession.user.name || ""),
            (document.getElementById("playerEmail").value =
              t.tenantSession.user.email || ""));
          try {
            await refreshCompanySession();
          } catch (e) {
            (renderCompanyAuth(), renderCompanyAreas(), renderDailyGames());
          }
          (syncAdminNavigation(), await loadLeaderboard());
        }
      } catch (e) {
        a &&
          ((a.hidden = !1),
          (a.textContent = `No se pudo desbloquear: ${e.message}`));
      }
    } else
      a && ((a.hidden = !1), (a.textContent = "Ingresa la clave del torneo."));
}
function renderCompanyAreas() {
  const e = document.getElementById("companyAreas"),
    t = document.getElementById("companyAreaList");
  if (!e || !t) return;
  e.hidden = !state.tenantId;
  const n = state.tenant?.areas || [];
  state.companySession?.user?.area || n[0];
  ((t.innerHTML = [
    `<article class="tournament-card">\n      <div>\n        <h3>Tabla global</h3>\n        <p>Todos los usuarios de ${state.tenant?.name || "la empresa"}</p>\n      </div>\n      <div class="tournament-actions">\n        <button class="secondary view-company-leaderboard" type="button" data-area="">Ver tabla</button>\n      </div>\n    </article>`,
    ...n.map(
      (e) =>
        `\n      <article class="tournament-card">\n        <div>\n          <h3>${e}</h3>\n          <p>Minitorneo del area</p>\n        </div>\n        <div class="tournament-actions">\n          <button class="secondary view-company-leaderboard" type="button" data-area="${e}">Ver tabla</button>\n          <button class="secondary rename-company-area" type="button" data-area="${e}">Editar nombre</button>\n        </div>\n      </article>\n    `,
    ),
  ].join("")),
    t.querySelectorAll(".view-company-leaderboard").forEach((e) => {
      e.addEventListener("click", () => {
        ((state.leaderboardArea = e.dataset.area || ""),
          openTournamentLeaderboard(state.currentTournamentId));
      });
    }),
    t.querySelectorAll(".rename-company-area").forEach((e) => {
      e.addEventListener("click", async () => {
        const t = e.dataset.area || "",
          n = window.prompt("Nuevo nombre del minitorneo:", t);
        if (n && n.trim() !== t)
          try {
            (await updateCompanyArea(t, n.trim()),
              state.leaderboardArea &&
                areaId(state.leaderboardArea) === areaId(t) &&
                (state.leaderboardArea = n.trim()),
              await loadLeaderboard());
          } catch (e) {
            const t = document.getElementById("companyAreaStatus");
            t &&
              ((t.hidden = !1),
              (t.textContent = `No se pudo editar el minitorneo: ${e.message}`));
          }
      });
    }));
}
function todayGameIndex(e) {
  return e ? Math.floor(Date.now() / 864e5) % e : 0;
}
function todayGameKey() {
  return new Date().toISOString().slice(0, 10);
}
function scheduledDailyItem(e) {
  const t = Array.isArray(e) ? e : [];
  return (
    (t.length &&
      (t.find((e) => e.date === todayGameKey()) ||
        t[todayGameIndex(t.length)])) ||
    null
  );
}
function dailyProgressKey(e, t) {
  const n =
    state.companySession?.user?.email ||
    state.globalSession?.user?.email ||
    "guest";
  return `dailyGameProgress:${state.tenantId || "global"}:${n}:${todayGameKey()}:${e}:${t || "default"}`;
}
function readDailyProgress(e, t) {
  try {
    return JSON.parse(localStorage.getItem(dailyProgressKey(e, t)) || "{}");
  } catch {
    return {};
  }
}
function writeDailyProgress(e, t, n) {
  localStorage.setItem(dailyProgressKey(e, t), JSON.stringify(n || {}));
}
function clearDailyProgress(e, t) {
  localStorage.removeItem(dailyProgressKey(e, t));
}
function normalizeGuess(e) {
  return String(e || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function teamColor(e) {
  return (
    {
      argentina: ["#75aadb", "#ffffff", "stripes"],
      francia: ["#1f4f9a", "#ffffff", "solid"],
      brasil: ["#f7d917", "#1d7a4f", "solid"],
      mexico: ["#1d7a4f", "#ffffff", "solid"],
      espana: ["#c52828", "#f7d917", "solid"],
      alemania: ["#ffffff", "#111111", "center"],
      uruguay: ["#78b7e5", "#111111", "solid"],
      portugal: ["#b7192b", "#1d7a4f", "center"],
    }[normalizeGuess(e)] || ["#1f6dad", "#ffffff", "solid"]
  );
}
function renderShirt(e, t = "") {
  const [n, a, o] = teamColor(e?.team || "");
  return `<div class="game-shirt-placeholder shirt-${o}" style="--shirt-primary:${n};--shirt-secondary:${a}">\n    <span class="shirt-neck"></span>\n    <strong id="shirtNumberDisplay">${escapeHtml(
    t ||
      Array.from(String(e?.number || ""))
        .map((e) => (" " === e ? " " : "?"))
        .join(""),
  )}</strong>\n    <small>${escapeHtml(e?.team || e?.tournament || "Mundial")}</small>\n  </div>`;
}
function renderLetterInputs(e, t, n) {
  return `<fieldset class="letter-guess" data-letter-group="${t}">\n    <legend>${n}</legend>\n    <div class="letter-grid">\n      ${Array.from(
    String(e || ""),
  )
    .map((e, a) =>
      " " === e
        ? '<span class="letter-gap"></span>'
        : `<input name="${t}-${a}" maxlength="1" autocomplete="off" aria-label="${n} letra ${a + 1}">`,
    )
    .join("")}\n    </div>\n  </fieldset>`;
}
function readLetterGuess(e, t) {
  return e
    ? Array.from(String(t || ""))
        .map((t, n) =>
          " " === t ? " " : e.querySelector(`[name$="-${n}"]`)?.value || "",
        )
        .join("")
    : "";
}
function paintLetterGuess(e, t, n) {
  if (!e) return;
  const a = normalizeGuess(t);
  Array.from(String(t || "")).forEach((t, o) => {
    if (" " === t) return;
    const s = e.querySelector(`[name$="-${o}"]`);
    if (!s) return;
    const r = normalizeGuess(n[o] || "");
    (s.classList.remove("hit", "near", "miss"),
      s.classList.add(
        r === normalizeGuess(t) ? "hit" : a.includes(r) ? "near" : "miss",
      ));
  });
}
function wireLetterInputs(e) {
  e.querySelectorAll(".letter-grid input").forEach((e) => {
    e.addEventListener("input", () => {
      if (((e.value = e.value.slice(-1)), !e.value)) return;
      const t = Array.from(
        e.closest(".letter-grid")?.querySelectorAll("input") || [],
      );
      t[t.indexOf(e) + 1]?.focus();
    });
  });
}
function fillLetterGuess(e, t, n) {
  e &&
    Array.from(String(t || "")).forEach((t, a) => {
      if (" " === t) return;
      const o = e.querySelector(`[name$="-${a}"]`);
      o && (o.value = String(n || "")[a] || "");
    });
}
async function submitDailyGamePlay(e, t) {
  if (!state.companySession?.token && !state.globalSession?.token)
    throw new Error("Primero ingresa con tu usuario.");
  const n = await apiJson("/api/daily-game-play", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      gameType: e,
      guess: t,
    }),
  });
  return (
    (state.dailyGamePlays = n.dailyGamePlays || state.dailyGamePlays || {}),
    n
  );
}
function renderDailyGames() {
  const e = document.getElementById("dailyGames");
  if (!e) return;
  const t = e.closest(".home-games");
  t && (t.hidden = !1);
  const n = state.tenantId ? state.tenant?.games : state.globalGames,
    a = document.getElementById("dailyGamesTitle"),
    o = document.getElementById("dailyGamesIntro"),
    s = document.getElementById("dailyGamesMeta");
  if (
    (a &&
      (a.textContent =
        n?.title ||
        (state.tenantId ? "Juegos diarios" : "Centro de minijuegos")),
    o &&
      (o.textContent =
        n?.intro || "Desafios rapidos para sumar ritmo al prode diario."),
    s)
  ) {
    const e = n?.rewardName || "Fan Points",
      t = Number(n?.points?.camisetadle || 0),
      a = Number(n?.points?.desafio || 0);
    s.innerHTML = `\n      <span>${escapeHtml(state.tenant?.name || "Global")}</span>\n      <span>Camisetadle +${t} ${escapeHtml(e)}</span>\n      <span>Desafio +${a} ${escapeHtml(e)}</span>\n    `;
  }
  if (!n?.enabled)
    return void (e.innerHTML =
      '<p class="empty">Los juegos diarios todavia no estan activos.</p>');
  const r = scheduledDailyItem(Array.isArray(n.camisetas) ? n.camisetas : []),
    i = scheduledDailyItem(Array.isArray(n.desafios) ? n.desafios : []),
    d = readDailyProgress("camisetadle", r?.id),
    l = readDailyProgress("desafio", i?.id),
    m = Boolean(state.dailyGamePlays?.camisetadle?.completed),
    c = Boolean(state.dailyGamePlays?.desafio?.completed);
  let u = m
    ? String(r?.number || "")
    : d.revealedNumber ||
      Array.from(String(r?.number || ""))
        .map((e) => (" " === e ? " " : "?"))
        .join("");
  const p = c
    ? (i?.clues || []).length
    : Math.max(1, Number(l.visibleClues || 1));
  e.innerHTML = `\n    <article class="game-card camisetadle-card ${m ? "is-completed" : ""}">\n      <div>\n        <p class="eyebrow">Camisetadle</p>\n        <h3>Adivina camiseta, numero y jugador</h3>\n        <p>${escapeHtml(r?.hint || "Desafio diario de camisetas mundialistas.")}</p>\n      </div>\n      <div class="game-shirt-frame">${renderShirt(r, u)}</div>\n      <form class="camisetadle-form" id="camisetadleForm">\n        ${renderLetterInputs(r?.player || "", "player", "Jugador")}\n        ${renderLetterInputs(r?.number || "", "number", "Numero")}\n        <button ${m ? "disabled" : ""}>${m ? "Completado" : "Probar"}</button>\n      </form>\n      <div class="game-result" id="camisetadleResult">${m && r ? `Completado: ${escapeHtml(r.player)} #${escapeHtml(r.number)}${r.team ? `, ${escapeHtml(r.team)}` : ""}.` : ""}</div>\n      ${m && r ? `\n        <div class="game-completed-panel">\n          <span class="game-completed-badge">Completado</span>\n          <strong>${escapeHtml(r.player)} #${escapeHtml(r.number)}</strong>\n          <small>${escapeHtml(r.team || r.tournament || "Desafio diario")}</small>\n        </div>\n      ` : ""}\n    </article>\n    <article class="game-card stadium-card ${c ? "is-completed" : ""}">\n      <div>\n        <p class="eyebrow">${escapeHtml(i?.type || "Desafio")}</p>\n        <h3>${escapeHtml(i?.title || "Adivina el desafio")}</h3>\n        <p>${escapeHtml(i?.subtitle || "Usa las pistas del dia.")}</p>\n      </div>\n      <div class="stadium-clues" id="challengeClues">${(
    i?.clues || ["Pista no cargada"]
  )
    .slice(0, p)
    .map((e) => `<p>${escapeHtml(e)}</p>`)
    .join(
      "",
    )}</div>\n      <form class="game-guess-form stadium-guess-form" id="challengeForm">\n        ${renderLetterInputs(i?.answer || "", "challenge", "Respuesta")}\n        <button ${c ? "disabled" : ""}>${c ? "Completado" : "Probar"}</button>\n      </form>\n      <div class="game-result" id="challengeResult">${c && i ? `Completado: ${escapeHtml(i.answer)}${i.subtitle ? `, ${escapeHtml(i.subtitle)}` : ""}.` : ""}</div>\n      ${c && i ? `\n        <div class="game-completed-panel">\n          <span class="game-completed-badge">Completado</span>\n          <strong>${escapeHtml(i.answer)}</strong>\n          <small>${escapeHtml(i.subtitle || i.type || "Desafio diario")}</small>\n        </div>\n      ` : ""}\n    </article>\n  `;
  const g = document.getElementById("camisetadleForm");
  if (g) {
    const e = g.querySelector('[data-letter-group="player"]'),
      t = g.querySelector('[data-letter-group="number"]');
    (fillLetterGuess(
      e,
      r?.player || "",
      m ? r?.player || "" : d.playerGuess || "",
    ),
      fillLetterGuess(
        t,
        r?.number || "",
        m ? r?.number || "" : d.numberGuess || "",
      ),
      m
        ? g.querySelectorAll("input").forEach((e) => {
            ((e.disabled = !0), e.classList.add("hit"));
          })
        : (wireLetterInputs(g),
          g.querySelectorAll("input").forEach((n) => {
            n.addEventListener("input", () => {
              const n = readLetterGuess(e, r?.player || ""),
                a = readLetterGuess(t, r?.number || "");
              writeDailyProgress("camisetadle", r?.id, {
                ...readDailyProgress("camisetadle", r?.id),
                playerGuess: n,
                numberGuess: a,
                revealedNumber: u,
              });
            });
          })));
  }
  g?.addEventListener("submit", (e) => {
    if ((e.preventDefault(), !r || m)) return;
    const t = e.currentTarget,
      n = t.querySelector('[data-letter-group="player"]'),
      a = t.querySelector('[data-letter-group="number"]'),
      o = readLetterGuess(n, r.player),
      s = readLetterGuess(a, r.number),
      i = normalizeGuess(o) === normalizeGuess(r.player),
      d = normalizeGuess(s) === normalizeGuess(r.number);
    (paintLetterGuess(n, r.player, o),
      paintLetterGuess(a, r.number, s),
      (u = Array.from(String(r.number || ""))
        .map((e, t) =>
          " " === e
            ? " "
            : normalizeGuess(s[t] || "") === normalizeGuess(e)
              ? e
              : u[t] || "?",
        )
        .join("")));
    const l = document.getElementById("shirtNumberDisplay");
    l && (l.textContent = u);
    const c = document.getElementById("camisetadleResult");
    (writeDailyProgress("camisetadle", r.id, {
      playerGuess: o,
      numberGuess: s,
      revealedNumber: u,
    }),
      i && d
        ? submitDailyGamePlay("camisetadle", { player: o, number: s })
            .then(() => {
              ((state.dailyGamePlays.camisetadle = { completed: !0 }),
                clearDailyProgress("camisetadle", r.id),
                sumarFanPoints(20),
                renderDailyGames());
            })
            .catch((e) => {
              c.textContent = e.message;
            })
        : (c.textContent = `Jugador ${i ? "bien" : "todavia no"} - numero ${d ? "bien" : "todavia no"}.`));
  });
  let y = Number(l.attempts || 0);
  const f = document.getElementById("challengeForm");
  if (f) {
    const e = f.querySelector('[data-letter-group="challenge"]');
    (fillLetterGuess(e, i?.answer || "", c ? i?.answer || "" : l.answer || ""),
      c
        ? f.querySelectorAll("input").forEach((e) => {
            ((e.disabled = !0), e.classList.add("hit"));
          })
        : (wireLetterInputs(f),
          f.querySelectorAll("input").forEach((t) => {
            t.addEventListener("input", () => {
              const t = readLetterGuess(e, i?.answer || "");
              writeDailyProgress("desafio", i?.id, {
                ...readDailyProgress("desafio", i?.id),
                answer: t,
                attempts: y,
                visibleClues: Math.max(
                  1,
                  Number(readDailyProgress("desafio", i?.id).visibleClues || 1),
                ),
              });
            });
          })));
  }
  document.getElementById("challengeForm")?.addEventListener("submit", (e) => {
    if ((e.preventDefault(), !i || c)) return;
    y += 1;
    const t = e.currentTarget.querySelector('[data-letter-group="challenge"]'),
      n = readLetterGuess(t, i.answer).trim(),
      a = document.getElementById("challengeResult"),
      o = document.getElementById("challengeClues");
    if (
      (paintLetterGuess(t, i.answer, n),
      normalizeGuess(n) === normalizeGuess(i.answer))
    )
      return void submitDailyGamePlay("desafio", { answer: n })
        .then(() => {
          ((state.dailyGamePlays.desafio = { completed: !0 }),
            clearDailyProgress("desafio", i.id),
            sumarFanPoints(15),
            renderDailyGames());
        })
        .catch((e) => {
          a.textContent = e.message;
        });
    const s = Math.min((i.clues || []).length, y + 1);
    (writeDailyProgress("desafio", i.id, {
      answer: n,
      attempts: y,
      visibleClues: s,
    }),
      (o.innerHTML = (i.clues || [])
        .slice(0, s)
        .map((e) => `<p>${escapeHtml(e)}</p>`)
        .join("")),
      (a.textContent = "Todavia no. Se habilito otra pista."));
  });
}
async function loadGlobalGames() {
  if (state.tenantId) return;
  const e = new URLSearchParams();
  state.globalSession?.token &&
    e.set("sessionToken", state.globalSession.token);
  const t = await apiJson(`/api/global-games?${e.toString()}`);
  ((state.globalGames = t.games || state.globalGames),
    (state.dailyGamePlays = t.dailyGamePlays || state.dailyGamePlays || {}),
    renderDailyGames());
}
async function loadTenant() {
  const e = initialTenantId();
  if (e) {
    state.tenantId = e;
    try {
      (applyTenantTheme(
        (await apiJson(`/api/tenant?tenant=${encodeURIComponent(e)}`)).tenant,
      ),
        await refreshCompanySession());
    } catch (t) {
      console.warn(`No se pudo cargar la empresa ${e}: ${t.message}`);
    }
  }
}
function joinedTournamentCodes() {
  try {
    return JSON.parse(localStorage.getItem("joinedTournamentCodes") || "[]");
  } catch {
    return [];
  }
}
function rememberTournamentCode(e) {
  const t = String(e || "")
    .trim()
    .toUpperCase();
  if (!t || "GLOBAL" === t) return;
  const n = joinedTournamentCodes();
  n.includes(t) ||
    (n.push(t),
    localStorage.setItem("joinedTournamentCodes", JSON.stringify(n)));
}
function rememberCreatorKey(e, t) {
  e && t && localStorage.setItem(`creatorKey:${e}`, t);
}
function creatorKeyFor(e) {
  return localStorage.getItem(`creatorKey:${e}`) || "";
}
function invitePathFor(e) {
  return e.invitePath || `/join/${encodeURIComponent(e.code || "")}`;
}
async function loadTemplates() {
  const e = await apiJson("/api/templates");
  ((state.templates = e.templates || []),
    (state.phases = e.phases || [
      { id: "all", name: "Prode completo", type: "all" },
    ]),
    (state.defaultScoring = e.defaultScoring || state.defaultScoring));
  const t = document.getElementById("templateSelect");
  if (t) {
    t.innerHTML = state.templates
      .map((e) => `<option value="${e.id}">${e.name}</option>`)
      .join("");
    const e = () => {
      const e = state.templates.find((e) => e.id === t.value);
      e && (document.getElementById("modeSelect").value = e.mode);
      const n = document.getElementById("customTeamsField");
      n && (n.hidden = "custom" !== t.value);
    };
    (t.addEventListener("change", e), e());
  }
  renderPhaseSelector();
}
function initialTournamentCode() {
  const e = new URLSearchParams(window.location.search),
    t = window.location.pathname.match(/^\/join\/([^/]+)/);
  return t
    ? decodeURIComponent(t[1])
    : e.get("torneo") || e.get("tournament") || "";
}
function initialContinueToken() {
  const e = new URLSearchParams(window.location.search),
    t = window.location.pathname.match(/^\/continuar\/([^/]+)/);
  return t
    ? decodeURIComponent(t[1])
    : e.get("continuar") || e.get("token") || "";
}
function phaseFromUrl() {
  const e = new URLSearchParams(window.location.search).get("fase") || "";
  return "groups" === e ? "group1" : e;
}
function isPredictionEmpty(e) {
  if (!e) return !0;
  if (e.custom) {
    if (e.custom.champion) return !1;
    if (
      Object.values(e.custom.matches || {}).some(
        (e) => "" !== e.homeScore || "" !== e.awayScore || e.winner,
      )
    )
      return !1;
  }
  return (
    !Object.values(e.groups || {})
      .flat()
      .some(Boolean) &&
    !Object.values(e.groupMatches || {}).some(
      (e) => "" !== e.home || "" !== e.away,
    ) &&
    !Object.values(e.winners || {}).some(Boolean) &&
    !Object.values(e.scores || {}).some((e) => "" !== e.left || "" !== e.right)
  );
}
function createEmptyTournament() {
  return {
    groups: Object.fromEntries(
      Object.keys(WORLD_CUP_GROUPS).map((e) => [e, ["", "", "", ""]]),
    ),
    groupMatches: {},
    thirdAssignments: {},
    winners: {},
    scores: {},
    custom: { champion: "", matches: {} },
  };
}
function groupKeys() {
  return Object.keys(WORLD_CUP_GROUPS);
}
function teamLabel(e) {
  const t = String(e || "");
  return FIFA_CODES[t] || TEAM_DISPLAY_NAMES[teamKey(t)] || t;
}
function teamKey(e) {
  return String(e || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’]/g, "")
    .replace(/\b(fc|cf|afc|sc|sk|bc|club|de|del|la|the)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}
function generatedCrestUrl(e) {
  const t = teamKey(e),
    n = ARGENTINA_CREST_COLORS[t];
  if (!n) return "";
  const a = String(e || "")
      .split(/\s+/)
      .filter((e) => !/^(club|de|del|la)$/i.test(e))
      .map((e) => e[0])
      .join("")
      .slice(0, 3)
      .toUpperCase(),
    [o, s] = n;
  return `data:image/svg+xml,${encodeURIComponent(`\n    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n      <path d="M9 7h46v24c0 14.8-9.6 24.3-23 29C18.6 55.3 9 45.8 9 31V7z" fill="${o}" stroke="#1f2937" stroke-width="3"/>\n      <path d="M14 12h36v11H14z" fill="${s}" opacity=".95"/>\n      <path d="M14 34h36v7H14z" fill="${s}" opacity=".95"/>\n      <text x="32" y="32" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="${"#ffffff" === o ? "#111827" : "#ffffff"}">${a}</text>\n    </svg>`.replace(/\s+/g, " ").trim())}`;
}
function flagUrl(e) {
  const t = FLAG_CODES[e];
  return t ? `https://flagcdn.com/w40/${t}.png` : "";
}
function crestUrl(e) {
  const t = String(e || "");
  if (!t) return "";
  if (CREST_URLS[t]) return CREST_URLS[t];
  if (CREST_URLS_BY_KEY[teamKey(t)]) return CREST_URLS_BY_KEY[teamKey(t)];
  const n = generatedCrestUrl(t);
  if (n) return n;
  const a = (tournamentDefinition().fixtures || []).find(
    (e) => e.home === t || e.away === t,
  );
  return a ? (a.home === t ? a.homeCrest || "" : a.awayCrest || "") : "";
}
function flagBackgroundUrl(e) {
  const t = FLAG_CODES[e];
  return t ? `https://flagcdn.com/w160/${t}.png` : "";
}
function setFlagBackground(e, t, n = "--team-flag") {
  const a = flagBackgroundUrl(t);
  e &&
    a &&
    (e.classList.add("has-flag-bg"), e.style.setProperty(n, `url("${a}")`));
}
function teamBadge(e) {
  if (!e) return "";
  const t = crestUrl(e) || flagUrl(e),
    n = teamLabel(e),
    a = String(e)
      .split(/\s+/)
      .map((e) => e[0])
      .join("")
      .slice(0, 3)
      .toUpperCase(),
    o = `<span class="flag-placeholder">${escapeHtml(a)}</span>`,
    s = `const s=document.createElement('span');s.className='flag-placeholder';s.textContent='${escapeHtml(a)}';this.replaceWith(s);`;
  return `<span class="team-badge">${t ? `<img class="flag" src="${escapeHtml(t)}" alt="" onerror="${escapeHtml(s)}">` : o}<span>${escapeHtml(n)}</span></span>`;
}
function groupMatchId(e, t, n) {
  return `${e}-${t}-${n}`;
}
function buildMatchSchedule() {
  const e = { ...KNOCKOUT_SCHEDULE };
  return (
    [
      {
        n: 1,
        id: "A-0-2",
        d: "11 de Jun",
        t: "16:00",
        v: "Estadio Ciudad de México",
      },
      {
        n: 2,
        id: "A-1-3",
        d: "11 de Jun",
        t: "23:00",
        v: "Estadio Guadalajara",
      },
      { n: 3, id: "B-0-3", d: "12 de Jun", t: "16:00", v: "Estadio Toronto" },
      {
        n: 4,
        id: "D-0-1",
        d: "12 de Jun",
        t: "22:00",
        v: "Estadio Los Ángeles",
      },
      {
        n: 5,
        id: "B-2-1",
        d: "13 de Jun",
        t: "16:00",
        v: "Estadio Bahía de San Francisco",
      },
      {
        n: 6,
        id: "C-0-1",
        d: "13 de Jun",
        t: "19:00",
        v: "Estadio Nueva York Nueva Jersey",
      },
      { n: 7, id: "C-3-2", d: "13 de Jun", t: "22:00", v: "Estadio Boston" },
      {
        n: 8,
        id: "D-2-3",
        d: "14 de Jun",
        t: "01:00",
        v: "Estadio BC Place Vancouver",
      },
      { n: 9, id: "E-0-3", d: "14 de Jun", t: "14:00", v: "Estadio Houston" },
      { n: 10, id: "F-0-1", d: "14 de Jun", t: "17:00", v: "Estadio Dallas" },
      {
        n: 11,
        id: "E-2-1",
        d: "14 de Jun",
        t: "20:00",
        v: "Estadio Filadelfia",
      },
      {
        n: 12,
        id: "F-3-2",
        d: "14 de Jun",
        t: "23:00",
        v: "Estadio Monterrey",
      },
      { n: 13, id: "H-0-3", d: "15 de Jun", t: "13:00", v: "Estadio Atlanta" },
      { n: 14, id: "G-0-2", d: "15 de Jun", t: "16:00", v: "Estadio Seattle" },
      { n: 15, id: "H-2-1", d: "15 de Jun", t: "19:00", v: "Estadio Miami" },
      {
        n: 16,
        id: "G-1-3",
        d: "15 de Jun",
        t: "22:00",
        v: "Estadio Los Ángeles",
      },
      {
        n: 17,
        id: "I-0-1",
        d: "16 de Jun",
        t: "16:00",
        v: "Estadio Nueva York Nueva Jersey",
      },
      { n: 18, id: "I-3-2", d: "16 de Jun", t: "19:00", v: "Estadio Boston" },
      {
        n: 19,
        id: "J-0-2",
        d: "16 de Jun",
        t: "22:00",
        v: "Estadio Kansas City",
      },
      {
        n: 20,
        id: "J-1-3",
        d: "17 de Jun",
        t: "01:00",
        v: "Estadio Bahía de San Francisco",
      },
      { n: 21, id: "K-0-3", d: "17 de Jun", t: "14:00", v: "Estadio Houston" },
      { n: 22, id: "L-0-1", d: "17 de Jun", t: "17:00", v: "Estadio Dallas" },
      { n: 23, id: "L-2-3", d: "17 de Jun", t: "20:00", v: "Estadio Toronto" },
      {
        n: 24,
        id: "K-2-1",
        d: "17 de Jun",
        t: "23:00",
        v: "Estadio Ciudad de México",
      },
      { n: 25, id: "A-3-2", d: "18 de Jun", t: "13:00", v: "Estadio Atlanta" },
      {
        n: 26,
        id: "B-1-3",
        d: "18 de Jun",
        t: "16:00",
        v: "Estadio Los Ángeles",
      },
      {
        n: 27,
        id: "B-0-2",
        d: "18 de Jun",
        t: "19:00",
        v: "Estadio BC Place Vancouver",
      },
      {
        n: 28,
        id: "A-0-1",
        d: "18 de Jun",
        t: "22:00",
        v: "Estadio Guadalajara",
      },
      { n: 29, id: "D-0-2", d: "19 de Jun", t: "16:00", v: "Estadio Seattle" },
      { n: 30, id: "C-2-1", d: "19 de Jun", t: "19:00", v: "Estadio Boston" },
      {
        n: 31,
        id: "C-0-3",
        d: "19 de Jun",
        t: "22:00",
        v: "Estadio Filadelfia",
      },
      {
        n: 32,
        id: "D-3-1",
        d: "20 de Jun",
        t: "01:00",
        v: "Estadio Bahía de San Francisco",
      },
      { n: 33, id: "F-0-3", d: "20 de Jun", t: "14:00", v: "Estadio Houston" },
      { n: 34, id: "E-0-2", d: "20 de Jun", t: "17:00", v: "Estadio Toronto" },
      {
        n: 35,
        id: "E-1-3",
        d: "20 de Jun",
        t: "23:00",
        v: "Estadio Kansas City",
      },
      {
        n: 36,
        id: "F-2-1",
        d: "21 de Jun",
        t: "01:00",
        v: "Estadio Monterrey",
      },
      { n: 37, id: "H-0-2", d: "21 de Jun", t: "13:00", v: "Estadio Atlanta" },
      {
        n: 38,
        id: "G-0-1",
        d: "21 de Jun",
        t: "16:00",
        v: "Estadio Los Ángeles",
      },
      { n: 39, id: "H-1-3", d: "21 de Jun", t: "19:00", v: "Estadio Miami" },
      {
        n: 40,
        id: "G-3-2",
        d: "21 de Jun",
        t: "22:00",
        v: "Estadio BC Place Vancouver",
      },
      { n: 41, id: "J-0-1", d: "22 de Jun", t: "14:00", v: "Estadio Dallas" },
      {
        n: 42,
        id: "I-0-3",
        d: "22 de Jun",
        t: "18:00",
        v: "Estadio Filadelfia",
      },
      {
        n: 43,
        id: "I-2-1",
        d: "22 de Jun",
        t: "21:00",
        v: "Estadio Nueva York Nueva Jersey",
      },
      {
        n: 44,
        id: "J-3-2",
        d: "23 de Jun",
        t: "00:00",
        v: "Estadio Bahía de San Francisco",
      },
      { n: 45, id: "K-0-2", d: "23 de Jun", t: "14:00", v: "Estadio Houston" },
      { n: 46, id: "L-0-2", d: "23 de Jun", t: "17:00", v: "Estadio Boston" },
      { n: 47, id: "L-3-1", d: "23 de Jun", t: "20:00", v: "Estadio Toronto" },
      {
        n: 48,
        id: "K-1-3",
        d: "23 de Jun",
        t: "23:00",
        v: "Estadio Guadalajara",
      },
      {
        n: 49,
        id: "B-1-0",
        d: "24 de Jun",
        t: "16:00",
        v: "Estadio BC Place Vancouver",
      },
      { n: 50, id: "B-3-2", d: "24 de Jun", t: "16:00", v: "Estadio Seattle" },
      { n: 51, id: "C-2-0", d: "24 de Jun", t: "19:00", v: "Estadio Miami" },
      { n: 52, id: "C-1-3", d: "24 de Jun", t: "19:00", v: "Estadio Atlanta" },
      {
        n: 53,
        id: "A-3-0",
        d: "24 de Jun",
        t: "22:00",
        v: "Estadio Ciudad de México",
      },
      {
        n: 54,
        id: "A-2-1",
        d: "24 de Jun",
        t: "22:00",
        v: "Estadio Monterrey",
      },
      {
        n: 55,
        id: "E-3-2",
        d: "25 de Jun",
        t: "17:00",
        v: "Estadio Filadelfia",
      },
      {
        n: 56,
        id: "E-1-0",
        d: "25 de Jun",
        t: "17:00",
        v: "Estadio Nueva York Nueva Jersey",
      },
      { n: 57, id: "F-1-3", d: "25 de Jun", t: "20:00", v: "Estadio Dallas" },
      {
        n: 58,
        id: "F-2-0",
        d: "25 de Jun",
        t: "20:00",
        v: "Estadio Kansas City",
      },
      {
        n: 60,
        id: "D-1-2",
        d: "25 de Jun",
        t: "23:00",
        v: "Estadio Bahía de San Francisco",
      },
      {
        n: 59,
        id: "D-3-0",
        d: "25 de Jun",
        t: "23:00",
        v: "Estadio Los Ángeles",
      },
      { n: 61, id: "I-2-0", d: "26 de Jun", t: "16:00", v: "Estadio Boston" },
      { n: 62, id: "I-1-3", d: "26 de Jun", t: "16:00", v: "Estadio Toronto" },
      { n: 63, id: "H-3-2", d: "26 de Jun", t: "21:00", v: "Estadio Houston" },
      {
        n: 64,
        id: "H-1-0",
        d: "26 de Jun",
        t: "21:00",
        v: "Estadio Guadalajara",
      },
      { n: 65, id: "G-2-1", d: "27 de Jun", t: "00:00", v: "Estadio Seattle" },
      {
        n: 66,
        id: "G-3-0",
        d: "27 de Jun",
        t: "00:00",
        v: "Estadio BC Place Vancouver",
      },
      {
        n: 67,
        id: "L-3-0",
        d: "27 de Jun",
        t: "18:00",
        v: "Estadio Nueva York Nueva Jersey",
      },
      {
        n: 68,
        id: "L-1-2",
        d: "27 de Jun",
        t: "18:00",
        v: "Estadio Filadelfia",
      },
      { n: 69, id: "K-1-0", d: "27 de Jun", t: "20:30", v: "Estadio Miami" },
      { n: 70, id: "K-3-2", d: "27 de Jun", t: "20:30", v: "Estadio Atlanta" },
      {
        n: 71,
        id: "J-2-1",
        d: "27 de Jun",
        t: "23:00",
        v: "Estadio Kansas City",
      },
      { n: 72, id: "J-3-0", d: "27 de Jun", t: "23:00", v: "Estadio Dallas" },
    ].forEach((t) => {
      e[t.id] = { number: t.n, date: t.d, time: t.t, venue: t.v };
    }),
    e
  );
}
function groupMatchIdsForPhase(e) {
  const t = GROUP_MATCHDAY_FIXTURES[e];
  return Array.isArray(t) ? t : [];
}
function groupFixtures(e, t = "") {
  return (
    GROUP_MATCHDAY_FIXTURES[t] || [
      ...GROUP_MATCHDAY_FIXTURES.group1,
      ...GROUP_MATCHDAY_FIXTURES.group2,
      ...GROUP_MATCHDAY_FIXTURES.group3,
    ]
  )
    .filter((t) => t.startsWith(`${e}-`))
    .map((t) => {
      const n = t.split("-"),
        a = parseInt(n[1], 10),
        o = parseInt(n[2], 10);
      return {
        id: t,
        home: WORLD_CUP_GROUPS[e][a],
        away: WORLD_CUP_GROUPS[e][o],
      };
    });
}
function getScheduleHtml(e) {
  const t = MATCH_SCHEDULE[e];
  if (!t) return "";
  const n = t.number ? `Partido ${t.number}` : e.toUpperCase(),
    a = [[t.date, t.time].filter(Boolean).join(", "), t.venue]
      .filter(Boolean)
      .join(" - ");
  return `<small class="match-schedule">${n}${a ? ` | ${a}` : ""}</small>`;
}
const MONTH_MAP = { Jun: "06", Jul: "07" };
function isMatchTimeLocked(e) {
  const t = MATCH_SCHEDULE[e];
  if (!t || !t.date || !t.time) return !1;
  const n = t.date.split(" de "),
    a = n[0].padStart(2, "0"),
    o = MONTH_MAP[n[1]];
  if (!o) return !1;
  const s = new Date(`2026-${o}-${a}T${t.time}:00-03:00`);
  return !Number.isNaN(s.getTime()) && Date.now() >= s.getTime() - 18e5;
}
function getGroupMatch(e, t, n = "", a = "") {
  return (
    e.groupMatches || (e.groupMatches = {}),
    e.groupMatches[t] || (e.groupMatches[t] = { home: "", away: "" }),
    (e.groupMatches[t].homeTeam = n || e.groupMatches[t].homeTeam || ""),
    (e.groupMatches[t].awayTeam = a || e.groupMatches[t].awayTeam || ""),
    e.groupMatches[t]
  );
}
function numericScore(e) {
  if ("" === e || null == e) return null;
  const t = Number(e);
  return Number.isFinite(t) ? t : null;
}
function matchScores(e) {
  const t = "" !== e.home && null !== e.home && void 0 !== e.home,
    n = "" !== e.away && null !== e.away && void 0 !== e.away;
  return t || n
    ? { home: numericScore(t ? e.home : 0), away: numericScore(n ? e.away : 0) }
    : null;
}
function groupStandings(e, t) {
  const n = Object.fromEntries(
    WORLD_CUP_GROUPS[t].map((e) => [
      e,
      { team: e, pts: 0, gf: 0, ga: 0, gd: 0 },
    ]),
  );
  return (
    groupFixtures(t).forEach((t) => {
      const a = matchScores(getGroupMatch(e, t.id, t.home, t.away));
      a &&
        null !== a.home &&
        null !== a.away &&
        ((n[t.home].gf += a.home),
        (n[t.home].ga += a.away),
        (n[t.away].gf += a.away),
        (n[t.away].ga += a.home),
        a.home > a.away
          ? (n[t.home].pts += 3)
          : a.away > a.home
            ? (n[t.away].pts += 3)
            : ((n[t.home].pts += 1), (n[t.away].pts += 1)));
    }),
    Object.values(n)
      .map((e) => ({ ...e, gd: e.gf - e.ga }))
      .sort(
        (e, t) =>
          t.pts - e.pts ||
          t.gd - e.gd ||
          t.gf - e.gf ||
          e.team.localeCompare(t.team),
      )
  );
}
function applyGroupStandings(e, t) {
  ((e.groups[t] = groupStandings(e, t).map((e) => e.team)),
    pruneDependentWinners(e, 0),
    autoAssignThirdsIfPossible(e));
}
function syncGroupScoresFromDom(e, t) {
  e.querySelectorAll("[data-group-match-id]").forEach((e) => {
    getGroupMatch(
      t,
      e.dataset.groupMatchId,
      e.dataset.homeTeam,
      e.dataset.awayTeam,
    )[e.dataset.side] = e.value;
  });
}
function standingsMarkup(e, t) {
  return groupStandings(e, t)
    .map(
      (e, t) =>
        `\n    <div class="standings-row">\n      <b>${t + 1}</b>\n      <span>${teamLabel(e.team)}</span>\n      <strong>${e.pts}</strong>\n      <small>${e.gd >= 0 ? "+" : ""}${e.gd}</small>\n      <small>${e.gf}</small>\n    </div>\n  `,
    )
    .join("");
}
function isEntryClosed() {
  return Date.now() > new Date(APP_CONFIG.entryDeadline).getTime();
}
function formatDeadline() {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(APP_CONFIG.entryDeadline));
}
function currentPhase() {
  const e = activePhases();
  return (
    e.find((e) => e.id === state.currentPhaseId) ||
    e[0] || { id: "all", name: "Prode completo", type: "all" }
  );
}
function activePhases() {
  if (usesWorldCupEditor()) return state.phases;
  const e = customFixtures(tournamentDefinition());
  return [
    { id: "all", name: "Todas las fechas", type: "all" },
    ...[...new Set(e.map((e) => e.round || "Partidos").filter(Boolean))].map(
      (e, t) => ({
        id: `custom-round-${t + 1}`,
        name: e,
        type: "custom-round",
        round: e,
      }),
    ),
  ];
}
function renderPhaseSelector() {
  const e = document.getElementById("predictionPhase");
  if (!e) return;
  const t = activePhases().filter((e) => "all" !== e.id);
  (t.some((e) => e.id === state.currentPhaseId) ||
    (state.currentPhaseId = t[0]?.id || "all"),
    (e.innerHTML = t
      .map(
        (e) =>
          `<option value="${escapeHtml(e.id)}">${escapeHtml(e.name)}</option>`,
      )
      .join("")),
    (e.value = state.currentPhaseId),
    (e.disabled = !1),
    renderPhaseStatus());
}
function syncPhaseSelectorForTournament() {
  const e = activePhases(),
    t = e.find((e) => "all" !== e.id);
  ((e.some((e) => e.id === state.currentPhaseId) &&
    "all" !== state.currentPhaseId) ||
    (state.currentPhaseId = usesWorldCupEditor() ? "group1" : t?.id || "all"),
    renderPhaseSelector());
}
function renderPhaseStatus() {
  const e = document.getElementById("phaseStatus");
  e && ((e.textContent = ""), (e.hidden = !0));
}
function setPredictionLocked(e) {
  const t = document.getElementById("lockBanner");
  t && (t.hidden = !0);
}
function currentTournament() {
  return (
    state.tournaments.find((e) => e.id === state.currentTournamentId) ||
    state.tournaments[0]
  );
}
function tournamentDefinition(e = currentTournament()) {
  const t = state.templates.find((t) => t.id === e?.templateId) || {};
  return {
    id: e?.templateId || t.id || "worldcup-2026",
    name:
      e?.customTemplate?.name || e?.templateName || t.name || "Mundial 2026",
    mode: e?.customTemplate?.mode || e?.mode || t.mode || "groups-knockout",
    teams: e?.customTemplate?.teams || e?.teams || t.teams || [],
    fixtures: e?.customTemplate?.fixtures || e?.fixtures || t.fixtures || [],
    timing: e?.customTemplate?.timing || e?.timing || t.timing || {},
  };
}
function usesWorldCupEditor(e = currentTournament()) {
  const t = tournamentDefinition(e);
  return (
    "worldcup-2026" === t.id ||
    ("groups-knockout" === t.mode && !t.teams.length)
  );
}
function phaseRenderModel() {
  const e = currentTournament(),
    t = currentPhase();
  if (
    !usesWorldCupEditor(e) ||
    "all" === t.id ||
    "matches" !== t.type ||
    !e?.realResults
  )
    return state.prediction;
  const n = JSON.parse(JSON.stringify(e.realResults)),
    a = new Set(t.matchIds || []),
    o = n.winners || {},
    s = n.scores || {};
  return (
    state.prediction.winners || (state.prediction.winners = {}),
    state.prediction.scores || (state.prediction.scores = {}),
    (n.winners = new Proxy(state.prediction.winners, {
      get: (e, t) => (a.has(t) ? e[t] : o[t]),
      set: (e, t, n) => ((e[t] = n), !0),
      has: (e, t) => (a.has(t) ? t in e : t in o),
    })),
    (n.scores = new Proxy(state.prediction.scores, {
      get: (e, t) => (a.has(t) ? e[t] : s[t]),
      set: (e, t, n) => ((e[t] = n), !0),
      has: (e, t) => (a.has(t) ? t in e : t in s),
    })),
    (n.custom = state.prediction.custom),
    n
  );
}
function ensureCustomModel(e) {
  return (
    e.custom || (e.custom = { champion: "", matches: {} }),
    e.custom.matches || (e.custom.matches = {}),
    e.custom
  );
}
function customFixtures(e) {
  if (Array.isArray(e.fixtures) && e.fixtures.length)
    return e.fixtures.map((e, t) => ({
      id: e.id || `c${t + 1}`,
      home: e.home,
      away: e.away,
      homeCrest: e.homeCrest || "",
      awayCrest: e.awayCrest || "",
      startsAt: e.startsAt || "",
      round: e.round || "",
    }));
  const t = (e.teams || []).filter(Boolean),
    n = [],
    a = "league" === e.mode ? 24 : 16,
    o = t.length % 2 == 0 ? [...t] : [...t, ""],
    s = o.length - 1,
    r = o.length / 2;
  for (let e = 0; e < s; e += 1) {
    for (let t = 0; t < r; t += 1) {
      const s = o[t],
        r = o[o.length - 1 - t];
      if (s && r) {
        const t = e % 2 == 1;
        if (
          (n.push({
            id: `c${n.length + 1}`,
            home: t ? r : s,
            away: t ? s : r,
            homeCrest: "",
            awayCrest: "",
            round: `Fecha ${e + 1}`,
          }),
          n.length >= a)
        )
          return n;
      }
    }
    o.splice(1, 0, o.pop());
  }
  return n;
}
function matchLockInfo(e, t) {
  if (!e?.startsAt) return { locked: !1, label: "" };
  const n = new Date(e.startsAt);
  if (Number.isNaN(n.getTime())) return { locked: !1, label: "" };
  const a = Number(t.timing?.predictionLockMinutesBefore || 0),
    o = new Date(n.getTime() - 6e4 * a),
    s = Date.now() >= o.getTime(),
    r = new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  return {
    locked: s,
    label: s ? `Cerrado desde ${r.format(o)}` : `Cierra ${r.format(o)}`,
  };
}
function realCustomResult(e) {
  const t = currentTournament();
  return t?.realResults?.custom?.matches?.[e] || null;
}
function scoreLabel(e) {
  return e && "" !== e.left && "" !== e.right ? `${e.left}-${e.right}` : "";
}
function setWinnerFromScore(e, t, n, a) {
  const o = e.scores[t];
  o &&
    "" !== o.left &&
    "" !== o.right &&
    Number(o.left) !== Number(o.right) &&
    (e.winners[t] = Number(o.left) > Number(o.right) ? n : a);
}
function matchLoser(e, t) {
  const n = ALL_BRACKET_MATCHES.find(([t]) => t === `m${e}`);
  if (!n) return "";
  const [, a, o] = n,
    s = resolveSlot(a, t, `m${e}`),
    r = resolveSlot(o, t, `m${e}`),
    i = t.winners?.[`m${e}`] || "";
  return i ? (i === s ? r || "" : (i === r && s) || "") : "";
}
function getQualified(e) {
  const t = {};
  return (
    groupKeys().forEach((n) => {
      const a = e.groups[n];
      ((t[`1${n}`] = a[0] || ""),
        (t[`2${n}`] = a[1] || ""),
        (t[`3${n}`] = a[2] || ""));
    }),
    t
  );
}
function thirdPlaceTeams(e) {
  return groupKeys()
    .map((t) => ({ group: t, team: e.groups[t][2] || "" }))
    .filter((e) => e.team);
}
function getThirdPlaceRankings(e) {
  const t = [];
  return (
    groupKeys().forEach((n) => {
      const a = e.groups[n][2];
      if (!a) return;
      const o = groupStandings(e, n).find((e) => e.team === a);
      o && t.push({ group: n, team: a, pts: o.pts, gd: o.gd, gf: o.gf });
    }),
    t.sort(
      (e, t) =>
        t.pts - e.pts ||
        t.gd - e.gd ||
        t.gf - e.gf ||
        e.group.localeCompare(t.group),
    )
  );
}
function getBestThirds(e) {
  const t = getThirdPlaceRankings(e);
  if (t.length <= 8) return t;
  const n = t[7];
  return t.filter(
    (e) =>
      e.pts > n.pts ||
      (e.pts === n.pts && e.gd > n.gd) ||
      (e.pts === n.pts && e.gd === n.gd && e.gf >= n.gf),
  );
}
function thirdSelectionCandidates(e) {
  const t = getThirdPlaceRankings(e),
    n = getBestThirds(e);
  return 12 === t.length && n.length >= 8
    ? n
    : t.length
      ? t
      : thirdPlaceTeams(e);
}
function allowedThirdPlaceTeams(model) {
  const thirds = groupKeys().map(group => {
    // Buscamos al tercer equipo de cada grupo (índice 2)
    const team = model.groups[group]?.[2];
    if (!team) return null;
    // Calculamos la tabla del grupo para extraer sus estadísticas
    const table = groupStandings(model, group);
    const stats = table.find(r => r.team === team) || { pts: 0, gd: 0, gf: 0 };
    return { group, team, pts: stats.pts, gd: stats.gd, gf: stats.gf };
  }).filter(item => item && item.team);
  // Ordenamos: 1° Puntos, 2° Diferencia de goles, 3° Goles a favor, 4° Alfabético
  thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
  return thirds;
}
function thirdMatchIds() {
  return R32_MATCHES.filter(([, , e]) => "3*" === e).map(([e]) => e);
}
function autoAssignThirdsIfPossible(e) {
  const t = getThirdPlaceRankings(e),
    n = getBestThirds(e);
  if (12 !== t.length || 8 !== n.length) return !1;
  e.thirdAssignments || (e.thirdAssignments = {});
  const a = n.map((e) => e.group),
    o = thirdMatchIds(),
    s = {};
  if (
    !(function e(t) {
      if (t === o.length) return !0;
      const n = o[t],
        r = THIRD_PLACE_SLOTS[n] || [];
      for (const o of a)
        if (!Object.values(s).includes(o) && r.includes(o)) {
          if (((s[n] = o), e(t + 1))) return !0;
          delete s[n];
        }
      return !1;
    })(0)
  )
    return !1;
  let r = !1;
  return (
    o.forEach((t) => {
      const a = s[t],
        o = n.find((e) => e.group === a)?.team || "";
      o &&
        e.thirdAssignments[t] !== o &&
        ((e.thirdAssignments[t] = o),
        (e.winners[t] = ""),
        pruneDependentWinners(e, Number(t.slice(1))),
        (r = !0));
    }),
    r
  );
}

function enhanceScoreInputs() {
  // Buscamos todos los inputs numéricos que no hayamos envuelto todavía
  document.querySelectorAll('input[type="number"]:not(.enhanced)').forEach(input => {
    // Solo se lo aplicamos a los casilleros de goles (evitamos tocar otros inputs de la app)
    if(!input.closest('.group-match') && !input.closest('.custom-match-line') && !input.classList.contains('knockout-score-input') && !input.closest('.score-row')) return;
    input.classList.add('enhanced');
    // Creamos el contenedor div
    const wrapper = document.createElement('div');
    wrapper.className = 'score-wrapper';
    // Función centralizada para avisarle al Prode que hubo un cambio
    const triggerUpdate = () => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    // Creamos el botón Arriba (+)
    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.className = 'score-btn up';
    // Le ponemos un icono SVG de flecha elegante
    btnUp.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    btnUp.disabled = input.disabled;
    btnUp.onclick = () => { 
      input.stepUp(); 
      triggerUpdate(); 
    };
    // Creamos el botón Abajo (-)
    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.className = 'score-btn down';
    btnDown.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    btnDown.disabled = input.disabled;
    btnDown.onclick = () => { 
      input.stepDown(); 
      triggerUpdate(); 
    };
    // Envolvemos el input mágicamente en el HTML
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(btnUp);
    wrapper.appendChild(input);
    wrapper.appendChild(btnDown);
  });
}

function renderThirdAssignments(mode, model) {
  const container = document.getElementById("thirdPlaceContainer");
  if (!container) return;
  // Mostrar u ocultar dependiendo de si estamos en modo predicción
  if (container.classList.toggle("hidden", "prediction" !== mode), "prediction" !== mode) return;
  container.innerHTML = "<h4>Asignar Mejores Terceros (16avos)</h4>";
  // Obtenemos los 12 terceros ordenados y los equipos que ya asignamos
  const thirdsData = allowedThirdPlaceTeams(model);
  const usedTeams = Object.values(model.thirdAssignments || {}).filter(Boolean);
  
  // Si no hay al menos 8, pedimos completar la fase de grupos
  if (thirdsData.length < 8) {
    container.innerHTML += "<p>Completa la fase de grupos para asignar los terceros.</p>";
    return;
  }
  
  const grid = document.createElement("div");
  grid.className = "third-assignments-grid";
  
  // Los ID exactos de los partidos de 16avos donde van los terceros
  const matchIds = ["73", "74", "75", "77", "81", "82", "83", "84"];
  
  matchIds.forEach(matchId => {
    const row = document.createElement("div");
    row.className = "third-assignment-row";
    
    const label = document.createElement("span");
    label.textContent = `Partido ${matchId}:`;
    
    const select = document.createElement("select");
    let optionsHtml = '<option value="">Elegir tercero</option>';
    
    thirdsData.forEach((item, index) => {
      // Deshabilitamos si ya fue elegido en otro partido
      const disabled = usedTeams.includes(item.team) && model.thirdAssignments?.[matchId] !== item.team ? "disabled" : "";
      const gdText = item.gd > 0 ? "+" + item.gd : item.gd;
      
      optionsHtml += `<option value="${item.team}" ${disabled}>${index + 1}º | ${item.team} (Gpo ${item.group}) | ${item.pts}pts, ${gdText}dg, ${item.gf}gf</option>`;
    });
    
    select.innerHTML = optionsHtml;
    select.value = model.thirdAssignments?.[matchId] || "";
    
    // Qué pasa cuando el usuario elige un equipo
    select.addEventListener("change", (ev) => {
      const selectedTeam = ev.target.value;
      model.thirdAssignments || (model.thirdAssignments = {});
      
      if (selectedTeam) {
        model.thirdAssignments[matchId] = selectedTeam;
      } else {
        delete model.thirdAssignments[matchId];
      }
      renderAll();
    });
    
    row.appendChild(label);
    row.appendChild(select);
    grid.appendChild(row);
  });
  
  container.appendChild(grid);
}

function calculateMatchPoints(e, t) {
  if (
    !t ||
    "" === t.home ||
    void 0 === t.home ||
    "" === t.away ||
    void 0 === t.away
  )
    return null;
  if (
    !e ||
    "" === e.home ||
    void 0 === e.home ||
    "" === e.away ||
    void 0 === e.away
  )
    return 0;
  const n = Number(t.home),
    a = Number(t.away),
    o = Number(e.home),
    s = Number(e.away);
  let r = 0;
  return (
    Math.sign(n - a) === Math.sign(o - s) && (r += 3),
    n === o && a === s && (r += 2),
    r
  );
}
function renderGroups(e, t, n, a = {}) {
  const o = document.getElementById(e),
    s = document.getElementById("groupTemplate");
  o.innerHTML = "";
  const r = a.matchdayId || "",
    i = Boolean(r);
  groupKeys().forEach((e) => {
    const a = s.content.firstElementChild.cloneNode(!0);
    a.querySelector(".group-title").innerHTML =
      `\n      <strong>Grupo ${e}</strong>\n      <span>${WORLD_CUP_GROUPS[e].map(teamBadge).join("")}</span>\n    `;
    const d = a.querySelector(".selectors");
    i ||
      [0, 1, 2, 3].forEach((a) => {
        const o = document.createElement("div");
        ((o.className = "selector-row"),
          setFlagBackground(o, t.groups[e][a]),
          (o.innerHTML = `<div class="place">${a + 1}</div>`));
        const s = document.createElement("select");
        ((s.dataset.group = e),
          (s.dataset.index = a),
          (s.dataset.model = n),
          (s.innerHTML = `<option value="">Elegir seleccion</option>${WORLD_CUP_GROUPS[e].map((e) => `<option value="${e}">${e}</option>`).join("")}`),
          (s.value = t.groups[e][a] || ""),
          s.addEventListener("change", (n) => {
            ((t.groups[e][a] = n.target.value),
              removeDuplicates(t, e, a),
              renderAll());
          }),
          o.appendChild(s),
          d.appendChild(o));
      });
    const l = document.createElement("div");
    if (
      ((l.className = "group-matches"),
      (l.innerHTML = `\n      <div class="group-matches-head">\n        <span>${i ? currentPhase().name : "Resultados de grupo"}</span>\n        ${i ? "" : '<button class="mini-button" type="button">Ordenar por tabla</button>'}\n      </div>\n    `),
      l.querySelector("button")?.addEventListener("click", () => {
        (syncGroupScoresFromDom(l, t), applyGroupStandings(t, e), renderAll());
      }),
      groupFixtures(e, r).forEach((a) => {
        const o = getGroupMatch(t, a.id, a.home, a.away),
          s = "prediction" === n,
          r = state.real?.groupMatches?.[a.id],
          i =
            r &&
            "" !== r.home &&
            void 0 !== r.home &&
            "" !== r.away &&
            void 0 !== r.away,
          d = isMatchTimeLocked(a.id),
          m = s && (i || d);
        s &&
          a.id.includes("-0-0") &&
          console.log(
            `[DEBUG-LOCK] match=${a.id} hasOfficial=${i} officialScore=`,
            r,
          );
        const c = document.createElement("div");
        if (
          ((c.className = "group-match " + (m ? "is-locked" : "")),
          (c.innerHTML = `\n        <span>${teamBadge(a.home)}</span>\n        <input type="number" min="0" max="20" value="${o.home}" placeholder="-" data-group-match-id="${a.id}" data-side="home" data-home-team="${a.home}" data-away-team="${a.away}" ${m ? "disabled" : ""}>\n        <b>-</b>\n        <input type="number" min="0" max="20" value="${o.away}" placeholder="-" data-group-match-id="${a.id}" data-side="away" data-home-team="${a.home}" data-away-team="${a.away}" ${m ? "disabled" : ""}>\n        <span>${teamBadge(a.away)}</span>\n        ${getScheduleHtml(a.id)}\n      `),
          m)
        ) {
          const e = document.createElement("div");
          ((e.className = "match-real-result"),
            (e.innerHTML = i
              ? `Resultado oficial: <strong>${r.home} - ${r.away}</strong>`
              : "Bloqueado (Cerrado por inicio)"),
            c.appendChild(e));
        }
        const u = c.querySelectorAll("input"),
          p = (n) => {
            ((getGroupMatch(t, a.id, a.home, a.away)[n.target.dataset.side] =
              n.target.value),
              syncGroupScoresFromDom(l, t));
            const o = l.querySelector(".group-standings-body");
            o && (o.innerHTML = standingsMarkup(t, e));
            if (typeof renderStandingsIfGroupPhase === 'function') {
              renderStandingsIfGroupPhase();
            }
          };
        (u[0].addEventListener("input", p),
          u[0].addEventListener("change", p),
          u[1].addEventListener("input", p),
          u[1].addEventListener("change", p),
          l.appendChild(c));
      }),
      !i)
    ) {
      const n = document.createElement("div");
      ((n.className = "group-standings"),
        (n.innerHTML = `\n        <div class="standings-row standings-header">\n          <b>#</b><span>Equipo</span><strong>Pts</strong><small>DG</small><small>GF</small>\n        </div>\n        <div class="group-standings-body">${standingsMarkup(t, e)}</div>\n      `),
        l.appendChild(n));
    }
    (d.appendChild(l), o.appendChild(a));
  });
}
function renderMatchdayMatches(e, t, n, a) {
  const o = document.getElementById(e);
  if (!o) return;
  o.innerHTML = "";
  const s = groupKeys().flatMap((e) =>
    groupFixtures(e, a).map((t) => ({ ...t, group: e })),
  );
  (s.sort(
    (e, t) =>
      (MATCH_SCHEDULE[e.id]?.number || 999) -
      (MATCH_SCHEDULE[t.id]?.number || 999),
  ),
    s.length
      ? s.forEach((e) => {
          const a = getGroupMatch(t, e.id, e.home, e.away),
            s = "prediction" === n,
            r = state.real?.groupMatches?.[e.id],
            i =
              r &&
              "" !== r.home &&
              void 0 !== r.home &&
              "" !== r.away &&
              void 0 !== r.away,
            d = isMatchTimeLocked(e.id),
            l = s && (i || d);
          let m = "";
          if (i) {
            const e = calculateMatchPoints(a, r);
            null !== e &&
              (m = `<span class="match-pts-earned" style="margin-left: auto; font-weight: 900; color: var(--accent); background: rgba(13,107,87,0.1); padding: 2px 8px; border-radius: 4px;">+${e}</span>`);
          }
          const c = MATCH_SCHEDULE[e.id]?.number,
            u = document.createElement("article");
          if (
            ((u.className = "matchday-card " + (l ? "is-locked" : "")),
            (u.innerHTML = `\n      <div class="matchday-title" style="display: flex; align-items: center; width: 100%;">\n        <span>Grupo ${e.group}</span>\n        <strong style="margin-left: 10px;">${c ? `Partido ${c}` : e.id}</strong>\n        ${m}\n      </div>\n      <div class="group-match">\n        <span>${teamBadge(e.home)}</span>\n        <input type="number" min="0" max="20" value="${a.home}" placeholder="-" data-group-match-id="${e.id}" data-side="home" data-home-team="${e.home}" data-away-team="${e.away}" ${l ? "disabled" : ""}>\n        <b>-</b>\n        <input type="number" min="0" max="20" value="${a.away}" placeholder="-" data-group-match-id="${e.id}" data-side="away" data-home-team="${e.home}" data-away-team="${e.away}" ${l ? "disabled" : ""}>\n        <span>${teamBadge(e.away)}</span>\n      </div>\n      ${getScheduleHtml(e.id)}\n    `),
            l)
          ) {
            const e = document.createElement("div");
            ((e.className = "match-real-result"),
              (e.innerHTML = i
                ? `Resultado oficial: <strong>${r.home} - ${r.away}</strong>`
                : "Bloqueado (Cerrado por inicio)"),
              u.appendChild(e));
          }
          (u.querySelectorAll("input").forEach((n) => {
            (n.addEventListener("input", (n) => {
              getGroupMatch(t, e.id, e.home, e.away)[n.target.dataset.side] =
                n.target.value;
              if (typeof renderStandingsIfGroupPhase === 'function') {
                  renderStandingsIfGroupPhase();
              }
            }),
              n.addEventListener("change", (n) => {
                getGroupMatch(t, e.id, e.home, e.away)[n.target.dataset.side] =
                  n.target.value;
              }));
          }),
            o.appendChild(u));
        })
      : (o.innerHTML =
          '<p class="empty">No hay partidos configurados para esta fecha.</p>'));
}

function renderStandingsIfGroupPhase() {
    const standingsPanel = document.getElementById("standingsPanel");
    const phase = state.currentPhaseId;

    // Filtramos para que SOLO aparezca si la fase es de grupos
    // Ajusta 'group1', 'group2', etc., según cómo se llamen en tu state
    if (phase.includes("group")) { 
        standingsPanel.hidden = false;
        // Aquí generamos el HTML de todas las tablas
        // Para que se vean 4 por fila, usa CSS Grid en tu styles.css
        standingsPanel.innerHTML = `
            <div class="standings-grid">
                ${groupKeys().map(g => `
                    <div class="group-card">
                        <h4>Grupo ${g}</h4>
                        ${standingsMarkup(state.prediction, g)}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        // Si es fase eliminatoria, ocultamos
        standingsPanel.hidden = true;
    }
}

function removeDuplicates(e, t, n) {
  const a = e.groups[t][n];
  a && (e.groups[t] = e.groups[t].map((e, t) => (t !== n && e === a ? "" : e)));
}
function resolveSlot(e, t, n) {
  const a = getQualified(t);
  return "3*" === e
    ? t.thirdAssignments?.[n] || ""
    : e.startsWith("G")
      ? t.winners[`m${e.slice(1)}`] || ""
      : e.startsWith("P")
        ? matchLoser(e.slice(1), t)
        : a[e] || "";
}
function renderBracket(e, t, n, a = {}) {
  const o = document.getElementById(e);
  o.innerHTML = "";
  [
    ["Dieciseisavos", R32_MATCHES],
    ["Octavos", LATER_ROUNDS.r16],
    ["Cuartos", LATER_ROUNDS.qf],
    ["Semifinales", LATER_ROUNDS.sf],
    ["Tercer puesto", LATER_ROUNDS.third],
    ["Final", LATER_ROUNDS.final],
  ]
    .map(([e, t]) => [
      e,
      a.matchIds ? t.filter(([e]) => a.matchIds.includes(e)) : t,
    ])
    .filter(([, e]) => e.length)
    .forEach(([e, a]) => {
      const s = document.createElement("div");
      ((s.className = "round"),
        (s.innerHTML = `<h3>${e}</h3>`),
        a.forEach(([e, a, o]) => {
          const r = resolveSlot(a, t, e),
            i = resolveSlot(o, t, e),
            d = [r, i].filter(Boolean);
          (t.scores[e] || (t.scores[e] = { left: "", right: "" }),
            d.includes(t.winners[e]) || (t.winners[e] = ""));
          const l = document.createElement("div");
          ((l.className = "match-card"),
            setFlagBackground(l, r, "--team-flag-left"),
            setFlagBackground(l, i, "--team-flag-right"));
          const m = MATCH_SCHEDULE[e]?.number;
          l.innerHTML = `
        <div class="match-title">${m ? `Partido ${m}` : e.toUpperCase()}</div>
        <div class="group-match" style="margin: 12px 0;">
          <span>${teamBadge(r) || a}</span>
          <input type="number" min="0" max="20" placeholder="-" value="${t.scores[e].left || ""}" class="knockout-score-input" data-side="left">
          <b>-</b>
          <input type="number" min="0" max="20" placeholder="-" value="${t.scores[e].right || ""}" class="knockout-score-input" data-side="right">
          <span>${teamBadge(i) || o}</span>
        </div>
        ${getScheduleHtml(e)}
      `;

          const p = "prediction" === n,
            g = state.real?.scores?.[e],
            y = state.real?.winners?.[e],
            f = g && "" !== g.left && void 0 !== g.left && "" !== g.right && void 0 !== g.right,
            h = y && "" !== y,
            b = isMatchTimeLocked(e),
            v = p && (f || h || b);

          if (v) l.classList.add("is-locked");

          const uInputs = l.querySelectorAll(".knockout-score-input");
          uInputs.forEach((input) => {
            input.disabled = d.length < 2 || v;
            const handler = (ev) => {
              t.scores[e][ev.target.dataset.side] = ev.target.value;
              setWinnerFromScore(t, e, r, i);
              renderAll();
            };
            input.addEventListener("input", handler);
            input.addEventListener("change", handler);
          });
          const E = document.createElement("label");
          E.textContent = "Ganador";
          const S = document.createElement("select");
          if (
            ((S.dataset.match = e),
            (S.dataset.model = n),
            (S.innerHTML = `<option value="">Elegir ganador</option>${d.map((e) => `<option value="${escapeHtml(e)}">${escapeHtml(teamLabel(e))}</option>`).join("")}`),
            (S.value = t.winners[e] || ""),
            (S.disabled = d.length < 2 || v),
            S.addEventListener("change", (n) => {
              ((t.winners[e] = n.target.value),
                pruneDependentWinners(t, Number(e.slice(1))),
                renderAll());
            }),
            E.appendChild(S),
            l.appendChild(E),
            v && f)
          ) {
            const e = document.createElement("div");
            ((e.className = "match-real-result"),
              (e.innerHTML = `Resultado oficial: <strong>${g.left} - ${g.right}</strong> (${teamLabel(y)})`),
              l.appendChild(e));
          } else if (v && h) {
            const e = document.createElement("div");
            ((e.className = "match-real-result"),
              (e.innerHTML = `Ganador oficial: <strong>${teamLabel(y)}</strong>`),
              l.appendChild(e));
          }
          s.appendChild(l);
        }),
        o.appendChild(s));
    });
}
function renderCustomSheet(e, t, n) {
  const a = document.getElementById(e);
  if (!a) return;
  const o = tournamentDefinition(),
    s = "league" === o.mode,
    r = ensureCustomModel(t),
    i = currentPhase(),
    d = customFixtures(o),
    l =
      "date" === state.currentMode && "custom-round" === i.type
        ? d.filter((e) => (e.round || "Partidos") === i.round)
        : d,
    m = o.teams || [];
  if (m.length < 2)
    return void (a.innerHTML =
      '<p class="empty">Esta plantilla necesita al menos 2 equipos o jugadores.</p>');
  a.innerHTML = `\n    <div class="section-head compact custom-title">\n      <div>\n        <h2>${o.name}</h2>\n        <p>${"league" === o.mode ? "Planilla de liga" : "Planilla de partidos"} con ${m.length} participantes.</p>\n      </div>\n      <label>\n        Campeon / ganador\n        <select class="custom-champion" data-model="${n}">\n          <option value="">Elegir</option>\n          ${m.map((e) => `<option value="${escapeHtml(e)}">${escapeHtml(teamLabel(e))}</option>`).join("")}\n        </select>\n      </label>\n    </div>\n    <div class="custom-teams">${m.map((e) => `<span>${escapeHtml(teamLabel(e))}</span>`).join("")}</div>\n    <div class="custom-fixtures"></div>\n  `;
  const c = a.querySelector(".custom-champion");
  ((c.value = r.champion || ""),
    c.addEventListener("change", (e) => {
      r.champion = e.target.value;
    }));
  const u = a.querySelector(".custom-fixtures");
  l.forEach((e) => {
    const t = matchLockInfo(e, o),
      a = "prediction" === n ? realCustomResult(e.id) : null,
      i =
        a &&
        "" !== a.homeScore &&
        "" !== a.awayScore &&
        void 0 !== a.homeScore &&
        void 0 !== a.awayScore
          ? `${a.homeScore} - ${a.awayScore}`
          : "",
      d = Boolean(i),
      l = t.locked || d,
      m = d ? "Finalizado" : t.label || e.startsAt || "";
    (r.matches[e.id] ||
      (r.matches[e.id] = {
        home: e.home,
        away: e.away,
        homeScore: "",
        awayScore: "",
        winner: "",
      }),
      (r.matches[e.id].home = e.home),
      (r.matches[e.id].away = e.away));
    const c = r.matches[e.id],
      p = [e.home, e.away],
      g = document.createElement("article");
    ((g.className = "custom-match-card " + (l ? "is-locked" : "")),
      (g.innerHTML = `\n      <div class="match-title">${escapeHtml(e.round || e.id.toUpperCase())}</div>\n      ${m ? `<div class="match-timing">${escapeHtml(m)}</div>` : ""}\n      ${i ? `<div class="match-real-result">Resultado oficial: <strong>${escapeHtml(i)}</strong></div>` : ""}\n      <div class="custom-match-line">\n        <span>${teamBadge(e.home)}</span>\n        <input type="number" min="0" max="99" placeholder="-" value="${c.homeScore}" ${l ? "disabled" : ""}>\n        <b>-</b>\n        <input type="number" min="0" max="99" placeholder="-" value="${c.awayScore}" ${l ? "disabled" : ""}>\n        <span>${teamBadge(e.away)}</span>\n      </div>\n      ${s ? "" : `<label>\n        Resultado\n        <select ${l ? "disabled" : ""}>\n          <option value="">Elegir resultado</option>\n          ${p.map((e) => `<option value="${escapeHtml(e)}">${escapeHtml(teamLabel(e))}</option>`).join("")}\n        </select>\n      </label>`}\n    `));
    const y = g.querySelectorAll("input"),
      f = g.querySelector("select");
    f && (f.value = c.winner || "");
    const h = () => {
      if (
        ((c.homeScore = y[0].value),
        (c.awayScore = y[1].value),
        "" !== c.homeScore && "" !== c.awayScore)
      ) {
        const t = Number(c.homeScore),
          n = Number(c.awayScore);
        ((c.winner = t === n && s ? "draw" : t > n ? e.home : e.away),
          f && (f.value = c.winner));
      }
    };
    (y[0].addEventListener("input", h),
      y[1].addEventListener("input", h),
      f?.addEventListener("change", (e) => {
        c.winner = e.target.value;
      }),
      u.appendChild(g));
  });
}
function pruneDependentWinners(e, t) {
  const n = `G${t}`,
    a = `P${t}`;
  ALL_BRACKET_MATCHES.filter(
    ([, e, t]) => e === n || t === n || e === a || t === a,
  )
    .map(([e]) => e)
    .forEach((t) => {
      (e.winners[t] && (e.winners[t] = ""),
        pruneDependentWinners(e, Number(t.slice(1))));
    });
}
function fillModel(e) {
  if (!usesWorldCupEditor()) {
    const t = tournamentDefinition(),
      n = "league" === t.mode,
      a = ensureCustomModel(e);
    return (
      (a.champion = t.teams[Math.floor(Math.random() * t.teams.length)] || ""),
      customFixtures(t).forEach((e) => {
        let t = Math.floor(5 * Math.random()),
          o = Math.floor(5 * Math.random());
        (n || t !== o || (t < 4 ? (t += 1) : (o -= 1)),
          (a.matches[e.id] = {
            home: e.home,
            away: e.away,
            homeScore: String(t),
            awayScore: String(o),
            winner: t === o && n ? "draw" : t > o ? e.home : e.away,
          }));
      }),
      void renderAll()
    );
  }
  if (
    (groupKeys().forEach((t) => {
      ((e.groups[t] = [...WORLD_CUP_GROUPS[t]]),
        groupFixtures(t).forEach((t) => {
          const n = getGroupMatch(e, t.id, t.home, t.away);
          ((n.home = String(Math.floor(5 * Math.random()))),
            (n.away = String(Math.floor(5 * Math.random()))));
        }),
        applyGroupStandings(e, t));
    }),
    !autoAssignThirdsIfPossible(e))
  ) {
    e.thirdAssignments = {};
    const t = getBestThirds(e);
    thirdMatchIds().forEach((n, a) => {
      e.thirdAssignments[n] = t[a]?.team || "";
    });
  }
  (renderAll(),
    setTimeout(() => {
      (ALL_BRACKET_MATCHES.forEach(([t, n, a]) => {
        let o = Math.floor(5 * Math.random()),
          s = Math.floor(5 * Math.random());
        o === s && (o < 4 ? (o += 1) : (s -= 1));
        const r = resolveSlot(n, e, t),
          i = resolveSlot(a, e, t);
        ((e.scores[t] = { left: String(o), right: String(s) }),
          (e.winners[t] = o > s ? r : i));
      }),
        renderAll());
    }, 0));
}
function clearModel(e) {
  const t = createEmptyTournament();
  ((e.groups = t.groups),
    (e.groupMatches = t.groupMatches),
    (e.thirdAssignments = t.thirdAssignments),
    (e.winners = t.winners),
    (e.scores = t.scores),
    (e.custom = t.custom),
    renderAll());
}
function renderAll() {
  const e = usesWorldCupEditor(),
    t = currentPhase(),
    n = currentTournament(),
    a = "date" === state.currentMode && "all" !== t.id,
    o = e && GROUP_PHASE_IDS.includes(t.id) ? t.id : "",
    s = e && "matches" === t.type ? t.matchIds || [] : null,
    r = !e || "all" === t.id || ("groups" === t.type && !a),
    i = e && a && "groups" === t.type,
    d = e && ("all" === t.id || "matches" === t.type),
    l = e && ("all" === t.id || ("r32" === t.id && !n?.realResults));
  if (
    (document.querySelectorAll("[data-worldcup-editor]").forEach((t) => {
      t.hidden = !e;
    }),
    document.querySelectorAll("[data-custom-editor]").forEach((t) => {
      t.hidden = e;
    }),
    document
      .querySelectorAll("[data-worldcup-stage='bracket']")
      .forEach((t) => {
        t.hidden = !e || !d;
      }),
    document.querySelectorAll("[data-worldcup-stage='thirds']").forEach((t) => {
      t.hidden = !e || !l;
    }),
    e)
  ) {
    const e = phaseRenderModel(),
      t = document.getElementById("groupsGrid"),
      n = document.getElementById("matchdayGrid"),
      a = document.getElementById("realGroupsGrid"),
      m = document.getElementById("thirdsPanel"),
      c = document.getElementById("realThirdsPanel"),
      u = document.getElementById("bracket"),
      p = document.getElementById("realBracket");
    (t && (t.hidden = !r),
      n && (n.hidden = !i),
      a && (a.hidden = !1),
      m && (m.hidden = !l),
      c && (c.hidden = !1),
      u && (u.hidden = !d),
      p && (p.hidden = !1),
      renderGroups("groupsGrid", state.prediction, "prediction", {
        matchdayId: o,
      }),
      renderMatchdayMatches("matchdayGrid", state.prediction, "prediction", o),
      renderGroups("realGroupsGrid", state.real, "real"),
      renderThirdAssignments("thirdsPanel", e),
      renderThirdAssignments("realThirdsPanel", state.real),
      renderBracket("bracket", e, "prediction", { matchIds: s }),
      renderBracket("realBracket", state.real, "real"));
  } else
    (renderCustomSheet("customSheet", state.prediction, "prediction"),
      renderCustomSheet("realCustomSheet", state.real, "real"));
  (renderPhaseStatus(),
    setPredictionLocked(isEntryClosed()),
    syncLobbyTabVisibility(),
    updateHomeMatchesView());
    enhanceScoreInputs();
    renderStandingsIfGroupPhase();
}
function syncLobbyTabVisibility() {
  const e = document.querySelector('.tab[data-view="lobby"]');
  e &&
    (state.globalSession?.token ||
    state.companySession?.token ||
    state.currentMiniTournamentId ||
    (state.tenantId && state.tenantAccessGranted)
      ? (e.style.display = "none")
      : (e.style.display = ""));
}
function buildPayload() {
  const e =
      state.companySession?.user ||
      (state.tenantAccessGranted ? state.globalSession?.user : null),
    t = document.getElementById("playerName").value.trim(),
    n = document.getElementById("playerEmail").value.trim();
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    tournamentId: state.currentTournamentId,
    player: {
      name: e?.name || state.globalSession?.user?.name || t || "Jugador",
      email: e?.email || state.globalSession?.user?.email || n || "",
      area: state.companySession?.user?.area || "",
    },
    phaseId: state.currentPhaseId,
    tournament: state.prediction,
  };
}
async function apiJson(e, t = {}) {
  const n = await fetch(apiUrl(e), {
      ...t,
      headers: { "Content-Type": "application/json", ...(t.headers || {}) },
    }),
    a = await n.text(),
    o = a
      ? (() => {
          try {
            return JSON.parse(a);
          } catch {
            return {};
          }
        })()
      : {};
  if (!n.ok) throw new Error(o.error || `Error ${n.status}`);
  return o;
}
function renderTournamentControls() {
  const e = document.getElementById("tournamentSelect");
  e &&
    ((e.innerHTML = state.tournaments
      .map((e) => `<option value="${e.id}">${e.name}</option>`)
      .join("")),
    (e.value = state.currentTournamentId));
  const t = document.getElementById("tournamentList");
  t &&
    (state.tenantId
      ? renderCompanyAreas()
      : ((t.innerHTML = state.tournaments
          .map(
            (e) =>
              `\n    <article class="tournament-card">\n        <div>\n          <h3>${e.name}</h3>\n          <p>${e.isGlobal ? "Ranking global" : `Torneo privado - ${e.templateName || "Plantilla"}`}</p>\n        </div>\n      <div class="tournament-actions">\n        <strong>${e.players} jugadores</strong>\n        <button class="secondary view-leaderboard" type="button" data-tournament-id="${e.id}">Ver leaderboard</button>\n        ${state.globalSession?.user?.isSuperAdmin && !e.isGlobal ? `<button class="secondary danger delete-private-tournament" type="button" style="margin-left:0.5rem;" data-tournament-id="${e.id}" data-tournament-name="${escapeHtml(e.name)}">Eliminar</button>` : ""}\n      </div>\n    </article>\n  `,
          )
          .join("")),
        t.querySelectorAll(".view-leaderboard").forEach((e) => {
          e.addEventListener("click", () =>
            openTournamentLeaderboard(e.dataset.tournamentId),
          );
        }),
        t.querySelectorAll(".delete-private-tournament").forEach((e) => {
          e.addEventListener("click", async () => {
            const t = e.dataset.tournamentName || "este torneo";
            if (
              !window.confirm(
                `Vas a eliminar "${t}" y sus predicciones. Esta accion no se puede deshacer. ¿Continuar?`,
              )
            )
              return;
            if (
              "ELIMINAR" ===
              window.prompt(
                `Escribi ELIMINAR para confirmar el borrado de "${t}".`,
              )
            )
              try {
                (await deletePrivateTournament(e.dataset.tournamentId),
                  await loadTournaments());
              } catch (e) {
                alert(`No se pudo eliminar el torneo: ${e.message}`);
              }
          });
        })));
}
async function openTournamentLeaderboard(e) {
  state.currentTournamentId = e;
  const t = currentTournament();
  ((t?.isGlobal || "global" === e) && (state.currentMiniTournamentId = null),
    renderTournamentControls(),
    syncPhaseSelectorForTournament(),
    renderAll());
  const n = document.getElementById("tournamentResults");
  n && (n.hidden = !1);
  const a = document.getElementById("selectedTournamentTitle");
  (a &&
    (a.textContent =
      state.tenantId && state.leaderboardArea
        ? `Leaderboard - ${state.leaderboardArea}`
        : `Leaderboard - ${currentTournament()?.name || "Torneo"}`),
    await loadLeaderboard(),
    state.tenantId ||
      n?.scrollIntoView({ behavior: "smooth", block: "start" }));
}
async function loadTournaments() {
  try {
    const e = joinedTournamentCodes().join(","),
      t = new URLSearchParams();
    (t.set("joined", e),
      state.tenantId && t.set("tenant", state.tenantId),
      state.globalSession?.token &&
        t.set("globalSessionToken", state.globalSession.token),
      t.set("_t", Date.now().toString()));
    const n = await apiJson(`/api/tournaments?${t.toString()}`);
    state.tournaments = n.tournaments || [];
    const a =
      state.tournaments.find((e) => "global" === e.id) || state.tournaments[0];
    if (
      ((state.real = a?.realResults
        ? JSON.parse(JSON.stringify(a.realResults))
        : createEmptyTournament()),
      state.tournaments.some((e) => e.id === state.currentTournamentId) ||
        (state.currentTournamentId = state.tournaments[0]?.id || "global"),
      renderTournamentControls(),
      syncPhaseSelectorForTournament(),
      renderAll(),
      state.tenantId && state.currentTournamentId)
    ) {
      const e = document.getElementById("tournamentResults");
      e && (e.hidden = !1);
      const t = document.getElementById("selectedTournamentTitle");
      (t &&
        (t.textContent = `Leaderboard - ${state.tenant?.name || "Empresa"}`),
        renderCompanyAreas());
    }
    const o = initialTournamentCode();
    if (o && !state.inviteHandled) {
      state.inviteHandled = !0;
      const e = window.prompt("Nombre exacto del torneo privado:");
      if (!e) return;
      joinTournamentByCode(o, e, !0).catch((e) => {
        const t = document.getElementById("tournamentStatus");
        t &&
          ((t.hidden = !1),
          (t.textContent = `No se pudo unir al torneo: ${e.message}`));
      });
    }
    (await loadLeaderboard(), await loadMiniTournaments());
  } catch (e) {
    ((state.tournaments = [
      {
        id: "global",
        name: "Global",
        code: "GLOBAL",
        isGlobal: !0,
        players: 0,
      },
    ]),
      renderTournamentControls(),
      syncPhaseSelectorForTournament());
  }
}
async function loadContinuation() {
  const e = initialContinueToken();
  if (e)
    try {
      const t = await apiJson(
        `/api/continue-prode?token=${encodeURIComponent(e)}`,
      );
      (t.player &&
        ((document.getElementById("playerName").value = t.player.name || ""),
        (document.getElementById("playerEmail").value = t.player.email || "")),
        t.prediction && (state.prediction = t.prediction),
        t.tournament?.code && rememberTournamentCode(t.tournament.code),
        await loadTournaments(),
        t.tournament?.id && (state.currentTournamentId = t.tournament.id));
      const n = phaseFromUrl();
      if (
        (n && state.phases.some((e) => e.id === n)
          ? (state.currentPhaseId = n)
          : t.phaseId &&
            state.phases.some((e) => e.id === t.phaseId) &&
            (state.currentPhaseId = t.phaseId),
        (state.currentMode = "date"),
        "all" === state.currentPhaseId)
      ) {
        const e = activePhases();
        state.currentPhaseId = usesWorldCupEditor()
          ? "group1"
          : e.find((e) => "all" !== e.id)?.id || "all";
      }
      (renderTournamentControls(),
        renderPhaseSelector(),
        renderAll(),
        (document.getElementById("tournamentSelect").value =
          state.currentTournamentId));
    } catch (e) {
      alert(`No se pudo abrir el link de continuacion: ${e.message}`);
    }
}
function scoringFromForm() {
  return {
    groupPosition: Number(document.getElementById("scoreGroup").value),
    knockoutWinner: Number(document.getElementById("scoreWinner").value),
    exactScore: Number(document.getElementById("scoreExact").value),
    champion: Number(document.getElementById("scoreChampion").value),
  };
}
function customTemplateFromForm(e) {
  if ("custom" !== e) return null;
  const t = document
    .getElementById("customTeams")
    .value.split(/\r?\n|,/)
    .map((e) => e.trim())
    .filter(Boolean);
  return {
    name: document.getElementById("tournamentName").value.trim(),
    mode: document.getElementById("modeSelect").value,
    teams: t,
  };
}
async function createTournament({
  name: e,
  code: t,
  creatorEmail: n,
  templateId: a,
  mode: o,
  scoring: s,
  customTemplate: r,
}) {
  const i = await apiJson("/api/tournaments", {
    method: "POST",
    body: JSON.stringify({
      name: e,
      code: t,
      creatorEmail: n,
      templateId: a,
      mode: o,
      scoring: s,
      customTemplate: r,
      tenantId: state.tenantId,
    }),
  });
  return (
    (state.currentTournamentId = i.tournament.id),
    rememberTournamentCode(i.tournament.code),
    rememberCreatorKey(i.tournament.id, i.creatorKey),
    await loadTournaments(),
    await openTournamentLeaderboard(i.tournament.id),
    i.tournament
  );
}
async function joinTournamentByCode(e, t = "", n = !0) {
  const a = String(e || "")
      .trim()
      .toUpperCase(),
    o = document.getElementById("tournamentStatus"),
    s = await apiJson("/api/join-tournament", {
      method: "POST",
      body: JSON.stringify({ name: t, code: a, tenantId: state.tenantId }),
    });
  (rememberTournamentCode(s.tournament.code), await loadTournaments());
  const r = state.tournaments.find((e) => e.id === s.tournament.id);
  return (
    (state.currentTournamentId = r.id),
    renderTournamentControls(),
    syncPhaseSelectorForTournament(),
    renderAll(),
    (document.getElementById("tournamentSelect").value = r.id),
    n &&
      o &&
      ((o.hidden = !1),
      (o.textContent = `Te uniste a ${r.name}. Tu prode quedara asociado al email que cargues.`)),
    !0
  );
}
async function loginCompanyUser({ name: e, email: t, password: n, area: a }) {
  const o = await apiJson("/api/company-login", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      name: e,
      email: t,
      password: n,
      area: a,
    }),
  });
  return (
    (state.tenant = o.tenant || state.tenant),
    (state.dailyGamePlays = o.dailyGamePlays || {}),
    saveCompanySession({ token: o.token, user: o.user }),
    o.globalToken && saveGlobalSession({ token: o.globalToken, user: o.user }),
    (document.getElementById("playerName").value = o.user.name || ""),
    (document.getElementById("playerEmail").value = o.user.email || ""),
    (state.leaderboardArea = ""),
    renderCompanyAuth(),
    renderCompanyAreas(),
    renderDailyGames(),
    syncAdminNavigation(),
    await loadLeaderboard(),
    o.user
  );
}
async function registrarCompanyUser({ name: e, email: t, password: n }) {
  if (!/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(n))
    return void showToast(
      "La contraseña debe tener al menos 8 caracteres, una mayuscula y una minuscula.",
      !0,
    );
  const a = document.getElementById("companyRegistrarBtn"),
    o = a.textContent;
  ((a.textContent = "Enviando correo..."), (a.disabled = !0));
  try {
    const s = await apiJson("/api/request-verification", {
      method: "POST",
      body: JSON.stringify({ email: t }),
    });
    if (((a.textContent = o), (a.disabled = !1), s.ok)) {
      const a = await requestVerificationCode(t);
      if (!a)
        return void showToast(
          "Registro cancelado: no ingresaste el codigo de verificacion.",
          !0,
        );
      if (
        (
          await apiJson("/api/verify-code", {
            method: "POST",
            body: JSON.stringify({ email: t, code: a }),
          })
        ).ok
      ) {
        showToast("Correo verificado. Finalizando registro...");
        const a = await apiJson("/api/registrar-company", {
          method: "POST",
          body: JSON.stringify({
            tenantId: state.tenantId,
            name: e,
            email: t,
            password: n,
            area: "General",
          }),
        });
        ((state.tenant = a.tenant || state.tenant),
          (state.dailyGamePlays = a.dailyGamePlays || {}),
          saveCompanySession({ token: a.token, user: a.user }),
          a.globalToken &&
            saveGlobalSession({ token: a.globalToken, user: a.user }),
          (document.getElementById("playerName").value = a.user.name || ""),
          "function" == typeof closeModals && closeModals(),
          openView("predictor"));
      } else
        showToast("El codigo ingresado es incorrecto. Intenta nuevamente.", !0);
    } else showToast("No se pudo enviar el correo. Verifica la direccion.", !0);
  } catch (e) {
    ((a.textContent = o),
      (a.disabled = !1),
      showToast("Error de conexion al intentar verificar el correo.", !0));
  }
}
async function createCompanyArea(e) {
  const t = await apiJson("/api/company-areas", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      name: e,
    }),
  });
  ((state.tenant = t.tenant || state.tenant),
    renderCompanyAuth(),
    renderCompanyAreas());
}
async function updateCompanyArea(e, t) {
  const n = await apiJson("/api/company-areas/update", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      oldName: e,
      newName: t,
    }),
  });
  ((state.tenant = n.tenant || state.tenant),
    renderCompanyAuth(),
    renderCompanyAreas());
}
async function submitProde(e) {
  return apiJson("/api/submit-prode", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      minitournamentId: state.currentMiniTournamentId,
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      phaseId: state.currentPhaseId,
      payload: e,
    }),
  });
}
async function ensurePaymentBeforeSubmit(e) {
  return !0;
}
async function saveRealResults() {
  const e = await apiJson("/api/real-results", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: "global",
      tenantId: "",
      adminKey: state.adminKey,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      creatorKey: creatorKeyFor("global"),
      realResults: state.real,
    }),
  });
  return (await loadTournaments(), await loadLeaderboard(), e);
}
async function importApiResults() {
  const e = await apiJson("/api/import-api-results", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: "global",
      tenantId: "",
      adminKey: state.adminKey,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
    }),
  });
  return (await loadTournaments(), await loadLeaderboard(), e);
}
async function deletePrivateTournament(e) {
  return apiJson("/api/delete-private-tournament", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: e,
      globalSessionToken: state.globalSession?.token || "",
    }),
  });
}
async function updateAdminUser({
  email: e,
  name: t,
  area: n,
  active: a,
  isAdmin: o,
}) {
  return apiJson("/api/admin-users", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      adminKey: state.adminKey,
      email: e,
      name: t,
      area: n,
      active: a,
      isAdmin: o,
    }),
  });
}
async function deleteAdminUser(e) {
  return apiJson("/api/admin-users/delete", {
    method: "POST",
    body: JSON.stringify({
      tenantId: state.tenantId,
      sessionToken: state.companySession?.token || "",
      globalSessionToken: state.globalSession?.token || "",
      adminKey: state.adminKey,
      email: e,
    }),
  });
}
function fillAdminThemeForm() {
  if (!document.getElementById("adminThemeForm") || !state.tenant) return;
  const e = state.tenant.theme || {};
  ((document.getElementById("themeTitle").value =
    state.tenant.title || state.tenant.name || ""),
    (document.getElementById("themeDescription").value =
      state.tenant.description || ""));
  const t = document.getElementById("themeEyebrow");
  (t && (t.value = state.tenant.eyebrow || ""),
    (document.getElementById("themeAccent").value = e.accent || "#0d6b57"),
    (document.getElementById("themeBg").value = e.bg || "#f5f1e8"),
    (document.getElementById("themePanel").value = e.panel || "#fffaf1"),
    (document.getElementById("themeInk").value = e.ink || "#15221f"),
    (document.getElementById("themeImage").value = e.image || ""));
}
function fillAdminGamesForm() {
  if (!document.getElementById("adminGamesForm") || !state.tenant) return;
  const e = state.tenant.games || {};
  ((document.getElementById("gamesEnabled").checked = !1 !== e.enabled),
    (document.getElementById("gamesTitle").value =
      e.title || "Centro de minijuegos"),
    (document.getElementById("gamesIntro").value =
      e.intro || "Desafios rapidos para sumar ritmo al prode diario."),
    (document.getElementById("gamesRewardName").value =
      e.rewardName || "Fan Points"),
    (document.getElementById("camisetadlePoints").value = Number(
      e.points?.camisetadle || 20,
    )),
    (document.getElementById("challengePoints").value = Number(
      e.points?.desafio || 15,
    )),
    (document.getElementById("camisetadleItems").value = (e.camisetas || [])
      .map((e) =>
        [e.date, e.player, e.number, e.team, e.tournament, e.hint]
          .map((e) => e || "")
          .join(" | "),
      )
      .join("\n")),
    (document.getElementById("challengeItems").value = (e.desafios || [])
      .map((e) =>
        [
          e.date,
          e.type,
          e.answer,
          e.title,
          e.subtitle,
          (e.clues || []).join("; "),
        ]
          .map((e) => e || "")
          .join(" | "),
      )
      .join("\n")));
}
function fileToDataUrl(e) {
  return new Promise((t, n) => {
    const a = new FileReader();
    ((a.onload = () => t(String(a.result || ""))),
      (a.onerror = () => n(a.error || new Error("No se pudo leer la imagen"))),
      a.readAsDataURL(e));
  });
}
async function saveAdminTheme() {
  const e = document.getElementById("themeImageFile").files?.[0],
    t = e
      ? await fileToDataUrl(e)
      : document.getElementById("themeImage").value.trim(),
    n = document.getElementById("themeEyebrow"),
    a = n ? n.value.trim() : document.getElementById("themeTitle").value.trim();
  applyTenantTheme(
    (
      await apiJson("/api/admin-theme", {
        method: "POST",
        body: JSON.stringify({
          tenantId: state.tenantId,
          sessionToken: state.companySession?.token || "",
          globalSessionToken: state.globalSession?.token || "",
          adminKey: state.adminKey,
          displayName: document.getElementById("themeTitle").value.trim(),
          eyebrow: a,
          title: document.getElementById("themeTitle").value.trim(),
          description: document.getElementById("themeDescription").value.trim(),
          theme: {
            accent: document.getElementById("themeAccent").value,
            bg: document.getElementById("themeBg").value,
            panel: document.getElementById("themePanel").value,
            ink: document.getElementById("themeInk").value,
            image: t,
          },
        }),
      })
    ).tenant,
  );
}
function parseCamisetadleItems(e) {
  return String(e || "")
    .split(/\r?\n/)
    .map((e, t) => {
      const n = e.split("|").map((e) => e.trim()),
        a = /^\d{4}-\d{2}-\d{2}$/.test(n[0] || ""),
        [o, s, r, i, d, l] = a ? n : ["", ...n];
      return {
        id: `custom-${t + 1}`,
        date: o,
        player: s,
        number: r,
        team: i,
        tournament: d,
        hint: l,
      };
    })
    .filter((e) => e.player && e.number);
}
function parseChallengeItems(e) {
  return String(e || "")
    .split(/\r?\n/)
    .map((e, t) => {
      const n = e.split("|").map((e) => e.trim()),
        a = /^\d{4}-\d{2}-\d{2}$/.test(n[0] || ""),
        [o, s, r, i, d, l] = a ? n : ["", ...n];
      return {
        id: `challenge-${t + 1}`,
        date: o,
        type: s || "otro",
        answer: r,
        title: i,
        subtitle: d,
        clues: String(l || "")
          .split(";")
          .map((e) => e.trim())
          .filter(Boolean),
      };
    })
    .filter((e) => e.answer);
}
async function saveAdminGames() {
  const e = await apiJson("/api/admin-games", {
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
          camisetadle: Number(
            document.getElementById("camisetadlePoints").value || 0,
          ),
          desafio: Number(
            document.getElementById("challengePoints").value || 0,
          ),
        },
        camisetas: parseCamisetadleItems(
          document.getElementById("camisetadleItems").value,
        ),
        desafios: parseChallengeItems(
          document.getElementById("challengeItems").value,
        ),
      },
    }),
  });
  ((state.tenant = e.tenant || state.tenant),
    renderDailyGames(),
    fillAdminGamesForm());
}
async function loadAdminSummary() {
  const e = document.getElementById("adminStatus"),
    t = document.getElementById("adminUsers");
  if (!t) return;
  const n = new URLSearchParams();
  (state.adminKey && n.set("adminKey", state.adminKey),
    state.companySession?.token &&
      n.set("sessionToken", state.companySession.token),
    state.globalSession?.token &&
      n.set("globalSessionToken", state.globalSession.token),
    state.tenantId && n.set("tenant", state.tenantId));
  const a = await apiJson(`/api/admin-summary?${n.toString()}`);
  if (
    ((document.getElementById("adminDashboard").hidden = !1),
    (document.getElementById("adminLoginForm").hidden = !0),
    e && ((e.hidden = !0), (e.textContent = "")),
    !state.tenantId)
  ) {
    const e = a.tournaments || [];
    return (
      (t.innerHTML = `\n      <div class="admin-global-summary">\n        <article class="tournament-card">\n          <div>\n            <h3>Usuarios globales</h3>\n            <p>${Number(a.stats?.users || 0)} registrados en el lobby</p>\n          </div>\n        </article>\n        <article class="tournament-card">\n          <div>\n            <h3>Torneos activos</h3>\n            <p>${e.length} torneos publicados</p>\n          </div>\n        </article>\n        <article class="tournament-card">\n          <div>\n            <h3>Predicciones</h3>\n            <p>${Number(a.stats?.predictions || 0)} jugadas guardadas</p>\n          </div>\n        </article>\n      </div>\n      ${e.length ? `<div class="tournament-list">${e.map((e) => `\n        <article class="tournament-card">\n          <div>\n            <small>${escapeHtml(e.lockedLabel || "")}</small>\n            <h3>${escapeHtml(e.name)}</h3>\n            <p>${escapeHtml(e.templateName || "Competicion")}</p>\n          </div>\n          <div class="tournament-actions">\n            <strong>${Number(e.players || 0)} jugadores</strong>\n            ${e.isGlobal ? "" : `<button class="secondary danger delete-private-tournament" type="button" data-tournament-id="${escapeHtml(e.id)}" data-tournament-name="${escapeHtml(e.name)}">Eliminar</button>`}\n          </div>\n        </article>\n      `).join("")}</div>` : ""}\n      ${(a.users || []).length ? `<div class="admin-users">${a.users.map((e) => `\n        <form class="admin-user-row" data-admin-user="${escapeHtml(e.email)}">\n          <label>\n            Nombre\n            <input name="name" value="${escapeHtml(e.name || "")}" required>\n          </label>\n          <span>\n            <strong>${escapeHtml(e.email)}</strong>\n            <small>${e.isSuperAdmin ? "Superadmin" : e.isAdmin ? "Admin" : "Jugador"}</small>\n          </span>\n          <label>\n            Rol\n            <select name="isAdmin" ${e.isSuperAdmin ? "disabled" : ""}>\n              <option value="0" ${e.isAdmin ? "" : "selected"}>Jugador</option>\n              <option value="1" ${e.isAdmin ? "selected" : ""}>Admin</option>\n            </select>\n          </label>\n          <button class="secondary danger admin-delete-user" type="button" ${e.isSuperAdmin ? "disabled" : ""}>Eliminar</button>\n          <button type="submit">Guardar</button>\n        </form>\n      `).join("")}</div>` : '<p class="empty">Todavia no hay usuarios globales.</p>'}\n    `),
      t.querySelectorAll("form[data-admin-user]").forEach((e) => {
        (e.addEventListener("submit", (t) => {
          (t.preventDefault(),
            (async () => {
              const t = document.getElementById("adminStatus"),
                n = {
                  email: e.dataset.adminUser,
                  name: e.elements.name.value.trim(),
                  active: !0,
                  isAdmin: "1" === e.elements.isAdmin?.value,
                };
              try {
                (await updateAdminUser(n), await loadAdminSummary());
              } catch (e) {
                t &&
                  ((t.hidden = !1),
                  (t.textContent = `No se pudo guardar: ${e.message}`));
              }
            })());
        }),
          e
            .querySelector(".admin-delete-user")
            ?.addEventListener("click", async () => {
              if (
                !window.confirm(
                  `¿Estas seguro de que deseas eliminar a ${e.dataset.adminUser}?`,
                )
              )
                return;
              const t = document.getElementById("adminStatus");
              try {
                (await deleteAdminUser(e.dataset.adminUser),
                  await loadAdminSummary());
              } catch (e) {
                t &&
                  ((t.hidden = !1),
                  (t.textContent = `No se pudo eliminar: ${e.message}`));
              }
            }));
      }),
      void t.querySelectorAll(".delete-private-tournament").forEach((e) => {
        e.addEventListener("click", async () => {
          const t = e.dataset.tournamentName || "este torneo";
          if (
            !window.confirm(
              `Vas a eliminar "${t}" y sus predicciones. Esta accion no se puede deshacer. ¿Continuar?`,
            )
          )
            return;
          if (
            "ELIMINAR" ===
            window.prompt(
              `Escribi ELIMINAR para confirmar el borrado de "${t}".`,
            )
          )
            try {
              (await deletePrivateTournament(e.dataset.tournamentId),
                await loadGlobalLobby().catch(() => {}),
                await loadAdminSummary());
            } catch (e) {
              alert(`No se pudo eliminar el torneo: ${e.message}`);
            }
        });
      })
    );
  }
  a.users.length
    ? ((t.innerHTML = a.users
        .map((e) => {
          const t = !1 === e.registered ? "disabled" : "",
            n = Boolean(
              state.companySession?.user?.isSuperAdmin ||
              state.globalSession?.user?.isSuperAdmin,
            ),
            a = t || !n ? "disabled" : "",
            o = e.isSuperAdmin ? "Superadmin" : e.isAdmin ? "Admin" : "Jugador";
          return `\n    <form class="admin-user-row" data-admin-user="${escapeHtml(e.email)}">\n      <span>\n        <strong>${escapeHtml(e.email)}</strong>\n        <small>${o} - ${!1 === e.registered ? "Prode sin usuario registrado" : e.hasPrediction ? "Con prode" : "Sin prode"} - ${e.completedPhases?.length ? escapeHtml(e.completedPhases.join(", ")) : "Sin fechas"}</small>\n      </span>\n      <label>\n        Nombre\n        <input name="name" value="${escapeHtml(e.name || "")}" placeholder="Nombre" ${t}>\n      </label>\n      <label>\n        Area\n        <input name="area" value="${escapeHtml(e.area || "")}" list="companyAreaOptions" placeholder="Area" ${t}>\n      </label>\n      <label class="inline-check">\n        <input name="isAdmin" type="checkbox" ${e.isAdmin ? "checked" : ""} ${a}>\n        Admin\n      </label>\n      <div class="admin-user-actions">\n        <button type="submit" ${t}>Guardar</button>\n        <button class="secondary danger admin-delete-user" type="button" ${e.isSuperAdmin ? "disabled" : ""}>Eliminar</button>\n      </div>\n    </form>\n  `;
        })
        .join("")),
      t.querySelectorAll("[data-admin-user]").forEach((e) => {
        (e.addEventListener("submit", (t) => {
          (t.preventDefault(),
            (async () => {
              const t = e.querySelector("small"),
                n = {
                  email: e.dataset.adminUser,
                  name: e.elements.name.value.trim(),
                  area: e.elements.area.value.trim(),
                  active: !0,
                  isAdmin: e.elements.isAdmin.checked,
                };
              if (n.name && n.area)
                try {
                  (await updateAdminUser(n), await loadAdminSummary());
                } catch (e) {
                  t && (t.textContent = `No se pudo guardar: ${e.message}`);
                }
              else alert("Nombre y area son obligatorios.");
            })());
        }),
          e
            .querySelector(".admin-delete-user")
            ?.addEventListener("click", async () => {
              if (
                !window.confirm(
                  `¿Estas seguro de que deseas eliminar a ${e.dataset.adminUser}?`,
                )
              )
                return;
              const t = e.querySelector("small");
              try {
                (await deleteAdminUser(e.dataset.adminUser),
                  await loadAdminSummary());
              } catch (e) {
                t && (t.textContent = `No se pudo eliminar: ${e.message}`);
              }
            }));
      }))
    : (t.innerHTML =
        '<p class="empty">Todavia no hay usuarios registrados.</p>');
}
function showAdminLoadError(e) {
  const t = document.getElementById("adminStatus"),
    n = document.getElementById("adminLoginForm"),
    a = document.getElementById("adminDashboard");
  ((state.adminUnlocked = !1),
    n && (n.hidden = !1),
    a && (a.hidden = !0),
    t &&
      ((t.hidden = !1),
      (t.textContent = `No se pudo cargar admin: ${e.message}`)));
}
async function loadLeaderboard() {
  const e = document.getElementById("leaderboardPanel"),
    t = document.getElementById("mainLeaderboardPanel");
  if (!e && !t) return;
  const n = currentTournament();
  (e &&
    (e.innerHTML = `<p class="empty" style="text-align: center;">Cargando tabla de ${n?.name || "torneo"}...</p>`),
    t &&
      (t.innerHTML = `<p class="empty" style="text-align: center;">Cargando tabla de ${n?.name || "torneo"}...</p>`));
  try {
    const n = (e, t) => {
        const n = new URLSearchParams({
          tournamentId: state.currentTournamentId,
        });
        return (
          state.tenantId && n.set("tenant", state.tenantId),
          state.companySession?.token &&
            n.set("sessionToken", state.companySession.token),
          state.globalSession?.token &&
            n.set("globalSessionToken", state.globalSession.token),
          e && n.set("area", e),
          t && n.set("minitournamentId", t),
          apiJson(`/api/leaderboard?${n.toString()}`)
        );
      },
      a = (state.tenantId && state.leaderboardArea) || "",
      o = null,
      s = await n(a, o);
    state.leaderboardData = s.leaderboard || [];
    const r = String(
      state.companySession?.user?.email ||
        state.globalSession?.user?.email ||
        "",
    )
      .trim()
      .toLowerCase();
    if (r) {
      const e = state.leaderboardData.find(
        (e) =>
          String(e.player?.email || "")
            .trim()
            .toLowerCase() === r,
      );
      e &&
        e.prediction &&
        (state.loadedPredictionForTournament !== state.currentTournamentId ||
          isPredictionEmpty(state.prediction)) &&
        ((state.prediction = JSON.parse(JSON.stringify(e.prediction))),
        (state.loadedPredictionForTournament = state.currentTournamentId),
        renderAll());
    }
    let i = "",
      d = `Tabla de: ${s.tournament.name}`;
    if (
      (o && s.minitournamentName
        ? (d = `Minitorneo: ${s.minitournamentName}`)
        : a && (d = `Área: ${a} - ${s.tournament.name}`),
      s.leaderboard.length)
    ) {
      const e = s.hasRealResults
        ? "Puntaje calculado con resultados reales guardados."
        : "Sin resultados reales guardados: todos figuran con 0 puntos.";
      i = renderLeaderboardBlock(s, d, e);
    } else
      i = `<p class="empty" style="text-align: center;">Todavia no hay prodes guardados en ${escapeHtml(d)}.</p>`;
    [e, t].forEach((e) => {
      e &&
        ((e.innerHTML = i),
        e.querySelectorAll(".view-user-prode").forEach((e) => {
          e.addEventListener("click", () => showUserProde(e.dataset.email));
        }));
    });
    const l = document.getElementById("mainLeaderboardTitle"),
      m = document.getElementById("mainLeaderboardSubtitle");
    (l && (l.textContent = d),
      m &&
        (m.textContent = s.hasRealResults
          ? "Puntaje calculado con resultados reales guardados."
          : "Sin resultados reales guardados: todos figuran con 0 puntos."));
  } catch (n) {
    (e &&
      (e.innerHTML =
        '<p class="empty" style="text-align: center;">No se pudo cargar el leaderboard.</p>'),
      t &&
        (t.innerHTML =
          '<p class="empty" style="text-align: center;">No se pudo cargar el leaderboard.</p>'));
  }
}
function renderLeaderboardBlock(e, t, n) {
  return e.leaderboard.length
    ? `\n      <div class="leaderboard-head" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">\n        <div>\n          <h3>${t}</h3>\n          <p>${n}</p>\n        </div>\n        <strong>${e.leaderboard.length} jugadores</strong>\n      </div>\n      <div class="leaderboard-table" style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n        ${e.leaderboard.map((e, t) => `\n          <div class="leaderboard-row" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; flex-wrap:wrap; text-align:center; width:100%;">\n            <b style="flex-shrink:0;">${t + 1}</b>\n            <span style="flex:1; min-width: 120px;">${escapeHtml(e.player.name)}<small style="display:block;">${escapeHtml(e.player.area || "Participante")}</small></span>\n            <strong style="flex-shrink:0;">${e.score.points} pts</strong>\n            <em style="flex:2; min-width: 150px; display:block;">Exactos🎯:${e.score.exactScoreHits}</em>\n            <button class="secondary view-user-prode" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; flex-shrink:0;" data-email="${escapeHtml(e.player.email)}">Ver jugada</button>\n          </div>\n        `).join("")}\n      </div>\n    `
    : `<p class="empty" style="text-align: center;">Todavia no hay prodes guardados en ${t}.</p>`;
}

function buyBorder(borderType, cost) {
  // Aquí deberías consultar los FanPoints reales del usuario.
  // Por ahora, aplicamos directamente el efecto visual en la interfaz:
  const avatarBtn = document.getElementById("topbarAvatar");
  if (avatarBtn) {
    // Limpiar bordes anteriores
    avatarBtn.classList.remove('border-gold', 'border-neon', 'border-fire');
    // Agregar el nuevo
    avatarBtn.classList.add(`border-${borderType}`);
    showToast(`¡Has desbloqueado el borde ${borderType}!`);
    
    // NOTA FUTURA: Aquí deberías enviar un POST a tu API (server.js) 
    // para descontar los puntos y guardar el borde activo en la base de datos.
  }
}

// ==========================================
// --- SISTEMA DE BORDES DESBLOQUEABLES ---
// ==========================================

window.sumarFanPoints = function(cantidad) {
  // Obtenemos los puntos guardados (si no hay, empezamos en 0)
  let puntosGuardados = parseInt(localStorage.getItem("userFanPoints")) || 0;
  
  // Sumamos la cantidad
  puntosGuardados += cantidad;
  
  // Guardamos el nuevo total en la memoria
  localStorage.setItem("userFanPoints", puntosGuardados);
  
  // Actualizamos el número en la pantalla (en tu HTML)
  const puntosElemento = document.getElementById("dpUserFanPoints");
  if (puntosElemento) {
    puntosElemento.innerText = puntosGuardados;
  }
  
  // Mostramos el cartelito verde
  showToast(`¡Ganaste ${cantidad} Fan Points! 🏆`);
};

window.buyBorder = function(borderType, cost) {
  // Vemos cuántos puntos tiene el usuario en la memoria
  let puntosActuales = parseInt(localStorage.getItem("userFanPoints")) || 0;
  // VERIFICACIÓN CLAVE: ¿Le alcanza el saldo?
  if (puntosActuales < cost) {
    showToast(`No te alcanzan los Fan Points. Cuesta ${cost} y tenés ${puntosActuales}. 😢`);
    return; // CORTAMOS LA FUNCIÓN ACÁ. No se aplica el borde ni se cobra.
  }
  // Si llegamos acá, es porque tiene saldo suficiente. ¡Cobramos!
  puntosActuales -= cost;
  localStorage.setItem("userFanPoints", puntosActuales);
  // Actualizamos el saldo en pantalla
  const puntosElemento = document.getElementById("dpUserFanPoints");
  if (puntosElemento) {
    puntosElemento.innerText = puntosActuales;
  }
  // Ahora sí, aplicamos el borde
  const avatarBtn = document.getElementById("topbarAvatar");
  if (avatarBtn) {
    avatarBtn.classList.remove('border-gold', 'border-neon', 'border-fire');
    avatarBtn.classList.add(`border-${borderType}`);
    
    showToast(`¡Has equipado el borde ${borderType}! (-${cost} FP)`);
    localStorage.setItem("activeAvatarBorder", `border-${borderType}`);
  }
};

function loadUserData() {
  // Cargar Borde
  const savedBorder = localStorage.getItem("activeAvatarBorder");
  const avatarBtn = document.getElementById("topbarAvatar");
  if (savedBorder && avatarBtn) {
    avatarBtn.classList.add(savedBorder);
  }
  // Cargar Puntos
  let puntosGuardados = parseInt(localStorage.getItem("userFanPoints")) || 0;
  const puntosElemento = document.getElementById("dpUserFanPoints");
  if (puntosElemento) {
    puntosElemento.innerText = puntosGuardados;
  }
}
// 4. Ejecutamos la carga apenas arranca la app
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(loadUserData, 500); 
});

function showUserProde(e) {
  const t = (state.leaderboardData || []).find((t) => t.player.email === e);
  if (!t) return;
  const n = t.prediction || {},
    a = state.real || currentTournament()?.realResults || {},
    o =
      t.score?.points ?? ("number" == typeof t.score ? t.score : t.points || 0),
    s = "dynamicUserProdeModal";
  document.getElementById(s)?.remove();
  const r = document.createElement("div");
  ((r.id = s),
    (r.style.position = "fixed"),
    (r.style.inset = "0"),
    (r.style.zIndex = "3000"),
    (r.style.background = "rgba(0, 0, 0, 0.75)"),
    (r.style.backdropFilter = "blur(4px)"),
    (r.style.display = "grid"),
    (r.style.placeItems = "center"),
    (r.style.padding = "20px"));
  const i = [];
  (Object.keys(n.groupMatches || {}).forEach((e) => {
    const t = a.groupMatches?.[e];
    if (
      t &&
      "" !== t.home &&
      "" !== t.away &&
      void 0 !== t.home &&
      void 0 !== t.away
    ) {
      const a = n.groupMatches[e],
        o = e.split("-"),
        s = o[1],
        r = o[2],
        d = WORLD_CUP_GROUPS[o[0]]?.[s] || s,
        l = WORLD_CUP_GROUPS[o[0]]?.[r] || r,
        m = MATCH_SCHEDULE[e]?.number || 999;
      i.push({
        id: e,
        number: m,
        type: "group",
        label: `Partido ${m} - Grupo ${o[0]}`,
        homeKey: s,
        awayKey: r,
        homeName: d,
        awayName: l,
        predHome: a?.home,
        predAway: a?.away,
        realHome: t.home,
        realAway: t.away,
        earnedPoints: a ? calculateMatchPoints(a, t) : 0,
      });
    }
  }),
    Object.keys(n.scores || {}).forEach((e) => {
      const t = a.scores?.[e];
      if (
        t &&
        "" !== t.left &&
        "" !== t.right &&
        void 0 !== t.left &&
        void 0 !== t.right
      ) {
        const a = n.scores[e],
          o = MATCH_SCHEDULE[e]?.number || 999;
        i.push({
          id: e,
          number: o,
          type: "bracket",
          label: `Partido ${o} - Fase Final (${e.toUpperCase()})`,
          homeKey: "",
          awayKey: "",
          homeName: "Local",
          awayName: "Visitante",
          predHome: a?.left,
          predAway: a?.right,
          realHome: t.left,
          realAway: t.right,
          earnedPoints: 0,
        });
      }
    }),
    i.sort((e, t) => e.number - t.number));
  let d = "";
  (i.forEach((e) => {
    const t =
        "" !== e.predHome && void 0 !== e.predHome
          ? `${e.predHome} - ${e.predAway}`
          : "S/P",
      n = `${e.realHome} - ${e.realAway}`,
      a = e.homeKey ? teamBadge(e.homeName) : "",
      o = e.awayKey ? teamBadge(e.awayName) : "";
    let s = "";
    ((s =
      e.earnedPoints > 0
        ? `<span style="background: rgba(13,107,87,0.15); color: #0d6b57; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 900; margin-left: auto;">+${e.earnedPoints} pts</span>`
        : '<span style="background: rgba(180,35,58,0.1); color: #b4233a; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 900; margin-left: auto;">0 pts</span>'),
      (d += `\n      <div style="margin-bottom: 12px; background: rgba(0,0,0,0.02); border: 1px solid var(--line); border-radius: 10px; padding: 10px;">\n        <div style="font-size: 0.72rem; color: var(--muted); font-weight: 800; margin-bottom: 6px; display: flex; align-items: center;">\n          <span>${e.label}</span>\n          ${s}\n        </div>\n        <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; font-size: 0.9rem;">\n          \n          <div style="text-align: right; font-weight: 800; color: var(--ink); display: flex; align-items: center; justify-content: flex-end; gap: 6px;">\n            <span>${escapeHtml(e.homeName)}</span>\n            <span style="display: inline-flex; align-items: center;">${a}</span>\n          </div>\n          \n          <div style="text-align: center; background: #fff; border: 1px solid var(--line); padding: 4px 10px; border-radius: 6px; min-width: 80px;">\n            <div style="font-weight: 900; color: var(--accent); font-size: 1.05rem; letter-spacing: 1px;">${escapeHtml(t)}</div>\n            <div style="font-size: 0.7rem; color: var(--muted); margin-top: 2px; font-weight: 700;">Real: ${escapeHtml(n)}</div>\n          </div>\n          \n          <div style="text-align: left; font-weight: 800; color: var(--ink); display: flex; align-items: center; justify-content: flex-start; gap: 6px;">\n            <span style="display: inline-flex; align-items: center;">${o}</span>\n            <span>${escapeHtml(e.awayName)}</span>\n          </div>\n\n        </div>\n      </div>\n    `));
  }),
    d ||
      (d =
        '<p style="color: var(--muted); padding: 30px 0; text-align: center; font-weight: 700; font-size: 0.95rem;">No hay partidos finalizados con resultado oficial en esta sección.</p>'));
  let l = "";
  ((l = n.winners?.m104
    ? `\n      <div style="margin-bottom: 18px; padding: 12px; background: linear-gradient(135deg, rgba(215,169,52,0.12), rgba(215,169,52,0.03)); border: 2px dashed var(--gold, #d7a934); border-radius: 10px; text-align: center; font-weight: 800; color: var(--ink); font-size: 0.95rem;">\n        🏆 Campeón Pronosticado: <span style="color: var(--accent-2, #b4233a); font-size: 1.1rem; font-weight: 900; margin-left: 4px;">${escapeHtml(n.winners.m104)}</span>\n      </div>\n    `
    : '\n      <div style="margin-bottom: 18px; padding: 12px; background: rgba(0,0,0,0.03); border: 1px dashed var(--line); border-radius: 10px; text-align: center; font-weight: 700; color: var(--muted); font-size: 0.88rem;">\n        No seleccionó campeón para la fase final.\n      </div>\n    '),
    (r.innerHTML = `\n    <div class="modal-panel" style="width: min(100%, 540px); max-height: 80vh; display: flex; flex-direction: column; background: #fffaf1; border-radius: 14px; border: 1px solid var(--line); box-shadow: 0 25px 70px rgba(0,0,0,0.4); overflow: hidden; animation: modalPop 0.2s ease-out;">\n      <div style="background: linear-gradient(135deg, var(--accent), #084c3e); color: white; padding: 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--gold);">\n        <div>\n          <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.75); font-weight: 800;">Historial de Aciertos</span>\n          <h3 style="margin: 2px 0 0 0; font-size: 1.3rem; font-weight: 900; color: white;">Prode de ${escapeHtml(t.player.name)}</h3>\n        </div>\n        <div style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 30px; font-weight: 900; font-size: 0.95rem; box-shadow: inset 0 1px 2px rgba(0,0,0,0.15);">\n          ${o} Pts\n        </div>\n      </div>\n      <div style="flex: 1; overflow-y: auto; padding: 18px; background: #fffaf1;">\n        ${l}\n        <div style="display: flex; flex-direction: column;">\n          ${d}\n        </div>\n      </div>\n      <div style="padding: 14px 18px; background: var(--bg, #f5f1e8); border-top: 1px solid var(--line); display: flex; justify-content: flex-end;">\n        <button id="closeUserProdeModalBtn" style="background: var(--accent-2, #b4233a); color: white; min-height: 40px; padding: 0 26px; font-size: 0.9rem; font-weight: 900; border-radius: 6px; cursor: pointer; border: 0; box-shadow: 0 4px 12px rgba(180,35,58,0.25); transition: all 0.15s ease;">\n          Cerrar Cartel\n        </button>\n      </div>\n    </div>\n    <style>\n      @keyframes modalPop {\n        from { opacity: 0; transform: scale(0.97) translateY(5px); }\n        to { opacity: 1; transform: scale(1) translateY(0); }\n      }\n      #closeUserProdeModalBtn:hover {\n        filter: brightness(0.92);\n        transform: translateY(-1px);\n      }\n    </style>\n  `),
    r
      .querySelector("#closeUserProdeModalBtn")
      .addEventListener("click", () => r.remove()),
    r.addEventListener("click", (e) => {
      e.target === r && r.remove();
    }),
    document.body.appendChild(r));
}
async function loadMiniTournaments() {
  const e = currentTournament();
  if (e)
    try {
      const t = new URLSearchParams({
          globalSessionToken: state.globalSession?.token || "",
          sessionToken: state.companySession?.token || "",
          tenantId: state.tenantId || "",
        }),
        n = await apiJson(
          `/api/tournaments/${e.id}/minitournaments?${t.toString()}`,
        );
      ((state.userMiniTournaments[e.id] = n.userMiniTournaments || []),
        (state.currentMiniTournamentId = n.currentMiniTournament || null),
        renderMiniTournaments(n.minitournaments || []));
    } catch (e) {
      console.error("Error loading mini tournaments:", e);
    }
}
function renderMiniTournaments(e = []) {
  const t = document.getElementById("minitournamentsGrid");
  if (!t) return;
  const n = state.userMiniTournaments[state.currentTournamentId] || [];
  if (
    ((t.style.display = "flex"),
    (t.style.flexWrap = "wrap"),
    (t.style.justifyContent = "center"),
    (t.style.gap = "1rem"),
    !document.getElementById("dynamicJoinMiniBtn"))
  ) {
    const e = document.getElementById("createMiniTournamentBtn");
    if (e) {
      const t = document.createElement("button");
      ((t.id = "dynamicJoinMiniBtn"),
        (t.className = "secondary"),
        (t.textContent = "Unirse a Minitorneo"),
        (t.style.marginLeft = "0.5rem"),
        (t.onclick = async () => {
          const e = window.prompt("Nombre exacto del minitorneo:");
          if (!e) return;
          const t = window.prompt("Contraseña del minitorneo:");
          t && (await joinMiniTournament(e, t));
        }),
        e.parentNode.insertBefore(t, e.nextSibling));
    }
  }
  const a = String(
      state.companySession?.user?.email ||
        state.globalSession?.user?.email ||
        "",
    )
      .trim()
      .toLowerCase(),
    o = Boolean(
      state.companySession?.user?.isAdmin ||
      state.globalSession?.user?.isAdmin ||
      state.globalSession?.user?.isSuperAdmin,
    );
  ((t.innerHTML = e
    .map((e) => {
      const t = n.includes(e.id),
        s = (state.currentMiniTournamentId, e.id, e.creatorEmail === a || o);
      return `\n      <div class="minitournament-card" data-mini-id="${e.id}" style="text-align: center; display: flex; flex-direction: column; align-items: center; width: 100%;">\n        <h3>${escapeHtml(e.name)}</h3>\n        <p>${escapeHtml(e.description || "")}</p>\n        <span class="mini-players">${e.participants?.length || 0} participantes</span>\n        <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap; justify-content: center; width: 100%;">\n          ${t ? `<button class="secondary view-mini-leaderboard" data-mini-id="${e.id}">Ver tabla</button>` : ""}\n          ${s ? `<button class="secondary danger delete-minitournament" data-mini-id="${e.id}">Eliminar minitorneo</button>` : ""}\n        </div>\n        <div id="mini-leaderboard-container-${e.id}" style="display: none; width: 100%; margin-top: 1rem; border-top: 1px solid var(--line, #ddd); padding-top: 1rem;"></div>\n      </div>\n    `;
    })
    .join("")),
    t.querySelectorAll(".select-minitournament").forEach((e) => {
      e.addEventListener("click", () => selectMiniTournament(e.dataset.miniId));
    }),
    t.querySelectorAll(".view-mini-leaderboard").forEach((e) => {
      e.addEventListener("click", async () => {
        const t = e.dataset.miniId,
          n = currentTournament();
        if (!n) return;
        const a = document.getElementById(`mini-leaderboard-container-${t}`);
        if ("block" === a.style.display)
          return (
            (a.style.display = "none"),
            void (e.textContent = "Ver tabla")
          );
        ((e.textContent = "Ocultar tabla"),
          (a.style.display = "block"),
          (a.innerHTML =
            '<p class="empty" style="margin: 0;">Cargando tabla...</p>'));
        try {
          const e = new URLSearchParams({
            tournamentId: n.id,
            minitournamentId: t,
          });
          (state.globalSession?.token &&
            e.set("globalSessionToken", state.globalSession.token),
            state.companySession?.token &&
              e.set("sessionToken", state.companySession.token),
            state.tenantId && e.set("tenant", state.tenantId));
          const o = await apiJson(`/api/leaderboard?${e.toString()}`),
            s = o.leaderboard || [];
          state.leaderboardData = s;
          const r = String(
              state.companySession?.user?.email ||
                state.globalSession?.user?.email ||
                "",
            )
              .trim()
              .toLowerCase(),
            i = (o.tournament?.minitournaments || n.minitournaments || []).find(
              (e) => e.id === t,
            ),
            d = i && i.creatorEmail === r;
          if (!s.length)
            return void (a.innerHTML =
              '<p class="empty" style="text-align: center; margin: 0;">Todavía no hay jugadores en este minitorneo.</p>');
          const l = `\n          <div class="leaderboard-table" style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n            ${s.map((e, n) => `\n              <div class="leaderboard-row" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; flex-wrap:wrap; text-align:center; width:100%;">\n                <b style="flex-shrink:0;">${n + 1}</b>\n                <span style="flex:1; min-width: 120px;">${escapeHtml(e.player.name)}<small style="display:block;">${escapeHtml(e.player.area || "Participante")}</small></span>\n                <strong style="flex-shrink:0; align-items:center;">${e.score.points} pts</strong>\n                <em style="flex:2; min-width: 150px; display:block;">Exactos🎯:${e.score.exactScoreHits}</em>\n                <button class="secondary view-user-prode" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; flex-shrink:0;" data-email="${escapeHtml(e.player.email)}">Ver jugada</button>\n                ${d && e.player.email !== r ? `<button class="secondary danger remove-mini-user" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; flex-shrink:0;" data-mini-id="${t}" data-email="${escapeHtml(e.player.email)}">Eliminar</button>` : ""}\n              </div>\n            `).join("")}\n          </div>\n        `;
          ((a.innerHTML = l),
            a.querySelectorAll(".view-user-prode").forEach((e) => {
              e.addEventListener("click", () => showUserProde(e.dataset.email));
            }),
            a.querySelectorAll(".remove-mini-user").forEach((e) => {
              e.addEventListener("click", () =>
                removeUserFromMiniTournament(e.dataset.miniId, e.dataset.email),
              );
            }));
        } catch (e) {
          a.innerHTML = `<p class="empty" style="color:red; margin: 0;">Error al cargar la tabla: ${e.message}</p>`;
        }
      });
    }),
    t.querySelectorAll(".delete-minitournament").forEach((e) => {
      e.addEventListener("click", () => deleteMiniTournament(e.dataset.miniId));
    }));
}
async function selectMiniTournament(e) {
  const t = currentTournament();
  if (t)
    try {
      (
        await apiJson("/api/minitournaments/select", {
          method: "POST",
          body: JSON.stringify({
            tournamentId: t.id,
            minitournamentId: e,
            globalSessionToken: state.globalSession?.token || "",
            sessionToken: state.companySession?.token || "",
            tenantId: state.tenantId || "",
          }),
        })
      ).ok &&
        ((state.currentMiniTournamentId =
          state.currentMiniTournamentId === e ? null : e),
        await loadMiniTournaments(),
        openView("predictor"));
    } catch (e) {
      (console.error("Error selecting mini tournament:", e),
        alert("No se pudo seleccionar el minitorneo"));
    }
}
async function joinMiniTournament(e, t) {
  const n = currentTournament();
  if (n)
    try {
      const a = await apiJson("/api/minitournaments/join", {
        method: "POST",
        body: JSON.stringify({
          tournamentId: n.id,
          name: e,
          code: t,
          globalSessionToken: state.globalSession?.token || "",
          sessionToken: state.companySession?.token || "",
          tenantId: state.tenantId || "",
        }),
      });
      a.ok &&
        (state.userMiniTournaments[n.id] ||
          (state.userMiniTournaments[n.id] = []),
        state.userMiniTournaments[n.id].includes(a.minitournamentId) ||
          state.userMiniTournaments[n.id].push(a.minitournamentId),
        (state.currentMiniTournamentId = a.minitournamentId),
        await loadMiniTournaments());
    } catch (e) {
      (console.error("Error joining mini tournament:", e), alert(e.message));
    }
}
async function createMiniTournament(e, t, n) {
  const a = currentTournament();
  if (a)
    try {
      const o = await apiJson("/api/minitournaments", {
        method: "POST",
        body: JSON.stringify({
          tournamentId: a.id,
          name: e,
          description: t,
          code: n,
          globalSessionToken: state.globalSession?.token || "",
          sessionToken: state.companySession?.token || "",
          tenantId: state.tenantId || "",
        }),
      });
      if (o.ok) {
        ((state.currentMiniTournamentId = o.minitournament.id),
          state.userMiniTournaments[a.id] ||
            (state.userMiniTournaments[a.id] = []),
          state.userMiniTournaments[a.id].push(o.minitournament.id),
          await loadMiniTournaments());
        const e = document.getElementById("createMiniTournamentModal");
        e && (e.hidden = !0);
      }
    } catch (e) {
      (console.error("Error creating mini tournament:", e),
        alert("No se pudo crear el minitorneo: " + e.message));
    }
}
async function deleteMiniTournament(e) {
  if (!window.confirm("¿Seguro que querés eliminar este minitorneo?")) return;
  const t = currentTournament();
  try {
    (
      await apiJson("/api/minitournaments/delete", {
        method: "POST",
        body: JSON.stringify({
          tournamentId: t.id,
          minitournamentId: e,
          globalSessionToken: state.globalSession?.token || "",
          sessionToken: state.companySession?.token || "",
          tenantId: state.tenantId || "",
        }),
      })
    ).ok &&
      (state.currentMiniTournamentId === e &&
        (state.currentMiniTournamentId = null),
      await loadMiniTournaments());
  } catch (e) {
    alert("Error al eliminar: " + e.message);
  }
}
async function removeUserFromMiniTournament(e, t) {
  if (
    !window.confirm(
      "¿Seguro que querés eliminar a este usuario del minitorneo?",
    )
  )
    return;
  const n = currentTournament();
  try {
    if (
      (
        await apiJson("/api/minitournaments/remove-user", {
          method: "POST",
          body: JSON.stringify({
            tournamentId: n.id,
            minitournamentId: e,
            userEmailToRemove: t,
            globalSessionToken: state.globalSession?.token || "",
            sessionToken: state.companySession?.token || "",
            tenantId: state.tenantId || "",
          }),
        })
      ).ok
    ) {
      const t = document.querySelector(
        `.view-mini-leaderboard[data-mini-id="${e}"]`,
      );
      t && (t.click(), t.click());
    }
  } catch (e) {
    alert("Error: " + e.message);
  }
}
function validatePayload(e) {
  if (isEntryClosed())
    return (showToast("La carga de prodes ya está cerrada.", !0), !1);
  if (state.tenantId && !state.companySession && !state.tenantAccessGranted)
    return (
      showToast("Primero ingresa con tu usuario de empresa.", !0),
      document
        .getElementById("companyLogin")
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      !1
    );
  if (!e.player.name || !e.player.email)
    return (
      showToast("Primero ingresa con tu usuario global.", !0),
      openView("lobby"),
      !1
    );
  if (!usesWorldCupEditor()) {
    const t = e.tournament.custom || {},
      n = Object.values(t.matches || {}).some(
        (e) => e.winner || ("" !== e.homeScore && "" !== e.awayScore),
      ),
      a = Boolean(t.champion);
    return (
      !(!n && !a) ||
      (showToast(
        "Completa al menos un resultado o elegí un campeón para poder guardar.",
        !0,
      ),
      !1)
    );
  }
  const t = Object.values(e.tournament.groups || {})
      .flat()
      .some(Boolean),
    n = Object.values(e.tournament.groupMatches || {}).some(
      (e) => "" !== e.home || "" !== e.away,
    ),
    a = Object.values(e.tournament.winners || {}).some(Boolean);
  return (
    !!(t || n || a) ||
    (showToast(
      "Completa al menos un resultado o posición para poder guardar.",
      !0,
    ),
    !1)
  );
}
function normalizeLiveMatch(e) {
  return {
    id: e.id || "",
    date: e.date || "",
    stage: e.stage || "Partido",
    group: e.group || "",
    home: e.home || "",
    away: e.away || "",
    homeScore: e.homeScore,
    awayScore: e.awayScore,
    status: e.status || "programado",
  };
}
function renderLiveResults() {
  const e = document.getElementById("liveStatus"),
    t = document.getElementById("liveGrid"),
    n = state.live.updatedAt
      ? new Intl.DateTimeFormat("es-AR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(state.live.updatedAt))
      : "sin fecha";
  ((e.textContent = `Ultima actualizacion: ${n}. Fuente: ${state.live.source || "sin fuente"}.`),
    (t.innerHTML = ""),
    state.live.matches.length
      ? state.live.matches.map(normalizeLiveMatch).forEach((e) => {
          const n =
              "finalizado" === e.status ||
              void 0 !== e.homeScore ||
              void 0 !== e.awayScore,
            a = document.createElement("article");
          ((a.className = "live-card"),
            (a.innerHTML = `\n      <div class="live-meta">\n        <span>${e.stage}${e.group ? ` - Grupo ${e.group}` : ""}</span>\n        <strong>${e.date || "Fecha a confirmar"}</strong>\n      </div>\n      <div class="live-score">\n        ${teamBadge(e.home)}\n        <b>${n ? `${e.homeScore ?? "-"} - ${e.awayScore ?? "-"}` : "vs"}</b>\n        ${teamBadge(e.away)}\n      </div>\n      <div class="live-state">${e.status}</div>\n    `),
            t.appendChild(a));
        })
      : (t.innerHTML =
          '<div class="empty-live">Todavia no hay resultados cargados. Cuando empiece el Mundial, aca van a aparecer los partidos del dia anterior.</div>'));
}
async function loadLiveResults() {
  const e = document.getElementById("liveStatus");
  e.textContent = "Actualizando resultados...";
  try {
    const e = await fetch(
      `${apiUrl(APP_CONFIG.liveResultsUrl)}?t=${Date.now()}`,
    );
    if (!e.ok) throw new Error("No se pudo leer resultados");
    const t = await e.json();
    ((state.live = {
      updatedAt: t.updatedAt || "",
      source: t.source || "",
      matches: Array.isArray(t.matches) ? t.matches : [],
    }),
      renderLiveResults());
  } catch (t) {
    e.textContent = "No se pudieron cargar los resultados en vivo.";
  }
}
function escapePdfText(e) {
  return String(e)
    .replace(/[\\()]/g, "\\$&")
    .replace(/[^\x20-\x7E]/g, "");
}
function createPdfBlob(e) {
  const t = tournamentDefinition(),
    n = e.tournament.custom
      ? [
          `Torneo: ${t.name}`,
          `Ganador: ${e.tournament.custom.champion || ""}`,
          "",
          "Partidos:",
          ...Object.entries(e.tournament.custom.matches || {}).map(([e, t]) => {
            const n =
              "" !== t.homeScore || "" !== t.awayScore
                ? ` ${t.homeScore || 0}-${t.awayScore || 0}`
                : "";
            return `${e.toUpperCase()}: ${t.home} vs ${t.away}${n} | ${t.winner || "sin ganador"}`;
          }),
        ]
      : [],
    a = [
      `Campeon: ${e.tournament.winners.m104}`,
      "",
      ...groupKeys().map(
        (t) => `Grupo ${t}: ${e.tournament.groups[t].join(" | ")}`,
      ),
      "",
      "Cruces:",
      ...Object.entries(e.tournament.winners).map(([t, n]) => {
        const a = scoreLabel(e.tournament.scores?.[t]);
        return `${t.toUpperCase()}: ${n}${a ? ` (${a})` : ""}`;
      }),
    ],
    o = [
      "BT",
      "/F1 14 Tf",
      "50 790 Td",
      ...[
        "Prode",
        `Jugador: ${e.player.name}`,
        `Email: ${e.player.email}`,
        ...(usesWorldCupEditor() ? a : n),
      ]
        .slice(0, 58)
        .flatMap((e, t) => [
          0 === t ? "" : "0 -18 Td",
          `(${escapePdfText(e)}) Tj`,
        ]),
      "ET",
    ]
      .filter(Boolean)
      .join("\n"),
    s = btoa(unescape(encodeURIComponent(JSON.stringify(e)))),
    r = [
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
      "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
      `5 0 obj << /Length ${o.length} >> stream\n${o}\nendstream endobj`,
    ];
  let i = "%PDF-1.4\n";
  const d = [0];
  r.forEach((e) => {
    (d.push(i.length), (i += `${e}\n`));
  });
  const l = i.length;
  return (
    (i += `xref\n0 ${r.length + 1}\n0000000000 65535 f \n`),
    d.slice(1).forEach((e) => {
      i += `${String(e).padStart(10, "0")} 00000 n \n`;
    }),
    (i += `trailer << /Root 1 0 R /Size ${r.length + 1} >>\nstartxref\n${l}\n%%EOF\n`),
    (i += `\n%%PRODEMUNDIAL_DATA_BEGIN:${s}:PRODEMUNDIAL_DATA_END\n`),
    new Blob([i], { type: "application/pdf" })
  );
}
function downloadBlob(e, t) {
  const n = URL.createObjectURL(e),
    a = document.createElement("a");
  ((a.href = n),
    (a.download = t),
    document.body.appendChild(a),
    a.click(),
    a.remove(),
    URL.revokeObjectURL(n));
}
function updateHomeMatchesView() {
  if (!usesWorldCupEditor()) return;
  const e = document.getElementById("homeLastMatchCard"),
    t = document.getElementById("homeNextMatchCard");
  if (!e || !t) return;
  const n = state.real || {};
  let a = null,
    o = null;
  const s = Object.keys(MATCH_SCHEDULE).sort(
    (e, t) => MATCH_SCHEDULE[e].number - MATCH_SCHEDULE[t].number,
  );
  for (let e = s.length - 1; e >= 0; e--) {
    const t = s[e];
    let r = !1;
    if (t.includes("-")) {
      const e = n.groupMatches?.[t];
      e && "" !== e.home && "" !== e.away && void 0 !== e.home && (r = !0);
    } else {
      const e = n.scores?.[t],
        a = n.winners?.[t];
      ((e && "" !== e.left && "" !== e.right && void 0 !== e.left) ||
        (a && "" !== a)) &&
        (r = !0);
    }
    if (r) {
      ((a = t), (o = s[e + 1] || null));
      break;
    }
  }
  function r(e, t) {
    const a = MATCH_SCHEDULE[e];
    let o = "Local",
      s = "Visitante";
    if (e.includes("-")) {
      const t = e.split("-");
      ((o = WORLD_CUP_GROUPS[t[0]]?.[t[1]] || "Local"),
        (s = WORLD_CUP_GROUPS[t[0]]?.[t[2]] || "Visitante"));
    } else {
      const t = ALL_BRACKET_MATCHES.find(([t]) => t === e);
      if (t) {
        const a = resolveSlot(t[1], n, e),
          r = resolveSlot(t[2], n, e);
        ((o = a || t[1]), (s = r || t[2]));
      }
    }
    let r = "<b>vs</b>";
    if (t)
      if (e.includes("-")) {
        const t = n.groupMatches?.[e];
        r = `<b>${t.home} - ${t.away}</b>`;
      } else {
        const t = n.scores?.[e];
        if (t && "" !== t.left && "" !== t.right)
          r = `<b>${t.left} - ${t.right}</b>`;
        else {
          const t = n.winners?.[e];
          r = `<b style="font-size:0.75rem;">Ganó ${escapeHtml(teamLabel(t))}</b>`;
        }
      }
    const i = a?.number ? `Partido ${a.number}` : e.toUpperCase();
    return `\n      <div class="matchday-title">\n        <span>${t ? `Finalizado - ${a?.date || ""}` : `${i} - ${a?.date || ""}`}</span>\n        <strong>${t ? "Último partido" : "Próximo partido"}</strong>\n      </div>\n      <div class="home-fixture-line">\n        ${teamBadge(o)}\n        ${r}\n        ${teamBadge(s)}\n      </div>\n      <small class="match-schedule">${t ? `${i} | ` : ""}${a?.time || ""} hs - ${a?.venue || ""}</small>\n    `;
  }
  (a || (o = s[0]),
    (e.innerHTML = a
      ? r(a, !0)
      : '\n        <div class="matchday-title">\n          <span>Aún no comenzó</span>\n          <strong>Último partido</strong>\n        </div>\n        <p class="empty home-empty" style="margin: 20px 0; text-align: center; color: var(--muted);">Ningún partido finalizado</p>\n     '),
    (t.innerHTML = o
      ? r(o, !1)
      : '\n        <div class="matchday-title">\n          <span>Torneo finalizado</span>\n          <strong>Próximo partido</strong>\n        </div>\n        <p class="empty home-empty" style="margin: 20px 0; text-align: center; color: var(--muted);">No hay más partidos</p>\n     '));
}
function blobToBase64(e) {
  return new Promise((t, n) => {
    const a = new FileReader();
    ((a.onload = () => t(String(a.result).split(",")[1])),
      (a.onerror = n),
      a.readAsDataURL(e));
  });
}
function getFileName(e) {
  return `prode-${
    e.player.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "jugador"
  }.pdf`;
}
function scoreTournament(e, t) {
  if (e.custom || t.custom) {
    const n = t.custom?.matches || {},
      a = e.custom?.matches || {};
    let o = 0,
      s = 0,
      r = 0,
      i = 0;
    Object.keys(n).forEach((e) => {
      (n[e].winner && ((s += 1), a[e]?.winner === n[e].winner && (o += 1)),
        ("" === n[e].homeScore && "" === n[e].awayScore) ||
          ((i += 1),
          a[e]?.homeScore === n[e].homeScore &&
            a[e]?.awayScore === n[e].awayScore &&
            (r += 1)));
    });
    const d = Boolean(
      t.custom?.champion && e.custom?.champion === t.custom.champion,
    );
    return {
      groupHits: 0,
      groupTotal: 0,
      winnerHits: o,
      winnerTotal: s,
      exactScoreHits: r,
      exactScoreTotal: i,
      points: 3 * o + 2 * r + (d ? 10 : 0),
      championHit: d,
    };
  }
  let n = 0,
    a = 0;
  groupKeys().forEach((o) => {
    [0, 1, 2, 3].forEach((s) => {
      ((a += 1),
        e.groups[o][s] && e.groups[o][s] === t.groups[o][s] && (n += 1));
    });
  });
  const o = ALL_BRACKET_MATCHES.map((e) => e[0]);
  let s = 0,
    r = 0,
    i = 0,
    d = 0;
  return (
    Object.keys(t.groupMatches || {}).forEach((n) => {
      const a = t.groupMatches[n],
        o = e.groupMatches?.[n],
        l = matchScores(a),
        m = matchScores(o || {});
      if (!l || null === l.home || null === l.away) return;
      if (!m || null === m.home || null === m.away) return;
      const c = Math.sign(l.home - l.away),
        u = Math.sign(m.home - m.away);
      ((r += 1),
        c === u && (s += 1),
        (d += 1),
        l.home === m.home && l.away === m.away && (i += 1));
    }),
    o.forEach((n) => {
      (t.winners[n] && ((r += 1), e.winners[n] === t.winners[n] && (s += 1)),
        scoreLabel(t.scores?.[n]) &&
          ((d += 1),
          scoreLabel(e.scores?.[n]) === scoreLabel(t.scores?.[n]) && (i += 1)));
    }),
    {
      groupHits: n,
      groupTotal: a,
      winnerHits: s,
      winnerTotal: r,
      exactScoreHits: i,
      exactScoreTotal: d,
      points: n + 3 * s + 2 * i,
      championHit: e.winners.m104 && e.winners.m104 === t.winners.m104,
    }
  );
}
function renderScore(e) {
  return scoreTournament(e.tournament, state.real);
}
function extractPayloadFromPdf(e) {
  const t = e.match(
    /%%PRODEMUNDIAL_DATA_BEGIN:([A-Za-z0-9+/=]+):PRODEMUNDIAL_DATA_END/,
  );
  return t ? JSON.parse(decodeURIComponent(escape(atob(t[1])))) : null;
}
function openView(e) {
  const t = document.querySelector(`.tab[data-view="${e}"]`),
    n = document.getElementById(e);
  if (!t || !n) return;
  ((state.currentView = e),
    document
      .querySelectorAll(".tab")
      .forEach((e) => e.classList.remove("is-active")),
    document
      .querySelectorAll(".view")
      .forEach((e) => e.classList.remove("is-visible")),
    t.classList.add("is-active"),
    n.classList.add("is-visible"));
  const a = document.querySelector(".summary-band"),
    o = document.querySelector(".brand-watermark"),
    s = "inicio" === e;
  (a && (a.hidden = !s),
    o && (o.hidden = !s),
    renderCompanyAuth(),
    syncTenantNavigation(),
    "games" === e &&
      (state.tenantId
        ? renderDailyGames()
        : loadGlobalGames().catch(() => renderDailyGames())),
    "lobby" === e && loadGlobalLobby().catch(() => renderGlobalLobby()),
    "live" === e && loadLiveResults(),
    "tournaments" === e && renderTournamentControls(),
    "admin" === e &&
      (updateAdminSections(state.adminSection),
      fillAdminThemeForm(),
      fillAdminGamesForm(),
      canUseAdminPanel()
        ? ((state.adminUnlocked = !0),
          (document.getElementById("adminLoginForm").hidden = !0),
          loadAdminSummary().catch(showAdminLoadError))
        : state.adminUnlocked
          ? loadAdminSummary().catch(showAdminLoadError)
          : ((document.getElementById("adminLoginForm").hidden = !1),
            (document.getElementById("adminDashboard").hidden = !0))),
    "main-leaderboard" === e && loadLeaderboard(),
    syncTopbarVisibility());
}
(document.querySelectorAll(".tab").forEach((e) => {
  e.addEventListener("click", () => {
    e.dataset.view && openView(e.dataset.view);
  });
}),
  document.querySelectorAll(".admin-subtab").forEach((e) => {
    e.addEventListener("click", () => {
      (updateAdminSections(e.dataset.adminSection || "users"),
        fillAdminThemeForm(),
        fillAdminGamesForm(),
        canUseAdminPanel() &&
          loadAdminSummary().catch((e) => {
            const t = document.getElementById("adminStatus");
            t &&
              ((t.hidden = !1),
              (t.textContent = `No se pudo cargar admin: ${e.message}`));
          }));
    });
  }),
  document
    .getElementById("autoFill")
    .addEventListener("click", () => fillModel(state.prediction)),
  document
    .getElementById("clearPredictions")
    .addEventListener("click", () => clearModel(state.prediction)),
  document.getElementById("autoReal").addEventListener("click", () => {
    ((state.real = JSON.parse(JSON.stringify(state.prediction))), renderAll());
  }),
  document.getElementById("clearReal").addEventListener("click", async () => {
    if (
      confirm(
        "¿Estás seguro de que deseas limpiar todos los resultados reales? Esto restablecerá los puntos de todos los usuarios.",
      )
    ) {
      clearModel(state.real);
      const e = document.getElementById("clearReal"),
        t = e.textContent;
      ((e.textContent = "Limpiando..."), (e.disabled = !0));
      try {
        (await saveRealResults(),
          alert("Resultados reales limpiados correctamente."));
      } catch (e) {
        alert("Error al limpiar resultados reales: " + e.message);
      } finally {
        ((e.textContent = t), (e.disabled = !1));
      }
    }
  }),
  document
    .getElementById("refreshLive")
    .addEventListener("click", loadLiveResults),
  document
    .getElementById("refreshLeaderboard")
    .addEventListener("click", loadLeaderboard),
  document
    .getElementById("toggleResultsAdmin")
    .addEventListener("click", () => {
      document.querySelector('[data-admin-section="results"]')?.click();
    }),
  document
    .getElementById("importApiResults")
    ?.addEventListener("click", async () => {
      const e = document.getElementById("apiResultsStatus");
      e &&
        ((e.hidden = !1),
        (e.textContent = "Importando resultados desde la API..."));
      try {
        const t = await importApiResults();
        (e &&
          (e.textContent = `Importacion lista: ${t.imported || 0} resultados aplicados, ${t.fixtures || 0} partidos reales sincronizados.`),
          alert("Resultados importados. El leaderboard ya fue recalculado."));
      } catch (t) {
        e && (e.textContent = `No se pudo importar desde API: ${t.message}`);
      }
    }),
  document
    .getElementById("adminLoginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("adminStatus");
      ((state.adminKey = document.getElementById("adminKey").value),
        (t.hidden = !1),
        (t.textContent = "Validando admin..."));
      try {
        (await loadAdminSummary(),
          (state.adminUnlocked = !0),
          syncAdminNavigation());
      } catch (e) {
        t.textContent = `No se pudo abrir admin: ${e.message}`;
      }
    }),
  document.getElementById("refreshAdminUsers").addEventListener("click", () => {
    loadAdminSummary().catch((e) => {
      const t = document.getElementById("adminStatus");
      ((t.hidden = !1),
        (t.textContent = `No se pudo actualizar: ${e.message}`));
    });
  }),
  document
    .getElementById("adminThemeForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("adminStatus");
      try {
        (await saveAdminTheme(),
          (t.hidden = !1),
          (t.textContent = "Personalizacion guardada."));
      } catch (e) {
        ((t.hidden = !1),
          (t.textContent = `No se pudo guardar la personalizacion: ${e.message}`));
      }
    }),
  document
    .getElementById("adminGamesForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("adminStatus");
      try {
        (await saveAdminGames(),
          (t.hidden = !1),
          (t.textContent = "Juegos guardados."));
      } catch (e) {
        ((t.hidden = !1),
          (t.textContent = `No se pudieron guardar los juegos: ${e.message}`));
      }
    }),
  document
    .getElementById("saveRealResults")
    .addEventListener("click", async () => {
      try {
        const e = await saveRealResults(),
          t = e?.mail,
          n = t?.error
            ? ` No se enviaron correos: ${t.error}.`
            : t
              ? ` Correos enviados: ${t.sent || 0}.`
              : "";
        alert(`Resultados reales guardados para este torneo.${n}`);
      } catch (e) {
        alert(`No se pudieron guardar los resultados: ${e.message}`);
      }
    }),
  document
    .getElementById("tournamentSelect")
    .addEventListener("change", (e) => {
      ((state.currentTournamentId = e.target.value),
        renderTournamentControls(),
        syncPhaseSelectorForTournament(),
        renderAll(),
        loadLeaderboard());
    }),
  document.getElementById("predictionPhase").addEventListener("change", (e) => {
    ((state.currentPhaseId = e.target.value), renderAll());
  }),
  document
    .getElementById("companyLoginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("companyLoginStatus"),
        n = document.getElementById("loginEmail").value.trim(),
        a = document.getElementById("loginPassword").value,
        o = document.getElementById("loginName");
      document.getElementById("loginArea");
      if (((t.hidden = !1), n && a)) {
        if (!o.closest("label").hidden) {
          const e = o.value.trim();
          if (!e || !"General")
            return void (t.textContent =
              "Para registrarte, completa también tu nombre y área.");
          t.textContent = "Registrando...";
          try {
            (await registrarCompanyUser({ name: e, email: n, password: a }),
              (document.getElementById("loginPassword").value = ""),
              (t.textContent = "Usuario registrado y conectado."));
          } catch (e) {
            t.textContent = e.message;
          }
          return;
        }
        t.textContent = "Ingresando...";
        try {
          (await loginCompanyUser({
            name: "",
            email: n,
            password: a,
            area: "",
          }),
            (document.getElementById("loginPassword").value = ""),
            (t.textContent = "Usuario listo. Ya podes guardar tu prode."));
        } catch (e) {
          t.textContent = e.message.includes("Name and area")
            ? "Ese email no existe todavia. Usa Registrar para darlo de alta."
            : `No se pudo ingresar: ${e.message}`;
        }
      } else t.textContent = "Completa email y contraseña.";
    }),
  document.querySelectorAll("[data-password-toggle]").forEach((e) => {
    e.addEventListener("click", () => {
      const t = document.getElementById(e.dataset.passwordToggle);
      if (!t) return;
      const n = "text" === t.type;
      ((t.type = n ? "password" : "text"),
        e.setAttribute(
          "aria-label",
          n ? "Mostrar contraseña" : "Ocultar contraseña",
        ),
        e.classList.toggle("is-visible", !n));
    });
  }),
  document
    .getElementById("openForgotPassword")
    ?.addEventListener("click", () => {
      const e = document.getElementById("forgotPasswordModal");
      ((document.getElementById("forgotPasswordEmail").value = document
        .getElementById("globalLoginEmail")
        .value.trim()),
        (document.getElementById("forgotPasswordStatus").hidden = !0),
        (e.hidden = !1));
    }),
  document
    .getElementById("closeForgotPassword")
    ?.addEventListener("click", () => {
      document.getElementById("forgotPasswordModal").hidden = !0;
    }),
  document
    .getElementById("forgotPasswordModal")
    ?.addEventListener("click", (e) => {
      "forgotPasswordModal" === e.target.id && (e.currentTarget.hidden = !0);
    }),
  document
    .getElementById("forgotPasswordForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("forgotPasswordStatus"),
        n = document.getElementById("forgotPasswordEmail").value.trim();
      if (((t.hidden = !1), n)) {
        t.textContent = "Enviando link...";
        try {
          const e = await requestPasswordReset(n);
          t.textContent = e.mail?.skipped
            ? "No se pudo enviar el correo porque el servidor no tiene SMTP configurado."
            : "Si el mail existe, te enviamos un link para cambiar la contraseña.";
        } catch (e) {
          t.textContent = `No se pudo enviar el link: ${e.message}`;
        }
      } else t.textContent = "Escribi tu mail.";
    }),
  document
    .getElementById("resetPasswordForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("resetPasswordStatus"),
        n = document.getElementById("resetPasswordNew").value,
        a = document.getElementById("resetPasswordConfirm").value;
      if (
        ((t.hidden = !1),
        n && !(n.length < 8) && /[a-z]/.test(n) && /[A-Z]/.test(n))
      )
        if (n === a) {
          t.textContent = "Guardando contraseña...";
          try {
            (await confirmPasswordReset({
              token: initialResetToken(),
              password: n,
            }),
              (t.textContent =
                "contraseña actualizada. Ya podes iniciar sesion."),
              (document.getElementById("resetPasswordNew").value = ""),
              (document.getElementById("resetPasswordConfirm").value = ""),
              setTimeout(() => {
                ((document.getElementById("resetPasswordModal").hidden = !0),
                  window.history.replaceState({}, "", "/prode"));
              }, 900));
          } catch (e) {
            t.textContent = e.message.includes("expired")
              ? "El link vencio. Pedi uno nuevo desde Olvide mi contraseña."
              : `No se pudo cambiar la contraseña: ${e.message}`;
          }
        } else t.textContent = "Las contraseñas no coinciden.";
      else
        t.textContent =
          "La contraseña debe tener al menos 8 caracteres, una mayuscula y una minuscula.";
    }),
  document
    .getElementById("globalLoginForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("globalLoginStatus"),
        n = document.getElementById("globalLoginEmail").value.trim(),
        a = document.getElementById("globalLoginPassword").value,
        o = document.getElementById("globalLoginName");
      if (((t.hidden = !1), n && a)) {
        if (!o.closest("label").hidden) {
          const e = o.value.trim();
          if (!e)
            return void (t.textContent =
              "Para registrarte, completa también tu nombre.");
          t.textContent = "Registrando...";
          try {
            (await registrarGlobalUser({ name: e, email: n, password: a }),
              (document.getElementById("globalLoginPassword").value = ""),
              (t.textContent = "Usuario registrado y conectado."));
          } catch (e) {
            t.textContent = e.message;
          }
          return;
        }
        t.textContent = "Ingresando al lobby...";
        try {
          (await loginGlobalUser({ name: "", email: n, password: a }),
            (document.getElementById("globalLoginPassword").value = ""),
            (t.textContent = "Sesion global lista."));
        } catch (e) {
          t.textContent = e.message.includes("Name is required")
            ? "Ese usuario no existe todavia. Usa Registrar para darlo de alta."
            : `No se pudo ingresar: ${e.message}`;
        }
      } else t.textContent = "Completa email/DNI y contraseña.";
    }),
  document
    .getElementById("globalRegistrarBtn")
    ?.addEventListener("click", (e) => {
      const t = document.getElementById("globalLoginNameLabel");
      if (t.hidden) {
        ((t.hidden = !1),
          (e.target.type = "submit"),
          e.target.classList.remove("secondary"));
        const n = document.getElementById("globalLoginBtn");
        ((n.type = "button"),
          n.classList.add("secondary"),
          (n.textContent = "Volver"));
      }
    }),
  document.getElementById("globalLoginBtn")?.addEventListener("click", (e) => {
    const t = document.getElementById("globalLoginNameLabel");
    if (!t.hidden && "button" === e.target.type) {
      ((t.hidden = !0),
        (e.target.type = "submit"),
        e.target.classList.remove("secondary"),
        (e.target.textContent = "Ingresar"));
      const n = document.getElementById("globalRegistrarBtn");
      ((n.type = "button"), n.classList.add("secondary"));
    }
  }),
  document
    .getElementById("companyRegistrarBtn")
    ?.addEventListener("click", (e) => {
      const t = document.getElementById("loginNameLabel"),
        n = document.getElementById("loginAreaLabel");
      if (t.hidden) {
        ((t.hidden = !1),
          n && (n.hidden = !1),
          (e.target.type = "submit"),
          e.target.classList.remove("secondary"));
        const a = document.getElementById("companyLoginBtn");
        a &&
          ((a.type = "button"),
          a.classList.add("secondary"),
          (a.textContent = "Volver"));
      }
    }),
  document.getElementById("companyLoginBtn")?.addEventListener("click", (e) => {
    const t = document.getElementById("loginNameLabel"),
      n = document.getElementById("loginAreaLabel");
    if (!t.hidden && "button" === e.target.type) {
      ((t.hidden = !0),
        n && (n.hidden = !0),
        (e.target.type = "submit"),
        e.target.classList.remove("secondary"),
        (e.target.textContent = "Ingresar"));
      const a = document.getElementById("companyRegistrarBtn");
      a &&
        ((a.type = "button"),
        a.classList.add("secondary"),
        (a.textContent = "Registrar"));
    }
  }),
  document
    .getElementById("closeUnlockTournament")
    ?.addEventListener("click", () => {
      document.getElementById("unlockTournamentModal").hidden = !0;
    }),
  document
    .getElementById("unlockTournamentModal")
    ?.addEventListener("click", (e) => {
      "unlockTournamentModal" === e.target.id && (e.currentTarget.hidden = !0);
    }),
  document
    .getElementById("unlockTournamentForm")
    ?.addEventListener("submit", async (e) => {
      (e.preventDefault(), await submitTournamentUnlock());
    }),
  document.getElementById("logoutGlobalUser")?.addEventListener("click", () => {
    (clearGlobalSession(),
      (state.dailyGamePlays = {}),
      renderGlobalLobby(),
      renderDailyGames(),
      loadGlobalLobby().catch(() => {}));
  }));
let __sessionMenuScope = null;
function openSessionMenu(e) {
  __sessionMenuScope = e || (state.companySession ? "company" : "global");
  const t = document.getElementById("sessionDropdown");
  if (t) {
    t.hidden = !1;
    const e =
      "company" === __sessionMenuScope
        ? state.companySession?.user
        : state.globalSession?.user;
    if (e) {
      const t = document.getElementById("dpUserName"),
        n = document.getElementById("dpUserEmail"),
        a = document.getElementById("dpUserArea"),
        o = document.getElementById("dpUserAreaContainer");
      (t && (t.textContent = e.name || "-"),
        n && (n.textContent = e.email || "-"),
        a && (a.textContent = e.area || "-"),
        o && (o.hidden = "company" !== __sessionMenuScope || !e.area));
    }
    const n = document.getElementById("dropdownGlobalBtn");
    n && (n.hidden = !state.tenantId);
  }
}
function closeSessionMenu() {
  const e = document.getElementById("sessionDropdown");
  if (e) {
    e.hidden = !0;
    const t = document.getElementById("dropdownInfoPanel");
    t && (t.hidden = !0);
  }
}
function injectLeaderboardTab() {
  const e = document.querySelector('.tab[data-view="predictor"]');
  if (e && !document.querySelector('.tab[data-view="main-leaderboard"]')) {
    const t = document.createElement("button");
    ((t.className = "tab"),
      (t.dataset.view = "main-leaderboard"),
      (t.textContent = "Tabla"),
      e.parentNode.insertBefore(t, e),
      t.addEventListener("click", () => {
        openView("main-leaderboard");
      }));
  }
  let t = document.getElementById("main-leaderboard");
  if (!t) {
    ((t = document.createElement("div")),
      (t.id = "main-leaderboard"),
      (t.className = "view container"),
      (t.innerHTML =
        '\n      <div class="panel" id="mainLeaderboardPanel"></div>\n    '));
    const e = document.getElementById("predictor");
    e && e.parentNode.insertBefore(t, e);
  }
}
async function init() {
  (initialResetToken() &&
    ((document.getElementById("resetPasswordModal").hidden = !1),
    openView("lobby")),
    injectLeaderboardTab());
  const e = initialTenantId();
  (e && ((state.tenantId = e), syncTenantNavigation()),
    renderAll(),
    await refreshGlobalSession(),
    await loadTenant(),
    state.tenantId && !state.tenantAccessGranted && openView("predictor"),
    await loadTemplates(),
    initialContinueToken() ? await loadContinuation() : await loadTournaments(),
    loadGlobalLobby().catch(() => {}),
    loadLiveResults(),
    setInterval(loadLiveResults, 18e5));
}
(document
  .getElementById("topbarAvatar")
  ?.addEventListener("click", () => openSessionMenu()),
  document
    .getElementById("companySessionAvatar")
    ?.addEventListener("click", () => openSessionMenu("company")),
  document
    .getElementById("globalSessionAvatar")
    ?.addEventListener("click", () => openSessionMenu("global")),
  document.getElementById("dropdownInfoBtn")?.addEventListener("click", () => {
    const e = document.getElementById("dropdownInfoPanel");
    e && (e.hidden = !e.hidden);
  }),
  document.getElementById("dropdownLobbyBtn")?.addEventListener("click", () => {
    (closeSessionMenu(),
      state.tenantId ? (window.location.href = "/prode") : openView("lobby"));
  }),
  document
    .getElementById("dropdownGlobalBtn")
    ?.addEventListener("click", () => {
      (closeSessionMenu(), (window.location.href = "/prode/global/"));
    }),
  document
    .getElementById("dropdownLogoutBtn")
    ?.addEventListener("click", () => {
      (closeSessionMenu(),
        "company" === __sessionMenuScope
          ? logoutCompanyUser()
          : (clearGlobalSession(),
            renderGlobalLobby(),
            renderDailyGames(),
            loadGlobalLobby().catch(() => {})));
    }),
  document.addEventListener("click", (e) => {
    const t = document.getElementById("sessionDropdown"),
      n = document.getElementById("topbarAvatar");
    t &&
      !t.hidden &&
      ((n && n.contains(e.target)) ||
        t.contains(e.target) ||
        closeSessionMenu());
  }),
  document
    .getElementById("openCreateLobbyTenant")
    ?.addEventListener("click", () => {
      const e = document.getElementById("createLobbyTenantModal"),
        t = document.getElementById("createLobbyTenantName"),
        n = document.getElementById("createLobbyTenantId"),
        a = document.getElementById("createLobbyTenantCode"),
        o = document.getElementById("createLobbyTenantStatus");
      (t && (t.value = ""),
        n && (n.value = ""),
        a && (a.value = ""),
        o && ((o.hidden = !0), (o.textContent = "")),
        (e.hidden = !1),
        setTimeout(() => t?.focus(), 0));
    }),
  document
    .getElementById("closeCreateLobbyTenant")
    ?.addEventListener("click", () => {
      document.getElementById("createLobbyTenantModal").hidden = !0;
    }),
  document
    .getElementById("createLobbyTenantModal")
    ?.addEventListener("click", (e) => {
      "createLobbyTenantModal" === e.target.id && (e.currentTarget.hidden = !0);
    }),
  document
    .getElementById("createLobbyTenantName")
    ?.addEventListener("input", (e) => {
      const t = document.getElementById("createLobbyTenantId"),
        n = document.getElementById("createLobbyTenantCode"),
        a = slugText(e.target.value);
      (t && !t.dataset.touched && (t.value = a),
        n &&
          !n.dataset.touched &&
          (n.value = a ? `EMPRESA-${a.toUpperCase()}` : ""));
    }),
  document
    .getElementById("createLobbyTenantId")
    ?.addEventListener("input", (e) => {
      e.currentTarget.dataset.touched = "1";
    }),
  document
    .getElementById("createLobbyTenantCode")
    ?.addEventListener("input", (e) => {
      e.currentTarget.dataset.touched = "1";
    }),
  document
    .getElementById("createLobbyTenantForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("createLobbyTenantStatus"),
        n = document.getElementById("createLobbyTenantName").value.trim(),
        a = document.getElementById("createLobbyTenantId").value.trim(),
        o = document.getElementById("createLobbyTenantTemplate").value,
        s = document.getElementById("createLobbyTenantCode").value.trim();
      if (((t.hidden = !1), n && a && s)) {
        t.textContent = "Creando torneo...";
        try {
          const e = await createLobbyTenant({
            name: n,
            id: a,
            templateId: o,
            code: s,
          });
          ((document.getElementById("createLobbyTenantModal").hidden = !0),
            (t.textContent = ""),
            await loadGlobalLobby());
          const r = document.getElementById("globalLoginStatus");
          if (r) {
            r.hidden = !1;
            const t = `${window.location.origin}/prode/empresa/${encodeURIComponent(e.tenant?.id || a)}`;
            r.innerHTML = `Torneo creado: ${escapeHtml(e.tournament?.name || n)}.<br>Link directo: <a href="${escapeHtml(t)}" target="_blank"><strong>${escapeHtml(t)}</strong></a>`;
          }
        } catch (e) {
          t.textContent = `No se pudo crear: ${e.message}`;
        }
      } else t.textContent = "Completa nombre, ID de URL y clave.";
    }),
  document
    .getElementById("logoutCompanyUser")
    ?.addEventListener("click", () => {
      logoutCompanyUser();
    }),
  document
    .getElementById("backToGlobalProde")
    ?.addEventListener("click", () => {
      window.location.href = "/prode/global/";
    }),
  document
    .getElementById("companyAreaForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("companyAreaName"),
        n = document.getElementById("companyAreaStatus");
      if (((n.hidden = !1), state.companySession || state.tenantAccessGranted))
        if (t.value.trim()) {
          n.textContent = "Creando minitorneo...";
          try {
            (await createCompanyArea(t.value.trim()),
              (state.leaderboardArea = t.value.trim()),
              (t.value = ""),
              (n.textContent = "Minitorneo creado."),
              await loadLeaderboard());
          } catch (e) {
            n.textContent = `No se pudo crear el minitorneo: ${e.message}`;
          }
        } else n.textContent = "Escribi el nombre del area.";
      else n.textContent = "Primero ingresa con un usuario habilitado.";
    }),
  document
    .getElementById("tournamentForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = document.getElementById("tournamentName"),
        n = document.getElementById("tournamentCode"),
        a = document.getElementById("creatorEmail"),
        o = document.getElementById("tournamentStatus"),
        s = t.value.trim(),
        r = n.value.trim(),
        i = a.value.trim();
      if (!s || !r || !i)
        return (
          (o.hidden = !1),
          void (o.textContent = "Completa nombre, clave y email del creador.")
        );
      ((o.hidden = !1), (o.textContent = "Creando torneo..."));
      try {
        const e = document.getElementById("templateSelect").value,
          d = customTemplateFromForm(e);
        if ("custom" === e && (!d || d.teams.length < 2))
          return void (o.textContent =
            "Para una plantilla custom carga al menos 2 equipos o jugadores.");
        const l = await createTournament({
            name: s,
            code: r,
            creatorEmail: i,
            templateId: e,
            mode: document.getElementById("modeSelect").value,
            scoring: scoringFromForm(),
            customTemplate: d,
          }),
          m = state.tenantId
            ? `${window.location.origin}/empresa/${encodeURIComponent(state.tenantId)}`
            : `${window.location.origin}${invitePathFor(l)}`;
        ((t.value = ""),
          (n.value = ""),
          (a.value = ""),
          (document.getElementById("customTeams").value = ""),
          (o.innerHTML = `\n      Torneo creado. Guarda esta clave: <strong>${l.code}</strong><br>\n      Link de invitacion: <strong>${m}</strong>\n    `));
      } catch (e) {
        o.textContent = `No se pudo crear el torneo: ${e.message}`;
      }
    }),
  document
    .getElementById("joinTournamentForm")
    .addEventListener("submit", (e) => {
      (e.preventDefault(),
        joinTournamentByCode(
          document.getElementById("joinTournamentCode").value,
          document.getElementById("joinTournamentName").value,
        ).catch((e) => {
          const t = document.getElementById("tournamentStatus");
          ((t.hidden = !1),
            (t.textContent = `No se pudo unir al torneo: ${e.message}`));
        }));
    }),
  document
    .getElementById("savePrediction")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const t = buildPayload();
      if (validatePayload(t) && (await ensurePaymentBeforeSubmit(t)))
        try {
          const e = await submitProde(t);
          (await loadTournaments(), await loadLeaderboard());
          showToast(
            `Prode guardado con éxito.${e.mail?.sent ? " Te enviamos el link por correo." : e.mail?.error ? " No se pudo enviar el correo." : ""}`,
          );
        } catch (e) {
          showToast(`No se pudo guardar el prode: ${e.message}`, !0);
        }
    }),
  document
    .getElementById("downloadPdf")
    ?.addEventListener("click", async (e) => {
      e.preventDefault();
      const t = buildPayload();
      if (validatePayload(t) && (await ensurePaymentBeforeSubmit(t))) {
        try {
          (await submitProde(t), await loadTournaments());
        } catch (e) {
          return void alert(`No se pudo guardar el prode: ${e.message}`);
        }
        downloadBlob(createPdfBlob(t), getFileName(t));
      }
    }),
  document.getElementById("sendEmail")?.addEventListener("click", async (e) => {
    e.preventDefault();
    const t = buildPayload();
    if (!validatePayload(t)) return;
    if (!(await ensurePaymentBeforeSubmit(t))) return;
    try {
      (await submitProde(t), await loadTournaments());
    } catch (e) {
      return void alert(`No se pudo guardar el prode: ${e.message}`);
    }
    const n = createPdfBlob(t),
      a = getFileName(t);
    blobToBase64(n)
      .then((e) =>
        fetch(apiUrl("/api/send-prode"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: t, pdfBase64: e, filename: a }),
        }),
      )
      .then((e) => {
        if (!e.ok) throw new Error("Email server unavailable");
        alert("PDF enviado por correo.");
      })
      .catch(() => {
        downloadBlob(n, a);
        const e = encodeURIComponent(`Prode Mundial 2026 - ${t.player.name}`),
          o = encodeURIComponent(
            "Adjunto el PDF generado por la web del Prode Mundial 2026.",
          );
        window.location.href = `mailto:${t.player.email}?subject=${e}&body=${o}`;
      });
  }),
  document.getElementById("btnGoToPredictor")?.addEventListener("click", () => {
    document.querySelector('.tab[data-view="predictor"]')?.click();
  }),
  document
    .getElementById("createMiniTournamentBtn")
    ?.addEventListener("click", () => {
      const e = document.getElementById("createMiniTournamentModal");
      if (
        e &&
        ((e.hidden = !1), !document.getElementById("miniTournamentCode"))
      ) {
        const e = document.getElementById("createMiniTournamentForm"),
          t = document.createElement("label");
        ((t.innerHTML =
          'Contraseña <input id="miniTournamentCode" type="text" required>'),
          e.insertBefore(t, e.querySelector("button[type='submit']")));
        const n = document.getElementById("miniTournamentPrivate");
        n && (n.closest("label").hidden = !0);
      }
      document.getElementById("miniTournamentName")?.focus();
    }),
  document
    .getElementById("closeMiniTournamentModal")
    ?.addEventListener("click", () => {
      const e = document.getElementById("createMiniTournamentModal");
      e && (e.hidden = !0);
    }),
  document
    .getElementById("createMiniTournamentForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = (
          document.getElementById("miniTournamentName")?.value || ""
        ).trim(),
        n = (
          document.getElementById("miniTournamentDescription")?.value || ""
        ).trim(),
        a = (document.getElementById("miniTournamentCode")?.value || "").trim();
      t && a
        ? (await createMiniTournament(t, n, a),
          (document.getElementById("miniTournamentName").value = ""),
          (document.getElementById("miniTournamentDescription").value = ""),
          document.getElementById("miniTournamentCode") &&
            (document.getElementById("miniTournamentCode").value = ""))
        : alert("Ingresa el nombre y la contraseña del minitorneo");
    }),
  document
    .querySelectorAll('.tab[data-view="minitournaments"]')
    .forEach((e) => {
      e.addEventListener("click", () => {
        loadMiniTournaments();
      });
    }),
  init());
// ==========================================
// LÓGICA DE MODAL DE PERFIL Y FOTO DE CUENTA
// ==========================================

function openProfileModal() {
  const modal = document.getElementById("profileModal");
  if (!modal) return;
  // Busca el usuario en la sesión global o en la de empresa
  const user = state.companySession?.user || state.globalSession?.user;
  if (!user || !user.name) {
    alert("Inicia sesión para ver tu perfil");
    return;
  }
  // Carga los datos en los inputs del cartel
  document.getElementById("profileNameInput").value = user.name;
  document.getElementById("profileEmailInput").value = user.email || "No registrado";
  // Busca si el usuario ya se subió una foto en esta PC/Celular
  const savedAvatar = localStorage.getItem(`avatar_${user.name}`);
  if (savedAvatar) {
    document.getElementById("profileAvatarPreview").src = savedAvatar;
  } else {
    document.getElementById("profileAvatarPreview").src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
  }
  // Oculta el menú desplegable viejo para que no moleste
  const dropdownPanel = document.getElementById("dropdownInfoPanel");
  if (dropdownPanel) dropdownPanel.hidden = true;
  document.getElementById("sessionDropdown").hidden = true;
  modal.hidden = false;
}
// 1. Escuchador del botón "Información" del menú desplegable
document.getElementById("dropdownInfoBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  openProfileModal();
});
// 2. Escuchador para subir y guardar la foto
document.getElementById("profileAvatarInput")?.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Por favor, selecciona un archivo de imagen válido.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(event) {
    const base64Image = event.target.result;
    document.getElementById("profileAvatarPreview").src = base64Image;
    const user = state.companySession?.user || state.globalSession?.user;
    if (user && user.name) {
      // Guarda la foto en la memoria del navegador
      localStorage.setItem(`avatar_${user.name}`, base64Image);
      // Actualiza la imagen en la barra superior (TopBar chiquito)
      const topAvatar = document.querySelector("#topbarAvatar img");
      if (topAvatar) topAvatar.src = base64Image;
    }
  };
  reader.readAsDataURL(file);
});
// 3. Cerrar el modal principal
document.getElementById("closeProfileModal")?.addEventListener("click", () => {
  document.getElementById("profileModal").hidden = true;
});
// --- LÓGICA DEL CAMBIO DE CONTRASEÑA ---
// 1. Abrir el modal desde el perfil
document.getElementById("btnChangePasswordAction")?.addEventListener("click", () => {
  // Ocultamos el perfil
  document.getElementById("profileModal").hidden = true;
  // Limpiamos los campos por si el usuario había escrito algo antes
  document.getElementById("currentPasswordInput").value = "";
  document.getElementById("newPasswordInput").value = "";
  document.getElementById("confirmPasswordInput").value = "";
  // Mostramos el nuevo modal
  document.getElementById("changePasswordModal").hidden = false;
});
// 2. Cerrar el modal (y volver al perfil)
document.getElementById("closeChangePasswordModal")?.addEventListener("click", () => {
  document.getElementById("changePasswordModal").hidden = true;
  document.getElementById("profileModal").hidden = false; 
});
// 3. Procesar el formulario al hacer clic en "Actualizar"
document.getElementById("changePasswordForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  // ¡ACÁ ESTABA EL PROBLEMA! Ahora usamos los IDs correctos del nuevo modal
  const currentPassword = document.getElementById("currentPasswordInput").value;
  const newPassword = document.getElementById("newPasswordInput").value;
  const confirmPassword = document.getElementById("confirmPasswordInput").value;
  
  // Verificamos que las contraseñas nuevas coincidan
  if (newPassword !== confirmPassword) {
    alert("Las contraseñas nuevas no coinciden. Por favor, verifícalas.");
    return;
  }
  // Identificamos al usuario logueado
  const user = state.companySession?.user || state.globalSession?.user;
  const sessionToken = state.companySession?.token || state.globalSession?.token || localStorage.getItem("prode_token") || "";
  if (!user || !user.name) {
    alert("Error: No se pudo identificar tu sesión.");
    return;
  }
  try {
    const response = await fetch("/api/change-password", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionToken}`,
        "X-Session-Token": sessionToken,
        "x-access-token": sessionToken
      },
      body: JSON.stringify({
        name: user.name,
        currentPassword: currentPassword, // Ahora sí viaja la contraseña actual
        newPassword: newPassword,         // Y la nueva
        token: sessionToken 
      })
    });
    const result = await response.json();
    if (response.ok) {
      alert("¡Contraseña actualizada con éxito!");
      // Limpiamos los campos
      document.getElementById("currentPasswordInput").value = "";
      document.getElementById("newPasswordInput").value = "";
      document.getElementById("confirmPasswordInput").value = "";
      
      // Ocultamos el panel
      const profileModal = document.getElementById("profileModal");
      if (profileModal) profileModal.hidden = true;
    } else {
      alert(result.error || "Error al cambiar la contraseña.");
    }
  } catch (error) {
    alert("Error de conexión con el servidor.");
  }
});
// 5. Cargar la foto en la barra superior (TopBar) al iniciar o cambiar de cuenta
document.getElementById("topbarAvatar")?.addEventListener("click", () => {
  const user = state.companySession?.user || state.globalSession?.user;
  if (user && user.name) {
    const savedAvatar = localStorage.getItem(`avatar_${user.name}`);
    if (savedAvatar) {
      const topAvatar = document.querySelector("#topbarAvatar img");
      if (topAvatar) topAvatar.src = savedAvatar;
    }
  }
});
