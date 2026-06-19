import { useState, useEffect, useRef, useCallback } from "react";

export const POMODORO_STORAGE_KEYS = {
  workMin:  "pomodoroWorkMin",
  breakMin: "pomodoroBreakMin",
};

const DEFAULT_WORK_MIN  = 25;
const DEFAULT_BREAK_MIN = 5;

const getStoredMinutes = (key, fallback) => {
  const raw = localStorage.getItem(key);
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const MODES = { work: "work", break: "break" };

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function PomodoroTimer({ onComplete }) {
  const getWorkSecs  = () => getStoredMinutes(POMODORO_STORAGE_KEYS.workMin,  DEFAULT_WORK_MIN)  * 60;
  const getBreakSecs = () => getStoredMinutes(POMODORO_STORAGE_KEYS.breakMin, DEFAULT_BREAK_MIN) * 60;

  const [mode, setMode]         = useState(MODES.work);
  const [seconds, setSeconds]   = useState(getWorkSecs);
  const [totalSecs, setTotalSecs] = useState(getWorkSecs);
  const [running, setRunning]   = useState(false);
  const intervalRef = useRef(null);

  const clearTick = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return clearTick;
  }, [running]);

  const handleComplete = useCallback(() => {
    clearTick();
    setRunning(false);
    if (mode === MODES.work) {
      onComplete?.();
      const breakSecs = getBreakSecs();
      setMode(MODES.break);
      setSeconds(breakSecs);
      setTotalSecs(breakSecs);
    } else {
      const workSecs = getWorkSecs();
      setMode(MODES.work);
      setSeconds(workSecs);
      setTotalSecs(workSecs);
    }
  }, [mode, onComplete]);

  useEffect(() => {
    if (seconds === 0 && running) handleComplete();
  }, [seconds, running, handleComplete]);

  const handleReset = () => {
    clearTick();
    setRunning(false);
    const workSecs = getWorkSecs();
    setMode(MODES.work);
    setSeconds(workSecs);
    setTotalSecs(workSecs);
  };

  // Clicking a tab stops the timer and resets to that mode's full duration
  const handleTabSwitch = (newMode) => {
    clearTick();
    setRunning(false);
    setMode(newMode);
    const secs = newMode === MODES.work ? getWorkSecs() : getBreakSecs();
    setSeconds(secs);
    setTotalSecs(secs);
  };

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const isWork = mode === MODES.work;

  const progress = totalSecs > 0 ? seconds / totalSecs : 1;
  const strokeOffset = CIRCUMFERENCE * (1 - progress);

  const speechText = running
    ? isWork
      ? "Stay focused, you're doing great!"
      : "Rest up — Mochi needs a breather too."
    : "Press play and let's grow, together.";

  return (
    <div className="flex flex-col items-center gap-6 p-8">

      {/* Tab toggle */}
      <div
        className="flex p-1 gap-1 rounded-full"
        style={{ background: "var(--slime-fill2)", border: "1px solid var(--slime-bd)" }}
      >
        <button
          onClick={() => handleTabSwitch(MODES.work)}
          className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
          style={
            isWork
              ? { background: "var(--violet)", color: "#fff", boxShadow: "0 4px 14px rgba(124,92,255,0.45)" }
              : { color: "var(--slime-muted)" }
          }
        >
          Focus
        </button>
        <button
          onClick={() => handleTabSwitch(MODES.break)}
          className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
          style={
            !isWork
              ? { background: "var(--mint)", color: "#fff", boxShadow: "0 4px 14px rgba(43,183,149,0.45)" }
              : { color: "var(--slime-muted)" }
          }
        >
          Short Break
        </button>
      </div>

      {/* Speech bubble */}
      <div className="relative w-full max-w-xs">
        <div
          className="rounded-xl px-5 py-3 text-sm flex items-center gap-2"
          style={{
            background: "var(--slime-fill2)",
            border: "1px solid var(--slime-bd)",
            color: "var(--slime-ink)",
          }}
        >
          <span style={{ color: "var(--violet)" }}>⚡</span>
          {speechText}
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
          style={{
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid rgba(153,153,227,0.20)",
          }}
        />
      </div>

      {/* SVG ring + pet */}
      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        <svg width="260" height="260" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx="130" cy="130" r={RADIUS}
            fill="none"
            stroke="var(--slime-bd)"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx="130" cy="130" r={RADIUS}
            fill="none"
            stroke={isWork ? "var(--violet)" : "var(--mint)"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            style={{
              transition: running ? "stroke-dashoffset 1s linear" : "none",
              filter: "drop-shadow(0 0 6px rgba(124,92,255,1)) drop-shadow(0 0 22px rgba(124,92,255,0.55))",
            }}
          />
        </svg>

        {/* Inner disc — sits inside the ring, behind pet + timer */}
        <div
          className="absolute rounded-full"
          style={{
            width: 205, height: 205,
            background: `radial-gradient(circle at 50% 38%, ${isWork ? "rgba(124,92,255,0.12)" : "rgba(43,183,149,0.12)"}, transparent 70%), var(--slime-card2)`,
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.35)",
          }}
        />

        <div className="flex flex-col items-center gap-1 z-10">
          <img
            src="/images/Logo-slime.png"
            alt="Mochi"
            className="slime-pixel mb-1"
            style={{ width: 64, height: 64, imageRendering: "pixelated" }}
          />
          <span className="font-bold tabular-nums" style={{ fontSize: "3rem", color: "#fff", lineHeight: 1 }}>
            {mins}:{secs}
          </span>
          <span
            className="text-xs uppercase tracking-widest mt-1"
            style={{ color: "var(--slime-muted)" }}
          >
            {isWork ? "Focus" : "Break"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5">
        {/* Reset */}
        <button
          onClick={handleReset}
          aria-label="Reset"
          className="flex items-center justify-center rounded-full transition-all duration-150"
          style={{
            width: 44, height: 44,
            border: "1px solid var(--slime-bd)",
            color: "var(--slime-muted)",
            background: "var(--slime-fill2)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--slime-ink)"; e.currentTarget.style.borderColor = "var(--slime-bd5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--slime-muted)"; e.currentTarget.style.borderColor = "var(--slime-bd)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pause" : "Play"}
          className="flex items-center justify-center rounded-full text-white transition-all duration-150 active:scale-95"
          style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, var(--violet), var(--violet-deep))",
            boxShadow: "0 4px 14px rgba(124,92,255,0.45)",
          }}
        >
          {running ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

      </div>
    </div>
  );
}

export default PomodoroTimer;
