import React , { Suspense } from "react";
import TaskList from "../ui/TaskList";
import CreateTask from "../create/CreateTask";
import CreateButton from "../ui/CreateButton";
import { useSelector } from "react-redux";
import useFetchTask from "../hooks/useFetchTask";
import usePopup from "../hooks/usePopup";
import FadeUpContainer from "../animation/FadeUpContainer";
import ReactDOM from "react-dom"

const TaskDetail = React.lazy(() =>  import("../ui/taskDetail"))

function TaskForm({ filter, filterKey }) {
  const { selectedTask, isCreate } = useSelector((state) => state.tasks);
  const { tasks: fetchedTasks } = useFetchTask(filter, filterKey);
  const {
    handleIsCreate,
    handleCloseDetail,
    handleTaskClick,
    handleCompletedTask,
    handleRemovedTask,
    popupRef,
  } = usePopup();
  
  return (
    <div className="md:mb-8 md:ml-28 md:mt-6 overflow-hidden">
      <FadeUpContainer>
        {fetchedTasks.length > 0 ? (
          <TaskList
            label="TASKS"
            handleCompletedTask={handleCompletedTask}
            handleRemovedTask={handleRemovedTask}
            handleTaskClick={handleTaskClick}
            handleIsCreate={handleIsCreate}
            selectedTask={selectedTask}
          />
        ) : (
          <div className="md:mt-56 mt-40 mx-4 rounded-3xl flex-1 ">
            <div className="flex justify-center">
              <CreateButton onClick={handleIsCreate} />
            </div>
            <p className="text-xl md:text-4xl text-white flex justify-center mt-4">You have no task</p>
            <p className="text-lg md:text-2xl text-gray-400 flex justify-center">Click on the + button to</p>
            <p className="text-lg md:text-2xl text-gray-400 flex justify-center">create a task</p>
          </div>
        )}
      </FadeUpContainer>

      {/*Popup Task detail*/}
      {selectedTask && 
        ReactDOM.createPortal(
        <div className="popup-overlay ">
          <div className="popup-content">
            <Suspense fallback={<></>}>
              <TaskDetail onClose={handleCloseDetail} />
            </Suspense>
          </div>
        </div>,
        document.body
      )}

      {/* Popup CreateTask*/}
      {isCreate && ReactDOM.createPortal(
        <div className="popup-overlay">
          <div className="popup-content" ref={popupRef}>
            <CreateTask onClose={handleIsCreate} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default TaskForm;
