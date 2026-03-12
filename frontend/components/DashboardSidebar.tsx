import Link from 'next/link';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Overview', href: '/dashboard' },
  { label: 'Climate', href: '/climate' },
  { label: 'Air Quality', href: '/air-quality' },
  { label: 'Crops', href: '/crops' },
  { label: 'Emissions', href: '/emissions' },
  { label: 'Predictions', href: '/predictions' },
  { label: 'Map', href: '/map' }
];

export default function DashboardSidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-slate-200 bg-white/80 px-6 py-8 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:flex">
      <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        ClimateFood Intelligence
      </Link>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Dashboard</p>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-pill rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
        Live sensors synced and ready for analysis.
      </div>
    </aside>
  );
}
