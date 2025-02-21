const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../Models/User");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const jwtVerify = promisify(jwt.verify);

let isRefreshing = false;
let refreshQueue = [];

const authMiddlewareOptional =
  (allowGuest = false) =>
  async (req, res, next) => {
    console.log("accessToken Cookies:", req.cookies.accessToken);
    console.log("refreshToken Cookies:", req.cookies.refreshToken);
    console.log("Access Token from headers:", req.headers.authorization);
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
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

      if (decoded.exp * 1000 - Date.now() < 5 * 60 * 1000) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const decoded = jwt.verify(refreshToken, refreshTokenSecret);
            const user = await User.findById(decoded.userId);

            if (!user) {
              throw Error("User not found.");
            }

            const newToken = jwt.sign(
              { userId: decoded.userId },
              accessTokenSecret,
              { expiresIn: "10m" }
            );

            res.cookie("accessToken", newToken, {
              httpOnly: true,
              secure: true,
              sameSite: "None",
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
      req.user = null;
      next();
    }
  };

module.exports = authMiddlewareOptional;
