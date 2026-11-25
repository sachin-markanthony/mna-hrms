import logoImg from '../../assets/malogo.png';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  light?: boolean;
}

export function BrandLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
  light = false,
}: BrandLogoProps) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-13',
    xl: 'h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={logoImg}
        alt="Mark Anthony Ventures Logo"
        className={`${heights[size]} w-auto object-contain shrink-0 drop-shadow-xs`}
      />

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${
              light ? 'text-white' : 'text-slate-900'
            } ${textSizes[size]}`}
          >
            MARK ANTHONY
          </span>
          <span
            className={`font-bold tracking-wider text-[#d97706] ${textSizes[size]}`}
          >
            VENTURES
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${
              light ? 'text-slate-300' : 'text-slate-400'
            }`}
          >
            HRMS Enterprise Portal
          </span>
        )}
      </div>
    </div>
  );
}
