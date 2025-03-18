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
  fetchMovieImages,
  fetchDetails,
  fetchTrendingTVShows,
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
import { FaClapperboard } from "react-icons/fa6";

// Create a motion-enabled component
const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);
const MotionImage = motion.create(Image);

function Shows() {
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomShow, setRandomShow] = useState(null);
  const [previousShow, setPreviousShow] = useState(null);
  const [featuredShows, setFeaturedShows] = useState([]);
  const [highlightedCategory, setHighlightedCategory] = useState("Popular");
  const carouselRef = useRef(null);
  const [isChangingShow, setIsChangingShow] = useState(false);

  // Define colors directly instead of using useColorModeValue
  const cardBg = "rgba(23, 25, 35, 0.8)";
  const accentColor = "#C74B08";
  const hoverAccentColor = "rgba(255, 85, 115, 1)";
  const gradientOverlay =
    "linear-gradient(rgba(0,0,0,0.2) 0%, rgba(12,12,27,0.8) 70%, rgba(12,12,27,1) 100%)";

  // Fetch tv shows, their images, and additional details
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const tvShowsData = await fetchTrendingTVShows();

        // Only fetch detailed data for first 12 shows to improve performance
        const showsWithImagesAndDetails = await Promise.all(
          tvShowsData.slice(0, 12).map(async (show) => {
            const imageData = await fetchMovieImages("tv", show.id);
            const detailsData = await fetchDetails("tv", show.id);
            return {
              ...show,
              images: imageData,
              details: detailsData,
            };
          })
        );

        // Get basic data for remaining shows
        const remainingShows = tvShowsData.slice(12).map((show) => ({
          ...show,
          images: null,
          details: null,
        }));

        const allShows = [...showsWithImagesAndDetails, ...remainingShows];
        setTVShows(allShows);

        // Set featured shows (first 6 with good backdrops)
        setFeaturedShows(
          showsWithImagesAndDetails
            .filter(
              (show) =>
                show.images &&
                show.images.backdrops &&
                show.images.backdrops.length > 0
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

  // Function to check if show has a valid logo
  const hasValidLogo = (show) => {
    return (
      show &&
      show.images &&
      show.images.logos &&
      show.images.logos.length > 0 &&
      getEnglishLogo(show.images.logos) &&
      getEnglishLogo(show.images.logos).file_path
    );
  };

  // Function to check if show has a valid backdrop
  const hasValidBackdrop = (show) => {
    return (
      show &&
      show.images &&
      show.images.backdrops &&
      show.images.backdrops.length > 0
    );
  };

  // Get random show with both logo and backdrop
  const getRandomShow = useCallback(() => {
    if (tvShows.length === 0) return null;

    // Filter shows to only include those with logos and backdrops
    const eligibleShows = tvShows.filter(
      (show) => hasValidLogo(show) && hasValidBackdrop(show)
    );

    // If no eligible shows, return null
    if (eligibleShows.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleShows.length);
    return eligibleShows[randomIndex];
  }, [tvShows]);

  // Set initial random show when shows are loaded
  useEffect(() => {
    if (tvShows.length > 0) {
      setRandomShow(getRandomShow());
    }
  }, [tvShows, getRandomShow]);

  // Set up interval to refresh random show
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPreviousShow(randomShow);
      setIsChangingShow(true);

      // Small delay before setting the new show to allow exit animations to complete
      setTimeout(() => {
        setRandomShow(getRandomShow());
        setIsChangingShow(false);
      }, 500);
    }, 8000); // Slightly longer interval for better user experience

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [getRandomShow, randomShow]);

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

  // Format air date range for TV shows
  const formatAirDateRange = (show) => {
    if (!show) return "";

    const firstAirYear = show.first_air_date
      ? new Date(show.first_air_date).getFullYear()
      : "";

    const lastAirYear =
      show.details && show.details.last_air_date
        ? new Date(show.details.last_air_date).getFullYear()
        : "";

    const isOngoing =
      show.details && show.details.status === "Returning Series";

    if (firstAirYear && lastAirYear && firstAirYear !== lastAirYear) {
      return `${firstAirYear} - ${isOngoing ? "Present" : lastAirYear}`;
    }

    return firstAirYear || "";
  };

  // Loading state with improved UI
  if (loading) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100vh"
        bgGradient="linear(to-b, gray.900, black)"
        flexDirection="column"
        gap={4}
      >
        <Spinner size="xl" color={accentColor} thickness="4px" />
        <Text color="white" fontSize="lg">
          Loading amazing TV shows for you...
        </Text>
      </Flex>
    );
  }

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Get season info display text
  const getSeasonInfo = (show) => {
    if (!show.details) return "";

    const seasons = show.details.number_of_seasons || 0;
    const episodes = show.details.number_of_episodes || 0;

    if (seasons === 0) return "";

    return `${seasons} ${seasons === 1 ? "Season" : "Seasons"}, ${episodes} ${
      episodes === 1 ? "Episode" : "Episodes"
    }`;
  };

  return (
    <Box position="relative">
      {/* Full-screen background that extends behind navbar */}
      <AnimatePresence mode="wait">
        {randomShow && hasValidBackdrop(randomShow) && (
          <MotionBox
            key={randomShow.id} // Important for AnimatePresence to track changes
            position="fixed"
            top={0}
            left={0}
            right={0}
            width="100vw"
            height="100vh"
            zIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            backgroundImage={`url(${baseImageOriginal}${randomShow.images.backdrops[0].file_path})`}
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
        <Container maxW="container.xl" height="100%" position="relative">
          <AnimatePresence mode="wait">
            {randomShow && !isChangingShow && (
              <MotionFlex
                key={`content-${randomShow.id}`}
                direction="column"
                height="100%"
                color="white"
                pl={[2, 4, 8]}
                pr={[2, 4, 8]}
                pt="10vh"
                pb={12}
                mt={-14}
                spacing={3}
                position="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Logo Section */}
                <Box
                  position="absolute"
                  top="32%"
                  left={[2, 4, 8]}
                  maxWidth="75%"
                  zIndex={1}
                >
                  {hasValidLogo(randomShow) ? (
                    <MotionImage
                      src={`${baseImageOriginal}${
                        getEnglishLogo(randomShow.images.logos).file_path
                      }`}
                      alt={`${randomShow.name} logo`}
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
                        {randomShow.name}
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
                  {randomShow.details && randomShow.details.genres && (
                    <HStack spacing={1} mb={3} wrap="wrap" ml={[2, 4, 8]}>
                      {randomShow.details.genres.map((genre, index) => (
                        <Box key={genre.id} display="flex" alignItems="center">
                          <Text
                            fontSize="md"
                            fontWeight="medium"
                            textShadow="0px 0px 8px rgba(0,0,0,0.8)"
                          >
                            {genre.name}
                          </Text>
                          {index < randomShow.details.genres.length - 1 && (
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

                  {/* TV Show info banner */}
                  <Box
                    position="relative"
                    mb={4}
                    maxWidth="fit-content"
                    ml={[2, 4, 8]}
                  >
                    <Flex alignItems="center" maxWidth="fit-content" gap={4}>
                      {/* Year Range */}
                      <Flex alignItems="center">
                        <Box as={BsCalendarDate} mr={2} color={accentColor} />
                        <Text fontWeight="medium" fontSize="md">
                          {formatAirDateRange(randomShow)}
                        </Text>
                      </Flex>

                      {/* Seasons & Episodes */}
                      <Flex alignItems="center">
                        <Box as={FaClapperboard} mr={2} color={accentColor} />
                        <Text fontWeight="medium" fontSize="md">
                          {getSeasonInfo(randomShow)}
                        </Text>
                      </Flex>

                      {/* Rating with star */}
                      {randomShow.vote_average !== 0 && (
                        <Flex align="center">
                          <Box as={FaStar} mr={2} color="yellow.400" />
                          <Text fontWeight="bold">
                            {randomShow.vote_average &&
                              randomShow.vote_average.toFixed(1)}
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
                      {randomShow.overview}
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
                      fontWeight="bold"
                    >
                      Watch
                    </Button>

                    <Button
                      as={Link}
                      to={`/tv/${randomShow.id}`}
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
        bg="linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0,0,0,0.5) 20% ,rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 1) 100%)"
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
                "Trending",
                "Drama",
                "Comedy",
                "Sci-Fi",
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

        {/* Featured Shows Carousel */}
        <Container maxW="container.xl">
          <Flex
            justify="space-between"
            align="center"
            mb={6}
            pl={[2, 4, 8]}
            pr={[2, 4, 8]}
          >
            <Heading size="lg" color="white">
              Featured {highlightedCategory} Shows
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
              {featuredShows.map((show) => (
                <MotionBox
                  key={show.id}
                  minWidth="280px"
                  borderRadius="xl"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="xl"
                  position="relative"
                >
                  <Box position="relative" height="160px">
                    {show.images &&
                    show.images.backdrops &&
                    show.images.backdrops.length > 0 ? (
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

                    {/* Season Badge */}
                    <Badge
                      position="absolute"
                      top={2}
                      left={2}
                      bg="rgba(0,0,0,0.7)"
                      px={2}
                      py={1}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                    >
                      <Box as={FaClapperboard} mr={1} />
                      <Text>{show.details?.number_of_seasons || "?"}</Text>
                    </Badge>

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
                      <Text>{show.vote_average.toFixed(1)}</Text>
                    </Badge>
                  </Box>

                  <VStack p={4} align="start" spacing={2}>
                    <Heading size="md" noOfLines={1}>
                      {show.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.300" noOfLines={1}>
                      {show.details && show.details.genres
                        ? show.details.genres
                            .slice(0, 2)
                            .map((g) => g.name)
                            .join(" • ")
                        : "Loading genres..."}
                    </Text>
                    <Text fontSize="sm" color="gray.300" noOfLines={2}>
                      {truncateText(show.overview, 80)}
                    </Text>

                    <Flex width="100%" justifyContent="space-between" mt={2}>
                      <Button
                        as={Link}
                        to={`/tv/${show.id}`}
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

      {/* TV Show Grid Section */}
      <Box py={8} bg={"black"}>
        <Container maxW="container.xl">
          <Heading size="lg" color="white" mb={6} pl={[2, 4, 8]}>
            Discover More {highlightedCategory} Shows
          </Heading>

          <SimpleGrid columns={[1, 2, 3, 4]} spacing={6} px={[2, 4, 8]}>
            {tvShows.slice(0, 8).map((show) => (
              <MotionBox
                key={show.id}
                borderRadius="lg"
                overflow="hidden"
                bg={cardBg}
                boxShadow="lg"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Box height="200px" position="relative">
                  <Image
                    src={
                      show.poster_path
                        ? `${baseImageOriginal}${show.poster_path}`
                        : "https://via.placeholder.com/300x450?text=No+Poster"
                    }
                    alt={show.name}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgGradient="linear(to-t, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)"
                  />

                  {/* Play button overlay */}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="all 0.2s"
                    role="group"
                  >
                    <IconButton
                      aria-label="Play show"
                      icon={<FaPlay />}
                      colorScheme="red"
                      rounded="full"
                      size="lg"
                      _hover={{ transform: "scale(1.1)" }}
                    />
                  </Box>
                </Box>

                <VStack p={4} align="start" spacing={1}>
                  <Text fontWeight="bold" noOfLines={1}>
                    {show.name}
                  </Text>
                  <Flex justify="space-between" width="100%">
                    <Text fontSize="sm" color="gray.400">
                      {show.first_air_date &&
                        new Date(show.first_air_date).getFullYear()}
                    </Text>
                    {show.details && (
                      <Text fontSize="sm" color="gray.400">
                        {show.details.number_of_seasons || "?"} Seasons
                      </Text>
                    )}
                  </Flex>
                  <Flex justify="space-between" width="100%" mt={2}>
                    <Badge colorScheme="red" variant="solid" bg={accentColor}>
                      {Math.floor(Math.random() * 3) === 0 ? "HD" : "4K"}
                    </Badge>
                    <Flex align="center">
                      <Box as={FaStar} color="yellow.400" mr={1} size="12px" />
                      <Text fontSize="sm">{show.vote_average.toFixed(1)}</Text>
                    </Flex>
                  </Flex>
                </VStack>
              </MotionBox>
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
              Load More Shows
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
export default Shows;
