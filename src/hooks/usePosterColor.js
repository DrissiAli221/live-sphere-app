// usePosterColor.js
import { useState, useEffect } from "react";
import { extractColor } from "@/utils/helper";

export const usePosterColor = (posterPath, baseImageUrl) => {
  const [cardColor, setCardColor] = useState("hsl(220, 70%, 40%)"); // Default color
  const [cardLightColor, setCardLightColor] = useState("hsl(220, 70%, 60%)");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!posterPath || !baseImageUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const imgUrl = `${baseImageUrl}${posterPath}`;
    
    extractColor(imgUrl)
      .then((color) => {
        // Convert RGB to a format we can manipulate
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          // Set the base color
          setCardColor(`rgba(${r}, ${g}, ${b}, 0.9)`);
          
          // Create a lighter variant for accents - clamping to prevent overflow
          const rLight = Math.min(r + 40, 255);
          const gLight = Math.min(g + 40, 255);
          const bLight = Math.min(b + 40, 255);
          setCardLightColor(`rgba(${rLight}, ${gLight}, ${bLight}, 0.9)`);
        }
      })
      .catch((error) => {
        // Fallback to default colors if extraction fails
        console.log("Color extraction failed:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [posterPath, baseImageUrl]);

  return { cardColor, cardLightColor, isLoading };
};