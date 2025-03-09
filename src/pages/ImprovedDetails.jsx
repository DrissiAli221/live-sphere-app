import {
  baseImageOriginal,
  baseImageW500,
  fetchCredits,
  fetchDetails,
} from "@/services/api";
import { convertMinutesToHours, resolveRatingColor } from "@/utils/helper";
import { IoCalendarOutline } from "react-icons/io5";
import { LuClock10 } from "react-icons/lu";
import {
  Box,
  Flex,
  Spinner,
  Container,
  Image,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import MovieCastSection from "@/components/MovieCastSection";

function DetailsPage() {
  const [details, setDetails] = useState({});
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  const { type, id } = useParams();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [detailsData, creditsData] = await Promise.all([
          fetchDetails(type, id),
          fetchCredits(type, id),
        ]);

        setDetails(detailsData);
        setCredits(creditsData);
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

  // Loading state
  if (loading) {
    return (
      <Flex justify={"center"}>
        <Spinner size="xl" color="red.600" />
      </Flex>
    );
  }

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
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Container
          maxW="container.xl"
          py={{ base: 20, md: 10 }}
          display="flex"
          justifyContent="center"
        >
          <Flex
            alignItems="center"
            gap="10"
            flexDirection={{ base: "column", md: "row" }}
            maxW="container.lg"
            mx="auto"
          >
            <Image
              maxHeight={{ base: "350px", md: "450px" }}
              src={`${baseImageW500}/${details?.poster_path}`}
              alt={details?.title || details?.name}
              borderRadius="md"
              boxShadow="xl"
            />

            <Box>
              {/* Movie Title */}
              <Heading fontSize="3xl" fontWeight="bolder" color="white">
                {details?.title || details?.name}
              </Heading>

              {/* Overview */}
              <Text
                fontSize="md"
                my="3"
                maxW={{ base: "xs", sm: "md", xl: "xl" }}
                color="white"
              >
                {details?.overview}
              </Text>

              <Flex alignItems="center" gap="4" mt="2">
                <Text
                  fontSize="1.25rem"
                  fontWeight="extrabold"
                  bg="yellow.500"
                  color="black"
                  borderRadius="5px"
                  px="2"
                >
                  IMDb
                </Text>
              </Flex>

              {/* Rating */}
              <Flex align="baseline" mb="2">
                <Text
                  fontSize="2.8rem"
                  fontWeight="bold"
                  color={resolveRatingColor(details?.vote_average)}
                  mr={1}
                >
                  {details?.vote_average.toFixed(1)}
                </Text>
                <Text fontSize="1.25rem" mt="4px" color="white">
                  /10
                </Text>
                <Flex gap="2" align="center" ml="6">
                  <IoCalendarOutline size="35" color="white" />
                  <Text fontSize="1.25rem" fontWeight="bold" color="white">
                    {type === "tv"
                      ? details?.first_air_date
                        ? `${new Date(
                            details.first_air_date
                          ).getFullYear()} - ${
                            details?.in_production
                              ? "Present"
                              : new Date(
                                  details?.last_air_date
                                ).getFullYear() || ""
                          }`
                        : "N/A"
                      : new Date(details?.release_date).getFullYear() || "N/A"}
                  </Text>

                  {type === "movie" && (
                    <Flex gap={1} align="center" ml="5">
                      <LuClock10 size="35" color="white" />
                      <Text fontSize="1.25rem" fontWeight="bold" color="white">
                        {convertMinutesToHours(details?.runtime)}
                      </Text>
                    </Flex>
                  )}
                </Flex>

                {/* Subscribe Button */}
                <Flex gap="2" mt="5" justifyContent="center" w="30%" mb="auto">
                  <AnimatedSubscribeButton>
                    <span className="group inline-flex items-center">
                      Add To Watchlist
                      <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span className="group inline-flex items-center">
                      <CheckIcon className="mr-2 size-4" />
                      Added to Watchlist
                    </span>
                  </AnimatedSubscribeButton>
                </Flex>
              </Flex>

              {/* Genre */}
              <Flex gap="2" mb="2" flexWrap="wrap">
                {details?.genres.map((genre) => (
                  <Text
                    key={genre.id}
                    border="1px solid #C49A6C"
                    borderRadius="15px"
                    px={2.5}
                    bg="rgba(196, 154, 108, 0.5)"
                    mb={2}
                  >
                    {genre.name}
                  </Text>
                ))}
              </Flex>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Cast section */}
      <Box
        bg="rgba(0, 0, 0, 0.7)"
        position="relative"
        zIndex={1}
        css={{
          backdropFilter: "blur(5px)", 
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <MovieCastSection credits={credits} baseImageW500={baseImageW500} />
      </Box>
    </Box>
  );
}

export default DetailsPage;
