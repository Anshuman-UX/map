import { useMemo, useRef } from 'react';
import { useMapStore } from '../../store/mapStore';
import { buildRouteExport, stringifyRoute, downloadJSON, copyToClipboard, syntaxHighlight, parseImportJSON } from '../../utils/jsonExport';
import { FiDownload, FiCopy, FiUpload, FiRefreshCw } from 'react-icons/fi';

export function JsonPanel() {
  const {
    waypoints, routeName, routeStats,
    importWaypoints, addToast,
  } = useMapStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const routeExport = useMemo(
    () => buildRouteExport(routeName, waypoints, routeStats?.totalDistance ?? 0),
    [waypoints, routeName, routeStats]
  );

  const jsonString = useMemo(() => stringifyRoute(routeExport), [routeExport]);
  const highlighted = useMemo(() => syntaxHighlight(jsonString), [jsonString]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(jsonString);
    if (ok) addToast('success', 'JSON copied to clipboard!');
    else addToast('error', 'Failed to copy.');
  };

  const handleDownload = () => {
    downloadJSON(routeExport, `${routeName.replace(/\s+/g, '_')}.json`);
    addToast('success', 'JSON file downloaded!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wps = parseImportJSON(reader.result as string);
        importWaypoints(wps);
        addToast('success', `Imported ${wps.length} waypoints!`);
      } catch (err) {
        addToast('error', `Import failed: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px', gap: 12 }}>
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handleCopy} style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
          <FiCopy size={13} /> Copy JSON
        </button>
        <button className="btn-primary" onClick={handleDownload} style={{ flex: 1, justifyContent: 'center', fontSize: 12, background: 'linear-gradient(135deg, #34d399, #059669)' }}>
          <FiDownload size={13} /> Download
        </button>
      </div>

      <button
        className="btn-ghost"
        onClick={() => fileInputRef.current?.click()}
        style={{ justifyContent: 'center', width: '100%' }}
      >
        <FiUpload size={13} /> Import JSON Route
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      <div className="divider" />

      {/* JSON Stats */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Waypoints</div>
          <div className="stat-value" style={{ fontSize: 20, color: '#38bdf8' }}>
            {waypoints.length}
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">JSON Size</div>
          <div className="stat-value" style={{ fontSize: 16 }}>
            {(jsonString.length / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>

      {/* Live JSON viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live JSON Preview
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse-ring 2s infinite' }} />
            <span style={{ fontSize: 10, color: '#34d399' }}>live</span>
          </div>
        </div>

        <div
          className="json-viewer"
          style={{ flex: 1, overflowY: 'auto' }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}
