const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshedToken,
  getUserData,
  logout,
} = require("../modules/user/controller");
const { upload } = require("../middleware/upload");
const authMiddlewareOptional = require("../middleware/authOptional");

router.get("/user/profile", authMiddlewareOptional(false), getUserData);
router.post("/register", upload, register);
router.post("/login", login);
router.post("/logout", authMiddlewareOptional(false), logout);
router.post("/refreshToken", refreshedToken);

module.exports = router;
