import { Navbar } from '@/components';
import { Toaster } from '@/components/ui/sonner';
import { appConfig } from '@/config/app';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: appConfig.name,
  description:
    'AI-powered security questionnaire application for automated policy analysis and compliance',
  keywords: ['security', 'compliance', 'questionnaire', 'AI', 'policies', 'automation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
          rel='stylesheet'
        />
      </head>
      <body>
        <div className='min-h-screen bg-zinc-50 flex flex-col'>
          <Navbar />
          <main className='flex-1 flex'>{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
