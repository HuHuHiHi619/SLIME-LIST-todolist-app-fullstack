const express = require("express");
const router = express.Router();
const {
  getTasksCompletedRate,
  getTasksCompletedRateByCategory,
  getProgressStepRate,
} = require("../modules/summary/controller");
const guestMiddleware = require("../middleware/guestId");
const authMiddlewareOptional = require("../middleware/authOptional");

router.get("/summary/completed-rate", authMiddlewareOptional(true), guestMiddleware, getTasksCompletedRate);
router.get("/summary/completed-rate-by-category", authMiddlewareOptional(true), guestMiddleware, getTasksCompletedRateByCategory);
router.get("/summary/progress-rate/:id", authMiddlewareOptional(true), guestMiddleware, getProgressStepRate);

module.exports = router;
