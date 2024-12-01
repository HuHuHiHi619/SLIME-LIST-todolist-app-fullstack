import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { fetchUserData } from "../../../redux/userSlice";
import FlameBox from "../animation/FlameBox";
import ReactDOM from "react-dom";

function StreakField() {
  const dispatch = useDispatch();
  const { isSidebarPinned } = useSelector((state) => state.tasks);
  const { userData, isAuthenticated } = useSelector((state) => state.user);
  const { streakStatus } = useSelector((state) => state.tasks);

  useEffect(() => {
    if (userData.id) {
      dispatch(fetchUserData(userData.id));
    }
  }, [dispatch, userData.id]);

  const streak = userData.currentStreak;
  console.log(streakStatus);
  return (
    <div className="flex">
      {isAuthenticated ? (
        <>
          <div className="relative flex items-center  bg-gradient-to-b from-fuchsia-500 to-indigo-500 border-4 border-fuchsia-400 rounded-3xl pl-4  mr-3 w-full">
            <div className="relative">
              <p className=" text-white text-[60px] -bottom-12 -right-9 absolute tracking-tighter">
                {userData.bestStreak}
              </p>
              {userData.bestStreak > 1 ? (
                <p className=" text-white text-2xl absolute -bottom-8 left-11 ">
                  DAYS
                </p>
              ) : (
                <p className=" text-white text-[28px] absolute -bottom-8 left-11 ">
                  DAY
                </p>
              )}
            </div>
            <div className="absolute top-6 left-14 pl-1 text-xl leading-none ">
              <p className="text-white">
                BEST
                {!isSidebarPinned && (
                  <span className="text-white text-xl pl-2 ">STREAK</span>
                )}
              </p>
            </div>
          </div>
          <div
            className={`relative flex items-center ${
              streakStatus.alreadyCompletedToday
                ? "opacity-50 bg-purpleActiveTask "
                : "bg-purpleActiveTask"
            }   border-4 border-purpleBorder rounded-3xl pl-4 py-2 mr-3 w-full`}
          >
            <div className="relative">
              <p
                className={` text-white ${
                  isSidebarPinned
                    ? "text-[60px] -left-0 -bottom-12 tracking-tighter "
                    : "text-[60px]"
                }  -bottom-12 absolute`}
              >
                {userData.currentStreak}
              </p>
              {userData.currentStreak > 1 ? (
                <p
                  className={` text-white transition-all duration-300 ease-in-out ${
                    isSidebarPinned
                      ? "text-xl -left-4 -bottom-10 tracking-tighter "
                      : "text-xl"
                  }  -bottom-12 absolute`}
                >
                  DAYS
                </p>
              ) : (
                <p
                  className={` text-white ${
                    isSidebarPinned
                      ? "text-2xl left-11 -bottom-8  "
                      : "text-2xl top-0 left-7 pl-1"
                  }  -bottom-12 absolute`}
                >
                  DAY
                </p>
              )}
            </div>
            <div
              className={`absolute  pl-1  leading-none transition-all duration-300 ease-in-out
              ${
                isSidebarPinned
                  ? "top-6 left-14 text-xl"
                  : "text-xl top-6 left-11"
              }`}
            >
              <p className="text-white  ">
                STREAK{" "}
                {!isSidebarPinned && (
                  <span className="text-white text-xl  ">NOW</span>
                )}
              </p>
            </div>
          </div>
          <div
            className={`bg-purpleMain border-4 rounded-3xl px-4 py-2 mr-10 transition-all duration-300 ease-out
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
            {streakStatus.alreadyCompletedToday &&
            ReactDOM.createPortal(
              <div className="popup-overlay">
                <div className="done-button">sdfdsfs</div>
              </div>,
              document.body
            )}
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
