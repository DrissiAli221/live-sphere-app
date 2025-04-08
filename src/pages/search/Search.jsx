import React, { useState, useEffect, useRef } from "react";

// --- Chakra UI Primitive Imports ---
import {
  Box,
  Flex,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
  Image, // Added Image for ContentGrid
} from "@chakra-ui/react";

// --- Framer Motion Imports ---
import { motion } from "framer-motion";

// --- Service/Util/Component Imports ---
import { searchAll, fetchTrending } from "@/services/api";
import { Input } from "@/components/ui/input"; // IMPORT THE THEMED INPUT we created
// Assuming ContentGrid is correctly imported or defined below

// --- Icon Imports ---
import { FaSearch, FaFire } from "react-icons/fa"; // Icons for button and popular heading
import { Link } from "react-router-dom";

// ========================================================================
// --- MOTION COMPONENTS ---
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionLink = motion(Link);

// ========================================================================
// --- CUSTOM THEME COMPONENTS ---
// ========================================================================
// Re-paste/Import SketchButton & SquigglyLine if not globally available
const ScribbleEffect = ({ isActive }) => (
  <motion.svg
    width="100%"
    height="100%"
    viewBox="0 0 300 100"
    initial={false}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      pointerEvents: "none",
      zIndex: 10,
      opacity: 0.5,
    }}
    animate={isActive ? "visible" : "hidden"}
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
  >
    {" "}
    <motion.path
      d="M10,50 C50,30 100,70 150,50 C200,30 250,60 290,50"
      fill="transparent"
      stroke="#FFEC44"
      strokeWidth="2"
      strokeDasharray="5,5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        isActive
          ? { pathLength: 1, opacity: 0.4 }
          : { pathLength: 0, opacity: 0 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ strokeDashoffset: 0 }}
    />{" "}
  </motion.svg>
);
const SketchButtonInternal = ({ children, primary = false, ...rest }) => (
  <Box
    as="button"
    width="100%"
    height="auto"
    minH="10"
    position="relative"
    bg={primary ? "#FFEC44" : "rgba(40,40,40,0.7)"}
    color={primary ? "#000" : "#fff"}
    border="1px solid #000"
    borderRadius="none"
    fontWeight={primary ? "bold" : "medium"}
    zIndex={2}
    transition="transform 0.2s, background 0.2s"
    _hover={{ textDecoration: "none" }}
    _focusVisible={{ outline: "2px solid #FFEC44", outlineOffset: "2px" }}
    _disabled={{
      opacity: 0.5,
      cursor: "not-allowed",
      filter: "grayscale(80%)",
    }}
    fontFamily="'Courier New', monospace"
    fontSize="sm"
    textTransform="uppercase"
    letterSpacing="wider"
    px={4}
    py={2}
    whiteSpace="nowrap"
    overflow="hidden"
    textOverflow="ellipsis"
    {...rest}
  >
    {" "}
    {children}{" "}
    <motion.div
      style={{
        position: "absolute",
        bottom: "4px",
        left: "5%",
        height: "2px",
        background: primary ? "black" : "#FFEC44",
        zIndex: 3,
        width: 0,
      }}
    />{" "}
  </Box>
);
const SketchButton = ({
  children,
  primary = false,
  onClick = () => {},
  disabled = false,
  isLoading = false,
  size = "md",
  type = "button",
  /* Add type */ ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const underlineVariants = {
    rest: { width: 0 },
    hover: { width: "90%", transition: { duration: 0.3 } },
  };
  const isDisabled = disabled || isLoading;
  const fontSize = size === "sm" ? "xs" : "sm";
  const padding = size === "sm" ? 3 : 4;
  const minHeight = size === "sm" ? 8 : 10;
  return (
    <motion.div
      style={{ position: "relative", width: "100%" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={!isDisabled ? "hover" : "rest"}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      initial="rest"
    >
      {" "}
      <ScribbleEffect isActive={isHovered && !isDisabled} />{" "}
      {!isDisabled &&
        ["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos, idx) => (
          <motion.div
            key={pos}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isHovered ? { scale: 1, opacity: 0.8 } : { scale: 0, opacity: 0 }
            }
            transition={{
              duration: 0.2,
              delay: idx * 0.05,
              type: "spring",
              stiffness: 500,
            }}
            style={{
              position: "absolute",
              width: "8px",
              height: "8px",
              border: "2px solid #FFEC44",
              zIndex: 5,
              borderRadius: "none",
              ...(pos === "topLeft"
                ? { top: -4, left: -4, borderWidth: "2px 0 0 2px" }
                : pos === "topRight"
                ? { top: -4, right: -4, borderWidth: "2px 2px 0 0" }
                : pos === "bottomLeft"
                ? { bottom: -4, left: -4, borderWidth: "0 0 2px 2px" }
                : { bottom: -4, right: -4, borderWidth: "0 2px 2px 0" }),
            }}
          />
        ))}{" "}
      {!isDisabled && (
        <motion.div
          initial={{ opacity: 0.6, x: 3, y: 3 }}
          animate={
            isHovered
              ? { opacity: 0.9, x: 5, y: 5 }
              : { opacity: 0.6, x: 3, y: 3 }
          }
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: -1,
            border: "1px solid rgba(0,0,0,0.5)",
            borderRadius: "none",
          }}
          transition={{ duration: 0.2 }}
        />
      )}{" "}
      <SketchButtonInternal
        primary={primary}
        onClick={onClick}
        disabled={isDisabled}
        minH={minHeight}
        fontSize={fontSize}
        px={padding}
        type={type}
        /* Apply type */ {...rest}
      >
        {" "}
        {isLoading ? <Spinner size="xs" speed="0.8s" /> : children}{" "}
        <motion.div
          variants={underlineVariants}
          style={{
            position: "absolute",
            bottom: "4px",
            left: "5%",
            height: "2px",
            background: primary ? "black" : "#FFEC44",
            zIndex: 3,
          }}
        />{" "}
      </SketchButtonInternal>{" "}
    </motion.div>
  );
};
const SquigglyLine = ({
  color = "rgba(255, 236, 68, 0.8)",
  delay = 0,
  thickness = 1.5,
  dasharray = "3,2",
}) => (
  <motion.div
    initial={{ width: "0%" }}
    animate={{ width: "100%" }}
    transition={{ duration: 0.8, delay }}
    style={{ position: "relative", lineHeight: "0" }}
  >
    {" "}
    <svg
      width="100%"
      height="4"
      viewBox="0 0 300 4"
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {" "}
      <motion.path
        d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={dasharray}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: delay + 0.7 }}
      />{" "}
    </svg>{" "}
  </motion.div>
);

// ========================================================================
// --- ENHANCED CONTENT GRID COMPONENT (Enhancement 7) ---
// ========================================================================
const ContentGrid = ({ item, index, contentType }) => {
  const accentColor = "#FFEC44"; // Defined here for consistency if not passed as prop

  return (
    <MotionLink
      to={`/${contentType}/${item.id}`}
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // Removed index-based delay from here, handled by parent grid stagger
      transition={{ duration: 0.3 }}
      position="relative"
      overflow="hidden"
      borderRadius="sm"
      border="1px solid"
      borderColor="rgba(255,255,255,0.1)"
      _hover={{ borderColor: accentColor }} // Add hover border color change
    >
      {/* Media Type Badge */}
      <Box
        position="absolute"
        top={2}
        right={2}
        bg="rgba(0,0,0,0.7)"
        color={contentType === "movie" ? "#FF5757" : "#57B8FF"} // Example distinct colors
        fontSize="xs"
        px={2}
        py={1}
        zIndex={2}
        textTransform="uppercase"
        fontWeight="bold"
        borderRadius="sm" // Slight rounding for badge
      >
        {contentType}
      </Box>

      <Box overflow="hidden" position="relative">
        {" "}
        {/* Added relative for image hover */}
        <MotionBox // Wrap image in motion box for scale effect
          width="100%"
          height="auto"
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }} // Apply scale on hover directly here
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={item.title || item.name}
            width="100%"
            height="auto" // Ensure aspect ratio is maintained
            objectFit="cover" // Ensure image covers the area
            fallbackSrc="https://via.placeholder.com/300x450?text=No+Image"
          />
        </MotionBox>
      </Box>

      {/* Overlay on hover */}
      <MotionBox
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="40%" // Increased height for more info space
        bg="linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0))" // Stronger gradient
        initial={{ opacity: 0, y: 15 }} // Start slightly lower and invisible
        whileHover={{ opacity: 1, y: 0 }} // Fade in and slide up
        transition={{ duration: 0.25 }}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        p={3} // Increased padding
        zIndex={1} // Ensure it's above the image
      >
        <Text fontSize="sm" fontWeight="bold" color="white" noOfLines={1}>
          {item.title || item.name}
        </Text>
        <Flex align="center" mt={1} gap={2}>
          {" "}
          {/* Added gap */}
          <Flex align="center">
            <Box as="span" color="yellow.400" mr={1} fontSize="xs">
              ★
            </Box>{" "}
            {/* Smaller star */}
            <Text fontSize="xs" color="gray.300">
              {item.vote_average?.toFixed(1) || "N/A"}
            </Text>
          </Flex>
          <Text fontSize="xs" color="gray.400">
            {new Date(
              item.release_date || item.first_air_date || Date.now()
            ).getFullYear() || ""}
          </Text>
        </Flex>
      </MotionBox>
    </MotionLink>
  );
};

// ========================================================================
// --- ENHANCED SEARCH COMPONENT (Integrating All Enhancements) ---
// ========================================================================
function Search() {
  // --- State ---
  const [activePage, setActivePage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchedYet, setSearchedYet] = useState(false);
  const [isListening, setIsListening] = useState(false); // State for Voice Search (Enhancement 8)
  const [selectedFilter, setSelectedFilter] = useState("All"); // State for Filter Pills (Enhancement 2)

  // --- Recent Searches State (Enhancement 6) ---
  // (Could load/save from localStorage in a real app)
  const [recentSearches, setRecentSearches] = useState([
    "Marvel",
    "Star Wars",
    "Tarantino",
    "Sci-Fi",
  ]);

  // --- Trending Tags State (Enhancement 6) ---
  // (Could be dynamic based on API or analytics)
  const [trendingTags, setTrendingTags] = useState([
    "Horror",
    "Thriller",
    "Comedy",
    "Action",
    "Animation",
  ]);

  // --- Filter Categories (Enhancement 2) ---
  const filterCategories = [
    "All",
    "Movies",
    "TV Shows",
    "Action",
    "Comedy",
    "Drama",
    "Sci-Fi",
  ];

  // --- Theming ---
  const baseBg = "#0C0C1B";
  const accentColor = "#FFEC44";
  const headingFont = "'Courier New', monospace";
  const mutedTextColor = "gray.400";
  const borderColor = "rgba(255, 255, 255, 0.1)";

  // --- Fetch Initial Popular Data ---
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);
    fetchTrending("week")
      .then((res) => {
        if (isMounted && res?.results) {
          const popular = res.results.filter(
            (item) =>
              (item.media_type === "movie" || item.media_type === "tv") &&
              item.poster_path
          );
          setPopularItems(popular.slice(0, 10));
        }
      })
      .catch((error) => console.error("Error fetching popular items:", error))
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Search Handler ---
  const handleSearch = (e, queryOverride = null) => {
    if (e) e.preventDefault(); // Prevent default form submission if event exists
    const query = queryOverride !== null ? queryOverride : searchValue; // Use override if provided
    if (!query.trim()) return; // Don't search if query is empty

    setLoading(true);
    setSearchedYet(true);
    setSearchResults([]);
    setActivePage(1);
    setSearchValue(query); // Ensure input reflects the searched query

    // Add to recent searches if not already there (Enhancement 6 Logic)
    if (!recentSearches.includes(query) && query !== searchValue) {
      // Avoid duplicates if already typed
      setRecentSearches((prev) => [query, ...prev.slice(0, 3)]); // Keep max 4 recent searches
    }

    searchAll(query, 1)
      .then((res) => {
        if (res?.results) {
          const filteredResults = res.results.filter(
            (item) =>
              (item.media_type === "movie" || item.media_type === "tv") &&
              item.poster_path
          );
          // --- Apply filter logic here if 'selectedFilter' is not 'All' ---
          // Example (needs refinement based on actual data structure):
          let finalResults = filteredResults;
          if (selectedFilter !== "All") {
            const filterLower = selectedFilter.toLowerCase();
            if (filterLower === "movies") {
              finalResults = filteredResults.filter(
                (item) => item.media_type === "movie"
              );
            } else if (filterLower === "tv shows") {
              finalResults = filteredResults.filter(
                (item) => item.media_type === "tv"
              );
            }
            // Add genre filtering if your API data supports it easily here
            // else if (item.genres?.some(g => g.name.toLowerCase() === filterLower)) { ... }
          }
          setSearchResults(finalResults);
          setActivePage(res.page || 1);
        } else {
          setSearchResults([]);
        }
      })
      .catch((error) => {
        console.error("Error during search:", error);
        setSearchResults([]);
      })
      .finally(() => setLoading(false));
  };

  // --- Filter Handler (Enhancement 2) ---
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    // Optional: Re-run the search with the new filter if results are already displayed
    if (searchedYet && searchResults.length > 0) {
      // Re-apply filtering logic locally or re-fetch if API supports filtering
      // For simplicity, let's re-trigger search if a query exists
      if (searchValue.trim()) {
        handleSearch(null, searchValue); // Re-run search with current query & new filter
      }
    }
    // If popular items are shown, maybe filter them locally? (More complex)
  };

  // Determine what to display
  // Note: Filter logic is now applied inside handleSearch for simplicity when searching
  const itemsToDisplay = searchedYet ? searchResults : popularItems;
  const displayLoading = searchedYet ? loading : initialLoading;
  const resultsTitle = searchedYet
    ? searchValue
      ? `Results for "${searchValue}" ${
          selectedFilter !== "All" ? `(${selectedFilter})` : ""
        }`
      : "Search Results"
    : "Popular This Week";
  const noResultsFound = searchedYet && !loading && searchResults.length === 0;

  // Example suggestions for Autocomplete (Enhancement 3)
  const suggestions = [
    "Avengers",
    "Breaking Bad",
    "Dune",
    "Inception",
    "The Office",
    "Stranger Things",
    "Spider-Man",
  ];
  const filteredSuggestions =
    searchValue && !isListening // Don't show while listening
      ? suggestions.filter(
          (item) =>
            item.toLowerCase().includes(searchValue.toLowerCase()) &&
            item.toLowerCase() !== searchValue.toLowerCase()
        ) // Exclude exact match
      : [];

  // Grid animation variants (Enhancement 1)
  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Stagger effect for grid items
      },
    },
  };

  // Grid item animation variants (Enhancement 1)
  const gridItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
  };

  return (
    // Use baseBg for the page background
    <Box
      bg={baseBg}
      minHeight="100vh"
      pt="110px"
      pb={16}
      position="relative"
      overflowX="hidden"
    >
      {" "}
      {/* Prevent horizontal overflow */}
      {/* --- Dynamic Background Elements (Enhancement 5) --- */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        overflow="hidden"
        zIndex={0}
      >
        <MotionBox
          position="absolute"
          top="20%"
          left="5%"
          width="300px"
          height="300px"
          borderRadius="50%"
          background="radial-gradient(circle, rgba(255,236,68,0.05) 0%, rgba(12,12,27,0) 70%)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "mirror", // Changed to mirror for smoother effect
          }}
        />
        <MotionBox
          position="absolute"
          bottom="10%"
          right="10%"
          width="250px"
          height="250px"
          borderRadius="50%"
          background="radial-gradient(circle, rgba(80,80,120,0.07) 0%, rgba(12,12,27,0) 70%)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "mirror", // Changed to mirror
            delay: 2,
          }}
        />
      </Box>
      <Container
        maxW={"container.xl"}
        px={{ base: 4, md: 8 }}
        position="relative"
        zIndex={1}
      >
        {/* --- Themed Heading --- */}
        <Box mb={8} display="inline-block" position="relative">
          <MotionHeading
            as="h1"
            size="xl"
            color="white"
            fontFamily={headingFont}
            textTransform="uppercase"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Search & Discover
          </MotionHeading>
          <Box mt={1} w="70px">
            <SquigglyLine color={accentColor} thickness={2} dasharray="4,2" />
          </Box>
        </Box>

        {/* --- Search Form (Themed & Enhanced) --- */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Flex gap={3} mb={6} /* Reduced bottom margin */>
            {/* Enhanced Input with Icon & Suggestions (Enhancement 3) */}
            <Flex position="relative" flexDirection="column" flex="1">
              <Input
                placeholder="Search Movies, TV Shows..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                disabled={isListening} // Disable input while listening
                style={{
                  background: "rgba(40,40,50,0.9)",
                  border: "1px solid #000",
                  borderRadius: "0px", // Keeping the sketch theme
                  boxShadow: "2px 2px 0 rgba(250,204,21,0.3)",
                  paddingLeft: "40px", // Space for the icon
                  color: "white",
                  height: "40px", // Explicit height for alignment
                }}
                _placeholder={{ color: "gray.500" }}
              />
              <Box
                position="absolute"
                left="12px"
                top="50%"
                transform="translateY(-50%)"
                color={isListening ? accentColor : "gray.400"} // Change icon color when listening
                zIndex={2} // Ensure icon is above input background
              >
                <FaSearch />
              </Box>

              {/* Autocomplete suggestions (Enhancement 3) */}
              {filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} // Add exit animation
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{
                    position: "absolute",
                    top: "100%", // Position below input
                    left: 0,
                    right: 0,
                    zIndex: 10, // High z-index
                    background: "rgba(20,20,30,0.98)", // Slightly darker bg
                    border: `1px solid ${borderColor}`,
                    borderTop: "none",
                    maxHeight: "200px",
                    overflowY: "auto",
                    marginTop: "2px", // Small gap
                  }}
                >
                  {filteredSuggestions.map((suggestion) => (
                    <Box
                      key={suggestion}
                      p={2}
                      px={3} // More horizontal padding
                      cursor="pointer"
                      _hover={{ bg: "rgba(255,236,68,0.1)" }}
                      onClick={() => {
                        setSearchValue(suggestion); // Set input value
                        // Trigger search immediately after selecting suggestion
                        handleSearch(null, suggestion);
                      }}
                    >
                      <Text fontSize="sm" color="white">
                        {suggestion}
                      </Text>
                    </Box>
                  ))}
                </motion.div>
              )}
            </Flex>

            {/* Search Button */}
            <Box flexShrink={0} w={["100px", "120px"]}>
              <SketchButton
                primary
                type="submit"
                isLoading={loading}
                disabled={loading || isListening} // Disable while loading or listening
                size="md" // Match height with input
              >
                <Flex align="center" justify="center">
                  <FaSearch style={{ marginRight: "8px" }} /> Search
                </Flex>
              </SketchButton>
            </Box>
          </Flex>
        </motion.form>

        {/* --- Filter Pills (Enhancement 2) --- */}
        <Flex
          mb={6}
          gap={2}
          overflowX="auto"
          pb={2} /* Add padding bottom for scrollbar */
          css={{
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: `${accentColor} rgba(255,255,255,0.1)`, // Firefox
            "&::-webkit-scrollbar": { height: "6px" },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255,255,255,0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: accentColor,
              borderRadius: "3px",
            },
          }}
        >
          {filterCategories.map((filter) => (
            <motion.div
              key={filter}
              whileHover={{ scale: 1.05, y: -2 }} // Add slight lift on hover
              whileTap={{ scale: 0.95 }}
            >
              <Box
                as="button"
                px={3}
                py={1}
                borderWidth="1px"
                borderColor={
                  filter === selectedFilter ? accentColor : borderColor
                }
                bg={
                  filter === selectedFilter
                    ? "rgba(255, 236, 68, 0.2)"
                    : "rgba(20,20,30,0.7)"
                }
                color={filter === selectedFilter ? accentColor : "white"}
                fontFamily={headingFont}
                fontSize="xs" // Smaller font for pills
                textTransform="uppercase"
                transition="all 0.2s ease-in-out"
                position="relative"
                whiteSpace="nowrap" // Prevent wrapping
                _hover={{
                  borderColor: accentColor,
                  bg:
                    filter !== selectedFilter
                      ? "rgba(40,40,50,0.9)"
                      : undefined,
                }}
                _after={
                  filter === selectedFilter
                    ? {
                        content: '""',
                        position: "absolute",
                        bottom: "-2px", // Slightly below the border
                        left: "10%",
                        width: "80%",
                        height: "2px",
                        bg: accentColor,
                        transition: "all 0.2s",
                      }
                    : {}
                }
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </Box>
            </motion.div>
          ))}
        </Flex>

        {/* --- Recent Searches and Trending Tags (Enhancement 6) --- */}
        <Flex
          direction={["column", "column", "row"]}
          /* Stack on small/medium screens */ mb={8}
          gap={6}
        >
          {/* Recent Searches */}
          <Box flex="1">
            <Text
              color={mutedTextColor}
              fontSize="xs"
              textTransform="uppercase"
              mb={2}
              fontWeight="medium"
            >
              Recent Searches
            </Text>
            <Flex gap={2} flexWrap="wrap">
              {recentSearches.map((tag) => (
                <motion.div
                  key={`recent-${tag}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    as="button"
                    bg="rgba(40,40,50,0.7)"
                    border="1px dashed rgba(255,255,255,0.2)"
                    px={3}
                    py={1}
                    fontSize="sm"
                    color="white"
                    onClick={() => {
                      // setSearchValue(tag); // Set input value
                      // Trigger search immediately
                      handleSearch(null, tag);
                    }}
                    _hover={{ borderColor: accentColor, color: accentColor }}
                    transition="all 0.2s"
                  >
                    {tag}
                  </Box>
                </motion.div>
              ))}
            </Flex>
          </Box>

          {/* Trending Tags */}
          <Box flex="1">
            <Text
              color={mutedTextColor}
              fontSize="xs"
              textTransform="uppercase"
              mb={2}
              fontWeight="medium"
            >
              <Flex align="center" gap={1}>
                Trending Tags <FaFire size="12px" color={accentColor} />
              </Flex>
            </Text>
            <Flex gap={2} flexWrap="wrap">
              {trendingTags.map((tag) => (
                <motion.div
                  key={`trending-${tag}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    as="button"
                    bg="rgba(40,40,50,0.7)"
                    border="1px solid rgba(255,255,255,0.1)" // Solid border for trending
                    px={3}
                    py={1}
                    fontSize="sm"
                    color="white"
                    onClick={() => {
                      // setSearchValue(tag); // Set input value
                      // Trigger search immediately
                      handleSearch(null, tag);
                    }}
                    _hover={{ borderColor: accentColor, color: accentColor }}
                    transition="all 0.2s"
                  >
                    {tag}
                  </Box>
                </motion.div>
              ))}
            </Flex>
          </Box>
        </Flex>

        {/* --- Results/Popular Section --- */}
        <Box>
          {/* --- Heading for the list (Dynamic) --- */}
          <Flex align="center" mb={6}>
            <MotionHeading
              size="lg"
              color="white"
              fontFamily={headingFont}
              mr={3}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              key={resultsTitle} // Add key to force re-render on title change
            >
              {resultsTitle}
            </MotionHeading>
            {!searchedYet && ( // Show fire icon only for initial popular list
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.3,
                }}
              >
                <FaFire style={{ color: accentColor, fontSize: "1.5em" }} />
              </motion.div>
            )}
          </Flex>

          {/* --- Loading State --- */}
          {displayLoading && (
            <Flex justify="center" align="center" minH="400px">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Spinner
                  size="xl"
                  thickness="3px"
                  speed="0.7s"
                  color={accentColor}
                  emptyColor="rgba(255,255,255,0.1)"
                />
              </motion.div>
            </Flex>
          )}

          {/* --- No Results Message --- */}
          {noResultsFound && (
            <Flex
              justify="center"
              align="center"
              minH="200px"
              direction="column"
              textAlign="center"
            >
              <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Text
                  color={mutedTextColor}
                  fontFamily={headingFont}
                  fontSize="lg"
                  mb={2}
                >
                  No results found for "{searchValue}"
                  {selectedFilter !== "All" ? ` in ${selectedFilter}` : ""}.
                </Text>
                <Text color="gray.500" fontSize="sm">
                  Try searching for something else or adjust your filters.
                </Text>
              </MotionBox>
            </Flex>
          )}

          {/* --- Display Grid with Stagger Animation (Enhancement 1) --- */}
          {!displayLoading && itemsToDisplay.length > 0 && (
            <SimpleGrid
              columns={[2, 3, 4, 5]} // Responsive columns
              gap={{ base: 3, md: 4 }} // Responsive gap
              as={motion.div} // Make the grid a motion component
              variants={gridVariants} // Apply container variants
              initial="hidden"
              animate="show" // Trigger animation
            >
              {itemsToDisplay.map((item, index) => (
                <motion.div
                  key={`${item.media_type}-${item.id}`} // Use unique key
                  variants={gridItemVariants} // Apply item variants
                >
                  <ContentGrid
                    item={item}
                    index={index} // Keep index if needed inside ContentGrid, though delay is handled by stagger
                    contentType={item.media_type}
                  />
                </motion.div>
              ))}
            </SimpleGrid>
          )}

          {/* --- Pagination Placeholder (Future Enhancement) --- */}
          {/* {searchResults.length > 0 && totalPages > 1 && (
              <Flex justify="center" mt={8}>
                  Pagination Component Here
              </Flex>
          )} */}
        </Box>
      </Container>
    </Box>
  );
}

export default Search;
