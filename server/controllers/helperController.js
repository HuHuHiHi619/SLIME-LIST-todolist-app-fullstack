const Category = require("../Models/Category");
const Tag = require("../Models/Tag");
const { updateUserStreak, calculateBadge } = require("../shared/services/streakService");


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
        progress.totalSteps > 0 &&
        progress.steps.every((step) => step.completed);
    }

    return progress; 
  } else {
    throw new Error("Invalid progress data");
  }
};

exports.processCategory = async (categoryId, userId, guestId) => {
  const query = {
    _id: categoryId, 
    $or: [],
  };
  if (userId) query.$or.push({ user: userId });
  if (guestId) query.$or.push({ guestId });
  
  console.log('category query',query)
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

// Streak and badge logic lives in shared/services/streakService.js.
// Re-exported here so existing callers (TasksController, etc.) need no changes.
exports.updateUserStreak = updateUserStreak;
exports.calculateBadge = calculateBadge;

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
