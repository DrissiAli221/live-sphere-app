import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Link as RouterLink } from "react-router-dom";

// --- Chakra UI Primitive Imports ---
import {
  Box,
  Flex,
  Image,
  Text,
  HStack,
  VStack,
  Heading,
  Spinner,
  Skeleton,
  Icon,
  Container,
} from "@chakra-ui/react";

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Service/Util/Component Imports ---
import {
  baseImageW500,
  baseImageOriginal,
  fetchRecommendations,
} from "@/services/api"; // !!! UPDATE THIS PATH AS NEEDED !!!

// --- Icon Imports ---
import {
  FaFilm,
  FaStar,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// --- Util Imports (Ensure truncateText exists if used) ---
import { truncateText } from "@/utils/helper"; // Make sure this helper is available/correctly imported if using truncateText

// ========================================================================
// === THEME CONSTANTS (Defined In-File) ===
// ========================================================================

const ALL_GENRES_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  10752: "War",
  37: "Western",
  // TV Genres
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

const THEME = {
  colors: {
    black: "#0a0a0a",
    darkBg: "#08080A", // Very dark base for section BG
    offBlack: "#101012",
    cardBg: "#141416", // BG for card elements
    accent: "#FFEC44",
    border: "rgba(255, 255, 255, 0.2)",
    borderSubtle: "rgba(255, 255, 255, 0.1)",
    borderMedium: "rgba(255, 255, 255, 0.4)",
    borderAccent: "#FFEC44",
    shadow: "#000000", // Pure Black shadow
    text: "whiteAlpha.900",
    subtleText: "whiteAlpha.700",
    gradientStart: "rgba(20, 20, 22, 1)", // Opaque start for overlay
    gradientMid: "rgba(20, 20, 22, 0.85)", // Stronger middle gradient
    gradientEnd: "rgba(20, 20, 22, 0)", // Fade to transparent
    projectorBeam: "rgba(255, 236, 68, 0.07)", // Slightly more intense beam
  },
  fonts: {
    heading: "'Courier New', monospace",
    body: "'Courier New', monospace",
  },
  styles: {
    // Common styles
    heading: {
      fontFamily: "'Courier New', monospace",
      textTransform: "uppercase",
      letterSpacing: "wider",
    },
    body: { fontFamily: "'Courier New', monospace", letterSpacing: "normal" },
  },
  effects: {
    // Textures & Effects
    noiseBg:
      "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVדהזה/v7+/v7+/v7+////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+///+/v7+/v7+/v7+/v7+/v7+/s8wT4AAAAF3RSTlPF48P117/Aw869zKrQuLOqphh5i59qcOMVsAAAAJZJREFUOI1jZobgMAIALAwMAyMWBgYW0AYsDLSAAVDCx/8D5cAxkvtR40lAFBl6vA5I7gBxQ7FBAmTk4b+DBwARHyG1DQEIGbQAAYQAHj6HjwxEHpXjF8AMDEQgUMDDhx4A9UikwMhoAAAUY4KHAACAEs6HF4HgQpAQAyNggkAJzAGYWFkAMjIKAEQz0mkwAACMQAAA1AUQAASYAFhI07u0aF4UAAAAAElFTkSuQmCC)",
    noiseOpacity: 0.08, // Increased grain visibility
    // Scanline effect values integrated into BG section now
    vignetteColor: "rgba(0, 0, 0, 0.3)",
    flickerOpacityMin: 0.96, // More noticeable flicker range
    flickerOpacityMax: 1.0,
  },
};
const POSTER_ASPECT_RATIO = 2 / 3;
const SHADOW_OFFSET_X = 6;
const SHADOW_OFFSET_Y = 6;

// Sketchy Edge Mask
const roughEdgesFilterId = "poster-rough-edges-slider";
const roughEdgesMaskCss = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><filter id="${roughEdgesFilterId}"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="10" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter><rect width="100%" height="100%" filter="url(%23${roughEdgesFilterId})" /></svg>#${roughEdgesFilterId}')`; // Added seed

// ========================================================================
// === MOTION COMPONENT ALIASES ===
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionImage = motion(Image);
const MotionVStack = motion(VStack);
const MotionHeading = motion(Heading);
const MotionDiv = motion.div; // Needed for some helpers
const MotionPath = motion.path; // Needed for some helpers

// ========================================================================
// === HELPER & THEMED COMPONENTS (Defined In-File) ===
// ========================================================================

// --- Scribble Effect ---
const ScribbleEffect = React.memo(
  ({ isActive, color = THEME.colors.accent }) => (
    <MotionBox
      position="absolute"
      top="-10%"
      left="-10%"
      width="120%"
      height="120%"
      pointerEvents="none"
      zIndex={10}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={isActive ? { opacity: 0.6 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 300 100"
        initial={false}
      >
        <motion.path
          d="M-5,50 C45,20 95,80 150,50 C205,20 255,80 305,50"
          fill="transparent"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4,4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            isActive
              ? { pathLength: 1, opacity: 0.7 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ strokeDashoffset: 0 }}
        />
      </motion.svg>
    </MotionBox>
  )
);

// --- SketchButtonInternal --- (Needed by SketchButton)
const SketchButtonInternal = React.memo(
  ({ children, primary = false, animate, ...rest }) => (
    <Box
      as="button"
      width="100%"
      height="auto"
      minH="10"
      position="relative"
      bg={primary ? THEME.colors.accent : "rgba(40,40,40,0.85)"}
      color={primary ? THEME.colors.black : THEME.colors.text}
      border="1px solid #000"
      borderRadius="1px"
      fontWeight={primary ? "bold" : "medium"}
      zIndex={2}
      transition="transform 0.1s, background 0.15s"
      _hover={{ textDecoration: "none" }}
      _focusVisible={{
        outline: `2px solid ${THEME.colors.accent}`,
        outlineOffset: "2px",
      }}
      _disabled={{
        opacity: 0.5,
        cursor: "not-allowed",
        filter: "grayscale(80%)",
      }}
      fontFamily={THEME.fonts.heading}
      fontSize="sm"
      textTransform="uppercase"
      letterSpacing="wider"
      px={4}
      py={2}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      {...rest}
    >
      {children}
      <MotionBox
        variants={{
          rest: { width: 0 },
          hover: { width: "90%", transition: { duration: 0.3 } },
        }}
        style={{
          position: "absolute",
          bottom: "4px",
          left: "5%",
          height: "2px",
          background: primary ? "black" : THEME.colors.accent,
          zIndex: 3,
        }}
        animate={animate}
      />
    </Box>
  )
);

// --- Sketch Button ---
const SketchButton = React.memo(
  ({
    children,
    primary = false,
    onClick = () => {},
    disabled = false,
    isLoading = false,
    size = "md",
    type = "button",
    iconSpacing = 2,
    ariaLabel,
    ...rest
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = disabled || isLoading;
    const btnStyles =
      size === "sm"
        ? { fontSize: "xs", px: 1.5, py: 1.5, minH: 10, minW: 10 }
        : { fontSize: "sm", px: 3, py: 1.5, minH: 9 };
    const hoverScale = 1.1;
    const tapScale = 0.9;

    return (
      <MotionBox
        position="relative"
        width="auto"
        display="inline-block"
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
        onKeyDown={(e) => {
          !isDisabled && (e.key === "Enter" || e.key === " ") && onClick();
        }}
        onHoverStart={() => !isDisabled && setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={!isDisabled ? { scale: tapScale, y: 3 } : {}}
        initial={false}
        animate={{
          scale: isHovered && !isDisabled ? hoverScale : 1,
          x:
            isHovered && !isDisabled
              ? SHADOW_OFFSET_X / 1.2
              : SHADOW_OFFSET_X / 2.5,
          y:
            isHovered && !isDisabled
              ? SHADOW_OFFSET_Y / 1.2
              : SHADOW_OFFSET_Y / 2.5,
        }} // Enhanced offset linking
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {" "}
        {/* Bouncier spring */}
        {/* Shadow */}
        <MotionBox
          position="absolute"
          inset={0}
          bg={THEME.colors.shadow}
          zIndex={-1}
          borderRadius="none"
          initial={false}
          animate={{ opacity: isHovered && !isDisabled ? 1 : 0.85 }}
          transition={{ duration: 0.15 }}
        />
        {/* Scribble */}
        <ScribbleEffect
          isActive={isHovered && !isDisabled}
          color={primary ? THEME.colors.black : THEME.colors.accent}
        />
        {/* Doodles */}
        {!isDisabled &&
          ["topLeft", "topRight", "bottomLeft", "bottomRight"].map(
            (pos, idx) => (
              <MotionBox
                key={pos}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  isHovered
                    ? { scale: 1.1, opacity: 1 }
                    : { scale: 0, opacity: 0 }
                }
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                style={{
                  position: "absolute",
                  width: "7px",
                  height: "7px",
                  border: `1.8px solid ${THEME.colors.accent}`,
                  zIndex: 5,
                  borderRadius: "none",
                  ...(pos === "topLeft"
                    ? { top: -4, left: -4, borderWidth: "1.8px 0 0 1.8px" }
                    : pos === "topRight"
                    ? { top: -4, right: -4, borderWidth: "1.8px 1.8px 0 0" }
                    : pos === "bottomLeft"
                    ? { bottom: -4, left: -4, borderWidth: "0 0 1.8px 1.8px" }
                    : {
                        bottom: -4,
                        right: -4,
                        borderWidth: "0 1.8px 1.8px 0",
                      }),
                }}
                aria-hidden="true"
              />
            )
          )}
        {/* Button Content */}
        <Box
          as="button"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          zIndex={2}
          bg={primary ? THEME.colors.accent : "rgba(30,30,30,0.9)"}
          color={primary ? THEME.colors.black : THEME.colors.text}
          border="1.5px solid #000"
          borderRadius="1px"
          fontWeight="bold"
          transition="background 0.2s"
          _hover={{ textDecoration: "none" }}
          _focusVisible={{
            outline: `2px solid ${THEME.colors.accent}`,
            outlineOffset: "3px",
          }}
          _disabled={{
            opacity: 0.4,
            cursor: "not-allowed",
            filter: "grayscale(90%)",
            pointerEvents: "none",
          }}
          fontFamily={THEME.fonts.heading}
          {...btnStyles}
          isDisabled={isDisabled}
          onClick={onClick}
          type={type}
          {...rest}
        >
          {isLoading ? (
            <Spinner
              size="xs"
              speed="0.8s"
              color={primary ? THEME.colors.black : THEME.colors.accent}
            />
          ) : (
            children
          )}
        </Box>
      </MotionBox>
    );
  }
);

// --- Squiggly Line ---
const SquigglyLine = React.memo(
  ({
    color = THEME.colors.accent,
    delay = 0,
    thickness = 1.5,
    dasharray = "3,2",
    duration = 0.6,
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
        height="4"
        viewBox="0 0 300 4"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <motion.path
          d="M0,2 Q20,3 40,2 T80,2 T120,2 T160,2 T200,2 T240,2 T280,2 300,2"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={dasharray}
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: duration * 2,
            delay: delay + 0.2,
            ease: "linear",
          }}
        />
      </svg>
    </MotionDiv>
  )
);

// --- Section Heading ---
const SectionHeading = React.memo(({ children, align = "center" }) => (
  <VStack align={align} mb={10} spacing={1}>
    <MotionHeading
      as="h2"
      size={{ base: "md", md: "lg" }}
      color={THEME.colors.text}
      {...THEME.styles.heading}
      textShadow="1px 1px 2px rgba(0,0,0,0.7)"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {" "}
      {children}{" "}
    </MotionHeading>
    <Box w="80px" transform="rotate(180deg)">
      <SquigglyLine
        color={THEME.colors.accent}
        thickness={1.5}
        dasharray="2,2"
        duration={0.5}
      />
    </Box>
  </VStack>
));

// --- Vertical Poster Skeleton Card (With Pulsing) ---
const PosterSkeletonCard = React.memo(({ cardWidth }) => (
  <MotionBox
    w={cardWidth}
    aspectRatio={POSTER_ASPECT_RATIO}
    position="relative"
    flexShrink={0}
    bg={THEME.colors.darkBg}
    initial={{ opacity: 0.6 }}
    animate={{ opacity: [0.6, 0.9, 0.6] }}
    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
  >
    <Box
      position="absolute"
      inset={0}
      bg={THEME.colors.shadow}
      transform={`translate(${SHADOW_OFFSET_X}px, ${SHADOW_OFFSET_Y}px)`}
      zIndex={0}
      borderRadius="none"
    />
    <Box
      w="100%"
      h="100%"
      borderRadius="none"
      border="1.5px solid"
      borderColor={THEME.colors.border}
      bg={THEME.colors.cardBg}
    />
  </MotionBox>
));

// --- Sketchy Vertical Poster Card (With Enhancements) ---
const SketchyVerticalPosterCard = React.memo(
  ({ item, itemType, cardWidth, index, genreMap = {} }) => {
    const [isHovered, setIsHovered] = useState(false);
    const destinationType = item.media_type || itemType;
    const title = item.title || item.name || "Untitled";
    const imagePath = item.poster_path || item.backdrop_path;
    const imageBase = item.poster_path ? baseImageW500 : baseImageOriginal;
    const releaseYear = (item.release_date || item.first_air_date)?.substring(
      0,
      4
    );
    const displayedGenres = useMemo(
      () =>
        (item.genre_ids || [])
          .map((id) => genreMap[id])
          .filter(Boolean)
          .slice(0, 2),
      [item.genre_ids, genreMap]
    );

    const cardEntryVariant = {
      hidden: { opacity: 0, y: 40 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: i * 0.07,
          ease: [0.2, 0.8, 0.5, 1],
        },
      }),
    };
    const cardContentVariants = {
      rest: {
        x: 0,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        boxShadow: `0px 0px 0px ${THEME.colors.accent}00`,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      },
      hover: {
        x: -SHADOW_OFFSET_X * 0.75,
        y: -SHADOW_OFFSET_Y * 0.75,
        scale: 1.05,
        /* Reduced scale slightly */ rotateX: 2,
        rotateY: 6,
        /* Enhanced Tilt */ boxShadow: `0px 0px 18px 4px ${THEME.colors.accent}55`,
        /* Enhanced Glow */ transition: {
          type: "spring",
          stiffness: 300,
          damping: 15,
        },
      },
    };
    const slideInPanelVariants = {
      hidden: { y: "100%", opacity: 0.5 },
      visible: {
        y: "0%",
        opacity: 1,
        transition: { duration: 0.35, ease: [0.2, 0.8, 0.4, 1] },
      }, // Smoother ease
      exit: {
        y: "100%",
        opacity: 0.5,
        transition: { duration: 0.3, ease: "easeIn" },
      },
    };

    if (!imagePath) return null;

    return (
      <MotionBox
        position="relative"
        w={cardWidth}
        aspectRatio={POSTER_ASPECT_RATIO}
        variants={cardEntryVariant}
        initial="hidden"
        animate="visible" // Use animate instead of whileInView for initial load
        whileHover="hover"
        /* Trigger variant on hover */ custom={index}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* 1. Thick Static Shadow */}
        <Box
          position="absolute"
          inset={0}
          bg={THEME.colors.shadow}
          zIndex={0}
          borderRadius="none"
          transform={`translate(${SHADOW_OFFSET_X}px, ${SHADOW_OFFSET_Y}px)`}
          filter="blur(1px)" /* Slightly blurred shadow */
        />
        {/* 2. Content Box (With Hover Animations & Perspective) */}
        <MotionBox
          position="relative"
          zIndex={1}
          w="100%"
          h="100%"
          bg={THEME.colors.cardBg}
          border="1.5px solid"
          borderColor={
            isHovered ? THEME.colors.borderAccent : THEME.colors.border
          }
          borderRadius="none"
          overflow="hidden"
          transition="border-color 0.15s"
          cursor="pointer"
          variants={cardContentVariants}
          initial="rest" /* Initial state is 'rest' */
          sx={{
            maskImage: roughEdgesMaskCss,
            WebkitMaskImage: roughEdgesMaskCss,
            maskSize: "cover",
            WebkitMaskSize: "cover",
            perspective: "900px" /* Slightly increased perspective */,
          }}
        >
          {/* Base Image with hover filter */}
          <MotionImage
            src={`${imageBase}${imagePath}`}
            alt={`${title} Poster`}
            w="100%"
            h="100%"
            objectFit="cover"
            initial={false}
            animate={{
              filter: isHovered
                ? "brightness(1.15) saturate(1.1)"
                : "brightness(0.9) saturate(0.9)",
            }}
            transition={{ duration: 0.3 }}
          />
          {/* SLIDE-IN INFO PANEL */}
          <AnimatePresence>
            {isHovered && (
              <MotionFlex
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="60%"
                /* Increased height */ bgGradient={`linear(to-t, ${THEME.colors.gradientStart} 35%, ${THEME.colors.gradientMid} 85%, ${THEME.colors.gradientEnd} 100%)`}
                p={{ base: 3, md: 4 }}
                direction="column"
                justifyContent="flex-end"
                alignItems="flex-start"
                variants={slideInPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                zIndex={3}
                pointerEvents="none"
              >
                <VStack align="flex-start" spacing={1.5} w="full">
                  <Text
                    color={THEME.colors.text}
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="bold"
                    noOfLines={2}
                    lineHeight="tight"
                    {...THEME.styles.heading}
                    letterSpacing="normal"
                    /* Normal for better reading */ textShadow="1px 1px 2px rgba(0,0,0,1)"
                  >
                    {" "}
                    {title}{" "}
                  </Text>{" "}
                  {/* Stronger text shadow */}
                  <HStack spacing={3} pt="1px">
                    {releaseYear && (
                      <Flex align="center" title={releaseYear}>
                        <Icon
                          as={FaCalendarAlt}
                          color={THEME.colors.accent}
                          boxSize="11px"
                          mr={1}
                        />{" "}
                        <Text
                          fontSize="xs"
                          color={THEME.colors.subtleText}
                          textShadow="1px 1px 1px rgba(0,0,0,0.8)"
                        >
                          {" "}
                          {releaseYear}
                        </Text>
                      </Flex>
                    )}
                    {item.vote_average > 0 && (
                      <Flex align="center" title={item.vote_average.toFixed(1)}>
                        <Icon
                          as={FaStar}
                          color={THEME.colors.accent}
                          boxSize="11px"
                          mr={1}
                        />{" "}
                        <Text
                          fontSize="xs"
                          color={THEME.colors.subtleText}
                          textShadow="1px 1px 1px rgba(0,0,0,0.8)"
                        >
                          {item.vote_average.toFixed(1)}
                        </Text>
                      </Flex>
                    )}
                  </HStack>
                  {/* Genres */}
                  <Flex
                    flexWrap="wrap"
                    gap={1.5}
                    mt={2.5}
                    /* More space */ maxW="95%"
                  >
                    {displayedGenres.map((genreName) => (
                      <Text
                        key={genreName}
                        bg={`${THEME.colors.darkBg}B3`}
                        /* Semi-transparent BG */ px={1.5}
                        py={0.5}
                        border={`1px solid ${THEME.colors.borderSubtle}`}
                        fontSize="10px"
                        color={THEME.colors.subtleText}
                        {...THEME.styles.body}
                        letterSpacing="tighter"
                        textShadow="1px 1px 1px rgba(0,0,0,0.7)"
                      >
                        {" "}
                        {genreName}{" "}
                      </Text>
                    ))}
                  </Flex>
                </VStack>
              </MotionFlex>
            )}
          </AnimatePresence>
          {/* Inner Frame / Vignette */}
          <Box
            position="absolute"
            inset="0"
            boxShadow={`inset 0 0 15px 5px ${THEME.colors.black}55, inset 0 0 5px 2px ${THEME.colors.black}33`}
            /* Inner shadow vignette */ pointerEvents="none"
            zIndex={4}
          />
        </MotionBox>
        <Box
          as={RouterLink}
          to={`/${itemType}/${item.id}`}
          position="absolute"
          inset="0"
          zIndex="5"
          aria-hidden="true"
        />
      </MotionBox>
    );
  }
);

// ========================================================================
// === RecommendationsSection Component (Horizontal Slider Implementation) ===
// ========================================================================

function RecommendationsSection({ itemId, itemType }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const scrollRef = useRef(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4); // Start with an estimate

  // Responsive Card Width
  const cardWidth = useMemo(
    () => ({
      base: "150px",
      sm: "170px",
      md: "190px",
      lg: "210px",
      xl: "230px",
    }),
    []
  ); // Use memo

  // Data Fetching (Simplified callback structure)
  const fetchRecsData = useCallback(async () => {
    setLoadingRecs(true);
    setShowPrev(false);
    setShowNext(false);
    try {
      const data = await fetchRecommendations(itemType, itemId);
      const validRecs = data?.filter((rec) => rec.poster_path) || [];
      setRecommendations(validRecs.slice(0, 16));
    } catch (err) {
      console.error("Rec Fetch Error:", err);
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  }, [itemId, itemType]);
  useEffect(() => {
    fetchRecsData();
  }, [fetchRecsData]);

  // Scroll State Logic (Using Debounced Callback)
  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const tolerance = 15;
    const canScroll = scrollWidth > clientWidth + tolerance;
    setShowPrev(canScroll && scrollLeft > tolerance);
    setShowNext(
      canScroll && scrollLeft < scrollWidth - clientWidth - tolerance
    );
    if (canScroll) {
      const avgCardWidth = 210;
      const calculatedItemsPerPage = Math.max(
        1,
        Math.floor(clientWidth / (avgCardWidth + 20))
      );
      setItemsPerPage(calculatedItemsPerPage);
      const totalPages = Math.ceil(
        recommendations.length / calculatedItemsPerPage
      );
      const calculatedCurrentPage = Math.round(
        (scrollLeft / (scrollWidth - clientWidth)) * (totalPages - 1)
      );
      setCurrentPage(
        Math.min(Math.max(0, calculatedCurrentPage), totalPages - 1)
      );
    } else {
      setCurrentPage(0);
    }
  }, [recommendations.length]);
  const debouncedUpdateScrollState = useCallback(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScrollState, 150);
    };
  }, [updateScrollState])();
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || loadingRecs) return;
    container.addEventListener("scroll", debouncedUpdateScrollState, {
      passive: true,
    });
    const observer = new ResizeObserver(debouncedUpdateScrollState);
    observer.observe(container);
    setTimeout(debouncedUpdateScrollState, 150);
    /* Initial check slightly delayed */ return () => {
      container.removeEventListener("scroll", debouncedUpdateScrollState);
      observer.disconnect();
    };
  }, [loadingRecs, recommendations.length, debouncedUpdateScrollState]);

  // Scroll Action
  const handleScroll = useCallback(
    (direction) => {
      if (!scrollRef.current) return;
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.7;
      scrollRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(updateScrollState, 400);
    },
    [updateScrollState]
  );

  const totalPages = useMemo(
    () =>
      itemsPerPage > 0 ? Math.ceil(recommendations.length / itemsPerPage) : 0,
    [recommendations.length, itemsPerPage]
  );

  // Section Animation
  const sectionEntryVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  // --- Render ---
  if (loadingRecs || recommendations.length > 0) {
    return (
      <Container
        maxW="container.xl"
        py={{ base: 10, md: 16 }}
        mt={8}
        position="relative"
      >
        {/* Optional: Projector/Flicker Effects */}
        <MotionBox
          position="absolute"
          top="-80px"
          left="50%"
          transform="translateX(-50%)"
          width="70%"
          height="250px"
          zIndex={-1}
          overflow="hidden"
          opacity={0.6}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          {" "}
          <Box
            width="150%"
            height="150%"
            position="absolute"
            left="-25%"
            top="-25%"
            bgGradient={`radial(ellipse at 50% -40%, ${THEME.colors.projectorBeam} 5%, transparent 55%)`}
            style={{ transform: "perspective(250px) rotateX(20deg)" }}
          />{" "}
        </MotionBox>
        <MotionBox
          position="absolute"
          inset={0}
          zIndex={-2}
          bg={THEME.colors.black}
          pointerEvents="none"
          initial={{ opacity: THEME.effects.flickerOpacityMax }}
          animate={{
            opacity: [
              THEME.effects.flickerOpacityMax,
              THEME.effects.flickerOpacityMin,
              THEME.effects.flickerOpacityMax,
            ],
          }}
          transition={{
            duration: 0.12,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
          aria-hidden="true"
        />

        <SectionHeading align="center">You Might Also Like</SectionHeading>

        <MotionBox
          position="relative"
          px={{ base: "0", md: "60px" }}
          variants={sectionEntryVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Scrollable Content */}
          <Flex
            ref={scrollRef}
            overflowX="auto"
            overflowY="hidden"
            pb={8 + SHADOW_OFFSET_Y / 4}
            pt={4}
            css={{
              /* Scrollbar styles */ scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }} /* Hide scrollbar visually */
          >
            <HStack
              spacing={5}
              align="stretch"
              px={2}
              /* Consistent spacing and slight edge padding */ minH={{
                base: "280px",
                sm: "310px",
                md: "350px",
                lg: "380px",
                xl: "410px",
              }} /* Min height for taller cards */
            >
              {loadingRecs &&
                Array.from({ length: 6 }).map((_, i) => (
                  <PosterSkeletonCard key={`skel-${i}`} cardWidth={cardWidth} />
                ))}
              {!loadingRecs &&
                recommendations.map((item, index) => (
                  <SketchyVerticalPosterCard
                    key={item.id}
                    item={item}
                    itemType={itemType}
                    cardWidth={cardWidth}
                    index={index}
                    genreMap={ALL_GENRES_MAP}
                  />
                ))}
            </HStack>
          </Flex>
          {/* Scroll Buttons */}
          {!loadingRecs && recommendations.length > 0 && totalPages > 1 && (
            <>
              <AnimatePresence>
                {showPrev && (
                  <MotionBox
                    position="absolute"
                    top="50%"
                    left={{ base: "5px", md: "-5px" }}
                    transform="translateY(-50%)"
                    zIndex={10}
                    {...{
                      initial: { opacity: 0, x: -15 },
                      animate: { opacity: 1, x: 0 },
                      exit: { opacity: 0, x: -15 },
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                  >
                    <SketchButton
                      onClick={() => handleScroll("prev")}
                      size="sm"
                      ariaLabel="Scroll previous"
                    >
                      <Icon as={FaChevronLeft} boxSize={5} />
                    </SketchButton>
                  </MotionBox>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showNext && (
                  <MotionBox
                    position="absolute"
                    top="50%"
                    right={{ base: "5px", md: "-5px" }}
                    transform="translateY(-50%)"
                    zIndex={10}
                    {...{
                      initial: { opacity: 0, x: 15 },
                      animate: { opacity: 1, x: 0 },
                      exit: { opacity: 0, x: 15 },
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                  >
                    <SketchButton
                      onClick={() => handleScroll("next")}
                      size="sm"
                      ariaLabel="Scroll next"
                    >
                      <Icon as={FaChevronRight} boxSize={5} />
                    </SketchButton>
                  </MotionBox>
                )}
              </AnimatePresence>
            </>
          )}
        </MotionBox>

        {/* Scroll Indicator Dots */}
        {!loadingRecs && totalPages > 1 && (
          <HStack
            justify="center"
            spacing={2.5}
            mt={8} /* Increased margin top */
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <MotionBox
                key={`dot-${i}`}
                w="9px"
                h="9px"
                /* Slightly larger */ bg={
                  i === currentPage ? THEME.colors.accent : THEME.colors.border
                }
                borderRadius="2px"
                /* More square */ border={`1px solid ${
                  i === currentPage
                    ? THEME.colors.accent
                    : THEME.colors.borderSubtle
                }`}
                initial={false}
                animate={{
                  scale: i === currentPage ? 1.3 : 0.8,
                  opacity: i === currentPage ? 1 : 0.6,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                cursor="pointer"
                onClick={() => {
                  const jumpScroll =
                    i * itemsPerPage * (parseInt(cardWidth.md || "190") + 20);
                  scrollRef.current?.scrollTo({
                    left: jumpScroll,
                    behavior: "smooth",
                  });
                }}
              />
            ))}
          </HStack>
        )}

        {/* Empty State */}
        {!loadingRecs && recommendations.length === 0 && (
          <Text
            color={THEME.colors.subtleText}
            textAlign="center"
            pt={10}
            fontSize="sm"
            fontFamily={THEME.fonts.body}
          >
            Nothing quite like it!
          </Text>
        )}
      </Container>
    );
  }
  return null;
}

export default RecommendationsSection;
