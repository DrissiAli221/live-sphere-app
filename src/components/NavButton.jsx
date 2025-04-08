import React, { useState } from "react";
import { motion } from "framer-motion";
import { Box, Text } from "@chakra-ui/react";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

// Motion-enabled Box component
const MotionBox = motion(Box);

const NavButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size variants
  const sizeStyles = {
    sm: {
      px: 3,
      py: 1,
      fontSize: "sm",
      height: "32px",
    },
    md: {
      px: 4,
      py: 2,
      fontSize: "md",
      height: "40px",
    },
    lg: {
      px: 6,
      py: 2.5,
      fontSize: "lg",
      height: "50px",
    },
  };

  // Variant styles
  const variants = {
    primary: {
      bg: "rgba(255, 255, 255, 0.8)",
      border: "2px solid black",
      color: "black",
      _hover: {
        bg: "rgba(255, 255, 255, 0.9)",
        transform: "translateY(-2px)",
        boxShadow: "lg",
      },
    },
    secondary: {
      bg: "black",
      border: "2px solid black",
      color: "white",
      _hover: {
        bg: "gray.800",
        transform: "translateY(-2px)",
        boxShadow: "lg",
      },
    },
    outline: {
      bg: "transparent",
      border: "2px solid black",
      color: "black",
      _hover: {
        bg: "rgba(0, 0, 0, 0.05)",
        transform: "translateY(-2px)",
        boxShadow: "md",
      },
    },
    ghost: {
      bg: "transparent",
      border: "2px solid transparent",
      color: "black",
      _hover: {
        bg: "rgba(0, 0, 0, 0.05)",
        transform: "translateY(-2px)",
      },
    },
  };

  // Loading state animation
  const loadingAnimation = {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <MotionBox
      as="button"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      borderRadius="full"
      overflow="hidden"
      whileTap={{ scale: 0.97 }}
      animate={isLoading ? loadingAnimation : {}}
      transition={{ duration: 0.2 }}
      onClick={!disabled && !isLoading ? onClick : undefined}
      cursor={disabled || isLoading ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.6 : 1}
      boxShadow="md"
      {...sizeStyles[size]}
      {...variants[variant]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ willChange: "transform, opacity" }}
      {...props}
    >
      {/* Flickering grid background similar to navbar */}
      {(variant === "primary" || variant === "outline") && (
        <Box
          position="absolute"
          inset="0"
          zIndex={1}
          opacity={0.5}
          overflow="hidden"
          borderRadius="full"
        >
          <FlickeringGrid
            squareSize={3}
            gridGap={4}
            flickerChance={0.2}
            color="#3b82f6"
            maxOpacity={isHovered ? 0.4 : 0.3}
            className="w-full h-full"
          />
        </Box>
      )}

      {/* Button content */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        position="relative"
        zIndex={2}
      >
        {leftIcon && <Box>{leftIcon}</Box>}
        <Text fontWeight="medium">{isLoading ? "Loading..." : children}</Text>
        {rightIcon && <Box>{rightIcon}</Box>}
      </Box>
    </MotionBox>
  );
};

export default NavButton;
