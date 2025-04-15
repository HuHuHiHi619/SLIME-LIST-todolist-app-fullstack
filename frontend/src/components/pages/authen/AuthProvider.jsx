import React , { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserData,
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
  const [initialCheckDone, setInitialCheckDone] = useState(() => {
      const storedCheck = sessionStorage.getItem('initialCheckDone')
      return storedCheck === 'true'
  });
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Attempting to fetch user data...");
        // ลอง fetch user data เลย ไม่ต้องเช็ค token ฝั่ง client
        await dispatch(fetchUserData()).unwrap();
        console.log("User authenticated successfully via fetched data!");
        sessionStorage.setItem('initialCheckDone', 'true')
      
      } catch (error) {
        // fetchUserData ล้มเหลว (อาจจะ 401 Unauthorized หรือ Network error)
        console.warn("Failed to fetch user data or not authenticated:", error);
        sessionStorage.setItem('initialAuthCheckDone', 'true');
        if (
          error?.message?.includes("401") ||
          error?.message?.toLowerCase().includes("unauthorized") ||
          !isAuthenticated
        ) {
          // เพิ่มการตรวจสอบสถานะปัจจุบันด้วย
          console.log(
            "Authentication failed or no valid session - switching to guest mode"
          );
        
          dispatch(clearSummaryState());
          dispatch(setAuthError(null)); 

          // ดึงข้อมูลสำหรับ guest
          try {
            await dispatch(fetchSummary()).unwrap();
            await dispatch(fetchSummaryByCategory()).unwrap();
            await dispatch(fetchTasks()).unwrap();
          } catch (guestError) {
            console.error("Error fetching data for guest:", guestError);
          }
        } else {
          
          console.error("Auth check failed due to non-auth error:", error);
          dispatch(setAuthError("Failed to connect to server."));
        }
      } finally {
        setInitialCheckDone(true);
      }
    };

    if (!initialCheckDone) {
      //ทำงานครั้งเดียวเมื่อโหลด
      checkAuth();
    }
  }, [dispatch, initialCheckDone, isAuthenticated]); // เพิ่ม isAuthenticated ใน dependency array

 
  // รอ Implement การ Refresh Token อัตโนมัติถ้า fetchUserData ล้มเหลวเพราะ Access Token หมดอายุ

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
