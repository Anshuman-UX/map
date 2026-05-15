import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapController } from './MapController';
import { MapToolbar } from './MapToolbar';
import { SearchBar } from './SearchBar';
import { CoordDisplay } from './CoordDisplay';
import { RouteReplay } from './RouteReplay';
import { useMapStore } from '../../store/mapStore';
import type { MapLayer } from '../../types';

// ─── Tile Layer URLs ──────────────────────────────────────────────────────────

const TILE_LAYERS: Record<MapLayer, { url: string; attribution: string }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
  },
};

// ─── Main Map Component ───────────────────────────────────────────────────────

export function MapView() {
  const { mapCenter, mapZoom, mapLayer } = useMapStore();
  const tile = TILE_LAYERS[mapLayer];

  return (
    <div className="map-wrapper" style={{ position: 'relative', flex: 1 }}>
      {/* Search bar overlay */}
      <SearchBar />

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl
        attributionControl
      >
        <TileLayer
          key={mapLayer} // Force re-render on layer change
          url={tile.url}
          attribution={tile.attribution}
          maxZoom={19}
        />
        <MapController />
      </MapContainer>

      {/* Bottom toolbar */}
      <MapToolbar />

      {/* Route Replay Controls */}
      <RouteReplay />

      {/* Coordinate display */}
      <CoordDisplay />
    </div>
  );
}

