import { faChartBar, faFire, faBolt } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// SearchField is removed from here

function DashboardTab() {
  const { userData } = useSelector((state) => state.user);
  const { summary } = useSelector((state) => state.summary);

  const badgeImages = {
    gold: "./images/Gold-badge.png",
    silver: "./images/Silver-badge.png",
    bronze: "./images/Bronze-badge.png",
    iron: "./images/Iron-badge.png",
  };

  return (
    <div className="flex  items-center justify-between">
      <div className="w-[52px] bg-purpleGradient p-0.5 rounded-xl">
        <div className="bg-purpleSidebar rounded-lg p-2.5">
          <img
            className="w-full h-full object-contain"
            src={
              badgeImages[userData.currentBadge] || "./images/Iron-badge.png"
            }
            alt=""
          />
        </div>
      </div>
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
        <FontAwesomeIcon
          icon={faChartBar}
          className="text-[#1ef996] text-xl mr-2"
        />
        {summary.map((item, idx) => (
          <p key={idx} className="text-xl  font-bold text-white">
            {item.completedRate.toFixed(0)}%
          </p>
        ))}
      </div>
    </div>
  );
}

export default DashboardTab;
