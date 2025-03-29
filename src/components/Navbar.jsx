import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import React from "react";
import { useAuth } from "@/context/AuthProvider";

const Navbar = () => {
  // Navbar will only handle the UI, so we only need the user and logout function from the AuthProvider
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box position="absolute" top={0} width='full' zIndex={100}>
      <Container
        maxW={"container.xl"}
        zIndex={100} // Higher than any other z-index in your app
      >
        <Flex justifyContent={"space-between"} py={4}>
          <Link to="/">
            <Box
              fontSize={24}
              fontWeight={"bold"}
              color={"red"}
              letterSpacing={"widest"}
              fontFamily={"monospace"}
            >
              Live Sphere
            </Box>
          </Link>
          {/* Desktop Navbar */}
          <Flex gap={4}>
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            <Link to="/shows">TV Shows</Link>
            <Link to="/search">Search</Link>

            {/* Conditional rendering based on user authentication */}
            {user ? (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={user.displayName} />
                    <Avatar.Image src={user.photoURL} />
                  </Avatar.Root>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item as={Link} to="/profile">
                        Profile
                      </Menu.Item>
                      <Menu.Item as={Link} to="/watchlist">
                        Watchlist
                      </Menu.Item>
                      <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            ) : (
              <Link to="/login">
                <Text>Login</Text>
              </Link>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
