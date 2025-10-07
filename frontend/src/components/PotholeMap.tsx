import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { StatusBadge } from "./StatusBadge";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  loadGoogleMaps,
  isGoogleMapsLoaded,
  getDefaultMapConfig,
  MARKER_COLORS,
  createMarkerIcon,
  createInfoWindowContent,
  handleGoogleMapsError,
} from "@/services/googleMapsService";

interface PotholeMapProps {
  complaints: Complaint[];
  selectedComplaint?: Complaint | null;
  onComplaintSelect?: (complaint: Complaint) => void;
  isLoading?: boolean;
  isFullScreen?: boolean; // New prop for full screen mode
}

// Note: Map configuration moved to googleMapsService.ts

/**
 * Interactive map component showing pothole complaints as pins
 * Uses Google Maps API with hover tooltips showing images
 */
export const PotholeMap = ({
  complaints,
  selectedComplaint,
  onComplaintSelect,
  isLoading,
  isFullScreen = false,
}: PotholeMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [markerClusterer, setMarkerClusterer] =
    useState<MarkerClusterer | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (!mapRef.current) return;

        // Load Google Maps API
        await loadGoogleMaps();

        // Create map instance
        const map = new google.maps.Map(mapRef.current, getDefaultMapConfig());

        // Create info window
        const infoWindowInstance = new google.maps.InfoWindow({
          maxWidth: 300,
          pixelOffset: new google.maps.Size(0, -10),
        });

        setMapInstance(map);
        setInfoWindow(infoWindowInstance);
        setMapError(null);
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(handleGoogleMapsError(error));
      }
    };

    initializeMap();
  }, []);

  // Update markers when complaints change
  useEffect(() => {
    if (!mapInstance || !infoWindow) return;

    // Clear existing marker clusterer
    if (markerClusterer) {
      markerClusterer.clearMarkers();
    }

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    if (complaints.length === 0) {
      setMarkers([]);
      setMarkerClusterer(null);
      return;
    }

    const newMarkers: google.maps.Marker[] = [];

    complaints.forEach((complaint) => {
      const marker = new google.maps.Marker({
        position: { lat: complaint.latitude, lng: complaint.longitude },
        title: `Complaint ${complaint.complaintId.slice(-8)}`,
        icon: createMarkerIcon(MARKER_COLORS[complaint.status]),
      });

      // Hover events
      marker.addListener("mouseover", () => {
        infoWindow.setContent(createInfoWindowContent(complaint));
        infoWindow.open(mapInstance, marker);
      });

      marker.addListener("mouseout", () => {
        infoWindow.close();
      });

      // Click event
      marker.addListener("click", () => {
        onComplaintSelect?.(complaint);
        mapInstance.panTo(marker.getPosition()!);
        mapInstance.setZoom(15);
      });

      newMarkers.push(marker);
    });

    // Create marker clusterer to manage markers
    const clusterer = new MarkerClusterer({
      markers: newMarkers,
      map: mapInstance,
    });

    setMarkers(newMarkers);
    setMarkerClusterer(clusterer);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        bounds.extend(marker.getPosition()!);
      });
      mapInstance.fitBounds(bounds);

      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(
        mapInstance,
        "bounds_changed",
        () => {
          if (mapInstance.getZoom()! > 15) {
            mapInstance.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        }
      );
    }
    // We intentionally omit markers and markerClusterer from dependencies
    // as they are being set within this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, complaints, infoWindow, onComplaintSelect]);

  // Highlight selected complaint
  useEffect(() => {
    if (!selectedComplaint || !mapInstance) return;

    const marker = markers.find((m) => {
      const pos = m.getPosition();
      return (
        pos &&
        Math.abs(pos.lat() - selectedComplaint.latitude) < 0.0001 &&
        Math.abs(pos.lng() - selectedComplaint.longitude) < 0.0001
      );
    });

    if (marker) {
      mapInstance.panTo(marker.getPosition()!);
      mapInstance.setZoom(16);

      // Temporarily change marker color and size for selection
      marker.setIcon(createMarkerIcon(MARKER_COLORS.selected, 1.5));

      // Reset after 3 seconds
      setTimeout(() => {
        marker.setIcon(
          createMarkerIcon(MARKER_COLORS[selectedComplaint.status])
        );
      }, 3000);
    }
  }, [selectedComplaint, mapInstance, markers]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pothole Locations Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Pothole Locations Map
          {complaints.length > 0 && (
            <Badge variant="secondary">
              {complaints.length} complaint{complaints.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div
          ref={mapRef}
          className={`w-full rounded-lg border bg-muted ${
            isFullScreen ? "h-[calc(100vh-140px)]" : "h-96"
          }`}
          style={{
            minHeight: isFullScreen ? "700px" : "400px",
          }}
        >
          {!isGoogleMapsLoaded() && !mapError && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Map loading...</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span>Reported</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Resolved</span>
          </div>
        </div>

        {complaints.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No complaints to display on the map
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Legacy script loader function - now using @googlemaps/js-api-loader
// This is kept for backward compatibility but is deprecated
export const loadGoogleMapsScript = async (apiKey?: string): Promise<void> => {
  console.warn(
    "loadGoogleMapsScript is deprecated. Use loadGoogleMaps from googleMapsService instead."
  );
  try {
    await loadGoogleMaps();
  } catch (error) {
    throw new Error("Failed to load Google Maps API");
  }
};
