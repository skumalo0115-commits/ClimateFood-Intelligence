import './globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import Footer from '@/components/Footer';
import NetworkBackground from '@/components/NetworkBackground';

const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ClimateFood Intelligence',
  description: 'Climate and food analytics dashboard',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans">
        <NetworkBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
