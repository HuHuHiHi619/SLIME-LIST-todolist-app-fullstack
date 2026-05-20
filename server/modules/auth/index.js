const jwt = require("jsonwebtoken");
const { cookieOptions } = require("../../shared/utils/cookieOptions");

// Read secrets at call time — a late-loaded dotenv never bakes in `undefined`.
const accessTokenSecret = () => process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = () => process.env.REFRESH_TOKEN_SECRET;

const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15m
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7d

// ── Token helpers ─────────────────────────────────────────────────────────────

const signAccessToken = (payload, expiresIn = "15m") =>
  jwt.sign(payload, accessTokenSecret(), { expiresIn, algorithm: "HS256" });

const signRefreshToken = (payload) =>
  jwt.sign(payload, refreshTokenSecret(), { expiresIn: "7d" });

const verifyRefreshToken = (token) =>
  jwt.verify(token, refreshTokenSecret());

// ── Cookie helpers ────────────────────────────────────────────────────────────

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("accessToken", accessToken, cookieOptions({ maxAge: ACCESS_MAX_AGE }));
  res.cookie("refreshToken", refreshToken, cookieOptions({ maxAge: REFRESH_MAX_AGE }));
};

const setAccessCookie = (res, accessToken) =>
  res.cookie("accessToken", accessToken, cookieOptions({ maxAge: ACCESS_MAX_AGE }));

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", cookieOptions({ path: "/" }));
  res.clearCookie("refreshToken", cookieOptions({ path: "/" }));
};

const clearAccessCookie = (res) =>
  res.clearCookie("accessToken", cookieOptions({ path: "/" }));

module.exports = {
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  setAccessCookie,
  clearAuthCookies,
  clearAccessCookie,
};
