'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Community = {
  id: string;
  name: string;
  province: string;
  district: string | null;
  population: number | null;
  latitude: number;
  longitude: number;
  che_stage: 'kicked_off' | 'in_progress' | 'achieved';
  description: string | null;
  health_committee_contact: string | null;
};

const STAGE_CONFIG = {
  kicked_off:  { label: 'Program Kicked Off', color: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  in_progress: { label: 'In Progress',        color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  achieved:    { label: 'Health Village Achieved', color: '#22c55e', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
};

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelected] = useState<Community | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ kicked_off: 0, in_progress: 0, achieved: 0 });
  const supabase = createClient();

  useEffect(() => {
    supabase.from('community_profiles').select('*').then(({ data }) => {
      if (data) {
        setCommunities(data);
        setCounts({
          kicked_off:  data.filter(c => c.che_stage === 'kicked_off').length,
          in_progress: data.filter(c => c.che_stage === 'in_progress').length,
          achieved:    data.filter(c => c.che_stage === 'achieved').length,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!communities.length || !mapContainer.current) return;

    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl as any).default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      if (mapRef.current) return;

      const map = new (mapboxgl as any).default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [145.3833, -6.2],
        zoom: 7.5,
        attributionControl: false,
      });

      map.addControl(new (mapboxgl as any).default.NavigationControl(), 'top-right');
      map.addControl(new (mapboxgl as any).default.AttributionControl({ compact: true }), 'bottom-right');
      mapRef.current = map;

      map.on('load', () => {
        communities.forEach((c) => {
          const el = document.createElement('div');
          const cfg = STAGE_CONFIG[c.che_stage];

          el.style.cssText = `
            width: 14px; height: 14px;
            background: ${cfg.color};
            border: 2.5px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 1px 4px rgba(0,0,0,0.4);
            transition: transform 0.15s;
          `;
          el.onmouseenter = () => { el.style.transform = 'scale(1.6)'; };
          el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            setSelected(c);
            map.flyTo({ center: [c.longitude, c.latitude], zoom: 11, duration: 800 });
          });

          const marker = new (mapboxgl as any).default.Marker(el)
            .setLngLat([c.longitude, c.latitude])
            .addTo(map);

          markersRef.current.push({ marker, community: c });
        });
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, [communities]);

  // Filter markers
  useEffect(() => {
    markersRef.current.forEach(({ marker, community }) => {
      const matchesFilter = filter === 'all' || community.che_stage === filter;
      const matchesSearch = search === '' ||
        community.name.toLowerCase().includes(search.toLowerCase()) ||
        (community.province || '').toLowerCase().includes(search.toLowerCase());
      const el = marker.getElement();
      el.style.display = matchesFilter && matchesSearch ? 'block' : 'none';
    });
  }, [filter, search]);

  const cfg = selected ? STAGE_CONFIG[selected.che_stage] : null;

  return (
    <div className="relative h-[calc(100vh-56px)] flex flex-col">
      {/* Top controls bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-3 py-2 flex items-center gap-2 w-64">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search communities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-full text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Stage filter */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3 w-64">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Filter by Stage</p>
          <div className="space-y-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>All Communities</span>
              <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">{communities.length}</span>
            </button>
            {(Object.entries(STAGE_CONFIG) as [keyof typeof STAGE_CONFIG, typeof STAGE_CONFIG[keyof typeof STAGE_CONFIG]][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${filter === key ? `${config.bg} ${config.text}` : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: config.color }} />
                  {config.label}
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === key ? `${config.bg} ${config.text}` : 'bg-slate-100 text-slate-500'}`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected community card */}
      {selected && cfg && (
        <div className="absolute top-4 right-16 z-10 bg-white rounded-xl shadow-xl border border-slate-200 w-72 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{selected.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selected.province}{selected.district ? ` · ${selected.district}` : ''}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 ml-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border} mb-3`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STAGE_CONFIG[selected.che_stage].color }} />
              {cfg.label}
            </div>

            {selected.population && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Population: <span className="font-medium">{selected.population.toLocaleString()}</span>
              </div>
            )}

            {selected.description && (
              <p className="text-xs text-slate-600 leading-relaxed">{selected.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Stats bar at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-6 py-3 flex items-center gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{communities.length}</div>
            <div className="text-xs text-slate-500">Communities</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          {(Object.entries(STAGE_CONFIG) as [keyof typeof STAGE_CONFIG, typeof STAGE_CONFIG[keyof typeof STAGE_CONFIG]][]).map(([key, config]) => (
            <div key={key} className="text-center">
              <div className="text-lg font-bold" style={{ color: config.color }}>{counts[key]}</div>
              <div className="text-xs text-slate-500">{config.label.split(' ')[0]}</div>
            </div>
          ))}
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">
              {communities.reduce((s, c) => s + (c.population || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Population</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="flex-1 w-full" />
    </div>
  );
}
