'use client';

import { useEffect, useState } from 'react';

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Data', href: '#data-insights' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'border-b border-slate-800 bg-slate-950/95 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="section-container flex items-center justify-between py-4">
        <span className="text-lg font-semibold">ClimateFood Intelligence</span>
        <ul className="hidden gap-6 text-sm text-slate-300 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-emerald-400">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
