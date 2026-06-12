import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

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

function PomodoroTimer({ onComplete }) {
  const getWorkSecs  = () => getStoredMinutes(POMODORO_STORAGE_KEYS.workMin,  DEFAULT_WORK_MIN)  * 60;
  const getBreakSecs = () => getStoredMinutes(POMODORO_STORAGE_KEYS.breakMin, DEFAULT_BREAK_MIN) * 60;

  const [mode, setMode]       = useState(MODES.work);
  const [seconds, setSeconds] = useState(getWorkSecs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const clear = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // tick — pure decrement, no side effects
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return clear;
  }, [running]);

  // completion — fires when seconds hits 0 while running
  const handleComplete = useCallback(() => {
    clear();
    setRunning(false);
    if (mode === MODES.work) {
      onComplete?.();
      setMode(MODES.break);
      setSeconds(getBreakSecs());
    } else {
      setMode(MODES.work);
      setSeconds(getWorkSecs());
    }
  }, [mode, onComplete]);

  useEffect(() => {
    if (seconds === 0 && running) handleComplete();
  }, [seconds, running, handleComplete]);

  const handleReset = () => {
    clear();
    setRunning(false);
    setMode(MODES.work);
    setSeconds(getWorkSecs());
  };

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const isWork = mode === MODES.work;

  return (
    <div className="flex flex-col items-center gap-6">
      <p className={`text-lg uppercase tracking-widest ${isWork ? "text-fuchsia-400" : "text-emerald-400"}`}>
        {isWork ? "Focus" : "Break"}
      </p>

      <div className={`text-8xl font-bold tabular-nums ${isWork ? "text-white" : "text-emerald-300"}`}>
        {mins}:{secs}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex items-center gap-2 bg-purpleNormal hover:bg-purpleActive text-white px-6 py-3 rounded-xl text-lg transition-colors"
        >
          <FontAwesomeIcon icon={running ? faPause : faPlay} />
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 px-6 py-3 rounded-xl text-lg transition-colors"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
          Reset
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;
