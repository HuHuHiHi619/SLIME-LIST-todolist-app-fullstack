const Tasks = require("../../Models/Tasks");

const getCompletedRateAggregate = (userFilter) =>
  Tasks.aggregate([
    { $match: userFilter },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        category: "$_id",
        totalTasks: 1,
        completedTasks: 1,
        completedRate: {
          $multiply: [
            {
              $divide: [
                { $ifNull: ["$completedTasks", 0] },
                { $ifNull: ["$totalTasks", 1] },
              ],
            },
            100,
          ],
        },
      },
    },
  ]);

const getCompletedRateByCategoryAggregate = (userFilter) =>
  Tasks.aggregate([
    { $match: userFilter },
    {
      $group: {
        _id: { $ifNull: ["$category", "No Category"] },
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        category: "$_id",
        totalTasks: 1,
        completedTasks: 1,
        completedRate: {
          $multiply: [
            {
              $divide: [
                { $ifNull: ["$completedTasks", 0] },
                { $ifNull: ["$totalTasks", 1] },
              ],
            },
            100,
          ],
        },
      },
    },
    { $sort: { category: 1 } },
  ]);

// Returns a Mongoose document (not .lean()) — controller calls .toObject()
const findTaskForProgress = (formatId, userFilter) =>
  Tasks.findOne({ _id: formatId, ...userFilter });

module.exports = {
  getCompletedRateAggregate,
  getCompletedRateByCategoryAggregate,
  findTaskForProgress,
};
