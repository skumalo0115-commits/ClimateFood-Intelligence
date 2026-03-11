import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClimateFood Intelligence',
  description: 'Climate and food analytics dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
