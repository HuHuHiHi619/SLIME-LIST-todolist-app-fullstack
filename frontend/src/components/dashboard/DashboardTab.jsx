import { faFire, faBolt, faClock } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePetQuery } from "../../hooks/queries/usePet";

function DashboardTab() {
  const { userData } = useSelector((state) => state.user);
  const { summary } = useSelector((state) => state.summary);
  const { data: pet } = usePetQuery();

  return (
    <div className="flex  items-center justify-between gap-4">
      <div className="flex items-center border-fuchsia-400 border-2 p-2.5 rounded-xl">
        <FontAwesomeIcon
          icon={faFire}
          className="text-fuchsia-400 text-xl mr-2"
        />
        <p className="text-xl font-bold text-white">{userData.bestStreak}</p>
      </div>
      <div className="flex items-center  border-purpleBorder border-2 p-2.5 rounded-xl">
        <FontAwesomeIcon
          icon={faBolt}
          className="text-purpleBorder  text-xl mr-2"
        />
        <p className="text-xl  font-bold text-white">
          {userData.currentStreak}
        </p>
      </div>
      <div className="flex items-center border-[#1ef996] border-2 p-2.5 rounded-xl">
        {summary.map((item, idx) => (
          <p key={idx} className="text-xl  font-bold text-white">
            {item.completedRate.toFixed(0)}%
          </p>
        ))}
      </div>
      <div className="flex items-center border-emerald-400 border-2 p-2.5 rounded-xl">
        <FontAwesomeIcon
          icon={faClock}
          className="text-emerald-400 text-xl mr-2"
        />
        <p className="text-xl font-bold text-white">{pet?.pomodorosToday ?? 0}</p>
      </div>
    </div>
  );
}

export default DashboardTab;
