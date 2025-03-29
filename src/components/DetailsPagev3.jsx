import {
  baseImageOriginal,
  baseImageW500,
  fetchCredits,
  fetchDetails,
  fetchMovieImages,
} from "@/services/api";

import {
  FaPlayCircle,
  FaImdb,
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import { MdOutlineBookmarkAdd, MdShare, MdLocalMovies } from "react-icons/md";
import { RatingGroup } from "@chakra-ui/react";
import {
  convertMinutesToHours,
  resolveRatingColor,
  resolveRatingNumber,
  resolveStarRating,
  resolveStarRatingColor,
} from "@/utils/helper";
import TVShowEpisodes from "./TVShowEpisodes";
import {
  Box,
  Flex,
  Spinner,
  Container,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Separator,
} from "@chakra-ui/react";

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import MovieDetailsPage from "./MovieDetailsPage";
import { useAuth } from "@/context/AuthProvider";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useFirestore } from "@/services/firestore";
import { AnimatedWatchlistButton } from "./magicui/animated-subscribe-button";

function DetailsPage() {
  const [details, setDetails] = useState({});
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState({});
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);
  const backdropSliderRef = useRef(null);
  const [isInWatchList, setIsInWatchList] = useState(false);

  const { type, id } = useParams();
  const { user } = useAuth();
  const { addToWatchList, checkIfAlreadyInWatchList, removeFromWatchList } =
    useFirestore();

  // Color values for theme
  const accentColor = "#FEC34B";
  const overlayBg = "rgba(0, 0, 0, 0.75)";
  const cardBg = "rgba(18, 18, 18, 0.8)";

  useEffect(() => {
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
        console.log(error, "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [type, id]);

  useEffect(() => {
    if (!user) {
      setIsInWatchList(false);
      return;
    }

    checkIfAlreadyInWatchList(user?.uid, id)
      .then((res) => setIsInWatchList(res))
      .catch((err) => console.log(err));
  }, [user, id, checkIfAlreadyInWatchList]);

  // Loading state
  if (loading) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100vh"
        width="100%"
        bg="black"
      >
        <Spinner size="xl" thickness="4px" speed="0.65s" color={accentColor} />
      </Flex>
    );
  }

  const getEnglishLogo = (logos) => {
    if (!logos || logos.length === 0) return null;
    const englishLogo = logos.find((logo) => logo.iso_639_1 === "en");
    return englishLogo || logos[0];
  };

  // Functions to navigate through backdrops
  const nextBackdrop = () => {
    if (images?.backdrops && images.backdrops.length > 0) {
      setCurrentBackdropIndex((prevIndex) =>
        prevIndex === images.backdrops.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevBackdrop = () => {
    if (images?.backdrops && images.backdrops.length > 0) {
      setCurrentBackdropIndex((prevIndex) =>
        prevIndex === 0 ? images.backdrops.length - 1 : prevIndex - 1
      );
    }
  };

  const handleAddToWatchList = async () => {
    if (!user) {
      toaster.create({
        title: "Login Required",
        description: "Please login to add to watchlist",
        variant: "destructive",
        type: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // No need to try catch here as it is already handled in the addToWatchList function
    const data = {
      id: details.id,
      title: details.title || details.name,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      vote_average: details.vote_average,
      vote_count: details.vote_count,
      release_date: details.release_date || details.first_air_date,
      type: type,
    };

    await addToWatchList(data, user?.uid, details?.id?.toString());
    setIsInWatchList(
      await checkIfAlreadyInWatchList(user?.uid, details?.id?.toString())
    );
  };

  const handleRemoveFromWatchList = async () => {
    await removeFromWatchList(
      user?.uid.toString(),
      details?.id?.toString(),
      type
    );
    setIsInWatchList(
      await checkIfAlreadyInWatchList(user?.uid, details?.id?.toString())
    );
  };

  console.log(details);
  console.log(isInWatchList);

  return (
    <Box position="relative">
      <Toaster />
      {/* Backdrop with gradient overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage={`url(${baseImageOriginal}/${details?.backdrop_path})`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundAttachment="fixed"
        zIndex={-1}
        _after={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(0deg, rgba(0,0,0,0.95) 0%, ${overlayBg} 100%)`,
        }}
      />

      {/* Main content */}
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        p={{ base: 4, md: 12 }}
        pt={{ base: 8, md: 16 }}
        maxWidth="1400px"
        mx="auto"
      >
        {/* Movie logo */}
        <Image
          src={`${baseImageW500}/${getEnglishLogo(images?.logos)?.file_path}`}
          alt={details?.title || details?.name}
          width={{ base: "200px", md: "300px" }}
          height="auto"
          filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
        />

        {/* Genres */}
        <Flex gap="3" mb="4" mt={6} flexWrap="wrap">
          {details?.genres?.map((genre) => (
            <Box
              key={genre.id}
              bg={cardBg}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              color="white"
              backdropFilter="blur(8px)"
            >
              {genre.name}
            </Box>
          ))}
        </Flex>

        {/* Action buttons */}
        <Flex alignItems="center" gap={4} flexWrap="wrap">
          <Box
            as="button"
            bg={accentColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            mt={4}
            py={3}
            px={6}
            gap={2}
            color="black"
            borderRadius="full"
            _hover={{ opacity: 0.9, transform: "scale(1.02)" }}
            transition="all 0.2s"
            cursor="pointer"
          >
            <FaPlayCircle size="20px" /> PLAY NOW
          </Box>

          <AnimatedWatchlistButton
            isInWatchList={isInWatchList}
            handleAddToWatchlist={handleAddToWatchList}
            handleRemoveFromWatchlist={handleRemoveFromWatchList}
          />

          {details?.vote_average && (
            <Flex
              align="center"
              bg={cardBg}
              borderRadius="full"
              p={2}
              backdropFilter="blur(8px)"
              mt={4}
            >
              <Box
                bg={accentColor}
                borderRadius="full"
                width="40px"
                height="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FaStar size="18px" color="black" />
              </Box>
              <Text ml={3} mr={2} fontWeight="bold">
                {details.vote_average.toFixed(1)}
              </Text>
            </Flex>
          )}
        </Flex>

        {/* Content Grid */}
        <Flex
          mt={12}
          gap={{ base: 6, md: 12 }}
          flexDirection={{ base: "column", md: "row" }}
        >
          {/* Left Column - Description */}
          <Box flex="1">
            <Heading
              as="h2"
              size="lg"
              color="white"
              mb={4}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Description
            </Heading>

            <Text
              color="white"
              fontSize="md"
              lineHeight="1.7"
              textShadow="0 2px 4px rgba(0,0,0,0.5)"
              maxWidth={{ base: "100%", md: "80%" }}
            >
              {details?.overview}
            </Text>

            {/* Director/Creator */}
            {credits?.crew && credits.crew.length > 0 && (
              <Flex mt={8} alignItems="center">
                <Box
                  width="55px"
                  height="55px"
                  borderRadius="full"
                  overflow="hidden"
                  mt={6}
                  border="2px solid"
                  borderColor={accentColor}
                >
                  <Image
                    src={`${baseImageOriginal}${credits.crew[0].profile_path}`}
                    alt={credits.crew[0].name}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>

                <Box ml={3} mt={6}>
                  <Text color="white" fontSize="md" fontWeight="bold">
                    {credits.crew[0].name}
                  </Text>

                  <Text color="gray.300" fontSize="sm">
                    {credits.crew[0].job}
                  </Text>
                </Box>
                {/* User Reviews */}
                <Flex gap={2} mt={6}>
                  <Separator
                    orientation="vertical"
                    borderColor={"gray.500"}
                    width={1}
                    height={"40px"}
                    mx={6}
                  />
                  <Flex flexDirection={"column"}>
                    <Box>
                      <RatingGroup.Root
                        readOnly
                        allowHalf
                        count={5}
                        defaultValue={resolveStarRating(details.vote_average)}
                        colorPalette={resolveStarRatingColor(
                          details.vote_average
                        )}
                        size="sm"
                      >
                        <RatingGroup.HiddenInput />
                        <RatingGroup.Control />
                      </RatingGroup.Root>
                    </Box>

                    <Text color={"gray.300"} fontSize={"13px"} mt={-1}>
                      {resolveRatingNumber(details.vote_count)}
                    </Text>

                    <Text color={"gray.600"} fontSize={"13px"} mt={1.5}>
                      User Reviews
                    </Text>
                  </Flex>
                </Flex>
                {/* Critics Review */}
                <Flex gap={2} mt={6}>
                  <Separator
                    orientation="vertical"
                    borderColor={"gray.500"}
                    width={1}
                    height={"40px"}
                    mx={6}
                  />
                  <Flex flexDirection={"column"}>
                    <Box>
                      <RatingGroup.Root
                        readOnly
                        allowHalf
                        count={5}
                        defaultValue={resolveStarRating(details.vote_average)}
                        colorPalette={resolveStarRatingColor(
                          details.vote_average
                        )}
                        size="sm"
                      >
                        <RatingGroup.HiddenInput />
                        <RatingGroup.Control />
                      </RatingGroup.Root>
                    </Box>

                    <Text color={"gray.300"} fontSize={"13px"} mt={-1}>
                      {details.popularity.toFixed(2)}
                    </Text>

                    <Text color={"gray.600"} fontSize={"13px"} mt={2}>
                      Critic Reviews
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Box>

          {/* Right Column - Cast and Backdrops */}
          <Box flex="1" maxWidth={{ base: "100%", md: "45%" }}>
            {/* Cast Section */}
            <Heading
              as="h2"
              size="lg"
              color="white"
              mb={5}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              TOP CAST
            </Heading>

            <VStack align="start" spacing={4} gap={3}>
              {credits?.cast &&
                credits.cast.slice(0, 4).map((cast) => (
                  <Flex key={cast.id} alignItems="center">
                    <Box
                      width="55px"
                      height="55px"
                      borderRadius="full"
                      overflow="hidden"
                      border="2px solid"
                      borderColor={accentColor}
                    >
                      <Image
                        src={`${baseImageOriginal}${cast.profile_path}`}
                        alt={cast.name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    </Box>

                    <Box ml={3}>
                      <Text color="white" fontSize="md" fontWeight="bold">
                        {cast.name}
                      </Text>

                      <Text color="gray.300" fontSize="sm">
                        as {cast.character}
                      </Text>
                    </Box>
                  </Flex>
                ))}
            </VStack>

            {/* Extra Details */}
            {details?.runtime && (
              <Flex mt={8} align="center">
                <FaClock color={accentColor} />
                <Text color="white" ml={2} fontSize="sm">
                  {convertMinutesToHours(details.runtime)}
                </Text>
              </Flex>
            )}
          </Box>
        </Flex>

        {/* Only show TV episodes component for TV type */}
        {type === "tv" && (
          <TVShowEpisodes tvId={id} accentColor={accentColor} cardBg={cardBg} />
        )}
        {/* Only show for movie type */}
        {type === "movie" && (
          <MovieDetailsPage
            details={details}
            movieId={id}
            accentColor={accentColor}
            cardBg={cardBg}
          />
        )}
      </Box>
    </Box>
  );
}

export default DetailsPage;
