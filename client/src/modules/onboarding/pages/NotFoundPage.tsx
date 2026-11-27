import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { buttonStyles } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#E9DED2] bg-white p-8 text-center shadow-[0_12px_40px_rgba(59,35,20,0.06)] sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F1EB] text-[#8A7A6C]">
        <SearchX className="h-6 w-6" />
      </div>
      <h1 className="mt-5 font-serif text-2xl font-bold text-[#3B2314]">Page not found</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7A6A5C]">
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
