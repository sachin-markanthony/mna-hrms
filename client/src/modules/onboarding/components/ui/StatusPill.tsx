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
  locked: 'border-[#E5DED6] bg-[#F5F2EE] text-[#8A7F74]',
  available: 'border-[#E8D9C2] bg-[#FBF5EA] text-[#8A6427]',
  progress: 'border-[#E9D5B0] bg-[#FDF3E1] text-[#9A6420]',
  reading: 'border-[#D8E3EA] bg-[#F0F6F8] text-[#406B7A]',
  failed: 'border-[#F0D9BF] bg-[#FDF4E8] text-[#9A6420]',
  completed: 'border-[#CFE3D6] bg-[#EEF6F0] text-[#356B4A]',
  reference: 'border-[#E2D8CE] bg-[#FAF6F1] text-[#756455]',
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
