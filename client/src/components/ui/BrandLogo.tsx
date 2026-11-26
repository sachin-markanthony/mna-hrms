import logoImg from '../../assets/malogo.png';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  light?: boolean;
  collapsed?: boolean;
}

export function BrandLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
  light = false,
  collapsed = false,
}: BrandLogoProps) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-[13px]',
    lg: 'text-base',
    xl: 'text-2xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  if (collapsed) {
    return (
      <div className={`flex items-center justify-center w-full ${className}`}>
        <img
          src={logoImg}
          alt="Mark Anthony Ventures"
          className={`${heights[size]} w-auto object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(217,119,6,0.2)] transition-transform duration-200 hover:scale-105`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none min-w-0 ${className}`}>
      {/* Brand Crest Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={logoImg}
          alt="Mark Anthony Ventures"
          className={`${heights[size]} w-auto object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(217,119,6,0.2)]`}
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none min-w-0">
        {/* Line 1: MARK ANTHONY */}
        <span
          className={`font-black uppercase tracking-wider whitespace-nowrap ${titleSizes[size]} ${
            light ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          MARK ANTHONY
        </span>

        {/* Line 2: VENTURES + HRMS Badge */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span
            className={`font-extrabold uppercase tracking-[0.24em] text-amber-500 dark:text-amber-400 whitespace-nowrap ${subSizes[size]}`}
          >
            VENTURES
          </span>

          {showSubtitle && (
            <span
              className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-widest whitespace-nowrap leading-none ${
                light
                  ? 'bg-white/15 text-amber-300 border border-white/10'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
            >
              HRMS
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

