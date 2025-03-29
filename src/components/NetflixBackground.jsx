import React, { useState, useEffect } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  fetchTrendingMovies,
  fetchTrendingTVShows,
  fetchDiscoverMovies,
  fetchTopRated,
  baseImageW500,
} from "@/services/api";

// Enhanced Netflix Background Component with darker styling
const NetflixBackground = () => {
  // State for content rows from TMDB API
  const [contentRows, setContentRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define a proper fallback image path
  const fallbackImageUrl = "https://via.placeholder.com/220x130";

  // Fetch data from TMDB API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [trendingMovies, trendingTVShows, discoverMovies, topRated] =
          await Promise.all([
            fetchTrendingMovies(),
            fetchTrendingTVShows(),
            fetchDiscoverMovies(),
            fetchTopRated("tv"),
          ]);

        // Format the data with more varied widths and image types
        const formattedRows = [
          {
            items: trendingMovies
              .map((movie, index) => ({
                id: movie.id,
                title: movie.title,
                // Mix poster and backdrop images
                imageType: index % 3 === 0 ? "poster" : "backdrop",
                image:
                  index % 3 === 0 && movie.poster_path
                    ? `${baseImageW500}${movie.poster_path}`
                    : movie.backdrop_path
                    ? `${baseImageW500}${movie.backdrop_path}`
                    : fallbackImageUrl,
              }))
              .filter((movie) => movie.image)
              .slice(0, 12),
          },
          {
            items: trendingTVShows
              .map((show, index) => ({
                id: show.id,
                title: show.name,
                imageType: index % 4 === 0 ? "poster" : "backdrop",
                image:
                  index % 4 === 0 && show.poster_path
                    ? `${baseImageW500}${show.poster_path}`
                    : show.backdrop_path
                    ? `${baseImageW500}${show.backdrop_path}`
                    : fallbackImageUrl,
              }))
              .filter((show) => show.image)
              .slice(0, 12),
          },
          {
            items: discoverMovies
              .map((movie, index) => ({
                id: movie.id,
                title: movie.title,
                imageType: index % 2 === 0 ? "poster" : "backdrop",
                image:
                  index % 2 === 0 && movie.poster_path
                    ? `${baseImageW500}${movie.poster_path}`
                    : movie.backdrop_path
                    ? `${baseImageW500}${movie.backdrop_path}`
                    : fallbackImageUrl,
              }))
              .filter((movie) => movie.image)
              .slice(0, 12),
          },
          {
            items: topRated
              .map((item, index) => ({
                id: item.id,
                title: item.title || item.name,
                imageType: index % 3 === 0 ? "poster" : "backdrop",
                image:
                  index % 4 === 0 && item.poster_path
                    ? `${baseImageW500}${item.poster_path}`
                    : item.backdrop_path
                    ? `${baseImageW500}${item.backdrop_path}`
                    : fallbackImageUrl,
              }))
              .filter((item) => item.image)
              .slice(0, 12),
          },
          // Add an extra row to ensure full coverage
          {
            items: [...trendingMovies, ...discoverMovies]
              .map((movie, index) => ({
                id: movie.id,
                title: movie.title,
                imageType: index % 3 === 0 ? "poster" : "backdrop",
                image:
                  index % 5 === 0 && movie.poster_path
                    ? `${baseImageW500}${movie.poster_path}`
                    : movie.backdrop_path
                    ? `${baseImageW500}${movie.backdrop_path}`
                    : fallbackImageUrl,
              }))
              .filter((movie) => movie.image)
              .slice(0, 12),
          },
        ];

        // Ensure we have content in each row, otherwise use fallback
        const validRows = formattedRows.filter((row) => row.items.length > 0);
        if (validRows.length < 3) {
          throw new Error("Not enough valid content");
        }

        setContentRows(validRows);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        // Fallback content with varied widths
        setContentRows([
          {
            items: Array.from({ length: 10 }, (_, i) => ({
              id: i + 1,
              title: `Movie ${i + 1}`,
              imageType: i % 3 === 0 ? "poster" : "backdrop",
              image: fallbackImageUrl,
            })),
          },
          {
            items: Array.from({ length: 10 }, (_, i) => ({
              id: i + 8,
              title: `Show ${i + 1}`,
              imageType: i % 4 === 0 ? "poster" : "backdrop",
              image: fallbackImageUrl,
            })),
          },
        ]);
      }
    };

    fetchData();
  }, []);

  // Content row component with proper 10deg tilt for entire row
  const ContentRow = ({ rowData, rowIndex }) => {
    // Alternate row direction and speed
    const direction = rowIndex % 2 === 0 ? 1 : -1;
    const speed = 180 + rowIndex * 20;

    // Standard fixed height for all rows
    const standardRowHeight = 220; // Standardized row height

    return (
      <Box
        mb="12px"
        overflow="hidden"
        position="relative"
        zIndex={10 - rowIndex}
        className="content-row"
        transform="rotate(11deg)"
        height="100%"
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          initial={{ x: direction * -300 }}
          animate={{
            x: direction * 300,
            transition: {
              repeat: Infinity,
              duration: speed,
              ease: "linear",
            },
          }}
        >
          <Flex>
            {/* Triple items to create denser continuous loop */}
            {[...rowData.items, ...rowData.items, ...rowData.items].map(
              (item, index) => {
                // Standardized height for all items
                const standardItemHeight = "200px";

                return (
                  <Box
                    key={`${item.id}-${index}`}
                    minW={`${item.imageType === "poster" ? "130px" : "300px"}`}
                    h={standardItemHeight}
                    mx="6px"
                    overflow="hidden"
                    position="relative"
                    transition="all 0.3s ease"
                    boxShadow="0 4px 20px -5px rgba(0,0,0,0.5)"
                    opacity="0.3" // Reduced opacity for all items
                  >
                    <Box
                      width="100%"
                      height="100%"
                      position="relative"
                      overflow="hidden"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        objectFit={
                          item.imageType === "poster" ? "contain" : "cover"
                        }
                        height={"100%"}
                        filter="brightness(0.6)" // Darkened images
                        onError={(e) => {
                          console.error(`Error loading image: ${item.image}`);
                          e.target.src = fallbackImageUrl;
                        }}
                      />
                    </Box>
                  </Box>
                );
              }
            )}
          </Flex>
        </motion.div>
      </Box>
    );
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      zIndex={-1}
      bg="rgba(0, 0, 0, 0.85)" // Dark overlay background
    >
      {/* Content rows - filling the entire screen with proper spacing and 10deg tilt */}
      <Box
        position="absolute"
        top="-6%"
        left="-8%"
        right="-8%"
        bottom="-8%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        overflow="hidden"
        style={{
          padding: "29px",
        }}
      >
        {contentRows.map((rowData, index) => (
          <ContentRow key={index} rowData={rowData} rowIndex={index} />
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(NetflixBackground);
