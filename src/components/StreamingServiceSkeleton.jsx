import { Box, Skeleton, Container, Flex, HStack, SimpleGrid } from "@chakra-ui/react"

function StreamingServiceSkeleton() {
  return (
// Loading state with skeleton UI
      <Box position="relative" bgGradient="linear(to-b, gray.900, black)">
        {/* Hero Section Skeleton */}
        <Box position="relative" height="75vh" display="flex" alignItems="center">
          <Container maxW="container.xl" height="100%" position="relative">
            <Flex 
              direction="column" 
              height="100%" 
              color="white" 
              pl={[2, 4, 8]} 
              pr={[2, 4, 8]} 
              pt="10vh" 
              pb={12} 
              mt={-14} 
              position="relative"
            >
              {/* Background Skeleton */}
              <Box 
                position="absolute" 
                top={0} 
                left={0} 
                right={0} 
                bottom={0} 
                bgGradient="linear(to-b, gray.800, black)"
              />
              
              {/* Logo Skeleton */}
              <Box position="absolute" top="32%" left={[2, 4, 8]} maxWidth="60%" zIndex={1}>
                <Box 
                  height="80px" 
                  width="300px" 
                  bg="gray.700" 
                  borderRadius="md" 
                  animation="pulse 1.5s infinite"
                />
              </Box>
              
              {/* Bottom Content Skeleton */}
              <Flex 
                direction="column" 
                position="absolute" 
                bottom={0} 
                left={0} 
                right={[2, 4, 8]} 
                pb={8} 
                maxWidth="600px"
              >
                {/* Genre Skeleton */}
                <HStack spacing={4} mb={3} ml={[2, 4, 8]}>
                  {[1, 2, 3].map((i) => (
                    <Box 
                      key={i} 
                      height="20px" 
                      width="80px" 
                      bg="gray.700" 
                      borderRadius="full"
                      animation="pulse 1.5s infinite"
                    />
                  ))}
                </HStack>
                
                {/* Info Banner Skeleton */}
                <Box mb={4} ml={[2, 4, 8]}>
                  <Flex gap={4}>
                    {[1, 2, 3].map((i) => (
                      <Box 
                        key={i} 
                        height="24px" 
                        width="100px" 
                        bg="gray.700" 
                        borderRadius="md"
                        animation="pulse 1.5s infinite"
                      />
                    ))}
                  </Flex>
                </Box>
                
                {/* Overview Skeleton */}
                <Box height="6.5rem" mb={6} ml={[2, 4, 8]}>
                  {[1, 2, 3, 4].map((i) => (
                    <Box 
                      key={i} 
                      height="16px" 
                      width={`${100 - i * 5}%`} 
                      bg="gray.700" 
                      borderRadius="md" 
                      mb={2}
                      animation="pulse 1.5s infinite"
                    />
                  ))}
                </Box>
                
                {/* Button Skeleton */}
                <HStack spacing={4} ml={[2, 4, 8]}>
                  <Box 
                    height="48px" 
                    width="120px" 
                    bg="gray.700" 
                    borderRadius="md"
                    animation="pulse 1.5s infinite"
                  />
                  <Box 
                    height="48px" 
                    width="120px" 
                    bg="gray.700" 
                    borderRadius="md"
                    animation="pulse 1.5s infinite"
                  />
                </HStack>
              </Flex>
            </Flex>
          </Container>
        </Box>
        
        {/* Category Navigation Skeleton */}
        <Box 
          py={8} 
          position="relative" 
          bg="linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)"
        >
          <Box py={4} position="sticky" top={0} zIndex={10} mb={3}>
            <Container maxW="container.xl">
              <HStack 
                spacing={8} 
                justifyContent="center" 
                overflowX="auto" 
                py={2}
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Box 
                    key={i} 
                    height="24px" 
                    width="100px" 
                    bg="gray.700" 
                    borderRadius="md"
                    animation="pulse 1.5s infinite"
                  />
                ))}
              </HStack>
            </Container>
          </Box>
          
          {/* Featured Shows Skeleton */}
          <Container maxW="container.xl">
            <Flex justify="space-between" align="center" mb={6} pl={[2, 4, 8]} pr={[2, 4, 8]}>
              <Box 
                height="32px" 
                width="300px" 
                bg="gray.700" 
                borderRadius="md"
                animation="pulse 1.5s infinite"
              />
            </Flex>
            
            <Box 
              overflowX="auto" 
              pl={[2, 4, 8]}
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              <Flex gap={6} pb={4}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Box 
                    key={i} 
                    minWidth="280px" 
                    borderRadius="xl" 
                    overflow="hidden" 
                    bg="rgba(23, 25, 35, 0.8)" 
                    boxShadow="xl"
                    height="300px"
                  >
                    <Box position="relative" height="160px" bg="gray.700" animation="pulse 1.5s infinite" />
                    <Box p={4}>
                      <Box 
                        height="24px" 
                        width="80%" 
                        bg="gray.700" 
                        borderRadius="md" 
                        mb={2}
                        animation="pulse 1.5s infinite" 
                      />
                      <Box 
                        height="16px" 
                        width="60%" 
                        bg="gray.700" 
                        borderRadius="md" 
                        mb={2}
                        animation="pulse 1.5s infinite" 
                      />
                      <Box 
                        height="32px" 
                        width="40%" 
                        bg="gray.700" 
                        borderRadius="md" 
                        mt={4}
                        animation="pulse 1.5s infinite" 
                      />
                    </Box>
                  </Box>
                ))}
              </Flex>
            </Box>
          </Container>
        </Box>
        
        {/* TV Show Grid Skeleton */}
        <Box py={8} bg="black">
          <Container maxW="container.xl">
            <Box 
              height="32px" 
              width="300px" 
              bg="gray.700" 
              borderRadius="md" 
              mb={6} 
              ml={[2, 4, 8]}
              animation="pulse 1.5s infinite"
            />
            
            <SimpleGrid columns={[1, 2, 3, 4]} gap={4} spacing={6} px={[4, 6, 8]}>
              {Array(8).fill().map((_, index) => (
                <Box 
                  key={index} 
                  borderRadius="lg" 
                  overflow="hidden" 
                  bg="rgba(23, 25, 35, 0.8)" 
                  height="350px"
                >
                  <Box height="200px" bg="gray.700" animation="pulse 1.5s infinite" />
                  <Box p={4}>
                    <Box 
                      height="24px" 
                      width="80%" 
                      bg="gray.700" 
                      borderRadius="md" 
                      mb={2}
                      animation="pulse 1.5s infinite" 
                    />
                    <Box 
                      height="16px" 
                      width="60%" 
                      bg="gray.700" 
                      borderRadius="md" 
                      mb={2}
                      animation="pulse 1.5s infinite" 
                    />
                    <Box 
                      height="16px" 
                      width="90%" 
                      bg="gray.700" 
                      borderRadius="md" 
                      mb={2}
                      animation="pulse 1.5s infinite" 
                    />
                    <Box 
                      height="32px" 
                      width="40%" 
                      bg="gray.700" 
                      borderRadius="md" 
                      mt={4}
                      animation="pulse 1.5s infinite" 
                    />
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>
      </Box>
 
  )
}

export default StreamingServiceSkeleton
