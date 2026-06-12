import FadeUpContainer from "../animation/FadeUpContainer";
import PomodoroTimer from "../pomodoro/PomodoroTimer";
import { usePomodoroSession } from "../../hooks/queries/usePomodoro";

function Pomodoro() {
  const { mutate: completeSession, isError } = usePomodoroSession();

  return (
    <div id="otherPage" className="py-8 px-4 flex justify-center">
      <FadeUpContainer direction="up" delay={0.1}>
        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-purpleNormal rounded-3xl p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Pomodoro</h1>
          <PomodoroTimer onComplete={completeSession} />
          {isError && (
            <p className="text-red-400 text-sm text-center mt-2">
              Session reward failed — try again shortly.
            </p>
          )}
        </div>
      </FadeUpContainer>
    </div>
  );
}

export default Pomodoro;
