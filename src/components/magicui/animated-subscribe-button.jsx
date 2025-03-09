"use client";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";

export const AnimatedSubscribeButton = React.forwardRef(
  (
    {
      subscribeStatus = false,
      onClick,
      onSubscribe, // New prop for subscribing action
      onUnsubscribe, // New prop for unsubscribing action
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isSubscribed, setIsSubscribed] = useState(subscribeStatus);

    // Ensure we only have two children, both of which should be <span> elements
    if (
      React.Children.count(children) !== 2 ||
      !React.Children.toArray(children).every(
        (child) => React.isValidElement(child) && child.type === "span"
      )
    ) {
      throw new Error(
        "AnimatedSubscribeButton expects two children, both of which must be <span> elements."
      );
    }

    const childrenArray = React.Children.toArray(children);
    const initialChild = childrenArray[0];
    const changeChild = childrenArray[1];

    // Apply the className from the parent component
    return (
      <AnimatePresence mode="wait">
        {isSubscribed ? (
          <motion.button
            ref={ref}
            className={clsx(
              "relative flex h-10 w-fit items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-primary-foreground", // Default styles
              className // Allow the className from the parent to be passed down
            )}
            onClick={(e) => {
              setIsSubscribed(false);
              onClick?.(e); // Call the general onClick if provided
              onUnsubscribe?.(e); // Call the unsubscribe-specific handler
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
          >
            <motion.span
              key="action"
              className="relative flex h-full w-full items-center justify-center font-semibold"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
            >
              {changeChild} {/* Use children for subscribed state */}
            </motion.span>
          </motion.button>
        ) : (
          <motion.button
            ref={ref}
            className={clsx(
              "relative flex h-10 w-fit cursor-pointer items-center justify-center rounded-lg border-none bg-primary px-6 text-primary-foreground", // Default styles
              className // Allow the className from the parent to be passed down
            )}
            onClick={(e) => {
              setIsSubscribed(true);
              onClick?.(e); // Call the general onClick if provided
              onSubscribe?.(e); // Call the subscribe-specific handler
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
          >
            <motion.span
              key="reaction"
              className="relative flex items-center justify-center font-semibold"
              initial={{ x: 0 }}
              exit={{ x: 50, transition: { duration: 0.1 } }}
            >
              {initialChild} {/* Use children for unsubscribed state */}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  }
);

AnimatedSubscribeButton.displayName = "AnimatedSubscribeButton";
