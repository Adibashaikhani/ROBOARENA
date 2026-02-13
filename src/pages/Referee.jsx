import React from "react";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import { listMatches, updateMatch } from "../api";
import Confetti from "react-confetti";

const STAGES = ["Qualifiers", "Quarterfinals", "Semifinals", "Finals"];
const STATUSES = ["Scheduled", "Live", "Completed"]; // no TBD here

function normalize(v) {
  return String(v || "").replace(/\u00A0/g, " ").trim().toLowerCase();
}

function displayStatus(s) {
  const n = normalize(s);
  if (!n || n === "tbd") return "TBD";
  if (n === "scheduled") return "Scheduled";
  if (n === "live") return "Live";
  if (n === "completed") return "Completed";
  return "TBD";
}

function isOpenMatch(m) {
  return normalize(m.status) !== "completed";
}

function badSheetValueToEmpty(v) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  const u = s.toUpperCase();
  if (["#NUM!", "#VALUE!", "#REF!", "#DIV/0!"].includes(u)) return "";
  const n = Number(s);
  if (!Number.isFinite(n)) return "";
  return String(parseInt(String(n), 10));
}

function toIntSafe(v) {
  const raw = String(v ?? "").trim();
  if (raw === "") return null;
  const n = parseInt(raw.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function splitAllianceNames(allianceStr) {
  const s = String(allianceStr || "").trim();
  if (!s) return ["Team 1", "Team 2"];
  const parts = s.includes(" + ")
    ? s.split(" + ")
    : s.split("+").map((x) => x.trim());
  return [(parts[0] || "Team 1").trim(), (parts[1] || "Team 2").trim()];
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Referee() {
  const [pin, setPin] = React.useState("");
  const [stage, setStage] = React.useState(STAGES[0]);

  const [allMatches, setAllMatches] = React.useState([]);
  const [matchId, setMatchId] = React.useState("");
  const [status, setStatus] = React.useState("Scheduled");

  const [scoreBlack, setScoreBlack] = React.useState("");
  const [scoreWhite, setScoreWhite] = React.useState("");

  const [black1, setBlack1] = React.useState("");
  const [black2, setBlack2] = React.useState("");
  const [white1, setWhite1] = React.useState("");
  const [white2, setWhite2] = React.useState("");

  const [blackTeamNames, setBlackTeamNames] = React.useState(["Team 1", "Team 2"]);
  const [whiteTeamNames, setWhiteTeamNames] = React.useState(["Team 1", "Team 2"]);

  const [msg, setMsg] = React.useState("");
  const [err, setErr] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const [showWinner, setShowWinner] = React.useState(false);
  const [winnerData, setWinnerData] = React.useState(null);

  async function refreshMatches() {
    const m = await listMatches(stage);
    setAllMatches(Array.isArray(m) ? m : []);
  }

  React.useEffect(() => {
    refreshMatches();
  }, [stage]);

  const openMatches = React.useMemo(
    () => allMatches.filter(isOpenMatch),
    [allMatches]
  );

  const selectedMatch = React.useMemo(() => {
    if (!matchId) return null;
    return allMatches.find((m) => String(m.match_id) === String(matchId)) || null;
  }, [matchId, allMatches]);

  // ✅ KEY FIX: TBD → Scheduled automatically
  React.useEffect(() => {
    if (!selectedMatch) return;

    setStatus(normalize(selectedMatch.status) === "tbd"
      ? "Scheduled"
      : selectedMatch.status
    );

    setScoreBlack(badSheetValueToEmpty(selectedMatch.score1));
    setScoreWhite(badSheetValueToEmpty(selectedMatch.score2));

    setBlack1(badSheetValueToEmpty(selectedMatch.black_team1_score));
    setBlack2(badSheetValueToEmpty(selectedMatch.black_team2_score));
    setWhite1(badSheetValueToEmpty(selectedMatch.white_team1_score));
    setWhite2(badSheetValueToEmpty(selectedMatch.white_team2_score));

    setBlackTeamNames(splitAllianceNames(selectedMatch.alliance1));
    setWhiteTeamNames(splitAllianceNames(selectedMatch.alliance2));
  }, [selectedMatch]);

  React.useEffect(() => {
    if (black1 !== "" || black2 !== "")
      setScoreBlack(String((toIntSafe(black1) ?? 0) + (toIntSafe(black2) ?? 0)));
  }, [black1, black2]);

  React.useEffect(() => {
    if (white1 !== "" || white2 !== "")
      setScoreWhite(String((toIntSafe(white1) ?? 0) + (toIntSafe(white2) ?? 0)));
  }, [white1, white2]);

  function resetFormAfterMatch() {
    setMatchId("");
    setStatus("Scheduled");
    setScoreBlack("");
    setScoreWhite("");
    setBlack1("");
    setBlack2("");
    setWhite1("");
    setWhite2("");
    setMsg("");
  }

  async function onSave() {
    setMsg("");
    setErr("");

    try {
      if (!pin.trim()) throw new Error("Enter referee PIN");
      if (!matchId) throw new Error("Select a match");

      setSaving(true);

      let payload = { pin: pin.trim(), match_id: matchId, status };

      if (status === "Completed") {
        payload = {
          ...payload,
          score1: toIntSafe(scoreBlack),
          score2: toIntSafe(scoreWhite),
          black_team1_score: toIntSafe(black1),
          black_team2_score: toIntSafe(black2),
          white_team1_score: toIntSafe(white1),
          white_team2_score: toIntSafe(white2),
        };
      }

      const res = await updateMatch(payload);

      if (status === "Completed" && selectedMatch) {
        const tb = payload.score1;
        const tw = payload.score2;

        setWinnerData({
          winner: tb === tw ? "DRAW" : tb > tw ? "BLACK" : "WHITE",
          black: {
            alliance: selectedMatch.alliance1,
            players: [
              { name: blackTeamNames[0], score: payload.black_team1_score },
              { name: blackTeamNames[1], score: payload.black_team2_score },
            ],
            total: tb,
          },
          white: {
            alliance: selectedMatch.alliance2,
            players: [
              { name: whiteTeamNames[0], score: payload.white_team1_score },
              { name: whiteTeamNames[1], score: payload.white_team2_score },
            ],
            total: tw,
          },
        });

        setShowWinner(true);
      }

      setMsg("Update done ✅");
    } catch (e) {
      setErr(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <BackButton to="/" />

      {/* CARD LAYOUT — UNTOUCHED */}
      <Card title="Referee Panel" subtitle="PIN required • Updates go live immediately">
        <div className="grid md:grid-cols-2 gap-4">
          {/* LEFT */}
          <div className="space-y-3">
            <label className="text-xs text-brand-muted">Referee PIN</label>
            <input
              className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={saving}
            />

            <label className="text-xs text-brand-muted">Stage</label>
            <select
              className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              disabled={saving}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label className="text-xs text-brand-muted">Match (Scheduled + Live + TBD)</label>
            <select
              className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              disabled={saving}
            >
              <option value="" disabled>Select match</option>
              {openMatches.map((m) => (
                <option key={m.match_id} value={m.match_id}>
                  {m.match_id} — {m.alliance1} vs {m.alliance2} ({m.status || "Scheduled"})
                </option>
              ))}
            </select>

            {openMatches.length === 0 ? (
              <div className="text-xs text-brand-muted">No matches available.</div>
            ) : null}
          </div>

          {/* RIGHT */}
          <div className="space-y-3">
            <label className="text-xs text-brand-muted">Status</label>
            <select
              className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!matchId || saving}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {status === "Completed" ? (
              <>
                <div className="rounded-xl border border-brand-line bg-brand-blueSoft p-3 text-xs text-brand-text">
                  <b>Team Black:</b> {blackTeamNames[0]} + {blackTeamNames[1]} <br />
                  <b>Team White:</b> {whiteTeamNames[0]} + {whiteTeamNames[1]}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-brand-muted">Team Black — {blackTeamNames[0]}</label>
                    <input
                      inputMode="numeric"
                      className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
                      value={black1}
                      onChange={(e) => setBlack1(e.target.value)}
                      disabled={!matchId || saving}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brand-muted">Team Black — {blackTeamNames[1]}</label>
                    <input
                      inputMode="numeric"
                      className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
                      value={black2}
                      onChange={(e) => setBlack2(e.target.value)}
                      disabled={!matchId || saving}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brand-muted">Team White — {whiteTeamNames[0]}</label>
                    <input
                      inputMode="numeric"
                      className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
                      value={white1}
                      onChange={(e) => setWhite1(e.target.value)}
                      disabled={!matchId || saving}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brand-muted">Team White — {whiteTeamNames[1]}</label>
                    <input
                      inputMode="numeric"
                      className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
                      value={white2}
                      onChange={(e) => setWhite2(e.target.value)}
                      disabled={!matchId || saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-brand-muted">Team Black Total (score1)</label>
                    <input
                      inputMode="numeric"
                      className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
                      value={scoreBlack}
                      onChange={(e) => setScoreBlack(e.target.value)}
                      disabled={!matchId || saving}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brand-muted">Team White Total (score2)</label>
                    <input
                      inputMode="numeric"
                      className="w-full rounded-xl bg-white border border-brand-line px-4 py-3 outline-none focus:border-sky-400"
                      value={scoreWhite}
                      onChange={(e) => setScoreWhite(e.target.value)}
                      disabled={!matchId || saving}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-brand-muted">
                Scores are entered only when marking a match as <b>Completed</b>.
              </div>
            )}

            <button
              onClick={onSave}
              disabled={!matchId || saving}
              className="w-full mt-2 rounded-xl bg-brand-blue text-white px-5 py-3 font-medium shadow-soft hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Spinner />
                  Saving…
                </>
              ) : (
                "Save Update"
              )}
            </button>

            {msg ? <div className="text-sm text-emerald-700">{msg}</div> : null}
            {err ? <div className="text-sm text-red-600">{err}</div> : null}
          </div>
        </div>
      </Card>

      {/* WINNER SCREEN */}
      {/* WINNER SCREEN */}
{showWinner && winnerData && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
    <Confetti recycle={false} numberOfPieces={500} />

    <div className="bg-white rounded-3xl p-6 max-w-xl w-full mx-4">
      <h2 className="text-2xl font-extrabold text-center mb-4">
        Match Result
      </h2>

      {/* TEAM BLACK */}
      <div className="rounded-xl border p-4 mb-3 bg-zinc-50">
        <h3 className="font-bold mb-2">🖤 Team Black</h3>
        <div className="text-xs mb-2">{winnerData.black.alliance}</div>

        {winnerData.black.players.map((p, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{p.name}</span>
            <span className="font-semibold">{p.score}</span>
          </div>
        ))}

        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>{winnerData.black.total}</span>
        </div>
      </div>

      {/* TEAM WHITE */}
      <div className="rounded-xl border p-4 mb-3 bg-zinc-50">
        <h3 className="font-bold mb-2">🤍 Team White</h3>
        <div className="text-xs mb-2">{winnerData.white.alliance}</div>

        {winnerData.white.players.map((p, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{p.name}</span>
            <span className="font-semibold">{p.score}</span>
          </div>
        ))}

        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>{winnerData.white.total}</span>
        </div>
      </div>

      {/* WINNER ANNOUNCEMENT */}
      <div className="text-center text-xl font-extrabold mt-4">
        {winnerData.winner === "DRAW"
          ? "🤝 Match Drawn"
          : winnerData.winner === "BLACK"
          ? "🏆 Winner: Team Black"
          : "🏆 Winner: Team White"}
      </div>

      <button
        onClick={() => {
          setShowWinner(false);
          setWinnerData(null);
          resetFormAfterMatch();
        }}
        className="mt-5 w-full rounded-xl bg-brand-blue text-white py-3 font-medium"
      >
        Continue
      </button>
    </div>
  </div>
)}

    </div>
  );
}
