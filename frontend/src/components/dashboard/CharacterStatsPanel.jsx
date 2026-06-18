import { usePetQuery } from "../../hooks/queries/usePet";
import { useSummaryQuery } from "../../hooks/queries/useSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiamond, faHeart, faCoins, faCheck, faClock } from "@fortawesome/free-solid-svg-icons";

function StatBox({ icon, value, label, iconColor }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 border-purpleNormal bg-darkBackground flex-1">
      <FontAwesomeIcon icon={icon} style={{ color: iconColor }} className="text-base" />
      <p className="text-white text-xl font-bold leading-none">{value}</p>
      <p className="text-gray-400 text-xs tracking-widest">{label}</p>
    </div>
  );
}

function CharacterStatsPanel() {
  const { data: pet } = usePetQuery();
  const { data: summary = [] } = useSummaryQuery();

  const level     = pet?.level ?? 0;
  const happiness = pet?.happiness ?? 0;
  const pomodoros = pet?.pomodorosToday ?? 0;
  const completed = summary[0]?.completedTasks ?? 0;

  return (
    <div className="rounded-3xl border-2 border-purpleNormal bg-purpleMain p-6 flex flex-col gap-4">
      <h2 className="text-white text-xl font-bold">Character Stats</h2>

      <div className="flex gap-2 flex-wrap">
        <StatBox icon={faDiamond}  value={level}           label="LEVEL"     iconColor="#7C5CFF" />
        <StatBox icon={faHeart}    value={`${happiness}%`} label="HAPPINESS" iconColor="#E37DDE" />
        <StatBox icon={faCoins}    value="—"               label="COINS"     iconColor="#F2C24B" />
        <StatBox icon={faCheck}    value={completed}        label="COMPLETED" iconColor="#2BB795" />
        <StatBox icon={faClock}    value={pomodoros}        label="POMODORO"  iconColor="#DE6F31" />
      </div>
    </div>
  );
}

export default CharacterStatsPanel;
