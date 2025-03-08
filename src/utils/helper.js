export function resolveRatingColor( rating ){
    if ( rating > 8.5 ) {
        return "#91CB5F";
    } else if ( rating > 7.5 ) {
        return "#F2DF57";
    } else if ( rating > 6.5 ) {
        return "#F4AD3C";
    } else if ( rating > 5.5 ) {
        return "#B93B22";
    } else {
        return "#4B525D";
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
  