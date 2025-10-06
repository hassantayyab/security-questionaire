import { Navbar } from '@/components';
import { Toaster } from '@/components/ui/sonner';
import { appConfig } from '@/config/app';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: appConfig.name,
  description:
    'AI-powered security questionnaire application for automated policy analysis and compliance',
  keywords: ['security', 'compliance', 'questionnaire', 'AI', 'policies', 'automation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div className='min-h-screen bg-zinc-50 flex flex-col'>
          <Navbar />
          <main className='flex-1'>{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
