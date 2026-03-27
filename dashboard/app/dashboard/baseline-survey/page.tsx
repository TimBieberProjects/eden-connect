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

// ── types ─────────────────────────────────────────────────────────────────────

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
  surveyPhase: string;
  // Section 3
  intervieweeName: string;
  phone: string;
  communityName: string;
  role: string;
  roleOther: string;
  llgName: string;
  districtName: string;
  provinceName: string;
  hasWardPlan: string;
  committeeActive: string;
  trainingsConducted: string;
  trainingOrg: string;
  govtAssistance: string;
  govtAssistanceDetail: string;
  attitudeBehaviour: string;
  communityLook: string;
  // Section 4
  bushHouses: string;
  semiPermHouses: string;
  permHouses: string;
  septicToilets: string;
  pitToilets: string;
  rubbishPits: string;
  dishRacks: string;
  sepKitchens: string;
  handWashDishes: string;
  faithGardens: string;
  // Section 5
  childrenUnder1: string;
  children1to5: string;
  children6to14: string;
  people15to49: string;
  people50plus: string;
  totalPop: string;
  households: string;
  // Section 6
  communityHealthy: string;
  communityHealthyExplain: string;
  commonIllnesses: string[];
  diseaseChange: string;
  diseaseDecreaseDetail: string;
  illnessesLessCommon: string;
  babiesDied: string;
  children1to5Died: string;
  olderDied: string;
  womenChildbirthDied: string;
  totalOutpatientLastYear: string;
  totalOutpatientYTD: string;
  malariaCases: string;
  pneumoniaCases: string;
  coughCases: string;
  skinCases: string;
  diarrheaCases: string;
  malnutritionCases: string;
  // Section 7
  waterSources: string[];
  waterFetchTime: string;
  extremeWeatherSource: string;
  emergencyPlan: string;
  schoolDistance: string;
  // Section 8
  noFormalEd: string;
  primaryEd: string;
  highSchool: string;
  secondarySchool: string;
  tertiaryEd: string;
  otherEd: string;
};

const ILLNESS_OPTIONS = [
  'Excessive Coughing/Sore Throats/Cold',
  'Malnutrition/Poor Nutrition',
  'Vomiting/Diarrhoea',
  'Worms/Intestinal problem',
  'Malaria',
  'Tuberculosis',
  'Skin disease',
  'Other',
];

const WATER_SOURCE_OPTIONS = [
  'Rivers/lakes/ponds',
  'Spring',
  'Piped water',
  'Rain-harvest tanks',
  'Borehole',
  'Water wells',
  'Gravity-fed system',
  'Other',
];

const initialState: FormState = {
  agencyName: '', province: '', coordinatorName: '', facilityName: '', llg: '', district: '', officerName: '',
  surveyPhase: '',
  intervieweeName: '', phone: '', communityName: '', role: '', roleOther: '', llgName: '', districtName: '',
  provinceName: '', hasWardPlan: '', committeeActive: '', trainingsConducted: '', trainingOrg: '',
  govtAssistance: '', govtAssistanceDetail: '', attitudeBehaviour: '', communityLook: '',
  bushHouses: '', semiPermHouses: '', permHouses: '', septicToilets: '', pitToilets: '', rubbishPits: '',
  dishRacks: '', sepKitchens: '', handWashDishes: '', faithGardens: '',
  childrenUnder1: '', children1to5: '', children6to14: '', people15to49: '', people50plus: '',
  totalPop: '', households: '',
  communityHealthy: '', communityHealthyExplain: '', commonIllnesses: [], diseaseChange: '',
  diseaseDecreaseDetail: '', illnessesLessCommon: '', babiesDied: '', children1to5Died: '',
  olderDied: '', womenChildbirthDied: '', totalOutpatientLastYear: '', totalOutpatientYTD: '',
  malariaCases: '', pneumoniaCases: '', coughCases: '', skinCases: '', diarrheaCases: '', malnutritionCases: '',
  waterSources: [], waterFetchTime: '', extremeWeatherSource: '', emergencyPlan: '', schoolDistance: '',
  noFormalEd: '', primaryEd: '', highSchool: '', secondarySchool: '', tertiaryEd: '', otherEd: '',
};

// ── component ─────────────────────────────────────────────────────────────────

export default function BaselineSurveyPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleCheckbox = (key: 'commonIllnesses' | 'waterSources', value: string) => {
    setForm(f => {
      const arr = f[key] as string[];
      return {
        ...f,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('eden_baseline_submissions') || '[]');
    existing.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem('eden_baseline_submissions', JSON.stringify(existing));
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
          The baseline survey has been saved locally. It will be synced to the database when connectivity allows.
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
        <h1 className="text-2xl font-bold text-slate-900">Baseline Survey</h1>
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

        {/* Section 2 — Survey Phase */}
        <SectionCard title="Section 2 — Survey Phase">
          <Field label="Survey Phase" required span>
            {radioGroup('surveyPhase', ['Baseline', 'Midline', 'End line', 'Monitoring'])}
          </Field>
        </SectionCard>

        {/* Section 3 — Community Profile */}
        <SectionCard title="Section 3 — Community Profile">
          <Field label="Interviewee Name" required>
            <input className={inputCls} value={form.intervieweeName} onChange={set('intervieweeName')} required placeholder="Full name" />
          </Field>
          <Field label="Phone Number">
            <input className={inputCls} type="tel" value={form.phone} onChange={set('phone')} placeholder="+675 xxx xxxx" />
          </Field>
          <Field label="Community Name" required>
            <input className={inputCls} value={form.communityName} onChange={set('communityName')} required placeholder="Community / village name" />
          </Field>
          <Field label="Role in Community">
            <select className={selectCls} value={form.role} onChange={set('role')}>
              <option value="">Select role...</option>
              <option>Village Councillor</option>
              <option>Health Promotion/EDEN Coordinator</option>
              <option>Village Health Volunteer</option>
              <option>Community Health Worker</option>
              <option>Nursing Officer</option>
              <option>Other</option>
            </select>
          </Field>
          {form.role === 'Other' && (
            <Field label="If Other role, please specify" span>
              <input className={inputCls} value={form.roleOther} onChange={set('roleOther')} placeholder="Describe role" />
            </Field>
          )}
          <Field label="Local Level Government Name">
            <input className={inputCls} value={form.llgName} onChange={set('llgName')} placeholder="LLG name" />
          </Field>
          <Field label="District Name">
            <input className={inputCls} value={form.districtName} onChange={set('districtName')} placeholder="District name" />
          </Field>
          <Field label="Province Name">
            <input className={inputCls} value={form.provinceName} onChange={set('provinceName')} placeholder="Province name" />
          </Field>
          <Field label="Does the community have a Ward Development Plan?" span>
            {radioGroup('hasWardPlan', ['Yes', 'No'])}
          </Field>
          {form.hasWardPlan === 'Yes' && (
            <Field label="Is the Ward Development Committee actively involved?" span>
              {radioGroup('committeeActive', ['Yes', 'No'])}
            </Field>
          )}
          <Field label="Trainings conducted about Health Promotion/EDEN/CBHC/CAP in the last two years?" span>
            {radioGroup('trainingsConducted', ['Yes', 'No'])}
          </Field>
          {form.trainingsConducted === 'Yes' && (
            <Field label="Name of organisation facilitating training" span>
              <input className={inputCls} value={form.trainingOrg} onChange={set('trainingOrg')} placeholder="Organisation name" />
            </Field>
          )}
          <Field label="Assistance from LLG/JDBPPC/DDA/Provincial governments?" span>
            {radioGroup('govtAssistance', ['Yes', 'No'])}
          </Field>
          {form.govtAssistance === 'Yes' && (
            <Field label="If yes, briefly explain the assistance received" span>
              <textarea className={textareaCls} value={form.govtAssistanceDetail} onChange={set('govtAssistanceDetail')} placeholder="Describe assistance..." />
            </Field>
          )}
          <Field label="Observation: attitude/behaviour/knowledge towards Health Promotion" span>
            <textarea className={textareaCls} value={form.attitudeBehaviour} onChange={set('attitudeBehaviour')} placeholder="Observations..." />
          </Field>
          <Field label="Observation: general look of community" span>
            <select className={selectCls} value={form.communityLook} onChange={set('communityLook')}>
              <option value="">Select...</option>
              <option>Well organised, Clean &amp; Healthy</option>
              <option>Partly organized and clean and healthy</option>
              <option>Not organised &amp; unhealthy or unhygienic</option>
              <option>Other</option>
            </select>
          </Field>
        </SectionCard>

        {/* Section 4 — Housing & Sanitation */}
        <SectionCard title="Section 4 — Housing &amp; Sanitation">
          {([
            ['bushHouses', 'Bush material houses #'],
            ['semiPermHouses', 'Semi-permanent houses #'],
            ['permHouses', 'Permanent houses #'],
            ['septicToilets', 'Septic toilets #'],
            ['pitToilets', 'Pit toilets #'],
            ['rubbishPits', 'Rubbish pits #'],
            ['dishRacks', 'Dish racks #'],
            ['sepKitchens', 'Separated kitchens #'],
            ['handWashDishes', 'Hand washing dishes #'],
            ['faithGardens', 'Faith gardens #'],
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

        {/* Section 5 — Census / Population */}
        <SectionCard title="Section 5 — Census / Population">
          {([
            ['childrenUnder1', 'Children <1yr #'],
            ['children1to5', 'Children 1–5 yrs #'],
            ['children6to14', 'Children 6–14 yrs #'],
            ['people15to49', 'People 15–49 yrs #'],
            ['people50plus', 'People 50yrs+ #'],
            ['totalPop', 'Total Population #'],
            ['households', 'Number of households #'],
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

        {/* Section 6 — Health */}
        <SectionCard title="Section 6 — Health">
          <Field label="Is the community healthy?" span>
            {radioGroup('communityHealthy', ['Yes', 'No'])}
          </Field>
          {form.communityHealthy === 'Yes' && (
            <Field label="If yes, explain" span>
              <textarea className={textareaCls} value={form.communityHealthyExplain} onChange={set('communityHealthyExplain')} placeholder="Explain..." />
            </Field>
          )}
          <Field label="Common illnesses (select all that apply)" span>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
              {ILLNESS_OPTIONS.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.commonIllnesses.includes(opt)}
                    onChange={() => toggleCheckbox('commonIllnesses', opt)}
                    className="accent-indigo-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Change in disease numbers this year?" span>
            {radioGroup('diseaseChange', ['Yes', 'No'])}
          </Field>
          {form.diseaseChange === 'Yes' && (
            <Field label="If yes, which disease and why decreased" span>
              <textarea className={textareaCls} value={form.diseaseDecreaseDetail} onChange={set('diseaseDecreaseDetail')} placeholder="Disease name and reason..." />
            </Field>
          )}
          <Field label="Illnesses less common since the program started" span>
            <textarea className={textareaCls} value={form.illnessesLessCommon} onChange={set('illnessesLessCommon')} placeholder="List illnesses..." />
          </Field>
          {([
            ['babiesDied', 'Babies <1yr died last year #'],
            ['children1to5Died', 'Children 1–5yrs died last year #'],
            ['olderDied', 'Children over 5 and adults died last year #'],
            ['womenChildbirthDied', 'Women who died in childbirth last year #'],
            ['totalOutpatientLastYear', 'Total outpatient last year #'],
            ['totalOutpatientYTD', 'Total outpatient since beginning of this year to date #'],
            ['malariaCases', 'Malaria cases this year #'],
            ['pneumoniaCases', 'Pneumonia cases this year #'],
            ['coughCases', 'Simple Cough cases this year #'],
            ['skinCases', 'Skin disease cases this year #'],
            ['diarrheaCases', 'Diarrhea cases this year #'],
            ['malnutritionCases', 'Malnutrition cases this year #'],
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

        {/* Section 7 — WASH */}
        <SectionCard title="Section 7 — WASH">
          <Field label="Main water source(s) (select all that apply)" span>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
              {WATER_SOURCE_OPTIONS.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.waterSources.includes(opt)}
                    onChange={() => toggleCheckbox('waterSources', opt)}
                    className="accent-indigo-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Time to fetch water">
            <input className={inputCls} value={form.waterFetchTime} onChange={set('waterFetchTime')} placeholder="e.g. 30 minutes" />
          </Field>
          <Field label="In extreme weather, will the community rely on this water source?" span>
            {radioGroup('extremeWeatherSource', ['Yes', 'No'])}
          </Field>
          {form.extremeWeatherSource === 'No' && (
            <Field label="If No, is an emergency plan in place?" span>
              {radioGroup('emergencyPlan', ['Yes', 'No'])}
            </Field>
          )}
          <Field label="Distance from community to nearest school">
            <input className={inputCls} value={form.schoolDistance} onChange={set('schoolDistance')} placeholder="e.g. 2 km" />
          </Field>
        </SectionCard>

        {/* Section 8 — Education */}
        <SectionCard title="Section 8 — Education">
          {([
            ['noFormalEd', 'No formal education #'],
            ['primaryEd', 'Completed primary education #'],
            ['highSchool', 'High School #'],
            ['secondarySchool', 'Secondary School #'],
            ['tertiaryEd', 'Tertiary/University #'],
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
          <Field label="Other education notes">
            <input className={inputCls} value={form.otherEd} onChange={set('otherEd')} placeholder="Any other education details..." />
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
