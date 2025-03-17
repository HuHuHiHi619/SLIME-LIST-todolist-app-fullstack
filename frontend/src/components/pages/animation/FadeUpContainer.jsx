import React from 'react'
import { motion } from 'framer-motion'

const FadeUpContainer = ({ children, delay = 0, direction = "up" ,  }) => {
  const directions = {
    up: { opacity: 0, y: 20 },
    down: { opacity: 0, y: -20 },
    left: { opacity: 0, x: 20 },
    right: { opacity: 0, x: -20 },
  };

  const animateDirection = directions[direction] || directions.up;

  return (
    <motion.div
      initial={animateDirection}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      exit={animateDirection}
    >
      {children}
    </motion.div>
  );
}

export default FadeUpContainer;
