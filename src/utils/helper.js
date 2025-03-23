export function resolveRatingColor(rating) {
  if (rating > 8.5) {
    return "#1E88E5"; // Vibrant blue for excellent ratings
  } else if (rating > 7.5) {
    return "#43A047"; // Bright green for very good ratings
  } else if (rating > 6.5) {
    return "#FFA000"; // Golden amber for good ratings
  } else if (rating > 5.5) {
    return "#E53935"; // Bright red for mediocre ratings
  } else {
    return "#616161"; // Dark gray for poor ratings
  }
}

export function convertMinutesToHours(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Helper function to convert RGB to HSL
export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }

    h = Math.round(h * 60);
  }

  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return [h, s, l];
};

// convert average vote to percentage
export const voteToPercentage = (vote) => {
  return vote * 10;
};

// Add this to your component or in a constants file
export const popularStreamingCompanies = [
  { id: 213, name: "Netflix" },
  { id: 1825, name: "Amazon Prime Video" },
  { id: 2, name: "Disney" },
  { id: 3340, name: "HBO Max" },
  { id: 2552, name: "Apple TV+" },
  { id: 4, name: "Paramount" },
  { id: 453, name: "Hulu" },
  { id: 58, name: "Sony Pictures" },
  { id: 174, name: "Warner Bros. Pictures" },
  { id: 7493, name: "Peacock" },
];

//resolve star rating allowing showHalf
export const resolveStarRating = (rating) => {
  if (rating >= 9) return 5;
  if (rating >= 8) return 4.5;
  if (rating >= 7) return 4;
  if (rating >= 6) return 3.5;
  if (rating >= 5) return 3;
  if (rating >= 4) return 2.5;
  if (rating >= 3) return 2;
  if (rating >= 2) return 1.5;
  return 1;
};

//resolve star color
export const resolveStarRatingColor = (rating) => {
  if (rating >= 8.5) return "green"; // Excellent (9.0-10.0)
  if (rating >= 7) return "yellow"; // Very good (7.5-8.9)
  if (rating >= 6) return "teal"; // Good (6.0-7.4)
  if (rating >= 5) return "orange"; // Average (5.0-5.9)
  if (rating >= 3) return "orange"; // Below average (3.0-4.9)
  if (rating > 0) return "red"; // Poor (0.1-2.9)
  return "gray"; // No rating (0)
};

// resolve rating number (1000 -> 1k)
export const resolveRatingNumber = (rating) => {
  if (rating >= 1000) return `${(rating / 1000).toFixed(1)}K`;
  return rating;
};

// truncate
// Helper function to truncate text
  export const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };


