// src/pages/Admin.jsx

import React, { useState } from "react";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import { API_BASE } from "../config";

export default function Admin() {
  const [loadingAction, setLoadingAction] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function callAPI(actionName) {
    setLoadingAction(actionName);
    setMsg("");
    setErr("");

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        body: new URLSearchParams({
          action: actionName,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setErr(data.error || "Something failed.");
      } else {
        setMsg(data.message || "Success!");
      }
    } catch (e) {
      setErr("Server error. Check deployment URL.");
    } finally {
      setLoadingAction(null);
    }
  }

  function AdminButton({ label, action }) {
    const isLoading = loadingAction === action;

    return (
      <button
        onClick={() => callAPI(action)}
        disabled={loadingAction !== null}
        className="w-full rounded-xl bg-brand-blue text-white px-5 py-3 font-medium shadow-soft hover:opacity-90 transition disabled:opacity-50"
      >
        {isLoading ? "Generating..." : label}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton to="/" />

      <Card
        title="Admin Panel"
        subtitle="Tournament Bracket Generation"
      >
        <div className="space-y-4">

          <AdminButton
            label="Generate Quarterfinals (Top 16)"
            action="generateQuarterfinals"
          />

          <AdminButton
            label="Generate Semifinals (QF Winners)"
            action="generateSemifinals"
          />

          <AdminButton
            label="Generate Final & 3rd Place"
            action="generateFinals"
          />

          {msg && (
            <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              {msg}
            </div>
          )}

          {err && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              {err}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
