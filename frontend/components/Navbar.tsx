import Link from 'next/link';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Climate', href: '/climate' },
  { label: 'Air Quality', href: '/air-quality' },
  { label: 'Crops', href: '/crops' },
  { label: 'Emissions', href: '/emissions' },
  { label: 'Predictions', href: '/predictions' },
  { label: 'Map', href: '/map' },
  { label: 'Admin', href: '/admin' },
  { label: 'Dashboard', href: '/dashboard', isCta: true }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-3 px-3 py-5 lg:px-5 xl:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 justify-self-start whitespace-nowrap text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/90 text-sm font-bold text-white shadow-sm">CFI</span>
          ClimateFood Intelligence
        </Link>

        <ul className="hidden items-center justify-center gap-1 justify-self-center xl:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-pill whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-semibold transition dark:text-slate-200 ${
                  link.isCta
                    ? 'ml-2 border border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'text-slate-700'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="justify-self-end" />
      </nav>
    </header>
  );
}
