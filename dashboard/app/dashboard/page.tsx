'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  Card, Metric, Text, Title, BarChart, LineChart, Grid, Col,
  Badge, Flex,
} from '@tremor/react';
import HierarchyFilter from '@/components/HierarchyFilter';
import { createClient } from '@/lib/supabase/client';
import { getOverviewStats, getDiseaseTrends, type HierarchyFilters } from '@/lib/queries';

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

  // Aggregate trends by quarter for chart
  const trendsByQuarter = (trends as Array<{
    reporting_quarter: string;
    malaria_cases: number | null;
    diarrhea_cases: number | null;
    pneumonia_cases: number | null;
    simple_cough_cases: number | null;
    outpatient_total: number | null;
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Health Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Eastern Highlands Province, Papua New Guinea</p>
      </div>

      {/* Hierarchy Filter */}
      <div className="mb-8">
        <HierarchyFilter value={filters} onChange={setFilters} />
      </div>

      {/* KPI Cards */}
      <Grid numItems={2} numItemsLg={4} className="gap-6 mb-8">
        <Card decoration="top" decorationColor="green">
          <Text>Communities Surveyed</Text>
          <Metric>{loading ? '…' : stats.totalCommunities}</Metric>
        </Card>
        <Card decoration="top" decorationColor="blue">
          <Text>Total Population</Text>
          <Metric>{loading ? '…' : stats.totalPopulation.toLocaleString()}</Metric>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Text>Communities Healthy</Text>
          <Metric>{loading ? '…' : `${stats.healthyPct}%`}</Metric>
        </Card>
        <Card decoration="top" decorationColor="violet">
          <Text>Facilities Reporting</Text>
          <Metric>{loading ? '…' : stats.facilitiesReporting}</Metric>
        </Card>
      </Grid>

      {/* Disease Trends Chart */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Col numColSpan={1} numColSpanLg={2}>
          <Card>
            <Title>Disease Case Trends by Quarter</Title>
            <Text>Aggregated cases across all reporting facilities</Text>
            {chartData.length > 0 ? (
              <LineChart
                className="mt-4 h-64"
                data={chartData}
                index="quarter"
                categories={['Malaria', 'Diarrhea', 'Pneumonia', 'Simple Cough']}
                colors={['rose', 'orange', 'blue', 'indigo']}
                yAxisWidth={48}
              />
            ) : (
              <div className="mt-4 h-64 flex items-center justify-center text-gray-400 text-sm">
                {loading ? 'Loading…' : 'No quarterly data available. Run the sync service to import data.'}
              </div>
            )}
          </Card>
        </Col>
      </Grid>

      {/* Quick links */}
      {!loading && stats.totalCommunities === 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <Flex>
            <div>
              <Title className="text-amber-800">No data synced yet</Title>
              <Text className="text-amber-700">
                Run <code className="bg-amber-100 px-1 rounded">node src/sync/index.js</code> to import data from Google Sheets.
              </Text>
            </div>
            <Badge color="yellow">Setup needed</Badge>
          </Flex>
        </Card>
      )}
    </div>
  );
}
