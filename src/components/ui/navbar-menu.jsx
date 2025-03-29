import React from "react";
import { motion } from "framer-motion";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Box, Flex, Image, Text, Link } from "@chakra-ui/react";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

// Chakra-compatible motion components
const MotionBox = motion(Box);
const MotionText = motion(Text);

export const MenuItem = ({ setActive, active, item, children }) => {
  return (
    <Box position="relative" onMouseEnter={() => setActive(item)}>
      <MotionText
        transition={{ duration: 0.3 }}
        cursor="pointer"
        color="black"
        _hover={{ opacity: 0.9 }}
      >
        {item}
      </MotionText>
      {active !== null && (
        <MotionBox
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <Box
              position="absolute"
              top="calc(100% + 1.2rem)"
              left="50%"
              transform="translateX(-50%)"
              paddingTop={4}
            >
              <MotionBox
                transition={transition}
                layoutId="active"
                bg="white"
                backdropFilter="blur(8px)"
                borderRadius="2xl"
                overflow="hidden"
                border="1px"
                borderColor="gray.200"
                boxShadow="xl"
              >
                <MotionBox layout width="max-content" height="full" padding={4}>
                  {children}
                </MotionBox>
              </MotionBox>
            </Box>
          )}
        </MotionBox>
      )}
    </Box>
  );
};

export const Menu = ({ setActive, children }) => {
  return (
    <Flex
      as="nav"
      onMouseLeave={() => setActive(null)}
      borderRadius="full"
      border="1px"
      borderColor="gray.200"
      bg="white"
      boxShadow="md"
      justify="center"
      align="center"
      spacing={4}
      px={8}
      py={6}
    >
      {children}
    </Flex>
  );
};

export const ProductItem = ({ title, description, href, src }) => {
  return (
    <ChakraLink href={href} display="flex" alignItems="center" gap={2}>
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        borderRadius="md"
        boxShadow="2xl"
        objectFit="cover"
      />
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={1} color="black">
          {title}
        </Text>
        <Text color="gray.700" fontSize="sm" maxWidth="10rem">
          {description}
        </Text>
      </Box>
    </ChakraLink>
  );
};

export const HoveredLink = ({ children, ...rest }) => {
  return (
    <ChakraLink {...rest} color="gray.700" _hover={{ color: "black" }}>
      {children}
    </ChakraLink>
  );
};

export default { MenuItem, Menu, ProductItem, HoveredLink };
