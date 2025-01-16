import React, { useState } from "react";
import ReactDOM from "react-dom";
import TaskForm from "../fixbar/TaskForm";
import Summary from "../ui/summary";
import StreakField from "../ui/StreakField";
import BadgeField from "../ui/BadgeField";
import FadeUpContainer from "../animation/FadeUpContainer";

function Home() {
  return (
    <div id="home">
      <TaskForm filter={{ status: "pending" }} />

      <div className="hidden lg:pl-14 lg:mt-10 lg:flex lg:flex-col lg:gap-6">
        
        <FadeUpContainer direction="up" delay={0.2}>
          <StreakField />
        </FadeUpContainer>
        <FadeUpContainer direction="up" delay={0.4}>
          <BadgeField />
        </FadeUpContainer>
        <FadeUpContainer direction="up" delay={0.3}>
          <Summary />
        </FadeUpContainer>
      </div>
    </div>
  );
}

export default Home;
