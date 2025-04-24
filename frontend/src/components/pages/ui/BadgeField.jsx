import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../../redux/userSlice";

function BadgeField() {
  const dispatch = useDispatch();
  const { userData, isAuthenticated } = useSelector((state) => state.user);
  const badgeImages = {
    gold : "./images/Gold-badge.png",
    silver : "./images/Silver-badge.png",
    bronze : "./images/Bronze-badge.png",
    iron : "./images/Iron-badge.png"
  }

  useEffect(() => {
    if (userData.id) {
      dispatch(fetchUserData(userData.id));
    }
  }, [dispatch, userData.id]);
  return (
    <div className="justify-start items-center  ">
      {isAuthenticated ? (
        
          <div className="bg-purpleGradient p-0.5 rounded-3xl ">
            <div className="bg-purpleSidebar rounded-3xl py-8 px-10 w-full flex justify-center">
              <div className="max-w-[128px] w-full aspect-square ">
                <img  className="w-full h-full object-contain" src={badgeImages[userData.currentBadge] || "./images/Iron-badge.png"} alt="" />
              </div>
              <div className="grid items-center ">
                <p className="text-[50px]  px-10  text-white">{userData.currentBadge.toUpperCase()}</p>
              </div>
            </div>
           
          </div>
        
      ) : (
        <div className="border-2 border-purpleNormal rounded-3xl">
          <p className="text-gray-400 text-center text-2xl p-16">
            Please log in to view your badge
          </p>
        </div>
      )}
    </div>
  );
}

export default BadgeField;
