import DashboardSidebar from '@/components/DashboardSidebar';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur lg:hidden">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              ClimateFood Intelligence
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Back to home
            </Link>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
