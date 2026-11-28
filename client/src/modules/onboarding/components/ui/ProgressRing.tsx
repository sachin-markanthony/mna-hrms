interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  caption?: string;
  tone?: 'gold' | 'green';
}

export function ProgressRing({
  percentage,
  size = 132,
  strokeWidth = 9,
  label,
  caption,
  tone = 'gold',
}: ProgressRingProps) {
  const safePercentage = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercentage / 100) * circumference;
  const stroke = tone === 'green' ? '#059669' : '#d97706';

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${safePercentage}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {label ?? `${safePercentage}%`}
        </span>
        {caption && (
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
