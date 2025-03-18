import { Heading, Flex, Box, Text } from "@chakra-ui/react";
import { baseImageOriginal } from "@/services/api";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel.jsx";

export function SliderCard() {
  return (
    <Box className="w-full my-6"> 
      <Heading as="h2" size="lg" mb={4}>Featured Content</Heading> 
      <Carousel className="w-full max-w-3xl mx-auto">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-video items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Box>
  );
} 

export default SliderCard;