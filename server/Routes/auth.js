const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const  authMiddlewareOptional  = require('../middleware/authOptional');
const  guestMiddleware  = require('../middleware/guestId');
const {
  register,
  login,
  deleteAllUser,
  refreshedToken,
} = require("../controllers/UserController");
const { updatedUserAttempt } = require('../controllers/TasksController')
const { upload } = require("../middleware/upload");

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

router.put('/users/:id/attepmt',authMiddlewareOptional,guestMiddleware,updatedUserAttempt)

module.exports = router;
