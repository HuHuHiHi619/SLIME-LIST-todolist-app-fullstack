const express = require("express");
const router = express.Router();
const {
  createTask,
  getTask,
  updatedTask,
  completedTask,
  searchTask,
} = require("../controllers/TasksController");
const {  removeTask, removeAllCompletedTask } = require('../controllers/removeController')
const { upload } = require("../middleware/upload");
const guestMiddleware = require("../middleware/guestId");
const authMiddlewareOptional = require("../middleware/authOptional");
const { getTasksCompletedRateByCategory, getTasksCompletedRate, getProgressStepRate } = require("../controllers/AggregateController");

router.get(
  "/task/searchTask",
  authMiddlewareOptional(true),
  guestMiddleware,
  searchTask
);
router.get("/task", authMiddlewareOptional(true), guestMiddleware, getTask);
router.get("/task/:id", authMiddlewareOptional(true), guestMiddleware, getTask);
router.get("/summary/completed-rate",authMiddlewareOptional(true), guestMiddleware,getTasksCompletedRate)
router.get("/summary/completed-rate-by-category",authMiddlewareOptional(true), guestMiddleware,getTasksCompletedRateByCategory)
router.get("/summary/progress-rate/:id",authMiddlewareOptional(true),guestMiddleware, getProgressStepRate)


router.post("/task", authMiddlewareOptional(true), guestMiddleware, createTask);

router.put("/task/:id", authMiddlewareOptional(true), guestMiddleware, updatedTask);
router.patch(
  "/task/:id/completed",
  authMiddlewareOptional(true),
  guestMiddleware,
  completedTask
);

router.delete("/task/:id", authMiddlewareOptional(true), guestMiddleware, removeTask);
router.delete("/completedTask",authMiddlewareOptional(true), guestMiddleware , removeAllCompletedTask)


module.exports = router;
