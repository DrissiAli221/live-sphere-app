import React, { forwardRef, useState, memo } from "react";
import { Box, Input as ChakraInput } from "@chakra-ui/react";
import { motion } from "framer-motion"; // Keep for shadow animation

// Reusable MotionBox
const MotionBox = motion(Box);

// Define shadow variants for consistency
const shadowVariants = {
  rest: { opacity: 0.6, x: 2, y: 2, transition: { duration: 0.2 } },
  hover: { opacity: 0.9, x: 4, y: 4, transition: { duration: 0.2 } },
  focus: { opacity: 1, x: 4, y: 4, transition: { duration: 0.2 } }, // Maybe same as hover or slightly stronger
};

// Memoized Input Component - Refactored & Themed
const InputComponent = forwardRef((props, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Theming Constants
  const accentColor = "#FFEC44";
  const inputBg = "rgba(25, 25, 35, 0.9)"; // Dark BG, slightly transparent
  const borderColor = "rgba(255, 255, 255, 0.1)"; // Subtle light border
  const hoverBorderColor = "rgba(255, 255, 255, 0.3)";
  const focusBorderColor = accentColor; // Yellow focus border
  const textColor = "gray.100";
  const placeholderColor = "gray.500";
  const headingFont = "'Courier New', monospace"; // Thematic font

  // Simpler state management for animations
  const animateState = isFocused ? "focus" : isHovered ? "hover" : "rest";

  return (
    <MotionBox
      position="relative"
      width="100%"
      // Animate state for shadow control
      initial="rest"
      animate={animateState}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* --- Sketch Shadow (conditionally rendered or animated) --- */}
      <MotionBox
        variants={shadowVariants}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.9)", // Shadow color
          zIndex: 0, // Behind input
          border: "1px solid rgba(0,0,0,0.5)",
          borderRadius: "none", // Square shadow
        }}
        transition={{ duration: 0.2 }}
      />

      {/* --- Chakra Input (Styled for Theme) --- */}
      <ChakraInput
        ref={ref}
        position="relative" // Needed to be above the absolute shadow
        zIndex={1} // Ensure input is above shadow
        width="100%"
        // Theming Styles
        bg={inputBg}
        color={textColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="none" // Square input
        fontFamily={headingFont}
        fontSize="sm"
        h="auto" // Auto height based on padding
        minH={10} // Minimum height (chakra size 10)
        py={2} // Vertical padding
        px={3} // Horizontal padding
        transition="border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out" // Smooth transitions
        _hover={{
          borderColor: hoverBorderColor,
        }}
        // _focus is applied but often overridden by browser default - use _focusVisible
        _focus={{
          // Basic focus style reset
          zIndex: 2, // Ensure focused input is topmost
          // boxShadow: 'none' // Remove potential default Chakra focus shadow if desired
        }}
        _focusVisible={{
          // Thematic focus style for keyboard/programmatic focus
          borderColor: focusBorderColor,
          boxShadow: `0 0 0 2px ${accentColor}60`, // Yellow glow, adjust alpha as needed
          outline: "none", // Remove default browser outline
        }}
        _placeholder={{
          color: placeholderColor,
          fontFamily: headingFont, // Ensure placeholder matches font
        }}
        _disabled={{
          cursor: "not-allowed",
          opacity: 0.5,
          filter: "grayscale(80%)", // Consistent disabled style
        }}
        // Pass down all other props like value, onChange, etc.
        // No need to wrap simple handlers unless doing complex logic
        {...props}
        // Directly use onFocus/onBlur from props or handle simple state change
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e); // Call original handler if provided
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e); // Call original handler if provided
        }}
        // onChange prop is passed directly via {...props}
      />
    </MotionBox>
  );
});

InputComponent.displayName = "InputComponent";

// Export the memoized component
export const Input = memo(InputComponent);
Input.displayName = "Input";
