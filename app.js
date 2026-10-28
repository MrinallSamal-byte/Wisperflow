(() => {
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = n => Math.round(n).toLocaleString("en-IN");
const inr = n => "₹" + num(n);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const uid = () => Math.random().toString(36).slice(2, 9);
const wordCount = t => (String(t || "").match(/\S+/g) || []).length;
const dayKey = iso => { const d = new Date(iso); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const fmtDate = (iso, opts = { day: "numeric", month: "short" }) => iso ? new Date(iso).toLocaleDateString("en-IN", opts) : "";
const fmtTime = iso => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const params = new URLSearchParams(location.search);
const EDIT = params.has("edit");
const STORE = "creator-sprint-portfolio:v1";

/* ---------- scoring model (all of this is my judgement, not Wispr data) ---------- */

const NICHES = {
  "Productivity / workflow": { need: 95,
    en: "You already show people how to remove friction from their day, and typing is the friction most of them have never questioned.",
    hi: "Aap already dikhate hain ki din ka friction kaise kam karein, aur typing wo friction hai jise zyada log question hi nahi karte." },
  "Coding / dev": { need: 90,
    en: "Developers spend a surprising share of the day writing things that aren't code: PR descriptions, Slack threads, docs, and prompts to AI tools.",
    hi: "Developers ka kaafi time code ke alawa likhne mein jaata hai: PR descriptions, Slack, docs aur AI tools ke prompts." },
  "Writing / journalism / newsletters": { need: 90,
    en: "Getting a first draft out at speaking speed and then editing it is a different way to write, and writers tend to notice the difference quickly.",
    hi: "Bolkar first draft nikalna aur phir edit karna likhne ka alag tareeka hai, aur writers ko ye jaldi samajh aata hai." },
  "Startups / founders": { need: 82,
    en: "Founders live in email, Slack and investor updates, which is a lot of typing that doesn't need to be typed.",
    hi: "Founders ka din email, Slack aur investor updates mein jaata hai, aur is typing ka bada hissa bolkar ho sakta hai." },
  "Students / exam prep (UPSC, CAT, JEE…)": { need: 80,
    en: "Notes, answer-writing practice and long messages all go faster when you can talk them out first.",
    hi: "Notes, answer-writing practice aur lambe messages bolkar kaafi tez ho jaate hain." },
  "Law / CA / professional services": { need: 78,
    en: "Long drafts and client emails are exactly where speaking beats typing.",
    hi: "Lambe drafts aur client emails wahi jagah hain jahan bolna typing se tez hai." },
  "Tech reviews / gadgets": { need: 72,
    en: "It's a tool your audience can try in thirty seconds, so a before-and-after is easy to film.",
    hi: "Ye aisa tool hai jise aapki audience 30 second mein try kar sakti hai, to before-and-after film karna aasaan hai." },
  "Education (vernacular)": { need: 68,
    en: "Typing in Indian languages is slow on most keyboards, and speaking isn't.",
    hi: "Indian languages mein typing zyadatar keyboards par slow hai, bolna nahi." },
  "Personal finance / investing": { need: 50,
    en: "Scripts, newsletters and research notes are a lot of writing for someone who also has to record.",
    hi: "Scripts, newsletters aur research notes mein kaafi likhna padta hai, jabki record bhi karna hota hai." },
  "Lifestyle / vlog": { need: 30,
    en: "Honestly the fit is thinner for your niche, so I'd keep any collaboration small and specific.",
    hi: "Sach kahun to aapki niche mein fit thoda kam hai, isliye collaboration chhota aur specific rakhna chahiye." },
  "Gaming / entertainment": { need: 22,
    en: "Honestly the fit is thin for your niche, so this would only make sense as a very specific idea.",
    hi: "Sach kahun to aapki niche mein fit kam hai, to ye sirf ek bahut specific idea ke roop mein bante." }
};
// Hinglish scores highest on purpose: mixed-language typing is where dictation saves the most effort.
const LANGS = { "English": 70, "Hinglish": 88, "Hindi": 78, "Tamil / Telugu / Kannada / Malayalam": 72, "Bengali / Marathi / other": 70 };
const CONTENT = { "Tutorials / workflows": 92, "Tool reviews": 85, "Talking-head commentary": 60, "Vlog / lifestyle": 40, "Entertainment / skits": 25 };
const PLATFORMS = { "Instagram": 0.25, "YouTube": 0.12, "X": 0.04, "LinkedIn": 0.06 };
const RISK = [["No competing tool seen", 0], ["Mentions competing tools sometimes", -6], ["Paid partner of a competing tool", -20]];
const STATUS = [["identified", "Identified"], ["pitched", "Pitched"], ["replied", "Replied"], ["talking", "In conversation"], ["won", "Agreed"], ["passed", "Passed or no reply"]];
const KINDS = [["decision", "Decision"], ["mistake", "Mistake"], ["pivot", "Pivot"], ["learning", "Learning"]];
const PARTS = [["audience", "Audience fit"], ["content", "Content fit"], ["engagement", "Engagement"], ["language", "Language"], ["cost", "Cost"]];
const ASKS = {
  chat: { en: "Would you be open to a 10-minute chat this week?", hi: "Kya is hafte 10 minute ki quick baat ho sakti hai?" },
  demo: { en: "Can I send you a 60-second demo tailored to your audience?", hi: "Kya main aapki audience ke liye 60 second ka demo bhej doon?" },
  rate: { en: "Do you have a media kit or rate card I could look at?", hi: "Kya aapka media kit ya rate card mil sakta hai?" },
  try: { en: "Would you try it for a week and tell me honestly what you think, including if it isn't for you?", hi: "Kya aap ek hafta try karke honestly bata sakte hain? Pasand na aaye to wo bhi." }
};

let model = {
  weights: { audience: 30, content: 20, engagement: 20, language: 10, cost: 20 },
  assume: { targetCpm: 250, ctr: 0.8, signup: 30, paid: 6 }
};

const scale = (x, b) => (x <= b ? 60 * x / b : Math.min(100, 60 + 40 * (x - b) / b));

function scoreCreator(c) {
  const followers = +c.followers || 0, views = +c.avgViews || 0, comments = +c.comments || 0, price = +c.price || 0;
  const bench = PLATFORMS[c.platform] ?? 0.1;
  const rate = followers > 0 ? views / followers : 0;
  const commentRate = views > 0 ? comments / views : 0;
  const engagement = followers > 0 && views > 0 ? Math.round(0.75 * scale(rate, bench) + 0.25 * scale(commentRate, 0.003)) : 0;
  const cpm = views > 0 && price > 0 ? price / views * 1000 : null;
  const cost = price > 0 ? (cpm ? Math.round(scale(model.assume.targetCpm / cpm, 1)) : 0) : 85;
  const parts = {
    audience: NICHES[c.niche]?.need ?? 50,
    content: CONTENT[c.contentType] ?? 50,
    engagement,
    language: LANGS[c.language] ?? 70,
    cost
  };
  const w = model.weights;
  const wsum = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  const base = PARTS.reduce((s, [k]) => s + parts[k] * w[k], 0) / wsum;
  const risk = +c.risk || 0;
  const total = Math.round(clamp(base + risk, 0, 100));
  const a = model.assume;
  const signups = views * (a.ctr / 100) * (a.signup / 100);
  const paying = signups * (a.paid / 100);
  return {
    parts, total, risk, rate, bench, cpm, price, views,
    signups, paying,
    perSignup: price > 0 && signups > 0 ? price / signups : null,
    perPaying: price > 0 && paying > 0 ? price / paying : null,
    tier: total >= 75 ? ["Pitch first", "Strong fit on audience and economics."]
      : total >= 60 ? ["Pitch", "Good fit. Worth a personalised message."]
      : total >= 45 ? ["Nurture", "Engage with their content before asking for anything."]
      : ["Skip", "The numbers or the niche don't justify a pitch yet."]
  };
}

/* ---------- state ---------- */

let state;
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function loadState() {
  if (EDIT) {
    try { const s = localStorage.getItem(STORE); if (s) return JSON.parse(s); } catch (e) { /* storage unavailable */ }
  }
  return clone(window.SITE_DATA);
}
function save() {
  if (!EDIT) return;
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { toast("Couldn't save in this browser. Export before you close the tab."); }
}
let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
}
const charMarkup = (shirt, hair, lens) => `
<svg class="char-svg" viewBox="0 0 220 260" aria-hidden="true" style="--shirt:${shirt};--hair:${hair};--lens:${lens}">
  <g class="bob">
    <path d="M6 262 C6 192 52 166 110 166 C168 166 214 192 214 262 Z" fill="${shirt}" stroke="#1b1b18" stroke-width="5" stroke-linejoin="round"/>
    <path d="M34 216 C22 178 40 142 72 124" fill="none" stroke="#1b1b18" stroke-width="31" stroke-linecap="round"/>
    <path d="M186 216 C198 178 180 142 148 124" fill="none" stroke="#1b1b18" stroke-width="31" stroke-linecap="round"/>
    <path d="M34 216 C22 178 40 142 72 124" fill="none" stroke="${shirt}" stroke-width="21" stroke-linecap="round"/>
    <path d="M186 216 C198 178 180 142 148 124" fill="none" stroke="${shirt}" stroke-width="21" stroke-linecap="round"/>
    <ellipse cx="110" cy="100" rx="50" ry="54" fill="#fffef6" stroke="#1b1b18" stroke-width="5"/>
    <path d="M58 98 C44 26 176 18 162 98 C150 62 86 56 58 98Z" fill="${hair}" stroke="#1b1b18" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="72" cy="128" r="8" fill="#ff9d8a" opacity=".6"/><circle cx="148" cy="128" r="8" fill="#ff9d8a" opacity=".6"/>
    <rect x="103" y="92" width="14" height="18" fill="#1b1b18"/>
    <circle cx="86" cy="106" r="24" fill="${lens}" stroke="#1b1b18" stroke-width="5"/>
    <circle cx="134" cy="106" r="24" fill="${lens}" stroke="#1b1b18" stroke-width="5"/>
    <circle cx="86" cy="106" r="12" fill="#fffef6"/><circle cx="134" cy="106" r="12" fill="#fffef6"/>
    <g class="pup"><circle cx="87" cy="107" r="5.5" fill="#1b1b18"/><circle cx="135" cy="107" r="5.5" fill="#1b1b18"/></g>
    <g class="glint"><circle cx="78" cy="96" r="3" fill="#fff"/><circle cx="126" cy="96" r="3" fill="#fff"/></g>
    <ellipse class="mouth" cx="110" cy="148" rx="9" ry="6" fill="#7a2a1c" stroke="#1b1b18" stroke-width="4"/>
    <circle cx="72" cy="128" r="12" fill="#fffef6" stroke="#1b1b18" stroke-width="5"/>
    <circle cx="148" cy="128" r="12" fill="#fffef6" stroke="#1b1b18" stroke-width="5"/>
    <g class="voice" fill="#1b1b18"><rect x="176" y="76" width="7" height="24" rx="3.5"/><rect x="188" y="60" width="7" height="40" rx="3.5"/><rect x="200" y="76" width="7" height="24" rx="3.5"/></g>
  </g>
</svg>`;
const charSvg = (shirt, hair, lens, w = 130) => `<span class="char-inline" style="width:${w}px">${charMarkup(shirt, hair, lens)}</span>`;
const hasReply = c => !!(c.reply && c.reply.trim()) || ["replied", "talking", "won"].includes(c.status);
const wasPitched = c => c.status !== "identified";

/* ---------- hero ---------- */

function renderHero() {
  const p = state.profile, sp = state.sprint, cs = state.creators;
  $("#brand").textContent = p.name;
  document.title = `${p.name}: outreach sprint for Wispr Flow India`;
  const first = (p.name || "").trim().split(/\s+/)[0] || "there";
  $("#h1").innerHTML = p.headline ? esc(p.headline) : `Applying to Wispr Flow's growth team <span class="big">by doing the work.</span>`;
  $("#lede").textContent = p.lede ||
    `Hi, I'm ${first}. For a week I've been pitching real creators on Wispr Flow, keeping score of what works, and talking my decisions out loud as I go. It's all below, including what went wrong.`;

  const start = new Date(sp.start + "T00:00:00"), end = new Date(sp.end + "T23:59:59");
  const now = new Date(), total = Math.round((new Date(sp.end + "T00:00:00") - start) / 864e5) + 1;
  const day = Math.floor((now - start) / 864e5) + 1;
  $("#dayline").textContent = now < start ? `Challenge opens ${fmtDate(sp.start)}`
    : now > end ? "Sprint closed. This is the final record."
    : `Day ${day} of ${total}. Submissions close ${fmtDate(sp.end)}.`;

  const contacted = cs.filter(wasPitched).length;
  const replied = cs.filter(c => wasPitched(c) && hasReply(c)).length;
  const talking = cs.filter(c => ["talking", "won"].includes(c.status)).length;
  const won = cs.filter(c => c.status === "won").length;
  const open = talking;
  const steps = [
    ["Creators found", cs.length, `goal: ${sp.target}`],
    ["Messages sent", contacted, cs.length ? `${Math.round(contacted / cs.length * 100)}% of those found` : ""],
    ["Replies", replied, contacted ? `${Math.round(replied / contacted * 100)}% replied` : ""],
    ["Open to working together", open, won ? `${won} said yes` : (replied ? "in conversation" : "")]
  ];
  $("#funnel").innerHTML = steps.map(([label, n, sub]) => `
    <div class="fstep"><div class="fnum">${n}</div><div class="flabel">${label}</div><div class="fsub">${esc(sub)}</div></div>`).join("");

  const words = state.log.reduce((s, e) => s + wordCount(e.raw), 0);
  const days = new Set(state.log.map(e => dayKey(e.ts))).size;
  const mistakes = state.log.filter(e => e.kind === "mistake").length;
  $("#voiceline").innerHTML = state.log.length
    ? `<mark>${num(words)} words</mark> dictated across <b>${state.log.length}</b> log entries on <b>${days}</b> ${days === 1 ? "day" : "days"}, including <b>${mistakes}</b> ${mistakes === 1 ? "mistake" : "mistakes"} I wrote down instead of hiding.`
    : "The voice log is empty so far. Entries appear here as I dictate them.";
}

/* ---------- pipeline ledger ---------- */

let statusFilter = "all", view = "list", sortBy = "score";
function renderChips() {
  const cs = state.creators;
  const counts = Object.fromEntries(STATUS.map(([k]) => [k, cs.filter(c => c.status === k).length]));
  const items = [["all", "All", cs.length], ...STATUS.map(([k, l]) => [k, l, counts[k]])].filter(([k, , n]) => k === "all" || n > 0);
  $("#status-chips").innerHTML = items.map(([k, l, n]) =>
    `<button class="chip" type="button" data-f="${k}" aria-pressed="${statusFilter === k}">${l}<span class="n">${n}</span></button>`).join("");
}
const tierKey = n => (n >= 75 ? "hi" : n >= 60 ? "mid" : n >= 45 ? "low" : "skip");
const SORTERS = {
  score: (x, y) => y.s.total - x.s.total,
  recent: (x, y) => (y.c.pitchedOn || "").localeCompare(x.c.pitchedOn || "") || y.s.total - x.s.total,
  name: (x, y) => x.c.name.localeCompare(y.c.name)
};

function renderTools() {
  $("#sprint-tools").innerHTML = `
    <div class="seg" role="group" aria-label="View">
      <button type="button" data-view="list" aria-pressed="${view === "list"}">List</button>
      <button type="button" data-view="board" aria-pressed="${view === "board"}">Board</button>
    </div>
    <label class="sortby">Sort by
      <select class="in" id="sort"><option value="score">Fit score</option><option value="recent">Most recent</option><option value="name">Name</option></select>
    </label>
    <button class="btn ghost small" type="button" id="csv">Download CSV</button>`;
  $("#sort").value = sortBy;
}

function renderBoard(items) {
  $("#board").innerHTML = STATUS.map(([k, l]) => {
    const col = items.filter(x => x.c.status === k);
    return `<div class="col"><h4>${l}<span>${col.length}</span></h4>${col.map(({ c, s }) => `
      <button class="bcard" type="button" data-id="${esc(c.id)}"><span class="sc" data-t="${tierKey(s.total)}">${s.total}</span>
      <span><b>${esc(c.name)}</b><small>${esc(c.niche)}</small></span></button>`).join("") || `<p class="none">Nobody here</p>`}</div>`;
  }).join("");
}

function renderLedger() {
  renderChips();
  const all = state.creators.map(c => ({ c, s: scoreCreator(c) })).sort(SORTERS[sortBy]);
  const board = view === "board" && state.creators.length > 0;
  $("#ledger").hidden = board; $("#board").hidden = !board; $("#status-chips").hidden = board;
  $("#sprint-tools").hidden = !state.creators.length;
  const el = $("#ledger");
  if (!state.creators.length) {
    el.innerHTML = `<div class="empty">${charSvg("#ffa64a", "#1b1b18", "#03493f")}<strong>Nothing here yet.</strong>I'd rather show an empty board than a made-up one. Creators appear here as I find and message them.</div>`;
    return;
  }
  if (board) { renderBoard(all); return; }
  const rows = all.filter(x => statusFilter === "all" || x.c.status === statusFilter);
  if (!rows.length) { el.innerHTML = `<div class="empty">No creators with this status.</div>`; return; }
  el.innerHTML = `<div class="lhead"><span>Creator</span><span>Niche</span><span>Fit score</span><span>Status</span><span>Pitched</span><span>Reply</span></div>` +
    rows.map(({ c, s }) => `
    <button class="lrow" type="button" data-id="${esc(c.id)}">
      <span class="lname">${esc(c.name)}<small>${esc(c.handle)} on ${esc(c.platform)}</small></span>
      <span class="lniche">${esc(c.niche)}</span>
      <span class="lscore"><span class="sc" data-t="${tierKey(s.total)}">${s.total}</span></span>
      <span class="lstat"><span class="pill" data-s="${c.status}">${esc(STATUS.find(x => x[0] === c.status)?.[1] || c.status)}</span></span>
      <span class="lpitched">${c.pitchedOn ? fmtDate(c.pitchedOn) : '<span class="dash">-</span>'}</span>
      <span class="lreply">${wasPitched(c) ? (hasReply(c) ? '<span class="tick">Yes</span>' : '<span class="dash">None</span>') : '<span class="dash">-</span>'}</span>
    </button>`).join("");
}

function downloadCsv() {
  const cols = ["name", "handle", "platform", "niche", "language", "followers", "avgViews", "comments", "price", "fitScore", "status", "pitchedOn", "replied"];
  const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = state.creators.map(c => [c.name, c.handle, c.platform, c.niche, c.language, c.followers, c.avgViews, c.comments, c.price, scoreCreator(c).total, c.status, c.pitchedOn, hasReply(c) ? "yes" : "no"]);
  const csv = [cols.join(","), ...rows.map(r => r.map(q).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "outreach-pipeline.csv"; a.click();
  toast("Downloaded");
}

$("#board").addEventListener("click", e => { const b = e.target.closest(".bcard"); if (b) openCreator(b.dataset.id); });
$("#sprint-tools").addEventListener("click", e => {
  const v = e.target.closest("[data-view]");
  if (v) { view = v.dataset.view; renderTools(); renderLedger(); }
  if (e.target.id === "csv") downloadCsv();
});
$("#sprint-tools").addEventListener("change", e => { if (e.target.id === "sort") { sortBy = e.target.value; renderLedger(); } });
$("#featured").addEventListener("click", e => { const b = e.target.closest("[data-id]"); if (b) openCreator(b.dataset.id); });

/* ---------- day by day ---------- */

function renderDays() {
  const sp = state.sprint, el = $("#days");
  const start = new Date(sp.start + "T00:00:00"), end = new Date(sp.end + "T00:00:00");
  const n = Math.round((end - start) / 864e5) + 1;
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const days = Array.from({ length: n }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  const msgs = days.map(d => state.creators.filter(c => c.pitchedOn === key(d)).length);
  const wds = days.map(d => state.log.filter(e => key(new Date(e.ts)) === key(d)).reduce((t, e) => t + wordCount(e.raw), 0));
  if (!msgs.some(Boolean) && !wds.some(Boolean)) { el.innerHTML = ""; return; }
  const mm = Math.max(...msgs, 1), mw = Math.max(...wds, 1);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  el.innerHTML = `<h3>Day by day</h3><div class="days-grid" style="--n:${n}">${days.map((d, i) => `
    <div class="dcol${d > today ? " future" : ""}">
      <div class="dbar m" title="${msgs[i]} messages"><b>${msgs[i] || ""}</b>${msgs[i] ? `<i style="height:${Math.max(6, Math.round(msgs[i] / mm * 62))}px"></i>` : ""}</div>
      <div class="dbar w" title="${wds[i]} words"><b>${wds[i] || ""}</b>${wds[i] ? `<i style="height:${Math.max(6, Math.round(wds[i] / mw * 62))}px"></i>` : ""}</div>
      <span class="dl">${d.toLocaleDateString("en-IN", { weekday: "short" })}<small>${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></span>
    </div>`).join("")}</div>
    <p class="legend"><span><span class="k m"></span>Messages sent</span><span><span class="k w"></span>Words dictated</span></p>`;
}

/* ---------- two threads worth reading ---------- */

function renderFeatured() {
  const el = $("#featured");
  const rank = { won: 3, talking: 2, replied: 1 };
  const withMsg = state.creators.filter(c => c.message && c.message.trim());
  const worked = withMsg.filter(c => rank[c.status])
    .sort((a, b) => rank[b.status] - rank[a.status] || scoreCreator(b).total - scoreCreator(a).total)[0];
  const flop = withMsg.filter(c => c.status === "passed" && !hasReply(c))
    .sort((a, b) => (b.lesson ? 1 : 0) - (a.lesson ? 1 : 0) || scoreCreator(b).total - scoreCreator(a).total)[0];
  const card = (c, tag, cls) => `<article class="feat ${cls}">
      <span class="pill">${tag}</span><h3>${esc(c.name)}</h3>
      <p class="fmeta">${esc(c.handle)} on ${esc(c.platform)}, fit score ${scoreCreator(c).total}</p>
      <h4>What I sent</h4><blockquote><div class="clampi">${esc(c.message)}</div></blockquote>
      <h4>What came back</h4>${c.reply ? `<blockquote>${esc(c.reply)}</blockquote>` : `<blockquote class="silent">Nothing.</blockquote>`}
      ${c.lesson ? `<p class="flesson"><b>What I learned:</b> ${esc(c.lesson)}</p>` : ""}
      <button class="btn ghost small" type="button" data-id="${esc(c.id)}">Read the full thread</button></article>`;
  const cards = [worked && card(worked, "The message that worked", "worked"), flop && card(flop, "The one that didn't", "flopped")].filter(Boolean);
  el.innerHTML = cards.length ? `<h3 class="featured-title">Two threads worth reading</h3><div class="feat-grid">${cards.join("")}</div>` : "";
}

/* ---------- insights: does the score predict replies? ---------- */

function renderInsights() {
  const el = $("#insights");
  const pitched = state.creators.filter(wasPitched).map(c => ({ c, s: scoreCreator(c).total, r: hasReply(c) }));
  if (pitched.length < 5) { el.innerHTML = ""; return; }
  const rate = g => g.filter(x => x.r).length;
  const langs = [...new Set(pitched.map(x => x.c.language))];
  const sets = [
    ["By fit score", [["75 and up", x => x.s >= 75], ["60 to 74", x => x.s >= 60 && x.s < 75], ["Below 60", x => x.s < 60]]],
    ["By language", langs.map(l => [l, x => x.c.language === l])],
    ["By platform", [...new Set(pitched.map(x => x.c.platform))].map(p => [p, x => x.c.platform === p])]
  ];
  const hi = pitched.filter(x => x.s >= 60), lo = pitched.filter(x => x.s < 60);
  const take = hi.length && lo.length
    ? `Creators scoring 60 or more replied ${Math.round(rate(hi) / hi.length * 100)}% of the time (${rate(hi)} of ${hi.length}). Below 60, ${Math.round(rate(lo) / lo.length * 100)}% (${rate(lo)} of ${lo.length}). The sample is small, so I treat this as something to test further, not proof.`
    : "";
  el.innerHTML = `<h3>What the replies are telling me</h3>${take ? `<p class="take">${take}</p>` : ""}
    <div class="ins-grid">${sets.map(([title, rows]) => `<div><h4>${title}</h4>${rows.map(([label, fn]) => {
      const g = pitched.filter(fn); if (!g.length) return "";
      const n = rate(g), pct = Math.round(n / g.length * 100);
      return `<div class="ins-row"><span>${esc(label)}</span><span class="bar"><i style="width:${pct}%"></i></span><span class="pv">${n}/${g.length}</span></div>`;
    }).join("")}</div>`).join("")}</div>`;
}

/* ---------- creator dialog ---------- */

function opt(list, cur) { return list.map(([v, l]) => `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(l)}</option>`).join(""); }

function openCreator(id) {
  const c = state.creators.find(x => x.id === id); if (!c) return;
  const s = scoreCreator(c), dlg = $("#dlg");
  const statusLabel = STATUS.find(x => x[0] === c.status)?.[1];
  let body;
  if (EDIT) {
    body = `
      <div class="grid2">
        <label class="f">Status<select class="in" name="status">${opt(STATUS, c.status)}</select></label>
        <label class="f">Pitched on<input class="in" type="date" name="pitchedOn" value="${esc(c.pitchedOn)}"></label>
      </div>
      <label class="f">Message I sent<textarea class="in" name="message" rows="6">${esc(c.message)}</textarea></label>
      <label class="f">Their reply<textarea class="in" name="reply" rows="3">${esc(c.reply)}</textarea></label>
      <label class="f">What I learned<textarea class="in" name="lesson" rows="3">${esc(c.lesson)}</textarea></label>
      <div class="row-actions">
        <button class="btn accent" type="button" data-act="save">Save changes</button>
        <button class="btn ghost" type="button" data-act="score">Open in scorer</button>
        <button class="btn danger" type="button" data-act="delete">Delete creator</button>
        <button class="btn ghost" type="button" data-act="close">Close</button>
      </div>`;
  } else {
    body = `
      ${c.message ? `<h4>What I sent</h4><blockquote>${esc(c.message)}</blockquote>` : ""}
      ${c.reply ? `<h4>What came back</h4><blockquote>${esc(c.reply)}</blockquote>` : ""}
      ${c.lesson ? `<h4>What I learned</h4><blockquote>${esc(c.lesson)}</blockquote>` : ""}
      ${!c.message && !c.reply && !c.lesson ? `<p class="meta">Not pitched yet.</p>` : ""}
      <div class="row-actions">
        <button class="btn accent" type="button" data-act="score">See how it scored</button>
        <button class="btn ghost" type="button" data-act="close">Close</button>
      </div>`;
  }
  dlg.innerHTML = `<form method="dialog" class="dlg" data-id="${esc(c.id)}">
    <div><h3>${esc(c.name)}</h3>
    <div class="meta">${esc(c.handle)} on ${esc(c.platform)} · ${esc(c.niche)} · ${esc(c.language)} · fit score ${s.total} (${s.tier[0]}) · ${esc(statusLabel)}</div></div>
    <div class="mini">${PARTS.map(([k, l]) => `<div class="part"><span>${l}</span><span class="bar"><i style="width:${s.parts[k]}%"></i></span><span class="pv">${s.parts[k]}</span></div>`).join("")}</div>
    ${body}</form>`;
  dlg.showModal();
}

$("#dlg").addEventListener("click", e => {
  const dlg = e.currentTarget;
  if (e.target === dlg) return dlg.close();
  const btn = e.target.closest("[data-act]"); if (!btn) return;
  const form = btn.closest("form"), id = form.dataset.id;
  const c = state.creators.find(x => x.id === id);
  const act = btn.dataset.act;
  if (act === "close") dlg.close();
  if (act === "score") { loadIntoScorer(c); dlg.close(); $("#scorer").scrollIntoView(); }
  if (act === "save") {
    for (const k of ["status", "pitchedOn", "message", "reply", "lesson"]) c[k] = form.elements[k].value;
    save(); renderAll(); dlg.close(); toast("Saved");
  }
  if (act === "delete" && confirm(`Delete ${c.name} from the pipeline?`)) {
    state.creators = state.creators.filter(x => x.id !== id);
    save(); renderAll(); dlg.close();
  }
});

$("#ledger").addEventListener("click", e => { const r = e.target.closest(".lrow"); if (r) openCreator(r.dataset.id); });
$("#status-chips").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  statusFilter = b.dataset.f; renderLedger();
});

/* ---------- scorer ---------- */

let F = {
  name: "Example creator", handle: "@example", platform: "Instagram", niche: "Coding / dev", language: "Hinglish",
  contentType: "Tutorials / workflows", followers: 120000, avgViews: 30000, comments: 90, price: 9000, risk: 0,
  note: "", observed: "", ask: "chat", editingId: null, touched: false
};

function buildScorerForm() {
  const sel = (k, list) => `<select class="in" name="${k}">${list.map(v => `<option>${esc(v)}</option>`).join("")}</select>`;
  $("#scorer-form").innerHTML = `
    <h3>Creator</h3>
    <label class="f">Name<input class="in" name="name"></label>
    <label class="f">Handle<input class="in" name="handle"></label>
    <label class="f">Platform${sel("platform", Object.keys(PLATFORMS))}</label>
    <label class="f">Language${sel("language", Object.keys(LANGS))}</label>
    <label class="f wide">Niche${sel("niche", Object.keys(NICHES))}</label>
    <label class="f wide">What they mostly post${sel("contentType", Object.keys(CONTENT))}</label>
    <h3>Public numbers</h3>
    <label class="f">Followers<input class="in" type="number" min="0" name="followers"></label>
    <label class="f">Average views per post<input class="in" type="number" min="0" name="avgViews"></label>
    <label class="f">Average comments<input class="in" type="number" min="0" name="comments"></label>
    <label class="f">Quoted price (₹)<input class="in" type="number" min="0" name="price" placeholder="0 if unknown"></label>
    <label class="f wide">Competing tools
      <select class="in" name="risk">${RISK.map(([l, v]) => `<option value="${v}">${esc(l)}</option>`).join("")}</select></label>
    <h3>Pitch</h3>
    <label class="f wide">One specific thing I noticed in their content<textarea class="in" name="note" rows="2" placeholder="Name a real video or post, and what stood out"></textarea></label>
    <label class="f wide">One real thing I observed using Flow <span class="hint">(optional)</span><textarea class="in" name="observed" rows="2" placeholder="Only what actually happened to you"></textarea></label>
    <label class="f wide">What I'm asking for
      <select class="in" name="ask">
        <option value="chat">A 10-minute chat</option><option value="demo">Permission to send a tailored demo</option>
        <option value="rate">Their media kit or rate card</option><option value="try">Try it for a week and give honest feedback</option>
      </select></label>
    ${EDIT ? `<div class="wide row-actions"><button type="button" class="btn accent" id="save-creator">${F.editingId ? "Update creator" : "Add to pipeline"}</button><button type="button" class="btn ghost" id="new-creator">Clear form</button></div>` : ""}
  `;
  syncForm();
}
function syncForm() {
  const f = $("#scorer-form");
  for (const el of f.elements) if (el.name && el.name in F) el.value = F[el.name];
  const sv = $("#save-creator"); if (sv) sv.textContent = F.editingId ? "Update creator" : "Add to pipeline";
}
function readForm() {
  const f = $("#scorer-form");
  for (const el of f.elements) {
    if (!el.name || !(el.name in F)) continue;
    F[el.name] = el.type === "number" ? (+el.value || 0) : (el.name === "risk" ? +el.value : el.value);
  }
  F.touched = true;
}
function loadIntoScorer(c) {
  F = { ...F, ...c, risk: +c.risk || 0, note: F.note, observed: F.observed, editingId: c.id, touched: true };
  syncForm(); renderResult();
}

function buildPitch(c) {
  const nic = NICHES[c.niche] || NICHES["Productivity / workflow"];
  const hi = ["Hinglish", "Hindi"].includes(c.language);
  const first = (c.name || "").trim().split(/\s+/)[0] || "there";
  const note = c.note.trim() || "[Add one specific thing from their content here before sending]";
  const ask = ASKS[c.ask][hi ? "hi" : "en"];
  const who = state.profile.name;
  const lines = hi ? [
    `Hi ${first}!`,
    note,
    nic.hi,
    c.observed.trim() ? `Is hafte Flow use karte hue maine notice kiya: ${c.observed.trim()}` : "",
    "Seedhi baat: abhi main Wispr Flow team ka hissa nahi hoon. Maine unki India growth team ke liye apply kiya hai, aur ye outreach meri application ka hissa hai. Main sirf unhi creators ko pitch kar raha hoon jinhe genuinely fit lagta hai.",
    ask,
    `- ${who}`
  ] : [
    `Hi ${first},`,
    note,
    nic.en,
    c.observed.trim() ? `Using Wispr Flow this week, I noticed ${c.observed.trim().replace(/^[Ii] noticed /, "")}` : "",
    "To be upfront: I'm not on the Wispr Flow team. I've applied to their India growth team, and this outreach is part of my application. I'm only pitching creators I think are a real fit.",
    ask,
    `${who}`
  ];
  const body = lines.filter(Boolean).join("\n\n");
  return c.platform === "YouTube" ? `Subject: ${hi ? "Wispr Flow aur aapki audience" : "Wispr Flow and your audience"}\n\n${body}` : body;
}

function renderResult() {
  const s = scoreCreator(F);
  const circ = 2 * Math.PI * 56;
  const whys = {
    audience: `${F.niche}`,
    content: `${F.contentType}`,
    engagement: F.followers > 0 && F.avgViews > 0 ? `${(s.rate * 100).toFixed(1)}% view rate against a ${(s.bench * 100).toFixed(0)}% ${F.platform} benchmark` : "Enter followers and average views",
    language: `${F.language}`,
    cost: F.price > 0 ? (s.cpm ? `${inr(s.cpm)} per 1,000 views against a ${inr(model.assume.targetCpm)} target` : "Enter average views") : "No price given, so scored as neutral-good"
  };
  const pitch = buildPitch(F);
  const pitchEl = $("#pitch-text");
  const keepPitch = pitchEl && document.activeElement === pitchEl;
  $("#scorer-result").innerHTML = `
    <div class="rtop">
      <div class="ring"><svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
        <circle class="track" cx="66" cy="66" r="56" fill="none" stroke-width="12"/>
        <circle class="val" cx="66" cy="66" r="56" fill="none" stroke-width="12" stroke-linecap="round"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - s.total / 100)}"/></svg><b>${s.total}</b></div>
      <div><div class="tier">${s.tier[0]}</div><div class="tier-sub">${s.tier[1]}</div>
      ${s.risk ? `<div class="risk">Competitor penalty applied: ${s.risk}</div>` : ""}</div>
    </div>
    <div class="parts">${PARTS.map(([k, l]) => `
      <div class="part"><span>${l}</span><span class="bar"><i style="width:${s.parts[k]}%"></i></span><span class="pv">${s.parts[k]}</span>
      <span class="why">${esc(whys[k])}</span></div>`).join("")}</div>
    <div class="econ">
      <div><b>${s.cpm ? inr(s.cpm) : "-"}</b><span>CPM</span></div>
      <div><b>${num(s.signups)}</b><span>est. signups</span></div>
      <div><b>${s.perSignup ? inr(s.perSignup) : "-"}</b><span>per signup</span></div>
      <div><b>${s.perPaying ? inr(s.perPaying) : "-"}</b><span>per paying user</span></div>
    </div>
    <p class="note">Estimates use my assumptions (see below), not Wispr Flow's numbers.</p>
    <div class="pitch">
      <div class="pitch-head"><span>First draft to send</span><button class="btn ghost small" type="button" id="copy-pitch">Copy</button></div>
      <textarea class="in" id="pitch-text" rows="12" aria-label="Draft message">${esc(pitch)}</textarea>
      ${F.note.trim() ? "" : `<p class="warn">Add one specific thing from their content before you send this. Generic pitches are the ones that get ignored.</p>`}
    </div>`;
  if (keepPitch) $("#pitch-text").focus();
}

$("#scorer-form").addEventListener("input", () => { readForm(); renderResult(); if (EDIT) { const sv = $("#save-creator"); if (sv) sv.textContent = F.editingId ? "Update creator" : "Add to pipeline"; } });
$("#scorer-form").addEventListener("click", e => {
  if (e.target.id === "new-creator") { F = { ...F, name: "", handle: "", note: "", observed: "", editingId: null, followers: 0, avgViews: 0, comments: 0, price: 0 }; syncForm(); renderResult(); }
  if (e.target.id === "save-creator") {
    if (!F.name.trim()) return toast("Add the creator's name first");
    const rec = { name: F.name.trim(), handle: F.handle.trim(), platform: F.platform, niche: F.niche, language: F.language,
      contentType: F.contentType, followers: F.followers, avgViews: F.avgViews, comments: F.comments, price: F.price, risk: F.risk };
    const ex = state.creators.find(c => c.id === F.editingId);
    if (ex) Object.assign(ex, rec);
    else { const n = { id: uid(), status: "identified", pitchedOn: "", message: "", reply: "", lesson: "", ...rec }; state.creators.push(n); F.editingId = n.id; }
    save(); renderAll(); toast(ex ? "Creator updated" : "Added to pipeline");
  }
});
$("#scorer-result").addEventListener("click", async e => {
  if (e.target.id !== "copy-pitch") return;
  const t = $("#pitch-text");
  try { await navigator.clipboard.writeText(t.value); } catch (err) { t.select(); document.execCommand("copy"); }
  toast("Copied");
});

function buildModel() {
  const w = model.weights, a = model.assume;
  $("#model-body").innerHTML = `
    <div><h4>Weights</h4>
      ${PARTS.map(([k, l]) => `<label class="slider"><span>${l}</span><input type="range" min="0" max="50" step="5" value="${w[k]}" data-w="${k}"><output>${w[k]}</output></label>`).join("")}
      <p class="note">Weights are relative, so they don't need to add up to 100. Risk is a flat penalty on top. Hinglish scores highest on language because mixed-language typing is where dictation saves the most effort. That's an assumption I'd test.</p></div>
    <div><h4>Economics assumptions</h4>
      <div class="assume">
        <label for="a-cpm">Target CPM (₹)</label><input class="in" id="a-cpm" type="number" min="1" data-a="targetCpm" value="${a.targetCpm}">
        <label for="a-ctr">Views that click (%)</label><input class="in" id="a-ctr" type="number" step="0.1" min="0" data-a="ctr" value="${a.ctr}">
        <label for="a-su">Clicks that sign up (%)</label><input class="in" id="a-su" type="number" min="0" data-a="signup" value="${a.signup}">
        <label for="a-pd">Signups that pay (%)</label><input class="in" id="a-pd" type="number" step="0.5" min="0" data-a="paid" value="${a.paid}">
      </div>
      <p class="note">These are placeholders to make the comparison between creators fair. Swap in Wispr Flow's real funnel rates and the ranking updates everywhere.</p></div>`;
}
$("#model-body").addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.w) { model.weights[t.dataset.w] = +t.value; t.nextElementSibling.textContent = t.value; }
  if (t.dataset.a) model.assume[t.dataset.a] = Math.max(0, +t.value || 0);
  renderResult(); renderLedger(); renderInsights();
});

/* ---------- voice log ---------- */

let kindFilter = "all";
function renderComposer() {
  const el = $("#composer");
  if (!EDIT) { el.innerHTML = ""; return; }
  el.innerHTML = `<form class="card composer" id="log-form">
    <h3>New entry</h3>
    <div class="two">
      <label class="f">Title<input class="in" name="title" placeholder="What happened or what you decided" required></label>
      <label class="f">Type<select class="in" name="kind">${opt(KINDS, "decision")}</select></label>
    </div>
    <label class="f">Talk with Wispr Flow, or press Dictate. Don't tidy it up.<textarea class="in raw" name="raw" required></textarea></label>
    <label class="f">What I'm taking from it<input class="in" name="takeaway" placeholder="One sentence, typed or dictated"></label>
    <div class="row-actions" style="margin:0"><button class="btn accent" type="submit">Add entry</button><button class="btn ghost" type="button" id="mic">Dictate here</button><span class="wc" id="wc">0 words</span></div>
  </form>`;
  setupMic();
}
$("#composer").addEventListener("input", e => { if (e.target.name === "raw") $("#wc").textContent = `${wordCount(e.target.value)} words`; });
$("#composer").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target.elements;
  state.log.push({ id: uid(), ts: new Date().toISOString(), kind: f.kind.value, title: f.title.value.trim(), raw: f.raw.value.trim(), takeaway: f.takeaway.value.trim() });
  save(); renderAll(); toast("Entry added");
});

function renderTimeline() {
  const counts = Object.fromEntries(KINDS.map(([k]) => [k, state.log.filter(e => e.kind === k).length]));
  const items = [["all", "All", state.log.length], ...KINDS.map(([k, l]) => [k, l, counts[k]])].filter(([k, , n]) => k === "all" || n > 0);
  $("#kind-chips").innerHTML = state.log.length ? items.map(([k, l, n]) =>
    `<button class="chip" type="button" data-f="${k}" aria-pressed="${kindFilter === k}">${l}<span class="n">${n}</span></button>`).join("") : "";
  const tl = $("#timeline");
  const list = state.log.filter(e => kindFilter === "all" || e.kind === kindFilter).sort((a, b) => new Date(b.ts) - new Date(a.ts));
  if (!list.length) {
    tl.innerHTML = `<div class="empty card">${charSvg("#ff6b4f", "#ffa64a", "#edd6ff")}<strong>Nothing logged yet.</strong>Each decision and mistake gets talked out loud and saved here as it happens.</div>`;
    return;
  }
  const groups = new Map();
  for (const e of list) { const k = dayKey(e.ts); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); }
  const start = new Date(state.sprint.start + "T00:00:00");
  tl.innerHTML = [...groups.values()].map(g => {
    const d = new Date(g[0].ts), n = Math.floor((d - start) / 864e5) + 1;
    return `<div class="day"><div class="day-label">${fmtDate(g[0].ts, { weekday: "short", day: "numeric", month: "short" })}<small>${n >= 1 ? `Day ${n}` : "Before the sprint"} · ${g.reduce((s, e) => s + wordCount(e.raw), 0)} words dictated</small></div>
      <div class="entries">${g.map(e => `
        <article class="entry">
          <span class="kind" data-k="${e.kind}">${esc(KINDS.find(k => k[0] === e.kind)?.[1] || e.kind)}</span><span class="etime">${fmtTime(e.ts)}</span>
          <h3>${esc(e.title)}</h3>
          ${e.takeaway ? `<p class="takeaway">${esc(e.takeaway)}</p>` : ""}
          <details${e.id === list[0].id ? " open" : ""}><summary>Raw dictation <span class="wcount">(${wordCount(e.raw)} words)</span></summary>
            <pre class="raw-block"><mark>${esc(e.raw)}</mark></pre></details>
          ${EDIT ? `<button class="btn danger" type="button" data-del="${esc(e.id)}" style="margin-top:10px">Delete entry</button>` : ""}
        </article>`).join("")}</div></div>`;
  }).join("");
}
$("#kind-chips").addEventListener("click", e => { const b = e.target.closest(".chip"); if (b) { kindFilter = b.dataset.f; renderTimeline(); } });
$("#timeline").addEventListener("click", e => {
  const b = e.target.closest("[data-del]"); if (!b) return;
  if (confirm("Delete this log entry?")) { state.log = state.log.filter(x => x.id !== b.dataset.del); save(); renderAll(); }
});

/* ---------- about, footer, edit bar ---------- */

function renderAbout() {
  const p = state.profile;
  const link = (v, pre) => v ? `<a href="${esc(/^https?:/.test(v) ? v : pre + v.replace(/^@/, ""))}">${esc(v)}</a>` : "";
  const facts = [
    ["Based in", esc(p.city)],
    ["Looking for", esc(p.interest)],
    ["Earliest start", esc(p.startDate)],
    ["Relocation", esc(p.relocation)],
    ["Website", link(p.website, "https://")],
    ["LinkedIn", link(p.linkedin, "https://")],
    ["GitHub", link(p.github, "https://")],
    ["X", link(p.x, "https://x.com/")],
    ["Email", p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ""]
  ].filter(([, v]) => v);
  const fromLog = state.log.filter(e => e.kind === "mistake").map(e => ({ title: e.title, lesson: e.takeaway }));
  const mistakes = [...(p.mistakes || []), ...fromLog];
  const built = p.built || [];
  $("#about-body").innerHTML = `
    <div>${p.about.length ? p.about.map(t => `<p>${esc(t)}</p>`).join("") : (EDIT ? `<p>Add your paragraphs to <code>profile.about</code> in data.js.</p>` : "")}
      ${built.length ? `<h3>Things I've built that real people use</h3>
      <ul class="built">${built.map(b => `<li><b>${esc(b.name)}</b><span>${esc(b.line)}</span></li>`).join("")}</ul>` : ""}
      ${mistakes.length ? `<h3>Mistakes I've made this week</h3>
      <ul class="mistakes">${mistakes.map(m => `<li><b>${esc(m.title)}</b>${m.lesson ? `<span>${esc(m.lesson)}</span>` : ""}</li>`).join("")}</ul>` : ""}</div>
    <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
  $("#foot").innerHTML = `Built with Wispr Flow for voice input and Emergent for the build. Creator numbers are public figures entered by hand. Scores are my own model, not Wispr Flow's.${p.prototype ? "<br><b>This page currently shows sample data for the creators, replies, voice log and Hinglish results.</b>" : ""}`;
}

function renderPlan() {
  const plan = state.profile.plan || [];
  const hide = !plan.length && !EDIT;
  $("#plan").hidden = hide; $("#plan-link").hidden = hide;
  $("#plan-body").innerHTML = plan.length
    ? plan.map(x => `<article class="plan-card"><span class="pill">${esc(x.when)}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join("")
    : `<p>Add steps to <code>profile.plan</code> in data.js.</p>`;
}

/* ---------- extra proof sections (each hides until it has real content) ---------- */

const showTodo = () => !!state.profile.prototype || EDIT;
const todoCard = (title, prompts) => `<div class="todo"><b>${esc(title)}</b><ul>${prompts.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
  <p>Add this in <code>data.js</code>. Visitors won't see this box once the real site is live.</p></div>`;
const safeUrl = u => /^(https?:\/\/|[\w./-]+$)/.test(u || "") ? u : "";

function renderQuotes() {
  const rank = { won: 3, talking: 2, replied: 1 };
  const list = state.creators.filter(c => c.reply && c.reply.trim() && rank[c.status])
    .sort((a, b) => rank[b.status] - rank[a.status] || scoreCreator(b).total - scoreCreator(a).total).slice(0, 4);
  $("#quotes").innerHTML = list.length ? `<h3 class="sub">In their words</h3>
    <div class="quotes-grid">${list.map(c => `<figure class="quote"><blockquote>“${esc(c.reply)}”</blockquote>
      <figcaption>${esc(c.name)}, ${esc(c.handle)} on ${esc(c.platform)}</figcaption></figure>`).join("")}</div>` : "";
}

function renderMyPost() {
  const p = state.profile.post, el = $("#mypost");
  if (!p || !p.url) { el.innerHTML = showTodo() ? `<h3 class="sub">My own post about this</h3>${todoCard("Publish the optional LinkedIn or X post early, then add it here", ["The link to the post", "What you wrote", "Real views, likes and replies after a few days"])}` : ""; return; }
  const st = p.stats || {};
  el.innerHTML = `<h3 class="sub">My own post about this</h3><div class="post card">
    <span class="pill">${esc(p.platform || "Post")}</span>
    <p class="post-text">${esc(p.text || "")}</p>
    <div class="post-stats">${[["Views", st.views], ["Likes", st.likes], ["Replies", st.replies]].filter(x => x[1] != null).map(([l, v]) => `<div><b>${num(v)}</b><span>${l}</span></div>`).join("")}</div>
    ${safeUrl(p.url) ? `<a class="btn ghost small" href="${esc(p.url)}" rel="noopener">See the post</a>` : ""}</div>`;
}

function renderVideos() {
  const vids = state.profile.videos || [], el = $("#videos");
  if (!vids.length) { el.innerHTML = showTodo() ? `<h3 class="sub">Watch me use Flow</h3>${todoCard("Add a screen recording of you dictating with Wispr Flow", ["A 30 to 60 second clip: you speaking, the text appearing", "Put the file next to index.html and add its name under profile.videos, or paste a YouTube or Loom embed link"])}` : ""; return; }
  el.innerHTML = `<h3 class="sub">Watch me use Flow</h3><div class="vids">${vids.map(v => {
    const src = safeUrl(v.src); if (!src) return "";
    const embed = /^https:\/\/(www\.)?(youtube\.com\/embed|player\.vimeo\.com|www\.loom\.com\/embed)/.test(src);
    return `<figure class="vid">${embed
      ? `<iframe src="${esc(src)}" title="${esc(v.title)}" loading="lazy" allowfullscreen></iframe>`
      : `<video controls preload="metadata" src="${esc(src)}"></video>`}<figcaption><b>${esc(v.title)}</b>${v.caption ? `<span>${esc(v.caption)}</span>` : ""}</figcaption></figure>`;
  }).join("")}</div>`;
}

function renderHinglish() {
  const h = state.profile.hinglish || {}, runs = h.runs || [];
  const hide = !runs.length && !showTodo();
  $("#hinglish").hidden = hide; $("#hinglish-link").hidden = hide;
  const el = $("#hinglish-body");
  const runner = EDIT ? hlRunnerHtml() : "";
  if (!runs.length) { el.innerHTML = runner + todoCard("Run your own Hinglish test", ["Say 15 to 20 real phrases you use: mixed Hindi and English, names, tech words", "For each one, note what Flow wrote and whether it was right", "Write 2 or 3 takeaways about what worked and what broke"]); return; }
  const ok = runs.filter(r => r.ok).length, pct = Math.round(ok / runs.length * 100);
  el.innerHTML = `${runner}${state.profile.prototype ? `<p class="sample-note"><span class="pill">Sample results</span> These phrases and results are invented for the prototype.</p>` : ""}
    <div class="hl-stats">
      <div class="fstep"><div class="fnum">${runs.length}</div><div class="flabel">Phrases tested</div></div>
      <div class="fstep"><div class="fnum">${pct}%</div><div class="flabel">Came out right</div><div class="fsub">${ok} of ${runs.length}</div></div>
      <div class="fstep"><div class="fnum">${runs.length - ok}</div><div class="flabel">Needed a fix</div></div>
    </div>
    <div class="hl card" role="table" aria-label="Hinglish test results">
      <div class="hl-head" role="row"><span role="columnheader">What I said</span><span role="columnheader">What Flow wrote</span><span role="columnheader">Result</span></div>
      ${runs.map(r => `<div class="hl-row" role="row"><span class="said-t" role="cell">${esc(r.said)}</span>
        <span role="cell">${esc(r.wrote)}${r.note ? `<small>${esc(r.note)}</small>` : ""}</span>
        <span role="cell"><span class="pill" data-s="${r.ok ? "talking" : "replied"}">${r.ok ? "Right" : "Needed a fix"}</span></span></div>`).join("")}
    </div>
    ${(h.takeaways || []).length ? `<h3 class="sub">What I took from it</h3><ul class="takes">${h.takeaways.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}`;
}

function renderExperiments() {
  const ex = state.profile.experiments || [], el = $("#experiments");
  const ctx = state.profile.context || [];
  const ctxHtml = ctx.length ? `<h3 class="sub">What I read first</h3><ul class="ctx">${ctx.map(c => `<li><span>${esc(c.text)}</span>${c.url ? ` <a href="${esc(c.url)}" rel="noopener">${esc(c.source)}</a>` : ` <em>${esc(c.source)}</em>`}</li>`).join("")}</ul>` : "";
  if (!ex.length) { el.innerHTML = showTodo() ? `<h3 class="sub">Three things I'd test first</h3>${todoCard("Add three experiments", ["What you believe, how you'd run it, and the number that would prove you wrong"])}` : ""; return; }
  el.innerHTML = `${ctxHtml}<h3 class="sub sub-gap">Three things I'd test first</h3><div class="exp-grid">${ex.map(x => `<article class="exp">
    <span class="pill">${esc(x.effort || "")}</span><h4>${esc(x.title)}</h4>
    <p><b>If I'm right:</b> ${esc(x.hypothesis)}</p><p><b>How I'd run it:</b> ${esc(x.how)}</p><p><b>How I'd know:</b> ${esc(x.metric)}</p></article>`).join("")}</div>`;
}

function renderBrief() {
  const b = state.profile.brief, el = $("#brief");
  if (!b) { el.innerHTML = ""; return; }
  const list = (t, a) => a?.length ? `<div><h5>${t}</h5><ul>${a.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>` : "";
  el.innerHTML = `<h3 class="sub">A creator brief I'd send</h3><div class="brief card">
    <h4>${esc(b.title)}</h4><p class="angle">${esc(b.angle)}</p>
    <div class="brief-cols">${list("What I'd ask them to make", b.deliverables)}${list("Hooks to try", b.hooks)}${list("What I'd measure", b.measure)}${list("What I'd avoid", b.avoid)}</div></div>`;
}

function renderCaseStudy() {
  const c = state.profile.casestudy, el = $("#casestudy");
  if (!c) { el.innerHTML = ""; return; }
  const story = c.story || [];
  const prompts = ["How did the first 100 students find it?", "Which channel brought the most people?", "What did you try that didn't work?", "What would you do differently?"];
  el.innerHTML = `<h3 class="sub">${esc(c.title)}</h3>
    ${c.intro ? `<p class="case-intro">${esc(c.intro)}</p>` : ""}
    <div class="case-stats">${(c.stats || []).map(x => `<div class="fstep"><div class="fnum">${esc(x.n)}</div><div class="flabel">${esc(x.label)}</div></div>`).join("")}</div>
    ${story.length ? `<div class="qa">${story.map(x => `<article class="qa-card"><h4>${esc(x.q)}</h4><p>${esc(x.a)}</p></article>`).join("")}</div>` : ""}
    ${story.length < 2 && showTodo() ? `<div class="case-todo">${todoCard(story.length ? "Add more of the story" : "Tell the growth story behind these numbers", story.length ? prompts.slice(1) : prompts)}</div>` : ""}`;
}

/* ---------- edit-mode helpers: today panel, Hinglish test runner, video script ---------- */

const ymdKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const firstName = n => (n || "").trim().split(/\s+/)[0] || "there";
const DAILY_LIMIT = 4;

function followUpText(c) {
  const hi = ["Hinglish", "Hindi"].includes(c.language), me = state.profile.name;
  return hi
    ? `Hi ${firstName(c.name)}! Bas ek chhota follow-up, shayad pehla message dab gaya ho. Kya main 45 second ka demo bhej doon? Call se easy rahega.\n\n- ${me}`
    : `Hi ${firstName(c.name)}, a quick follow-up in case my first message got buried. Would a 45-second demo be easier than a call?\n\n${me}`;
}

function renderToday() {
  const el = $("#today");
  if (!EDIT) { el.innerHTML = ""; return; }
  const now = new Date(), key = ymdKey(now), sp = state.sprint;
  const sent = state.creators.filter(c => c.pitchedOn === key).length;
  const loggedToday = state.log.some(e => ymdKey(new Date(e.ts)) === key);
  const daysLeft = Math.max(0, Math.ceil((new Date(sp.end + "T23:59:59") - now) / 864e5));
  const due = state.creators.filter(c => c.status === "pitched" && c.pitchedOn && !hasReply(c) && (new Date(key) - new Date(c.pitchedOn)) / 864e5 >= 3);
  el.innerHTML = `<div class="today card"><h3 class="sub">Today</h3>
    <div class="today-stats">
      <div><b>${sent}/${DAILY_LIMIT}</b><span>messages sent${sent >= DAILY_LIMIT ? ". That's enough for today" : ""}</span></div>
      <div><b>${loggedToday ? "Yes" : "Not yet"}</b><span>voice log entry today</span></div>
      <div><b>${due.length}</b><span>follow-ups due</span></div>
      <div><b>${daysLeft}</b><span>days until submissions close</span></div>
    </div>
    ${due.length ? `<ul class="due">${due.map(c => `<li><span><b>${esc(c.name)}</b> on ${esc(c.platform)}, pitched ${fmtDate(c.pitchedOn)}</span><button class="btn ghost small" type="button" data-fu="${esc(c.id)}">Copy follow-up</button></li>`).join("")}</ul>` : `<p class="note">No follow-ups due. A follow-up is due 3 days after a message with no reply.</p>`}
  </div>`;
}
$("#today").addEventListener("click", async e => {
  const b = e.target.closest("[data-fu]"); if (!b) return;
  const c = state.creators.find(x => x.id === b.dataset.fu);
  try { await navigator.clipboard.writeText(followUpText(c)); toast("Follow-up copied"); } catch (err) { toast("Couldn't copy. Select the text manually."); }
});

/* Hinglish test runner */
const HL_PHRASES = ["Kal ki meeting ko reschedule kar dena", "Client ko ek follow up email bhej do", "Send me the PR description by evening", "Aaj ka standup skip karte hain", "Mera Next.js build fail ho gaya", "Iska API response kaafi slow hai", "Bhubaneswar mein kal baarish hogi", "Ye invoice kal tak clear kar dena", "Pehle login flow test karo phir deploy", "Please sync with Rohan about the Hinglish pitch", "Iss quarter ka OKR doc share kar do", "Mujhe Postgres ka index samajh nahi aaya", "Aap kal tak review kar sakte ho kya", "Deploy hone ke baad Slack pe ping kar dena", "Ye PR merge karne se pehle tests chala lo", "Sunday ko family function hai, Monday se start karte hain", "Wispr Flow se email likhna kaafi fast hai", "Budget ka sheet Priya ko forward kar do", "Ye feature Q4 mein ship karenge", "Mere ko thoda time chahiye, kal reply karta hoon"];
const hlNorm = t => String(t || "").toLowerCase().replace(/[-_]/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
function hlCompare(said, wrote) {
  if (!hlNorm(wrote)) return null;
  if (hlNorm(said) === hlNorm(wrote)) return { ok: true, note: "" };
  const a = hlNorm(said).split(" "), b = hlNorm(wrote).split(" ");
  const diffs = a.map((w, i) => (w !== b[i] ? `"${w}" became "${b[i] ?? "(nothing)"}"` : null)).filter(Boolean).slice(0, 3);
  if (b.length > a.length) diffs.push(`${b.length - a.length} extra word${b.length - a.length > 1 ? "s" : ""}`);
  return { ok: false, note: diffs.join(", ") };
}
function hlRunnerHtml() {
  const row = (said, custom) => `<div class="rn-row${custom ? " custom" : ""}">
    ${custom ? `<input class="in hl-said" placeholder="Your own phrase" aria-label="Your own phrase">` : `<span class="rn-said">${esc(said)}</span>`}
    <input class="in hl-in" ${custom ? "" : `data-said="${esc(said)}"`} placeholder="${custom ? "What Flow wrote" : "Click here, then say it with Flow"}" aria-label="What Flow wrote"><span class="rn-res"></span></div>`;
  return `<details class="runner card" id="hl-runner"><summary>Run the test yourself</summary><div class="runner-body">
    <p class="note">Say each phrase out loud with Wispr Flow into its box. It marks itself right or wrong and notes the words that changed. Add your own phrases at the bottom. Saving replaces the results on the page.</p>
    <div class="rn-list">${HL_PHRASES.map(p => row(p, false)).join("")}${row("", true)}${row("", true)}${row("", true)}</div>
    <div class="row-actions"><button class="btn accent" type="button" id="hl-save">Save results</button><span class="wc" id="hl-count">0 phrases filled</span></div></div></details>`;
}
function hlRowState(r) {
  const inp = r.querySelector(".hl-in");
  const said = inp.dataset.said ?? r.querySelector(".hl-said")?.value ?? "";
  const wrote = inp.value;
  return { said: said.trim(), wrote: wrote.trim(), result: said.trim() ? hlCompare(said, wrote) : null };
}
$("#hinglish-body").addEventListener("input", e => {
  const r = e.target.closest(".rn-row"); if (!r) return;
  const st = hlRowState(r.querySelector(".hl-in").parentElement);
  const res = r.querySelector(".rn-res");
  res.innerHTML = st.result ? `<span class="pill" data-s="${st.result.ok ? "talking" : "replied"}">${st.result.ok ? "Right" : "Needed a fix"}</span>${st.result.note ? `<small>${esc(st.result.note)}</small>` : ""}` : "";
  const n = $$("#hl-runner .rn-row").filter(x => hlRowState(x).result).length;
  $("#hl-count").textContent = `${n} phrase${n === 1 ? "" : "s"} filled`;
});
$("#hinglish-body").addEventListener("click", e => {
  if (e.target.id !== "hl-save") return;
  const runs = $$("#hl-runner .rn-row").map(hlRowState).filter(x => x.result).map(x => ({ said: x.said, wrote: x.wrote, ok: x.result.ok, ...(x.result.note ? { note: x.result.note } : {}) }));
  if (!runs.length) return toast("Fill in at least one phrase first");
  const had = (state.profile.hinglish?.runs || []).length;
  if (had && !confirm(`Replace the ${had} results on the page with these ${runs.length}?`)) return;
  state.profile.hinglish = { ...(state.profile.hinglish || {}), runs, takeaways: state.profile.prototype ? [] : (state.profile.hinglish?.takeaways || []) };
  save(); renderAll(); toast(`Saved ${runs.length} results. Now write your takeaways in data.js`);
});

/* Video script from your actual data */
function buildScript() {
  const p = state.profile, cs = state.creators, me = firstName(p.name);
  const pitched = cs.filter(wasPitched), replied = pitched.filter(hasReply), talking = cs.filter(c => ["talking", "won"].includes(c.status));
  const rank = { won: 3, talking: 2, replied: 1 };
  const withMsg = cs.filter(c => c.message && c.message.trim());
  const worked = withMsg.filter(c => rank[c.status]).sort((a, b) => rank[b.status] - rank[a.status] || scoreCreator(b).total - scoreCreator(a).total)[0];
  const flop = withMsg.filter(c => c.status === "passed" && !hasReply(c)).sort((a, b) => (b.lesson ? 1 : 0) - (a.lesson ? 1 : 0) || scoreCreator(b).total - scoreCreator(a).total)[0];
  const words = state.log.reduce((t, e) => t + wordCount(e.raw), 0), days = new Set(state.log.map(e => ymdKey(new Date(e.ts)))).size;
  const mistake = [...state.log].filter(e => e.kind === "mistake").sort((a, b) => (b.takeaway || "").length - (a.takeaway || "").length)[0];
  const runs = p.hinglish?.runs || [], pct = runs.length ? Math.round(runs.filter(r => r.ok).length / runs.length * 100) : null;
  const built = (p.built || [])[0], plan = p.plan || [];
  const rate = pitched.length ? Math.round(replied.length / pitched.length * 100) : 0;
  const lines = [
    p.prototype ? "NOTE: the numbers below come from SAMPLE data. Replace the data with your real results before you record.\n" : "",
    "0:00 to 0:25   Who I am (face to camera)",
    `"Hi, I'm ${p.name}, a CS student from ${(p.city || "").split(",")[0] || "India"}. ${built ? `I build things people use, like ${built.name}: ${built.line.replace(/\.$/, "").replace(/^./, ch => ch.toLowerCase())}.` : ""} Instead of sending a résumé, I spent this week doing the job: pitching real creators on Wispr Flow."`,
    "",
    "0:25 to 1:15   What I did (screen: the funnel, then the ledger)",
    `"I found ${cs.length} creators, scored each one with a tool I built, and messaged ${pitched.length}. ${replied.length} replied, that's ${rate}%, and ${talking.length} are open to working together."`,
    worked ? `"The message that worked was to ${worked.name}. It named one specific moment from their content and made a small ask." [Show the thread.]` : "[Pick your best thread and show it.]",
    flop ? `"The one that didn't was ${flop.name}. ${flop.lesson || "[What you learned from it.]"}"` : "",
    "",
    "1:15 to 2:00   What voice changed (screen: the voice log, raw dictation highlighted)",
    `"I dictated ${words} words across ${days} days. [Say one real thing that changed: what got faster, or what you noticed about how you think when you talk instead of type.]"`,
    pct != null ? `"I also tested ${runs.length} Hinglish phrases. ${pct}% came out right, and the misses were [name the real ones]."` : "[Run the Hinglish test and add its result here.]",
    "",
    "2:00 to 2:30   What I got wrong",
    mistake ? `"${mistake.title}. ${mistake.takeaway || ""}"` : "[Pick your best real mistake and what you changed.]",
    "",
    "2:30 to 3:00   What I'd do next",
    plan.length ? `"In month one I'd ${plan[0].title.toLowerCase()}${plan[1] ? `, then ${plan[1].title.toLowerCase()}` : ""}. ${p.startDate ? `I can start ${p.startDate.toLowerCase()}` : "[Your start date]"}${p.relocation ? ` and ${p.relocation.toLowerCase().replace(/^yes, i can/, "I can")}` : ""}."` : "[Your plan for the first month.]",
    "",
    `(Spoken at a normal pace this is roughly 2 minutes 45 seconds. Keep it under 3:00 and don't read it word for word.)`
  ];
  return lines.filter((l, i) => l !== "" || lines[i - 1] !== "").join("\n");
}
function openScript() {
  const dlg = $("#dlg");
  dlg.innerHTML = `<form method="dialog" class="dlg"><div><h3>Your 3-minute video script</h3><div class="meta">Built from your current data. Rewrite it in your own voice.</div></div>
    <textarea class="in" id="script-text" rows="18" aria-label="Video script">${esc(buildScript())}</textarea>
    <div class="row-actions"><button class="btn accent" type="button" data-act="copy-script">Copy</button><button class="btn ghost" type="button" data-act="close">Close</button></div></form>`;
  dlg.showModal();
}
$("#dlg").addEventListener("click", async e => {
  if (e.target.dataset?.act !== "copy-script") return;
  const t = $("#script-text");
  try { await navigator.clipboard.writeText(t.value); toast("Copied"); } catch (err) { t.select(); }
});

/* ---------- hero life: characters, spoken quotes ---------- */

let typingTimer;
function startSaid() {
  const bar = $("#flowbar"), el = $("#said");
  clearTimeout(typingTimer);
  const chunk = t => { t = t.replace(/\s+/g, " ").trim(); if (t.length <= 118) return t; const c = t.slice(0, 118); return c.slice(0, c.lastIndexOf(" ")) + "…"; };
  const quotes = [...state.log].filter(e => e.raw).sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 4).map(e => `“${chunk(e.raw)}”`);
  if (!quotes.length) { bar.hidden = true; return; }
  bar.hidden = false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = quotes[0]; bar.classList.add("still"); return; }
  let qi = 0, ci = 0;
  const tick = () => {
    const q = quotes[qi];
    if (ci <= q.length) { el.textContent = q.slice(0, ci++); typingTimer = setTimeout(tick, 26); }
    else typingTimer = setTimeout(() => { qi = (qi + 1) % quotes.length; ci = 0; tick(); }, 2800);
  };
  tick();
}
function drawCharacters() { $$(".char").forEach(el => { el.innerHTML = charMarkup(el.dataset.shirt, el.dataset.hair, el.dataset.lens); }); }

/* ---------- scorer examples ---------- */

const PRESETS = [
  ["Great fit: Hinglish coding tutorials", { niche: "Coding / dev", language: "Hinglish", contentType: "Tutorials / workflows", platform: "YouTube", followers: 150000, avgViews: 35000, comments: 140, price: 8000, risk: 0 }],
  ["Big but wrong: gaming channel", { niche: "Gaming / entertainment", language: "Hinglish", contentType: "Entertainment / skits", platform: "YouTube", followers: 900000, avgViews: 65000, comments: 250, price: 90000, risk: 0 }],
  ["Good niche, too expensive", { niche: "Productivity / workflow", language: "English", contentType: "Tutorials / workflows", platform: "Instagram", followers: 300000, avgViews: 30000, comments: 110, price: 120000, risk: 0 }],
  ["Promotes a competitor", { niche: "Writing / journalism / newsletters", language: "English", contentType: "Tool reviews", platform: "X", followers: 80000, avgViews: 12000, comments: 50, price: 10000, risk: -20 }]
];
function buildPresets() {
  $("#presets").innerHTML = `<span>Try an example:</span>` + PRESETS.map(([l], i) => `<button class="chip" type="button" data-i="${i}">${esc(l)}</button>`).join("");
}
$("#presets").addEventListener("click", e => {
  const b = e.target.closest("[data-i]"); if (!b) return;
  F = { ...F, ...PRESETS[+b.dataset.i][1], name: "Example creator", handle: "@example", editingId: null, touched: true };
  syncForm(); renderResult();
});

/* ---------- voice input for the log (browser speech recognition) ---------- */

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function setupMic() {
  const btn = $("#mic"), ta = $("#log-form textarea[name=raw]");
  if (!btn || !ta) return;
  if (!SR) { btn.hidden = true; return; }
  let rec = null;
  btn.addEventListener("click", () => {
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = "en-IN"; rec.continuous = true; rec.interimResults = false;
    rec.onresult = ev => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) ta.value += (ta.value && !/\s$/.test(ta.value) ? " " : "") + ev.results[i][0].transcript.trim();
      }
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    };
    rec.onerror = () => toast("Couldn't hear anything. Check the microphone permission.");
    rec.onend = () => { rec = null; btn.textContent = "Dictate here"; btn.classList.remove("on"); };
    rec.start(); btn.textContent = "Stop"; btn.classList.add("on");
  });
}

/* ---------- nav highlight ---------- */

function setupSpy() {
  const links = $$('.top nav a[href^="#"]');
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) links.forEach(a => {
      if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  $$("main section[id]").forEach(sec => io.observe(sec));
}

/* ---------- submission checklist (edit mode only) ---------- */

function checklistItems() {
  const p = state.profile, cs = state.creators, pitched = cs.filter(wasPitched);
  const real = !p.prototype;
  const days = new Set(state.log.map(e => dayKey(e.ts))).size;
  const goal = Math.ceil(state.sprint.target * 0.75);
  const auto = [
    ["Sample data replaced with real data", real],
    ["Profile filled in: name, two or more About paragraphs, and a link", real && !!p.name && p.about.length >= 2 && !!(p.linkedin || p.email)],
    [`${goal}+ creators found and scored`, real && cs.length >= goal],
    ["8+ creators pitched, each with the message saved", real && pitched.length >= 8 && pitched.every(c => c.message && c.message.trim())],
    ["At least one reply logged with a lesson", real && cs.some(c => hasReply(c) && c.lesson && c.lesson.trim())],
    ["Voice log entries on 5 or more different days", real && days >= 5],
    ["Two or more mistakes written down", real && state.log.filter(e => e.kind === "mistake").length >= 2],
    ["First-month plan written", real && (p.plan || []).length >= 3],
    ["Start date and Bangalore answer added", real && !!p.startDate && !!p.relocation],
    ["Hinglish test with 10 or more phrases", real && (p.hinglish?.runs || []).length >= 10],
    ["iters.live growth story written", real && (p.casestudy?.story || []).length >= 2],
    ["Your own post published, with its numbers", real && !!(p.post && p.post.url)],
    ["Screen recording of you using Flow added", real && (p.videos || []).length >= 1]
  ].map(([label, done]) => ({ label, done }));
  const checks = state.checks || {};
  const manual = [
    ["rebuilt", "Rebuilt on Emergent, and the link is public"],
    ["video", "3-minute video recorded"],
    ["setup", "$3,000 setup pick written"],
    ["quotes", "Creators OK'd being quoted by name"],
    ["submit", "Form submitted with the same email as your Flow account"]
  ].map(([k, label]) => ({ k, label, done: !!checks[k] }));
  return [...auto, ...manual];
}
function updateChecklistCount() {
  const b = $("#checklist"); if (!b) return;
  const items = checklistItems();
  b.textContent = `Checklist ${items.filter(i => i.done).length}/${items.length}`;
}
function openChecklist() {
  const items = checklistItems(), dlg = $("#dlg");
  dlg.innerHTML = `<form method="dialog" class="dlg">
    <div><h3>Before you submit</h3><div class="meta">${items.filter(i => i.done).length} of ${items.length} done. The first eight tick themselves from your data.</div></div>
    <ul class="checks">${items.map(i => i.k
      ? `<li><label><input type="checkbox" data-check="${i.k}"${i.done ? " checked" : ""}> ${esc(i.label)}</label></li>`
      : `<li class="${i.done ? "done" : ""}"><span class="mark" aria-hidden="true">${i.done ? "✓" : ""}</span> ${esc(i.label)}<span class="sr"> ${i.done ? "(done)" : "(not yet)"}</span></li>`).join("")}</ul>
    <div class="row-actions"><button class="btn ghost" type="button" data-act="close">Close</button></div></form>`;
  dlg.showModal();
}
$("#dlg").addEventListener("change", e => {
  const k = e.target.dataset?.check; if (!k) return;
  state.checks = { ...(state.checks || {}), [k]: e.target.checked };
  save(); updateChecklistCount(); openChecklist();
});

function renderEditBar() {
  const bar = $("#editbar");
  if (!EDIT) return;
  bar.hidden = false;
  bar.innerHTML = `<span>Edit mode. Only you see this bar. Changes live in this browser until you export.</span>
    <button class="btn" type="button" id="checklist">Checklist</button>
    <button class="btn" type="button" id="script">Video script</button>
    <button class="btn" type="button" id="export">Export data.js</button>
    <button class="btn ghost" type="button" id="reset">Discard local changes</button>`;
  $("#checklist").onclick = openChecklist;
  $("#script").onclick = openScript;
  $("#export").onclick = () => {
    const blob = new Blob([`window.SITE_DATA = ${JSON.stringify(state, null, 2)};\n`], { type: "text/javascript" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "data.js"; a.click();
    toast("Replace data.js with this file and redeploy");
  };
  $("#reset").onclick = () => { if (confirm("Discard everything you changed in this browser?")) { localStorage.removeItem(STORE); location.reload(); } };
}

function renderAll() { renderHero(); renderDays(); renderFeatured(); renderLedger(); renderInsights(); renderComposer(); renderTimeline(); renderToday(); renderQuotes(); renderMyPost(); renderVideos(); renderHinglish(); renderPlan(); renderExperiments(); renderBrief(); renderAbout(); renderCaseStudy(); renderResult(); startSaid(); updateChecklistCount(); }

function init() {
  state = loadState();
  state.profile.about ||= []; state.profile.mistakes ||= [];
  $("#demo-banner").hidden = !state.profile.prototype;
  drawCharacters(); buildScorerForm(); buildModel(); buildPresets(); renderTools(); renderEditBar(); renderAll(); setupSpy();
}

init();
})();
