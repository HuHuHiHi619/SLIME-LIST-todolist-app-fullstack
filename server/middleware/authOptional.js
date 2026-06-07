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
        req.user = null;
        if (!allowGuest) return res.status(401).json({ error: "Not authenticated" });
        return next();
      }

      try {
        const decoded = await jwtVerify(accessToken, accessTokenSecret);
        req.user = { id: decoded.userId };
        next();
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          res.clearCookie("accessToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
            path: "/",
          });
        }
        req.user = null;
        if (!allowGuest) return res.status(401).json({ error: "Not authenticated" });
        next();
      }
    };

module.exports = authMiddlewareOptional;
