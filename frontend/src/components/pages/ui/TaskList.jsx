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
      handleRemovedTask(task);
      animateRef.current = null;
    }, 200);
  };

  return (
    <div className="w-full min-w-0 mt-6 mx-4 border-2 bg-purpleSidebar border-purpleNormal rounded-3xl py-4 px-3 md:p-6">
    <div className="flex justify-between mb-4 mr-0 md:mr-3">
      <p className="text-white text-lg md:text-2xl flex items-center pr-2 md:pr-24 w-auto truncate">
        {label}
      </p>
      <CreateButton onClick={handleIsCreate} className="flex-shrink-0" />
    </div>
  
    {/* ตรวจสอบว่ามี tasks หรือไม่ */}
    {filteredTasks.length === 0 ? null : (
      <div className="w-full">
        <ul className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden scrollbar-custom max-h-[350px] md:max-h-[250px] lg:max-h-[570px] pr-1 w-full">
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
                className={`group flex items-center justify-between p-2 md:p-3 rounded-2xl cursor-pointer text-white
            border border-purpleNormal hover:bg-purpleNormal
            transition-all duration-300 ease-in-out
                   ${
                     selectedTask && selectedTask._id === task._id
                       ? "bg-purpleActiveTask"
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
                <div className="flex items-center gap-2 md:gap-4 flex-grow overflow-hidden">
                  {task.status === "completed" ? (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="border-2 rounded-full text-xs md:text-sm p-1 hover:bg-purpleBorder flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        completedWithAnimate(task);
                      }}
                    />
                  ) : task.status === "failed" ? (
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="border-2 rounded-full text-xs md:text-sm p-1 hover:bg-white hover:text-deadlineTheme flex-shrink-0"
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
                      className="flex-shrink-0"
                    />
                  )}
  
                  <div className="w-full min-w-0">
                    <h3 className=" md:text-xl truncate max-w-full">
                      {task.title}
                    </h3>
                    {task.status === "pending" &&
                    task.progress &&
                    task.progress.totalSteps > 0 ? (
                      <div className="items-center hidden md:flex flex-wrap">
                        <span className="pr-2 md:pr-4 text-sm">
                          Progress: {task.progress.completedSteps}/
                          {task.progress.totalSteps}
                        </span>
                        <div className="w-20 md:w-28 pr-2">
                          <ProgressBar
                            color={{ start: "#642FE1", end: "#B53E6C" }}
                            value={Math.round(
                              task.progress.progressPercentage
                            )}
                          />
                        </div>
                        <span className="pl-1 pr-2 md:pr-4 text-sm">
                          {Math.round(task.progress.progressPercentage)}%
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
  
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removedWithAnimate(task);
                  }}
                  className={`transition-opacity duration-200 ease-out  flex-shrink-0 ${
                    isHover[task._id] && task.status === "pending"
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                >
                  <FontAwesomeIcon icon={faXmark} className="delete-step text-xl" />
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
