import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { fetchUserData } from "../../../redux/userSlice";
import FlameBox from "../animation/FlameBox";

function StreakField() {
  const dispatch = useDispatch();
  const { isSidebarPinned } = useSelector((state) => state.tasks);
  const { userData, isAuthenticated } = useSelector((state) => state.user);
  console.log("isauthen streak", isAuthenticated);
  useEffect(() => {
    if (userData.id) {
      dispatch(fetchUserData(userData.id));
    }
  }, [dispatch, userData.id]);

  const streak = userData.currentStreak;

  return (
    <div className="flex">
      {isAuthenticated ? (
        <>
          <div className="relative flex items-center  bg-gradient-to-b from-fuchsia-500 to-indigo-500 border-4 border-fuchsia-400 rounded-3xl pl-4  mr-3 w-full">
            <div className="relative">
              <p className=" text-white text-[70px] -bottom-14 absolute">
                {userData.bestStreak}
              </p>
              {userData.bestStreak > 1 ? (
                <p className=" text-white text-[28px] absolute -bottom-9 left-11 ">
                  DAYS
                </p>
              ) : (
                <p className=" text-white text-[28px] absolute -bottom-9 left-11 ">
                  DAY
                </p>
              )}
            </div>
            <div className="absolute top-6 left-14 pl-1 text-xl leading-none ">
              <p className="text-white">
                BEST
                {!isSidebarPinned && (
                  <span className="text-white text-xl pl-2">STREAK</span>
                )}
              </p>
            </div>
          </div>
          <div className="relative flex items-center bg-purpleActiveTask border-4 border-purpleBorder rounded-3xl pl-4 py-2 mr-3 w-full">
            <div className="relative">
              <p className={` text-white ${isSidebarPinned ? "text-[70px] -left-4 tracking-tighter" : "text-[70px]"}  -bottom-14 absolute`}>
               15
              </p>
              {userData.currentStreak > 1 ? (
                <p className=" text-white text-[28px] absolute -bottom-9 left-11 ">
                  DAYS
                </p>
              ) : (
                <p className=" text-white text-[28px] absolute -bottom-9 left-11 ">
                  DAY
                </p>
              )}
            </div>
            <div className="absolute top-6 left-14 pl-1  text-xl leading-none ">
             
                <p className="text-white text-xl ">STREAK</p>
      
                {!isSidebarPinned && (
                  <p>sdfdsf</p>
                )}
             
            </div>
          </div>
          <div
            className={`bg-purpleMain border-4 rounded-3xl px-4 py-2 mr-10
                   ${streak === 0 ? "border-purpleNormal" : ""} 
                   ${streak <= 5 && streak !== 0 ? "border-orange-400" : ""} 
                   ${streak >= 6 && streak <= 10 ? "border-sky-500" : ""} 
                   ${streak > 10 ? "border-purple-500" : ""}
            `}
          >
            <div className="flex items-center gap-4 justify-between">
              <FontAwesomeIcon
                className={`text-[50px] 
                   ${streak === 0 ? "text-purpleNormal" : ""} 
                   ${streak <= 5 && streak !== 0 ? "text-orange-400" : ""} 
                   ${streak >= 6 && streak <= 10 ? "text-sky-500" : ""} 
                   ${streak > 10 ? "text-purple-500" : ""}
                  `}
                icon={faBolt}
              />
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <FlameBox key={index} index={index} streak={streak} />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-purpleMain border-4 border-purpleNormal rounded-3xl mt-4  mr-10 w-full">
          <p className="text-gray-400 text-center text-2xl p-16">
            Please log in to view your streak
          </p>
        </div>
      )}
    </div>
  );
}

export default StreakField;
