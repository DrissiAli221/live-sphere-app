import React, { useEffect, useState } from "react";
import { Box, Image, Text, Flex, Badge } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { baseImageW500, fetchTrailers } from "@/services/api";

// Create a motion component with Chakra UI's Box
const MotionBox = motion.create(Box);

const ContentGrid = ({ item, index, contentType, baseImageOriginal }) => {
    const [trailerData, setTrailerData] = useState(null);

  // Use a fixed modern color palette instead of color extraction
  const accentColor = "";

  // Pick a color based on item.id to ensure consistency
  const cardAccentColor = accentColor;
  const cardAccentColorDark = accentColor;

  useEffect(() => {
    const fetchData = async () => {
    try {
        const trailerData = await fetchTrailers(contentType, item.id);
        setTrailerData(trailerData);
    }catch(error){
        console.error(error);
    }finally{
        
    }}
    fetchData();
  },[item.id, contentType]);

  console.log(trailerData);

  // Ensure we have a valid poster path
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
    : "";

  return (
    <MotionBox
      as={Link}
      to={`/${contentType === "movie" ? "movie" : "tv"}/${item.id}`}
      key={item.id}
      borderRadius="2xl"
      overflow="hidden"
      bg="rgba(17, 25, 40, 0.75)"
      height="100%"
      maxHeight="400px"
      boxShadow="lg"
      position="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Box p={1.5} height="100%" display="flex" flexDirection="column">
        {/* Poster Container with double rounded effect */}
        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          flex="1"
          mb={2}
        >
          <Image
            src={posterUrl}
            alt={item.title || item.name}
            height="100%"
            width="100%"
            objectFit="cover"
            borderRadius="xl"
            fallbackSrc="https://via.placeholder.com/300x450?text=No+Image"
          />

          {/* Subtle gradient overlay */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient={`linear(to-t, ${cardAccentColorDark} 0%, rgba(0,0,0,0) 70%)`}
            borderRadius="xl"
          />

          {/* Rating badge */}
          <Badge
            position="absolute"
            top={2}
            right={2}
            bg="rgba(0,0,0,0.75)"
            backdropFilter="blur(4px)"
            px={2}
            py={1}
            borderRadius="full"
            alignItems="center"
            borderColor={cardAccentColor}
          >
            <Box as={FaStar} color="yellow.400" fontSize="10px" />
            <Text fontSize="11px" color="gray.300" >
              {item.vote_average?.toFixed(1) || "N/A"}
            </Text>
          </Badge>

          {/* Year badge */}
          {(item.release_date || item.first_air_date) && (
            <Badge
              position="absolute"
              top={2}
              left={2}
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
          )}
        </Box>

        {/* Content info - limited to small height */}
        <Box maxHeight="100px" overflow="hidden" px={3} py={1}>
          {/* Title with truncation */}
          <Text
            color="white"
            fontWeight="bold"
            fontSize="sm"
            noOfLines={1}
            mb={1}
          >
            {item.title || item.name}
          </Text>

          {/* Mini genre tags in a flow layout */}
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
        </Box>
      </Box>
    </MotionBox>
  );
};

export default ContentGrid;
