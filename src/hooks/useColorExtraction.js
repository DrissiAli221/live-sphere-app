import React, { useState, useEffect, useRef } from 'react';
import ColorThief from 'color-thief-react';
import { rgbToHsl } from '@/utils/helper';


// Add this function before your component return statement
export const useColorExtraction = (posterPath) => {
    const [colors, setColors] = useState({
      accent: 'hsl(210, 70%, 60%)',
      accentDark: 'hsl(210, 70%, 30%)'
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef(null);
  
    useEffect(() => {
      // Create a hidden image element to load the poster
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = `${baseImageOriginal}${posterPath}`;
      
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(img, 3);
          
          if (palette && palette.length > 0) {
            // Get the most vibrant color from the palette
            const dominantColor = palette[0];
            const secondaryColor = palette[1];
            
            // Convert RGB to HSL to better control brightness and saturation
            const [h, s, l] = rgbToHsl(dominantColor[0], dominantColor[1], dominantColor[2]);
            
            // Create accent colors with controlled saturation and lightness
            setColors({
              accent: `hsl(${h}, 70%, 60%)`,
              accentDark: `hsl(${h}, 70%, 30%)`
            });
          }
        } catch (error) {
          console.error("Error extracting colors:", error);
        }
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        console.error("Failed to load image for color extraction");
        setIsLoaded(true);
      };
    }, [posterPath]);
  
    return { colors, isLoaded };
  };