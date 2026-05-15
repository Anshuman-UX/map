import './index.css';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MapView } from './components/Map/MapView';
import { ToastContainer } from './components/UI/ToastContainer';
import { KeyboardShortcuts } from './components/UI/KeyboardShortcuts';
import { useMapStore } from './store/mapStore';

export default function App() {
  const { sidebarOpen, setSidebarOpen } = useMapStore();

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        position: 'relative',
      }}
    >
      <KeyboardShortcuts />
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MapView />
      </div>
      <ToastContainer />
    </div>
  );
}

