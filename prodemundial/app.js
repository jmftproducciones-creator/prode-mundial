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

const LATER_ROUNDS = {
  r16: [
    ["m89", "G73", "G74"], ["m90", "G75", "G76"], ["m91", "G77", "G78"], ["m92", "G79", "G80"],
    ["m93", "G81", "G82"], ["m94", "G83", "G84"], ["m95", "G85", "G86"], ["m96", "G87", "G88"]
  ],
  qf: [["m97", "G89", "G90"], ["m98", "G91", "G92"], ["m99", "G93", "G94"], ["m100", "G95", "G96"]],
  sf: [["m101", "G97", "G98"], ["m102", "G99", "G100"]],
  final: [["m104", "G101", "G102"]]
};

const state = {
  prediction: createEmptyTournament(),
  real: createEmptyTournament(),
  live: { updatedAt: "", source: "", matches: [] },
  tournaments: [],
  currentTournamentId: "global"
};

function createEmptyTournament() {
  return {
    groups: Object.fromEntries(Object.keys(WORLD_CUP_GROUPS).map(group => [group, ["", "", "", ""]])),
    groupMatches: {},
    thirdAssignments: {},
    winners: {},
    scores: {}
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

function teamBadge(team) {
  if (!team) return "";
  const url = flagUrl(team);
  const flag = url ? `<img class="flag" src="${url}" alt="">` : `<span class="flag-placeholder"></span>`;
  return `<span class="team-badge">${flag}<span>${team}</span></span>`;
}

function groupMatchId(group, firstIndex, secondIndex) {
  return `${group}-${firstIndex}-${secondIndex}`;
}

function groupFixtures(group) {
  return [
    [0, 1],
    [2, 3],
    [0, 2],
    [1, 3],
    [0, 3],
    [1, 2]
  ].map(([firstIndex, secondIndex]) => ({
    id: groupMatchId(group, firstIndex, secondIndex),
    home: WORLD_CUP_GROUPS[group][firstIndex],
    away: WORLD_CUP_GROUPS[group][secondIndex]
  }));
}

function getGroupMatch(model, id) {
  if (!model.groupMatches) model.groupMatches = {};
  if (!model.groupMatches[id]) model.groupMatches[id] = { home: "", away: "" };
  return model.groupMatches[id];
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
    const score = getGroupMatch(model, match.id);
    if (score.home === "" || score.away === "") return;
    const home = Number(score.home);
    const away = Number(score.away);
    table[match.home].gf += home;
    table[match.home].ga += away;
    table[match.away].gf += away;
    table[match.away].ga += home;
    if (home > away) table[match.home].pts += 3;
    else if (away > home) table[match.away].pts += 3;
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

function isEntryClosed() {
  return Date.now() > new Date(APP_CONFIG.entryDeadline).getTime();
}

function formatDeadline() {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date(APP_CONFIG.entryDeadline));
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

function scoreLabel(score) {
  if (!score || score.left === "" || score.right === "") return "";
  return `${score.left}-${score.right}`;
}

function setWinnerFromScore(model, id, left, right) {
  const score = model.scores[id];
  if (!score || score.left === "" || score.right === "" || Number(score.left) === Number(score.right)) return;
  model.winners[id] = Number(score.left) > Number(score.right) ? left : right;
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
      <p>Elegi que tercero entra en cada llave. Pueden clasificar hasta 8 de los 12 terceros.</p>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "thirds-grid";
  matches.forEach(id => {
    if (!model.thirdAssignments) model.thirdAssignments = {};
    const [, leftSlot] = R32_MATCHES.find(([matchId]) => matchId === id);
    const left = resolveSlot(leftSlot, model, id);
    const current = model.thirdAssignments[id] || "";
    const row = document.createElement("label");
    row.className = "third-select";
    row.innerHTML = `<span>${id.toUpperCase()} vs ${teamLabel(left) || leftSlot}</span>`;
    const select = document.createElement("select");
    select.innerHTML = `<option value="">Elegir tercero</option>${thirds.map(item => {
      const disabled = usedTeams.includes(item.team) && item.team !== current ? "disabled" : "";
      return `<option value="${item.team}" ${disabled}>${item.team} (3${item.group})</option>`;
    }).join("")}`;
    select.value = current;
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

function renderGroups(containerId, model, prefix) {
  const container = document.getElementById(containerId);
  const template = document.getElementById("groupTemplate");
  container.innerHTML = "";

  groupKeys().forEach(group => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".group-title").innerHTML = `
      <strong>Grupo ${group}</strong>
      <span>${WORLD_CUP_GROUPS[group].map(teamBadge).join("")}</span>
    `;
    const selectors = node.querySelector(".selectors");

    [0, 1, 2, 3].forEach(index => {
      const row = document.createElement("div");
      row.className = "selector-row";
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

    const matches = document.createElement("div");
    matches.className = "group-matches";
    matches.innerHTML = `
      <div class="group-matches-head">
        <span>Resultados de grupo</span>
        <button class="mini-button" type="button">Ordenar por tabla</button>
      </div>
    `;
    matches.querySelector("button").addEventListener("click", () => {
      applyGroupStandings(model, group);
      renderAll();
    });
    groupFixtures(group).forEach(match => {
      const score = getGroupMatch(model, match.id);
      const line = document.createElement("div");
      line.className = "group-match";
      line.innerHTML = `
        <span>${teamBadge(match.home)}</span>
        <input type="number" min="0" max="20" value="${score.home}" placeholder="0">
        <b>-</b>
        <input type="number" min="0" max="20" value="${score.away}" placeholder="0">
        <span>${teamBadge(match.away)}</span>
      `;
      const inputs = line.querySelectorAll("input");
      inputs[0].addEventListener("input", event => {
        getGroupMatch(model, match.id).home = event.target.value;
      });
      inputs[1].addEventListener("input", event => {
        getGroupMatch(model, match.id).away = event.target.value;
      });
      matches.appendChild(line);
    });
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
  return qualified[slot] || "";
}

function renderBracket(containerId, model, prefix) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const rounds = [
    ["Dieciseisavos", R32_MATCHES],
    ["Octavos", LATER_ROUNDS.r16],
    ["Cuartos", LATER_ROUNDS.qf],
    ["Semifinal y final", [...LATER_ROUNDS.sf, ...LATER_ROUNDS.final]]
  ];

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

function pruneDependentWinners(model, changedMatch) {
  Object.keys(model.winners).forEach(matchId => {
    if (Number(matchId.slice(1)) > changedMatch) {
      model.winners[matchId] = "";
      if (model.scores[matchId]) {
        model.scores[matchId] = { left: "", right: "" };
      }
    }
  });
}

function fillModel(model) {
  groupKeys().forEach(group => {
    model.groups[group] = [...WORLD_CUP_GROUPS[group]];
  });
  model.thirdAssignments = {};
  thirdMatchIds().forEach((id, index) => {
    model.thirdAssignments[id] = thirdPlaceTeams(model)[index]?.team || "";
  });
  renderAll();
  setTimeout(() => {
    [...R32_MATCHES, ...LATER_ROUNDS.r16, ...LATER_ROUNDS.qf, ...LATER_ROUNDS.sf, ...LATER_ROUNDS.final].forEach(([id, leftSlot]) => {
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
  renderAll();
}

function renderAll() {
  renderGroups("groupsGrid", state.prediction, "prediction");
  renderGroups("realGroupsGrid", state.real, "real");
  renderThirdAssignments("thirdsPanel", state.prediction);
  renderThirdAssignments("realThirdsPanel", state.real);
  renderBracket("bracket", state.prediction, "prediction");
  renderBracket("realBracket", state.real, "real");
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
    tournament: state.prediction
  };
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Error de servidor");
  return data;
}

function renderTournamentControls() {
  const select = document.getElementById("tournamentSelect");
  select.innerHTML = state.tournaments
    .map(tournament => `<option value="${tournament.id}">${tournament.name}${tournament.isGlobal ? "" : ` (${tournament.code})`}</option>`)
    .join("");
  select.value = state.currentTournamentId;

  const list = document.getElementById("tournamentList");
  list.innerHTML = state.tournaments.map(tournament => `
    <article class="tournament-card">
      <div>
        <h3>${tournament.name}</h3>
        <p>${tournament.isGlobal ? "Ranking global" : `Codigo privado: ${tournament.code}`}</p>
      </div>
      <strong>${tournament.players} jugadores</strong>
    </article>
  `).join("");
}

async function loadTournaments() {
  try {
    const data = await apiJson("/api/tournaments");
    state.tournaments = data.tournaments || [];
    if (!state.tournaments.some(tournament => tournament.id === state.currentTournamentId)) {
      state.currentTournamentId = state.tournaments[0]?.id || "global";
    }
    renderTournamentControls();
    await loadLeaderboard();
  } catch (error) {
    state.tournaments = [{ id: "global", name: "Global", code: "GLOBAL", isGlobal: true, players: 0 }];
    renderTournamentControls();
  }
}

async function createTournament(name) {
  const data = await apiJson("/api/tournaments", {
    method: "POST",
    body: JSON.stringify({ name })
  });
  state.currentTournamentId = data.tournament.id;
  await loadTournaments();
}

async function submitProde(payload) {
  return apiJson("/api/submit-prode", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      payload
    })
  });
}

async function saveRealResults() {
  await apiJson("/api/real-results", {
    method: "POST",
    body: JSON.stringify({
      tournamentId: state.currentTournamentId,
      realResults: state.real
    })
  });
  await loadLeaderboard();
}

async function loadLeaderboard() {
  const panel = document.getElementById("leaderboardPanel");
  if (!panel) return;
  const tournament = currentTournament();
  panel.innerHTML = `<p class="empty">Cargando tabla de ${tournament?.name || "torneo"}...</p>`;
  try {
    const data = await apiJson(`/api/leaderboard?tournamentId=${encodeURIComponent(state.currentTournamentId)}`);
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
            <span>${row.player.name}<small>${row.player.email}</small></span>
            <strong>${row.score.points} pts</strong>
            <em>G:${row.score.groupHits} C:${row.score.winnerHits} R:${row.score.exactScoreHits}</em>
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
    const response = await fetch(`${APP_CONFIG.liveResultsUrl}?t=${Date.now()}`);
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
  const lines = [
    "Prode Mundial 2026",
    `Jugador: ${payload.player.name}`,
    `Email: ${payload.player.email}`,
    `Campeon: ${payload.tournament.winners.m104}`,
    "",
    ...groupKeys().map(group => `Grupo ${group}: ${payload.tournament.groups[group].join(" | ")}`),
    "",
    "Cruces:",
    ...Object.entries(payload.tournament.winners).map(([match, winner]) => {
      const score = scoreLabel(payload.tournament.scores?.[match]);
      return `${match.toUpperCase()}: ${winner}${score ? ` (${score})` : ""}`;
    })
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
  return `prode-mundial-2026-${safeName || "jugador"}.pdf`;
}

function scoreTournament(prediction, real) {
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

  const matchIds = [...R32_MATCHES, ...LATER_ROUNDS.r16, ...LATER_ROUNDS.qf, ...LATER_ROUNDS.sf, ...LATER_ROUNDS.final].map(item => item[0]);
  let winnerHits = 0;
  let winnerTotal = 0;
  let exactScoreHits = 0;
  let exactScoreTotal = 0;
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
    document.querySelectorAll(".tab").forEach(item => item.classList.remove("is-active"));
    document.querySelectorAll(".view").forEach(item => item.classList.remove("is-visible"));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.view).classList.add("is-visible");
    if (tab.dataset.view === "live") loadLiveResults();
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
document.getElementById("saveRealResults").addEventListener("click", async () => {
  try {
    await saveRealResults();
    alert("Resultados reales guardados para este torneo.");
  } catch (error) {
    alert(`No se pudieron guardar los resultados: ${error.message}`);
  }
});
document.getElementById("tournamentSelect").addEventListener("change", event => {
  state.currentTournamentId = event.target.value;
  renderTournamentControls();
  loadLeaderboard();
});
document.getElementById("tournamentForm").addEventListener("submit", async event => {
  event.preventDefault();
  const input = document.getElementById("tournamentName");
  const name = input.value.trim();
  if (!name) return;
  try {
    await createTournament(name);
    input.value = "";
    alert("Torneo creado. Ya podes cargar prodes dentro de ese torneo.");
  } catch (error) {
    alert(`No se pudo crear el torneo: ${error.message}`);
  }
});

document.getElementById("savePrediction").addEventListener("click", async event => {
  event.preventDefault();
  const payload = buildPayload();
  if (!validatePayload(payload)) return;
  try {
    await submitProde(payload);
    await loadTournaments();
    await loadLeaderboard();
    alert("Prode guardado en el leaderboard del torneo.");
  } catch (error) {
    alert(`No se pudo guardar el prode: ${error.message}`);
  }
});

document.getElementById("downloadPdf").addEventListener("click", async event => {
  event.preventDefault();
  const payload = buildPayload();
  if (!validatePayload(payload)) return;
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
    .then(pdfBase64 => fetch("/api/send-prode", {
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

renderAll();
loadTournaments();
loadLiveResults();
setInterval(loadLiveResults, 30 * 60 * 1000);
