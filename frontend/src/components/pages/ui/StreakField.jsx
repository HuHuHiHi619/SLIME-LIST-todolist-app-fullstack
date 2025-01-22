import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { fetchUserData } from "../../../redux/userSlice";
import FlameBox from "../animation/FlameBox";

import ReactDOM from "react-dom";
import InstructionPopup from "../ui/InstructionPopup";
import FadeUpContainer from "../animation/FadeUpContainer";
import usePopup from "../hooks/usePopup";

function StreakField() {
  const dispatch = useDispatch();
  const { isSidebarPinned } = useSelector((state) => state.tasks);
  const { userData, isAuthenticated } = useSelector((state) => state.user);
  const { instruction } = useSelector((state) => state.summary);
  const { handleIsInstruct, popupInstructRef } = usePopup();
  const [streakPopup, setStreakPopup] = useState(false);
  const [lastPopupDate, setLastPopupDate] = useState(
    localStorage.getItem("lastPopupDate")
  );
  const streakRef = useRef();

  useEffect(() => {
    const currentDay = new Date().toDateString();
    const lastPopupDate = localStorage.getItem("lastPopupDate");

    if (userData.alreadyCompletedToday && currentDay !== lastPopupDate) {
      setStreakPopup(true);
      localStorage.setItem("lastPopupDate", currentDay);
      setLastPopupDate(currentDay);
    }
  }, [userData.alreadyCompletedToday, lastPopupDate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (streakRef.current && !streakRef.current.contains(e.target)) {
        setStreakPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setLastPopupDate(localStorage.getItem("lastPopupDate"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (userData.id) {
      dispatch(fetchUserData(userData.id));
    }
  }, [dispatch, userData.id]);

  const streak = userData.currentStreak;
  console.log(userData.alreadyCompletedToday);
  return (
    <div className="flex" onClick={handleIsInstruct}>
      {isAuthenticated ? (
        <>
          <div className="hidden relative xl:flex items-center justify-center bg-gradient-to-b from-fuchsia-500 to-indigo-500 border-4 border-fuchsia-400 rounded-3xl pl-4  mr-3 w-full">
            <div className="flex items-center gap-4">
              <p className={`text-white text-[55px]`}>{userData.bestStreak}</p>
              <div>
                <p className="text-white text-xl">BEST</p>
                <p className="text-white text-xl">STREAK</p>
              </div>
            </div>
          </div>
          <div
            className={`hidden  xl:flex items-center justify-center ${
              userData.alreadyCompletedToday
                ? "bg-purpleActiveTask"
                : "opacity-50 bg-purpleActiveTask "
            }   border-4 border-purpleBorder rounded-3xl pl-4 py-2 mr-3 w-full`}
          >
          <div className="flex items-center gap-4">
              <p className={`text-white text-[55px]`}>{userData.currentStreak}</p>
              <div>
                <p className="text-white text-xl">STREAK</p>
                <p className="text-white text-xl">NOW</p>
              </div>
            </div>
          </div>
          <div
            className={`bg-purpleMain border-4 rounded-3xl px-4 py-2 mr-10 w-full  transition-all duration-300 ease-out
                   ${streak === 0 ? "border-purpleNormal" : ""} 
                   ${streak <= 5 && streak !== 0 ? "border-orange-400" : ""} 
                   ${streak >= 6 && streak <= 10 ? "border-sky-500" : ""} 
                   ${streak > 10 ? "border-purple-500" : ""}
            `}
          >
            <div className="flex items-center gap-4 justify-between pl-6 xl:p-0">
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

            {streakPopup &&
              ReactDOM.createPortal(
                <div className="streak-popup  ml-12 md:ml-72">
                  <FadeUpContainer direction="down" delay={0.6}>
                    <div
                      className=" flex items-center border-4 p-2 lg:p-6 rounded-xl"
                      ref={streakRef}
                    >
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="border-4 py-4 px-1 rounded-lg text-green-400 text-xl"
                      />
                      <div className="pl-4 text-white text-base lg:text-xl">
                        <p>CONGRATS! </p>
                        <p>YOU COLLECTED TODAY STREAK</p>
                      </div>
                    </div>
                  </FadeUpContainer>
                </div>,
                document.body
              )}

            {instruction &&
              ReactDOM.createPortal(
                <div className="popup-overlay">
                  <div className="popup-content" ref={popupInstructRef}>
                    <InstructionPopup onClose={handleIsInstruct} />
                  </div>
                </div>,
                document.body
              )}
          </div>
        </>
      ) : (
        <div className="bg-purpleSidebar border-4 border-purpleNormal rounded-3xl mt-6  mr-10 w-full">
          <p className="text-gray-400 text-center text-2xl p-16">
            Please log in to view your streak
          </p>
        </div>
      )}
    </div>
  );
}

export default StreakField;
