import type { RouteExport, Waypoint } from '../types';

/**
 * Generates the route JSON export object
 */
export function buildRouteExport(
  routeName: string,
  waypoints: Waypoint[],
  totalDistance = 0
): RouteExport {
  return {
    routeName,
    createdAt: new Date().toISOString(),
    waypoints: waypoints.map((w) => ({
      id: w.id,
      latitude: parseFloat(w.latitude.toFixed(7)),
      longitude: parseFloat(w.longitude.toFixed(7)),
      ...(w.name && { name: w.name }),
      ...(w.altitude !== undefined && { altitude: w.altitude }),
    })),
    metadata: {
      totalDistance: parseFloat(totalDistance.toFixed(4)),
      estimatedTime: parseFloat(((totalDistance / 60) * 60).toFixed(2)),
      waypointCount: waypoints.length,
      units: 'km',
    },
  };
}

/**
 * Stringify JSON with syntax highlighting markers for the viewer
 */
export function stringifyRoute(route: RouteExport): string {
  return JSON.stringify(route, null, 2);
}

/**
 * Download JSON as a file
 */
export function downloadJSON(data: RouteExport, filename = 'route.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Copy JSON string to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

/**
 * Parse imported JSON into Waypoint array
 */
export function parseImportJSON(raw: string): Waypoint[] {
  const parsed = JSON.parse(raw) as RouteExport;
  if (!parsed.waypoints || !Array.isArray(parsed.waypoints)) {
    throw new Error('Invalid route JSON: missing "waypoints" array');
  }
  return parsed.waypoints.map((w, i) => ({
    id: i + 1,
    latitude: w.latitude,
    longitude: w.longitude,
    name: w.name || `WP ${i + 1}`,
    altitude: w.altitude,
    createdAt: new Date().toISOString(),
  }));
}

/**
 * Syntax-highlight JSON string for rendering
 */
export function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) cls = 'json-key';
        else cls = 'json-string';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
