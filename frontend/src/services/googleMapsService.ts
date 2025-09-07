import { Loader } from "@googlemaps/js-api-loader";

/**
 * Google Maps API Service
 * Handles loading and initializing Google Maps API with proper error handling
 */

let googleMapsLoader: Loader | null = null;
let googleMapsPromise: Promise<typeof google> | null = null;

/**
 * Configuration for Google Maps API
 */
const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  version: "weekly",
  libraries: ["geometry", "places"] as ("geometry" | "places")[],
  region: "IN", // India
  language: "en",
  mapIds: [], // Add your Map IDs here if using custom styling
};

/**
 * Load Google Maps API
 * @returns Promise that resolves to google maps API
 */
export const loadGoogleMaps = async (): Promise<typeof google> => {
  // Return existing promise if already loading/loaded
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if API key is provided
  if (
    !GOOGLE_MAPS_CONFIG.apiKey ||
    GOOGLE_MAPS_CONFIG.apiKey === "your_google_maps_api_key_here"
  ) {
    throw new Error(
      "Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file"
    );
  }

  // Create loader instance if not exists
  if (!googleMapsLoader) {
    googleMapsLoader = new Loader(GOOGLE_MAPS_CONFIG);
  }

  // Load the API
  googleMapsPromise = googleMapsLoader.load();

  try {
    const google = await googleMapsPromise;
    console.log("Google Maps API loaded successfully");
    return google;
  } catch (error) {
    console.error("Failed to load Google Maps API:", error);
    // Reset promise so we can try again
    googleMapsPromise = null;
    throw error;
  }
};

/**
 * Check if Google Maps API is already loaded
 */
export const isGoogleMapsLoaded = (): boolean => {
  return (
    typeof window !== "undefined" && !!window.google && !!window.google.maps
  );
};

/**
 * Get Google Maps API instance (must be loaded first)
 */
export const getGoogleMaps = (): typeof google => {
  if (!isGoogleMapsLoaded()) {
    throw new Error(
      "Google Maps API is not loaded. Call loadGoogleMaps() first."
    );
  }
  return window.google;
};

/**
 * Get default map configuration for Bengaluru
 * This function ensures Google Maps API is loaded before accessing types
 */
export const getDefaultMapConfig = (): google.maps.MapOptions => ({
  center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
  zoom: 11,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
  // Additional options for better UX
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: "cooperative",
  restriction: {
    latLngBounds: {
      north: 13.2,
      south: 12.7,
      east: 78.0,
      west: 77.0,
    },
    strictBounds: false,
  },
});

/**
 * Marker colors for different complaint statuses
 */
export const MARKER_COLORS = {
  reported: "#ef4444", // red-500
  acknowledged: "#f59e0b", // amber-500
  resolved: "#22c55e", // green-500
  selected: "#3b82f6", // blue-500
} as const;

/**
 * Create a custom marker icon
 */
export const createMarkerIcon = (
  color: string,
  scale: number = 1.2
): google.maps.Symbol => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  scale,
  fillColor: color,
  fillOpacity: 0.9,
  strokeColor: "#ffffff",
  strokeWeight: 1.5,
  anchor: new google.maps.Point(12, 24),
});

/**
 * Create an info window content for a complaint
 */
export const createInfoWindowContent = (complaint: {
  _id: string;
  status: "reported" | "acknowledged" | "resolved";
  timestamp: string;
  imageUrl: string;
}): string => `
  <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
       <div style="font-size: 11px; color: black;">
         <div style="font-weight: bold;">Complaint</div>
         <div style="font-family: monospace; margin-top: 2px;">${
           complaint._id
         }</div>
       </div>
      <span style="
        background: ${MARKER_COLORS[complaint.status]};
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      ">
        ${complaint.status}
      </span>
    </div>
    <div style="margin-bottom: 8px; font-size: 12px; color: #666;">
      ${new Date(parseInt(complaint.timestamp) * 1000).toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      })}
    </div>
    <div style="
      padding: 20px; 
      text-align: center; 
      color: #9ca3af; 
      background: #f9fafb; 
      border-radius: 6px; 
      margin-top: 8px;
      border: 1px solid #e5e7eb;
      font-size: 12px;
      font-weight: 500;
    ">
      📷 Image Display Feature Coming Soon...
    </div>
  </div>
`;

/**
 * Error types for Google Maps API
 */
export class GoogleMapsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "GoogleMapsError";
  }
}

/**
 * Handle Google Maps API errors
 */
export const handleGoogleMapsError = (error: unknown): string => {
  if (error instanceof GoogleMapsError) {
    return error.message;
  }

  if ((error as Error)?.message?.includes("API key")) {
    return "Invalid Google Maps API key. Please check your configuration.";
  }

  if ((error as Error)?.message?.includes("quota")) {
    return "Google Maps API quota exceeded. Please try again later.";
  }

  if ((error as Error)?.message?.includes("network")) {
    return "Network error loading Google Maps. Please check your internet connection.";
  }

  return "Failed to load Google Maps. Please try again.";
};
