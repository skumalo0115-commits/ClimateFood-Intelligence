'use client';

import { ThemeMode } from '@/lib/types';

interface Props {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

export default function ThemeToggle({ mode, onChange }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-40 rounded-full bg-slate-800/90 p-2 shadow-lg">
      {(['dark', 'light', 'gradient'] as ThemeMode[]).map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`mx-1 rounded-full px-3 py-1 text-xs font-medium transition ${
            mode === option ? 'bg-emerald-500 text-white' : 'text-slate-200 hover:bg-slate-700'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
