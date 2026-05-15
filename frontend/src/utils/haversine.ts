import type { Waypoint, RouteStats, SegmentInfo } from '../types';

/**
 * Haversine formula: calculates distance between two lat/lng points in km
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculates full route statistics including per-segment distances and estimated time
 */
export function calculateRouteStats(waypoints: Waypoint[]): RouteStats | null {
  if (waypoints.length < 2) return null;

  const segments: SegmentInfo[] = [];
  let totalDistance = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const dist = haversineDistance(
      waypoints[i].latitude,
      waypoints[i].longitude,
      waypoints[i + 1].latitude,
      waypoints[i + 1].longitude
    );
    segments.push({ from: waypoints[i].id, to: waypoints[i + 1].id, distance: dist });
    totalDistance += dist;
  }

  // Estimated time at 60 km/h (drone/vehicle speed)
  const estimatedTime = (totalDistance / 60) * 60; // in minutes

  return { totalDistance, estimatedTime, segments };
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(2)} km`;
}

/**
 * Format time in minutes
 */
export function formatTime(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)}s`;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

/**
 * Format coordinate for display
 */
export function formatCoord(val: number, type: 'lat' | 'lng'): string {
  const dir = type === 'lat' ? (val >= 0 ? 'N' : 'S') : val >= 0 ? 'E' : 'W';
  return `${Math.abs(val).toFixed(6)}° ${dir}`;
}
