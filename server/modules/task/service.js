const {
  startOfDay,
  addMonths,
  endOfMonth,
  parseISO,
  isValid,
} = require("date-fns");
const { processProgress, calculateProgress } = require("../../shared/utils/progressUtils");
const { updateUserStreak } = require("../../shared/services/streakService");
const { getTaskDeadlineRange } = require("../../shared/utils/deadlineUtils");
const repository = require("./repository");

const { STATUS_ORDER, PRIORITY_ORDER, PRIORITIES } = require("../../shared/utils/taskConstants");
const { ServiceError, compareTasksForFlatList, lookupCategoryByName } = require("./helpers");

// ── Read operations ───────────────────────────────────────────────────────────

const getTasksGroupedByStatus = async (userFilter) => {
  const tasks = await repository.findTasks(
    { ...userFilter, status: { $exists: true, $ne: null } },
    [{ path: "category" }]
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
      .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority || "low") - PRIORITY_ORDER.indexOf(b.priority || "low")),
  }));

  return result.sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );
};

const getTasksGroupedByCategory = async (userFilter) => {
  const tasks = await repository.findTasks(
    { ...userFilter, category: { $exists: true, $ne: null } },
    [{ path: "category" }]
  );

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
      .sort((a, b) => {
        const statusComp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        if (statusComp !== 0) return statusComp;
        return PRIORITY_ORDER.indexOf(a.priority || "low") - PRIORITY_ORDER.indexOf(b.priority || "low");
      }),
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
    [{ path: "category" }]
  );

  const grouped = tasks.reduce((acc, task) => {
    const range = getTaskDeadlineRange(task.deadline);
    if (range) {
      if (!acc[range]) acc[range] = { deadlineCase: range, tasks: [] };
      acc[range].tasks.push(calculateProgress(task));
    }
    return acc;
  }, {});

  return Object.values(grouped).map((group) => ({
    ...group,
    tasks: group.tasks.sort(
      (a, b) => PRIORITY_ORDER.indexOf(a.priority || "low") - PRIORITY_ORDER.indexOf(b.priority || "low")
    ),
  }));
};

const getTasksFlat = async (filter) => {
  const tasks = await repository.findTasks(filter, [
    { path: "category" },
  ]);

  if (tasks.length === 0) {
    return [];
  }

  return tasks.map(calculateProgress).sort(compareTasksForFlatList);
};

// ── Write operations ──────────────────────────────────────────────────────────

const createTask = async (data, formatUser, guestId) => {
  const { title, note, startDate, deadline, category, progress, priority } = data;

  const categoryId = category ? await lookupCategoryByName(category, formatUser, guestId) : null;

  let formatProgress = { steps: [], totalSteps: 0, allStepsCompleted: false };
  if (progress && typeof progress === "object" && Array.isArray(progress.steps)) {
    formatProgress.steps = progress.steps.map((step) => ({
      label: step.label,
      completed: step.completed || false,
    }));
    formatProgress.totalSteps = formatProgress.steps.length;
    formatProgress.allStepsCompleted = formatProgress.steps.every((s) => s.completed);
  }

  // Date validation — compare UTC date strings (YYYY-MM-DD) to avoid timezone issues
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

  const todayUTC = new Date().toISOString().slice(0, 10);
  const startUTC = startDateObj.toISOString().slice(0, 10);
  if (startUTC < todayUTC) {
    throw new ServiceError("Start date cannot be in the past!");
  }

  const newTask = {
    title,
    note: note || "",
    startDate: startDateObj,
    deadline: deadlineObj || null,
    category: categoryId,
    progress: formatProgress,
    priority: PRIORITIES.includes(priority) ? priority : "low",
    user: formatUser || null,
    guestId: formatUser ? null : guestId,
  };
  return repository.saveTask(newTask);
};

const updateTask = async (formatId, userFilter, formatUser, guestId, data) => {
  const updateData = { ...data };
  delete updateData._id;

  const existing = await repository.findTask({ _id: formatId, ...userFilter });
  if (!existing) throw new ServiceError("Task not found", 404);

  const final = {
    title: updateData.title || existing.title,
    note: updateData.note !== undefined ? updateData.note : existing.note,
    startDate: updateData.startDate ? new Date(updateData.startDate) : existing.startDate,
    deadline: updateData.deadline !== undefined
      ? (updateData.deadline ? new Date(updateData.deadline) : null)
      : existing.deadline,
    priority: updateData.priority || existing.priority || "low",
    progress: updateData.progress || existing.progress,
    status: updateData.status || existing.status,
  };

  if (updateData.category !== undefined) {
    if (!updateData.category) {
      final.category = null;
    } else {
      final.category = await lookupCategoryByName(updateData.category, formatUser, guestId);
      if (!final.category) throw new ServiceError("Category not found");
    }
  } else {
    final.category = existing.category;
  }

  if (final.progress) {
    final.progress = processProgress(final.progress);
  }

  const updated = await repository.updateTask(
    { _id: formatId, ...userFilter },
    final
  );
  if (!updated) throw new ServiceError("Task not found", 404);

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

    if (formatUser) {
      const userUpdate = await updateUserStreak(formatUser.toString(), true);
      const updatedTask = await task.save();
      return { type: "completed_with_streak", updatedTask, userUpdate };
    }
    const updatedTask = await task.save();
    return { type: "completed_guest", updatedTask };
  } else if (task.status === "completed") {
    task.status = "pending";
    task.progress.steps.forEach((step) => (step.completed = false));
    task.progress.allStepsCompleted = false;
  }

  const updatedTask = await task.save();
  return { type: "toggled", updatedTask };
};

const searchTasks = async (userFilter, searchTerm) => {
  if (!searchTerm) return { warning: "Please provide a search term.", tasks: [] };
  if (searchTerm.length > 100) throw new ServiceError("Search term is too long.");
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  const tasks = await repository.findTasks(
    { ...userFilter, title: { $regex: regex } },
    [{ path: "category" }]
  );
  return tasks.map(calculateProgress);
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
  searchTasks,
  removeTask,
  removeAllCompleted,
};
