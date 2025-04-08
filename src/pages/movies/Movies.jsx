import React, { useEffect, useState, useCallback, useRef } from "react";

// --- Chakra UI Primitive Imports ---
// (Minimal Usage)
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
import { Link, useNavigate } from "react-router-dom"; // Use React Router Link

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Service/Util/Component Imports ---
import {
  baseImageOriginal,
  fetchMovieImages, // Ensure this is used or imported correctly if needed
  fetchDetails, // Used for detailed info
  fetchTrendingMovies,
  fetchGenres, // Import fetchGenres
  baseImageW500,
} from "@/services/api"; // Adjust path
import ContentGrid from "@/components/ContentGrid"; // Adjust path
import {
  convertMinutesToHours, // Keep if needed for display
  truncateText, // Keep for overviews
} from "@/utils/helper"; // Adjust path
import StreamingServiceSkeleton from "@/components/StreamingServiceSkeleton"; // Adjust path

// --- Icon Imports ---
import { FaPlay, FaInfoCircle, FaStar, FaClock } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Definitions assumed to be available) ---
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionHeading = motion(Heading); // Re-add if needed

const baseShadowColor = "rgba(0, 0, 0, 0.6)"; // Dark color for the offset shadow
const hoverAccentGlow = `rgba(255, 236, 68, 0.25)`; // Subtle yellow glow for hover

// --- Paste SketchButton, SquigglyLine, ScribbleEffect definitions here ---
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
// --- Movies COMPONENT (Themed like Shows) ---
// ========================================================================

function Movies() {
  // --- State ---
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomMovie, setRandomMovie] = useState(null);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [highlightedCategory, setHighlightedCategory] = useState("Popular"); // Can reuse for movie categories
  const [genreMap, setGenreMap] = useState({}); // Store movie genres
  const carouselRef = useRef(null);
  const [isChangingMovie, setIsChangingMovie] = useState(false);
  const navigate = useNavigate();

  // --- Theming ---
  const baseBg = "#0C0C1B";
  const cardBg = "rgba(30, 30, 40, 0.9)"; // Consistent themed card BG
  const accentColor = "#FFEC44"; // Consistent Yellow Accent
  const gradientOverlay =
    "linear-gradient(rgba(0,0,0,0.1) 0%, rgba(12,12,27,0.6) 60%, #0C0C1B 95%)"; // BaseBG at bottom
  const borderColor = "rgba(255, 255, 255, 0.1)";
  const mutedTextColor = "gray.400";
  const headingFont = "'Courier New', monospace";

  // --- Fetch Data ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [moviesData, genresData] = await Promise.all([
          fetchTrendingMovies(),
          fetchGenres("movie"), // Fetch movie genres
        ]);

        // Create a genre map
        const genresMap = genresData.reduce((acc, genre) => {
          acc[genre.id] = genre.name;
          return acc;
        }, {});
        setGenreMap(genresMap);

        // Add genre names to movie objects
        const moviesWithGenres = moviesData.map((movie) => ({
          ...movie,
          genreNames: movie.genre_ids
            .map((id) => genresMap[id])
            .filter(Boolean), // Map IDs to names
        }));

        // Fetch details and images only for the first few for performance
        const detailedMovies = await Promise.all(
          moviesWithGenres.slice(0, 8).map(async (movie) => {
            // Fetch more details initially for carousel maybe
            try {
              // Add individual try/catch for robustness
              const [imageData, detailsData] = await Promise.all([
                fetchMovieImages("movie", movie.id),
                fetchDetails("movie", movie.id),
              ]);
              return { ...movie, images: imageData, details: detailsData };
            } catch (detailError) {
              console.warn(
                `Could not fetch details/images for movie ${movie.id}:`,
                detailError
              );
              return movie; // Return movie without details if fetch fails
            }
          })
        );

        // Combine detailed and basic movies
        const allMovies = [
          ...detailedMovies,
          ...moviesWithGenres.slice(8), // Rest have only basic info + genre names
        ];

        setMovies(allMovies);

        // Set featured movies (e.g., first 6 with good backdrop & details)
        setFeaturedMovies(
          detailedMovies
            .filter((m) => m.details && m.images?.backdrops?.length > 0)
            .slice(0, 6)
        );
      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- Helpers (Mostly same as Shows, adapted for movies) ---
  const hasValidLogo = useCallback(
    (movie) =>
      movie?.images?.logos?.length > 0 &&
      getEnglishLogo(movie.images.logos)?.file_path,
    []
  );
  const hasValidBackdrop = useCallback(
    (movie) => movie?.images?.backdrops?.length > 0,
    []
  );
  const getRandomMovie = useCallback(() => {
    if (movies.length === 0) return null;
    const eligibleMovies = movies.filter(
      (m) =>
        m.details &&
        m.images?.logos?.length > 0 &&
        m.images?.backdrops?.length > 0
    );
    if (eligibleMovies.length > 0) {
      return eligibleMovies[Math.floor(Math.random() * eligibleMovies.length)];
    }
    // Fallback: movie with backdrop
    const backdropMovie = movies.find(hasValidBackdrop);
    if (backdropMovie) return backdropMovie;
    // Last resort: first movie
    return movies[0];
  }, [movies, hasValidLogo, hasValidBackdrop]);
  useEffect(() => {
    if (!loading && movies.length > 0 && !randomMovie)
      setRandomMovie(getRandomMovie());
  }, [loading, movies, getRandomMovie, randomMovie]); // Ensure it runs only once initially or if randomMovie is null
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsChangingMovie(true);
      setTimeout(() => {
        setRandomMovie(getRandomMovie());
        setIsChangingMovie(false);
      }, 600);
    }, 9000 /* Slightly longer for movies? */);
    return () => clearInterval(intervalId);
  }, [getRandomMovie, randomMovie]);
  const getEnglishLogo = useCallback((logos) => {
    if (!logos || logos.length === 0) return null;
    const p = logos.find(
      (l) => l.iso_639_1 === "en" && l.file_path?.toLowerCase().endsWith(".png")
    );
    if (p) return p;
    const e = logos.find((l) => l.iso_639_1 === "en");
    return e || logos[0];
  }, []);
  const getBackdropToUse = useCallback((movie) => {
    if (!movie?.images?.backdrops?.length > 0) return null;
    const n = movie.images.backdrops.find((b) => b.iso_639_1 === null);
    return n || movie.images.backdrops[0];
  }, []);

  // --- Render Logic ---
  if (loading) {
    return <StreamingServiceSkeleton />;
  }

  const currentBackdrop = getBackdropToUse(randomMovie);

  return (
    <Box position="relative" bg={baseBg} minHeight="100vh">
      {/* --- Fixed Background --- */}
      <AnimatePresence mode="sync">
        {currentBackdrop && (
          <MotionBox
            key={randomMovie?.id || "bg-fallback"}
            position="fixed"
            inset={0}
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
      {/* --- Hero Section (Themed like Shows) --- */}
      <Box
        position="relative"
        minHeight="75vh"
        display="flex"
        alignItems="flex-end"
        pb={16}
        zIndex={1}
      >
        <Container
          maxW="1400px"
          position="relative"
          pt="91px"
          mx="auto"
          px={{ base: 4, md: 8, lg: 12 }}
        >
          <AnimatePresence mode="wait">
            {randomMovie && !isChangingMovie && (
              <MotionFlex
                key={`content-${randomMovie.id}`}
                direction="column"
                width="100%"
                color="white"
                position="relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              >
                {/* Logo/Title */}
                <Box
                  mb={[6, 8]}
                  maxWidth={["85%", "70%", "55%", "700px"]}
                  alignSelf={["center", "flex-start"]}
                  textAlign={["center", "left"]}
                >
                  {hasValidLogo(randomMovie) ? (
                    <MotionImage
                      key={`logo-${randomMovie.id}`}
                      src={`${baseImageOriginal}${
                        getEnglishLogo(randomMovie.images.logos).file_path
                      }`}
                      alt={`${randomMovie.title} logo`}
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
                      fontFamily={headingFont}
                      letterSpacing="tight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {randomMovie.title}
                    </MotionHeading>
                  )}
                </Box>
                {/* Info Block */}
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
                  {/* Genres (Using fetched genreNames) */}
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
                      {randomMovie.details?.genres?.slice(0, 3).map((genre) => (
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
                  {/* Meta (Year, Runtime, Rating) */}
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
                          {randomMovie.release_date
                            ? new Date(randomMovie.release_date).getFullYear()
                            : "N/A"}
                        </Text>
                      </Flex>
                      {randomMovie.details?.runtime > 0 && (
                        <Flex alignItems="center">
                          <FaClock
                            style={{
                              marginRight: "6px",
                              color: accentColor,
                              fontSize: "0.9em",
                            }}
                          />
                          <Text fontWeight="medium" fontSize={["sm", "md"]}>
                            {convertMinutesToHours(randomMovie.details.runtime)}
                          </Text>
                        </Flex>
                      )}
                      {randomMovie.vote_average > 0 && (
                        <Flex align="center">
                          <FaStar
                            style={{
                              marginRight: "6px",
                              color: accentColor,
                              fontSize: "0.9em",
                            }}
                          />
                          <Text
                            fontWeight="bold"
                            fontSize={["sm", "md"]}
                            color="white"
                          >
                            {randomMovie.vote_average?.toFixed(1)}
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
                        {truncateText(randomMovie.overview, 180)}
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
                          to={`/movie/${randomMovie.id}`}
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
      {/* === SECTIONS BELOW HERO (Themed like Shows) === */}
      <Box position="relative" zIndex={1} bg={baseBg}>
        {/* --- Category Navigation --- */}
        <Box
          py={6}
          borderTop="1px solid"
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Container maxW="1400px" mx="auto" px={{ base: 4, md: 8, lg: 12 }}>
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
                "Now Playing",
                "Top Rated",
                "Upcoming",
                "Action",
                "Comedy",
                "Sci-Fi",
              ].map(
                (
                  category // Movie categories
                ) => (
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
                        highlightedCategory === category
                          ? "extrabold"
                          : "medium"
                      }
                      color={
                        highlightedCategory === category
                          ? "white"
                          : mutedTextColor
                      }
                      _hover={{ color: "white" }}
                      transition="all 0.2s"
                      letterSpacing="wide"
                      textTransform="uppercase"
                      fontFamily={headingFont}
                    >
                      {" "}
                      {category}{" "}
                    </Text>
                    {highlightedCategory === category && (
                      <Box
                        position="absolute"
                        bottom="-8px"
                        left="10%"
                        right="10%"
                      >
                        <SquigglyLine
                          color={accentColor}
                          thickness={1.5}
                          dasharray="2,2"
                          delay={0.1}
                        />
                      </Box>
                    )}
                  </Box>
                )
              )}
            </HStack>
          </Container>
        </Box>

        {/* --- Featured Movies Carousel (FULL WIDTH) --- */}
        <Box pt={10} pb={8}>
          <Container
            maxW="1400px"
            mx="auto"
            mb={6}
            px={{ base: 4, md: 8, lg: 12 }}
          >
            <Box position="relative" display="inline-block">
              {" "}
              <Heading size="lg" color="white" fontFamily={headingFont}>
                Featured
              </Heading>{" "}
              <Box position="absolute" bottom="-10px" left="0" w="70px">
                {" "}
                <SquigglyLine
                  color={accentColor}
                  thickness={2}
                  dasharray="4,2"
                />{" "}
              </Box>{" "}
            </Box>
          </Container>
          {/* Carousel Box */}
          <Box
            ref={carouselRef}
            overflowX="auto"
            css={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
            pl={{ base: 4, md: 8, lg: 12 }}
            /* Left padding for start */ pr={4} /* Padding at the end */
          >
            <Flex gap={5} pb={4}>
              {featuredMovies.map((movie) => (
                <MotionBox
                  key={movie.id}
                  minWidth={["240px", "280px"]}
                  borderRadius="none"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="lg"
                  position="relative"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Box position="relative" height="160px">
                    {movie.images?.backdrops?.length > 0 ? (
                      <Image
                        src={`${baseImageW500}${movie.images?.backdrops[0]?.file_path}`}
                        alt={movie.title}
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
                    {movie.vote_average > 0 && (
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
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.1)"
                      >
                        <Flex align="center">
                          <FaStar
                            color={accentColor}
                            style={{ marginRight: "3px", fontSize: "0.8em" }}
                          />
                          {movie.vote_average.toFixed(1)}
                        </Flex>
                      </Badge>
                    )}
                  </Box>
                  <VStack p={4} align="start" spacing={3}>
                    <Heading size="sm" noOfLines={1} fontFamily={headingFont}>
                      {movie.title}
                    </Heading>
                    <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                      {movie.genreNames?.slice(0, 2).join(" • ") || ""}
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.300"
                      noOfLines={2}
                      h="2.7em"
                    >
                      {truncateText(movie.overview, 70)}
                    </Text>
                    <Flex width="100%" justifyContent="flex-end" mt={2}>
                      <Box w="110px">
                        <Link
                          to={`/movie/${movie.id}`}
                          style={{ width: "100%", display: "block" }}
                        >
                          <SketchButton size="sm">Details</SketchButton>
                        </Link>
                      </Box>
                    </Flex>
                  </VStack>
                </MotionBox>
              ))}
            </Flex>
          </Box>
        </Box>

        {/* --- Movie Grid Section --- */}
        <Box py={10}>
          <Container maxW="1400px" mx="auto" px={{ base: 4, md: 8, lg: 12 }}>
            <Box position="relative" display="inline-block" mb={8}>
              {" "}
              <Heading size="lg" color="white" fontFamily={headingFont}>
                Discover
              </Heading>{" "}
              <Box position="absolute" bottom="-10px" left="0" w="70px">
                {" "}
                <SquigglyLine
                  color={accentColor}
                  thickness={2}
                  dasharray="4,2"
                />{" "}
              </Box>{" "}
            </Box>
            <SimpleGrid columns={[2, 3, 4, 5]} gap={4}>
              {/* Make sure ContentGrid uses genreMap */}
              {movies.slice(0, 15).map(
                (
                  item,
                  index // Show more movies
                ) => (
                  <ContentGrid
                    key={item.id}
                    item={item}
                    index={index}
                    contentType="movie"
                    baseImageOriginal={baseImageOriginal}
                    /* Pass genreMap if ContentGrid uses it */ genreMap={
                      genreMap
                    }
                  />
                )
              )}
            </SimpleGrid>
            {/* Load more button */}
            <Flex justify="center" mt={12}>
              {" "}
              <Box w={["160px", "180px"]}>
                {" "}
                <SketchButton onClick={() => console.log("Load More...")}>
                  Load More
                </SketchButton>{" "}
              </Box>{" "}
            </Flex>
          </Container>
        </Box>
      </Box>{" "}
      {/* End Sections Below Hero */}
    </Box> // End Main Relative Box
  );
}
export default Movies;
