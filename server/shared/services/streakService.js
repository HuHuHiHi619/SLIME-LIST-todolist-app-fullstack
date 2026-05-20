const { startOfDay, differenceInDays } = require("date-fns");
const { formatInTimeZone } = require("date-fns-tz");
const User = require("../../Models/User");

const STREAK_TIMEZONE = "Asia/Bangkok";

const calculateBadge = (streakDays) => {
  if (streakDays > 15) return "gold";
  if (streakDays > 10) return "silver";
  if (streakDays >= 1) return "bronze";
  return "iron";
};

const updateUserStreak = async (userId, completed, taskCompletionDetails = {}) => {
  console.log("Updating streak for user:", userId, "completed:", completed);
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found!");
      throw new Error("User not found!");
    }

    const currentDate = startOfDay(
      new Date(
        formatInTimeZone(new Date(), STREAK_TIMEZONE, "yyyy-MM-dd HH:mm:ss")
      )
    );
    const lastCompletedDate = user.lastCompleted
      ? startOfDay(
          new Date(
            formatInTimeZone(
              new Date(user.lastCompleted),
              STREAK_TIMEZONE,
              "yyyy-MM-dd HH:mm:ss"
            )
          )
        )
      : null;

    console.log("Current date:", currentDate);
    console.log("Last completed:", lastCompletedDate);
    console.log("Current streak:", user.currentStreak);

    if (completed) {
      if (!user.alreadyCompletedToday) {
        const dayDifference = lastCompletedDate
          ? differenceInDays(currentDate, lastCompletedDate)
          : null;

        console.log("Days difference:", dayDifference);

        if (!lastCompletedDate || user.currentStreak === 0 || dayDifference > 1) {
          console.log("Starting new streak");
          user.currentStreak = 1;
        } else if (dayDifference === 1) {
          console.log("Continuing streak");
          user.currentStreak += 1;
        } else if (dayDifference === 0) {
          console.log("Same day completion, streak remains:", user.currentStreak);
        }

        user.lastCompleted = currentDate;
        user.alreadyCompletedToday = true;
        user.bestStreak = Math.max(user.currentStreak, user.bestStreak || 0);

        console.log("Updated streak:", user.currentStreak);
        console.log("Updated best streak:", user.bestStreak);
      } else {
        console.log("Already completed today, no streak update needed");
      }

      const newBadge = calculateBadge(user.currentStreak);
      if (newBadge !== user.currentBadge) {
        user.badgeChange = true;
        user.oldBadge = user.currentBadge;
        user.newBadge = newBadge;
        user.currentBadge = newBadge;
        console.log("Badge updated:", user.oldBadge, "->", user.newBadge);
      }

      if (Object.keys(taskCompletionDetails).length > 0) {
        user.taskDetails = taskCompletionDetails;
      }

      await user.save();
      console.log("User data saved successfully");
    }

    return user;
  } catch (error) {
    console.error("Error updating user streak:", error);
    throw error;
  }
};

module.exports = { STREAK_TIMEZONE, calculateBadge, updateUserStreak };
