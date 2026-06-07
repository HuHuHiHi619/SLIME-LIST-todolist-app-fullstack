import React from "react";
import { motion } from "framer-motion";

const CreateButton = ({ children, onClick }) => {
  // Animation variants
  const buttonVariants = {
    initial: {
      scale: 1,
      boxShadow: "0 0 0 0 rgba(147, 51, 234, 0)",
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 0 20px 0 rgba(147, 51, 234, 0.5)",
    },
    tap: {
      scale: 0.95,
    },
  };

  const ringVariants = {
    initial: {
      opacity: 0,
      scale: 1,
    },
    animate: {
      opacity: [0, 0.5, 0],
      scale: [1, 1.5, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const secondRingVariants = {
    initial: {
      opacity: 0,
      scale: 1,
    },
    animate: {
      opacity: [0, 0.5, 0],
      scale: [1, 1.3, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: {
      rotate: 180,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative">
      {/* Animated ring effect */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-purple-400"
        variants={ringVariants}
        initial="initial"
        animate="animate"
      />
      {/* Animated 2ND ring effect */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-purple-400"
        variants={secondRingVariants}
        initial="initial"
        animate="animate"
      />

      {/* Main button */}
      <motion.button
        className="
          relative 
          px-2
          py-2 
          bg-purpleNormal
          text-white 
          font-semibold 
          rounded-xl
          overflow-hidden
          ring-1
          ring-purple-500
          ring-offset-2
          ring-offset-slate-900
          border-2
          border-purple-500
        "
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        onClick={onClick}
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-fuchsia-500 to-indigo-500 opacity-0"
          animate={{
            opacity: [0, 1, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Button content */}
        <motion.div className="relative z-10 flex items-center ">
          <motion.div variants={iconVariants}>
            <svg
              className="w-4 h-4 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.div>

          {children}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default CreateButton;
