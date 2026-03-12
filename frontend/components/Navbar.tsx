import Link from 'next/link';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Climate', href: '/climate' },
  { label: 'Air Quality', href: '/air-quality' },
  { label: 'Crops', href: '/crops' },
  { label: 'Emissions', href: '/emissions' },
  { label: 'Predictions', href: '/predictions' },
  { label: 'Map', href: '/map' }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <nav className="section-container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/90 text-white">CF</span>
          ClimateFood Intelligence
        </Link>
        <ul className="hidden flex-wrap items-center gap-5 text-sm text-slate-600 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-slate-900">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard"
          className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100 md:inline-flex"
        >
          Open Dashboard
        </Link>
      </nav>
    </header>
  );
}
