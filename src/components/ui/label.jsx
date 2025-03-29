import React, { forwardRef } from "react";
import { Text } from "@chakra-ui/react";

const Label = forwardRef(({ children, ...props }, ref) => (
  <Text
    ref={ref}
    as="label"
    fontSize="sm"
    fontWeight="medium"
    color="black"
    _dark={{
      color: "white",
    }}
    opacity={1}
    _disabled={{
      cursor: "not-allowed",
      opacity: 0.7,
    }}
    {...props}
  >
    {children}
  </Text>
));

Label.displayName = "Label";

export { Label };
