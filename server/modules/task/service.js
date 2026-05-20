const { isValidObjectId, Types } = require("mongoose");
const {
  startOfDay,
  addMonths,
  endOfMonth,
  parseISO,
  isValid,
} = require("date-fns");
const Category = require("../../Models/Category");
const Tag = require("../../Models/Tag");
const {
  processProgress,
  processCategory,
  tryAgainTask,
  calculateProgress,
} = require("../../controllers/helperController");
const { updateUserStreak } = require("../../shared/services/streakService");
const { getTaskDeadlineRange } = require("../../shared/utils/deadlineUtils");
const repository = require("./repository");

const { STATUS_ORDER, PRIORITY_ORDER, TASK_STATUSES } = require("../../shared/utils/taskConstants");

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ServiceError";
  }
}

// ── Read operations ───────────────────────────────────────────────────────────

const getTasksGroupedByStatus = async (userFilter) => {
  const tasks = await repository.findTasks(
    { ...userFilter, status: { $exists: true, $ne: null } },
    ["status"]
  );

  const grouped = tasks.reduce((acc, task) => {
    if (task.status) {
      if (!acc[task.status]) acc[task.status] = { status: task.status, tasks: [] };
      acc[task.status].tasks.push(task);
    } else {
      console.error("Null or invalid status in task:", task);
    }
    return acc;
  }, {});

  let result = Object.values(grouped).map((group) => ({
    ...group,
    tasks: group.tasks
      .map(calculateProgress)
      .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)),
  }));

  return result.sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );
};

const getTasksGroupedByCategory = async (userFilter) => {
  const tasks = await repository.findTasks(
    { ...userFilter, category: { $exists: true, $ne: null } },
    ["category"]
  );

  console.log("Fetched tasks with category:", tasks.length);

  const grouped = tasks.reduce((acc, task) => {
    if (task.category && task.category._id && task.category.categoryName) {
      const catId = task.category._id.toString();
      if (!acc[catId]) {
        acc[catId] = {
          categoryId: catId,
          categoryName: task.category.categoryName,
          tasks: [],
        };
      }
      acc[catId].tasks.push(task);
    } else {
      console.error("Null or invalid category in task:", task);
    }
    return acc;
  }, {});

  return Object.values(grouped).map((group) => ({
    ...group,
    tasks: group.tasks
      .map(calculateProgress)
      .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)),
  }));
};

const getTasksGroupedByDeadline = async (userFilter) => {
  const currentDate = startOfDay(new Date());
  const tasks = await repository.findTasks(
    {
      ...userFilter,
      status: "pending",
      deadline: {
        $gte: startOfDay(currentDate),
        $lte: endOfMonth(addMonths(currentDate, 1)),
      },
    },
    [{ path: "category" }, { path: "tag" }]
  );

  const grouped = tasks.reduce((acc, task) => {
    const range = getTaskDeadlineRange(task.deadline);
    if (range) {
      if (!acc[range]) acc[range] = { deadlineCase: range, tasks: [] };
      acc[range].tasks.push(calculateProgress(task));
    }
    return acc;
  }, {});

  return Object.values(grouped);
};

const getTasksFlat = async (filter) => {
  const tasks = await repository.findTasks(filter, [
    { path: "deadline" },
    { path: "category" },
    { path: "tag" },
    { path: "status" },
  ]);

  if (tasks.length === 0) {
    console.log("tasklist is 0");
    return [];
  }

  return tasks
    .map((task) => ({ ...calculateProgress(task), tagName: task.tag?.tagName || "low" }))
    .sort((a, b) => {
      const statusComp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (statusComp !== 0) return statusComp;
      return PRIORITY_ORDER.indexOf(a.tag) - PRIORITY_ORDER.indexOf(b.tag);
    });
};

// ── Write operations ──────────────────────────────────────────────────────────

const createTask = async (data, formatUser, guestId) => {
  const { title, note, startDate, deadline, category, progress } = data;

  if (!title || !startDate) {
    throw new ServiceError("Title and start date are required");
  }

  // Category lookup by name
  let categoryId = null;
  if (category && category.length > 0) {
    const existingCategory = await Category.findOne({
      categoryName: category,
      $or: [{ user: formatUser }, { guestId }],
    }).lean();
    if (existingCategory) {
      categoryId = existingCategory._id;
      console.log("Category chosen", existingCategory);
    } else {
      console.log("Category not found");
    }
  }

  // Progress normalisation — inline version preserved verbatim (diverges from processProgress;
  // handles single-object steps and has a known typo "lable". See server/CLAUDE.md Known Issues.)
  let formatProgress = { steps: [], totalSteps: 0, allStepsCompleted: false };
  if (progress && typeof progress === "object") {
    if (Array.isArray(progress.steps)) {
      formatProgress.steps = progress.steps.map((step) => ({
        label: step.label,
        completed: step.completed || false,
      }));
    } else if (progress.steps && typeof progress.steps === "object") {
      formatProgress.steps = [
        {
          label: progress.steps.label || progress.steps.lable, // typo preserved
          completed: progress.steps.completed || false,
        },
      ];
    }
    formatProgress.totalSteps = formatProgress.steps.length;
    formatProgress.allStepsCompleted = formatProgress.steps.every((s) => s.completed);
  }

  // Date validation
  const currentDate = startOfDay(new Date());
  const startDateObj = parseISO(startDate);
  if (!isValid(startDateObj)) throw new ServiceError("Invalid start date format");

  let deadlineObj = null;
  if (deadline) {
    deadlineObj = parseISO(deadline);
    if (!isValid(deadlineObj)) throw new ServiceError("Invalid deadline format");
  }

  if (deadlineObj && startDateObj > deadlineObj) {
    throw new ServiceError("Start date cannot be after deadline!");
  }
  if (startDateObj < currentDate) {
    throw new ServiceError("Start date cannot be in the past!");
  }

  console.log("Format progress", formatProgress);
  const newTask = {
    title,
    note: note || "",
    startDate: startDateObj,
    deadline: deadlineObj || null,
    category: categoryId,
    progress: formatProgress,
    user: formatUser || null,
    guestId: formatUser ? null : guestId,
  };
  console.log("New task", newTask);

  return repository.saveTask(newTask);
};

const updateTask = async (formatId, userFilter, formatUser, guestId, data) => {
  const updateData = { ...data };
  delete updateData._id;

  console.log("UPDATE DATA :", updateData);

  const existing = await repository.findTask({ _id: formatId, ...userFilter });
  if (!existing) throw new ServiceError("Task not found", 404);

  const final = {
    title: updateData.title || existing.title,
    note: updateData.note !== undefined ? updateData.note : "",
    startDate: updateData.startDate ? new Date(updateData.startDate) : existing.startDate,
    deadline: updateData.deadline ? new Date(updateData.deadline) : existing.deadline,
    category:
      updateData.category === "" ? null : updateData.category || existing.category,
    tag: updateData.tag || existing.tag,
    progress: updateData.progress || existing.progress,
    status: updateData.status || existing.status,
  };

  if (final.category) {
    console.log("update data.category process");
    if (isValidObjectId(final.category)) {
      final.category = await processCategory(final.category, formatUser, guestId);
      console.log("final category", final.category);
    } else {
      throw new ServiceError("Invalid category value");
    }
  } else if (final.category === "") {
    final.category = null;
  }

  if (final.tag) {
    const tag = await Tag.findOne({
      $or: [{ tagName: updateData.tag }, { _id: updateData.tag }],
    }).exec();
    if (!tag) throw new ServiceError("Invalid tag value or ID");
    final.tag = tag._id;
  }

  if (final.progress) {
    final.progress = processProgress(final.progress);
  }

  if (final.status && !TASK_STATUSES.includes(final.status)) {
    throw new ServiceError("Invalid status value");
  }

  const updated = await repository.updateTask(
    { _id: formatId, ...userFilter },
    final
  );
  if (!updated) throw new ServiceError("Task not found", 404);

  console.log("Update task successful!", updated);
  return updated;
};

const toggleCompletion = async (formatId, userFilter, formatUser) => {
  const task = await repository.findTask({ _id: formatId, ...userFilter });
  if (!task) throw new ServiceError("Task not found", 404);

  if (task.status === "pending") {
    task.status = "completed";
    task.progress.steps.forEach((step) => (step.completed = true));
    task.progress.allStepsCompleted = true;
    task.progress.totalSteps = task.progress.steps.length;

    console.log("FormatUser:", formatUser);
    if (formatUser) {
      console.log("Calling updateUserStreak...");
      const userUpdate = await updateUserStreak(formatUser.toString(), true);
      const updatedTask = await task.save();
      console.log("user update", userUpdate);
      return { type: "completed_with_streak", updatedTask, userUpdate };
    }
  } else if (task.status === "completed") {
    task.status = "pending";
    task.progress.steps.forEach((step) => (step.completed = false));
    task.progress.allStepsCompleted = false;
  }

  const updatedTask = await task.save();
  return { type: "toggled", updatedTask };
};

const retryTask = async (formatUser, formatId, formatDeadline) => {
  // NOTE: tryAgainTask is not exported from helperController — this throws at runtime.
  // Pre-existing bug; preserved verbatim. See server/CLAUDE.md Known Issues.
  return tryAgainTask(formatUser, formatId, formatDeadline);
};

const searchTasks = async (userFilter, searchTerm) => {
  if (!searchTerm) return { warning: "Please provide a search term.", tasks: [] };
  if (searchTerm.length > 100) throw new ServiceError("Search term is too long.");
  const regex = new RegExp(searchTerm, "i");
  const tasks = await repository.findTasks({ ...userFilter, title: { $regex: regex } });
  return tasks;
};

const removeTask = async (formatId, userFilter) => {
  const removed = await repository.deleteTask({ _id: formatId, ...userFilter });
  if (!removed) throw new ServiceError("Task not found", 404);
  return removed;
};

const removeAllCompleted = async (userFilter) => {
  const result = await repository.deleteManyTasks({ ...userFilter, status: "completed" });
  return result;
};

module.exports = {
  getTasksGroupedByStatus,
  getTasksGroupedByCategory,
  getTasksGroupedByDeadline,
  getTasksFlat,
  createTask,
  updateTask,
  toggleCompletion,
  retryTask,
  searchTasks,
  removeTask,
  removeAllCompleted,
  ServiceError,
};
