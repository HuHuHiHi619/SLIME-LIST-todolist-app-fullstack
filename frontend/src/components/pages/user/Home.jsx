import React, { useEffect, useRef, useState } from "react";
import CreateTask from "../create/createTask";
import {
  completedTask,
  getData,
  removeTask,
  updateTask,
} from "../../../functions/task";
import TaskDetail from "../ui/taskDetail";
import TaskList from "../ui/TaskList";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [isCreate, setIsCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const popupRef = useRef(null);

  const handleIsCreate = () => {
    setIsCreate(!isCreate);
  };

  const handleAddTask = (newTask) => {
    setTasks((prevTask) => [...prevTask, newTask]);
    setIsCreate(false);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const response = await updateTask(taskId, updatedTask);
      if (response) {
        console.log("Task updated successfully!", response);
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, ...updatedTask } : task
        )
      );
    } catch (error) {
      console.error("Error cannot update task", error);
    }
  };

  const handleCompletedTask = async (taskId) => {
    try {
      const response = await completedTask(taskId);
      if (response) {
        console.log("Task completed successfully!", response);
      }

      setTasks((prevTasks) =>
        prevTasks
          .map((task) =>
            task._id === taskId ? { ...task, status: "completed" } : task
          )
          .filter((task) => task.status !== "completed")
      );
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleRemovedTask = async (task) => {
    // เปลี่ยนจาก taskId เป็น task
    try {
      const response = await removeTask(task._id); // ใช้ task._id แทน taskId
      if (response) {
        console.log("Task removed successfully!", response);
      }
      setTasks(
        (prevTask) => prevTask.filter((t) => t._id !== task._id) // ใช้ t แทน task เพื่อหลีกเลี่ยงความสับสน
      );
    } catch (error) {
      console.error("Error removing task", error);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getData({ status: "pending" });

      if (data) {
        console.log("Fetched tasks:", data);
        setTasks(data);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsCreate(false);
        setSelectedTask(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div id="home">
      <div className=" ml-10 border-4 border-purpleBorder rounded-xl px-6 py-8  w-[680px] ">
        <div className="flex">
          <h1 className="text-4xl pb-4">Today</h1>
          <button onClick={handleIsCreate}>Create task</button>
        </div>
        <div className="relative  ">
          {tasks.length > 0 ? (
            <TaskList
              tasks={tasks}
              handleCompletedTask={handleCompletedTask}
              handleTaskClick={handleTaskClick}
              handleRemovedTask={handleRemovedTask}
              selectedTask={selectedTask}
            />
          ) : (
            <div>
              <h3>You have no task</h3>
            </div>
          )}
        </div>
        {/*Popup Task detail*/}
        {selectedTask && (
          <div className="fixed top-20 right-20 w-[600px] ">
            <TaskDetail
              task={selectedTask}
              onClose={handleCloseDetail}
              onUpdateTask={handleUpdateTask}
            />
          </div>
        )}
        {/* Popup CreateTask*/}
        {isCreate && (
          <div className="popup-overlay">
            <div className="popup-content" ref={popupRef}>
              <CreateTask onAddTask={handleAddTask} />
              <button></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
