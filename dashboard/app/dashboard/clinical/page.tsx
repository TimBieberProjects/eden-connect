'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type SpeechRecognition = typeof window extends { SpeechRecognition: infer T } ? T : never;

const SOAP_TEMPLATE = `S (Subjective):
O (Objective): Temp: __°C, RR: __ /min, HR: __ bpm, Weight: __ kg
A (Assessment):
P (Plan): `;

// ─── Facility data ────────────────────────────────────────────────────────────

type FacilityKey = 'aid-centre' | 'aid-post' | 'mobile-kit';

interface Facility {
  key: FacilityKey;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  supplies: string[];
  unavailable?: string[];
  summaryLabel: string;
}

const FACILITIES: Facility[] = [
  {
    key: 'aid-centre',
    name: 'Aid Centre',
    subtitle: 'Most comprehensive facility',
    summaryLabel: 'Full formulary + diagnostics + oxygen + IV access',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    supplies: [
      'Oxygen concentrator',
      'IV fluids (NS, RL, D5W)',
      'IV cannulas',
      'Blood glucose meter',
      'Sutures & wound closure',
      'Urinary catheter',
      'NG tube',
      'AL, Amoxicillin, Benzylpenicillin IV, Metronidazole IV, Gentamicin IV',
      'Oxytocin, Magnesium sulfate, Adrenaline, Dexamethasone',
      'Salbutamol inhaler, ORS, Zinc, Mebendazole, Albendazole',
      'Ferrous sulfate, Metformin, Glibenclamide, Amlodipine, Chlorpromazine',
      'RDT malaria, urine dipstick, haemoglobin meter',
      'GeneXpert (TB), refrigeration for vaccines, sterilisation equipment',
    ],
  },
  {
    key: 'aid-post',
    name: 'Aid Post',
    subtitle: 'Basic facility — oral medications only',
    summaryLabel: 'Basic oral formulary + wound care + RDT. No oxygen, IV fluids, or GeneXpert.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    supplies: [
      'AL, Amoxicillin oral, Cotrimoxazole, Paracetamol',
      'ORS, Zinc, Vitamin A, Ferrous sulfate, Mebendazole, Metronidazole oral',
      'RDT malaria, urine dipstick',
      'Wound care kit (dressings, bandages, antiseptic)',
      'Blood pressure cuff, thermometer, weighing scale, MUAC tape',
    ],
    unavailable: ['Oxygen', 'IV fluids', 'GeneXpert'],
  },
  {
    key: 'mobile-kit',
    name: 'Mobile Aid Kit',
    subtitle: 'Field kit — most limited supplies',
    summaryLabel: 'Essential medications only + RDT. No IV, no oxygen, no diagnostics.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    supplies: [
      'Paracetamol, ORS sachets, Zinc tablets, Vitamin A capsules',
      'Artemether-Lumefantrine (limited stock)',
      'Amoxicillin (limited)',
      'Basic wound dressings',
      'RDT malaria, thermometer, MUAC tape',
    ],
    unavailable: ['IV medications', 'Oxygen', 'Wound suturing', 'Diagnostic equipment'],
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClinicalPage() {
  const [input, setInput] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [saved, setSaved] = useState(false);
  const [soapMode, setSoapMode] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new');
  const [saveFirstName, setSaveFirstName] = useState('');
  const [saveLastName, setSaveLastName] = useState('');
  const [saveSearch, setSaveSearch] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [allPatients, setAllPatients] = useState<{ id: string; name: string; age: string; village: string }[]>([]);
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(null);

  function buildVisit() {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today,
      provider: 'Clinical Copilot AI',
      facility: selectedFacility ? (FACILITIES.find(f => f.key === selectedFacility)?.name ?? 'Field Assessment') : 'Field Assessment',
      chiefComplaint: patientName ? `Assessment for ${patientName}` : input.split('\n')[0].substring(0, 80),
      subjective: input,
      objective: '',
      assessment: '',
      plan: response,
      vitals: { temp: '—', hr: '—', rr: '—', bp: '—', spo2: '—', weight: '—' },
      triage: (response.includes('PINK') ? 'PINK' : response.includes('YELLOW') ? 'YELLOW' : 'GREEN') as 'PINK' | 'YELLOW' | 'GREEN',
      medications: [],
    };
  }

  function handleSaveRecord() {
    const visit = buildVisit();
    if (saveMode === 'new') {
      const name = `${saveFirstName} ${saveLastName}`.trim() || patientName || 'Unknown Patient';
      const initials = `${saveFirstName[0] ?? 'U'}${saveLastName[0] ?? 'P'}`.toUpperCase();
      const newPatient = {
        id: `cp-${Date.now()}`,
        name, initials,
        age: patientAge || '—', sex: patientSex || '—', dob: '—',
        village: '—', district: '—', province: '—',
        bloodType: '—', allergies: [], conditions: [], medications: [],
        visits: [visit],
        aiSummary: 'Record created from Clinical Copilot assessment.',
        communityStats: { topConditions: [], malariaPrevalence: '—', malnutritionRate: '—', activeCases: 0 },
        rxCheck: 'Run prescription check from Patient Records.',
        lastTriage: visit.triage,
      };
      const existing = JSON.parse(localStorage.getItem('eden_new_patients') || '[]');
      localStorage.setItem('eden_new_patients', JSON.stringify([newPatient, ...existing]));
    } else {
      // Add visit to existing patient by ID
      const existingVisits = JSON.parse(localStorage.getItem('eden_new_visits') || '{}');
      const matchId = selectedExistingId;
      if (matchId) {
        if (!existingVisits[matchId]) existingVisits[matchId] = [];
        existingVisits[matchId].unshift(visit);
        localStorage.setItem('eden_new_visits', JSON.stringify(existingVisits));
      }
    }
    setSaveSuccess(true);
    setTimeout(() => { setShowSaveModal(false); setSaveSuccess(false); setSaveFirstName(''); setSaveLastName(''); setSaveSearch(''); }, 1800);
  }
  const [selectedFacility, setSelectedFacility] = useState<FacilityKey | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  useEffect(() => {
    if (showSaveModal) {
      const STATIC_PATIENTS = [
        { id: '1', name: 'Maria Yagusa', age: '34', village: 'Yagusa village' },
        { id: '2', name: 'James Kaiulo', age: '8', village: 'Kaiulo village' },
        { id: '3', name: 'Ruth Mondo', age: '27', village: 'Goroka Town' },
      ];
      const newPats: { id: string; name: string; age: string; village: string }[] =
        JSON.parse(localStorage.getItem('eden_new_patients') || '[]').map((p: any) => ({
          id: p.id, name: p.name, age: p.age || '—', village: p.village || '—',
        }));
      setAllPatients([...newPats, ...STATIC_PATIENTS]);
      setSelectedExistingId(null);
      setSaveSearch('');
    }
  }, [showSaveModal]);

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = input;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim = transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      setError(`Voice error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    setError('');
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setResponse('');
    setError('');
    setSaved(false);

    const patientContext = [
      patientName && `Name: ${patientName}`,
      patientAge && `Age: ${patientAge}`,
      patientSex && `Sex: ${patientSex}`,
    ]
      .filter(Boolean)
      .join(', ') || null;

    // Prepend facility context if selected
    const facility = FACILITIES.find((f) => f.key === selectedFacility);
    let finalInput = input;
    if (facility) {
      const suppliesSummary = facility.supplies.join('; ');
      const unavailableSummary = facility.unavailable
        ? ` NOT AVAILABLE: ${facility.unavailable.join(', ')}.`
        : '';
      finalInput = `[FACILITY: ${facility.name}] [AVAILABLE SUPPLIES: ${suppliesSummary}.${unavailableSummary}]\n\n${input}`;
    }

    try {
      const res = await fetch('/api/clinical-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: finalInput, patientContext }),
      });

      if (!res.ok) {
        setError(`Request failed: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function saveConsultation() {
    if (!response) return;
    const classification = response.includes('PINK')
      ? 'PINK'
      : response.includes('YELLOW')
      ? 'YELLOW'
      : response.includes('GREEN')
      ? 'GREEN'
      : null;

    const referral =
      response.toLowerCase().includes('refer urgently') ||
      response.toLowerCase().includes('refer non-urgent');

    const { error: saveError } = await supabase.from('consultations').insert({
      chief_complaint: input.slice(0, 200),
      raw_input: input,
      ai_diagnosis: response,
      ai_treatment: response,
      ai_classification: classification,
      referral_required: referral,
    });

    if (saveError) {
      setError(`Save failed: ${saveError.message}`);
    } else {
      setSaved(true);
    }
  }

  // Extract triage colour from response
  const triageColour = response.includes('### TRIAGE CLASSIFICATION')
    ? response.includes('PINK')
      ? 'PINK'
      : response.includes('YELLOW')
      ? 'YELLOW'
      : response.includes('GREEN')
      ? 'GREEN'
      : null
    : null;

  const triageBg =
    triageColour === 'PINK'
      ? 'bg-red-100 border-red-400 text-red-800'
      : triageColour === 'YELLOW'
      ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
      : triageColour === 'GREEN'
      ? 'bg-green-100 border-green-400 text-green-800'
      : '';

  const activeFacility = FACILITIES.find((f) => f.key === selectedFacility) ?? null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clinical Copilot</h1>
        <p className="text-gray-500 text-sm mt-1">
          Describe the patient's symptoms by typing or speaking — Claude provides a structured
          clinical assessment based on WHO IMCI protocols and PNG treatment guidelines.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Facility selector ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Facility &amp; Available Supplies</h2>
          <div className="grid grid-cols-3 gap-3">
            {FACILITIES.map((f) => {
              const isSelected = selectedFacility === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setSelectedFacility(isSelected ? null : f.key)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}
                  >
                    {f.icon}
                  </div>
                  <div
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-indigo-800' : 'text-slate-800'
                    }`}
                  >
                    {f.name}
                  </div>
                  <div
                    className={`text-xs mt-0.5 leading-snug ${
                      isSelected ? 'text-indigo-500' : 'text-slate-400'
                    }`}
                  >
                    {f.subtitle}
                  </div>
                  {isSelected && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-indigo-600 text-white rounded-full px-2 py-0.5 font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Selected
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Supplies summary for selected facility */}
          {activeFacility && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {activeFacility.name} — Supplies Summary
                </span>
                <span className="text-xs text-slate-400">{activeFacility.summaryLabel}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeFacility.supplies.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full"
                  >
                    {s}
                  </span>
                ))}
                {activeFacility.unavailable?.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full line-through"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Patient context ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Patient (optional)</h2>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="text"
              placeholder="Age (e.g. 3 years, 8 months)"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <select
              value={patientSex}
              onChange={(e) => setPatientSex(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-500"
            >
              <option value="">Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* ── Clinical Presentation ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Clinical Presentation</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSoapMode(!soapMode);
                  if (!soapMode && !input) setInput(SOAP_TEMPLATE);
                }}
                className={`text-xs px-3 py-1 rounded-full border transition ${
                  soapMode
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                SOAP format
              </button>
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition ${
                  listening
                    ? 'bg-red-100 border-red-300 text-red-700 animate-pulse'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                {listening ? 'Stop' : 'Speak'}
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe symptoms, duration, vitals, examination findings... e.g. '2 year old boy, 3 days fever, RDT positive, breathing 44/min, no chest indrawing, weight 12kg'"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition resize-none text-sm"
          />
          {listening && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening… speak clearly
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Save to Patient Record modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Save to Patient Record</h2>
                <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {saveSuccess ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="font-semibold text-slate-900">Saved successfully</p>
                    <p className="text-sm text-slate-500">Visit and SOAP notes added to Patient Records</p>
                  </div>
                ) : (
                  <>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-medium">
                      <button onClick={() => setSaveMode('new')} className={`flex-1 py-2 transition ${saveMode === 'new' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>New Patient</button>
                      <button onClick={() => setSaveMode('existing')} className={`flex-1 py-2 transition ${saveMode === 'existing' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Existing Patient</button>
                    </div>
                    {saveMode === 'new' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">First Name</label>
                          <input value={saveFirstName} onChange={e => setSaveFirstName(e.target.value)} placeholder={patientName.split(' ')[0] || 'First'} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Last Name</label>
                          <input value={saveLastName} onChange={e => setSaveLastName(e.target.value)} placeholder={patientName.split(' ')[1] || 'Last'} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Search Patient</label>
                        <input
                          value={saveSearch}
                          onChange={e => { setSaveSearch(e.target.value); setSelectedExistingId(null); }}
                          placeholder="Type name to search…"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                        {saveSearch && !selectedExistingId && (
                          <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                            {allPatients.filter(p => p.name.toLowerCase().includes(saveSearch.toLowerCase())).length === 0 ? (
                              <p className="px-3 py-2 text-sm text-slate-400">No patients found</p>
                            ) : (
                              allPatients.filter(p => p.name.toLowerCase().includes(saveSearch.toLowerCase())).map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => { setSelectedExistingId(p.id); setSaveSearch(p.name); }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 border-b border-slate-100 last:border-0"
                                >
                                  <span className="font-medium text-slate-800">{p.name}</span>
                                  <span className="text-slate-400 ml-2 text-xs">{p.age} · {p.village}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        {selectedExistingId && (
                          <p className="text-xs text-green-600 mt-1 font-medium">✓ Selected — visit will be added to {saveSearch}&apos;s record</p>
                        )}
                      </div>
                    )}
                    <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700 border border-indigo-100">
                      <span className="font-semibold">Will save:</span> Today's visit with chief complaint, full SOAP notes from the clinical input, and the AI treatment plan.
                    </div>
                    <button onClick={handleSaveRecord} disabled={(saveMode === 'new' && !saveFirstName && !patientName) || (saveMode === 'existing' && !selectedExistingId)} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                      Save to Patient Records
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
          >
            {loading ? 'Analysing…' : 'Get Clinical Assessment'}
          </button>
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            disabled={!response}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Save to Patient Record
          </button>
          {loading && (
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Claude is reviewing…
            </span>
          )}
        </div>
      </form>

      {/* ── Triage badge ─────────────────────────────────────────────────────── */}
      {triageColour && (
        <div
          className={`mt-6 px-4 py-3 rounded-lg border-2 font-bold text-center text-lg ${triageBg}`}
        >
          {triageColour === 'PINK' && 'PINK — URGENT REFERRAL REQUIRED'}
          {triageColour === 'YELLOW' && 'YELLOW — TREAT AND MONITOR'}
          {triageColour === 'GREEN' && 'GREEN — HOME CARE'}
        </div>
      )}

      {/* ── Response ─────────────────────────────────────────────────────────── */}
      {(response || loading) && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Clinical Assessment</h2>
            <div className="flex items-center gap-2">
              {loading && (
                <span className="text-xs text-green-600 animate-pulse">Streaming…</span>
              )}
              {saved && (
                <span className="text-xs text-green-600 font-medium">Saved</span>
              )}
            </div>
          </div>
          <div
            ref={responseRef}
            className="prose prose-sm max-w-none overflow-auto max-h-[600px] text-gray-800 whitespace-pre-wrap font-mono text-xs leading-relaxed"
          >
            {response}
            {loading && (
              <span className="inline-block w-1.5 h-4 bg-green-500 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t pt-3">
            Clinical decision support only. Always apply professional judgement. Not a substitute
            for clinical training.
          </p>
        </div>
      )}

      {/* ── Telehealth section ───────────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="opacity-50 cursor-not-allowed select-none">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-3">
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-lg font-bold text-slate-700">Telehealth</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 rounded-full">
              Coming Soon
            </span>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Connect to Goroka General Hospital
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get specialist support from Goroka General Hospital emergency and outpatient
                  departments. Available Mon–Fri 8am–5pm.
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <div className="w-3 h-3 rounded-full bg-slate-300" title="Offline" />
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Video call area */}
              <div className="relative bg-slate-800 rounded-xl overflow-hidden" style={{ height: 240 }}>
                {/* Main video area */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <svg
                    className="w-10 h-10 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                    <line x1="3" y1="3" x2="21" y2="21" strokeWidth={1.5} />
                  </svg>
                  <p className="text-slate-400 text-sm font-medium">Video call unavailable</p>
                  <p className="text-slate-500 text-xs">Telehealth not yet activated</p>
                </div>

                {/* Picture-in-picture */}
                <div className="absolute bottom-3 right-3 w-20 h-16 bg-slate-700 rounded-lg border border-slate-600 flex flex-col items-center justify-center gap-1">
                  <svg
                    className="w-5 h-5 text-slate-500"
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
                  <span className="text-xs text-slate-500">You</span>
                </div>
              </div>

              {/* Call controls */}
              <div className="flex items-center justify-center gap-4">
                {/* Mute */}
                <button
                  type="button"
                  disabled
                  className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                {/* Camera */}
                <button
                  type="button"
                  disabled
                  className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                {/* End call */}
                <button
                  type="button"
                  disabled
                  className="w-14 h-14 rounded-full bg-slate-300 flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-6 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                    />
                  </svg>
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 bg-slate-200 text-slate-400 font-semibold text-sm rounded-lg"
                >
                  Request Consultation
                </button>
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 border border-slate-200 text-slate-400 font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Upload case files for async review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
