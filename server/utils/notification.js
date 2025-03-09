const tasks = require("../Models/Tasks");
const {
  startOfDay,
  addDays,
  isToday,
  isTomorrow,
  format,
} = require("date-fns");
const { updateUserStreak } = require("../controllers/helperController");
const { isValidObjectId} = require("mongoose");
const mongoose = require("mongoose");
const User = require("../Models/User");

const getBadgeImageUrL = (badgeLevel) => {
    return `/images/badges/${badgeLevel}.jpg`
}

const handleError = (res,error,message = 'Server Error',statusCode = 500) => {
    console.error(`Error: ${message}`,error);
    res.status(statusCode).json({error: message});
} 

exports.getNotifications = async (req, res) => {
  try {
    const currentDate = startOfDay(new Date());
    const twoDaysFromNow = startOfDay(addDays(currentDate, 2));
    const formatUser = isValidObjectId(req.user)
      ? new mongoose.Schema.Types.ObjectId(req.user.id)
      : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : { guestId: req.guestId };

  
    const upcomingTasks = await tasks.find({
      ...userFilter,
      deadline: { $gte: currentDate, $lte: twoDaysFromNow },
      status: "pending",
    });

   
    let completedTasks = [];
    try {
      completedTasks = await tasks
        .find({
          ...userFilter,
          status: "completed",
          completedAt: { $lte: currentDate },
        })
        .sort({ completedAt: -1 });
    } catch (error) {
      console.error("Error fetching completed tasks!");
    }

    let notifications = [];

    // แจ้งเตือนเมื่องานใกล้ถึงกำหนด
    if (upcomingTasks.length > 0) {
      upcomingTasks.forEach((task) => {
        notifications.push({
          type: "task",
          message: `The task ${task.title} is due soon!`,
          deadline: format(new Date(task.deadline), "yyyy-MM-dd"),
        });
      });
    } else if(upcomingTasks.length === 0) {
      notifications.push({
        message: "You have no upcoming deadline!"
      })
    }

    if (formatUser) {
      try {
        const {
          user: updatedUser,
          badgeChange,
          oldBadge,
        } = await updateUserStreak(
          formatUser,
          completedTasks && completedTasks.length > 0
        );
        // current streak
        if (updatedUser.currentStreak > 0) {
          notifications.push({
            type: "streak",
            message: `Your current streak is ${updatedUser.currentStreak} days!`,
          });
        } else {
          notifications.push({
            type: "streak",
            message:
              "Your streak has ended. Complete a task today for start a new streak!",
          });
        }
        // break record
        if (
          updatedUser.currentStreak === updatedUser.bestStreak &&
          updatedUser.currentStreak > 1
        ) {
          notifications.push({
            type: "achievement",
            message: `Congrat! You reached you best streak of ${updatedUser.bestStreak} days`,
          });
        } else if (updatedUser.currentStreak > updatedUser.bestStreak) {
          notifications.push({
            type: "achievement",
            message: `Fantastic! You've set your new best streak of ${updatedUser.currentStreak} days`,
          });
        }

        //  get a new badge
        if (badgeChange) {
          notifications.push({
            type: "badge",
            message: `Congrat! You've got a new ${updatedUser.currentBadge.toUpperCase()} badge!`,
            oldBadge: oldBadge,
            badgeImage: getBadgeImageUrL(updatedUser.currentBadge),
          });
        }
        
      } catch (error) {
        console.error("Error updating user streak", error);
        notifications.push({
          type: "error",
          message:
            "We encounterd an issue updating your streak. Please try again later.",
        });
      }
    }

    return res.status(200).json(notifications);
  } catch (error) {
    handleError(res, error, "Failed to retrieve notifications");
  }
};

exports.checkDeadlinesAndNotify = async (req,res) => {
  try{
    if(req.query.token !== process.env.CRON_SECRET_TOKEN){
      return res.status(401).json({message: 'Unauthorized'} );
    }

    const currentDate = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(currentDate, 1));
    const formatUser = isValidObjectId(req.user)
      ? new mongoose.Schema.Types.ObjectId(req.user.id)
      : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : { guestId: req.guestId };

  
    const upcomingTasks = await tasks.find({
      ...userFilter,
      deadline: { $gte: currentDate, $lte: tomorrow },
      status: "pending",
    });

    // group task by user
    const taskByUser = {}
    for ( const task of upcomingTasks ) {
      const userId = task.user ? task.user.toString() : task.guestId
      if(!taskByUser[userId]){
        taskByUser[userId] = []
      }
      taskByUser[userId].push(task)
    }
    // sent to noti
    const notificationsResults =[]
    for( const userId of taskByUser ){
      const userTasks = taskByUser[userId]
      if(userId.startswith('guestId_')){
        continue;
      }
      try{
        const user = await User.findById(userId)
        if(!user){
          continue;
        }

        const notifications = userTasks.map(task => {
          const deadlineDate = new Date(task.deadline)
          let message = ""
          if (isToday(deadlineDate)){
            message = "TODAY"
          } else if (isTomorrow(deadlineDate)){
            message = "TOMORROW"
          }

          return {
            type: "deadline",
            taskId : task._id,
            message: `Your task ${task.title} is due ${message}}`,
            deadline: format(deadlineDate, "yyyy-MM-dd"),
            createAt: new Date(),
            isRead: false
          }
        })
        if (!user.notifications) {
          user.notifications = [];
        }
        
        const existingTaskIds = new Set(
          user.notifications
            .filter(n => n.type === "deadline")
            .map(n => n.taskId ?.toString())
        )

      } catch(error){

      }
    }

  } catch(error){

  }
}