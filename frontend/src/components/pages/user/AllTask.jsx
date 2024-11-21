import React from "react";

import GroupTaskForm from "../fixbar/GroupTaskForm";
import FadeUpContainer from "../animation/FadeUpContainer";
function AllTask() {
  return (
    <div id="otherPage" className="">
      <FadeUpContainer>
        <GroupTaskForm filter={{ groupByStatus: true }} />
      </FadeUpContainer>
    </div>
  );
}

export default AllTask;
