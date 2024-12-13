const cron = require("node-cron");
const Tasks = require("../Models/Tasks");
const User = require("../Models/User");
const { startOfDay , subDays } = require("date-fns");

const checkOverdueTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    await updateOverdueTasks();
    await resetDailyStreakStatus();
   
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

    for (const task of overdueTasks) {
      task.status = "failed";
      await task.save();
    }

    console.log(`Updated ${overdueTasks.length} overdue tasks.`);
  } catch (error) {
    console.error("Error updating overdue tasks:", error);
  }
};

const resetDailyStreakStatus = async () => {
  try {
    const users = await User.find({});
    if (!users) {
      throw new Error('No users found');
    }


    for (let user of users) {
     
      const yesterday = startOfDay(subDays(new Date(), 1));

      const isStreakBroken =
        !user.lastCompleted ||
        startOfDay(user.lastCompleted).getTime() < yesterday.getTime();

      console.log(isStreakBroken)
          
      if(isStreakBroken){
        user.currentStreak = 0
        user.currentBadge = "iron"
        user.alreadyCompletedToday = false
        await user.save()
      }
    }

    await User.updateMany(
      { alreadyCompletedToday: true },
      { alreadyCompletedToday: false }
    );
  
    console.log("Reset alreadyCompletedToday for all users.");
  } catch (error) {
    console.error("Error resetting alreadyCompletedToday:", error);
    throw new Error(`Error resetting alreadyCompletedToday: ${error.message}`);
  }
};

module.exports = {
  checkOverdueTasks,
  updateOverdueTasks,
  resetDailyStreakStatus
};
