import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'EDEN Connect',
  description: 'Community Health Data Platform — Eastern Highlands PNG',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`${dmSans.className} bg-eden-pale-blue text-navy antialiased`}>{children}</body>
    </html>
  );
}
