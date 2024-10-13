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
          <div className="relative">
            <select
              name="category"
              value={formTask.category || ""}
              onChange={handleInputChange}
              className="w-[150px] cursor-pointer appearance-none shadow border-[2px] border-categoryTheme bg-transparent rounded-lg p-4 pl-11 font-bold text-categoryTheme leading-tight focus:outline-none focus:shadow-outline block"
            >
              <option value="" disabled>
                Category
              </option>
              <option value="">No category</option>
              {categories.map((cate) => (
                <option placeholder="Category" key={cate._id} value={cate._id}>
                  {cate.categoryName}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              className="text-categoryTheme pr-2 text-2xl left-3 bottom-4 absolute "
              icon={faFolder}
            />
          </div>
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
            {progress.steps.length > 0 ? (
              <div>
                <h3 className="text-white mb-2">Progress steps:</h3>
                <ul className="flex flex-col max-h-[120px] gap-4 overflow-y-scroll scrollbar-custom pr-4">
                  {progress.steps.map((step, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-purpleBorder  p-2 pl-4 rounded-lg "
                    >
                      <span className="text-white text-[20px]">
                        {step.label}
                      </span>
                      <button
                        type="button"
                        className="delete-step"
                        onClick={() => handleRemoveStep(index)}
                      >
                        x
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="text-slate-400">No progress</h3>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="relative">
            <select
              name="tag"
              value={formTask.tag.length > 0 ? formTask.tag[0] : ""}
              onChange={handleTagChange}
              className="w-[150px] appearance-none  cursor-pointer shadow  bg-transparent rounded-lg p-4 pl-12 font-bold text-categoryTheme leading-tight focus:outline-none focus:shadow-outline block"
            >
              <option value="" disabled>
                Tag
              </option>
              {tags.map((tag) => (
                <option placeholder="Tag" key={tag._id} value={tag.tagName}>
                  {tag.tagName}
                </option>
              ))}
            </select>

            <FontAwesomeIcon
              className="text-categoryTheme pr-2 text-2xl left-4 bottom-4 absolute "
              icon={faTag}
            />
            <div>
              {/*display tag */}
              {formTask.tag.map((t, index) => (
                <div key={index} className=" bg-white ">
                  <span className="text-xl p-4">{t}</span>
                  <button
                    className="text-[30px]"
                    onClick={(e) => handleRemoveTag(e, t)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="done-button">
            Done
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
