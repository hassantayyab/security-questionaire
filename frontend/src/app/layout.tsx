import { Toaster } from '@/components/ui/sonner';
import { appConfig } from '@/config/app';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
        <div className='min-h-screen bg-background'>
          <header className='border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='container mx-auto px-4 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <h1 className='text-2xl font-bold text-foreground'>{appConfig.name}</h1>
                  <span className='hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
                    AI-Powered
                  </span>
                </div>
                <div className='text-sm text-muted-foreground'>
                  Automated Policy Analysis & Compliance
                </div>
              </div>
            </div>
          </header>

          <main className='container mx-auto px-4 py-6'>{children}</main>

          <footer className='border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12'>
            <div className='container mx-auto px-4 py-6'>
              <div className='flex items-center text-sm text-muted-foreground'>
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
