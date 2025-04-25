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
        if (allowGuest && req.cookies.guestId) {
          req.user = null;
          req.guestId = req.cookies.guestId;
          console.log("Proceeding as Guest.");
          // --- authMiddlewareOptional End (Guest) ---\n");
          return next(); 
        } else {
          console.log(
            "No accessToken found and guest not allowed. Setting req.user=null."
          );
          req.user = null; 
          return next(); 
        }
      }

      // ถ้ามี Access Token ให้ตรวจสอบ
      console.log("Found accessToken. Attempting verification.");
      try {
        const decoded = await jwtVerify(accessToken, accessTokenSecret);

        req.user = { id: decoded.userId }; // Set req.user ถ้าตรวจสอบผ่าน

        // --- authMiddlewareOptional End (Auth Success) ---\n");

        console.log("req.user is set:", req.user);
        next(); // ผ่านไป Route Handler ปลายทาง
      } catch (error) {
        console.log("Clearing expired/invalid accessToken cookie.");
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "None" : "Lax",
          path: "/",
        });

        req.user = null;
        console.log(
          "req.user set to null. Authentication Failed in Middleware."
        );

        next();
      }
    };

module.exports = authMiddlewareOptional;
