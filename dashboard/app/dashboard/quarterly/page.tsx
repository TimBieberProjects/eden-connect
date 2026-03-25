'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell,
  TableBody, TableCell, Badge,
} from '@tremor/react';
import HierarchyFilter from '@/components/HierarchyFilter';
import { createClient } from '@/lib/supabase/client';
import { getQuarterlyReports, type HierarchyFilters } from '@/lib/queries';

type Report = {
  facility_name: string;
  district_name: string;
  reporting_quarter: string;
  malaria_cases: number | null;
  malaria_trend: string | null;
  diarrhea_cases: number | null;
  pneumonia_cases: number | null;
  outpatient_total: number | null;
  villages_declared_healthy: number | null;
  total_communities_reached: number | null;
  eden_rolled_out: boolean | null;
};

const TREND_COLORS: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  decrease: 'green',
  Decrease: 'green',
  increase: 'red',
  Increase: 'red',
  'no change': 'yellow',
  'No Change': 'yellow',
};

export default function QuarterlyPage() {
  const [filters, setFilters] = useState<HierarchyFilters>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  useEffect(() => {
    setLoading(true);
    getQuarterlyReports(sb, filters).then(data => {
      setReports(data as Report[]);
      setLoading(false);
    });
  }, [filters]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quarterly Health Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Facility-level disease surveillance and community progress data
        </p>
      </div>

      <div className="mb-8">
        <HierarchyFilter value={filters} onChange={setFilters} />
      </div>

      <Card>
        <Title>Report Records</Title>
        <Text>{reports.length} report(s){loading ? ' (loading…)' : ''}</Text>

        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Facility</TableHeaderCell>
              <TableHeaderCell>District</TableHeaderCell>
              <TableHeaderCell>Quarter</TableHeaderCell>
              <TableHeaderCell>Malaria</TableHeaderCell>
              <TableHeaderCell>Trend</TableHeaderCell>
              <TableHeaderCell>Diarrhea</TableHeaderCell>
              <TableHeaderCell>Pneumonia</TableHeaderCell>
              <TableHeaderCell>Outpatients</TableHeaderCell>
              <TableHeaderCell>Communities</TableHeaderCell>
              <TableHeaderCell>Healthy Villages</TableHeaderCell>
              <TableHeaderCell>EDEN Rolled Out</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Text className="text-center py-8 text-gray-400">Loading…</Text>
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Text className="text-center py-8 text-gray-400">No quarterly reports found.</Text>
                </TableCell>
              </TableRow>
            ) : reports.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.facility_name ?? '—'}</TableCell>
                <TableCell>{r.district_name ?? '—'}</TableCell>
                <TableCell>{r.reporting_quarter ?? '—'}</TableCell>
                <TableCell>{r.malaria_cases ?? '—'}</TableCell>
                <TableCell>
                  {r.malaria_trend ? (
                    <Badge color={TREND_COLORS[r.malaria_trend] ?? 'gray'}>
                      {r.malaria_trend}
                    </Badge>
                  ) : '—'}
                </TableCell>
                <TableCell>{r.diarrhea_cases ?? '—'}</TableCell>
                <TableCell>{r.pneumonia_cases ?? '—'}</TableCell>
                <TableCell>{r.outpatient_total?.toLocaleString() ?? '—'}</TableCell>
                <TableCell>{r.total_communities_reached ?? '—'}</TableCell>
                <TableCell>{r.villages_declared_healthy ?? '—'}</TableCell>
                <TableCell>
                  {r.eden_rolled_out === null ? (
                    <Badge color="gray">Unknown</Badge>
                  ) : r.eden_rolled_out ? (
                    <Badge color="green">Yes</Badge>
                  ) : (
                    <Badge color="orange">No</Badge>
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
