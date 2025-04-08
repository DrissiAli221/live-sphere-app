import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Image,
  Text,
  Heading,
  Badge,
  Button, // Using standard Chakra Button
  Spinner,
  // Removed useTheme
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

// --- Assume these are imported/available ---
// Make sure these paths are correct for your project structure
import {
  fetchTrending,
  fetchDetails,
  fetchMovieImages,
  baseImageOriginal,
  // baseImageLow, // Optional: Use lower res for initial load?
} from "@/services/api";
import { truncateText, convertMinutesToHours } from "@/utils/helper";

// --- Define Motion Components ---
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionHeading = motion(Heading);
// --- End Motion Components ---

// --- Define Theme Constants Directly ---
const BASE_BG = "#0A0A14"; // Slightly deeper blue/black
const ACCENT_COLOR = "#FACC15"; // Vibrant Yellow (Tailwind Yellow 400)
const ACCENT_GLOW = `0 0 15px ${ACCENT_COLOR}`; // Glow effect for accents
const GRADIENT_OVERLAY = `linear-gradient(to top, ${BASE_BG} 5%, rgba(10, 10, 20, 0.7) 40%, rgba(10, 10, 20, 0) 100%)`; // Smoother, starts from base
const MUTED_TEXT_COLOR = "gray.400"; // Slightly lighter muted
const HEADING_FONT = "'Poppins', sans-serif"; // Modern, rounded sans-serif
const BODY_FONT = "'Inter', sans-serif"; // Clean sans-serif for body
// --- End Theme Constants ---

// --- Animation Variants ---
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98, // Add a subtle scale for more pop
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1, // Scale back to normal
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98, // Scale down slightly on exit
  }),
};

const slideTransition = {
  x: { type: "spring", stiffness: 280, damping: 30 }, // Slightly softer spring
  opacity: { duration: 0.3 },
  scale: { duration: 0.4, ease: [0.17, 0.67, 0.83, 0.67] }, // Custom ease for scale
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};
// --- End Animation Variants ---

const SmoothHeroSlider = () => {
  // State Hooks
  const [slidesData, setSlidesData] = useState([]);
  const [[page, direction], setPage] = useState([0, 0]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchSliderData = async () => {
      setLoading(true);
      try {
        // Fetch trending data (e.g., top 7 movies/TV shows for the week)
        const trendingData = await fetchTrending("week", 1);
        const potentialSlides =
          trendingData
            ?.filter(
              (item) =>
                item.backdrop_path && // Ensure backdrop exists
                (item.media_type === "movie" || item.media_type === "tv") // Filter for movies/TV
            )
            .slice(0, 7) || // Limit to 7 slides
          [];

        if (potentialSlides.length > 0) {
          // Fetch additional details (like runtime, full logos) for each potential slide
          const slidesWithDetails = await Promise.all(
            potentialSlides.map(async (item) => {
              try {
                const [detailsData, imagesData] = await Promise.all([
                  fetchDetails(item.media_type, item.id), // Fetch runtime, genres etc.
                  fetchMovieImages(item.media_type, item.id), // Fetch logos
                ]);
                return {
                  ...item,
                  details: detailsData,
                  images: imagesData,
                  // genreNames: item.genre_ids.map(String), // Keep if needed, otherwise remove
                };
              } catch (error) {
                console.warn(
                  `Failed fetch details for slide ${item.id}:`,
                  error
                );
                // Return item even if details fail, so slider doesn't break
                return { ...item, details: null, images: null };
              }
            })
          );
          setSlidesData(slidesWithDetails);
        } else {
          setSlidesData([]); // No slides found
        }
      } catch (error) {
        console.error("Error fetching slider data:", error);
        setSlidesData([]); // Handle fetch error
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };
    fetchSliderData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Navigation & Helper Functions ---

  // Function to change the slide page
  const paginate = useCallback(
    (newDirection) => {
      if (!slidesData || slidesData.length <= 1) return; // Don't paginate if 0 or 1 slide
      // Calculate next page index, wrapping around using modulo
      const nextPage =
        (page + newDirection + slidesData.length) % slidesData.length;
      setPage([nextPage, newDirection]);
    },
    [page, slidesData]
  );

  // Function to go directly to a specific slide index (used by dots)
  const goToSlide = useCallback(
    (slideIndex) => {
      if (!slidesData || slidesData.length <= 1) return;
      const newDirection = slideIndex > page ? 1 : slideIndex < page ? -1 : 0;
      setPage([slideIndex, newDirection]);
    },
    [page, slidesData]
  );

  // Function to find the best logo (prefer English PNG)
  const getEnglishLogo = useCallback((logos) => {
    if (!logos || logos.length === 0) return null;
    // Prioritize English PNG logos
    const pngLogo = logos.find(
      (l) => l.iso_639_1 === "en" && l.file_path?.toLowerCase().endsWith(".png")
    );
    if (pngLogo) return pngLogo;
    // Fallback to any English logo
    const enLogo = logos.find((l) => l.iso_639_1 === "en");
    if (enLogo) return enLogo;
    // Fallback to SVG if no suitable PNG/EN found
    const svgLogo = logos.find((l) =>
      l.file_path?.toLowerCase().endsWith(".svg")
    );
    if (svgLogo) return svgLogo;
    // Fallback to the first logo in the list
    return logos[0];
  }, []);

  // Check if a valid logo exists for the current slide
  const hasValidLogo = useCallback(
    (item) =>
      item?.images?.logos?.length > 0 &&
      getEnglishLogo(item.images.logos)?.file_path,
    [getEnglishLogo]
  );

  // Derived state for the current slide index and data
  const slideIndex =
    slidesData.length > 0
      ? ((page % slidesData.length) + slidesData.length) % slidesData.length
      : 0;
  const currentSlide = slidesData[slideIndex];

  // --- Loading / Empty State Rendering ---
  if (loading) {
    return (
      <Flex align="center" justify="center" w="100vw" h="100vh" bg={BASE_BG}>
        <Spinner
          size="xl"
          color={ACCENT_COLOR} // Use constant
          thickness="4px"
          speed="0.7s"
          emptyColor="gray.700" // More contrast
        />
      </Flex>
    );
  }

  if (!slidesData || slidesData.length === 0) {
    return (
      <Flex align="center" justify="center" w="100vw" h="100vh" bg={BASE_BG}>
        <Text color="whiteAlpha.800" fontFamily={BODY_FONT}>
          {" "}
          {/* Use constant */}
          No trending content available right now.
        </Text>
      </Flex>
    );
  }

  // --- Main Component Render ---
  return (
    <Box position="relative" w="100vw" h="100vh" bg={BASE_BG} overflow="hidden">
      {" "}
      {/* Use constant */}
      {/* === Animated Background Container === */}
      <AnimatePresence initial={false} custom={direction}>
        <MotionBox
          key={page} // Use page key for background transition sync
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ ...slideTransition, duration: 0.8 }} // Slightly slower transition for background smoothness
          position="absolute"
          inset="0"
          _after={{
            // The gradient overlay using pseudo-element
            content: `""`,
            position: "absolute",
            inset: 0,
            bg: GRADIENT_OVERLAY, // Use constant
            zIndex: 1, // Ensure gradient is above image but below content
          }}
        >
          {currentSlide?.backdrop_path && ( // Conditionally render image
            <MotionImage
              src={`${baseImageOriginal}${currentSlide.backdrop_path}`}
              alt={`Backdrop for ${currentSlide.title || currentSlide.name}`}
              objectFit="cover"
              objectPosition="center"
              w="100%"
              h="100%"
              // Optional: Subtle Ken Burns Effect
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0.8 }}
              transition={{ duration: 8, ease: "linear" }} // Slow continuous zoom/pan
            />
          )}
        </MotionBox>
      </AnimatePresence>
      {/* === Content Container (Text, Buttons, etc.) === */}
      {/* Use mode="wait" to ensure old content exits before new enters */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <MotionBox
          key={page + "-content"} // Separate key for content animation independence
          custom={direction}
          initial="hidden" // Uses contentVariants for entry animation
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }} // Quick fade out for content
          position="relative" // Stay within the flow but allow zIndex
          zIndex={2} // Content is above the gradient overlay
          w="100%"
          h="100%"
          display="flex"
          alignItems="flex-end" // Align content to bottom
          justifyContent="center" // Center horizontally
          pb={{ base: 24, md: 28, lg: 32 }} // Increased padding bottom for dots/space
          px={{ base: 4, md: 8, lg: 16 }} // Horizontal padding
        >
          {/* Max width container for content */}
          <Box width="100%" maxWidth="1200px" mx="auto">
            {/* Flex container for the content block */}
            <MotionFlex
              direction="column"
              color="white" // Default text color
              alignSelf="flex-start" // Align block to the start (left)
              maxWidth={{ base: "100%", md: "75%", lg: "65%" }} // Control content width
              variants={contentVariants} // Parent variant to orchestrate children
            >
              {/* --- Badge --- */}
              <motion.div variants={contentVariants} custom={1}>
                {" "}
                {/* Stagger child 1 */}
                <Badge
                  bg={ACCENT_COLOR} // Use constant
                  color="black"
                  borderRadius="full" // Modern rounded style
                  px={4}
                  py={1.5}
                  fontSize="sm"
                  fontWeight="600"
                  fontFamily={HEADING_FONT} // Use constant
                  display="inline-flex" // Allows icon and text alignment
                  alignItems="center"
                  mb={5} // Margin bottom
                  boxShadow={ACCENT_GLOW} // Use constant glow effect
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {/* Conditional Icon */}
                  {currentSlide.media_type === "movie" ? (
                    <BiCameraMovie
                      style={{ marginRight: "8px", fontSize: "1.1em" }}
                    />
                  ) : (
                    <BiTv style={{ marginRight: "8px", fontSize: "1.1em" }} />
                  )}
                  Trending Now
                </Badge>
              </motion.div>

              {/* --- Logo or Title --- */}
              <motion.div variants={contentVariants} custom={2}>
                {" "}
                {/* Stagger child 2 */}
                <Box mb={6} alignSelf="flex-start">
                  {hasValidLogo(currentSlide) ? (
                    // Display Logo if available
                    <MotionImage
                      key={`logo-${currentSlide.id}`} // Ensure re-render on slide change
                      src={`${baseImageOriginal}${
                        getEnglishLogo(currentSlide.images?.logos).file_path
                      }`}
                      alt={`${currentSlide.title || currentSlide.name} logo`}
                      maxH={["70px", "100px", "140px"]} // Responsive logo height
                      objectFit="contain"
                      filter="drop-shadow(2px 3px 5px rgba(0,0,0,0.5))" // Enhanced shadow
                    />
                  ) : (
                    // Display Title Text if no logo
                    <MotionHeading
                      as="h1"
                      fontSize={["3xl", "5xl", "6xl"]} // Large, responsive heading
                      fontWeight="700" // Bold
                      textShadow="2px 2px 6px rgba(0,0,0,0.7)" // Readability shadow
                      fontFamily={HEADING_FONT} // Use constant
                      letterSpacing="tight"
                      lineHeight="1.1" // Tighter line height for large fonts
                    >
                      {currentSlide.title || currentSlide.name}
                    </MotionHeading>
                  )}
                </Box>
              </motion.div>

              {/* --- Meta Information (Year, Runtime, Rating) --- */}
              <motion.div variants={contentVariants} custom={3}>
                {" "}
                {/* Stagger child 3 */}
                <Flex
                  direction="row" // Always horizontal
                  alignItems="center"
                  flexWrap="wrap" // Allow wrapping on smaller screens
                  gapX={5} // Horizontal gap
                  gapY={2} // Vertical gap when wrapped
                  mb={6} // Margin bottom
                  fontSize="md" // Base meta font size
                  fontFamily={BODY_FONT} // Use constant
                >
                  {/* Release Year */}
                  <Flex align="center" color={MUTED_TEXT_COLOR}>
                    {" "}
                    {/* Use constant */}
                    <BsCalendarDate
                      style={{ marginRight: "8px", color: ACCENT_COLOR }}
                    />{" "}
                    {/* Use constant */}
                    <Text color="whiteAlpha.900" fontWeight="500">
                      {(
                        currentSlide.release_date || currentSlide.first_air_date
                      )?.substring(0, 4) || "N/A"}
                    </Text>
                  </Flex>

                  {/* Runtime */}
                  {(currentSlide.details?.runtime > 0 ||
                    currentSlide.details?.episode_run_time?.[0] > 0) && (
                    <Flex align="center" color={MUTED_TEXT_COLOR}>
                      {" "}
                      {/* Use constant */}
                      <FaClock
                        style={{ marginRight: "8px", color: ACCENT_COLOR }}
                      />{" "}
                      {/* Use constant */}
                      <Text color="whiteAlpha.900" fontWeight="500">
                        {convertMinutesToHours(
                          // Use helper function
                          currentSlide.details?.runtime ||
                            currentSlide.details?.episode_run_time?.[0]
                        )}
                      </Text>
                    </Flex>
                  )}

                  {/* Rating */}
                  {currentSlide.vote_average > 0 && (
                    <Flex align="center" color={MUTED_TEXT_COLOR}>
                      {" "}
                      {/* Use constant */}
                      <FaStar
                        style={{ marginRight: "8px", color: ACCENT_COLOR }}
                      />{" "}
                      {/* Use constant */}
                      <Text fontWeight="600" color="white">
                        {" "}
                        {/* Make rating stand out */}
                        {currentSlide.vote_average?.toFixed(1)}
                        {/* Optional: Add context like / 10 */}
                        <Text
                          as="span"
                          fontSize="sm"
                          color={MUTED_TEXT_COLOR}
                          ml={1}
                        >
                          / 10
                        </Text>
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </motion.div>

              {/* --- Overview Text --- */}
              <motion.div variants={contentVariants} custom={4}>
                {" "}
                {/* Stagger child 4 */}
                <Text
                  fontSize={["md", "lg"]} // Responsive overview font size
                  lineHeight="1.7" // Improved readability
                  color="gray.200" // Slightly muted white
                  noOfLines={3} // Truncate long overviews
                  mb={8} // More space before buttons
                  fontFamily={BODY_FONT} // Use constant
                  maxW="90%" // Prevent text stretching too wide
                >
                  {truncateText(currentSlide.overview, 160)}{" "}
                  {/* Use helper function */}
                </Text>
              </motion.div>

              {/* --- Action Buttons --- */}
              <motion.div
                variants={contentVariants}
                custom={5}
                style={{ width: "100%" }}
              >
                {" "}
                {/* Stagger child 5 */}
                {/* Flex container for buttons (column on base, row on sm+) */}
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  gap={4}
                  width={{ base: "100%", sm: "auto" }}
                >
                  {/* Primary Button (Play/Watch) */}
                  <Button
                    leftIcon={<FaPlay />}
                    bg={ACCENT_COLOR} // Use constant
                    color="black"
                    borderRadius="full" // Rounded style
                    size="lg" // Larger button
                    fontFamily={HEADING_FONT} // Use constant
                    fontWeight="600"
                    px={8} // Horizontal padding
                    boxShadow={ACCENT_GLOW} // Use constant glow
                    transition="all 0.3s ease" // Smooth transitions
                    _hover={{
                      // Hover styles
                      bg: "#FDE047", // Lighter yellow (Tailwind Yellow 300)
                      transform: "translateY(-2px)", // Subtle lift
                      boxShadow: `0 4px 20px ${ACCENT_COLOR}`, // Enhanced glow on hover
                    }}
                    _active={{
                      // Active (click) styles
                      bg: ACCENT_COLOR, // Back to base accent
                      transform: "translateY(0px)", // Reset lift
                    }}
                    onClick={() =>
                      console.log(
                        "Play/Watch Now:",
                        currentSlide.id,
                        currentSlide.media_type
                      )
                    } // Placeholder action
                    width={{ base: "100%", sm: "auto" }} // Full width on mobile
                  >
                    Watch Now
                  </Button>

                  {/* Secondary Button (Details) - Wrapped in Link */}
                  <Link
                    to={`/${currentSlide.media_type}/${currentSlide.id}`} // Dynamic link to details page
                    style={{ width: "100%", display: "block" }} // Ensure Link takes up button space on mobile
                  >
                    <Button
                      leftIcon={<FaInfoCircle />}
                      variant="outline" // Outline style
                      borderColor="whiteAlpha.500" // Semi-transparent border
                      color="white"
                      borderRadius="full" // Rounded style
                      size="lg" // Match primary button size
                      fontFamily={HEADING_FONT} // Use constant
                      fontWeight="500" // Slightly less bold than primary
                      px={8} // Match primary padding
                      width={{ base: "100%", sm: "auto" }} // Full width on mobile
                      transition="all 0.3s ease" // Smooth transitions
                      _hover={{
                        // Hover styles
                        bg: "whiteAlpha.200", // Subtle background tint
                        borderColor: "whiteAlpha.800", // Brighter border
                        transform: "translateY(-2px)", // Subtle lift
                      }}
                      _active={{
                        // Active (click) styles
                        bg: "whiteAlpha.300", // Slightly darker tint
                        transform: "translateY(0px)", // Reset lift
                      }}
                    >
                      More Info
                    </Button>
                  </Link>
                </Flex>
              </motion.div>
            </MotionFlex>
          </Box>
        </MotionBox>
      </AnimatePresence>
      {/* === Navigation Arrows === */}
      {slidesData.length > 1 &&
        [FaChevronLeft, FaChevronRight].map((Icon, index) => (
          <Box
            key={index}
            as="button"
            position="absolute"
            top="50%" // Center vertically
            transform="translateY(-50%)" // Exact vertical centering
            // Position left or right based on index
            left={index === 0 ? { base: 2, md: 5 } : undefined}
            right={index === 1 ? { base: 2, md: 5 } : undefined}
            zIndex={3} // Above content, below potential modals
            cursor="pointer"
            p={3} // Padding for larger click area
            borderRadius="full" // Rounded style
            bg="blackAlpha.600" // Semi-transparent background
            color="white" // Icon color
            transition="all 0.2s ease-out" // Smooth transitions
            _hover={{
              // Hover styles
              bg: "whiteAlpha.300", // Lighter background
              transform: "translateY(-50%) scale(1.1)", // Re-apply translateY with scale
            }}
            _active={{
              // Active (click) styles
              bg: "whiteAlpha.400",
              transform: "translateY(-50%) scale(1.05)", // Re-apply translateY with scale
            }}
            onClick={() => paginate(index === 0 ? -1 : 1)} // Call paginate with direction
            aria-label={index === 0 ? "Previous Slide" : "Next Slide"}
          >
            <Icon size={22} /> {/* Arrow icon */}
          </Box>
        ))}
      {/* === Navigation Dots === */}
      {slidesData.length > 1 && (
        <Flex
          position="absolute"
          bottom={{ base: "25px", md: "40px" }} // Position from bottom
          left="50%" // Center horizontally
          transform="translateX(-50%)" // Exact horizontal centering
          zIndex={3} // Above content
          gap={3} // Spacing between dots
        >
          {slidesData.map((_, index) => (
            <Box
              key={`dot-${index}`}
              as="button"
              w="12px" // Dot width
              h="12px" // Dot height
              borderRadius="full" // Circular dots
              // Active dot styling
              bg={slideIndex === index ? ACCENT_COLOR : "whiteAlpha.400"} // Use constant accent or muted alpha
              opacity={1} // Always full opacity, rely on color
              boxShadow={slideIndex === index ? ACCENT_GLOW : "none"} // Glow on active dot
              transition="all 0.3s ease" // Smooth transitions
              _hover={{
                // Hover styles (for non-active dots mostly)
                bg: slideIndex === index ? ACCENT_COLOR : "whiteAlpha.700",
                transform: "scale(1.1)", // Slight scale effect
              }}
              onClick={() => goToSlide(index)} // Navigate to specific slide
              aria-label={`Go to slide ${index + 1}`} // Accessibility label
            />
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default SmoothHeroSlider;
