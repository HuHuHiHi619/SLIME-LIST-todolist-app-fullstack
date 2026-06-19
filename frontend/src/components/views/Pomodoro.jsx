import { useState } from "react";
import FadeUpContainer from "../animation/FadeUpContainer";
import PomodoroTimer from "../pomodoro/PomodoroTimer";
import { usePomodoroSession } from "../../hooks/queries/usePomodoro";

function StatBox({ icon, value, label, chipBg, wide = false }) {
  return (
    <div
      className={`rounded-2xl p-4 flex items-center gap-3 ${wide ? "col-span-2" : ""}`}
      style={{ background: "var(--slime-fill2)", border: "1px solid var(--slime-bd3)" }}
    >
      <span
        className="flex items-center justify-center rounded-xl text-lg shrink-0"
        style={{ width: 40, height: 40, background: chipBg }}
      >
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold leading-none" style={{ color: "var(--slime-ink)" }}>
          {value}
        </p>
        <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--slime-muted)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function Pomodoro() {
  const [sessions,  setSessions]  = useState(0);
  const [focusMin,  setFocusMin]  = useState(0);
  const [totalExp,  setTotalExp]  = useState(0);

  const { mutate: completeSession, isError } = usePomodoroSession();

  const handleWorkComplete = () => {
    setSessions((s) => s + 1);
    setFocusMin((m) => m + 25);
    completeSession(undefined, {
      onSuccess: (data) => {
        if (data?.awardedExp) setTotalExp((e) => e + data.awardedExp);
      },
    });
  };

  return (
    <div
      id="focus-page"
      className="slime-root min-h-screen py-8 px-6"
      style={{ background: "var(--slime-page)" }}
    >
      {/* Page header */}
      <FadeUpContainer direction="up" delay={0.05}>
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{ color: "var(--slime-muted)" }}
        >
          Focus Mode · Pomodoro
        </p>
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: "var(--slime-ink)" }}
        >
          Focus with Mochi
        </h1>
      </FadeUpContainer>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 max-w-6xl mx-auto">

        {/* Left — timer card */}
        <FadeUpContainer direction="up" delay={0.1}>
          <div
            className="rounded-3xl border-2"
            style={{ background: "var(--slime-card)", borderColor: "var(--slime-bd)" }}
          >
            <PomodoroTimer
              onComplete={handleWorkComplete}
            />
            {isError && (
              <p className="text-center text-sm pb-4" style={{ color: "var(--danger, #E2553D)" }}>
                Session reward failed — try again shortly.
              </p>
            )}
          </div>
        </FadeUpContainer>

        {/* Right — panels */}
        <div className="flex flex-col gap-4">

          {/* Now Focusing */}
          <FadeUpContainer direction="up" delay={0.15}>
            <div
              className="rounded-3xl border-2 p-5"
              style={{ background: "var(--slime-card)", borderColor: "var(--slime-bd)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold" style={{ color: "var(--slime-ink)" }}>
                  Now Focusing
                </p>
                <button
                  disabled
                  title="Task linking coming soon"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white opacity-90 cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, var(--violet), var(--violet-deep))",
                    boxShadow: "0 4px 14px rgba(124,92,255,0.45)",
                  }}
                >
                  Pick a task
                </button>
              </div>

              <div
                className="rounded-2xl p-8 flex flex-col items-center gap-2 text-center"
                style={{
                  background: "var(--slime-fill)",
                  border: "1px dashed var(--slime-bd5)",
                }}
              >
                <span
                  className="text-2xl mb-1"
                  style={{ filter: "drop-shadow(0 0 10px rgba(124,92,255,0.55))" }}
                >
                  🔥
                </span>
                <p className="text-base font-bold" style={{ color: "var(--slime-ink)" }}>
                  Free focus session
                </p>
                <p className="text-xs" style={{ color: "var(--violet-ink)" }}>
                  No task attached — just press play and let the timer run.
                </p>
              </div>
            </div>
          </FadeUpContainer>

          {/* Today's Focus */}
          <FadeUpContainer direction="up" delay={0.2}>
            <div
              className="rounded-3xl border-2 p-5"
              style={{ background: "var(--slime-card)", borderColor: "var(--slime-bd)" }}
            >
              <p className="text-sm font-bold mb-4" style={{ color: "var(--slime-ink)" }}>
                Today's Focus
              </p>

              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  icon="🔥"
                  value={sessions}
                  label="Sessions"
                  chipBg="rgba(224,165,58,0.15)"
                />
                <StatBox
                  icon="📅"
                  value={`${focusMin}m`}
                  label="Focus Time"
                  chipBg="rgba(107,159,255,0.15)"
                />
                <StatBox
                  icon="⚡"
                  value={totalExp}
                  label="EXP Earned"
                  chipBg="rgba(124,92,255,0.15)"
                  wide
                />
              </div>

              <div
                className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "var(--slime-fill)", border: "1px solid var(--slime-bd4)" }}
              >
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium text-white whitespace-nowrap"
                  style={{ background: "var(--violet)" }}
                >
                  ⚡ +25 EXP
                </span>
                <span className="text-xs" style={{ color: "var(--slime-muted)" }}>
                  fed to Mochi each focus session
                </span>
              </div>
            </div>
          </FadeUpContainer>

        </div>
      </div>
    </div>
  );
}

export default Pomodoro;
