const tasks = require("../Models/Tasks");
const {
  startOfDay,
  addDays,
  isValid,
  isYesterday,
  isToday,
  isBefore,
  format,
} = require("date-fns");
const { updateUserStreak } = require("../controllers/helperController");

const { isValidObjectId, Types } = require("mongoose");

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
      ? new Types.ObjectId(req.user.id)
      : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : { guestId: req.guestId };

    // ค้นหางานที่ใกล้ถึงกำหนด
    const upcomingTasks = await tasks.find({
      ...userFilter,
      deadline: { $gte: currentDate, $lte: twoDaysFromNow },
      status: "pending",
    });

    // ค้นหางานที่เสร็จสิ้น
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
          });v
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
