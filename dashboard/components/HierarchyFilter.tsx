'use client';

import { useEffect, useState } from 'react';
import { Select, SelectItem } from '@tremor/react';
import { createClient } from '@/lib/supabase/client';
import {
  getProvinces, getDistricts, getLLGs, getFacilities,
  type HierarchyFilters,
} from '@/lib/queries';

interface Props {
  value: HierarchyFilters;
  onChange: (filters: HierarchyFilters) => void;
}

export default function HierarchyFilter({ value, onChange }: Props) {
  const sb = createClient();

  const [provinces,  setProvinces]  = useState<{ id: string; name: string }[]>([]);
  const [districts,  setDistricts]  = useState<{ id: string; name: string }[]>([]);
  const [llgs,       setLLGs]       = useState<{ id: string; name: string }[]>([]);
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]);

  // Load provinces once
  useEffect(() => { getProvinces(sb).then(setProvinces); }, []);

  // Cascade: province → districts
  useEffect(() => {
    setDistricts([]); setLLGs([]); setFacilities([]);
    if (value.province_id) getDistricts(sb, value.province_id).then(setDistricts);
  }, [value.province_id]);

  // Cascade: district → LLGs
  useEffect(() => {
    setLLGs([]); setFacilities([]);
    if (value.district_id) getLLGs(sb, value.district_id).then(setLLGs);
  }, [value.district_id]);

  // Cascade: LLG → facilities
  useEffect(() => {
    setFacilities([]);
    if (value.llg_id) getFacilities(sb, value.llg_id).then(setFacilities);
  }, [value.llg_id]);

  function update(patch: Partial<HierarchyFilters>) {
    // Clear child selections when parent changes
    const next = { ...value, ...patch };
    if (patch.province_id !== undefined) { next.district_id = undefined; next.llg_id = undefined; next.facility_id = undefined; }
    if (patch.district_id !== undefined) { next.llg_id = undefined; next.facility_id = undefined; }
    if (patch.llg_id !== undefined) { next.facility_id = undefined; }
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        placeholder="All Provinces"
        value={value.province_id ?? ''}
        onValueChange={v => update({ province_id: v || undefined })}
        className="min-w-[160px]"
      >
        <SelectItem value="">All Provinces</SelectItem>
        {provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
      </Select>

      <Select
        placeholder="All Districts"
        value={value.district_id ?? ''}
        onValueChange={v => update({ district_id: v || undefined })}
        disabled={!value.province_id}
        className="min-w-[160px]"
      >
        <SelectItem value="">All Districts</SelectItem>
        {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
      </Select>

      <Select
        placeholder="All LLGs"
        value={value.llg_id ?? ''}
        onValueChange={v => update({ llg_id: v || undefined })}
        disabled={!value.district_id}
        className="min-w-[160px]"
      >
        <SelectItem value="">All LLGs</SelectItem>
        {llgs.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
      </Select>

      <Select
        placeholder="All Facilities"
        value={value.facility_id ?? ''}
        onValueChange={v => update({ facility_id: v || undefined })}
        disabled={!value.llg_id}
        className="min-w-[180px]"
      >
        <SelectItem value="">All Facilities</SelectItem>
        {facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
      </Select>
    </div>
  );
}
