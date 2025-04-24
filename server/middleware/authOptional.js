const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const isProduction = process.env.NODE_ENV === "production"; 

const jwtVerify = promisify(jwt.verify);

const authMiddlewareOptional = // ชื่อ Optional ก็ยังใช้ได้ ถ้าบาง Route ไม่ต้องการให้บังคับ Auth
  (allowGuest = false) =>
  async (req, res, next) => {
   
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      console.log("No accessToken found in cookies.");
      if (allowGuest && req.cookies.guestId) {
        req.user = null; // Ensure req.user is null for guest
        req.guestId = req.cookies.guestId; // Keep guestId if it exists and guest allowed
        console.log("Proceeding as Guest.");
        // --- authMiddlewareOptional End (Guest) ---\n");
        return next(); // Proceed as guest
      } else {
        console.log("No accessToken found and guest not allowed. Setting req.user=null.");
        req.user = null; // Ensure req.user is null
         // *** ไม่ต้อง clearCookie ตรงนี้ ถ้าไม่มี token ตั้งแต่แรก ***
        // --- authMiddlewareOptional End (No Auth/Guest) ---\n");
        return next(); // Proceed with no user. Endpoint ปลายทางควรเช็ค !req.user และตอบ 401 เอง
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
      // --- !!! ถ้า Verify Access Token ล้มเหลว (หมดอายุ, ไม่ถูกต้อง) !!! ---
      console.error("\n--- !!! Access Token verification FAILED (Middleware) !!! ---");
      console.error("!!! Error Message:", error.message); // <<< ข้อความ Error ตรงนี้สำคัญที่สุด !!!
      console.error("!!! Error Name:", error.name);
      // console.error("!!! Error Stack:", error.stack); // Optional stack trace
      console.error("!!! Token received:", accessToken);

      // **ลบเฉพาะ Access Token Cookie** (หรือลบทั้งคู่ก็ได้ แต่ลบ AT ชัวร์ๆ Refresh Token ให้ Endpoint /refreshToken จัดการ)
      console.log("Clearing expired/invalid accessToken cookie.");
       res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "None" : "Lax", path: "/" });
       // ไม่ต้องลบ refreshToken cookie ตรงนี้ ปล่อยให้ Frontend เรียก /refreshToken แล้วให้ Endpoint /refreshToken ตัดสินใจลบเองถ้า Refresh Token ไม่ถูกต้อง

      req.user = null; // Ensure req.user is null
      console.log("req.user set to null. Authentication Failed in Middleware.");
      // --- authMiddlewareOptional End (Auth Failed) ---\n");
      next(); // ผ่านไป Route Handler ปลายทาง (เช่น getUserData) ซึ่งควรจะเช็ค !req.user และตอบ 401 เอง

    }
  };

module.exports = authMiddlewareOptional;