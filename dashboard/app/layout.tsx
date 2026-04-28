import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EDEN Connect',
  description: 'Community Health Data Platform — Eastern Highlands PNG',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-eden-pale-blue text-navy antialiased">{children}</body>
    </html>
  );
}
