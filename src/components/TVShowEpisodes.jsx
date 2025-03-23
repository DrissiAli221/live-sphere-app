import { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Flex,
  Image,
  Button,
  Skeleton,
  Badge,
  Icon,
  Separator,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaCalendarAlt,
  FaStar,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  baseImageW500,
  fetchTVDetails,
  fetchTVSeasonDetails,
} from "@/services/api";
import comingSoon from "@/assets/soon2.jpg";
import { truncateText } from "@/utils/helper";

// Create animated Chakra components with framer-motion
const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const TVShowEpisodes = ({
  tvId,
  accentColor = "#FEC34B",
  cardBg = "rgba(18, 18, 18, 0.8)",
}) => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSpecials, setHasSpecials] = useState(false);
  const sliderRef = useRef(null);

  // Fetch TV details including seasons list
  useEffect(() => {
    const getDetails = async () => {
      try {
        const data = await fetchTVDetails(tvId);
        if (data.seasons && data.seasons.length > 0) {
          // Check if there are specials
          const specialsSeason = data.seasons.find(
            (season) => season.season_number === 0
          );
          setHasSpecials(!!specialsSeason);
          setSeasons(data.seasons);
        }
      } catch (error) {
        console.error("Error fetching TV details:", error);
      }
    };

    if (tvId) {
      getDetails();
    }
  }, [tvId]);

  // Fetch episodes when the selected season changes
  useEffect(() => {
    const getSeasonEpisodes = async () => {
      if (!tvId || selectedSeason === undefined) return;

      setLoading(true);
      try {
        const data = await fetchTVSeasonDetails(tvId, selectedSeason);
        setEpisodes(data.episodes || []);
      } catch (error) {
        console.error("Error fetching season episodes:", error);
      } finally {
        setLoading(false);
      }
    };

    getSeasonEpisodes();
  }, [tvId, selectedSeason]);

  // Function to format runtime
  const formatRuntime = (runtime) => {
    if (!runtime) return "N/A";
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Scroll slider functions
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Animation variants for episode cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const episodeVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <Box
      position="relative"
      borderRadius="lg"
      overflow="hidden"
      bgGradient="linear(to-b, rgba(20, 20, 25, 0.7), rgba(10, 10, 15, 0.95))"
      mx="-50vw"
      width="100vw"
      left="50%"
      right="50%"
      marginLeft="-50vw"
      marginRight="-50vw"
      boxSizing="border-box"
      transform="translateX(0)"
    >
      {/* Season Selector */}
      <Box
        borderBottom={`1px solid rgba(255, 255, 255, 0.1)`}
        mb={6}
        pt={4}
        px={4}
        position="relative"
      >
        <Flex
          pb={0} // Changed from pb={2} to make highlight flush with border
          overflowX="auto"
          position="relative"
          zIndex={1}
          maxWidth="1400px"
          mx="auto"
          css={{
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `${accentColor}80`, // Adding transparency
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(30, 30, 35, 0.3)",
              borderRadius: "4px",
            },
          }}
        >
          {hasSpecials && (
            <Flex align="center">
              <Box position="relative" width="100%">
                <Button
                  variant="ghost"
                  color={selectedSeason === 0 ? accentColor : "white"}
                  fontWeight="bold"
                  _hover={{ bg: "transparent", color: accentColor }}
                  onClick={() => setSelectedSeason(0)}
                  px={2}
                  h="auto"
                  pb={2} // Moved padding to button instead of container
                  width="100%"
                >
                  Specials
                </Button>
                {/* Fixed underline for selected season */}
                {selectedSeason === 0 && (
                  <MotionBox
                    position="absolute"
                    bottom={0}
                    left={0}
                    width="100%"
                    height="2px"
                    borderRadius={'full'}
                    bg={accentColor}
                    boxShadow={`0 0 10px ${accentColor}`}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Box>
              <Separator
                orientation="vertical"
                borderColor={"#1E1E2E"}
                w={"2px"}
                mx={3}
                h="30px"
              />
            </Flex>
          )}

          {seasons
            .filter((season) => season.season_number > 0)
            .map((season, index) => (
              <Flex key={season.season_number} align="center">
                {index > 0 && (
                  <Separator
                    orientation="vertical"
                    borderColor={"gray.700"}
                    w={"2px"}
                    mx={3}
                    h="30px"
                  />
                )}
                <Box position="relative" width="100%">
                  <Button
                    variant="ghost"
                    color={
                      selectedSeason === season.season_number
                        ? accentColor
                        : "white"
                    }
                    fontWeight="bold"
                    _hover={{ bg: "transparent", color: accentColor }}
                    onClick={() => setSelectedSeason(season.season_number)}
                    px={2}
                    h="auto"
                    pb={2} // Moved padding to button instead of container
                    width="100%"
                  >
                    {season.name}
                  </Button>
                  {/* Fixed underline for selected season */}
                  {selectedSeason === season.season_number && (
                    <MotionBox
                      position="absolute"
                      bottom={0}
                      left={0}
                      width="100%"
                      height="1.25px"
                      bg={accentColor}
                      borderRadius={"full"}
                      boxShadow={`0 0 10px ${accentColor}`}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      transformOrigin="center"
                    />
                  )}
                </Box>
              </Flex>
            ))}
        </Flex>
      </Box>

      {/* Episodes Section - Added minHeight to maintain consistent height */}
      <Box position="relative" pb={8} minHeight="400px">
        <Box position="relative">
          {/* Slider Container with Left/Right Navigation */}
          <Box position="relative">
            {/* Left Shadow Overlay with gradient */}
            <Box
              position="absolute"
              left={0}
              top={0}
              bottom={0}
              width="120px"
              zIndex={2}
              pointerEvents="none"
              bg="linear-gradient(to right, rgba(10, 10, 15, 0.98) 5%, rgba(10, 10, 15, 0.9) 20%, rgba(10, 10, 15, 0.8) 40%, rgba(10, 10, 15, 0.6) 60%, rgba(10, 10, 15, 0.4) 80%, rgba(10, 10, 15, 0) 100%)"
            />

            {/* Left Arrow */}
            <Button
              position="absolute"
              left={4}
              top="50%"
              transform="translateY(-50%)"
              zIndex={3}
              onClick={scrollLeft}
              size="sm"
              borderRadius="full"
              bg="rgba(0,0,0,0)"
              transition="all 0.3s ease"
            >
              <Icon as={FaChevronLeft} color="white" />
            </Button>

            {/* Slider Container */}
            <Box
              ref={sliderRef}
              overflowX="auto"
              py={6}
              position="relative"
              css={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {/* Use opacity for smoother transitions instead of conditional rendering */}
              <MotionFlex
                gap={6}
                pl={24}
                pr={24}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={selectedSeason} // Important: Re-animate when season changes
                opacity={loading ? 0.5 : 1} // Fade instead of hiding completely
                transition={{ opacity: { duration: 0.3 } }}
              >
                {episodes.map((episode) => (
                  <MotionBox
                    key={episode.id}
                    bg={`linear-gradient(135deg, ${cardBg}, rgba(12, 12, 16, 0.9))`}
                    borderRadius="md"
                    overflow="hidden"
                    width="280px"
                    minWidth="280px"
                    height="320px"
                    transition="all 0.3s ease"
                    display="flex"
                    flexDirection="column"
                    boxShadow="0 4px 12px rgba(0,0,0,0.4)"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 20px rgba(0,0,0,0.2), 0 0 20px rgba(${parseInt(
                        accentColor.slice(1, 3),
                        16
                      )}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(
                        accentColor.slice(5, 7),
                        16
                      )}, 0.29)`,
                    }}
                    variants={episodeVariants}
                  >
                    {/* Episode Thumbnail */}
                    <Box position="relative" height="140px">
                      <Image
                        src={
                          episode.still_path
                            ? `${baseImageW500}${episode.still_path}`
                            : comingSoon
                        }
                        alt={episode.name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                      {/* Improved gradient overlay */}
                      <Box
                        position="absolute"
                        bottom="0"
                        left="0"
                        right="0"
                        height="40px"
                        bgGradient="linear(to-t, rgba(12, 12, 16, 1), rgba(12, 12, 16, 0.7), transparent)"
                      />
                      <Badge
                        position="absolute"
                        top={2}
                        left={2}
                        bg={accentColor}
                        color="black"
                        borderRadius="full"
                        px={1.5}
                        boxShadow="0 2px 4px rgba(0,0,0,0.3)"
                      >
                        {episode.episode_number}
                      </Badge>
                      {episode.vote_average > 0 && (
                        <Badge
                          position="absolute"
                          top={2}
                          right={2}
                          bg="rgba(0,0,0,0.7)"
                          color="white"
                          borderRadius="full"
                          px={2}
                          boxShadow="0 2px 4px rgba(0,0,0,0.3)"
                        >
                          <Flex align="center">
                            <Icon as={FaStar} color={accentColor} mr={1} />
                            {episode.vote_average.toFixed(1)}
                          </Flex>
                        </Badge>
                      )}
                    </Box>

                    {/* Episode Details */}
                    <Box p={3} flex="1" display="flex" flexDirection="column">
                      <Text fontWeight="bold" color="white" noOfLines={1}>
                        {episode.name}
                      </Text>
                      <Flex mt={1} align="center" justify="space-between">
                        <Flex align="center" color="gray.300" fontSize="xs">
                          <Icon as={FaCalendarAlt} mr={1} />
                          <Text>
                            {episode.air_date
                              ? new Date(episode.air_date).toLocaleDateString()
                              : "TBA"}
                          </Text>
                        </Flex>
                        <Flex align="center" color="gray.300" fontSize="xs">
                          <Icon as={FaClock} mr={1} />
                          <Text>{formatRuntime(episode.runtime)}</Text>
                        </Flex>
                      </Flex>

                      <Box flex="1" mt={2} overflow="hidden">
                        <Text
                          color="gray.400"
                          fontSize="sm"
                          noOfLines={3}
                          lineHeight="1.4"
                        >
                          {truncateText(episode.overview, 110) ||
                            "No overview available for this episode."}
                        </Text>
                      </Box>

                      <Button
                        leftIcon={<FaPlay />}
                        size="sm"
                        mt="3"
                        bg={accentColor}
                        color="black"
                        _hover={{
                          opacity: 0.9,
                          boxShadow: `0 0 15px ${accentColor}80`,
                        }}
                        _active={{
                          bg: `${accentColor}e0`,
                        }}
                        borderRadius="full"
                        width="full"
                        transition="all 0.2s ease"
                      >
                        Play
                      </Button>
                    </Box>
                  </MotionBox>
                ))}
                <Box minWidth="70px" />
                {/* Additional padding element at the end */}
              </MotionFlex>
            </Box>

            {/* Right Shadow Overlay with gradient */}
            <Box
              position="absolute"
              right={0}
              top={0}
              bottom={0}
              width="120px"
              zIndex={2}
              pointerEvents="none"
              bg="linear-gradient(to left, rgba(10, 10, 15, 0.98) 5%, rgba(10, 10, 15, 0.9) 20%, rgba(10, 10, 15, 0.8) 40%, rgba(10, 10, 15, 0.6) 60%, rgba(10, 10, 15, 0.4) 80%, rgba(10, 10, 15, 0) 100%)"
            />

            {/* Right Arrow */}
            <Button
              position="absolute"
              right={4}
              top="50%"
              transform="translateY(-50%)"
              zIndex={3}
              onClick={scrollRight}
              size="sm"
              borderRadius="full"
              bg="rgba(0,0,0,0.2)"
              _hover={{ bg: "rgba(0,0,0,0.7)" }}
              transition="all 0.3s ease"
            >
              <Icon as={FaChevronRight} color="white" />
            </Button>

            {/* Bottom gradient fade */}
            <Box
              position="absolute"
              bottom={-10}
              left={0}
              right={0}
              height="60px"
              bgGradient="linear(to-t, transparent, rgba(8, 8, 12, 0.8))"
              zIndex={1}
              pointerEvents="none"
            />
          </Box>

          {episodes.length === 0 && !loading && (
            <MotionBox
              mt={4}
              p={4}
              borderRadius="md"
              bg="rgba(16, 16, 22, 0.6)"
              boxShadow="0 4px 8px rgba(0,0,0,0.2)"
              maxWidth="1400px"
              mx="auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Text color="white" textAlign="center">
                No episodes available for this season.
              </Text>
            </MotionBox>
          )}
        </Box>

        {/* Only show the skeleton on initial load, not during season changes */}
        {loading && episodes.length === 0 && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            justify="center"
            align="center"
            my={8}
            px={4}
            maxWidth="1400px"
            mx="auto"
          >
            <Skeleton
              height="320px"
              width="100%"
              startColor="rgba(25, 25, 30, 0.5)"
              endColor="rgba(40, 40, 45, 0.3)"
              borderRadius="md"
            />
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default TVShowEpisodes;
