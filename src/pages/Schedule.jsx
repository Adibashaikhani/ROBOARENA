// src/pages/Schedule.jsx
import React, { useMemo } from "react";
import Card from "../components/Card";
import { useMatches } from "../hooks/useMatches";
import BackButton from "../components/BackButton";

/* ✅ Added Third Place stage */
const STAGES = [
  "Qualifiers",
  "Quarterfinals",
  "Semifinals",
  "Third Place",
  "Finals"
  
];

function norm(v) {
  return String(v || "").trim().toLowerCase();
}

function cleanScore(v) {
  const s = String(v ?? "").trim();
  const u = s.toUpperCase();
  if (!s || ["#NUM!", "#VALUE!", "#REF!", "#DIV/0!"].includes(u)) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function StatusPill({ status }) {
  const s = norm(status);

  if (s === "completed") return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
      Completed
    </span>
  );
  if (s === "live") return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-yellowSoft text-amber-800 border border-amber-200">
      Live
    </span>
  );
  if (s === "scheduled") return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-blueSoft text-sky-700 border border-sky-200">
      Scheduled
    </span>
  );
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
      TBD
    </span>
  );
}

export default function Schedule() {
  const [stage, setStage] = React.useState(STAGES[0]);
  const { matches, loading, error } = useMatches();

  const stageMatches = useMemo(() => {
  const s = stage.trim().toLowerCase();

  return (matches || [])
    .filter(
      (m) => String(m.stage || "").trim().toLowerCase() === s
    )
    // ✅ FORCE STABLE SCHEDULE ORDER
    .sort((a, b) => {
      // 1️⃣ sort by scheduled time
      if (a.time && b.time) {
        return String(a.time).localeCompare(String(b.time));
      }
      // 2️⃣ fallback: match id (Q1, Q2, Q10 handled)
      return String(a.match_id).localeCompare(
        String(b.match_id),
        undefined,
        { numeric: true }
      );
    });
}, [matches, stage]);


  return (
    <div className="space-y-6">
      <BackButton to="/" />

      <Card
        title="Match Schedule"
        subtitle={loading ? "Loading matches…" : "Auto updates every few seconds"}
      >
        {/* Stage Tabs */}
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => {
            const active = s === stage;
            return (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={[
                  "px-4 py-2 rounded-full text-sm font-medium transition border",
                  active
                    ? "bg-brand-blue text-white border-brand-blue shadow-soft"
                    : "bg-white border-brand-line text-brand-text hover:bg-brand-blueSoft",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>

        {error ? <div className="mt-4 text-sm text-red-500">{error}</div> : null}

        <div className="mt-5 overflow-auto rounded-xl2 border border-brand-line bg-white">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-brand-blueSoft">
              <tr className="text-left text-brand-muted">
                <th className="p-3">Match</th>
                <th className="p-3">Team Black</th>
                <th className="p-3">Team White</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                {/* <th className="p-3">Winner</th> */}
                <th className="p-3">Time</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-brand-muted" colSpan={7}>
                    Loading matches…
                  </td>
                </tr>
              ) : stageMatches.length === 0 ? (
                <tr>
                  <td className="p-4 text-brand-muted" colSpan={7}>
                    No matches found for{" "}
                    <span className="text-brand-text font-medium">{stage}</span>.
                  </td>
                </tr>
              ) : (
                stageMatches.map((m) => (
                  <tr key={m.match_id} className="border-t border-brand-line">
                    <td className="p-3 font-semibold text-brand-text">
                      {m.match_id}
                    </td>
                    <td className="p-3">{m.alliance1}</td>
                    <td className="p-3">{m.alliance2}</td>
                    <td className="p-3 font-semibold text-brand-text">
                      {cleanScore(m.score1)} - {cleanScore(m.score2)}
                    </td>
                    <td className="p-3">
                      <StatusPill status={m.status} />
                    </td>
                    {/* <td className="p-3 text-brand-text">
  {m.winner?.trim() || "-"}
</td> */}

                    <td className="p-3 text-xs text-brand-muted">
  {m.time
    ? new Date(m.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
