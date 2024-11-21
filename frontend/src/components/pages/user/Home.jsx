import React from "react";
import TaskForm from "../fixbar/TaskForm";
import Summary from "../ui/summary";
import StreakField from "../ui/StreakField";
import CalendarField from "../ui/CalendarField";
import BadgeField from "../ui/BadgeField";
import FadeUpContainer from "../animation/FadeUpContainer";

function Home() {
  return (
    <div id="home">
      <TaskForm filter={{ status: "pending" }} />

      <div className="flex flex-col gap-6">
        <FadeUpContainer direction="up" delay={0.2}>
          <StreakField />
        </FadeUpContainer>
        <FadeUpContainer direction="up" delay={0.3}>
          <Summary />
        </FadeUpContainer>
        <FadeUpContainer direction="up" delay={0.4}>
          <BadgeField />
        </FadeUpContainer>
      </div>
    </div>
  );
}

export default Home;
