import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893A]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[#3B2314] text-[#FFFDF9] shadow-[0_8px_20px_rgba(59,35,20,0.18)] hover:bg-[#54331F] active:translate-y-px',
  secondary:
    'border border-[#E4D8CA] bg-white text-[#3B2314] shadow-[0_2px_8px_rgba(59,35,20,0.04)] hover:border-[#C9A46A] hover:bg-[#FBF7F0]',
  ghost: 'text-[#6F5B4B] hover:bg-[#F3ECE2] hover:text-[#3B2314]',
  gold:
    'bg-[#B8893A] text-white shadow-[0_8px_20px_rgba(184,137,58,0.22)] hover:bg-[#A3772D] active:translate-y-px',
  danger:
    'border border-[#E9C9C1] bg-[#FDF5F2] text-[#9B3F2E] hover:bg-[#FAEAE4]',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-[11px]',
  md: 'px-4 py-2.5 text-xs',
  lg: 'px-6 py-3.5 text-sm',
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
