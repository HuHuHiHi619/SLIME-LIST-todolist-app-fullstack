import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function TaskList({tasks,handleCompletedTask,handleTaskClick,handleRemovedTask,selectedTask}) {
  return (
    <div className="mr-2">
    <ul className="flex flex-col gap-6 ">
      {tasks.map((task, index) => (
        <li
          key={index}
          onClick={() => handleTaskClick(task)} 
          className={`flex items-center justify-between text-[30px] bg-purpleNormal p-4 rounded-md text-white ${selectedTask && selectedTask._id === task._id ? "bg-purpleActiveTask" : ""}`}
        >
          <div className="flex items-center gap-5 flex-grow overflow-hidden">
            <input
              type="checkbox"
              checked={task.status === "completed"}
              onChange={() => handleCompletedTask(task._id)}
              disabled={task.status === "completed"}
            />
            <span className="task-title truncate max-w-[calc(100%-40px)]">{task.title}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemovedTask(task)}
            }
              
          ><FontAwesomeIcon icon={faTrash}  className="delete-step"/></button>
        </li>
      ))}
    </ul>
  </div>
  );
}

export default TaskList;
