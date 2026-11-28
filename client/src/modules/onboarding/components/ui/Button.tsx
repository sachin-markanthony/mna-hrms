import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0b2b52] text-white shadow-sm hover:bg-[#143b68] active:translate-y-px dark:bg-[#1e3a8a] dark:hover:bg-[#1d4ed8]',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
  gold:
    'bg-amber-500 text-[#0f172a] shadow-sm hover:bg-amber-400 active:translate-y-px',
  danger:
    'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-[11px]',
  md: 'px-4 py-2.5 text-xs',
  lg: 'px-6 py-3 text-sm',
};

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, size, className)}
      {...props}
    />
  );
}
