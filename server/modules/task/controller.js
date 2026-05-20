const { isValidObjectId, Types } = require("mongoose");
const { addDays, isValid } = require("date-fns");
const { getNotifications } = require("../../utils/notification");
const { handleError } = require("../../controllers/helperController");
const { buildUserFilter } = require("../../shared/utils/userFilter");
const { TASK_STATUSES } = require("../../shared/utils/taskConstants");
const taskService = require("./service");
const repository = require("./repository");

const { ServiceError } = taskService;

// ── Helpers ───────────────────────────────────────────────────────────────────

const sendServiceError = (res, error) => {
  if (error.name === "ServiceError") {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return null; // caller should call handleError
};

// ── GET /task  and  GET /task/:id ─────────────────────────────────────────────

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category, tag, groupByDeadline, groupByCategory, groupByStatus } =
      req.query;
    const { formatUser, userFilter } = buildUserFilter(req);

    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });

    const baseFilter = { ...userFilter };

    if (id) {
      if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid task ID" });
      baseFilter._id = new Types.ObjectId(id);
    }

    if (status) {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({ error: "Invalid status error" });
      }
    }

    if (groupByStatus) {
      const result = await taskService.getTasksGroupedByStatus(baseFilter);
      return res.status(200).json(result.length > 0 ? result : []);
    }

    if (category) {
      const cats = Array.isArray(category) ? category : [category];
      baseFilter.category = { $in: cats.map((c) => new Types.ObjectId(c)) };
    }

    if (tag) {
      const tags = Array.isArray(tag) ? tag : [tag];
      baseFilter.tag = {
        $in: tags.map((t) =>
          isValidObjectId(t) ? new Types.ObjectId(t)() : t // spurious () preserved — pre-existing bug
        ),
      };
    }

    if (groupByCategory) {
      const result = await taskService.getTasksGroupedByCategory(baseFilter);
      return res.status(200).json(result.length === 0 ? [] : result);
    }

    if (groupByDeadline) {
      const result = await taskService.getTasksGroupedByDeadline(baseFilter);
      return res.status(200).json(result.length === 0 ? [] : result);
    }

    // Flat list — apply status filter here (after group-by early returns)
    if (status) baseFilter.status = status;

    const result = await taskService.getTasksFlat(baseFilter);
    return res.status(200).json(result);
  } catch (error) {
    return sendServiceError(res, error) || handleError(res, error, "Failed to retrieve product");
  }
};

// ── POST /task ────────────────────────────────────────────────────────────────

exports.createTask = async (req, res) => {
  console.log("Incoming request", req.body);
  try {
    const { formatUser, userFilter } = buildUserFilter(req);

    if (!formatUser && !req.guestId) {
      console.error("unauthorized");
      return res.status(400).json({ error: "Unauthorized" });
    }

    const savedTask = await taskService.createTask(req.body, formatUser, req.guestId);
    return res.status(201).json(savedTask);
  } catch (error) {
    return sendServiceError(res, error) || handleError(res, error, "Failed to create new task");
  }
};

// ── PUT /task/:id ─────────────────────────────────────────────────────────────

exports.updatedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { formatUser, userFilter } = buildUserFilter(req);
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;

    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    if (!formatId) return res.status(400).json({ error: "Invalid task ID" });

    const updated = await taskService.updateTask(
      formatId,
      userFilter,
      formatUser,
      req.guestId,
      req.body
    );
    return res.status(200).json(updated);
  } catch (error) {
    return sendServiceError(res, error) || handleError(res, error, "Failed to update task");
  }
};

// ── PATCH /task/:id/completed ─────────────────────────────────────────────────

exports.completedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { formatUser, userFilter } = buildUserFilter(req);
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;

    if (!formatId) return res.status(400).json({ error: "Invalid task Id." });
    if (!userFilter) return res.status(400).json({ error: "Unauthorized" });

    const result = await taskService.toggleCompletion(formatId, userFilter, formatUser);

    if (result.type === "completed_with_streak") {
      return res.status(200).json({ updatedTask: result.updatedTask, user: result.userUpdate });
    }
    return res.status(201).json({ message: "Task is complete", updatedTask: result.updatedTask });
  } catch (error) {
    return sendServiceError(res, error) || handleError(res, error, "Failed to complete task");
  }
};

// ── PUT /user/:id/attempt ─────────────────────────────────────────────────────

exports.updatedTaskAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { formatUser } = buildUserFilter(req);
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const formatDeadline = addDays(new Date(), 1);

    if (!formatId) return res.status(400).json({ error: "Invalid task ID" });
    if (!formatUser) return res.status(400).json({ error: "Invalid User ID" });
    if (!isValid(formatDeadline)) return res.status(400).json({ error: "Invalid new deadline format" });

    const task = await repository.findTaskById(formatId);
    if (!task) return res.status(404).json({ error: "Task not found!" });
    if (task.status !== "failed")
      return res.status(404).json({ error: "Task status is not failed" });

    const updatedTaskAttempt = await taskService.retryTask(formatUser, formatId, formatDeadline);
    await getNotifications(req.user.id, "Keep going!"); // known broken — preserved as-is
    return res.status(200).json({ message: "Try again task updated", updatedTaskAttempt });
  } catch (error) {
    handleError(res, error, "Cannot try this task again");
  }
};

// ── GET /task/searchTask ──────────────────────────────────────────────────────

exports.searchTask = async (req, res) => {
  try {
    const { formatUser, userFilter } = buildUserFilter(req);
    const searchTerm = req.query.q || "";

    console.log(searchTerm);
    const tasks = await taskService.searchTasks(userFilter, searchTerm);

    if (tasks.warning) return res.json(tasks);
    return res.status(200).json({ message: "Search successful!", tasks });
  } catch (error) {
    return sendServiceError(res, error) || handleError(res, error, "Cannot search a task");
  }
};

// ── DELETE /task/:id ──────────────────────────────────────────────────────────

exports.removeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { formatUser, userFilter } = buildUserFilter(req);
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;

    if (!formatId) return res.status(400).json({ error: "Invalid task ID" });

    const removed = await taskService.removeTask(formatId, userFilter);
    return res.status(200).json({ message: "Task removed successfully", removedTask: removed });
  } catch (error) {
    return sendServiceError(res, error) || handleError(res, error, "Failed to remove Task");
  }
};

// ── DELETE /completedTask ─────────────────────────────────────────────────────

exports.removeAllCompletedTask = async (req, res) => {
  try {
    const { formatUser, userFilter } = buildUserFilter(req);

    const result = await taskService.removeAllCompleted(userFilter);

    if (result.deletedCount === 0) {
      return res.status(200).json({ message: "There is no completed task." });
    }
    return res.status(200).json({
      message: "Completed tasks removed successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return sendServiceError(res, error) || handleError(res, error, "Failed to remove Task");
  }
};
