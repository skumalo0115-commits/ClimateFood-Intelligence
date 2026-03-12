import DashboardSidebar from '@/components/DashboardSidebar';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:hidden">
            <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              ClimateFood Intelligence
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
