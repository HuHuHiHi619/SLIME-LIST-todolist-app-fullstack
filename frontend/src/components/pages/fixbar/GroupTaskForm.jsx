import React from "react";
import ReactDOM from "react-dom";
import TaskList from "../ui/TaskList";
import TaskDetail from "../ui/taskDetail";
import CreateTask from "../create/CreateTask";
import { useSelector } from "react-redux";
import useFetchTask from "../hooks/useFetchTask";
import usePopup from "../hooks/usePopup";
import CreateButton from "../ui/CreateButton";

function GroupTaskForm({ filter }) {
  const { selectedTask, isCreate } = useSelector((state) => state.tasks);
  const { tasks: fetchedAllTasks } = useFetchTask(filter);
  const {
    handleIsCreate,
    handleCloseDetail,
    handleTaskClick,
    handleCompletedTask,
    handleRemovedTask,
    popupRef,
  } = usePopup();

  return (
    <div className="flex flex-1 gap-6  items-start ml-10   ">
      {fetchedAllTasks &&
      Array.isArray(fetchedAllTasks) &&
      fetchedAllTasks.length > 0 ? (
        fetchedAllTasks.map((group) => {
          const label =
            group.categoryName ||
            group.tagName ||
            group.status ||
            group.deadlineCase;
          const keys =
            group.categoryId ||
            group.tagId ||
            group.status ||
            group.deadlineCase;
          const tasks = group.tasks || [];
          console.log("fetchtask", fetchedAllTasks);
          return (
            <TaskList
              key={keys}
              allTasks={tasks}
              label={label.toUpperCase()}
              handleCompletedTask={handleCompletedTask}
              handleRemovedTask={handleRemovedTask}
              handleTaskClick={handleTaskClick}
              handleIsCreate={handleIsCreate}
              selectedTask={selectedTask}
            />
          );
        })
      ) : (
        <div className="mt-56 ml-10 mr-6 rounded-3xl pl-6 pt-5 pb-6 flex-1">
          <div className="flex justify-center ">
            <CreateButton onClick={handleIsCreate} />
          </div>
          <h3 className="text-4xl flex justify-center mt-4">No tasks yet</h3>
          <h3 className="text-2xl flex justify-center text-gray-400">
            Click on the + button to add one
          </h3>
        </div>
      )}

      {/* Popup Task Detail */}
      {selectedTask &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content">
              <TaskDetail onClose={handleCloseDetail} />
            </div>
          </div>,
          document.body
        )}

      {/* Popup Create Task */}
      {isCreate &&
        ReactDOM.createPortal(
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

export default GroupTaskForm;
