import React from "react";
import Card from "../components/Card";
import BackButton from "../components/BackButton";

export default function Venue() {
  return (
    <div className="space-y-6">
      <BackButton to="/" />
      <Card title="Venue" subtitle="Location & timings">
        <div className="text-sm text-brand-muted">
          Venue details coming soon.
        </div>
      </Card>
    </div>
  );
}
