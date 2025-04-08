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
  Skeleton, // We will use this for loading state
  Icon,
} from "@chakra-ui/react";

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Service/Util/Component Imports ---
import {
  baseImageW500,
  baseImageOriginal, // Keep both in case backdrop is needed as fallback
  fetchRecommendations,
} from "@/services/api"; // !!! UPDATE THIS PATH AS NEEDED !!!

// --- Icon Imports ---
import {
  FaFilm,
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
  FaStar,
  FaCalendarAlt, // Added for date
} from "react-icons/fa";

// ========================================================================
// === MOTION COMPONENT ALIASES ===
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionDiv = motion.div; // For generic motion divs like shadow, underline
const MotionImage = motion(Image);

// ========================================================================
// === THEME CONSTANTS ===
// ========================================================================
const themeColors = {
  black: "#0a0a0a",
  darkBg: "#141414", // Card background fallback / skeleton base
  yellow: "#FFEC44", // Main accent
  border: "#303030", // Default dark border
  borderHover: "#FFEC44", // Hover border = accent
  shadow: "#000000", // PURE BLACK for the offset shadow
  text: "whiteAlpha.900",
  subtleText: "whiteAlpha.600", // Lighter grey for less emphasis
  gradientStart: "rgba(10, 10, 10, 0.95)", // Dark gradient start
  gradientEnd: "rgba(10, 10, 10, 0.0)", // Fade to transparent
};

const sketchyFontStyle = {
  fontFamily: "'Courier New', monospace",
  textTransform: "uppercase",
  letterSpacing: "tight", // Tighter can look more 'blocky'
};

// ========================================================================
// === HELPER & THEMED COMPONENTS (Defined within this file) ===
// ========================================================================

// --- Scribble Effect ---
const ScribbleEffect = ({ isActive, color = themeColors.yellow }) => (
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
      zIndex: 10, // Above content, below absolute corners?
      opacity: 0.5,
    }}
    aria-hidden="true" // Decorative
    animate={isActive ? "visible" : "hidden"}
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
  >
    <motion.path
      d="M10,50 C50,30 100,70 150,50 C200,30 250,60 290,50" // Example path
      fill="transparent"
      stroke={color}
      strokeWidth="1.5" // Thinner scribble
      strokeDasharray="4,4" // Adjust dash
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        isActive
          ? { pathLength: 1, opacity: 0.4 } // Lower opacity for subtlety
          : { pathLength: 0, opacity: 0 }
      }
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{ strokeDashoffset: 0 }}
    />
  </motion.svg>
);

// --- Sketch Button Wrapper --- (Handles hover, animations, shadow, composition)
const SketchButton = ({
  children,
  primary = false,
  onClick = () => {},
  disabled = false,
  isLoading = false,
  size = "md", // Allows 'sm' or 'md'
  type = "button",
  iconSpacing = 2,
  ariaLabel, // Explicitly pass aria-label for accessibility
  ...rest // Pass down other props like aria-label
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Define all variants outside of render to prevent recreation
  // Commented out underline as it might not fit small nav buttons
  const underlineVariants = {
    rest: { width: 0 },
    hover: { width: "90%", transition: { duration: 0.3 } },
  };

  // Shadow Variants - Placed here for encapsulation
  const shadowVariants = {
    rest: {
      x: 3,
      y: 3,
      opacity: 0.8,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      x: 5,
      y: 5,
      opacity: 1,
      transition: { duration: 0.2, ease: "easeIn" },
    }, // Consistent hover shadow offset
  };

  // Corner Doodle Variants - Placed here
  const cornerVariants = {
    rest: { scale: 0, opacity: 0 },
    hover: { scale: 1, opacity: 0.8 },
  };

  const isDisabled = disabled || isLoading;

  // Adjust styles based on size prop
  let buttonStyles;
  if (size === "sm") {
    buttonStyles = { fontSize: "xs", px: 2, py: 1, minH: 7 }; // smaller button size
  } else {
    buttonStyles = { fontSize: "sm", px: 3, py: 1.5, minH: 9 }; // default ('md') button size
  }

  return (
    <MotionDiv
      style={{ position: "relative", width: "auto", display: "inline-block" }} // Allow sizing to content
      onHoverStart={() => !isDisabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={!isDisabled ? "hover" : "rest"}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      initial="rest"
      animate={isHovered && !isDisabled ? "hover" : "rest"} // Control animation state
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      aria-label={ariaLabel} // Apply accessibility label
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === "Enter" || e.key === " ")) onClick();
      }} // Basic keyboard activation
    >
      {/* Order matters for z-index appearance */}

      {/* 1. Thick Black Shadow (Bottom Layer) */}
      {!isDisabled && (
        <MotionDiv
          variants={shadowVariants} // Use defined variants
          style={{
            position: "absolute",
            inset: 0,
            background: themeColors.shadow, // Pure black
            zIndex: -1, // Behind everything else
            borderRadius: "none", // Square
          }}
          transition={{ duration: 0.2 }} // Smooth shadow transition independent of hover state change
        />
      )}

      {/* 2. Scribble Effect (Can be above shadow, below button) */}
      <ScribbleEffect
        isActive={isHovered && !isDisabled}
        color={primary ? themeColors.black : themeColors.yellow}
      />

      {/* 3. Corner Doodles (Appear on top during hover) */}
      {!isDisabled &&
        ["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos, idx) => (
          <MotionDiv
            key={pos}
            initial="rest" // Explicit initial state needed if parent animates
            variants={cornerVariants} // Use defined variants
            transition={{
              // Custom transition per corner
              duration: 0.2,
              delay: idx * 0.04, // Stagger appearance
              type: "spring",
              stiffness: 450,
              damping: 15, // Springy effect
            }}
            style={{
              position: "absolute",
              width: "8px",
              height: "8px",
              border: `2px solid ${themeColors.yellow}`, // Accent color
              zIndex: 5, // Ensure they are visible
              borderRadius: "none", // SQUARE
              // Specific border sides for corner effect
              ...(pos === "topLeft"
                ? { top: -4, left: -4, borderWidth: "2px 0 0 2px" }
                : pos === "topRight"
                ? { top: -4, right: -4, borderWidth: "2px 2px 0 0" }
                : pos === "bottomLeft"
                ? { bottom: -4, left: -4, borderWidth: "0 0 2px 2px" }
                : { bottom: -4, right: -4, borderWidth: "0 2px 2px 0" }),
            }}
            aria-hidden="true"
          />
        ))}

      {/* 4. Actual Button Content using Box directly */}
      <Box
        as="button"
        display="inline-flex" // Use inline-flex for centering content
        alignItems="center"
        justifyContent="center"
        position="relative"
        bg={primary ? themeColors.yellow : "rgba(40,40,40,0.8)"} // Use theme color
        color={primary ? themeColors.black : themeColors.text} // Contrast text color
        border="1px solid #000" // Keep black border for contrast against shadow
        borderRadius="none" // SQUARE
        fontWeight={primary ? "bold" : "medium"}
        zIndex={2} // Above shadow
        transition="transform 0.2s, background 0.2s"
        _hover={{ textDecoration: "none" }}
        _focusVisible={{
          outline: `2px solid ${themeColors.yellow}`,
          outlineOffset: "2px",
        }}
        _disabled={{
          opacity: 0.5,
          cursor: "not-allowed",
          filter: "grayscale(80%)",
        }}
        fontFamily={sketchyFontStyle.fontFamily}
        {...buttonStyles} // Apply dynamic size styles
        isDisabled={isDisabled} // Use Chakra's disabled prop handling
        onClick={onClick}
        type={type}
        {...rest} // Spread remaining props
      >
        {isLoading ? (
          <Spinner
            size="xs"
            speed="0.8s"
            color={primary ? themeColors.black : themeColors.yellow}
          />
        ) : (
          children // Render children directly (Icon etc.)
        )}
      </Box>

      {/* 5. Underline Animation Placeholder (commented out) */}
      {/*
             <MotionDiv
                 variants={underlineVariants}
                 style={{ position: "absolute", bottom: "4px", left: "5%", height: "2px", background: primary ? themeColors.black : themeColors.yellow, zIndex: 3, }}
                 aria-hidden="true"
              />
              */}
    </MotionDiv>
  );
};

// --- Squiggly Line ---
const SquigglyLine = React.memo(
  ({
    color = themeColors.yellow, // Default to accent color
    delay = 0,
    thickness = 2, // Slightly thicker default
    dasharray = "4,3", // Bolder dash default
  }) => (
    <MotionDiv
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration: 0.35, delay }} // Slightly slower duration
      style={{ position: "relative", lineHeight: "0" }} // Prevent extra space
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="4" // Viewbox height slightly more than thickness
        viewBox="0 0 300 4" // Viewbox width allows path definition
        preserveAspectRatio="none"
        style={{ display: "block" }} // Prevents potential inline spacing issues
      >
        {/* Wobbly path */}
        <motion.path
          d="M0,2 C25,1 50,3 75,2 C100,1 125,3 150,2 C175,1 200,3 225,2 C250,1 275,3 300,2"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={dasharray}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: "linear" }} // Slower path draw
        />
      </svg>
    </MotionDiv>
  )
);

// --- Section Heading Component ---
// Simplified version without the "See More" link
const SectionHeading = React.memo(
  ({
    children,
    accentColor = themeColors.yellow, // Default from theme
    headingFont = sketchyFontStyle.fontFamily, // Default from theme
  }) => (
    <Box mb={8} position="relative" display="inline-block">
      {" "}
      {/* Display inline-block makes bottom border only fit text width */}
      <Heading
        as="h2"
        size="lg" // Keep heading size prominent
        color={themeColors.text} // Use main text color
        fontFamily={headingFont}
        textTransform="uppercase"
        letterSpacing="wider" // Wider spacing for headings
        textShadow="1px 1px 3px rgba(0,0,0,0.6)" // Defined shadow for depth
      >
        {children}
      </Heading>
      {/* Squiggly Line Underneath */}
      <Box position="absolute" bottom="-12px" left="0" w="70px">
        {" "}
        {/* Adjust width/position as needed */}
        <SquigglyLine color={accentColor} />
      </Box>
    </Box>
  )
);

// --- Skeleton Card (for Loading State) ---
// Accepts width/height which are now responsive objects/arrays
const SkeletonCard = ({ width, height }) => (
  <Box w={width} h={height} position="relative" flexShrink={0}>
    {/* Background Skeleton Box */}
    <Skeleton
      w="100%"
      h="100%"
      borderRadius="none"
      startColor={themeColors.darkBg} // Darker skeleton
      endColor={themeColors.border} // Even darker end color
      speed={1.0} // Slower speed
    />
    {/* Optional: Darker inner area for depth */}
    <Box
      position="absolute"
      inset="3px" // Slightly inset
      background={themeColors.darkBg}
      zIndex={1}
      borderRadius="none"
    />
    {/* Shadow Placeholder (doesn't need animation) */}
    <Box
      position="absolute"
      inset="0"
      bg="rgba(0,0,0,0.5)" // Semi-transparent shadow placeholder
      transform="translate(3px, 3px)" // Match resting shadow offset
      zIndex={-1}
      borderRadius="none"
    />
  </Box>
);

// --- Recommendation Card ---
// Accepts width/height which are now responsive objects/arrays
const RecommendationCard = React.memo(
  ({ item, itemType, cardWidth, cardHeight }) => {
    const [isHovered, setIsHovered] = useState(false);
    const destinationType = item.media_type || itemType; // Use specific type if available (from multi searches), else fallback
    const title = item.title || item.name || "Untitled";
    // Prefer poster, fallback to backdrop ONLY if poster is missing
    const imagePath = item.poster_path || item.backdrop_path;
    // Use w500 for poster, but original might be better for backdrops used as posters
    const imageBase = item.poster_path ? baseImageW500 : baseImageOriginal;

    // Shadow animation variants for the card itself (moves card and shadow together)
    const cardShadowVariants = {
      rest: {
        x: 4, // Resting shadow offset X
        y: 4, // Resting shadow offset Y
        opacity: 0.8, // Shadow opacity
        scale: 1, // Card scale
        transition: { duration: 0.3, ease: "easeOut" },
      },
      hover: {
        x: 7, // Hover shadow offset X (more pronounced)
        y: 7, // Hover shadow offset Y
        opacity: 1, // Shadow full opacity
        scale: 1.03, // Card scales up slightly
        transition: { duration: 0.2, ease: "easeIn" },
      },
    };

    return (
      // Outer container handles hover state, link, and applies the main animation variant
      <MotionBox
        as={RouterLink} // Use RouterLink for SPA navigation
        to={`/${destinationType}/${item.id}`}
        position="relative"
        // Apply responsive dimensions received from parent
        w={cardWidth}
        h={cardHeight} // Ensure square aspect ratio is maintained via props
        flexShrink={0} // Prevent squashing in the Flex container
        title={title} // Tooltip for accessibility/full title
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial="rest"
        animate={isHovered ? "hover" : "rest"}
        variants={cardShadowVariants} // Apply the combined scale/shadow animation here
        style={{ textDecoration: "none", display: "block" }} // Link styling resets
      >
        {/* 1. The Thick Black Square Shadow (Animated via parent MotionBox) */}
        {/* This div exists solely to BE the shadow */}
        <MotionDiv
          style={{
            position: "absolute",
            inset: 0,
            background: themeColors.shadow, // PURE BLACK
            zIndex: 1, // Behind main content
            borderRadius: "none", // SQUARE
          }}
          // This div *inherits* the transform (x, y, scale) and opacity from the parent MotionBox via variants
        />
        {/* 2. Main Content Box (Poster, Info Overlay) */}
        <MotionBox
          position="absolute" // Positioned relative to the outer MotionBox
          top={0}
          left={0}
          w="100%"
          h="100%"
          border="2px solid" // Slightly thicker border for sketch style
          borderColor={isHovered ? themeColors.borderHover : themeColors.border} // Yellow border on hover
          borderRadius="none" // SQUARE
          overflow="hidden" // Clip image and overlay
          bg={themeColors.darkBg} // Background for placeholder state
          zIndex={2} // Above shadow
          transition="border-color 0.2s ease-in-out" // Animate border color change only
        >
          {/* Image or Placeholder */}
          {imagePath ? (
            <MotionImage
              src={`${imageBase}${imagePath}`}
              alt={`Poster for ${title}`}
              w="100%"
              h="100%"
              objectFit="cover" // Cover the square area perfectly
              initial={{ opacity: 0 }} // Fade in image on load
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              // Optional: Slightly desaturate/darken non-hovered posters for focus effect
              filter={isHovered ? "none" : "saturate(0.8) brightness(0.95)"}
            />
          ) : (
            // Placeholder shown if no image available
            <Flex
              w="100%"
              h="100%"
              align="center"
              justify="center"
              direction="column"
              p={2}
            >
              <Icon
                as={FaFilm}
                boxSize="30px"
                color={themeColors.subtleText}
                mb={2}
              />
              <Text
                color={themeColors.subtleText}
                fontSize="xs"
                textAlign="center"
                noOfLines={3}
                {...sketchyFontStyle}
                letterSpacing="normal"
              >
                {title}
              </Text>
            </Flex>
          )}

          {/* Hover Overlay with Info - Appears on hover */}
          <AnimatePresence>
            {isHovered && (
              <MotionFlex
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                bgGradient={`linear(to-t, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`} // Gradient overlay for text readability
                p={3} // Padding for content within overlay
                direction="column" // Stack text vertically
                initial={{ opacity: 0, y: 10 }} // Animation: fade and slide up
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }} // Animation: fade and slide down
                transition={{ duration: 0.25 }}
                zIndex={3} // Above image
                pointerEvents="none" // Allow hover events to pass through to card image if needed
              >
                {/* Title */}
                <Text
                  color={themeColors.text}
                  fontSize="sm"
                  fontWeight="bold"
                  noOfLines={2} // Allow title to wrap once
                  lineHeight="short"
                  {...sketchyFontStyle} // Apply sketchy font style to title
                >
                  {title}
                </Text>
                {/* Meta Info (Year, Rating) */}
                <HStack spacing={3} mt={1.5} align="center">
                  {item.release_date && ( // Show Year if available
                    <Flex
                      align="center"
                      title={`Released: ${item.release_date}`}
                    >
                      <Icon
                        as={FaCalendarAlt}
                        color={themeColors.yellow}
                        boxSize="10px"
                        mr={1}
                      />
                      <Text
                        fontSize="xs"
                        color={themeColors.subtleText}
                        fontWeight="medium"
                      >
                        {item.release_date.substring(0, 4)}{" "}
                        {/* Display Year Only */}
                      </Text>
                    </Flex>
                  )}
                  {item.vote_average > 0 && ( // Show Rating if available and non-zero
                    <Flex
                      align="center"
                      title={`Rating: ${item.vote_average.toFixed(1)} / 10`}
                    >
                      <Icon
                        as={FaStar}
                        color={themeColors.yellow}
                        boxSize="10px"
                        mr={1}
                      />
                      <Text
                        fontSize="xs"
                        color={themeColors.subtleText}
                        fontWeight="medium"
                      >
                        {item.vote_average.toFixed(1)}{" "}
                        {/* Display rating to 1 decimal place */}
                      </Text>
                    </Flex>
                  )}
                </HStack>
              </MotionFlex>
            )}
          </AnimatePresence>

          {/* Yellow Accent Scribble on Hover */}
          {/* Positioned inside the main content box */}
          <ScribbleEffect isActive={isHovered} color={themeColors.yellow} />
        </MotionBox>{" "}
        {/* End Main Content Box */}
      </MotionBox> // End Outer Link/Animation Box
    );
  }
);

// ========================================================================
// === RecommendationsSection Component (Main Logic) ===
// ========================================================================

function RecommendationsSection({ itemId, itemType, themeProps = {} }) {
  // State for recommendations data and loading status
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // State and Ref for horizontal scrolling
  const [scrollPos, setScrollPos] = useState(0); // Track scroll position if needed elsewhere
  const [showPrev, setShowPrev] = useState(false); // Visibility of previous button
  const [showNext, setShowNext] = useState(false); // Visibility of next button
  const scrollRef = useRef(null); // Ref for the scrollable container

  // Extract theme props passed from parent or use defaults defined above
  const {
    accentColor = themeColors.yellow,
    headingFont = sketchyFontStyle.fontFamily,
    mutedTextColor = themeColors.subtleText,
  } = themeProps;

  // --- Define Responsive Card Size directly using Chakra's object syntax ---
  // This determines the dimensions of each recommendation card at different breakpoints
  const cardSize = { base: "140px", sm: "160px", md: "170px", lg: "180px" };

  // --- Data Fetching ---
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    setLoadingRecs(true);
    setShowPrev(false); // Reset button visibility on new data load
    setShowNext(false);

    fetchRecommendations(itemType, itemId)
      .then((data) => {
        if (isMounted) {
          // Filter recommendations to include only those with *some* image (poster or backdrop)
          const validRecs =
            data?.filter((rec) => rec.poster_path || rec.backdrop_path) || [];
          setRecommendations(validRecs.slice(0, 16)); // Limit the number of recommendations shown
          // Use a timeout to check scroll button visibility *after* the DOM might have updated with new items
          // This helps ensure calculations based on scrollWidth/clientWidth are accurate.
          setTimeout(updateScrollButtons, 100); // Delay ms might need tuning based on render speed
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch recommendations:", err);
          setRecommendations([]); // Clear recommendations on error
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingRecs(false); // Set loading to false when fetch completes (success or error)
        }
      });

    // Cleanup function to run when the component unmounts or dependencies change
    return () => {
      isMounted = false; // Set flag false so pending async operations don't update state
    };
  }, [itemId, itemType]); // Re-run effect if the itemId or itemType changes

  // --- Scroll Handling Functions ---

  // Function to scroll the container horizontally
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // Calculate scroll amount: scroll by a percentage (e.g., 80%) of the visible width for a substantial jump
      const scrollAmount = container.clientWidth * 0.8;

      container.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount, // Positive for next, negative for prev
        behavior: "smooth", // Enable smooth scrolling animation
      });

      // Since smooth scrolling takes time, update button visibility slightly after scroll initiates
      setTimeout(updateScrollButtons, 300); // Delay allows scroll animation to progress before check
    }
  };

  // Function to check scroll position and update button visibility
  // Uses useCallback to memoize the function, preventing unnecessary re-creation if dependencies don't change
  const updateScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Add a small tolerance (e.g., 5 pixels) for floating point inaccuracies in scroll calculations
      const tolerance = 5;
      const isAtStart = scrollLeft < tolerance;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - tolerance;
      // Check if the content width is actually larger than the visible container width (i.e., is scrolling possible?)
      const canScroll = scrollWidth > clientWidth + tolerance;

      setShowPrev(!isAtStart && canScroll); // Show "Prev" if not at start AND content is scrollable
      setShowNext(!isAtEnd && canScroll); // Show "Next" if not at end AND content is scrollable

      setScrollPos(scrollLeft); // Store current scroll position (optional)
    } else {
      // If ref is not available (e.g., initial render before ref assignment), hide buttons
      setShowPrev(false);
      setShowNext(false);
    }
  }, []); // Dependency array is empty as it only relies on the ref.current's properties

  // --- Effect for Attaching Scroll and Resize Listeners ---
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      // Attach scroll event listener
      container.addEventListener("scroll", updateScrollButtons, {
        passive: true,
      }); // Use passive for performance

      // Attach ResizeObserver to update buttons if container size changes (e.g., window resize)
      const resizeObserver = new ResizeObserver(updateScrollButtons);
      resizeObserver.observe(container);

      // Initial check in case content loads and fits perfectly, or doesn't require scrolling initially
      updateScrollButtons();

      // Cleanup function: remove listeners when component unmounts or dependencies change
      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        resizeObserver.unobserve(container);
      };
    }
  }, [loadingRecs, recommendations.length, updateScrollButtons]); // Re-run when loading finishes, items change (affecting scrollWidth), or callback updates

  // --- Render Logic ---
  return (
    <Box w="100%" position="relative" mb={12}>
      {" "}
      {/* Outer container for the whole section */}
      {/* Section Title */}
      <SectionHeading accentColor={accentColor} headingFont={headingFont}>
        You Might Also Like
      </SectionHeading>
      {/* Container for Scrollable Content + Absolute Buttons */}
      <Box
        position="relative"
        // Add horizontal padding ONLY on medium screens and up to make space for the absolute positioned buttons outside the scroll area
        px={{ base: "0", md: "45px" }}
      >
        {/* The actual scrollable container */}
        <Flex
          ref={scrollRef}
          overflowX="auto" // Enable horizontal scrolling
          overflowY="hidden" // Hide vertical scrollbar just in case
          py={4} // Add some padding top/bottom so card shadows aren't clipped
          // --- Custom Scrollbar Styling (Optional, works in WebKit/Firefox) ---
          css={{
            "&::-webkit-scrollbar": {
              height: "8px", // Set height of the scrollbar
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent", // Hide the track itself
              // Optionally add margin to push scrollbar away from content:
              marginTop: "40px", // Push track down relative to Flex py
              marginBottom: "40px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: themeColors.border, // Use theme border color for thumb
              borderRadius: "none", // Square thumb to match theme
              "&:hover": {
                background: themeColors.subtleText, // Lighter thumb on hover
              },
            },
            // Firefox standard scrollbar styling
            scrollbarWidth: "thin", // Use thin scrollbar style
            scrollbarColor: `${themeColors.border} transparent`, // thumb color, track color
          }}
        >
          {/* STATE 1: Loading Skeletons */}
          {loadingRecs && (
            <HStack spacing={4} px={1} alignItems="stretch">
              {" "}
              {/* Align items to stretch ensures skeletons take full height */}
              {/* Render 6 skeleton cards as placeholders */}
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard
                  key={`skel-${index}`}
                  width={cardSize}
                  height={cardSize}
                /> // Pass responsive size object
              ))}
            </HStack>
          )}

          {/* STATE 2: Display Recommendation Cards */}
          {!loadingRecs && recommendations.length > 0 && (
            // Use HStack for horizontal layout with spacing
            // MinHeight ensures the row doesn't collapse vertically if card size changes responsively before content loads fully
            <HStack
              spacing={4}
              align="stretch"
              px={1}
              minH={{ base: "160px", sm: "180px", md: "190px", lg: "200px" }}
            >
              {" "}
              {/* Approximate min height = cardSize + padding */}
              {recommendations.map((item) => (
                <RecommendationCard
                  key={item.id}
                  item={item}
                  itemType={itemType}
                  cardWidth={cardSize} // Pass responsive size object
                  cardHeight={cardSize} // Pass responsive size object (for SQUARE)
                />
              ))}
            </HStack>
          )}
        </Flex>{" "}
        {/* End Scrollable Flex container */}
        {/* STATE 3: Empty State Message */}
        {!loadingRecs && recommendations.length === 0 && (
          <Text color={mutedTextColor} textAlign="center" py={10} fontSize="sm">
            No recommendations found for this title.
          </Text>
        )}
      </Box>{" "}
      {/* End scroll container wrapper */}
      {/* Scroll Navigation Buttons - Positioned Absolutely */}
      {/* Only show buttons if NOT loading AND there ARE recommendations */}
      {!loadingRecs && recommendations.length > 0 && (
        <>
          {/* Previous Button */}
          <AnimatePresence>
            {showPrev && ( // Conditionally render based on showPrev state
              <MotionBox
                position="absolute"
                // Position vertically centered
                top="50%"
                // Position horizontally: near edge on mobile, outside padding on larger screens
                left={{ base: "5px", md: "0px" }}
                transform="translateY(-50%)" // Adjust vertical position to truly center
                zIndex={10} // Ensure buttons are above scroll content
                // Animation for appearing/disappearing
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                {/* Use the SketchButton component for styling */}
                <SketchButton
                  onClick={() => handleScroll("prev")}
                  size="sm" // Use small size for nav buttons
                  primary={false} // Use secondary style (dark background)
                  disabled={!showPrev} // Disable if already at start (redundant check, but safe)
                  ariaLabel="Scroll previous recommendations" // Important for accessibility
                  px={2} // Minimal horizontal padding for icon
                  minH={8}
                  minW={8} // Make button more square
                >
                  <Icon as={FaChevronLeft} boxSize={4} /> {/* The icon */}
                </SketchButton>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <AnimatePresence>
            {showNext && ( // Conditionally render based on showNext state
              <MotionBox
                position="absolute"
                top="50%"
                // Position horizontally: near edge on mobile, outside padding on larger screens
                right={{ base: "5px", md: "0px" }}
                transform="translateY(-50%)"
                zIndex={10}
                // Animation
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <SketchButton
                  onClick={() => handleScroll("next")}
                  size="sm"
                  primary={false}
                  disabled={!showNext} // Disable if already at end
                  ariaLabel="Scroll next recommendations"
                  px={2}
                  minH={8}
                  minW={8}
                >
                  <Icon as={FaChevronRight} boxSize={4} />
                </SketchButton>
              </MotionBox>
            )}
          </AnimatePresence>
        </>
      )}{" "}
      {/* End Conditional Buttons Render */}
    </Box> // End Outer container for the whole section
  );
}

export default RecommendationsSection; // Export the main component
