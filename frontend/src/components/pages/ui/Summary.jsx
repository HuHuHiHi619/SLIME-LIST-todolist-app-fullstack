import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSummary,
  fetchSummaryByCategory,
} from "../../../redux/summarySlice";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import "react-circular-progressbar/dist/styles.css";


// Custom Ring Component
const Ring = ({ size }) => (
  <motion.div className={`rounded-full border-4 border-emerald-500 ${size}`} />
);

const GradientCircularProgressbar = ({ percentage, bar }) => {
  return (
    <motion.div
      className="w-32 relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="absolute -inset-2">
          <Ring size="w-36 h-36" />
        </div>

        {/* Gradient definition */}
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id={`gradient-${bar}`}>
              <stop offset="0%" stopColor="#5EFF96" stopOpacity="1" />
              <stop offset="50%" stopColor="#86FFB0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#13C57A" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Progress bar wrapper */}
        <div className="relative z-10 ">
          <CircularProgressbar
            value={percentage}
            text={`${Math.round(percentage)}%`}
            styles={buildStyles({
              textSize: "28px",
              textColor: "#ffffff",
              pathColor: `url(#gradient-${bar})`,
              trailColor: "none",
              pathTransition: "stroke-dashoffset 1.5s ease-out",
              strokeLinecap: "round",
              pathTransitionDuration: 1,
              initialAnimation: true,
            })}
          />
        </div>
      </div>
    </motion.div>
  );
};

function Summary() {
  const dispatch = useDispatch();
  const { summary, summaryCategory } = useSelector((state) => state.summary);
  const { isSummaryUpdated } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchSummaryByCategory());
  }, [dispatch, isSummaryUpdated]);

  const bars = [
    { color: { start: "#2FA5E1", end: "#1B8E34" } },
    { color: { start: "#9CE12F", end: "#FF8D1A" } },
    { color: { start: "#E25F56", end: "#8AABFF" } },
  ];

  

  return (
    <div className="mr-10 bg-purpleMain border-4 border-purpleNormal rounded-3xl py-8 px-6 flex">
      {!Array.isArray(summary) ||
      summary.length === 0 ||
      !Array.isArray(summaryCategory) ||
      summaryCategory.length === 0 ? (
        <div className="flex-1">
          <p className="text-gray-400 text-center text-2xl p-8">
            You have no tasks data summary
          </p>
        </div>
      ) : (
        <>
          {summary.map((item, index) => (
            <div key={index} className=" md:flex gap-4 items-center ">
              <div className="ml-4">
                <GradientCircularProgressbar
                  percentage={item.completedRate || 0}
                  bar={item.bar}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white p-2 text-xl leading-normal"
              >
                <div className="text-2xl pb-1">
                  ALL TASKS : {item.completedTasks} / {item.totalTasks}
                </div>
                <div className="">
                  <p>KEEP GOING YOU</p>
                  <p>CAN DO IT!</p>
                </div>
                
              </motion.div>
            </div>
          ))}

          <div className="hidden  xl:flex flex-col gap-4 flex-1 justify-center ml-4">
            {summaryCategory.map((catItem, catIndex) => (
              <div
                key={catIndex}
                className=" px-4 py-2 cursor-pointer rounded-lg text-xl text-white bg-purpleNormal list-shadow hover:scale-105 transition ease-out duration-100"
              >
                <div className="flex justify-between mb-2">
                  <h3>{catItem.category || "No category"}</h3>
                  <h3>{Math.round(catItem.completedRate)}%</h3>
                </div>
                <ProgressBar
                  color={bars[catIndex % bars.length].color}
                  value={catItem.completedRate}
                />
              </div>
            ))}
          </div>
        </>
      )}
      
    </div>
  );
}

export default Summary;
