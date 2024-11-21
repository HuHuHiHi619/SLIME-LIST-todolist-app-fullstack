import React from "react";
import { motion } from "framer-motion";
const StaggerContainer = ({ children , delay, index}) => (
  <motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.5,
    delay: index * 0.1,
    ease: "easeOut",
  }}
  >
    {children}
  </motion.div>
);

export default StaggerContainer;
