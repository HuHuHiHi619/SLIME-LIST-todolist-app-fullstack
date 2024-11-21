import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import StaggerContainer from "../animation/StaggerContainer";
import CreateButton from "./CreateButton";
import ProgressBar from "./ProgressBar";
function TaskList({
  handleCompletedTask,
  handleTaskClick,
  handleRemovedTask,
  selectedTask,
  handleIsCreate,
  label,
  allTasks,
}) {
  const { tasks } = useSelector((state) => state.tasks);

  return (
    <div className="pr-4 border-4 border-purpleNormal rounded-3xl p-5  ">
      <div className="flex justify-between mb-4 mr-3 ">
        <h1 className="text-white text-4xl flex items-center pr-40">{label}</h1>
        <CreateButton onClick={handleIsCreate} />
      </div>

      {/* ตรวจสอบว่ามี tasks หรือไม่ */}
      {(allTasks || tasks).length === 0 ? (
        <div className="flex justify-center items-center ">
          <button className="done-button" onClick={handleIsCreate}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      ) : (
        <div>
          <ul className="flex flex-col gap-4 overflow-y-scroll scrollbar-custom max-h-[570px] pr-1 ">
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
                  className={`bg-purpleMain hover:bg-purpleNormal trasition ease-out duration-100 flex items-center justify-between text-2xl p-3 rounded-2xl cursor-pointer text-white ${
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
                  <div className="flex items-center gap-4 flex-grow overflow-hidden ">
                    {task.status === "completed" ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="border-2 rounded-full text-sm p-1 hover:bg-purpleBorder"
                        onClick={(e)=> {
                          e.stopPropagation();
                          handleCompletedTask(task);
                        }}
                      />
                    ) : task.status === "failed" ? (
                      <FontAwesomeIcon
                      icon={faXmark}
                      className="border-2 rounded-full text-sm p-1 hover:bg-white hover:text-deadlineTheme"
                     
                    />
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

                    <div className="w-full">
                      <h3 className=" truncate max-w-[calc(100%-40px)] ">
                        {task.title}
                      </h3>
                      {task.status === "pending" &&
                      task.progress &&
                      task.progress.totalSteps > 0 ? (
                        <div className="flex items-center">
                          <span className="pr-4">
                            Progress : {task.progress.completedSteps}/
                            {task.progress.totalSteps}
                          </span>
                          <div className="w-32 pr-2">
                            <ProgressBar
                              color={{ start: "#642FE1", end: "#B53E6C" }}
                              value={Math.round(
                                task.progress.progressPercentage
                              )}
                            />
                          </div>
                          <span>
                            {Math.round(task.progress.progressPercentage)}%
                          </span>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
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
      )}
    </div>
  );
}

export default TaskList;
