import React, { useCallback } from "react";
import { Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineBookmarkAdd, MdOutlineBookmarkRemove } from "react-icons/md";

export const AnimatedWatchlistButton = React.memo(
  ({
    isInWatchList,
    handleAddToWatchlist,
    handleRemoveFromWatchlist,
    ...props
  }) => {
    const handleClick = useCallback(() => {
      // Prevent multiple rapid clicks
      if (isInWatchList) {
        handleRemoveFromWatchlist();
      } else {
        handleAddToWatchlist();
      }
    }, [isInWatchList, handleAddToWatchlist, handleRemoveFromWatchlist]);

    return (
      <AnimatePresence mode="wait">
        <Box
          as={motion.button}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileTap={{ scale: 0.98 }}
          bg={
            isInWatchList
              ? "rgba(239, 83, 80, 0.1)"
              : "rgba(100, 181, 246, 0.1)"
          }
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          onClick={handleClick}
          mt={4}
          py={3}
          px={6}
          gap={2}
          color={isInWatchList ? "red.400" : "blue.400"}
          borderRadius="full"
          backdropFilter="blur(8px)"
          border="2px solid"
          borderColor={
            isInWatchList
              ? "rgba(239, 83, 80, 0.3)"
              : "rgba(100, 181, 246, 0.3)"
          }
          _hover={{
            bg: isInWatchList
              ? "rgba(239, 83, 80, 0.2)"
              : "rgba(100, 181, 246, 0.2)",
            transform: "scale(1.02)",
          }}
          transition="all 0.2s"
          cursor="pointer"
          {...props}
        >
          <motion.div
            key={isInWatchList ? "remove" : "add"}
            initial={{
              opacity: 0,
              x: isInWatchList ? 50 : -50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: isInWatchList ? -50 : 50,
              transition: { duration: 0.1 },
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isInWatchList ? (
              <MdOutlineBookmarkRemove size="20px" />
            ) : (
              <MdOutlineBookmarkAdd size="20px" />
            )}
            {isInWatchList ? "REMOVE FROM WATCHLIST" : "ADD TO WATCHLIST"}
          </motion.div>
        </Box>
      </AnimatePresence>
    );
  }
);

AnimatedWatchlistButton.displayName = "AnimatedWatchlistButton";
