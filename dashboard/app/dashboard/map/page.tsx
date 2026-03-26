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
  photo_url: string | null;
};

const STAGE_CONFIG = {
  kicked_off:  { label: 'Program Kicked Off',      color: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  in_progress: { label: 'In Progress',              color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  achieved:    { label: 'Health Village Achieved',  color: '#22c55e', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
};

// Cycling dummy photos — PNG highlands / community health themed
const DUMMY_PHOTOS = [
  'https://images.unsplash.com/photo-1542601906897-ecd28040e1d1?w=600&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
  'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80',
  'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80',
  'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=600&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80',
  'https://images.unsplash.com/photo-1580281657702-257584239a55?w=600&q=80',
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80',
];

function getPhoto(community: Community, index: number): string {
  if (community.photo_url) return community.photo_url;
  return DUMMY_PHOTOS[index % DUMMY_PHOTOS.length];
}

type AddFormData = {
  name: string; province: string; district: string;
  population: string; che_stage: string; description: string;
  health_committee_contact: string;
};

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const mglRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelected] = useState<Community | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [addForm, setAddForm] = useState<AddFormData>({
    name: '', province: '', district: '', population: '',
    che_stage: 'kicked_off', description: '', health_committee_contact: '',
  });

  const supabase = createClient();

  const counts = {
    kicked_off:  communities.filter(c => c.che_stage === 'kicked_off').length,
    in_progress: communities.filter(c => c.che_stage === 'in_progress').length,
    achieved:    communities.filter(c => c.che_stage === 'achieved').length,
  };

  // Load communities
  useEffect(() => {
    supabase.from('community_profiles').select('*')
      .then(({ data, error }) => {
        if (error) console.error('Failed to load communities:', error);
        if (data?.length) setCommunities(data);
      });
  }, []);

  // Init map once on mount — store mapboxgl in ref to avoid stale closures
  useEffect(() => {
    if (!mapContainer.current) return;
    let map: any;

    import('mapbox-gl').then((mod) => {
      if (!mapContainer.current) return;
      const mgl = mod.default;
      mglRef.current = mgl;
      mgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      map = new mgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [145.15, -6.1],
        zoom: 7.2,
        attributionControl: false,
      });
      map.addControl(new mgl.NavigationControl({ showCompass: false }), 'top-right');
      map.on('click', () => setSelected(null));
      mapRef.current = map;
      map.on('load', () => setMapReady(true));
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markersRef.current.clear(); }
    };
  }, []);

  // Add markers whenever map is ready or communities change
  useEffect(() => {
    const mgl = mglRef.current;
    const map = mapRef.current;
    if (!mgl || !map || !communities.length) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    communities.forEach((c, idx) => {
      const cfg = STAGE_CONFIG[c.che_stage];

      const el = document.createElement('div');
      el.style.cssText = `width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;`;

      const dot = document.createElement('div');
      dot.style.cssText = `width:14px;height:14px;background:${cfg.color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);transition:transform 0.15s,box-shadow 0.15s;pointer-events:none;`;
      el.appendChild(dot);

      el.addEventListener('mouseenter', () => { dot.style.transform = 'scale(1.6)'; dot.style.boxShadow = '0 3px 12px rgba(0,0,0,0.5)'; });
      el.addEventListener('mouseleave', () => { dot.style.transform = 'scale(1)'; dot.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)'; });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelected({ ...c, _photoIndex: idx } as any);
        setShowAddForm(false);
        map.flyTo({ center: [c.longitude, c.latitude], zoom: 11, duration: 700 });
      });

      const marker = new mgl.Marker(el).setLngLat([c.longitude, c.latitude]).addTo(map);
      markersRef.current.set(c.id, { marker, el, community: c });
    });
  }, [mapReady, communities]);

  // Apply filter + search to markers
  useEffect(() => {
    markersRef.current.forEach(({ el, community }) => {
      const matchesFilter = activeFilter === 'all' || community.che_stage === activeFilter;
      const matchesSearch = !search ||
        community.name.toLowerCase().includes(search.toLowerCase()) ||
        (community.province || '').toLowerCase().includes(search.toLowerCase()) ||
        (community.district || '').toLowerCase().includes(search.toLowerCase());
      el.style.display = matchesFilter && matchesSearch ? 'block' : 'none';
    });
  }, [activeFilter, search]);

  async function handleAddCommunity(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('community_profiles').insert({
      name: addForm.name,
      province: addForm.province,
      district: addForm.district || null,
      population: addForm.population ? parseInt(addForm.population) : null,
      che_stage: addForm.che_stage,
      description: addForm.description || null,
      health_committee_contact: addForm.health_committee_contact || null,
      latitude: -6.0833 + (Math.random() - 0.5) * 2,
      longitude: 145.3833 + (Math.random() - 0.5) * 2,
    });
    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowAddForm(false);
        setAddForm({ name: '', province: '', district: '', population: '', che_stage: 'kicked_off', description: '', health_committee_contact: '' });
      }, 2000);
      // Reload communities
      supabase.from('community_profiles').select('*').then(({ data }) => {
        if (data) setCommunities(data);
      });
    }
  }

  const selectedPhoto = selected
    ? getPhoto(selected, (selected as any)._photoIndex ?? selected.name.length)
    : null;

  const cfg = selected ? STAGE_CONFIG[selected.che_stage] : null;

  return (
    <div className="relative flex" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Map */}
      <div ref={mapContainer} className="flex-1 h-full" />

      {/* Search bar */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-3 py-2.5 flex items-center gap-2 w-60">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search communities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-full text-slate-700 placeholder-slate-400 bg-transparent"
          />
        </div>
      </div>

      {/* Add community button */}
      <div className="absolute top-4 left-[272px] z-10">
        <button
          onClick={() => { setShowAddForm(true); setSelected(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Community
        </button>
      </div>

      {/* Bottom stats bar — clickable to filter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex overflow-hidden">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-3 text-center border-r border-slate-100 transition ${activeFilter === 'all' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
          >
            <div className={`text-xl font-bold ${activeFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>{communities.length}</div>
            <div className={`text-xs mt-0.5 ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>All Communities</div>
          </button>
          {(Object.entries(STAGE_CONFIG) as [keyof typeof STAGE_CONFIG, typeof STAGE_CONFIG[keyof typeof STAGE_CONFIG]][]).map(([key, config], i, arr) => (
            <button
              key={key}
              onClick={() => setActiveFilter(activeFilter === key ? 'all' : key)}
              className={`px-5 py-3 text-center transition ${i < arr.length - 1 ? 'border-r border-slate-100' : ''} ${activeFilter === key ? 'bg-slate-900' : 'hover:bg-slate-50'}`}
            >
              <div className="text-xl font-bold" style={{ color: activeFilter === key ? config.color : config.color }}>{counts[key]}</div>
              <div className={`text-xs mt-0.5 flex items-center gap-1 justify-center ${activeFilter === key ? 'text-slate-300' : 'text-slate-500'}`}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: config.color }} />
                {key === 'kicked_off' ? 'Kicked Off' : key === 'in_progress' ? 'In Progress' : 'Achieved'}
              </div>
            </button>
          ))}
          <div className="px-5 py-3 border-l border-slate-100 text-center">
            <div className="text-xl font-bold text-slate-900">
              {communities.reduce((s, c) => s + (c.population || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Population</div>
          </div>
        </div>
      </div>

      {/* Community profile side panel */}
      {selected && cfg && (
        <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200 z-20 flex flex-col overflow-hidden">
          {/* Photo */}
          <div className="relative h-44 flex-shrink-0 bg-slate-100">
            {selectedPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedPhoto} alt={selected.name} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-4">
              <h2 className="text-white font-bold text-lg leading-tight">{selected.name}</h2>
              <p className="text-white/80 text-xs mt-0.5">{selected.province}{selected.district ? ` · ${selected.district}` : ''}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* CHE Stage */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-lg font-bold text-slate-900">{selected.population?.toLocaleString() ?? '—'}</div>
                <div className="text-xs text-slate-500 mt-0.5">Population</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-lg font-bold text-slate-900">{selected.province?.split(' ')[0] ?? '—'}</div>
                <div className="text-xs text-slate-500 mt-0.5">Province</div>
              </div>
            </div>

            {/* Description */}
            {selected.description && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">About</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selected.description}</p>
              </div>
            )}

            {/* Health committee */}
            {selected.health_committee_contact && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-indigo-500 font-medium">Health Committee</div>
                  <div className="text-sm font-semibold text-indigo-900">{selected.health_committee_contact}</div>
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div className="text-xs text-slate-400 font-mono">
              {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
            </div>
          </div>

          {/* Footer action */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => { setSelected(null); setShowAddForm(true); setAddForm(f => ({ ...f, name: selected.name })); }}
              className="w-full text-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition"
            >
              Edit this community
            </button>
          </div>
        </div>
      )}

      {/* Add community panel */}
      {showAddForm && (
        <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200 z-20 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Add Your Community</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleAddCommunity} className="flex-1 overflow-y-auto p-4 space-y-4">
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-xl text-sm font-medium">
                Community added successfully!
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Community / Village Name *</label>
              <input required value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Konogogo"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Province *</label>
              <select required value={addForm.province} onChange={e => setAddForm(f => ({ ...f, province: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700">
                <option value="">Select province</option>
                <option>Eastern Highlands</option>
                <option>Simbu</option>
                <option>Western Highlands</option>
                <option>Jiwaka</option>
                <option>Enga</option>
                <option>Morobe</option>
                <option>Madang</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">District</label>
              <input value={addForm.district} onChange={e => setAddForm(f => ({ ...f, district: e.target.value }))}
                placeholder="e.g. Goroka"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Population</label>
              <input type="number" value={addForm.population} onChange={e => setAddForm(f => ({ ...f, population: e.target.value }))}
                placeholder="e.g. 350"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">CHE Program Stage *</label>
              <div className="space-y-2">
                {(Object.entries(STAGE_CONFIG) as [keyof typeof STAGE_CONFIG, typeof STAGE_CONFIG[keyof typeof STAGE_CONFIG]][]).map(([key, config]) => (
                  <label key={key} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${addForm.che_stage === key ? `${config.bg} ${config.border}` : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" name="che_stage" value={key} checked={addForm.che_stage === key}
                      onChange={e => setAddForm(f => ({ ...f, che_stage: e.target.value }))} className="hidden" />
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: config.color }} />
                    <span className={`text-xs font-medium ${addForm.che_stage === key ? config.text : 'text-slate-600'}`}>{config.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Description</label>
              <textarea value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe your community, health goals, current activities…"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Health Committee Contact</label>
              <input value={addForm.health_committee_contact} onChange={e => setAddForm(f => ({ ...f, health_committee_contact: e.target.value }))}
                placeholder="Contact name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Photo upload coming soon.</span> Once submitted your community will appear on the map. A health worker will verify and place the pin at your exact location.
              </p>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition">
              {saving ? 'Saving…' : 'Add to Map'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
