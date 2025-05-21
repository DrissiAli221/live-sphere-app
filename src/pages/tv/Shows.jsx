import React, { useEffect, useState, useCallback, useRef } from "react";
// --- Chakra UI Primitive Imports ---
// (Only use basic layout/text/image components as requested)
import {
  Box,
  Flex,
  Container,
  Image,
  Text,
  HStack,
  Badge,
  SimpleGrid,
  VStack,
  Heading,
} from "@chakra-ui/react";

// --- React Router Imports ---
import { Link, useNavigate } from "react-router-dom";

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Service/Util/Component Imports ---
import {
  baseImageOriginal,
  fetchMovieImages,
  fetchDetails,
  fetchTrendingTVShows,
  fetchGenres,
} from "@/services/api"; // Assuming correct path
import ContentGrid from "@/components/ContentGrid"; // Assuming correct path & it adheres to squarish theme
import {
  formatAirDateRange,
  getSeasonInfo,
  truncateText,
} from "@/utils/helper"; // Assuming correct path
import StreamingServiceSkeleton from "@/components/StreamingServiceSkeleton"; // Assuming correct path

// --- Icon Imports ---
import { FaPlay, FaInfoCircle, FaStar } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { FaClapperboard } from "react-icons/fa6";

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Definitions as provided/refined) ---
// ========================================================================

// --- Motion Primitives ---
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionHeading = motion(Heading); // For animating heading

const baseShadowColor = "rgba(0, 0, 0, 0.6)"; // Dark color for the offset shadow
const hoverAccentGlow = `rgba(255, 236, 68, 0.25)`; // Subtle yellow glow for hover

// Background Effects
const NOISE_OPACITY = 0.06;
const SCANLINES_OPACITY = 0.18;
const VIGNETTE_INTENSITY = 0.45;
const NOISE_BG_URL =
  "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVדהזה/v7+/v7+/v7+////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+///+/v7+/v7+/v7+/v7+/v7+/s8wT4AAAAF3RSTlPF48P117/Aw869zKrQuLOqphh5i59qcOMVsAAAAJZJREFUOI1jZobgMAIALAwMAyMWBgYW0AYsDLSAAVDCx/8D5cAxkvtR40lAFBl6vA5I7gBxQ7FBAmTk4b+DBwARHyG1DQEIGbQAAYQAHj6HjwxEHpXjF8AMDEQgUMDDhx4A9UikwMhoAAAUY4KHAACAEs6HF4HgQpAQAyNggkAJzAGYWFkAMjIKAEQz0mkwAACMQAAA1AUQAASYAFhI07u0aF4UAAAAAElFTkSuQmCC)";

const ACCENT_COLOR = "#FFEC44"; // Primary yellow accent    

// --- Scribble Effect ---
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
    />
  </motion.svg>
);

// --- Sketch Button Internal Element --- (Square style)
const SketchButtonInternal = ({ children, primary = false, ...rest }) => (
  <Box
    as="button"
    width="100%"
    height="10"
    position="relative"
    bg={primary ? "#FFEC44" : "rgba(40,40,40,0.7)"}
    color={primary ? "#000" : "#fff"}
    border="1px solid #000"
    borderRadius="none" // Explicitly square
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
    whiteSpace="nowrap"
    overflow="hidden"
    textOverflow="ellipsis"
    {...rest}
  >
    {children}
    {/* Placeholder for underline managed by parent */}
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
    />
  </Box>
);

// --- Sketch Button Wrapper --- (Handles animations, square corners)
const SketchButton = ({
  children,
  primary = false,
  onClick = () => {},
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const underlineVariants = {
    rest: { width: 0 },
    hover: { width: "90%", transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      style={{ position: "relative", width: "100%" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      initial="rest"
    >
      <ScribbleEffect isActive={isHovered && !disabled} />
      {/* Corner Doodles */}
      {!disabled &&
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
              /* Ensure square doodles */ ...(pos === "topLeft"
                ? { top: -4, left: -4, borderWidth: "2px 0 0 2px" }
                : pos === "topRight"
                ? { top: -4, right: -4, borderWidth: "2px 2px 0 0" }
                : pos === "bottomLeft"
                ? { bottom: -4, left: -4, borderWidth: "0 0 2px 2px" }
                : { bottom: -4, right: -4, borderWidth: "0 2px 2px 0" }),
            }}
          />
        ))}
      {/* Shadow */}
      {!disabled && (
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
      )}
      {/* Actual Button */}
      <SketchButtonInternal
        primary={primary}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
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
        />
      </SketchButtonInternal>
    </motion.div>
  );
};

// --- Squiggly Line ---
const SquigglyLine = ({
  color = "rgba(255, 236, 68, 0.8)",
  delay = 0,
  thickness = 1.5,
  dasharray = "3,2",
}) => (
  <MotionDiv
    initial={{ width: "0%" }}
    animate={{ width: "100%" }}
    transition={{ duration: 0.3, delay }}
    style={{ position: "relative", lineHeight: "0" }}
  >
    <svg
      width="100%"
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
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: delay }}
      />
    </svg>
  </MotionDiv>
);

// ========================================================================
// --- SHOWS COMPONENT ---
// ========================================================================

function Shows() {
  // --- State ---
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomShow, setRandomShow] = useState(null);
  const [featuredShows, setFeaturedShows] = useState([]);
  const [highlightedCategory, setHighlightedCategory] = useState("Popular");
  const carouselRef = useRef(null);
  const [isChangingShow, setIsChangingShow] = useState(false);
  const navigate = useNavigate();

  // --- Constants & Styles ---
  const baseBg = "#0C0C1B";
  const cardBg = "rgba(15, 15, 25, 0.85)";
  const accentColor = "#FFEC44";
  const gradientOverlay =
    "linear-gradient(rgba(0,0,0,0.1) 0%, rgba(12,12,27,0.6) 60%, rgba(12,12,27,1) 95%)"; // Smoother fade

  // --- Data Fetching & Helpers ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const tvShowsData = await fetchTrendingTVShows();
        const genresData = await fetchGenres("tv");
        const showsWithImagesAndDetails = await Promise.all(
          tvShowsData.slice(0, 12).map(async (show) => {
            const imageData = await fetchMovieImages("tv", show.id);
            const detailsData = await fetchDetails("tv", show.id);
            return {
              ...show,
              images: imageData,
              details: detailsData,
              genresData: genresData,
            };
          })
        );
        const remainingShows = tvShowsData.slice(12).map((show) => ({
          ...show,
          images: null,
          details: null,
          genresData: genresData,
        }));
        const allShows = [...showsWithImagesAndDetails, ...remainingShows];
        setTVShows(allShows);
        setFeaturedShows(
          showsWithImagesAndDetails
            .filter((show) => show.images?.backdrops?.length > 0)
            .slice(0, 6)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const hasValidLogo = useCallback(
    (show) =>
      show?.images?.logos?.length > 0 &&
      getEnglishLogo(show.images.logos)?.file_path,
    []
  );
  const hasValidBackdrop = useCallback(
    (show) => show?.images?.backdrops?.length > 0,
    []
  );

  const getRandomShow = useCallback(() => {
    if (tvShows.length === 0) return null;
    const eligibleShows = tvShows.filter((show) => hasValidBackdrop(show)); // Need at least backdrop
    if (eligibleShows.length === 0) return tvShows[0]; // Fallback if none have backdrop
    const randomIndex = Math.floor(Math.random() * eligibleShows.length);
    return eligibleShows[randomIndex];
  }, [tvShows, hasValidBackdrop]); // Add dependencies

  useEffect(() => {
    if (!loading && tvShows.length > 0) setRandomShow(getRandomShow());
  }, [loading, tvShows, getRandomShow]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsChangingShow(true);
      setTimeout(() => {
        setRandomShow(getRandomShow());
        setIsChangingShow(false);
      }, 600); // Slightly longer for smoother anim
    }, 8000);
    return () => clearInterval(intervalId);
  }, [getRandomShow, randomShow]); // Add randomShow dependency

  const getEnglishLogo = useCallback((logos) => {
    if (!logos || logos.length === 0) return null;
    const englishPngLogo = logos.find(
      (logo) =>
        logo.iso_639_1 === "en" &&
        logo.file_path?.toLowerCase().endsWith(".png")
    );
    if (englishPngLogo) return englishPngLogo;
    const anyPngLogo = logos.find((logo) =>
      logo.file_path?.toLowerCase().endsWith(".png")
    );
    if (anyPngLogo) return anyPngLogo;
    const englishLogo = logos.find((logo) => logo.iso_639_1 === "en");
    return englishLogo || logos[0];
  }, []);

  const getBackdropToUse = useCallback((show) => {
    if (!show?.images?.backdrops?.length > 0) return null;
    const nullLanguageBackdrop = show.images.backdrops.find(
      (b) => b.iso_639_1 === null
    );
    return nullLanguageBackdrop || show.images.backdrops[0];
  }, []);

  // --- Render Logic ---
  if (loading) {
    return <StreamingServiceSkeleton />; // Or a themed skeleton
  }

  const currentBackdrop = getBackdropToUse(randomShow);

  return (
    <Box position="relative" bg={baseBg} minHeight="100vh">
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
      <AnimatePresence mode="sync">
        {currentBackdrop && (
          <MotionBox
            key={randomShow?.id || "bg-fallback"}
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            width="100vw"
            height="100vh"
            zIndex={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            backgroundImage={`url(${baseImageOriginal}${currentBackdrop.file_path})`}
            backgroundSize="cover"
            backgroundPosition="center center"
            backgroundRepeat="no-repeat"
          >
            <Box position="absolute" inset={0} background={gradientOverlay} />
          </MotionBox>
        )}
      </AnimatePresence>
      {/* --- Hero Section --- */}
      <Box
        position="relative"
        minHeight="75vh"
        display="flex"
        alignItems="flex-end"
        pb={16}
        zIndex={1}
      >
        <Container maxW="container.xl" position="relative" pt="91px">
          {" "}
          {/* Adjust pt for fixed navbar height */}
          <AnimatePresence mode="wait">
            {randomShow && !isChangingShow && (
              <MotionFlex
                key={`content-${randomShow.id}`}
                direction="column"
                width="100%"
                color="white"
                pl={[2, 4, 8]}
                pr={[2, 4, 8]}
                position="relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              >
                {/* Logo/Title Area */}
                <Box
                  mb={[6, 8]}
                  maxWidth={["85%", "70%", "55%", "700px"]}
                  alignSelf={["center", "flex-start"]}
                  textAlign={["center", "left"]}
                >
                  {hasValidLogo(randomShow) ? (
                    <MotionImage
                      key={`logo-${randomShow.id}`}
                      src={`${baseImageOriginal}${
                        getEnglishLogo(randomShow.images.logos).file_path
                      }`}
                      alt={`${randomShow.name} logo`}
                      maxHeight={["100px", "150px", "180px"]}
                      objectFit="contain"
                      filter="drop-shadow(2px 4px 8px rgba(0,0,0,0.7))"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  ) : (
                    <MotionHeading
                      as={Heading}
                      size={["xl", "2xl", "3xl"]}
                      fontWeight="bold"
                      textShadow="2px 3px 8px rgba(0,0,0,0.9)"
                      fontFamily="'Courier New', monospace"
                      letterSpacing="tight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {randomShow.name}
                    </MotionHeading>
                  )}
                </Box>

                {/* Info Block Area */}
                <MotionFlex
                  direction="column"
                  maxWidth={["90%", "70%", "60%", "650px"]}
                  alignSelf={["center", "flex-start"]}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                    },
                  }}
                >
                  {/* Genre Tags with Enhanced Shadow */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { delay: 0.1 } }, // Added small delay
                    }}
                    // Ensure initial/animate are set correctly on the parent or here if needed
                  >
                    <HStack
                      spacing={2} // Horizontal spacing (works alongside gap)
                      mb={5}
                      wrap="wrap"
                      justify={["center", "flex-start"]}
                      gap={2} // Use gap for consistent row/column spacing on wrap
                    >
                      {randomShow.details?.genres?.slice(0, 3).map((genre) => (
                        <Badge
                          key={genre.id}
                          bg={cardBg} // Your card background variable
                          px={3}
                          py={1}
                          border="1px solid"
                          borderColor="rgba(255, 255, 255, 0.1)"
                          fontSize="xs"
                          color="white"
                          borderRadius="none" // Sharp corners
                          textTransform="uppercase"
                          letterSpacing="wide"
                          // --- Shadow Enhancement ---
                          boxShadow={`2px 2px 0px ${baseShadowColor}`} // Sharp offset shadow
                          transition="all 0.2s ease-out" // Smooth hover transitions
                          _hover={{
                            // Keep offset shadow & add accent glow
                            boxShadow: `2px 2px 0px ${baseShadowColor}, 0px 0px 6px 1px ${hoverAccentGlow}`,
                            transform: "translateY(-1px)", // Optional lift
                            borderColor: accentColor, // Optional border highlight
                          }}
                        >
                          {genre.name}
                        </Badge>
                      ))}
                    </HStack>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Flex
                      alignItems="center"
                      flexWrap="wrap"
                      gapX={5}
                      gapY={2}
                      mb={5}
                      justify={["center", "flex-start"]}
                    >
                      <Flex alignItems="center">
                        <BsCalendarDate
                          style={{
                            marginRight: "6px",
                            color: accentColor,
                            fontSize: "0.9em",
                          }}
                        />
                        <Text fontWeight="medium" fontSize={["sm", "md"]}>
                          {formatAirDateRange(randomShow)}
                        </Text>
                      </Flex>
                      <Flex alignItems="center">
                        <FaClapperboard
                          style={{
                            marginRight: "6px",
                            color: accentColor,
                            fontSize: "0.9em",
                          }}
                        />
                        <Text fontWeight="medium" fontSize={["sm", "md"]}>
                          {getSeasonInfo(randomShow)}
                        </Text>
                      </Flex>
                      {randomShow.vote_average > 0 && (
                        <Flex align="center">
                          <FaStar
                            style={{
                              marginRight: "6px",
                              color: accentColor,
                              fontSize: "0.9em",
                            }}
                          />
                          <Text fontWeight="bold" fontSize={["sm", "md"]}>
                            {randomShow.vote_average?.toFixed(1)}
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  </motion.div>
                  {/* Overview */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Box
                      maxHeight={["4.5rem", "6rem"]}
                      mb={6}
                      overflow="hidden"
                      position="relative"
                    >
                      <Text
                        fontSize={["sm", "md", "lg"]}
                        lineHeight="tall"
                        color="gray.200"
                      >
                        {truncateText(randomShow.overview, 180)}
                      </Text>
                      <Box
                        position="absolute"
                        bottom="0"
                        left="0"
                        right="0"
                        height="30px"
                        bgGradient={`linear(to-t, ${baseBg}, transparent)`}
                        pointerEvents="none"
                      />
                    </Box>
                  </motion.div>
                  {/* Buttons */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <HStack spacing={4} justify={["center", "flex-start"]}>
                      <Box w={["130px", "150px"]}>
                        {" "}
                        <SketchButton
                          primary
                          onClick={() => console.log("Watch clicked")}
                        >
                          {" "}
                          <Flex align="center" justify="center">
                            <FaPlay
                              style={{ marginRight: "8px", fontSize: "0.8em" }}
                            />{" "}
                            Watch
                          </Flex>{" "}
                        </SketchButton>{" "}
                      </Box>
                      <Box w={["130px", "150px"]}>
                        {" "}
                        <Link
                          to={`/tv/${randomShow.id}`}
                          style={{ width: "100%", display: "block" }}
                        >
                          {" "}
                          <SketchButton>
                            {" "}
                            <Flex align="center" justify="center">
                              <FaInfoCircle
                                style={{
                                  marginRight: "8px",
                                  fontSize: "0.9em",
                                }}
                              />{" "}
                              Details
                            </Flex>{" "}
                          </SketchButton>{" "}
                        </Link>{" "}
                      </Box>
                    </HStack>
                  </motion.div>
                </MotionFlex>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Container>
      </Box>
      {/* --- Sections Below Hero --- */}
      <Box position="relative" zIndex={1} bg={baseBg}>
        {" "}
        {/* Ensure content is above gradient/bg */}
        {/* --- Category Navigation --- */}
        <Box py={6} borderY="1px solid" borderColor="rgba(255,255,255,0.1)">
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
              {[
                "Popular",
                "New Releases",
                "Top Rated",
                "Trending",
                "Drama",
                "Comedy",
                "Sci-Fi",
              ].map((category) => (
                <Box
                  key={category}
                  cursor="pointer"
                  position="relative"
                  py={1}
                  px={1}
                  mx={1}
                  onClick={() => setHighlightedCategory(category)}
                  flexShrink={0}
                >
                  <Text
                    fontSize={["md", "lg"]}
                    fontWeight={
                      highlightedCategory === category ? "extrabold" : "medium"
                    }
                    color={
                      highlightedCategory === category ? "white" : "gray.400"
                    }
                    _hover={{ color: "white" }}
                    transition="all 0.2s"
                    letterSpacing="wide"
                    textTransform="uppercase"
                    fontFamily="'Courier New', monospace"
                  >
                    {category}
                  </Text>
                  {highlightedCategory === category && (
                    <Box
                      position="absolute"
                      bottom="-8px"
                      left="10%"
                      right="10%"
                    >
                      {" "}
                      <SquigglyLine
                        color={accentColor}
                        thickness={1.5}
                        dasharray="2,2"
                        delay={0.1}
                      />{" "}
                    </Box>
                  )}
                </Box>
              ))}
            </HStack>
          </Container>
        </Box>
        {/* --- Featured Shows Carousel (FULL WIDTH) --- */}
        <Box pt={10} pb={8}>
          <Container maxW="container.xl" mb={6} px={[4, 6, 8]}>
            <Box position="relative" display="inline-block">
              <Heading
                size="lg"
                color="white"
                fontFamily="'Courier New', monospace"
              >
                Featured
              </Heading>
              <Box position="absolute" bottom="-10px" left="0" w="70px">
                {" "}
                <SquigglyLine
                  color={accentColor}
                  thickness={2}
                  dasharray="4,2"
                />{" "}
              </Box>
            </Box>
          </Container>
          <Box
            ref={carouselRef}
            overflowX="auto"
            css={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
            px={[4, 6, 8]}
          >
            <Flex gap={5} pb={4}>
              {featuredShows.map((show) => (
                <MotionBox
                  key={show.id}
                  minWidth={["240px", "280px"]}
                  borderRadius="none"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="lg"
                  position="relative"
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <Box position="relative" height="160px">
                    {show.images?.backdrops?.length > 0 ? (
                      <Image
                        src={`${baseImageOriginal}${
                          show.images?.backdrops[1]?.file_path ||
                          show.images?.backdrops[0]?.file_path
                        }`}
                        alt={show.name}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                      />
                    ) : (
                      <Flex
                        bg="gray.800"
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="gray.500" fontSize="sm">
                          No Image
                        </Text>
                      </Flex>
                    )}
                    <Box
                      position="absolute"
                      inset={0}
                      bgGradient={`linear(to-t, ${cardBg} 5%, transparent 60%)`}
                    />
                    <Badge
                      position="absolute"
                      top={2}
                      left={2}
                      bg="rgba(0,0,0,0.8)"
                      px={2}
                      py={1}
                      borderRadius="none"
                      display="flex"
                      alignItems="center"
                      border="1px solid"
                      borderColor="rgba(255,255,255,0.1)"
                    >
                      <FaClapperboard
                        style={{ marginRight: "4px", fontSize: "0.8em" }}
                      />{" "}
                      <Text fontSize="xs">
                        {show.details?.number_of_seasons || "?"}
                      </Text>
                    </Badge>
                    {show.vote_average > 0 && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        bg="rgba(0,0,0,0.8)"
                        px={2}
                        py={1}
                        borderRadius="none"
                        display="flex"
                        alignItems="center"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.1)"
                      >
                        <FaStar
                          color="#FFEC44"
                          style={{ marginRight: "4px", fontSize: "0.8em" }}
                        />{" "}
                        <Text fontSize="xs">
                          {show.vote_average.toFixed(1)}
                        </Text>
                      </Badge>
                    )}
                  </Box>
                  <VStack p={4} align="start" spacing={3}>
                    <Heading
                      size="sm"
                      noOfLines={1}
                      fontFamily="'Courier New', monospace"
                    >
                      {show.name}
                    </Heading>
                    <Text fontSize="xs" color="gray.400" noOfLines={1}>
                      {show.details?.genres
                        ?.slice(0, 2)
                        .map((g) => g.name)
                        .join(" • ") || ""}
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.300"
                      noOfLines={2}
                      h="2.7em"
                    >
                      {truncateText(show.overview, 70)}
                    </Text>
                    <Flex width="100%" justifyContent="flex-end" mt={2}>
                      <Box w="110px">
                        {" "}
                        <Link
                          to={`/tv/${show.id}`}
                          style={{ width: "100%", display: "block" }}
                        >
                          {" "}
                          <SketchButton>Details</SketchButton>{" "}
                        </Link>{" "}
                      </Box>
                    </Flex>
                  </VStack>
                </MotionBox>
              ))}
            </Flex>
          </Box>
        </Box>
        {/* --- TV Show Grid Section --- */}
        <Box py={10}>
          <Container maxW="container.xl" px={[4, 6, 8]}>
            <Box position="relative" display="inline-block" mb={8}>
              <Heading
                size="lg"
                color="white"
                fontFamily="'Courier New', monospace"
              >
                Discover
              </Heading>
              <Box position="absolute" bottom="-10px" left="0" w="70px">
                {" "}
                <SquigglyLine
                  color={accentColor}
                  thickness={2}
                  dasharray="4,2"
                />{" "}
              </Box>
            </Box>
            <SimpleGrid columns={[2, 3, 4, 5]} gap={4}>
              {tvShows.slice(0, 10).map((item, index) => (
                <ContentGrid
                  key={item.id}
                  item={item}
                  index={index}
                  contentType="tv"
                  baseImageOriginal={baseImageOriginal}
                  genreMap={item.genresData?.genres}
                />
              ))}
            </SimpleGrid>
            <Flex justify="center" mt={12}>
              <Box w={["160px", "180px"]}>
                {" "}
                <SketchButton onClick={() => console.log("Load More...")}>
                  Load More
                </SketchButton>{" "}
              </Box>
            </Flex>
          </Container>
        </Box>
      </Box>{" "}
      {/* End content below hero */}
    </Box> // End main relative box
  );
}

export default Shows;
