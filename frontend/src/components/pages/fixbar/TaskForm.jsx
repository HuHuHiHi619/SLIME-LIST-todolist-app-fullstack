import React from "react";
import TaskList from "../ui/TaskList";
import TaskDetail from "../ui/taskDetail";
import CreateTask from "../create/CreateTask";
import CreateButton from "../ui/CreateButton";
import { useSelector } from "react-redux";
import useFetchTask from "../hooks/useFetchTask";
import usePopup from "../hooks/usePopup";
import FadeUpContainer from "../animation/FadeUpContainer";
import ReactDOM from "react-dom"
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
    <div className="mb-8 mx-8 overflow-hidden">
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
          <div className="mt-40 ml-10 mr-6 rounded-3xl pl-6 pt-5 pb-6 ">
            <div className="flex justify-center">
              <CreateButton onClick={handleIsCreate} />
            </div>
            <h3 className="text-4xl flex justify-center mt-4">You have no tasks</h3>
            <h3 className="text-2xl flex justify-center text-gray-400">Click on the + button to add one</h3>
          </div>
        )}
      </FadeUpContainer>

      {/*Popup Task detail*/}
      {selectedTask && 
        ReactDOM.createPortal(
        <div className="popup-overlay ">
          <div className="popup-content">
            <TaskDetail onClose={handleCloseDetail} />
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
