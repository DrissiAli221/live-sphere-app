import React, { useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  VStack,
  Text,
  Container,
  Input,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFilm } from "react-icons/fa";
import { Toaster, toaster } from "@/components/ui/toaster";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Field } from "@chakra-ui/react";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Login = () => {
  const { signInWithGoogle, user, loading, connectAccount, createAccount } =
    useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/"); // Redirect after successful login
      toaster.create({
        title: "Login Successful",
        description: "You have successfully logged in",
        variant: "success",
        type: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Login failed", error);
      setError(error.message);
      toaster.create({
        title: "Login Failed",
        description: "Please check your email and password",
        variant: "destructive",
        type: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await connectAccount(email, password);
      navigate("/");
      toaster.create({
        title: "Login Successful",
        description: "You have successfully logged in",
        variant: "success",
        type: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Login failed", error);
      setError(error.message);
      toaster.create({
        title: "Login Failed",
        description: "Please check your email and password",
        variant: "destructive",
        type: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createAccount(email, password);
      navigate("/");
      toaster.create({
        title: "Signup Successful",
        description: "You have successfully signed up",
        variant: "success",
        type: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Signup failed", error);
      setError(error.message);
      toaster.create({
        title: "Signup Failed",
        description: "Please check your email and password",
        variant: "destructive",
        type: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Redirect to home if user is already logged in 
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading]);

  return (
    <Flex
      height="100vh"
      align="center"
      justify="center"
      position="relative"
      overflow="hidden"
    >
      {/* Animated background elements */}
      <MotionBox
        position="absolute"
        top="-50%"
        left="-50%"
        width="100%"
        height="100%"
        bg="radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <Container maxW="container.sm" position="relative" zIndex={1}>
        <MotionFlex
          direction="column"
          align="center"
          justify="center"
          p={8}
          borderRadius="2xl"
          bg="rgba(23, 25, 35, 0.8)"
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          border="1px solid rgba(255, 255, 255, 0.18)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={8} width="100%">
            {/* Logo and Title */}
            <MotionFlex
              direction="column"
              align="center"
              spacing={4}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                p={4}
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
                mb={4}
              >
                <FaFilm size={40} color="#C74B08" />
              </Box>
              <Heading
                size="2xl"
                color="white"
                textAlign="center"
                fontWeight="bold"
                letterSpacing="tight"
              >
                Welcome to LiveSphere
              </Heading>
              <Text
                color="rgba(255, 255, 255, 0.7)"
                fontSize="lg"
                textAlign="center"
                maxW="md"
              >
                Your ultimate destination for movies and entertainment
              </Text>
            </MotionFlex>

            <MotionBox>
              <form onSubmit={handleEmailSignIn}>
                <Field.Root invalid >
                  <Field.Label>
                    Email
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                  {error && (
                    <Field.ErrorText>
                      Please enter a valid email address {error}
                    </Field.ErrorText>
                  )}
                </Field.Root>
                <Field.Root invalid >
                  <Field.Label>
                    Password
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  {error && (
                    <Field.ErrorText>
                      Please enter a valid password {error}
                    </Field.ErrorText>
                  )}
                </Field.Root>
                <Button
                  type="submit"
                  width="full"
                  height="60px"
                  isLoading={isLoading}
                >
                  Sign in
                </Button>

                <Button
                  variant="outline"
                  width="full"
                  onClick={handleEmailSignUp}
                  isLoading={isLoading}
                >
                  Sign Up
                </Button>
              </form>
            </MotionBox>

            {/* Sign in Button */}
            <MotionBox
              width="100%"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                leftIcon={<FcGoogle size={24} />}
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                variant="solid"
                size="lg"
                width="full"
                height="60px"
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.2)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
                transition="all 0.3s"
                borderRadius="xl"
                fontSize="lg"
                fontWeight="semibold"
              >
                Sign in with Google
              </Button>
            </MotionBox>

            {/* Features List */}
            <VStack
              spacing={3}
              align="start"
              width="100%"
              mt={4}
              color="rgba(255, 255, 255, 0.7)"
            >
              <Flex align="center" gap={2}>
                <Box as="span" color="#C74B08">
                  ✓
                </Box>
                <Text>Access to thousands of movies</Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Box as="span" color="#C74B08">
                  ✓
                </Box>
                <Text>Personalized recommendations</Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Box as="span" color="#C74B08">
                  ✓
                </Box>
                <Text>Create your watchlist</Text>
              </Flex>
            </VStack>
          </VStack>
        </MotionFlex>
      </Container>
      <Toaster />
      <BackgroundBeams />
    </Flex>
  );
};

export default Login;
