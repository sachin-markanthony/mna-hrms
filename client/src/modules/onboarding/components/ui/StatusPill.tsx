import type { ReactNode } from 'react';

export type StatusTone =
  | 'locked'
  | 'available'
  | 'progress'
  | 'reading'
  | 'failed'
  | 'completed'
  | 'reference';

const TONES: Record<StatusTone, string> = {
  locked:
    'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
  available:
    'border-blue-200 bg-blue-50 text-[#1e3a8a] dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
  progress:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
  reading:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
  failed:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
  completed:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400',
  reference:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
};

interface StatusPillProps {
  tone: StatusTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function StatusPill({ tone, children, icon, className = '' }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
