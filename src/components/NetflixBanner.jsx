import React, { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

// --- Chakra UI Primitive Imports ---
import {
  Box,
  Flex,
  Container,
  Image,
  Text,
  VStack,
  Heading,
  Icon,
  HStack,
} from "@chakra-ui/react";

// --- Framer Motion Imports ---
import { motion } from "framer-motion";

// --- Service/Util/Component Imports ---
import { baseImageOriginal, baseImageW500 } from "@/services/api"; // Assuming correct path
import { watchProviders } from "@/utils/watchProviders"; // Assuming correct path

// ========================================================================
// === THEME CONSTANTS (Defined Within This File) ===
// ========================================================================
const THEME = {
  colors: {
    black: "#0a0a0a",
    darkBg: "#08080A",
    offBlack: "#121214",
    cardBg: "#18181A", // Slightly lighter than offBlack for depth
    accent: "#FFEC44", // Keep the vibrant yellow
    border: "rgba(255, 255, 255, 0.15)", // Dim border inside card
    borderMedium: "rgba(255, 255, 255, 0.3)", // Slightly brighter for main section borders
    borderAccent: "#FFEC44",
    shadow: "#000000",
    text: "whiteAlpha.900",
    subtleText: "whiteAlpha.600", // Slightly dimmer subtle text
    gradientStart: "rgba(18, 18, 20, 0.95)",
    gradientEnd: "rgba(18, 18, 20, 0.0)",
    tape: "#FFEC44", // Use accent for tape base
    tapeShadow: "rgba(0, 0, 0, 0.3)", // Shadow for tape
  },
  fonts: {
    // Keep Courier New for the retro/typewriter sketch feel
    heading: "'Courier New', monospace",
    body: "'Courier New', monospace",
  },
  styles: {
    heading: {
      fontFamily: "'Courier New', monospace",
      textTransform: "uppercase",
      letterSpacing: "wider",
    },
    body: { fontFamily: "'Courier New', monospace", letterSpacing: "normal" },
  },
  effects: {
    // Keep existing noise/scanlines, they add texture
    noiseBg:
      "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVדהזה/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+///+/v7+/v7+/v7+/v7+/v7+/s8wT4AAAAF3RSTlPF48P117/Aw869zKrQuLOqphh5i59qcOMVsAAAAJZJREFUOI1jZobgMAIALAwMAyMWBgYW0AYsDLSAAVDCx/8D5cAxkvtR40lAFBl6vA5I7gBxQ7FBAmTk4b+DBwARHyG1DQEIGbQAAYQAHj6HjwxEHpXjF8AMDEQgUMDDhx4A9UikwMhoAAAUY4KHAACAEs6HF4HgQpAQAyNggkAJzAGYWFkAMjIKAEQz0mkwAACMQAAA1AUQAASYAFhI07u0aF4UAAAAAElFTkSuQmCC)",
    noiseOpacity: 0.08, // Slightly increase noise opacity
    scanlineBgGradient: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%), linear-gradient(90deg, ${"#FFEC44"}0D, ${"#0A0A0A"}0A, ${"#FFEC44"}0D)`, // Subtle accent in scanlines
    scanlineBgSize: "100% 5px, 8px 100%", // Slightly thicker scanlines
    scanlineOpacity: 0.15, // Slightly reduce scanline opacity
    scanlineBlendMode: "overlay", // Try overlay for scanlines
  },
};
const POSTER_ASPECT_RATIO = 2 / 3;
const SHADOW_OFFSET_X = 7; // Slightly more offset shadow
const SHADOW_OFFSET_Y = 7;
const roughEdgesFilterId = "rough-edges-filter-unique"; // More unique ID
// Adjusted turbulence for slightly more edge noise, increased scale
const roughEdgesMaskCss = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="${roughEdgesFilterId}"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="${Math.floor(
  Math.random() * 100
)}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="B"/></filter><rect width="100%" height="100%" filter="url(%23${roughEdgesFilterId})" /></svg>#${roughEdgesFilterId}')`;

// ========================================================================
// === MOTION COMPONENT ALIASES ===
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionImage = motion(Image);
const MotionHeading = motion(Heading);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionDiv = motion.div;

// ========================================================================
// === HELPER & THEMED COMPONENTS (Defined In-File) ===
// ========================================================================

// --- Tape Piece ---
const TapePiece = React.memo(
  ({ top, left, bottom, right, rotate, width = "28%", height = "7%" }) => (
    <MotionBox
      position="absolute"
      top={top}
      left={left}
      bottom={bottom}
      right={right}
      w={width}
      h={height}
      bg={THEME.colors.tape}
      opacity={0.65 + Math.random() * 0.1} // Slightly variable opacity
      transform={`rotate(${rotate}deg)`}
      zIndex={3} // Above the main poster box content
      // Add subtle texture and shadow
      filter="url(#tapeNoiseFilter)" // Apply noise texture
      boxShadow={`1px 1px 3px ${THEME.colors.tapeShadow}`}
      borderRadius="1px" // Very slight rounding to avoid hard SVG edges
      initial={{
        opacity: 0,
        scale: 0.5,
        rotate: rotate + (Math.random() > 0.5 ? 20 : -20),
      }}
      animate={{
        opacity: 0.65 + Math.random() * 0.1,
        scale: 1,
        rotate: rotate,
      }}
      transition={{
        delay: 0.5 + Math.random() * 0.2,
        duration: 0.4,
        ease: "easeOut",
      }}
      aria-hidden="true"
    />
  )
);

// --- Squiggly Line (More Irregular) ---
const SquigglyLine = React.memo(
  ({
    color = THEME.colors.accent,
    delay = 0,
    thickness = 2, // Thicker line
    dasharray = "4,3", // Changed dash pattern
    duration = 0.7,
  }) => (
    <MotionDiv
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration, delay, ease: "easeInOut" }}
      style={{ position: "relative", lineHeight: "0" }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="6" // Slightly taller for more wobble
        viewBox="0 0 300 6"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* More random-looking path */}
        <motion.path
          d="M0,3 Q15,5 30,2.5 T60,4 T90,2 T120,3.5 T150,2.5 T180,4 T210,3 T240,5 T270,2 T300,3"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={dasharray}
          strokeLinecap="round" // Rounder ends
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: duration * 1.5, // Slightly longer animation for path draw
            delay: delay + 0.1,
            ease: "linear",
          }}
        />
      </svg>
    </MotionDiv>
  )
);

// --- Sketchy Poster Component (Enhanced) ---
const SketchyPoster = React.memo(({ show, index }) => {
  const imagePath = show.poster_path || show.backdrop_path;
  const imageBase = show.poster_path ? baseImageW500 : baseImageOriginal;

  // Increased rotation range and added slight random X offset
  const transformProps = useMemo(
    () => ({
      // More dramatic initial rotations, larger random range
      rotate:
        (index === 0 ? -3.5 : index === 1 ? 4.0 : -2.5) +
        (Math.random() * 4 - 2),
      translateY: index === 1 ? "-12px" : index === 0 ? "3px" : "-2px", // Slight Y variations
      translateX: `${Math.random() * 6 - 3}px`, // Small random X offset
    }),
    [index]
  );
  const delay = useMemo(() => 0.35 + index * 0.12, [index]); // Adjust stagger timing

  const posterEntryVariant = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.85, // Start smaller
      // Start with more exaggerated rotation before settling
      rotate:
        transformProps.rotate + (index === 1 ? 15 : index === 0 ? -20 : 10),
      x: transformProps.translateX, // Include x in animation
    },
    visible: {
      opacity: 1,
      y: transformProps.translateY, // Use translateY from memo
      scale: 1,
      rotate: transformProps.rotate,
      x: transformProps.translateX, // Use translateX from memo
      transition: { duration: 0.7, delay: delay, ease: [0.15, 0.85, 0.4, 1] }, // Custom ease for bounce/overshoot
    },
  };

  return (
    <MotionBox
      position="relative"
      w="100%"
      aspectRatio={POSTER_ASPECT_RATIO}
      variants={posterEntryVariant}
      // transform applied by variants now
      //   as={RouterLink}
      to={`/${show.media_type}/${show.id}`}
      aria-label={`View details for ${show.name || show.title || "show"}`}
      title={`${show.name || show.title || "Show"}`}
      // Keep the subtle filter drop shadow for depth behind the main shadow
      filter={`drop-shadow(2px 2px 2px ${THEME.colors.black}66)`}
    >
      {/* 1. Thick Static Shadow */}
      <Box
        position="absolute"
        inset="-1px" // Slightly expand shadow beyond content box
        bg={THEME.colors.shadow}
        zIndex={0}
        borderRadius="none"
        transform={`translate(${SHADOW_OFFSET_X}px, ${SHADOW_OFFSET_Y}px)`}
      />

      {/* 2. Main Content Box */}
      <MotionBox
        position="relative"
        w="100%"
        h="100%"
        bg={THEME.colors.cardBg}
        borderRadius="none"
        overflow="hidden" // Clip the image inside
        zIndex={1}
        // Vignette Effect (instead of border)
        _before={{
          content: '""',
          position: "absolute",
          inset: "0px", // Cover the whole area
          // Inner shadow creates a vignette darkness at the edges
          boxShadow: `inset 0 0 15px 5px ${THEME.colors.black}99`,
          zIndex: 2, // Above image, below tape
          pointerEvents: "none",
          borderRadius: "none", // Match parent shape
        }}
      >
        {/* Image */}
        <Image
          src={`${imageBase}${imagePath}`}
          alt={``} // Alt text handled by link wrapper
          w="100%"
          h="100%"
          objectFit="cover"
          loading="lazy"
          // Slightly more contrast/desaturation for sketch effect
          filter="contrast(1.1) saturate(0.9) brightness(0.98)"
        />
      </MotionBox>

      {/* --- Adjusted Tape Placement --- */}
      {/* Tape Piece 1 (Top Left) */}
      <TapePiece
        top="-3%"
        left="-8%"
        rotate={-50 + (Math.random() * 10 - 5)}
        width="26%"
        height="8%"
      />
      {/* Tape Piece 2 (Bottom Right) */}
      <TapePiece
        bottom="-2%"
        right="-6%"
        rotate={-40 + (Math.random() * 10 - 5)}
        width="30%"
        height="7%"
      />
    </MotionBox>
  );
});

// ========================================================================
// === NetflixBanner Component (Main Logic - With Enhanced BG/Style) ===
// ========================================================================
const NetflixBanner = ({
  popularNetflixShows = [],
  baseImageOriginal, // Passed prop but not used directly here? Keep if needed elsewhere.
  watchProviders = [], // Passed prop
}) => {
  const netflixProvider = useMemo(
    () =>
      watchProviders.find((p) => p.name?.toLowerCase().includes("netflix")) ||
      watchProviders[0], // Fallback to first provider if needed
    [watchProviders]
  );

  // Animation Variants (keep existing structure)
  const sectionVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, delay: 0.1 } },
  };
  const contentStaggerVariant = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.25 } }, // Slightly slower content stagger
  };
  const postersContainerVariant = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }, // Keep poster stagger timing
  };

  return (
    <>
      <MotionBox
        w="100vw"
        position="relative"
        left="50%"
        transform="translateX(-50%)"
        // Changed from solid bg to gradient with more pronounced fade effect
        bg="transparent"
        backgroundImage={`linear-gradient(to bottom, 
          transparent, 
          ${THEME.colors.darkBg}30 10%, 
          ${THEME.colors.darkBg}80 30%, 
          ${THEME.colors.darkBg} 40%, 
          ${THEME.colors.darkBg} 60%, 
          ${THEME.colors.darkBg}80 70%, 
          ${THEME.colors.darkBg}30 90%, 
          transparent)`}
        py={{ base: 12, md: 16 }}
        mt={{ base: 12, md: 20 }}
        mb={12}
        overflow="hidden"
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Background filter effects removed for cleaner fade transition */}

        {/* Centered Content */}
        <Container maxW="1400px" position="relative" zIndex={2}>
          <MotionFlex
            variants={contentStaggerVariant}
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={{ base: 10, lg: 12 }}
          >
            {/* Left Side: Posters */}
            {popularNetflixShows?.length >= 3 && (
              <MotionHStack
                variants={postersContainerVariant}
                w={{ base: "95%", sm: "85%", md: "75%", lg: "65%" }}
                spacing={{ base: 4, sm: 5, md: 6 }}
                justify="center"
                align="center"
                minH={{ base: "260px", sm: "320px", md: "380px", lg: "440px" }}
                px={2}
              >
                {popularNetflixShows.slice(0, 3).map((show, index) => (
                  <Box
                    key={show.id || index}
                    w={{
                      base: "30%",
                      sm: "31%",
                    }}
                    h="100%"
                  >
                    <SketchyPoster show={show} index={index} />
                  </Box>
                ))}
              </MotionHStack>
            )}

            {/* Right Side: Logo and Text */}
            <MotionVStack
              variants={{
                hidden: { opacity: 0, x: 30 },
                visible: { opacity: 1, x: 0, transition: { delay: 0.3 } },
              }}
              w={{ base: "85%", sm: "75%", lg: "32%" }}
              align="center"
              spacing={5}
              pt={{ base: 8, lg: 0 }}
            >
              {/* Provider Logo */}
              {netflixProvider?.src && (
                <MotionBox
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.6,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 120,
                    damping: 10,
                  }}
                >
                  <Image
                    src={netflixProvider.src}
                    alt={`${netflixProvider.name} Logo`}
                    h={{ base: "70px", md: "100px" }}
                    maxW="260px"
                    objectFit="contain"
                    filter={`drop-shadow(2px 5px 5px ${THEME.colors.black}B3)`}
                    mb={4}
                  />
                </MotionBox>
              )}
              {/* Tagline Text */}
              <MotionHeading
                as="h3"
                size={{ base: "md", md: "lg" }}
                color={THEME.colors.text}
                textAlign="center"
                {...THEME.styles.heading}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                textShadow={`2px 2px 0px ${THEME.colors.black}, -1px -1px 0px ${THEME.colors.accent}22`}
              >
                Exclusive Series & Must-Watch Movies
              </MotionHeading>

              {/* Optional: Small descriptive text */}
              <MotionText
                color={THEME.colors.subtleText}
                fontSize="sm"
                textAlign="center"
                {...THEME.styles.body}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                px={4}
              >
                Discover top picks streaming now.
              </MotionText>
            </MotionVStack>
          </MotionFlex>
        </Container>
      </MotionBox>
    </>
  );
};

export default NetflixBanner;
