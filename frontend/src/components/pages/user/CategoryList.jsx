import React from "react";
import TaskForm from "../fixbar/TaskForm";
import { useParams } from "react-router-dom";
import FadeUpContainer from "../animation/FadeUpContainer";
function CategoryList() {
  const { categoryName } = useParams();
  console.log("locate", categoryName);
  return (
    <div id="otherPage" className="flex">
      <FadeUpContainer>
        <TaskForm filter={{ category: categoryName }} />
      </FadeUpContainer>
      
    </div>
  );
}

export default CategoryList;
