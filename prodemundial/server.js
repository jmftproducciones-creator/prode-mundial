const http = require("http");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const net = require("net");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const LIVE_RESULTS_FILE = path.join(ROOT, "data", "live-results.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
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

function serveStatic(req, res) {
  const requested = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
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
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`Prode Mundial listo en http://localhost:${PORT}`);
});
