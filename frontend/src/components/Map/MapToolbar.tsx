import { useState } from 'react';
import { useMapStore } from '../../store/mapStore';
import type { MapLayer } from '../../types';
import { useLocateUser } from '../../hooks/useMap';
import {
  FiMap, FiGlobe, FiLayers, FiMoon,
  FiCrosshair, FiTrash2, FiRotateCcw, FiSidebar
} from 'react-icons/fi';

interface LayerConfig {
  id: MapLayer;
  label: string;
  icon: React.ReactNode;
}

const LAYERS: LayerConfig[] = [
  { id: 'street',    label: 'Street',    icon: <FiMap size={13}/> },
  { id: 'satellite', label: 'Satellite', icon: <FiGlobe size={13}/> },
  { id: 'terrain',   label: 'Terrain',   icon: <FiLayers size={13}/> },
  { id: 'dark',      label: 'Dark',      icon: <FiMoon size={13}/> },
];

export function MapToolbar() {
  const {
    mapLayer, setMapLayer,
    clearWaypoints, undoLast,
    waypoints,
    sidebarOpen, setSidebarOpen,
  } = useMapStore();

  const locateUser = useLocateUser();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Glass toolbar pill */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(8,12,20,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 100,
          padding: '6px 12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Layer buttons */}
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            className={`layer-btn ${mapLayer === layer.id ? 'active' : ''}`}
            onClick={() => setMapLayer(layer.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {layer.icon}
            {layer.label}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* Locate user */}
        <button
          className="btn-icon"
          onClick={locateUser}
          data-tooltip="My Location"
          style={{ borderRadius: '50%' }}
        >
          <FiCrosshair size={14} />
        </button>

        {/* Undo */}
        <button
          className="btn-icon"
          onClick={undoLast}
          data-tooltip="Undo Last"
          style={{ borderRadius: '50%' }}
          disabled={waypoints.length === 0}
        >
          <FiRotateCcw size={14} />
        </button>

        {/* Clear all */}
        <button
          className="btn-icon danger"
          onClick={() => {
            if (confirm('Clear all waypoints?')) clearWaypoints();
          }}
          data-tooltip="Clear All"
          style={{ borderRadius: '50%' }}
          disabled={waypoints.length === 0}
        >
          <FiTrash2 size={14} />
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* Sidebar toggle */}
        <button
          className="btn-icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-tooltip="Toggle Sidebar"
          style={{ borderRadius: '50%' }}
        >
          <FiSidebar size={14} />
        </button>
      </div>
    </div>
  );
}
