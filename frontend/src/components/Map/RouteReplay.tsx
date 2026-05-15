import { useState, useEffect, useRef, useCallback } from 'react';
import { useMapStore } from '../../store/mapStore';
import { FiPlay, FiPause, FiSquare, FiSkipBack, FiSkipForward } from 'react-icons/fi';

/**
 * RouteReplay — animates the map camera flying through each waypoint in sequence.
 * Rendered as a floating panel on the map when active.
 */
export function RouteReplay() {
  const { waypoints, setMapCenter, setMapZoom, setSelectedWaypoint } = useMapStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(2000); // ms per waypoint
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = waypoints.length;

  const flyTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= total) return;
    const wp = waypoints[idx];
    setSelectedWaypoint(wp.id);
    setMapCenter([wp.latitude, wp.longitude]);
    setMapZoom(13);
    setCurrentIdx(idx);
  }, [waypoints, total, setSelectedWaypoint, setMapCenter, setMapZoom]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      return;
    }
    intervalRef.current = setTimeout(() => {
      if (currentIdx + 1 >= total) {
        setIsPlaying(false);
        setCurrentIdx(0);
        setSelectedWaypoint(null);
      } else {
        const next = currentIdx + 1;
        flyTo(next);
      }
    }, speed);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, currentIdx, speed, total, flyTo, setSelectedWaypoint]);

  const handlePlay = () => {
    if (total < 2) return;
    if (!isPlaying && currentIdx >= total - 1) {
      // Restart
      flyTo(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
      flyTo(currentIdx);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentIdx(0);
    setSelectedWaypoint(null);
  };

  const progress = total > 1 ? (currentIdx / (total - 1)) * 100 : 0;

  if (total < 2) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 86,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(8,12,20,0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56,189,248,0.25)',
        borderRadius: 14,
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 280,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(56,189,248,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isPlaying && (
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#38bdf8',
              animation: 'pulse-ring 1s infinite',
            }} />
          )}
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Route Replay
          </span>
        </div>
        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>
          WP {currentIdx + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
          width: `${progress}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {/* Prev */}
        <button
          className="btn-icon"
          onClick={() => { flyTo(currentIdx - 1); setIsPlaying(false); }}
          disabled={currentIdx <= 0}
          style={{ borderRadius: '50%' }}
        >
          <FiSkipBack size={13} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px rgba(56,189,248,0.4)',
            color: 'white', transition: 'all 0.2s',
          }}
        >
          {isPlaying ? <FiPause size={15} /> : <FiPlay size={15} style={{ marginLeft: 2 }} />}
        </button>

        {/* Stop */}
        <button
          className="btn-icon"
          onClick={handleStop}
          style={{ borderRadius: '50%' }}
        >
          <FiSquare size={13} />
        </button>

        {/* Next */}
        <button
          className="btn-icon"
          onClick={() => { flyTo(currentIdx + 1); setIsPlaying(false); }}
          disabled={currentIdx >= total - 1}
          style={{ borderRadius: '50%' }}
        >
          <FiSkipForward size={13} />
        </button>

        {/* Speed selector */}
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', borderRadius: 6, fontSize: 11, padding: '4px 8px',
            cursor: 'pointer', outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <option value={4000}>Slow</option>
          <option value={2000}>Normal</option>
          <option value={1000}>Fast</option>
          <option value={500}>Turbo</option>
        </select>
      </div>
    </div>
  );
}
