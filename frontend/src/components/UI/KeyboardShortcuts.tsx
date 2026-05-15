import { useEffect } from 'react';
import { useMapStore } from '../../store/mapStore';

/**
 * Global keyboard shortcut handler
 * Mounts at the App level — no UI rendered, purely side-effects.
 *
 * Shortcuts:
 *   Ctrl+Z       → Undo last waypoint
 *   Ctrl+Shift+Z → Redo (not yet — placeholder)
 *   Delete/Backspace → Delete selected waypoint
 *   Escape       → Deselect waypoint / close sidebar
 *   Ctrl+E       → Switch to JSON tab
 *   Ctrl+S       → Save route (triggers toast if < 2 wp)
 *   1 / 2 / 3   → Switch map layer (Street / Satellite / Terrain)
 *   4            → Dark layer
 */
export function KeyboardShortcuts() {
  const store = useMapStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't fire shortcuts inside text inputs / textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        store.undoLast();
        store.addToast('info', 'Undo');
        return;
      }

      if (ctrl && e.key === 'e') {
        e.preventDefault();
        store.setActiveTab('json');
        return;
      }

      if (ctrl && e.key === 's') {
        e.preventDefault();
        if (store.waypoints.length < 2) {
          store.addToast('error', 'Need at least 2 waypoints to save.');
        } else {
          store.addToast('info', 'Use the Save button in the sidebar.');
        }
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedWaypointId !== null) {
        e.preventDefault();
        store.removeWaypoint(store.selectedWaypointId);
        store.addToast('info', 'Waypoint deleted');
        return;
      }

      if (e.key === 'Escape') {
        store.setSelectedWaypoint(null);
        return;
      }

      // Layer shortcuts
      const layerMap: Record<string, import('../../types').MapLayer> = {
        '1': 'street',
        '2': 'satellite',
        '3': 'terrain',
        '4': 'dark',
      };
      if (!ctrl && layerMap[e.key]) {
        store.setMapLayer(layerMap[e.key]);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  return null;
}
