import React, { forwardRef, useState } from "react";
import { Box, Input as ChakraInput } from "@chakra-ui/react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

const Input = forwardRef(({ radius = 100, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const MotionBox = motion(Box);

  return (
    <MotionBox
      position="relative"
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${
              visible ? radius + "px" : "0px"
            } circle at ${mouseX}px ${mouseY}px,
            var(--chakra-colors-blue-500),
            transparent 80%
          )
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      borderRadius="lg"
      p="2px"
      transition="all 0.3s"
    >
      <ChakraInput
        ref={ref}
        boxShadow="md"
        border="none"
        bg="gray.50"
        h="36px"
        p="5px 12px"
        _dark={{
          bg: "gray.800",
          color: "white",
          boxShadow: "0 0 1px 1px var(--chakra-colors-gray-700)",
        }}
        _focus={{
          ring: "2px",
          ringColor: "gray.400",
          outline: "none",
        }}
        _disabled={{
          cursor: "not-allowed",
          opacity: 0.5,
        }}
        {...props}
      />
    </MotionBox>
  );
});

Input.displayName = "Input";

export { Input };
