import { useState, useRef } from 'react';
import { useMapStore } from '../../store/mapStore';
import { formatDistance } from '../../utils/haversine';
import { useDragReorder } from '../../hooks/useMap';
import {
  FiTrash2, FiMove, FiNavigation, FiEdit2, FiCheck, FiX,
} from 'react-icons/fi';

// ── Inline name editor for a single waypoint ─────────────────────────────────

function EditableLabel({ id, name }: { id: number; name: string }) {
  const { updateWaypoint } = useMapStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) updateWaypoint(id, { name: trimmed });
    setEditing(false);
  };

  const cancel = () => {
    setDraft(name);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          style={{
            flex: 1, fontSize: 11, fontWeight: 600,
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.4)',
            borderRadius: 6, padding: '2px 6px',
            color: '#f0f6ff', outline: 'none',
            fontFamily: 'Inter, sans-serif', minWidth: 0,
          }}
        />
        <button
          onClick={commit}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34d399', display: 'flex', padding: 2 }}
        >
          <FiCheck size={11} />
        </button>
        <button
          onClick={cancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', padding: 2 }}
        >
          <FiX size={11} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setDraft(name);
        setEditing(true);
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f6ff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <button
        title="Rename waypoint (or double-click)"
        onClick={(e) => {
          e.stopPropagation();
          setDraft(name);
          setEditing(true);
        }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#475569', display: 'flex', padding: 2, opacity: 0,
          transition: 'opacity 0.15s',
        }}
        className="edit-btn"
      >
        <FiEdit2 size={10} />
      </button>
    </div>
  );
}

// ── Main WaypointList ─────────────────────────────────────────────────────────

export function WaypointList() {
  const {
    waypoints,
    selectedWaypointId,
    setSelectedWaypoint,
    removeWaypoint,
    reorderWaypoints,
    routeStats,
    setMapCenter,
    setMapZoom,
    updateWaypoint,
  } = useMapStore();

  const { onDragStart, onDragOver, onDragEnd } = useDragReorder(reorderWaypoints);

  if (waypoints.length === 0) {
    return (
      <div
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: 32, textAlign: 'center',
        }}
      >
        {/* Animated beacon */}
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.15)',
            animation: 'pulse-ring 2.5s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 12, borderRadius: '50%',
            background: 'rgba(56,189,248,0.12)',
            border: '1px solid rgba(56,189,248,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            📍
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f6ff', marginBottom: 6 }}>
            No Waypoints Yet
          </div>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
            Click anywhere on the map<br />to drop your first waypoint
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          {['Click map to place waypoint', 'Drag pins to move', 'Double-click name to rename'].map((tip, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11, color: '#64748b', textAlign: 'left',
            }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{i + 1}</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header count */}
      <div style={{
        padding: '8px 12px 4px',
        fontSize: 11, color: '#475569', fontWeight: 500,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>{waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''}</span>
        <span style={{ fontSize: 10, color: '#334155' }}>↕ drag to reorder · dbl-click to rename</span>
      </div>

      {/* List */}
      <div
        style={{
          flex: 1, overflowY: 'auto',
          padding: '4px 10px 10px',
          display: 'flex', flexDirection: 'column', gap: 3,
        }}
      >
        {waypoints.map((wp, idx) => {
          const segment = routeStats?.segments.find((s) => s.from === wp.id);
          const isSelected = selectedWaypointId === wp.id;
          const hue = (wp.id * 43) % 360;

          return (
            <div
              key={wp.id}
              className={`waypoint-item ${isSelected ? 'active' : ''}`}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              onClick={() => {
                setSelectedWaypoint(wp.id);
                setMapCenter([wp.latitude, wp.longitude]);
                setMapZoom(15);
              }}
              style={{
                animationDelay: `${idx * 0.03}s`,
                position: 'relative',
              }}
            >
              {/* Left accent bar */}
              {isSelected && (
                <div style={{
                  position: 'absolute', left: 0, top: 4, bottom: 4,
                  width: 2, borderRadius: 1,
                  background: `hsl(${hue}, 80%, 60%)`,
                }} />
              )}

              {/* Drag handle */}
              <div
                style={{ color: '#334155', cursor: 'grab', flexShrink: 0, display: 'flex', paddingLeft: 4 }}
                title="Drag to reorder"
              >
                <FiMove size={12} />
              </div>

              {/* Color badge */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: `hsl(${hue}, 75%, 55%)`,
                boxShadow: `0 0 8px hsl(${hue}, 75%, 55%)40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: 'white',
              }}>
                {wp.id}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <EditableLabel id={wp.id} name={wp.name || `Waypoint ${wp.id}`} />
                <div style={{
                  fontSize: 10, color: '#475569',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginTop: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>{wp.latitude.toFixed(5)}, {wp.longitude.toFixed(5)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} onClick={e => e.stopPropagation()}>
                    <span style={{ color: '#64748b' }}>H:</span>
                    <input
                      type="number"
                      value={wp.altitude ?? 0}
                      onChange={(e) => updateWaypoint(wp.id, { altitude: Number(e.target.value) })}
                      style={{
                        width: 45,
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 4,
                        fontSize: 9,
                        color: '#fbbf24',
                        padding: '1px 3px',
                        outline: 'none'
                      }}
                    />
                    <span style={{ color: '#64748b' }}>m</span>
                  </div>
                </div>
                {segment && (
                  <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 1 }}>
                    ↗ {formatDistance(segment.distance)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                <button
                  className="btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWaypoint(wp.id);
                    setMapCenter([wp.latitude, wp.longitude]);
                    setMapZoom(16);
                  }}
                  title="Fly to on map"
                  style={{ width: 24, height: 24 }}
                >
                  <FiNavigation size={10} />
                </button>
                <button
                  className="btn-icon danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWaypoint(wp.id);
                  }}
                  title="Delete waypoint"
                  style={{ width: 24, height: 24 }}
                >
                  <FiTrash2 size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show hover edit button — CSS trick */}
      <style>{`
        .waypoint-item:hover .edit-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
