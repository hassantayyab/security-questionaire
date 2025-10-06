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
        <div className='min-h-screen bg-zinc-50'>
          <Navbar />
          <main className='min-h-screen'>{children}</main>

          <footer className='border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 mt-12'>
            <div className='container mx-auto px-4 py-6'>
              <div className='flex items-center text-sm text-gray-500'>
                <div>
                  © {new Date().getFullYear()} {appConfig.name}. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
