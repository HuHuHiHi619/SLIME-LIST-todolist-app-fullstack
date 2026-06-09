import React, { useEffect, useState, useCallback, useRef } from "react";
import InputField from "../forms/inputField";
import StartDatePicker from "../forms/StartDatePicker";
import DeadlinePicker from "../forms/DeadlinePicker";
import ProgressField from "../dashboard/ProgressField";
import CategoryTagField from "../forms/CategoryTagField";
import PriorityField from "../forms/PriorityField";
import { toDayISO } from "../../functions/date";
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import FadeUpContainer from "../animation/FadeUpContainer";
import { useCategoriesQuery, useUpdateTaskMutation } from "../../hooks/queries/useTasks";

function TaskDetail({ onClose }) {
  const { selectedTask } = useSelector((state) => state.ui);
  const { data: categories = [] } = useCategoriesQuery();
  const updateMutation = useUpdateTaskMutation();

  const [isUpdating, setIsUpdating] = useState(false);
  const [editedTask, setEditedTask] = useState(selectedTask || {});
  const [currentStep, setCurrentStep] = useState("");

  // mutate is stable across renders (TQ guarantee) — safe to close over in a ref-initialized debounce
  const debouncedUpdateTask = useRef(
    debounce((taskData) => {
      setIsUpdating(true);
      updateMutation.mutate(
        { taskId: taskData._id, taskData },
        { onSettled: () => setIsUpdating(false) }
      );
    }, 500)
  ).current;

  useEffect(() => {
    if (!isUpdating && selectedTask) {
      setEditedTask(selectedTask);
    }
  }, [selectedTask?._id]);

  useEffect(() => {
    return () => {
      debouncedUpdateTask.flush();
    };
  }, [debouncedUpdateTask]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const updatedValue = value.trim() === "" ? "" : value;
      setEditedTask((prevTask) => {
        const next = { ...prevTask };
        if (name === "category") {
          if (value === "no category") {
            next[name] = "";
          } else {
            const selectedCat = categories.find(
              (category) => category.categoryName === value
            );
            next[name] = selectedCat ? selectedCat : "";
          }
        } else {
          next[name] = updatedValue;
        }
        debouncedUpdateTask(next);
        return next;
      });
    },
    [categories, debouncedUpdateTask]
  );

  const handleStepChange = useCallback((e) => {
    setCurrentStep(e.target.value);
  }, []);

  const handleDateChange = useCallback(
    (date, field) => {
      setEditedTask((prevTask) => {
        const next = { ...prevTask, [field]: toDayISO(date) };
        debouncedUpdateTask(next);
        return next;
      });
    },
    [debouncedUpdateTask]
  );

  const handleStepKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && currentStep.trim() !== "") {
        setEditedTask((prevTask) => {
          const updatedSteps = [
            ...(prevTask.progress?.steps || []),
            { label: currentStep, completed: false },
          ];
          const next = {
            ...prevTask,
            progress: {
              ...prevTask.progress,
              steps: updatedSteps,
              totalSteps: updatedSteps.length,
              allStepsCompleted:
                updatedSteps.length > 0
                  ? updatedSteps.every((step) => step.completed)
                  : false,
            },
          };
          debouncedUpdateTask(next);
          return next;
        });
        setCurrentStep("");
      }
    },
    [currentStep, debouncedUpdateTask]
  );

  const removeProgressStep = useCallback(
    (index) => {
      setEditedTask((prevTask) => {
        const updatedSteps =
          prevTask.progress?.steps.filter((_, i) => i !== index) || [];
        const next = {
          ...prevTask,
          progress: {
            ...prevTask.progress,
            steps: updatedSteps,
            totalSteps: updatedSteps.length,
            allStepsCompleted:
              updatedSteps.length > 0
                ? updatedSteps.every((step) => step.completed)
                : false,
          },
        };
        debouncedUpdateTask(next);
        return next;
      });
    },
    [debouncedUpdateTask]
  );

  const completeProgressStep = useCallback(
    (index) => {
      setEditedTask((prevTask) => {
        const updatedSteps =
          prevTask.progress?.steps.map((step, i) =>
            i === index ? { ...step, completed: !step.completed } : step
          ) || [];

        const next = {
          ...prevTask,
          progress: {
            steps: updatedSteps,
            totalSteps: updatedSteps.length,
            allStepsCompleted:
              updatedSteps.length > 0
                ? updatedSteps.every((step) => step.completed)
                : false,
          },
        };
        debouncedUpdateTask(next);
        return next;
      });
    },
    [debouncedUpdateTask]
  );

  return (
    <FadeUpContainer>
      <div className="bg-darkBackground p-6 rounded-3xl">
        <div className="flex justify-between items-center">
          <p className="text-white text-3xl ">TASK DETAILS</p>
          <div className="flex items-center gap-6 ">
            <p
              className={`text-2xl  ${
                editedTask.status === "pending"
                  ? "pending"
                  : editedTask.status === "failed"
                  ? "failed"
                  : "completed"
              } uppercase   `}
            >
              {editedTask.status}
            </p>
          </div>
        </div>
        <div className="flex flex-col  ">
          <div className="py-4">
            <InputField
              type="text"
              name="title"
              placeholder="Title"
              value={editedTask.title || ""}
              onChange={handleInputChange}
              className="text-3xl w-full border-none rounded-xl "
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2 pb-4">
            <CategoryTagField
              name="category"
              value={editedTask.category?.categoryName}
              entities={categories}
              placeholder="CATEGORY"
              handleInputChange={handleInputChange}
              showTag={false}
            />
            <StartDatePicker
              id="startDate"
              name="startDate"
              selected={editedTask.startDate}
              onChange={(date) => handleDateChange(date, "startDate")}
              placeholder="START DATE"
            />
            <DeadlinePicker
              id="deadline"
              name="Deadline"
              selected={editedTask.deadline}
              onChange={(date) => handleDateChange(date, "deadline")}
              placeholder="DEADLINE"
            />
            <PriorityField
              name="priority"
              value={editedTask.priority || "low"}
              handleInputChange={handleInputChange}
            />
          </div>
          <textarea
            type="text"
            name="note"
            placeholder="Note"
            value={editedTask.note || ""}
            onChange={handleInputChange}
            className="scrollbar-custom w-full text-xl text-white bg-purpleMain rounded-lg p-2 px-4 border-0.5 border-transparent focus:outline-none focus:ring focus:ring-purple-400 focus:border-purple-400 "
          />
          <div className="flex flex-col gap-4 mt-4 mb-2">
            <div>
              <InputField
                type="text"
                name="progress"
                placeholder="Type a subtask and press enter"
                value={currentStep || ""}
                onChange={handleStepChange}
                onKeyDown={handleStepKeyDown}
                className="text-xl w-full px-4 py-3 rounded-xl "
              />
            </div>
            <div className="px-2">
              <ProgressField
                steps={editedTask.progress?.steps || []}
                handleRemoveStep={removeProgressStep}
                handleStepComplete={completeProgressStep}
                showCompletion={true}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center">
          <button className="register mt-4" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </FadeUpContainer>
  );
}

export default TaskDetail;
