import React from 'react';
import { motion } from 'framer-motion';

const FlameBox = ({  index , streak }) => {
  const flameVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '0% 100%'],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const boxStreak = (index,streak) => {
    if (index >= streak) return "bg-darkBackground";
    if (streak <= 5) return "bg-streak border-2 border-orange-400";
    if (streak <= 10) {
      // streak 6-10
      return index < streak - 5 ? "bg-hotterStreak border-2 border-sky-500" : "bg-streak border-2 border-orange-500";
    }
    return index < streak - 10 ? "bg-hottestStreak border-2 border-purple-500" : "bg-hotterStreak border-2 border-sky-500";
  };

  // Particles for spark effect
  const Particle = ({ delay = 0 }) => (
    <motion.div
      className="absolute w-1 h-1 bg-yellow-200 rounded-full"
      initial={{ opacity: 0, y: 80, x: Math.random() * 90 - 20 }}
      animate={{
        opacity: [0, 0.5, 0],
        y: -20,
        x: Math.random() * 60 - 30
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: delay,
        ease: "easeOut"
      }}
    />
  );

  return (
    <div className="relative">
      {/* Base flame box */}
      <motion.div
        className={`relative w-12 h-20 rounded-lg overflow-hidden ${boxStreak(index, streak)}`}
        variants={flameVariants}
        animate="animate"
        style={{
          backgroundSize: "100% 200%",
        }}
      >
        {/* Glowing overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-transparent to-purple-300/30"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Spark particles */}
        {streak !== 0 && [...Array(5)].map((_, i) => (
          <Particle key={i} delay={i * 0.3} />
        ))}
      </motion.div>

      {/* Base glow effect */}
      <div className="absolute inset-0 rounded-lg animate-pulse bg-orange-500/20 filter blur-xl -z-10" />
    </div>
  );
};

export default FlameBox;
