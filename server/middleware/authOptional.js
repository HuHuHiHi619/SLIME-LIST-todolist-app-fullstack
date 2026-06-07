const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const isProduction = process.env.NODE_ENV === "production";

const jwtVerify = promisify(jwt.verify);

const authMiddlewareOptional = 

    (allowGuest = false) =>
    async (req, res, next) => {
      const accessToken = req.cookies.accessToken;

      if (!accessToken) {
        console.log("No accessToken found in cookies.");
        req.user = null;
        return next();
      }

      // ถ้ามี Access Token ให้ตรวจสอบ
      console.log("Found accessToken. Attempting verification.");
      try {
        const decoded = await jwtVerify(accessToken, accessTokenSecret);

        req.user = { id: decoded.userId };

        console.log("req.user is set:", req.user);
        next(); // ผ่านไป Route Handler ปลายทาง
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          console.log("Clearing expired accessToken cookie.");
          res.clearCookie("accessToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
            path: "/",
          });
        } else {
          console.log("Invalid accessToken:", error.message);
        }

        req.user = null;
        next();
      }
    };

module.exports = authMiddlewareOptional;
