import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../store/mapStore';

/**
 * Hook to fly the map to a specific waypoint
 */
export function useFlyToWaypoint() {
  const map = useMap();
  return (lat: number, lng: number, zoom = 15) => {
    map.flyTo([lat, lng], zoom, { duration: 1.2, easeLinearity: 0.25 });
  };
}

/**
 * Hook to locate user's current position
 */
export function useLocateUser() {
  const { setMapCenter, setMapZoom, addToast } = useMapStore();

  return () => {
    if (!navigator.geolocation) {
      addToast('error', 'Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        addToast('success', `Located at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      () => {
        addToast('error', 'Unable to retrieve your location.');
      }
    );
  };
}

/**
 * Hook to sync Leaflet map view with store state
 */
export function useMapSync(
  center: [number, number],
  zoom: number
) {
  const map = useMap();
  const prevCenter = useRef(center);
  const prevZoom = useRef(zoom);

  useEffect(() => {
    if (
      prevCenter.current[0] !== center[0] ||
      prevCenter.current[1] !== center[1] ||
      prevZoom.current !== zoom
    ) {
      map.setView(center, zoom, { animate: true });
      prevCenter.current = center;
      prevZoom.current = zoom;
    }
  }, [center, zoom, map]);
}

/**
 * Hook to handle map click events
 */
export function useMapClickHandler() {
  const { addWaypoint, setCoordPopup } = useMapStore();
  const map = useMap();

  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      addWaypoint(lat, lng);
      setCoordPopup({ lat, lng });
    };

    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, addWaypoint, setCoordPopup]);
}

/**
 * Custom hook for drag-to-reorder waypoint list items
 */
export function useDragReorder(reorder: (from: number, to: number) => void) {
  const dragFrom = useRef<number | null>(null);

  return {
    onDragStart: (idx: number) => { dragFrom.current = idx; },
    onDragOver: (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      if (dragFrom.current === null || dragFrom.current === idx) return;
      reorder(dragFrom.current, idx);
      dragFrom.current = idx;
    },
    onDragEnd: () => { dragFrom.current = null; },
  };
}
