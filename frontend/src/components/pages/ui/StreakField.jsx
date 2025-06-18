import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { fetchUserData } from "../../../redux/userSlice";
import FlameBox from "../animation/FlameBox";
import Tooltip from "../ui/Tooltip";
import ReactDOM from "react-dom";

import FadeUpContainer from "../animation/FadeUpContainer";

function StreakField() {
  const dispatch = useDispatch();
  const { userData, isAuthenticated } = useSelector((state) => state.user);
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


  return (
    <div className="flex w-full gap-4">
      {isAuthenticated ? (
        <>
          {/* BEST STREAK */}
          <div className=" hidden xl:flex items-center justify-center rounded-3xl border-2 border-fuchsia-400  flex-1">
            <Tooltip description="Best Streak" position="top">
              <div className=" flex items-center gap-2 bg-fuchsia-400 bg-clip-text text-transparent">
                <p className=" text-7xl">{userData.bestStreak}</p>
                <div className=" hidden 2xl:block text-2xl leading-6">
                  <p>BEST</p>
                  <p>STREAK</p>
                </div>
              </div>
            </Tooltip>
          </div>

          {/* CURRENT STREAK */}
          <div
            className={`hidden xl:flex items-center justify-center border-2 border-purpleBorder rounded-3xl  flex-1
                ${
                  userData.alreadyCompletedToday
                    ? "bg-purpleBorder bg-clip-text text-transparent"
                    : "opacity-70 text-purpleNormal border-purpleNormal"
                }
              `}
          >
            <Tooltip description="Current Streak" position="top">
              <div className="flex items-center gap-2 ">
                <p className="text-7xl">{userData.currentStreak}</p>
                <div className="hidden 2xl:block text-2xl leading-6">
                  <p>STREAK</p>
                  <p>NOW</p>
                </div>
              </div>
            </Tooltip>
          </div>

          {/* STREAK BAR */}
          <div
            className={`bg-darkBackground border-2 rounded-3xl  px-4 py-2  flex-1
            ${streak === 0 ? "border-purpleNormal" : ""}
            ${streak <= 5 && streak !== 0 ? "border-orange-400" : ""}
            ${streak >= 6 && streak <= 10 ? "border-sky-500" : ""}
            ${streak > 10 ? "border-purple-500" : ""}
          `}
          >
            <div className="flex items-center justify-between gap-4">
              <FontAwesomeIcon
                className={`text-[50px] flex-1
                ${streak === 0 ? "text-purpleNormal" : ""}
                ${streak <= 5 && streak !== 0 ? "text-orange-400" : ""}
                ${streak >= 6 && streak <= 10 ? "text-sky-500" : ""}
                ${streak > 10 ? "text-purple-500" : ""}
              `}
                icon={faBolt}
              />
              <div className="flex  gap-2">
                {[...Array(5)].map((_, index) => (
                  <FlameBox key={index} index={index} streak={streak} />
                ))}
              </div>
            </div>

            {streakPopup &&
              ReactDOM.createPortal(
                <div className="streak-popup ml-8 md:ml-72 mb-4">
                  <FadeUpContainer direction="down" delay={0.6}>
                    <div
                      className="flex items-center border-4 p-4 rounded-xl bg-darkBackground"
                      ref={streakRef}
                    >
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="border-4 p-2 rounded-lg text-green-400 text-xl"
                      />
                      <div className="pl-4 text-white text-base lg:text-xl">
                        <p>CONGRATS!</p>
                        <p>YOU COLLECTED TODAY STREAK</p>
                      </div>
                    </div>
                  </FadeUpContainer>
                </div>,
                document.body
              )}
          </div>
        </>
      ) : (
        <div
          className="w-full  rounded-3xl border-2 border-purpleNormal"
          
        >
          <p className="text-gray-400 text-center text-2xl p-12">
            Please log in to view your streak
          </p>
        </div>
      )}
    </div>
  );
}
export default StreakField;
