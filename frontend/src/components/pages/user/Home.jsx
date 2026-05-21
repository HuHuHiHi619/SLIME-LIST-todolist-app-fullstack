import React from "react";
import TaskForm from "../fixbar/TaskForm";
import Summary from "../ui/Summary.jsx";
import StreakField from "../ui/StreakField";
import BadgeField from "../ui/BadgeField";
import FadeUpContainer from "../animation/FadeUpContainer";
function Home() {
  return (
    <div id="home">

      {/* 1. STATS — mobile: first; desktop: right col row 1 */}
      <div className="px-4 lg:px-0 lg:col-start-2 lg:row-start-1 lg:pl-2 lg:mt-6 lg:mr-6">
        <FadeUpContainer direction="up" delay={0.2}>
          <StreakField />
        </FadeUpContainer>
      </div>

      {/* 2. TASKS — mobile: second; desktop: left col, spans all 3 rows */}
      <div className="lg:col-start-1 lg:row-start-1 lg:row-span-3">
        <TaskForm filter={{ status: "pending" }} />
      </div>

      {/* 3. BADGE — mobile: third; desktop: right col row 2 */}
      <div className="px-4 lg:px-0 lg:col-start-2 lg:row-start-2 lg:pl-2 lg:mr-6">
        <FadeUpContainer direction="up" delay={0.3}>
          <BadgeField />
        </FadeUpContainer>
      </div>

      {/* 4. PROGRESS — mobile: fourth; desktop: right col row 3 */}
      <div className="px-4 lg:px-0 lg:col-start-2 lg:row-start-3 lg:pl-2 lg:mr-6">
        <FadeUpContainer direction="up" delay={0.4}>
          <Summary />
        </FadeUpContainer>
      </div>

    </div>
  );
}

export default Home;