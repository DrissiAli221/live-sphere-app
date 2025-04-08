
  // Enhanced pencil hand-drawn animation
  const PencilStroke = ({ delay = 0 }) => (
    <motion.div
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay }}
      className="absolute bottom-0 left-0 right-0 h-1"
    >
      <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none">
        <motion.path
          d="M0,1 C10,0.5 15,1.5 25,1 C35,0.5 45,1.5 55,1 C65,0.5 75,1.5 85,1 C95,0.5 100,1 100,1"
          fill="none"
          stroke="#FFEC44"
          strokeWidth="1"
          strokeDasharray="3,3"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, delay }}
        />
      </svg>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        mass: 0.8,
        delay: 0.2
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <Box
        p={4}
        style={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(10px)",
          borderBottom: "2px solid black",
          boxShadow: "0 4px 0 rgba(250,204,21,0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        </Box>
      </motion.div>



  // Enhanced animated pencil sketch line with smoother animation
  const AnimatedPencilLine = ({ delay = 0 }) => (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        damping: 12,
        stiffness: 100,
      }}
      style={{ position: "relative", height: "4px", marginTop: "2px", marginBottom: "8px" }}
    >
      <svg width="100%" height="4" viewBox="0 0 300 4" preserveAspectRatio="none">
        <motion.path
          d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
          fill="none"
          stroke="rgba(250,204,21,0.8)"
          strokeWidth="1"
          strokeDasharray="5,3"
          initial={{ pathLength: 0, strokeDashoffset: 1000 }}
          animate={{ pathLength: 1, strokeDashoffset: 0 }}
          transition={{ duration: 1, delay }}
        />
      </svg>
    </motion.div>
  );

  // Enhanced hand-drawn circle with SVG path animation
  const HandDrawnCircle = ({ size = 40, top, left, right, bottom, delay = 0 }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.6 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 200,
      }}
      style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        top,
        left,
        right,
        bottom,
        zIndex: 1,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <motion.path
          d="M20,2 C28,2 36,10 38,18 C40,28 32,36 22,38 C12,40 4,32 2,22 C0,12 8,4 18,2 C19,1.9 19.5,2 20,2 Z"
          stroke="rgba(250,204,21,0.7)"
          strokeWidth="1"
          strokeDasharray="4,2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: delay + 0.2 }}
        />
      </svg>
    </motion.div>
  );

  return (
    <Flex
      height="100vh"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
      fontFamily="'Indie Flower', 'Comic Sans MS', cursive"
    >
      
      {/* Netflix Background Component */}
      <NetflixBackground />

      {/* Login/Signup Form */}
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
            mass: 0.8 
          } 
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
        {/* Image Section - 416x720 */}
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

          {/* Enhanced Animated Sketch Element: Yellow corner accent */}
          <motion.div
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: "80px", height: "80px", opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <motion.path
                d="M0,0 L70,0 C60,10 40,20 20,15 C5,10 0,5 0,0 Z"
                fill="none"
                stroke="#FFEC44"
                strokeWidth="1"
                strokeDasharray="3,2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
          </motion.div>

          {/* Hand-drawn circles positioned around the form */}
          <HandDrawnCircle size={50} top="15%" right="10%" delay={0.4} />
          <HandDrawnCircle size={30} bottom="20%" left="15%" delay={0.6} />
          <HandDrawnCircle size={60} bottom="5%" right="5%" delay={0.8} />

          {/* Content */}
          <VStack spacing={8} position="relative" zIndex="3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Text
                fontSize="4xl"
                fontWeight="bold"
                color="white"
                textAlign="center"
                style={{
                  textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
                }}
              >
                Welcome to{" "}
                <Text as="span" color="#FFEC44">
                  Live Sphere
                </Text>
              </Text>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Text
                color="whiteAlpha.800"
                textAlign="center"
                fontSize="lg"
                mt={2}
                lineHeight="1.6"
                style={{ maxWidth: "300px" }}
              >
                Join our community of creators and share your journey with the world!
              </Text>
            </motion.div>

            {/* Enhanced Spotlight effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              style={{ width: "100%", height: "100px", position: "relative" }}
            >
              <Spotlight
                className="left-0 -top-40 md:left-20 md:-top-20"
                fill="#FFEC44"
                opacity={0.15}
              />
            </motion.div>

            {/* Animated Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <VStack
                spacing={3}
                align="flex-start"
                mt={4}
                position="relative"
              >
                {[
                  "Live streaming made simple",
                  "Connect with your audience",
                  "Monetize your content",
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + idx * 0.2 }}
                    whileHover={{
                      x: 5,
                      transition: { duration: 0.2, ease: "easeInOut" }
                    }}
                  >
                    <Flex align="center">
                      <Box
                        as="span"
                        mr={2}
                        fontWeight="bold"
                        color="#FFEC44"
                        fontSize="lg"
                      >
                        ✓
                      </Box>
                      <Text color="whiteAlpha.900">{feature}</Text>
                    </Flex>
                  </motion.div>
                ))}

                {/* Hand-drawn underline */}
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                  style={{ position: "relative", marginTop: "10px" }}
                >
                  <svg width="100%" height="4" viewBox="0 0 300 4" preserveAspectRatio="none">
                    <motion.path
                      d="M0,2 C20,1 40,3 60,2 C80,1 100,3 120,2 C140,1 160,3 180,2 C200,1 220,3 240,2 C260,1 280,3 300,2"
                      fill="none"
                      stroke="rgba(250,204,21,0.6)"
                      strokeWidth="1"
                      strokeDasharray="3,2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 1.7 }}
                    />
                  </svg>
                </motion.div>
              </VStack>
            </motion.div>
          </VStack>
        </Box>

        {/* Form Section - 440x720 */}
        <MotionBox
          width="440px"
          height="720px"
          padding="80px 40px 40px"
          position="relative"
          bgColor="black"
        >
          <NoiseTexture />

          {/* Enhanced sketchy corners */}
          {[
            { top: 0, right: 0, rotate: 90 },
            { bottom: 0, right: 0, rotate: 180 },
            { bottom: 0, left: 0, rotate: 270 },
          ].map((pos, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
              style={{
                position: "absolute",
                width: "40px",
                height: "40px",
                zIndex: 1,
                ...pos,
                transform: `rotate(${pos.rotate}deg)`,
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <motion.path
                  d="M0,0 L40,0 C30,10 20,10 10,5 C0,0 0,0 0,0 Z"
                  stroke="#FFEC44"
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                />
              </svg>
            </motion.div>
          ))}

          {/* Form Heading */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="white"
              textAlign="center"
              mb={1}
            >
              {isSignUp ? "Create your account" : "Welcome back"}
            </Text>
          </motion.div>

          {/* Enhanced animated underline with SVG for more sketch-like feel */}
          <AnimatedPencilLine delay={0.3} />

          {/* Toggle between signup and login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Flex justify="center" mb={6}>
              <HStack spacing={4}>
                <motion.div
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  whileTap={{ y: 1 }}
                >
                  <Text
                    cursor="pointer"
                    color={isSignUp ? "#FFEC44" : "gray.400"}
                    fontWeight={isSignUp ? "bold" : "normal"}
                    textDecor={isSignUp ? "underline" : "none"}
                    textDecorationStyle="dashed"
                    onClick={() => setIsSignUp(true)}
                    position="relative"
                  >
                    Sign Up
                    {isSignUp && (
                      <motion.div
                        className="absolute -bottom-1 left-0 w-full h-0.5"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        style={{
                          backgroundImage: "linear-gradient(90deg, #FFEC44 70%, transparent 100%)",
                        }}
                      />
                    )}
                  </Text>
                </motion.div>
                <Text color="gray.500">|</Text>
                <motion.div
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  whileTap={{ y: 1 }}
                >
                  <Text
                    cursor="pointer"
                    color={!isSignUp ? "#FFEC44" : "gray.400"}
                    fontWeight={!isSignUp ? "bold" : "normal"}
                    textDecor={!isSignUp ? "underline" : "none"}
                    textDecorationStyle="dashed"
                    onClick={() => setIsSignUp(false)}
                    position="relative"
                  >
                    Log In
                    {!isSignUp && (
                      <motion.div
                        className="absolute -bottom-1 left-0 w-full h-0.5"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        style={{
                          backgroundImage: "linear-gradient(90deg, #FFEC44 70%, transparent 100%)",
                        }}
                      />
                    )}
                  </Text>
                </motion.div>
              </HStack>
            </Flex>
          </motion.div>

          {/* Social Buttons with Enhanced Animations */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <VStack spacing={3} mb={6}>
              {/* Advanced Google Button Animation */}
              <motion.div
                whileHover={{
                  scale: 1.03,
                  x: [0, -2, 2, -1, 1, 0],
                  transition: { duration: 0.3, scale: { duration: 0.2 } }
                }}
                whileTap={{ scale: 0.97, y: 2 }}
                style={{ width: "100%", position: "relative" }}
              >
                <Button
                  leftIcon={<FcGoogle />}
                  width="full"
                  variant="outline"
                  color="white"
                  style={{
                    border: "1px solid #333",
                    borderRadius: "0px",
                    background: "rgba(50,50,60,0.4)",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.8)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={false}
                    whileHover={{
                      x: [0, 5, 0],
                      transition: { duration: 0.5, repeat: Infinity, repeatType: "loop" }
                    }}
                  >
                    Continue with Google
                  </motion.div>
                  
                  {/* Enhanced sketch-style accent elements */}
                  {[
                    { top: -1, left: -1, width: "6px", height: "6px", borderTop: "1px dashed #FFEC44", borderLeft: "1px dashed #FFEC44" },
                    { top: -1, right: -1, width: "6px", height: "6px", borderTop: "1px dashed #FFEC44", borderRight: "1px dashed #FFEC44" },
                    { bottom: -1, left: -1, width: "6px", height: "6px", borderBottom: "1px dashed #FFEC44", borderLeft: "1px dashed #FFEC44" },
                    { bottom: -1, right: -1, width: "6px", height: "6px", borderBottom: "1px dashed #FFEC44", borderRight: "1px dashed #FFEC44" },
                  ].map((pos, idx) => (
                    <Box
                      key={idx}
                      position="absolute"
                      style={pos}
                    />
                  ))}
                </Button>
              </motion.div>

              {/* Advanced Github Button Animation */}
              <motion.div
                whileHover={{
                  scale: 1.03,
                  x: [0, -2, 2, -1, 1, 0],
                  transition: { duration: 0.3, scale: { duration: 0.2 } }
                }}
                whileTap={{ scale: 0.97, y: 2 }}
                style={{ width: "100%", position: "relative" }}
              >
                <Button
                  leftIcon={<IconBrandGithub size={18} />}
                  width="full"
                  variant="outline"
                  color="white"
                  style={{
                    border: "1px solid #333",
                    borderRadius: "0px",
                    background: "rgba(50,50,60,0.4)",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.8)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={false}
                    whileHover={{
                      x: [0, 5, 0],
                      transition: { duration: 0.5, repeat: Infinity, repeatType: "loop" }
                    }}
                  >
                    Continue with Github
                  </motion.div>
                  
                  {/* Enhanced sketch-style accent elements */}
                  {[
                    { top: -1, left: -1, width: "6px", height: "6px", borderTop: "1px dashed #FFEC44", borderLeft: "1px dashed #FFEC44" },
                    { top: -1, right: -1, width: "6px", height: "6px", borderTop: "1px dashed #FFEC44", borderRight: "1px dashed #FFEC44" },
                    { bottom: -1, left: -1, width: "6px", height: "6px", borderBottom: "1px dashed #FFEC44", borderLeft: "1px dashed #FFEC44" },
                    { bottom: -1, right: -1, width: "6px", height: "6px", borderBottom: "1px dashed #FFEC44", borderRight: "1px dashed #FFEC44" },
                  ].map((pos, idx) => (
                    <Box
                      key={idx}
                      position="absolute"
                      style={pos}
                    />
                  ))}
                </Button>
              </motion.div>
            </VStack>
          </motion.div>

          {/* OR Divider with Enhanced Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Flex align="center" mb={6}>
              <Box flex="1" height="1px" bg="gray.600" position="relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent)",
                  }}
                />
              </Box>
              <Text px={3} color="gray.400" fontSize="sm">
                OR
              </Text>
              <Box flex="1" height="1px" bg="gray.600" position="relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent)",
                  }}
                />
              </Box>
            </Flex>
          </motion.div>

          {/* Form Fields with Enhanced Animations */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <VStack spacing={4}>
              {isSignUp && (
                <>
                  <AnimatedInput
                    id="name"
                    label="Name"
                    placeholder="Enter your name"
                  />
                  <AnimatedInput
                    id="username"
                    label="Username"
                    placeholder="Choose a username"
                  />
                </>
              )}
              <AnimatedInput
                id="email"
                label="Email"
                placeholder="Enter your email"
                type="email"
              />
              <AnimatedInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />

              {/* Enhanced Primary Button Animation */}
              <Box mt={2} width="full">
                <SketchyButton
                  text={isSignUp ? "Create Account" : "Sign In"}
                  isPrimary={true}
                />
              </Box>

              {/* Improved Forget Password with Better Hover Animation */}
              {!isSignUp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  whileHover={{
                    scale: 1.05,
                    x: [0, -2, 2, 0],
                    transition: { duration: 0.3 }
                  }}
                  style={{ position: "relative", alignSelf: "flex-end", marginTop: "8px" }}
                >
                  <Link
                    color="gray.400"
                    fontSize="sm"
                    position="relative"
                    display="inline-block"
                  >
                    Forgot password?
                    <motion.div
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        height: "1px",
                        bottom: "-2px",
                        left: "0",
                        background: "linear-gradient(90deg, #FFEC44 0%, transparent 100%)",
                      }}
                    />
                  </Link>
                </motion.div>
              )}
            </VStack>
          </motion.form>

          {/* Terms Text with Enhanced Animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            style={{ marginTop: "24px" }}
          >
            <Text color="gray.500" fontSize="xs" textAlign="center">
              By continuing, you agree to our{" "}
              <motion.span
                style={{ position: "relative", display: "inline-block" }}
                whileHover={{
                  color: "#FFEC44",
                  transition: { duration: 0.2 }
                }}
              >
                <Link color="gray.400">Terms of Service</Link>
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    left: 0,
                    height: "1px",
                    background: "linear-gradient(90deg, #FFEC44 70%, transparent 100%)",
                  }}
                />
              </motion.span>{" "}
              and{" "}
              <motion.span
                style={{ position: "relative", display: "inline-block" }}
                whileHover={{
                  color: "#FFEC44",
                  transition: { duration: 0.2 }
                }}
              >
                <Link color="gray.400">Privacy Policy</Link>
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    left: 0,
                    height: "1px",
                    background: "linear-gradient(90deg, #FFEC44 70%, transparent 100%)",
                  }}
                />
              </motion.span>
            </Text>
          </motion.div>
        </MotionBox>
      </motion.div>
    </Flex>
  );
}