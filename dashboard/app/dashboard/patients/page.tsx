'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Triage = 'PINK' | 'YELLOW' | 'GREEN';

interface Vitals {
  temp: string;
  hr: string;
  rr: string;
  bp: string;
  spo2: string;
  weight: string;
}

interface Visit {
  date: string;
  provider: string;
  facility: string;
  triage: Triage;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  medications: string[];
  vitals: Vitals;
}

interface CommunityStats {
  topConditions: string[];
  malariaPrevalence: string;
  malnutritionRate: string;
  activeCases: number;
}

interface Patient {
  id: string;
  name: string;
  initials: string;
  age: string;
  sex: string;
  dob: string;
  village: string;
  district: string;
  province: string;
  phone?: string;
  guardian?: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  visits: Visit[];
  aiSummary: string;
  communityStats: CommunityStats;
  rxCheck: string;
  lastTriage: Triage;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Maria Yagusa',
    initials: 'MY',
    age: '34',
    sex: 'Female',
    dob: '1991-03-15',
    village: 'Yagusa village',
    district: 'Henganofi',
    province: 'Eastern Highlands',
    phone: '+675 7234 5678',
    bloodType: 'O+',
    allergies: ['Penicillin'],
    conditions: ['Recurrent malaria', 'Hypertension'],
    medications: ['Amlodipine 5mg OD', 'Ferrous sulfate 200mg OD'],
    lastTriage: 'YELLOW',
    visits: [
      {
        date: '2026-03-18',
        provider: 'CHW Emma Wakpi',
        facility: 'Henganofi Aid Post',
        triage: 'YELLOW',
        chiefComplaint: 'Fever and headache x 3 days',
        subjective:
          '3-day history of high fever, severe headache, chills and body aches. No vomiting. Last malaria episode 4 months ago.',
        objective:
          'Temp 38.9°C, HR 98 bpm, RR 22/min, BP 138/88 mmHg, Weight 62kg, SpO2 97%. RDT positive P. falciparum. Mild pallor. No jaundice. No neck stiffness.',
        assessment: 'Uncomplicated P. falciparum malaria. Hypertension stable.',
        plan: 'Artemether-Lumefantrine 4 tabs BD x3 days. Paracetamol 1g TDS PRN. Encourage fluids. BP recheck 2 weeks. Return if vomiting or confusion.',
        medications: ['Artemether-Lumefantrine 80/480mg', 'Paracetamol 1g'],
        vitals: { temp: '38.9°C', hr: '98 bpm', rr: '22/min', bp: '138/88', spo2: '97%', weight: '62 kg' },
      },
      {
        date: '2026-02-02',
        provider: 'CHW Emma Wakpi',
        facility: 'Henganofi Aid Post',
        triage: 'GREEN',
        chiefComplaint: 'Routine BP review and dizziness',
        subjective:
          'Occasional dizziness on standing. No headache. Compliant with Amlodipine. Feels generally well.',
        objective: 'Temp 36.8°C, HR 78 bpm, RR 18/min, BP 132/84 mmHg, Weight 61kg, SpO2 99%.',
        assessment: 'Hypertension - improving. Iron deficiency anemia under treatment.',
        plan: 'Continue Amlodipine 5mg. Continue ferrous sulfate. Low salt diet counselling. Review 3 months.',
        medications: ['Amlodipine 5mg', 'Ferrous sulfate 200mg'],
        vitals: { temp: '36.8°C', hr: '78 bpm', rr: '18/min', bp: '132/84', spo2: '99%', weight: '61 kg' },
      },
    ],
    aiSummary:
      'Maria has had 3 confirmed malaria episodes in the past 12 months, all uncomplicated P. falciparum, all treated with AL with resolution. Blood pressure has been trending high but is responding to Amlodipine 5mg — latest reading 132/84 shows improvement. Iron deficiency anemia identified in November 2025 is under treatment with ferrous sulfate. Key actions: ensure ITN use, consider prophylaxis given recurrent malaria, continue BP monitoring every 3 months, recheck Hb in next visit.',
    communityStats: {
      topConditions: ['Malaria (P. falciparum)', 'Hypertension', 'Respiratory infections'],
      malariaPrevalence: '31%',
      malnutritionRate: '4.1%',
      activeCases: 7,
    },
    rxCheck:
      '✓ Artemether-Lumefantrine: Correct first-line treatment for uncomplicated P. falciparum per PNG National Malaria Treatment Protocol 2023. Dose correct for adult (4 tabs BD x3 days). ✓ Paracetamol: Appropriate antipyretic, dose within safe range. ✓ Penicillin allergy noted — no beta-lactams prescribed. ⚠ Note: Patient is of reproductive age — confirm pregnancy status before next AL course. Recommend: Ensure bed net distribution, screen household contacts.',
  },
  {
    id: '2',
    name: 'Peter Kamano',
    initials: 'PK',
    age: '8',
    sex: 'Male',
    dob: '2017-11-22',
    village: 'Kamano village',
    district: 'Henganofi',
    province: 'Eastern Highlands',
    guardian: 'Mary Kamano (mother)',
    bloodType: 'A+',
    allergies: [],
    conditions: ['Recurrent acute respiratory infections'],
    medications: [],
    lastTriage: 'YELLOW',
    visits: [
      {
        date: '2026-03-20',
        provider: 'CHW Stephen Kafe',
        facility: 'Kamano Community Post',
        triage: 'YELLOW',
        chiefComplaint: 'Cough, fever, fast breathing x 4 days',
        subjective:
          'Guardian reports 4-day history of productive cough, fever, and fast breathing. Poor feeding. Third respiratory episode this year.',
        objective:
          'Temp 38.4°C, HR 112 bpm, RR 46/min, Weight 22kg, SpO2 94%. Chest: bilateral crackles lower zones. No chest indrawing. No stridor. RDT negative.',
        assessment: 'Pneumonia (non-severe). SpO2 borderline — monitor closely.',
        plan: 'Amoxicillin 500mg TDS x5 days. Paracetamol 250mg TDS PRN. Encourage fluids and feeds. Recheck in 48 hours. Refer if SpO2 drops below 92%, chest indrawing, or no improvement.',
        medications: ['Amoxicillin 500mg', 'Paracetamol 250mg'],
        vitals: { temp: '38.4°C', hr: '112 bpm', rr: '46/min', bp: '—', spo2: '94%', weight: '22 kg' },
      },
      {
        date: '2026-01-14',
        provider: 'CHW Stephen Kafe',
        facility: 'Kamano Community Post',
        triage: 'GREEN',
        chiefComplaint: 'Cough and runny nose x 5 days',
        subjective:
          'Similar presentation to previous episodes. Guardian concerned about frequency. No fever today.',
        objective: 'Temp 37.1°C, HR 96 bpm, RR 32/min, Weight 21.8kg, SpO2 97%.',
        assessment: 'Upper respiratory tract infection, resolving. Well-nourished.',
        plan: 'Supportive care. Saline nasal drops. Paracetamol PRN. No antibiotics indicated. Safety net given to mother.',
        medications: ['Paracetamol 250mg PRN'],
        vitals: { temp: '37.1°C', hr: '96 bpm', rr: '32/min', bp: '—', spo2: '97%', weight: '21.8 kg' },
      },
    ],
    aiSummary:
      'Peter has presented with acute respiratory illness 3 times in the past 3 months — a pattern that warrants further investigation. Most recent episode shows borderline SpO2 of 94% and bilateral crackles, consistent with non-severe pneumonia. He has responded well to Amoxicillin previously. Recommend: TB contact screening (given community prevalence), assess housing ventilation and indoor smoke exposure, consider referral to Henganofi Health Centre for chest X-ray if third episode occurs. MUAC within normal range — nutrition is not a contributing factor currently.',
    communityStats: {
      topConditions: ['Respiratory infections', 'Malaria', 'Diarrhoeal disease'],
      malariaPrevalence: '28%',
      malnutritionRate: '6.3%',
      activeCases: 4,
    },
    rxCheck:
      '✓ Amoxicillin 500mg TDS: Appropriate first-line for non-severe pneumonia per WHO IMCI guidelines. Note: weight-based dosing for 22kg child — 500mg TDS is within acceptable range (aim 25mg/kg/day = 550mg/day ✓). ✓ Paracetamol 250mg: Correct paediatric dose for weight. ✓ No antibiotics prescribed for URTI episode in January — appropriate antibiotic stewardship. ⚠ Monitor: If SpO2 does not improve to >96% within 48 hours, escalate to Henganofi Health Centre for IV antibiotics and oxygen.',
  },
  {
    id: '3',
    name: 'Agnes Benabena',
    initials: 'AB',
    age: '22',
    sex: 'Female',
    dob: '2003-07-08',
    village: 'Benabena village',
    district: 'Unggai-Bena',
    province: 'Eastern Highlands',
    bloodType: 'AB+',
    allergies: [],
    conditions: ['G2P1, 32 weeks gestation'],
    medications: ['Folate 5mg OD', 'Ferrous sulfate 200mg OD', 'Mebendazole 500mg (single dose at 28wks)'],
    lastTriage: 'GREEN',
    visits: [
      {
        date: '2026-03-15',
        provider: 'Midwife Nurse Anna Kore',
        facility: 'Benabena Aid Post',
        triage: 'GREEN',
        chiefComplaint: 'Routine ANC visit, 32 weeks',
        subjective:
          'Feeling well. Good fetal movement. Mild ankle swelling in evenings. First pregnancy carried to term - normal vaginal delivery 2024. No hypertension history.',
        objective:
          'Temp 36.6°C, HR 82 bpm, RR 18/min, BP 118/76 mmHg, Weight 68kg (pre-pregnancy 58kg, gained 10kg). Fundal height 31cm. Fetal heart rate 146 bpm. No proteinuria on dipstick. Mild pitting oedema ankles bilateral.',
        assessment: 'G2P1 at 32 weeks gestation. Uncomplicated pregnancy. Mild physiological ankle oedema.',
        plan: 'Continue folate and iron. Tetanus toxoid 2nd dose given. Sleep under ITN. Return 4 weeks (36 weeks). Danger signs counselling: bleeding, severe headache, reduced fetal movement, fits.',
        medications: ['Folate 5mg', 'Ferrous sulfate 200mg', 'Tetanus toxoid (given)'],
        vitals: { temp: '36.6°C', hr: '82 bpm', rr: '18/min', bp: '118/76', spo2: '—', weight: '68 kg' },
      },
      {
        date: '2026-02-10',
        provider: 'Midwife Nurse Anna Kore',
        facility: 'Benabena Aid Post',
        triage: 'GREEN',
        chiefComplaint: 'ANC 28 weeks',
        subjective: 'Well. Active fetal movement. No concerns. Eating well.',
        objective:
          'Temp 36.7°C, HR 80 bpm, BP 114/72 mmHg, Weight 65kg. Fundal height 28cm. FHR 152 bpm. Urine NAD.',
        assessment: 'Normal pregnancy progression at 28 weeks.',
        plan: 'Mebendazole 500mg single dose given. Continue folate and iron. MUAC: 28cm (normal). Plan for facility delivery at Benabena Aid Post or Goroka General if complications.',
        medications: ['Mebendazole 500mg', 'Folate 5mg', 'Ferrous sulfate 200mg'],
        vitals: { temp: '36.7°C', hr: '80 bpm', rr: '18/min', bp: '114/72', spo2: '—', weight: '65 kg' },
      },
    ],
    aiSummary:
      'Agnes is progressing well through her second pregnancy at 32 weeks gestation. BP has been consistently normal across both visits, no proteinuria detected, and fetal growth is on track (fundal height matching dates). Weight gain of 10kg is within recommended range. Iron and folate compliance appears good. Ankle oedema at 32 weeks is physiological and not concerning in the absence of hypertension or proteinuria. Key priorities: arrange plan for delivery location (recommend facility delivery given distance from referral hospital), ensure third ANC at 36 weeks, check birth kit is available, and educate on danger signs requiring immediate transfer.',
    communityStats: {
      topConditions: ['ANC visits', 'Malaria', 'Malnutrition'],
      malariaPrevalence: '22%',
      malnutritionRate: '3.8%',
      activeCases: 2,
    },
    rxCheck:
      '✓ Folate 5mg OD: Recommended in PNG for all pregnant women throughout pregnancy. ✓ Ferrous sulfate 200mg OD: Iron supplementation appropriate — no anaemia detected but prophylactic treatment correct given PNG malaria context. ✓ Mebendazole 500mg single dose at 28 weeks: Per PNG ANC guidelines — appropriate timing (after first trimester). ✓ Tetanus toxoid 2nd dose at 32 weeks: On schedule per national immunisation protocol. No concerns with current medication regimen.',
  },
  {
    id: '4',
    name: 'Joshua Kainantu',
    initials: 'JK',
    age: '45',
    sex: 'Male',
    dob: '1980-06-30',
    village: 'Kainantu town',
    district: 'Kainantu',
    province: 'Eastern Highlands',
    bloodType: 'B+',
    allergies: [],
    conditions: ['Type 2 Diabetes Mellitus (diagnosed 2023)', 'Previous pulmonary TB (treatment completed 2022)'],
    medications: ['Metformin 500mg BD', 'Glibenclamide 5mg OD', 'Aspirin 100mg OD'],
    lastTriage: 'YELLOW',
    visits: [
      {
        date: '2026-03-10',
        provider: 'CHW David Omaura',
        facility: 'Kainantu Health Centre',
        triage: 'YELLOW',
        chiefComplaint: 'Routine DM review - 3 monthly check',
        subjective:
          'Blood glucose at home averaging 12-14 mmol/L by fingerprick. More thirsty than usual. Some fatigue. Feet feel numb at times. On Metformin and Glibenclamide. Compliant with medication but diet is poor - high carbohydrate.',
        objective:
          'Temp 36.9°C, HR 84 bpm, RR 18/min, BP 142/90 mmHg, Weight 78kg. RBG: 14.2 mmol/L. Feet: sensation reduced to monofilament L foot. No ulcers. Peripheral pulses intact.',
        assessment:
          'Type 2 DM - poorly controlled. Peripheral neuropathy developing left foot. Hypertension (new finding).',
        plan: 'Increase Metformin to 1000mg BD. Add Amlodipine 5mg for BP. Dietary counselling - reduce white rice, increase vegetables. Foot care education. Refer Goroka General for HbA1c, urine ACR, and ophthalmology review. Review 4 weeks.',
        medications: ['Metformin 1000mg', 'Glibenclamide 5mg', 'Amlodipine 5mg', 'Aspirin 100mg'],
        vitals: { temp: '36.9°C', hr: '84 bpm', rr: '18/min', bp: '142/90', spo2: '—', weight: '78 kg' },
      },
      {
        date: '2026-01-15',
        provider: 'CHW David Omaura',
        facility: 'Kainantu Health Centre',
        triage: 'YELLOW',
        chiefComplaint: 'DM review, cough 2 weeks',
        subjective:
          'RBG at home 10-13. Productive cough x2 weeks. No haemoptysis. Night sweats denied. Previously completed TB treatment 2022.',
        objective:
          'Temp 37.0°C, HR 82 bpm, RR 20/min, BP 138/88 mmHg, Weight 77kg. RBG 11.8 mmol/L. Sputum collected for GeneXpert.',
        assessment: 'T2DM - partially controlled. Cough - exclude TB recurrence or secondary infection. Hypertension.',
        plan: 'Await GeneXpert result. Azithromycin 500mg OD x5 days for likely bacterial bronchitis. Continue DM medications. Return 1 week for results.',
        medications: ['Azithromycin 500mg', 'Metformin 500mg', 'Glibenclamide 5mg'],
        vitals: { temp: '37.0°C', hr: '82 bpm', rr: '20/min', bp: '138/88', spo2: '—', weight: '77 kg' },
      },
    ],
    aiSummary:
      'Joshua has Type 2 Diabetes that is currently poorly controlled, with RBG consistently above 10 mmol/L and evidence of early peripheral neuropathy in the left foot — a significant complication risk indicator. A new finding of hypertension (142/90) at the March visit is important and has been appropriately addressed with Amlodipine. Key risks: diabetic nephropathy (urine ACR not yet done), diabetic retinopathy (no ophthalmology review since diagnosis), and cardiovascular disease (combination of DM, HTN, aspirin appropriate). Previous TB must remain on radar — GeneXpert from January should be followed up urgently. Recommend: Prioritise referral to Goroka General for full NCD workup, intensify dietary education, and ensure foot inspection at every visit.',
    communityStats: {
      topConditions: ['Non-communicable diseases', 'Malaria', 'Respiratory infections'],
      malariaPrevalence: '19%',
      malnutritionRate: '2.1%',
      activeCases: 5,
    },
    rxCheck:
      '✓ Metformin 1000mg BD: Appropriate dose escalation for poorly controlled T2DM. First-line treatment per PNG NCD Treatment Guidelines. ✓ Glibenclamide 5mg OD: Appropriate add-on sulfonylurea. ⚠ Hypoglycaemia risk: Counsel patient on symptoms and management. ✓ Amlodipine 5mg: Appropriate first-line for DM + hypertension — preferred over ACE inhibitor until urine ACR result available. ✓ Aspirin 100mg OD: Indicated for primary cardiovascular prevention in diabetic patient with additional CV risk factors. ⚠ Urgent: GeneXpert result from January not documented — follow up immediately. Cough in ex-TB patient requires active exclusion of TB recurrence.',
  },
  {
    id: '5',
    name: 'Ruth Marifutu',
    initials: 'RM',
    age: '2',
    sex: 'Female',
    dob: '2024-01-10',
    village: 'Marifutu village',
    district: 'Goroka',
    province: 'Eastern Highlands',
    guardian: 'Sarah Marifutu (mother)',
    bloodType: 'Unknown',
    allergies: [],
    conditions: ['Severe Acute Malnutrition (SAM)', 'Acute gastroenteritis'],
    medications: [],
    lastTriage: 'PINK',
    visits: [
      {
        date: '2026-03-22',
        provider: 'CHW Joseph Numuru',
        facility: 'Marifutu Village Post',
        triage: 'PINK',
        chiefComplaint: 'Not eating, diarrhoea x 5 days, very weak',
        subjective:
          'Guardian reports child has not been eating for 5 days. Watery diarrhoea 6-8 times per day. No blood in stool. Vomiting x2 yesterday. Very weak, not playing. Exclusively breastfed until 6 months, then mixed feeding. No access to clean water source.',
        objective:
          'Temp 37.8°C, HR 134 bpm (weak), RR 40/min, Weight 7.2kg (expected for age ~12kg). MUAC 10.8cm (RED - SAM). Visible severe wasting. Bilateral pitting oedema ankles. Eyes: sunken. Skin turgor: very slow return. Crying without tears.',
        assessment:
          'SEVERE ACUTE MALNUTRITION with bilateral oedema (Kwashiorkor component). Severe dehydration. Acute gastroenteritis. URGENT REFERRAL REQUIRED.',
        plan: 'URGENT TRANSFER to Goroka General Hospital. ORS 200ml immediately while awaiting transport. Do NOT give IV fluids pre-hospital without medical supervision (risk cardiac overload in SAM). Vitamin A 200,000 IU given. Keep warm. Continue breastfeeding if able. Notify hospital by radio.',
        medications: ['ORS', 'Vitamin A 200,000 IU (given)', 'Amoxicillin 250mg TDS x5 days (SAM protocol)'],
        vitals: { temp: '37.8°C', hr: '134 bpm', rr: '40/min', bp: '—', spo2: '—', weight: '7.2 kg' },
      },
    ],
    aiSummary:
      'Ruth presents as a critical case requiring immediate hospitalisation. MUAC of 10.8cm and bilateral oedema confirm Severe Acute Malnutrition with Kwashiorkor features, combined with severe dehydration from acute gastroenteritis. This is a PINK — life-threatening emergency. Weight of 7.2kg at 26 months is severely below expected weight-for-age. Immediate priorities: urgent transfer to Goroka General Hospital, standard SAM treatment protocol (F-75 therapeutic milk, then F-100 or RUTF), treatment of dehydration using ReSoMal NOT standard ORS, and sepsis screening. Community follow-up required: household food security assessment, WASH assessment (no clean water access noted), screen siblings for acute malnutrition.',
    communityStats: {
      topConditions: ['Malnutrition', 'Malaria', 'Diarrhoeal disease'],
      malariaPrevalence: '26%',
      malnutritionRate: '8.2%',
      activeCases: 3,
    },
    rxCheck:
      '⚠ CRITICAL: This patient requires inpatient care — outpatient management is NOT appropriate for SAM with complications. ✓ ORS for immediate pre-transfer hydration: Correct — in SAM with dehydration, use ReSoMal (not standard ORS) if available. Standard ORS used here as emergency measure - acceptable pre-transfer. ✓ Vitamin A 200,000 IU: Correct dose for child over 12 months per SAM protocol. ✓ Amoxicillin 250mg TDS: Per WHO SAM protocol — all children with SAM receive routine antibiotics. Dose appropriate for weight (~7kg: 125-250mg TDS). ⚠ DO NOT give IV fluids without medical supervision — high risk of cardiac failure in SAM. ⚠ Ensure transfer documentation includes weight, MUAC, oedema grade, and medications given.',
  },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function TriageBadge({ triage, size = 'sm' }: { triage: Triage; size?: 'sm' | 'lg' }) {
  const base = size === 'lg' ? 'px-3 py-1 text-sm font-bold' : 'px-2 py-0.5 text-xs font-semibold';
  const colours: Record<Triage, string> = {
    PINK: 'bg-red-100 text-red-700 border border-red-300',
    YELLOW: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    GREEN: 'bg-green-100 text-green-700 border border-green-300',
  };
  const icons: Record<Triage, string> = { PINK: '!', YELLOW: '~', GREEN: '+' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${base} ${colours[triage]}`}>
      <span className="font-black">{icons[triage]}</span> {triage}
    </span>
  );
}

function AvatarCircle({
  initials,
  triage,
  size = 'md',
}: {
  initials: string;
  triage: Triage;
  size?: 'sm' | 'md' | 'lg';
}) {
  const colours: Record<Triage, string> = {
    PINK: 'bg-red-100 text-red-700 border-2 border-red-300',
    YELLOW: 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300',
    GREEN: 'bg-green-100 text-green-700 border-2 border-green-300',
  };
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' };
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${colours[triage]} ${sizes[size]}`}
    >
      {initials}
    </div>
  );
}

function VitalCard({ label, value }: { label: string; value: string }) {
  if (value === '—') return null;
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center min-w-[80px]">
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className="text-sm font-bold text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}

function SoapBlock({
  label,
  content,
  colour,
}: {
  label: string;
  content: string;
  colour: string;
}) {
  return (
    <div className={`rounded-lg border p-3 ${colour}`}>
      <div className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70">{label}</div>
      <p className="text-sm leading-relaxed">{content}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_FORM = { firstName: '', lastName: '', dob: '', sex: '', village: '', district: '', province: '', phone: '', guardian: '', bloodType: '', allergies: '', conditions: '', medications: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(PATIENTS);

  useEffect(() => {
    function migrateVisit(v: any): Visit {
      return {
        date: v.date ?? '—',
        provider: v.provider ?? '—',
        facility: v.facility ?? '—',
        triage: v.triage ?? 'GREEN',
        chiefComplaint: v.chiefComplaint ?? v.chief_complaint ?? '',
        subjective: v.subjective ?? v.soap?.s ?? '',
        objective: v.objective ?? v.soap?.o ?? '',
        assessment: v.assessment ?? v.soap?.a ?? '',
        plan: v.plan ?? v.soap?.p ?? '',
        medications: v.medications ?? [],
        vitals: v.vitals ?? { temp: '—', hr: '—', rr: '—', bp: '—', spo2: '—', weight: '—' },
      };
    }
    const rawPats: any[] = JSON.parse(localStorage.getItem('eden_new_patients') || '[]');
    const newPats: Patient[] = rawPats.map(p => ({ ...p, visits: (p.visits ?? []).map(migrateVisit) }));
    const newVisits: Record<string, any[]> = JSON.parse(localStorage.getItem('eden_new_visits') || '{}');
    const merged = PATIENTS.map(p => ({
      ...p,
      visits: [...(newVisits[p.id] ?? []).map(migrateVisit), ...p.visits],
    }));
    setPatients([...newPats, ...merged]);
  }, []);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visits' | 'ai'>('overview');
  const [expandedVisit, setExpandedVisit] = useState<number | null>(0);
  const [rxLoading, setRxLoading] = useState(false);
  const [rxChecked, setRxChecked] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.village.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase()),
  );

  const patient = patients.find((p) => p.id === selectedId) ?? null;

  function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    const name = `${form.firstName} ${form.lastName}`.trim();
    const initials = `${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase();
    const dobDate = form.dob ? new Date(form.dob) : null;
    const ageYrs = dobDate ? Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 3600 * 1000)) : 0;
    const newPatient: Patient = {
      id: Date.now().toString(),
      name, initials,
      age: ageYrs > 0 ? String(ageYrs) : '—',
      sex: form.sex || '—',
      dob: form.dob || '—',
      village: form.village || '—',
      district: form.district || '—',
      province: form.province || '—',
      phone: form.phone || undefined,
      guardian: form.guardian || undefined,
      bloodType: form.bloodType || '—',
      allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      conditions: form.conditions ? form.conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      medications: form.medications ? form.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
      visits: [],
      aiSummary: 'No visits recorded yet. AI summary will be generated after the first consultation.',
      communityStats: { topConditions: [], malariaPrevalence: '—', malnutritionRate: '—', activeCases: 0 },
      rxCheck: 'No medications to review yet.',
      lastTriage: 'GREEN',
    };
    const existing = JSON.parse(localStorage.getItem('eden_new_patients') || '[]');
    localStorage.setItem('eden_new_patients', JSON.stringify([newPatient, ...existing]));
    setPatients(prev => [newPatient, ...prev]);
    setSelectedId(newPatient.id);
    setActiveTab('overview');
    setForm(EMPTY_FORM);
    setShowNewPatient(false);
  }

  function handleSelectPatient(id: string) {
    setSelectedId(id);
    setActiveTab('overview');
    setExpandedVisit(0);
    setRxChecked(false);
    setRxLoading(false);
  }

  function handleRxCheck() {
    setRxLoading(true);
    setTimeout(() => {
      setRxLoading(false);
      setRxChecked(true);
    }, 1500);
  }

  const lastVisit = patient?.visits[0] ?? null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50">
      {/* ── New Patient Form Panel ────────────────────────────────────────────── */}
      {showNewPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">New Patient</h2>
              <button onClick={() => setShowNewPatient(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Date of Birth</label>
                  <input type="date" value={form.dob} onChange={e => setForm(f => ({...f, dob: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Sex</label>
                  <select value={form.sex} onChange={e => setForm(f => ({...f, sex: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none text-slate-700">
                    <option value="">— Select —</option>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Village</label>
                  <input value={form.village} onChange={e => setForm(f => ({...f, village: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">District</label>
                  <input value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Province</label>
                  <select value={form.province} onChange={e => setForm(f => ({...f, province: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none text-slate-700">
                    <option value="">— Select —</option>
                    <option>Eastern Highlands</option><option>Simbu</option><option>Western Highlands</option><option>Jiwaka</option><option>Enga</option><option>Morobe</option><option>Madang</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Blood Type</label>
                  <select value={form.bloodType} onChange={e => setForm(f => ({...f, bloodType: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none text-slate-700">
                    <option value="">Unknown</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+675 ..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Guardian / Parent</label>
                  <input value={form.guardian} onChange={e => setForm(f => ({...f, guardian: e.target.value}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Allergies <span className="normal-case font-normal">(comma separated)</span></label>
                  <input value={form.allergies} onChange={e => setForm(f => ({...f, allergies: e.target.value}))} placeholder="e.g. Penicillin, Sulfonamides" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Known Conditions <span className="normal-case font-normal">(comma separated)</span></label>
                  <input value={form.conditions} onChange={e => setForm(f => ({...f, conditions: e.target.value}))} placeholder="e.g. Hypertension, Diabetes" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Current Medications <span className="normal-case font-normal">(comma separated)</span></label>
                  <input value={form.medications} onChange={e => setForm(f => ({...f, medications: e.target.value}))} placeholder="e.g. Amlodipine 5mg OD, Metformin 500mg BD" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition">Create Patient Record</button>
                <button type="button" onClick={() => setShowNewPatient(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Left panel: Patient list ──────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        {/* Header + New Patient button */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Patients <span className="text-slate-400 font-normal">({patients.length})</span></span>
          <button onClick={() => setShowNewPatient(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            New Patient
          </button>
        </div>
        {/* Search */}
        <div className="p-3 border-b border-slate-200">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
            />
          </div>
        </div>

        {/* Patient cards */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">No patients found</p>
          )}
          {filtered.map((p) => {
            const isActive = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPatient(p.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-white border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AvatarCircle initials={p.initials} triage={p.lastTriage} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                      <TriageBadge triage={p.lastTriage} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {p.age}
                      {p.sex === 'Female' ? 'F' : 'M'} · {p.village}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Last visit: {p.visits[0]?.date ?? '—'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center">{PATIENTS.length} patients · Demo data</p>
        </div>
      </aside>

      {/* ── Right panel ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {!patient ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <svg
              className="w-16 h-16 mb-4 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-lg font-medium">Select a patient</p>
            <p className="text-sm mt-1">Choose a patient from the list to view their record</p>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-w-4xl">
            {/* ── Header card ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <AvatarCircle initials={patient.initials} triage={patient.lastTriage} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                    <TriageBadge triage={patient.lastTriage} size="lg" />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                    <span>
                      {patient.age} years · {patient.sex}
                    </span>
                    <span>DOB: {patient.dob}</span>
                    <span>
                      {patient.village}, {patient.district}
                    </span>
                    <span>
                      Blood type:{' '}
                      <strong className="text-slate-700">{patient.bloodType}</strong>
                    </span>
                    {patient.phone && <span>{patient.phone}</span>}
                    {patient.guardian && (
                      <span className="text-indigo-600 font-medium">
                        Guardian: {patient.guardian}
                      </span>
                    )}
                  </div>

                  {/* Conditions + Allergies */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {patient.conditions.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {c}
                      </span>
                    ))}
                    {patient.allergies.map((a) => (
                      <span
                        key={a}
                        className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-300"
                      >
                        Allergy: {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick vitals strip */}
              {lastVisit && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 self-center mr-1">
                    Latest vitals ({lastVisit.date}):
                  </span>
                  <VitalCard label="Temp" value={lastVisit.vitals.temp} />
                  <VitalCard label="HR" value={lastVisit.vitals.hr} />
                  <VitalCard label="RR" value={lastVisit.vitals.rr} />
                  <VitalCard label="BP" value={lastVisit.vitals.bp} />
                  <VitalCard label="SpO2" value={lastVisit.vitals.spo2} />
                  <VitalCard label="Weight" value={lastVisit.vitals.weight} />
                </div>
              )}
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────────── */}
            <div className="flex gap-0 border-b border-slate-200">
              {(['overview', 'visits', 'ai'] as const).map((tab) => {
                const labels: Record<typeof tab, string> = {
                  overview: 'Overview',
                  visits: 'Visits',
                  ai: 'AI Insights',
                };
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                      active
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* ── Overview tab ──────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                {/* Medical History */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Medical History
                  </h2>
                  {patient.conditions.length === 0 ? (
                    <p className="text-xs text-slate-400">No recorded conditions</p>
                  ) : (
                    <ul className="space-y-2">
                      {patient.conditions.map((c) => (
                        <li key={c} className="flex items-start gap-2">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{c}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {patient.allergies.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg
                          className="w-4 h-4 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.07 16.5c-.77.834.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <span className="text-xs font-bold text-amber-700">ALLERGIES</span>
                      </div>
                      {patient.allergies.map((a) => (
                        <span key={a} className="text-sm font-semibold text-amber-800">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Medications */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    Current Medications
                  </h2>
                  {patient.medications.length === 0 ? (
                    <p className="text-xs text-slate-400">No current medications recorded</p>
                  ) : (
                    <ul className="space-y-2">
                      {patient.medications.map((m) => (
                        <li
                          key={m}
                          className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg"
                        >
                          <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                          <span className="text-sm text-indigo-800 font-medium">{m}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ── Visits tab ────────────────────────────────────────────────── */}
            {activeTab === 'visits' && (
              <div className="space-y-3">
                {patient.visits.map((v, i) => {
                  const isOpen = expandedVisit === i;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                      {/* Visit header */}
                      <button
                        onClick={() => setExpandedVisit(isOpen ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-800">{v.date}</span>
                              <TriageBadge triage={v.triage} />
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {v.provider} · {v.facility}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 max-w-xs text-right truncate hidden sm:block">
                            {v.chiefComplaint}
                          </span>
                          <svg
                            className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Visit detail */}
                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-slate-100 space-y-3">
                          <div className="pt-4">
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                              Chief Complaint
                            </p>
                            <p className="text-sm font-medium text-slate-800">{v.chiefComplaint}</p>
                          </div>

                          {/* SOAP */}
                          <div className="space-y-2">
                            <SoapBlock
                              label="S — Subjective"
                              content={v.subjective}
                              colour="bg-blue-50 border-blue-100 text-blue-900"
                            />
                            <SoapBlock
                              label="O — Objective"
                              content={v.objective}
                              colour="bg-slate-50 border-slate-200 text-slate-800"
                            />
                            <SoapBlock
                              label="A — Assessment"
                              content={v.assessment}
                              colour="bg-amber-50 border-amber-100 text-amber-900"
                            />
                            <SoapBlock
                              label="P — Plan"
                              content={v.plan}
                              colour="bg-green-50 border-green-100 text-green-900"
                            />
                          </div>

                          {/* Medications */}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                              Medications Administered
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {v.medications.map((m) => (
                                <span
                                  key={m}
                                  className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Image placeholders */}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                              Images / Documents
                            </p>
                            <div className="flex gap-3">
                              {[1, 2].map((n) => (
                                <div
                                  key={n}
                                  className="w-24 h-20 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1"
                                >
                                  <svg
                                    className="w-6 h-6 text-slate-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="text-xs text-slate-400">No image</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── AI Insights tab ───────────────────────────────────────────── */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                {/* AI Visit Summary */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    <h2 className="text-white font-semibold text-sm">AI Visit Summary</h2>
                    <span className="ml-auto text-indigo-200 text-xs">claude-sonnet-4-6</span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-700 leading-relaxed">{patient.aiSummary}</p>
                  </div>
                </div>

                {/* Community Health Context */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Community Health Context — {patient.village}
                  </h2>

                  {/* Top conditions bar chart */}
                  <div className="space-y-2 mb-4">
                    {patient.communityStats.topConditions.map((c, i) => {
                      const widths = ['w-full', 'w-4/5', 'w-3/5'];
                      return (
                        <div key={c}>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>{c}</span>
                            <span className="text-slate-400">#{i + 1}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-2 rounded-full bg-indigo-400 ${widths[i]}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-red-600">
                        {patient.communityStats.malariaPrevalence}
                      </div>
                      <div className="text-xs text-red-500 mt-0.5">Malaria prevalence</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-amber-600">
                        {patient.communityStats.malnutritionRate}
                      </div>
                      <div className="text-xs text-amber-500 mt-0.5">Malnutrition rate</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-slate-700">
                        {patient.communityStats.activeCases}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Active cases</div>
                    </div>
                  </div>
                </div>

                {/* Prescription Protocol Checker */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Prescription Protocol Checker
                  </h2>
                  <p className="text-xs text-slate-400 mb-4">
                    Based on treatment from last visit ({lastVisit?.date})
                  </p>

                  {/* Current treatment */}
                  {lastVisit && (
                    <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                        Treatment prescribed
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lastVisit.medications.map((m) => (
                          <span
                            key={m}
                            className="px-2.5 py-1 text-xs bg-white border border-slate-300 text-slate-700 rounded-full font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!rxChecked && !rxLoading && (
                    <button
                      onClick={handleRxCheck}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
                    >
                      Check Against Protocol
                    </button>
                  )}

                  {rxLoading && (
                    <div className="flex items-center gap-3 py-3">
                      <span className="inline-block w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-sm text-indigo-600 font-medium">
                        Claude is reviewing protocol...
                      </span>
                    </div>
                  )}

                  {rxChecked && (
                    <div className="mt-2 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                          Protocol Review Complete
                        </span>
                      </div>
                      <div className="space-y-2">
                        {patient.rxCheck.split(/(?<=[.!]) (?=[✓⚠])/).map((line, i) => {
                          const isWarning = line.trim().startsWith('⚠');
                          return (
                            <p
                              key={i}
                              className={`text-sm leading-relaxed ${
                                isWarning ? 'text-amber-800' : 'text-slate-700'
                              }`}
                            >
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
