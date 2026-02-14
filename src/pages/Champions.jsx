import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import { listMatches } from "../api";
import Confetti from "react-confetti";

/* ================= UTIL ================= */

function normalize(v) {
  return String(v || "").trim().toLowerCase();
}

function getWinner(match) {
  const w = normalize(match.winner);
  if (w === "team black") return "BLACK";
  if (w === "team white") return "WHITE";
  return "DRAW";
}

function getAlliance(match, side) {
  return side === "BLACK" ? match.alliance1 : match.alliance2;
}

/* ================= RANK CARD ================= */

function PodiumCard({ rank, title, label, glow, showConfetti }) {
  return (
    <div className={`
      relative rounded-2xl border shadow-soft overflow-hidden
      ${glow}
    `}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black w-12 text-center">
            {rank}
          </div>

          <div>
            <div className="text-3xl font-black tracking-wide">
              🏆 TEAM {title}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">
              {label}
            </div>
          </div>
        </div>

        <div className="text-4xl">
          {rank === 1 && "🥇"}
          {rank === 2 && "🥈"}
          {rank === 3 && "🥉"}
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function Champions() {
  const [champion, setChampion] = useState(null);
  const [runnerUp, setRunnerUp] = useState(null);
  const [third, setThird] = useState(null);

  useEffect(() => {
    async function load() {
      const all = await listMatches();
      const completed = (all || []).filter(
        m => normalize(m.status) === "completed"
      );

      const finalMatch = completed.find(m => m.match_id === "F");
      const thirdMatch = completed.find(m => m.match_id === "TP");

      if (finalMatch) {
        const winner = getWinner(finalMatch);
        const loser = winner === "BLACK" ? "WHITE" : "BLACK";

        setChampion(getAlliance(finalMatch, winner));
        setRunnerUp(getAlliance(finalMatch, loser));
      }

      if (thirdMatch) {
        const winner = getWinner(thirdMatch);
        setThird(getAlliance(thirdMatch, winner));
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <BackButton to="/" />

      <Card
        title="Champions"
        subtitle="Final tournament standings"
      >
        {!champion ? (
          <div className="text-sm text-gray-500">
            Results not available yet.
          </div>
        ) : (
          <div className="space-y-6">

            {/* 🥇 Champion */}
            <PodiumCard
              rank={1}
              title={champion}
              label="Champion"
              glow="bg-gradient-to-r from-yellow-200 to-amber-300 ring-2 ring-yellow-400"
              showConfetti
            />

            {/* 🥈 Runner-up */}
            {runnerUp && (
              <PodiumCard
                rank={2}
                title={runnerUp}
                label="Runner-up"
                glow="bg-gradient-to-r from-gray-200 to-gray-300"
              />
            )}

            {/* 🥉 Third */}
            {third && (
              <PodiumCard
                rank={3}
                title={third}
                label="Third Place"
                glow="bg-gradient-to-r from-amber-200 to-orange-200"
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
