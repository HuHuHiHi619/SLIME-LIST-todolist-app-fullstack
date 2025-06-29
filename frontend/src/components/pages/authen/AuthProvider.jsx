import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../../redux/userSlice"; // fetchUserData เป็น Thunk
import {  BouncingSlimeLoading } from "../animation/SlimePortal";
import AutoTyping from "../animation/AutoTyping";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.user);

  // ใช้ local state เพื่อติดตามว่าได้พยายามตรวจสอบ Authentication ครั้งแรกไปแล้วหรือยัง
  const [initialCheckAttempted, setInitialCheckAttempted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setInitialCheckAttempted(true); // เช็คแล้ว
      return;
    }

    // ถ้า Redux State บอกว่ายังไม่ Login ให้พยายาม Fetch ข้อมูลผู้ใช้
    // การเรียก fetchUserData นี้จะไป Trigger Interceptor ถ้า Access Token หมดอายุ

    const attemptFetchUser = async () => {
      try {
        await dispatch(fetchUserData()).unwrap();
      } catch (error) {
        console.warn(
          "AuthProvider: fetchUserData failed during initial check.",
          error
        );
        // State isAuthenticated จะถูกตั้งค่าเป็น false โดย Reducer fetchUserData.rejected หรือ logoutUser.fulfilled
      } finally {
        // ไม่ว่าสำเร็จหรือล้มเหลว ให้ตั้งค่าว่าพยายามตรวจสอบครั้งแรกเสร็จแล้ว
        setInitialCheckAttempted(true);
      }
    };

    attemptFetchUser();
  }, [dispatch]);

  if (!initialCheckAttempted) {
    return (
      <>
        <div className="fixed inset-0  w-full h-full flex justify-center items-center bg-darkBackground">
          <BouncingSlimeLoading
            isLooping={true}
            repeatCount={15}
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-52 lg:h-52"
          />
          <AutoTyping text="LOADING..." speed={100} pause={1000} />
        </div>
      </>
    );
  }

  // ตรวจสอบครั้งแรกเสร็จแล้ว Render children
  return children;
};

export default AuthProvider;
