const express = require("express");
const router = express.Router();
const {
  createTask,
  getTask,
  updatedTask,
  getAllTask,
  completedTask,
  searchTask,
} = require("../controllers/TasksController");
const {  removeTask } = require('../controllers/removeController')
const { upload } = require("../middleware/upload");
const guestMiddleware = require("../middleware/guestId");
const authMiddlewareOptional = require("../middleware/authOptional");

router.get("/task/:id", authMiddlewareOptional(true), guestMiddleware, getTask);
router.get("/task", authMiddlewareOptional(true), guestMiddleware, getTask);
router.get("/tasks", authMiddlewareOptional(true), guestMiddleware, getAllTask);
router.get(
  "/tasks/search",
  authMiddlewareOptional(true),
  guestMiddleware,
  searchTask
);

router.post("/task", authMiddlewareOptional(true), guestMiddleware, createTask, (req,res) => {
  console.log('req.body',req.body)
  console.log('req.cookie',req.cookies)
  res.status(200).json({message:'task created successful'})
});

router.put("/task/:id", authMiddlewareOptional(true), guestMiddleware, updatedTask);
router.patch(
  "/task/:id/completed",
  authMiddlewareOptional(true),
  guestMiddleware,
  completedTask
);

router.delete("/task/:id", authMiddlewareOptional(true), guestMiddleware, removeTask);


module.exports = router;
