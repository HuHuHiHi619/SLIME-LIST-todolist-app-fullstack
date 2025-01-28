import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFormTask,
  resetFormTask,
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
import ProgressField from "../ui/ProgressField";
import FadeUpContainer from "../animation/FadeUpContainer";
import {
  fetchSummary,
  fetchSummaryByCategory,
} from "../../../redux/summarySlice";

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

    if (!formTask.startDate) {
      dispatch(setFormTask({ startDate: new Date().toISOString() }));
    }

    if (formTask.title > 50) {
      setError("Title cannot more than 50 characters.");
      return false;
    }
    if (formTask.note > 2) {
      setError("Note cannot more than 200 characters.");
      return false;
    }
    if (currentStep > 50) {
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
    const selectedDate = date ? date : new Date();

    dispatch(setFormTask({ [field]: selectedDate.toISOString() }));
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
      tag: formTask.tag || "low",
      progress,
      startDate: formTask.startDate || new Date().toISOString()
    };

    try {
      const response = await dispatch(createNewTask(taskData)).unwrap();
      await dispatch(fetchSummary()).unwrap();
      await dispatch(fetchSummaryByCategory()).unwrap();
      if (response) {
        console.log("Task created successfully!", response);
        resetFormTask();
        onClose();
      } else {
        console.log("No response data received.");
      }
    } catch (error) {
      console.error("Error creating task", error);
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <FadeUpContainer>
      <div className=" md:w-[800px] p-1 rounded-2xl relative">
        <div className="bg-purpleSidebar p-6 rounded-xl">
          <form onSubmit={handleSubmit}>
            <h1 className="text-white tracking-wide">CREATE A TASK</h1>
            <div className="flex flex-col gap-4 my-4">
              {error && <p className="text-red-500 text-xl ">{error}</p>}
              <InputField
                type="text"
                placeholder="Title"
                id="title"
                name="title"
                value={formTask.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border text-xl border-gray-300 rounded-xl "
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
                  formTask.startDate ? new Date(formTask.startDate) : new Date()
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
            </div>

            <div className=" my-4 flex flex-col gap-2">
              <h3 className="text-white text-2xl">Progress (optional)</h3>
              <div className="flex flex-col gap-2">
                <InputField
                  type="text"
                  placeholder="Type a step and press Enter"
                  name="progress"
                  id="progress"
                  value={currentStep}
                  onChange={handleInputChange}
                  onKeyDown={handleAddProgress}
                  className="px-4 py-2 rounded-xl md:text-xl"
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
                  {/*
          -- Tag is on process --
              {tags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-4 py-2 rounded-full ${
                      formTask.tag.includes(tag)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {tag.tagName.toUpperCase()}
                  </button>
                ))}
             */}
                </div>
              </div>
              <button
                type="submit"
                className="done-button hover:scale-110 transition-all duration-100 "
              >
                Create
              </button>
              <button
                onClick={onClose}
                className="cancel-button absolute -top-4 -right-4"
              >
                X
              </button>
            </div>
          </form>
        </div>
      </div>
    </FadeUpContainer>
  );
}

export default CreateTask;
