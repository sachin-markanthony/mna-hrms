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
  const stroke = tone === 'green' ? '#4F7F61' : '#B8893A';

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
          stroke="#EFE7DC"
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
        <span className="text-2xl font-extrabold tracking-tight text-[#3B2314]">
          {label ?? `${safePercentage}%`}
        </span>
        {caption && (
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7A6C]">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
