'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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

const mobileLinks = [
  { label: 'Home', href: '/' },
  { label: 'Climate', href: '/climate' },
  { label: 'Air Quality', href: '/air-quality' },
  { label: 'Crops', href: '/crops' },
  { label: 'Emissions', href: '/emissions' },
  { label: 'Predictions', href: '/predictions' },
  { label: 'Map', href: '/map' },
  { label: 'Admin', href: '/admin' },
  { label: 'Dashboard', href: '/dashboard' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur md:static md:top-auto dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="grid w-full grid-cols-[auto,1fr,auto] items-center gap-3 px-3 py-5 lg:px-5 xl:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 justify-self-start whitespace-nowrap text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100"
        >
          <img src="/icon.svg" alt="ClimateFood Intelligence" className="h-10 w-10 rounded-2xl shadow-sm" />
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

        {!isDashboard && (
          <div className="relative justify-self-end xl:hidden mr-3">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <span className="sr-only">Toggle navigation menu</span>
              <span className="flex flex-col gap-1.5">
                <span className="h-0.5 w-6 rounded-full bg-slate-700" />
                <span className="h-0.5 w-6 rounded-full bg-slate-700" />
                <span className="h-0.5 w-6 rounded-full bg-slate-700" />
              </span>
            </button>

            {menuOpen && (
              <div
                id="mobile-nav"
                className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
              >
                <div className="flex flex-col gap-2">
                  {mobileLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
