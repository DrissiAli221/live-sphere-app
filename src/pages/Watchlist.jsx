import React, { useState, useEffect, useCallback } from "react";

// --- Chakra UI Primitive Imports ---
import {
  Box,
  Flex,
  Container,
  Image,
  Text,
  HStack,
  SimpleGrid,
  VStack,
  Heading,
  Badge,
  Spinner,
  Menu,
  Icon,
} from "@chakra-ui/react";

// --- React Router Imports ---
import { Link } from "react-router-dom";

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Service/Util Imports ---
import { useAuth } from "@/context/AuthProvider";
import { useFirestore } from "@/services/firestore";
import { baseImageW500 } from "@/services/api";
import { truncateText } from "@/utils/helper";

// --- Icon Imports ---
import {
  FaPlay,
  FaBookmark,
  FaFilm,
  FaTv,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaTrash,
  FaTh,
  FaList,
  FaCheck,
} from "react-icons/fa";
import {
  MdAccessTime,
  MdTitle,
  MdGrade,
  MdMovieFilter,
  MdLiveTv,
  MdPlaylistAddCheck,
  MdPlaylistRemove,
  MdFilterList,
  MdSort,
} from "react-icons/md";

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Included directly for completeness) ---
// ========================================================================

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionSimpleGrid = motion(SimpleGrid);
const MotionVStack = motion(VStack);
const MotionPath = motion.path;

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
};

const shadowVariants = {
  rest: { opacity: 0.6, x: 2, y: 2, transition: { duration: 0.2 } },
  hover: { opacity: 0.9, x: 4, y: 4, transition: { duration: 0.2 } },
};

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
    <MotionPath
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
    />
  </motion.svg>
);

const SketchButtonInternal = ({ children, primary = false, ...rest }) => (
  <Box
    as="button"
    width="100%"
    height="100%"
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
    display="flex"
    alignItems="center"
    justifyContent="center"
    {...rest}
  >
    {children}
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
  iconSpacing = 2,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const underlineVariants = {
    rest: { width: 0 },
    hover: { width: "90%", transition: { duration: 0.3 } },
  };
  const isDisabled = disabled || isLoading;
  const fontSize = size === "sm" ? "xs" : "sm";
  const paddingX = size === "sm" ? 3 : 4;
  const minHeight = size === "sm" ? 8 : 10;
  const MotionDiv = motion.div;

  return (
    <MotionDiv
      style={{ position: "relative", width: "100%", height: "auto" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={!isDisabled ? "hover" : "rest"}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      initial="rest"
      {...rest}
    >
      <ScribbleEffect isActive={isHovered && !isDisabled} />
      {/* Corner Doodles */}
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
        ))}
      {/* Shadow */}
      {!isDisabled && (
        <motion.div
          variants={shadowVariants}
          animate={isHovered ? "hover" : "rest"}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: -1,
            border: "1px solid rgba(0,0,0,0.5)",
            borderRadius: "none",
          }}
        />
      )}
      {/* Internal Button */}
      <SketchButtonInternal
        primary={primary}
        onClick={onClick}
        disabled={isDisabled}
        minH={minHeight}
        fontSize={fontSize}
        px={paddingX}
        type={type}
      >
        <Flex align="center" justify="center" gap={iconSpacing}>
          {isLoading ? <Spinner size="xs" speed="0.8s" /> : children}
        </Flex>
      </SketchButtonInternal>
      {/* Underline */}
      <motion.div
        variants={underlineVariants}
        animate={isHovered && !isDisabled ? "hover" : "rest"}
        style={{
          position: "absolute",
          bottom: "4px",
          left: "5%",
          height: "2px",
          background: primary ? "black" : "#FFEC44",
          zIndex: 3,
        }}
      />
    </MotionDiv>
  );
};

// ========================================================================
// --- UTILITY FUNCTIONS ---
// ========================================================================
const truncateTextTitle = (title, maxLength = 20) => {
  /* ... same ... */ if (!title) return "";
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength)}…`;
};

// ========================================================================
// --- Watchlist Item CARD Component (Grid View) ---
// ========================================================================
const WatchlistItemCard = ({
  item,
  accentColor,
  cardBg,
  borderColor,
  mutedTextColor,
  headingFont,
  onToggleWatched,
  onRemove,
}) => {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date)?.substring(0, 4);
  const linkTo = `/${item.type}/${item.id}`;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionBox
      key={`${item.type}-${item.id}-grid-card`}
      bg={cardBg}
      borderRadius="none"
      overflow="hidden"
      border="1px solid"
      borderColor={borderColor}
      position="relative"
      display="flex"
      flexDirection="column"
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Shadow Effect */}
      <motion.div
        variants={shadowVariants}
        animate={isHovered ? "hover" : "rest"}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          zIndex: 0,
          border: "1px solid rgba(0,0,0,0.5)",
          borderRadius: "none",
        }}
      />
      <Box position="relative" zIndex={1}>
        {/* Image Area */}
        <Box position="relative" width="100%" pt="150%" bg="blackAlpha.400">
          <Link to={linkTo}>
            {" "}
            {item.poster_path ? (
              <Image
                src={`${baseImageW500}${item.poster_path}`}
                alt={title}
                position="absolute"
                inset={0}
                width="100%"
                height="100%"
                objectFit="cover"
                opacity={0.95}
                _hover={{ opacity: 1 }}
                transition="opacity 0.2s"
              />
            ) : (
              <Flex
                position="absolute"
                inset={0}
                align="center"
                justify="center"
              >
                <Icon as={FaFilm} color={mutedTextColor} w="30%" h="30%" />
              </Flex>
            )}{" "}
          </Link>
          {/* Badges */}
          <Badge
            position="absolute"
            top={2}
            left={2}
            bg={item.type === "movie" ? "blue.600" : "purple.600"}
            color="white"
            borderRadius="none"
            px={1.5}
            py={0.5}
            fontSize="3xs"
            border="1px solid black"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {item.type === "movie" ? "Mov" : "TV"}
          </Badge>
          {item.watched && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              bg="green.500"
              color="black"
              fontWeight="bold"
              borderRadius="none"
              px={1.5}
              py={0.5}
              fontSize="3xs"
              border="1px solid black"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              <Icon as={FaCheck} />
            </Badge>
          )}
          {item.vote_average > 0 && (
            <Badge
              position="absolute"
              bottom={2}
              left={2}
              bg={accentColor}
              color="black"
              fontWeight="bold"
              borderRadius="none"
              px={1.5}
              py={0.5}
              fontSize="xs"
              border="1px solid black"
            >
              <Flex align="center" gap={1}>
                <Icon as={FaStar} w="0.7em" h="0.7em" />
                {item.vote_average.toFixed(1)}
              </Flex>
            </Badge>
          )}
        </Box>
        {/* Text Content */}
        <VStack p={3} align="start" gap={1} flexGrow={1}>
          <Link to={linkTo} style={{ width: "100%" }}>
            <Heading
              as="h4"
              size="sm"
              color="white"
              noOfLines={2}
              fontFamily={headingFont}
              _hover={{ color: accentColor }}
              transition="color 0.2s"
              minH="2.5em"
            >
              {truncateTextTitle(title, 30)}
            </Heading>
          </Link>
          <Text fontSize="xs" color={mutedTextColor}>
            {year || "N/A"}
          </Text>
          {/* Action Buttons */}
          <HStack gap={2} width="100%" pt={2}>
            <Box flex={1}>
              {" "}
              <SketchButton
                size="sm"
                onClick={() => onToggleWatched(item.id)}
                aria-label={item.watched ? "Mark unwatched" : "Mark watched"}
              >
                {" "}
                <Icon as={item.watched ? FaEyeSlash : FaEye} />{" "}
              </SketchButton>{" "}
            </Box>
            <Box flex={1}>
              {" "}
              <SketchButton
                size="sm"
                onClick={() => onRemove(item.id)}
                primary
                aria-label="Remove item"
              >
                {" "}
                <Icon as={FaTrash} />{" "}
              </SketchButton>{" "}
            </Box>
          </HStack>
        </VStack>
      </Box>
    </MotionBox>
  );
};

// ========================================================================
// --- Watchlist Item ROW Component (List View) ---
// ========================================================================
const WatchlistItemRow = ({
  item,
  accentColor,
  cardBg,
  borderColor,
  mutedTextColor,
  headingFont,
  onToggleWatched,
  onRemove,
}) => {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date)?.substring(0, 4);
  const rating = item.vote_average?.toFixed(1);
  const linkTo = `/${item.type}/${item.id}`;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionBox
      key={`${item.type}-${item.id}-list-row`}
      variants={itemVariants}
      bg={cardBg}
      borderRadius="none"
      border="1px solid"
      borderColor={borderColor}
      mb={3}
      display="flex"
      width="100%"
      overflow="hidden"
      position="relative"
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      _hover={{ bg: `rgba(45, 45, 55, 0.98)`, borderColor: accentColor + "50" }}
      transition="background 0.2s, border-color 0.2s"
    >
      {/* Shadow Effect */}
      <motion.div
        variants={shadowVariants}
        animate={isHovered ? "hover" : "rest"}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          zIndex: -1,
          border: "1px solid rgba(0,0,0,0.5)",
          borderRadius: "none",
        }}
      />
      {/* Image */}
      <Box
        w={{ base: "70px", sm: "90px" }}
        h="auto"
        flexShrink={0}
        bg="blackAlpha.400"
        position="relative"
        zIndex={1}
      >
        {" "}
        <Link to={linkTo}>
          {" "}
          {item.poster_path ? (
            <Image
              src={`${baseImageW500}${item.poster_path}`}
              alt={title}
              width="100%"
              height="100%"
              objectFit="cover"
              opacity={0.95}
              _hover={{ opacity: 1 }}
              transition="opacity 0.2s"
            />
          ) : (
            <Flex
              w="100%"
              h="100%"
              align="center"
              justify="center"
              minH="110px"
            >
              <Icon as={FaFilm} color={mutedTextColor} w="20%" h="20%" />
            </Flex>
          )}{" "}
        </Link>{" "}
      </Box>
      {/* Details */}
      <Flex
        flex="1"
        p={3}
        direction={{ base: "column", sm: "row" }}
        align={{ base: "flex-start", sm: "center" }}
        justify="space-between"
        gap={3}
        position="relative"
        zIndex={1}
      >
        {/* Left Side Info */}
        <VStack
          align="flex-start"
          spacing={1}
          flexGrow={1}
          maxW={{ sm: "calc(100% - 130px)" }}
          overflow="hidden"
        >
          <HStack spacing={1.5}>
            {" "}
            <Badge
              bg={item.type === "movie" ? "blue.600" : "purple.600"}
              color="white"
              borderRadius="none"
              px={1.5}
              py={0.5}
              fontSize="3xs"
              textTransform="uppercase"
            >
              {item.type === "movie" ? "Mov" : "TV"}
            </Badge>{" "}
            {item.watched && (
              <Badge
                bg="green.500"
                color="black"
                borderRadius="none"
                px={1.5}
                py={0.5}
                fontSize="3xs"
              >
                <Icon as={FaCheck} mr={1} /> Watched
              </Badge>
            )}{" "}
          </HStack>
          <Link to={linkTo}>
            {" "}
            <Heading
              as="h4"
              size="sm"
              color="white"
              noOfLines={1}
              fontFamily={headingFont}
              _hover={{ color: accentColor }}
            >
              {title}
            </Heading>{" "}
          </Link>
          <HStack color={mutedTextColor} fontSize="xs" gap={3}>
            {" "}
            {year && <Text>{year}</Text>}{" "}
            {rating > 0 && (
              <Flex align="center" gap={1}>
                <Icon as={FaStar} color={accentColor} w="0.8em" h="0.8em" />
                {rating}
              </Flex>
            )}{" "}
          </HStack>
          <Text
            color={mutedTextColor}
            fontSize="xs"
            noOfLines={1}
            display={{ base: "none", md: "block" }}
          >
            {truncateText(item.overview, 80)}
          </Text>
        </VStack>
        {/* Right Side Actions */}
        <HStack spacing={2} flexShrink={0} mt={{ base: 3, sm: 0 }} zIndex={2}>
          <Box w={{ base: "36px", sm: "40px" }} h="100%">
            {" "}
            <SketchButton
              size="sm"
              onClick={() => onToggleWatched(item.id)}
              primary={!item.watched}
              aria-label={item.watched ? "Mark unwatched" : "Mark watched"}
              h="full"
              minH={8}
            >
              {" "}
              <Icon as={item.watched ? FaEyeSlash : FaEye} />{" "}
            </SketchButton>{" "}
          </Box>
          <Box w={{ base: "36px", sm: "40px" }} h="100%">
            {" "}
            <SketchButton
              size="sm"
              onClick={() => onRemove(item.id)}
              aria-label="Remove item"
              h="full"
              minH={8}
            >
              {" "}
              <Icon as={FaTrash} />{" "}
            </SketchButton>{" "}
          </Box>
        </HStack>
      </Flex>
    </MotionBox>
  );
};

// ========================================================================
// --- Watchlist PAGE COMPONENT (Using new Menu structure & Corrected Props) ---
// ========================================================================
function Watchlist() {
  // --- State ---
  const { user } = useAuth();
  const { getWatchList, updateWatchItem, removeFromWatchlist } = useFirestore();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("All");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [viewMode, setViewMode] = useState("grid");

  // --- Theming ---
  const baseBg = "#0C0C1B";
  const accentColor = "#FFEC44";
  const cardBg = "rgba(30, 30, 40, 0.9)";
  const borderColor = "rgba(255, 255, 255, 0.1)";
  const mutedTextColor = "gray.400";
  const headingFont = "'Courier New', monospace";

  // --- Data Fetching ---
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setWatchlist([]);
      return;
    }
    setLoading(true);
    let isMounted = true;
    getWatchList(user.uid)
      .then((res) => {
        if (isMounted) setWatchlist(res || []);
      })
      .catch((err) => console.error("Error fetching watchlist:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.uid, getWatchList]);

  // --- Item Actions ---
  const handleRemoveItem = useCallback(
    async (id) => {
      if (!user?.uid) return;
      const originalWatchlist = [...watchlist];
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
      try {
        await removeFromWatchlist(user.uid, id);
      } catch (error) {
        console.error("Failed to remove item:", error);
        setWatchlist(originalWatchlist);
      }
    },
    [user?.uid, removeFromWatchlist, watchlist]
  );

  const handleToggleWatched = useCallback(
    async (id) => {
      if (!user?.uid) return;
      const itemIndex = watchlist.findIndex((item) => item.id === id);
      if (itemIndex === -1) return;
      const item = watchlist[itemIndex];
      const newStatus = !item.watched;
      const originalWatchlist = [...watchlist];
      setWatchlist((prev) =>
        prev.map((i) => (i.id === id ? { ...i, watched: newStatus } : i))
      );
      try {
        await updateWatchItem(user.uid, { ...item, watched: newStatus });
      } catch (error) {
        console.error("Failed to update watched status:", error);
        setWatchlist(originalWatchlist);
      }
    },
    [user?.uid, updateWatchItem, watchlist]
  );

  // --- Filtering and Sorting Logic ---
  const filteredWatchlist = watchlist.filter((item) => {
    /* ... same ... */ if (filterBy === "All") return true;
    if (filterBy === "Movies") return item.type === "movie";
    if (filterBy === "TV Shows") return item.type === "tv";
    if (filterBy === "Watched") return item.watched;
    if (filterBy === "Unwatched") return !item.watched;
    return true;
  });
  const sortedWatchlist = [...filteredWatchlist].sort((a, b) => {
    /* ... same ... */ switch (sortBy) {
      case "dateAdded":
        const dateA = a.dateAdded?.toDate
          ? a.dateAdded.toDate().getTime()
          : typeof a.dateAdded === "number"
          ? a.dateAdded
          : 0;
        const dateB = b.dateAdded?.toDate
          ? b.dateAdded.toDate().getTime()
          : typeof b.dateAdded === "number"
          ? b.dateAdded
          : 0;
        return dateB - dateA;
      case "name":
        return (a.title || a.name || "").localeCompare(b.title || b.name || "");
      case "rating":
        return (b.vote_average || 0) - (a.vote_average || 0);
      default:
        return 0;
    }
  });

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
  const emptyStateVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10 },
  };

  // --- Helper functions for menu labels/icons ---
  const getSortInfo = (key) => {
    /* ... same ... */ switch (key) {
      case "name":
        return { label: "Name", icon: MdTitle };
      case "rating":
        return { label: "Rating", icon: MdGrade };
      case "dateAdded":
      default:
        return { label: "Added", icon: MdAccessTime };
    }
  };
  const getFilterInfo = (key) => {
    /* ... same ... */ switch (key) {
      case "Movies":
        return { label: "Movies", icon: MdMovieFilter };
      case "TV Shows":
        return { label: "TV Shows", icon: MdLiveTv };
      case "Watched":
        return { label: "Watched", icon: MdPlaylistAddCheck };
      case "Unwatched":
        return { label: "Unwatched", icon: MdPlaylistRemove };
      case "All":
      default:
        return { label: "All", icon: FaBookmark };
    }
  };

  // --- RENDER ---

  // Loading State
  if (loading && watchlist.length === 0) {
    return (
      <Box bg={baseBg} minHeight="100vh" pt="110px" pb={16}>
        {" "}
        <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
          {" "}
          <Flex align="center" mb={8}>
            {" "}
            <Icon
              as={FaBookmark}
              color={accentColor}
              w={7}
              h={7}
              mr={3.5}
            />{" "}
            <Heading as="h1" size="xl" color="white" fontFamily={headingFont}>
              {" "}
              My Watchlist{" "}
            </Heading>{" "}
          </Flex>{" "}
          <Flex justify="center" align="center" minH="50vh">
            {" "}
            <Spinner
              size="xl"
              thickness="4px"
              speed="0.7s"
              color={accentColor}
              emptyColor="rgba(255,255,255,0.1)"
            />{" "}
          </Flex>{" "}
        </Container>{" "}
      </Box>
    );
  }

  // Initial Empty State
  if (!loading && watchlist.length === 0) {
    return (
      <Box bg={baseBg} minHeight="100vh" pt="110px" pb={16}>
        {" "}
        <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
          {" "}
          <MotionFlex
            variants={emptyStateVariants}
            initial="initial"
            animate="animate"
            direction="column"
            align="center"
            justify="center"
            minH="70vh"
            textAlign="center"
          >
            {" "}
            <MotionBox
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 150,
                damping: 10,
              }}
              mb={6}
            >
              {" "}
              <Icon as={FaBookmark} w={16} h={16} color={accentColor} />{" "}
            </MotionBox>{" "}
            <MotionHeading
              as="h2"
              size="xl"
              color="white"
              fontFamily={headingFont}
              mb={4}
            >
              {" "}
              Watchlist is Empty{" "}
            </MotionHeading>{" "}
            <MotionText fontSize="lg" color={mutedTextColor} maxW="sm" mb={8}>
              {" "}
              Looks like you haven't added anything yet. Use the{" "}
              <Icon as={FaBookmark} verticalAlign="middle" mx={1} /> icon on
              movie or TV show pages to save them here.{" "}
            </MotionText>{" "}
            <MotionBox w={["180px", "200px"]}>
              {" "}
              <Link to="/" style={{ width: "100%" }}>
                {" "}
                <SketchButton primary>
                  {" "}
                  <Flex align="center" gap={2}>
                    {" "}
                    <Icon as={FaPlay} /> Discover Now{" "}
                  </Flex>{" "}
                </SketchButton>{" "}
              </Link>{" "}
            </MotionBox>{" "}
          </MotionFlex>{" "}
        </Container>{" "}
      </Box>
    );
  }

  // --- Main Watchlist Render ---
  return (
    <Box bg={baseBg} minHeight="100vh" pt="110px" pb={16}>
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        {/* --- Header --- */}
        <MotionFlex
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          justify="space-between"
          align="stretch"
          mb={8}
          wrap="wrap"
          gap={{ base: 4, md: 6 }}
        >
          <Flex align="center" mr={{ md: 4 }}>
            {" "}
            <Icon
              as={FaBookmark}
              color={accentColor}
              w={7}
              h={7}
              mr={3.5}
            />{" "}
            <Heading
              as="h1"
              size="xl"
              color="white"
              fontFamily={headingFont}
              whiteSpace="nowrap"
            >
              {" "}
              My Watchlist{" "}
            </Heading>{" "}
          </Flex>
          {/* --- Controls --- */}
          <HStack
            spacing={2}
            flexGrow={{ base: 1, md: 0 }}
            justify={{ base: "flex-end", md: "initial" }}
          >
            {/* Filter Menu */}
            <Menu.Root placement="bottom-end" gutter={12}>
              <Menu.Trigger>
                <Box w={{ base: "40px", sm: "auto" }}>
                  <SketchButton size="sm" aria-label={`Filter by ${filterBy}`}>
                    <Flex align="center" gap={1.5}>
                      <Icon as={getFilterInfo(filterBy).icon} />{" "}
                      <Text display={{ base: "none", sm: "inline" }}>
                        {" "}
                        {getFilterInfo(filterBy).label}{" "}
                      </Text>{" "}
                    </Flex>{" "}
                  </SketchButton>{" "}
                </Box>{" "}
              </Menu.Trigger>{" "}
              <Menu.Positioner zIndex={20}>
                {" "}
                <Menu.Content
                  bg={cardBg}
                  borderColor={borderColor}
                  borderWidth="1px"
                  borderRadius="none"
                  minW="170px"
                  boxShadow="dark-lg"
                  fontFamily={headingFont}
                  fontSize="sm"
                  py={1}
                >
                  {" "}
                  {["All", "Movies", "TV Shows", "Watched", "Unwatched"].map(
                    (filterOpt) => (
                      <Menu.Item
                        key={filterOpt}
                        onClick={() => setFilterBy(filterOpt)}
                        bg={
                          filterBy === filterOpt
                            ? accentColor + "20"
                            : "transparent"
                        }
                        color={filterBy === filterOpt ? accentColor : "white"}
                        _hover={{ bg: accentColor + "40", color: "black" }}
                        _focus={{
                          bg: accentColor + "40",
                          color: "black",
                          outline: "none",
                        }}
                        fontWeight={filterBy === filterOpt ? "bold" : "normal"}
                        py={2}
                        px={3}
                        borderRadius="none"
                      >
                        {" "}
                        <Flex align="center" justify="space-between" w="100%">
                          {" "}
                          <Flex align="center" gap={2}>
                            <Icon as={getFilterInfo(filterOpt).icon} />
                            {getFilterInfo(filterOpt).label}
                          </Flex>{" "}
                          {filterBy === filterOpt && (
                            <Icon as={FaCheck} color={accentColor} />
                          )}{" "}
                        </Flex>{" "}
                      </Menu.Item>
                    )
                  )}{" "}
                </Menu.Content>{" "}
              </Menu.Positioner>{" "}
            </Menu.Root>
            {/* Sort Menu */}
            <Menu.Root placement="bottom-end" gutter={12}>
              <Menu.Trigger>
                <Box w={{ base: "40px", sm: "auto" }}>
                  <SketchButton size="sm" aria-label={`Sort by ${sortBy}`}>
                    {" "}
                    <Flex align="center" gap={1.5}>
                      {" "}
                      <Icon as={getSortInfo(sortBy).icon} />{" "}
                      <Text display={{ base: "none", sm: "inline" }}>
                        {" "}
                        Sort: {getSortInfo(sortBy).label}{" "}
                      </Text>{" "}
                    </Flex>{" "}
                  </SketchButton>{" "}
                </Box>{" "}
              </Menu.Trigger>{" "}
              <Menu.Positioner zIndex={20}>
                {" "}
                <Menu.Content
                  bg={cardBg}
                  borderColor={borderColor}
                  borderWidth="1px"
                  borderRadius="none"
                  minW="170px"
                  boxShadow="dark-lg"
                  fontFamily={headingFont}
                  fontSize="sm"
                  py={1}
                >
                  {" "}
                  {["dateAdded", "name", "rating"].map((sortOpt) => (
                    <Menu.Item
                      key={sortOpt}
                      onClick={() => setSortBy(sortOpt)}
                      bg={
                        sortBy === sortOpt ? accentColor + "20" : "transparent"
                      }
                      color={sortBy === sortOpt ? accentColor : "white"}
                      _hover={{ bg: accentColor + "40", color: "black" }}
                      _focus={{
                        bg: accentColor + "40",
                        color: "black",
                        outline: "none",
                      }}
                      fontWeight={sortBy === sortOpt ? "bold" : "normal"}
                      py={2}
                      px={3}
                      borderRadius="none"
                    >
                      {" "}
                      <Flex align="center" justify="space-between" w="100%">
                        {" "}
                        <Flex align="center" gap={2}>
                          <Icon as={getSortInfo(sortOpt).icon} />
                          {getSortInfo(sortOpt).label}
                        </Flex>{" "}
                        {sortBy === sortOpt && (
                          <Icon as={FaCheck} color={accentColor} />
                        )}{" "}
                      </Flex>{" "}
                    </Menu.Item>
                  ))}{" "}
                </Menu.Content>{" "}
              </Menu.Positioner>{" "}
            </Menu.Root>{" "}
            {/* View Toggle */}
            <HStack
              spacing={1}
              bg={cardBg}
              p={0.5}
              borderRadius="none"
              border="1px solid"
              borderColor={borderColor}
              h="full"
              alignItems="stretch"
            >
              <Box flex={1} h="full">
                <SketchButton
                  size="sm"
                  primary={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid View"
                  h="full"
                  minH={8}
                >
                  <Icon as={FaTh} />
                </SketchButton>
              </Box>
              <Box flex={1} h="full">
                <SketchButton
                  size="sm"
                  primary={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  aria-label="List View"
                  h="full"
                  minH={8}
                >
                  <Icon as={FaList} />
                </SketchButton>
              </Box>
            </HStack>
          </HStack>
        </MotionFlex>

        {/* --- Main Content --- */}
        <AnimatePresence mode="wait" initial={false}>
          {sortedWatchlist.length > 0 ? (
            viewMode === "grid" ? (
              // --- Grid View Rendering ---
              <MotionSimpleGrid
                key="grid-view"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
                gap={4}
                pb={6}
              >
                {sortedWatchlist.map((item) => (
                  <WatchlistItemCard
                    key={`${item.type}-${item.id}-grid-card`}
                    item={item}
                    accentColor={accentColor}
                    cardBg={cardBg}
                    borderColor={borderColor}
                    mutedTextColor={mutedTextColor}
                    headingFont={headingFont}
                    // --- CORRECTED PROP PASSING ---
                    onToggleWatched={handleToggleWatched}
                    onRemove={handleRemoveItem}
                    // ------------------------------
                  />
                ))}
              </MotionSimpleGrid>
            ) : (
              // --- List View Rendering ---
              <MotionVStack
                key="list-view"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                gap={0}
                align="stretch"
                pb={6}
              >
                {sortedWatchlist.map((item) => (
                  <WatchlistItemRow
                    key={`${item.type}-${item.id}-list-row`}
                    item={item}
                    accentColor={accentColor}
                    cardBg={cardBg}
                    borderColor={borderColor}
                    mutedTextColor={mutedTextColor}
                    headingFont={headingFont}
                    // --- CORRECTED PROP PASSING ---
                    onToggleWatched={handleToggleWatched}
                    onRemove={handleRemoveItem}
                    // ------------------------------
                  />
                ))}
              </MotionVStack>
            )
          ) : (
            // --- Empty Filtered State ---
            !loading && (
              <MotionFlex
                key="no-results-view"
                variants={emptyStateVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                justify="center"
                align="center"
                minH="30vh"
                textAlign="center"
                mt={8}
                direction="column"
              >
                <Icon
                  as={MdFilterList}
                  w={12}
                  h={12}
                  color={mutedTextColor}
                  mb={4}
                />
                <Heading
                  size="md"
                  color="whiteAlpha.800"
                  fontFamily={headingFont}
                  mb={2}
                >
                  No Matches Found
                </Heading>
                <Text color={mutedTextColor} fontFamily={headingFont}>
                  {" "}
                  Your watchlist doesn't have items matching '
                  {getFilterInfo(filterBy).label}'.{" "}
                </Text>
              </MotionFlex>
            )
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}

export default Watchlist;
