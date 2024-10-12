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

router.get("/task/:id", authMiddlewareOptional, guestMiddleware, getTask);
router.get("/task", authMiddlewareOptional, guestMiddleware, getTask);
router.get("/tasks", authMiddlewareOptional, guestMiddleware, getAllTask);
router.get(
  "/tasks/search",
  authMiddlewareOptional,
  guestMiddleware,
  searchTask
);

router.post("/task", authMiddlewareOptional, guestMiddleware, createTask, (req,res) => {
  console.log('req.body',req.body)
  console.log('req.cookie',req.cookies)
  res.status(200).json({message:'task created successful'})
});

router.put("/task/:id", authMiddlewareOptional, guestMiddleware, updatedTask);
router.patch(
  "/task/:id/completed",
  authMiddlewareOptional,
  guestMiddleware,
  completedTask
);

router.delete("/task/:id", authMiddlewareOptional, guestMiddleware, removeTask);


module.exports = router;
