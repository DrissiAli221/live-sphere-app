import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Badge,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlay, FaStar, FaArrowRight } from "react-icons/fa";
import { BiCameraMovie, BiTv } from "react-icons/bi";
import {
  fetchTrendingMovies,
  fetchTrendingTVShows,
  fetchGenres,
  fetchTopRated,
  baseImageOriginal,
  fetchMovieImages,
  fetchDetails,
} from "@/services/api";

// Motion components
const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);
const MotionImage = motion.create(Image);

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTvShows, setTrendingTvShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [contentType, setContentType] = useState("movies");

  // Colors
  const accentColor = "#C74B08";
  const cardBg = "rgba(23, 25, 35, 0.8)";
  const gradientBg =
    "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))";

  // Responsive values
  const heroHeight = useBreakpointValue({ base: "70vh", md: "80vh" });
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const moviesData = await fetchTrendingMovies();
        const tvData = await fetchTrendingTVShows();
        const genresData = await fetchGenres("movie");
        const topRatedData = await fetchTopRated("movie");

        // Fetch data simultaneously
        const TvWithImagesAndDetails = await Promise.all(
          tvData.map(async (tv) => {
            const imagesData = await fetchMovieImages("tv", tv.id);
            const tvDetails = await fetchDetails("tv", tv.id);
            return {
              ...tv,
              images: imagesData,
              details: tvDetails,
            };
          })
        );
        // Fetch data simultaneously
        const MoviesWithImagesAndDetails = await Promise.all(
          moviesData.map(async (movie) => {
            const imagesData = await fetchMovieImages("movie", movie.id);
            const tvDetails = await fetchDetails("movie", movie.id);
            return {
              ...movie,
              images: imagesData,
              details: tvDetails,
            };
          })
        );

        setTrendingMovies(MoviesWithImagesAndDetails.slice(0, 20));
        setTrendingTvShows(TvWithImagesAndDetails.slice(0, 20));
        setGenres(genresData?.genres || []);
        setTopRated(topRatedData.slice(0, 8));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(trendingMovies);
  console.log(trendingTvShows);

  // Filter content by genre
  const filteredContent = () => {
    const content = contentType === "movies" ? trendingMovies : trendingTvShows;

    if (selectedGenre === "all") {
      return content;
    }

    return content.filter(
      (item) =>
        item.genre_ids && item.genre_ids.includes(parseInt(selectedGenre))
    );
  };

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

  const hasValidBackdrop = (show) => {
    return (
      show &&
      show.images &&
      show.images.backdrops &&
      show.images.backdrops.length > 0
    );
  };

  const featuredContent = useMemo(() => {
    if (contentType === "movies") {
      // For movies, filter trending movies with valid logos and backdrops
      const eligibleMovies = trendingMovies.filter(
        (movie) => hasValidLogo(movie) && hasValidBackdrop(movie)
      );
      // If no eligible movies, return null
      if (eligibleMovies.length === 0) return null;
      // Return a random eligible movie
      const randomIndex = Math.floor(Math.random() * eligibleMovies.length);
      return eligibleMovies[randomIndex];
    } else {
      // For TV shows, filter trending shows with valid logos and backdrops
      const eligibleShows = trendingTvShows.filter(
        (show) => hasValidLogo(show) && hasValidBackdrop(show)
      );
      // If no eligible shows, return null
      if (eligibleShows.length === 0) return null;
      // Return a random eligible show
      const randomIndex = Math.floor(Math.random() * eligibleShows.length);
      return eligibleShows[randomIndex];
    }
  }, [contentType, trendingMovies, trendingTvShows]);

  console.log(featuredContent);

  // Helper function to get genre names
  const getGenreNames = (genreIds) => {
    if (!genreIds || !genres.length) return "";
    return genreIds
      .slice(0, 2)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .join(" • ");
  };

  if (loading) {
    return (
      <Flex
        height="100vh"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        bg="black"
        gap={4}
      >
        <Spinner size="xl" color={accentColor} thickness="4px" />
        <Text color="white">Loading your entertainment universe...</Text>
      </Flex>
    );
  }

  return (
    <Box
      bg="black"
      minHeight="100vh"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      {/* Hero Section */}
      {featuredContent && (
        <Box height={heroHeight} position="relative" overflow="hidden">
          {/* Background Image */}
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            width="100vw"
            height="100vh"
            backgroundImage={`url(${baseImageOriginal}${featuredContent.backdrop_path})`}
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat={"no-repeat"}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10 }}
          >
            {/* Gradient overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              background="linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4) 100%)"
            />
          </MotionBox>

          {/* Content */}
          <Container maxW="container.xl" height="100%" position="relative">
            <Flex
              height="100%"
              flexDirection="column"
              justifyContent="flex-end"
              pb={10}
              px={[4, 6, 8]}
            >
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                maxWidth="600px"
              >
                {/* Content Type Badge */}
                <Badge
                  colorScheme="red"
                  bg={accentColor}
                  mb={4}
                  fontSize="sm"
                  display="inline-flex"
                  alignItems="center"
                  pl={2}
                  pr={3}
                  py={1}
                  borderRadius="full"
                >
                  {contentType === "movies" ? (
                    <>
                      <BiCameraMovie style={{ marginRight: "6px" }} /> Featured
                      Movie
                    </>
                  ) : (
                    <>
                      <BiTv style={{ marginRight: "6px" }} /> Featured TV Show
                    </>
                  )}
                </Badge>

                {/* Title */}
                <Heading
                  size="2xl"
                  color="white"
                  mb={3}
                  textShadow="0 2px 10px rgba(0,0,0,0.5)"
                >
                  {contentType === "movies"
                    ? featuredContent.title
                    : featuredContent.name}
                </Heading>

                {/* Stats */}
                <HStack spacing={4} mb={4}>
                  {featuredContent.release_date && (
                    <Text color="gray.300" fontSize="md">
                      {new Date(featuredContent.release_date).getFullYear()}
                    </Text>
                  )}
                  {featuredContent.first_air_date && (
                    <Text color="gray.300" fontSize="md">
                      {new Date(featuredContent.first_air_date).getFullYear()}
                    </Text>
                  )}
                  <Flex alignItems="center">
                    <Box as={FaStar} color="yellow.400" mr={1} />
                    <Text color="white" fontWeight="bold">
                      {featuredContent.vote_average.toFixed(1)}
                    </Text>
                  </Flex>
                  <Text color="gray.300" fontSize="md">
                    {getGenreNames(featuredContent.genre_ids)}
                  </Text>
                </HStack>

                {/* Overview */}
                <Text
                  color="gray.200"
                  mb={6}
                  fontSize="lg"
                  maxWidth="600px"
                  textShadow="0 1px 3px rgba(0,0,0,0.7)"
                  noOfLines={3}
                >
                  {featuredContent.overview}
                </Text>

                {/* Action Buttons */}
                <HStack spacing={4}>
                  <Button
                    leftIcon={<FaPlay />}
                    bg={accentColor}
                    color="white"
                    _hover={{
                      bg: "rgba(255, 85, 115, 1)",
                      transform: "scale(1.05)",
                    }}
                    size="lg"
                    px={8}
                  >
                    Watch Now
                  </Button>
                  <Button
                    as={Link}
                    to={`/${contentType === "movies" ? "movie" : "tv"}/${
                      featuredContent.id
                    }`}
                    variant="outline"
                    colorScheme="whiteAlpha"
                    size="lg"
                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  >
                    More Info
                  </Button>
                </HStack>
              </MotionBox>
            </Flex>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Box bg="black" py={10}>
        <Container maxW="container.xl">
          {/* Trending Section */}
          <Box mb={12}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb={6}
              px={[4, 6, 8]}
            >
              <Heading color="white" size="lg">
                Trending Now
              </Heading>

              {/* Custom Tabs Replacement */}
              <Flex
                bg="rgba(0,0,0,0.3)"
                borderRadius="full"
                overflow="hidden"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <Button
                  color="white"
                  bg={contentType === "movies" ? accentColor : "transparent"}
                  _hover={{
                    bg:
                      contentType === "movies" ? accentColor : "whiteAlpha.200",
                  }}
                  onClick={() => setContentType("movies")}
                  size="sm"
                  px={4}
                  borderRadius="full"
                  borderRightRadius={0}
                >
                  Movies
                </Button>
                <Button
                  color="white"
                  bg={contentType === "tvshows" ? accentColor : "transparent"}
                  _hover={{
                    bg:
                      contentType === "tvshows"
                        ? accentColor
                        : "whiteAlpha.200",
                  }}
                  onClick={() => setContentType("tvshows")}
                  size="sm"
                  px={4}
                  borderRadius="full"
                  borderLeftRadius={0}
                >
                  TV Shows
                </Button>
              </Flex>
            </Flex>

            {/* Genres Filter */}
            <Box
              overflowX="auto"
              pb={4}
              mb={6}
              px={[4, 6, 8]}
              css={{
                "&::-webkit-scrollbar": { height: "4px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.1)" },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                },
              }}
            >
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant={selectedGenre === "all" ? "solid" : "outline"}
                  colorScheme={
                    selectedGenre === "all" ? "orange" : "whiteAlpha"
                  }
                  onClick={() => setSelectedGenre("all")}
                  minW="auto"
                  px={4}
                >
                  All
                </Button>
                {genres.slice(0, 15).map((genre) => (
                  <Button
                    key={genre.id}
                    size="sm"
                    variant={
                      selectedGenre === genre.id.toString()
                        ? "solid"
                        : "outline"
                    }
                    colorScheme={
                      selectedGenre === genre.id.toString()
                        ? "orange"
                        : "whiteAlpha"
                    }
                    onClick={() => setSelectedGenre(genre.id.toString())}
                    minW="auto"
                    px={4}
                  >
                    {genre.name}
                  </Button>
                ))}
              </HStack>
            </Box>

            {/* Content Grid */}
            <SimpleGrid columns={gridColumns} spacing={6} px={[4, 6, 8]}>
              {filteredContent()
                .slice(0, 8)
                .map((item, index) => (
                  <MotionBox
                    key={item.id}
                    borderRadius="lg"
                    overflow="hidden"
                    bg={cardBg}
                    boxShadow="lg"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Box position="relative">
                      <Image
                        src={`${baseImageOriginal}${item.poster_path}`}
                        alt={item.title || item.name}
                        height="320px"
                        width="100%"
                        objectFit="cover"
                      />
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bgGradient="linear(to-t, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)"
                      />
                      <Box
                        position="absolute"
                        top={2}
                        right={2}
                        bg="rgba(0,0,0,0.6)"
                        px={2}
                        py={1}
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                      >
                        <Box
                          as={FaStar}
                          color="yellow.400"
                          mr={1}
                          size="12px"
                        />
                        <Text fontSize="sm" color="white">
                          {item.vote_average.toFixed(1)}
                        </Text>
                      </Box>
                      <Box
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        p={4}
                      >
                        <Text
                          color="white"
                          fontWeight="bold"
                          fontSize="lg"
                          noOfLines={1}
                        >
                          {item.title || item.name}
                        </Text>
                        <Text color="gray.300" fontSize="sm">
                          {getGenreNames(item.genre_ids)}
                        </Text>
                      </Box>
                    </Box>
                    <Flex justify="space-between" p={4}>
                      <Button
                        leftIcon={<FaPlay />}
                        size="sm"
                        bg={accentColor}
                        color="white"
                        _hover={{ bg: "rgba(255, 85, 115, 1)" }}
                      >
                        Watch
                      </Button>
                      <Button
                        as={Link}
                        to={`/${contentType === "movies" ? "movie" : "tv"}/${
                          item.id
                        }`}
                        variant="ghost"
                        size="sm"
                        color="gray.300"
                        _hover={{ color: "white" }}
                      >
                        Details
                      </Button>
                    </Flex>
                  </MotionBox>
                ))}
            </SimpleGrid>

            {/* View More Button */}
            <Flex justifyContent="center" mt={8} px={[4, 6, 8]}>
              <Button
                rightIcon={<FaArrowRight />}
                variant="outline"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                as={Link}
                to={contentType === "movies" ? "/movies" : "/tvshows"}
              >
                View All {contentType === "movies" ? "Movies" : "TV Shows"}
              </Button>
            </Flex>
          </Box>

          {/* Top Rated Section */}
          <Box mb={12}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb={6}
              px={[4, 6, 8]}
            >
              <Heading color="white" size="lg">
                Top Rated
              </Heading>
              <Button
                variant="link"
                color={accentColor}
                rightIcon={<FaArrowRight />}
                as={Link}
                to="/top-rated"
                _hover={{
                  textDecoration: "none",
                  color: "rgba(255, 85, 115, 1)",
                }}
              >
                See All
              </Button>
            </Flex>

            {/* Horizontal scroll for top rated */}
            <Box
              overflowX="auto"
              px={[4, 6, 8]}
              css={{
                "&::-webkit-scrollbar": { height: "6px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.1)" },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                },
              }}
            >
              <Flex gap={6} pb={4}>
                {topRated.map((item, index) => (
                  <MotionBox
                    key={item.id}
                    minWidth="300px"
                    borderRadius="lg"
                    overflow="hidden"
                    position="relative"
                    height="180px"
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Image
                      src={`${baseImageOriginal}${item.backdrop_path}`}
                      alt={item.title}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgGradient="linear(to-t, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.2) 100%)"
                    />
                    <Flex
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      p={4}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Text color="white" fontWeight="bold" fontSize="md">
                          {item.title}
                        </Text>
                        <HStack>
                          <Badge colorScheme="yellow" variant="solid">
                            Top 10
                          </Badge>
                          <Text color="gray.300" fontSize="sm">
                            {item.release_date &&
                              new Date(item.release_date).getFullYear()}
                          </Text>
                        </HStack>
                      </Box>
                      <Flex
                        bg="rgba(0,0,0,0.6)"
                        p={2}
                        borderRadius="full"
                        alignItems="center"
                      >
                        <Box as={FaStar} color="yellow.400" mr={1} />
                        <Text fontWeight="bold" color="white">
                          {item.vote_average.toFixed(1)}
                        </Text>
                      </Flex>
                    </Flex>
                  </MotionBox>
                ))}
              </Flex>
            </Box>
          </Box>

          {/* Collections Section */}
          <Box mb={12}>
            <Heading color="white" size="lg" mb={6} px={[4, 6, 8]}>
              Collections
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} px={[4, 6, 8]}>
              {/* Collection Cards */}
              <MotionBox
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                height="220px"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                cursor="pointer"
              >
                <Image
                  src={`${baseImageOriginal}/wwemzKWzjKYJFfCeiB57q3r4Bcm.png`}
                  alt="Marvel Collection"
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
                  bgGradient="linear(to-r, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)"
                />
                <Box position="absolute" left={6} bottom={6}>
                  <Heading size="lg" color="white" mb={2}>
                    Marvel Universe
                  </Heading>
                  <Text color="gray.300" mb={3}>
                    30+ movies and shows
                  </Text>
                  <Button
                    bg={accentColor}
                    color="white"
                    _hover={{ bg: "rgba(255, 85, 115, 1)" }}
                    size="sm"
                  >
                    Browse Collection
                  </Button>
                </Box>
              </MotionBox>

              <MotionBox
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                height="220px"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                cursor="pointer"
              >
                <Image
                  src={`${baseImageOriginal}/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg`}
                  alt="Oscar Winners"
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
                  bgGradient="linear(to-r, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)"
                />
                <Box position="absolute" left={6} bottom={6}>
                  <Heading size="lg" color="white" mb={2}>
                    Oscar Winners
                  </Heading>
                  <Text color="gray.300" mb={3}>
                    Best Picture collection
                  </Text>
                  <Button
                    bg={accentColor}
                    color="white"
                    _hover={{ bg: "rgba(255, 85, 115, 1)" }}
                    size="sm"
                  >
                    Browse Collection
                  </Button>
                </Box>
              </MotionBox>
            </SimpleGrid>
          </Box>

          {/* Continue Watching */}
          <Box mb={12}>
            <Heading color="white" size="lg" mb={6} px={[4, 6, 8]}>
              Continue Watching
            </Heading>
            <Box
              overflowX="auto"
              px={[4, 6, 8]}
              css={{
                "&::-webkit-scrollbar": { height: "6px" },
                "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.1)" },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                },
              }}
            >
              <Flex gap={4} pb={4}>
                {trendingMovies.slice(10, 16).map((item, index) => (
                  <MotionBox
                    key={item.id}
                    minWidth="280px"
                    borderRadius="lg"
                    overflow="hidden"
                    position="relative"
                    boxShadow="md"
                    whileHover={{ scale: 1.03 }}
                  >
                    <Box position="relative" height="160px">
                      <Image
                        src={`${baseImageOriginal}${item.backdrop_path}`}
                        alt={item.title}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bgGradient="linear(to-b, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)"
                      />

                      {/* Progress bar */}
                      <Box
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        height="4px"
                        bg="gray.700"
                      >
                        <Box
                          height="100%"
                          bg={accentColor}
                          width={`${30 + index * 10}%`} // Random progress for demo
                        />
                      </Box>

                      {/* Play button overlay */}
                      <Flex
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        alignItems="center"
                        justifyContent="center"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        transition="all 0.2s"
                        role="group"
                      >
                        <Box bg="rgba(0,0,0,0.7)" borderRadius="full" p={3}>
                          <Box as={FaPlay} color="white" size="24px" />
                        </Box>
                      </Flex>
                    </Box>

                    <Box p={3} bg={cardBg}>
                      <Text color="white" fontWeight="semibold" noOfLines={1}>
                        {item.title}
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        {Math.floor(Math.random() * 60) + 10}min left
                      </Text>
                    </Box>
                  </MotionBox>
                ))}
              </Flex>
            </Box>
          </Box>

          {/* New Releases */}
          <Box mb={8}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb={6}
              px={[4, 6, 8]}
            >
              <Heading color="white" size="lg">
                New Releases
              </Heading>
              <Button
                variant="link"
                color={accentColor}
                rightIcon={<FaArrowRight />}
                _hover={{
                  textDecoration: "none",
                  color: "rgba(255, 85, 115, 1)",
                }}
              >
                Explore All
              </Button>
            </Flex>

            <SimpleGrid columns={gridColumns} spacing={6} px={[4, 6, 8]}>
              {trendingMovies.slice(14, 18).map((item) => (
                <MotionBox
                  key={item.id}
                  borderRadius="lg"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="xl"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box position="relative">
                    <Image
                      src={`${baseImageOriginal}${item.poster_path}`}
                      alt={item.title}
                      height="320px"
                      width="100%"
                      objectFit="cover"
                    />
                    <Badge
                      position="absolute"
                      top={3}
                      left={3}
                      colorScheme="red"
                      variant="solid"
                      bg={accentColor}
                    >
                      NEW
                    </Badge>
                  </Box>
                  <VStack align="start" p={4} spacing={1}>
                    <Text color="white" fontWeight="bold" noOfLines={1}>
                      {item.title}
                    </Text>
                    <Text color="gray.300" fontSize="sm">
                      {item.release_date &&
                        new Date(item.release_date).getFullYear()}
                    </Text>
                    <Flex justify="space-between" width="100%" mt={2}>
                      <Button
                        leftIcon={<FaPlay />}
                        size="sm"
                        variant="solid"
                        bg={accentColor}
                        color="white"
                        _hover={{ bg: "rgba(255, 85, 115, 1)" }}
                      >
                        Watch
                      </Button>
                      <Button
                        as={Link}
                        to={`/movie/${item.id}`}
                        size="sm"
                        variant="ghost"
                        color="gray.300"
                        _hover={{ color: "white" }}
                      >
                        Details
                      </Button>
                    </Flex>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
