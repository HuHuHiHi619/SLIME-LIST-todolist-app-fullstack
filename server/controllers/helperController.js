const { startOfDay, subDays } = require("date-fns");
const Category = require("../Models/Category");
const Tag = require("../Models/Tag");
const User = require("../Models/User");
const Tasks = require("../Models/Tasks");

exports.handleError = (
  res,
  error,
  message = "Server Error",
  statusCode = 500
) => {
  console.error(`Error: ${message}`, error);
  res.status(statusCode).json({ error: message });
};

exports.processProgress = (progress) => {
  // ตรวจสอบรูปแบบของ progress
  if (progress && typeof progress === "object") {
    if (Array.isArray(progress.steps)) {
      progress.steps = progress.steps.map((step) => {
        if (typeof step.label !== "string" || step.label.length > 100) {
          throw new Error(
            "Invalid label: must be a string with max length 100"
          );
        }
        return {
          label: step.label.trim(),
          completed: step.completed === "true" || step.completed === true,
        };
      });
    } else {
      throw new Error("Invalid steps format");
    }

    progress.totalSteps = progress.steps.length;
    if (progress.steps.length === 0) {
      progress.allStepsCompleted = false;
    } else {
      progress.allStepsCompleted =
        process.totalSteps > 0 &&
        progress.steps.every((step) => step.completed);
    }

    return progress; // ส่งกลับ progress ที่ถูกประมวลผล
  } else {
    throw new Error("Invalid progress data");
  }
};

exports.processCategory = async (categoryId, userId, guestId) => {
  const query = {
    _id: categoryId, // ค้นหาจาก ID
    $or: [],
  };

  if (userId) query.$or.push({ user: userId });
  if (guestId) query.$or.push({ guestId });

  const existCategory = await Category.findOne(query);
  console.log("exist cat:", existCategory);
  if (!existCategory) {
    throw new Error("Cannot find category");
  }
  return existCategory._id;
};

exports.processTags = async (tags, userId, guestId) => {
  tags = Array.isArray(tags) ? tags : [tags];
  const query = { tagName: { $in: tags }, $or: [] };

  if (userId) query.$or.push({ user: userId });
  if (guestId) query.$or.push({ guestId });

  const existTags = await Tag.find(query);
  if (!existTags) {
    throw new Error("Cannot find tag.");
  }
  return existTags.map((tg) => tg._id);
};

const calculateBadge = (streakDays) => {
  if (streakDays > 15) return "gold";
  if (streakDays > 10) return "silver";
  if (streakDays > 5) return "bronze";
  return "iron";
};
exports.updateUserStreak = async (
  userId,
  completed,
  taskCompletionDetails = {}
) => {
  console.log("is completed ?", completed);
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found!");
      throw new Error("User not found!");
    }

    const currentDate = startOfDay(new Date());
    const yesterday = startOfDay(subDays(new Date(), 1));
    const isYesterday =
      user.lastCompleted &&
      startOfDay(user.lastCompleted).getTime() === yesterday.getTime();
    user.currentStreak = user.currentStreak || 0;
    user.bestStreak = user.bestStreak || 0;
    console.log("today com",user.alreadyCompletedToday)

    if (user.alreadyCompletedToday) {
      console.log("User already completed a task today.");
      return user; 
    }

    if (completed === true) {
      if (user.currentStreak === 0) {
        console.log("No previous completion, starting new streak.");
        user.currentStreak = 1;
        user.bestStreak = Math.max(user.currentStreak, user.bestStreak);
        
      } else if (isYesterday) {
        console.log("Task completed yesterday, incrementing streak.");
        user.currentStreak += 1;
        user.bestStreak = Math.max(user.currentStreak, user.bestStreak);
       
      }

      user.lastCompleted = currentDate;
      user.alreadyCompletedToday = true;
    } else {
      console.log("Did not enter completed block.");
    }

    // คำนวณ badge ใหม่และอัปเดต
    const newBadge = calculateBadge(user.currentStreak);
    if (newBadge !== user.currentBadge) {
      user.badgeChange = true;
      user.oldBadge = user.currentBadge;
      user.newBadge = newBadge;
      user.currentBadge = newBadge;
      console.log(`Badge updated from ${user.oldBadge} to ${user.newBadge}.`);
    }

    // เพิ่มรายละเอียด task หากมี
    if (Object.keys(taskCompletionDetails).length > 0) {
      user.taskDetails = taskCompletionDetails;
    }

    // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
    await user.save();
   
    return user;
  } catch (error) {
    console.error("Error updating user streak:", error);
    throw error;
  }
};

exports.calculateProgress = (task) => {
  if (task.progress && task.progress.steps) {
    const totalSteps = task.progress.steps.length || 0;
    const completedSteps = task.progress.steps.filter(
      (step) => step.completed
    ).length;
    const progressPercentage =
      totalSteps === 0 ? 0 : (completedSteps / totalSteps) * 100;
    return {
      ...task,
      progress: {
        ...task.progress,
        completedSteps,
        progressPercentage,
      },
    };
  }
  return task;
};
