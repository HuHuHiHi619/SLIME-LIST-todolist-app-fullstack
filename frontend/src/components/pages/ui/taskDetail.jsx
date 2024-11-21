import React, { useEffect, useState, useCallback, useMemo } from "react";
import InputField from "./inputField";
import { debounce } from "lodash";
import StartDatePicker from "./StartDatePicker";
import DeadlinePicker from "./DeadlinePicker";
import ProgressField from "./ProgressField";
import CategoryTagField from "./CategoryTagField";
import {
  updatedTask,
  fetchCategories,
  fetchTags,
  updatedTaskAttempt
} from "../../../redux/taskSlice";
import { useDispatch, useSelector } from "react-redux";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

function TaskDetail({ onClose }) {
  const dispatch = useDispatch();
  const { selectedTask, tags } = useSelector((state) => state.tasks);
  const categories = useSelector((state) => state.tasks.categories);

  const [editedTask, setEditedTask] = useState(selectedTask);
  const [editedProgress, setEditedProgress] = useState(
    selectedTask?.progress || {
      steps: [],
      totalSteps: 0,
      allStepsComplete: false,
    }
  );
  const [currentStep, setCurrenStep] = useState("");

  useEffect(() => {
    setEditedTask(selectedTask);
    setEditedProgress(
      selectedTask.progress || {
        steps: [],
        totalSteps: 0,
        allStepsCompleted: false,
      }
    );
  }, [selectedTask]);

  const debouncedUpdateTask = useMemo(
    () =>
      debounce((updatedSelectTask) => {
        const taskId = updatedSelectTask._id;
        dispatch(updatedTask({ taskId, taskData: updatedSelectTask }));
      }, 500),
    [dispatch, selectedTask._id]
  );
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const updatedSelectTask = { ...editedTask };

      if (name === "category") {
        const selectedCat = categories.find(
          (category) => category.categoryName === value
        );
        updatedSelectTask[name] = selectedCat ? selectedCat : "";
      } else if (name === "tag" && value) {
        const selectedTag = tags.find((tag) => tag.tagName === value); // Find the full tag object
        if (
          selectedTag &&
          !updatedSelectTask.tag.some((tag) => tag._id === selectedTag._id)
        ) {
          updatedSelectTask.tag = [
            ...(updatedSelectTask.tag || []),
            selectedTag,
          ]; // Add full tag object
        }
      } else {
        updatedSelectTask[name] = value;
      }

      setEditedTask(updatedSelectTask);
      debouncedUpdateTask(updatedSelectTask);
    },
    [editedProgress, editedTask, debouncedUpdateTask, categories, tags] // Added tags as a dependency
  );

  const handleRemoveTag = (e, removingTag) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedTags = editedTask.tag.filter(
      (tag) => tag._id !== removingTag._id
    );
    console.log("updatedtag", updatedTags);
    setEditedTask((prev) => ({ ...prev, tag: updatedTags })); // Update editedTask
    debouncedUpdateTask({ ...editedTask, tag: updatedTags }); // Update task
  };

  const handleStepChange = useCallback((e) => {
    setCurrenStep(e.target.value);
  });

  const handleDateChange = useCallback(
    (date, field) => {
      setEditedTask((prevTask) => {
        // แปลง date เป็น string เพื่อเก็บใน redux
        const formattedDate = date instanceof Date ? date.toISOString() : date;
        const updatedSelectTask = { ...prevTask, [field]: formattedDate };
        console.log("Updated date:", updatedSelectTask);
        debouncedUpdateTask(updatedSelectTask);
        return updatedSelectTask;
      });
    },
    [editedProgress, editedTask, debouncedUpdateTask]
  );

  const handleStepKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && currentStep.trim() !== "") {
        setEditedProgress((prevProgress) => {
          const newStep = { label: currentStep, completed: false };

          const updatedSteps = [...(prevProgress.steps || []), newStep];
          const updatedProgress = {
            ...prevProgress,
            steps: updatedSteps,
            totalSteps: updatedSteps.length,
            allStepsComplete: updatedSteps.every((step) => step.completed),
          };
          const updatedSelectTask = {
            ...editedTask,
            progress: updatedProgress,
          };
          debouncedUpdateTask(updatedSelectTask);
          setCurrenStep("");
          return updatedProgress;
        });
      }
    },
    [currentStep, debouncedUpdateTask, editedTask]
  );

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
        const updatedSelectTask = { ...editedTask, progress: updatedProgress };
        console.log("allstep", updatedProgress.allStepsCompleted);
        debouncedUpdateTask(updatedSelectTask);
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
        const updatedSelectTask = { ...editedTask, progress: updatedProgress };
        console.log("Updated Progress for Step Completion:", updatedProgress);
        debouncedUpdateTask(updatedSelectTask);
        return updatedProgress;
      });
    },
    [editedProgress, editedTask, debouncedUpdateTask]
  );

  const handleTryAgainTask = (taskId) => {
    dispatch(updatedTaskAttempt(taskId)); 
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(
    () => {
      console.log("Categories:", categories);
      console.log("Tags:", tags);
    },
    [categories],
    [tags]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateTask.cancel();
    };
  }, [debouncedUpdateTask]);

  return (
    <FadeUpContainer>
      <div className="bg-darkBackground w-[800px] mt-6 p-6 rounded-xl ">
        <div className="flex justify-between items-center">
          <h1 className="text-white ">TASK DETAILS</h1>
          <div className="flex items-center gap-6 ">
            {editedTask.status === "failed" && (
              <FontAwesomeIcon
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTryAgainTask(selectedTask._id);
                }}
                icon={faRotateLeft}
                className="text-white text-3xl cursor-pointer hover:rotate-[-360deg] transition-transform duration-300 ease-in"
              />
            )}

            <h1
              className={`text-white ${
                editedTask.status === "pending"
                  ? "pending"
                  : editedTask.status === "failed"
                  ? "failed"
                  : "completed"
              } uppercase`}
            >
              {editedTask.status}
            </h1>
          </div>
        </div>
        <div className="flex flex-col ">
          <div className="py-4">
            <InputField
              type="text"
              name="title"
              placeholder="Title"
              value={editedTask.title}
              onChange={handleInputChange}
              className="text-3xl w-full border-none py-0"
            />
          </div>
          <div className="flex  gap-2 pb-4">
            <CategoryTagField
              name="category"
              value={editedTask.category?.categoryName || ""}
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
          </div>
          <textarea
            type="text"
            name="note"
            placeholder="Note"
            value={editedTask.note}
            onChange={handleInputChange}
            className=" scrollbar-custom w-full  text-xl text-white  bg-purpleMain rounded-lg p-2 px-4 focus:outline-none focus:border-purple-400"
          />
          <div className="flex flex-col gap-4 mt-4 mb-2">
            <div>
              <InputField
                type="text"
                name="progress"
                placeholder="Enter a step "
                value={currentStep}
                onChange={handleStepChange}
                onKeyDown={handleStepKeyDown}
                className="text-xl w-full px-4 py-3 rounded-xl "
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

        <CategoryTagField
          name="tag"
          value={editedTask.tag.length > 0 ? editedTask.tag[0] : ""}
          selectedTags={editedTask.tag}
          entities={tags}
          placeholder="Tag"
          handleInputChange={handleInputChange}
          handleRemoveTag={handleRemoveTag}
          showTag={true}
        />
        <div className="flex justify-end">
          <button className="done-button mt-4" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </FadeUpContainer>
  );
}

export default React.memo(TaskDetail);
