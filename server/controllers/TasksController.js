const Tasks = require("../Models/Tasks");
const Category = require("../Models/Category");
const Tag = require("../Models/Tag");
const { getNotifications } = require("../utils/notification");
const {
  startOfDay,
  addDays,
  startOfWeek,
  addWeeks,
  endOfWeek,
  startOfMonth,
  addMonths,
  endOfMonth,
  endOfDay,
  parseISO,
  isValid,
} = require("date-fns");
const { isValidObjectId, Types } = require("mongoose");
const {
  processProgress,
  processCategory,
  tryAgainTask,
  updateUserStreak,
  handleError,
  calculateProgress,
} = require("./helperController");

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      category,
      tag,
      groupByDeadline,
      groupByCategory,
      groupByTag,
      groupByStatus,
    } = req.query;
    const formatUser =
      req.user && isValidObjectId(req.user.id)
        ? new Types.ObjectId(req.user.id)
        : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : req.guestId
      ? { guestId: req.guestId }
      : {};
    const statusOrder = ["pending", "completed", "failed"];
    const priorityOrder = ["High", "Medium", "Low"];

    if (!userFilter) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (id) {
      if (!formatId) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      userFilter._id = formatId;
    }

    // filter status
    if (status) {
      if (
        (status && !["pending", "completed", "failed"].includes(status)) ||
        status === undefined
      ) {
        return res.status(400).json({ error: "Invalid status error" });
      }
      userFilter.status = status;
    }

    if (groupByStatus) {
      try {
        const tasksWithStatus = await Tasks.find({
          ...userFilter,
          status: { $exists: true, $ne: null },
        })
          .populate("status")
          .lean()
          .exec();
        console.log("group by status", tasksWithStatus);
        const groupedTasksByStatus = tasksWithStatus.reduce((acc, task) => {
          if (task.status) {
            const taskStatus = task.status;
            if (!acc[taskStatus]) {
              acc[taskStatus] = {
                status: taskStatus,
                tasks: [],
              };
            }
            acc[taskStatus].tasks.push(task);
          } else {
            console.error("Null or invalid status in task:", task);
          }
          return acc;
        }, {});

        let resultByStatus = Object.values(groupedTasksByStatus).map(
          (group) => ({
            ...group,
            tasks: group.tasks
              .map(calculateProgress)
              .sort(
                (a, b) =>
                  statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
              ),
          })
        );

        resultByStatus = resultByStatus.sort(
          (a, b) =>
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        );

        return res
          .status(200)
          .json(resultByStatus.length > 0 ? resultByStatus : []);
      } catch (error) {
        console.error("Error fetching or grouping tasks by status:", error);
        return res
          .status(500)
          .json({ error: "Failed to retrieve tasks by status" });
      }
    }

    // filter category
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      userFilter.category = {
        $in: categories.map((cat) => new Types.ObjectId(cat)),
      };
    }

    if (tag) {
      //filter tag
      const tags = Array.isArray(tag) ? tag : [tag];
      userFilter.tag = { $in: tags.map((tag) => new Types.ObjectId(tag)) };
    }

    if (groupByCategory) {
      try {
        const tasksWithCategory = await Tasks.find({
          ...userFilter,
          category: { $exists: true, $ne: null },
        })
          .populate("category")
          .lean()
          .exec();

        console.log("Fetched tasks with category:", tasksWithCategory.length);

        const groupedTasksByCategory = tasksWithCategory.reduce((acc, task) => {
          if (
            task.category &&
            task.category._id &&
            task.category.categoryName
          ) {
            const categoryId = task.category._id.toString();
            if (!acc[categoryId]) {
              acc[categoryId] = {
                categoryId: categoryId,
                categoryName: task.category.categoryName,
                tasks: [],
              };
            }
            acc[categoryId].tasks.push(task);
          } else {
            console.error("Null or invalid category in task:", task);
          }
          return acc;
        }, {});

        const resultByCategory = Object.values(groupedTasksByCategory).map(
          (group) => ({
            ...group,
            tasks: group.tasks
              .map(calculateProgress)
              .sort(
                (a, b) =>
                  statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
              ),
          })
        );

        if (resultByCategory.length === 0) {
          return res.status(200).json([]);
        }
        return res.status(200).json(resultByCategory);
      } catch (error) {
        console.error("Error fetching or grouping tasks by category:", error);
        return res
          .status(500)
          .json({ error: "Failed to retrieve tasks by category" });
      }
    } else if (groupByTag) {
      try {
        const tasksWithTag = await Tasks.find({
          ...userFilter,
          tag: { $exists: true, $not: { $size: 0 } },
        })
          .populate("tag")
          .lean()
          .exec();

        console.log("Fetched tasks with tag:", tasksWithTag.length);

        const groupedTasksByTag = tasksWithTag.reduce((acc, task) => {
          if (Array.isArray(task.tag) && task.tag.length > 0) {
            task.tag.forEach((tag) => {
              if (tag && tag._id && tag.tagName) {
                const tagId = tag._id.toString();
                if (!acc[tagId]) {
                  acc[tagId] = {
                    tagId: tagId,
                    tagName: tag.tagName,
                    tasks: [],
                  };
                }
                acc[tagId].tasks.push(task);
              } else {
                console.error("Null or invalid tag in task:", task);
              }
            });
          } else {
            console.error("No valid tags in task:", task);
          }
          return acc;
        }, {});

        const resultByTag = Object.values(groupedTasksByTag).map((group) => ({
          ...group,
          tasks: group.tasks.map(calculateProgress),
        }));
        console.log("tasks found by tag:", resultByTag.length);

        if (resultByTag.length === 0) {
          return res.status(200).json([]);
        }
        return res.status(200).json(resultByTag);
      } catch (error) {
        console.error("Error fetching or grouping tasks by tag:", error);
        return res
          .status(500)
          .json({ error: "Failed to retrieve tasks by tag" });
      }
    }

    // filter by deadline ranges
    const currentDate = startOfDay(new Date());
    const deadlineFilters = {
      today: { $gte: startOfDay(currentDate), $lte: endOfDay(currentDate) },
      tomorrow: {
        $gte: startOfDay(addDays(currentDate, 1)),
        $lte: endOfDay(addDays(currentDate, 1)),
      },
      thisWeek: {
        $gte: startOfWeek(currentDate),
        $lte: endOfWeek(currentDate),
      },
      nextWeek: {
        $gte: startOfWeek(addWeeks(currentDate, 1)),
        $lte: endOfWeek(addWeeks(currentDate, 1)),
      },
      thisMonth: {
        $gte: startOfMonth(currentDate),
        $lte: endOfMonth(currentDate),
      },
      nextMonth: {
        $gte: startOfMonth(addMonths(currentDate, 1)),
        $lte: endOfMonth(addMonths(currentDate, 1)),
      },
    };

    if (groupByDeadline) {
      const deadlineTasks = await Promise.all(
        Object.entries(deadlineFilters).map(async ([caseName, dateRange]) => {
          const tasks = await Tasks.find({
            ...userFilter,
            deadline: dateRange,
            status: "pending",
          })
            .populate([{ path: "category" }, { path: "tag" }])
            .lean()
            .exec();
          return { caseName, tasks };
        })
      );

      const resultByDeadline = Object.values(
        deadlineTasks.reduce((acc, { caseName, tasks }) => {
          if (tasks.length > 0) {
            acc[caseName] = {
              deadlineCase: caseName,
              tasks: tasks.map(calculateProgress),
            };
          }
          return acc;
        }, {})
      );
      if (resultByDeadline.length === 0) {
        return res.status(200).json([]);
      }

      return res.status(200).json(resultByDeadline);
    }

    const tasksList = await Tasks.find(userFilter)
      .populate([
        { path: "deadline" },
        { path: "category" },
        { path: "tag" },
        { path: "status" },
      ])
      .lean();

    if (tasksList.length === 0) {
      return res.status(200).json([]);
    }

    const tasksWithProgress = tasksList.map(calculateProgress).sort((a, b) => {
      const statusComparison =
        statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      if (statusComparison !== 0) {
        return statusComparison;
      }
      const priorityComparison =
        priorityOrder.indexOf(a.tag) -
        priorityOrder.indexOf(b.tag);

      return priorityComparison;
    });

    return res.status(200).json(tasksWithProgress);
  } catch (error) {
    handleError(res, error, "Failed to retrieve product");
  }
};

exports.createTask = async (req, res) => {
  console.log("Incoming request", req.body);

  // avoid multiple response
  try {
    const { title, note, startDate, deadline, category, progress, tag } =
      req.body;
    const formatUser =
      req.user && isValidObjectId(req.user.id)
        ? new Types.ObjectId(req.user.id)
        : null;
   

    if (!formatUser && !req.guestId) {
      console.error("unauthorized");
      return res.status(400).json({ error: "Unauthorized" });
    }

    // ตรวจสอบค่าก่อนแปลงเป็น objectid
    let categoryId = null;
    if (category && category.length > 0) {
      const existingCategory = await Category.findOne({
        categoryName: category,
        $or: [{ user: formatUser }, { guestId: req.guestId }],
      }).lean();

      if (existingCategory) {
        categoryId = existingCategory._id;
        console.log("Category chosen", existingCategory);
      } else {
        console.log("Category not found");
      }
    }
    // check tag value then convert tp objectId
    let tagValue = "low"; // ค่า default เป็น 'low'

    if (tag && Array.isArray(tag)) {
      tagValue = tag[0];
    } else if (tag && ["low", "medium", "high"].includes(tag)) {
      tagValue = tag;
    } else if (tag) {
      return res
        .status(400)
        .json({ error: "Invalid tag value. Use 'low', 'medium', or 'high'." });
    }

    // adjust progress
    let formatProgress = {
      steps: [],
      totalSteps: 0,
      allStepsCompleted: false,
    };
    // Array checking
    if (progress && typeof progress === "object") {
      if (Array.isArray(progress.steps)) {
        formatProgress.steps = progress.steps.map((step) => ({
          label: step.label,
          completed: step.completed || false,
        }));
        // single object checking
      } else if (progress.steps && typeof progress.steps === "object") {
        formatProgress.steps = [
          {
            label: progress.steps.label || progress.steps.lable,
            completed: progress.steps.completed || false,
          },
        ];
      }
      formatProgress.totalSteps = formatProgress.steps.length;
      formatProgress.allStepsCompleted = formatProgress.steps.every(
        (step) => step.completed
      );
    }

    // เช็คว่ามี title และ , startDate ต้องไม่ต่ำกว่าวันปัจจุบัน และ ไม่มากกว่า deadline
    if (!title || !startDate) {
      return res
        .status(400)
        .json({ error: "Title and start date are required" });
    }
    const currentDate = startOfDay(new Date());
    const startDateObj = parseISO(startDate);

    let deadlineObj = null;

    if (deadline) {
      deadlineObj = parseISO(deadline);
      if (!isValid(deadlineObj)) {
        return res.status(400).json({ error: "Invalid deadline format" });
      }
    }

    if (!isValid(startDateObj)) {
      return res.status(400).json({ error: "Invalid start date format" });
    }

    if (deadlineObj && startDateObj > deadlineObj) {
      return res
        .status(400)
        .json({ error: "Start date cannot be after deadline!" });
    }

    if (startDateObj < currentDate) {
      return res
        .status(400)
        .json({ error: "Start date cannot be in the past!" });
    }

    const guestId = formatUser ? null : req.guestId;

    // category, tag, user, progress อยู่ใน array ต้อง loop
    const newTask = new Tasks({
      title,
      note: note || "",
      startDate: startDateObj,
      deadline: deadlineObj || null,
      category: categoryId,
      progress: formatProgress,
      tag: tagValue,
      user: formatUser || null,
      guestId,
    });
    console.log("Format progress", formatProgress);
    console.log("New task ", newTask);
    const savedTask = await newTask.save();

    return res.status(201).json(savedTask);
  } catch (error) {
    handleError(res, error, "Failed to create new task");
  }
};

exports.updatedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    console.log("UPDATE DATA :", updateData);

    const formatUser =
      req.user && isValidObjectId(req.user.id)
        ? new Types.ObjectId(req.user.id)
        : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : req.guestId
      ? { guestId: req.guestId }
      : null;

    if (!userFilter) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!formatId) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    userFilter._id = formatId;

    // ดึงงานที่มีอยู่จากฐานข้อมูล
    const existingTask = await Tasks.findOne(userFilter).exec();
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // นำค่าที่มีอยู่มาใช้ถ้าไม่มีการส่งค่ามาใหม่
    const finalUpdateData = {
      title: updateData.title || existingTask.title,
      startDate: updateData.startDate
        ? new Date(updateData.startDate)
        : existingTask.startDate,
      deadline: updateData.deadline
        ? new Date(updateData.deadline)
        : existingTask.deadline,
      category:
        updateData.category === ""
          ? null
          : updateData.category || existingTask.category,
      tag: Array.isArray(updateData.tag) ? updateData.tag : [updateData.tag],
      progress: updateData.progress || existingTask.progress,
      status: updateData.status || existingTask.status,
    };
    console.log("เช็ค category", finalUpdateData);

    // ตรวจสอบและจัดการข้อมูล category
    if (finalUpdateData.category) {
      if (isValidObjectId(finalUpdateData.category)) {
        const categoryPromise = await processCategory(
          finalUpdateData.category,
          formatUser,
          req.guestId
        );
        finalUpdateData.category = categoryPromise;
      } else {
        return res.status(400).json({ error: "Invalid category value" });
      }
    } else if (finalUpdateData.category === "") {
      finalUpdateData.category = null;
    }

    if (Array.isArray(finalUpdateData.tag)) {
      const validTags = ["low", "medium", "high"];
      // Ensure each tag in the array is valid
      for (let t of finalUpdateData.tag) {
        if (!validTags.includes(t)) {
          // เปลี่ยนจาก t.name เป็น t เพราะ t เป็น string
          return res.status(400).json({
            error: `Invalid tag value. Allowed values: ${validTags.join(", ")}`,
          });
        }
      }
    }

    // ตรวจสอบและจัดการข้อมูล progress
    if (finalUpdateData.progress) {
      const processedProgress = processProgress(finalUpdateData.progress);
      finalUpdateData.progress = processedProgress;
    }

    // เช็คสถานะว่าเป็นค่าใดใน ["pending", "completed", "failed"]
    if (
      finalUpdateData.status &&
      !["pending", "completed", "failed"].includes(finalUpdateData.status)
    ) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedTask = await Tasks.findOneAndUpdate(
      { _id: formatId, ...userFilter },
      finalUpdateData,
      { new: true, runValidators: true }
    ).exec();

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("Update task successful!", updatedTask);
    res.status(200).json(updatedTask);
  } catch (error) {
    handleError(res, error, "Failed to update task");
  }
};

exports.completedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const formatUser =
      req.user && isValidObjectId(req.user.id)
        ? new Types.ObjectId(req.user.id)
        : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    const userFilter = formatUser
      ? { user: formatUser }
      : req.guestId
      ? { guestId: req.guestId }
      : null;

    if (!formatId) {
      return res.status(400).json({ error: "Invalid task Id." });
    }

    if (!userFilter) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const task = await Tasks.findOne({ _id: formatId, ...userFilter });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
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
        return res.status(200).json({ updatedTask, user: userUpdate });
      }
    } else if (task.status === "completed") {
      task.status = "pending";
      task.progress.steps.forEach((step) => (step.completed = false));
      task.progress.allStepsCompleted = false;
    }

    const updatedTask = await task.save();

    if (!updatedTask) {
      return res
        .status(404)
        .json({ error: "Task not found or could not be updated" });
    }

    return res.status(201).json({ message: "Task is complete", updatedTask });
  } catch (error) {
    handleError(res, error, "Failed to complete task");
  }
};

exports.updatedTaskAttempt = async (req, res) => {
  try {
    const { id } = req.params;

    const formatUser =
      req.user && isValidObjectId(req.user.id)
        ? new Types.ObjectId(req.user.id)
        : null;
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;

    const formatDeadline = addDays(new Date(), 1);

    if (!formatId) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    if (!formatUser) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    if (!isValid(formatDeadline)) {
      return res.status(400).json({ error: "Invalid new deadline format" });
    }

    const task = await Tasks.findById(formatId);
    if (!task) return res.status(404).json({ error: "Task not found!" });

    if (task.status !== "failed")
      return res.status(404).json({ error: "Task status is not failed" });

    const updatedTaskAttempt = await tryAgainTask(
      formatUser,
      formatId,
      formatDeadline
    );

    await getNotifications(req.user.id, "Keep going!");

    return res
      .status(200)
      .json({ message: "Try again task updated", updatedTaskAttempt });
  } catch (error) {
    handleError(res, error, "Cannot try this task again");
  }
};

exports.searchTask = async (req, res) => {
  try {
    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null
    const userFilter = formatUser ? { user : formatUser } : req.guestId ? { guestId : req.guestId } : null
    const searchTerm = req.query.q || "";

    console.log(searchTerm);
    if (!searchTerm) {
      return res.json({ warning: "Please provide a search term.", tasks: [] });
    }
    if (searchTerm.length > 100) {
      return res.status(400).json({ error: "Search term is too long." });
    }

    const regex = new RegExp(searchTerm, "i");
    const tasks = await Tasks.find({
      ...userFilter,
      title: { $regex: regex },
    });

    return res.status(200).json({ message: "Search successful!", tasks });
  } catch (error) {
    handleError(res, error, "Cannot search a task");
  }
};
