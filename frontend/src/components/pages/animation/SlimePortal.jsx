import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Slime Component

export const BouncingSlime = ({ size = 200, duration = 2 , isLooping = false , repeatCount = 0}) => {

 const animationRepeat = isLooping ? Infinity : repeatCount;
 const animationRepeatType = "loop"; // หรือ "reverse"

  return (
      <AnimatePresence>
          <motion.div
              initial={{ x: -50, scale: 0.2, opacity: 0, y: -300 }} // เริ่มต้นที่ y สูงหน่อย
              animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0
              }}
              transition={{
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.5 },
                  repeat: animationRepeat, // ใชัค่าที่คำนวณจาก props
                  repeatType: animationRepeatType, // ใช้ "loop"
                  y: {
                      type: "spring",
                      bounce: 0.8, // Bounce 0-1, 1 คือเด้งตลอด
                      duration : duration
                  },
              }}
              style={{
                 // ... styles เหมือนเดิม
                 width: size,
                 height: size,
                 backgroundImage: `url(./images/Logo-slime.png)`,
                 backgroundSize: "cover",
                 backgroundRepeat: "no-repeat",
                 backgroundPosition: "center",
                 zIndex: 10,
                 position: "absolute",
              }}
          />
      </AnimatePresence>
  );
};

// zigzagtext
const Zigzagtext = ({ text = "SLIMELIST", delay = 0.5 }) => {
  return (
    <div className="flex ml-32">
      {text.split("").map((char, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.div
            key={`${char}-${index}`} 
            className="text-[50px] sm:text-[100px] tracking-wider font-bold bg-gradient-to-b from-fuchsia-600 to-purpleBorder bg-clip-text text-transparent"
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
        <BouncingSlime size={slimeSize} isLooping={false}  />
        <Zigzagtext />
      </motion.div>
    </AnimatePresence>
  );
};

export default SlimePortal;


