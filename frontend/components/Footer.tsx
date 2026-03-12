import Link from 'next/link';

const contacts = [
  { label: 'WhatsApp', icon: '💬', href: 'https://wa.me/27827744933', detail: '0827744933' },
  { label: 'LinkedIn', icon: '💼', href: 'https://www.linkedin.com/in/sbahle-kumalo-b4b498267', detail: 'Connect' },
  { label: 'Portfolio', icon: '🌐', href: 'https://sbahle-kumalo-emerging-technologies.base44.app/', detail: 'View work' },
  { label: 'Facebook', icon: '📘', href: 'https://www.facebook.com/IssUrSlime', detail: 'Follow' },
  { label: 'Gmail', icon: '✉️', href: 'mailto:s.kumalo0115@gmail.com', detail: 's.kumalo0115@gmail.com' },
  { label: 'GitHub', icon: '🐙', href: 'https://github.com/skumalo0115-commits', detail: 'Repositories' }
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <section className="section-container py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">ClimateFood Intelligence</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Data-first climate and food insights for better decisions.</h2>
            <p className="mt-4 max-w-2xl text-base text-slate-600">
              Access clear environmental trends, crop signals, and predictive outlooks from a unified platform built for analysis and action.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {contacts.map((contact) => (
              <Link
                key={contact.label}
                href={contact.href}
                target="_blank"
                rel="noreferrer"
                aria-label={contact.label}
                className="group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                <span className="text-3xl" aria-hidden>
                  {contact.icon}
                </span>
                <span className="mt-2 text-sm font-semibold text-slate-800">{contact.label}</span>
                <span className="text-xs text-slate-500">{contact.detail}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </footer>
  );
}
