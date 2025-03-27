import React, { useEffect, useState, useRef } from "react";
import { Box, Image, Text, Flex, Badge } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { baseImageW500, fetchTrailers } from "@/services/api";

const MotionBox = motion.create(Box);

const ContentGrid = ({ item, index, contentType, baseImageOriginal }) => {
  const [trailerData, setTrailerData] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [trailerError, setTrailerError] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [showFullTrailer, setShowFullTrailer] = useState(false);
  const videoRef = useRef(null);
  const accentColor = "";
  const cardAccentColor = accentColor;
  const cardAccentColorDark = accentColor;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTrailers(contentType, item.id);
        setTrailerData(data);
      } catch (error) {
        console.error("Error fetching trailer:", error);
        setTrailerError(true);
      }
    };
    fetchData();
  }, [item.id, contentType]);

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  useEffect(() => {
    let timeout;
    if (isHovering && trailerLoaded) {
      timeout = setTimeout(() => {
        setShowFullTrailer(true);
      }, 400); // Slightly longer delay for smoother transition
    } else {
      setShowFullTrailer(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isHovering, trailerLoaded]);

  const trailerKey = trailerData?.[0]?.key;
  const hasTrailer = !!trailerKey && !trailerError;

  const posterUrl = item.backdrop_path
    ? `${baseImageW500}${item.backdrop_path}`
    : item.poster_path
    ? `${baseImageW500}${item.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => setIsHovering(true), 300); // Reduced delay for more responsive hover
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setIsHovering(false);
    setTimeout(() => {
      setTrailerLoaded(false);
      setShowFullTrailer(false);
    }, 400); // Increased delay for smoother exit
  };

  const handleVideoLoad = () => setTrailerLoaded(true);
  const handleVideoError = () => setTrailerError(true);

  // Smoother spring configuration
  const springConfig = {
    type: "spring",
    stiffness: 200, // Reduced stiffness for smoother motion
    damping: 25, // Adjusted damping for smoother oscillation
    mass: 1.2, // Added mass for more inertia
  };

  // Smoother transition for general animations
  const smoothTransition = {
    type: "tween",
    ease: "easeInOut", // Smoother easing function
    duration: 0.5, // Slightly longer duration
  };

  const cardVariants = {
    initial: {
      scale: 1,
      zIndex: 1,
    },
    hover: {
      scale: 1.3,
      zIndex: 100,
      transition: {
        ...springConfig,
        scale: {
          ...springConfig,
          duration: 0.6, // Slightly longer scale duration
        },
      },
    },
  };

  const contentVariants = {
    visible: {
      opacity: 1,
      y: 0,
      height: "auto",
      scale: 1,
      transition: {
        height: { duration: 0.4, ease: "easeOut" },
        opacity: { duration: 0.3, ease: "easeInOut" },
      },
      overflow: "hidden",
    },
    hidden: {
      opacity: 0,
      height: "0px",
      scale: 1,
      margin: 0,
      padding: 0,
      transition: {
        height: { duration: 0.4, delay: 0.1, ease: "easeIn" },
        opacity: { duration: 0.3, ease: "easeInOut" },
        margin: { duration: 0.4 },
        padding: { duration: 0.4 },
      },
      overflow: "hidden",
    },
  };

  const badgeVariants = {
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    hidden: {
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <MotionBox
      as={Link}
      to={`/${contentType === "movie" ? "movie" : "tv"}/${item.id}`}
      key={item.id}
      borderRadius="2xl"
      overflow="visible"
      bg="rgba(17, 25, 40, 0.75)"
      height="100%"
      maxHeight="400px"
      boxShadow="lg"
      position="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          ...smoothTransition,
          delay: index * 0.07, // Slightly faster staggered animation
        },
      }}
      transition={smoothTransition}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variants={cardVariants}
      whileHover="hover"
      _hover={{ boxShadow: "dark-lg" }}
    >
      <Box
        p={1.5}
        height="100%"
        display="grid"
        gridTemplateRows={
          showFullTrailer && isHovering && hasTrailer && trailerLoaded
            ? "1fr"
            : "1fr auto"
        }
        gap={2}
        transition="all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)" // More refined transition curve
      >
        {/* Poster Container */}
        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          transition="all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)" // More refined transition curve
        >
          <Image
            src={posterUrl}
            alt={item.title || item.name}
            height="100%"
            width="100%"
            objectFit="cover"
            borderRadius="xl"
            fallbackSrc="https://via.placeholder.com/300x450?text=No+Image"
            style={{
              opacity: isHovering && hasTrailer && trailerLoaded ? 0 : 1,
              transition: "opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)", // Smoother opacity transition
            }}
          />

          <AnimatePresence>
            {isHovering && hasTrailer && (
              <MotionBox
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                initial={{ opacity: 0, scale: 1.05, zIndex: 10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  zIndex: 50,
                  transition: {
                    opacity: {
                      delay: 0.2,
                      duration: 0.6, // Longer fade-in
                      ease: "easeOut",
                    },
                    scale: {
                      duration: 0.8, // Longer scale animation
                      ease: "easeOut",
                    },
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    ease: "easeInOut",
                  },
                }}
                borderRadius="xl"
                overflow="visible"
                zIndex={20}
                transformOrigin="center center"
                style={{
                  aspectRatio: "16/9",
                }}
              >
                <Box
                  as="div"
                  position="relative"
                  width="100%"
                  height="100%"
                  borderRadius="xl"
                  boxShadow="0px 10px 30px -5px rgba(0, 0, 0, 0.5)"
                  padding="4px" // Add equal padding all around
                >
                  <iframe
                    ref={videoRef}
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1`}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: "12px",
                      pointerEvents: "none",
                      opacity: trailerLoaded ? 1 : 0,
                      transition: "opacity 1s ease-in-out", // Smoother fade-in for the trailer
                    }}
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                    title={`${item.title || item.name} trailer`}
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    zIndex={3}
                    borderRadius="xl"
                  />
                </Box>
              </MotionBox>
            )}
          </AnimatePresence>

          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient={`linear(to-t, ${
              cardAccentColorDark || "rgba(0,0,0,0.8)"
            } 0%, rgba(0,0,0,0) 70%)`}
            borderRadius="xl"
            zIndex={4}
          />

          <MotionBox
            position="absolute"
            top={2}
            right={2}
            zIndex={5}
            variants={badgeVariants}
            animate={isHovering ? "hidden" : "visible"}
          >
            <Badge
              bg="rgba(0,0,0,0.75)"
              backdropFilter="blur(4px)"
              px={2}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              borderColor={cardAccentColor}
            >
              <Box as={FaStar} color="yellow.400" fontSize="10px" mr={1} />
              <Text fontSize="11px" color="gray.300">
                {item.vote_average?.toFixed(1) || "N/A"}
              </Text>
            </Badge>
          </MotionBox>

          {(item.release_date || item.first_air_date) && (
            <MotionBox
              position="absolute"
              top={2}
              left={2}
              zIndex={5}
              variants={badgeVariants}
              animate={isHovering ? "hidden" : "visible"}
            >
              <Badge
                bg="rgba(0,0,0,0.75)"
                backdropFilter="blur(4px)"
                px={2}
                py={1}
                borderRadius="full"
                fontSize="10px"
                fontWeight="medium"
                color="gray.300"
                borderWidth="1px"
                borderColor={cardAccentColor}
              >
                {(item.release_date || item.first_air_date).substring(0, 4)}
              </Badge>
            </MotionBox>
          )}

          <AnimatePresence>
            {isHovering && !trailerLoaded && (
              <MotionBox
                position="absolute"
                width="100%"
                height="100%"
                top={0}
                left={0}
                display="flex"
                justifyContent="center"
                alignItems="center"
                bg="rgba(0,0,0,0.3)"
                borderRadius="xl"
                zIndex={5}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut",
                  },
                }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: 0.4,
                    ease: "easeIn",
                  },
                }}
              >
                <MotionBox
                  width="50px"
                  height="50px"
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.2)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  backdropFilter="blur(4px)"
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      ...springConfig,
                      duration: 0.6,
                    },
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { ...springConfig, duration: 0.4 },
                  }}
                >
                  <Box
                    as="span"
                    borderLeft="18px solid white"
                    borderTop="12px solid transparent"
                    borderBottom="12px solid transparent"
                    ml={1}
                  />
                </MotionBox>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        {/* Info Container */}
        <MotionBox
          variants={contentVariants}
          initial="visible"
          animate={
            isHovering && hasTrailer && trailerLoaded ? "hidden" : "visible"
          }
          exit="hidden"
          //   style={{ gridRow: 2 }}
          px={3}
          py={2}
          overflow="hidden"
        >
          <Text
            color="white"
            fontWeight="bold"
            fontSize="sm"
            noOfLines={1}
            mb={1}
          >
            {item.title || item.name}
          </Text>
          <Flex mb={1} flexWrap="wrap" gap={1}>
            {item.details?.genres?.slice(0, 3).map((genre, i, arr) => (
              <Text
                key={i}
                color="gray.400"
                fontSize="2xs"
                py={0.5}
                textTransform="uppercase"
              >
                {genre.name}
                {i < arr.length - 1 && (
                  <Text as="span" mx={2} fontWeight="bold">
                    •
                  </Text>
                )}
              </Text>
            ))}
          </Flex>
        </MotionBox>
      </Box>
    </MotionBox>
  );
};

export default ContentGrid;
