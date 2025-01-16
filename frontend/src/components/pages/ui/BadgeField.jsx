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
    <div className="bg-purpleSidebar border-4 border-purpleNormal mr-10 justify-start items-center rounded-3xl  ">
      {isAuthenticated ? (
        
          <div className="bg-purpleGradient p-1 rounded-2xl ">
            <div className="bg-purpleSidebar rounded-2xl p-4 px-10 w-full flex justify-center">
              <div className=" w-32 h-32 ">
                <img src={badgeImages[userData.currentBadge] || "./images/Iron-badge.png"} alt="" />
              </div>
              <div className="grid items-center ">
                <p className="text-[50px]  px-10  text-white">{userData.currentBadge.toUpperCase()}</p>
              </div>
            </div>
           
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
