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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faTag } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";
import InputField from "../ui/inputField";
import DeadlinePicker from "../ui/DeadlinePicker";
import StartDatePicker from "../ui/StartDatePicker";
import CategoryTagField from "../ui/CategoryTagField";
import ProgressField from "../ui/ProgressField";

function CreateTask({ onAddTask }) {
  const dispatch = useDispatch();
  const { formTask, progress, categories, tags } = useSelector(
    (state) => state.tasks
  );
  const [currentStep, setCurrentStep] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "progress") {
      setCurrentStep(value);
    } else {
      dispatch(setFormTask({ [name]: value }));
    }
  };

  const handleTagChange = (e) => {
    const selectedTag = e.target.value;
    if (selectedTag && !formTask.tag.includes(selectedTag)) {
      dispatch(setFormTask({ tag: [...formTask.tag, selectedTag] }));
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
    const taskData = {
      ...formTask,
      progress,
    };
    console.log("task being sent", taskData);

    try {
      const response = await dispatch(createNewTask(taskData));
      if (response) {
        console.log("Task created successfully!", response);
        onAddTask(response.payload);
        resetFormTask();
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
    <div className="bg-darkBackground w-[800px] p-6 rounded-xl">
      <form onSubmit={handleSubmit}>
        <h1 className="text-white">CREATE TASK</h1>
        <div className="flex flex-col gap-4 my-4">
          <InputField
            type="text"
            placeholder="Title"
            id="title"
            name="title"
            value={formTask.title}
            onChange={handleInputChange}
          />
          <InputField
            type="text"
            placeholder="Note"
            id="note"
            name="note"
            value={formTask.note || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex space-x-4">
         <CategoryTagField 
            name="category"
            value={formTask.category || ""}
            entities={categories}
            placeholder="Category"
            handleInputChange={handleInputChange}
            icon={faFolder}
            showTag={false}
         />
          <StartDatePicker
            id="startDate"
            name="startDate"
            selected={formTask.startDate ? new Date(formTask.startDate) : null}
            onChange={(date) => handleDateChange(date, "startDate")}
            placeholder="Start Date"
          />
          <DeadlinePicker
            id="deadline"
            name="Deadline"
            selected={formTask.deadline ? new Date(formTask.deadline) : null}
            onChange={(date) => handleDateChange(date, "deadline")}
            placeholder="Deadline"
          />
        </div>

        <div className=" my-4 flex flex-col gap-2">
          <h3 className="text-white">Progress (optional)</h3>
          <div className="flex flex-col gap-2">
            <InputField
              type="text"
              placeholder="Type a step and press Enter"
              name="progress"
              id="progress"
              value={currentStep}
              onChange={handleInputChange}
              onKeyDown={handleAddProgress}
            />
            <ProgressField 
                steps={progress.steps}
                handleRemoveStep={handleRemoveStep}
                showCompletion={false}
            />
          </div>
        </div>
        <div className="flex justify-between">
        <CategoryTagField 
            name="tag"
            value={formTask.tag.length > 0 ? formTask.tag[0]: ""}
            selectedTags={formTask.tag}
            entities={tags}
            placeholder="Tag"
            handleInputChange={handleTagChange}
            handleRemoveTag={handleRemoveTag}
            icon={faTag}
            showTag={true}
         />

          <button type="submit" className="done-button">
            Done
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
