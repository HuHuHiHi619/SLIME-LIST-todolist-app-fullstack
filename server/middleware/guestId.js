const { v4: uuidv4 } = require("uuid");

const guestMiddleware = (req, res, next) => {
  console.log('req.cookies:', req.cookies);  // ดูว่าคุกกี้มีค่าอะไรบ้าง
  console.log('req.cookies.guestId:', req.cookies.guestId);  // ดูว่า guestId อยู่ในคุกกี้หรือไม่

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
          maxAge: 7 * 24 * 60 * 60 * 1000, // อายุคุกกี้ 7 วัน
          httpOnly: true,
          secure: false, // เปลี่ยนเป็น true ถ้าใช้ HTTPS
          sameSite: 'lax'
        });
        req.guestId = guestId; // กำหนด guestId สำหรับ request นี้
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
