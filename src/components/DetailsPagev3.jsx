import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
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
} from "@chakra-ui/react";
import { motion } from "framer-motion";

import {
  baseImageOriginal,
  baseImageW500,
  fetchCredits,
  fetchDetails,
  fetchMovieImages,
} from "@/services/api";

import { convertMinutesToHours, resolveRatingNumber } from "@/utils/helper";
import TVShowEpisodes from "./TVShowEpisodes";
import MovieDetailsPage from "./MovieDetailsPage";
import { useAuth } from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { useFirestore } from "@/services/firestore";
import { FaPlay, FaStar, FaClock, FaUsers, FaFilm } from "react-icons/fa";
import { MdBookmarkAdd, MdBookmarkAdded } from "react-icons/md";
import RecommendationsSection from "./RecommendationSection";

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Definitions as used in Shows component) ---
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionHeading = motion(Heading);

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
// --- Sketch Button Internal ---
const SketchButtonInternal = ({ children, primary = false, ...rest }) => (
  <Box
    as="button"
    width="100%"
    height="10"
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
// --- Sketch Button Wrapper ---
const SketchButton = ({
  children,
  primary = false,
  onClick = () => {},
  disabled = false,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const underlineVariants = {
    rest: { width: 0 },
    hover: { width: "90%", transition: { duration: 0.3 } },
  };
  const isDisabled = disabled || isLoading;
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

// --- Shadow Variant for Hover Effect ---
const shadowVariants = {
  rest: { opacity: 0.6, x: 2, y: 2, transition: { duration: 0.2 } },
  hover: { opacity: 0.9, x: 4, y: 4, transition: { duration: 0.2 } },
};

// --- Theming ---
const baseBg = "#0C0C1B";
const accentColor = "#FFEC44";
const overlayBgGradient = `linear-gradient(180deg, rgba(12,12,27,0.1) 0%, rgba(12,12,27,0.6) 50%, ${baseBg} 90%)`;
const cardBg = "rgba(30, 30, 40, 0.9)";
const mutedTextColor = "gray.400";
const borderColor = "rgba(255, 255, 255, 0.1)";
const headingFont = "'Courier New', monospace";
const themeProps = {
  accentColor,
  cardBg,
  borderColor,
  mutedTextColor,
  headingFont,
};

// ========================================================================
// --- DetailsPage COMPONENT (Button Fix + Shadows) ---
// ========================================================================

function DetailsPage() {
  // --- State ---
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState(null);
  const [isInWatchList, setIsInWatchList] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false); // Specific state for button action
  const [isPosterHovered, setIsPosterHovered] = useState(false); // State for poster hover

  // --- Hooks ---
  const { type, id } = useParams();
  const { user } = useAuth();
  const { addToWatchList, checkIfAlreadyInWatchList, removeFromWatchList } =
    useFirestore();

  // --- Theming Constants ---
  const baseBg = "#0C0C1B";
  const accentColor = "#FFEC44";
  const overlayBg = `linear-gradient(0deg, ${baseBg} 10%, rgba(12,12,27,0.7) 70%, rgba(0,0,0,0.2) 100%)`;
  const cardBg = "rgba(25, 25, 35, 0.85)";
  const mutedTextColor = "gray.400";
  const borderColor = "rgba(255, 255, 255, 0.1)";

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    setDetails(null);
    setCredits(null);
    setImages(null);
    setIsInWatchList(false);
    // No need to set isWatchlistLoading here for the initial page load check
    const fetchAllData = async () => {
      try {
        const [detailsData, creditsData, imageData] = await Promise.all([
          fetchDetails(type, id),
          fetchCredits(type, id),
          fetchMovieImages(type, id),
        ]);
        setDetails(detailsData);
        setCredits(creditsData);
        setImages(imageData);
      } catch (error) {
        console.error("Error fetching details page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [type, id]);

  // --- Watchlist State Check (FIXED - No Button Loading Here) ---
  useEffect(() => {
    if (loading || !user || !details) {
      setIsInWatchList(false); // Set default if no user/details or still loading page
      return; // Exit if not applicable yet
    }
    // Only check when dependencies are ready
    let isMounted = true;
    checkIfAlreadyInWatchList(user.uid, id)
      .then((res) => {
        if (isMounted) setIsInWatchList(res);
      })
      .catch((err) => console.error("Watchlist check error:", err));
    // No setIsWatchlistLoading here

    return () => {
      isMounted = false;
    };
  }, [user, id, details, checkIfAlreadyInWatchList, loading]); // loading dependency ensures it runs after details are loaded

  // --- Helper Functions ---
  const getEnglishLogo = useCallback((logos) => {
    /* ... as before ... */ if (!logos || logos.length === 0) return null;
    const pngLogo = logos.find(
      (logo) =>
        logo.iso_639_1 === "en" &&
        logo.file_path?.toLowerCase().endsWith(".png")
    );
    if (pngLogo) return pngLogo;
    const englishLogo = logos.find((logo) => logo.iso_639_1 === "en");
    return englishLogo || logos[0];
  }, []);
  const getCreator = useCallback(() => {
    /* ... as before ... */ if (!details && !credits) return null;
    if (type === "tv" && details?.created_by?.length > 0)
      return details.created_by[0];
    if (type === "movie" && credits?.crew)
      return credits.crew.find((person) => person.job === "Director");
    return null;
  }, [details, credits, type]);
  const creator = getCreator();

  // --- Watchlist Handlers ---
  const handleWatchlistAction = async () => {
    if (!user) {
      /* toaster */ return;
    }
    if (!details) return;
    setIsWatchlistLoading(true); // Start loading NOW (only on click)
    try {
      if (isInWatchList) {
        await removeFromWatchList(user.uid, details.id.toString(), type);
        setIsInWatchList(false); /* toaster success */
      } else {
        const data = {
          id: details.id,
          title: details.title || details.name,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          vote_average: details.vote_average,
          release_date: details.release_date || details.first_air_date,
          type: type,
          dateAdded: new Date().toISOString(),
        };
        await addToWatchList(data, user.uid, details.id.toString());
        setIsInWatchList(true); /* toaster success */
      }
    } catch (error) {
      console.error("Watchlist action error:", error); /* toaster error */
    } finally {
      setIsWatchlistLoading(false);
    } // Stop loading
  };

  // --- RENDER ---
  if (loading) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100vh"
        width="100%"
        bg={baseBg}
      >
        {" "}
        <Spinner
          size="xl"
          thickness="3px"
          speed="0.7s"
          color={accentColor}
          emptyColor="rgba(255,255,255,0.1)"
        />{" "}
      </Flex>
    );
  }
  if (!details) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100vh"
        width="100%"
        bg={baseBg}
        color="white"
      >
        {" "}
        <Text>Failed to load details.</Text>{" "}
      </Flex>
    );
  }

  const logo = getEnglishLogo(images?.logos);

  return (
    <Box position="relative" minHeight="100vh">
      <Toaster />
      {/* --- Background with Enhanced Overlay --- */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        backgroundImage={`url(${baseImageOriginal}/${details?.backdrop_path})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundAttachment="fixed"
        _after={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(0deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.80) 100%)`,
          backdropFilter: "blur(1px)",
        }}
      >
        {details?.backdrop_path && (
          <Image
            src={`${baseImageOriginal}/${details.backdrop_path}`}
            alt="Background"
            width="100%"
            height="100%"
            objectFit="cover"
            opacity={0.8}
            filter="blur(2px)"
          />
        )}
      </Box>

      {/* --- Main Content Area --- */}
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        pt="110px"
        pb={16}
        px={{ base: 4, md: 8, lg: 12 }}
      >
        <Container maxW="1400px" mx="auto">
          {/* --- Header Section --- */}
          <MotionFlex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-end" }}
            mb={10}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Poster with Shadow */}
            <MotionBox // Wrapper for hover and relative positioning
              position="relative"
              w={{ base: "150px", sm: "180px", md: "220px" }}
              h={{ base: "225px", sm: "270px", md: "330px" }}
              flexShrink={0}
              mr={{ md: 8 }} // Margin applied here
              mb={{ base: 6, md: 0 }}
              onMouseEnter={() => setIsPosterHovered(true)}
              onMouseLeave={() => setIsPosterHovered(false)}
              initial="rest"
              animate={isPosterHovered ? "hover" : "rest"} // Control shadow via parent state
            >
              {/* Shadow Div */}
              <motion.div
                variants={shadowVariants} // Use shared variants
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.9)",
                  zIndex: -1,
                  border: "1px solid rgba(0,0,0,0.5)",
                  borderRadius: "none",
                }}
              />
              {/* Actual Poster Box */}
              <MotionBox
                w="100%"
                h="100%"
                borderRadius="none"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="0 10px 25px rgba(0,0,0,0.5)" // Can keep base shadow
                position="relative" // Ensure image is above shadow div if needed
                zIndex={1}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {details.poster_path ? (
                  <Image
                    src={`${baseImageW500}/${details.poster_path}`}
                    alt="Poster"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                ) : (
                  <Flex
                    w="100%"
                    h="100%"
                    bg="rgba(0,0,0,0.3)"
                    align="center"
                    justify="center"
                  >
                    <Text color={mutedTextColor} fontSize="sm">
                      No Poster
                    </Text>
                  </Flex>
                )}
              </MotionBox>
            </MotionBox>

            {/* Info */}
            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={4}
              /* Removed ml={{md:8}} */ mt={{ base: 6, md: 0 }}
              flexGrow={1}
            >
              {/* Title/Logo, Meta, Genres (as before) */}
              <Box w="100%" mb={2}>
                {/* ... Logo or Heading ... */}{" "}
                {logo?.file_path ? (
                  <Image
                    src={`${baseImageOriginal}${logo.file_path}`}
                    alt={details.title || details.name}
                    maxH={["80px", "100px"]}
                    objectFit="contain"
                    mx={{ base: "auto", md: 0 }}
                    filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))"
                  />
                ) : (
                  <Heading
                    as="h1"
                    size={["xl", "2xl"]}
                    color="white"
                    textAlign={{ base: "center", md: "left" }}
                    fontFamily="'Courier New', monospace"
                    textTransform="uppercase"
                    letterSpacing="tight"
                    textShadow="1px 2px 5px rgba(0,0,0,0.7)"
                  >
                    {" "}
                    {details.title || details.name}{" "}
                  </Heading>
                )}{" "}
              </Box>
              <HStack
                spacing={5}
                color={mutedTextColor}
                fontSize="sm"
                wrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
              >
                {" "}
                {details.release_date && (
                  <Text>
                    {new Date(
                      details.release_date || details.first_air_date
                    ).getFullYear()}
                  </Text>
                )}{" "}
                {(details.runtime > 0 || details.episode_run_time?.[0] > 0) && (
                  <Flex align="center">
                    <FaClock
                      style={{
                        marginRight: "4px",
                        color: accentColor,
                        fontSize: "0.9em",
                      }}
                    />{" "}
                    <Text>
                      {convertMinutesToHours(
                        details.runtime || details.episode_run_time?.[0]
                      )}
                    </Text>{" "}
                  </Flex>
                )}{" "}
                {details.vote_average > 0 && (
                  <Flex align="center">
                    <FaStar
                      style={{
                        marginRight: "4px",
                        color: accentColor,
                        fontSize: "0.9em",
                      }}
                    />
                    <Text fontWeight="bold" color="white">
                      {details.vote_average.toFixed(1)}
                    </Text>{" "}
                    <Text ml={1.5}>
                      ({resolveRatingNumber(details.vote_count)})
                    </Text>{" "}
                  </Flex>
                )}{" "}
              </HStack>
              <HStack
                spacing={2}
                mt={1}
                flexWrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
              >
                {" "}
                {details?.genres?.map((genre) => (
                  <Box
                    key={genre.id}
                    bg={cardBg}
                    px={3}
                    py={0.5}
                    border="1px solid"
                    borderColor={borderColor}
                    fontSize="xs"
                    color="white"
                    borderRadius="none"
                  >
                    {genre.name}
                  </Box>
                ))}{" "}
              </HStack>

              {/* Action Buttons (Watchlist button fix) */}
              <Flex
                gap={4}
                mt={6}
                wrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
              >
                <Box w="150px">
                  <SketchButton
                    primary
                    onClick={() => console.log("Play Trailer/Show")}
                  >
                    <Flex align="center" justify="center">
                      <FaPlay
                        style={{ marginRight: "8px", fontSize: "0.8em" }}
                      />{" "}
                      Play
                    </Flex>
                  </SketchButton>
                </Box>
                <Box w="160px">
                  <SketchButton
                    onClick={handleWatchlistAction}
                    primary={isInWatchList}
                    isLoading={isWatchlistLoading} // Use the specific loading state
                    disabled={!user || isWatchlistLoading} // Disable if not logged in OR during action
                  >
                    <Flex align="center" justify="center" minH="20px">
                      {" "}
                      {/* Ensure minimum height for spinner */}
                      {/* Content changes based on state, isLoading handled by prop */}
                      {isInWatchList ? (
                        <>
                          {" "}
                          <MdBookmarkAdded
                            style={{ marginRight: "8px", fontSize: "1.1em" }}
                          />{" "}
                          Added{" "}
                        </>
                      ) : (
                        <>
                          {" "}
                          <MdBookmarkAdd
                            style={{ marginRight: "8px", fontSize: "1.1em" }}
                          />{" "}
                          Add List{" "}
                        </>
                      )}
                    </Flex>
                  </SketchButton>
                </Box>
              </Flex>
            </VStack>
          </MotionFlex>

          {/* --- Details Grid (Description, Cast etc.) --- */}
          <Flex
            mt={12}
            gap={{ base: 8, lg: 12 }}
            direction={{ base: "column", lg: "row" }}
          >
            {/* Left Column */}
            <VStack flex={{ lg: 2 }} align="flex-start" spacing={8}>
              {/* Synopsis */}
              <Box w="100%">
                {" "}
                <Heading
                  as="h2"
                  size="md"
                  color={accentColor}
                  mb={3}
                  textTransform="uppercase"
                  letterSpacing="widest"
                  fontFamily="'Courier New', monospace"
                >
                  {" "}
                  Synopsis{" "}
                </Heading>{" "}
                <Text color="gray.200" fontSize="md" lineHeight="taller">
                  {details?.overview}
                </Text>{" "}
              </Box>
              {/* Creator/Director */}
              {creator && (
                <Box w="100%">
                  {" "}
                  <Heading
                    as="h3"
                    size="sm"
                    color={accentColor}
                    mb={4}
                    textTransform="uppercase"
                    letterSpacing="widest"
                    fontFamily="'Courier New', monospace"
                  >
                    {" "}
                    {creator.job === "Director" ? "Director" : "Creator"}{" "}
                  </Heading>{" "}
                  <Flex alignItems="center">
                    {" "}
                    <Box
                      w="55px"
                      h="55px"
                      borderRadius="none"
                      overflow="hidden"
                      border="1px solid"
                      borderColor={borderColor}
                      flexShrink={0}
                    >
                      {" "}
                      {creator.profile_path ? (
                        <Image
                          src={`${baseImageW500}${creator.profile_path}`}
                          alt={creator.name}
                          width="100%"
                          height="100%"
                          objectFit="cover"
                        />
                      ) : (
                        <Flex
                          w="100%"
                          h="100%"
                          bg="rgba(0,0,0,0.3)"
                          align="center"
                          justify="center"
                        >
                          <Text color={mutedTextColor} fontSize="xs">
                            No Pic
                          </Text>
                        </Flex>
                      )}{" "}
                    </Box>{" "}
                    <Box ml={4}>
                      {" "}
                      <Text color="white" fontSize="md" fontWeight="bold">
                        {creator.name}
                      </Text>{" "}
                      {creator.job && (
                        <Text color={mutedTextColor} fontSize="sm">
                          {creator.job}
                        </Text>
                      )}{" "}
                    </Box>{" "}
                  </Flex>{" "}
                </Box>
              )}
            </VStack>

            {/* Right Column */}
            <VStack flex={{ lg: 1 }} align="flex-start" spacing={8}>
              {/* Cast Section with Shadow */}
              <Box w="100%">
                <Heading
                  as="h2"
                  size="md"
                  color={accentColor}
                  mb={4}
                  textTransform="uppercase"
                  letterSpacing="widest"
                  fontFamily="'Courier New', monospace"
                >
                  {" "}
                  Top Cast{" "}
                </Heading>
                <VStack align="stretch" spacing={4}>
                  {credits?.cast &&
                    credits.cast.slice(0, 5).map((cast) => (
                      <MotionFlex // Add motion for hover effect on the whole row
                        key={cast.id}
                        alignItems="center"
                        whileHover="hover" // Trigger hover state for children
                        initial="rest"
                      >
                        {/* Wrapper for Image + Shadow */}
                        <MotionBox position="relative" mr={3}>
                          {/* Shadow Div */}
                          <motion.div
                            variants={shadowVariants} // Use variants for animation
                            style={{
                              position: "absolute",
                              inset: -1,
                              /* Slight inset for shadow */ background:
                                "rgba(0,0,0,0.9)",
                              zIndex: 0,
                              /* Behind image box */ border:
                                "1px solid rgba(0,0,0,0.5)",
                              borderRadius: "none",
                            }}
                          />
                          {/* Actual Image Box */}
                          <Box
                            w="45px"
                            h="45px"
                            borderRadius="none"
                            overflow="hidden"
                            border="1px solid"
                            borderColor={borderColor}
                            flexShrink={0}
                            position="relative"
                            zIndex={1} /* Above shadow */
                          >
                            {cast.profile_path ? (
                              <Image
                                src={`${baseImageW500}${cast.profile_path}`}
                                alt={cast.name}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                              />
                            ) : (
                              <Flex
                                w="100%"
                                h="100%"
                                bg="rgba(0,0,0,0.3)"
                                align="center"
                                justify="center"
                              >
                                <Text color={mutedTextColor} fontSize="xs">
                                  No Pic
                                </Text>
                              </Flex>
                            )}
                          </Box>
                        </MotionBox>

                        {/* Text Info */}
                        <Box>
                          <Text
                            color="white"
                            fontSize="sm"
                            fontWeight="bold"
                            noOfLines={1}
                          >
                            {cast.name}
                          </Text>
                          {cast.character && (
                            <Text
                              color={mutedTextColor}
                              fontSize="xs"
                              noOfLines={1}
                            >
                              as {cast.character}
                            </Text>
                          )}
                        </Box>
                      </MotionFlex>
                    ))}
                </VStack>
                {/* {credits?.cast?.length > 5 && (
                  <Flex justify="flex-end" mt={4}>
                    <Box w="120px">
                      <SketchButton
                        onClick={() => console.log("Show all cast")}
                      >
                        View All
                      </SketchButton>
                    </Box>
                  </Flex>
                )} */}
              </Box>
            </VStack>
          </Flex>

          {/* --- Conditional Sections --- */}
          <Box mt={16}>
            {type === "tv" && details && <TVShowEpisodes tvId={id} />}
            {type === "movie" && details && (
              <MovieDetailsPage
                movieId={details.id}
                details={details}
                accentColor={accentColor}
                cardBg={cardBg}
                borderColor={borderColor}
                mutedTextColor={mutedTextColor}
                headingFont="'Courier New', monospace"
              />
            )}
            {/* --- Recommendations --- */}
            {details && (
              <Box
                borderTop="1px solid"
                borderColor={borderColor}
                pt={12} /* Increased pt */
              >
                <RecommendationsSection
                  itemId={id}
                  itemType={type}
                  themeProps={themeProps}
                />
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default DetailsPage;
