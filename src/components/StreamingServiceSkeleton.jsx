import React from "react";
import {
  Box,
  Container,
  Flex,
  HStack,
  SimpleGrid,
  VStack,
  Skeleton,
  SkeletonText, // Only using Chakra Skeleton primitives
} from "@chakra-ui/react";
import { motion } from "framer-motion"; // Added for Squiggly Animation

// ============================================================
// --- DETAILED SKELETON FOR SHOWS/MOVIES PAGE (Matching Shows.jsx structure) ---
// ============================================================

// --- Theming Constants ---
const baseBg = "#0C0C1B";
const skeletonStartColor = "rgba(40, 40, 50, 0.6)";
const skeletonEndColor = "rgba(255, 236, 68, 0.15)"; // Yellow Pulse
const accentColor = "#FFEC44";
const borderColor = "rgba(255, 255, 255, 0.1)";
const headingFont = "'Courier New', monospace";
const cardBg = "rgba(30, 30, 40, 0.9)"; // Use this as startColor for cards
const skeletonSpeed = 1.4;
const skeletonFadeDuration = 0.6;

// --- MotionBox for Squiggly --- (Optional, if you want to animate the squiggly itself)
const MotionBox = motion(Box);

// Helper for Squiggly Line Placeholder
const SkeletonSquiggly = ({w}) => (
  <Skeleton
    height="2px"
    width={'50px'}
    borderRadius="none"
    startColor={skeletonStartColor}
    endColor={skeletonEndColor}
    speed={skeletonSpeed}
    fadeDuration={skeletonFadeDuration}
    mt="2px"
  />
);

// Helper for Skeleton Card (Detailed, square)
// Used for Featured Carousel and Discover Grid
const SkeletonDetailCard = ({ cardHeight = "320px", imageH = "60%" }) => (
  <VStack
    spacing={3}
    p={3}
    bg={cardBg} // Card BG as base
    borderRadius="none"
    border="1px solid"
    borderColor={borderColor}
    height={cardHeight} // Use passed height
    align="stretch"
    width="100%"
    overflow="hidden"
  >
    {/* Image Placeholder */}
    <Skeleton
      h={imageH}
      /* Relative height */ w="full"
      borderRadius="none"
      startColor={skeletonStartColor}
      endColor={skeletonEndColor}
      speed={skeletonSpeed}
      fadeDuration={skeletonFadeDuration}
    />
    {/* Text Placeholders */}
    <SkeletonText
      noOfLines={1}
      spacing={2}
      skeletonHeight="18px"
      /* Heading */ startColor={skeletonStartColor}
      endColor={skeletonEndColor}
      speed={skeletonSpeed}
      fadeDuration={skeletonFadeDuration}
      sx={{ span: { borderRadius: "none" } }}
    />

    <SkeletonText
      noOfLines={2}
      spacing={2}
      skeletonHeight="12px"
      /* Overview */ startColor={skeletonStartColor}
      endColor={skeletonEndColor}
      speed={skeletonSpeed}
      fadeDuration={skeletonFadeDuration}
      sx={{ span: { borderRadius: "none" } }}
    />
    <Flex justify="flex-end" mt="auto">
      {" "}
      {/* Push button placeholder to bottom */}
      <Skeleton
        h="32px"
        w="90px"
        borderRadius="none"
        startColor={skeletonStartColor}
        endColor={skeletonEndColor}
        speed={skeletonSpeed}
        fadeDuration={skeletonFadeDuration}
      />
    </Flex>
  </VStack>
);

function StreamingServiceSkeleton() {
  // Define responsive column counts matching Shows.jsx
  const gridColumns = { base: 2, sm: 3, md: 4, lg: 5 }; // Adjusted Discover Grid cols

  return (
    <Box bg={baseBg} minHeight="100vh">
      {/* ================== HERO SKELETON ================== */}
      <Box
        position="relative"
        height={{ base: "70vh", md: "75vh" }}
        display="flex"
        alignItems="flex-end"
        pb={16}
      >
        <Box position="absolute" inset={0} bg={baseBg} />{" "}
        {/* Solid Dark Background */}
        <Container
          maxW="1400px"
          mx="auto"
          px={{ base: 4, md: 8, lg: 12 }}
          position="relative"
          pt="91px"
        >
          <Flex direction="column" width="100%">
            {/* Logo/Title Placeholder Block */}
            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={4}
              mb={[6, 8]}
              maxWidth={["90%", "70%", "55%", "700px"]}
            >
              {/* Removed badge placeholder as it's not in Shows.jsx */}
              {/* Logo/Title Placeholder */}
              <Skeleton
                h={["80px", "120px", "160px"]}
                w={["80%", "90%"]}
                borderRadius="none"
                startColor={skeletonStartColor}
                endColor={skeletonEndColor}
                speed={skeletonSpeed}
                fadeDuration={skeletonFadeDuration}
              />
            </VStack>

            {/* Info Block Placeholder */}
            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={4}
              maxWidth={["95%", "75%", "65%", "650px"]}
            >
              {/* Genre Placeholder (Matches Shows.jsx structure) */}
              <HStack
                spacing={2}
                mb={4}
                justify={{ base: "center", md: "flex-start" }}
              >
                <Skeleton
                  h="20px"
                  w="80px"
                  borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
                <Skeleton
                  h="20px"
                  w="100px"
                  borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
                {/* Add dot if needed */}
              </HStack>
              {/* Meta Info Placeholder (Date, Seasons, Rating - Matches Shows.jsx) */}
              <HStack
                spacing={5}
                mb={4}
                justify={{ base: "center", md: "flex-start" }}
              >
                <Skeleton
                  h="18px"
                  w="100px"
                  borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
                <Skeleton
                  h="18px"
                  w="120px"
                  borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
                <Skeleton
                  h="18px"
                  w="60px"
                  borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
              </HStack>
              {/* Overview SkeletonText */}
              <Box maxH="6rem" w="100%" mb={5} overflow="hidden">
                {" "}
                {/* Mimic max height */}
                <SkeletonText
                  noOfLines={3}
                  spacing="3"
                  skeletonHeight="4"
                  w="100%"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                  sx={{ span: { borderRadius: "none" } }}
                />
              </Box>
              {/* Buttons Placeholder */}
              <HStack
                gap={4}
                justify={{ base: "center", md: "flex-start" }}
                width="100%"
              >
                <Skeleton
                  h="40px"
                  w={["130px", "150px"]}
                  borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
                <Skeleton
                  h="40px"
                  w={["130px", "150px"]}
                  borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
              </HStack>
            </VStack>
          </Flex>
        </Container>
      </Box>
      {/* ============ SECTIONS BELOW HERO SKELETON (Matching Shows.jsx) ============ */}
      <Box position="relative" zIndex={1} bg={baseBg}>
        {" "}
        {/* Content Section Wrapper */}
        {/* --- Category Navigation Skeleton --- */}
        <Box py={6} borderY="1px solid" borderColor={borderColor}>
          {" "}
          {/* Use border color from theme */}
          <Container maxW="container.xl">
            <HStack
              spacing={[4, 6, 8]}
              justifyContent="center"
              overflowX="auto"
              py={2}
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {/* Render 7 category placeholders */}
              {[...Array(7)].map((_, i) => (
                <Skeleton
                  key={`cat-skel-${i}`}
                  h="24px"
                  w={`${80 + i * 5}px`}
                  /* Varying widths */ borderRadius="none"
                  startColor={skeletonStartColor}
                  endColor={skeletonEndColor}
                  speed={skeletonSpeed}
                  fadeDuration={skeletonFadeDuration}
                />
              ))}
            </HStack>
          </Container>
        </Box>
        {/* --- Featured Shows Carousel Skeleton --- */}
        <Box pt={10} pb={8}>
          <Container maxW="container.xl" mb={6} px={{ base: 4, md: 8, lg: 12 }}>
            {/* Heading Placeholder */}
            <Flex align="flex-end" display="inline-flex">
              <Skeleton
                h="32px"
                w="180px"
                borderRadius="none"
                startColor={skeletonStartColor}
                endColor={skeletonEndColor}
                speed={skeletonSpeed}
                fadeDuration={skeletonFadeDuration}
              />
              <SkeletonSquiggly w="70px" />
            </Flex>
          </Container>
          {/* Carousel */}
          <Box
            overflowX="hidden"
            /* No scrollbar needed */ pl={{ base: 4, md: 8, lg: 12 }}
            pr={4}
          >
            <HStack spacing={5} pb={4} align="stretch">
              {/* Repeat Featured Card Skeleton */}
              {[...Array(6)].map((_, i) => (
                <Box
                  key={`feat-show-skel-${i}`}
                  minW={["240px", "280px"]}
                  flexShrink={0}
                >
                  {/* Featured card has slightly different structure/height */}
                  <SkeletonDetailCard
                    cardHeight="300px"
                    imageH="55%"
                    hasButton={true}
                  />
                </Box>
              ))}
            </HStack>
          </Box>
        </Box>
        {/* --- Discover Shows Grid Skeleton --- */}
        <Box py={10}>
          <Container maxW="container.xl" px={{ base: 4, md: 8, lg: 12 }}>
            {/* Heading Placeholder */}
            <Flex align="flex-end" display="inline-flex" mb={8}>
              <Skeleton
                h="32px"
                w="200px"
                borderRadius="none"
                startColor={skeletonStartColor}
                endColor={skeletonEndColor}
                speed={skeletonSpeed}
                fadeDuration={skeletonFadeDuration}
              />
              <SkeletonSquiggly w="70px" />
            </Flex>
            <SimpleGrid columns={gridColumns} gap={4}>
              {/* Repeat Discover Card Skeleton */}
              {[...Array(10)].map(
                (
                  _,
                  i // Show 10 grid items
                ) => (
                  <SkeletonDetailCard
                    key={`disc-show-skel-${i}`}
                    cardHeight={{ base: "280px", sm: "300px", md: "320px" }}
                    imageH="60%"
                    hasButton={false}
                  />
                )
              )}
            </SimpleGrid>
            {/* Load More Button Placeholder */}
            <Flex justify="center" mt={12}>
              <Skeleton
                h="40px"
                w={["160px", "180px"]}
                borderRadius="none"
                startColor={skeletonStartColor}
                endColor={skeletonEndColor}
                speed={skeletonSpeed}
                fadeDuration={skeletonFadeDuration}
              />
            </Flex>
          </Container>
        </Box>
      </Box>{" "}
      {/* End Content Area */}
    </Box> // End Main Box
  );
}

export default StreamingServiceSkeleton;
