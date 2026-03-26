'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { LineChart } from '@tremor/react';
import HierarchyFilter from '@/components/HierarchyFilter';
import { createClient } from '@/lib/supabase/client';
import { getOverviewStats, getDiseaseTrends, type HierarchyFilters } from '@/lib/queries';

const KPI_ICONS = [
  <svg key="communities" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  <svg key="population" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  <svg key="healthy" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key="facilities" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
];

export default function OverviewPage() {
  const [filters, setFilters] = useState<HierarchyFilters>({});
  const [stats, setStats] = useState({ totalCommunities: 0, totalPopulation: 0, healthyPct: 0, facilitiesReporting: 0 });
  const [trends, setTrends] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOverviewStats(sb, filters),
      getDiseaseTrends(sb, filters),
    ]).then(([s, t]) => {
      setStats(s);
      setTrends(t);
      setLoading(false);
    });
  }, [filters]);

  const trendsByQuarter = (trends as Array<{
    reporting_quarter: string;
    malaria_cases: number | null;
    diarrhea_cases: number | null;
    pneumonia_cases: number | null;
    simple_cough_cases: number | null;
  }>).reduce((acc, row) => {
    const q = row.reporting_quarter ?? 'Unknown';
    if (!acc[q]) acc[q] = { quarter: q, Malaria: 0, Diarrhea: 0, Pneumonia: 0, 'Simple Cough': 0 };
    acc[q].Malaria       += row.malaria_cases ?? 0;
    acc[q].Diarrhea      += row.diarrhea_cases ?? 0;
    acc[q].Pneumonia     += row.pneumonia_cases ?? 0;
    acc[q]['Simple Cough'] += row.simple_cough_cases ?? 0;
    return acc;
  }, {} as Record<string, { quarter: string; Malaria: number; Diarrhea: number; Pneumonia: number; 'Simple Cough': number }>);

  const chartData = Object.values(trendsByQuarter).sort((a, b) => a.quarter.localeCompare(b.quarter));

  const kpis = [
    { label: 'Communities Surveyed', value: stats.totalCommunities, colour: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Total Population', value: stats.totalPopulation.toLocaleString(), colour: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Communities Healthy', value: `${stats.healthyPct}%`, colour: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Facilities Reporting', value: stats.facilitiesReporting, colour: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
  ];

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-slate-900">Community Health Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Eastern Highlands Province, Papua New Guinea</p>
      </div>

      {/* Hierarchy Filter */}
      <div className="mb-7">
        <HierarchyFilter value={filters} onChange={setFilters} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`bg-white rounded-xl border ${kpi.border} p-5 shadow-sm`}>
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${kpi.bg} ${kpi.colour} mb-3`}>
              {KPI_ICONS[i]}
            </div>
            <div className={`text-2xl font-bold ${kpi.colour}`}>
              {loading ? <span className="text-slate-300">—</span> : kpi.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Disease Trends */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Disease Case Trends</h2>
            <p className="text-xs text-slate-500 mt-0.5">Aggregated cases across all reporting facilities by quarter</p>
          </div>
        </div>
        {chartData.length > 0 ? (
          <LineChart
            className="mt-5 h-64"
            data={chartData}
            index="quarter"
            categories={['Malaria', 'Diarrhea', 'Pneumonia', 'Simple Cough']}
            colors={['rose', 'orange', 'indigo', 'violet']}
            yAxisWidth={40}
            showLegend
          />
        ) : (
          <div className="mt-4 h-64 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {loading ? 'Loading data…' : 'No quarterly data available. Run the sync service to import data.'}
          </div>
        )}
      </div>

      {/* No data banner */}
      {!loading && stats.totalCommunities === 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">No data synced yet</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Run <code className="bg-amber-100 px-1 rounded font-mono">node src/sync/index.js</code> to import data from Google Sheets.
            </p>
          </div>
          <span className="text-xs bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-medium">Setup needed</span>
        </div>
      )}
    </div>
  );
}
