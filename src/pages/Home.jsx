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
  IconButton,
} from "@chakra-ui/react";
import ContentGrid from "@/components/ContentGrid";
import { Skeleton, SkeletonText, SkeletonCircle } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import {
  FaPlay,
  FaStar,
  FaArrowRight,
  FaInfoCircle,
  FaClock,
} from "react-icons/fa";
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
  formatAirDateRange,
  getSeasonInfo,
  convertMinutesToHours,
} from "@/utils/helper";
import { AiFillLike } from "react-icons/ai";
import { BsCalendarDate } from "react-icons/bs";
import { FaClapperboard } from "react-icons/fa6";

// Motion components with enhanced variants
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);

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

  // Enhanced color scheme
  const accentColor = "#E63946"; // Brighter red
  const secondaryAccent = "#457B9D"; // Cool blue contrast
  const cardBg = "rgba(15, 17, 25, 0.85)";
  const gradientBg =
    "linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(15,17,25,0.95))";

  // Responsive values
  const heroHeight = useBreakpointValue({ base: "80vh", md: "85vh" });
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const hoverAccentColor = "rgba(230, 57, 70, 1)";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Optimize by using Promise.all for parallel requests
        const [
          trendingData,
          moviesData,
          tvData,
          genresData,
          topRatedMoviesData,
          topRateTvShowsData,
        ] = await Promise.all([
          fetchTrending(),
          fetchTrendingMovies(),
          fetchTrendingTVShows(),
          fetchGenres("movie"),
          fetchTopRated("movie"),
          fetchTopRated("tv"),
        ]);

        // Batch fetch TV details for better performance
        const TvWithImagesAndDetails = await Promise.all(
          tvData.map(async (tv) => {
            const [imagesData, tvDetails] = await Promise.all([
              fetchMovieImages("tv", tv.id),
              fetchDetails("tv", tv.id),
            ]);
            return {
              ...tv,
              images: imagesData,
              details: tvDetails,
            };
          })
        );

        // Batch fetch Movie details
        const MoviesWithImagesAndDetails = await Promise.all(
          moviesData.map(async (movie) => {
            const [imagesData, movieDetails] = await Promise.all([
              fetchMovieImages("movie", movie.id),
              fetchDetails("movie", movie.id),
            ]);
            return {
              ...movie,
              images: imagesData,
              details: movieDetails,
            };
          })
        );

        // Fetch company logos with improved error handling
        const companiesWithLogos = await Promise.all(
          popularStreamingCompanies.map(async (company) => {
            try {
              const imagesResponse = await fetch(
                `https://api.themoviedb.org/3/company/${company.id}/images?api_key=${apiKey}`
              );

              if (!imagesResponse.ok) {
                throw new Error(`HTTP error ${imagesResponse.status}`);
              }

              const imagesData = await imagesResponse.json();

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
            const [imagesData, allDetails] = await Promise.all([
              fetchMovieImages(all.media_type, all.id),
              fetchDetails(all.media_type, all.id),
            ]);
            return {
              ...all,
              images: imagesData,
              details: allDetails,
            };
          })
        );

        // Update state with fetched data
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

  // Enhanced gradient overlay for better contrast and depth
  const gradientOverlay =
    "linear-gradient(rgba(0,0,0,0.1) 0%, rgba(10,10,25,0.7) 60%, rgba(10,10,25,0.95) 90%, rgba(10,10,25,1) 100%)";

  const getBackdropToUse = (randomShow) => {
    if (
      !randomShow ||
      !randomShow.images ||
      !randomShow.images.backdrops ||
      randomShow.images.backdrops.length === 0
    ) {
      return null;
    }

    // Try to find a backdrop with null language first (typically means original/global)
    const nullLanguageBackdrop = randomShow.images.backdrops.filter(
      (backdrop) => backdrop.iso_639_1 === null
    );

    // Use highest vote_average backdrop if available
    if (nullLanguageBackdrop.length > 0) {
      return nullLanguageBackdrop.sort(
        (a, b) => b.vote_average - a.vote_average
      )[0];
    }

    // Otherwise sort all backdrops by vote_average
    return randomShow.images.backdrops.sort(
      (a, b) => b.vote_average - a.vote_average
    )[0];
  };

  // Filter content by genre with memoization for performance
  const filteredContent = useMemo(() => {
    const content = contentType === "movie" ? trendingMovies : trendingTvShows;

    if (selectedGenre === "all") {
      return content;
    }

    return content.filter(
      (item) =>
        item.genre_ids && item.genre_ids.includes(parseInt(selectedGenre))
    );
  }, [contentType, selectedGenre, trendingMovies, trendingTvShows]);

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

  // Featured content selection with proper memoization
  const featuredContent = useMemo(() => {
    // For all content, filter trending with valid logos and backdrops
    const eligibleContent = trendingAll.filter(
      (item) => hasValidLogo(item) && hasValidBackdrop(item)
    );

    // If no eligible content, return null
    if (eligibleContent.length === 0) return null;

    // Prioritize highly rated content
    const sortedContent = [...eligibleContent].sort(
      (a, b) => b.vote_average - a.vote_average
    );

    // Take top 5 and select one randomly for variety
    const topContent = sortedContent.slice(0, 5);
    const randomIndex = Math.floor(Math.random() * topContent.length);
    return topContent[randomIndex];
  }, [trendingAll]);

  // Helper function to get genre names with null check
  const getGenreNames = (genreIds) => {
    if (!genreIds || !genres.length) return "";
    return genreIds
      .slice(0, 2)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .join(" • ");
  };

  // Custom animation variants for unique transitions
  const backdropVariants = {
    initial: {
      opacity: 0,
      scale: 1.05,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        opacity: { duration: 0.8, ease: "easeOut" },
        scale: { duration: 8, ease: [0.25, 0.1, 0.25, 1] },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      transition: {
        duration: 0.5,
        ease: "easeIn",
      },
    },
  };

  const contentInVariants = {
    initial: {
      opacity: 0,
      y: 30,
    },
    animate: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
    exit: {
      opacity: 0,
      y: -15,
      transition: {
        duration: 0.3,
      },
    },
  };

  const logoVariants = {
    initial: {
      opacity: 0,
      scale: 0.9,
      filter: "blur(5px)",
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(5px)",
      transition: {
        duration: 0.4,
      },
    },
  };

  if (loading) {
    return (
      <Box bg="black" minHeight="100vh">
        {/* Hero Skeleton */}
        <Box
          height={heroHeight}
          position="relative"
          overflow="hidden"
          bg="gray.900"
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

  return (
    <Box position={"relative"}>
      {/* Hero Section */}
      {featuredContent && hasValidBackdrop(featuredContent) && (
        //   {/* Full-screen background with enhanced animation */}
        <AnimatePresence mode="wait">
          <MotionBox
            key={featuredContent.id}
            position="fixed"
            top={0}
            left={0}
            right={0}
            width="100%"
            height="100%"
            zIndex={-1}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            backgroundImage={`url(${baseImageOriginal}${
              getBackdropToUse(featuredContent)?.file_path
            })`}
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
          >
            {/* Gradient overlay with improved aesthetics */}
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              background={gradientOverlay}
            />
          </MotionBox>
        </AnimatePresence>
      )}

      <Box position="relative" height="75vh" display="flex" alignItems="center">
        <Container maxW="container.xl" height="100%" position="relative">
          <AnimatePresence mode='popLayout'>
            {featuredContent && (
              <MotionFlex
                key={`content-${featuredContent.id}`}
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
                variants={contentInVariants}
                custom={0}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* Logo Section */}
                <Box
                  position="absolute"
                  top="23%"
                  left={[2, 4, 8]}
                  maxWidth="60%"
                  zIndex={1}
                >
                  {/* Content Type Badge with improved style */}
                  <MotionBox custom={1} variants={contentInVariants}>
                    <Badge
                      colorScheme="red"
                      bg={accentColor}
                      mb={10}
                      fontSize="sm"
                      display="inline-flex"
                      alignItems="center"
                      pl={2}
                      pr={3}
                      py={2}
                      boxShadow="0 2px 10px rgba(230, 57, 70, 0.4)"
                    >
                      {featuredContent.media_type === "movie" ? (
                        <>
                          <BiCameraMovie style={{ marginRight: "6px" }} />{" "}
                          Featured Movie
                        </>
                      ) : (
                        <>
                          <BiTv style={{ marginRight: "6px" }} /> Featured TV
                          Show
                        </>
                      )}
                    </Badge>
                  </MotionBox>

                  {hasValidLogo(featuredContent) ? (
                    <MotionImage
                      src={`${baseImageOriginal}${
                        getEnglishLogo(featuredContent.images.logos).file_path
                      }`}
                      alt={`${
                        featuredContent.name || featuredContent.title
                      } logo`}
                      maxHeight="180px"
                      objectFit="contain"
                      filter="drop-shadow(0 0 10px rgba(0,0,0,0.6))"
                      variants={logoVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    />
                  ) : (
                    <MotionBox
                      variants={contentInVariants}
                      custom={2}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Heading
                        size="2xl"
                        fontWeight="bold"
                        textShadow="0px 0px 10px rgba(0,0,0,0.8)"
                      >
                        {featuredContent.name || featuredContent.title}
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
                  variants={contentInVariants}
                  custom={3}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {/* Genre section with separator */}
                  {featuredContent.details &&
                    featuredContent.details.genres && (
                      <HStack spacing={1} mb={3} wrap="wrap" ml={[2, 4, 8]}>
                        {featuredContent.details.genres.map((genre, index) => (
                          <Box
                            key={genre.id}
                            display="flex"
                            alignItems="center"
                          >
                            <Text
                              fontSize="md"
                              fontWeight="medium"
                              textShadow="0px 0px 8px rgba(0,0,0,0.8)"
                            >
                              {genre.name}
                            </Text>
                            {index <
                              featuredContent.details.genres.length - 1 && (
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

                  {/* TV Show info banner with enhanced visuals */}
                  <Box
                    position="relative"
                    mb={4}
                    maxWidth="fit-content"
                    ml={[2, 4, 8]}
                  >
                    <Flex alignItems="center" maxWidth="fit-content" gap={4}>
                      {featuredContent.vote_average > 0 && (
                        <Flex alignItems="center">
                          <Box
                            as={AiFillLike}
                            size={"25px"}
                            color={resolveRatingColor(
                              featuredContent.vote_average
                            )}
                            mr={1}
                          />
                          <Text color="white" fontWeight="bold">
                            {voteToPercentage(
                              featuredContent.vote_average
                            ).toFixed(0)}
                            %
                          </Text>
                        </Flex>
                      )}
                      {/* Year Range */}
                      {featuredContent.media_type === "tv" && (
                        <Flex alignItems="center">
                          <Box as={BsCalendarDate} mr={2} color={accentColor} />
                          <Text fontWeight="medium" fontSize="md">
                            {formatAirDateRange(featuredContent)}
                          </Text>
                        </Flex>
                      )}

                      {/* Year */}
                      {featuredContent.media_type === "movie" && (
                        <Flex alignItems="center">
                          <Box as={BsCalendarDate} mr={2} color={accentColor} />
                          <Text fontWeight="medium" fontSize="md">
                            {featuredContent.release_date &&
                              new Date(
                                featuredContent.release_date
                              ).getFullYear()}
                          </Text>
                        </Flex>
                      )}

                      {/* Seasons & Episodes */}
                      {featuredContent.media_type === "tv" && (
                        <Flex alignItems="center">
                          <Box as={FaClapperboard} mr={2} color={accentColor} />
                          <Text fontWeight="medium" fontSize="md">
                            {getSeasonInfo(featuredContent)}
                          </Text>
                        </Flex>
                      )}

                      {/* Duration */}
                      {featuredContent.media_type === "movie" && (
                        <Flex alignItems="center">
                          <Box as={FaClock} mr={2} color={accentColor} />
                          <Text fontWeight="medium" fontSize="md">
                            {featuredContent.details &&
                              convertMinutesToHours(
                                featuredContent.details.runtime
                              )}
                          </Text>
                        </Flex>
                      )}

                      {/* Rating with star */}
                      {featuredContent.vote_average !== 0 && (
                        <Flex align="center">
                          <Box as={FaStar} mr={2} color="yellow.400" />
                          <Text fontWeight="bold">
                            {featuredContent.vote_average &&
                              featuredContent.vote_average.toFixed(1)}
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  </Box>

                  {/* Overview Text with improved styling */}
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
                      {featuredContent.overview}
                    </Text>
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      height="30px"
                      bgGradient="linear(to-t, rgba(10,10,25,1), transparent)"
                    />
                  </Box>

                  {/* Action Buttons with enhanced animations */}
                  <HStack spacing={4} ml={[2, 4, 8]}>
                    <MotionBox
                      whileHover={{
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        },
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        colorScheme="red"
                        size="lg"
                        leftIcon={<FaPlay />}
                        bg={accentColor}
                        _hover={{
                          bg: hoverAccentColor,
                        }}
                        transition="all 0.2s"
                        px={5}
                        mr={3}
                        fontWeight="bold"
                        boxShadow="0 4px 15px rgba(230, 57, 70, 0.3)"
                      >
                        Watch
                      </Button>
                    </MotionBox>

                    <MotionBox
                      whileHover={{
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        },
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        as={Link}
                        to={`/${featuredContent.media_type}/${featuredContent.id}`}
                        variant="outline"
                        size="lg"
                        leftIcon={<FaInfoCircle />}
                        _hover={{
                          bg: "rgba(255,255,255,0.1)",
                        }}
                        transition="all 0.2s"
                        borderColor="white"
                      >
                        Details
                      </Button>
                    </MotionBox>
                  </HStack>
                </MotionFlex>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Container>
      </Box>    
      
      {/* Main Content */}
      
    </Box>
  );
};

export default Home;
