import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSummary,
  fetchSummaryByCategory,
} from "../../../redux/summarySlice";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { motion, animate } from "framer-motion";
import ProgressBar from "./ProgressBar";
import "react-circular-progressbar/dist/styles.css";

// Custom Ring Component
const Ring = ({ size }) => (
  <motion.div
    className={`rounded-full border-4 border-emerald-500 drop-shadow-[0_0_10px_rgba(39,245,124,1)] ${size}`}
  />
);

const GradientCircularProgressbar = ({ percentage }) => {
  const [animatePercent, setAnimatePercent] = useState(0);

  useEffect(() => {
    setAnimatePercent(0);
    const controls = animate(0, percentage, {
      duration: 0.2,
      onUpdate: (value) => {
        setAnimatePercent(value);
      },
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [percentage]);
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

        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="0px"
          height="0px"
        >
          <defs>
            <linearGradient id="GradientColor" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#38B789" />
              <stop offset="100%" stopColor="#E0F882" />
            </linearGradient>
          </defs>
        </svg>

        {/* Progress bar wrapper */}
        <div className="relative z-10 ">
          <CircularProgressbar
            value={animatePercent}
            text={`${Math.round(animatePercent)}%`}
            styles={buildStyles({
              textSize: "28px",
              textColor: "#ffffff",
              pathColor: `url(#GradientColor)`,
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
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchSummaryByCategory());
  }, [dispatch, isSummaryUpdated, userData]);

  const rawSvg = `
  <svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="0" width="99" height="1" fill="#363669" />
    <rect x="1" y="1" width="1" height="1" fill="#363669" />
    <rect x="0" y="1" width="1" height="60" fill="#363669" />
    <rect x="1" y="20" width="1" height="1" fill="#363669" />
    <rect x="2" y="21" width="99" height="1" fill="#363669" />

    <rect x="101" y="1" width="1" height="1" fill="#363669" />
    <rect x="102" y="2" width="1" height="18" fill="#363669" />
    <rect x="101" y="20" width="1" height="1" fill="#363669" />
  </svg>
  `;

  const svgDataUrl = `data:image/svg+xml,${encodeURIComponent(rawSvg)}`;

  return (
    <div className=" md:hidden lg:grid  border-2 border-purpleNormal rounded-3xl  px-6 grid lg:h-[380px] md:h-auto ">
      {!Array.isArray(summary) ||
      summary.length === 0 ||
      !Array.isArray(summaryCategory) ||
      summaryCategory.length === 0 ? (
        <div className="grid justify-center  items-center">
          <p className="text-gray-400 text-center text-3xl p-8">
            You have no tasks summary
          </p>
        </div>
      ) : (
        <div className="flex flex-1 items-center">
          <div>
            {summary.map((item, index) => (
              <div key={index} className="flex gap-4 items-center">
                <div className="ml-4">
                  <GradientCircularProgressbar
                    percentage={item.completedRate || 0}
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
                  <div className="bg-purpleGradient bg-clip-text text-transparent ">
                    {item.completedRate === 100 ? (
                      <div className="font-bold">
                        <p>CONGRATS !</p>
                        <p>IT'S OVER 9000</p>
                      </div>
                    ) : (
                      <div>
                        <p>KEEP GOING YOU</p>
                        <p>CAN DO IT!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          <div className=" hidden min-[1400px]:flex flex-col gap-4 flex-1 justify-center ml-4">
            {summaryCategory.map((catItem, catIndex) => (
              <div
                key={catIndex}
                className=" px-4 py-2 cursor-pointer rounded-lg text-xl text-white bg-purpleNormal list-shadow "
              >
                <div className="flex justify-between mb-2">
                  <h3>{catItem.category || "No category"}</h3>
                  <h3>{Math.round(catItem.completedRate)}%</h3>
                </div>
                <ProgressBar value={catItem.completedRate} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Summary;
