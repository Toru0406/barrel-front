"use client";
import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-[#E8D5B0] text-2xl opacity-50"
      >
        ↓
      </motion.div>
    </div>
  );
}
