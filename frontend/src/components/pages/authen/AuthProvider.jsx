import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserData,
  logoutUser,
  setAuthError,
} from "../../../redux/userSlice";
import { clearSummaryState } from "../../../redux/summarySlice";
import {
  fetchSummary,
  fetchSummaryByCategory,
} from "../../../redux/summarySlice";
import { fetchTasks } from "../../../redux/taskSlice";
import { BouncingSlime } from "../animation/SlimePortal";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Attempting to fetch user data...");
        // ลอง fetch user data เลย ไม่ต้องเช็ค token ฝั่ง client
        await dispatch(fetchUserData()).unwrap();
        console.log("User authenticated successfully via fetched data!");

        // ดึงข้อมูลอื่นๆ สำหรับ user ที่ login แล้ว (อาจจะไม่จำเป็นถ้า fetchUserData ได้ข้อมูลครบแล้ว)
        // await dispatch(fetchSummary()).unwrap();
        // await dispatch(fetchSummaryByCategory()).unwrap();
        // await dispatch(fetchTasks()).unwrap();
      } catch (error) {
        // fetchUserData ล้มเหลว (อาจจะ 401 Unauthorized หรือ Network error)
        console.warn("Failed to fetch user data or not authenticated:", error);

        // ตรวจสอบว่าเป็น lỗi ที่เกี่ยวกับการยืนยันตัวตนหรือไม่ (เช่น status 401)
        // ถ้าใช่ หรือถ้าต้องการให้เป็น Guest เมื่อ fetch ล้มเหลว:
        if (
          error?.message?.includes("401") ||
          error?.message?.toLowerCase().includes("unauthorized") ||
          !isAuthenticated
        ) {
          // เพิ่มการตรวจสอบสถานะปัจจุบันด้วย
          console.log(
            "Authentication failed or no valid session - switching to guest mode"
          );
          // ไม่จำเป็นต้อง dispatch(logoutUser()) อีก ถ้า fetchUserData.rejected จัดการ state เป็น guest แล้ว
          // dispatch(logoutUser()); // อาจจะเอาออกได้ถ้า extraReducer จัดการดีแล้ว
          dispatch(clearSummaryState());
          dispatch(setAuthError(null)); // หรือตั้งค่า error ที่เหมาะสม

          // ดึงข้อมูลสำหรับ guest
          // ควรตรวจสอบให้แน่ใจว่า API endpoint เหล่านี้ทำงานได้สำหรับ guest ด้วย
          try {
            await dispatch(fetchSummary()).unwrap();
            await dispatch(fetchSummaryByCategory()).unwrap();
            await dispatch(fetchTasks()).unwrap();
          } catch (guestError) {
            console.error("Error fetching data for guest:", guestError);
          }
        } else {
          // จัดการ Error อื่นๆ ที่ไม่ใช่เรื่อง Authentication (เช่น Network Error)
          console.error("Auth check failed due to non-auth error:", error);
          dispatch(setAuthError("Failed to connect to server."));
        }
      } finally {
        setInitialCheckDone(true);
      }
    };

    if (!initialCheckDone) {
      // ตรวจสอบเพื่อให้แน่ใจว่าทำงานครั้งเดียวเมื่อโหลด
      checkAuth();
    }
  }, [dispatch, initialCheckDone, isAuthenticated]); // เพิ่ม isAuthenticated ใน dependency array

  // ส่วนของ Interval Refresh อาจจะต้องปรับปรุงเรื่องการ Handling Error คล้ายๆ กัน
  // และควรพิจารณา Implement การ Refresh Token อัตโนมัติถ้า fetchUserData ล้มเหลวเพราะ Access Token หมดอายุ

  if (!initialCheckDone)
    return (
      <>
        <div className="fixed inset-0 pl-32 w-full h-full flex justify-center items-center bg-darkBackground">
          <BouncingSlime />
        </div>
      </>
    );
  return children;
};

export default AuthProvider;
