import React from "react";
import GroupTaskForm from "../fixbar/GroupTaskForm";
import FadeUpContainer from "../animation/FadeUpContainer";
function Tag() {
 
  return (
    <div id='otherPage'>
      <FadeUpContainer>
        <GroupTaskForm filter={{ groupByTag : true  }} />
      </FadeUpContainer>
    </div>
  )
}

export default Tag;
