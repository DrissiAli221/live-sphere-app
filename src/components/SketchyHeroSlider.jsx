import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Image,
  Text,
  Heading,
  Badge,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaInfoCircle,
  FaStar,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { BiCameraMovie, BiTv } from "react-icons/bi";

// --- Service & Utility Imports ---
import {
  fetchTrending,
  fetchDetails,
  fetchMovieImages,
  baseImageOriginal,
  // baseImagePoster,
} from "@/services/api"; // ADJUST PATH
import { truncateText, convertMinutesToHours } from "@/utils/helper"; // ADJUST PATH
import { watchProviders } from "@/utils/watchProviders";

const baseImagePosterW342 = "https://image.tmdb.org/t/p/w342";

// --- Framer Motion Components ---
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// --- Styling & Config Constants ---
const AUTOPLAY_INTERVAL = 12000; // <-- Increased to 12 seconds
const BASE_BG = "#0A0A14";
const ACCENT_COLOR = "#FFEC44";
const NEON_GLOW_COLOR = ACCENT_COLOR;
const GRADIENT_OVERLAY = `linear-gradient(rgba(10,10,20,0.6) 0%, rgba(10,10,20,0.8) 40%, rgba(10,10,20,0.95) 70%, ${BASE_BG} 98%)`;
const MUTED_TEXT_COLOR = "gray.300";
const HEADING_FONT = "'Courier Prime', monospace";
const BODY_FONT = "'Spline Sans Mono', monospace";
// Poster Grid Config
const POSTER_HEIGHT = { base: "120px", md: "150px", lg: "170px" };
const POSTER_ASPECT_RATIO = 2 / 3;
const GRID_GAP_X = { base: 3, md: 4 };
const BUTTON_ACCENT_DARK = "#1A1A1A";
const BUTTON_SECONDARY_BG = "rgba(35, 35, 40, 0.9)";
const BUTTON_SECONDARY_FG = "#E0E0E0";
const ACTIVE_POSTER_BORDER_COLOR = ACCENT_COLOR;
const INACTIVE_POSTER_BORDER_COLOR = "rgba(255, 255, 255, 0.15)";
const INACTIVE_POSTER_OPACITY = 0.65;
const INACTIVE_POSTER_SCALE = 0.95;
const ACTIVE_POSTER_BG = "rgba(255, 236, 68, 0.1)";
// Background Effects
const NOISE_OPACITY = 0.06;
const SCANLINES_OPACITY = 0.2;
const VIGNETTE_INTENSITY = 0.4;
const TRANSPARENT_BG_COLOR = "rgba(0, 0, 0, 0)";

const headingFont = "'Courier New', monospace";
const accentColor = "#FFEC44"; // Yellow accent

const NOISE_BG_URL =
  "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVדהזה/v7+/v7+/v7+////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+///+/v7+/v7+/v7+/v7+/v7+/s8wT4AAAAF3RSTlPF48P117/Aw869zKrQuLOqphh5i59qcOMVsAAAAJZJREFUOI1jZobgMAIALAwMAyMWBgYW0AYsDLSAAVDCx/8D5cAxkvtR40lAFBl6vA5I7gBxQ7FBAmTk4b+DBwARHyG1DQEIGbQAAYQAHj6HjwxEHpXjF8AMDEQgUMDDhx4A9UikwMhoAAAUY4KHAACAEs6HF4HgQpAQAyNggkAJzAGYWFkAMjIKAEQz0mkwAACMQAAA1AUQAASYAFhI07u0aF4UAAAAAElFTkSuQmCC)";
const MAX_CONTENT_WIDTH = "1100px";
const TEXT_SHADOW_STYLE = `1px 1px 3px rgba(0,0,0,0.7), 0 0 5px ${NEON_GLOW_COLOR}33`;

// --- Reusable Components ---

// Typing Effect - Slightly faster typing
const TypingEffect = React.memo(({ text, speed = 25 /* Faster Typing */ }) => {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = text || "";
  useEffect(() => {
    setDisplayedText("");
    if (!fullText) return;
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + fullText.charAt(i));
      i++;
      if (i === fullText.length) {
        clearInterval(intervalId);
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [fullText, speed]);
  return (
    <MotionText
      fontSize={["sm", "md"]}
      color="gray.200"
      noOfLines={3}
      lineHeight="base"
      mb={8}
      /* <-- Increased margin-bottom for gap */ fontFamily={BODY_FONT}
      textShadow={TEXT_SHADOW_STYLE}
      minHeight="4.5em"
      _after={{
        content: '"▋"',
        display: "inline-block",
        animation: "blink 0.8s steps(1) infinite",
        opacity: 1,
        color: ACCENT_COLOR,
        marginLeft: "2px",
      }}
      sx={{ "@keyframes blink": { "50%": { opacity: 0 } } }}
    >
      {" "}
      {displayedText} <span style={{ visibility: "hidden" }}> </span>{" "}
    </MotionText>
  );
});

// Other reusable components (ScribbleEffect, Sketch Buttons, SquigglyLine, PosterGrid) assumed defined correctly...
const ScribbleEffect = ({ isActive }) => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 300 100"
    initial={false}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      pointerEvents: "none",
      zIndex: 10,
      opacity: 0.5,
      overflow: "visible",
    }}
    animate={isActive ? "visible" : "hidden"}
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.6 } }}
  >
    {" "}
    <motion.path
      d="M10,50 Q50,20 100,55 T200,50 Q250,80 290,45"
      fill="transparent"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="4 3"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        isActive ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
      }
      transition={{ duration: 0.5, ease: "circOut" }}
      style={{ strokeDashoffset: 0 }}
    />{" "}
  </motion.svg>
);
const SketchButtonInternal = React.memo(
  ({ children, primary = false, ...rest }) => (
    <Box
      as="button"
      position="relative"
      width="100%"
      height="auto"
      minH="10"
      bg={primary ? ACCENT_COLOR : BUTTON_SECONDARY_BG}
      color={primary ? BUTTON_ACCENT_DARK : BUTTON_SECONDARY_FG}
      border="1.5px solid #1A1A1A"
      borderRadius="2px"
      fontWeight="bold"
      zIndex={2}
      transition="transform 0.15s ease-out, background 0.2s ease-in-out"
      _hover={{ textDecoration: "none" }}
      _focusVisible={{
        outline: `2px dashed ${ACCENT_COLOR}`,
        outlineOffset: "3px",
      }}
      _disabled={{
        opacity: 0.4,
        cursor: "not-allowed",
        filter: "grayscale(90%)",
      }}
      fontFamily={HEADING_FONT}
      fontSize="sm"
      textTransform="uppercase"
      letterSpacing="wider"
      px={4}
      py={2}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      boxShadow={
        primary
          ? "2px 2px 0px 0px rgba(0,0,0,0.9)"
          : "1px 1px 0px 0px rgba(0,0,0,0.7)"
      }
      {...rest}
    >
      {" "}
      <Box as="span" position="relative" zIndex={1}>
        {children}
      </Box>{" "}
    </Box>
  )
);
const SketchButton = ({
  children,
  primary = false,
  onClick = () => {},
  disabled = false,
  isLoading = false,
  size = "md",
  type = "button",
  iconSpacing = 2,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.97, y: 1 },
  };
  const shadowVariants = {
    rest: { x: 1, y: 1, boxShadow: "none" },
    hover: {
      x: 3,
      y: 3,
      boxShadow: `0 0 8px 2px ${NEON_GLOW_COLOR}${primary ? "99" : "77"}`,
    },
  };
  const underlineVariants = {
    rest: { width: "0%" },
    hover: { width: "90%", transition: { duration: 0.3, ease: "easeOut" } },
  };
  const cornerVariants = {
    rest: { scale: 0, opacity: 0 },
    hover: {
      scale: 1,
      opacity: 0.9,
      transition: { type: "spring", stiffness: 400, damping: 15 },
    },
  };
  const cornerPositions = useMemo(
    () => [
      { top: -3, left: -3, borderW: "2px 0 0 2px" },
      { top: -3, right: -3, borderW: "2px 2px 0 0" },
      { bottom: -3, left: -3, borderW: "0 0 2px 2px" },
      { bottom: -3, right: -3, borderW: "0 2px 2px 0" },
    ],
    []
  );
  const isDisabled = disabled || isLoading;
  const shadowColor = primary ? BUTTON_ACCENT_DARK : ACCENT_COLOR;
  const fontSize = size === "sm" ? "xs" : "sm";
  const paddingX = size === "sm" ? 3 : 4;
  const minHeight = size === "sm" ? 8 : 10;
  return (
    <MotionBox
      position="relative"
      width="100%"
      onHoverStart={() => !isDisabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      variants={containerVariants}
      initial="rest"
      whileHover={!isDisabled ? "hover" : undefined}
      whileTap={!isDisabled ? "tap" : undefined}
      animate={isHovered && !isDisabled ? "hover" : "rest"}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {" "}
      {!isDisabled && (
        <MotionBox
          position="absolute"
          inset="0"
          bg={shadowColor}
          zIndex={-1}
          borderRadius="2px"
          variants={shadowVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}{" "}
      {!isDisabled &&
        cornerPositions.map((pos, idx) => (
          <MotionBox
            key={idx}
            position="absolute"
            width="6px"
            height="6px"
            border={`1.5px solid ${ACCENT_COLOR}`}
            zIndex={5}
            borderRadius="none"
            variants={cornerVariants}
            style={{ ...pos }}
          />
        ))}{" "}
      <SketchButtonInternal
        primary={primary}
        onClick={onClick}
        disabled={isDisabled}
        minH={minHeight}
        fontSize={fontSize}
        px={paddingX}
        type={type}
        color={primary ? BUTTON_ACCENT_DARK : ACCENT_COLOR}
        style={{
          transform:
            isHovered && !isDisabled ? "translate(-1.5px, -1.5px)" : "none",
        }}
        {...rest}
      >
        {" "}
        <Flex align="center" justify="center" gap={iconSpacing}>
          {" "}
          {isLoading ? (
            <Spinner size="xs" speed="0.9s" thickness="2px" />
          ) : (
            children
          )}{" "}
        </Flex>{" "}
        <ScribbleEffect isActive={isHovered && !isDisabled} />{" "}
      </SketchButtonInternal>{" "}
      <MotionBox
        variants={underlineVariants}
        style={{
          position: "absolute",
          bottom: "5px",
          left: "5%",
          height: "1.5px",
          background: primary ? BUTTON_ACCENT_DARK : ACCENT_COLOR,
          zIndex: 3,
        }}
      />{" "}
    </MotionBox>
  );
};
const SquigglyLine = React.memo(
  ({
    color = ACCENT_COLOR,
    delay = 0,
    thickness = 2,
    dasharray = "4 2",
    duration = 0.8,
  }) => (
    <MotionBox
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration, delay, ease: "easeInOut" }}
      style={{ position: "relative", lineHeight: "0" }}
    >
      {" "}
      <svg
        width="100%"
        height="6"
        viewBox="0 0 300 6"
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
      >
        {" "}
        <motion.path
          d="M0,3 C25,1 50,5 75,3 S125,1 150,5 S200,1 225,5 S275,1 300,3"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={dasharray}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: "circOut" }}
        />{" "}
      </svg>{" "}
    </MotionBox>
  )
);

const InfiniteStreamingScroll = ({
  watchProviders,
  headingFont,
  accentColor,
}) => {
  const duplicatedProviders = [
    ...watchProviders,
    ...watchProviders,
    ...watchProviders,
    ...watchProviders,
  ];
  const animationDuration = watchProviders.length * 8;

  return (
    <Box
      width="100vw"
      position="relative"
      left="50%"
      transform="translateX(-50%)"
      overflow="hidden"
      borderTop={"1px solid rgba(255,255,255,0.3)"}
      borderBottom={"1px solid rgba(255,255,255,0.3)"}
      background={"rgba(10, 10, 20, 0.4)"}
    >
      {/* Infinite scroll container with padding */}
      <Box
        className="infinite-slider-container"
        position="relative"
        width="100%"
        height={"100%"}
        overflow="hidden"
        py={4.5}
        px={4}
      >
        {/* The actual scrolling track */}
        <Flex
          className="infinite-slider-track"
          position="relative"
          width="fit-content"
          animation={`scroll ${animationDuration}s linear infinite`}
          sx={{
            "@keyframes scroll": {
              "0%": {
                transform: "translateX(0)",
              },
              "100%": {
                transform: `translateX(-${
                  ((100 * watchProviders.length) / duplicatedProviders.length) *
                  2
                }%)`,
              },
            },
          }}
        >
          {/* All items in a single continuous Flex container with consistent spacing */}
          {duplicatedProviders.map((provider, index) => (
            <Box
              key={`provider-${provider.name}-${index}`}
              p={4}
              mr={8}
              borderRadius="md"
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="80px"
              width="100px"
              _hover={{ transform: "scale(1.05)" }}
              transition="all 0.2s ease"
            >
              <Image
                src={provider.src}
                alt={provider.name}
                maxH="45px"
                maxW="100%"
              />
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Gradient overlays for fade effect */}
      <Box
        position="absolute"
        left={0}
        top="60px"
        bottom={0}
        width="80px"
        pointerEvents="none"
        bgGradient="linear(to-r, rgba(0,0,0,0.9), rgba(0,0,0,0))"
        zIndex={1}
      />
      <Box
        position="absolute"
        right={0}
        top="60px"
        bottom={0}
        width="80px"
        pointerEvents="none"
        bgGradient="linear(to-l, rgba(0,0,0,0.9), rgba(0,0,0,0))"
        zIndex={1}
      />
    </Box>
  );
};

const PosterSelectorGrid = React.memo(
  ({ slides, currentIndex, onSelect, isHoveringGrid, accentColor }) => {
    const scrollContainerRef = useRef(null);
    const posterHeight = useBreakpointValue(POSTER_HEIGHT);
    const gapX = useBreakpointValue(GRID_GAP_X);
    useEffect(() => {
      if (!scrollContainerRef.current || isHoveringGrid) return;
      const activeElement = scrollContainerRef.current.children[currentIndex];
      if (activeElement) {
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const elementLeft = activeElement.offsetLeft;
        const elementWidth = activeElement.offsetWidth;
        const targetScrollLeft =
          elementLeft + elementWidth / 2 - containerWidth / 2;
        const scrollDifference = Math.abs(
          scrollContainerRef.current.scrollLeft - targetScrollLeft
        );
        const isOutOfView =
          elementLeft < scrollContainerRef.current.scrollLeft ||
          elementLeft + elementWidth >
            scrollContainerRef.current.scrollLeft + containerWidth;
        if (isOutOfView || scrollDifference > elementWidth * 0.75) {
          scrollContainerRef.current.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: "smooth",
          });
        }
      }
    }, [currentIndex, isHoveringGrid]);
    return (
      <Box width="100%" py={4} overflow="hidden">
        {" "}
        <Flex
          ref={scrollContainerRef}
          gap={gapX}
          pb={3}
          overflowX="auto"
          overflowY="hidden"
          width="100%"
          justifyContent={{ base: "flex-start", md: "center" }}
          alignItems="center"
          css={{
            "&::-webkit-scrollbar": { height: "6px" },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: accentColor,
              borderRadius: "2px",
              border: "1px solid rgba(0,0,0,0.5)",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#FFDA00" },
            scrollbarWidth: "thin",
            scrollbarColor: `${accentColor} rgba(255, 255, 255, 0.05)`,
          }}
        >
          {" "}
          {slides.map((slide, index) => {
            if (!slide.poster_path) return null;
            const isActive = index === currentIndex;
            return (
              <MotionBox
                key={`poster-${slide.id}-${index}`}
                as="button"
                onClick={() => onSelect(index)}
                height={posterHeight}
                minW={`calc(${posterHeight} * ${POSTER_ASPECT_RATIO})`}
                w={`calc(${posterHeight} * ${POSTER_ASPECT_RATIO})`}
                position="relative"
                cursor="pointer"
                borderRadius="2px"
                overflow="hidden"
                border="2px solid"
                borderColor={
                  isActive
                    ? ACTIVE_POSTER_BORDER_COLOR
                    : INACTIVE_POSTER_BORDER_COLOR
                }
                bg={isActive ? ACTIVE_POSTER_BG : TRANSPARENT_BG_COLOR}
                initial={false}
                animate={{
                  scale: isActive ? 1 : INACTIVE_POSTER_SCALE,
                  opacity: isActive ? 1 : INACTIVE_POSTER_OPACITY,
                  zIndex: isActive ? 10 : 1,
                  backgroundColor: isActive
                    ? ACTIVE_POSTER_BG
                    : TRANSPARENT_BG_COLOR,
                  rotate: 0,
                }}
                whileHover={
                  isActive
                    ? {}
                    : {
                        scale: 1,
                        opacity: 0.9,
                        borderColor: accentColor,
                        rotate: 0,
                      }
                }
                transition={{ duration: 0.25, ease: "circOut" }}
                aria-label={`Select slide ${index + 1}: ${
                  slide.title || slide.name
                }`}
                title={`${slide.title || slide.name}`}
              >
                {" "}
                <Image
                  src={`${baseImagePosterW342}${slide.poster_path}`}
                  alt={`Poster for ${slide.title || slide.name}`}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  display="block"
                  loading="lazy"
                  filter={isActive ? "none" : "grayscale(50%)"}
                  transition="filter 0.3s ease-in-out"
                />{" "}
              </MotionBox>
            );
          })}{" "}
        </Flex>{" "}
      </Box>
    );
  }
);

// --- Main Slider Component ---
const SketchyHeroSlider = () => {
  // State, Data Fetching, Helpers etc. - Logic mostly unchanged
  const [slidesData, setSlidesData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHoveringContent, setIsHoveringContent] = useState(false);
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);
  const autoplayIntervalRef = useRef(null);
  // Data Fetch useEffect
  useEffect(() => {
    const fetchSliderData = async () => {
      setLoading(true);
      try {
        const trendingData = await fetchTrending("week", 1);
        const potentialSlides =
          trendingData
            ?.filter(
              (item) =>
                item.backdrop_path &&
                (item.media_type === "movie" || item.media_type === "tv") &&
                item.vote_average > 4
            )
            .slice(0, 10) || [];
        if (potentialSlides.length === 0) {
          setSlidesData([]);
          setLoading(false);
          return;
        }
        const detailedSlidesPromises = potentialSlides.map(async (item) => {
          try {
            const [detailsData, imagesData] = await Promise.all([
              fetchDetails(item.media_type, item.id),
              fetchMovieImages(item.media_type, item.id),
            ]);
            const finalPosterPath =
              detailsData?.poster_path || item.poster_path;
            if (!finalPosterPath) return null;
            return {
              ...item,
              poster_path: finalPosterPath,
              details: detailsData,
              images: imagesData,
            };
          } catch (err) {
            return item.poster_path
              ? { ...item, details: null, images: null }
              : null;
          }
        });
        const slidesWithDetailsRaw = await Promise.all(detailedSlidesPromises);
        const finalSlides = slidesWithDetailsRaw.filter(Boolean).slice(0, 7);
        setSlidesData(finalSlides);
      } catch (error) {
        setSlidesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSliderData();
  }, []);
  // Navigation Callbacks
  const goToIndex = useCallback(
    (index) => {
      if (!slidesData || slidesData.length === 0) return;
      setCurrentIndex((index + slidesData.length) % slidesData.length);
    },
    [slidesData]
  );
  const handleNext = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);
  const handlePrev = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);
  // Autoplay Logic
  const startAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    autoplayIntervalRef.current = setInterval(handleNext, AUTOPLAY_INTERVAL);
  }, [handleNext]);
  const stopAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, []);
  const resetAutoplay = useCallback(() => {
    stopAutoplay();
    if (!isHoveringContent && !isHoveringGrid && slidesData.length > 1) {
      startAutoplay();
    }
  }, [
    stopAutoplay,
    startAutoplay,
    isHoveringContent,
    isHoveringGrid,
    slidesData.length,
  ]);
  useEffect(() => {
    if (slidesData.length > 1 && !isHoveringContent && !isHoveringGrid) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return stopAutoplay;
  }, [
    slidesData.length,
    isHoveringContent,
    isHoveringGrid,
    startAutoplay,
    stopAutoplay,
  ]);
  const handleSelectSlide = useCallback(
    (index) => {
      if (index >= 0 && index < slidesData.length) {
        stopAutoplay();
        goToIndex(index);
      }
    },
    [slidesData.length, goToIndex, stopAutoplay]
  );
  const handlePrevWithReset = useCallback(() => {
    handlePrev();
    resetAutoplay();
  }, [handlePrev, resetAutoplay]);
  const handleNextWithReset = useCallback(() => {
    handleNext();
    resetAutoplay();
  }, [handleNext, resetAutoplay]);
  // Helper Hooks
  const currentSlide = slidesData[currentIndex];
  const getEnglishLogo = useCallback((logos) => {
    if (!logos || logos.length === 0) return null;
    const png = logos.find(
      (l) => l.iso_639_1 === "en" && l.file_path?.endsWith(".png")
    );
    return png || logos.find((l) => l.iso_639_1 === "en") || logos[0];
  }, []);
  const hasValidLogo = useMemo(
    () =>
      !!currentSlide?.images?.logos?.length &&
      !!getEnglishLogo(currentSlide.images.logos)?.file_path,
    [currentSlide, getEnglishLogo]
  );
  console.log(slidesData);

  // Loading/Empty States
  if (loading)
    return (
      <Flex
        align="center"
        justify="center"
        w="100vw"
        h="100vh"
        bg={BASE_BG}
        position="relative"
        _after={{
          content: '""',
          position: "absolute",
          inset: 0,
          bg: NOISE_BG_URL,
          opacity: NOISE_OPACITY,
          pointerEvents: "none",
        }}
      >
        {" "}
        <Spinner
          size="xl"
          color={ACCENT_COLOR}
          thickness="3px"
          speed="0.85s"
        />{" "}
        <Text ml={4} color={MUTED_TEXT_COLOR} fontFamily={BODY_FONT}>
          Loading Interface...
        </Text>{" "}
      </Flex>
    );
  if (!slidesData || slidesData.length === 0)
    return (
      <Flex align="center" justify="center" w="100vw" h="100vh" bg={BASE_BG}>
        {" "}
        <Box textAlign="center" color="gray.300" fontFamily={BODY_FONT}>
          {" "}
          <Text fontSize="xl" fontWeight="bold" color={ACCENT_COLOR} mb={2}>
            Signal Lost
          </Text>{" "}
          <Text>Data feed interrupted.</Text>{" "}
        </Box>{" "}
      </Flex>
    );

  // --- Main Render (Adjusted Vertical Positioning) ---
  return (
    <Flex /* Outermost container */
      direction="column"
      w="100vw"
      h="100vh"
      bg={BASE_BG}
      overflow="hidden"
      position="relative"
      alignItems="center"
      // ** CHANGE: Use justifyContent flex-start and paddingTop **
      justifyContent="flex-start" // Align main content towards top
      pt={{ base: "8vh", md: "12vh", lg: "15vh" }} // Pushes content down from top
    >
      {/* Background Layers & Effects */}
      <Box position="absolute" inset={0} zIndex={0}>
        <Box
          position="absolute"
          inset={0}
          zIndex={1}
          pointerEvents="none"
          _after={{
            content: '""',
            position: "absolute",
            inset: 0,
            bg: NOISE_BG_URL,
            opacity: NOISE_OPACITY,
            mixBlendMode: "overlay",
          }}
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            background: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, ${ACCENT_COLOR}08, #00FF0005, #0000FF08)`,
            backgroundSize: "100% 3px, 5px 100%",
            opacity: SCANLINES_OPACITY,
            mixBlendMode: "color-dodge",
          }}
        />
        <AnimatePresence initial={false} mode="sync">
          <MotionBox
            key={`backdrop-${currentSlide?.id}`}
            position="absolute"
            inset={0}
            bgImage={`url(${baseImageOriginal}${currentSlide?.backdrop_path})`}
            bgSize="cover"
            bgPosition="center center"
            bgRepeat="no-repeat"
            initial={{ opacity: 0, filter: "blur(5px) saturate(0.7)" }}
            animate={{ opacity: 1, filter: "blur(0px) saturate(1)" }}
            exit={{ opacity: 0, filter: "blur(5px) saturate(0.7)" }}
            transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
          />
        </AnimatePresence>
        <Box position="absolute" inset={0} bg={GRADIENT_OVERLAY} zIndex={2} />
        <Box
          position="absolute"
          inset="-5px"
          zIndex={3}
          pointerEvents="none"
          bg={`radial-gradient(ellipse at center, transparent 55%, ${BASE_BG} 95%)`}
          opacity={VIGNETTE_INTENSITY}
        />
      </Box>
      {/* ** Centered Content Wrapper (Handles width & stacking) ** */}
      <Flex
        direction="column"
        position="relative" // Position relative for zIndex / absolute children
        zIndex={4}
        width={{ base: "95%", md: "90%", lg: "85%" }}
        maxWidth={MAX_CONTENT_WIDTH}
        alignItems="center" // Center children within this width
        flexShrink={0}
        // Combined hover for content/grid area for pausing
        onMouseEnter={() => setIsHoveringContent(true)}
        onMouseLeave={() => setIsHoveringContent(false)}
        // REMOVED negative margin-bottom, relies on outer padding/flex
      >
        {/* === Top Section (Hero Content) === */}
        <Box width="100%" px={{ base: 2, md: 4 }} pt={{ base: 2, md: 4 }}>
          {" "}
          {/* Reduced internal top padding */}
          <AnimatePresence mode="wait">
            {currentSlide && (
              <MotionFlex /* Hero details */
                key={`content-${currentSlide.id}`}
                direction="column"
                color="white"
                alignItems="flex-start"
                width={{ base: "100%", lg: "75%", xl: "70%" }}
                mr={{ base: 0, lg: "auto" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              >
                {/* Badge */}
                <MotionBox>
                  <Badge
                    bg={ACCENT_COLOR}
                    color={BUTTON_ACCENT_DARK}
                    borderRadius="1px"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                    fontFamily={HEADING_FONT}
                    display="inline-flex"
                    alignItems="center"
                    mb={4}
                    textTransform="uppercase"
                    border="1px solid rgba(0,0,0,0.7)"
                  >
                    {" "}
                    {currentSlide.media_type === "movie" ? (
                      <BiCameraMovie style={{ marginRight: "6px" }} />
                    ) : (
                      <BiTv style={{ marginRight: "6px" }} />
                    )}{" "}
                    Trending{" "}
                  </Badge>
                </MotionBox>
                {/* Logo/Title */}
                <Box mb={5} minH={{ base: "50px", md: "70px" }}>
                  {" "}
                  <AnimatePresence mode="wait">
                    {hasValidLogo ? (
                      <MotionImage
                        key={`logo-${currentSlide.id}`}
                        src={`${baseImageOriginal}${
                          getEnglishLogo(currentSlide.images?.logos).file_path
                        }`}
                        alt={`${currentSlide.title || currentSlide.name} logo`}
                        maxH={["50px", "70px", "90px"]}
                        objectFit="contain"
                        filter="drop-shadow(1px 2px 3px rgba(0,0,0,0.6))"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    ) : (
                      <MotionHeading
                        key={`title-${currentSlide.id}`}
                        as="h1"
                        size={["lg", "xl", "2xl"]}
                        fontWeight="bold"
                        fontFamily={HEADING_FONT}
                        letterSpacing="tight"
                        textTransform="uppercase"
                        textShadow={TEXT_SHADOW_STYLE}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {" "}
                        {currentSlide.title || currentSlide.name}{" "}
                      </MotionHeading>
                    )}
                  </AnimatePresence>
                </Box>
                {/* Meta Info */}
                <MotionFlex
                  direction="row"
                  wrap="wrap"
                  gapX={4}
                  gapY={1}
                  mb={4}
                  fontFamily={BODY_FONT}
                  fontSize={["xs", "sm"]}
                  textShadow={TEXT_SHADOW_STYLE}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
                    },
                  }}
                >
                  {" "}
                  <MotionBox
                    variants={{
                      hidden: { opacity: 0, y: 10, skewX: -5 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        skewX: 0,
                        transition: { duration: 0.4 },
                      },
                    }}
                  >
                    <Flex align="center" color={MUTED_TEXT_COLOR}>
                      {" "}
                      <BsCalendarDate
                        style={{ marginRight: "5px", color: ACCENT_COLOR }}
                      />{" "}
                      <Text color="white">
                        {(
                          currentSlide.release_date ||
                          currentSlide.first_air_date
                        )?.substring(0, 4)}
                      </Text>{" "}
                    </Flex>
                  </MotionBox>{" "}
                  {(currentSlide.details?.runtime > 0 ||
                    currentSlide.details?.episode_run_time?.[0] > 0) && (
                    <MotionBox
                      variants={{
                        hidden: { opacity: 0, y: 10, skewX: -5 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          skewX: 0,
                          transition: { duration: 0.4 },
                        },
                      }}
                    >
                      <Flex align="center" color={MUTED_TEXT_COLOR}>
                        <FaClock
                          style={{ marginRight: "5px", color: ACCENT_COLOR }}
                        />
                        <Text color="white">
                          {convertMinutesToHours(
                            currentSlide.details?.runtime ||
                              currentSlide.details?.episode_run_time?.[0]
                          )}
                        </Text>
                      </Flex>
                    </MotionBox>
                  )}{" "}
                  {currentSlide.vote_average > 0 && (
                    <MotionBox
                      variants={{
                        hidden: { opacity: 0, y: 10, skewX: -5 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          skewX: 0,
                          transition: { duration: 0.4 },
                        },
                      }}
                    >
                      <Flex align="center" color={MUTED_TEXT_COLOR}>
                        <FaStar
                          style={{ marginRight: "5px", color: ACCENT_COLOR }}
                        />
                        <Text fontWeight="bold" color="white">
                          {currentSlide.vote_average?.toFixed(1)}
                        </Text>
                      </Flex>
                    </MotionBox>
                  )}{" "}
                </MotionFlex>
                {/* Typing Effect Description (mb already increased inside component) */}
                <TypingEffect
                  key={`desc-${currentSlide.id}`}
                  text={truncateText(currentSlide.overview, 150)}
                  speed={25}
                />
                {/* Buttons (Adjust delay based on faster typing speed) */}
                <MotionFlex
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay:
                          truncateText(currentSlide.overview, 150)?.length *
                            0.025 +
                          0.4,
                      },
                    }, // Adjusted delay based on speed=25ms
                  }}
                  initial="hidden"
                  animate="visible"
                  direction={{ base: "column", sm: "row" }}
                  gap={3}
                  width={{ base: "100%", sm: "auto" }}
                >
                  <Box w={{ base: "100%", sm: "150px" }}>
                    <SketchButton primary size="md" onClick={() => {}}>
                      <Flex align="center" justify="center">
                        <FaPlay
                          style={{ marginRight: "8px", fontSize: "0.8em" }}
                        />{" "}
                        Trailer
                      </Flex>
                    </SketchButton>
                  </Box>
                  <Box w={{ base: "100%", sm: "150px" }}>
                    <Link
                      to={`/${currentSlide.media_type}/${currentSlide.id}`}
                      style={{ width: "100%" }}
                    >
                      <SketchButton size="md">
                        <Flex align="center" justify="center">
                          <FaInfoCircle
                            style={{ marginRight: "8px", fontSize: "0.9em" }}
                          />{" "}
                          Details
                        </Flex>
                      </SketchButton>
                    </Link>
                  </Box>
                </MotionFlex>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Box>

        {/* === Bottom Section (Horizontal Poster Grid - COMMENTED OUT) === */}

        {slidesData.length > 1 && (
          <Box width="100%" mt={{ base: 6, md: 8 }}>
            <PosterSelectorGrid
              slides={slidesData}
              currentIndex={currentIndex}
              onSelect={handleSelectSlide}
              isHoveringGrid={isHoveringGrid}
              accentColor={ACCENT_COLOR}
            />
          </Box>
        )}
      </Flex>{" "}
      {/* End Centered Content Wrapper */}
      {/* Navigation Dots (Placed Relatively Below Content Wrapper) */}
      {/* Need explicit bottom spacing relative to viewport OR content block */}
      {slidesData.length > 1 && (
        <Flex
          position="relative" // Can be relative now its spacing controlled by content block height + margin
          zIndex={5}
          gap={3}
          mt={{ base: 6, md: 8 }} // Space below the main content area
          mb={{ base: 4, md: 6 }} // Ensure some space from viewport bottom edge
        >
          {slidesData.map((_, index) => (
            <MotionBox
              key={`dot-${index}`}
              as="button"
              w="10px"
              h="10px"
              bg={
                currentIndex === index ? ACCENT_COLOR : "rgba(255,255,255,0.25)"
              }
              border={
                currentIndex === index
                  ? `1px solid ${ACCENT_COLOR}`
                  : "1px solid transparent"
              }
              onClick={() => handleSelectSlide(index)}
              cursor="pointer"
              borderRadius="1px"
              initial={false}
              animate={{
                scale: currentIndex === index ? 1.2 : 0.9,
                opacity: currentIndex === index ? 1 : 0.7,
              }}
              whileHover={{ scale: 1.3, bg: ACCENT_COLOR, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 15 }}
              aria-label={`Go to slide ${index + 1}`}
              boxShadow={
                currentIndex === index
                  ? `0 0 6px 1px ${ACCENT_COLOR}77`
                  : "none"
              }
            />
          ))}
        </Flex>
      )}
      {/* Navigation Arrows (Absolute, viewport edges - unchanged) */}
      {slidesData.length > 1 && (
        <>
          <MotionBox
            position="absolute"
            top="50%"
            left={{ base: "5px", md: "20px", lg: "30px" }}
            transform="translateY(-50%)"
            zIndex={10}
            width={{ base: "36px", md: "44px" }}
          >
            <SketchButton
              onClick={handlePrevWithReset}
              size="sm"
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </SketchButton>
          </MotionBox>
          <MotionBox
            position="absolute"
            top="50%"
            right={{ base: "5px", md: "20px", lg: "30px" }}
            transform="translateY(-50%)"
            zIndex={10}
            width={{ base: "36px", md: "44px" }}
          >
            <SketchButton
              onClick={handleNextWithReset}
              size="sm"
              aria-label="Next slide"
            >
              <FaChevronRight />
            </SketchButton>
          </MotionBox>
        </>
      )}
      <Flex mt={10} justifyContent="center" alignItems="center" height={"100%"}>
        {/* Streaming Services Scroll - Now appears after the hero */}
        <InfiniteStreamingScroll
          watchProviders={watchProviders}
          headingFont={headingFont}
          accentColor={accentColor}
        />
      </Flex>
    </Flex> // End Outermost Container Flex
  );
};

export default SketchyHeroSlider;
 