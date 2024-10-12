const Tasks = require("../Models/Tasks");
const Category = require("../Models/Category");
const Tag = require("../Models/Tag");
const { getNotifications } = require("../utils/notification");
const {
  startOfDay,
  startOfWeek,
  addWeeks,
  endOfWeek,
  startOfMonth,
  addMonths,
  endOfMonth,
  endOfDay,
  parseISO,
  isValid
} = require("date-fns");
const { isValidObjectId, Types } = require("mongoose");
const { processProgress, processCategory, processTags, tryAgainTask, updateUserStreak,handleError } = require("./helperController");


exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category, deadlineRange } = req.query;
    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    console.log("Category:", category); 
    console.log("Status:", status);  
    console.log("guestId:", req.guestId);
    console.log("user:", formatUser);
    console.log("taskid:", formatId);

    const userFilter = formatUser ? {user: formatUser} : req.guestId ? { guestId: req.guestId } : {};
    
    if(!userFilter){
      return res.status(401).json({ error: "Unauthorized" });
    }

    if(id){
      if(!formatId) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      userFilter._id = formatId
    }
    
    // filter status
    if (status) {
      if (status && !["completed", "pending"].includes(status) || status === undefined) {
        return res.status(400).json({ error: "Invalid status error" });
      }
      userFilter.status = status 
    }
    
    // filter category
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      userFilter.category = { $in: categories.map(cat => new Types.ObjectId(cat)) };
    }

    // filter by deadline ranges
    if (deadlineRange) {
      const currentDate = startOfDay(new Date());
      let startDate, endDate;

      switch (deadlineRange) {
        case "today":
          startDate = startOfDay(currentDate);
          endDate = endOfDay(currentDate);
          break;
        case "thisWeek":
          startDate = startOfWeek(currentDate);
          endDate = endOfWeek(currentDate);
          break;
        case "nextWeek":
          startDate = startOfWeek(addWeeks(currentDate, 1));
          endDate = endOfWeek(addWeeks(currentDate, 1));
          break;
        case "nextMonth":
          startDate = startOfMonth(addMonths(currentDate, 1));
          endDate = endOfMonth(addMonths(currentDate, 1));
          break;
        default:
          return res.status(400).json({ error: "Invalid deadline range!" });
      }

      userFilter.deadline = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    console.log("User Filter:", userFilter);
    console.log("Category:", userFilter.category);
    console.log("Status:", userFilter.status);
    

    const tasksList = await Tasks.find(userFilter)
      .populate("category")
      .populate("tag")
      .populate("status")
      .lean();
    console.log("tasks found:", tasksList.length);

    if (tasksList.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(tasksList);
  } catch (error) {
    handleError(res, error, "Failed to retrieve product");
  }
};

exports.getAllTask = async (req, res) => {
  try {
    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null
    const userFilter = formatUser ? {user: formatUser}: req.guestId ? {guestId: req.guestId}: null
    
    if(!userFilter){
      return res.status(400).json({error:'Unauthorized'})
    }

    const allTasks = await Tasks.find(userFilter).lean().exec();

    if (allTasks.length === 0) {
      return res.status(404).json({ error: "You have no tasks" });
    }

    console.log("Get all task successful!", allTasks);
    return res.status(200).json(allTasks);
  } catch (error) {
    handleError(res, error, "Failed to retrieve tasks");
  }
};

exports.createTask = async (req, res) => {
  console.log("Incoming request", req.body);

  // avoid multiple response
  try {
    const { title, note, startDate, deadline, category, progress, tag } = req.body;
    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null;
    console.log("guestId:", req.guestId);
    console.log("user:", formatUser);
    console.log("category:", category);
    console.log("tag:", tag);
    
    if(!formatUser && !req.guestId){
      console.error('unauthorized')
      return res.status(400).json({error:'Unauthorized'})
    }

    // ตรวจสอบค่าก่อนแปลงเป็น objectid
    let categoryId = null;
    if (category && category.length > 0) {
      const existingCategory = await Category.findOne({
        categoryName: category,
        $or: [{user: formatUser}, {guestId : req.guestId}]
      }).lean();

      if (existingCategory) {
        categoryId = existingCategory._id;
        console.log('Category chosen',existingCategory)
      } else {
        console.log('Category not found')
      }
    }
    // check tag value then convert tp objectId
    let tagIds = [];
    if (tag && tag.length > 0) {
      const tags = Array.isArray(tag) ? tag : [tag];
      const existingTags = await Tag.find({
        tagName: { $in: tags },
        $or: [{user: formatUser}, {guestId: req.guestId}]
      }).lean();
      if(existingTags) {
        tagIds = [...existingTags.map((tg) => tg._id)];
        console.log('Tag chosen!',...tagIds)
      } else {
        console.log('Tag not found')
      }
    }

    // adjust progress
    let formatProgress = {
      steps: [],
      totalSteps: 0,
      allStepsCompleted: false
    };
     // Array checking
    if(progress && typeof progress === 'object'){
      if(Array.isArray(progress.steps)) {
        formatProgress.steps = progress.steps.map(step => ({
          label: step.label,
          completed: step.completed || false
        }));
      // single object checking
      } else if(progress.steps && typeof progress.steps === 'object') {
        formatProgress.steps = [{
          label: progress.steps.label || progress.steps.lable,
          completed: progress.steps.completed || false
        }];
      }
      formatProgress.totalSteps = formatProgress.steps.length;
      formatProgress.allStepsCompleted = formatProgress.steps.every(step => step.completed )
    }


    // เช็คว่ามี title และ , startDate ต้องไม่ต่ำกว่าวันปัจจุบัน และ ไม่มากกว่า deadline
    if (!title || !startDate) {
      return res.status(400).json({ error: "Title and start date are required" });
    }
    const currentDate = startOfDay(new Date());
    const startDateObj = parseISO(startDate);
    
    let deadlineObj = null;

    if(deadline){
      deadlineObj = parseISO(deadline)
      if(!isValid(deadlineObj)){
        return res.status(400).json({error:'Invalid deadline format'});
      }
    }

    if(!isValid(startDateObj)){
      return res.status(400).json({error:'Invalid start date format'});
    }

    if(deadlineObj && startDateObj > deadlineObj){
      return res.status(400).json({error:'Start date cannot be after deadline!'});
    }

    if(startDateObj < currentDate){
      return res.status(400).json({error:'Start date cannot be in the past!'});
    }

    const guestId = formatUser ?  null : req.guestId

    // category, tag, user, progress อยู่ใน array ต้อง loop
    const newTask = new Tasks({
      title,
      note: note || "",
      startDate: startDateObj,
      deadline: deadlineObj || null,
      category: categoryId,
      progress: formatProgress,
      tag: tagIds,
      user: formatUser || null,
      guestId
    });
    console.log("Format progress", formatProgress);
    console.log("New task ",newTask);
    const savedTask = await newTask.save();
    
    return res.status(201).json(savedTask);
  } catch (error) {
    handleError(res, error, "Failed to create new task");
  }
};

exports.updatedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const userFilter = formatUser ? { user: formatUser } : req.guestId ? { guestId: req.guestId } : null;

    if (!userFilter) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!formatId) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    userFilter._id = formatId;

    // ดึงงานที่มีอยู่จากฐานข้อมูล
    const existingTask = await Tasks.findOne(userFilter).exec();
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // นำค่าที่มีอยู่มาใช้ถ้าไม่มีการส่งค่ามาใหม่
    const finalUpdateData = {
      title: updateData.title || existingTask.title,
      startDate:new Date(updateData.startDate)  || existingTask.startDate,
      deadline:new Date(updateData.deadline)  || existingTask.deadline,
      category: updateData.category || existingTask.category,
      tag: updateData.tag || existingTask.tag,
      progress: updateData.progress || existingTask.progress,
      status: updateData.status || existingTask.status,
    };

    // ตรวจสอบและจัดการข้อมูล category
    if (finalUpdateData.category) {
      if (typeof finalUpdateData.category === 'string' && isValidObjectId(finalUpdateData.category)) {
        const categoryPromise = await processCategory(finalUpdateData.category, formatUser, req.guestId);
        finalUpdateData.category = categoryPromise;
      } else {
        return res.status(400).json({ error: "Invalid category value" });
      }
    }

    // ตรวจสอบและจัดการข้อมูล tags
    if (finalUpdateData.tag) {
      if (Array.isArray(finalUpdateData.tag) && finalUpdateData.tag.every(tag => typeof tag === 'string' && isValidObjectId(tag))) {
        const tagPromise = await processTags(finalUpdateData.tag, formatUser, req.guestId);
        finalUpdateData.tag = tagPromise; // อัปเดตค่า tag
      } else {
        return res.status(400).json({ error: "Invalid tag values" });
      }
    }

    // ตรวจสอบและจัดการข้อมูล progress
    if (finalUpdateData.progress) {
      const processedProgress = processProgress(finalUpdateData.progress);
      finalUpdateData.progress = processedProgress;
    }

    // เช็คสถานะว่าเป็นค่าใดใน ["pending", "completed", "failed"]
    if (
      finalUpdateData.status &&
      !["pending", "completed", "failed"].includes(finalUpdateData.status)
    ) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    console.log("Start Date:", new Date(finalUpdateData.startDate));
    console.log("Deadline:", new Date(finalUpdateData.deadline));
    

    const updatedTask = await Tasks.findOneAndUpdate(
      { _id: formatId, ...userFilter },
      finalUpdateData,
      { new: true, runValidators: true }
    ).exec();

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("Update task successful!");
    res.status(200).json(updatedTask);
  } catch (error) {
    handleError(res, error, "Failed to update task");
  }
};


exports.completedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const userFilter = formatUser ? { user: formatUser } : req.guestId ? { guestId: req.guestId } : null;
    
    if(!formatId){
      return res.status(400).json({error:'Invalid task Id.'})
    }

    if(!userFilter){
      return res.status(400).json({error:'Unauthorized'})
    }
   
    const task = await Tasks.findOne(
      { _id: formatId, ...userFilter }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = "completed";
    task.progress.steps.forEach(step => step.completed = true);
    task.progress.allStepsCompleted = true;
    task.progress.totalSteps = task.progress.steps.length;

    if(formatUser){
      await updateUserStreak(formatUser.toString(),true)
    }

    const updatedTask = await task.save();
    
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or could not be updated" });
    }

    return res.status(201).json({message:"Task is complete", updatedTask});
  } catch (error) {
    handleError(res, error, "Failed to complete task");
  }
};

exports.updatedUserAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDeadline } = req.body;
    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null
    const parseDeadline = parseISO(newDeadline) 

    if (!formatId) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    if (!formatUser) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    if (!isValid(parseDeadline)) {
      return res.status(400).json({ error: "Invalid new deadline format" });
    }
    
    const formatDeadline = parseDeadline

    const updatedTaskAttempt = await tryAgainTask(formatUser,formatId,formatDeadline)

    getNotifications(req.user.id, "Keep going!");

    return res.status(200).json({message:'Try again task updated', updatedTaskAttempt})
  } catch (error) {
    handleError(res, error, "Cannot try this task again");
  }
};

exports.searchTask = async (req,res) => {
  try{
    const searchTerm = req.query.q || ''

    if(!searchTerm) {
      return res.status(400).json({error:'Please provide a search term.'});
    }
    if(searchTerm.length > 100) {
      return res.status(400).json({error:'Search term is too long.'});
    }

    const regex = new RegExp(searchTerm,'i');
    const tasks = await Tasks.find({
      title: { $regex: regex }
    });

    return res.status(200).json({message:'Search successful!',tasks})

  } catch(error){
    this.handleError(res,error,"Cannot search a task")
  }
}

