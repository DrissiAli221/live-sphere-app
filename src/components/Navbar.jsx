import React, { useState, useEffect } from "react";

// --- Chakra UI Imports ---
import {
  Box,
  Flex,
  Image,
  Text,
  Link as ChakraLink,
  Spinner,
  Menu, // Chakra Menu is still used for the dropdown logic
  Portal,
  HStack, // Added HStack for easier layout in dropdown trigger
} from "@chakra-ui/react";

// --- Framer Motion Import ---
import { motion } from "framer-motion";

// --- React Router Imports ---
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom"; // Added useLocation

// --- Assets & Context Imports ---
import Logo from "@/assets/Logo11.svg"; // Ensure path is correct
import Name from "@/assets/Name.svg"; // Ensure path is correct
import { useAuth } from "@/context/AuthProvider"; // Your Auth context

// --- Icon Imports ---
import {
  LogOut,
  Settings,
  User,
  List,
  ChevronDown,
  MoreVertical,
  Mail,
} from "lucide-react"; // Added Mail just in case

// --- Motion Components ---
const MotionFlex = motion(Flex);
const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionLink = motion(ChakraLink);
const MotionDiv = motion.div;
const MotionPath = motion.path;

// --- Constants ---
const ACCENT_COLOR = "#FFEC44";
const BORDER_COLOR_DARK = "#333";
const BORDER_COLOR_LIGHT = "#444";
const BG_MAIN = "#0D0D0D";
const BG_SECONDARY = "#141414";
const BG_ACCENT_AREA = "#000000";
const BG_HOVER_LIGHT = "rgba(255, 255, 255, 0.05)";
const ACCENT_GLOW = `0 0 8px 1px ${ACCENT_COLOR}40`;
const mutedTextColor = "gray.400"; // Added for consistency

// --- Animation Variants ---
const logoVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: -3,
    transition: { duration: 0.2, type: "spring", stiffness: 300 },
  },
};
const sketchHoverVariants = {
  initial: { x: 0, y: 0, filter: "none" },
  hover: {
    x: "1px",
    y: "-1px",
    filter: `drop-shadow(1px 1px 0 ${ACCENT_COLOR}60)`,
    transition: { duration: 0.1, ease: "linear" },
  },
};
const navItemVariant = {
  initial: { y: -1, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
      delay: 0.9,
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
};
const navContainerVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};

// --- Squiggly Line Component ---
const SquigglyLine = ({ color = `${ACCENT_COLOR}CC`, delay = 0 }) => (
  <MotionDiv
    initial={{ width: "0%" }}
    animate={{ width: "100%" }}
    transition={{ duration: 0.8, delay }}
    style={{ position: "relative", marginTop: "2px", lineHeight: 0 }}
  >
    <svg
      width="190px"
      height="4"
      viewBox="0 0 300 4"
      preserveAspectRatio="none"
    >
      <MotionPath
        d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="3,2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: delay + 0.7 }}
      />
    </svg>
  </MotionDiv>
);

// --- Frame Component for Logo/Name ---
const SquigglyFrame = ({
  children,
  isHovered,
  width = "100%",
  height = "70%",
}) => (
  <Box position="absolute" width={width} height={height} top="15%" left="0">
    {/* Top */}
    <Box
      position="absolute"
      top="-1.5"
      left="0"
      right="-4"
      transform="rotate(180deg)"
    >
      {" "}
      <SquigglyLine
        color={`rgba(255, 236, 68, ${isHovered ? 0.9 : 0.5})`}
      />{" "}
    </Box>
    {/* Bottom */}
    <Box position="absolute" bottom="1" left="0" right="-5">
      {" "}
      <SquigglyLine
        color={`rgba(255, 236, 68, ${isHovered ? 0.9 : 0.5})`}
        delay={0.2}
      />{" "}
    </Box>
    {/* Left */}
    <Box
      position="absolute"
      top="-4"
      left="3"
      bottom="0"
      height="100%"
      transform="rotate(90deg)"
      transformOrigin="top left"
    >
      {" "}
      <SquigglyLine
        color={`rgba(255, 236, 68, ${isHovered ? 0.9 : 0.5})`}
        delay={0.4}
      />{" "}
    </Box>
    {/* Right */}
    <Box
      position="absolute"
      top="-4"
      right="-1"
      bottom="0"
      height="100%"
      transform="rotate(-90deg)"
      transformOrigin="top right"
    >
      {" "}
      <SquigglyLine
        color={`rgba(255, 236, 68, ${isHovered ? 0.9 : 0.5})`}
        delay={0.6}
      />{" "}
    </Box>
    {children}
  </Box>
);

// --- Data for Navigation --- (Copied from original)
const topRowItemsData = [
  {
    id: 1,
    text: "🔥 Trending Now: Top Movies & Shows",
    href: "#trending",
    px: 4,
  },
  { id: 2, text: "🎬 New Releases This Week", href: "#new-releases", px: 4 },
  { id: 3, text: "🍿 Coming Soon & Just Added", href: "#coming-soon", px: 4 },
];

const navLinks = [
  { id: "discover", text: "DISCOVER", to: "/" },
  { id: "movies", text: "MOVIES", to: "/movies" },
  { id: "tvshows", text: "TV SHOWS", to: "/shows" },
  { id: "search", text: "SEARCH", to: "/search" },
  { id: "mylist", text: "MY LIST", to: "/watchlist" },
];

// --- Reusable Components ---

// Top Row Item
const TopRowInfoItem = ({ item, isLastInfoItem }) => (
  <MotionLink
    as={RouterLink}
    to={item.href}
    display="flex"
    alignItems="center"
    px={item.px || 4}
    flexShrink={0}
    flexGrow={isLastInfoItem ? 1 : 0}
    minWidth={isLastInfoItem ? "100px" : "auto"}
    h="full"
    position="relative"
    zIndex="1"
    fontFamily="'Courier New', monospace"
    letterSpacing="tight"
    borderRight={isLastInfoItem ? "none" : `1px solid ${BORDER_COLOR_LIGHT}`}
    _hover={{
      textDecoration: "none",
      bg: `rgba(255, 236, 68, 0.1)`,
      color: "white",
    }}
    _focus={{ outline: "none", boxShadow: "none" }}
    _focusVisible={{
      outline: `1px dashed ${ACCENT_COLOR}`,
      outlineOffset: "2px",
    }}
    transition="background-color 0.1s linear, color 0.1s linear"
    color="whiteAlpha.700"
    fontSize="12px"
    textTransform="uppercase"
  >
    <Text noOfLines={1} overflow="hidden" textOverflow="ellipsis">
      {item.text}
    </Text>
  </MotionLink>
);

// Nav Link Item
const NavLinkItem = ({ item, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionLink
      as={RouterLink}
      to={item.to}
      px={5}
      h="full"
      display="flex"
      alignItems="center"
      cursor="pointer"
      position="relative"
      color={isHovered || isActive ? "white" : "whiteAlpha.800"}
      fontWeight="bold"
      fontFamily="'Courier New', monospace"
      letterSpacing="1.5px"
      fontSize="14px"
      textTransform="uppercase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{ textDecoration: "none" }}
      _focus={{ outline: "none", boxShadow: "none" }}
      _focusVisible={{
        outline: `1px dashed ${ACCENT_COLOR}`,
        outlineOffset: "-2px",
      }}
      variants={navItemVariant}
      transition="color 0.15s ease-in-out"
    >
      <Box zIndex={1} position="relative" as="span">
        {item.text}
        <MotionBox
          position="absolute"
          bottom="-5px"
          left="-2px"
          right="-2px"
          height="2px"
          bg={ACCENT_COLOR}
          initial={{ scaleX: 0, boxShadow: "none" }}
          animate={{
            scaleX: isHovered || isActive ? 1 : 0,
            boxShadow: isHovered || isActive ? ACCENT_GLOW : "none",
          }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          style={{
            transformOrigin: isHovered ? "center" : isActive ? "left" : "left",
          }}
        />
      </Box>
    </MotionLink>
  );
};

// Sketch Button
const SketchButton = ({ to, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <MotionLink
      as={RouterLink}
      to={to}
      display="flex"
      w="100%"
      h="calc(100% - 16px)"
      m="auto"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      fontWeight="bold"
      letterSpacing="wider"
      color="black"
      bg={ACCENT_COLOR}
      position="relative"
      zIndex="2"
      fontFamily="'Courier New', monospace"
      fontSize="13px"
      textTransform="uppercase"
      border="2px solid black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variants={sketchHoverVariants}
      initial="initial"
      whileHover="hover"
      style={{
        boxShadow: isHovered
          ? `4px 4px 0 0 black, ${ACCENT_GLOW}`
          : "3px 3px 0 0 black",
      }}
      transition="box-shadow 0.1s linear, transform 0.1s linear, background-color 0.1s linear"
      _hover={{ textDecoration: "none", bg: "#f5e03b" }}
      _focus={{ outline: "none", boxShadow: "none !important" }}
      _focusVisible={{ outline: "2px solid black", outlineOffset: "2px" }}
      _active={{
        transform: "translate(1px, 1px)",
        boxShadow: "2px 2px 0 0 black",
      }}
    >
      <Text position="relative" zIndex="1">
        {children}
      </Text>
    </MotionLink>
  );
};

// Loading Button
const LoadingButton = () => (
  <Box
    display="flex"
    w="100%"
    h="calc(100% - 16px)"
    m="auto"
    alignItems="center"
    justifyContent="center"
    fontWeight="bold"
    letterSpacing="wider"
    color="blackAlpha.800"
    bg="#ded16f"
    position="relative"
    zIndex="2"
    fontFamily="'Courier New', monospace"
    fontSize="13px"
    textTransform="uppercase"
    border="2px solid black"
    opacity="0.8"
    boxShadow="3px 3px 0 0 black"
  >
    <Spinner size="sm" color="blackAlpha.700" mr={2} thickness="2px" />
    LOADING...
  </Box>
);

// User Profile Dropdown (REVISED Compact Trigger)
const UserProfileDropdown = ({ user, onLogout }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const navigate = useNavigate();
  const menuRef = React.useRef();

  const userDisplayName =
    user?.displayName || user?.email?.split("@")[0] || "User";
  const userPfp = user?.photoURL;
  const userInitials =
    userDisplayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  const handleMenuNavigation = (path) => navigate(path);

  const menuBg = "#1a1a1a";
  const menuBorderColor = BORDER_COLOR_LIGHT;
  const menuItemHoverBg = BG_HOVER_LIGHT;
  const menuItemFocusBg = `rgba(255, 236, 68, 0.15)`;
  const menuItemTextColor = "whiteAlpha.800";
  const menuItemHoverTextColor = "white";
  const menuSeparatorColor = BORDER_COLOR_LIGHT;
  const menuRedColor = "red.300";
  const menuRedHoverBg = "rgba(255, 0, 0, 0.1)";
  const menuRedHoverColor = "red.200";

  return (
    <Menu.Root placement="bottom-end" gutter={8} strategy="fixed">
      <Menu.Trigger
        _focus={{
          outline: "2px dashed rgba(255, 236, 68, 0.4)",
          outlineOffset: "2px",
        }}
      >
        <Box
          ref={menuRef}
          display="flex"
          alignItems="center"
          height="40px"
          padding="0 12px"
          cursor="pointer"
          position="relative"
          backgroundColor={isButtonHovered ? "#FFEC44" : "transparent"}
          border="2px solid #000"
          borderRadius="0"
          transition="all 0.4s ease"
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          transform={isButtonHovered ? "translate(2px, -2px)" : "none"}
        //   boxShadow={isButtonHovered ? "3px 3px 0 #000" : "none"}
        >
          {/* Avatar */}
          <Box
            width="28px"
            height="28px"
            border="2px solid #000"
            borderRadius="0"
            overflow="hidden"
            backgroundColor="#2a2a2a"
            marginRight="10px"
          >
            {userPfp ? (
              <Image
                src={userPfp}
                alt="User Avatar"
                width="100%"
                height="100%"
                objectFit="cover"
              />
            ) : (
              <Flex
                width="100%"
                height="100%"
                alignItems="center"
                justifyContent="center"
                backgroundColor="#FFEC44"
                color="black"
                fontSize="14px"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {userInitials}
              </Flex>
            )}
          </Box>

          {/* Username */}
          <Text
            color={isButtonHovered ? "#000" : "#fff"}
            fontSize="14px"
            fontWeight="bold"
            fontFamily="monospace"
            display={{ base: "none", md: "block" }}
          >
            {userDisplayName}
          </Text>

          {/* Arrow */}
          <ChevronDown
            size={16}
            color={isButtonHovered ? "#000" : "#fff"}
            style={{
              marginLeft: "auto",
            }}
          />
        </Box>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner zIndex={1500}>
          <Menu.Content
            bg={menuBg}
            border="3px solid rgba(0,0,0,0.9)"
            boxShadow="8px 8px 0 rgba(0,0,0,0.9)"
            minWidth="240px"
            fontFamily="'Courier New', monospace"
            fontSize="14px"
            borderRadius="2px"
            position="relative"
            transform="translate(-2px, 4px)"
            overflow="hidden"
            px={4} // Add horizontal padding
          >
            {/* Header area */}
            <Box px={4} py={2} position="relative">
              <Text
                fontSize="xs"
                color="whiteAlpha.700"
                fontWeight="bold"
                fontFamily="'Courier New', monospace"
                mb={1}
              >
                Signed in as{" "}
                <span
                  style={{
                    color: ACCENT_COLOR,
                    fontWeight: "bold",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {userDisplayName}
                </span>
              </Text>
            </Box>

            <Box mb={1.5}>
              <SquigglyLine color={`${ACCENT_COLOR}90`} delay={-0.4} />
            </Box>

            {/* Menu items with enhanced hover effects */}
            <Box mb={2}>
              <Menu.Item
                onClick={() => handleMenuNavigation("/profile")}
                color={menuItemTextColor}
                bg="transparent"
                _hover={{
                  bg: menuItemHoverBg,
                  color: menuItemHoverTextColor,
                  transform: "translate(2px, -2px)",
                  boxShadow: `4px 4px 0 rgba(0,0,0,0.7)`,
                  borderLeft: `3px solid ${ACCENT_COLOR}`,
                }}
                borderRadius="1px"
                _focus={{ bg: menuItemFocusBg }}
                py={2.5}
                mb={1}
                _focusVisible={{ outline: "none" }}
                transition="all 0.15s ease"
              >
                <Flex align="center">
                  <User size={18} />
                  <Text
                    ml={3}
                    fontWeight="bold"
                    fontFamily="'Courier New', monospace"
                  >
                    My Profile
                  </Text>
                </Flex>
              </Menu.Item>

              <Menu.Item
                onClick={() => handleMenuNavigation("/watchlist")}
                color={menuItemTextColor}
                bg="transparent"
                _hover={{
                  bg: menuItemHoverBg,
                  color: menuItemHoverTextColor,
                  transform: "translate(2px, -2px)",
                  boxShadow: `4px 4px 0 rgba(0,0,0,0.7)`,
                  borderLeft: `3px solid ${ACCENT_COLOR}`,
                }}
                borderRadius="1px"
                _focus={{ bg: menuItemFocusBg }}
                py={2.5}
                mb={1}
                _focusVisible={{ outline: "none" }}
                transition="all 0.15s ease"
              >
                <Flex align="center">
                  <List size={18} />
                  <Text
                    ml={3}
                    fontWeight="bold"
                    fontFamily="'Courier New', monospace"
                  >
                    My List
                  </Text>
                </Flex>
              </Menu.Item>

              <Menu.Item
                onClick={() => handleMenuNavigation("/settings")}
                color={menuItemTextColor}
                bg="transparent"
                _hover={{
                  bg: menuItemHoverBg,
                  color: menuItemHoverTextColor,
                  transform: "translate(2px, -2px)",
                  boxShadow: `4px 4px 0 rgba(0,0,0,0.7)`,
                  borderLeft: `3px solid ${ACCENT_COLOR}`,
                }}
                _focus={{ bg: menuItemFocusBg }}
                py={2.5}
                mb={-1}
                _focusVisible={{ outline: "none" }}
                transition="all 0.15s ease"
                borderRadius="1px"
              >
                <Flex align="center">
                  <Settings size={18} />
                  <Text
                    ml={3}
                    fontWeight="bold"
                    fontFamily="'Courier New', monospace"
                  >
                    Settings
                  </Text>
                </Flex>
              </Menu.Item>
            </Box>

            <Box my={1.5}>
              <SquigglyLine color={`${ACCENT_COLOR}90`} delay={-0.4} />
            </Box>

            {/* Logout button with enhanced hover effect */}
            <Box mb={1}>
              <Menu.Item
                onClick={onLogout}
                color={menuRedColor}
                bg="transparent"
                _hover={{
                  bg: menuRedHoverBg,
                  color: menuRedHoverColor,
                  transform: "translate(2px, -2px)",
                  boxShadow: `4px 4px 0 rgba(255,0,0,0.3)`,
                  borderLeft: `3px solid #FF3A3A`,
                }}
                _focus={{ bg: menuRedHoverBg, color: menuRedHoverColor }}
                py={2.5}
                _focusVisible={{ outline: "none" }}
                transition="all 0.15s ease"
                borderRadius="1px"
              >
                <Flex align="center">
                  <LogOut size={18} />
                  <Text
                    ml={3}
                    fontWeight="bold"
                    fontFamily="'Courier New', monospace"
                  >
                    Sign Out
                  </Text>
                </Flex>
              </Menu.Item>
            </Box>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

// --- Main Navbar Component ---
const Navbar = () => {
  const [hoverItem, setHoverItem] = useState(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [nameHovered, setNameHovered] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get location for active link
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check if the current route matches the link's destination
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    // Determine auth loading state - assuming `user` becoming non-null/null means loaded
    setIsAuthLoading(false); // Simpler approach for now
    // const timer = setTimeout(() => setIsAuthLoading(false), 500); // Timeout approach
    // return () => clearTimeout(timer);
  }, [user]); // Rerun when user state changes

  const handleLogout = async () => {
    try {
      setIsAuthLoading(true); // Show loading on logout click
      await logout();
      navigate("/");
      // isAuthLoading will become false again via useEffect when user becomes null
    } catch (error) {
      console.error("Logout Error:", error);
      setIsAuthLoading(false); // Ensure loading stops on error
    }
  };

  return (
    <MotionFlex
      as="nav"
      h="91px"
      w="full"
      position="relative"
      top="0"
      left="0"
      zIndex={1000}
      bg={BG_MAIN}
      borderBottom={`2px solid ${BORDER_COLOR_DARK}`}
      boxShadow={`0 4px 12px rgba(0,0,0,0.6), inset 0 -2px 5px rgba(0,0,0,0.3)`}
      initial={{ y: -91 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* --- Logo Section --- */}
      <MotionLink
        as={RouterLink}
        to="/"
        w="91px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        bg={BG_ACCENT_AREA}
        borderRight={`1px solid ${BORDER_COLOR_LIGHT}`}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        aria-label="App Homepage"
        _hover={{ textDecoration: "none", bg: BG_HOVER_LIGHT }}
        _focus={{ outline: "none", boxShadow: "none" }}
        _focusVisible={{
          outline: `1px dashed ${ACCENT_COLOR}`,
          outlineOffset: "2px",
        }}
      >
        <MotionImage
          src={Logo}
          alt="App Logo"
          w="50px"
          h="50px"
          filter="brightness(0) invert(1)"
          variants={logoVariants}
          initial="initial"
          whileHover="hover"
          zIndex="2"
        />
        <MotionBox
          position="absolute"
          top="-1px"
          left="-1px"
          w="12px"
          h="12px"
          borderTop={`3px solid ${ACCENT_COLOR}`}
          borderLeft={`3px solid ${ACCENT_COLOR}`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: logoHovered ? 1 : 0.4 }}
          transition={{ duration: 0.2 }}
        />
        <MotionBox
          position="absolute"
          bottom="-1px"
          right="-1px"
          w="12px"
          h="12px"
          borderBottom={`3px solid ${ACCENT_COLOR}`}
          borderRight={`3px solid ${ACCENT_COLOR}`}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: logoHovered ? 1 : 0.4 }}
          transition={{ duration: 0.2 }}
        />
      </MotionLink>

      {/* --- Name Section --- */}
      <MotionFlex
        w="145px"
        alignItems="center"
        justifyContent="center"
        position="relative"
        bg={BG_ACCENT_AREA}
        borderRight={`1px solid ${BORDER_COLOR_LIGHT}`}
        overflow="hidden"
        onMouseEnter={() => setNameHovered(true)}
        onMouseLeave={() => setNameHovered(false)}
        _hover={{ bg: BG_HOVER_LIGHT }}
      >
        <SquigglyFrame isHovered={nameHovered} width="90%" height="80%" />
        <MotionImage
          src={Name}
          alt="App Name"
          w="120px"
          h="auto"
          filter="brightness(0) invert(1)"
          transition={{ duration: 0.2 }}
          variants={sketchHoverVariants}
          initial="initial"
          whileHover="hover"
          zIndex="2"
        />
      </MotionFlex>

      {/* --- Two-row section --- */}
      <Flex
        flexDirection="column"
        flexGrow={1}
        overflow="hidden"
        position="relative"
      >
        {/* --- Top row (Marquee) --- */}
        <Flex
          h="35px"
          w="full"
          position="relative"
          alignItems="center"
          overflow="hidden"
          bg={BG_ACCENT_AREA}
          borderBottom={`1px solid ${BORDER_COLOR_LIGHT}`}
        >
          {/* First copy - starts visible, moves off-screen left */}
          <MotionFlex
            flexShrink={0}
            display="flex"
            initial={{ x: "0%" }}
            animate={{ x: "-100%" }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 35,
                ease: "linear",
              },
            }}
          >
            {topRowItemsData.map((item, index) => (
              <TopRowInfoItem
                key={`${item.id}-marquee-1-${index}`}
                item={item}
                isLastInfoItem={false}
              />
            ))}
          </MotionFlex>

          {/* Second copy - starts off-screen right, moves onto screen */}
          <MotionFlex
            flexShrink={0}
            display="flex"
            position="absolute"
            left="0"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 35,
                ease: "linear",
              },
            }}
          >
            {topRowItemsData.map((item, index) => (
              <TopRowInfoItem
                key={`${item.id}-marquee-2-${index}`}
                item={item}
                isLastInfoItem={false}
              />
            ))}
          </MotionFlex>
        </Flex>

        {/* --- Bottom row (Nav + Auth) --- */}
        <Flex
          h="55px"
          w="full"
          position="relative"
          alignItems="stretch" // Align stretch for children
          bg={BG_SECONDARY}
          pl={{ base: 2, md: 4 }}
          borderTop={`1px solid ${BORDER_COLOR_DARK}`}
        >
          {/* Main Navigation Links Container */}
          <MotionFlex
            as="nav"
            variants={navContainerVariant}
            initial="hidden"
            animate="visible"
            display="flex"
            alignItems="stretch"
            h="full"
          >
            {navLinks.map((link) => (
              <NavLinkItem
                key={link.id}
                item={link}
                isActive={isActive(link.to)}
              />
            ))}
          </MotionFlex>
          <Box flexGrow={1} /> {/* Spacer */}
          {/* --- Right Side: Auth Section --- */}
          <Flex
            alignItems="stretch"
            h="full"
            borderLeft={`1px solid ${BORDER_COLOR_LIGHT}`}
            bg={BG_ACCENT_AREA}
            pl={3}
            pr={3}
          >
            {isAuthLoading ? (
              <Box
                w={{ base: "100px", md: "180px" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {" "}
                <Spinner size="sm" color={ACCENT_COLOR} />{" "}
              </Box>
            ) : !user ? (
              <HStack
                spacing={{ base: 1, md: 3 }}
                h="full"
                alignItems="stretch"
              >
                {/* Sign in Link - Reduced padding to fit */}
                <MotionLink
                  as={RouterLink}
                  to="/signin"
                  px={{ base: 2, md: 4 }}
                  h="full"
                  display="flex"
                  alignItems="center"
                  cursor="pointer"
                  position="relative"
                  color="whiteAlpha.800"
                  fontWeight="medium"
                  fontFamily="'Courier New', monospace"
                  letterSpacing="1px"
                  fontSize="13px"
                  textTransform="uppercase"
                  _hover={{ textDecoration: "none", color: "white" }}
                >
                  SIGN IN
                </MotionLink>
                {/* Get Started Button */}
                <Box
                  w={{ base: "100px", md: "150px" }}
                  display="flex"
                  alignItems="center"
                >
                  <SketchButton to="/login">Get Started</SketchButton>
                </Box>
              </HStack>
            ) : (
              <Box display="flex" alignItems="center">
                {" "}
                {/* Ensure dropdown vertically centers */}
                <UserProfileDropdown user={user} onLogout={handleLogout} />
              </Box>
            )}
          </Flex>{" "}
          {/* End Auth Section Flex */}
        </Flex>

        {/* Decorative corner marks */}
        <MotionBox
          position="absolute"
          top="-1px"
          right="-1px"
          w="12px"
          h="12px"
          borderTop={`3px solid ${ACCENT_COLOR}`}
          borderRight={`3px solid ${ACCENT_COLOR}`}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
        />
        <MotionBox
          position="absolute"
          bottom="-1px"
          left="-1px"
          w="12px"
          h="12px"
          borderBottom={`3px solid ${ACCENT_COLOR}`}
          borderLeft={`3px solid ${ACCENT_COLOR}`}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0.2,
          }}
        />
      </Flex>
    </MotionFlex>
  );
};

export default Navbar;
