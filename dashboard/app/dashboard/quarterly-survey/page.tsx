'use client';

import { useState } from 'react';

// ── helpers ──────────────────────────────────────────────────────────────────

const req = <span className="text-red-500 ml-0.5">*</span>;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-1 h-6 rounded-full bg-indigo-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, required, span, children }: {
  label: string;
  required?: boolean;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && req}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition';
const textareaCls = `${inputCls} resize-y min-h-[80px]`;
const selectCls = `${inputCls} cursor-pointer`;

// ── disease row type ──────────────────────────────────────────────────────────

type DiseaseData = {
  cases: string;
  direction: string;
  reason: string;
};

const DISEASE_REASON_OPTIONS = [
  'Hygiene behavior practice well',
  'Take ownership of their own',
  'Outbreak of disease',
  'Poor hygiene practice',
  'Negligence',
  'Not being informed well',
];

const DISEASES = [
  'Malaria',
  'Confirmed Malaria (RDT)',
  'Diarrhea',
  'Skin Diseases',
  'Simple Cough',
  'Pneumonia',
] as const;

type DiseaseName = typeof DISEASES[number];

// ── form state ────────────────────────────────────────────────────────────────

type FormState = {
  // Section 1
  agencyName: string;
  province: string;
  coordinatorName: string;
  facilityName: string;
  llg: string;
  district: string;
  officerName: string;
  // Section 2
  reportQuarter: string;
  attendedTOT: string;
  totWhen: string;
  hasAnnualPlan: string;
  allocated20Pct: string;
  rolledOutEDEN: string;
  facilitiesCount: string;
  noRolloutReason: string;
  // Section 3 — diseases
  diseases: Record<DiseaseName, DiseaseData>;
  outpatientTotal: string;
  outpatientDirection: string;
  outpatientReason: string;
  // Section 4
  communitiesReached: string;
  declaredHealthyCount: string;
  declaredHealthyList: string;
  workingTowardsCount: string;
  workingTowardsList: string;
  healthyFamilies: string;
  newVillagesCount: string;
  newVillagesList: string;
  // Section 5
  newPermHouses: string;
  newSemiPermHouses: string;
  newBushHouses: string;
  newPitToilets: string;
  newVIPToilets: string;
  newRubbishPits: string;
  newRoofCatchment: string;
  newDishRacks: string;
  newSepKitchens: string;
  newHandWashDishes: string;
  newFaithGardens: string;
  // Section 6
  adviceNeeded: string;
  otherComments: string;
  dateSubmitted: string;
  compiledBy: string;
};

const emptyDisease: DiseaseData = { cases: '', direction: '', reason: '' };

const initialDiseases = DISEASES.reduce((acc, d) => {
  acc[d] = { ...emptyDisease };
  return acc;
}, {} as Record<DiseaseName, DiseaseData>);

const initialState: FormState = {
  agencyName: '', province: '', coordinatorName: '', facilityName: '', llg: '', district: '', officerName: '',
  reportQuarter: '',
  attendedTOT: '', totWhen: '', hasAnnualPlan: '', allocated20Pct: '', rolledOutEDEN: '',
  facilitiesCount: '', noRolloutReason: '',
  diseases: initialDiseases,
  outpatientTotal: '', outpatientDirection: '', outpatientReason: '',
  communitiesReached: '', declaredHealthyCount: '', declaredHealthyList: '',
  workingTowardsCount: '', workingTowardsList: '', healthyFamilies: '',
  newVillagesCount: '', newVillagesList: '',
  newPermHouses: '', newSemiPermHouses: '', newBushHouses: '', newPitToilets: '',
  newVIPToilets: '', newRubbishPits: '', newRoofCatchment: '', newDishRacks: '',
  newSepKitchens: '', newHandWashDishes: '', newFaithGardens: '',
  adviceNeeded: '', otherComments: '', dateSubmitted: '', compiledBy: '',
};

// ── component ─────────────────────────────────────────────────────────────────

export default function QuarterlySurveyPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const setDisease = (disease: DiseaseName, field: keyof DiseaseData, value: string) => {
    setForm(f => ({
      ...f,
      diseases: {
        ...f.diseases,
        [disease]: { ...f.diseases[disease], [field]: value },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('eden_quarterly_submissions') || '[]');
    existing.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem('eden_quarterly_submissions', JSON.stringify(existing));
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm(initialState);
    setSubmitted(false);
  };

  const radioGroup = (key: keyof FormState, options: string[]) => (
    <div className="flex flex-wrap gap-4 mt-1">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="radio"
            name={key}
            value={opt}
            checked={form[key] === opt}
            onChange={set(key)}
            className="accent-indigo-600"
          />
          {opt}
        </label>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Survey submitted successfully</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          The quarterly survey has been saved locally. It will be synced to the database when connectivity allows.
        </p>
        <button
          onClick={handleReset}
          className="mt-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          Submit another survey
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quarterly Survey</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete all required fields marked with <span className="text-red-500 font-medium">*</span>. Data is saved locally and synced when online.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1 — Agency Profile */}
        <SectionCard title="Section 1 — Agency Profile">
          <Field label="Agency Name" required>
            <input className={inputCls} value={form.agencyName} onChange={set('agencyName')} required placeholder="Enter agency name" />
          </Field>
          <Field label="Province" required>
            <input className={inputCls} value={form.province} onChange={set('province')} required placeholder="Enter province" />
          </Field>
          <Field label="Name of Agency Health Promotion Coordinator" required span>
            <input className={inputCls} value={form.coordinatorName} onChange={set('coordinatorName')} required placeholder="Full name" />
          </Field>
          <Field label="Health Facility Name">
            <input className={inputCls} value={form.facilityName} onChange={set('facilityName')} placeholder="Enter facility name" />
          </Field>
          <Field label="LLG">
            <input className={inputCls} value={form.llg} onChange={set('llg')} placeholder="Local Level Government" />
          </Field>
          <Field label="District">
            <input className={inputCls} value={form.district} onChange={set('district')} placeholder="Enter district" />
          </Field>
          <Field label="Name of Facility Health Promotion Officer" span>
            <input className={inputCls} value={form.officerName} onChange={set('officerName')} placeholder="Full name" />
          </Field>
        </SectionCard>

        {/* Section 2 — Agency Office Report */}
        <SectionCard title="Section 2 — Agency Office Report">
          <Field label="Report Quarter" required span>
            {radioGroup('reportQuarter', [
              'January–March',
              'April–June',
              'July–September',
              'October–December',
            ])}
          </Field>
          <Field label="Attended EDEN TOT Training?" span>
            {radioGroup('attendedTOT', ['Yes', 'No'])}
          </Field>
          {form.attendedTOT === 'Yes' && (
            <Field label="If yes, when?" span>
              <input className={inputCls} value={form.totWhen} onChange={set('totWhen')} placeholder="Date or period" />
            </Field>
          )}
          <Field label="Agency developed Annual Implementation Plan for EDEN?" span>
            {radioGroup('hasAnnualPlan', ['Yes', 'No'])}
          </Field>
          <Field label="Agency allocated 20% of monthly grant for EDEN Program?" span>
            {radioGroup('allocated20Pct', ['Yes', 'No'])}
          </Field>
          <Field label="Agency rolled out EDEN from facility catchment areas?" span>
            {radioGroup('rolledOutEDEN', ['Yes', 'No'])}
          </Field>
          {form.rolledOutEDEN === 'Yes' && (
            <Field label="If yes, how many facilities?" span>
              <input className={inputCls} type="number" min="0" value={form.facilitiesCount} onChange={set('facilitiesCount')} placeholder="0" />
            </Field>
          )}
          {form.rolledOutEDEN === 'No' && (
            <Field label="If no, reason" span>
              <select className={selectCls} value={form.noRolloutReason} onChange={set('noRolloutReason')}>
                <option value="">Select reason...</option>
                <option>No resources allocated</option>
                <option>Not seen as priority</option>
                <option>Still planning</option>
                <option>Geographical difficulties</option>
              </select>
            </Field>
          )}
        </SectionCard>

        {/* Section 3 — Health Facility Disease Data */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <div className="w-1 h-6 rounded-full bg-indigo-500 flex-shrink-0" />
            <h2 className="text-base font-semibold text-slate-800">Section 3 — Health Facility Disease Data</h2>
          </div>
          <div className="px-6 py-5 space-y-6">
            {DISEASES.map(disease => (
              <div key={disease} className="border border-slate-100 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-indigo-700">{disease}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total new cases this quarter</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      value={form.diseases[disease].cases}
                      onChange={e => setDisease(disease, 'cases', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Increase or decrease?</label>
                    <div className="flex gap-4 mt-2">
                      {['Increase', 'Decrease'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`${disease}_direction`}
                            value={opt}
                            checked={form.diseases[disease].direction === opt}
                            onChange={e => setDisease(disease, 'direction', e.target.value)}
                            className="accent-indigo-600"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                    <select
                      className={selectCls}
                      value={form.diseases[disease].reason}
                      onChange={e => setDisease(disease, 'reason', e.target.value)}
                    >
                      <option value="">Select reason...</option>
                      {DISEASE_REASON_OPTIONS.map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Outpatient row */}
            <div className="border border-slate-100 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-indigo-700">Total Outpatient</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total outpatient record this quarter</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={form.outpatientTotal}
                    onChange={set('outpatientTotal')}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Increase or decrease?</label>
                  <div className="flex gap-4 mt-2">
                    {['Increase', 'Decrease'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="outpatient_direction"
                          value={opt}
                          checked={form.outpatientDirection === opt}
                          onChange={set('outpatientDirection')}
                          className="accent-indigo-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                  <select className={selectCls} value={form.outpatientReason} onChange={set('outpatientReason')}>
                    <option value="">Select reason...</option>
                    {DISEASE_REASON_OPTIONS.map(r => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 — Community */}
        <SectionCard title="Section 4 — Community">
          <Field label="Total communities reached #">
            <input className={inputCls} type="number" min="0" value={form.communitiesReached} onChange={set('communitiesReached')} placeholder="0" />
          </Field>
          <Field label="Declared Healthy Villages #">
            <input className={inputCls} type="number" min="0" value={form.declaredHealthyCount} onChange={set('declaredHealthyCount')} placeholder="0" />
          </Field>
          <Field label="List declared Healthy Villages" span>
            <textarea className={textareaCls} value={form.declaredHealthyList} onChange={set('declaredHealthyList')} placeholder="List village names, one per line..." />
          </Field>
          <Field label="Villages healthy but still working towards criteria #">
            <input className={inputCls} type="number" min="0" value={form.workingTowardsCount} onChange={set('workingTowardsCount')} placeholder="0" />
          </Field>
          <Field label="List those villages" span>
            <textarea className={textareaCls} value={form.workingTowardsList} onChange={set('workingTowardsList')} placeholder="List village names, one per line..." />
          </Field>
          <Field label="Healthy families meeting criteria #">
            <input className={inputCls} type="number" min="0" value={form.healthyFamilies} onChange={set('healthyFamilies')} placeholder="0" />
          </Field>
          <Field label="New villages currently working with #">
            <input className={inputCls} type="number" min="0" value={form.newVillagesCount} onChange={set('newVillagesCount')} placeholder="0" />
          </Field>
          <Field label="List new villages" span>
            <textarea className={textareaCls} value={form.newVillagesList} onChange={set('newVillagesList')} placeholder="List village names, one per line..." />
          </Field>
        </SectionCard>

        {/* Section 5 — New Developments */}
        <SectionCard title="Section 5 — New Developments">
          {([
            ['newPermHouses', 'New permanent houses built #'],
            ['newSemiPermHouses', 'New semi-permanent houses built #'],
            ['newBushHouses', 'New bush material houses built #'],
            ['newPitToilets', 'New pit toilets dug #'],
            ['newVIPToilets', 'New VIP toilets built #'],
            ['newRubbishPits', 'New rubbish pits dug #'],
            ['newRoofCatchment', 'New roof catchment water supplies #'],
            ['newDishRacks', 'New dish racks built #'],
            ['newSepKitchens', 'New separated kitchens built #'],
            ['newHandWashDishes', 'New hand washing dishes built #'],
            ['newFaithGardens', 'New faith gardens made #'],
          ] as [keyof FormState, string][]).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form[key] as string}
                onChange={set(key)}
                placeholder="0"
              />
            </Field>
          ))}
        </SectionCard>

        {/* Section 6 — Observations & Comments */}
        <SectionCard title="Section 6 — Observations &amp; Comments">
          <Field label="Anything requiring advice" span>
            <textarea className={textareaCls} value={form.adviceNeeded} onChange={set('adviceNeeded')} placeholder="Describe any issues requiring advice..." />
          </Field>
          <Field label="Any other comments" span>
            <textarea className={textareaCls} value={form.otherComments} onChange={set('otherComments')} placeholder="Additional comments..." />
          </Field>
          <Field label="Date Submitted">
            <input className={inputCls} type="date" value={form.dateSubmitted} onChange={set('dateSubmitted')} />
          </Field>
          <Field label="Compiled by">
            <input className={inputCls} value={form.compiledBy} onChange={set('compiledBy')} placeholder="Full name" />
          </Field>
        </SectionCard>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
          >
            Submit Survey
          </button>
        </div>
      </form>
    </div>
  );
}
