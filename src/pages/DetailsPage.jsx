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

  //   useEffect(() => {
  // Fetch details
  //     fetchDetails(type, id)
  //       .then((res) => setDetails(res))
  //       .catch((err) => console.log(err))
  //       .finally(() => setLoading(false));
  //   }, [type, id]);

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
    <Box>
      <Box
        background={`linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,.7)) , url(${baseImageOriginal}/${details?.backdrop_path})`}
        backgroundSize={"cover"}
        backgroundPosition={"center"}
        backgroundRepeat={"no-repeat"}
        top={0}
        zIndex={-1}
        w={"100%"}
        h={{ base: "auto", md: "650px" }}
        py={"2"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {/* Background container */}
        <Container maxW={"container.xl"}>
          {" "}
          {/* Container for the details */}
          <Flex
            alignItems={"center"}
            gap={"10"}
            flexDirection={{ base: "column", md: "row" }}
          >
            <Image
              height={"450px"}
              src={`${baseImageW500}/${details?.poster_path}`}
              alt={details?.title || details?.name}
            />

            <Box>
              {/* Movie Title */}
              <Heading fontSize="3xl" fontWeight="bolder">
                {details?.title || details?.name}{" "}
                {/* Movie - TV shows (conditional) Release Date */}
                {/* <Text as="span" fontWeight="normal" fontSize="1.25rem" ml={2}>
                  {type === "tv"
                    ? details?.first_air_date
                      ? `${new Date(details.first_air_date).getFullYear()} - ${
                          details?.in_production
                            ? "Present"
                            : new Date(details?.last_air_date).getFullYear() ||
                              ""
                        }`
                      : "N/A"
                    : new Date(details?.release_date).getFullYear() || "N/A"}
                </Text> */}
              </Heading>

              {/* Overview */}

              <Text
                fontSize={"md"}
                my={"3"}
                maxW={{ base: "xs", sm: "md", xl: "xl" }}
              >
                {details?.overview}
              </Text>

              <Flex alignItems={"center"} gap={"4"} mt={"2"}>
                <Text
                  fontSize={"1.25rem"}
                  fontWeight={"extrabold"}
                  bg={"yellow.500"}
                  color={"black"}
                  borderRadius={"5px"}
                  px={"2"}
                >
                  IMDb
                </Text>
              </Flex>

              {/* Rating */}
              <Flex align={"baseline"} mb={"2"}>
                <Text
                  fontSize="2.8rem"
                  fontWeight="bold"
                  color={resolveRatingColor(details?.vote_average)}
                  mr={1}
                >
                  {details?.vote_average.toFixed(1)}
                </Text>
                <Text fontSize="1.25rem" mt="4px">
                  /10
                </Text>
                <Flex gap={"2"} align={"center"} ml={"6"}>
                  <IoCalendarOutline size={"35"} />
                  <Text fontSize={"1.25rem"} fontWeight={"bold"}>
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
                    <Flex gap={1} align={"center"} ml={"5"}>
                      <LuClock10 size={"35"} />
                      <Text fontSize={"1.25rem"} fontWeight={"bold"}>
                        {convertMinutesToHours(details?.runtime)}
                      </Text>
                    </Flex>
                  )}

                  {/* <button
                    className="flex items-center ml space-x-1 border border-white cursor-pointer text-green-500 gap-1.5 px-4 py-2 rounded-lg hover:bg-green-100"
                    onClick={() => console.log("Added to WatchList")}
                  >
                    <FaCheckCircle size={20} />
                    <span>In WatchList</span>
                  </button>
                  <Button
                    ml={"5"}
                    variant={"outline"}
                    onClick={() => console.log("Add to WatchList")}
                  >
                    Add to WatchList
                  </Button> */}
                </Flex>

                {/* Subscribe Button */}

                <Flex gap="2" mt="5" justifyContent="center" w="30%" mb="auto">
                  <AnimatedSubscribeButton>
                    <span className="inline-flex items-center group">
                      Add To Watchlist
                      <ChevronRightIcon className="ml-1 transition-transform duration-300 size-4 group-hover:translate-x-1" />
                    </span>
                    <span className="inline-flex items-center group">
                      <CheckIcon className="mr-2 size-4" />
                      Added to Watchlist
                    </span>
                  </AnimatedSubscribeButton>
                </Flex>
              </Flex>

              {/* Genre */}
              <Flex gap={"2"} mb={"2"}>
                {details?.genres.map((genre) => (
                  <Text
                    key={genre.id}
                    border={"1px solid #C49A6C"}
                    borderRadius={"15px"}
                    px={2.5}
                    bg={"rgba(196, 154, 108, 0.5)"}
                  >
                    {genre.name}
                  </Text>
                ))}
              </Flex>
            </Box>
          </Flex>
        </Container>
      </Box>
      <MovieCastSection credits={credits} baseImageW500={baseImageW500} />
    </Box>
  );
}

export default DetailsPage;
