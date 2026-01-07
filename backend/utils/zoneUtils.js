import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load GeoJSON file
let zonesGeoJSON = null;

/**
 * Load the zones GeoJSON file
 */
function loadZonesGeoJSON() {
  if (!zonesGeoJSON) {
    const geoJSONPath = path.join(__dirname, "./map.geojson");
    const geoJSONData = fs.readFileSync(geoJSONPath, "utf8");
    zonesGeoJSON = JSON.parse(geoJSONData);
  }
  return zonesGeoJSON;
}

/**
 * Zone mapping based on GeoJSON properties
 * Maps zone ID (0-9) to zone name (Corporation-Zone format)
 */
const ZONE_MAPPING = {
  1: "North-Zone2",
  2: "East-Zone2",
  3: "Central-Zone2",
  4: "North-Zone1",
  5: "East-Zone1",
  6: "Central-Zone1",
  7: "West-Zone2",
  8: "South-Zone2",
  9: "West-Zone1",
  10: "South-Zone1",
};

/**
 * Get zone ID (0-based index) from GeoJSON property ID
 * @param {number} geoJSONId - ID from GeoJSON properties (1-10)
 * @returns {number} - 0-based zone ID (0-9)
 */
function getZoneIdFromGeoJSONId(geoJSONId) {
  return geoJSONId - 1; // Convert 1-based to 0-based
}

/**
 * Determine which zone a lat/lng coordinate belongs to
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Object|null} - { zoneName: "South-Zone1", zoneId: 9, geoJSONId: 10 } or null if not in any zone
 */
export function getZoneFromCoordinates(latitude, longitude) {
  try {
    const geoJSON = loadZonesGeoJSON();
    const pt = point([longitude, latitude]); // Note: Turf uses [lng, lat] format

    // Check each zone polygon
    for (const feature of geoJSON.features) {
      if (booleanPointInPolygon(pt, feature)) {
        const geoJSONId = feature.properties.id;
        const zoneName = ZONE_MAPPING[geoJSONId];
        const zoneId = getZoneIdFromGeoJSONId(geoJSONId);

        return {
          zoneName, // e.g., "South-Zone1"
          zoneId, // 0-9 (0-based index)
          geoJSONId, // 1-10 (original ID from GeoJSON)
          corporation: feature.properties.Corporatio,
          zone: feature.properties.Zone,
        };
      }
    }

    // Point not in any zone
    return null;
  } catch (error) {
    console.error("Error determining zone from coordinates:", error);
    return null;
  }
}

/**
 * Get all available zones
 * @returns {Array} - Array of zone objects
 */
export function getAllZones() {
  return Object.entries(ZONE_MAPPING).map(([geoJSONId, zoneName]) => ({
    zoneName,
    zoneId: getZoneIdFromGeoJSONId(parseInt(geoJSONId)),
    geoJSONId: parseInt(geoJSONId),
  }));
}

/**
 * Get zone name from zone ID
 * @param {number} zoneId - 0-based zone ID (0-9)
 * @returns {string|null} - Zone name like "South-Zone1"
 */
export function getZoneNameFromId(zoneId) {
  const geoJSONId = zoneId + 1; // Convert 0-based to 1-based
  return ZONE_MAPPING[geoJSONId] || null;
}

/**
 * Validate if a zone ID is valid
 * @param {number} zoneId - 0-based zone ID
 * @returns {boolean}
 */
export function isValidZoneId(zoneId) {
  return zoneId >= 0 && zoneId <= 9;
}

/**
 * Validate if a zone name is valid
 * @param {string} zoneName
 * @returns {boolean}
 */
export function isValidZoneName(zoneName) {
  return Object.values(ZONE_MAPPING).includes(zoneName);
}
