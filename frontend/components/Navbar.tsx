import Link from 'next/link';

const links = [
  { label: 'Home', href: '/' },
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
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-2xl font-semibold text-slate-900 md:text-3xl">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/90 text-sm font-bold text-white">CFI</span>
          ClimateFood Intelligence
        </Link>
        <ul className="hidden flex-wrap items-center gap-6 text-base font-medium text-slate-700 lg:flex">
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
          className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-base font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100 md:inline-flex"
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
