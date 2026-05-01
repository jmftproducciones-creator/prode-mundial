let CLAUSURA_TEAMS = [];
let CLAUSURA_FIXTURES = {};
let CLAUSURA_BADGES = {};
let CLAUSURA_TOURNAMENTS = [];
let CLAUSURA_ACTIVE_ROUND = 17;

const OPEN_MATCH_STATUSES = new Set(["NS", "TBD", "PST"]);

const stateClausura = {
    scores: {}
};

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

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function isMatchLocked(match) {
    const roundNumber = getMatchRoundNumber(match);
    if (roundNumber < CLAUSURA_ACTIVE_ROUND) return true;
    if (roundNumber >= CLAUSURA_ACTIVE_ROUND) return false;

    const status = String(match.status || "").toUpperCase();
    if (status && !OPEN_MATCH_STATUSES.has(status)) return true;

    if (!match.date) return false;
    const kickoff = new Date(match.date);
    if (Number.isNaN(kickoff.getTime())) return false;

    return kickoff <= new Date();
}

function getMatchRoundNumber(match) {
    const explicitRound = Number(match.roundNumber);
    if (Number.isFinite(explicitRound) && explicitRound > 0) return explicitRound;

    const idRound = String(match.id || "").match(/^c_f(\d+)_/);
    if (idRound) return Number(idRound[1]);

    return null;
}

function getSortedDateKeys() {
    return Object.keys(CLAUSURA_FIXTURES)
        .sort((a, b) => parseInt(a.replace("fecha", ""), 10) - parseInt(b.replace("fecha", ""), 10));
}

function getFirstPlayableDateKey() {
    return getSortedDateKeys()
        .find((fechaKey) => (CLAUSURA_FIXTURES[fechaKey] || []).some(match => !isMatchLocked(match)));
}

function getEscudoHtml(team) {
    const url = CLAUSURA_BADGES[team];
    if (!url) return "";

    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(team)}" class="clausura-badge">`;
}

function formatMatchDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function hasActualResult(match) {
    return match.goals
        && match.goals.home !== null
        && match.goals.home !== undefined
        && match.goals.away !== null
        && match.goals.away !== undefined;
}

async function initClausura() {
    const container = document.getElementById("clausuraGrid");
    const select = document.getElementById("clausuraFechaSelect");

    container.innerHTML = "<p style='padding: 20px; font-weight: bold;'>Cargando fixture y escudos oficiales desde API-Football...</p>";

    try {
        const [fixtureData] = await Promise.all([
            apiJson("/api/clausura-fixture"),
            loadTournaments()
        ]);

        CLAUSURA_TEAMS = fixtureData.teams;
        CLAUSURA_FIXTURES = fixtureData.fixtures;
        CLAUSURA_BADGES = fixtureData.badges;
        CLAUSURA_ACTIVE_ROUND = Number(fixtureData.activeRound || CLAUSURA_ACTIVE_ROUND);

        const sortedDates = getSortedDateKeys();

        select.innerHTML = sortedDates
            .map((fechaKey) => {
                const num = fechaKey.replace("fecha", "");
                const matches = CLAUSURA_FIXTURES[fechaKey] || [];
                const isClosedDate = matches.length > 0 && matches.every(isMatchLocked);
                const label = isClosedDate ? `Fecha ${num} - cerrada` : `Fecha ${num}`;
                return `<option value="${escapeHtml(fechaKey)}">${escapeHtml(label)}</option>`;
            }).join("");

        select.addEventListener("change", (e) => renderClausuraDate(e.target.value));

        const firstPlayableDate = getFirstPlayableDateKey();
        if (firstPlayableDate) select.value = firstPlayableDate;

        if (sortedDates.length > 0) {
            renderClausuraDate(select.value);
        } else {
            container.innerHTML = "<div class='lock-banner'>No hay partidos disponibles todavia.</div>";
        }
    } catch (err) {
        container.innerHTML = `<div class="lock-banner">Error: ${escapeHtml(err.message)}</div>`;
    }
}

async function loadTournaments() {
    const select = document.getElementById("tournamentSelect");
    if (!select) return;

    const data = await apiJson("/api/tournaments");
    CLAUSURA_TOURNAMENTS = data.tournaments || [];
    select.innerHTML = CLAUSURA_TOURNAMENTS
        .map(tournament => `<option value="${escapeHtml(tournament.id)}">${escapeHtml(tournament.name)}</option>`)
        .join("");
}

function getCurrentTournamentId() {
    return document.getElementById("tournamentSelect")?.value || "global";
}

function getPlayer() {
    return {
        name: document.getElementById("playerName")?.value.trim() || "",
        email: document.getElementById("playerEmail")?.value.trim() || ""
    };
}

function buildClausuraPayload() {
    const selectedDate = document.getElementById("clausuraFechaSelect")?.value || "";
    return {
        player: getPlayer(),
        tournament: {
            competition: "clausura2026",
            selectedDate,
            scores: stateClausura.scores,
            savedAt: new Date().toISOString()
        }
    };
}

function validateClausuraPayload(payload) {
    if (!payload.player.name || !payload.player.email) {
        alert("Completá jugador y email antes de guardar.");
        return false;
    }

    const playableMatches = (CLAUSURA_FIXTURES[payload.tournament.selectedDate] || [])
        .filter(match => !isMatchLocked(match));
    const missing = playableMatches.some(match => {
        const score = payload.tournament.scores[match.id];
        return !score || score.home === "" || score.away === "";
    });

    if (missing) {
        alert("Completá los resultados de los partidos abiertos antes de guardar.");
        return false;
    }

    return true;
}

async function saveClausuraPrediction() {
    const payload = buildClausuraPayload();
    if (!validateClausuraPayload(payload)) return;

    await apiJson("/api/submit-prode", {
        method: "POST",
        body: JSON.stringify({
            tournamentId: getCurrentTournamentId(),
            payload
        })
    });

    alert("Prode Clausura guardado.");
}

async function loadPlayerPrediction() {
    const player = getPlayer();
    if (!player.email) return;

    const params = new URLSearchParams({
        tournamentId: getCurrentTournamentId(),
        email: player.email,
        competition: "clausura2026"
    });

    try {
        const data = await apiJson(`/api/submission?${params.toString()}`);
        stateClausura.scores = data.submission?.prediction?.scores || {};
        const select = document.getElementById("clausuraFechaSelect");
        if (select?.value) renderClausuraDate(select.value);
    } catch (error) {
        if (error.message !== "Submission not found") {
            console.warn(error);
        }
    }
}

function renderClausuraDate(fechaKey) {
    const container = document.getElementById("clausuraGrid");
    container.innerHTML = "";

    const matches = CLAUSURA_FIXTURES[fechaKey] || [];

    matches.forEach(match => {
        const locked = isMatchLocked(match);
        const title = `${match.home} vs ${match.away}`;
        const matchDate = formatMatchDate(match.date);
        const actualResult = hasActualResult(match)
            ? `${match.goals.home} - ${match.goals.away}`
            : "Pendiente";

        if (!stateClausura.scores[match.id]) {
            stateClausura.scores[match.id] = { home: "", away: "" };
        }

        const score = stateClausura.scores[match.id] || { home: "", away: "" };

        const card = document.createElement("article");
        card.className = `group-card clausura-match-card${locked ? " is-locked" : ""}`;
        card.innerHTML = `
      <div class="group-title clausura-match-title">
        <span>${escapeHtml(title)}</span>
        ${matchDate ? `<small>${escapeHtml(matchDate)}</small>` : ""}
      </div>
      <div class="group-matches clausura-match-body">
        <div class="group-match clausura-score-row">
          <span class="clausura-team clausura-team-home">
            ${escapeHtml(match.home)} ${getEscudoHtml(match.home)}
          </span>
          <input type="number" min="0" max="20" value="${escapeHtml(score.home)}" data-match-id="${escapeHtml(match.id)}" data-side="home" ${locked ? "disabled" : ""}>
          <b>-</b>
          <input type="number" min="0" max="20" value="${escapeHtml(score.away)}" data-match-id="${escapeHtml(match.id)}" data-side="away" ${locked ? "disabled" : ""}>
          <span class="clausura-team clausura-team-away">
            ${getEscudoHtml(match.away)} ${escapeHtml(match.away)}
          </span>
        </div>
        ${locked ? `
          <div class="clausura-actual-result">
            <span>Resultado real</span>
            <strong>${escapeHtml(actualResult)}</strong>
          </div>
        ` : ""}
      </div>
    `;

        const inputs = card.querySelectorAll("input");
        inputs.forEach(input => {
            input.addEventListener("input", (e) => {
                stateClausura.scores[e.target.dataset.matchId][e.target.dataset.side] = e.target.value;
            });
        });

        container.appendChild(card);
    });
}

initClausura();

document.getElementById("savePrediction")?.addEventListener("click", async event => {
    event.preventDefault();
    try {
        await saveClausuraPrediction();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("playerEmail")?.addEventListener("change", loadPlayerPrediction);
document.getElementById("tournamentSelect")?.addEventListener("change", loadPlayerPrediction);
