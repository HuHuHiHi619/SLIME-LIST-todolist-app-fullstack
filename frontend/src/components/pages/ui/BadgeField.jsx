import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../../redux/userSlice";

function BadgeField() {
  const dispatch = useDispatch();
  const { userData, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData.id) {
      dispatch(fetchUserData(userData.id));
    }
  }, [dispatch, userData.id]);
  return (
    <div className="mr-10  flex justify-center items-center bg-purpleMain border-4 border-purpleNormal rounded-3xl p-10  ">
      {isAuthenticated ? (
        
          <div className="">
            <div className="done-button w-28 h-28 ">{userData.currentBadge}</div>
          </div>
        
      ) : (
        <div>
          <p className="text-gray-400 text-center text-2xl p-10">
            Please log in to view your badge
          </p>
        </div>
      )}
    </div>
  );
}

export default BadgeField;
