import React, { useEffect, useState, useCallback, useRef } from "react";
import InputField from "./inputField";
import StartDatePicker from "./StartDatePicker";
import DeadlinePicker from "./DeadlinePicker";
import ProgressField from "./ProgressField";
import CategoryTagField from "./CategoryTagField";
import {
  updatedTask,
  fetchCategories,
  updatedTaskAttempt,
} from "../../../redux/taskSlice";

import { useDispatch, useSelector } from "react-redux";
import FadeUpContainer from "../animation/FadeUpContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import {
  fetchNotification,
  fetchSummary,
  fetchSummaryByCategory,
} from "../../../redux/summarySlice";

function TaskDetail({ onClose }) {
  const dispatch = useDispatch();
  const { selectedTask } = useSelector((state) => state.tasks);
  const categories = useSelector((state) => state.tasks.categories);

  const [isUpdating, setIsUpdating] = useState(false);
  const [editedTask, setEditedTask] = useState(selectedTask);
  const [editedProgress, setEditedProgress] = useState(
    selectedTask?.progress || {
      steps: [],
      totalSteps: 0,
      allStepsComplete: false,
    }
  );
  const [currentStep, setCurrentStep] = useState("");
  // ref for debounce
  const pendendingUpdateRef = useRef(null);
  const updatedTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isUpdating && selectedTask) {
      setEditedTask(selectedTask);
      setEditedProgress(
        selectedTask.progress || {
          steps: [],
          totalSteps: 0,
          allStepsCompleted: false,
        }
      );
    }
  }, [selectedTask, isUpdating]);

  // seperate function for update task on server
  const updateTaskOnServer = useCallback(
    async (taskData) => {
      try {
        setIsUpdating(true);
        const taskId = taskData._id;
        const result = await dispatch(
          updatedTask({ taskId, taskData })
        ).unwrap();

        if (result) {
          await Promise.all([
            dispatch(fetchSummaryByCategory()),
            dispatch(fetchSummary()),
            dispatch(fetchNotification()),
          ]);
        }
      } catch (error) {
        console.error("Failed to update task:", error);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [dispatch]
  );

  const debouncedUpdateTask = useCallback(
    (updatedTask) => {
      // save latest data to ref
      pendendingUpdateRef.current = updatedTask;
      // cancel previous timeout if exists
      if (updatedTimeoutRef.current) {
        clearTimeout(updatedTimeoutRef.current);
      }
      // set new timeout
      updatedTimeoutRef.current = setTimeout(async () => {
        // check data is ready or not , updating
        if (pendendingUpdateRef.current && !isUpdating) {
          await updateTaskOnServer(pendendingUpdateRef.current);
          pendendingUpdateRef.current = null;
        }
      }, 500);
    },
    [updateTaskOnServer, isUpdating]
  );

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setEditedTask((prevTask) => {
        const updatedTask = { ...prevTask };
        if (name === "category") {
          if (value === "no category") {
            updatedTask[name] = "";
          } else {
            const selectedCat = categories.find(
              (category) => category.categoryName === value
            );
            updatedTask[name] = selectedCat ? selectedCat : "";
          }
        } else {
          updatedTask[name] = value;
        }
        // sent to debounce
        debouncedUpdateTask(updatedTask);
        return updatedTask;
      });
    },
    [debouncedUpdateTask, categories]
  );

  const handleStepChange = useCallback((e) => {
    setCurrentStep(e.target.value);
  }, []);

  const handleDateChange = useCallback(
    (date, field) => {
      setEditedTask((prevTask) => {
        // แปลง date เป็น string เพื่อเก็บใน redux
        const formattedDate = date instanceof Date ? date.toISOString() : date;
        const updatedTask = { ...prevTask, [field]: formattedDate };

        debouncedUpdateTask(updatedTask);
        return updatedTask;
      });
    },
    [debouncedUpdateTask]
  );

  /* const handleToggleTag = useCallback(
    (tag) => {
      setEditedTask((prevTask) => {
        const isTagSelected =
          Array.isArray(prevTask.tag) &&
          prevTask.tag.some((t) =>
            typeof t === "string" ? t === tag : t._id === tag._id
          );

        // If the tag is already selected, deselect it (set to an empty array)
        const updatedTags = isTagSelected ? [] : [tag];

        const updatedSelectTask = { ...prevTask, tag: updatedTags };
        debouncedUpdateTask(updatedSelectTask);
        return updatedSelectTask;
      });
    },
    [debouncedUpdateTask]
  );*/

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

          setEditedTask((prevTask) => {
            const updatedTask = {
              ...prevTask,
              progress: updatedProgress,
            };

            // ส่งข้อมูลไปเข้าคิว debounce
            debouncedUpdateTask(updatedTask);

            return updatedTask;
          });

          setCurrentStep("");
          return updatedProgress;
        });
      }
    },
    [currentStep, debouncedUpdateTask]
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
        setEditedTask((prevTask) => {
          const updatedTask = {
            ...prevTask,
            progress: updatedProgress,
          };
          debouncedUpdateTask(updatedTask);
          return updatedTask;
        });

        return updatedProgress;
      });
    },
    [debouncedUpdateTask]
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
        setEditedTask((prevTask) => {
          const updatedTask = {
            ...prevTask,
            progress: updatedProgress,
          };
          debouncedUpdateTask(updatedTask);
          return updatedTask;
        });

        return updatedProgress;
      });
    },
    [debouncedUpdateTask]
  );

  const handleTryAgainTask = (taskId) => {
    dispatch(updatedTaskAttempt(taskId));
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (updatedTimeoutRef.current) {
        clearTimeout(updatedTimeoutRef.current);
      }
    };
  }, []);

  return (
    <FadeUpContainer>
      
        <div className="bg-purpleSidebar p-6 rounded-xl">
          <div className="flex justify-between items-center">
            <p className="text-white text-xl">TASK DETAILS</p>
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

              <p
                className={`  ${
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
                className="text-3xl w-full border-none py-0"
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
            </div>
            <textarea
              type="text"
              name="note"
              placeholder="Note"
              value={editedTask.note || ""}
              onChange={handleInputChange}
              className=" scrollbar-custom w-full  text-xl text-white  bg-darkBackground rounded-lg p-2 px-4 focus:outline-none focus:border-purple-400"
            />
            <div className="flex flex-col gap-4 mt-4 mb-2">
              <div>
                <InputField
                  type="text"
                  name="progress"
                  placeholder="Enter a step "
                  value={currentStep || ""}
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

          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {/*
         -- Tag is on process --
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`px-4 py-2 mt-2 rounded-xl ${
                  editedTask.tag.includes(tag)
                    ? "bg-purpleBorder text-white"
                    : "bg-purpleMain text-gray-500"
                }`}
              >
                {tag.toUpperCase()}
              </button>
            ))}*/}
              </div>
            </div>
            <button className="done-button mt-4" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
    
    </FadeUpContainer>
  );
}

export default TaskDetail;
