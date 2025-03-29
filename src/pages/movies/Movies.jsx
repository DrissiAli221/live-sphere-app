import {
  Box,
  Flex,
  Spinner,
  Container,
  Image,
  Text,
  Button,
  HStack,
  Badge,
  SimpleGrid,
  VStack,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  baseImageOriginal,
  fetchDiscoverMovies,
  fetchMovieImages,
  fetchDetails,
  fetchTrendingMovies,
} from "@/services/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaPlay,
  FaInfoCircle,
  FaBookmark,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { convertMinutesToHours } from "@/utils/helper";
import ContentGrid from "@/components/ContentGrid";
import StreamingServiceSkeleton from "@/components/StreamingServiceSkeleton";
import WhiteNoiseBackground from "@/components/WhiteNoiseBackground";
import GrainyBackground from "@/components/GrainyBackground";

// Create a motion-enabled component
const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);
const MotionImage = motion.create(Image);

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomMovie, setRandomMovie] = useState(null);
  const [previousMovie, setPreviousMovie] = useState(null);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [highlightedCategory, setHighlightedCategory] = useState("Popular");
  const carouselRef = useRef(null);
  const [isChangingMovie, setIsChangingMovie] = useState(false);

  // Define colors directly instead of using useColorModeValue
  const cardBg = "rgba(23, 25, 35, 0.8)";
  const accentColor = "#C74B08";
  const hoverAccentColor = "rgba(255, 85, 115, 1)";
  const gradientOverlay =
    "linear-gradient(rgba(0,0,0,0.2) 0%, rgba(12,12,27,0.8) 70%, rgba(12,12,27,1) 100%)";

  // Fetch movies, their images, and additional details
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const moviesData = await fetchTrendingMovies();

        // Only fetch detailed data for first 12 movies to improve performance
        const moviesWithImagesAndDetails = await Promise.all(
          moviesData.slice(0, 12).map(async (movie) => {
            const imageData = await fetchMovieImages("movie", movie.id);
            const detailsData = await fetchDetails("movie", movie.id);
            return {
              ...movie,
              images: imageData,
              details: detailsData,
            };
          })
        );

        // Get basic data for remaining movies
        const remainingMovies = moviesData.slice(12).map((movie) => ({
          ...movie,
          images: null,
          details: null,
        }));

        const allMovies = [...moviesWithImagesAndDetails, ...remainingMovies];
        setMovies(allMovies);

        // Set featured movies (first 6 with good backdrops)
        setFeaturedMovies(
          moviesWithImagesAndDetails
            .filter(
              (movie) =>
                movie.images &&
                movie.images.backdrops &&
                movie.images.backdrops.length > 0
            )
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

  // Function to check if movie has a valid logo
  const hasValidLogo = (movie) => {
    return (
      movie &&
      movie.images &&
      movie.images.logos &&
      movie.images.logos.length > 0 &&
      getEnglishLogo(movie.images.logos) &&
      getEnglishLogo(movie.images.logos).file_path
    );
  };

  // Function to check if movie has a valid backdrop
  const hasValidBackdrop = (movie) => {
    return (
      movie &&
      movie.images &&
      movie.images.backdrops &&
      movie.images.backdrops.length > 0
    );
  };

  // Get random movie with both logo and backdrop
  const getRandomMovie = useCallback(() => {
    if (movies.length === 0) return null;

    // Filter movies to only include those with logos and backdrops
    const eligibleMovies = movies.filter(
      (movie) => hasValidLogo(movie) && hasValidBackdrop(movie)
    );

    // If no eligible movies, return null
    if (eligibleMovies.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleMovies.length);
    return eligibleMovies[randomIndex];
  }, [movies]);

  // Set initial random movie when movies are loaded
  useEffect(() => {
    if (movies.length > 0) {
      setRandomMovie(getRandomMovie());
    }
  }, [movies, getRandomMovie]);

  // Set up interval to refresh random movie
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPreviousMovie(randomMovie);
      setIsChangingMovie(true);

      // Small delay before setting the new movie to allow exit animations to complete
      setTimeout(() => {
        setRandomMovie(getRandomMovie());
        setIsChangingMovie(false);
      }, 500);
    }, 8000); // Slightly longer interval for better user experience

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [getRandomMovie, randomMovie]);

  // Function to get English logo or fallback to the first available logo
  const getEnglishLogo = (logos) => {
    if (!logos || logos.length === 0) return null;

    // First try to find an English PNG logo
    const englishPngLogo = logos.find(
      (logo) =>
        logo.iso_639_1 === "en" &&
        logo.file_path &&
        logo.file_path.toLowerCase().endsWith(".png")
    );

    if (englishPngLogo) return englishPngLogo;

    // If no English PNG found, look for any PNG logo
    const anyPngLogo = logos.find(
      (logo) => logo.file_path && logo.file_path.toLowerCase().endsWith(".png")
    );

    if (anyPngLogo) return anyPngLogo;

    // If all else fails, return the English logo even if not PNG
    const englishLogo = logos.find((logo) => logo.iso_639_1 === "en");

    // Last resort: return the first logo
    return englishLogo || logos[0];
  };

  // Replace with this safe version:
  // Function to get the best backdrop to use
  const getBackdropToUse = (movie) => {
    if (
      !movie ||
      !movie.images ||
      !movie.images.backdrops ||
      movie.images.backdrops.length === 0
    ) {
      return null;
    }

    // Try to find a backdrop with null language first
    const nullLanguageBackdrop = movie.images.backdrops.filter(
      (backdrop) => backdrop.iso_639_1 === null
    );

    // Return null language backdrop if available, otherwise first backdrop
    return nullLanguageBackdrop.length > 0
      ? nullLanguageBackdrop[0]
      : movie.images.backdrops[0];
  };

  // Loading state with improved UI

  if (loading) {
    return <StreamingServiceSkeleton />;
  }

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  console.log(randomMovie);

  return (
    <Box position="relative">
      {/* Full-screen background that extends behind navbar - removed background color from here */}
      <AnimatePresence mode="wait">
        {randomMovie && hasValidBackdrop(randomMovie) && (
          <MotionBox
            key={randomMovie.id} // Important for AnimatePresence to track changes
            position="absolute"
            width="full"
            top={0}
            left={0}
            right={0}
            height="100vh"
            zIndex={-2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            backgroundImage={`url(${baseImageOriginal}${
              randomMovie && getBackdropToUse(randomMovie)?.file_path
            })`}
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
          >
            {/* Gradient overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              background={gradientOverlay}
            />
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Hero Content Section */}
      <Box position="relative" height="75vh" display="flex" alignItems="center">
        <Container
          maxW="container.xl"
          height="100%"
          position="relative"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <AnimatePresence mode="wait">
            {randomMovie && !isChangingMovie && (
              <MotionFlex
                key={`content-${randomMovie.id}`}
                direction="column"
                height="100%"
                color="white"
                pl={[2, 4, 8]}
                pr={[2, 4, 8]}
                pt="10vh"
                pb={12}
                spacing={3}
                position="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Badge for trending or new release */}

                {/* Logo Section */}
                <Box
                  position="absolute"
                  top="32%"
                  left={[2, 4, 8]}
                  maxWidth="75%"
                  zIndex={1}
                >
                  {hasValidLogo(randomMovie) ? (
                    <MotionImage
                      src={`${baseImageOriginal}${
                        getEnglishLogo(randomMovie.images.logos).file_path
                      }`}
                      alt={`${randomMovie.title} logo`}
                      maxHeight="180px"
                      objectFit="contain"
                      filter="drop-shadow(0 0 10px rgba(0,0,0,0.6))"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    />
                  ) : (
                    <MotionBox
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Heading
                        size="2xl"
                        fontWeight="bold"
                        textShadow="0px 0px 10px rgba(0,0,0,0.8)"
                      >
                        {randomMovie.title}
                      </Heading>
                    </MotionBox>
                  )}
                </Box>

                {/* Bottom content container - Details and actions */}
                <MotionFlex
                  direction="column"
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={[2, 4, 8]}
                  pb={8}
                  maxWidth="600px"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {/* Genre section with separator */}
                  {randomMovie.details && randomMovie.details.genres && (
                    <HStack spacing={1} mb={3} wrap="wrap" ml={[2, 4, 8]}>
                      {randomMovie.details.genres.map((genre, index) => (
                        <Box key={genre.id} display="flex" alignItems="center">
                          <Text
                            fontSize="md"
                            fontWeight="medium"
                            textShadow="0px 0px 8px rgba(0,0,0,0.8)"
                          >
                            {genre.name}
                          </Text>
                          {index < randomMovie.details.genres.length - 1 && (
                            <Text
                              mx={1}
                              color={accentColor}
                              fontWeight="bold"
                              textShadow="0px 0px 8px rgba(0,0,0,0.8)"
                            >
                              &nbsp;•
                            </Text>
                          )}
                        </Box>
                      ))}
                    </HStack>
                  )}

                  {/* Movie info banner */}
                  <Box
                    position="relative"
                    mb={4}
                    maxWidth="fit-content"
                    ml={[2, 4, 8]}
                  >
                    <Flex alignItems="center" maxWidth="fit-content" gap={4}>
                      {/* Year */}
                      <Flex alignItems="center">
                        <Box as={BsCalendarDate} mr={2} color={accentColor} />
                        <Text fontWeight="medium" fontSize="md">
                          {randomMovie.release_date &&
                            new Date(randomMovie.release_date).getFullYear()}
                        </Text>
                      </Flex>

                      {/* Duration */}
                      <Flex alignItems="center">
                        <Box as={FaClock} mr={2} color={accentColor} />
                        <Text fontWeight="medium" fontSize="md">
                          {randomMovie.details &&
                            convertMinutesToHours(randomMovie.details.runtime)}
                        </Text>
                      </Flex>

                      {/* Rating with star */}
                      {randomMovie.vote_average !== 0 && (
                        <Flex align="center">
                          <Box as={FaStar} mr={2} color="yellow.400" />
                          <Text fontWeight="bold">
                            {randomMovie.vote_average &&
                              randomMovie.vote_average.toFixed(1)}
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  </Box>

                  {/* Overview Text */}
                  <Box
                    height="6.5rem"
                    mb={6}
                    ml={[2, 4, 8]}
                    overflow="hidden"
                    position="relative"
                  >
                    <Text
                      fontSize="lg"
                      lineHeight="1.5"
                      textShadow="0px 0px 10px rgba(0,0,0,0.8)"
                      maxWidth="550px"
                    >
                      {randomMovie.overview}
                    </Text>
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      height="30px"
                      bgGradient="linear(to-t, rgba(12,12,27,1), transparent)"
                    />
                  </Box>

                  {/* Action Buttons */}
                  <HStack spacing={4} ml={[2, 4, 8]}>
                    <Button
                      colorScheme="red"
                      size="lg"
                      leftIcon={<FaPlay />}
                      bg={accentColor}
                      _hover={{
                        bg: hoverAccentColor,
                        transform: "scale(1.05)",
                      }}
                      transition="all 0.2s"
                      px={5}
                      mr={3}
                      fontWeight="bold"
                    >
                      Watch
                    </Button>

                    <Button
                      as={Link}
                      to={`/movie/${randomMovie.id}`}
                      variant="outline"
                      size="lg"
                      leftIcon={<FaInfoCircle />}
                      _hover={{
                        bg: "rgba(255,255,255,0.1)",
                        transform: "scale(1.05)",
                      }}
                      transition="all 0.2s"
                      borderColor="white"
                    >
                      Details
                    </Button>
                  </HStack>
                </MotionFlex>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Container>
      </Box>

      {/* Category Navigation - Added background here */}
      <Box
        py={8}
        position="relative"
        bg="linear-gradient(to bottom, 
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.2) 8%,
        rgba(0, 0, 0, 0.4) 15%,
        rgba(0, 0, 0, 0.6) 25%,
        rgba(0, 0, 0, 0.8) 35%,
        rgba(0, 0, 0, 0.9) 50%,
        rgba(0, 0, 0, 1) 100%)"
      >
        <Box py={4} position="sticky" top={0} zIndex={10} mb={3}>
          <Container maxW="container.xl">
            <HStack
              spacing={8}
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
                "Coming Soon",
                "Action",
                "Drama",
              ].map((category) => (
                <Box
                  key={category}
                  cursor="pointer"
                  position="relative"
                  mx={2}
                  onClick={() => setHighlightedCategory(category)}
                >
                  <Text
                    fontSize="lg"
                    fontWeight={
                      highlightedCategory === category ? "bold" : "medium"
                    }
                    color={
                      highlightedCategory === category ? "white" : "gray.300"
                    }
                    _hover={{ color: "white" }}
                    transition="all 0.2s"
                  >
                    {category}
                  </Text>
                  {highlightedCategory === category && (
                    // underline effect
                    <Box
                      position="absolute"
                      bottom="-8px"
                      left="0"
                      right="0"
                      height="2px"
                      bg={accentColor}
                      borderRadius="full"
                    />
                  )}
                </Box>
              ))}
            </HStack>
          </Container>
        </Box>

        {/* Featured Movies Carousel - Added background here */}

        <Container maxW="container.xl">
          <Flex
            justify="space-between"
            align="center"
            mb={6}
            pl={[2, 4, 8]}
            pr={[2, 4, 8]}
          >
            <Heading size="lg" color="white">
              Featured {highlightedCategory} Movies
            </Heading>
          </Flex>

          <Box
            ref={carouselRef}
            overflowX="auto"
            pl={[2, 4, 8]}
            css={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            <Flex gap={6} pb={4}>
              {featuredMovies.map((movie) => (
                <MotionBox
                  key={movie.id}
                  minWidth="280px"
                  borderRadius="xl"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="xl"
                  position="relative"
                >
                  <Box position="relative" height="160px">
                    {movie.images &&
                    movie.images.backdrops &&
                    movie.images.backdrops.length > 0 ? (
                      <Image
                        src={`${baseImageOriginal}${movie.images?.backdrops[1]?.file_path}`}
                        alt={movie.title}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                      />
                    ) : (
                      <Flex
                        bg="gray.700"
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text>No Image Available</Text>
                      </Flex>
                    )}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgGradient="linear(to-t, rgba(23,25,35,1) 0%, rgba(23,25,35,0) 50%)"
                    />

                    {/* Rating Badge */}
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      bg="rgba(0,0,0,0.7)"
                      px={2}
                      py={1}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                    >
                      <Box as={FaStar} color="yellow.400" mr={1} />
                      <Text>{movie.vote_average.toFixed(1)}</Text>
                    </Badge>
                  </Box>

                  <VStack p={4} align="start" spacing={2}>
                    <Heading size="md" noOfLines={1}>
                      {movie.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.300" noOfLines={1}>
                      {movie.details && movie.details.genres
                        ? movie.details.genres
                            .slice(0, 2)
                            .map((g) => g.name)
                            .join(" • ")
                        : "Loading genres..."}
                    </Text>
                    <Text fontSize="sm" color="gray.300" noOfLines={2}>
                      {truncateText(movie.overview, 80)}
                    </Text>

                    <Flex width="100%" justifyContent="space-between" mt={2}>
                      <Button
                        as={Link}
                        to={`/movie/${movie.id}`}
                        size="sm"
                        leftIcon={<FaInfoCircle />}
                        variant="outline"
                        borderColor="gray.600"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                      >
                        Details
                      </Button>
                    </Flex>
                  </VStack>
                </MotionBox>
              ))}
            </Flex>
          </Box>
        </Container>
      </Box>

      {/* Movie Grid Section - Kept background here */}
      <Box py={8} bg={"black"}>
        <Container maxW="container.xl">
          <Heading size="lg" color="white" mb={6} pl={[2, 4, 8]}>
            Discover More {highlightedCategory} Movies
          </Heading>

          <SimpleGrid columns={[1, 2, 3, 4]} gap={4} spacing={6} px={[4, 6, 8]}>
            {movies.slice(0, 8).map((item, index) => (
              <ContentGrid
                key={item.id}
                item={item}
                index={index}
                contentType="movie"
                baseImageOriginal={baseImageOriginal}
              />
            ))}
          </SimpleGrid>

          {/* Load more button */}
          <Flex justify="center" mt={10}>
            <Button
              size="lg"
              variant="outline"
              borderColor="gray.600"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.05)" }}
              leftIcon={<Box as="span">+</Box>}
            >
              Load More Movies
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default Movies;
