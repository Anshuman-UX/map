import { useState, useRef } from 'react';
import { useMapStore } from '../../store/mapStore';
import { FiSearch, FiX, FiMapPin } from 'react-icons/fi';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { setMapCenter, setMapZoom, addToast } = useMapStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowResults(true);
    } catch (_err) {
      addToast('error', 'Search failed. Check your connection.');

    } finally {
      setLoading(false);
    }
  };

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const selectResult = (r: NominatimResult) => {
    setMapCenter([parseFloat(r.lat), parseFloat(r.lon)]);
    setMapZoom(13);
    setQuery(r.display_name.split(',')[0]);
    setShowResults(false);
    setResults([]);
  };

  return (
    <div
      style={{
        position: 'absolute', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000, width: '90%', maxWidth: 480,
      }}
    >
      {/* Input */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(8,12,20,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: showResults && results.length > 0 ? '14px 14px 0 0' : 14,
          padding: '10px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          transition: 'border-radius 0.2s',
        }}
      >
        {loading ? (
          <div style={{
            width: 16, height: 16, border: '2px solid #38bdf8',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin-slow 0.8s linear infinite', flexShrink: 0
          }} />
        ) : (
          <FiSearch size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
        )}
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search location..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#f0f6ff', fontSize: 14,
            fontFamily: 'Inter, sans-serif',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div
          style={{
            background: 'rgba(8,12,20,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderTop: 'none',
            borderRadius: '0 0 14px 14px',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}
        >
          {results.map((r) => (
            <button
              key={r.place_id}
              onClick={() => selectResult(r)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 16px', background: 'none',
                border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer', textAlign: 'left', color: '#f0f6ff',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56,189,248,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <FiMapPin size={13} color="#38bdf8" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
