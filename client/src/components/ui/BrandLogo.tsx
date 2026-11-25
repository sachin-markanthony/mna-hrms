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

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={logoImg}
          alt="Mark Anthony Ventures"
          className={`${heights[size]} w-auto object-contain shrink-0`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={logoImg}
        alt="Mark Anthony Ventures"
        className={`${heights[size]} w-auto object-contain shrink-0`}
      />

      <div className="flex flex-col text-left leading-tight">
        <div className={`flex items-center gap-1.5 font-black uppercase tracking-tight ${textSizes[size]}`}>
          <span className={light ? 'text-white' : 'text-slate-900 dark:text-white'}>
            MARK ANTHONY
          </span>
          <span className="text-amber-500 font-bold tracking-wider">
            VENTURES
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${
              light ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            HRMS Enterprise Portal
          </span>
        )}
      </div>
    </div>
  );
}
