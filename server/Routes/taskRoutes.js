const express = require("express");
const router = express.Router();
const {
  createTask,
  getTask,
  updatedTask,
  completedTask,
  searchTask,
  removeTask,
  removeAllCompletedTask,
} = require("../modules/task/controller");
const { upload } = require("../middleware/upload");
const guestMiddleware = require("../middleware/guestId");
const authMiddlewareOptional = require("../middleware/authOptional");

router.get(
  "/task/searchTask",
  authMiddlewareOptional(true),
  guestMiddleware,
  searchTask
);
router.get("/task", authMiddlewareOptional(true), guestMiddleware, getTask);
router.get("/task/:id", authMiddlewareOptional(true), guestMiddleware, getTask);

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
