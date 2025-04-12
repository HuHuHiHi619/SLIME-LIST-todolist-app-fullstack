import React from "react";
import TaskForm from "../fixbar/TaskForm";
import { useParams } from "react-router-dom";
import FadeUpContainer from "../animation/FadeUpContainer";
function CategoryList() {
  const { categoryName } = useParams();
  return (
    <div id="otherPage" >
      <FadeUpContainer>
        <div className="w-[800px]">
          <TaskForm filter={{ category: categoryName }} />
        </div>
      </FadeUpContainer>
      
    </div>
  );
}

export default CategoryList;
