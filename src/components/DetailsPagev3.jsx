import {
  baseImageOriginal,
  baseImageW500,
  fetchCredits,
  fetchDetails,
  fetchMovieImages,
  fetchRecommendations,
  fetchTrailers,
} from "@/services/api";

import {
  FaPlayCircle,
  FaImdb,
  FaStar,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import { MdOutlineBookmarkAdd, MdShare, MdLocalMovies } from "react-icons/md";

import { convertMinutesToHours, resolveRatingColor } from "@/utils/helper";

import {
  Box,
  Flex,
  Spinner,
  Container,
  Image,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import MovieCastSection from "@/components/MovieCastSection";

function DetailsPage() {
  const [details, setDetails] = useState({});
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState({});
  const { type, id } = useParams();

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

  console.log(details);

  console.log(credits);

  console.log(images);

  // Loading state

  if (loading) {
    return (
      <Flex justify={"center"}>
        <Spinner size="xl" color="red.600" />
      </Flex>
    );
  }

  const getEnglishLogo = (logos) => {
    if (!logos || logos.length === 0) return null;

    const englishLogo = logos.find((logo) => logo.iso_639_1 === "en");

    return englishLogo || logos[0]; // Return English logo if found, otherwise the first logo
  };

  return (
    <Box position="relative">
      {/* Full-screen background that goes behind navbar */}

      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        background={`linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,.3)) , url(${baseImageOriginal}/${details?.backdrop_path})`}
        backgroundSize="cover"
        backgroundPosition="center"
        zIndex={-1}
        _after={{
          content: '""',

          position: "absolute",

          top: 0,

          left: 0,

          right: 0,

          bottom: 0,

          background: "linear-gradient(rgba(0,0,0,0.2) 70%, rgba(0,0,0,1))",
        }}
      />

      {/* Main content container - full height viewport */}

      <Box minHeight="100vh" display="flex" flexDirection="column" p={14}>
        <Image
          src={`${baseImageW500}/${getEnglishLogo(images?.logos)?.file_path}`}
          alt={details?.title || details?.name}
          width="300px"
          height="auto"
        />

        <Flex gap="3" mb="2" flexWrap="wrap" mt={6}>
          {details?.genres.map((genre) => (
            <Text key={genre.id} px={2.5} mb={2}>
              {genre.name}
            </Text>
          ))}
        </Flex>

        <Flex alignItems="center" gap={4}>
          <Box
            as="button"
            bg="#FEC34B"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight={"extrabold"}
            mt={4}
            py={2}
            px={4}
            gap={2}
            color={"black"}
            borderRadius="20px"
            _hover={{ bg: "yellow.500" }}
            cursor={"pointer"}
          >
            <FaPlayCircle size={"22px"} /> PLAY NOW
          </Box>

          <Box
            as="button"
            bg="rgba(0, 0, 0, 0.3)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight={"extrabold"}
            mt={4}
            py={2}
            px={4}
            gap={2}
            color={"white"}
            borderRadius="20px"
            _hover={{ bg: "rgba(0,0,0,0.4)" }}
            cursor={"pointer"}
          >
            <MdOutlineBookmarkAdd size={"22px"} /> ADD TO WATCHLIST
          </Box>
        </Flex>

        <Flex mt={7} gap={10}>
          <Box>
            <Heading as="h2" size="lg" color="white">
              Description
            </Heading>

            <Text color="white" mt={2} width={["150px", "300px", "500px"]}>
              {details?.overview}
            </Text>

            <Flex mt={10} alignItems="center">
              <Box
                width={"75px"}
                height={"75px"}
                borderRadius={"50%"}
                overflow={"hidden"}
                my={2}
                mt={10}
                border={"2px solid white"}
              >
                <Image
                  src={`${baseImageOriginal}${credits.crew[1].profile_path}`}
                  alt={credits.crew[0].name}
                  width={"100%"}
                  height={"100%"}
                  objectFit={"cover"}
                />
              </Box>

              <Box ml={4} textAlign={"left"} mt={7}>
                <Text color="white" fontSize={"md"}>
                  {credits.crew[1].name}
                </Text>

                <Text color="gray.400" fontWeight={"light"} fontSize={"sm"}>
                  {credits.crew[1].job}
                </Text>
              </Box>
            </Flex>
          </Box>

          <Box>
            <Heading as="h2" size="lg" color="white" mb={4}>
              TOP CAST
            </Heading>

            <VStack align={"start"}>
              {credits?.cast &&
                credits.cast.slice(0, 4).map((cast) => (
                  <Flex key={cast.id} alignItems="center">
                    <Box
                      key={cast.id}
                      width={"75px"}
                      height={"75px"}
                      borderRadius={"50%"}
                      overflow={"hidden"}
                      my={2}
                      border={"2px solid white"}
                    >
                      <Image
                        src={`${baseImageOriginal}${cast.profile_path}`}
                        alt={cast.name}
                        width={"100%"}
                        height={"100%"}
                        objectFit={"cover"}
                      />
                    </Box>

                    <Box ml={4}>
                      <Text color="white" fontSize={"md"}>
                        {cast.name}
                      </Text>

                      <Text
                        color="gray.400"
                        fontWeight={"light"}
                        fontSize={"sm"}
                      >
                        as {cast.character}
                      </Text>
                    </Box>
                  </Flex>
                ))}
            </VStack>
          </Box>
        </Flex>
      </Box>

      {/* Cast section */}

      {/* <Box
    
    bg="rgba(0, 0, 0, 0.7)"
    
    position="relative"
    
    zIndex={1}
    
    css={{
    
    backdropFilter: "blur(5px)",
    
    WebkitBackdropFilter: "blur(10px)",
    
    }}
    
    ></Box> */}
    </Box>
  );
}

export default DetailsPage;
