import React from "react";
import TaskForm from "../fixbar/TaskForm";
import Summary from "../ui/Summary.jsx";
import StreakField from "../ui/StreakField";
import BadgeField from "../ui/BadgeField";
import FadeUpContainer from "../animation/FadeUpContainer";
import SearchField from "../ui/SearchField.jsx";
import DashboardTab from "../ui/DashboardTab.jsx";
import LoadingPage from "../animation/LoadingPage.jsx";
function Home() {
  const handleSearchToggle = () => {};

  return (
    <div id="home" className="flex flex-col lg:flex-row w-full h-full">
      <div>
        <div className="grid justify-center mt-4 lg:hidden ">
          <SearchField
            handleSearchToggle={handleSearchToggle}
            isSearchOpen={true}
            alwaysOpen={true}
            className="rounded-xl p-1.5 pl-14 mb-3 w-[280px] text-white focus-visible:outline-2 outline-purpleBorder text-xl z-20 bg-purpleMain"
          />
          <DashboardTab />
        </div>
        <TaskForm filter={{ status: "pending" }} />
      </div>

      <div className="hidden lg:pl-2 lg:mt-6 lg:flex lg:flex-col lg:gap-6 mr-6">
        <FadeUpContainer direction="up" delay={0.2}>
          <StreakField />
        </FadeUpContainer>
        <FadeUpContainer direction="up" delay={0.3}>
          <BadgeField />
        </FadeUpContainer>
        <FadeUpContainer direction="up" delay={0.4}>
          <Summary />
        </FadeUpContainer>
      </div>
    </div>
  );
}

export default Home;