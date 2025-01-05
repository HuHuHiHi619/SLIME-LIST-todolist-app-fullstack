import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import StaggerContainer from "../animation/StaggerContainer";
function SearchTaskList({
  handleCompletedTask,
  handleTaskClick,
  handleRemovedTask,
  selectedTask,
  allTasks,
}) {
  const { tasks } = useSelector((state) => state.tasks);
  return (
    <div className="   border-purpleNormal rounded-3xl pl-4 pt-4 pb-4 pr-2  ">
      <div>
        <ul className="flex flex-col gap-2 overflow-y-scroll scrollbar-custom max-h-[600px]  pr-2">
          <h1 className="text-2xl text-white">Result </h1>
          {(allTasks || tasks).map((task, index) => (
            <StaggerContainer key={index} index={index}>
              <li
                onClick={(e) => {
                  if (
                    e.target.closest("button") ||
                    e.target.type === "checkbox"
                  ) {
                    return;
                  }
                  e.preventDefault();
                  handleTaskClick(task);
                }}
                className={`bg-purpleMain hover:bg-purpleNormal trasition ease-out duration-100 flex items-center justify-between text-2xl px-4 py-2 rounded-md cursor-pointer text-white ${
                  selectedTask && selectedTask._id === task._id
                    ? "bg-purpleActiveTask  "
                    : ""
                }
                  ${
                    task.status === "completed"
                      ? "bg-completedTask hover:bg-completedTheme"
                      : task.status === "failed"
                      ? "bg-failedTask"
                      : ""
                  }  
                  `}
              >
                <div className="flex items-center gap-5 flex-grow overflow-hidden">
                  {task.status === "completed" ? (
                    <FontAwesomeIcon icon={faCheck} className="border-2 rounded-full text-sm p-1 hover:bg-purpleBorder" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={task?.status === "completed"}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCompletedTask(task);
                      }}
                      disabled={task?.status === "completed"}
                    />
                  )}

                  <h3 className="text-xl truncate max-w-[calc(100%-40px)]">
                    {task.title}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemovedTask(task);
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} className="delete-step" />
                </button>
              </li>
            </StaggerContainer>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchTaskList;
