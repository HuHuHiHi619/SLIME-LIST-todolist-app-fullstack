import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFormTask,
  resetFormTask,
  addSteps,
  removeStep,
  fetchCategories,
  fetchTags,
  createNewTask,
} from "../../../redux/taskSlice";
import "react-datepicker/dist/react-datepicker.css";
import InputField from "../ui/inputField";
import DeadlinePicker from "../ui/DeadlinePicker";
import StartDatePicker from "../ui/StartDatePicker";
import CategoryTagField from "../ui/CategoryTagField";
import ProgressField from "../ui/ProgressField";
import FadeUpContainer from "../animation/FadeUpContainer";

function CreateTask({ onClose }) {
  const dispatch = useDispatch();
  const { formTask, progress, categories, tags } = useSelector(
    (state) => state.tasks
  );
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState("");

  const validator = () => {
    setError("");
    if (!formTask.title){
      setError("Title is required.") 
      return false;
    }
    
    if (!formTask.startDate) {
      setError("Start date is required.");
      return false
    }
    if (formTask.title > 50){
      setError("Title cannot more than 50 characters.");
      return false
    } 
    if (formTask.note > 2){
      setError("Note cannot more than 200 characters.");
      return false
    } 
    if(currentStep > 50){
      setError("Step cannot more than 50 characters");
      return false
    } 
    return true
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "progress") {
      setCurrentStep(value);
    } else {
      dispatch(setFormTask({ [name]: value }));
    }
  };

  const handleTagChange = (e) => {
    const { value } = e.target;
    const selectedTag = tags.find((tag) => tag.tagName === value);
    if (selectedTag) {
      const tagAdded = formTask.tag.find((tag) => tag._id === selectedTag._id);
      console.log("tagadded", tagAdded);
      console.log("selectedtag", selectedTag);
      if (!tagAdded) {
        dispatch(setFormTask({ tag: [...formTask.tag, selectedTag] }));
      }
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
    if (date) {
      dispatch(setFormTask({ [field]: date.toISOString() }));
    } else {
      dispatch(setFormTask({ [field]: null }));
    }
  };

  const handleRemoveTag = (e, removingTag) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedTags = formTask.tag.filter((tag) => tag !== removingTag);
    dispatch(setFormTask({ tag: updatedTags }));
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
      progress,
    };
    console.log("task being sent", taskData);

    try {
      const response = await dispatch(createNewTask(taskData)).unwrap();
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
    dispatch(fetchTags());
  }, [dispatch]);

  return (
    <FadeUpContainer>
    <div className="bg-darkBackground w-[800px] p-6 rounded-xl">
      <form onSubmit={handleSubmit}>
        <h1 className="text-white">CREATE TASK</h1>
        <div className="flex flex-col gap-4 my-4">
          {error && <p className="text-red-500 text-xl ">{error}</p>}
          <InputField
            type="text"
            placeholder="Title"
            id="title"
            name="title"
            value={formTask.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        <div className="flex gap-4  ">
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
            selected={formTask.startDate ? new Date(formTask.startDate) : null}
            onChange={(date) => handleDateChange(date, "startDate")}
            placeholder="START DATE"
          />
          <DeadlinePicker
            id="deadline"
            name="Deadline"
            selected={formTask.deadline ? new Date(formTask.deadline) : null}
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
              className="px-4 py-2 rounded-xl text-xl"
            />
            <ProgressField
              steps={progress.steps}
              handleRemoveStep={handleRemoveStep}
              showCompletion={false}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <CategoryTagField
            name="tag"
            value={(formTask.tag.length > 0 && formTask.tag[0]?.tagName) || ""}
            selectedTags={formTask.tag}
            entities={tags}
            placeholder="Tag"
            handleInputChange={handleTagChange}
            handleRemoveTag={handleRemoveTag}
            showTag={true}
          />

          <button type="submit" className="done-button">
            Done
          </button>
        </div>
      </form>
    </div>
    </FadeUpContainer>
  );
}

export default CreateTask;
