import React from "react";
import { motion } from "framer-motion";

const HandDrawnCircle = ({
  size = 40,
  top,
  left,
  right,
  bottom,
  delay = 0,
  color = "rgba(250,204,21,0.7)",
}) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 0.6 }} // Adjust final opacity if needed
    transition={{
      duration: 0.5,
      delay,
      type: "spring",
      stiffness: 200,
    }}
    style={{
      position: "absolute", // Ensure parent has relative positioning
      width: `${size}px`,
      height: `${size}px`,
      top,
      left,
      right,
      bottom,
      zIndex: 1, // Adjust zIndex as needed
    }}
  >
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <motion.path
        // Slightly adjusted path for better closure if needed
        d="M20,2 C29.3,2 38,10.7 38,20 C38,29.3 29.3,38 20,38 C10.7,38 2,29.3 2,20 C2,10.7 10.7,2 20,2 Z"
        stroke={color} // Use prop color
        strokeWidth="1"
        strokeDasharray="4,2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: delay + 0.2 }}
      />
    </svg>
  </motion.div>
);

export default HandDrawnCircle;