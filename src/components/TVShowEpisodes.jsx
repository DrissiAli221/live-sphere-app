import React, { useState, useEffect, useRef } from "react";

// --- Chakra UI Primitive Imports ---
import {
  Box,
  Text,
  Flex,
  Image,
  Skeleton,
  Badge,
  VStack,
  Heading,
  Spinner,
} from "@chakra-ui/react";

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Icon Imports ---
import {
  FaPlay,
  FaStar,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";

// --- Service/Util Imports ---
import {
  baseImageW500,
  fetchTVDetails,
  fetchTVSeasonDetails,
} from "@/services/api"; // Adjust path
import comingSoon from "@/assets/soon2.jpg"; // Adjust path if needed
import { truncateText } from "@/utils/helper"; // Adjust path

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Definitions required here or imported) ---
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionDiv = motion.div;
const MotionPath = motion.path;

// --- SketchButton and SquigglyLine definitions (Assume they exist as previously defined) ---
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
    }}
    animate={isActive ? "visible" : "hidden"}
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
  >
    {" "}
    <motion.path
      d="M10,50 C50,30 100,70 150,50 C200,30 250,60 290,50"
      fill="transparent"
      stroke="#FFEC44"
      strokeWidth="2"
      strokeDasharray="5,5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        isActive
          ? { pathLength: 1, opacity: 0.4 }
          : { pathLength: 0, opacity: 0 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ strokeDashoffset: 0 }}
    />{" "}
  </motion.svg>
);
const SketchButtonInternal = ({ children, primary = false, ...rest }) => (
  <Box
    as="button"
    width="100%"
    height="auto"
    minH="10"
    position="relative"
    bg={primary ? "#FFEC44" : "rgba(40,40,40,0.7)"}
    color={primary ? "#000" : "#fff"}
    border="1px solid #000"
    borderRadius="none"
    fontWeight={primary ? "bold" : "medium"}
    zIndex={2}
    transition="transform 0.2s, background 0.2s"
    _hover={{ textDecoration: "none" }}
    _focusVisible={{ outline: "2px solid #FFEC44", outlineOffset: "2px" }}
    _disabled={{
      opacity: 0.5,
      cursor: "not-allowed",
      filter: "grayscale(80%)",
    }}
    fontFamily="'Courier New', monospace"
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
    {" "}
    {children}{" "}
    <MotionDiv
      style={{
        position: "absolute",
        bottom: "4px",
        left: "5%",
        height: "2px",
        background: primary ? "black" : "#FFEC44",
        zIndex: 3,
        width: 0,
      }}
    />{" "}
  </Box>
);
const SketchButton = ({
  children,
  primary = false,
  onClick = () => {},
  disabled = false,
  isLoading = false,
  size = "md",
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const underlineVariants = {
    rest: { width: 0 },
    hover: { width: "90%", transition: { duration: 0.3 } },
  };
  const isDisabled = disabled || isLoading;
  const fontSize = size === "sm" ? "xs" : "sm";
  const padding = size === "sm" ? 3 : 4;
  const minHeight = size === "sm" ? 8 : 10;
  return (
    <motion.div
      style={{ position: "relative", width: "100%" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={!isDisabled ? "hover" : "rest"}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      initial="rest"
    >
      {" "}
      <ScribbleEffect isActive={isHovered && !isDisabled} />{" "}
      {!isDisabled &&
        ["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos, idx) => (
          <motion.div
            key={pos}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isHovered ? { scale: 1, opacity: 0.8 } : { scale: 0, opacity: 0 }
            }
            transition={{
              duration: 0.2,
              delay: idx * 0.05,
              type: "spring",
              stiffness: 500,
            }}
            style={{
              position: "absolute",
              width: "8px",
              height: "8px",
              border: "2px solid #FFEC44",
              zIndex: 5,
              borderRadius: "none",
              ...(pos === "topLeft"
                ? { top: -4, left: -4, borderWidth: "2px 0 0 2px" }
                : pos === "topRight"
                ? { top: -4, right: -4, borderWidth: "2px 2px 0 0" }
                : pos === "bottomLeft"
                ? { bottom: -4, left: -4, borderWidth: "0 0 2px 2px" }
                : { bottom: -4, right: -4, borderWidth: "0 2px 2px 0" }),
            }}
          />
        ))}{" "}
      {!isDisabled && (
        <motion.div
          initial={{ opacity: 0.6, x: 3, y: 3 }}
          animate={
            isHovered
              ? { opacity: 0.9, x: 5, y: 5 }
              : { opacity: 0.6, x: 3, y: 3 }
          }
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: -1,
            border: "1px solid rgba(0,0,0,0.5)",
            borderRadius: "none",
          }}
          transition={{ duration: 0.2 }}
        />
      )}{" "}
      <SketchButtonInternal
        primary={primary}
        onClick={onClick}
        disabled={isDisabled}
        minH={minHeight}
        fontSize={fontSize}
        px={padding}
        {...rest}
      >
        {" "}
        {isLoading ? <Spinner size="xs" speed="0.8s" /> : children}{" "}
        <motion.div
          variants={underlineVariants}
          style={{
            position: "absolute",
            bottom: "4px",
            left: "5%",
            height: "2px",
            background: primary ? "black" : "#FFEC44",
            zIndex: 3,
          }}
        />{" "}
      </SketchButtonInternal>{" "}
    </motion.div>
  );
};
const SquigglyLine = ({
  color = "rgba(255, 236, 68, 0.8)",
  delay = 0,
  thickness = 1.5,
  dasharray = "3,2",
}) => (
  <MotionDiv
    initial={{ width: "0%" }}
    animate={{ width: "100%" }}
    transition={{ duration: 0.8, delay }}
    style={{ position: "relative", lineHeight: "0" }}
  >
    {" "}
    <svg
      width="100%"
      height="4"
      viewBox="0 0 300 4"
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {" "}
      <MotionPath
        d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={dasharray}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: delay + 0.7 }}
      />{" "}
    </svg>{" "}
  </MotionDiv>
);
const shadowVariants = {
  rest: { opacity: 0.6, x: 2, y: 2, transition: { duration: 0.2 } },
  hover: { opacity: 0.9, x: 4, y: 4, transition: { duration: 0.2 } },
};

// ========================================================================
// --- TVShowEpisodes COMPONENT (Inline Flow) ---
// ========================================================================

const TVShowEpisodes = ({
  tvId,
  totalSeasons /* Pass totalSeasons */,
  accentColor = "#FFEC44",
  cardBg = "rgba(30, 30, 40, 0.9)",
}) => {
  // --- State ---
  const [seasons, setSeasons] = useState([]);
  // Use totalSeasons passed from parent first
  const [numSeasons, setNumSeasons] = useState(totalSeasons || 0);
  const [selectedSeason, setSelectedSeason] = useState(undefined);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [hasSpecials, setHasSpecials] = useState(false);
  const sliderRef = useRef(null);

  // --- Theming ---
  const borderColor = "rgba(255, 255, 255, 0.1)";
  const mutedTextColor = "gray.400";
  const separatorColor = "rgba(255, 255, 255, 0.08)";

  // --- Fetch ONLY TV Details to check for specials if totalSeasons unknown ---
  useEffect(() => {
    let isMounted = true;
    // If totalSeasons wasn't passed, fetch details just to get season list structure
    if (tvId && numSeasons === 0) {
      fetchTVDetails(tvId)
        .then((data) => {
          if (isMounted && data.seasons?.length > 0) {
            const specialsSeason = data.seasons.find(
              (s) => s.season_number === 0
            );
            const regularSeasonCount = data.seasons.filter(
              (s) => s.season_number > 0
            ).length;
            setHasSpecials(!!specialsSeason);
            setNumSeasons(regularSeasonCount); // Set number of regular seasons
            // Default selection only if needed (and not already set)
            if (selectedSeason === undefined) {
              const defaultSeason =
                regularSeasonCount > 0 ? 1 : specialsSeason ? 0 : undefined;
              if (defaultSeason !== undefined) {
                setSelectedSeason(defaultSeason);
              } else {
                setLoadingEpisodes(false); // No valid default season
              }
            }
          } else if (isMounted) {
            setLoadingEpisodes(false); // No seasons found in fetch
          }
        })
        .catch((error) => {
          console.error(
            "Error fetching initial TV details for season check:",
            error
          );
          if (isMounted) setLoadingEpisodes(false);
        });
    } else if (numSeasons > 0 && selectedSeason === undefined) {
      // If we have totalSeasons prop, default to season 1 (or specials if no regular seasons)
      const defaultSeason = numSeasons > 0 ? 1 : hasSpecials ? 0 : undefined;
      if (defaultSeason !== undefined) setSelectedSeason(defaultSeason);
      else setLoadingEpisodes(false);
    } else if (numSeasons === 0 && !hasSpecials) {
      // If explicitly 0 seasons passed and no specials detected, stop loading
      setLoadingEpisodes(false);
    }

    return () => {
      isMounted = false;
    };
  }, [tvId, numSeasons, hasSpecials, selectedSeason]); // Rerun if selectedSeason is somehow still undefined

  // --- Fetch Episodes ---
  useEffect(() => {
    // Existing episode fetch logic...
    if (!tvId || selectedSeason === undefined || selectedSeason === null) {
      setEpisodes([]);
      setLoadingEpisodes(false);
      return;
    }
    let isMounted = true;
    const getSeasonEpisodes = async () => {
      setLoadingEpisodes(true);
      setEpisodes([]);
      try {
        const data = await fetchTVSeasonDetails(tvId, selectedSeason);
        if (isMounted) setEpisodes(data.episodes || []);
      } catch (error) {
        console.error(
          `Error fetching season ${selectedSeason} episodes:`,
          error
        );
        if (isMounted) setEpisodes([]);
      } finally {
        if (isMounted) setLoadingEpisodes(false);
      }
    };
    getSeasonEpisodes();
    return () => {
      isMounted = false;
    };
  }, [tvId, selectedSeason]);

  // --- Helpers ---
  const formatRuntime = (runtime) => {
    if (!runtime) return "-";
    const h = Math.floor(runtime / 60);
    const m = runtime % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const scrollSlider = (direction) => {
    /* ... keep scrollLeft/scrollRight logic ... */ if (!sliderRef.current)
      return;
    const c = sliderRef.current;
    const s = c.offsetWidth * 0.8;
    c.scrollTo({
      left: direction === "left" ? c.scrollLeft - s : c.scrollLeft + s,
      behavior: "smooth",
    });
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };
  const episodeVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // Generate season numbers array from totalSeasons prop
  const seasonNumbers = Array.from({ length: numSeasons }, (_, i) => i + 1);
  const showSeasonSelector = numSeasons > 0 || hasSpecials;

  // --- RENDER (Inline Flow) ---
  return (
    // Main Box for the section - respects parent container padding
    <Box width="100%">
      <Heading
        as="h2"
        size="lg"
        color="white"
        fontFamily="'Courier New', monospace"
        mb={2}
      >
        Episodes
      </Heading>
      <Box mb={6} w="60px">
        <SquigglyLine color={accentColor} thickness={2} dasharray="4,2" />
      </Box>

      {/* Season Selector Row (within parent padding) */}
      {showSeasonSelector && (
        <Box
          borderY="1px solid"
          borderColor={separatorColor}
          py={3}
          mb={8}
          mx={-4}
          /* Extend border to edge */ px={4} /* Re-apply padding inside */
        >
          <Flex
            overflowX="auto"
            css={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {/* Specials Button */}
            {hasSpecials && (
              <Box position="relative" mr={3} flexShrink={0}>
                <SketchButton
                  primary={selectedSeason === 0}
                  onClick={() => setSelectedSeason(0)}
                  size="sm"
                  aria-label="Select Specials Season"
                >
                  Specials
                </SketchButton>
                {selectedSeason === 0 && (
                  <Box position="absolute" bottom="-6px" left="10%" right="10%">
                    <SquigglyLine
                      color={accentColor}
                      thickness={1}
                      dasharray="2,2"
                    />
                  </Box>
                )}
              </Box>
            )}
            {/* Regular Season Buttons */}
            {seasonNumbers.map((seasonNum) => (
              <Box
                key={`season-${seasonNum}`}
                position="relative"
                mr={3}
                flexShrink={0}
              >
                <SketchButton
                  primary={selectedSeason === seasonNum}
                  onClick={() => setSelectedSeason(seasonNum)}
                  size="sm"
                  aria-label={`Select Season ${seasonNum}`}
                >
                  {`Season${seasonNum}`}
                </SketchButton>
                {selectedSeason === seasonNum && (
                  <Box position="absolute" bottom="-6px" left="10%" right="10%">
                    <SquigglyLine
                      color={accentColor}
                      thickness={1}
                      dasharray="2,2"
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Flex>
        </Box>
      )}

      {/* Episodes Slider Section (respects parent padding) */}
      <Box position="relative">
        {/* Slider Scrollable Container */}
        <Box
          ref={sliderRef}
          overflowX="auto"
          py={4}
          position="relative"
          mx={-4}
          /* Extend scroll area slightly */ px={4}
          /* Re-apply padding for content */ css={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            scrollSnapType: "x mandatory",
          }}
        >
          <MotionFlex
            gap={4}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={selectedSeason}
            minH="350px"
            alignItems="center"
          >
            {/* Loading State */}
            {loadingEpisodes && (
              <Flex justify="center" align="center" w="100%" h="320px">
                <Spinner
                  size="lg"
                  thickness="3px"
                  speed="0.7s"
                  color={accentColor}
                  emptyColor="rgba(255,255,255,0.1)"
                />
              </Flex>
            )}
            {/* Episode Cards */}
            {!loadingEpisodes &&
              episodes.length > 0 &&
              episodes.map((episode) => (
                <MotionBox
                  key={episode.id}
                  bg={cardBg}
                  borderRadius="none"
                  overflow="hidden"
                  border="1px solid"
                  borderColor={borderColor}
                  w="280px"
                  minWidth="280px"
                  h="auto"
                  display="flex"
                  flexDirection="column"
                  boxShadow="md"
                  variants={episodeVariants}
                  whileHover={{ y: -3 }}
                  scrollSnapAlign="start"
                >
                  {/* Thumbnail */}
                  <Box
                    position="relative"
                    height="158px"
                    width="100%"
                    borderRadius="none"
                    overflow="hidden"
                    bg="blackAlpha.400"
                  >
                    <Image
                      src={
                        episode?.still_path
                          ? `${baseImageW500}${episode.still_path}`
                          : comingSoon
                      }
                      alt={episode.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      opacity={!episode.still_path ? 0.5 : 1}
                    />
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      height="30px"
                      bgGradient={`linear(to-t, ${cardBg} 10%, transparent)`}
                    />
                    <Badge
                      position="absolute"
                      top={2}
                      left={2}
                      bg={accentColor}
                      color="black"
                      borderRadius="none"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                      fontWeight="bold"
                    >{`E${episode.episode_number}`}</Badge>
                    {episode.vote_average > 0 && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        bg="rgba(0,0,0,0.8)"
                        color="white"
                        borderRadius="none"
                        px={2}
                        py={0.5}
                        fontSize="xs"
                      >
                        <Flex align="center">
                          <FaStar
                            color={accentColor}
                            style={{ marginRight: "3px", fontSize: "0.8em" }}
                          />
                          {episode.vote_average.toFixed(1)}
                        </Flex>
                      </Badge>
                    )}
                  </Box>
                  {/* Details */}
                  <VStack p={3} flex="1" align="start" spacing={1.5}>
                    <Text
                      fontWeight="bold"
                      color="white"
                      noOfLines={1}
                      fontSize="sm"
                      fontFamily="'Courier New', monospace"
                    >
                      {episode.name}
                    </Text>
                    <Flex
                      w="100%"
                      mt={1}
                      align="center"
                      justify="space-between"
                      color={mutedTextColor}
                      fontSize="xs"
                    >
                      <Flex align="center">
                        <BsCalendarDate
                          style={{ marginRight: "4px", fontSize: "0.9em" }}
                        />
                        <Text>
                          {episode.air_date
                            ? new Date(episode.air_date).toLocaleDateString()
                            : "TBA"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <FaClock
                          style={{ marginRight: "4px", fontSize: "0.9em" }}
                        />
                        <Text>{formatRuntime(episode.runtime)}</Text>
                      </Flex>
                    </Flex>
                    <Box flex="1" mt={2} overflow="hidden" maxH="60px">
                      <Text
                        color={mutedTextColor}
                        fontSize="xs"
                        noOfLines={3}
                        lineHeight="1.5"
                      >
                        {truncateText(episode.overview, 100) ||
                          "No overview available."}
                      </Text>
                    </Box>
                    <Box pt={2} w="100%">
                      <SketchButton
                        size="sm"
                        primary
                        onClick={() =>
                          console.log(`Play Ep ${episode.episode_number}`)
                        }
                      >
                        <Flex align="center" justify="center">
                          <FaPlay
                            style={{ marginRight: "6px", fontSize: "0.8em" }}
                          />{" "}
                          Play
                        </Flex>
                      </SketchButton>
                    </Box>
                  </VStack>
                </MotionBox>
              ))}
            {/* No Episodes Message */}
            {!loadingEpisodes && episodes.length === 0 && (
              <Flex justify="center" align="center" w="100%" h="320px">
                <Text
                  color={mutedTextColor}
                  fontFamily="'Courier New', monospace"
                >
                  No episodes found for this season.
                </Text>
              </Flex>
            )}
          </MotionFlex>
        </Box>

        {/* --- Slider Arrows (Positioned relative to outer section Box) --- */}
        {/* Use absolute positioning but keep them *within* the parent component's flow/padding */}
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          left={{ md: 0, lg: 2 }}
          /* Adjust positioning inside padding */ top="55%"
          /* Position relative to Season Selector bottom */ transform="translateY(-50%)"
          zIndex={3}
        >
          <SketchButton
            onClick={() => scrollSlider("left")}
            size="sm"
            primary
            aria-label="Scroll episodes left"
          >
            <FaChevronLeft />
          </SketchButton>
        </Box>
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          right={{ md: 0, lg: 2 }}
          /* Adjust positioning inside padding */ top="55%"
          transform="translateY(-50%)"
          zIndex={3}
        >
          <SketchButton
            onClick={() => scrollSlider("right")}
            size="sm"
            primary
            aria-label="Scroll episodes right"
          >
            <FaChevronRight />
          </SketchButton>
        </Box>
      </Box>
    </Box> // End main component Box
  );
};

export default TVShowEpisodes;
