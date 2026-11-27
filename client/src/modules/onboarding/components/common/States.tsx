import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Inbox,
  LoaderCircle,
  LockKeyhole,
  type LucideIcon,
} from 'lucide-react';
import { buttonStyles } from '../ui/Button';

interface AccessDeniedProps {
  title?: string;
  message: string;
  backTo?: string;
  backLabel?: string;
}

export function AccessDenied({
  title = 'This chapter is locked',
  message,
  backTo = '/induction/chapters',
  backLabel = 'Back to learning chapters',
}: AccessDeniedProps) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#E9DED2] bg-white p-8 text-center shadow-[0_12px_40px_rgba(59,35,20,0.06)] sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F1EB] text-[#8A7A6C]">
        <LockKeyhole className="h-6 w-6" />
      </div>
      <h1 className="mt-5 font-serif text-2xl font-bold text-[#3B2314]">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7A6A5C]">{message}</p>
      <Link to={backTo} className={buttonStyles('primary', 'md', 'mt-6')}>
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[#DED2C4] bg-white/70 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F2EA] text-[#A98B62]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[#3B2314]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-6 text-[#7A6A5C]">
        {description}
      </p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-[#EFCFC5] bg-[#FDF5F1] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8E5DE] text-[#A34C35]">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#7E3A29]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[#8B5A4C]">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-xs font-bold text-[#7E3A29] underline decoration-[#D6A28F] underline-offset-4"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoadingState({ message = 'Loading your learning journey…' }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F0E4] text-[#B8893A]">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A7A6C]">
        {message}
      </p>
    </div>
  );
}
