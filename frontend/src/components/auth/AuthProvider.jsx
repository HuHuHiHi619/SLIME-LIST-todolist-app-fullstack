import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/userSlice";
import { useUserQuery } from "../../hooks/queries/useUser";
import {  BouncingSlimeLoading } from "../animation/SlimePortal";
import AutoTyping from "../animation/AutoTyping";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { data, isLoading, isSuccess } = useUserQuery();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUserData(data));
    }
  }, [isSuccess, data, dispatch]);

  if (isLoading) {
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

  return children;
};

export default AuthProvider;

