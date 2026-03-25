'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Fallback values allow build-time pre-render without errors.
  // All queries fail gracefully until real env vars are available at runtime.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createBrowserClient(url, key);
}
