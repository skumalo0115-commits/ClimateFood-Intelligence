'use client';

import { useEffect, useState } from 'react';

const links = ['Home', 'Dashboard', 'Climate Data', 'Food Supply', 'AI Predictions'];

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
        scrolled ? 'bg-slate-950/95 backdrop-blur border-b border-slate-800' : 'bg-transparent'
      }`}
    >
      <nav className="section-container flex items-center justify-between py-4">
        <span className="text-lg font-semibold">ClimateFood Intelligence</span>
        <ul className="hidden md:flex gap-6 text-sm text-slate-300">
          {links.map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-emerald-400 transition-colors">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
