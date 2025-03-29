import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

const VelocityScrollWrapper = ({ children }) => {
  return (
    <Flex
      position="relative"
      width="full"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      fontSize="2xl"
    >
      {children}
      <Box
        pointerEvents="none"
        position="absolute"
        insetY="0"
        left="0"
        width="25%"
        bgGradient="linear(to-r, var(--chakra-colors-background), transparent)"
      />
      <Box
        pointerEvents="none"
        position="absolute"
        insetY="0"
        right="0"
        width="25%"
        bgGradient="linear(to-l, var(--chakra-colors-background), transparent)"
      />
    </Flex>
  );
};

export default VelocityScrollWrapper;