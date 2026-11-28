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
  backTo = '/induction',
  backLabel = 'Back to induction',
}: AccessDeniedProps) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#0f172a] sm:p-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <LockKeyhole className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-slate-500 dark:text-slate-400">
        {message}
      </p>
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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-6 text-slate-500 dark:text-slate-400">
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
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-rose-900 dark:text-rose-300">{title}</p>
          <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-400">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-xs font-bold text-rose-800 underline decoration-rose-300 underline-offset-4 dark:text-rose-300"
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
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a] dark:bg-blue-950/50 dark:text-blue-300">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
        {message}
      </p>
    </div>
  );
}
