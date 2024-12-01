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
  if (streakDays >= 15) return "gold";
  if (streakDays >= 10) return "silver";
  if (streakDays >= 5) return "bronze";
  return "iron";
};

exports.updateUserStreak = async (
  userId,
  completed,
  taskCompletionDetails = {}
) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found!");

    let streakStatus = {
      streakUpdated: false,
      streakBroken: false,
      streakIncreased: false,
      currentStreak: user.currentStreak,
      badgeChange: false,
      alreadyCompletedToday: false,
      oldBadge: user.currentBadge,
      newBadge: user.currentBadge,
      taskDetails: {}
    };

    const currentDate = startOfDay(new Date());
    const yesterday = startOfDay(subDays(new Date(), 1));

    if (completed) {
      // Prevent multiple completions on the same day
      if (
        user.lastCompleted &&
        startOfDay(user.lastCompleted).getTime() === currentDate.getTime()
      ) {
        streakStatus.alreadyCompletedToday = true;
        return streakStatus;
      }

      if (!user.lastCompleted) {
        user.currentStreak = 1;
        user.lastCompleted = currentDate;
        streakStatus.streakUpdated = true;
      } else if (
        startOfDay(user.lastCompleted).getTime() === yesterday.getTime()
      ) {
        // If last completion was yesterday, increase streak
        user.currentStreak += 1;
        streakStatus.streakIncreased = true;
      }

      // Update last completed date
      user.lastCompleted = currentDate;
      streakStatus.streakUpdated = true;
      streakStatus.currentStreak = user.currentStreak;
    } else {
      // If no task completed, streak is broken
      user.currentStreak = 0;
      streakStatus.streakBroken = true;
      streakStatus.currentStreak = 0;
    }

    // Update best streak
    if (user.currentStreak > user.bestStreak) {
      user.bestStreak = user.currentStreak;
    }

    // Calculate and update badge
    const newBadge = calculateBadge(user.currentStreak);
    if (newBadge !== user.currentBadge) {
      user.currentBadge = newBadge;
      streakStatus.badgeChange = true;
      streakStatus.oldBadge = user.currentBadge;
      streakStatus.newBadge = newBadge;
    }

    // Save additional task completion details if provided
    if (Object.keys(taskCompletionDetails).length > 0) {
      streakStatus.taskDetails = taskCompletionDetails;
    }

    await user.save();

    return streakStatus;
  } catch (error) {
    console.error("Error updating user streak:", error);
    throw error;
  }
};

exports.tryAgainTask = async (userId, taskId, newdeadline) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  const task = await Tasks.findOne({
    _id: taskId,
    user: userId,
  });
  if (!task) throw new Error("Task not found");

  if (task.tryAgainCount >= 3) {
    task.status = "failed";
    throw new Error("Reached max tryagain count!");
  }

  task.deadline = newdeadline;
  task.tryAgainCount += 1;
  task.status = "pending";
  task.progress.allStepsCompleted = false;

  await task.save();
  return task;
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
