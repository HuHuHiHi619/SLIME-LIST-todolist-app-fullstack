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
          throw new Error("Invalid label: must be a string with max length 100");
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
    if(progress.steps.length === 0){
      progress.allStepsCompleted = false
    } else {
      progress.allStepsCompleted =  process.totalSteps > 0 && progress.steps.every((step) => step.completed);
    }

    return progress; // ส่งกลับ progress ที่ถูกประมวลผล
  } else {
    throw new Error("Invalid progress data");
  }
};

exports.processCategory = async (categoryId, userId, guestId) => {
  const query = {
      _id: categoryId, // ค้นหาจาก ID
      $or: []
  };

  if (userId) query.$or.push({ user: userId });
  if (guestId) query.$or.push({ guestId });

  const existCategory = await Category.findOne(query);
  if (!existCategory) {
      throw new Error('Cannot find category');
  }
  return existCategory._id;
}


exports.processTags = async (tags,userId,guestId) => {
    tags = Array.isArray(tags) ? tags : [tags];
    const query = { tagName: {$in: tags}, $or:[]};

    if(userId) query.$or.push({user: userId});
    if(guestId) query.$or.push({ guestId });

    const existTags = await Tag.find(query);
    if(!existTags) {
        throw new Error('Cannot find tag.');
    }
    return existTags.map(tg => tg._id);
}

const calculateBadge = (streakDays) => {
  if(streakDays >= 10) return 'gold';
  if(streakDays >= 8) return 'silver';
  if(streakDays >= 7) return 'bronze';
  return 'iron';
}

exports.updateUserStreak = async (userId , completed) => {
    const user = await User.findById(userId);
    if(!user) throw new Error('User not found!');

    let badgeChange = false;
    let oldBadge = user.currentBadge;

    const currentDate = startOfDay(new Date());
    const yesterday = startOfDay(subDays(new Date(),1));

    if(completed){
      if(user.lastCompleted && user.lastCompleted.getTime() === currentDate.getTime()){
        return {user,badgeChange }
      }

      if(user.lastCompleted && user.lastCompleted.getTime() === yesterday.getTime()){
          user.currentStreak += 1;
      } else if(!user.lastCompleted || user.lastCompleted.getTime() < yesterday.getTime()){
          user.currentStreak = 1;
      } 
      user.lastCompleted = currentDate;
    } else {
      if(user.lastCompleted && user.lastCompleted.getTime() < yesterday.getTime()){
          user.currentStreak = 0;
      }
    }

    if(user.currentStreak > user.bestStreak){
      user.bestStreak = user.currentStreak
    }

    // calulate badge
    const newBadge = calculateBadge(user.currentStreak);
    if (newBadge !== user.currentBadge) {
      user.currentBadge = newBadge;
      badgeChange = true;
    } 
    
    await user.save();
    return {user, badgeChange, oldBadge};
};

exports.tryAgainTask = async (userId,taskId,newdeadline) => {
    const user = await User.findById(userId)
    if(!user) throw new Error('User not found.');

    const task = await Tasks.findOne({
      _id:taskId, user: userId 
    });
    if(!task) throw new Error('Task not found');

    if(task.tryAgainCount >= 3) {
      task.status = 'failed'
      throw new Error('Reached max tryagain count!')
    }
    
    task.deadline = newdeadline
    task.tryAgainCount += 1;
    task.status = 'pending';
    task.progress.allStepsCompleted = false;

    await task.save();
    return task
}