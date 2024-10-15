import React, { useEffect, useState, useCallback, useMemo } from "react";
import InputField from "./inputField";
import { debounce } from "lodash";
import StartDatePicker from "./StartDatePicker";
import DeadlinePicker from "./DeadlinePicker";
import ProgressField from "./ProgressField";

function TaskDetail({ task, onClose, onUpdateTask }) {
  const [editedTask, setEditedTask] = useState({
    title: "",
    note: "",
    startDate: null,
    deadline: null,
    category: "",
    tag: [],
  });

  const [editedProgress, setEditedProgress] = useState({
    steps: [],
    totalSteps: 0,
    allStepsCompleted: false,
    history: {
      steps: [],
      timestamps: new Date(),
    },
  });

  const [currentStep, setCurrenStep] = useState("");

  useEffect(() => {
    setEditedTask(task);
   
    setEditedProgress(task.progress || { steps: [], totalSteps: 0 , allStepsCompleted: false});
  }, [task]);

  const debouncedUpdateTask = useMemo(
    () =>
      debounce((updatedTask) => {
        onUpdateTask(task._id, updatedTask);
      }, 500),
    [onUpdateTask, task._id]
  );

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setEditedTask((prevTask) => {
        const updatedTask = { ...prevTask, [name]: value };
        debouncedUpdateTask(updatedTask);
        return updatedTask;
      });
    },
    [editedProgress, editedTask, debouncedUpdateTask]
  );

  const handleStepChange = useCallback((e) => {
    setCurrenStep(e.target.value)
  })

  const handleDateChange = useCallback(
    (date, field) => {
      setEditedTask((prevTask) => {
        // แปลง date เป็นสตริงในรูปแบบที่ถูกต้อง
        const formattedDate = date instanceof Date ? date.toISOString() : date;
        const updatedTask = { ...prevTask, [field]: formattedDate };
        console.log("Updated date:", updatedTask);
        debouncedUpdateTask(updatedTask);
        return updatedTask;
      });
    },
    [editedProgress, editedTask, debouncedUpdateTask]
  );

  const handleStepKeyDown = useCallback((e) => {
    if(e.key ==='Enter'&& currentStep.trim() !== ''){
      setEditedProgress((prevProgress) => {
        const newStep = { label: currentStep, completed: false}

        const updatedSteps = [...prevProgress.steps || [],newStep];
        const updatedProgress = {
          ...prevProgress,
          steps: updatedSteps,
          totalSteps:updatedSteps.length,
          allStepsComplete:updatedSteps.every((step) => step.completed),
        }
        const updatedTask = { ...editedTask, progress: updatedProgress };
        debouncedUpdateTask(updatedTask);
        setCurrenStep('')
        return updatedProgress;
      })
    }
  },[currentStep,debouncedUpdateTask,editedTask])

  const removeProgressStep = useCallback(
    (index) => {
      setEditedProgress((prevProgress) => {
        const updatedSteps = prevProgress.steps.filter((_, i) => i !== index);
        const updatedProgress = {
          ...prevProgress,
          steps: updatedSteps,
          totalSteps: updatedSteps.length,
          allStepsCompleted:
            updatedSteps.length > 0 &&
            updatedSteps.every((step) => step.completed),
        };
        const updatedTask = { ...editedTask, progress: updatedProgress };
        console.log("allstep", updatedProgress.allStepsCompleted);
        debouncedUpdateTask(updatedTask);
        return updatedProgress;
      });
    },
    [editedProgress, editedTask, debouncedUpdateTask]
  );

  const completeProgressStep = useCallback(
    (index) => {
      setEditedProgress((prevProgress) => {
        const updatedSteps = prevProgress.steps.map(
          (step, i) =>
            i === index ? { ...step, completed: !step.completed } : step // Toggle the completed state
        );
        const allStepsCompleted =
          updatedSteps.length > 0 &&
          updatedSteps.every((step) => step.completed);
        const updatedProgress = {
          ...prevProgress,
          steps: updatedSteps,
          allStepsCompleted: allStepsCompleted,
        };
        const updatedTask = { ...editedTask, progress: updatedProgress };
        console.log("Updated Progress for Step Completion:", updatedProgress);
        debouncedUpdateTask(updatedTask);
        return updatedProgress;
      });
    },
    [editedProgress, editedTask, debouncedUpdateTask]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateTask.cancel();
    };
  }, [debouncedUpdateTask]);

  return (
    <div className="border-purpleBorder border-4 mt-6 p-6 rounded-xl ">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl">Task Detail</h1>
        <h1 className="text-white text-2xl pending uppercase">{editedTask.status}</h1>
      </div>
      <div className="flex flex-col ">
        <div className="py-4">
          <InputField
            type="text"
            name="title"
            placeholder="Title"
            value={editedTask.title}
            onChange={handleInputChange}
            className="text-4xl w-full border-none  py-0"
          />
        </div>
        <div className="flex gap-2 pb-4">
          <StartDatePicker
            id="startDate"
            name="startDate"
            selected={editedTask.startDate}
            onChange={(date) => handleDateChange(date, "startDate")}
            placeholder="Start Date"
          />
          <DeadlinePicker
            id="deadline"
            name="Deadline"
            selected={editedTask.deadline}
            onChange={(date) => handleDateChange(date, "deadline")}
            placeholder="Deadline"
          />
        </div>
        <textarea
          type="text"
          name="note"
          placeholder="Note"
          value={editedTask.note}
          onChange={handleInputChange}
          className=" scrollbar-custom w-full  text-2xl text-white border-purpleBorder border-[2px] bg-transparent rounded-lg p-4 px-4 focus:outline-none focus:border-purple-400"
        />
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <InputField
              type="text"
              name="progress"
              placeholder="Enter a step "
              value={currentStep}
              onChange={handleStepChange}
              onKeyDown={handleStepKeyDown}
              className="text-2xl w-full "
            />
          </div>
          <div className="px-2">
            <ProgressField
              steps={editedProgress.steps}
              handleRemoveStep={removeProgressStep}
              handleStepComplete={completeProgressStep}
              showCompletion={true}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="done-button mt-6" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

export default React.memo(TaskDetail);
