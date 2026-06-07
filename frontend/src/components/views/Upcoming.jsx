import React from "react";
import GroupTaskForm from "../task/GroupTaskForm";
import FadeUpContainer from "../animation/FadeUpContainer";
function Upcoming() {
  return (
    <div id="otherPage">
      <FadeUpContainer>
        <GroupTaskForm filter={{ groupByDeadline: true }} />
      </FadeUpContainer>
    </div>
  );
}

export default Upcoming;
