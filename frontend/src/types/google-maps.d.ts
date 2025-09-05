/**
 * Google Maps API TypeScript declarations
 * Basic types for Google Maps functionality used in the app
 */

declare global {
  interface Window {
    google: typeof google;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element, opts?: MapOptions);
        setCenter(latlng: LatLng | LatLngLiteral): void;
        getCenter(): LatLng;
        setZoom(zoom: number): void;
        getZoom(): number;
        panTo(latLng: LatLng | LatLngLiteral): void;
        fitBounds(bounds: LatLngBounds): void;
        setMapTypeId(mapTypeId: MapTypeId): void;
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        mapTypeId?: MapTypeId;
        styles?: MapTypeStyle[];
      }

      interface MapTypeStyle {
        featureType?: string;
        elementType?: string;
        stylers?: Array<{ [key: string]: any }>;
      }

      class Marker {
        constructor(opts?: MarkerOptions);
        setMap(map: Map | null): void;
        getPosition(): LatLng | undefined;
        setPosition(latlng: LatLng | LatLngLiteral): void;
        setIcon(icon: Icon | string | Symbol): void;
        addListener(eventName: string, handler: Function): MapsEventListener;
      }

      interface MarkerOptions {
        position?: LatLng | LatLngLiteral;
        map?: Map;
        title?: string;
        icon?: Icon | string | Symbol;
      }

      interface Icon {
        url?: string;
        size?: Size;
        scaledSize?: Size;
        origin?: Point;
        anchor?: Point;
      }

      interface Symbol {
        path: SymbolPath | string;
        anchor?: Point;
        fillColor?: string;
        fillOpacity?: number;
        labelOrigin?: Point;
        rotation?: number;
        scale?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeWeight?: number;
      }

      enum SymbolPath {
        CIRCLE = 0,
        FORWARD_CLOSED_ARROW = 1,
        FORWARD_OPEN_ARROW = 2,
        BACKWARD_CLOSED_ARROW = 3,
        BACKWARD_OPEN_ARROW = 4
      }

      class InfoWindow {
        constructor(opts?: InfoWindowOptions);
        open(map?: Map, anchor?: MVCObject): void;
        close(): void;
        setContent(content: string | Element): void;
        getContent(): string | Element;
      }

      interface InfoWindowOptions {
        content?: string | Element;
        maxWidth?: number;
        pixelOffset?: Size;
        position?: LatLng | LatLngLiteral;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      class LatLngBounds {
        constructor(sw?: LatLng, ne?: LatLng);
        extend(point: LatLng | LatLngLiteral): LatLngBounds;
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }

      enum MapTypeId {
        HYBRID = 'hybrid',
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        TERRAIN = 'terrain'
      }

      class NavigationControl {
        constructor(opts?: NavigationControlOptions);
      }

      interface NavigationControlOptions {
        visualizePitch?: boolean;
      }

      enum ControlPosition {
        TOP_LEFT = 1,
        TOP_CENTER = 2,
        TOP_RIGHT = 3,
        LEFT_TOP = 4,
        RIGHT_TOP = 5,
        LEFT_CENTER = 6,
        RIGHT_CENTER = 7,
        LEFT_BOTTOM = 8,
        RIGHT_BOTTOM = 9,
        BOTTOM_LEFT = 10,
        BOTTOM_CENTER = 11,
        BOTTOM_RIGHT = 12
      }

      class MVCObject {}

      interface MapsEventListener {}

      namespace event {
        function addListener(
          instance: object,
          eventName: string,
          handler: Function
        ): MapsEventListener;
        function removeListener(listener: MapsEventListener): void;
      }
    }
  }
}

export {};