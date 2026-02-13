import React from "react";

export default function Card({ title, subtitle, children, right, className = "" }) {
  return (
    <section
      className={[
        "rounded-xl2 bg-brand-card border border-brand-line shadow-card overflow-hidden",
        className,
      ].join(" ")}
    >
      <header className="px-6 py-5 border-b border-brand-line flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-base md:text-lg font-semibold text-brand-text leading-tight">
            {title}
          </div>
          {subtitle ? (
            <div className="text-sm text-brand-muted mt-1 leading-snug">
              {subtitle}
            </div>
          ) : null}
        </div>

        {right ? (
          <div className="shrink-0 flex items-center gap-2">{right}</div>
        ) : null}
      </header>

      <div className="p-6">{children}</div>
    </section>
  );
}
