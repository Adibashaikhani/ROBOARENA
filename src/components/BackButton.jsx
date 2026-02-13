import React from "react";
import { Link } from "react-router-dom";

export default function BackButton({ to = "/" }) {
  return (
    <div className="mb-4">
      <Link
        to={to}
        className="
          inline-flex items-center gap-2
          px-4 py-2
          rounded-full
          bg-white
          border border-brand-line
          text-brand-text
          text-sm font-medium
          shadow-soft
          hover:bg-brand-blueSoft
          transition
        "
      >
        ← Back
      </Link>
    </div>
  );
}
