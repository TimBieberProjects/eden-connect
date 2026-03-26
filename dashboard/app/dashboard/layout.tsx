'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const LockIcon = () => (
  <svg className="w-3 h-3 text-slate-300 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const SURVEYS_ITEMS = [
  {
    href: '/dashboard/overview',
    label: 'Health Overview',
    locked: true,
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/baseline',
    label: 'Baseline Surveys',
    locked: true,
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/quarterly',
    label: 'Quarterly Reports',
    locked: true,
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/ai-query',
    label: 'AI Health Query',
    locked: true,
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const surveysHrefs = SURVEYS_ITEMS.map(i => i.href);
  const surveysActive = surveysHrefs.some(h => pathname === h || pathname.startsWith(h));
  const [surveysOpen, setSurveysOpen] = useState(surveysActive);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const pageLabel =
    pathname === '/dashboard/map' ? 'Community Map' :
    pathname.startsWith('/dashboard/overview') ? 'Health Overview' :
    pathname.startsWith('/dashboard/baseline') ? 'Baseline Surveys' :
    pathname.startsWith('/dashboard/quarterly') ? 'Quarterly Reports' :
    pathname.startsWith('/dashboard/ai-query') ? 'AI Health Query' :
    pathname.startsWith('/dashboard/clinical') ? 'Clinical Copilot' :
    pathname.startsWith('/dashboard/patients') ? 'Patient Records' :
    'Dashboard';

  const navItem = (href: string, label: string, icon: React.ReactNode, locked = false) => {
    const active = pathname === href || (href !== '/dashboard/map' && pathname.startsWith(href));
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          active
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
        <span className="flex-1">{label}</span>
        {locked && !active && <LockIcon />}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 fixed h-full z-20">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">EDEN Connect</div>
              <div className="text-xs text-slate-400">Eastern Highlands PNG</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Platform</p>

          {/* Community Map */}
          {navItem('/dashboard/map', 'Community Map', (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          ))}

          {/* Surveys & Reports — collapsible */}
          <button
            onClick={() => setSurveysOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              surveysActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={surveysActive ? 'text-indigo-600' : 'text-slate-400'}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span className="flex-1 text-left">Surveys & Reports</span>
            <svg
              className={`w-3.5 h-3.5 flex-shrink-0 text-slate-300 transition-transform ${surveysOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {surveysOpen && (
            <div className="ml-3 pl-3 border-l border-slate-100 space-y-0.5">
              {SURVEYS_ITEMS.map(({ href, label, icon, locked }) => {
                const active = pathname === href || pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
                    <span className="flex-1">{label}</span>
                    {locked && !active && <LockIcon />}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Clinical Copilot */}
          {navItem('/dashboard/clinical', 'Clinical Copilot', (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ), true)}

          {/* Patient Records */}
          {navItem('/dashboard/patients', 'Patient Records', (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ), true)}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign out</span>
          </button>
          <p className="text-xs text-slate-300 px-3 mt-3">Evolved AI · MAI Canada</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-60">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center px-8 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-900 font-semibold">{pageLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Live
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
