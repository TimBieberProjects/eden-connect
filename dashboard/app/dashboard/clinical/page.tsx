'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type SpeechRecognition = typeof window extends { SpeechRecognition: infer T } ? T : never;

const SOAP_TEMPLATE = `S (Subjective):
O (Objective): Temp: __°C, RR: __ /min, HR: __ bpm, Weight: __ kg
A (Assessment):
P (Plan): `;

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
  const responseRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

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
    ].filter(Boolean).join(', ') || null;

    try {
      const res = await fetch('/api/clinical-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, patientContext }),
      });

      if (!res.ok) {
        setError(`Request failed: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setResponse(prev => prev + chunk);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function saveConsultation() {
    if (!response) return;
    const classification = response.includes('PINK') ? 'PINK'
      : response.includes('YELLOW') ? 'YELLOW'
      : response.includes('GREEN') ? 'GREEN'
      : null;

    const referral = response.toLowerCase().includes('refer urgently') ||
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
    ? response.includes('PINK') ? 'PINK'
    : response.includes('YELLOW') ? 'YELLOW'
    : response.includes('GREEN') ? 'GREEN'
    : null
    : null;

  const triageBg = triageColour === 'PINK' ? 'bg-red-100 border-red-400 text-red-800'
    : triageColour === 'YELLOW' ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
    : triageColour === 'GREEN' ? 'bg-green-100 border-green-400 text-green-800'
    : '';

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clinical Copilot</h1>
        <p className="text-gray-500 text-sm mt-1">
          Describe the patient's symptoms by typing or speaking — Claude provides a structured clinical assessment based on WHO IMCI protocols and PNG treatment guidelines.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient context */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Patient (optional)</h2>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="text"
              placeholder="Age (e.g. 3 years, 8 months)"
              value={patientAge}
              onChange={e => setPatientAge(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <select
              value={patientSex}
              onChange={e => setPatientSex(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-500"
            >
              <option value="">Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Input area */}
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
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                {listening ? 'Stop' : 'Speak'}
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
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

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
          >
            {loading ? 'Analysing…' : 'Get Clinical Assessment'}
          </button>
          {loading && (
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Claude is reviewing…
            </span>
          )}
        </div>
      </form>

      {/* Triage badge */}
      {triageColour && (
        <div className={`mt-6 px-4 py-3 rounded-lg border-2 font-bold text-center text-lg ${triageBg}`}>
          {triageColour === 'PINK' && '🚨 PINK — URGENT REFERRAL REQUIRED'}
          {triageColour === 'YELLOW' && '⚠️ YELLOW — TREAT AND MONITOR'}
          {triageColour === 'GREEN' && '✅ GREEN — HOME CARE'}
        </div>
      )}

      {/* Response */}
      {(response || loading) && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Clinical Assessment</h2>
            <div className="flex items-center gap-2">
              {loading && <span className="text-xs text-green-600 animate-pulse">Streaming…</span>}
              {!loading && response && !saved && (
                <button
                  onClick={saveConsultation}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
                >
                  Save to records
                </button>
              )}
              {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
            </div>
          </div>
          <div
            ref={responseRef}
            className="prose prose-sm max-w-none overflow-auto max-h-[600px] text-gray-800 whitespace-pre-wrap font-mono text-xs leading-relaxed"
          >
            {response}
            {loading && <span className="inline-block w-1.5 h-4 bg-green-500 animate-pulse ml-0.5 align-text-bottom" />}
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t pt-3">
            Clinical decision support only. Always apply professional judgement. Not a substitute for clinical training.
          </p>
        </div>
      )}
    </div>
  );
}
