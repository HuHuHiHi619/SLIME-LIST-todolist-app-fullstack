import React from "react";
import TaskForm from "../fixbar/TaskForm";
import Summary from "../ui/Summary.jsx";
import StreakField from "../ui/StreakField";
import BadgeField from "../ui/BadgeField";
import FadeUpContainer from "../animation/FadeUpContainer";
import SearchField from "../ui/SearchField.jsx";

function Home() {
  const alwaysOpen = true;

  const handleSearchToggle = () => {};
  return (
    <div id="home" className="flex flex-col lg:flex-row w-full h-full">
      <div>
        <div className="flex justify-center mt-2 lg:hidden ">
          <SearchField
            handleSearchToggle={handleSearchToggle}
            isSearchOpen={alwaysOpen}
          />
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
