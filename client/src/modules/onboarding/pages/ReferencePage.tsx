import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Info, Printer } from 'lucide-react';
import { useChapterLearning } from '../hooks/useInductionLearning';
import { ChapterContent } from '../components/reader/ChapterContent';
import { EmptyState } from '../components/common/States';
import { buttonStyles } from '../components/ui/Button';

export function ReferencePage() {
  const { document, chapter } = useChapterLearning(20);
  const endRef = useRef<HTMLDivElement>(null);

  if (!document || !chapter) {
    return (
      <EmptyState
        icon={FileText}
        title="Reference content is being prepared"
        description="The reference notes have not been imported yet. Please contact the learning team if you need them urgently."
        action={
          <Link to="/induction" className={buttonStyles('primary', 'md')}>
            Back to induction
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/induction" className={buttonStyles('secondary', 'sm', 'w-fit')}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to induction
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className={buttonStyles('secondary', 'sm', 'w-fit')}
        >
          <Printer className="h-3.5 w-3.5" />
          Print / save as PDF
        </button>
      </div>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#1e3a8a] dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300">
            <BookOpen className="h-3 w-3" />
            Reference notes
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Chapter 20</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {chapter.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-500 dark:text-slate-400">
          {document.summary}
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0f172a]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-[10.5px] leading-5 text-slate-500 dark:text-slate-400">
            This is a reference resource. It does not count toward your 18 learning chapters or
            affect your induction completion.
          </p>
        </div>
      </header>

      <ChapterContent
        chapterNumber={20}
        sections={document.sections}
        takeaways={document.takeaways}
        endRef={endRef}
      />
    </div>
  );
}
