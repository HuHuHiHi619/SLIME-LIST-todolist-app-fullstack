import React , { Suspense }from "react";
import ReactDOM from "react-dom";
import TaskList from "../ui/TaskList";
import CreateTask from "../create/CreateTask";
import { useSelector } from "react-redux";
import useFetchTask from "../hooks/useFetchTask";
import usePopup from "../hooks/usePopup";
import CreateButton from "../ui/CreateButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

 const TaskDetail = React.lazy(() =>  import("../ui/taskDetail"))

function GroupTaskForm({ filter }) {
  const { selectedTask, isCreate, isSideBarPinned } = useSelector(
    (state) => state.tasks
  );
  const { tasks: fetchedAllTasks } = useFetchTask(filter);
  const {
    handleIsCreate,
    handleRemovedAllTask,
    handleCloseDetail,
    handleTaskClick,
    handleCompletedTask,
    handleRemovedTask,
    popupRef,
  } = usePopup();

  return (
    <div className="md:flex-row md:gap-6 md:ml-28  flex flex-col gap-4  items-start ">
      {fetchedAllTasks &&
      Array.isArray(fetchedAllTasks) &&
      fetchedAllTasks.length > 0 ? (
        fetchedAllTasks.map((group, index) => {
          const label =
            group.categoryName || group.status || group.deadlineCase;
          const keys = `
            ${group.categoryId || group.status || group.deadlineCase}-${index}`;
          const tasks = group.tasks || [];

          return (
            <div key={keys}>
              {label.toLowerCase() === "completed" &&
                tasks.filter((task) => task.status === "completed").length >
                  0 &&
                !isSideBarPinned && (
                  <button
                    className="red-button clear-allTask absolute"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemovedAllTask();
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="pr-2" />
                    Clear completed
                  </button>
                )}
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
            </div>
          );
        })
      ) : (
        <div className="md:mt-64 md:pt-0 pt-40 mx-24 rounded-3xl flex-1 ">
          <div className="flex justify-center">
            <CreateButton onClick={handleIsCreate} />
          </div>
          <p className="text-xl md:text-4xl text-white flex justify-center mt-4">
            You have no task
          </p>
          <p className="text-lg md:text-2xl text-gray-400 flex justify-center">
            Click on the + button to
          </p>
          <p className="text-lg md:text-2xl text-gray-400 flex justify-center">
            create a task
          </p>
        </div>
      )}

      {/* Popup Task Detail */}
      {selectedTask &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content">
              <Suspense fallback={<></>}>
                <TaskDetail onClose={handleCloseDetail} />
              </Suspense>
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
