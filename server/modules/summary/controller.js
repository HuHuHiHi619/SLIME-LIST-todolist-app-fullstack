const { isValidObjectId, Types } = require("mongoose");
const { buildUserFilter } = require("../../shared/utils/userFilter");
const { handleError } = require("../../shared/errors");
const { calculateProgress } = require("../../shared/utils/progressUtils");
const repository = require("./repository");

exports.getTasksCompletedRate = async (req, res) => {
  try {
    const { userFilter } = buildUserFilter(req);
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });

    const result = await repository.getCompletedRateAggregate(userFilter);
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

    const result = await repository.getCompletedRateByCategoryAggregate(userFilter);
    if (result.length === 0) return res.status(200).json({ message: "No data found" });
    return res.status(200).json(result);
  } catch (err) {
    handleError(res, err, "Failed to get completed rate by category");
  }
};

exports.getProgressStepRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { userFilter } = buildUserFilter(req);
    const formatId = id && isValidObjectId(id) ? new Types.ObjectId(id) : null;

    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    if (!formatId) return res.status(400).json({ error: "Invalid task ID" });

    const task = await repository.findTaskForProgress(formatId, userFilter);
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
