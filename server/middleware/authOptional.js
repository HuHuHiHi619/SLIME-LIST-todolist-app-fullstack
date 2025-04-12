const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../Models/User");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const isProduction = process.env.NODE_ENV === "production";
const jwtVerify = promisify(jwt.verify);

let isRefreshing = false;
let refreshQueue = [];

const authMiddlewareOptional =
  (allowGuest = false) =>
  async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
      console.log("req.cookies.guestId", req.cookies.guestId);

      if (allowGuest && req.cookies.guestId) {
        req.user = null;
        req.guestId = req.cookies.guestId;
        console.log("Guest ID from cookies:", req.guestId);
        return next();
      } else {
        console.log("No accessToken found in cookies.");
        req.user = null;
        return next();
      }
    }

    try {
      const decoded = await jwtVerify(accessToken, accessTokenSecret);
      req.user = { id: decoded.userId };

      if (decoded.exp * 1000 - Date.now() < 2 * 60 * 1000) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const decoded = jwt.verify(refreshToken, refreshTokenSecret);
            const user = await User.findById(decoded.userId);

            if (!user) {
              res.clearCookie("accessToken");
              res.clearCookie("refreshToken");
              throw Error("User not found.");
            }

            const newToken = jwt.sign(
              { userId: decoded.userId },
              accessTokenSecret,
              { expiresIn: "10m" }
            );

            res.cookie("accessToken", newToken, {
              httpOnly: true,
              secure: isProduction,
              sameSite: isProduction ? "None" : "Lax",
              maxAge: 10 * 60 * 1000,
            });

            refreshQueue.forEach((resolve) => resolve());
            refreshQueue = [];
          } catch (error) {
            console.error("Token refresh error:", error);
            refreshQueue.forEach((reject) => reject(error));
            refreshQueue = [];
          } finally {
            isRefreshing = false;
          }
        } else {
          await new Promise((resolve, reject) => {
            refreshQueue.push(resolve, reject);
          });
        }
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error.message);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      req.user = null;
      next();
    }
  };

module.exports = authMiddlewareOptional;
