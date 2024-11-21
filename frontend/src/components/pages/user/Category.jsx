import React from "react";
import GroupTaskForm from "../fixbar/GroupTaskForm";
import FadeUpContainer from "../animation/FadeUpContainer";
function Category() {
  return (
    <div id="otherPage">
      <FadeUpContainer>
        <GroupTaskForm filter={{ groupByCategory: true }} />
      </FadeUpContainer>
    </div>
  );
}

export default Category;
