import { useState, useCallback } from 'react';
import { useMapStore } from '../store/mapStore';
import { routeService } from '../services/routeService';

/**
 * Hook for managing saved routes from the backend
 */
export function useSavedRoutes() {
  const { waypoints, routeName, routeStats, addToast, setIsLoading } = useMapStore();
  const [savedRoutes, setSavedRoutes] = useState<import('../types').ApiRoute[]>([]);

  const fetchRoutes = useCallback(async () => {
    try {
      setIsLoading(true);
      const routes = await routeService.getAll();
      setSavedRoutes(routes);
    } catch {
      // Backend might not be running in dev mode
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const saveRoute = useCallback(async () => {
    if (waypoints.length < 2) {
      addToast('error', 'Add at least 2 waypoints to save a route.');
      return;
    }
    try {
      setIsLoading(true);
      await routeService.create({
        routeName,
        waypoints: waypoints.map((w) => ({
          id: w.id,
          latitude: w.latitude,
          longitude: w.longitude,
          name: w.name,
        })),
        totalDistance: routeStats?.totalDistance ?? 0,
      });
      addToast('success', `Route "${routeName}" saved!`);
      await fetchRoutes();
    } catch {
      addToast('error', 'Failed to save route. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, [waypoints, routeName, routeStats, addToast, setIsLoading, fetchRoutes]);

  return { savedRoutes, fetchRoutes, saveRoute };
}
