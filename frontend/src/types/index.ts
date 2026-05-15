// ─── Core Domain Types ──────────────────────────────────────────────────────

export interface Waypoint {
  id: number;
  latitude: number;
  longitude: number;
  name?: string;
  altitude?: number;
  notes?: string;
  createdAt: string;
}

export interface Route {
  id: string;
  routeName: string;
  createdAt: string;
  waypoints: WaypointExport[];
  totalDistance?: number;
  estimatedTime?: number;
}

export interface WaypointExport {
  id: number;
  latitude: number;
  longitude: number;
  name?: string;
  altitude?: number;
}

export interface RouteExport {
  routeName: string;
  createdAt: string;
  waypoints: WaypointExport[];
  metadata?: {
    totalDistance: number;
    estimatedTime: number;
    waypointCount: number;
    units: string;
  };
}

// ─── Map Types ───────────────────────────────────────────────────────────────

export type MapLayer = 'street' | 'satellite' | 'terrain' | 'dark';

export interface MapState {
  center: [number, number];
  zoom: number;
  layer: MapLayer;
}

export interface ClickCoordinate {
  lat: number;
  lng: number;
}

// ─── App State Types ─────────────────────────────────────────────────────────

export type SidebarTab = 'waypoints' | 'json' | 'settings';

export interface AppToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// ─── Distance / Stats Types ──────────────────────────────────────────────────

export interface RouteStats {
  totalDistance: number;    // km
  estimatedTime: number;    // minutes (walking pace ~5km/h)
  segments: SegmentInfo[];
}

export interface SegmentInfo {
  from: number;
  to: number;
  distance: number;         // km
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiRoute {
  _id: string;
  routeName: string;
  waypoints: WaypointExport[];
  totalDistance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveRoutePayload {
  routeName: string;
  waypoints: WaypointExport[];
  totalDistance: number;
}
