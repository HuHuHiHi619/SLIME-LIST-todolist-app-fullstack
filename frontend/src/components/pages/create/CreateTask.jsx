import React, { useEffect } from "react";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faTag } from "@fortawesome/free-solid-svg-icons";
import { createTask } from "../../../functions/task";
import  InputField  from "../ui/inputField";
import DeadlinePicker from "../ui/DeadlinePicker";
import StartDatePicker from "../ui/StartDatePicker";
import { getCategoryData } from "../../../functions/category";
import { getTagData } from "../../../functions/tag";

function CreateTask({onAddTask}) {
  const [formTask, setFormTask] = useState({
    title: "",
    note: "",
    startDate: null,
    deadline: null,
    category: "",
    tag: [],
    status: "pending",
    tryAgainCount: 0,
  });

  const [categories,setCategories] = useState([]);
  const [tags,setTags] = useState([]);

  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState({
    steps: [],
    totalSteps: 0,
    allStepsCompleted: false,
    history: {
      steps: [],
      timestamps: new Date(),
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if(name === 'progress'){
      setCurrentStep(value)
    } else {
      setFormTask((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    
  };

 
  const handleAddProgress = (e) => {
    // ตรวจสอบว่า key ที่กดคือ "Enter" และ currentStep ไม่ว่างเปล่า
    if (e.key === "Enter" && currentStep.trim() !== "") {
      e.preventDefault(); // ป้องกันการส่งฟอร์ม
  
      console.log("Current Step:", currentStep); // ดูค่าที่กรอก
      console.log("Previous Steps:", progress.steps); // ดูค่าที่เก่า
  
      const newStep = { label: currentStep, completed: false };
      
      // สร้าง newSteps โดยการเพิ่ม newStep เข้าไป
      const newSteps = [...progress.steps, newStep];
      const totalSteps = newSteps.length;
      const allStepsCompleted = newSteps.every((step) => step.completed);
  
      const newHistoryStep = {
        label: currentStep,
        completed: false,
      };
  
      // อัปเดต progress โดยใช้ callback function
      setProgress((prevProgress) => {
        const updatedProgress = {
          ...prevProgress,
          steps: newSteps,
          totalSteps: totalSteps,
          allStepsCompleted: allStepsCompleted,
          history: {
            steps: [...prevProgress.history.steps, newHistoryStep],
            timestamps: new Date(),
          },
        };
        console.log(updatedProgress); 
        return updatedProgress; // คืนค่า updated progress
      });
  
      setCurrentStep(""); // ล้างค่าหลังจากเพิ่ม step ใหม่
    }
  };
  

  const handleDateChange = (date, field) => {
    setFormTask({
      ...formTask,
      [field]: date,
    });
  };

  const handleRemoveStep = (index) => {
    const newSteps = progress.steps.filter((_, i) => i !== index);
    setProgress((prevProgress) => ({
      ...prevProgress,
      steps: newSteps,
      totalSteps: newSteps.length,
      allStepsCompleted: newSteps.every((step) => step.completed),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      ...formTask,
      progress: {
        steps: progress.steps, 
        totalSteps: progress.totalSteps,
        allStepsCompleted: progress.allStepsCompleted,
        history: {
          steps: progress.history.steps,
          timestamps: new Date(),
        },
      }
    }
    console.log('task being sent', taskData)
    try{
      const response = await createTask(taskData);
      if (response) {
        console.log("Task created successfully!", response);
        onAddTask(response)
      } else {
        console.log("No response data received.");
      }
    } catch(error){
      console.error('Error creating task',error);
    }
  };

  useEffect(() => {
    const fetchCategoryAndTag = async () => {
      try{
        const fetchCategory = await getCategoryData();
        const fetchTag = await getTagData();
        setCategories(fetchCategory || []);
        setTags(fetchTag || []);
        console.log('cat and tag:', fetchCategory,fetchTag)
      } catch(error){
        console.error('Error fetching category and tag',error);
      }
    }
    fetchCategoryAndTag();
  },[])

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
              className="w-[150px] cursor-pointer shadow border-[2px] border-categoryTheme bg-transparent rounded-lg p-4 pl-11 font-bold text-categoryTheme leading-tight focus:outline-none focus:shadow-outline block"
            >
              <option value="" disabled>Category</option>
              { categories.map((cate) => (
                  <option placeholder="Category" key={cate._id} value={cate._id}>{cate.categoryName}</option>
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
              selected={formTask.startDate}
              onChange={(date) => handleDateChange(date, "startDate")}
              placeholder="Start Date"
            />
            <DeadlinePicker
              id="deadline"
              name="Deadline"
              selected={formTask.deadline}
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
                    <li key={index} className="flex justify-between items-center bg-purpleBorder  p-2 pl-4 rounded-lg ">
                      <span className="text-white text-[20px]">{step.label}</span>
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
              value={formTask.tag || ""}
              onChange={handleInputChange}
              className="w-[150px] cursor-pointer shadow border-[2px] border-categoryTheme bg-transparent rounded-lg p-4 pl-11 font-bold text-categoryTheme leading-tight focus:outline-none focus:shadow-outline block"
            >
              <option value="" disabled>Tag</option>
              { (tags || []).map((tag) => (
                <option placeholder="Tag" key={tag._id} value={tag.tagName}>{tag.tagName}</option>
              ))}
            </select>
            <FontAwesomeIcon
              className="text-categoryTheme pr-2 text-2xl left-3 bottom-4 absolute "
              icon={faTag}
            />
          </div>
         
          <button
            type="submit"
            className="done-button"
          >
            Done
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
