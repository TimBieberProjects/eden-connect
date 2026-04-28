'use client';

// N243 — Visual mirror of production EDEN Connect /admin shell. Sidebar
// structure, header, and design tokens replicate prod so a Phase 2 demo
// can switch URLs between this POC and edenconnect.health/admin without
// a visible seam. The upper nav items above the "Phase 2" divider are
// set-dressing: a few link to existing POC routes (Map, Surveys subs);
// the rest are href="#" stubs (Dashboard root, Insights, Directory subs,
// Settings) because POC has no equivalent and the brief is explicit
// that these don't need to function on click during the demo.
//
// Phase 2 section at the bottom routes to POC's existing functional
// pages: Patient Records (/dashboard/patients), Telehealth, Clinical
// Copilot. Names kept POC-native because the brief said "prefer the
// POC's own naming if reasonable."

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// ────────────────────────────────────────────────────────────────────
// Inline icon set (mirrors prod's I/Dashboard/Surveys/Insights/etc.).
// ────────────────────────────────────────────────────────────────────
function I({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
const DashboardIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </I>
);
const SurveysIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </I>
);
const InsightsIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </I>
);
const DirectoryIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </I>
);
const MapIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </I>
);
const GearIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </I>
);
// Phase 2 icons.
const PatientsIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </I>
);
const TelehealthIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="M16 10l5-3v10l-5-3z" />
  </I>
);
const StethoscopeIcon = ({ className }: { className?: string }) => (
  <I className={className}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <circle cx="18" cy="14" r="2" />
    <path d="M10 13v3a5 5 0 0 0 5 5h1a2 2 0 0 0 2-2v-2" />
  </I>
);

const SURVEY_SUBS = [
  { label: 'Baseline Surveys', href: '/dashboard/baseline-survey' },
  { label: 'Quarterly Reports', href: '/dashboard/quarterly-survey' },
  { label: 'Human Flourishing', href: '#' },
];

const DIRECTORY_SUBS = [
  { label: 'Health Promoters', href: '#' },
  { label: 'Health Facilities', href: '#' },
  { label: 'Villages', href: '#' },
];

// Demo identity for the user-info footer + header dropdown.
// Hardcoded because the upper sidebar is set-dressing — Supabase auth
// doesn't carry name/role/email in the same shape as production.
const DEMO_USER = {
  name: 'Tim Bieber',
  email: 'tim@evolvedgrowth.ai',
  role: 'Tech Admin',
};

function preventNoop(e: React.MouseEvent) {
  e.preventDefault();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [surveysOpen, setSurveysOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!dropRef.current) return;
      if (!dropRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [userMenuOpen]);

  const surveysActive =
    pathname.startsWith('/dashboard/baseline-survey') ||
    pathname.startsWith('/dashboard/quarterly-survey');
  useEffect(() => { if (surveysActive) setSurveysOpen(true); }, [surveysActive]);

  function isActive(href: string): boolean {
    if (href === '#' || !href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  }

  async function handleSignOut() {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const pageLabel =
    pathname === '/dashboard' ? 'Dashboard' :
    pathname.startsWith('/dashboard/map') ? 'Map' :
    pathname.startsWith('/dashboard/baseline-survey') ? 'Baseline Surveys' :
    pathname.startsWith('/dashboard/quarterly-survey') ? 'Quarterly Reports' :
    pathname.startsWith('/dashboard/overview') ? 'Health Overview' :
    pathname.startsWith('/dashboard/baseline') ? 'Baseline Reports' :
    pathname.startsWith('/dashboard/quarterly') ? 'Quarterly Reports' :
    pathname.startsWith('/dashboard/ai-query') ? 'AI Reports' :
    pathname.startsWith('/dashboard/telehealth') ? 'Telehealth' :
    pathname.startsWith('/dashboard/clinical') ? 'Clinical Copilot' :
    pathname.startsWith('/dashboard/patients') ? 'Patient Records' :
    'Dashboard';

  const iconCls = 'w-[18px] h-[18px] flex-shrink-0';
  const linkCls = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
      active
        ? 'bg-eden-teal/10 text-eden-teal font-medium'
        : 'text-eden-slate hover:text-eden-white hover:bg-eden-white/5'
    }`;
  const subCls = (active: boolean) =>
    `block px-3 py-2 rounded-lg text-xs transition-colors ${
      active
        ? 'bg-eden-teal/10 text-eden-teal font-medium'
        : 'text-eden-slate hover:text-eden-white hover:bg-eden-white/5'
    }`;

  return (
    <div className="min-h-screen bg-eden-pale-blue flex flex-col sm:flex-row">
      {/* ── Mobile top bar ── */}
      <header className="sm:hidden bg-navy text-eden-white px-4 py-3 flex items-center justify-between z-30 border-b border-eden-white/10 w-full">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center text-eden-white text-2xl"
        >
          ☰
        </button>
        <Link href="/dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="EDEN Connect" className="h-8 w-auto" />
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-eden-teal hover:text-eden-teal/80"
          title="View site"
        >
          Site ↗
        </a>
      </header>

      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`bg-navy flex flex-col z-50 sm:w-56 lg:w-64 sm:min-h-screen sm:relative sm:translate-x-0 fixed inset-y-0 left-0 w-72 transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b border-eden-white/10">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="EDEN Connect" width={240} height={60} className="h-12 w-auto" />
          </Link>
          <div className="flex items-center justify-between mt-1">
            <p className="text-eden-slate text-xs">Admin Dashboard</p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-eden-teal hover:text-eden-teal/80 transition-colors flex items-center gap-1"
              title="View public map (opens in new tab)"
            >
              View site ↗
            </a>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {/* Dashboard (set-dressing — no functional /admin equivalent in POC) */}
          <a href="#" onClick={preventNoop} className={linkCls(false)}>
            <DashboardIcon className={iconCls} /> Dashboard
          </a>

          {/* Surveys (expandable, partial routing) */}
          <button
            onClick={() => setSurveysOpen((o) => !o)}
            className={`w-full ${linkCls(surveysActive && !surveysOpen)} justify-between`}
          >
            <span className="flex items-center gap-3">
              <SurveysIcon className={iconCls} /> Surveys
            </span>
            <span className={`text-xs transition-transform ${surveysOpen ? 'rotate-90' : ''}`}>›</span>
          </button>
          {surveysOpen && (
            <div className="ml-7 pl-3 border-l border-eden-white/10 space-y-0.5">
              {SURVEY_SUBS.map((s) => (
                s.href === '#' ? (
                  <a key={s.label} href="#" onClick={preventNoop} className={subCls(false)}>
                    {s.label}
                  </a>
                ) : (
                  <Link key={s.href} href={s.href} className={subCls(isActive(s.href))}>
                    {s.label}
                  </Link>
                )
              ))}
            </div>
          )}

          {/* Insights (set-dressing) */}
          <a href="#" onClick={preventNoop} className={linkCls(false)}>
            <InsightsIcon className={iconCls} /> Insights
          </a>

          {/* Map (functional — POC has /dashboard/map) */}
          <Link href="/dashboard/map" className={linkCls(isActive('/dashboard/map'))}>
            <MapIcon className={iconCls} /> Map
          </Link>

          {/* Directory (set-dressing — no POC equivalents). Static amber "3"
              badge mirrors prod's unreviewed-villages indicator visually. */}
          <button
            onClick={() => setDirectoryOpen((o) => !o)}
            className={`w-full ${linkCls(false)} justify-between`}
          >
            <span className="flex items-center gap-3">
              <DirectoryIcon className={iconCls} /> Directory
            </span>
            <span className="flex items-center gap-2">
              <span className="bg-eden-amber text-navy text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                3
              </span>
              <span className={`text-xs transition-transform ${directoryOpen ? 'rotate-90' : ''}`}>›</span>
            </span>
          </button>
          {directoryOpen && (
            <div className="ml-7 pl-3 border-l border-eden-white/10 space-y-0.5">
              {DIRECTORY_SUBS.map((d) => (
                <a
                  key={d.label}
                  href="#"
                  onClick={preventNoop}
                  className={`${subCls(false)} ${d.label === 'Villages' ? 'flex items-center justify-between gap-2' : ''}`}
                >
                  <span>{d.label}</span>
                  {d.label === 'Villages' && (
                    <span className="bg-eden-amber text-navy text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      3
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}

          {/* ── System divider ── */}
          <div className="my-3 border-t border-eden-white/10" />

          <a href="#" onClick={preventNoop} className={linkCls(false)}>
            <GearIcon className={iconCls} /> Settings
          </a>

          {/* ── Phase 2 section ── */}
          <div className="mt-6">
            <div className="border-t border-eden-white/10 pt-4 px-3 mb-2">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-eden-teal">
                Phase 2
              </p>
            </div>
            <Link
              href="/dashboard/patients"
              className={linkCls(isActive('/dashboard/patients'))}
            >
              <PatientsIcon className={iconCls} /> Patient Records
            </Link>
            <Link
              href="/dashboard/telehealth"
              className={linkCls(isActive('/dashboard/telehealth'))}
            >
              <TelehealthIcon className={iconCls} /> Telehealth
            </Link>
            <Link
              href="/dashboard/clinical"
              className={linkCls(isActive('/dashboard/clinical'))}
            >
              <StethoscopeIcon className={iconCls} /> Clinical Copilot
            </Link>
          </div>
        </nav>

        {/* User-info footer (mirrors prod sidebar foot exactly) */}
        <div className="px-4 py-4 border-t border-eden-white/10">
          <a
            href="#"
            onClick={preventNoop}
            className="block mb-3 -mx-2 px-2 py-2 rounded-lg hover:bg-eden-white/5 transition-colors"
            title="View my profile"
          >
            <p className="text-eden-white text-sm font-medium truncate">{DEMO_USER.name}</p>
            <p className="text-eden-slate text-xs truncate">{DEMO_USER.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-eden-teal/10 text-eden-teal text-xs rounded">
              {DEMO_USER.role}
            </span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-eden-slate hover:text-eden-amber hover:bg-eden-amber/5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main pane ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* AdminHeader — title + user dropdown (mirrors prod). */}
        <header className="bg-white border-b border-eden-pale-blue px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-navy truncate">{pageLabel}</h1>
          <div className="relative" ref={dropRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-eden-pale-blue/50 transition-colors"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              title={DEMO_USER.name}
            >
              <span className="w-[34px] h-[34px] rounded-full bg-eden-teal/20 text-navy font-bold text-sm flex items-center justify-center">
                {DEMO_USER.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
              <span className="hidden sm:flex flex-col items-end min-w-0 max-w-[180px]">
                <span className="text-xs text-navy font-medium truncate">{DEMO_USER.name}</span>
                <span className="text-[10px] text-eden-slate">{DEMO_USER.role}</span>
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-3 h-3 text-eden-slate transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 bg-white border border-eden-pale-blue rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-eden-pale-blue">
                  <p className="text-sm font-bold text-navy truncate">{DEMO_USER.name}</p>
                  <p className="text-xs text-eden-slate truncate">{DEMO_USER.email}</p>
                </div>
                <a
                  href="#"
                  onClick={(e) => { preventNoop(e); setUserMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-navy hover:bg-eden-pale-blue/40"
                  role="menuitem"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My profile
                </a>
                <a
                  href="#"
                  onClick={(e) => { preventNoop(e); setUserMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-navy hover:bg-eden-pale-blue/40"
                  role="menuitem"
                >
                  <GearIcon className="w-4 h-4 flex-shrink-0" /> Settings
                </a>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-eden-amber hover:bg-eden-amber/5 border-t border-eden-pale-blue"
                  role="menuitem"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
