import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMovieImages, baseImageW500 } from "@/services/api";

// Enhanced Netflix Background Component with performance optimizations and fixed animations
const NetflixBackground = () => {
  // State for content rows from TMDB API
  const [contentRows, setContentRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [visibleRows, setVisibleRows] = useState({});

  // Define a proper fallback image path - using a data URI instead of placeholder.com
  const fallbackImageUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='130' viewBox='0 0 220 130'%3E%3Crect width='220' height='130' fill='%23333'/%3E%3Ctext x='110' y='65' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Memoize the TMDB IDs to prevent recreation on each render
  const tmdbItemsByRow = useMemo(
    () => [
      // Row 1 - 15 items
      [
        { id: 2316, type: "tv" }, // The Office
        { id: 181812, type: "movie" }, // Star Wars: The Rise of Skywalker
        { id: 2710, type: "tv" }, // Supernatural
        { id: 157336, type: "movie" }, // Interstellar
        { id: 1668, type: "tv" }, // Friends
        { id: 339988, type: "movie" }, // The Hunger Games: Catching Fire
        { id: 4194, type: "tv" }, // Star Wars: The Clone Wars
        { id: 512200, type: "movie" }, // Jumanji: The Next Level
        { id: 4607, type: "tv" }, // Lost
        { id: 475557, type: "movie" }, // Joker
        { id: 60625, type: "tv" }, // Rick and Morty
        { id: 419704, type: "movie" }, // Ad Astra
        { id: 1421, type: "tv" }, // Modern Family
        { id: 27205, type: "movie" }, // Inception
        { id: 2190, type: "tv" }, // South Park
      ],
      // Row 2 - 15 items
      [
        { id: 1396, type: "tv" }, // Breaking Bad
        { id: 299534, type: "movie" }, // Avengers: Endgame
        { id: 1402, type: "tv" }, // The Walking Dead
        { id: 299536, type: "movie" }, // Avengers: Infinity War
        { id: 60735, type: "tv" }, // The Flash
        { id: 497698, type: "movie" }, // Black Widow
        { id: 1399, type: "tv" }, // Game of Thrones
        { id: 1726, type: "movie" }, // Iron Man
        { id: 46952, type: "tv" }, // The Blacklist
        { id: 24428, type: "movie" }, // The Avengers
        { id: 1412, type: "tv" }, // Arrow
        { id: 299537, type: "movie" }, // Captain Marvel
        { id: 66732, type: "tv" }, // Stranger Things
        { id: 284053, type: "movie" }, // Thor: Ragnarok
        { id: 1416, type: "tv" }, // Grey's Anatomy
      ],
      // Row 3 - 15 items
      [
        { id: 1418, type: "tv" }, // The Big Bang Theory
        { id: 274870, type: "movie" }, // Passengers
        { id: 15260, type: "tv" }, // Adventure Time
        { id: 335983, type: "movie" }, // Venom
        { id: 37854, type: "tv" }, // One Punch Man
        { id: 447365, type: "movie" }, // Guardians of the Galaxy Vol. 3
        { id: 48891, type: "tv" }, // Brooklyn Nine-Nine
        { id: 324857, type: "movie" }, // Spider-Man: Into the Spider-Verse
        { id: 2288, type: "tv" }, // Prison Break
        { id: 398173, type: "movie" }, // Black Panther: Wakanda Forever
        { id: 85937, type: "tv" }, // Demon Slayer
        { id: 508947, type: "movie" }, // Turning Red
        { id: 46260, type: "tv" }, // Naruto: Shippuden
        { id: 361743, type: "movie" }, // Top Gun: Maverick
        { id: 92830, type: "tv" }, // Obi-Wan Kenobi
      ],
      // Row 4 - 15 items
      [
        { id: 65930, type: "tv" }, // Peaky Blinders
        { id: 505642, type: "movie" }, // Black Panther
        { id: 44217, type: "tv" }, // Vikings
        { id: 245891, type: "movie" }, // John Wick
        { id: 63247, type: "tv" }, // Westworld
        { id: 550, type: "movie" }, // Fight Club
        { id: 67195, type: "tv" }, // The Mandalorian
        { id: 680, type: "movie" }, // Pulp Fiction
        { id: 76669, type: "tv" }, // Elite
        { id: 238, type: "movie" }, // The Godfather
        { id: 71446, type: "tv" }, // Money Heist
        { id: 155, type: "movie" }, // The Dark Knight
        { id: 1429, type: "tv" }, // Attack on Titan
        { id: 240, type: "movie" }, // The Godfather: Part II
        { id: 84773, type: "tv" }, // The Lord of the Rings: The Rings of Power
      ],
      // Row 5 - 10 items
      [
        { id: 94605, type: "tv" }, // Arcane
        { id: 19995, type: "movie" }, // Avatar
        { id: 60574, type: "tv" }, // Peaky Blinders
        { id: 299536, type: "movie" }, // Avengers: Infinity War
        { id: 1399, type: "tv" }, // Game of Thrones
        { id: 603, type: "movie" }, // The Matrix
        { id: 82856, type: "tv" }, // The Witcher
        { id: 118340, type: "movie" }, // Guardians of the Galaxy
        { id: 1402, type: "tv" }, // The Walking Dead
        { id: 12445, type: "movie" }, // Harry Potter and the Deathly Hallows: Part 2
      ],
    ],
    []
  );

  // Setup Intersection Observer to track which rows are visible
  // Modified to keep animations running even when rows are not visible
  useEffect(() => {
    if (!contentRows.length) return;

    const options = {
      root: null, // use viewport
      rootMargin: "200px", // detect when row is 200px from viewport
      threshold: 0.1, // 10% visibility is enough
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const rowIndex = entry.target.dataset.rowIndex;
        if (rowIndex) {
          // Just track visibility but don't use it to pause animations
          setVisibleRows((prev) => ({
            ...prev,
            [rowIndex]: entry.isIntersecting,
          }));
        }
      });
    }, options);

    // Select all the row elements and observe them
    // Only after content is loaded
    document.querySelectorAll(".content-row").forEach((row) => {
      observer.observe(row);
    });

    return () => {
      observer.disconnect();
    };
  }, [contentRows]);

  // Generate fallback items - memoized to prevent recreation
  const generateFallbackItems = useCallback(
    (count, rowIndex) => {
      return Array.from({ length: count }, (_, i) => ({
        id: `fallback-${rowIndex}-${i}`,
        title: `Item ${i + 1}`,
        imageType: i % 3 === 0 ? "poster" : "backdrop",
        image: fallbackImageUrl,
        isFallback: true,
      }));
    },
    [fallbackImageUrl]
  );

  // Fetch data from TMDB API using IDs
  useEffect(() => {
    // Cache for API responses to reduce duplicate requests
    const apiCache = new Map();

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Process each row of items
        const processedRows = await Promise.all(
          tmdbItemsByRow.map(async (rowItems, rowIndex) => {
            // Fetch images for all items in the row with a small delay between requests
            const rowItemsWithImages = [];

            // Process only a subset of items for each row to improve performance
            const itemsToProcess = rowItems.slice(0, 10);

            for (let i = 0; i < itemsToProcess.length; i++) {
              const item = itemsToProcess[i];
              try {
                // Add small delay between requests to avoid rate limiting
                if (i > 0) {
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }

                const { id, type } = item;
                const cacheKey = `${type}-${id}`;

                // Check cache first to avoid duplicate requests
                let images;
                if (apiCache.has(cacheKey)) {
                  images = apiCache.get(cacheKey);
                } else {
                  images = await fetchMovieImages(type, id);
                  apiCache.set(cacheKey, images);
                }

                // Determine image path based on availability and item position
                let imagePath = null;
                let imageType = "backdrop";

                // Use poster for some items, backdrop for others based on position
                if (i % 3 === 0 && images?.posters[0]?.file_path) {
                  imagePath = `${baseImageW500}${images.posters[0].file_path}`;
                  imageType = "poster";
                } else if (images?.backdrops[0]?.file_path) {
                  imagePath = `${baseImageW500}${images.backdrops[0].file_path}`;
                }

                // Only add items with valid images
                if (imagePath) {
                  rowItemsWithImages.push({
                    id,
                    title: images?.title || images?.name || `Item ${id}`,
                    imageType,
                    image: imagePath,
                  });
                }
              } catch (error) {
                console.error(
                  `Error fetching images for item ${item.id}:`,
                  error
                );
                // Skip adding the item if there's an error
              }
            }

            return {
              items:
                rowItemsWithImages.length > 0
                  ? rowItemsWithImages
                  : generateFallbackItems(5, rowIndex),
            };
          })
        );

        setContentRows(processedRows);
        setIsLoading(false);

        // Trigger the entrance animation after content is loaded
        setTimeout(() => {
          setHasEntered(true);
        }, 300);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);

        // Fallback content for all rows
        setContentRows(
          Array.from({ length: 5 }, (_, i) => ({
            items: generateFallbackItems(10, i),
          }))
        );

        // Trigger the entrance animation even with fallback content
        setTimeout(() => {
          setHasEntered(true);
        }, 300);
      }
    };

    fetchData();

    // Cleanup function to clear cache when component unmounts
    return () => {
      apiCache.clear();
    };
  }, [tmdbItemsByRow, generateFallbackItems]);

  // Skeleton loading animation component - memoized to prevent recreations
  const SkeletonContentRow = React.memo(({ rowIndex }) => {
    // Alternate row direction and speed
    const direction = rowIndex % 2 === 0 ? 1 : -1;
    const speed = 180 + rowIndex * 20;

    // Create a mix of poster and backdrop skeleton items
    const skeletonItems = useMemo(() => {
      return Array.from({ length: 10 }, (_, i) => ({
        id: `skeleton-${rowIndex}-${i}`,
        imageType: i % 3 === 0 ? "poster" : "backdrop",
      }));
    }, [rowIndex]);

    return (
      <Box
        mb="12px"
        overflow="hidden"
        position="relative"
        zIndex={10 - rowIndex}
        className="content-row skeleton"
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
            {/* Double items instead of triple to reduce DOM nodes */}
            {[...skeletonItems, ...skeletonItems].map((item, index) => {
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
                    bg="rgba(50, 50, 50, 0.5)"
                    className="skeleton-pulse"
                  />
                </Box>
              );
            })}
          </Flex>
        </motion.div>
      </Box>
    );
  });

  // Optimize image rendering with React.memo
  const ContentImage = React.memo(({ item }) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <Image
        src={item.image}
        alt={item.title}
        objectFit={item.imageType === "poster" ? "contain" : "cover"}
        height={"100%"}
        filter="brightness(0.6)" // Darkened images
        loading="lazy" // Add native lazy loading
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onError={(e) => {
          // Only log the error, don't try to replace the image again
          // if it's already a fallback image to avoid infinite loops
          if (!item.isFallback) {
            console.error(`Error loading image: ${item.image}`);
            e.target.src = fallbackImageUrl;
          }
        }}
      />
    );
  });

  // Content row component with proper 10deg tilt for entire row
  // Modified to always animate regardless of visibility
  const ContentRow = React.memo(({ rowData, rowIndex, delayFactor = 0 }) => {
    const rowRef = useRef(null);

    // Alternate row direction and speed
    const direction = rowIndex % 2 === 0 ? 1 : -1;
    const speed = 180 + rowIndex * 20;

    // Check if row has items
    if (!rowData.items || rowData.items.length === 0) {
      return null;
    }

    // Animation variants for the entrance effect
    const rowVariants = {
      hidden: {
        opacity: 0,
        x: direction * -200,
        y: 100,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.8,
          delay: 0.15 * delayFactor,
          ease: "easeOut",
        },
      },
    };

    // Reduce the number of duplicated items to improve performance
    const renderItems = useMemo(() => {
      // Only duplicate items once instead of twice
      return [...rowData.items, ...rowData.items];
    }, [rowData.items]);

    return (
      <motion.div
        initial="hidden"
        animate={hasEntered ? "visible" : "hidden"}
        variants={rowVariants}
      >
        <Box
          ref={rowRef}
          mb="12px"
          overflow="hidden"
          position="relative"
          zIndex={10 - rowIndex}
          className="content-row"
          data-row-index={rowIndex}
          transform="rotate(11deg)"
          height="100%"
          style={{
            perspective: "1000px",
          }}
          opacity="0.3"
        >
          {/* Modified: Always animate regardless of visibility */}
          <motion.div
            initial={{ x: direction * -300 }}
            animate={{
              x: direction * 300,
              transition: {
                repeat: Infinity,
                duration: speed,
                ease: "linear",
                repeatDelay: 0,
              },
            }}
          >
            <Flex>
              {renderItems.map((item, index) => {
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
                  >
                    <Box
                      width="100%"
                      height="100%"
                      position="relative"
                      overflow="hidden"
                      borderRadius="10px"
                    >
                      <ContentImage item={item} />
                    </Box>
                  </Box>
                );
              })}
            </Flex>
          </motion.div>
        </Box>
      </motion.div>
    );
  });

  // Animation variants for the background container
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        overflow="hidden"
        zIndex={-1}
        bg="rgba(0, 0, 0, 0.85)" // Dark overlay background
        sx={{
          // Skeleton animation CSS
          ".skeleton-pulse": {
            animation: "pulse 1.5s ease-in-out infinite",
          },
          "@keyframes pulse": {
            "0%": {
              opacity: 0.6,
            },
            "50%": {
              opacity: 0.3,
            },
            "100%": {
              opacity: 0.6,
            },
          },
        }}
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
          {isLoading
            ? // Skeleton loading state - same number of rows as the actual content
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonContentRow
                  key={`skeleton-${index}`}
                  rowIndex={index}
                />
              ))
            : // Actual content rows with staggered entrance animation
              contentRows.map((rowData, index) => (
                <ContentRow
                  key={index}
                  rowData={rowData}
                  rowIndex={index}
                  delayFactor={index} // Staggered delay based on row index
                />
              ))}
        </Box>
      </Box>
    </motion.div>
  );
};

// Use memo to prevent unnecessary re-renders of the entire component
export default React.memo(NetflixBackground);
