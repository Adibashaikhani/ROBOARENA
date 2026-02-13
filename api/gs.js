export default async function handler(req, res) {
  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbxH_Vli78XMIShPUaRNOsD9PQhSKL1CSbStkGLjQAl4hEhoWIZxBLVSeEONU_6QFDwK/exec";

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const url = new URL(GAS_URL);

    // forward query params
    for (const [k, v] of Object.entries(req.query || {})) {
      url.searchParams.set(k, v);
    }

    let options = { method: req.method };

    // forward POST as form-encoded for Apps Script
    if (req.method === "POST") {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(req.body || {})) {
        if (v !== undefined && v !== null) params.set(k, String(v));
      }
      options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
      options.body = params.toString();
    }

    const r = await fetch(url.toString(), options);
    const text = await r.text();

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(text);
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
