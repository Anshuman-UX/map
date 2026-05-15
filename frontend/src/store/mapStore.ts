import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  Waypoint,
  MapLayer,
  SidebarTab,
  AppToast,
  RouteStats,
} from '../types';
import { calculateRouteStats } from '../utils/haversine';
import { v4 as uuidv4 } from 'uuid';

// ─── State Interface ──────────────────────────────────────────────────────────

interface MapStore {
  // Waypoints
  waypoints: Waypoint[];
  selectedWaypointId: number | null;
  nextId: number;

  // History (for undo)
  history: Waypoint[][];

  // Map
  mapLayer: MapLayer;
  mapCenter: [number, number];
  mapZoom: number;
  showCoordPopup: boolean;
  coordPopupPos: { lat: number; lng: number } | null;

  // Route stats
  routeStats: RouteStats | null;

  // UI
  sidebarOpen: boolean;
  activeTab: SidebarTab;
  routeName: string;
  toasts: AppToast[];
  isLoading: boolean;

  // Actions – Waypoints
  addWaypoint: (lat: number, lng: number) => void;
  removeWaypoint: (id: number) => void;
  updateWaypoint: (id: number, updates: Partial<Waypoint>) => void;
  moveWaypoint: (id: number, lat: number, lng: number) => void;
  reorderWaypoints: (fromIdx: number, toIdx: number) => void;
  clearWaypoints: () => void;
  undoLast: () => void;
  setSelectedWaypoint: (id: number | null) => void;
  importWaypoints: (waypoints: Waypoint[]) => void;

  // Actions – Map
  setMapLayer: (layer: MapLayer) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setCoordPopup: (pos: { lat: number; lng: number } | null) => void;

  // Actions – UI
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setRouteName: (name: string) => void;
  addToast: (type: AppToast['type'], message: string) => void;
  removeToast: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMapStore = create<MapStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      waypoints: [],
      selectedWaypointId: null,
      nextId: 1,
      history: [],
      mapLayer: 'street',
      mapCenter: [20.5937, 78.9629], // India center
      mapZoom: 5,
      showCoordPopup: false,
      coordPopupPos: null,
      routeStats: null,
      sidebarOpen: true,
      activeTab: 'waypoints',
      routeName: 'My Route',
      toasts: [],
      isLoading: false,

      // ── Waypoint Actions ─────────────────────────────────────────────────

      addWaypoint: (lat, lng) => {
        set((state) => {
          const snapshot = [...state.waypoints];
          const newWaypoint: Waypoint = {
            id: state.nextId,
            latitude: lat,
            longitude: lng,
            name: `WP ${state.nextId}`,
            createdAt: new Date().toISOString(),
          };
          const updated = [...state.waypoints, newWaypoint];
          return {
            waypoints: updated,
            nextId: state.nextId + 1,
            history: [...state.history, snapshot].slice(-20), // keep last 20
            routeStats: calculateRouteStats(updated),
          };
        });
      },

      removeWaypoint: (id) => {
        set((state) => {
          const snapshot = [...state.waypoints];
          const updated = state.waypoints
            .filter((w) => w.id !== id)
            .map((w, i) => ({ ...w, id: i + 1, name: `WP ${i + 1}` }));
          return {
            waypoints: updated,
            nextId: updated.length + 1,
            history: [...state.history, snapshot].slice(-20),
            selectedWaypointId:
              state.selectedWaypointId === id ? null : state.selectedWaypointId,
            routeStats: calculateRouteStats(updated),
          };
        });
      },

      updateWaypoint: (id, updates) => {
        set((state) => {
          const updated = state.waypoints.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          );
          return { waypoints: updated };
        });
      },

      moveWaypoint: (id, lat, lng) => {
        set((state) => {
          const updated = state.waypoints.map((w) =>
            w.id === id ? { ...w, latitude: lat, longitude: lng } : w
          );
          return {
            waypoints: updated,
            routeStats: calculateRouteStats(updated),
          };
        });
      },

      reorderWaypoints: (fromIdx, toIdx) => {
        set((state) => {
          const arr = [...state.waypoints];
          const [moved] = arr.splice(fromIdx, 1);
          arr.splice(toIdx, 0, moved);
          const renumbered = arr.map((w, i) => ({
            ...w,
            id: i + 1,
            name: `WP ${i + 1}`,
          }));
          return {
            waypoints: renumbered,
            nextId: renumbered.length + 1,
            routeStats: calculateRouteStats(renumbered),
          };
        });
      },

      clearWaypoints: () => {
        set((state) => ({
          history: [...state.history, [...state.waypoints]].slice(-20),
          waypoints: [],
          nextId: 1,
          selectedWaypointId: null,
          routeStats: null,
        }));
      },

      undoLast: () => {
        set((state) => {
          if (state.history.length === 0) return {};
          const prev = state.history[state.history.length - 1];
          return {
            waypoints: prev,
            nextId: prev.length + 1,
            history: state.history.slice(0, -1),
            routeStats: calculateRouteStats(prev),
          };
        });
      },

      setSelectedWaypoint: (id) => set({ selectedWaypointId: id }),

      importWaypoints: (waypoints) => {
        set({
          waypoints,
          nextId: waypoints.length + 1,
          selectedWaypointId: null,
          history: [],
          routeStats: calculateRouteStats(waypoints),
        });
      },

      // ── Map Actions ──────────────────────────────────────────────────────

      setMapLayer: (layer) => set({ mapLayer: layer }),
      setMapCenter: (center) => set({ mapCenter: center }),
      setMapZoom: (zoom) => set({ mapZoom: zoom }),
      setCoordPopup: (pos) => set({ coordPopupPos: pos }),

      // ── UI Actions ───────────────────────────────────────────────────────

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setRouteName: (name) => set({ routeName: name }),

      addToast: (type, message) => {
        const id = uuidv4();
        set((state) => ({
          toasts: [...state.toasts, { id, type, message }],
        }));
        // Auto-remove after 3s
        setTimeout(() => {
          get().removeToast(id);
        }, 3000);
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      setIsLoading: (loading) => set({ isLoading: loading }),
    })),
    { name: 'WaypointMapStore' }
  )
);
