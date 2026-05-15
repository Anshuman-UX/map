import { useMapStore } from '../../store/mapStore';
import { formatDistance, formatTime } from '../../utils/haversine';
import { FiZap, FiNavigation, FiClock, FiMap } from 'react-icons/fi';

export function RouteStats() {
  const { waypoints, routeStats, routeName, setRouteName } = useMapStore();

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Route name */}
      <div>
        <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Route Name
        </label>
        <input
          className="input-field"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="Enter route name..."
          style={{ marginTop: 6 }}
        />
      </div>

      <div className="divider" />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FiMap size={12} color="#38bdf8" />
            <span className="stat-label" style={{ margin: 0 }}>Waypoints</span>
          </div>
          <div className="stat-value" style={{ color: '#38bdf8' }}>{waypoints.length}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FiNavigation size={12} color="#818cf8" />
            <span className="stat-label" style={{ margin: 0 }}>Distance</span>
          </div>
          <div className="stat-value" style={{ color: '#818cf8', fontSize: 14 }}>
            {routeStats ? formatDistance(routeStats.totalDistance) : '—'}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FiClock size={12} color="#34d399" />
            <span className="stat-label" style={{ margin: 0 }}>Est. Time</span>
          </div>
          <div className="stat-value" style={{ color: '#34d399', fontSize: 14 }}>
            {routeStats ? formatTime(routeStats.estimatedTime) : '—'}
          </div>
          {routeStats && <div className="stat-sub">@ 60 km/h</div>}
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FiZap size={12} color="#fbbf24" />
            <span className="stat-label" style={{ margin: 0 }}>Segments</span>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {routeStats ? routeStats.segments.length : 0}
          </div>
        </div>
      </div>

      {/* Segment breakdown */}
      {routeStats && routeStats.segments.length > 0 && (
        <>
          <div className="divider" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Segment Distances
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {routeStats.segments.map((seg, i) => {
                const pct = routeStats.totalDistance > 0
                  ? (seg.distance / routeStats.totalDistance) * 100
                  : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        WP {seg.from} → WP {seg.to}
                      </span>
                      <span style={{ fontSize: 11, color: '#f0f6ff', fontFamily: 'monospace' }}>
                        {formatDistance(seg.distance)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {waypoints.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '20px 0',
          fontSize: 12, color: '#475569',
        }}>
          Add waypoints to see route statistics
        </div>
      )}
    </div>
  );
}
