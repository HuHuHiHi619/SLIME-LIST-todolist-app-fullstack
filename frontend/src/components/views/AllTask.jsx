import GroupTaskForm from "../task/GroupTaskForm";
import FadeUpContainer from "../animation/FadeUpContainer";
function AllTask() {
  return (
    <div id="otherPage">
      <FadeUpContainer>
        <GroupTaskForm filter={{ groupByStatus: true }} />
      </FadeUpContainer>
    </div>
  );
}

export default AllTask;
