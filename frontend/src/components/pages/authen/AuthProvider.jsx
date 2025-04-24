import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../../redux/userSlice"; // fetchUserData เป็น Thunk
import { BouncingSlime } from "../animation/SlimePortal";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  const {isAuthenticated} = useSelector(state => state.user); 

  // ใช้ local state เพื่อติดตามว่าได้พยายามตรวจสอบ Authentication ครั้งแรกไปแล้วหรือยัง
  const [initialCheckAttempted, setInitialCheckAttempted] = useState(false);


  useEffect(() => {
   
    if (isAuthenticated) {
        console.log("AuthProvider: User already authenticated in Redux state. Skipping initial fetch.");
        setInitialCheckAttempted(true); // เช็คแล้ว
        return; 
    }

    // ถ้า Redux State บอกว่ายังไม่ Login ให้พยายาม Fetch ข้อมูลผู้ใช้
    // การเรียก fetchUserData นี้จะไป Trigger Interceptor ถ้า Access Token หมดอายุ
    console.log("AuthProvider: User not authenticated in Redux state. Attempting to fetch user data...");

    const attemptFetchUser = async () => {
       try {
         // Dispatch Thunk fetchUserData และรอผลลัพธ์ (รวมถึง Interceptor และ Retry)
         await dispatch(fetchUserData()).unwrap();
         console.log("AuthProvider: fetchUserData (and potential refresh/retry) succeeded.");
         // State isAuthenticated จะถูกอัปเดตเป็น true โดย Reducer fetchUserData.fulfilled

       } catch (error) {
         // หาก fetchUserData ล้มเหลว (รวมถึงกรณี Interceptor Refresh ล้มเหลวและ Dispatch logoutUser ไปแล้ว)
         console.warn("AuthProvider: fetchUserData failed during initial check.", error);
         // State isAuthenticated จะถูกตั้งค่าเป็น false โดย Reducer fetchUserData.rejected หรือ logoutUser.fulfilled
       } finally {
         // ไม่ว่าสำเร็จหรือล้มเหลว ให้ตั้งค่าว่าพยายามตรวจสอบครั้งแรกเสร็จแล้ว
         setInitialCheckAttempted(true);
         console.log("AuthProvider: Initial authentication check attempt finished.");
       }
    };

   
    attemptFetchUser();

   
  }, [dispatch]); 

   if (!initialCheckAttempted) { 
       console.log("AuthProvider: Showing loading spinner (Initial check not attempted or still loading)...");
       return (
         <>
           <div className="fixed inset-0 pl-32 w-full h-full flex justify-center items-center bg-darkBackground">
             <BouncingSlime isLooping={true} />
           </div>
         </>
       );
   }

  // เมื่อตรวจสอบครั้งแรกเสร็จแล้ว (สำเร็จหรือล้มเหลว) ให้ Render children
  console.log("AuthProvider: Initial check attempted. Rendering children.");
  return children;
};

export default AuthProvider;