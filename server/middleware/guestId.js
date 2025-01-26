const { v4: uuidv4 } = require("uuid");

const guestMiddleware = (req, res, next) => {
 
  try {
    const user = req.user;

    if (!user) {
      // ถ้าไม่มี user แสดงว่าเป็น guest
      if (req.cookies && req.cookies.guestId) {
        // ถ้ามี guestId ในคุกกี้อยู่แล้ว
        req.guestId = req.cookies.guestId;
        console.log('GuestId from cookie:', req.guestId);
      } else {
        // ถ้าไม่มี guestId ในคุกกี้ ให้สร้างใหม่
        const guestId = uuidv4();
        // ตั้งค่า guestId ลงในคุกกี้
        res.cookie("guestId", guestId, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
          httpOnly: true,
          secure: true, 
          sameSite: 'None'
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
    console.error('Error in guestMiddleware:', error);
    next(error);
  }
};

module.exports = guestMiddleware;
