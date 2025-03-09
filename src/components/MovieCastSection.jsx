import React, { useRef } from "react";
import {
  Container,
  Heading,
  Flex,
  Box,
  Text,
  Image,
  IconButton,
  useBreakpointValue,
  HStack,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import MaleImage from '@/assets/MalePlaceholder.jpg'
import FemaleImage from '@/assets/FemalePlaceholder.jpg'

const MovieCastSection = ({ credits, baseImageW500 }) => {
  const scrollRef = useRef(null);
  const scrollAmount = 600;

  // Responsive card width
  const cardWidth = useBreakpointValue({
    base: "150px",
    md: "180px",
    lg: "200px",
  });
  const cardHeight = useBreakpointValue({
    base: "225px",
    md: "270px",
    lg: "300px",
  });

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      if (direction === "left") {
        scrollRef.current.scrollLeft -= scrollAmount;
      } else {
        scrollRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      handleScroll("left");
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      handleScroll("right");
      e.preventDefault();
    }
  };

  // No cast members check
  if (!credits?.cast?.length) return null;

  return (
    <Container maxW={"container.xl"} pb={"10"}>
      <HStack justify="space-between" align="center" mb={"5"}>
        <Heading as={"h2"} size={"xl"} mt={"10"}>
          Cast
        </Heading>

        {/* Navigation buttons */}
        <HStack spacing={2}>
          <IconButton
            icon={<FiChevronLeft size={20} />}
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            variant="ghost"
            size="lg"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          />
          <IconButton
            icon={<FiChevronRight size={20} />}
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            variant="ghost"
            size="lg"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          />
        </HStack>
      </HStack>

      {/* Scrollable container with custom styling */}
      <Box position="relative">
        <Flex
          ref={scrollRef}
          overflowX={"auto"}
          overflowY={"hidden"}
          gap={"5"}
          pb={"5"}
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {credits.cast.slice(0, 20).map((actor) => (
            <Box
              key={actor.id}
              minW={cardWidth}
              maxW={cardWidth}
              transition="all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)"
              _hover={{
                transform: "translateY(-5px)",
              }}
              role="group"
            >
              <Box
                position="relative"
                overflow="hidden"
                h={cardHeight}
                bgColor="gray.800"
                boxShadow="md"
                borderRadius="xl"
              >
                {actor.profile_path ? (
                  <Box overflow="hidden" h="100%" w="100%">
                    <Image
                      src={`${baseImageW500}/${actor.profile_path}`}
                      alt={actor.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform 0.3s ease"
                      _groupHover={{
                        transform: "scale(1.05)",
                      }}
                    />
                  </Box>
                ) : (
                  <Flex
                    w="100%"
                    h="100%"
                    align="center"
                    justify="center"
                    bg="gray.700"
                    color="gray.400"
                    fontSize="sm"
                    flexDirection="column"
                  >
                    <Image 
                    src={actor.gender === 1 ? FemaleImage : MaleImage}
                    height={"100%"}
                    width={"100%"}
                    objectFit={"cover"}
                    />
                
                  </Flex>
                )}

                {/* Info overlay with improved styling */}
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  bg="rgba(0, 0, 0, 0.8)"
                  borderBottomRadius="md"
                  p="3"
                >
                  <Text
                    fontSize={"md"}
                    fontWeight="bold"
                    color={"white"}
                    noOfLines={1}
                  >
                    {actor.name}
                  </Text>
                  <Text
                    fontSize={"sm"}
                    color={"whiteAlpha.800"}
                    mt="1"
                    fontStyle="italic"
                    noOfLines={1}
                  >
                    {actor.character || "Unknown Role"}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
    </Container>
  );
};

export default MovieCastSection;
