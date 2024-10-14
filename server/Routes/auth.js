const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  refreshedToken,
  getUserData,
  logout,
} = require("../controllers/UserController");
const { updatedUserAttempt } = require('../controllers/TasksController')
const { upload } = require("../middleware/upload");
const authMiddlewareOptional = require("../middleware/authOptional");

router.get("/user/:id/profile",authMiddlewareOptional(false),getUserData)
router.post(
  "/register",
  upload,
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register
);
router.post("/login",
    [
        body("username").notEmpty().withMessage("Username is required"),
        body("password").notEmpty().withMessage("Password is required")
    ],
    login);
router.post("/logout",logout)
router.post("/refreshToken",authMiddlewareOptional(false),refreshedToken)

router.put('/users/:id/attepmt',authMiddlewareOptional(false),updatedUserAttempt)

module.exports = router;
