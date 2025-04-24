const { startOfDay, differenceInDays } = require("date-fns");
const { formatInTimeZone } = require("date-fns-tz"); // Fixed typo here
const Category = require("../Models/Category");
const Tag = require("../Models/Tag");
const User = require("../Models/User");


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

const calculateBadge = (streakDays) => {
  if (streakDays > 15) return "gold";
  if (streakDays > 10) return "silver";
  if (streakDays >= 1) return "bronze";
  return "iron";
};
exports.updateUserStreak = async (
  userId,
  completed,
  taskCompletionDetails = {}
) => {
  console.log("Updating streak for user:", userId, "completed:", completed);
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found!");
      throw new Error("User not found!");
    }

    const currentDate = startOfDay(
      new Date(
        formatInTimeZone(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss")
      )
    );
    const lastCompletedDate = user.lastCompleted
      ? startOfDay(
          new Date(
            formatInTimeZone(
              new Date(user.lastCompleted),
              "Asia/Bangkok",
              "yyyy-MM-dd HH:mm:ss"
            )
          )
        )
      : null;
    // Debug logs
    console.log("Current date:", currentDate);
    console.log("Last completed:", lastCompletedDate);
    console.log("Current streak:", user.currentStreak);

    if (completed) {
      // ถ้ายังไม่เคยทำ task วันนี้
      if (!user.alreadyCompletedToday) {
        const dayDifference = lastCompletedDate
          ? differenceInDays(currentDate, lastCompletedDate)
          : null;

        console.log("Days difference:", dayDifference);

        // กรณีแรกเริ่มใช้งาน หรือ streak ขาด (ไม่ได้ทำมาเกิน 1 วัน)
        if (
          !lastCompletedDate ||
          user.currentStreak === 0 ||
          dayDifference > 1
        ) {
          console.log("Starting new streak");
          user.currentStreak = 1;
        }
        // ทำต่อเนื่องจากเมื่อวาน
        else if (dayDifference === 1) {
          console.log("Continuing streak");
          user.currentStreak += 1;
        }
        // ทำในวันเดียวกัน
        else if (dayDifference === 0) {
          console.log(
            "Same day completion, streak remains:",
            user.currentStreak
          );
          // ไม่ต้องเพิ่ม streak เพราะเป็นวันเดียวกัน
        }

        // อัพเดต last completed และ flag
        user.lastCompleted = currentDate;
        user.alreadyCompletedToday = true;

        // อัพเดต best streak
        user.bestStreak = Math.max(user.currentStreak, user.bestStreak || 0);

        console.log("Updated streak:", user.currentStreak);
        console.log("Updated best streak:", user.bestStreak);
      } else {
        console.log("Already completed today, no streak update needed");
      }

      // คำนวณและอัพเดท badge
      const newBadge = calculateBadge(user.currentStreak);
      if (newBadge !== user.currentBadge) {
        user.badgeChange = true;
        user.oldBadge = user.currentBadge;
        user.newBadge = newBadge;
        user.currentBadge = newBadge;
        console.log("Badge updated:", user.oldBadge, "->", user.newBadge);
      }

      // เพิ่มรายละเอียด task ถ้ามี
      if (Object.keys(taskCompletionDetails).length > 0) {
        user.taskDetails = taskCompletionDetails;
      }

      // บันทึกการเปลี่ยนแปลง
      await user.save();
      console.log("User data saved successfully");
    }

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
