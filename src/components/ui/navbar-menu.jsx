import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Box, 
  Flex, 
  Image, 
  Text,
  IconButton
} from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


// Chakra-compatible motion components
const MotionBox = motion(Box);
const MotionText = motion(Text);

// Cursor component with increased size
const Cursor = ({ position }) => {
  return (
    <MotionBox
      animate={{
        ...position,
        transition: {
          type: "spring",
          damping: 30, 
          stiffness: 200, 
          mass: 0.6, 
          restDelta: 0.0001, 
          restSpeed: 0.0001, 
        },
      }}
      style={{ willChange: "transform" }}
      position="absolute"
      height={position.height ? `calc(${position.height}px + 4px)` : "75%"}
      width={position.width ? `calc(${position.width}px + 10px)` : "auto"}
      left={position.left ? position.left - 5 : 0}
      bg="black"
      borderRadius="full"
      zIndex={1}
      opacity={position.opacity}
      display={{ base: "none", md: "block" }}
    />
  );
};

// Custom hook for media query if not available from shadcn
const useResponsiveBreakpoint = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const checkIfDesktop = () => {
        setIsDesktop(window.innerWidth >= 768);
      };
      
      // Set initial value
      checkIfDesktop();
      
      // Add event listener for resize
      window.addEventListener('resize', checkIfDesktop);
      
      // Clean up
      return () => window.removeEventListener('resize', checkIfDesktop);
    }
    
    return undefined;
  }, []);
  
  return isDesktop;
};

// MenuItem with improved performance and dynamic width
const MenuItem = ({ setActive, active, item, children, setPosition, isMobile, onMobileItemClick }) => {
  const ref = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState("center");
  const [dropdownWidth, setDropdownWidth] = useState("auto");
  const [childrenWidth, setChildrenWidth] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && active === item) {
      const contentWidth = contentRef.current.getBoundingClientRect().width;
      setChildrenWidth(contentWidth);
    }
  }, [active, item, children]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    
    if (ref?.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      const menuItemRect = ref.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      if (menuItemRect.left < 100) {
        setDropdownPosition("left");
        setDropdownWidth("auto");
      } else if (viewportWidth - menuItemRect.right < 100) {
        setDropdownPosition("right");
        setDropdownWidth("auto");
      } else {
        setDropdownPosition("center");
        setDropdownWidth(
          item === "COLLECTIONS"
            ? "650px"
            : item === "EXPLORE"
            ? "150px"
            : "auto"
        );
      }

      if (setPosition) {
        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
          height,
        });
      }

      setActive(item);
    }
  };

  const toggleCollapsible = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
      if (onMobileItemClick) onMobileItemClick(item);
    }
  };

  return (
    <Box
      as="li"
      ref={ref}
      position="relative"
      onMouseEnter={handleMouseEnter}
      zIndex={10}
      px={{ base: 0, md: 5 }}
      py={{ base: 2, md: 3 }}
      color={active === item && !isMobile ? "white" : "black"}
      sx={active === item && !isMobile ? { mixBlendMode: "difference" } : {}}
      height="100%"
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      cursor="pointer"
      width={{ base: "100%", md: "auto" }}
      style={{ willChange: active === item && !isMobile ? "transform, color" : "auto" }}
    >
      {isMobile && children ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2">
            <span>{item}</span>
            <span>{isOpen ? "−" : "+"}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="py-2 pl-4 mt-2 border-l border-gray-200">
            {children}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <MotionText
          transition={{ duration: 0.2 }}
          fontWeight="medium"
          zIndex={10}
          position="relative"
          whiteSpace="nowrap"
          w={{ base: "100%", md: "auto" }}
          display="flex"
          justifyContent={{ base: "space-between", md: "flex-start" }}
          alignItems="center"
          onClick={isMobile ? () => {} : undefined}
        >
          {item}
        </MotionText>
      )}
      
      {/* Desktop dropdown */}
      {!isMobile && active === item && (
        <Box
          position="absolute"
          top="100%"
          left={
            dropdownPosition === "center"
              ? "50%"
              : dropdownPosition === "right"
              ? "auto"
              : "0"
          }
          right={dropdownPosition === "right" ? "0" : "auto"}
          transform={
            dropdownPosition === "center" ? "translateX(-50%)" : "none"
          }
          pt="0.75rem"
          zIndex={20}
          minWidth={dropdownWidth}
          width={
            childrenWidth > 0
              ? Math.max(childrenWidth + 32, parseInt(dropdownWidth)) + "px"
              : dropdownWidth
          }
        >
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            bg="white"
            backdropFilter="blur(8px)"
            borderRadius="2xl"
            overflow="hidden"
            border="1px"
            borderColor="gray.200"
            boxShadow="xl"
            style={{ willChange: "transform, opacity" }}
            position="relative"
          >
            <Box
              position="absolute"
              inset="0"
              zIndex={1}
              opacity={0.5}
              overflow="hidden"
              borderRadius="2xl"
            >
              <FlickeringGrid
                squareSize={3}
                gridGap={5}
                flickerChance={0.3}
                color="#3b82f6"
                maxOpacity={0.3}
                className="w-full h-full"
              />
            </Box>
            <Box ref={contentRef} width="100%" height="full" p={4} position="relative" zIndex={2}>
              {children}
            </Box>
          </MotionBox>
        </Box>
      )}
    </Box>
  );
};

// Menu component with improved animation performance and FlickeringGrid background
const Menu = ({ children }) => {
  const [active, setActive] = useState(null);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
    height: 0,
  });
  const isDesktop = useResponsiveBreakpoint();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const handleMobileItemClick = (item) => {
    setActiveItem(activeItem === item ? null : item);
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        setPosition,
        setActive,
        active,
        isMobile: !isDesktop,
        onMobileItemClick: handleMobileItemClick,
      });
    }
    return child;
  });

  return (
    <>
      {/* Desktop Menu */}
      {isDesktop ? (
        <Flex
          as="ul"
          position="relative"
          onMouseLeave={() => {
            setActive(null);
            setPosition((prev) => ({
              ...prev,
              opacity: 0,
            }));
          }}
          borderRadius="full"
          border={"2px solid black"}
          backdropFilter="blur(10px)"
          _hover={{
            transition: "all 0.2s ease-in-out",
          }}
          boxShadow="md"
          justify="center"
          align="center"
          px={4}
          py={2}
          height="50px"
          listStyleType="none"
          overflow="visible"
          zIndex={1000}
          bg="rgba(255, 255, 255, 0.8)"
          sx={{
            "& > li": {
              zIndex: 10,
            },
          }}
        >
          <Box
            position="absolute"
            inset="0"
            borderRadius="full"
            overflow="hidden"
            zIndex={1}
          >
            <FlickeringGrid
              squareSize={3}
              gridGap={6}
              flickerChance={0.5}
              maxOpacity={0.3}
              className="w-full h-full"
            />
          </Box>

          {childrenWithProps}
          <Cursor position={position} />
        </Flex>
      ) : (
        /* Mobile Menu */
        <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DrawerTrigger asChild>
            <IconButton
              aria-label="Open menu"
              icon={<Box>☰</Box>}
              variant="outline"
              onClick={() => setIsMobileMenuOpen(true)}
              borderRadius="full"
              border="2px solid black"
              bg="rgba(255, 255, 255, 0.8)"
              _hover={{
                bg: "rgba(255, 255, 255, 0.9)",
              }}
              ml="auto"
              display="flex"
            />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerDescription>
                Navigate through our site options
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2">
              <ul className="space-y-2 list-none">
                {childrenWithProps}
              </ul>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <button className="w-full px-4 py-2 text-white bg-black rounded-full">
                  Close Menu
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

// ProductItem with dynamic width for both mobile and desktop
const ProductItem = ({ title, description, href, src }) => {
  return (
    <ChakraLink
      href={href}
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      gap={3}
      width="100%"
      position="relative"
      zIndex={2}
      pb={{ base: 4, md: 0 }}
      mb={{ base: 4, md: 0 }}
      borderBottom={{ base: "1px solid", md: "none" }}
      borderColor="gray.200"
      _last={{ borderBottom: "none", mb: 0, pb: 0 }}
    >
      <Image
        src={src}
        width={{ base: "100%", md: 140 }}
        height={{ base: "auto", md: 70 }}
        alt={title}
        borderRadius="md"
        boxShadow="2xl"
        objectFit="cover"
        mb={{ base: 2, md: 0 }}
      />
      <Box flexGrow={1}>
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" mb={1} color="black">
          {title}
        </Text>
        <Text color="gray.700" fontSize="sm">
          {description}
        </Text>
      </Box>
    </ChakraLink>
  );
};

const HoveredLink = ({ children, ...rest }) => {
  return (
    <ChakraLink 
      {...rest} 
      color="gray.700" 
      _hover={{ color: "black" }} 
      position="relative" 
      zIndex={2}
      display="block"
      width="100%"
      py={2}
      borderBottom={{ base: "1px solid", md: "none" }}
      borderColor="gray.200"
      _last={{ borderBottom: "none" }}
    >
      {children}
    </ChakraLink>
  );
};

export { MenuItem, Menu, ProductItem, HoveredLink, Cursor };