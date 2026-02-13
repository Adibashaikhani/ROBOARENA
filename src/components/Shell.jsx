import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={[
        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition",
        active
          ? "bg-brand-blue text-white shadow-soft"
          : "bg-white border border-brand-line text-brand-text hover:bg-brand-blueSoft",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function NavCard({ to, title, subtitle }) {
  return (
    <Link
      to={to}
      className="rounded-xl2 bg-white border border-brand-line shadow-card p-5 hover:opacity-95 transition"
    >
      <div className="text-brand-text font-semibold">{title}</div>
      {subtitle ? <div className="text-sm text-brand-muted mt-1">{subtitle}</div> : null}
    </Link>
  );
}

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 text-xs text-brand-muted">
        © 2026 ROBOARENA • Carrom Clash
      </div>
    </div>
  );
}
