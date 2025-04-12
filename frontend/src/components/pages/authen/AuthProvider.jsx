import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData, logoutUser, setAuthError } from "../../../redux/userSlice";
import { clearSummaryState } from "../../../redux/summarySlice";
import { fetchSummary, fetchSummaryByCategory } from "../../../redux/summarySlice";

// เพิ่มฟังก์ชันตรวจสอบว่ามี token หรือไม่
const hasAuthToken = () => {
  // เช็คจาก cookies หรือตรวจสอบจากสิ่งอื่นที่บ่งชี้ว่ามีการ login
  // เช่น คุณอาจมี cookie ที่ชื่อ 'accessToken' หรือ 'isLoggedIn'
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => 
    cookie.trim().startsWith('accessToken=') || 
    cookie.trim().startsWith('refreshToken=')
  );
};

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isRefreshing, isGuest } = useSelector((state) => state.user);
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        
        // ตรวจสอบว่ามี token หรือไม่
        if (!hasAuthToken()) {
          console.log("No auth token found - setting as guest");
          // ไม่มี token - เป็น guest
          dispatch(logoutUser()); // เพื่อให้แน่ใจว่าสถานะเป็น guest
          
          // เรียก fetchSummary สำหรับ guest ได้เลย
          console.log("Fetching summary for guest...");
          await dispatch(fetchSummary()).unwrap();
          await dispatch(fetchSummaryByCategory()).unwrap();
          
          setInitialCheckDone(true);
          return;
        }
        
        // มี token - พยายาม fetchUserData
        console.log("Auth token found - attempting to fetch user data");
        await dispatch(fetchUserData()).unwrap();
        console.log("User authenticated!");
        
        // ถ้าสำเร็จ ให้ดึง summary data ของ user
        await dispatch(fetchSummary()).unwrap();
        await dispatch(fetchSummaryByCategory()).unwrap();
      } catch (error) {
        console.error("Auth check failed:", error);
        // ถ้าล้มเหลว ให้ logout และเปลี่ยนเป็น guest
        dispatch(logoutUser());
        dispatch(clearSummaryState());
        
        // ดึง summary data ของ guest
        await dispatch(fetchSummary()).unwrap();
        await dispatch(fetchSummaryByCategory()).unwrap();
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkAuth();
  }, [dispatch]);

  // refresh user data เป็นระยะ (เฉพาะเมื่อ authenticated)
  React.useEffect(() => {
    let interval;

    // จัดการ interval สำหรับ refresh เฉพาะเมื่อเป็น user ที่ login แล้วเท่านั้น
    if (isAuthenticated && !isGuest && initialCheckDone && !isRefreshing) {
      interval = setInterval(async () => {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          console.warn("Error refreshing user data:", error);
          dispatch(logoutUser());
          dispatch(clearSummaryState());
          dispatch(setAuthError("Session expired. Please login again."));
          
          // ดึง summary data ของ guest หลัง logout
          await dispatch(fetchSummary()).unwrap();
          await dispatch(fetchSummaryByCategory()).unwrap();
        }
      }, 3 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, isRefreshing, initialCheckDone, isGuest, dispatch]);

  if (!initialCheckDone) return null;
  return children;
};

export default AuthProvider;