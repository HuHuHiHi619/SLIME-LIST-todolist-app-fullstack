import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Slime Component
const BouncingSlime = ({ size = 200, duration = 2 }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -50, scale: 0.2, opacity: 0 }} // เริ่มต้นที่ left: 10%
        animate={{
          opacity: 1,
          scale: 1,
          y: [-300, 0, -180, 0, -100, 0, -20, 0],
          scaleY: [1, 0.8, 1.2, 0.8, 1.2, 0.8, 1, 1, ],
          scaleX: [1, 1.2, 0.8, 1.2, 0.8, 1.2, 1, 1, ],
        }}
        transition={{
          opacity: { duration: 0.2 },
          scale: { duration: 0.5 },

          y: {
            duration: duration,
            type: "keyframes",
            ease: "easeInOut",
            delay: 0,
            repeat: false,
          },
          scaleX: {
            duration: duration,
            times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1],
            repeat: Infinity,
            type: "keyframes",
          },
          scaleY: {
            duration: duration,
            times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1],
            repeat: Infinity,
            type: "keyframes",
          },
        }}
        style={{
          width: size,
          height: size,
          backgroundImage: `url(./images/Logo-slime.png)`,
          backgroundSize: "cover",
          zIndex: 10,
        }}
      />
    </AnimatePresence>
  );
};

// zigzagtext
const Zigzagtext = ({ text = "SLIMELIST", delay = 0.5 }) => {
  return (
    <div className="flex ">
      {text.split("").map((char, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.div
            key={`${char}-${index}`}
            className=" text-[100px] bg-gradient-to-b from-white to-purpleBorder bg-clip-text text-transparent"
            initial={{
              y: isEven ? -200 : 200,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              duration: 0.2,
              repeatType: "reverse",
              delay: delay + index * 0.1,
            }}
          >
            {char}
          </motion.div>
        );
      })}
    </div>
  );
};

// Container component to show animation sequence
const SlimePortal = ({ slimeSize = 120 }) => {
  return (
    <AnimatePresence>
      <motion.div
         animate={{ x: 10000 }} // ขยับออกไปทางซ้าย
         transition={{
           delay: 2.1, // รอ 2 วินาทีก่อนเริ่ม animate
           duration: 2, // ระยะเวลาการเคลื่อนที่ (สามารถปรับได้)
           ease: "easeInOut",
         }}
         className="flex"
      >
        <BouncingSlime size={slimeSize} />
        <Zigzagtext />
      </motion.div>
    </AnimatePresence>
  );
};

export default SlimePortal;


