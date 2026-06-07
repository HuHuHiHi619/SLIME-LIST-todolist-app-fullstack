const { v4: uuidv4, validate: uuidValidate } = require("uuid");
const isProduction = process.env.NODE_ENV === "production";
const guestMiddleware = (req, res, next) => {
  if (req.user === undefined) {
    return next(new Error("guestMiddleware must run after an auth middleware (req.user is undefined)"));
  }

  try {
    if (!req.user) {
      const incoming = req.cookies && req.cookies.guestId;
      if (incoming && uuidValidate(incoming)) {
        req.guestId = incoming;
        console.log("GuestId from cookie:", req.guestId);
      } else {
        const guestId = uuidv4();
        res.cookie("guestId", guestId, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "None" : "Lax",
        });
        req.guestId = guestId;
        console.log("New Guest ID created:", guestId);
      }
    } else {
      req.guestId = null;
      console.log("User is logged in.");
    }
    next();
  } catch (error) {
    console.error("Error in guestMiddleware:", error);
    next(error);
  }
};

module.exports = guestMiddleware;
