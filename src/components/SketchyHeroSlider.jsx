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
  HStack,
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
// Ensure these paths are correct for your project structure
import {
  fetchTrending,
  fetchDetails,
  fetchMovieImages,
  baseImageOriginal,
} from "@/services/api";
import { truncateText, convertMinutesToHours } from "@/utils/helper";
import { watchProviders } from "@/utils/watchProviders";

// --- Constants ---

// API Image Base Paths
const baseImagePosterW342 = "https://image.tmdb.org/t/p/w342";

// Layout & Behavior
const AUTOPLAY_INTERVAL = 14000; // Slower autoplay (14 seconds)
const MAX_CONTENT_WIDTH = "1100px"; // Max width of centered content

// Theming & Colors
const BASE_BG = "#0A0A14"; // Main dark background
const ACCENT_COLOR = "#FFEC44"; // Primary yellow accent
const MUTED_TEXT_COLOR = "gray.300"; // For less important text
const GRADIENT_OVERLAY = `linear-gradient(rgba(10,10,20,0.3) 0%, rgba(10,10,20,0.6) 40%, rgba(10,10,20,0.85) 75%, ${BASE_BG} 98%)`; // Backdrop gradient

// Fonts
const HEADING_FONT = "'Courier New', monospace";
const BODY_FONT = "'Courier New', monospace";
const TEXT_SHADOW_STYLE = `1px 1px 1px rgba(0,0,0,0.8)`; // Default text shadow

// Button Styles (Sketchy/Square Theme)
const BUTTON_ACCENT_DARK = "#1A1A1A"; // Dark text/elements on primary button
const BUTTON_SECONDARY_BG = "rgba(30, 30, 35, 0.9)"; // Background for secondary buttons
const BUTTON_SECONDARY_FG = "#E0E0E0"; // Foreground (text) for secondary buttons
const BUTTON_SQUARE_BORDER = `1.5px solid ${BUTTON_ACCENT_DARK}`; // Button border
const BUTTON_SHADOW_COLOR = "rgba(0, 0, 0, 0.85)"; // Offset shadow color
const BUTTON_HOVER_GLOW = `rgba(255, 236, 68, 0.2)`; // Subtle glow on hover

// Background Effects
const NOISE_OPACITY = 0.06;
const SCANLINES_OPACITY = 0.18;
const VIGNETTE_INTENSITY = 0.45;
const NOISE_BG_URL =
  "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVדהזה/v7+/v7+/v7+////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+///+/v7+/v7+/v7+/v7+/v7+/s8wT4AAAAF3RSTlPF48P117/Aw869zKrQuLOqphh5i59qcOMVsAAAAJZJREFUOI1jZobgMAIALAwMAyMWBgYW0AYsDLSAAVDCx/8D5cAxkvtR40lAFBl6vA5I7gBxQ7FBAmTk4b+DBwARHyG1DQEIGbQAAYQAHj6HjwxEHpXjF8AMDEQgUMDDhx4A9UikwMhoAAAUY4KHAACAEs6HF4HgQpAQAyNggkAJzAGYWFkAMjIKAEQz0mkwAACMQAAA1AUQAASYAFhI07u0aF4UAAAAAElFTkSuQmCC)";

// Local aliases for convenience if needed elsewhere
const headingFont = HEADING_FONT;
const accentColor = ACCENT_COLOR;

// --- Framer Motion Primitives ---
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// ========================================================================
// --- Reusable Components (Implementations from previous refinement) ---
// ========================================================================

/**
 * Animated Typing Effect for Text
 */
const TypingEffect = React.memo(({ text, speed = 35 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = text || "";
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setTypingComplete(false);
    if (!fullText) {
      setTypingComplete(true);
      return;
    }
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + fullText.charAt(i));
      i++;
      if (i >= fullText.length) {
        clearInterval(intervalId);
        setTypingComplete(true);
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [fullText, speed]);

  return (
    <MotionText
      fontSize={["sm", "md", "md"]}
      color="gray.200"
      noOfLines={3}
      lineHeight="tall"
      mb={6}
      fontFamily={BODY_FONT}
      textShadow={TEXT_SHADOW_STYLE}
      minHeight={{ base: "4.5em", md: "4em" }}
      _after={
        !typingComplete
          ? {
              content: '"▋"',
              display: "inline-block",
              animation: "blink 0.8s steps(1) infinite",
              opacity: 1,
              color: ACCENT_COLOR,
              marginLeft: "3px",
              fontWeight: "normal",
              position: "relative",
              top: "0.05em",
            }
          : undefined
      }
      sx={{ "@keyframes blink": { "50%": { opacity: 0 } } }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {displayedText}
      <span style={{ visibility: "hidden" }}> </span>
    </MotionText>
  );
});

/**
 * Animated Scribble Line Effect for Hover States
 */
const ScribbleEffect = React.memo(({ isActive, color = ACCENT_COLOR }) => (
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
      overflow: "visible",
    }}
    animate={isActive ? "visible" : "hidden"}
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.75 } }}
  >
    <motion.path
      d="M10,60 C40,30 90,80 150,50 C210,20 260,70 290,40"
      fill="transparent"
      stroke={color}
      strokeWidth="1.8"
      strokeDasharray="5 3"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        isActive ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
      }
      transition={{ duration: 0.6, ease: "circOut" }}
      style={{ strokeDashoffset: 0 }}
    />
  </motion.svg>
));

/**
 * Internal structure of the Sketch Button (styled box).
 * Managed by the SketchButton wrapper.
 */
const SketchButtonInternal = React.memo(
  ({ children, primary = false, size = "md", animate, ...rest }) => {
    const height = size === "sm" ? 8 : 10;
    const fontSize = size === "sm" ? "xs" : "sm";
    const px = size === "sm" ? 3 : 4;

    return (
      <Box
        as="button"
        position="relative"
        width="100%"
        height={height}
        minH={height}
        bg={primary ? ACCENT_COLOR : BUTTON_SECONDARY_BG}
        color={primary ? BUTTON_ACCENT_DARK : BUTTON_SECONDARY_FG}
        border={BUTTON_SQUARE_BORDER}
        borderRadius="1px"
        fontWeight="bold"
        zIndex={2}
        transition="transform 0.1s ease-out, background 0.15s ease-in-out"
        _hover={{ textDecoration: "none" }}
        _focusVisible={{
          outline: `2px dashed ${ACCENT_COLOR}`,
          outlineOffset: "3px",
        }}
        _disabled={{
          opacity: 0.4,
          cursor: "not-allowed",
          filter: "grayscale(95%)",
          pointerEvents: "none",
        }}
        fontFamily={HEADING_FONT}
        fontSize={fontSize}
        textTransform="uppercase"
        letterSpacing="wider"
        px={px}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        {...rest}
      >
        <Box as="span" position="relative" zIndex={1}>
          {" "}
          {children}{" "}
        </Box>
        <MotionBox // Underline element
          variants={{
            rest: { width: "0%" },
            hover: {
              width: "90%",
              transition: { duration: 0.25, ease: "easeOut" },
            },
          }}
          animate={animate}
          style={{
            position: "absolute",
            bottom: "4px",
            left: "5%",
            height: "1.5px",
            background: primary ? BUTTON_ACCENT_DARK : ACCENT_COLOR,
            zIndex: 3,
          }}
        />
      </Box>
    );
  }
);

/**
 * Animated Square Button with Sketchy Effects (Shadow, Corner Doodles, Scribble).
 * Wraps SketchButtonInternal.
 */
const SketchButton = ({
  children,
  primary = false,
  onClick = () => {},
  disabled = false,
  isLoading = false,
  size = "md",
  iconSpacing = 2,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = disabled || isLoading;

  // Animation variants
  const containerVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.96, y: 1.5 },
  };
  const cornerVariants = {
    rest: { scale: 0, opacity: 0 },
    hover: {
      scale: 1.1,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 12 },
    },
  };
  const shadowVariants = {
    rest: { x: 1.5, y: 1.5, opacity: 0.75, filter: "blur(0.5px)" },
    hover: {
      x: 2.5,
      y: 2.5,
      opacity: 1,
      filter: `drop-shadow(0 0 5px ${BUTTON_HOVER_GLOW})`,
    },
  };
  const cornerPositions = useMemo(
    () => [
      { top: -2.5, left: -2.5, borderW: "1.5px 0 0 1.5px" },
      /* ... other 3 positions */ {
        bottom: -2.5,
        right: -2.5,
        borderW: "0 1.5px 1.5px 0",
      },
    ],
    []
  );

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
      transition={{ type: "spring", stiffness: 450, damping: 15 }}
    >
      {/* Shadow */}
      <MotionBox
        position="absolute"
        inset="0"
        bg={BUTTON_SHADOW_COLOR}
        borderRadius="1px"
        zIndex={0}
        variants={shadowVariants}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
      {/* Corner Doodles */}
      {!isDisabled &&
        cornerPositions.map((pos, idx) => (
          <MotionBox
            key={idx}
            position="absolute"
            width="7px"
            height="7px"
            border={`1.5px solid ${ACCENT_COLOR}`}
            borderRadius="none"
            zIndex={5}
            variants={cornerVariants}
            style={{ ...pos }}
          />
        ))}
      {/* Internal Button Structure */}
      <SketchButtonInternal
        primary={primary}
        onClick={onClick}
        disabled={isDisabled}
        size={size}
        animate={isHovered && !isDisabled ? "hover" : "rest"}
        style={{
          transform:
            isHovered && !isDisabled ? "translate(-1.5px, -1.5px)" : "none",
        }}
        {...rest}
      >
        <Flex align="center" justify="center" gap={iconSpacing}>
          {" "}
          {isLoading ? (
            <Spinner size="xs" speed="0.9s" thickness="2px" />
          ) : (
            children
          )}{" "}
        </Flex>
        {/* Scribble Effect on Hover */}
        <ScribbleEffect
          isActive={isHovered && !isDisabled}
          color={primary ? BUTTON_ACCENT_DARK : ACCENT_COLOR}
        />
      </SketchButtonInternal>
    </MotionBox>
  );
};

/**
 * Animated Squiggly Underline Component.
 */
const SquigglyLine = React.memo(
  ({
    color = ACCENT_COLOR,
    delay = 0,
    thickness = 1.5,
    dasharray = "4 2",
    duration = 0.8,
  }) => (
    <MotionBox
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration, delay, ease: "easeInOut" }}
      style={{ position: "relative", lineHeight: "0" }}
    >
      <svg
        width="100%"
        height="6"
        viewBox="0 0 300 6"
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
      >
        <motion.path
          d="M0,3 C25,1 50,5 75,3 S125,1 150,5 S200,1 225,5 S275,1 300,3"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={dasharray}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: delay + 0.1, ease: "circOut" }}
        />
      </svg>
    </MotionBox>
  )
);

/**
 * Infinitely Scrolling Logo Carousel for Streaming Providers.
 */
const InfiniteStreamingScroll = React.memo(
  ({ watchProviders = [], headingFont, accentColor }) => {
    const duplicatedProviders = useMemo(
      () =>
        watchProviders.length > 0
          ? [
              ...watchProviders,
              ...watchProviders,
              ...watchProviders,
              ...watchProviders,
            ]
          : [],
      [watchProviders]
    );
    const animationDuration = 100;

    if (!watchProviders || watchProviders.length === 0) {
      return null; // Don't render if no providers
    }

    return (
      <Box
        width="100vw"
        position="relative"
        left="50%"
        transform="translateX(-50%)"
        overflow="hidden"
        bg={BASE_BG}
        borderTop={"1px solid rgba(255, 255, 255, 0.1)"} 
        borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}
        py={4}
        aria-label="Streaming provider logos"
        zIndex={20}
      >
        <Box
          className="infinite-slider-container"
          position="relative"
          width="100%"
          overflow="hidden"
        >
          <MotionFlex
            className="infinite-slider-track"
            width="max-content"
            gap={10}
            animate={{
              x: [
                0,
                `-${
                  ((100 * watchProviders.length) / duplicatedProviders.length) *
                  2
                }%`,
              ],
            }}
            transition={{
              x: {
                duration: animationDuration,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              },
            }}
          >
            {duplicatedProviders.map((provider, index) => (
              <Flex
                key={`provider-${provider.name}-${index}`}
                minWidth="100px"
                alignItems="center"
                justifyContent="center"
                h="50px"
                title={provider.name}
                opacity={0.7}
                _hover={{
                  opacity: 1,
                  transform: "scale(1.05)",
                  transition: "opacity 0.2s, transform 0.2s",
                }}
              >
                <Image
                  src={provider.src}
                  alt={`${provider.name} logo`}
                  maxH="35px"
                  maxW="90px"
                  objectFit="contain"
                  loading="lazy"
                />
              </Flex>
            ))}
          </MotionFlex>
        </Box>
        {/* Fade Gradients */}
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width={{ base: "40px", md: "80px" }}
          pointerEvents="none"
          bgGradient={`linear(to-r, ${BASE_BG}, transparent)`}
          zIndex={1}
        />
        <Box
          position="absolute"
          right={0}
          top={0}
          bottom={0}
          width={{ base: "40px", md: "80px" }}
          pointerEvents="none"
          bgGradient={`linear(to-l, ${BASE_BG}, transparent)`}
          zIndex={1}
        />
      </Box>
    );
  }
);

// ========================================================================
// --- Main Hero Slider Component ---
// ========================================================================

const SketchyHeroSlider = () => {
  // --- State ---
  const [slidesData, setSlidesData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false); // For pausing autoplay
  const autoplayIntervalRef = useRef(null);

  // --- Data Fetching ---
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
                item.poster_path &&
                (item.media_type === "movie" || item.media_type === "tv") &&
                item.vote_average > 5
            )
            .slice(0, 10) || [];
        if (potentialSlides.length === 0) {
          setSlidesData([]);
          setLoading(false);
          return;
        }

        const detailedSlidesPromises = potentialSlides.map(async (item) => {
          try {
            const [detailsResult, imagesResult] = await Promise.allSettled([
              fetchDetails(item.media_type, item.id),
              fetchMovieImages(item.media_type, item.id),
            ]);
            return {
              ...item,
              details:
                detailsResult.status === "fulfilled"
                  ? detailsResult.value
                  : null,
              images:
                imagesResult.status === "fulfilled" ? imagesResult.value : null,
            };
          } catch (err) {
            console.warn(
              `Error fetching details for ${item.media_type} ${item.id}:`,
              err
            );
            return { ...item, details: null, images: null };
          }
        });
        const slidesWithDetailsRaw = await Promise.all(detailedSlidesPromises);
        const finalSlides = slidesWithDetailsRaw.filter(Boolean).slice(0, 7); // Limit to 7 slides

        setSlidesData(finalSlides);
        if (finalSlides.length > 0 && currentIndex >= finalSlides.length) {
          setCurrentIndex(0);
        } // Reset index if out of bounds
      } catch (error) {
        console.error("Failed to fetch trending data for Hero Slider:", error);
        setSlidesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSliderData();
  }, []); // Run only on mount

  // --- Navigation & Autoplay Logic ---
  const stopAutoplay = useCallback(() => {
    clearInterval(autoplayIntervalRef.current);
    autoplayIntervalRef.current = null;
  }, []);
  const goToIndex = useCallback(
    (index) => {
      if (slidesData.length > 0) {
        setCurrentIndex((index + slidesData.length) % slidesData.length);
      }
    },
    [slidesData.length]
  );

  const handleNext = useCallback(
    () => goToIndex(currentIndex + 1),
    [currentIndex, goToIndex]
  );

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (slidesData.length > 1) {
      autoplayIntervalRef.current = setInterval(
        () => handleNext(),
        AUTOPLAY_INTERVAL
      );
    }
  }, [slidesData.length, handleNext, stopAutoplay]);
  const handlePrev = useCallback(
    () => goToIndex(currentIndex - 1),
    [currentIndex, goToIndex]
  );
  const handleSelectSlide = useCallback(
    (index) => {
      stopAutoplay();
      goToIndex(index); /* Optional: Restart timer after delay */
    },
    [goToIndex, stopAutoplay]
  );
  const handlePrevWithReset = useCallback(() => {
    handlePrev();
    if (!isHoveringInteractive) startAutoplay();
  }, [handlePrev, isHoveringInteractive, startAutoplay]);
  const handleNextWithReset = useCallback(() => {
    handleNext();
    if (!isHoveringInteractive) startAutoplay();
  }, [handleNext, isHoveringInteractive, startAutoplay]);

  // Effect to manage autoplay based on hover and data
  useEffect(() => {
    if (slidesData.length > 1 && !isHoveringInteractive) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return stopAutoplay;
  }, [slidesData.length, isHoveringInteractive, startAutoplay, stopAutoplay]);

  // --- Derived Data & Helpers ---
  const currentSlide = useMemo(
    () => slidesData[currentIndex],
    [slidesData, currentIndex]
  );
  const getEnglishLogo = useCallback((logos) => {
    if (!logos?.length) return null;
    const pngEn = logos.find(
      (l) => l.iso_639_1 === "en" && l.file_path?.endsWith(".png")
    );
    return (
      pngEn ||
      logos.find((l) => l.file_path?.endsWith(".png")) ||
      logos.find((l) => l.iso_639_1 === "en") ||
      logos[0]
    );
  }, []);
  const currentBackdropPath = useMemo(
    () =>
      currentSlide?.images?.backdrops?.find((b) => b.iso_639_1 === null)
        ?.file_path ||
      currentSlide?.backdrop_path ||
      currentSlide?.images?.backdrops?.[0]?.file_path,
    [currentSlide]
  );
  const hasValidLogo = useMemo(
    () => !!getEnglishLogo(currentSlide?.images?.logos)?.file_path,
    [currentSlide, getEnglishLogo]
  );

  // --- Loading / Empty States ---
  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        w="100vw"
        h={{ base: "85vh", md: "90vh" }}
        bg={BASE_BG}
      >
        <Spinner size="xl" color={ACCENT_COLOR} />
        <Text ml={4} color={MUTED_TEXT_COLOR} fontFamily={BODY_FONT}>
          Loading Interface...
        </Text>
      </Flex>
    );
  }
  if (!slidesData || slidesData.length === 0) {
    return (
      <Flex
        align="center"
        justify="center"
        w="100vw"
        h={{ base: "85vh", md: "90vh" }}
        bg={BASE_BG}
      >
        <Box textAlign="center" color={MUTED_TEXT_COLOR} fontFamily={BODY_FONT}>
          <Text fontSize="xl" fontWeight="bold" color={ACCENT_COLOR} mb={2}>
            Signal Lost
          </Text>
          <Text>Data feed interrupted.</Text>
        </Box>
      </Flex>
    );
  }

  // --- Stagger Animation Variants ---
  const staggerChildrenVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };
  const itemFadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // --- Component Render ---
  return (
    <Flex
      direction="column"
      w="100vw"
      minHeight={{ base: "85vh", md: "90vh", lg: "95vh" }}
      pt={{ base: "15vh", md: "18vh", lg: "20vh" }}
      bg={BASE_BG}
      overflow="hidden"
      position="relative"
      alignItems="center"
      justifyContent="flex-start"
      onMouseEnter={() => setIsHoveringInteractive(true)}
      onMouseLeave={() => setIsHoveringInteractive(false)}
    >
      {/* Background Effects */}
      <Box position="absolute" inset={0} zIndex={0} aria-hidden="true">
        {/* Noise/Scanlines Overlay */}
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
        {/* Animated Backdrop */}
        <AnimatePresence initial={false} mode="sync">
          {currentBackdropPath && (
            <MotionBox
              key={`backdrop-${currentSlide?.id}`}
              position="absolute"
              inset={0}
              bgImage={`url(${baseImageOriginal}${currentBackdropPath})`}
              bgSize="cover"
              bgPosition="center 25%"
              bgRepeat="no-repeat"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </AnimatePresence>
        {/* Gradient & Vignette */}
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
      {/* Centered Content Area */}
      <Flex
        direction="column"
        position="relative"
        zIndex={4}
        width="full"
        maxWidth={MAX_CONTENT_WIDTH}
        px={{ base: 4, md: 6, lg: 8 }}
        alignItems="center"
      >
        {/* Animated Slide Details */}
        <AnimatePresence mode="wait">
          {currentSlide && (
            <MotionFlex
              key={`content-${currentSlide.id}`}
              direction="column"
              color="white"
              alignItems={{ base: "center", md: "flex-start" }}
              textAlign={{ base: "center", md: "left" }}
              width={{ base: "100%", lg: "70%", xl: "65%" }}
              mr={{ lg: "auto" }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
              variants={staggerChildrenVariants}
            >
              {/* Badge */}
              <MotionBox mb={4} variants={itemFadeUpVariants}>
                {" "}
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
                  textTransform="uppercase"
                  border={`1px solid ${BUTTON_ACCENT_DARK}`}
                >
                  {" "}
                  {currentSlide.media_type === "movie" ? (
                    <BiCameraMovie style={{ marginRight: "6px" }} />
                  ) : (
                    <BiTv style={{ marginRight: "6px" }} />
                  )}{" "}
                  Trending{" "}
                </Badge>{" "}
              </MotionBox>
              {/* Logo / Title */}
              <MotionBox
                mb={5}
                minH={{ base: "50px", md: "70px", lg: "90px" }}
                w="full"
                maxW={{ lg: "80%" }}
                variants={itemFadeUpVariants}
              >
                <AnimatePresence mode="wait">
                  {hasValidLogo ? (
                    <MotionImage
                      key={`logo-${currentSlide.id}`}
                      src={`${baseImageOriginal}${
                        getEnglishLogo(currentSlide.images?.logos).file_path
                      }`}
                      alt={`${currentSlide.title || currentSlide.name} logo`}
                      maxH={["60px", "75px", "90px"]}
                      objectFit="contain"
                      filter="drop-shadow(1px 2px 3px rgba(0,0,0,0.6))"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      mx={{ base: "auto", md: "0" }}
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
                      textShadow={
                        TEXT_SHADOW_STYLE + `, 0 0 3px ${ACCENT_COLOR}1A`
                      }
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
              </MotionBox>
              {/* Meta Info */}
              <MotionBox variants={itemFadeUpVariants} w="full">
                <HStack
                  spacing={4}
                  wrap="wrap"
                  justify={{ base: "center", md: "flex-start" }}
                  mb={4}
                  fontFamily={BODY_FONT}
                  fontSize={["xs", "sm"]}
                  textShadow={TEXT_SHADOW_STYLE}
                >
                  {(currentSlide.release_date ||
                    currentSlide.first_air_date) && (
                    <Flex align="center" title="Year">
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
                  )}
                  {(currentSlide.details?.runtime > 0 ||
                    currentSlide.details?.episode_run_time?.[0] > 0) && (
                    <Flex align="center" title="Runtime">
                      {" "}
                      <FaClock
                        style={{ marginRight: "5px", color: ACCENT_COLOR }}
                      />{" "}
                      <Text color="white">
                        {convertMinutesToHours(
                          currentSlide.details?.runtime ||
                            currentSlide.details?.episode_run_time?.[0]
                        )}
                      </Text>{" "}
                    </Flex>
                  )}
                  {currentSlide.vote_average > 0 && (
                    <Flex align="center" title="Rating">
                      {" "}
                      <FaStar
                        style={{ marginRight: "5px", color: ACCENT_COLOR }}
                      />{" "}
                      <Text fontWeight="bold" color="white">
                        {currentSlide.vote_average?.toFixed(1)}
                      </Text>{" "}
                    </Flex>
                  )}
                </HStack>
              </MotionBox>
              {/* Overview */}
              {currentSlide.overview && (
              <Box w="full" maxW="80%" h={100} >
                  <TypingEffect
                  key={`desc-${currentSlide.id}`}
                  text={truncateText(currentSlide.overview, 150)}
                  speed={35}
                />
              </Box>
              )}
              {/* Buttons */}
              <MotionBox w="full" variants={itemFadeUpVariants}>
                <HStack
                  spacing={3}
                  alignItems="center"
                  justify={{ base: "center", md: "flex-start" }}
                  width={{ base: "100%", sm: "auto" }}
                  flexDirection={{ base: "column", sm: "row" }}
                  gap={{ base: 3, sm: 3 }}
                  mt={2}
                >
                  <Box w={{ base: "100%", sm: "150px" }}>
                    {" "}
                    <SketchButton
                      primary
                      size="md"
                      onClick={() => console.log("Play Trailer...")}
                    >
                      <Flex align="center" justify="center">
                        {" "}
                        <FaPlay
                          style={{ marginRight: "8px", fontSize: "0.8em" }}
                        />{" "}
                        Trailer{" "}
                      </Flex>
                    </SketchButton>{" "}
                  </Box>
                  <Box w={{ base: "100%", sm: "150px" }}>
                    {" "}
                    <Link
                      to={`/${currentSlide.media_type}/${currentSlide.id}`}
                      style={{ width: "100%" }}
                    >
                      <SketchButton size="md">
                        <Flex align="center" justify="center">
                          {" "}
                          <FaInfoCircle
                            style={{ marginRight: "8px", fontSize: "0.9em" }}
                          />{" "}
                          Details{" "}
                        </Flex>
                      </SketchButton>
                    </Link>{" "}
                  </Box>
                </HStack>
              </MotionBox>
            </MotionFlex>
          )}
        </AnimatePresence>
      </Flex>{" "}
      {/* End Content Area */}
      {/* Spacer fills remaining vertical space */}
      <Box flexGrow={1} />
      {/* Dots Navigation and Bottom Separator */}
      <Box
        width="full"
        position="relative"
        zIndex={5}
        // borderBottom="1.5px solid rgba(255, 255, 255, 0.15)"
        pb={{ base: 3, md: 4 }}
      >
        {slidesData.length > 1 && (
          <Flex justifyContent="center" gap={3} pt={{ base: 4, md: 5 }}>
            {slidesData.map((_, index) => (
              <MotionBox
                key={`dot-${index}`}
                as="button"
                aria-label={`Go to slide ${index + 1}`}
                w="10px"
                h="10px"
                bg={
                  currentIndex === index
                    ? ACCENT_COLOR
                    : "rgba(255,255,255,0.3)"
                }
                border={`1.5px solid ${
                  currentIndex === index
                    ? ACCENT_COLOR
                    : "rgba(255,255,255,0.1)"
                }`}
                onClick={() => handleSelectSlide(index)}
                cursor="pointer"
                borderRadius="2px"
                initial={false}
                animate={{
                  scale: currentIndex === index ? 1.25 : 0.9,
                  opacity: currentIndex === index ? 1 : 0.7,
                }}
                whileHover={{
                  scale: 1.35,
                  bg: ACCENT_COLOR,
                  opacity: 1,
                  border: `1.5px solid ${ACCENT_COLOR}`,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
                boxShadow={
                  currentIndex === index
                    ? `0 0 7px 2px ${ACCENT_COLOR}77`
                    : "0 1px 1px rgba(0,0,0,0.5)"
                }
              />
            ))}
          </Flex>
        )}
      </Box>
      {/* Absolute Positioned Navigation Arrows */}
      {slidesData.length > 1 && (
        <>
          <MotionBox
            position="absolute"
            top="50%"
            left={{ base: "8px", md: "20px", lg: "30px" }}
            transform="translateY(-50%)"
            zIndex={10}
            width={{ base: "36px", md: "44px" }}
          >
            <SketchButton
              onClick={handlePrevWithReset}
              size="sm"
              aria-label="Previous slide"
            >
              {" "}
              <FaChevronLeft />{" "}
            </SketchButton>
          </MotionBox>
          <MotionBox
            position="absolute"
            top="50%"
            right={{ base: "8px", md: "20px", lg: "30px" }}
            transform="translateY(-50%)"
            zIndex={10}
            width={{ base: "36px", md: "44px" }}
          >
            <SketchButton
              onClick={handleNextWithReset}
              size="sm"
              aria-label="Next slide"
            >
              {" "}
              <FaChevronRight />{" "}
            </SketchButton>
          </MotionBox>
        </>
      )}
      {/* Infinite Scroll Section */}
      {watchProviders?.length > 0 && (
        <InfiniteStreamingScroll
          watchProviders={watchProviders}
          headingFont={headingFont}
          accentColor={accentColor}
        />
      )}
    </Flex> // End Outermost Flex Container
  );
};

export default SketchyHeroSlider;
