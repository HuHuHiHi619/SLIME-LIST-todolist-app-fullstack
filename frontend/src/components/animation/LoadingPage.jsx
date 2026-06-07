import React from "react";
import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-darkBackground bg-opacity-80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
      
      </div>
    </motion.div>
  );
}
