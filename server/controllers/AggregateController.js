const { isValidObjectId, Types } = require("mongoose");
const Tasks = require("../Models/Tasks");
const { buildUserFilter } = require("../shared/utils/userFilter");
const { handleError, calculateProgress } = require("./helperController");

exports.getTasksCompletedRate = async (req, res) => {
  try {
    const { userFilter } = buildUserFilter(req);
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });

    const result = await Tasks.aggregate([
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

    if (result.length === 0) return res.status(200).json({ message: "No data found" });
    return res.status(200).json(result);
  } catch (err) {
    handleError(res, err, "Failed to get completed rate");
  }
};

exports.getTasksCompletedRateByCategory = async (req, res) => {
  try {
    const { userFilter } = buildUserFilter(req);
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });

    const result = await Tasks.aggregate([
      { $match: userFilter },
      // Group by category ObjectId when present, else "No Category".
      // $ifNull replaces the first $lookup that was only needed for the $cond/$size check.
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
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          category: {
            $cond: {
              if: { $eq: ["$category", "No Category"] },
              then: "No Category",
              else: { $ifNull: ["$categoryInfo.categoryName", "No Category"] },
            },
          },
          totalTasks: 1,
          completedTasks: 1,
          completedRate: 1,
        },
      },
      { $sort: { category: 1 } },
    ]);

    if (result.length === 0) return res.status(200).json({ message: "No data found" });
    return res.status(200).json(result);
  } catch (err) {
    handleError(res, err, "Failed to get completed rate by category");
  }
};

exports.getProgressStepRate = async (req, res) => {
  try {
    const { id } = req.params; // was req.query — route uses /:id so query was always undefined
    const { userFilter } = buildUserFilter(req);
    const formatId = id && isValidObjectId(id) ? new Types.ObjectId(id) : null;

    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    if (!formatId) return res.status(400).json({ error: "Invalid task ID" });

    const task = await Tasks.findOne({ _id: formatId, ...userFilter });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const enriched = calculateProgress(task.toObject());
    return res.status(200).json({
      id: task._id,
      title: task.title,
      totalSteps: task.progress.totalSteps,
      completedSteps: enriched.progress.completedSteps,
      progressPercentage: enriched.progress.progressPercentage,
    });
  } catch (err) {
    handleError(res, err, "Failed to get progress rate");
  }
};
