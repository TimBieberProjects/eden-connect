'use client';

export default function TelehealthPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Telehealth</h1>
          <p className="text-sm text-slate-500">Connect with a clinician at Goroka General Hospital</p>
        </div>
        <span className="ml-auto px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 border border-green-200 rounded-full">Live</span>
      </div>

      {/* On-call card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Goroka General Hospital — On-Call Desk</h2>
            <p className="text-xs text-slate-500 mt-0.5">Eastern Highlands Province · Available Mon–Fri 8am–5pm AEST</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Available</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* How it works */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Run clinical assessment', desc: 'Use Clinical Copilot to assess the patient first' },
              { step: '2', label: 'Start the call', desc: 'Click below — opens Google Meet instantly' },
              { step: '3', label: 'Share with clinician', desc: 'Copy the Meet link and send to the on-call doctor' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="text-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mx-auto mb-2">{step}</div>
                <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>

          {/* Start call button */}
          <a
            href="https://meet.google.com/rpu-xsdi-wot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-base"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Start Telehealth Call
          </a>
          <p className="text-xs text-slate-400 text-center">Connects directly to the Goroka General Hospital on-call desk</p>

          {/* Phone fallback */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Phone fallback</p>
            <p className="text-sm text-slate-700">Dial <span className="font-medium">+1 647-733-9700</span> · PIN: <span className="font-medium">479 099 085#</span></p>
            <p className="text-xs text-slate-400 mt-1">Use if video is unavailable due to poor connectivity</p>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <p className="text-xs text-slate-400 text-center">
        No aid worker in a remote village should ever face a difficult case alone. This line connects you directly to specialist support at Goroka General Hospital.
      </p>
    </div>
  );
}
