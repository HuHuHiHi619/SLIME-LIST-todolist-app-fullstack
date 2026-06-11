import { motion } from "framer-motion";
import { BouncingSlimeLoading } from "./SlimePortal";
import AutoTyping from "./AutoTyping";

export default function LoadingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-darkBackground bg-opacity-80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <BouncingSlimeLoading className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40" />
        <AutoTyping text="LOADING..." speed={100} pause={1000} />
      </div>
    </motion.div>
  );
}
