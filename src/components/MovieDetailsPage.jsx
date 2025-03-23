import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Image,
  SimpleGrid,
  Separator,
  Badge,
  VStack,
  HStack,
  Link,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFilm,
  FaGlobe,
} from "react-icons/fa";
import { fetchSimilarMovies, fetchMovieVideos } from "@/services/api";
import { baseImageW500 } from "@/services/api";
import { Link as RouterLink } from "react-router-dom";

function MovieDetailsPage({ movieId, details, accentColor, cardBg }) {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [similarData, videosData] = await Promise.all([
          fetchSimilarMovies(movieId),
          fetchMovieVideos(movieId),
        ]);

        setSimilarMovies(similarData.results.slice(0, 6)); // Get first 6 similar movies
        setVideos(
          videosData.results
            .filter(
              (video) =>
                video.site === "YouTube" &&
                (video.type === "Trailer" || video.type === "Teaser")
            )
            .slice(0, 3)
        ); // Get up to 3 trailers/teasers
      } catch (error) {
        console.error("Error fetching movie details data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  // This function assumes details is passed from parent component or fetched here
  // You can modify this to either accept details as a prop or fetch it here
  const renderMovieDetails = (details) => {
    if (!details) return null;

    return (
      <VStack spacing={6} align="flex-start" width="100%" mt={6}>
        <Flex direction={{ base: "column", md: "row" }} gap={6} width="100%">
          {/* Left Column - Financial Details */}
          <Box flex="1">
            <Heading
              as="h3"
              size="md"
              color="white"
              mb={4}
              borderBottom="2px solid"
              borderColor={accentColor}
              pb={2}
            >
              Movie Facts
            </Heading>

            <VStack spacing={4} align="flex-start">
              {details.release_date && (
                <Flex align="center">
                  <FaCalendarAlt color={accentColor} />
                  <Text color="white" ml={3}>
                    <Text as="span" fontWeight="bold">
                      Release Date:
                    </Text>{" "}
                    {new Date(details.release_date).toLocaleDateString()}
                  </Text>
                </Flex>
              )}

              {details.budget > 0 && (
                <Flex align="center">
                  <FaMoneyBillWave color={accentColor} />
                  <Text color="white" ml={3}>
                    <Text as="span" fontWeight="bold">
                      Budget:
                    </Text>{" "}
                    ${details.budget.toLocaleString()}
                  </Text>
                </Flex>
              )}

              {details.revenue > 0 && (
                <Flex align="center">
                  <FaMoneyBillWave color={accentColor} />
                  <Text color="white" ml={3}>
                    <Text as="span" fontWeight="bold">
                      Revenue:
                    </Text>{" "}
                    ${details.revenue.toLocaleString()}
                  </Text>
                </Flex>
              )}

              {details.original_language && (
                <Flex align="center">
                  <FaGlobe color={accentColor} />
                  <Text color="white" ml={3}>
                    <Text as="span" fontWeight="bold">
                      Original Language:
                    </Text>{" "}
                    {details.original_language.toUpperCase()}
                  </Text>
                </Flex>
              )}

              {details.status && (
                <Flex align="center">
                  <Box
                    width="14px"
                    height="14px"
                    borderRadius="full"
                    bg={
                      details.status === "Released" ? "green.400" : "orange.400"
                    }
                  />
                  <Text color="white" ml={3}>
                    <Text as="span" fontWeight="bold">
                      Status:
                    </Text>{" "}
                    {details.status}
                  </Text>
                </Flex>
              )}
            </VStack>
          </Box>

          {/* Right Column - Production Companies */}
          <Box flex="1">
            <Heading
              as="h3"
              size="md"
              color="white"
              mb={4}
              borderBottom="2px solid"
              borderColor={accentColor}
              pb={2}
            >
              Production Companies
            </Heading>

            <Flex wrap="wrap" gap={4}>
              {details.production_companies &&
                details.production_companies.map((company) => (
                  <Flex
                    key={company.id}
                    direction="column"
                    align="center"
                    bg={cardBg}
                    p={3}
                    borderRadius="md"
                    width={{
                      base: "100%",
                      sm: "calc(50% - 8px)",
                      md: "calc(33% - 11px)",
                    }}
                    backdropFilter="blur(8px)"
                  >
                    {company.logo_path ? (
                      <Image
                        src={`${baseImageW500}/${company.logo_path}`}
                        alt={company.name}
                        height="40px"
                        objectFit="contain"
                        mb={2}
                      />
                    ) : (
                      <Box
                        height="40px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={2}
                      >
                        <FaFilm color={accentColor} size="24px" />
                      </Box>
                    )}
                    <Text
                      color="white"
                      fontSize="sm"
                      textAlign="center"
                      fontWeight="medium"
                    >
                      {company.name}
                    </Text>
                  </Flex>
                ))}
            </Flex>
          </Box>
        </Flex>
      </VStack>
    );
  };

  return (
    <Box mt={16}>
      <Separator borderColor="rgba(255,255,255,0.2)" mb={12} />

      {/* Movie Details Section */}
      {renderMovieDetails(details)}

      {/* Videos Section */}
      {videos.length > 0 && (
        <Box mt={12}>
          <Heading
            as="h2"
            size="lg"
            color="white"
            mb={6}
            textTransform="uppercase"
            letterSpacing="wide"
          >
            Trailers & Videos
          </Heading>

          <SimpleGrid
            columns={{
              base: 1,
              md: videos.length > 1 ? 2 : 1,
              lg: videos.length > 2 ? 3 : videos.length,
            }}
            spacing={6}
          >
            {videos.map((video) => (
              <Box
                key={video.id}
                bg={cardBg}
                borderRadius="md"
                overflow="hidden"
                boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-4px)" }}
              >
                <Box position="relative" paddingTop="56.25%">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.key}`}
                    title={video.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </Box>
                <Box p={3}>
                  <Text color="white" fontWeight="semibold" noOfLines={2}>
                    {video.name}
                  </Text>
                  <Badge colorScheme="yellow" mt={2}>
                    {video.type}
                  </Badge>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <Box mt={12}>
          <Heading
            as="h2"
            size="lg"
            color="white"
            mb={6}
            textTransform="uppercase"
            letterSpacing="wide"
          >
            Similar Movies
          </Heading>

          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
            {similarMovies.map((movie) => (
              <Link
                as={RouterLink}
                to={`/details/movie/${movie.id}`}
                key={movie.id}
                textDecoration="none"
                _hover={{ textDecoration: "none" }}
              >
                <Box
                  bg={cardBg}
                  borderRadius="lg"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-8px)" }}
                  height="100%"
                  backdropFilter="blur(8px)"
                >
                  <Image
                    src={`${baseImageW500}/${movie.poster_path}`}
                    alt={movie.title}
                    width="100%"
                    height="auto"
                    objectFit="cover"
                    borderRadius="lg lg 0 0"
                  />
                  <Box p={3}>
                    <Text
                      color="white"
                      fontWeight="bold"
                      fontSize="sm"
                      noOfLines={2}
                      mb={2}
                    >
                      {movie.title}
                    </Text>
                    <Flex align="center">
                      <Box
                        color="black"
                        bg={accentColor}
                        fontWeight="bold"
                        fontSize="xs"
                        p={1}
                        px={2}
                        borderRadius="md"
                      >
                        {movie.vote_average.toFixed(1)}
                      </Box>
                      <Text color="gray.300" fontSize="xs" ml={2}>
                        {movie.release_date?.substring(0, 4)}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
}

export default MovieDetailsPage;
