import React from "react";
import { Link } from "react-router-dom";

function QuickCard({ to, title, subtitle, accent = "blue" }) {
  const accentBox =
    accent === "yellow"
      ? "bg-brand-yellowSoft border-amber-200"
      : "bg-brand-blueSoft border-sky-200";

  const dot = accent === "yellow" ? "bg-brand-yellow" : "bg-brand-blue";

  return (
    <Link
      to={to}
      className={[
        "group block rounded-2xl border border-brand-line bg-white shadow-card",
        "hover:-translate-y-0.5 hover:shadow-soft transition p-6",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "h-12 w-12 rounded-2xl border flex items-center justify-center",
            accentBox,
          ].join(" ")}
        >
          <div className={["h-3 w-3 rounded-full", dot].join(" ")} />
        </div>

        <div className="min-w-0">
          <div className="text-brand-text font-semibold text-lg">{title}</div>
          <div className="text-sm text-brand-muted mt-1">{subtitle}</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-brand-muted">Open</span>
        <span className="text-brand-blue font-medium group-hover:underline">→</span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-6xl px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-brand-text">
            ROBOARENA - CARROM CLASH
          </h1>
          <div className="mt-2 text-sm text-brand-muted">
            Live Scores • Schedule • Leaderboard
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-5xl">
            <div className="text-center text-brand-text font-semibold mb-4">
              Quick Access
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <QuickCard to="/" title="Home" subtitle="Main dashboard" />
              <QuickCard to="/schedule" title="Schedule" subtitle="All matches & stages" />
              <QuickCard to="/leaderboard" title="Leaderboard" subtitle="Rankings & points" accent="yellow" />

              <QuickCard to="/referee" title="Referee" subtitle="Set status & update scores" />
              <QuickCard to="/upcoming" title="Upcoming Matches" subtitle="Only scheduled matches" accent="yellow" />
              <QuickCard to="/venue" title="Venue" subtitle="Location & timings" />

              <QuickCard to="/stopwatch" title="Stopwatch" subtitle="Start / Pause / Reset timer" accent="yellow" />

              {/* ✅ ADMIN NOW SAME STYLE */}
              <QuickCard
                to="/admin"
                title="Admin Panel"
                subtitle="Generate brackets & control tournament"
              />

              <QuickCard
                to="/winners"
                title="Winner History"
                subtitle="All match results & winners"
                accent="yellow"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
