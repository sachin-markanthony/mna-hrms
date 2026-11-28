import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { buttonStyles } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#0f172a] sm:p-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <SearchX className="h-5 w-5" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-slate-500 dark:text-slate-400">
        This induction page does not exist. Return to your learning journey to continue where you
        left off.
      </p>
      <Link to="/induction" className={buttonStyles('primary', 'md', 'mt-6')}>
        <ArrowLeft className="h-4 w-4" />
        Back to my learning
      </Link>
    </div>
  );
}
