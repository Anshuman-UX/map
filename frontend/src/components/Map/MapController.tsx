import { useEffect } from 'react';
import { useMap, useMapEvents, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../store/mapStore';
import { useMapClickHandler, useMapSync } from '../../hooks/useMap';

/** Build a custom divIcon for each waypoint */
function createWaypointIcon(id: number, isSelected: boolean) {
  const hue = (id * 43) % 360; // Different hue per waypoint
  const color = isSelected
    ? '#38bdf8'
    : `hsl(${hue}, 80%, 60%)`;

  const html = `
    <div style="position:relative; width:36px; height:42px;">
      <div style="
        width:32px; height:32px; border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background: ${color};
        border: 2.5px solid rgba(255,255,255,0.8);
        box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 0 3px ${color}40;
        display:flex; align-items:center; justify-content:center;
        cursor:grab; transition:all 0.2s;
      ">
        <span style="transform:rotate(45deg); font-size:11px; font-weight:800; color:white; font-family:Inter,sans-serif; text-shadow:0 1px 2px rgba(0,0,0,0.5);">
          ${id}
        </span>
      </div>
      <div style="
        position:absolute; top:4px; left:4px;
        width:28px; height:28px; border-radius:50%;
        background: ${color}30; border: 1px solid ${color}40;
        animation: pulse-ring 2s infinite;
        pointer-events:none;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [36, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
    className: '',
  });
}

/** Inner map controller — must be inside <MapContainer> */
export function MapController() {
  const {
    waypoints,
    selectedWaypointId,
    mapCenter,
    mapZoom,
    moveWaypoint,
    setSelectedWaypoint,
    setMapCenter,
    setMapZoom,
    updateWaypoint,
  } = useMapStore();

  // Sync external state changes to map
  useMapSync(mapCenter, mapZoom);

  // Register click handler
  useMapClickHandler();

  // Track map move/zoom events
  useMapEvents({
    moveend: (e) => {
      const c = e.target.getCenter();
      setMapCenter([c.lat, c.lng]);
    },
    zoomend: (e) => {
      setMapZoom(e.target.getZoom());
    },
  });

  // Draw polyline connecting all waypoints
  const positions: [number, number][] = waypoints.map((w) => [
    w.latitude,
    w.longitude,
  ]);

  return (
    <>
      {/* ── Route Polyline ── */}
      {positions.length >= 2 && (
        <>
          {/* Shadow line */}
          <Polyline
            positions={positions}
            pathOptions={{
              color: 'rgba(0,0,0,0.3)',
              weight: 8,
              dashArray: undefined,
            }}
          />
          {/* Main line */}
          <Polyline
            positions={positions}
            pathOptions={{
              color: '#38bdf8',
              weight: 3,
              opacity: 0.9,
              dashArray: '8, 4',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          {/* Glow line */}
          <Polyline
            positions={positions}
            pathOptions={{
              color: '#818cf8',
              weight: 1,
              opacity: 0.5,
            }}
          />
        </>
      )}

      {/* ── Waypoint Markers ── */}
      {waypoints.map((wp) => (
        <Marker
          key={wp.id}
          position={[wp.latitude, wp.longitude]}
          icon={createWaypointIcon(wp.id, selectedWaypointId === wp.id)}
          draggable
          eventHandlers={{
            click: () => setSelectedWaypoint(wp.id),
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              moveWaypoint(wp.id, lat, lng);
            },
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, marginBottom: 8,
                color: '#38bdf8', letterSpacing: '0.02em'
              }}>
                📍 Waypoint {wp.id}
              </div>
              {wp.name && wp.name !== `WP ${wp.id}` && (
                <div style={{ fontSize: 12, marginBottom: 6, color: '#94a3b8' }}>{wp.name}</div>
              )}
              <table style={{ fontSize: 11, width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#64748b', paddingRight: 8 }}>Lat</td>
                    <td style={{ fontFamily: 'monospace', color: '#f0f6ff' }}>{wp.latitude.toFixed(6)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', paddingRight: 8 }}>Lng</td>
                    <td style={{ fontFamily: 'monospace', color: '#f0f6ff' }}>{wp.longitude.toFixed(6)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748b', paddingRight: 8 }}>Alt</td>
                    <td style={{ fontFamily: 'monospace', color: '#fbbf24' }}>
                      <input
                        type="number"
                        value={wp.altitude ?? 0}
                        onChange={(e) => updateWaypoint(wp.id, { altitude: Number(e.target.value) })}
                        style={{
                          width: 60,
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 4,
                          fontSize: 11,
                          color: '#fbbf24',
                          padding: '2px 4px',
                          outline: 'none'
                        }}
                      />
                      <span style={{ marginLeft: 4, color: '#64748b' }}>m</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
