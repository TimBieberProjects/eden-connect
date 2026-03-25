'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  sex: string | null;
  village: string | null;
  phone: string | null;
  guardian_name: string | null;
  notes: string | null;
  created_at: string;
};

type Consultation = {
  id: string;
  consulted_at: string;
  chief_complaint: string | null;
  ai_classification: string | null;
  ai_diagnosis: string | null;
  referral_required: boolean;
};

function age(dob: string | null) {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  if (years === 0) {
    const months = Math.floor(diff / (30.44 * 24 * 3600 * 1000));
    return `${months}mo`;
  }
  return `${years}yr`;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    first_name: '', last_name: '', dob: '', sex: '',
    village: '', phone: '', guardian_name: '', notes: '',
  });

  const supabase = createClient();

  useEffect(() => { loadPatients(); }, []);

  async function loadPatients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setPatients(data || []);
    setLoading(false);
  }

  async function selectPatient(p: Patient) {
    setSelected(p);
    const { data } = await supabase
      .from('consultations')
      .select('id, consulted_at, chief_complaint, ai_classification, ai_diagnosis, referral_required')
      .eq('patient_id', p.id)
      .order('consulted_at', { ascending: false });
    setConsultations(data || []);
  }

  async function savePatient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error } = await supabase.from('patients').insert({
      first_name: form.first_name,
      last_name: form.last_name,
      dob: form.dob || null,
      sex: form.sex || null,
      village: form.village || null,
      phone: form.phone || null,
      guardian_name: form.guardian_name || null,
      notes: form.notes || null,
    });
    if (error) {
      setError(error.message);
    } else {
      setShowForm(false);
      setForm({ first_name: '', last_name: '', dob: '', sex: '', village: '', phone: '', guardian_name: '', notes: '' });
      loadPatients();
    }
    setSaving(false);
  }

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.village || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const classColour = (c: string | null) =>
    c === 'PINK' ? 'bg-red-100 text-red-700' :
    c === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
    c === 'GREEN' ? 'bg-green-100 text-green-700' :
    'bg-gray-100 text-gray-500';

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} patients registered</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSelected(null); }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          + New Patient
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* New patient form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">New Patient</h2>
          <form onSubmit={savePatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">First name *</label>
                <input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Last name *</label>
                <input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Date of birth</label>
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Sex</label>
                <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-500">
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Village</label>
                <input value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Guardian / Caregiver name</label>
                <input value={form.guardian_name} onChange={e => setForm(f => ({ ...f, guardian_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
                {saving ? 'Saving…' : 'Save Patient'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-6">
        {/* Patient list */}
        <div className="w-72 flex-shrink-0">
          <input
            type="text"
            placeholder="Search patients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none mb-3"
          />
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No patients found</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPatient(p)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    selected?.id === p.id
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-green-200'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">{p.first_name} {p.last_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {age(p.dob)} {p.sex ? `· ${p.sex}` : ''} {p.village ? `· ${p.village}` : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Patient detail */}
        <div className="flex-1">
          {!selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
              Select a patient to view their record
            </div>
          ) : (
            <div className="space-y-4">
              {/* Demographics */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selected.first_name} {selected.last_name}</h2>
                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                      {selected.dob && <div>DOB: {new Date(selected.dob).toLocaleDateString()} ({age(selected.dob)})</div>}
                      {selected.sex && <div>Sex: {selected.sex}</div>}
                      {selected.village && <div>Village: {selected.village}</div>}
                      {selected.phone && <div>Phone: {selected.phone}</div>}
                      {selected.guardian_name && <div>Guardian: {selected.guardian_name}</div>}
                    </div>
                    {selected.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{selected.notes}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    Registered {new Date(selected.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Consultation history */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Consultation History ({consultations.length})</h3>
                {consultations.length === 0 ? (
                  <p className="text-sm text-gray-400">No consultations recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {consultations.map(c => (
                      <div key={c.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(c.consulted_at).toLocaleDateString('en-AU', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <div className="flex items-center gap-2">
                            {c.ai_classification && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${classColour(c.ai_classification)}`}>
                                {c.ai_classification}
                              </span>
                            )}
                            {c.referral_required && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Referral</span>
                            )}
                          </div>
                        </div>
                        {c.chief_complaint && (
                          <p className="text-sm text-gray-600 mb-2">{c.chief_complaint}</p>
                        )}
                        {c.ai_diagnosis && (
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer hover:text-gray-700">View full assessment</summary>
                            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed bg-gray-50 rounded p-3 overflow-auto max-h-64">
                              {c.ai_diagnosis}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
