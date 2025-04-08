import React, { useState, useEffect, useCallback } from "react"; // Removed unused 'use'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// Use alias for ChakraLink to avoid conflict with RouterLink if needed later, though only using ChakraLink here for now
import {
  Box,
  Flex,
  VStack,
  Text,
  Link as ChakraLink,
  Button,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion"; // Removed unused easeInOut
import { IconBrandApple, IconBrandGithub } from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import { Spotlight } from "../components/ui/spotlight";
import NetflixBackground from "../components/NetflixBackground";
import HandDrawnCircle from "../components/HandDrawnCircle";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // Import RouterLink for internal links
import toast, { Toaster } from "react-hot-toast"; // Use react-hot-toast

// --- Helper Components (Moved Outside & Memoized) ---

const SquigglyCorner = React.memo(
  ({ position, delay = 0, color = "#FFEC44" }) => {
    const getPath = useCallback(() => {
      // Memoize path calculation if needed, though unlikely to change often
      const length = 30;
      const squiggleSize = 4;
      switch (position /* ... cases ... */) {
        case "topLeft":
          return `M0,0 Q${squiggleSize},${squiggleSize} 0,${
            squiggleSize * 2
          } Q${squiggleSize},${squiggleSize * 3} 0,${
            squiggleSize * 4
          } Q${squiggleSize},${squiggleSize * 5} 0,${
            squiggleSize * 6
          } M0,0 Q${squiggleSize},${squiggleSize} ${squiggleSize * 2},0 Q${
            squiggleSize * 3
          },${squiggleSize} ${squiggleSize * 4},0 Q${
            squiggleSize * 5
          },${squiggleSize} ${squiggleSize * 6},0`;
        case "topRight":
          return `M${length},0 Q${
            length - squiggleSize
          },${squiggleSize} ${length},${squiggleSize * 2} Q${
            length - squiggleSize
          },${squiggleSize * 3} ${length},${squiggleSize * 4} Q${
            length - squiggleSize
          },${squiggleSize * 5} ${length},${squiggleSize * 6} M${length},0 Q${
            length - squiggleSize
          },${squiggleSize} ${length - squiggleSize * 2},0 Q${
            length - squiggleSize * 3
          },${squiggleSize} ${length - squiggleSize * 4},0 Q${
            length - squiggleSize * 5
          },${squiggleSize} ${length - squiggleSize * 6},0`;
        case "bottomLeft":
          return `M0,${length} Q${squiggleSize},${length - squiggleSize} 0,${
            length - squiggleSize * 2
          } Q${squiggleSize},${length - squiggleSize * 3} 0,${
            length - squiggleSize * 4
          } Q${squiggleSize},${length - squiggleSize * 5} 0,${
            length - squiggleSize * 6
          } M0,${length} Q${squiggleSize},${length - squiggleSize} ${
            squiggleSize * 2
          },${length} Q${squiggleSize * 3},${length - squiggleSize} ${
            squiggleSize * 4
          },${length} Q${squiggleSize * 5},${length - squiggleSize} ${
            squiggleSize * 6
          },${length}`;
        case "bottomRight":
          return `M${length},${length} Q${length - squiggleSize},${
            length - squiggleSize
          } ${length},${length - squiggleSize * 2} Q${length - squiggleSize},${
            length - squiggleSize * 3
          } ${length},${length - squiggleSize * 4} Q${length - squiggleSize},${
            length - squiggleSize * 5
          } ${length},${length - squiggleSize * 6} M${length},${length} Q${
            length - squiggleSize
          },${length - squiggleSize} ${length - squiggleSize * 2},${length} Q${
            length - squiggleSize * 3
          },${length - squiggleSize} ${length - squiggleSize * 4},${length} Q${
            length - squiggleSize * 5
          },${length - squiggleSize} ${length - squiggleSize * 6},${length}`;
        default:
          return "";
      }
    }, [position]);

    const getStyles = useCallback(() => {
      // Memoize style calculation
      switch (position) {
        case "topLeft":
          return { top: 0, left: 0 };
        case "topRight":
          return { top: 0, right: 0 };
        case "bottomLeft":
          return { bottom: 0, left: 0 };
        case "bottomRight":
          return { bottom: 0, right: 0 };
        default:
          return {};
      }
    }, [position]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.8 }}
        style={{
          position: "absolute",
          width: "30px",
          height: "30px",
          zIndex: 10,
          ...getStyles(),
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30">
          <motion.path
            d={getPath()}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="120"
            initial={{ strokeDashoffset: 120 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    );
  }
);

const NoiseTexture = React.memo(() => (
  <Box
    position="absolute"
    inset="0"
    zIndex="1"
    opacity="0.05"
    pointerEvents="none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      mixBlendMode: "multiply",
    }}
  />
));

const ScribbleEffect = React.memo(({ isActive }) => (
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
    />
  </motion.svg>
));

// Button with enhanced hover effects
const SketchButton = React.memo(
  ({ children, primary = false, onClick = () => {} }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        style={{ position: "relative", width: "100%" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ScribbleEffect isActive={isHovered} />

        {/* Animated corner doodles on hover */}
        {["topLeft", "topRight", "bottomLeft", "bottomRight"].map(
          (pos, idx) => (
            <motion.div
              key={pos}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                isHovered
                  ? { scale: 1, opacity: 0.8 }
                  : { scale: 0, opacity: 0 }
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
                ...(pos === "topLeft"
                  ? { top: -4, left: -4 }
                  : pos === "topRight"
                  ? { top: -4, right: -4 }
                  : pos === "bottomLeft"
                  ? { bottom: -4, left: -4 }
                  : { bottom: -4, right: -4 }),
                borderWidth:
                  pos === "topLeft"
                    ? "2px 0 0 2px"
                    : pos === "topRight"
                    ? "2px 2px 0 0"
                    : pos === "bottomLeft"
                    ? "0 0 2px 2px"
                    : "0 2px 2px 0",
                zIndex: 5,
              }}
            />
          )
        )}

        {/* Button shadow that moves on hover */}
        <motion.div
          initial={{ opacity: 0.5, x: 3, y: 3 }}
          animate={
            isHovered
              ? { opacity: 0.8, x: 5, y: 5 }
              : { opacity: 0.5, x: 3, y: 3 }
          }
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: -1,
            border: "1px dashed rgba(0,0,0,0.3)",
          }}
          transition={{ duration: 0.2 }}
        />

        <Button
          onClick={onClick}
          width="100%"
          height="10"
          position="relative"
          style={{
            background: primary ? "#FFEC44" : "rgba(40,40,40,0.3)",
            color: primary ? "#000" : "#fff",
            border: "1px solid #000",
            borderRadius: "0px",
            fontWeight: primary ? "bold" : "normal",
            zIndex: 2,
            transition: "transform 0.2s, background 0.2s",
          }}
        >
          {children}

          {/* Underline animation on hover */}
          <motion.div
            initial={{ width: 0 }}
            animate={isHovered ? { width: "90%" } : { width: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              bottom: "4px",
              left: "5%",
              height: "2px",
              background: primary ? "black" : "#FFEC44",
              zIndex: 3,
            }}
          />
        </Button>
      </motion.div>
    );
  }
);

// --- Validation Helpers ---
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
const validatePassword = (password) => password.length >= 8;

// --- Main Signup Component ---
export default function Login() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0); // For intro animation

  const {
    signInWithGoogle,
    user,
    loading: authLoading, // Renamed context loading
    connectAccount,
    createAccount,
    resetPassword, // Added resetPassword
    mapAuthCodeToMessage,
  } = useAuth();

  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [formError, setFormError] = useState(null); // Local error state for form
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for submissions

  // --- Event Handlers (Memoized) ---
  const handleEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback(
    (e) => setPassword(e.target.value),
    []
  );
  const handleUsernameChange = useCallback(
    (e) => setUsername(e.target.value),
    []
  );

  // --- Auth Action Handlers (Memoized) ---
  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signInWithGoogle();
      // Navigation is handled by useEffect watching 'user'
      toast.success("Login Successful");
    } catch (error) {
      console.error("Google Sign-In failed", error);
      const message = mapAuthCodeToMessage(error.code);
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [signInWithGoogle]); // Dependency: signInWithGoogle

  const handleEmailSignIn = useCallback(async () => {
    setFormError(null);
    if (!validateEmail(email)) {
      setFormError("Please enter a valid email.");
      return;
    }
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await connectAccount(email, password);
      // Navigation handled by useEffect
      toast.success("Login Successful");
    } catch (error) {
      console.error("Email Sign-In failed", error);
      const message =
        error.message || "Sign in failed. Please check your credentials.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [connectAccount, email, password]); // Dependencies

  const handleEmailSignUp = useCallback(async () => {
    setFormError(null);
    if (isSignUp && !username.trim()) {
      setFormError("Please enter a username.");
      return;
    }
    if (!validateEmail(email)) {
      setFormError("Please enter a valid email.");
      return;
    }
    if (!validatePassword(password)) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass username if your backend/context handles it: await createAccount(email, password, username);
      await createAccount(email, password);
      // Navigation handled by useEffect
      toast.success("Signup Successful! Welcome.");
    } catch (error) {
      console.error("Email Sign-Up failed", error);
      const message = mapAuthCodeToMessage(error.code);
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [createAccount, email, password, username, isSignUp]); // Dependencies

  const handlePasswordReset = useCallback(async () => {
    setFormError(null);
    if (!validateEmail(email)) {
      setFormError("Please enter your email address first to reset password.");
      toast.error("Enter your email address first.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Assuming resetPassword exists in your AuthContext and takes email
      await resetPassword(email);
      toast.success(
        `Password reset email sent to ${email}. Check your inbox/spam.`
      );
    } catch (error) {
      console.error("Password Reset failed", error);
      const message = mapAuthCodeToMessage(error.code);
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [resetPassword, email]); // Dependencies

  // --- Unified Form Submission ---
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isSignUp) {
        handleEmailSignUp();
      } else {
        handleEmailSignIn();
      }
    },
    [isSignUp, handleEmailSignUp, handleEmailSignIn]
  ); // Dependencies

  // --- Effects ---
  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Initial loading animation stages
  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingStage(1), 100);
    const timer2 = setTimeout(() => setLoadingStage(2), 400);
    const timer3 = setTimeout(() => setLoadingStage(3), 800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []); // Runs once on mount

  console.log("test");

  // --- Original Layout Render ---
  return (
    <Flex
      height="100vh"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
      fontFamily="'Indie Flower', 'Comic Sans MS', cursive"
    >
      <NetflixBackground />
      {/* Main container - Structure from original */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 0.8,
          },
        }}
        style={{
          width: "856px",
          height: "720px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          overflow: "hidden",
          border: "2px solid black",
          borderRadius: "0px",
          boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Image Section (Left Side - Original Structure) */}
        <Box
          width="416px"
          height="720px"
          padding="144px 56px 40px 56px"
          position="relative"
          style={{
            background: "linear-gradient(to bottom, #1a365d, #553c9a)",
            borderRight: "2px solid black",
          }}
        >
          <NoiseTexture />
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex="0"
            opacity="0.3"
            bgImage="url('https://via.placeholder.com/416x720')" // Placeholder image
            bgSize="cover"
            bgPosition="center"
          />
          {/* ... other elements from the original image section (sketch accent, circles, text content) ... */}
          {/* Animated Sketch Element: Yellow corner accent */}
          <motion.div
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{
              width: loadingStage >= 2 ? "80px" : 0,
              height: loadingStage >= 2 ? "80px" : 0,
              opacity: loadingStage >= 2 ? 0.6 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              {" "}
              <motion.path
                d="M0,0 L70,0 C60,10 40,20 20,15 C5,10 0,5 0,0 Z"
                fill="none"
                stroke="#FFEC44"
                strokeWidth="1"
                strokeDasharray="3,2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />{" "}
            </svg>
          </motion.div>
          {/* Hand-drawn circles */}
          <HandDrawnCircle size={50} top="15%" right="10%" delay={0.4} />{" "}
          <HandDrawnCircle size={30} bottom="20%" left="15%" delay={0.6} />{" "}
          <HandDrawnCircle size={60} bottom="5%" right="5%" delay={0.8} />
          <HandDrawnCircle
            size={60}
            bottom="64%"
            right="35%"
            delay={0.8}
          />{" "}
          <HandDrawnCircle size={45} top="32%" left="25%" delay={0.5} />{" "}
          <HandDrawnCircle size={35} top="70%" right="22%" delay={0.7} />
          {/* Content overlay */}
          <VStack
            spacing={6}
            position="relative"
            zIndex="2"
            color="white"
            align="start"
            height="full"
          >
            <Box pl={2}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  mb={2}
                  style={{
                    textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
                    color: "#FFEC44",
                  }}
                >
                  Live Sphere
                </Text>
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Text
                  fontSize="md"
                  opacity="0.8"
                  style={{
                    textDecoration: "underline",
                    textDecorationStyle: "wavy",
                    textDecorationColor: "#FFEC44",
                  }}
                >
                  The modern way to build web applications
                </Text>
              </motion.div>
              {/* Hand-drawn underline */}
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1 }}
                style={{ position: "relative", marginTop: "10px" }}
              >
                <svg
                  width="100%"
                  height="4"
                  viewBox="0 0 300 4"
                  preserveAspectRatio="none"
                >
                  {" "}
                  <motion.path
                    d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
                    fill="none"
                    stroke="rgba(250,204,21,0.6)"
                    strokeWidth="1"
                    strokeDasharray="3,2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1.7 }}
                  />{" "}
                </svg>
              </motion.div>
            </Box>
            <Flex flexGrow={1} alignItems="flex-end">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{
                  x: 5,
                  y: -5,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
              >
                <Box pl={2}>
                  <Text fontSize="sm" fontWeight="medium" mb={4}>
                    What our users say
                  </Text>
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                      scale: loadingStage >= 3 ? 1 : 0.95,
                      opacity: loadingStage >= 3 ? 1 : 0,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Text
                      fontSize="md"
                      fontStyle="italic"
                      mb={4}
                      style={{
                        border: "1px dashed rgba(255,255,255,0.3)",
                        padding: "12px",
                        background: "rgba(0,0,0,0.2)",
                        boxShadow: "3px 3px 0 rgba(250,204,21,0.3)",
                      }}
                    >
                      "This platform completely transformed how we approach our
                      projects..."
                    </Text>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{
                      x: loadingStage >= 3 ? 0 : -20,
                      opacity: loadingStage >= 3 ? 1 : 0,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Flex align="center">
                      <motion.div
                        whileHover={{
                          rotate: [0, -5, 5, -5, 0],
                          transition: { duration: 0.5 },
                        }}
                      >
                        {" "}
                        <Box
                          width="40px"
                          height="40px"
                          mr={3}
                          style={{
                            background: "#FFEC44",
                            border: "1px solid black",
                            boxShadow: "2px 2px 0 rgba(0,0,0,0.8)",
                          }}
                        />{" "}
                      </motion.div>
                      <Box>
                        {" "}
                        <Text fontSize="sm" fontWeight="bold">
                          Tyler Durden
                        </Text>{" "}
                        <Text fontSize="xs" opacity="0.8">
                          Project Manager, Fight Club
                        </Text>{" "}
                      </Box>
                    </Flex>
                  </motion.div>
                </Box>
              </motion.div>
            </Flex>
          </VStack>
        </Box>
        {/* Form Section (Right Side - Original Structure) */}
        <Box
          width="440px"
          height="720px"
          padding="48px 40px"
          bg="rgba(10,10,20,0.7)"
          color="white"
          position="relative"
          overflow="hidden"
          backdropFilter="blur(10px)"
          style={{ borderLeft: "1px dashed rgba(255,255,255,0.2)" }}
        >
          <Spotlight
            className="left-0 -top-40 md:-top-10 md:left-30"
            fill="rgba(250,204,21,0.4)"
          />
          <NoiseTexture />
          {["topLeft", "topRight", "bottomLeft", "bottomRight"].map(
            (pos, idx) => (
              <SquigglyCorner
                key={pos}
                position={pos}
                delay={0.3 + idx * 0.1}
                color="#FFEC44"
              />
            )
          )}
          {/* Form Content VStack */}
          <VStack
            spacing={4}
            align="stretch"
            height="full"
            position="relative"
            zIndex={1}
          >
            {" "}
            {/* Adjusted spacing */}
            {/* Form Header */}
            <Box pl={2}>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="#FFEC44"
                  style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.8)" }}
                >
                  {isSignUp ? "Create an Account" : "Welcome Back"}
                </Text>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Text mt={1} fontSize="sm" color="gray.300">
                  {isSignUp
                    ? "Sign up to access Live Sphere"
                    : "Sign in to continue"}
                </Text>
                {/* Underline */}
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 1 }}
                  style={{ position: "relative", marginTop: "10px" }}
                >
                  <svg
                    width="100%"
                    height="4"
                    viewBox="0 0 300 4"
                    preserveAspectRatio="none"
                  >
                    {" "}
                    <motion.path
                      d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
                      fill="none"
                      stroke="rgba(250,204,21,0.6)"
                      strokeWidth="1"
                      strokeDasharray="3,2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 1.7 }}
                    />{" "}
                  </svg>
                </motion.div>
              </motion.div>
            </Box>
            {/* Error Message Display */}
            {/* <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: "300px",
                    padding: "4px",
                    textAlign: "center",
                    background: "rgba(239, 68, 68, 0.5)",
                    border: `1px solid #991b1b`,
                    boxShadow: `4px 4px 0px 0px #7f1d1d`,
                    margin: "0 auto",
                  }}
                >
                  <Text
                    fontSize="sm"
                    fontFamily="'Courier New', monospace"
                    color="gray.300"
                  >
                    {formError}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence> */}
            {/* Form Element */}
            <motion.form
              onSubmit={handleSubmit} // Use the single submit handler
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{ width: "100%" }} // Ensure form takes width
            >
              {/* Animated Section for Inputs */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? "signup-fields" : "signin-fields"} // More specific key
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: loadingStage >= 2 ? 1 : 0,
                    y: loadingStage >= 2 ? 0 : 10,
                  }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <VStack spacing={3} pl={2}>
                    {" "}
                    {/* Fine-tuned spacing */}
                    {/* Username Input (Conditional with Animation) */}
                    <AnimatePresence>
                      {isSignUp && (
                        <motion.div
                          key="username-input-motion"
                          initial={{
                            opacity: 0,
                            height: 0,
                            marginTop: 0,
                            marginBottom: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            marginTop: "0rem",
                            marginBottom: "0.5rem",
                          }} // Adjust spacing during anim
                          exit={{
                            opacity: 0,
                            height: 0,
                            marginTop: 0,
                            marginBottom: 0,
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ width: "100%" }}
                        >
                          <Box width="full">
                            <Label
                              htmlFor="username"
                              className="text-white"
                              ml={1}
                              fontSize="13px"
                            >
                              Username
                            </Label>
                            <Input
                              id="username"
                              placeholder="Choose a username"
                              type="text"
                              value={username}
                              onChange={handleUsernameChange}
                              required={isSignUp} // Required only on sign up
                              disabled={isSubmitting} // Use isSubmitting
                              className="mt-1 text-white"
                              style={{
                                background: "rgba(40,40,50,0.9)",
                                border: "1px solid #000",
                                borderRadius: "0px",
                                boxShadow: "2px 2px 0 rgba(250,204,21,0.3)",
                              }}
                            />
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Email Input */}
                    <Box width="full">
                      <Label
                        htmlFor="email"
                        className="text-white"
                        ml={1}
                        fontSize="13px"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        disabled={isSubmitting} // Use isSubmitting
                        className="mt-1 text-white"
                        style={{
                          background: "rgba(40,40,50,0.9)",
                          border: "1px solid #000",
                          borderRadius: "0px",
                          boxShadow: "2px 2px 0 rgba(250,204,21,0.3)",
                        }}
                      />
                    </Box>
                    {/* Password Input */}
                    <Box width="full">
                      <Label
                        htmlFor="password"
                        className="text-white"
                        ml={1}
                        fontSize="13px"
                      >
                        Password
                      </Label>
                      <Input
                        id="password"
                        placeholder={
                          isSignUp
                            ? "At least 8 characters"
                            : "Enter your password"
                        }
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        disabled={isSubmitting} // Use isSubmitting
                        className="mt-1 text-white"
                        style={{
                          background: "rgba(40,40,50,0.9)",
                          border: "1px solid #000",
                          borderRadius: "0px",
                          boxShadow: "2px 2px 0 rgba(250,204,21,0.3)",
                        }}
                      />
                    </Box>
                    {/* Submit Button */}
                    <Box width="full" mt={3}>
                      {" "}
                      {/* Adjusted margin */}
                      <SketchButton
                        primary={true}
                        type="submit" // Trigger form onSubmit
                        disabled={isSubmitting}
                        isSubmitting={isSubmitting}
                        onClick={
                          isSignUp ? handleEmailSignUp : handleEmailSignIn
                        }
                      >
                        {isSignUp ? "Sign up" : "Sign in"} →
                      </SketchButton>
                    </Box>
                  </VStack>
                </motion.div>
              </AnimatePresence>

              {/* Toggle/Forgot Password Section */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? "toggle-to-signin" : "toggle-to-signup"} // Unique keys
                  initial={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: "100%" }}
                >
                  <Flex
                    align="center"
                    justify={isSignUp ? "center" : "space-between"}
                    width="full"
                    mt={2}
                    px={2}
                  >
                    {/* Toggle Link */}
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                        x: [0, -1, 1, 0],
                        transition: { duration: 0.3 },
                      }}
                    >
                      <Text fontSize="sm" color="gray.400">
                        {isSignUp
                          ? "Already have an account? "
                          : "Don't have an account? "}
                        <ChakraLink
                          as={motion.a}
                          cursor="pointer"
                          color="#FFEC44"
                          whileHover={{
                            textShadow: "0 0 5px rgba(250,204,21,0.7)",
                            scale: 1.05,
                          }}
                          onClick={() => {
                            if (!isSubmitting) {
                              setIsSignUp(!isSignUp);
                              setFormError(null);
                            }
                          }}
                          style={{
                            textDecoration: "underline",
                            textDecorationStyle: "dashed",
                          }}
                        >
                          {isSignUp ? "Sign in" : "Sign up"}
                        </ChakraLink>
                      </Text>
                    </motion.div>

                    {/* Forgot Password Link */}
                    {!isSignUp && (
                      <motion.div
                        whileHover={{
                          scale: 1.05,
                          x: [0, -1, 1, 0],
                          transition: { duration: 0.3 },
                        }}
                      >
                        <ChakraLink
                          color="#FFEC44"
                          fontSize="sm"
                          cursor="pointer"
                          position="relative"
                          display="inline-block"
                          onClick={() => {
                            if (!isSubmitting) {
                              handlePasswordReset();
                            }
                          }} // Attach handler, check submitting
                          style={{
                            textDecoration: "underline",
                            textDecorationStyle: "dashed",
                          }}
                        >
                          Forgot password?
                          <motion.div /* Underline animation */
                            initial={{ width: "0%" }}
                            whileHover={{ width: "100%" }}
                            transition={{ duration: 0.3 }}
                            style={{
                              position: "absolute",
                              height: "1px",
                              bottom: "-2px",
                              left: "0",
                              background:
                                "linear-gradient(90deg, #FFEC44 0%, transparent 100%)",
                            }}
                          />
                        </ChakraLink>
                      </motion.div>
                    )}
                  </Flex>
                </motion.div>
              </AnimatePresence>

              {/* OR Separator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Flex
                  my={4}
                  position="relative"
                  width="100%"
                  alignItems="center"
                >
                  {" "}
                  {/* Adjusted margin */}
                  <Box flex="1" height="1px" bg="gray.600" position="relative">
                    {" "}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent)",
                      }}
                    />{" "}
                  </Box>
                  <Text
                    px={3}
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.400"
                  >
                    or
                  </Text>
                  <Box flex="1" height="1px" bg="gray.600" position="relative">
                    {" "}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent)",
                      }}
                    />{" "}
                  </Box>
                </Flex>
              </motion.div>

              {/* Social Login Buttons */}
              <VStack spacing={3} width="full" pl={2}>
                {" "}
                {/* Adjusted spacing */}
                {[
                  // Keep only Google for now as per original request prompt
                  // Add others back similarly when ready
                  {
                    Icon: FcGoogle,
                    text: "Continue with Google",
                    onClick: handleGoogleSignIn,
                    key: "google-social",
                  },
                  // Placeholder examples:
                  {
                    Icon: IconBrandGithub,
                    text: "Continue with GitHub",
                    onClick: () =>
                      toast.error("GitHub Sign-In Not Implemented"),
                    key: "github-social",
                    disabled: true,
                  },
                  {
                    Icon: IconBrandApple,
                    text: "Continue with Apple",
                    onClick: () => toast.error("Apple Sign-In Not Implemented"),
                    key: "apple-social",
                    disabled: true,
                  },
                ].map(
                  ({ Icon, text, onClick, key, disabled = false }, index) => (
                    <motion.div
                      key={key}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{
                        x: loadingStage >= 3 ? 0 : -20,
                        opacity: loadingStage >= 3 ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 + index * 0.1,
                        ease: "easeOut",
                      }} // Stagger delay
                      style={{ width: "95%" }}
                    >
                      <Box mt={index === 0 ? 0 : 0}>
                        {" "}
                        {/* Removed top margin for first */}
                        <SketchButton
                          onClick={onClick}
                          disabled={isSubmitting || disabled} // Disable if submitting or button itself is disabled
                          isSubmitting={isSubmitting}
                        >
                          <Flex align="center" justify="center">
                            {" "}
                            {/* Center content */}
                            <motion.div
                              whileHover={
                                !(isSubmitting || disabled)
                                  ? {
                                      scale: 1.2,
                                      rotate: [-5, 5, -5, 0],
                                      transition: { duration: 0.5 },
                                    }
                                  : {}
                              }
                            >
                              <Icon className="w-4 h-4" />{" "}
                              {/* Removed specific color class */}
                            </motion.div>
                            <Text ml={3} fontSize="sm">
                              {text}
                            </Text>
                          </Flex>
                        </SketchButton>
                      </Box>
                    </motion.div>
                  )
                )}
              </VStack>
            </motion.form>{" "}
            {/* End of Form */}
            {/* Terms and Policy Links (Pushed towards bottom if VStack has space) */}
            <Flex mt="auto" justify="center" pt={2}>
              {" "}
              {/* mt="auto" pushes this down */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: loadingStage >= 3 ? 0 : 20,
                  opacity: loadingStage >= 3 ? 1 : 0,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Text
                  as="div"
                  color="gray.500"
                  fontSize="xs"
                  textAlign="center"
                  p={2}
                >
                  By continuing, you agree to our{" "}
                  <ChakraLink
                    as={RouterLink}
                    to="/terms"
                    color="gray.400"
                    _hover={{
                      color: "#FFEC44",
                      textDecoration: "underline",
                      textDecorationStyle: "dashed",
                    }}
                  >
                    Terms of Service
                  </ChakraLink>{" "}
                  and{" "}
                  <ChakraLink
                    as={RouterLink}
                    to="/privacy"
                    color="gray.400"
                    _hover={{
                      color: "#FFEC44",
                      textDecoration: "underline",
                      textDecorationStyle: "dashed",
                    }}
                  >
                    Privacy Policy
                  </ChakraLink>
                  .
                </Text>
              </motion.div>
            </Flex>
          </VStack>{" "}
          {/* End of Form Content VStack */}
        </Box>{" "}
        {/* End of Form Section */}
      </motion.div>{" "}
      {/* End of Main Container */}
    </Flex>
  );
}
