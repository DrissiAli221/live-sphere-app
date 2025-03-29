import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Box, Flex, VStack, Text, Link, Button } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import { Spotlight } from "./ui/spotlight";
import { DotPattern } from "./magicui/dot-pattern";
import {
  fetchTrendingMovies,
  fetchTrendingTVShows,
  fetchDiscoverMovies,
  fetchTopRated,
  baseImageOriginal,
  baseImageW500,
} from "@/services/api";
import NetflixBackground from "./NetflixBackground";


// Main Login Component
export default function SignupFormDemo() {
  const [isSignUp, setIsSignUp] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  const MotionBox = motion(Box);
  const BottomGradient = () => {
    return (
      <>
        <span className="absolute inset-x-0 block w-full h-px transition duration-500 opacity-0 group-hover/btn:opacity-100 -bottom-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <span className="absolute block w-1/2 h-px mx-auto transition duration-500 opacity-0 group-hover/btn:opacity-100 -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
      </>
    );
  };

  return (
    <Flex
      height="100vh"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      {/* Netflix Background Component */}
      <NetflixBackground />

      {/* Login/Signup Form */}
      <Flex
        width="856px"
        height="720px"
        boxShadow="xl"
        borderRadius="md"
        overflow="hidden"
        position="relative"
        zIndex={10}
      >
        {/* Image Section - 416x720 */}
        <Box
          width="416px"
          height="720px"
          padding="144px 56px 40px 56px"
          position="relative"
          bgGradient="linear(to-b, blue.900, purple.900)"
        >
          {/* Placeholder for your image */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex="0"
            opacity="0.3"
            bgImage="url('https://via.placeholder.com/416x720')"
            bgSize="cover"
            bgPosition="center"
          />

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
              <Text fontSize="3xl" fontWeight="bold" mb={2}>
                Live Sphere
              </Text>
              <Text fontSize="md" opacity="0.8">
                The modern way to build web applications
              </Text>
            </Box>

            <Flex flexGrow={1} alignItems="flex-end">
              <Box pl={2}>
                <Text fontSize="sm" fontWeight="medium" mb={4}>
                  What our users say
                </Text>
                <Text fontSize="md" fontStyle="italic" mb={4}>
                  "This platform completely transformed how we approach our
                  projects. The interface is intuitive and the features are
                  exactly what we needed."
                </Text>
                <Flex align="center">
                  <Box
                    width="40px"
                    height="40px"
                    borderRadius="full"
                    bg="blue.500"
                    mr={3}
                  />
                  <Box>
                    <Text fontSize="sm" fontWeight="bold">
                      Tyler Durden
                    </Text>
                    <Text fontSize="xs" opacity="0.8">
                      Project Manager, Fight Club
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Flex>
          </VStack>
        </Box>

        {/* Form Section - 440x720 */}
        <Box
          width="440px"
          height="720px"
          padding="72px 48px 40px"
          bg="rgba(10,10,20,0.7)"
          color="white"
          position="relative"
          overflow="hidden"
          backdropFilter="blur(10px)"
          borderLeft="1px solid rgba(255,255,255,0.1)"
        >
          <Spotlight
            className="left-0 -top-40 md:-top-10 md:left-30"
            fill="white"
          />

          {/* Fixed DotPattern implementation */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={0}
          >
            <div className="absolute inset-0 opacity-50">
              <DotPattern
                glow={true}
                size={32}
                radius={1.5}
                offset={0}
                className="h-full w-full [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
              />
            </div>
          </Box>

          <VStack
            spacing={6}
            align="stretch"
            height="full"
            position="relative"
            zIndex={1}
          >
            <Box pl={2}>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {isSignUp ? "Create an Account" : "Welcome Back"}
              </Text>
              <Text mt={2} fontSize="sm" color="gray.300">
                {isSignUp
                  ? "Sign up to access Live Sphere"
                  : "Sign in to continue"}
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <MotionBox
                  key={isSignUp ? "signup" : "signin"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <VStack spacing={4} pl={2}>
                    {/* Username input */}
                    <Box
                      width="full"
                      opacity={isSignUp ? 1 : 0}
                      height={isSignUp ? "auto" : "0px"}
                      overflow="hidden"
                      transition="opacity 300ms, height 300ms"
                    >
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
                        className="mt-1 text-white bg-gray-700 border-gray-600"
                        disabled={!isSignUp}
                      />
                    </Box>

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
                        className="mt-1 text-white bg-gray-700 border-gray-600"
                      />
                    </Box>

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
                        placeholder="At least 8 characters"
                        type="password"
                        className="mt-1 text-white bg-gray-700 border-gray-600"
                      />
                    </Box>

                    <Box width="full" mt={4}>
                      <Button
                        className="group/btn relative block h-10 w-full mx-auto rounded-md bg-[#18181B] font-medium text-white"
                        type="submit"
                        width="100%"
                        height="10"
                        bg="#18181B"
                        color="white"
                        position="relative"
                        _hover={{
                          bg: "#252529",
                        }}
                      >
                        {isSignUp ? "Sign up" : "Sign in"} &rarr;
                        <BottomGradient />
                      </Button>
                    </Box>
                  </VStack>
                </MotionBox>
              </AnimatePresence>

              <Flex align="center" justify="center" width="full" mt={2}>
                <Text fontSize="sm" color="gray.400">
                  {isSignUp
                    ? "Already have an account? "
                    : "Don't have an account? "}
                  <Link
                    color="blue.400"
                    onClick={() => setIsSignUp(!isSignUp)}
                    _hover={{
                      color: "blue.300",
                      transition: "all 0.2s ease",
                      textDecoration: "underline",
                    }}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </Link>
                </Text>
              </Flex>

              <Flex my={7} position="relative" width="100%" alignItems="center">
                <Box flex="1" h="1px" bg="gray.600" />
                <Text px={3} fontSize="sm" fontWeight="medium" color="gray.400">
                  or
                </Text>
                <Box flex="1" h="1px" bg="gray.600" />
              </Flex>

              <VStack spacing={4} width="full" pl={2}>
                {[
                  { Icon: IconBrandGithub, text: "Continue with GitHub" },
                  { Icon: FcGoogle, text: "Continue with Google" },
                  { Icon: IconBrandOnlyfans, text: "Continue with OnlyFans" },
                ].map(({ Icon, text }) => (
                  <Button
                    key={text}
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    height="10"
                    px={4}
                    mx="auto"
                    width="95%"
                    bg="#18181B"
                    color="gray.300"
                    borderRadius="md"
                    fontWeight="medium"
                    position="relative"
                    className="group/btn"
                    _hover={{
                      bg: "#252529",
                    }}
                  >
                    <Icon className="w-4 h-4 text-gray-300" />
                    <Text ml={2} fontSize="sm">
                      {text}
                    </Text>
                    <BottomGradient />
                  </Button>
                ))}
              </VStack>
            </form>

            <Flex mt="auto" justify="center">
              <Text fontSize="xs" color="gray.500">
                By signing up, you agree to our Terms and Privacy Policy
              </Text>
            </Flex>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}
