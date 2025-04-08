import React from "react";
import { motion } from "framer-motion";

const AnimatedPencilLine = ({ delay = 0, color = "rgba(250,204,21,0.8)" }) => (
  <motion.div
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: "100%", opacity: 1 }}
    transition={{
      duration: 0.8,
      delay,
      type: "spring",
      damping: 12,
      stiffness: 100,
    }}
    style={{
      position: "relative",
      height: "4px",
      marginTop: "2px",
      marginBottom: "8px",
    }} // Adjust margins as needed or pass via props
  >
    <svg width="100%" height="4" viewBox="0 0 300 4" preserveAspectRatio="none">
      <motion.path
        d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
        fill="none"
        stroke={color} // Use prop for color
        strokeWidth="1"
        strokeDasharray="5,3"
        initial={{ pathLength: 0, strokeDashoffset: 1000 }}
        animate={{ pathLength: 1, strokeDashoffset: 0 }}
        transition={{ duration: 1, delay }}
      />
    </svg>
  </motion.div>
);

export default AnimatedPencilLine;
