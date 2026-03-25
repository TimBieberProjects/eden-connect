'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/dashboard',           label: 'Overview',          icon: '📊' },
  { href: '/dashboard/baseline',  label: 'Baseline Surveys',  icon: '🏘' },
  { href: '/dashboard/quarterly', label: 'Quarterly Reports', icon: '📋' },
  { href: '/dashboard/ai-query',  label: 'AI Health Query',   icon: '🤖' },
  { href: '/dashboard/clinical',  label: 'Clinical Copilot',  icon: '🩺' },
  { href: '/dashboard/patients',  label: 'Patient Records',   icon: '👤' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-green-900 font-bold text-sm">E</div>
            <div>
              <div className="font-bold text-sm">EDEN Connect</div>
              <div className="text-xs text-green-400">Eastern Highlands PNG</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-green-700 text-white'
                    : 'text-green-200 hover:bg-green-800 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-green-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-green-300 hover:bg-green-800 hover:text-white transition"
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
          <p className="text-xs text-green-600 px-3 mt-3">Evolved AI · MAI Canada</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
