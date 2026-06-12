const cron = require("node-cron");
const Tasks = require("../Models/Tasks");
const User = require("../Models/User");
const Pet = require("../Models/Pet");
const { calcEvolutionStage } = require("../modules/pet/helpers");
const { startOfDay , subDays } = require("date-fns");
const { overdueThreshold } = require("../shared/utils/deadlineUtils");

const checkOverdueTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    await updateOverdueTasks();
    await resetDailyStreakStatus();
    await decayPetHappiness();
  });
};

// manual
const updateOverdueTasks = async () => {
  // P0 #25: grace by one UTC day so raw local-instant deadlines (P5 #18) are not
  // failed before the due day has ended in the user's own timezone. See overdueThreshold.
  const cutoff = overdueThreshold();

  try {
    const overdueTasks = await Tasks.find({
      deadline: { $lt: cutoff },
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

const decayPetHappiness = async () => {
  try {
    const today = startOfDay(new Date());
    const pets = await Pet.find({ lastDecayDate: { $lt: today } });
    for (const pet of pets) {
      pet.happiness      = Math.max(pet.happiness - 1, 0);
      pet.lastDecayDate  = today;
      pet.evolutionStage = calcEvolutionStage(pet.level, pet.happiness);
      pet.pomodorosToday = 0;
      await pet.save();
    }
    console.log(`Decayed happiness for ${pets.length} pets.`);
  } catch (error) {
    console.error("Error decaying pet happiness:", error);
  }
};

module.exports = {
  checkOverdueTasks,
  updateOverdueTasks,
  resetDailyStreakStatus,
  decayPetHappiness,
};
