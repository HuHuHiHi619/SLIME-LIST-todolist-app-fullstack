const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  refreshedToken,
  getUserData,
  logout,
} = require("../controllers/UserController");
const { updatedTaskAttempt } = require("../controllers/TasksController");
const { upload } = require("../middleware/upload");
const authMiddlewareOptional = require("../middleware/authOptional");

router.get("/user/profile", authMiddlewareOptional(false), getUserData);
router.post(
  "/register",
  upload,
  [
    // validator
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 6, max: 20 })
      .withMessage("Username must be 6–20 characters")
      .matches(/^[a-zA-Z0-9_.]+$/)
      .withMessage(
        "Username must contain only letters, numbers, underscores, or periods"
      ),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register
);
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);
router.post("/logout", authMiddlewareOptional(false), logout);
router.post("/refreshToken", refreshedToken);

router.put(
  "/user/:id/attempt",
  authMiddlewareOptional(false),
  updatedTaskAttempt
);

module.exports = router;
