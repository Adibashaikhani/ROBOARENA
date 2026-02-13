// src/api.js
import { API_BASE } from "./config";

export async function listMatches(stage = "") {
  const qs = new URLSearchParams({ action: "listMatches" });
  if (stage) qs.set("stage", stage);

  const res = await fetch(`${API_BASE}?${qs.toString()}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to fetch matches");
  return data.matches || [];
}

export async function updateMatch(payload) {
  const body = new URLSearchParams({
    action: "updateMatch",
    pin: payload.pin,
    match_id: payload.match_id,
    status: payload.status,
  });

  const optional = [
    "score1",
    "score2",
    "black_team1_score",
    "black_team2_score",
    "white_team1_score",
    "white_team2_score",
  ];

  for (const k of optional) {
    const v = payload[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      body.set(k, String(v));
    }
  }

  // ✅ KEY: no headers (prevents OPTIONS / preflight)
  const res = await fetch(API_BASE, {
    method: "POST",
    body,
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to update match");
  return data;
}
