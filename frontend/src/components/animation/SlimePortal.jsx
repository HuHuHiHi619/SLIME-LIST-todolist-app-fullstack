import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Slime Component

export const BouncingSlime = ({
  size = 200,
  duration = 2,
  isLooping = false,
  repeatCount = 0,
  className = "",
}) => {
  const animationRepeat = isLooping ? Infinity : repeatCount;
  const animationRepeatType = "loop";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -50, scale: 0.2, opacity: 0, y: -300 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}
        transition={{
          opacity: { duration: 0.2 },
          scale: { duration: 0.5 },
          repeat: animationRepeat,
          repeatType: animationRepeatType,
          y: {
            type: "spring",
            bounce: 0.8,
            duration: duration,
          },
        }}
        className={`absolute z-10 bg-center bg-no-repeat bg-cover ${className}`}
        style={{
          backgroundImage: `url(./images/Logo-slime.png)`,
        }}
      />
    </AnimatePresence>
  );
};

export const BouncingSlimeLoading = ({ className = "" }) => {
  return (
    <motion.div
      animate={{
        y: [0, -100, 0],
        scaleY: [1, 1.1, 0.9, 1], 
        scaleX: [1, 0.9, 1.1, 1], 
        rotate: [0, 20, 0, 0]
      }}
      transition={{
        duration: 0.7, 
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeOut",
      }}
      className={`bg-center bg-no-repeat bg-cover ${className}`}
      style={{
        backgroundImage: `url(./images/Logo-slime.png)`,
      }}
    />
  );
};


// zigzagtext
const Zigzagtext = ({ text = "SLIMELIST", delay = 0.5 }) => {
  return (
    <div className="flex items-center ml-10 sm:ml-32">
      {text.split("").map((char, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.div
            key={`${char}-${index}`} 
            className=" text-[70px] sm:text-[90px] md:text-[120px] tracking-wider font-bold bg-gradient-to-b from-fuchsia-600 to-purpleBorder bg-clip-text text-transparent"
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
const SlimePortal = () => {
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
        <BouncingSlime isLooping={false}   className="w-0 h-0 sm:w-32 sm:h-32 md:w-36 md:h-36" />
        <Zigzagtext />
      </motion.div>
    </AnimatePresence>
  );
};

export default SlimePortal;


