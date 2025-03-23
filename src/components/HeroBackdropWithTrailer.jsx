import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  Image,
  HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaPlay, FaStar, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { AiFillLike } from "react-icons/ai";
import { BiCameraMovie, BiTv } from "react-icons/bi";
import { Link } from "react-router-dom";

// Motion components
const MotionBox = motion(Box);
const MotionImage = motion(Image);

const HeroBackdropWithTrailer = ({
  featuredContent,
  contentType,
  baseImageOriginal,
  accentColor = "#C74B08",
  getGenreNames,
  voteToPercentage,
  resolveRatingColor,
  heroHeight = "80vh",
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Video sources would come from your API, but we'll mock them for this example
  const trailerUrl = featuredContent?.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  )?.key;

  // Fallback to a normal YouTube embed if we don't have specific video data
  const mockTrailerUrl = featuredContent?.id
    ? `https://www.youtube.com/embed/${
        featuredContent.id % 9 === 0 ? "qSqVVswa420" : "go8fqwQS8zo"
      }?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${
        featuredContent.id % 9 === 0 ? "qSqVVswa420" : "go8fqwQS8zo"
      }`
    : null;

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

  const handleMouseEnter = () => {
    // Add a slight delay before starting the trailer to avoid triggering on quick mouse movements
    hoverTimerRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 700);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    setIsHovering(false);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  useEffect(() => {
    if (isHovering && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
    return () => {
      clearTimeout(hoverTimerRef.current);
    };
  }, [isHovering]);

  if (!featuredContent) return null;

  return (
    <Box
      height={heroHeight}
      position="relative"
      overflow="hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image or Video */}
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height="100%"
        initial={{ scale: 1.1 }}
        animate={{ scale: isHovering ? 1 : 1.03 }}
        transition={{ duration: isHovering ? 0.4 : 10 }}
      >
        {isHovering && (trailerUrl || mockTrailerUrl) ? (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            width="100%"
            height="100%"
            zIndex={1}
            overflow="hidden"
          >
            {/* YouTube embed fallback */}
            <iframe
              ref={videoRef}
              src={
                trailerUrl
                  ? `https://www.youtube.com/embed/${trailerUrl}?autoplay=1&mute=${
                      isMuted ? 1 : 0
                    }&controls=0&showinfo=0&rel=0`
                  : mockTrailerUrl
              }
              title="Trailer"
              width="100%"
              height="100%"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1.5)", // Scale up to fill more space
                border: "none",
                opacity: isVideoLoaded ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsVideoLoaded(true)}
            />
          </Box>
        ) : (
          <Image
            src={`${baseImageOriginal}${featuredContent.backdrop_path}`}
            alt={featuredContent.title || featuredContent.name}
            width="100%"
            height="100%"
            objectFit="cover"
            backgroundPosition="center"
            backgroundSize="cover"
          />
        )}

        {/* Gradient overlay - always present */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          background="linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.4) 100%)"
          boxShadow="inset 0 -20px 50px 0px rgba(0,0,0,0.9)"
          zIndex={2}
        />
      </MotionBox>

      {/* Video Controls */}
      {isHovering && (trailerUrl || mockTrailerUrl) && (
        <Button
          position="absolute"
          top="20px"
          right="20px"
          bg="rgba(0,0,0,0.7)"
          color="white"
          zIndex={5}
          onClick={toggleMute}
          size="sm"
          borderRadius="full"
          _hover={{ bg: "rgba(0,0,0,0.9)" }}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </Button>
      )}

      {/* Content overlay - match the existing content layout */}
      <Container
        maxW="container.xl"
        height="100%"
        position="relative"
        zIndex={3}
      >
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
              {contentType === "movie" ||
              featuredContent.media_type === "movie" ? (
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
                  alt={`${featuredContent.title || featuredContent.name} logo`}
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
                    {voteToPercentage(featuredContent.vote_average).toFixed(0)}%
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
                {getGenreNames && getGenreNames(featuredContent.genre_ids)}
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
                to={`/${
                  featuredContent.media_type === "movie" ? "movie" : "tv"
                }/${featuredContent.id}`}
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

      {/* Hover Instruction - shown only when not hovering */}
      {!isHovering && (
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={4}
          alignItems="center"
          justifyContent="center"
          bg="rgba(0,0,0,0.6)"
          borderRadius="full"
          p={3}
          opacity={0.7}
          transition="opacity 0.3s ease"
          _hover={{ opacity: 0.9 }}
        >
          <Box as={FaPlay} color="white" mr={2} />
          <Text color="white" fontWeight="medium">
            Hover to Play Trailer
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default HeroBackdropWithTrailer;
