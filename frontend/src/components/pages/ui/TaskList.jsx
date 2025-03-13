import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
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
  const tasksToRender = Array.isArray(allTasks || tasks)
    ? allTasks || tasks
    : [];
  const filteredTasks = tasksToRender.filter((task) => {
    if (label === "Pending") return task.status === "pending";
    if (label === "Completed") return task.status === "completed";
    return true; // สำหรับ label อื่นๆ แสดงทั้งหมด
  });
  const [isHover, setIsHover] = useState({});
  const [isAnimate, setIsAnimate] = useState({});
  const animateRef = useRef(null);

  const completedWithAnimate = (task) => {
    if (animateRef.current) {
      clearTimeout(animateRef.current);
    }
    const animationType = task.status === "completed" ? "pending" : "complete";
    setIsAnimate((prev) => ({
      ...prev,
      [task._id]: { type: animationType, animating: true },
    }));
    animateRef.current = setTimeout(() => {
      handleCompletedTask(task);
      animateRef.current = null;
    }, 200);
  };

  const removedWithAnimate = (task) => {
    if (animateRef.current) {
      clearTimeout(animateRef.current);
    }
    setIsAnimate((prev) => ({
      ...prev,
      [task._id]: { type: "remove", animating: true },
    }));
    animateRef.current = setTimeout(() => {
      handleCompletedTask(task);
      animateRef.current = null;
    }, 200);
  };

  return (
    <div className=" pr-4 border-2 md:border-2 bg-[#1a1930] border-purpleNormal rounded-3xl p-6 md:mt- mx-4">
      <div className="flex justify-between mb-4 mr-3 ">
        <p className="text-white md:text-4xl flex items-center pr-24 w-[200px] md:w-auto">
          {label}
        </p>
        <CreateButton onClick={handleIsCreate} />
      </div>

      {/* ตรวจสอบว่ามี tasks หรือไม่ */}
      {filteredTasks.length === 0 ? null : (
        <div>
          <ul className="flex flex-col gap-4 overflow-y-scroll overflow-x-hidden scrollbar-custom  max-h-[350px] md:max-h-[250px]  lg:max-h-[570px] pr-1 ">
            {filteredTasks.map((task, index) => (
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
                  onMouseEnter={() =>
                    setIsHover((prev) => ({ ...prev, [task._id]: true }))
                  }
                  onMouseLeave={() =>
                    setIsHover((prev) => ({ ...prev, [task._id]: false }))
                  }
                  className={`bg-purpleMain borde border-purpleNormal hover:bg-purpleNormal trasition ease-out duration-100 flex items-center justify-between text-2xl p-3 rounded-2xl cursor-pointer text-white ${
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
                  ${
                    isAnimate[task._id]?.type === "pending"
                      ? "animate-fade-from-green"
                      : ""
                  }
                  ${
                    isAnimate[task._id]?.type === "complete"
                      ? "animate-fade-to-green"
                      : ""
                  }
                  ${
                    isAnimate[task._id]?.type === "remove"
                      ? "animate-fade-out"
                      : ""
                  }
                  `}
                >
                  <div className="flex items-center gap-4 flex-grow overflow-hidden ">
                    {task.status === "completed" ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="border-2 rounded-full text-sm p-1 hover:bg-purpleBorder"
                        onClick={(e) => {
                          e.stopPropagation();
                          completedWithAnimate(task);
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
                          completedWithAnimate(task);
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
                          <div className="w-28 pr-2">
                            <ProgressBar
                              color={{ start: "#642FE1", end: "#B53E6C" }}
                              value={Math.round(
                                task.progress.progressPercentage
                              )}
                            />
                          </div>
                          <span className="pl-1 pr-4">
                            {Math.round(task.progress.progressPercentage)}%
                          </span>
                          {/*   
      Tag is on process
                          {task.tag &&
                            task.tag.length > 0 &&
                            ["medium", "high"].includes(task.tag[0]) && (
                              <div
                                className={`w-10 h-2   rounded-full text-center text-opacity-0 text-white ${
                                  task.tag[0] === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-deadlineTheme"
                                }`}
                              >
                                {task.tag[0]}
                              </div>
                            )}
*/}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {isHover[task._id] && task.status === "pending" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removedWithAnimate(task);
                      }}
                      className="transition-opacity duration-200 ease-out opacity-100"
                    >
                      <FontAwesomeIcon icon={faXmark} className="delete-step" />
                    </button>
                  ) : (
                    <button>
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="opacity-0 px-2 py-1 "
                      />
                    </button>
                  )}
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
