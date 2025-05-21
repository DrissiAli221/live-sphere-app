import React, { useEffect, useState, useMemo } from "react"; // Use useMemo if needed later, removed others
import {
  Box,
  Flex,
  Container,
  Image,
  Text,
  HStack,
  VStack,
  Heading,
  Spinner,
  IconButton,
  SimpleGrid,
  Tabs,
  TabsList,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PiFilmReelFill } from "react-icons/pi";

// --- Services & Utils ---
import {
  baseImageOriginal,
  baseImageW500, // Used for posters in highlight
  fetchDetails,
  fetchGenres,
  fetchTopRated, // For featured section
  fetchTrendingMovies, // For main movie section
  fetchTrendingTVShows, // For main TV section
  fetchPopularNetflixShows, // For Netflix section
} from "@/services/api";
import { watchProviders } from "@/utils/watchProviders";
import {
  getSeasonInfo,
  convertMinutesToHours,
  truncateText,
} from "@/utils/helper";

// --- Components ---
import ContentGrid from "@/components/ContentGrid"; // MAKE SURE THIS IS THE THEMED VERSION
import StreamingServiceSkeleton from "@/components/StreamingServiceSkeleton"; // Used for initial load? (or Spinner)
import SketchyHeroSlider from "@/components/SketchyHeroSlider";
import NetflixBanner from "@/components/NetflixBanner";

// --- Icons ---
import {
  FaInfoCircle,
  FaStar,
  FaClock,
  FaArrowRight,
  FaFilm,
  FaTv,
  FaSearch,
} from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { FaClapperboard } from "react-icons/fa6";
import { BiCameraMovie, BiTv } from "react-icons/bi"; // Used in FeaturedHighlightCard

// ========================================================================
// --- THEME & STYLING VARIABLES ---
// ========================================================================

const BASE_BG = "#0A0A14";
const CARD_BG = "rgba(25, 25, 35, 0.85)";
const ACCENT_COLOR = "#FFEC44";
const BORDER_COLOR = "rgba(255, 255, 255, 0.1)";
const MUTED_TEXT_COLOR = "gray.400";
const HEADING_FONT = "'Courier New', monospace";
const BODY_FONT = "'Courier New', monospace";
// Define Placeholder Image URL - adjust path/text as needed
const PLACEHOLDER_IMAGE = `https://via.placeholder.com/500x750/${BASE_BG.substring(
  1
)}/${ACCENT_COLOR.substring(1)}?text=No+Image`;

// Section Animation Variants
const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.1, 0.7, 0.6, 0.9], delay: 0.1 },
  },
};

// ========================================================================
// --- MOTION COMPONENTS ---
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Defined within this file) ---
// ========================================================================

// --- ScribbleEffect ---
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
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.7 } }}
  >
    <motion.path
      d="M10,50 C50,30 100,70 150,50 C200,30 250,60 290,50"
      fill="transparent"
      stroke={color}
      strokeWidth="2"
      strokeDasharray="5,5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        isActive
          ? { pathLength: 1, opacity: 0.5 }
          : { pathLength: 0, opacity: 0 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ strokeDashoffset: 0 }}
    />
  </motion.svg>
));

// --- SketchButtonInternal ---
const SketchButtonInternal = React.memo(
  ({ children, primary = false, animate, ...rest }) => (
    <Box
      as="button"
      width="100%"
      height="auto"
      minH="10"
      position="relative"
      bg={primary ? ACCENT_COLOR : "rgba(40,40,40,0.85)"}
      color={primary ? "#000" : "#fff"}
      border="1px solid #000"
      borderRadius="1px"
      fontWeight={primary ? "bold" : "medium"}
      zIndex={2}
      transition="transform 0.1s, background 0.15s"
      _hover={{ textDecoration: "none" }}
      _focusVisible={{
        outline: `2px solid ${ACCENT_COLOR}`,
        outlineOffset: "2px",
      }}
      _disabled={{
        opacity: 0.5,
        cursor: "not-allowed",
        filter: "grayscale(80%)",
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
          background: primary ? "black" : ACCENT_COLOR,
          zIndex: 3,
        }}
        animate={animate}
      />
    </Box>
  )
);

// --- SketchButton ---
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
    ...rest
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = disabled || isLoading;
    const fontSize = size === "sm" ? "xs" : "sm";
    const paddingX = size === "sm" ? 3 : 4;
    const minHeight = size === "sm" ? 8 : 10;

    return (
      <MotionBox
        as="div"
        position="relative"
        width="auto" // Changed width to auto for inline use
        display="inline-block" // Allow button to size naturally
        onHoverStart={() => !isDisabled && setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={!isDisabled ? "hover" : "rest"}
        whileTap={!isDisabled ? { scale: 0.97 } : {}}
        initial="rest"
        animate={isHovered && !isDisabled ? "hover" : "rest"}
      >
        <ScribbleEffect
          isActive={isHovered && !isDisabled}
          color={primary ? "black" : ACCENT_COLOR}
        />
        {!isDisabled &&
          ["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos) => (
            <motion.div
              key={pos}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                isHovered
                  ? { scale: 1.1, opacity: 0.9 }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                duration: 0.15,
                type: "spring",
                stiffness: 550,
                damping: 15,
              }}
              style={{
                position: "absolute",
                width: "8px",
                height: "8px",
                border: `1.5px solid ${ACCENT_COLOR}`,
                zIndex: 5,
                borderRadius: "none",
                ...(pos === "topLeft"
                  ? { top: -3, left: -3, borderWidth: "1.5px 0 0 1.5px" }
                  : pos === "topRight"
                  ? { top: -3, right: -3, borderWidth: "1.5px 1.5px 0 0" }
                  : pos === "bottomLeft"
                  ? { bottom: -3, left: -3, borderWidth: "0 0 1.5px 1.5px" }
                  : {
                      bottom: -3,
                      right: -3,
                      borderWidth: "0 1.5px 1.5px 0",
                    }),
              }}
            />
          ))}
        {!isDisabled && (
          <motion.div
            initial={{ opacity: 0.7, x: 2, y: 2 }}
            variants={{
              rest: { x: 2, y: 2, opacity: 0.7 },
              hover: { opacity: 1, x: 3, y: 3 },
            }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              zIndex: -1,
              border: "1px solid rgba(0,0,0,0.6)",
              borderRadius: "1px",
            }}
            transition={{ duration: 0.15 }}
          />
        )}
        <SketchButtonInternal
          primary={primary}
          onClick={onClick}
          disabled={isDisabled}
          minH={minHeight}
          fontSize={fontSize}
          px={paddingX}
          type={type}
          {...rest}
          animate={isHovered && !isDisabled ? "hover" : "rest"}
          style={{
            transform:
              isHovered && !isDisabled ? "translate(-1.5px, -1.5px)" : "none",
            width: "100%" /* Ensure internal takes full width */,
          }}
        >
          <Flex align="center" justify="center" gap={iconSpacing}>
            {isLoading ? <Spinner size="xs" speed="0.8s" /> : children}
          </Flex>
        </SketchButtonInternal>
      </MotionBox>
    );
  }
);

// --- SquigglyLine ---
const SquigglyLine = React.memo(
  ({
    color = ACCENT_COLOR,
    delay = 0,
    thickness = 1.5,
    dasharray = "4,2",
    duration = 0.6,
  }) => (
    <MotionDiv
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration, delay, ease: "easeInOut" }}
      style={{ position: "relative", lineHeight: "0" }}
    >
      <svg
        width="150"
        height="4"
        viewBox="0 0 300 4"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <MotionPath
          d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={dasharray}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: duration * 1.5,
            delay: delay + 0.1,
            ease: "circOut",
          }}
        />
      </svg>
    </MotionDiv>
  )
);

// ========================================================================
// --- HELPER COMPONENTS (Defined within this file) ---
// ========================================================================

// --- SectionHeading ---
// --- SpicedUpSectionHeading ---
const SectionHeading = React.memo(
  ({
    children,
    linkTo = null,
    linkText = "See More",
    iconLeft,
    showDoodle = true,
  }) => (
    <Flex
      justifyContent="space-between"
      alignItems={{ base: "flex-start", md: "center" }} // Align heading block and button
      mb={{ base: 6, md: 8 }} // Increased bottom margin
      flexDirection={{ base: "column", sm: "row" }} // Stack on very small, then row style
      gap={{ base: 4, sm: 3 }} // Spacing between heading block and button
    >
      {/* --- Heading Text & Accent Block --- */}
      <MotionBox
        display="flex" // For Doodle + (Icon + Text + Underline)
        alignItems="center" // Vertically align doodle with text block
        gap={3} // Gap between doodle and the rest
        position="relative" // For potential hover effects, if any
        initial="rest"
        whileHover="hover" // For variants propagation if needed later
      >
        {/* Container for Heading + Underline, allowing doodle to be sibling */}
        <Box position="relative" display="inline-block">
          <Flex alignItems="center" gap={iconLeft ? 2 : 0}>
            {" "}
            {/* For Icon + Heading Text */}
            {iconLeft && (
              <Box
                fontSize={{ base: "lg", md: "xl" }}
                color={ACCENT_COLOR}
                mr={1}
                display="inline-block"
                verticalAlign="middle"
              >
                {iconLeft}
              </Box>
            )}
            <MotionHeading
              as="h2"
              // Keeping original size 'lg' as requested in the component. Could be larger for more "spice"
              // fontSize={{ base: "xl", md: "2xl" }}
              size="lg"
              color="white"
              fontFamily={HEADING_FONT}
              textTransform="uppercase"
              letterSpacing="wider" // More emphasis than "wide"
              initial={{ opacity: 0, y: 12, skewX: "-3deg" }} // Slightly skewed initial
              whileInView={{ opacity: 1, y: 0, skewX: "0deg" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Smoother ease
              // "Spiced up" text shadow
              textShadow={`1px 1px 0px rgba(0,0,0,0.6), 2px 2px 1px ${ACCENT_COLOR}44`}
            >
              {children}
            </MotionHeading>
          </Flex>

          {/* More Prominent Squiggly Line - Positioned under the text */}
          <Box
            position="absolute"
            left="0"
            bottom={{ base: "-8px", md: "-10px" }} // Adjusted for better spacing under text
            width={{ base: "70%", md: "85%" }} // Squiggle covers more of the heading width
            // height needed by SquigglyLine's inner SVG can be default or explicit
          >
            <SquigglyLine
              color={ACCENT_COLOR}
              thickness={2.5} // Thicker line
              dasharray="6,3" // Different, more gappy dash pattern
              duration={0.85} // Slightly slower, more deliberate animation
              delay={0.15} // Starts drawing after text is nearly visible
            />
          </Box>
        </Box>
      </MotionBox>

      {/* --- Link Button --- */}
      {linkTo && (
        <MotionBox
          initial={{ opacity: 0, x: 20 }} // Slide in from right
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
          mt={{ base: 3, sm: 0 }} // Add margin-top if stacked below heading on small screens
        >
          <Link
            to={linkTo}
            style={{
              display:
                "inline-block" /* Ensures MotionBox respects button size */,
            }}
          >
            <SketchButton size="sm" primary={true}>
              {" "}
              {/* Use primary style for more pop */}
              <Flex align="center" justify="center" gap={2}>
                {linkText}
                <FaArrowRight
                  style={{
                    fontSize:
                      "0.9em" /* transform: 'translateY(1px)' may not be needed */,
                  }}
                />
              </Flex>
            </SketchButton>
          </Link>
        </MotionBox>
      )}
    </Flex>
  )
);

// --- Noise Background ---
const NoiseBackground = React.memo(() => (
  <Box
    position="fixed" // Covers whole screen behind everything else or relative to its parent if not fixed
    inset={0}
    zIndex={-10} // Ensures it's behind other content
    // Using a more subtle, high-frequency noise pattern
    // You can generate your own base64 noise or use a subtle repeating SVG/PNG
    bgImage="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVדהזה/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+///+/v7+/v7+/v7+/v7+/v7+/s8wT4AAAAF3RSTlPF48P117/Aw869zKrQuLOqphh5i59qcOMVsAAAAJZJREFUOI1jZobgMAIALAwMAyMWBgYW0AYsDLSAAVDCx/8D5cAxkvtR40lAFBl6vA5I7gBxQ7FBAmTk4b+DBwARHyG1DQEIGbQAAYQAHj6HjwxEHpXjF8AMDEQgUMDDhx4A9UikwMhoAAAUY4KHAACAEs6HF4HgQpAQAyNggkAJzAGYWFkAMjIKAEQz0mkwAACMQAAA1AUQAASYAFhI07u0aF4UAAAAAElFTkSuQmCC)"
    // For a less repetitive pattern, you might need a larger base64 image or an SVG filter.
    // backgroundSize="128px 128px" // Example if using a tileable image
    opacity={0.05} // Adjust for desired subtlety; was 0.06
    mixBlendMode="overlay" // 'overlay' or 'soft-light' usually work well for noise
    pointerEvents="none" // Make sure it doesn't interfere with interactions
    transform="translateZ(0)" // Can help with rendering performance on some browsers
    aria-hidden="true"
  />
));

// --- FeaturedHighlightCard ---
const FeaturedHighlightCard = React.memo(({ item, contentType }) => {
  if (!item) return null;

  const IconComponent = contentType === "movie" ? BiCameraMovie : BiTv;
  const backdropPath = item.backdrop_path
    ? `${baseImageOriginal}${item.backdrop_path}`
    : null;
  const themeProps = {
    cardBg: CARD_BG,
    borderColor: BORDER_COLOR,
    headingFont: HEADING_FONT,
    accentColor: ACCENT_COLOR,
  };

  return (
    <MotionBox
      flex={1}
      minW={0}
      bg={themeProps.cardBg}
      border="1px solid"
      borderColor={themeProps.borderColor}
      borderRadius="2px"
      overflow="hidden"
      position="relative"
      whileHover={{
        borderColor: themeProps.accentColor,
        boxShadow: `0 6px 15px rgba(0,0,0,0.4), 2px 2px 0px ${themeProps.accentColor}cc`,
        y: -3,
      }}
      transition={{ duration: 0.2 }}
    >
      {backdropPath && (
        <Box position="absolute" top={0} left={0} right={0} h="60%" zIndex={0}>
          <Image
            src={backdropPath}
            alt=""
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={0.2}
            filter="grayscale(30%)"
          />
        </Box>
      )}
      <Flex
        direction="column"
        p={{ base: 4, md: 5 }}
        position="relative"
        zIndex={1}
        h="100%"
        justifyContent="space-between"
      >
        <VStack align="flex-start" spacing={3} mb={4}>
          <Flex align="center" color={themeProps.accentColor} opacity={0.8}>
            <IconComponent size="1.5em" />
            <Text
              ml={2}
              fontSize="sm"
              fontWeight="bold"
              fontFamily={themeProps.headingFont}
              textTransform="uppercase"
            >
              {contentType === "movie" ? "Movie Spotlight" : "TV Spotlight"}
            </Text>
          </Flex>
          <Heading
            as="h3"
            size="md"
            color="white"
            noOfLines={2}
            fontFamily={themeProps.headingFont}
          >
            {" "}
            {item.title || item.name}{" "}
          </Heading>
          {item.genreNames && item.genreNames.length > 0 && (
            <Text fontSize="xs" color={MUTED_TEXT_COLOR} noOfLines={1}>
              {" "}
              {item.genreNames.slice(0, 3).join(" • ")}{" "}
            </Text>
          )}
        </VStack>
        {item.overview && (
          <Text
            fontSize="sm"
            color="gray.300"
            noOfLines={3}
            lineHeight="tall"
            my={4}
            flexGrow={1}
            minH="60px"
          >
            {" "}
            {truncateText(item.overview, 120)}{" "}
          </Text>
        )}
        <VStack spacing={4} align="stretch" w="100%" mt="auto">
          <HStack
            spacing={4}
            wrap="wrap"
            justify="flex-start"
            color={MUTED_TEXT_COLOR}
            fontSize="xs"
            fontFamily={BODY_FONT}
          >
            {(item.release_date || item.first_air_date) && (
              <Flex align="center">
                <BsCalendarDate style={{ marginRight: "4px", opacity: 0.8 }} />{" "}
                {(item.release_date || item.first_air_date).substring(0, 4)}
              </Flex>
            )}
            {item.vote_average != null && item.vote_average > 0 && (
              <Flex align="center">
                <FaStar
                  style={{ marginRight: "4px", color: themeProps.accentColor }}
                />{" "}
                {item.vote_average.toFixed(1)}{" "}
              </Flex>
            )}
            {contentType === "movie" && item.details?.runtime > 0 && (
              <Flex align="center">
                <FaClock style={{ marginRight: "4px", opacity: 0.8 }} />{" "}
                {convertMinutesToHours(item.details.runtime)}{" "}
              </Flex>
            )}
            {contentType === "tv" &&
              (item.details?.number_of_seasons || item.number_of_seasons) && (
                <Flex align="center">
                  <FaClapperboard
                    style={{ marginRight: "4px", opacity: 0.8 }}
                  />{" "}
                  {getSeasonInfo(item.details || item)}{" "}
                </Flex>
              )}
          </HStack>
          <Box pt={2}>
            <Link
              to={`/${contentType}/${item.id}`}
              style={{ width: "100%", display: "block" }}
            >
              <SketchButton primary iconSpacing={2}>
                {" "}
                <FaInfoCircle style={{ fontSize: "0.9em" }} /> View Details{" "}
              </SketchButton>
            </Link>
          </Box>
        </VStack>
      </Flex>
    </MotionBox>
  );
});

// --- HorizontalContentScroll ---
const HorizontalContentScroll = React.memo(({ children }) => {
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      height: "8px",
      backgroundColor: `rgba(10, 10, 20, 0.5)`,
    },
    "&::-webkit-scrollbar-thumb": {
      background: ACCENT_COLOR,
      borderRadius: "0px",
      border: `2px solid ${BASE_BG}`,
    },
    "&::-webkit-scrollbar-track": {
      background: `rgba(10, 10, 20, 0.5)`,
      borderRadius: "0px",
    },
    scrollbarWidth: "thin",
    scrollbarColor: `${ACCENT_COLOR} rgba(10, 10, 20, 0.5)`,
  };
  return (
    <Box position="relative">
      <Flex
        overflowX="auto"
        overflowY="hidden"
        pb={4}
        gap={{ base: 3, md: 4 }}
        sx={scrollbarStyles}
        alignItems="stretch"
      >
        {children}
      </Flex>
    </Box>
  );
});

// --- SectionTopHighlight ---
const SectionTopHighlight = React.memo(({ item, contentType }) => {
  if (!item) return null;

  const theme = {
    accentColor: ACCENT_COLOR,
    headingFont: HEADING_FONT,
    cardBg: CARD_BG,
    borderColor: BORDER_COLOR,
  }; // Simplified theme props for this context
  const posterPath = item.poster_path
    ? `${baseImageW500}${item.poster_path}`
    : PLACEHOLDER_IMAGE;
  const year = (item.release_date || item.first_air_date || "----").substring(
    0,
    4
  );
  const rating = item.vote_average?.toFixed(1) || "N/A";

  return (
    <MotionBox
      bg={theme.cardBg}
      border="1px solid"
      borderColor={theme.borderColor}
      borderRadius="2px"
      overflow="hidden"
      position="relative"
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        borderColor: theme.accentColor,
        boxShadow: `0 6px 15px rgba(0,0,0,0.4), 2px 2px 0px ${theme.accentColor}cc`,
        y: -3,
      }}
    >
      <MotionBox
        w={{ base: "100%", md: "200px", lg: "250px" }}
        flexShrink={0}
        position="relative"
        overflow="hidden"
        borderRight={{ md: `1px solid ${theme.borderColor}` }}
        borderBottom={{ base: `1px solid ${theme.borderColor}`, md: "none" }}
        sx={{ aspectRatio: { base: "2/3", md: "auto" } }}
        height={{ base: "auto", md: "auto" }} // Allow natural height based on content/width
      >
        <Image
          src={posterPath}
          alt={`Poster for ${item.title || item.name}`}
          width="100%"
          height="100%"
          objectFit="cover"
          fallbackSrc={PLACEHOLDER_IMAGE}
        />
        <Box
          pos="absolute"
          inset={0}
          bgGradient="linear(to-t, blackAlpha.600 5%, transparent 40%)"
        />
      </MotionBox>
      <Flex
        direction="column"
        p={{ base: 4, md: 6 }}
        flexGrow={1}
        justifyContent="space-between"
      >
        <VStack align="flex-start" spacing={2} mb={4}>
          <Heading
            as="h3"
            size="md"
            color="white"
            fontFamily={theme.headingFont}
            noOfLines={2}
          >
            {" "}
            {item.title || item.name}{" "}
          </Heading>
          <HStack
            spacing={4}
            color={MUTED_TEXT_COLOR}
            fontSize="sm"
            wrap="wrap"
          >
            <Flex align="center">
              <FaStar
                style={{ marginRight: "4px", color: theme.accentColor }}
              />
              {rating}
            </Flex>
            <Flex align="center">
              <BsCalendarDate style={{ marginRight: "4px", opacity: 0.8 }} />
              {year}
            </Flex>
            {contentType === "movie" && item.details?.runtime > 0 && (
              <Flex align="center">
                <FaClock style={{ marginRight: "4px", opacity: 0.8 }} />{" "}
                {convertMinutesToHours(item.details.runtime)}
              </Flex>
            )}
            {contentType === "tv" &&
              (item.details?.number_of_seasons || item.number_of_seasons) && (
                <Flex align="center">
                  <FaClapperboard
                    style={{ marginRight: "4px", opacity: 0.8 }}
                  />
                  {getSeasonInfo(item.details || item)}
                </Flex>
              )}
          </HStack>
          {item.genreNames && item.genreNames.length > 0 && (
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {item.genreNames.slice(0, 4).join(" • ")}
            </Text>
          )}
        </VStack>
        {item.overview && (
          <Text
            fontSize="sm"
            color="gray.300"
            noOfLines={{ base: 2, md: 3 }}
            lineHeight="tall"
            my={4}
            flexGrow={1}
            minH={{ base: "40px", md: "60px" }}
          >
            {truncateText(item.overview, 150)}
          </Text>
        )}
        <Box mt="auto" pt={3} alignSelf="flex-start">
          <Link to={`/${contentType}/${item.id}`} style={{ width: "auto" }}>
            <SketchButton primary size="sm">
              {" "}
              <FaInfoCircle
                style={{ fontSize: "0.9em", marginRight: "6px" }}
              />{" "}
              View Details{" "}
            </SketchButton>
          </Link>
        </Box>
      </Flex>
    </MotionBox>
  );
});

// ========================================================================
// --- Home PAGE COMPONENT ---
// ========================================================================
const Home = () => {
  const [loading, setLoading] = useState(true);
  const [genreMap, setGenreMap] = useState({});
  const [featuredContent, setFeaturedContent] = useState({
    movie: null,
    tv: null,
  });
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const [popularNetflixShows, setPopularNetflixShows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log("Home Mount: Starting data fetch...");
      try {
        const [
          genresMovieData,
          genresTvData,
          trendingMoviesData,
          trendingTvData,
          topRatedMoviesData,
          topRatedTvShowsData,
          netflixShowsData,
        ] = await Promise.all([
          fetchGenres("movie").catch((e) => {
            console.error("API Error (Movie Genres):", e);
            return { genres: [] };
          }),
          fetchGenres("tv").catch((e) => {
            console.error("API Error (TV Genres):", e);
            return { genres: [] };
          }),
          fetchTrendingMovies("week", 1).catch((e) => {
            console.error("API Error (Trending Movies):", e);
            return { results: [] };
          }),
          fetchTrendingTVShows("week", 1).catch((e) => {
            console.error("API Error (Trending TV):", e);
            return { results: [] };
          }),
          fetchTopRated("movie", 1).catch((e) => {
            console.error("API Error (Top Movies):", e);
            return { results: [] };
          }), // For featured
          fetchTopRated("tv", 1).catch((e) => {
            console.error("API Error (Top TV):", e);
            return { results: [] };
          }), // For featured
          fetchPopularNetflixShows().catch((e) => {
            console.error("API Error (Netflix):", e);
            return [];
          }),
        ]);
        console.log("Home Fetch: Base data fetched.");

        // --- Process Genres ---
        const movieGenreMap = genresMovieData.reduce(
          (acc, g) => ({ ...acc, [g.id]: g.name }),
          {}
        );
        const tvGenreMap = genresTvData.reduce(
          (acc, g) => ({ ...acc, [g.id]: g.name }),
          {}
        );
        const combinedGenreMap = { ...movieGenreMap, ...tvGenreMap };
        setGenreMap(combinedGenreMap);

        // --- Add Genre Names Helper Function ---
        const addGenreNames = (items = [], map = {}) =>
          items.map((item) => ({
            ...item,
            genreNames: Array.isArray(item.genre_ids)
              ? item.genre_ids.map((id) => map[id]).filter(Boolean)
              : [],
          }));

        // --- Prepare Base Lists ---
        const baseTrendingMovies = addGenreNames(
          trendingMoviesData || [],
          combinedGenreMap
        );
        const baseTrendingTv = addGenreNames(
          trendingTvData || [],
          combinedGenreMap
        );
        const baseFeaturedMovie = addGenreNames(
          topRatedMoviesData || [],
          combinedGenreMap
        )[0]; // Just take the top one
        const baseFeaturedTv = addGenreNames(
          topRatedTvShowsData || [],
          combinedGenreMap
        )[0]; // Just take the top one
        setPopularNetflixShows(netflixShowsData || []); // Assume this data is usable directly

        // --- Fetch Details for Highlighted Items ---
        console.log("Home Fetch: Fetching details for highlights...");
        const itemsRequiringDetails = [
          baseFeaturedMovie
            ? { type: "movie", id: baseFeaturedMovie.id }
            : null,
          baseFeaturedTv ? { type: "tv", id: baseFeaturedTv.id } : null,
          baseTrendingMovies[0]
            ? { type: "movie", id: baseTrendingMovies[0].id }
            : null, // Detail for #1 movie
          baseTrendingTv[0] ? { type: "tv", id: baseTrendingTv[0].id } : null, // Detail for #1 tv
        ].filter((item) => item !== null); // Filter out nulls if top item doesn't exist

        const detailPromises = itemsRequiringDetails.map((item) =>
          fetchDetails(item.type, item.id).catch((e) => {
            console.error(
              `API Error (Fetching Details for ${item.type} ${item.id}):`,
              e
            );
            return null; // Handle fetch errors for individual details
          })
        );
        const detailResults = await Promise.all(detailPromises);
        console.log("Home Fetch: Detail fetching complete.");

        // --- Map Details Back to Items ---
        const detailsMap = {};
        itemsRequiringDetails.forEach((item, index) => {
          if (detailResults[index]) {
            // Only map if fetch succeeded
            detailsMap[`${item.type}-${item.id}`] = detailResults[index];
          }
        });

        // --- Populate Final State ---
        setFeaturedContent({
          movie: baseFeaturedMovie
            ? {
                ...baseFeaturedMovie,
                details: detailsMap[`movie-${baseFeaturedMovie.id}`],
              }
            : null,
          tv: baseFeaturedTv
            ? {
                ...baseFeaturedTv,
                details: detailsMap[`tv-${baseFeaturedTv.id}`],
              }
            : null,
        });

        setTrendingMovies(
          baseTrendingMovies.map((item) => ({
            ...item,
            details: detailsMap[`movie-${item.id}`],
          }))
        );
        setTrendingTv(
          baseTrendingTv.map((item) => ({
            ...item,
            details: detailsMap[`tv-${item.id}`],
          }))
        );

        console.log("Home Fetch: State updated successfully.");
      } catch (error) {
        // Catch critical errors in the overall flow
        console.error(
          "Home Fetch: CRITICAL ERROR during data fetching or processing:",
          error
        );
        // Reset state in case of critical failure
        setGenreMap({});
        setTrendingMovies([]);
        setTrendingTv([]);
        setPopularNetflixShows([]);
        setFeaturedContent({ movie: null, tv: null });
      } finally {
        setLoading(false);
        console.log("Home Fetch: Loading state set to false.");
      }
    };
    fetchData();
  }, []); // Empty dependency array means run once on mount

  // Prepare data for rendering
  const topTrendingMovie = trendingMovies?.[1];
  const otherTrendingMovies = trendingMovies?.slice(0, 12);

  const topTrendingTv = trendingTv?.[0];
  const otherTrendingTv = trendingTv?.slice(1, 12);

  // --- Loading State ---
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={BASE_BG}>
        <VStack spacing={4}>
          <Spinner
            size="xl"
            thickness="4px"
            speed="0.7s"
            color={ACCENT_COLOR}
            emptyColor="gray.700"
          />
          <Text
            fontFamily={HEADING_FONT}
            color={ACCENT_COLOR}
            fontSize="lg"
            textTransform={"uppercase"}
          >
            Loading Interface...
          </Text>
        </VStack>
      </Flex>
    );
    // return <StreamingServiceSkeleton />; // Alternative
  }

  const BANNER_SECTION_BG = "rgba(15, 15, 25, 0.95)"; // A new subtle banner BG
  const BANNER_BORDER_COLOR = "rgba(255, 255, 255, 0.1)"; // For sketchy border

  // Assuming all necessary imports and constants like BASE_BG, ACCENT_COLOR, etc., are defined.
  // For BANNER_SECTION_BG, BANNER_BORDER_COLOR, make sure they are defined
  // const BANNER_SECTION_BG = "rgba(15, 15, 25, 0.95)"; // From previous examples
  // const BANNER_BORDER_COLOR = "rgba(255, 255, 255, 0.1)"; // From previous examples

  // --- Render Home Page ---
  return (
    <Box
      position="relative"
      bg={BASE_BG}
      minH="100vh"
      overflowX="hidden"
      // Keeping your overall page background style
      backgroundImage="linear-gradient(to bottom, rgba(13, 18, 30, 0.95), rgba(10, 15, 25, 0.98))"
      backgroundAttachment="fixed"
    >
      {/* Background pattern overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.15"
        backgroundImage="url('https://www.transparenttextures.com/patterns/skulls.png')"
        zIndex="0"
      />

      {/* === HERO === */}
      <Box position="relative">
        <SketchyHeroSlider />
        <Box
          position="absolute"
          top="0"
          left="0"
          height="100%"
          width="80px"
          bgGradient="linear(to-r, rgba(10, 15, 25, 0.8), transparent)"
          pointerEvents="none"
          zIndex="2"
        />
        <Box
          position="absolute"
          top="0"
          right="0"
          height="100%"
          width="80px"
          bgGradient="linear(to-l, rgba(10, 15, 25, 0.8), transparent)"
          pointerEvents="none"
          zIndex="2"
        />
      </Box>

      {/* === MAIN CONTENT FLOW - Sections will now touch === */}

      {/* SECTION 1: "EDITOR'S SPOTLIGHT" - ALTERNATING LAYOUT */}
      {(featuredContent.movie || featuredContent.tv) && (
        <Box
          // Reduced padding, removed 'my'
          py={{ base: 10, md: 12, lg: 14 }} // Was 12, 16, 20
          position="relative"
          zIndex="1"
          // borderTop might be needed if Hero doesn't provide a clear visual end
          // For now, relying on its internal borders if any, or just the background change.
        >
          {/* Enhanced background for Curated Cuts section - KEEPING THIS AS IT'S DISTINCT */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(to-r, rgba(60, 20, 90, 0.15), rgba(20, 30, 60, 0.2), rgba(60, 20, 90, 0.15))"
            zIndex="-1"
          />

          <Container maxW="1500px" mx="auto" px={{ base: 4, md: 6, lg: 8 }}>
            <MotionBox
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <SectionHeading showDoodle={true}>
                {/* Your styled "CURATED CUTS" heading */}
                <Flex align="center" gap={2}>
                  <PiFilmReelFill color={ACCENT_COLOR} size="1.2em"/>
                  <Box position="relative">CURATED CUTS</Box>
                </Flex>
              </SectionHeading>
              <Flex
                direction={{ base: "column", lg: "row" }}
                gap={{ base: 8, md: 10 }}
                align="stretch"
                mt={{ base: 6, md: 8 }}
              >
                {featuredContent.movie && (
                  <MotionBox
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{
                      x: 0,
                      opacity: 1,
                      transition: { duration: 0.5, ease: "easeOut" },
                    }}
                    viewport={{ once: true }}
                    flex="1"
                  >
                    <FeaturedHighlightCard
                      item={featuredContent.movie}
                      contentType="movie"
                    />
                  </MotionBox>
                )}
                {featuredContent.tv && (
                  <MotionBox
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{
                      x: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        delay: 0.2,
                        ease: "easeOut",
                      },
                    }}
                    viewport={{ once: true }}
                    flex="1"
                  >
                    <FeaturedHighlightCard
                      item={featuredContent.tv}
                      contentType="tv"
                    />
                  </MotionBox>
                )}
              </Flex>
            </MotionBox>
          </Container>
        </Box>
      )}

      {/* SECTION 2: "WHAT'S HOT NOW" - DIAGONAL BACKGROUND */}
      {(topTrendingMovie || topTrendingTv) && (
        <Box
          position="relative"
          // Reduced padding, removed 'my' and 'mt'
          py={{ base: 10, md: 12, lg: 14 }} // Was 14, 16, 20
          zIndex="1"
          // This section will visually "bleed" from the previous due to no margin and distinct BG
          // Its internal borders define its top/bottom with the diagonal.
        >
          <Box
            position="absolute"
            top="0"
            left="-5%"
            right="-5%"
            bottom="0"
            bg={BANNER_SECTION_BG}
            transform="rotate(-2deg)"
            zIndex="-1"
            borderTop="3px dashed"
            borderColor={BANNER_BORDER_COLOR}
          />
          <Container
            maxW="1500px"
            mx="auto"
            px={{ base: 4, md: 6, lg: 8 }}
            position="relative"
          >
            <MotionBox
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              <SectionHeading showDoodle={true}>
                <Flex align="center" gap={3}>
                  <FaStar color={ACCENT_COLOR} size="1.2em" /> THE CURRENT VIBE
                </Flex>
              </SectionHeading>
              <Flex
                direction={{ base: "column", lg: "row" }}
                gap={{ base: 8, md: 10 }}
                align="stretch"
                mt={{ base: 6, md: 8 }}
              >
                {topTrendingMovie && (
                  <SectionTopHighlight
                    item={topTrendingMovie}
                    contentType="movie"
                  />
                )}
                {topTrendingTv && (
                  <SectionTopHighlight item={topTrendingTv} contentType="tv" />
                )}
              </Flex>
            </MotionBox>
          </Container>
        </Box>
      )}

      {/* SECTION 3: "STRAIGHT FROM NETFLIX" - FULL-WIDTH GRADIENT BANNER */}
      {popularNetflixShows.length > 0 && (
        <Box
          position="relative"
          // Reduced padding, removed 'my'
          py={{ base: 10, md: 12, lg: 14 }} // Was 16, 18, 21
          zIndex="1"
          // The internal border on the gradient BG box defines its top.
          // The NEXT section's top border will define this section's bottom.
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            backgroundImage="linear-gradient(to right, rgba(180, 10, 10, 0.17), rgba(10, 10, 10, 0.95), rgba(180, 10, 10, 0.15))"
            zIndex="-1"
            borderTop="2px dashed rgba(255, 70, 70, 0.3)"
            // REMOVE borderBottom here if the next section has a borderTop
          />
          <MotionBox
            variants={SECTION_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            <Container maxW="1500px" mx="auto" px={{ base: 4, md: 6, lg: 8 }}>
              <Box>
                <NetflixBanner
                  popularNetflixShows={popularNetflixShows}
                  baseImageOriginal={baseImageOriginal}
                  watchProviders={watchProviders}
                />
              </Box>
              <SectionHeading
                linkTo="/discover/netflix"
                linkText="MORE NETFLIX"
              >
                <Flex align="center" gap={2}>
                  <Image
                    src="https://cdn.brandfetch.io/ideQwN5lBE/w/496/h/901/theme/dark/symbol.png?c=1dxbfHSJFAPEGdCLU4o5B"
                    alt="Netflix Logo"
                    h="30px"
                    objectFit="contain"
                    mr={2}
                    display="inline-block"
                    verticalAlign="middle"
                  />
                  What's Cooking on Netflix
                </Flex>
              </SectionHeading>
            </Container>
            <Box mt={{ base: 6, md: 8 }} position="relative">
              <Box pl={{ base: 4, md: 6, lg: 8 }}>
                <HorizontalContentScroll>
                  {popularNetflixShows.slice(0, 7).map((show) => (
                    <MotionBox
                      key={`netflix-${show.id}`}
                      minW={{
                        base: "218px",
                        sm: "242px",
                        md: "265px",
                        lg: "288px",
                      }}
                      w={{
                        base: "218px",
                        sm: "242px",
                        md: "265px",
                        lg: "288px",
                      }}
                      flexShrink={0}
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: {
                          duration: 0.4,
                          delay: 0.08,
                          ease: "easeOut",
                        },
                      }}
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      <ContentGrid
                        item={show}
                        contentType={show.media_type || "tv"}
                      />
                    </MotionBox>
                  ))}
                  <Box flexShrink={0} w={{ base: 4, md: 6, lg: 8 }} />
                </HorizontalContentScroll>
              </Box>
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="80px"
                bgGradient="linear(to-r, rgba(10, 15, 25, 0.8), transparent)"
                pointerEvents="none"
                zIndex="2"
              />
              <Box
                position="absolute"
                top="0"
                right="0"
                height="100%"
                width="80px"
                bgGradient="linear(to-l, rgba(10, 15, 25, 0.8), transparent)"
                pointerEvents="none"
                zIndex="2"
              />
            </Box>
          </MotionBox>
        </Box>
      )}

      {/* SECTION 4: "DIVE DEEPER: FILMS" - OFFSET GRID LAYOUT */}
      {otherTrendingMovies && otherTrendingMovies.length > 0 && (
        <Box
          position="relative"
          // Reduced padding, removed 'my'
          py={{ base: 10, md: 12, lg: 14 }} // Was 14, 16, 20
          overflowX="hidden" // Keep this for the offset grid illusion if needed
          zIndex="1"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear-gradient(135deg, rgba(255, 255, 150, 0.03) 0%, rgba(255, 255, 100, 0.06) 60%, rgba(255, 255, 120, 0.01) 100%)"
            zIndex="-1" // Made gradient much more subtle for blending
            borderTop="2px dashed rgba(200, 200, 100, 0.2)" // Softer accent border
            // REMOVE borderBottom here if the next section has a borderTop
          />
          <MotionBox
            variants={SECTION_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            <Container maxW="1500px" mx="auto" px={{ base: 4, md: 6, lg: 8 }}>
              <SectionHeading
                linkTo="/movies"
                linkText="ALL FILMS"
                iconLeft={<FaFilm />}
              >
                <Box position="relative" display="inline-block">
                  Dive Deeper: Films{" "}
                  <Box
                    position="absolute"
                    bottom="-4px"
                    left="0"
                    height="2px"
                    width="60%"
                    bgGradient="linear(to-r, rgba(70, 130, 180, 0.7), transparent)"
                  />
                </Box>
              </SectionHeading>
            </Container>
            <Box mt={{ base: 6, md: 8 }} position="relative">
              <Box pl={{ base: 4, md: 6, lg: 8 }}>
                <HorizontalContentScroll>
                  {otherTrendingMovies.map((movie, index) => (
                    <MotionBox
                      key={`trend-mov-${movie.id}`}
                      minW={{
                        base: "218px",
                        sm: "242px",
                        md: "265px",
                        lg: "288px",
                      }}
                      w={{
                        base: "218px",
                        sm: "242px",
                        md: "265px",
                        lg: "288px",
                      }}
                      flexShrink={0}
                      initial={{
                        opacity: 0,
                        y: index % 2 === 0 ? 20 : -20,
                        scale: 0.95,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.5, ease: "easeOut" },
                      }}
                      viewport={{ once: true, amount: 0.2 }}
                      transform={
                        index % 2 === 0
                          ? "translateY(10px)"
                          : "translateY(-10px)"
                      }
                    >
                      <ContentGrid item={movie} contentType="movie" />
                    </MotionBox>
                  ))}
                  <Box flexShrink={0} w={{ base: 4, md: 6, lg: 8 }} />
                </HorizontalContentScroll>
              </Box>
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="80px"
                bgGradient="linear(to-r, rgba(10, 15, 25, 0.8), transparent)"
                pointerEvents="none"
                zIndex="2"
              />
              <Box
                position="absolute"
                top="0"
                right="0"
                height="100%"
                width="80px"
                bgGradient="linear(to-l, rgba(10, 15, 25, 0.8), transparent)"
                pointerEvents="none"
                zIndex="2"
              />
            </Box>
          </MotionBox>
        </Box>
      )}

      {/* SECTION 5: "BINGE-WORTHY SERIES" - RADIAL GRADIENT OVERLAY */}
      {otherTrendingTv && otherTrendingTv.length > 0 && (
        <Box
          position="relative"
          // Reduced padding, removed 'my'
          py={{ base: 10, md: 12, lg: 14 }} // Was 11, 13, 14 - slight tweak
          zIndex="1"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgImage="linear-gradient(135deg, rgba(120, 80, 170, 0.1) 0%, rgba(120, 80, 170, 0.05) 60%, transparent 100%)"
            zIndex="-1" // Made gradient more subtle
            borderTop="2px dashed rgba(120, 80, 170, 0.2)"
            borderBottom="2px dashed rgba(120, 80, 170, 0.2)" // LAST content section, so it needs its bottom border.
          />
          <MotionBox
            variants={SECTION_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            <Container maxW="1500px" mx="auto" px={{ base: 4, md: 6, lg: 8 }}>
              <SectionHeading
                linkTo="/shows"
                linkText="ALL SERIES"
                iconLeft={<FaTv />}
              >
                <Box position="relative" display="inline-block">
                  Binge-Worthy Series
                </Box>
              </SectionHeading>
            </Container>
            <Box mt={{ base: 6, md: 8 }} position="relative">
              <Box pl={{ base: 4, md: 6, lg: 8 }}>
                <HorizontalContentScroll>
                  {otherTrendingTv.map((tv) => (
                    <MotionBox
                      key={`trend-tv-${tv.id}`}
                      minW={{
                        base: "218px",
                        sm: "242px",
                        md: "265px",
                        lg: "288px",
                      }}
                      w={{
                        base: "218px",
                        sm: "242px",
                        md: "265px",
                        lg: "288px",
                      }}
                      flexShrink={0}
                      initial={{ opacity: 0, scale: 0.92 }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        transition: { duration: 0.6, ease: "easeOut" },
                      }}
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      <ContentGrid item={tv} contentType="tv" />
                    </MotionBox>
                  ))}
                  <Box flexShrink={0} w={{ base: 4, md: 6, lg: 8 }} />
                </HorizontalContentScroll>
              </Box>
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="80px"
                bgGradient="linear(to-r, rgba(10, 15, 25, 0.8), transparent)"
                pointerEvents="none"
                zIndex="2"
              />
              <Box
                position="absolute"
                top="0"
                right="0"
                height="100%"
                width="80px"
                bgGradient="linear(to-l, rgba(10, 15, 25, 0.8), transparent)"
                pointerEvents="none"
                zIndex="2"
              />
            </Box>
          </MotionBox>
        </Box>
      )}

      {/* === FOOTER === */}
      <Box
        // Removed 'mt' from footer as the last section above it provides separation with its border/bg
        py={12}
        position="relative"
        zIndex="1"
        // mt will be implicitly handled by the last section's bottom visual
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(5, 8, 15, 0.9)"
          borderTop="1px dashed rgba(255, 255, 255, 0.1)"
          zIndex="-1"
        />
        <Container maxW="container.lg" textAlign="center">
          <Flex
            direction="column"
            align="center"
            justify="center"
            position="relative"
          >
            <Box
              position="absolute"
              top="-20px"
              left="50%"
              transform="translateX(-50%)"
              width="100px"
              height="1px"
              bg="linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)"
            />
            <Text
              fontFamily={HEADING_FONT}
              color={MUTED_TEXT_COLOR}
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="1.5px"
              mb={2}
            >
              SPECTRA [] © {new Date().getFullYear()}
            </Text>
            <Box
              position="absolute"
              bottom="-20px"
              left="50%"
              transform="translateX(-50%)"
              width="100px"
              height="1px"
              bg="linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)"
            />
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};
export default Home;
