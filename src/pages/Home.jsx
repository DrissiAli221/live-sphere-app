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
import ContentGrid from "@/components/ContentGrid";
import { Skeleton, SkeletonText, SkeletonCircle } from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlay, FaStar, FaArrowRight } from "react-icons/fa";
import { BiCameraMovie, BiTv } from "react-icons/bi";
import {
  fetchTrendingMovies,
  fetchTrendingTVShows,
  fetchTrending,
  fetchGenres,
  fetchTopRated,
  baseImageOriginal,
  fetchMovieImages,
  fetchDetails,
  apiKey,
} from "@/services/api";
import {
  resolveRatingColor,
  voteToPercentage,
  popularStreamingCompanies,
} from "@/utils/helper";
import { AiFillLike } from "react-icons/ai";

// Motion components
const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);
const MotionImage = motion.create(Image);

const Home = () => {
  const [trendingAll, setTrendingAll] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTvShows, setTrendingTvShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [topRatedTvShows, setTopRatedTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [contentType, setContentType] = useState("movie");
  const [streamingProviders, setStreamingProviders] = useState([]);

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
        const trendingData = await fetchTrending();
        const moviesData = await fetchTrendingMovies();
        const tvData = await fetchTrendingTVShows();
        const genresData = await fetchGenres("movie");
        const topRatedMoviesData = await fetchTopRated("movie");
        const topRateTvShowsData = await fetchTopRated("tv");

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

        // Fetch company logos
        const companiesWithLogos = await Promise.all(
          popularStreamingCompanies.map(async (company) => {
            try {
              const imagesResponse = await fetch(
                `https://api.themoviedb.org/3/company/${company.id}/images?api_key=${apiKey}`
              );
              const imagesData = await imagesResponse.json();
              console.log("Image data for " + company.name, imagesData);

              return {
                ...company,
                logo_path:
                  imagesData.logos && imagesData.logos.length > 0
                    ? imagesData.logos[0].file_path
                    : null,
              };
            } catch (error) {
              console.error(
                `Error fetching images for ${company.name}:`,
                error
              );
              return company;
            }
          })
        );

        const trendingDataWithImagesAndDetails = await Promise.all(
          trendingData.map(async (all) => {
            const imagesData = await fetchMovieImages(all.media_type, all.id);
            const allDetails = await fetchDetails(all.media_type, all.id);
            return {
              ...all,
              images: imagesData,
              details: allDetails,
            };
          })
        );

        setTrendingMovies(MoviesWithImagesAndDetails.slice(0, 20));
        setTrendingTvShows(TvWithImagesAndDetails.slice(0, 20));
        setGenres(genresData);
        setTopRatedMovies(topRatedMoviesData.slice(0, 8));
        setTopRatedTvShows(topRateTvShowsData.slice(0, 8));
        setTrendingAll(trendingDataWithImagesAndDetails);
        setStreamingProviders(
          companiesWithLogos.filter((company) => company.logo_path)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(trendingAll);
  console.log(streamingProviders);


  // Filter content by genre
  const filteredContent = () => {
    const content = contentType === "movie" ? trendingMovies : trendingTvShows;

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
    // For movies, filter trending movies with valid logos and backdrops
    const eligibleMovies = trendingAll.filter(
      (all) => hasValidLogo(all) && hasValidBackdrop(all)
    );
    // If no eligible movies, return null
    if (eligibleMovies.length === 0) return null;
    // Return a random eligible movie
    const randomIndex = Math.floor(Math.random() * eligibleMovies.length);
    return eligibleMovies[randomIndex];
  }, [contentType, trendingAll]);

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
      <Box bg="black" minHeight="100vh">
        {/* Hero Skeleton */}
        <Box
          height={heroHeight}
          position="relative"
          overflow="hidden"
          bg="gray.800"
        >
          <Container maxW="container.xl" height="100%" position="relative">
            <Flex
              height="100%"
              flexDirection="column"
              justifyContent="flex-end"
              pb={10}
              px={[4, 6, 8]}
            >
              <Box maxWidth="600px">
                <Skeleton height="32px" width="120px" mb={4} />
                <Skeleton height="64px" width="300px" mb={6} />
                <SkeletonText
                  mt="4"
                  noOfLines={3}
                  spacing="4"
                  skeletonHeight="4"
                  width="500px"
                  mb={6}
                />
                <Flex gap={4}>
                  <Skeleton height="40px" width="140px" borderRadius="md" />
                  <Skeleton height="40px" width="120px" borderRadius="md" />
                </Flex>
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* Main Content Skeleton */}
        <Box py={8} bg="black">
          <Container maxW="container.xl">
            <Box mb={12}>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                mb={6}
                px={[4, 6, 8]}
              >
                <Skeleton height="28px" width="180px" />
                <Skeleton height="32px" width="160px" borderRadius="full" />
              </Flex>

              {/* Genre Filter Skeleton */}
              <Box px={[4, 6, 8]} mb={6}>
                <Flex gap={4} overflowX="auto" pb={4}>
                  {[...Array(8)].map((_, i) => (
                    <Skeleton
                      key={i}
                      height="28px"
                      width={`${60 + Math.random() * 40}px`}
                    />
                  ))}
                </Flex>
              </Box>

              {/* Content Grid Skeleton */}
              <SimpleGrid
                columns={gridColumns}
                gap={4}
                spacing={6}
                px={[4, 6, 8]}
              >
                {[...Array(8)].map((_, i) => (
                  <Box
                    key={i}
                    borderRadius="lg"
                    overflow="hidden"
                    bg="gray.800"
                  >
                    <Skeleton height="260px" width="100%" />
                    <Box p={4}>
                      <SkeletonText mt="2" noOfLines={2} spacing="4" />
                      <Flex justify="space-between" mt={4}>
                        <Skeleton height="32px" width="80px" />
                        <Skeleton height="32px" width="80px" />
                      </Flex>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>

              {/* Top Rated Skeleton */}
              <Box mt={12}>
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb={6}
                  px={[4, 6, 8]}
                >
                  <Skeleton height="28px" width="140px" />
                  <Skeleton height="20px" width="60px" />
                </Flex>
                <Flex gap={6} overflowX="auto" px={[4, 6, 8]} pb={4}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton
                      key={i}
                      height="180px"
                      minWidth="300px"
                      borderRadius="lg"
                    />
                  ))}
                </Flex>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  console.log(topRatedMovies);
  console.log(topRatedTvShows);

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
              background="linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.4) 100%)"
              boxShadow="inset 0 -20px 50px 0px rgba(0,0,0,0.9)"
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
                  py={2}
                  borderRadius="full"
                >
                  {contentType === "movie" ? (
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

                {/* Title Logo*/}
                <Box
                  position="absolute"
                  top="32%"
                  left={[2, 4, 8]}
                  maxWidth="75%"
                  zIndex={1}
                >
                  {hasValidLogo(featuredContent) && (
                    <MotionImage
                      src={`${baseImageOriginal}${
                        getEnglishLogo(featuredContent.images.logos).file_path
                      }`}
                      alt={`${featuredContent.name} logo`}
                      maxHeight="180px"
                      objectFit="contain"
                      filter="drop-shadow(0 0 10px rgba(0,0,0,0.6))"
                    />
                  )}
                </Box>

                {/* Stats */}
                <Box mb={4} display="flex" alignItems="center">
                  {featuredContent.vote_average > 0 && (
                    <Flex alignItems="center">
                      <Box
                        as={AiFillLike}
                        size={"25px"}
                        color={resolveRatingColor(featuredContent.vote_average)}
                        mr={1}
                      />
                      <Text color="white" fontWeight="bold">
                        {voteToPercentage(featuredContent.vote_average).toFixed(
                          0
                        )}
                        %
                      </Text>
                    </Flex>
                  )}
                  <Text px={3}>•</Text>
                  {featuredContent.release_date && (
                    <>
                      <Text color="gray.300" fontSize="md">
                        {new Date(featuredContent.release_date).getFullYear()}
                      </Text>
                      <Text px={3}>•</Text>
                    </>
                  )}
                  {featuredContent.first_air_date && (
                    <>
                      <Text color="gray.300" fontSize="md">
                        {new Date(featuredContent.first_air_date).getFullYear()}
                      </Text>
                      <Text px={3}>•</Text>
                    </>
                  )}
                  {featuredContent.details?.runtime && (
                    <>
                      <Text color="gray.300" fontSize="md">
                        {featuredContent.details?.runtime} min
                      </Text>
                      <Text px={3}>•</Text>
                    </>
                  )}
                  <Flex alignItems="center">
                    <Box as={FaStar} color="yellow.400" mr={1} />
                    <Text color="white" fontWeight="bold">
                      {featuredContent.vote_average.toFixed(1)}
                    </Text>
                  </Flex>
                  <Text px={2}>•</Text>
                  <Text color="gray.300" fontSize="md">
                    {getGenreNames(featuredContent.genre_ids)}
                  </Text>
                </Box>

                {/* Overview */}
                <Text
                  color="gray.200"
                  mb={6}
                  fontSize="lg"
                  maxWidth="600px"
                  textShadow="0 1px 3px rgba(0,0,0,0.7)"
                  noOfLines={4}
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
                    to={`/${featuredContent.media_type === "movie" ? "movie" : "tv"}/${
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
      <Box
        py={8}
        position="relative"
        minHeight="100vh"
        bg="linear-gradient(to bottom, 
                rgba(0, 0, 0, 0) 0%,
                rgba(0, 0, 0, 0.2) 8%,
                rgba(0, 0, 0, 0.4) 15%,
                rgba(0, 0, 0, 0.6) 25%,
                rgba(0, 0, 0, 0.8) 35%,
                rgba(0, 0, 0, 0.9) 50%,
                rgba(0, 0, 0, 1) 100%)"
      >
        <Container maxW="container.xl">
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
                  bg={contentType === "movie" ? accentColor : "transparent"}
                  _hover={{
                    bg:
                      contentType === "movie" ? accentColor : "whiteAlpha.200",
                  }}
                  onClick={() => setContentType("movie")}
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
              px={[6, 8, 10]}
              mx="auto"
              maxW="container.xl"
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollBehavior: "smooth",
              }}
            >
              <HStack spacing={6} gap={5} justifyContent="space-between">
                <Box
                  position="relative"
                  cursor="pointer"
                  onClick={() => setSelectedGenre("all")}
                  role="group"
                >
                  <Text
                    fontWeight={selectedGenre === "all" ? "bold" : "medium"}
                    color={
                      selectedGenre === "all" ? "orange.400" : "whiteAlpha.900"
                    }
                    pb={2}
                    transition="all 0.3s ease"
                    _groupHover={{
                      color:
                        selectedGenre === "all" ? "orange.400" : "orange.200",
                    }}
                  >
                    All
                  </Text>
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    width={selectedGenre === "all" ? "100%" : "0%"}
                    height="2px"
                    bg="orange.400"
                    borderRadius="full"
                    transition="all 0.3s ease"
                    opacity={selectedGenre === "all" ? 1 : 0}
                    _groupHover={{
                      width: "100%",
                      opacity: selectedGenre === "all" ? 1 : 0.4,
                    }}
                  />
                </Box>

                {genres.slice(0, 15).map((genre) => (
                  <Box
                    key={genre.id}
                    position="relative"
                    cursor="pointer"
                    onClick={() => setSelectedGenre(genre.id.toString())}
                    role="group"
                  >
                    <Text
                      fontWeight={
                        selectedGenre === genre.id.toString()
                          ? "bold"
                          : "medium"
                      }
                      color={
                        selectedGenre === genre.id.toString()
                          ? "orange.400"
                          : "whiteAlpha.900"
                      }
                      pb={2}
                      transition="all 0.3s ease"
                      _groupHover={{
                        color:
                          selectedGenre === genre.id.toString()
                            ? "orange.400"
                            : "orange.200",
                      }}
                    >
                      {genre.name}
                    </Text>
                    {/* Box for the underline effect */}
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      width={
                        selectedGenre === genre.id.toString() ? "100%" : "0%"
                      }
                      height="2px"
                      bg="orange.400"
                      borderRadius="full"
                      transition="all 0.3s ease"
                      opacity={selectedGenre === genre.id.toString() ? 1 : 0}
                      _groupHover={{
                        width: "100%",
                        opacity:
                          selectedGenre === genre.id.toString() ? 1 : 0.4,
                      }}
                    />
                  </Box>
                ))}
              </HStack>
            </Box>

            <SimpleGrid
              columns={gridColumns}
              gap={6}
              spacing={6}
              px={[4, 6, 8]}
            >
              {filteredContent()
                .slice(0, 8)
                .map((item, index) => (
                  <ContentGrid
                    key={item.id}
                    item={item}
                    index={index}
                    contentType={contentType}
                    baseImageOriginal={baseImageOriginal}
                  />
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
                to={contentType === "movie" ? "/movies" : "/shows"}
              >
                View All {contentType === "movie" ? "Movies" : "TV Shows"}
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
                // no scroll bar
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollBehavior: "smooth",
              }}
            >
              <Flex gap={6} pb={4}>
                {contentType === "movie"
                  ? topRatedMovies.map((item, index) => (
                      <MotionBox
                        as={Link}
                        to={`movie/${item.id}`}
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
                    ))
                  : topRatedTvShows.map((item, index) => (
                      <MotionBox
                        as={Link}
                        to={`tv/${item.id}`}
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
                          alt={item.name}
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
                              {item.name}
                            </Text>
                            <HStack>
                              <Badge colorScheme="yellow" variant="solid">
                                Top 10
                              </Badge>
                              <Text color="gray.300" fontSize="sm">
                                {item.first_air_date &&
                                  new Date(item.first_air_date).getFullYear()}
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
          {/* Streaming Providers Section */}
          <Box mb={12}>
            <Flex
              justifyContent="center"
              alignItems="center"
              mb={6}
              px={[4, 6, 8]}
              flexDirection="column"
            >
              <Heading color="white" size="lg" textAlign="center">
                KNOW WHAT YOU WANT? LET'S GET STARTED!
              </Heading>
            </Flex>

            <Box px={[4, 6, 8]}>
              <SimpleGrid
                columns={{ base: 2, sm: 3, md: 5 }}
                spacing={6}
                gap={3}
                mb={6}
              >
                {streamingProviders.slice(0, 10).map((provider) => (
                  <MotionBox
                    key={provider.id}
                    borderRadius="md"
                    p={3}
                    height="100px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    cursor="pointer"
                    bg="rgba(23, 25, 35, 0.6)"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(199, 75, 8, 0.5)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={`${baseImageOriginal}${provider.logo_path}`}
                      alt={provider.name}
                      maxWidth="90%"
                      maxHeight="80px"
                      objectFit="contain"
                    />
                  </MotionBox>
                ))}
              </SimpleGrid>

              <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={6}>
                {streamingProviders.slice(5, 10).map((provider) => (
                  <MotionBox
                    key={provider.id}
                    borderRadius="md"
                    p={3}
                    height="100px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    cursor="pointer"
                    bg="rgba(23, 25, 35, 0.6)"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(199, 75, 8, 0.5)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={`${baseImageOriginal}${provider.logo_path}`}
                      alt={provider.name}
                      maxWidth="90%"
                      maxHeight="80px"
                      objectFit="contain"
                    />
                  </MotionBox>
                ))}
              </SimpleGrid>
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

            <SimpleGrid
              columns={gridColumns}
              gap={6}
              spacing={6}
              px={[4, 6, 8]}
            >
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
                      src={`${baseImageOriginal}${item.images.backdrops[3].file_path}`}
                      alt={item.title}
                      w="100%"
                      h="100%"
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
