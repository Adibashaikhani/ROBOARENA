import React from "react";
import Card from "../components/Card";
import BackButton from "../components/BackButton";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10); // 00-99

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const cc = String(centis).padStart(2, "0");
  return `${mm}:${ss}.${cc}`;
}

export default function Stopwatch() {
  const [running, setRunning] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [soundOn, setSoundOn] = React.useState(true);

  const startRef = React.useRef(null);
  const rafRef = React.useRef(null);

  const playBeep = React.useCallback(() => {
    if (!soundOn) return;

    // Lightweight beep using WebAudio (no external file needed)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.08;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);

      osc.onended = () => ctx.close();
    } catch {
      // If browser blocks, just ignore silently
    }
  }, [soundOn]);

  const tick = React.useCallback(() => {
    if (!running) return;

    const now = performance.now();
    const base = startRef.current ?? now;
    setElapsed(now - base);

    rafRef.current = requestAnimationFrame(tick);
  }, [running]);

  React.useEffect(() => {
    if (!running) return;

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, tick]);

  function onStart() {
    playBeep();
    const now = performance.now();

    // If resuming after pause, shift start time so elapsed continues
    startRef.current = now - elapsed;
    setRunning(true);
  }

  function onPause() {
    playBeep();
    setRunning(false);
  }

  function onReset() {
    playBeep();
    setRunning(false);
    setElapsed(0);
    startRef.current = null;
  }

  return (
    <div className="space-y-6">
      <BackButton to="/" />

      <Card title="Stopwatch" subtitle="Use this during matches • Start / Pause / Reset">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Time Display */}
          <div
            className="
              w-full max-w-md
              rounded-2xl border border-brand-line bg-brand-blueSoft
              px-6 py-8 text-center shadow-soft
            "
          >
            <div className="text-brand-muted text-sm">Elapsed Time</div>
            <div className="mt-2 text-4xl md:text-5xl font-extrabold text-brand-text tracking-tight">
              {formatTime(elapsed)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-center">
            {!running ? (
              <button
                onClick={onStart}
                className="px-6 py-3 rounded-full bg-brand-blue text-white font-semibold shadow-soft hover:opacity-90 transition"
              >
                Start
              </button>
            ) : (
              <button
                onClick={onPause}
                className="px-6 py-3 rounded-full bg-brand-yellow text-brand-text font-semibold shadow-soft hover:opacity-90 transition"
              >
                Pause
              </button>
            )}

            <button
              onClick={onReset}
              className="px-6 py-3 rounded-full bg-white border border-brand-line text-brand-text font-semibold shadow-soft hover:bg-brand-blueSoft transition"
            >
              Reset
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundOn((v) => !v)}
              className={[
                "px-6 py-3 rounded-full font-semibold shadow-soft transition border",
                soundOn
                  ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                  : "bg-white border-brand-line text-brand-text hover:bg-brand-blueSoft",
              ].join(" ")}
            >
              Sound: {soundOn ? "On" : "Off"}
            </button>
          </div>

          {/* Small helper text */}
          <div className="text-xs text-brand-muted text-center">
            Tip: Keep sound ON for a small click/beep feedback while controlling the timer.
          </div>
        </div>
      </Card>
    </div>
  );
}
