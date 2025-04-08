import React, { useEffect, useState, useRef } from "react";
import { Box, Image, Text, Flex } from "@chakra-ui/react"; // Badge no longer needed
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { baseImageW500, fetchTrailers } from "@/services/api";
import { truncateText } from "@/utils/helper";

// --- Placeholder Genre Map ---
// You should replace this with your actual genre data source (Context, Redux, fetched data)
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
// -----------------------------

// --- Motion Component ---
const MotionBox = motion(Box);
const MotionText = motion(Text);

// --- Reusable Sketchy Line (straight) --- (Optional - Keep if used elsewhere or remove if not needed)
const SketchyLine = ({
  orientation = "horizontal",
  size = "10px",
  thickness = "1px",
  color = "#FFEC44",
  offset = "1px",
  ...rest
}) => (
  <Box
    position="absolute"
    width={orientation === "horizontal" ? size : thickness}
    height={orientation === "vertical" ? size : thickness}
    bg={color}
    transform={
      orientation === "horizontal"
        ? `translateY(${offset})`
        : `translateX(${offset})`
    }
    opacity={0.7}
    {...rest}
  />
);

// --- Main Component ---
export default function ContentGrid({
  item,
  index,
  contentType,
  genreMap = ALL_GENRES_MAP, // Use the map provided or the default placeholder
}) {
  const [trailerData, setTrailerData] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [trailerError, setTrailerError] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState(null);
  const [exitTimeoutId, setExitTimeoutId] = useState(null);

  const videoRef = useRef(null);

  // --- Theme Colors ---
  const themeBlack = "#000000";
  const themeDark = "#121212";
  const themeYellow = "#FFEC44";
  const themeBorder = "#444";
  const themeText = "whiteAlpha.900";
  const themeSubtleText = "whiteAlpha.700";

  // --- Fetch Trailer (unchanged) ---
  useEffect(() => {
    const fetchData = async () => {
      setTrailerData(null);
      setTrailerLoaded(false);
      setTrailerError(false);
      try {
        const data = await fetchTrailers(contentType, item.id);
        setTrailerData(data);
      } catch (error) {
        console.error("Error fetching trailer:", error);
        setTrailerError(true);
      }
    };
    fetchData();
  }, [item.id, contentType]);

  // --- Cleanup Timeouts (unchanged) ---
  useEffect(() => {
    return () => {
      if (hoverTimeoutId) clearTimeout(hoverTimeoutId);
      if (exitTimeoutId) clearTimeout(exitTimeoutId);
    };
  }, [hoverTimeoutId, exitTimeoutId]);

  // --- Hover Handling (unchanged) ---
  const handleMouseEnter = () => {
    if (exitTimeoutId) clearTimeout(exitTimeoutId);
    const id = setTimeout(() => setIsHovering(true), 200);
    setHoverTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutId) clearTimeout(hoverTimeoutId);
    setIsHovering(false);
    const exitId = setTimeout(() => {
      setTrailerLoaded(false);
    }, 300);
    setExitTimeoutId(exitId);
  };

  // --- Video Status (unchanged) ---
  const handleVideoLoad = () => setTrailerLoaded(true);
  const handleVideoError = () => {
    setTrailerError(true);
    setTrailerLoaded(false);
  };

  // --- Data Prep ---
  const trailerKey = trailerData?.[0]?.key;
  const hasTrailer = !!trailerKey && !trailerError;

  const posterUrl = item.backdrop_path
    ? `${baseImageW500}${item.backdrop_path}`
    : item.poster_path
    ? `${baseImageW500}${item.poster_path}`
    : "https://via.placeholder.com/500x281?text=NO+IMAGE";

  // --- Map Genre IDs to Names ---
  const displayedGenres = (item.genre_ids || [])
    .map((id) => genreMap[id])
    .filter(Boolean)
    .slice(0, 2); // Show max 2 genres

  // --- Animation Definitions (unchanged) ---
  const cardTransition = { type: "tween", duration: 0.2, ease: "easeOut" };
  const contentTransition = { type: "tween", duration: 0.15, ease: "linear" };
  const cardVariants = {
    initial: {
      scale: 1,
      zIndex: 1,
      border: `1px solid ${themeBorder}`,
      boxShadow: `2px 2px 0px 0px #0a0a0a`,
    },
    hover: {
      scale: 1.02,
      zIndex: 10,
      border: `1px solid ${themeYellow}`,
      boxShadow: `3px 3px 0px 0px #111`,
      transition: {
        ...cardTransition,
        boxShadow: { delay: 0, duration: 0.1 },
        border: { delay: 0, duration: 0.1 },
      },
    },
  };
  const infoContentVariants = {
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: contentTransition,
    },
    hidden: {
      opacity: 0,
      height: 0,
      y: 5,
      transition: { ...contentTransition, delay: 0 },
    },
  };

  // Common font style
  const sketchyFontStyle = {
    fontFamily: "'Courier New', monospace",
    textTransform: "uppercase",
  };

  return (
    // --- Main Card Container ---
    <MotionBox
      as={Link}
      to={`/${contentType === "movie" ? "movie" : "tv"}/${item.id}`}
      key={item.id}
      borderRadius={0}
      overflow="visible"
      bg={themeBlack}
      position="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
          delay: index * 0.05,
        },
      }}
      variants={cardVariants}
      whileHover="hover"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      display="flex"
      flexDirection="column"
      height="100%"
      _focus={{ outline: "none", boxShadow: "none" }}
      _focusVisible={{ outline: `2px dashed ${themeYellow}` }}
    >
      {/* --- Image/Video Area --- */}
      <Box
        position="relative"
        overflow="hidden"
        aspectRatio="16 / 9"
        width="100%"
        borderBottom={`1px solid ${themeBorder}`}
      >
        {/* --- Static Poster Image --- */}
        <Image
          src={posterUrl}
          alt={item.title || item.name}
          height="100%"
          width="100%"
          objectFit="cover"
          borderRadius={0}
          fallbackSrc="https://via.placeholder.com/500x281?text=NO+IMAGE"
          style={{
            opacity: isHovering && hasTrailer && trailerLoaded ? 0 : 1,
            transition: "opacity 0.3s linear",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        {/* --- Trailer Overlay --- */}
        <AnimatePresence>
          {isHovering && hasTrailer && (
            <MotionBox
              key="trailer-box"
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg={themeBlack}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.3, delay: 0.1 },
              }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              overflow="hidden"
              borderRadius={0}
            >
              {/* Loading state */}
              {!trailerLoaded && !trailerError && (
                <Flex
                  position="absolute"
                  inset="0"
                  bg={themeBlack}
                  color={themeYellow}
                  alignItems="center"
                  justifyContent="center"
                  {...sketchyFontStyle}
                  fontSize="xs"
                >
                  LOADING...
                </Flex>
              )}
              {/* Iframe */}
              <iframe
                ref={videoRef}
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&mute=0`}
                allow="autoplay; encrypted-media;"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  opacity: trailerLoaded ? 1 : 0,
                  transition: "opacity 0.5s ease-in",
                  pointerEvents: "none",
                }}
                onLoad={handleVideoLoad}
                onError={handleVideoError}
                title={`${item.title || item.name} trailer preview`}
              />
              {/* Optional straight sketchy lines */}
              <SketchyLine
                orientation="horizontal"
                size="30%"
                top="10%"
                left="5%"
                offset="1px"
                thickness="1px"
                color="rgba(255, 236, 68, 0.2)"
              />
              <SketchyLine
                orientation="vertical"
                size="40%"
                bottom="15%"
                right="8%"
                offset="-1px"
                thickness="1px"
                color="rgba(255, 236, 68, 0.15)"
              />
            </MotionBox>
          )}
        </AnimatePresence>

        {/* --- Corner Badges/Info --- */}
        <AnimatePresence>
          {!isHovering && (
            <>
              {/* Rating Badge */}
              <MotionBox
                key="rating-badge"
                position="absolute"
                top="0"
                right="0"
                bg={themeBlack}
                borderLeft={`1px solid ${themeBorder}`}
                borderBottom={`1px solid ${themeBorder}`}
                px="2"
                py="1"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0, transition: cardTransition }}
                exit={{ opacity: 0, x: 5, transition: { duration: 0.1 } }}
              >
                <Flex align="center">
                  <Box
                    as={FaStar}
                    color={themeYellow}
                    fontSize="10px"
                    mr="1.5"
                  />
                  <Text
                    fontSize="11px"
                    color={themeSubtleText}
                    {...sketchyFontStyle}
                    letterSpacing="tight"
                  >
                    {item.vote_average?.toFixed(1) || "N/A"}
                  </Text>
                </Flex>
              </MotionBox>
              {/* Year Badge */}
              {(item.release_date || item.first_air_date) && (
                <MotionBox
                  key="year-badge"
                  position="absolute"
                  top="0"
                  left="0"
                  bg={themeBlack}
                  borderRight={`1px solid ${themeBorder}`}
                  borderBottom={`1px solid ${themeBorder}`}
                  px="2"
                  py="1"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0, transition: cardTransition }}
                  exit={{ opacity: 0, x: -5, transition: { duration: 0.1 } }}
                >
                  <Text
                    fontSize="11px"
                    color={themeSubtleText}
                    {...sketchyFontStyle}
                    letterSpacing="tight"
                  >
                    {(item.release_date || item.first_air_date).substring(0, 4)}
                  </Text>
                </MotionBox>
              )}
            </>
          )}
        </AnimatePresence>
      </Box>

      {/* --- Info Section --- */}
      <MotionBox
        px="2"
        py="1.5"
        variants={infoContentVariants}
        initial="visible"
        animate={
          isHovering && hasTrailer && trailerLoaded ? "hidden" : "visible"
        }
        overflow="hidden"
        bg={themeDark}
        borderTop={`1px solid ${themeBorder}`} // Kept border for separation
      >
        {/* Title */}
        <MotionText
          color={themeText}
          fontWeight="bold"
          fontSize="xs"
          noOfLines={1}
          mb="1" // Keep margin bottom for title
          {...sketchyFontStyle}
        >
          {truncateText(item.title || item.name, 32)}
        </MotionText>

        {/* Genres Display */}
        <Flex
          flexWrap="nowrap"
          gap="1.5"
          overflow="hidden"
          alignItems="center"
          h="14px"
        >
          {" "}
          {/* Fixed height */}
          {displayedGenres.length > 0 ? (
            displayedGenres.map((genreName, i, arr) => (
              <React.Fragment key={genreName + i}>
                <Text
                  color={themeSubtleText}
                  fontSize="10px"
                  {...sketchyFontStyle}
                  letterSpacing="normal"
                  whiteSpace="nowrap"
                >
                  {genreName}
                </Text>
                {i < arr.length - 1 && ( // Show separator only between genres
                  <Box
                    as="span"
                    color={themeYellow}
                    alignItems="center"
                    fontWeight="bold"
                    fontSize="10px"
                    mx="0.5"
                    lineHeight="10px"
                  >
                    •
                  </Box>
                )}
              </React.Fragment>
            ))
          ) : (
            <Text
              color={themeSubtleText}
              fontSize="10px"
              {...sketchyFontStyle}
              letterSpacing="normal"
            >
              -
            </Text>
          )}
        </Flex>
      </MotionBox>
    </MotionBox>
  );
}
