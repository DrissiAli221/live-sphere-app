import React, { useEffect, useState, useCallback, useRef } from "react";

// --- Chakra UI Primitive Imports ---
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
  Spinner, // Added back for loading state
} from "@chakra-ui/react";

// --- React Router Imports ---
import { Link, useNavigate } from "react-router-dom";

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Service/Util/Component Imports ---
import {
  baseImageOriginal,
  baseImageW500, // Useful for grids/carousels
  fetchMovieImages,
  fetchDetails,
  fetchTrending, // Using combined trending fetch
  fetchGenres,
  fetchTopRated,
  fetchTrendingMovies,
  fetchTrendingTVShows,
} from "@/services/api"; // Assuming correct path

import { watchProviders } from "@/utils/watchProviders";

import {
  resolveRatingColor,
  voteToPercentage,
  popularStreamingCompanies, // Keep if using logos
  formatAirDateRange,
  getSeasonInfo,
  convertMinutesToHours,
  truncateText, // Added back
} from "@/utils/helper"; // Adjust path
import ContentGrid from "@/components/ContentGrid"; // Assuming correct path & themed
import StreamingServiceSkeleton from "@/components/StreamingServiceSkeleton"; // Keep for loading

// --- Icon Imports ---
import {
  FaPlay,
  FaInfoCircle,
  FaStar,
  FaClock,
  FaArrowRight, // For "See More" buttons
  FaFilm, // Default icons
  FaTv,
} from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { FaClapperboard } from "react-icons/fa6"; // Specific TV icon
import { BiCameraMovie, BiTv } from "react-icons/bi"; // Featured Icons
import SketchyHeroSlider from "@/components/SketchyHeroSlider";
import SmoothHeroSlider from "@/components/SmoothHeroSlider";

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Assume definitions available) ---
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionHeading = motion(Heading);

// Re-paste SketchButton & SquigglyLine definitions
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
  type = "button",
  iconSpacing = 2,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const underlineVariants = {
    rest: { width: 0 },
    hover: { width: "90%", transition: { duration: 0.3 } },
  };
  const isDisabled = disabled || isLoading;
  const fontSize = size === "sm" ? "xs" : "sm";
  const paddingX = size === "sm" ? 3 : 4;
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
        ))}
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
        px={paddingX}
        type={type}
        {...rest}
      >
        {" "}
        <Flex align="center" justify="center" gap={iconSpacing}>
          {isLoading ? <Spinner size="xs" speed="0.8s" /> : children}
        </Flex>{" "}
      </SketchButtonInternal>{" "}
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

// Helper for Section Heading
const SectionHeading = ({
  children,
  accentColor,
  headingFont,
  linkTo = null,
}) => (
  <Flex justify="space-between" align="flex-end" mb={6} wrap="wrap">
    <Box position="relative" display="inline-block">
      <Heading
        as="h2"
        size="lg"
        color="white"
        fontFamily={headingFont}
        textTransform="uppercase"
        letterSpacing="wide"
      >
        {children}
      </Heading>
      <Box position="absolute" bottom="-8px" left="0" w="50px">
        <SquigglyLine color={accentColor} thickness={2} dasharray="4,2" />
      </Box>
    </Box>
    {linkTo && (
      <Link to={linkTo}>
        <Text
          color="gray.400"
          fontFamily={headingFont}
          fontSize="sm"
          _hover={{ color: accentColor, textDecoration: "underline" }}
          display="flex"
          alignItems="center"
        >
          See More <FaArrowRight style={{ marginLeft: "8px" }} />
        </Text>
      </Link>
    )}
  </Flex>
);

// ========================================================================
// --- Home PAGE COMPONENT (Themed like Shows/Movies but Unique) ---
// ========================================================================

const Home = () => {
  // --- State ---
  const [trendingAll, setTrendingAll] = useState([]);
  const [featuredContent, setFeaturedContent] = useState(null); // Single item for hero
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState({ movie: [], tv: [] });
  const [genreMap, setGenreMap] = useState({});
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [topRatedTvShows, setTopRatedTvShows] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]); // For a dedicated movie row
  const [popularTv, setPopularTv] = useState([]); // For a dedicated TV row

  // --- Theming ---
  const baseBg = "#0C0C1B";
  const cardBg = "rgba(30, 30, 40, 0.9)";
  const accentColor = "#FFEC44"; // Yellow accent
  const gradientOverlay =
    "linear-gradient(rgba(0,0,0,0.1) 0%, rgba(12,12,27,0.6) 60%, #0C0C1B 95%)";
  const borderColor = "rgba(255, 255, 255, 0.1)";
  const mutedTextColor = "gray.400";
  const headingFont = "'Courier New', monospace";

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all concurrently
        const [
          trendingData,
          genresMovieData,
          genresTvData,
          topRatedMoviesData,
          topRateTvShowsData,
          popularMoviesData, // Fetching separate popular movies
          popularTvData, // Fetching separate popular tv
        ] = await Promise.all([
          fetchTrending("week", 1), // Fetch page 1 of combined trending
          fetchGenres("movie"),
          fetchGenres("tv"),
          fetchTopRated("movie"),
          fetchTopRated("tv"),
          fetchTrendingMovies("week"), // Assume fetchTrendingMovies can take 'week'
          fetchTrendingTVShows("week"), // Assume fetchTrendingTVShows can take 'week'
        ]);

        // Create combined Genre Map
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
        setGenres({ movie: genresMovieData, tv: genresTvData }); // Store separate genres if needed

        // Process trending data with details for Hero
        const trendingItems =
          trendingData?.filter(
            (item) =>
              item.backdrop_path &&
              (item.media_type === "movie" || item.media_type === "tv")
          ) || [];
        if (trendingItems.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * Math.min(trendingItems.length, 5)
          ); // Pick from top 5 trending
          const randomItem = trendingItems[randomIndex];
          try {
            const [detailsData, imagesData] = await Promise.all([
              fetchDetails(randomItem.media_type, randomItem.id),
              fetchMovieImages(randomItem.media_type, randomItem.id),
            ]);
            setFeaturedContent({
              ...randomItem,
              details: detailsData,
              images: imagesData,
              genreNames: randomItem.genre_ids
                .map((id) => combinedGenreMap[id])
                .filter(Boolean),
            });
          } catch (detailError) {
            console.warn(
              `Failed fetch details for hero ${randomItem.id}:`,
              detailError
            );
            setFeaturedContent(randomItem); /* Fallback */
          }
        }
        // Store lists with genre names (no need for extra details fetching unless required by grid)
        setTopRatedMovies(topRatedMoviesData?.slice(0, 12) || []);
        setTopRatedTvShows(topRateTvShowsData?.slice(0, 12) || []);
        setPopularMovies(
          popularMoviesData?.slice(0, 12).map((m) => ({
            ...m,
            genreNames: m.genre_ids
              .map((id) => combinedGenreMap[id])
              .filter(Boolean),
          })) || []
        );
        setPopularTv(
          popularTvData?.slice(0, 12).map((tv) => ({
            ...tv,
            genreNames: tv.genre_ids
              .map((id) => combinedGenreMap[id])
              .filter(Boolean),
          })) || []
        );
        setTrendingAll(
          trendingItems.map((item) => ({
            ...item,
            genreNames: item.genre_ids
              .map((id) => combinedGenreMap[id])
              .filter(Boolean),
          }))
        ); // Keep all trending with names
      } catch (error) {
        console.error("Error fetching Home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Run once on mount

  // --- Helpers (Logo/Backdrop getters are useful here) ---
  const getEnglishLogo = useCallback((logos) => {
    /* ... as defined before ... */ if (!logos || logos.length === 0)
      return null;
    const p = logos.find(
      (l) => l.iso_639_1 === "en" && l.file_path?.toLowerCase().endsWith(".png")
    );
    if (p) return p;
    const e = logos.find((l) => l.iso_639_1 === "en");
    return e || logos[0];
  }, []);
  const hasValidLogo = useCallback(
    (item) =>
      item?.images?.logos?.length > 0 &&
      getEnglishLogo(item.images.logos)?.file_path,
    [getEnglishLogo]
  );

  // --- Loading State ---
  if (loading) {
    return <StreamingServiceSkeleton />;
  }

  return (
    <Box position="relative" bg={baseBg} minHeight="100vh">
      {/* Hero Section - Move this to the top */}
      <SketchyHeroSlider />

  
   

      <Container
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 8, lg: 12 }}
        py={10}
      >
        <VStack spacing={12} align="stretch">
          {" "}
          {/* Vertical stack for sections */}
          {/* --- Popular Movies Row --- */}
          {popularMovies.length > 0 && (
            <Box>
              <SectionHeading
                headingFont={headingFont}
                accentColor={accentColor}
                linkTo="/movies"
              >
                {" "}
                {/* Added Link */}
                Popular Movies
              </SectionHeading>
              {/* Horizontal Scroll for Popular Movies */}
              <Box
                overflowX="auto"
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
                mx={-4}
                px={4} /* Bleed effect */
              >
                <HStack spacing={4} pb={4} align="stretch">
                  {popularMovies.map((movie, index) => (
                    <MotionBox key={movie.id} minW="260px" flexShrink={0}>
                      {/* Use a themed card component if available, otherwise basic themed ContentGrid */}
                      <ContentGrid
                        item={movie}
                        index={index}
                        contentType="movie"
                        genreMap={genreMap}
                        isCompact={true} /* Example: maybe a compact prop? */
                      />
                    </MotionBox>
                  ))}
                </HStack>
              </Box>
            </Box>
          )}
          {/* --- Popular TV Shows Row --- */}
          {popularTv.length > 0 && (
            <Box>
              <SectionHeading
                headingFont={headingFont}
                accentColor={accentColor}
                linkTo="/shows"
              >
                {" "}
                {/* Added Link */}
                Popular TV Shows
              </SectionHeading>
              {/* Horizontal Scroll */}
              <Box
                overflowX="auto"
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
                mx={-4}
                px={4}
              >
                <HStack spacing={4} pb={4} align="stretch">
                  {popularTv.map((tv, index) => (
                    <MotionBox key={tv.id} minW="260px" flexShrink={0}>
                      <ContentGrid
                        item={tv}
                        index={index}
                        contentType="tv"
                        genreMap={genreMap}
                        isCompact={true}
                      />
                    </MotionBox>
                  ))}
                </HStack>
              </Box>
            </Box>
          )}
          {/* --- Top Rated Movies Grid --- */}
          {topRatedMovies.length > 0 && (
            <Box>
              <SectionHeading
                headingFont={headingFont}
                accentColor={accentColor}
                linkTo="/movies?sort=top_rated"
              >
                Top Rated Movies
              </SectionHeading>
              <SimpleGrid columns={[2, 3, 4, 5, 6]} spacing={4}>
                {topRatedMovies.slice(0, 6).map(
                  (
                    movie,
                    index // Limit grid display
                  ) => (
                    <ContentGrid
                      key={movie.id}
                      item={movie}
                      index={index}
                      contentType="movie"
                      genreMap={genreMap}
                    />
                  )
                )}
              </SimpleGrid>
            </Box>
          )}
          {/* --- Top Rated TV Shows Grid --- */}
          {topRatedTvShows.length > 0 && (
            <Box>
              <SectionHeading
                headingFont={headingFont}
                accentColor={accentColor}
                linkTo="/shows?sort=top_rated"
              >
                Top Rated TV Shows
              </SectionHeading>
              <SimpleGrid columns={[2, 3, 4, 5, 6]} spacing={4}>
                {topRatedTvShows.slice(0, 6).map((tv, index) => (
                  <ContentGrid
                    key={tv.id}
                    item={tv}
                    index={index}
                    contentType="tv"
                    genreMap={genreMap}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
