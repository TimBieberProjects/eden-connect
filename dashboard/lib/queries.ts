import type { SupabaseClient } from '@supabase/supabase-js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HierarchyFilters {
  province_id?: string;
  district_id?: string;
  llg_id?: string;
  facility_id?: string;
}

// ── Hierarchy lookups ─────────────────────────────────────────────────────────

export async function getProvinces(sb: SupabaseClient) {
  const { data } = await sb.from('provinces').select('id, name').order('name');
  return data ?? [];
}

export async function getDistricts(sb: SupabaseClient, provinceId?: string) {
  let q = sb.from('districts').select('id, name, province_id').order('name');
  if (provinceId) q = q.eq('province_id', provinceId);
  const { data } = await q;
  return data ?? [];
}

export async function getLLGs(sb: SupabaseClient, districtId?: string) {
  let q = sb.from('llgs').select('id, name, district_id').order('name');
  if (districtId) q = q.eq('district_id', districtId);
  const { data } = await q;
  return data ?? [];
}

export async function getFacilities(sb: SupabaseClient, llgId?: string) {
  let q = sb.from('health_facilities').select('id, name, llg_id').order('name');
  if (llgId) q = q.eq('llg_id', llgId);
  const { data } = await q;
  return data ?? [];
}

// ── Overview stats ────────────────────────────────────────────────────────────

export async function getOverviewStats(sb: SupabaseClient, filters: HierarchyFilters = {}) {
  // Total communities
  let commQ = sb.from('v_baseline_surveys').select('community_id', { count: 'exact', head: true });
  if (filters.province_id) commQ = commQ.eq('province_id', filters.province_id);
  if (filters.district_id) commQ = commQ.eq('district_id', filters.district_id);
  const { count: totalCommunities } = await commQ;

  // Total population
  let popQ = sb.from('v_baseline_surveys').select('total_population');
  if (filters.province_id) popQ = popQ.eq('province_id', filters.province_id);
  if (filters.district_id) popQ = popQ.eq('district_id', filters.district_id);
  const { data: popData } = await popQ;
  const totalPopulation = (popData ?? []).reduce((s: number, r: { total_population: number | null }) => s + (r.total_population ?? 0), 0);

  // Healthy communities %
  let healthyQ = sb.from('v_baseline_surveys').select('community_described_as_healthy');
  if (filters.province_id) healthyQ = healthyQ.eq('province_id', filters.province_id);
  if (filters.district_id) healthyQ = healthyQ.eq('district_id', filters.district_id);
  const { data: healthyData } = await healthyQ;
  const healthyCount = (healthyData ?? []).filter((r: { community_described_as_healthy: boolean | null }) => r.community_described_as_healthy).length;
  const healthyPct = totalCommunities ? Math.round((healthyCount / totalCommunities) * 100) : 0;

  // Latest quarter facilities reporting
  let qQ = sb.from('v_quarterly_reports').select('health_facility_id', { count: 'exact', head: true });
  if (filters.province_id) qQ = qQ.eq('province_id', filters.province_id);
  const { count: facilitiesReporting } = await qQ;

  return { totalCommunities: totalCommunities ?? 0, totalPopulation, healthyPct, facilitiesReporting: facilitiesReporting ?? 0 };
}

// ── Disease trends ────────────────────────────────────────────────────────────

export async function getDiseaseTrends(sb: SupabaseClient, filters: HierarchyFilters = {}) {
  let q = sb.from('v_quarterly_reports').select(
    'reporting_quarter, malaria_cases, diarrhea_cases, pneumonia_cases, simple_cough_cases, skin_disease_cases, outpatient_total'
  ).order('reporting_quarter');
  if (filters.province_id) q = q.eq('province_id', filters.province_id);
  if (filters.district_id) q = q.eq('district_id', filters.district_id);
  if (filters.facility_id) q = q.eq('health_facility_id', filters.facility_id);
  const { data } = await q;
  return data ?? [];
}

// ── Baseline page ─────────────────────────────────────────────────────────────

export async function getBaselineSurveys(sb: SupabaseClient, filters: HierarchyFilters = {}) {
  let q = sb.from('v_baseline_surveys').select(
    'community_name, facility_name, district_name, province_name, survey_phase, total_population, total_households, community_described_as_healthy, malaria_cases_this_year, pit_toilets, water_source, submitted_at'
  ).order('submitted_at', { ascending: false }).limit(200);
  if (filters.province_id) q = q.eq('province_id', filters.province_id);
  if (filters.district_id) q = q.eq('district_id', filters.district_id);
  if (filters.llg_id) q = q.eq('llg_id', filters.llg_id);
  if (filters.facility_id) q = q.eq('health_facility_id', filters.facility_id);
  const { data } = await q;
  return data ?? [];
}

// ── Quarterly page ────────────────────────────────────────────────────────────

export async function getQuarterlyReports(sb: SupabaseClient, filters: HierarchyFilters = {}) {
  let q = sb.from('v_quarterly_reports').select(
    'facility_name, district_name, reporting_quarter, malaria_cases, malaria_trend, diarrhea_cases, pneumonia_cases, outpatient_total, villages_declared_healthy, total_communities_reached, eden_rolled_out, submitted_at'
  ).order('submitted_at', { ascending: false }).limit(200);
  if (filters.province_id) q = q.eq('province_id', filters.province_id);
  if (filters.district_id) q = q.eq('district_id', filters.district_id);
  if (filters.llg_id) q = q.eq('llg_id', filters.llg_id);
  if (filters.facility_id) q = q.eq('health_facility_id', filters.facility_id);
  const { data } = await q;
  return data ?? [];
}

// ── AI Query context ──────────────────────────────────────────────────────────

/**
 * Fetch data summaries to use as context for the AI health query.
 * Returns a structured string Claude can reason over.
 */
export async function getAIQueryContext(sb: SupabaseClient, question: string): Promise<string> {
  // Fetch recent quarterly reports
  const { data: quarterly } = await sb.from('v_quarterly_reports').select('*').order('submitted_at', { ascending: false }).limit(50);

  // Fetch baseline surveys
  const { data: baseline } = await sb.from('v_baseline_surveys').select('*').order('submitted_at', { ascending: false }).limit(50);

  const parts: string[] = [];

  if (quarterly && quarterly.length > 0) {
    parts.push('## Quarterly Health Reports\n');
    parts.push(JSON.stringify(quarterly, null, 2));
  }

  if (baseline && baseline.length > 0) {
    parts.push('\n## Community Baseline Surveys\n');
    parts.push(JSON.stringify(baseline, null, 2));
  }

  if (parts.length === 0) {
    return 'No health data is currently available in the database. The sync service may not have run yet.';
  }

  return parts.join('\n');
}
