import { useMapStore } from '../../store/mapStore';

export function CoordDisplay() {
  const { waypoints, mapCenter, mapZoom } = useMapStore();

  return (
    <div
      style={{
        position: 'absolute', bottom: 86, right: 12,
        zIndex: 1000,
        background: 'rgba(8,12,20,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, padding: '6px 12px',
        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
        color: '#64748b', lineHeight: 1.8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      <div>
        <span style={{ color: '#38bdf8' }}>Lat</span>{' '}
        {mapCenter[0].toFixed(5)}
      </div>
      <div>
        <span style={{ color: '#818cf8' }}>Lng</span>{' '}
        {mapCenter[1].toFixed(5)}
      </div>
      <div>
        <span style={{ color: '#34d399' }}>Z</span>{' '}
        {mapZoom}
        {'  '}
        <span style={{ color: '#fbbf24' }}>WP</span>{' '}
        {waypoints.length}
      </div>
    </div>
  );
}
