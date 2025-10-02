import { BANGALORE_BOUNDARIES } from "./constants.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as turf from "@turf/turf";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the GeoJSON file once
let zonesGeoJSON;
try {
  const geoJsonPath = join(__dirname, "..", "map.geojson");
  zonesGeoJSON = JSON.parse(readFileSync(geoJsonPath, "utf-8"));
} catch (error) {
  console.error("Error loading map.geojson:", error);
  zonesGeoJSON = null;
}

// Check if coordinates are within Bangalore
function isWithinBangalore(lat, lng) {
  return (
    lat >= BANGALORE_BOUNDARIES.south &&
    lat <= BANGALORE_BOUNDARIES.north &&
    lng >= BANGALORE_BOUNDARIES.west &&
    lng <= BANGALORE_BOUNDARIES.east
  );
}

/**
 * Get the zone information for given coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object|null} - Object containing {zone, corporation, zoneId}, or null if not found
 */
function getZoneFromCoordinates(lat, lng) {
  if (!zonesGeoJSON || !zonesGeoJSON.features) {
    console.error("GeoJSON data not loaded");
    return null;
  }

  // Create a point from the coordinates [longitude, latitude]
  const point = turf.point([lng, lat]);

  // Iterate through all features and check if the point is within any zone
  for (let i = 0; i < zonesGeoJSON.features.length; i++) {
    const feature = zonesGeoJSON.features[i];

    try {
      // Check if the point is within this feature's geometry
      if (turf.booleanPointInPolygon(point, feature)) {
        return {
          zone: feature.properties.Zone,
          corporation: feature.properties.Corporatio,
          zoneId: feature.id,
        };
      }
    } catch (error) {
      console.error(`Error checking point in polygon for feature ${i}:`, error);
    }
  }

  // Point is not within any zone
  return null;
}

export { isWithinBangalore, getZoneFromCoordinates };
