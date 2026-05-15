import { useMapStore } from '../../store/mapStore';
import { WaypointList } from './WaypointList';
import { JsonPanel } from './JsonPanel';
import { RouteStats } from './RouteStats';
import { useSavedRoutes } from '../../hooks/useSavedRoutes';
import {
  FiList, FiCode, FiBarChart2,
  FiSave, FiRotateCcw, FiTrash2, FiX,
} from 'react-icons/fi';
import type { SidebarTab } from '../../types';

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: 'waypoints', label: 'Waypoints', icon: <FiList size={14} /> },
  { id: 'json',      label: 'JSON',      icon: <FiCode size={14} /> },
  { id: 'settings',  label: 'Stats',     icon: <FiBarChart2 size={14} /> },
];

export function Sidebar() {
  const {
    sidebarOpen, setSidebarOpen,
    activeTab, setActiveTab,
    waypoints, clearWaypoints, undoLast,
    isLoading,
  } = useMapStore();

  const { saveRoute } = useSavedRoutes();

  return (
    <div
      className="sidebar"
      style={{
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 16px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(8,12,20,0.6)',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: '0 4px 12px rgba(56,189,248,0.3)',
              }}
            >
              🗺️
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f6ff' }}>WayPoint</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>GIS Route Planner</div>
            </div>
          </div>
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(false)}
            style={{ borderRadius: '50%' }}
          >
            <FiX size={14} />
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <button
            className="btn-primary"
            onClick={saveRoute}
            disabled={waypoints.length < 2 || isLoading}
            style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: 12 }}
          >
            <FiSave size={12} />
            {isLoading ? 'Saving…' : 'Save'}
          </button>
          <button
            className="btn-ghost"
            onClick={undoLast}
            disabled={waypoints.length === 0}
            style={{ padding: '8px 12px' }}
          >
            <FiRotateCcw size={12} />
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              if (waypoints.length === 0) return;
              if (confirm('Clear all waypoints?')) clearWaypoints();
            }}
            disabled={waypoints.length === 0}
          >
            <FiTrash2 size={12} />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 2, paddingBottom: 1 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '8px 6px',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.id
                  ? '2px solid #38bdf8'
                  : '2px solid transparent',
                color: activeTab === tab.id ? '#38bdf8' : '#64748b',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', borderRadius: '4px 4px 0 0',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'waypoints' && <WaypointList />}
        {activeTab === 'json' && <JsonPanel />}
        {activeTab === 'settings' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <RouteStats />
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(8,12,20,0.6)',
        }}
      >
        <span style={{ fontSize: 10, color: '#475569' }}>
          {waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''}
          {waypoints.length >= 2 ? ' · Route ready' : ''}
        </span>
        <span className="badge badge-sky">v1.0</span>
      </div>
    </div>
  );
}
