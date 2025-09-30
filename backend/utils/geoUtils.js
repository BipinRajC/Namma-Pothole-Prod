import { BANGALORE_BOUNDARIES } from "./constants.js";

// Check if coordinates are within Bangalore
function isWithinBangalore(lat, lng) {
  return (
    lat >= BANGALORE_BOUNDARIES.south &&
    lat <= BANGALORE_BOUNDARIES.north &&
    lng >= BANGALORE_BOUNDARIES.west &&
    lng <= BANGALORE_BOUNDARIES.east
  );
}

export { isWithinBangalore };
