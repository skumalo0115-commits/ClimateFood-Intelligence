import './globals.css';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import NetworkBackground from '@/components/NetworkBackground';

export const metadata: Metadata = {
  title: 'ClimateFood Intelligence',
  description: 'Climate and food analytics dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
