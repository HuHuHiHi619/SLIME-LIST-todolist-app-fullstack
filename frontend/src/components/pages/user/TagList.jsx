import React from "react";
import { useParams } from "react-router-dom";
import TaskForm from "../fixbar/TaskForm";
import FadeUpContainer from "../animation/FadeUpContainer";
function TagList() {
  const { tagName } = useParams();
  console.log('test', tagName)
  return (
    <div id='otherPage'>
        <FadeUpContainer>
            <TaskForm filter={ {tag:tagName} } />
        </FadeUpContainer>
    </div>
  )
}

export default TagList;
