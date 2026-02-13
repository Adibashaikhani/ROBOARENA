import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import { listMatches } from "../api";
import Confetti from "react-confetti";

/* ================= UTIL ================= */

function normalize(v) {
  return String(v || "").replace(/\u00A0/g, " ").trim().toLowerCase();
}

function splitAllianceNames(allianceStr) {
  const s = String(allianceStr || "").trim();
  const parts = s.includes(" + ")
    ? s.split(" + ")
    : s.split("+").map(x => x.trim());
  return [parts[0] || "Player 1", parts[1] || "Player 2"];
}

/**
 * 🔒 SINGLE SOURCE OF TRUTH FOR WINNER
 * Uses sheet `winner` column FIRST
 * Falls back to scores ONLY if needed
 */
function getWinner(match) {
  const w = normalize(match.winner);

  if (w === "team black") return "BLACK";
  if (w === "team white") return "WHITE";
  if (w === "draw") return "DRAW";

  // fallback (should rarely run)
  const b = Number(match.score1 ?? 0);
  const w2 = Number(match.score2 ?? 0);
  if (b === w2) return "DRAW";
  return b > w2 ? "BLACK" : "WHITE";
}

function getWinnerAlliance(match) {
  const winner = getWinner(match);
  if (winner === "BLACK") return match.alliance1;
  if (winner === "WHITE") return match.alliance2;
  return "Draw";
}

/* ================= RANK ROW CARD ================= */

function RankRowCard({ rank, title, rightTop, teamSide, matchName }) {
  return (
    <div className="relative rounded-xl border border-blue-100 overflow-hidden shadow-md hover:shadow-lg transition-all bg-blue-50/30">
      <div className="absolute left-0 top-0 h-full w-1 bg-blue-300" />

      <div className="flex items-center justify-between px-5 py-4 pl-7">
        <div className="flex items-center gap-4 min-w-0">
          <div className="text-2xl font-bold w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500 text-white">
            {rank}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xl font-bold truncate">
              {teamSide && (
                <span className="text-lg">
                  {teamSide === "Team Black" ? "⬛" : "⬜"}
                </span>
              )}
              <span className="text-blue-900">
                TEAM {title}
              </span>
            </div>

            {matchName && (
              <div className="text-xs font-semibold text-gray-500 mt-0.5">
                {matchName}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold text-blue-700">
            {rightTop}
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase">
            Points
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function WinnerHistory() {
  const [matches, setMatches] = useState([]);
  const [openMatch, setOpenMatch] = useState(null);

  useEffect(() => {
    async function load() {
      const all = await listMatches();
      const completed = (all || []).filter(
        m => normalize(m.status) === "completed"
      );
      setMatches(completed);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <BackButton to="/" />

      <Card title="Winner History" subtitle="Tap a winner to view match result">
        {matches.length === 0 ? (
          <div className="text-sm text-gray-500">
            No completed matches yet.
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m, idx) => {
              const winner = getWinner(m);
              const alliance = getWinnerAlliance(m);

              const score =
                winner === "BLACK" ? m.score1 :
                winner === "WHITE" ? m.score2 :
                `${m.score1} - ${m.score2}`;

              return (
                <div
                  key={m.match_id}
                  onClick={() => setOpenMatch(m)}
                  className="cursor-pointer"
                >
                  <RankRowCard
                    rank={idx + 1}
                    title={alliance}
                    rightTop={score}
                    teamSide={
                      winner === "BLACK"
                        ? "Team Black"
                        : winner === "WHITE"
                        ? "Team White"
                        : null
                    }
                    matchName={`${m.stage} • ${m.match_id}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {openMatch && (
        <WinnerModal match={openMatch} onClose={() => setOpenMatch(null)} />
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function WinnerModal({ match, onClose }) {
  const [b1, b2] = splitAllianceNames(match.alliance1);
  const [w1, w2] = splitAllianceNames(match.alliance2);

  const blackTotal = Number(match.score1 ?? 0);
  const whiteTotal = Number(match.score2 ?? 0);
  const winner = getWinner(match);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Confetti recycle={false} numberOfPieces={450} />

      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-400 to-blue-400 px-6 py-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 via-blue-300 to-emerald-300" />
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                Match Result
              </div>
              <h2 className="text-2xl font-bold text-white">
                {match.stage}
              </h2>
              <div className="text-sm text-white/90 mt-1">
                Match {match.match_id}
              </div>
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
          {/* Team Blocks */}
          <TeamBlock
            title="⬛ Team Black"
            alliance={match.alliance1}
            players={[
              { name: b1, score: match.black_team1_score },
              { name: b2, score: match.black_team2_score },
            ]}
            total={blackTotal}
            isWinner={winner === "BLACK"}
            isBlack={true}
          />

          <TeamBlock
            title="⬜ Team White"
            alliance={match.alliance2}
            players={[
              { name: w1, score: match.white_team1_score },
              { name: w2, score: match.white_team2_score },
            ]}
            total={whiteTotal}
            isWinner={winner === "WHITE"}
            isBlack={false}
          />

          {/* Winner Card */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 text-center">
              {winner === "DRAW" ? "Final Result" : "🏆 Winner"}
            </div>
            <div className="relative rounded-xl border-2 border-amber-300 overflow-hidden shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400 to-yellow-500" />
              
              <div className="flex items-center justify-between px-5 py-5 pl-7">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏆</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xl font-bold truncate">
                      {winner !== "DRAW" && (
                        <span className="text-lg">
                          {winner === "BLACK" ? "⬛" : "⬜"}
                        </span>
                      )}
                      <span className="text-amber-900">
                        TEAM {getWinnerAlliance(match)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-amber-700 mt-0.5">
                      {winner === "DRAW" ? "Match Drawn" : "Victory"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-bold text-amber-700">
                    {winner === "BLACK"
                      ? blackTotal
                      : winner === "WHITE"
                      ? whiteTotal
                      : `${blackTotal} - ${whiteTotal}`}
                  </div>
                  <div className="text-xs font-semibold text-amber-600 uppercase">
                    Points
                  </div>
                </div>
              </div>
            </div>
          </div>

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

/* ================= TEAM BLOCK ================= */

function TeamBlock({ title, alliance, players, total, isWinner, isBlack }) {
  return (
    <div className={`
      relative rounded-xl p-5 border transition-all bg-blue-50/40 border-blue-100
      ${isWinner ? "shadow-md" : ""}
    `}>
      {isWinner && (
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xl">👑</span>
        </div>
      )}

      {/* TITLE */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center shadow-sm
          ${isBlack ? "bg-emerald-600" : "bg-blue-600"}
        `}>
          <span className="text-2xl">{isBlack ? "⬛" : "⬜"}</span>
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isBlack ? "text-emerald-800" : "text-blue-800"}`}>
            {isBlack ? "Team Black" : "Team White"}
          </h3>
          <div className={`text-sm font-semibold ${isBlack ? "text-emerald-600" : "text-blue-600"}`}>
            {alliance}
          </div>
        </div>
      </div>

      {/* PLAYERS */}
      <div className="space-y-2 mb-3">
        {players.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-base font-semibold px-3 py-2 rounded-lg bg-white/50"
          >
            <span className="text-gray-700">
              {p.name}
            </span>
            <span className="font-bold text-gray-800">
              {Number(p.score || 0)}
            </span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center pt-3 border-t-2 border-blue-200">
        <span className="text-lg font-bold text-gray-800">
          Total
        </span>
        <span className="text-3xl font-bold text-blue-700">
          {total}
        </span>
      </div>
    </div>
  );
}