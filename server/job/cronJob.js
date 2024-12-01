const cron = require("node-cron");
const Tasks = require("../Models/Tasks");
const User = require("../Models/User");
const { updateUserStreak } = require("../controllers/helperController");
const { startOfDay } = require('date-fns')

const checkOverdueTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    await updateOverdueTasks();
    await updateStreak();
  });
};

// manual
const updateOverdueTasks = async () => {
  const currentDate = new Date();

  try {
    const overdueTasks = await Tasks.find({
      deadline: { $lt: currentDate },
      status: { $ne: "completed" },
    });

    overdueTasks.forEach(async (task) => {
      task.status = "failed";
      await task.save();
    });

    console.log(`Updated ${overdueTasks.length} overdue tasks.`);
  } catch (error) {
    console.error("Error updating overdue tasks:", error);
  }
};

const updateStreak = async () => {
  try {
    const users = await User.find({});

    for (let user of users) {
      const currentDate = new Date();
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1); 

      const isStreakBroken =
      !user.lastCompleted ||
      startOfDay(user.lastCompleted).getTime() < startOfDay(yesterday).getTime() &&
      startOfDay(user.lastCompleted).getTime() !== startOfDay(currentDate).getTime();
    
      console.log('streak',isStreakBroken)
      await updateUserStreak(user._id, !isStreakBroken);
    }
  } catch (error) {
    console.error("Error updating streak:", error);
  }
};

module.exports = { checkOverdueTasks, updateOverdueTasks,updateStreak };
