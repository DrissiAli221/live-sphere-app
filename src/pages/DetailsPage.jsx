import { baseImageOriginal, baseImageW500, fetchDetails } from "@/services/api";
import {
  Box,
  Flex,
  Spinner,
  Container,
  Image,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function DetailsPage() {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const { type, id } = useParams();

  useEffect(() => {
    fetchDetails(type, id)
      .then((res) => setDetails(res))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [type, id]);

  console.log(details);

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
              <Heading fontSize="3xl">
                {details?.title || details?.name}{" "}
                {/* Movie - TV shows (conditional) Release Date */}
                <Text as="span" fontWeight="normal" fontSize="1.25rem" ml={2}>
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
                </Text>
              </Heading>

              <Flex alignItems={"center"} gap={"4"} mt={"2"} mb={"5"}>
                <Text
                  fontSize={"1.25rem"}
                  bg={"yellow.500"}
                  color={"black"}
                  borderRadius={"5px"}
                  px={"2"}
                  py={"1"}
                >
                  IMDb {details?.vote_average?.toFixed(1)}
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default DetailsPage;
