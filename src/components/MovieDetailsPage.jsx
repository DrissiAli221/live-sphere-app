import React, { useEffect, useState, useRef } from "react";
import { useParams, Link as RouterLink } from "react-router-dom"; // Added RouterLink

// --- Chakra UI Primitive Imports ---
import {
  Box,
  Flex,
  Container,
  Image,
  Text,
  VStack,
  Heading,
  Spinner,
  Badge, // Needed for MovieDetailsPage badges
  SimpleGrid, // Needed for MovieDetailsPage layouts
} from "@chakra-ui/react";

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from "framer-motion";

// --- Service/Util/Component Imports ---
import {

  baseImageW500,
} from "@/services/api"; // Adjust path
// Import the themed child components:

// --- Icon Imports ---
import {
  FaPlay,
  FaFilm,
  FaRegDotCircle,
  FaMoneyBillWave,
  FaGlobe,
  FaCalendarAlt as FaCalendarAltOriginal, // Keep original if needed
  FaChevronLeft, // If used by children
  FaChevronRight, // If used by children
} from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { MdBookmarkAdd, MdBookmarkAdded, MdShare } from "react-icons/md";

// ========================================================================
// --- CUSTOM THEME COMPONENTS (Assume definitions available) ---
// ========================================================================
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionHeading = motion(Heading);

// --- Re-paste SketchButton, SquigglyLine, shadowVariants ---
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
    <MotionDiv
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
  ...rest
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
        {...rest}
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
  <MotionDiv
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
      <MotionPath
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
  </MotionDiv>
);
const shadowVariants = {
  rest: { opacity: 0.6, x: 2, y: 2, transition: { duration: 0.2 } },
  hover: { opacity: 0.9, x: 4, y: 4, transition: { duration: 0.2 } },
};

// In MovieDetailsPage.jsx (or wherever it's defined)
// Make sure it accepts theme props and details directly

function MovieDetailsPage({
  movieId,
  details,
  accentColor,
  cardBg,
  borderColor,
  mutedTextColor,
  headingFont,
}) {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch only Similar Movies & Videos here
  useEffect(() => {
    const fetchData = async () => {
      if (!movieId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [similarData, videosData] = await Promise.all([
          fetchSimilarMovies(movieId),
          fetchMovieVideos(movieId),
        ]);
        setSimilarMovies(
          similarData?.results?.filter((m) => m.poster_path).slice(0, 6) || []
        );
        setVideos(
          videosData?.results
            ?.filter(
              (v) =>
                v.site === "YouTube" &&
                (v.type === "Trailer" || v.type === "Teaser")
            )
            .slice(0, 3) || []
        );
      } catch (error) {
        console.error("Error fetching movie sub-data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  // --- Themed Section Heading (Copied for consistency) ---
  const SectionHeading = ({ children }) => (
    <Box mb={6} display="inline-block" position="relative">
      {" "}
      <Heading
        as="h2"
        size="lg"
        color="white"
        fontFamily={headingFont}
        textTransform="uppercase"
        letterSpacing="widest"
      >
        {" "}
        {children}{" "}
      </Heading>{" "}
      <Box position="absolute" bottom="-8px" left="0" w="50px">
        <SquigglyLine color={accentColor} thickness={2} dasharray="4,2" />{" "}
      </Box>{" "}
    </Box>
  );
  // --- Themed Video Card (Copied) ---
  const VideoCard = ({ video }) => {
    const [loading, setLoading] = useState(true);
    return (
      <MotionBox
        bg={cardBg}
        borderRadius="none"
        overflow="hidden"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {" "}
        <Box position="relative" paddingTop="56.25%" bg="blackAlpha.400">
          {" "}
          {loading && (
            <Flex position="absolute" inset={0} align="center" justify="center">
              <Spinner size="md" color={accentColor} thickness="2px" />
            </Flex>
          )}{" "}
          <iframe
            src={`https://www.youtube.com/embed/${video.key}`}
            title={video.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              opacity: loading ? 0 : 1,
              transition: "opacity 0.3s",
            }}
            onLoad={() => setLoading(false)}
          />{" "}
        </Box>{" "}
        <Box p={3}>
          {" "}
          <Text
            color="white"
            fontWeight="bold"
            fontSize="sm"
            noOfLines={2}
            fontFamily={headingFont}
            letterSpacing="wide"
          >
            {video.name}
          </Text>{" "}
          <Badge
            bg={accentColor}
            color="black"
            borderRadius="none"
            px={2}
            py={0.5}
            fontSize="xs"
            fontWeight="bold"
            mt={2}
          >
            {video.type}
          </Badge>{" "}
        </Box>{" "}
      </MotionBox>
    );
  };
  // --- Themed Similar Movie Card (Copied) ---
  const SimilarMovieCard = ({ movie }) => (
    <Link
      as={RouterLink}
      to={`/details/movie/${movie.id}`}
      _hover={{ textDecoration: "none" }}
    >
      {" "}
      <MotionBox
        bg={cardBg}
        borderRadius="none"
        overflow="hidden"
        border="1px solid"
        borderColor={borderColor}
        height="100%"
        display="flex"
        flexDirection="column"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}
        transition={{ duration: 0.2 }}
      >
        {" "}
        <Box position="relative" width="100%" pt="150%" bg="blackAlpha.300">
          {movie.poster_path ? (
            <Image
              src={`${baseImageW500}/${movie.poster_path}`}
              alt={movie.title}
              position="absolute"
              inset={0}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          ) : (
            <Flex position="absolute" inset={0} align="center" justify="center">
              <FaFilm color={mutedTextColor} />
            </Flex>
          )}{" "}
        </Box>{" "}
        <Box
          p={3}
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <VStack align="start" spacing={1}>
            <Text
              color="white"
              fontWeight="bold"
              fontSize="sm"
              noOfLines={2}
              fontFamily={headingFont}
            >
              {movie.title}
            </Text>
            <Text color={mutedTextColor} fontSize="xs">
              {movie.release_date?.substring(0, 4) || "N/A"}
            </Text>
          </VStack>
          {movie.vote_average > 0 && (
            <Badge
              bg={accentColor}
              color="black"
              borderRadius="none"
              px={2}
              py={0.5}
              fontSize="xs"
              fontWeight="bold"
              mt={2}
              alignSelf="flex-start"
            >
              {movie.vote_average.toFixed(1)}
            </Badge>
          )}
        </Box>{" "}
      </MotionBox>{" "}
    </Link>
  );
  // --- Movie Fact Item (Copied) ---
  const MovieFactItem = ({ icon: IconComponent, label, value }) => (
    <Flex align="center">
      <IconComponent
        style={{
          color: accentColor,
          marginRight: "12px",
          fontSize: "1.1em",
          flexShrink: 0,
        }}
      />
      <Text color="white" fontSize="sm">
        <Text as="span" fontWeight="bold" color="gray.300" mr={1}>
          {label}:
        </Text>
        {value}
      </Text>
    </Flex>
  );
  // --- Production Company Card (Copied) ---
  const ProductionCompanyCard = ({ company }) => (
    <Flex
      key={company.id}
      direction="column"
      align="center"
      bg={cardBg}
      p={3}
      borderRadius="none"
      border="1px solid"
      borderColor={borderColor}
      minH="100px"
      justify="center"
    >
      {" "}
      {company.logo_path ? (
        <Image
          src={`${baseImageW500}/${company.logo_path}`}
          alt={company.name}
          maxH="40px"
          objectFit="contain"
          mb={2}
          filter={
            company.logo_path.endsWith(".svg")
              ? "invert(1) brightness(2)"
              : "none"
          }
        />
      ) : (
        <Box
          height="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={2}
        >
          <FaFilm color={mutedTextColor} size="24px" />
        </Box>
      )}{" "}
      <Text
        color="white"
        fontSize="xs"
        textAlign="center"
        fontWeight="medium"
        fontFamily={headingFont}
        noOfLines={2}
      >
        {company.name}
      </Text>{" "}
    </Flex>
  );

  // Main MovieDetailsPage Render
  if (!details) return null; // Handled by parent, but good practice

  return (
    // This VStack replaces the one in the parent component for movie-specific details
    <VStack spacing={12} align="stretch" width="100%">
      {/* --- Movie Facts Section --- */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={{ base: 8, md: 10, lg: 16 }}
        width="100%"
      >
        <VStack flex="1" spacing={3} align="flex-start">
          <SectionHeading>Facts</SectionHeading>
          {details.release_date && (
            <MovieFactItem
              icon={BsCalendarDate}
              label="Release"
              value={new Date(details.release_date).toLocaleDateString()}
            />
          )}
          {details.budget > 0 && (
            <MovieFactItem
              icon={FaMoneyBillWave}
              label="Budget"
              value={`$${details.budget.toLocaleString()}`}
            />
          )}
          {details.revenue > 0 && (
            <MovieFactItem
              icon={FaMoneyBillWave}
              label="Revenue"
              value={`$${details.revenue.toLocaleString()}`}
            />
          )}
          {details.original_language && (
            <MovieFactItem
              icon={FaGlobe}
              label="Language"
              value={details.original_language.toUpperCase()}
            />
          )}
          {details.status && (
            <MovieFactItem
              icon={FaRegDotCircle}
              label="Status"
              value={details.status}
            />
          )}
        </VStack>
        {details.production_companies?.length > 0 && (
          <VStack flex="1" spacing={4} align="flex-start">
            <SectionHeading>Production</SectionHeading>
            <SimpleGrid columns={[2, 2, 3]} spacing={3} width="100%">
              {details.production_companies.map((company) => (
                <ProductionCompanyCard key={company.id} company={company} />
              ))}
            </SimpleGrid>
          </VStack>
        )}
      </Flex>

      {/* --- Videos Section --- */}
      {videos.length > 0 && (
        <VStack spacing={6} align="stretch" w="100%">
          <SectionHeading>Trailers & Videos</SectionHeading>
          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
              lg: videos.length === 1 ? 1 : videos.length === 2 ? 2 : 3,
            }}
            spacing={4}
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* --- Similar Movies Section --- */}
      {similarMovies.length > 0 && (
        <VStack spacing={6} align="stretch" w="100%">
          <SectionHeading>Similar Movies</SectionHeading>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={4}>
            {similarMovies.map((movie) => (
              <SimilarMovieCard key={movie.id} movie={movie} />
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* Sub-section Loading */}
      {isLoading && (
        <Flex justify="center" py={10}>
          {" "}
          <Spinner size="lg" color={accentColor} />{" "}
        </Flex>
      )}
    </VStack>
  );
}


export default MovieDetailsPage;