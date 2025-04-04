import React from "react";
import TaskForm from "../fixbar/TaskForm";
import Summary from "../ui/Summary.jsx";
import StreakField from "../ui/StreakField";
import BadgeField from "../ui/BadgeField";
import FadeUpContainer from "../animation/FadeUpContainer";
import SearchField from "../ui/SearchField.jsx";

function Home() {
  return (
    <div id="home" className="flex flex-col lg:flex-row w-full h-full">
     
      <TaskForm filter={{ status: "pending" }} />

      <div className="hidden lg:pl-10 lg:mt-6 lg:flex lg:flex-col lg:gap-6 mr-10">
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
