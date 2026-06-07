import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFormTask,
  addSteps,
  removeStep,
  fetchCategories,
  createNewTask,
} from "../../../redux/taskSlice";
import "react-datepicker/dist/react-datepicker.css";
import InputField from "../ui/inputField";
import DeadlinePicker from "../ui/DeadlinePicker";
import StartDatePicker from "../ui/StartDatePicker";
import CategoryTagField from "../ui/CategoryTagField";
import PriorityField from "../ui/PriorityField";
import ProgressField from "../ui/ProgressField";
import Tooltip from "../ui/Tooltip";
import FadeUpContainer from "../animation/FadeUpContainer";
import { toDayISO } from "../../../functions/date";
import {
  fetchSummary,
  fetchSummaryByCategory,
} from "../../../redux/summarySlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function CreateTask({ onClose }) {
  const dispatch = useDispatch();
  const { formTask, progress, categories } = useSelector(
    (state) => state.tasks
  );
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState("");

  const validator = () => {
    setError("");
    if (!formTask.title) {
      setError("Title is required.");
      return false;
    }

    if (formTask.title.length > 50) {
      setError("Title cannot more than 50 characters.");
      return false;
    }
    if (formTask.note.length > 200) {
      setError("Note cannot more than 200 characters.");
      return false;
    }
    if (currentStep.length > 50) {
      setError("Step cannot more than 50 characters");
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "progress") {
      setCurrentStep(value);
    } else {
      dispatch(setFormTask({ [name]: value }));
    }
  };

  const handleAddProgress = (e) => {
    if (e.key === "Enter" && currentStep.trim() !== "") {
      e.preventDefault();
      const newStep = { label: currentStep, completed: false };
      dispatch(addSteps(newStep));
      setCurrentStep("");
    }
  };

  const handleDateChange = (date, field) => {
    if (field === "startDate") {
      dispatch(setFormTask({ startDate: toDayISO(date) ?? toDayISO(new Date(new Date().setHours(0, 0, 0, 0))) }));
    } else if (field === "deadline") {
      dispatch(setFormTask({ deadline: toDayISO(date) }));
    }
  };

  const handleRemoveStep = (index) => {
    dispatch(removeStep(index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validator()) {
      return;
    }

    const taskData = {
      ...formTask,
      priority: formTask.priority || "low",
      progress,
      startDate: formTask.startDate || toDayISO(new Date(new Date().setHours(0, 0, 0, 0))),
    };

    try {
      await dispatch(createNewTask(taskData)).unwrap();
      try {
        await dispatch(fetchSummary()).unwrap();
        await dispatch(fetchSummaryByCategory()).unwrap();
      } catch {
        // summary refresh is non-fatal; task was created
      }
      onClose();
    } catch (error) {
      setError("Failed to create task. Please try again.");
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <FadeUpContainer>
      <div className="relative">
        <div className="bg-purpleSidebar p-6 rounded-3xl">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center">
              <h1 className="text-white tracking-wide pl-1 text-3xl">CREATE A TASK</h1>
              <Tooltip description={"Close"} position="top">
                <FontAwesomeIcon
                  icon={faXmark}
                  onClick={onClose}
                  className="delete-step text-xl text-gray-400"
                />
              </Tooltip>
            </div>

            <div className="flex flex-col gap-4 my-4">
              {error && <p className="text-red-500 text-xl ">{error}</p>}
              <InputField
                type="text"
                placeholder="Title"
                id="title"
                name="title"
                value={formTask.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border  text-xl border-gray-300 rounded-xl "
              />
              <InputField
                type="text"
                placeholder="Note"
                id="note"
                name="note"
                value={formTask.note || ""}
                onChange={handleInputChange}
                className="px-4 py-2 rounded-xl text-xl "
              />
            </div>

            <div className="flex flex-col gap-2 md:flex-row ">
              <CategoryTagField
                name="category"
                value={formTask.category || ""}
                entities={categories}
                placeholder="CATEGORY"
                handleInputChange={handleInputChange}
                showTag={false}
              />
              <StartDatePicker
                id="startDate"
                name="startDate"
                selected={
                  formTask.startDate ? new Date(formTask.startDate) : new Date(new Date().setHours(0, 0, 0, 0))
                }
                onChange={(date) => handleDateChange(date, "startDate")}
                placeholder="START DATE"
              />
              <DeadlinePicker
                id="deadline"
                name="Deadline"
                selected={
                  formTask.deadline ? new Date(formTask.deadline) : null
                }
                onChange={(date) => handleDateChange(date, "deadline")}
                placeholder="DEADLINE"
              />
              <PriorityField
                name="priority"
                value={formTask.priority || "low"}
                handleInputChange={handleInputChange}
              />
            </div>

            <div className=" my-4 flex flex-col gap-2">
              <h3 className="text-white text-2xl pl-1">Progress :</h3>
              <div className="flex flex-col gap-2">
                <InputField
                  type="text"
                  placeholder="Type a subtask and press Enter"
                  name="progress"
                  id="progress"
                  value={currentStep}
                  onChange={handleInputChange}
                  onKeyDown={handleAddProgress}
                  className="px-4 py-2 rounded-xl md:text-xl "
                />
                <ProgressField
                  steps={progress.steps}
                  handleRemoveStep={handleRemoveStep}
                  showCompletion={false}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
    
                </div>
              </div>
              <button
                type="submit"
                className="register tracking-wider"
              >
                CREATE
              </button>
            </div>
          </form>
        </div>
      </div>
    </FadeUpContainer>
  );
}

export default CreateTask;
