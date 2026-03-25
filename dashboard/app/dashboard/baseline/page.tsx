'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell,
  TableBody, TableCell, Badge, BarChart, Grid,
} from '@tremor/react';
import HierarchyFilter from '@/components/HierarchyFilter';
import { createClient } from '@/lib/supabase/client';
import { getBaselineSurveys, type HierarchyFilters } from '@/lib/queries';

type Survey = {
  community_name: string;
  facility_name: string;
  district_name: string;
  survey_phase: string;
  total_population: number | null;
  total_households: number | null;
  community_described_as_healthy: boolean | null;
  malaria_cases_this_year: number | null;
  pit_toilets: number | null;
  water_source: string | null;
  submitted_at: string | null;
};

export default function BaselinePage() {
  const [filters, setFilters] = useState<HierarchyFilters>({});
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  useEffect(() => {
    setLoading(true);
    getBaselineSurveys(sb, filters).then(data => {
      setSurveys(data as Survey[]);
      setLoading(false);
    });
  }, [filters]);

  // Sanitation chart
  const sanitationData = surveys.slice(0, 10).map(s => ({
    community: s.community_name ?? 'Unknown',
    'Pit Toilets': s.pit_toilets ?? 0,
  }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Baseline Surveys</h1>
        <p className="text-gray-500 text-sm mt-1">
          Household health assessments collected by CHS health workers
        </p>
      </div>

      <div className="mb-8">
        <HierarchyFilter value={filters} onChange={setFilters} />
      </div>

      {/* Sanitation chart */}
      {sanitationData.length > 0 && (
        <Card className="mb-6">
          <Title>Pit Toilets per Community (top 10)</Title>
          <BarChart
            className="mt-4 h-48"
            data={sanitationData}
            index="community"
            categories={['Pit Toilets']}
            colors={['teal']}
            yAxisWidth={40}
          />
        </Card>
      )}

      {/* Survey table */}
      <Card>
        <Title>Survey Records</Title>
        <Text>{surveys.length} communities{loading ? ' (loading…)' : ''}</Text>

        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Community</TableHeaderCell>
              <TableHeaderCell>Facility</TableHeaderCell>
              <TableHeaderCell>District</TableHeaderCell>
              <TableHeaderCell>Phase</TableHeaderCell>
              <TableHeaderCell>Population</TableHeaderCell>
              <TableHeaderCell>Households</TableHeaderCell>
              <TableHeaderCell>Malaria Cases</TableHeaderCell>
              <TableHeaderCell>Water Source</TableHeaderCell>
              <TableHeaderCell>Healthy?</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Text className="text-center py-8 text-gray-400">Loading…</Text>
                </TableCell>
              </TableRow>
            ) : surveys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Text className="text-center py-8 text-gray-400">No baseline surveys found.</Text>
                </TableCell>
              </TableRow>
            ) : surveys.map((s, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{s.community_name ?? '—'}</TableCell>
                <TableCell>{s.facility_name ?? '—'}</TableCell>
                <TableCell>{s.district_name ?? '—'}</TableCell>
                <TableCell>{s.survey_phase ?? '—'}</TableCell>
                <TableCell>{s.total_population?.toLocaleString() ?? '—'}</TableCell>
                <TableCell>{s.total_households ?? '—'}</TableCell>
                <TableCell>{s.malaria_cases_this_year ?? '—'}</TableCell>
                <TableCell>{s.water_source ?? '—'}</TableCell>
                <TableCell>
                  {s.community_described_as_healthy === null ? (
                    <Badge color="gray">Unknown</Badge>
                  ) : s.community_described_as_healthy ? (
                    <Badge color="green">Yes</Badge>
                  ) : (
                    <Badge color="red">No</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
