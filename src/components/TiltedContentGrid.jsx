import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  Container,
  Heading,
  Button,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTrendingMovies, baseImageW500 } from "@/services/api";

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);

const ContentTile = ({ item, index, isExpanded, setExpandedId }) => {
  const isItemExpanded = isExpanded === item.id;
  const zIndex = isItemExpanded ? 50 : index % 2 === 0 ? 10 : 5;
  const delay = index * 0.04; // Stagger animation

  return (
    <MotionBox
      position="relative"
      zIndex={zIndex}
      transformOrigin="center"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay,
          duration: 0.5,
          ease: "easeOut",
        },
      }}
      whileHover={{ scale: 1.05, zIndex: 30 }}
    >
      <MotionBox
        width={{ base: "150px", md: "180px" }}
        height={{ base: "220px", md: "260px" }}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        position="relative"
        cursor="pointer"
        onClick={() => setExpandedId(isItemExpanded ? null : item.id)}
        style={{
          rotate: isItemExpanded ? 0 : `${item.rotation}deg`,
          transition: "all 0.3s ease-out",
        }}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 60%)",
          zIndex: 1,
          opacity: isItemExpanded ? 1 : 0.6,
          transition: "opacity 0.3s ease",
        }}
        _hover={{
          _before: {
            opacity: 1,
          },
        }}
      >
        <Image
          src={`${baseImageW500}${item.poster_path}`}
          alt={item.title}
          width="100%"
          height="100%"
          objectFit="cover"
          transition="transform 0.5s ease"
          _hover={{ transform: "scale(1.1)" }}
        />

        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          padding="3"
          zIndex="2"
        >
          <Text
            fontWeight="bold"
            fontSize={{ base: "sm", md: "md" }}
            color="white"
            noOfLines={1}
          >
            {item.title}
          </Text>
          <Text fontSize={{ base: "xs", md: "sm" }} color="whiteAlpha.800">
            {item.category}
          </Text>
        </Box>

        <AnimatePresence>
          {isItemExpanded && (
            <MotionBox
              position="absolute"
              top="0"
              left="0"
              right="0"
              height="full"
              background="rgba(0,0,0,0.85)"
              zIndex="3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              padding="4"
            >
              <Text
                fontWeight="bold"
                fontSize="lg"
                color="white"
                textAlign="center"
                mb="2"
              >
                {item.title}
              </Text>
              <Button size="sm" colorScheme="red" mb="2">
                Watch Now
              </Button>
              <Button size="sm" variant="outline" colorScheme="whiteAlpha">
                + Add to List
              </Button>
            </MotionBox>
          )}
        </AnimatePresence>
      </MotionBox>
    </MotionBox>
  );
};

const TiltedContentGrid = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await fetchTrendingMovies();
        // Add rotation and category to each movie
        const moviesWithRotation = data.map((movie, index) => ({
          ...movie,
          rotation: (index % 2 === 0 ? -1 : 1) * (Math.random() * 8 + 2),
          category: "Movies",
        }));
        setMovies(moviesWithRotation);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredContent =
    filter === "All"
      ? movies
      : movies.filter((item) => item.category === filter);

  const categories = ["All", "Movies"];

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        bgGradient="linear(to-b, gray.900, black)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="white">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      bgGradient="linear(to-b, gray.900, black)"
      pt="16"
      pb="24"
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="0"
        opacity="0.4"
        background="radial-gradient(circle at 20% 50%, rgba(76, 0, 255, 0.15) 0%, transparent 25%), 
                   radial-gradient(circle at 80% 30%, rgba(255, 0, 128, 0.15) 0%, transparent 25%)"
      />

      <Container maxWidth="1400px" position="relative" zIndex="1">
        <Heading
          as="h1"
          fontSize={{ base: "3xl", md: "4xl" }}
          textAlign="center"
          mb="6"
          bgGradient="linear(to-r, red.500, purple.500)"
          bgClip="text"
        >
          Discover Amazing Content
        </Heading>

        {/* Category Filter */}
        <Flex justify="center" mb="10" wrap="wrap" gap="2">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setFilter(category)}
              variant={filter === category ? "solid" : "outline"}
              colorScheme={filter === category ? "red" : "gray"}
              size="sm"
              borderRadius="full"
              m="1"
            >
              {category}
            </Button>
          ))}
        </Flex>

        {/* Content Grid */}
        <MotionFlex
          wrap="wrap"
          justify="center"
          gap={{ base: "4", md: "6" }}
          py="8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setExpandedId(null);
            }
          }}
        >
          {filteredContent.map((item, index) => (
            <ContentTile
              key={item.id}
              item={item}
              index={index}
              isExpanded={expandedId}
              setExpandedId={setExpandedId}
            />
          ))}
        </MotionFlex>

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <Box textAlign="center" mt="12" px="4">
            <Text fontSize="xl" fontWeight="medium">
              No content found for this category
            </Text>
            <Button mt="4" colorScheme="red" onClick={() => setFilter("All")}>
              Show All Content
            </Button>
          </Box>
        )}
      </Container>

      {/* Marquee Gradient at the bottom */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="12"
        bgGradient="linear(to-t, black, transparent)"
        zIndex="5"
      />
    </Box>
  );
};

export default TiltedContentGrid;
