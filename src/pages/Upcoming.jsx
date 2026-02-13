// src/pages/Upcoming.jsx
import React, { useMemo } from "react";
import Card from "../components/Card";
import { useMatches } from "../hooks/useMatches";
import BackButton from "../components/BackButton";

function norm(v) {
  return String(v || "").trim().toLowerCase();
}

function StatusPill({ status }) {
  const s = norm(status);

  if (s === "scheduled") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-blueSoft text-sky-700 border border-sky-200">
        Scheduled
      </span>
    );
  }
  if (s === "live") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-yellowSoft text-amber-800 border border-amber-200">
        Live
      </span>
    );
  }
  if (s === "completed") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        Completed
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
      TBD
    </span>
  );
}

export default function Upcoming() {
  const { matches, loading, error } = useMatches();

  const upcoming = useMemo(() => {
    return (matches || [])
      .filter((m) => norm(m.status) === "scheduled")
      .sort((a, b) => String(a.match_id).localeCompare(String(b.match_id)));
  }, [matches]);

  return (
    <div className="space-y-6">
      <BackButton to="/" />

      <Card
        title="Upcoming Matches"
        subtitle={loading ? "Loading…" : "Shows matches marked Scheduled by referee"}
      >
        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div className="mt-4 overflow-auto rounded-2xl border border-brand-line bg-white">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-brand-blueSoft">
              <tr className="text-left text-brand-muted">
                <th className="p-3">Match</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Team Black</th>
                <th className="p-3">Team White</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-brand-muted">
                    Loading upcoming matches…
                  </td>
                </tr>
              ) : upcoming.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-brand-muted">
                    No upcoming matches yet. Referee must set matches to <b>Scheduled</b>.
                  </td>
                </tr>
              ) : (
                upcoming.map((m) => (
                  <tr key={m.match_id} className="border-t border-brand-line">
                    <td className="p-3 font-semibold">{m.match_id}</td>
                    <td className="p-3">{m.stage}</td>
                    <td className="p-3">{m.alliance1}</td>
                    <td className="p-3">{m.alliance2}</td>
                    <td className="p-3"><StatusPill status={m.status} /></td>
                    <td className="p-3 text-xs text-brand-muted">{m.updated_at || "-"}</td>
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
