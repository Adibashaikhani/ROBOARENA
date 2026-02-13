import { useEffect, useMemo, useState } from "react";
import { listMatches } from "../api";
import { DEFAULT_POLL_MS } from "../config";

export function useMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const data = await listMatches(); // fetch all
      setMatches(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      setError(e?.message || "Failed to load matches");
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // initial fetch
    const id = setInterval(load, DEFAULT_POLL_MS); // keep it “live”
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { matches, loading, error, reload: load };
}
