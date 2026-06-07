const path = require("path");
const { validationResult } = require("express-validator");
const { upload, UPLOADS_DIR } = require("../../middleware/upload");
const { handleError } = require("../../controllers/helperController");
const { cookieOptions } = require("../../shared/utils/cookieOptions");
const {
  setAuthCookies,
  setAccessCookie,
  clearAuthCookies,
  clearAccessCookie,
} = require("../auth");
const userService = require("./service");

const sendServiceError = (res, error) => {
  if (error.name === "ServiceError") {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return null; // caller falls back to generic handling
};

// ── POST /register ─────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  upload(req, res, async (error) => {
    if (error) {
      console.error("File upload error:", error);
      return res.status(400).json({ error: error.message });
    }
  });

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { username, password, theme, notification, lastCompleted } = req.body;
    const imageProfile = req.file
      ? path.join(UPLOADS_DIR, req.file.filename)
      : null;

    const result = await userService.registerUser({
      username,
      password,
      theme,
      notification,
      lastCompleted,
      imageProfile,
    });

    return res.status(201).send(result);
  } catch (error) {
    if (sendServiceError(res, error)) return;
    console.error("Server error during registeration:", error);
    return res.status(500).send("Server Error");
  }
};

// ── POST /login ──────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ error: errors.array() });
    }

    const { username, password } = req.body;
    const result = await userService.loginUser({
      username,
      password,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setAuthCookies(res, result);
    res.clearCookie("guestId", cookieOptions({ path: "/" }));

    return res.status(200).json({
      message: "Login successful !",
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

// ── POST /logout ─────────────────────────────────────────────────────────────

exports.logout = async (req, res) => {
  try {
    clearAuthCookies(res);
  } catch (error) {
    console.error("Logout error:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
  return res.status(200).json({ message: "Log out successful!" });
};

// ── POST /refreshToken ───────────────────────────────────────────────────────

exports.refreshedToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    clearAccessCookie(res);
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const newAccessToken = await userService.refreshAccessToken(refreshToken);
    setAccessCookie(res, newAccessToken);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === "ServiceError" && error.message === "User not found") {
      clearAuthCookies(res);
      return res.status(401).json({ error: "User not found" });
    }
    console.error("Refresh token Error", error.message);
    return res
      .status(401)
      .json({ error: "Invalid or expired refresh token, please login again" });
  }
};

// ── GET /user/profile ────────────────────────────────────────────────────────

exports.getUserData = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userData = await userService.getUserData(req.user.id);
    return res.status(200).json(userData);
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error);
  }
};
