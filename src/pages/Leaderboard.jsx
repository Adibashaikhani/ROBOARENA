// src/pages/Leaderboard.jsx
import React, { useMemo, useRef, useState } from "react";
import Card from "../components/Card";
import { listMatches } from "../api";
import { DEFAULT_POLL_MS } from "../config";
import BackButton from "../components/BackButton";

/* ================= UTIL ================= */

function norm(v) {
  return String(v || "").trim().toLowerCase();
}
function isCompleted(m) {
  return norm(m.status) === "completed";
}
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMatchName(id) {
  const raw = String(id || "").toLowerCase().trim();
  if (!raw) return "Match";

  if (raw === "f") return "Final";
  if (raw === "tp") return "3rd Position Match";

  if (raw.startsWith("qf"))
    return `Quarterfinal ${raw.replace("qf", "")}`;

  if (raw.startsWith("sf"))
    return `Semifinal ${raw.replace("sf", "")}`;

  if (raw.startsWith("q"))
    return `Qualifier ${raw.replace("q", "")}`;

  return id;
}

function splitAllianceNames(allianceStr) {
  const s = String(allianceStr || "").trim();
  if (!s) return ["Team 1", "Team 2"];
  const parts = s.includes(" + ")
    ? s.split(" + ")
    : s.split("+").map((x) => x.trim());
  return [(parts[0] || "Team 1").trim(), (parts[1] || "Team 2").trim()];
}

/* ================= TEAM TOTAL MP ================= */

function computeTeamMP(allMatches) {
  const completed = (allMatches || []).filter(isCompleted);
  const map = new Map();

  for (const m of completed) {
    map.set(m.alliance1, {
      team: m.alliance1,
      mp: toNum(m.score1),
      side: "Team Black",
      matchName: formatMatchName(m.match_id),
    });

    map.set(m.alliance2, {
      team: m.alliance2,
      mp: toNum(m.score2),
      side: "Team White",
      matchName: formatMatchName(m.match_id),
    });
  }

  const rows = Array.from(map.values());

  rows.sort((a, b) => {
    if (b.mp !== a.mp) return b.mp - a.mp;
    return a.team.localeCompare(b.team);
  });

  return { rows, completedCount: completed.length };
}

/* ================= INDIVIDUAL ================= */

function computeIndividualTotals(allMatches) {
  const completed = (allMatches || []).filter(isCompleted);
  const map = new Map();

  for (const m of completed) {
    const [b1, b2] = splitAllianceNames(m.alliance1);
    const [w1, w2] = splitAllianceNames(m.alliance2);

    map.set(b1, { name: b1, total: toNum(m.black_team1_score) });
    map.set(b2, { name: b2, total: toNum(m.black_team2_score) });
    map.set(w1, { name: w1, total: toNum(m.white_team1_score) });
    map.set(w2, { name: w2, total: toNum(m.white_team2_score) });
  }

  const rows = Array.from(map.values());

  rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.name.localeCompare(b.name);
  });

  return { rows, completedCount: completed.length };
}

/* ================= KNOCKOUT ================= */

function computeKnockoutRanking(allMatches) {
  const completed = (allMatches || []).filter(isCompleted);
  const rows = [];

  function pushMatch(m, stageLabel, priority) {
    rows.push({
      team: m.alliance1,
      mp: toNum(m.score1),
      side: "Team Black",
      matchName: `${stageLabel} (${m.match_id})`,
      priority,
    });

    rows.push({
      team: m.alliance2,
      mp: toNum(m.score2),
      side: "Team White",
      matchName: `${stageLabel} (${m.match_id})`,
      priority,
    });
  }

  completed.forEach(m => {
    if (m.match_id === "F") {
      pushMatch(m, "Final", 4);
    } else if (m.match_id === "TP") {
      pushMatch(m, "3rd Place Match", 3);
    } else if (m.stage === "Semifinals") {
      pushMatch(m, "Semifinal", 2);
    } else if (m.stage === "Quarterfinals") {
      pushMatch(m, "Quarterfinal", 1);
    }
  });

  rows.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.mp !== a.mp) return b.mp - a.mp;
    return a.team.localeCompare(b.team);
  });

  return rows;
}

/* ================= TAB BUTTON ================= */

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full text-sm font-semibold transition border",
        active
          ? "bg-brand-blue text-white border-brand-blue shadow-soft"
          : "bg-white border-brand-line text-brand-text hover:bg-brand-blueSoft",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ================= RANK CARD ================= */

/* ================= RANK CARD ================= */

function RankRowCard({ rank, title, rightTop, teamSide, matchName }) {
  let accent = "bg-slate-400";
  let bg = "bg-white";
  let medal = null;

  if (rank === 1) {
  accent = "bg-emerald-500";
  bg = "bg-emerald-200";
  medal = "🥇";
} else if (rank === 2) {
  accent = "bg-blue-500";
  bg = "bg-blue-200";
  medal = "🥈";
} else if (rank === 3) {
  accent = "bg-orange-500";
  bg = "bg-orange-200";
  medal = "🥉";
} else if (rank <= 8) {
  accent = "bg-sky-400";
  bg = "bg-sky-50/40";
}


  return (
    <div className={`relative rounded-2xl border shadow-soft overflow-hidden ${bg}`}>
      
      {/* LEFT ACCENT BAR */}
      <div className={`absolute left-0 top-0 h-full w-1.5 ${accent}`} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 md:px-5 py-4 pl-6 md:pl-7">


        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-0">

          {/* RANK */}
          <div className="text-3xl md:text-4xl font-black w-10 text-center shrink-0">
            {rank}
          </div>

          {/* TEAM */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-extrabold truncate">
              {medal && <span className="text-lg md:text-xl">{medal}</span>}
              <span className="tracking-wide text-xl md:text-3xl truncate">
                TEAM <span className="font-black">{title}</span>
              </span>
            </div>



            {teamSide && (
              <div className="text-sm md:text-lg font-semibold text-gray-600 mt-0.5">
                {teamSide === "Team Black" ? "⬛ Team Black" : "⬜ Team White"}
              </div>
            )}

            {matchName && (
              <div className="text-sm md:text-lg font-bold text-gray-500">
                {matchName}
              </div>
            )}
          </div>
        </div>

        {/* SCORE */}
        <div className="text-left md:text-right">
          <div className="text-2xl md:text-4xl font-black">
            {rightTop}
          </div>
          <div className="text-xs md:text-sm text-gray-500">
            Match Points
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= KNOCKOUT CARD ================= */
function KnockoutMatchCard({ match, index }) {
  const blackScore = toNum(match.score1);
  const whiteScore = toNum(match.score2);

  const winner =
    blackScore === whiteScore
      ? "DRAW"
      : blackScore > whiteScore
      ? "BLACK"
      : "WHITE";

  const [open, setOpen] = React.useState(false);
  const isFinal = match.stage === "Finals";

  const winnerStyle =
    "scale-105 shadow-xl ring-2 ring-emerald-300";
  const loserStyle =
    "opacity-70 scale-[0.98]";

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={`
          relative cursor-pointer rounded-2xl overflow-hidden
          bg-white shadow-md hover:shadow-lg
          transition-all duration-500 hover:scale-[1.01]
          border border-gray-100
          ${isFinal ? "ring-2 ring-yellow-300 shadow-yellow-200/30" : ""}
        `}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 via-blue-300 to-emerald-300" />

        <div className="relative px-6 py-6 space-y-5">
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {/* Match number badge */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">{index + 1}</span>
              </div>

              {/* Match info */}
              <div className="flex flex-col gap-0.5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {match.stage || "Knockout Round"}
                </div>
                <div className="text-xl font-bold text-gray-700">
                  🏟 {formatMatchName(match.match_id)}
                </div>
              </div>
            </div>
            
            {isFinal && (
              <div className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-yellow-300 to-amber-400 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">👑</span>
                  <span className="text-xs font-bold text-white uppercase">Finals</span>
                </div>
              </div>
            )}
          </div>

          {/* VERSUS INDICATOR */}
          <div className="flex items-center justify-center -my-2">
            <div className="px-6 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 shadow-sm">
              <span className="text-xs font-bold text-white uppercase tracking-wide">VS</span>
            </div>
          </div>

          {/* TEAMS */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* BLACK TEAM - Emerald */}
            <div
              className={`
                relative rounded-xl px-5 py-5 transition-all duration-700
                ${winner === "BLACK" ? winnerStyle : loserStyle}
                bg-emerald-100
                border border-emerald-200
                overflow-hidden
              `}
            >
              {winner === "BLACK" && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/40 to-transparent animate-pulse-slow" />
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                    <span className="text-2xl">🏆</span>
                  </div>
                </>
              )}
              
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
                    <span className="text-xl">⬛</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Team</div>
                    <div className="text-xl font-bold text-emerald-800">
                      {match.alliance1}
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="text-5xl font-bold text-emerald-700 leading-none">
                    {blackScore}
                  </div>
                  <div className="pb-2 text-xs font-semibold text-emerald-600 uppercase">
                    Points
                  </div>
                </div>
              </div>
            </div>

            {/* WHITE TEAM - Blue */}
            <div
              className={`
                relative rounded-xl px-5 py-5 transition-all duration-700
                ${winner === "WHITE" ? winnerStyle : loserStyle}
                bg-blue-100
                border border-blue-200
                overflow-hidden
              `}
            >
              {winner === "WHITE" && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-transparent animate-pulse-slow" />
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                    <span className="text-2xl">🏆</span>
                  </div>
                </>
              )}
              
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                    <span className="text-xl">⬜</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Team</div>
                    <div className="text-xl font-bold text-blue-800">
                      {match.alliance2}
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="text-5xl font-bold text-blue-700 leading-none">
                    {whiteScore}
                  </div>
                  <div className="pb-2 text-xs font-semibold text-blue-600 uppercase">
                    Points
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DRAW INDICATOR */}
          {winner === "DRAW" && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50 border border-gray-200 px-6 py-4">
              <div className="relative flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-300 to-blue-400 flex items-center justify-center shadow-sm">
                  <span className="text-xl">🤝</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Match Drawn
                </span>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Knockout Stage
              </span>
            </div>
            <div className="group flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-lg hover:shadow-md transition-all">
              <span className="text-xs font-bold text-white">View Stats</span>
              <svg className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <KnockoutMatchModal
          match={match}
          onClose={() => setOpen(false)}
        />
      )}

      <style>
        {`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg);
            }
            50% { 
              transform: translateY(-10px) rotate(5deg);
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% { 
              opacity: 0.2;
            }
            50% { 
              opacity: 0.5;
            }
          }
          
          .animate-float {
            animation: float 2.5s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}
      </style>
    </>
  );
}
/* ================= KNOCKOUT MODAL ================= */

function KnockoutMatchModal({ match, onClose }) {
  const blackScore = toNum(match.score1);
  const whiteScore = toNum(match.score2);

  const winner =
    blackScore === whiteScore
      ? "DRAW"
      : blackScore > whiteScore
      ? "BLACK"
      : "WHITE";

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-400 to-blue-400 px-6 py-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 via-blue-300 to-emerald-300" />
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                {match.stage || "Knockout Round"}
              </div>
              <h2 className="text-2xl font-bold text-white">
                🏟 {formatMatchName(match.match_id)}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* VS Indicator */}
          <div className="flex items-center justify-center -my-2">
            <div className="px-6 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 shadow-sm">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Match Details</span>
            </div>
          </div>

          {/* BLACK TEAM */}
          <div className={`
            relative rounded-xl p-5 border-2 transition-all
            ${winner === "BLACK" ? "bg-emerald-100 border-emerald-300 shadow-lg scale-[1.02]" : "bg-emerald-50 border-emerald-200"}
          `}>
            {winner === "BLACK" && (
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
                  <span className="text-2xl">⬛</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Team</div>
                  <h3 className="text-2xl font-bold text-emerald-800">
                    {match.alliance1}
                  </h3>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-5xl font-bold text-emerald-700 leading-none">
                  {blackScore}
                </div>
                <div className="text-xs font-semibold text-emerald-600 uppercase mt-1">
                  Match Points
                </div>
              </div>
            </div>
          </div>

          {/* WHITE TEAM */}
          <div className={`
            relative rounded-xl p-5 border-2 transition-all
            ${winner === "WHITE" ? "bg-blue-100 border-blue-300 shadow-lg scale-[1.02]" : "bg-blue-50 border-blue-200"}
          `}>
            {winner === "WHITE" && (
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                  <span className="text-2xl">⬜</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Team</div>
                  <h3 className="text-2xl font-bold text-blue-800">
                    {match.alliance2}
                  </h3>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-5xl font-bold text-blue-700 leading-none">
                  {whiteScore}
                </div>
                <div className="text-xs font-semibold text-blue-600 uppercase mt-1">
                  Match Points
                </div>
              </div>
            </div>
          </div>

          {/* DRAW INDICATOR */}
          {winner === "DRAW" && (
            <div className="rounded-xl bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50 border-2 border-gray-200 px-6 py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-300 to-blue-400 flex items-center justify-center shadow-sm">
                  <span className="text-xl">🤝</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Match Drawn
                </span>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white py-3 font-bold transition-all shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/* ================= MAIN ================= */

export default function Leaderboard() {
  const [tab, setTab] = useState("team");
  const [matches, setMatches] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [err, setErr] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;

    async function poll() {
      try {
        setErr("");
        const all = await listMatches();

        if (!mountedRef.current) return;
        setMatches(Array.isArray(all) ? all : []);
        setLastUpdated(new Date());
        if (firstLoad) setFirstLoad(false);
      } catch (e) {
        if (!mountedRef.current) return;
        setErr(e?.message || "Failed to load leaderboard");
        if (firstLoad) setFirstLoad(false);
      } finally {
        timerRef.current = setTimeout(poll, DEFAULT_POLL_MS);
      }
    }

    poll();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const teamData = useMemo(() => computeTeamMP(matches), [matches]);
  const individualData = useMemo(() => computeIndividualTotals(matches), [matches]);
  const knockoutData = useMemo(() => computeKnockoutRanking(matches), [matches]);

  const subtitle = firstLoad
    ? "Loading leaderboard…"
    : `Auto-updates every few seconds${
        lastUpdated ? ` • Last updated: ${lastUpdated.toLocaleTimeString()}` : ""
      }`;

  return (
    <div className="space-y-6">
      <BackButton to="/" />

      <Card title="Leaderboard" subtitle={subtitle}>
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "team"} onClick={() => setTab("team")}>
            Team Scores
          </TabButton>
          <TabButton active={tab === "individual"} onClick={() => setTab("individual")}>
            Individual Scores
          </TabButton>
          <TabButton active={tab === "knockout"} onClick={() => setTab("knockout")}>
            Knockouts
          </TabButton>
        </div>

        {err && <div className="mt-4 text-sm text-red-500">{err}</div>}

        {firstLoad ? (
          <div className="mt-4 text-sm text-brand-muted">Loading…</div>
        ) : (
          <div className="mt-4 space-y-4">
            {tab === "team" &&
              teamData.rows.map((r, idx) => (
                <RankRowCard
                  key={r.team}
                  rank={idx + 1}
                  title={r.team}
                  rightTop={
                    <>
                      {r.mp}
                      <span className="text-2xl md:text-3xl font-extrabold">
                        {" "}
                        MP
                      </span>
                    </>
                  }
                  teamSide={r.side}
                  matchName={r.matchName}
                />
              ))}

            {tab === "individual" &&
              individualData.rows.map((r, idx) => (
                <RankRowCard
                  key={r.name}
                  rank={idx + 1}
                  title={r.name}
                  rightTop={r.total}
                />
              ))}

            {tab === "knockout" &&
  matches
    .filter(isCompleted)
    .filter(m =>
      ["Quarterfinals", "Semifinals", "Finals"].includes(m.stage)
    )
    .map((m, idx) => (
      <KnockoutMatchCard
        key={m.match_id}
        match={m}
        index={idx}
      />
    ))}

          </div>
        )}
      </Card>
    </div>
  );
}
