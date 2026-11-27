import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Info, Printer, ShieldCheck } from 'lucide-react';
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
          <Link to="/induction/chapters" className={buttonStyles('primary', 'md')}>
            Back to learning chapters
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/induction/chapters"
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3.5 py-2 text-[10.5px] font-bold text-[#6E5B4C] shadow-sm transition hover:border-[#C9A46A] hover:text-[#3B2314]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#B8893A]" />
          Back to learning chapters
        </Link>
        <button type="button" onClick={() => window.print()} className={buttonStyles('secondary', 'sm')}>
          <Printer className="h-3.5 w-3.5" />
          Print / save as PDF
        </button>
      </div>

      <header className="relative overflow-hidden rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FBF5EA]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDCB9] bg-[#FBF5EA] px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-[#8A6427]">
                <BookOpen className="h-3 w-3" />
                Reference resource
              </span>
              <span className="text-[9.5px] font-semibold text-[#A09182]">Chapter 20</span>
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold leading-tight tracking-tight text-[#3B2314] sm:text-3xl">
              {chapter.title}
            </h1>
            <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#7A6A5C]">
              {document.summary}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-2 rounded-2xl border border-[#EFE5D9] bg-[#FFFCF7] p-3 lg:max-w-[280px]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#B8893A]" />
            <p className="text-[10px] leading-5 text-[#8A7A6C]">
              This is a reference resource. It does not count toward your 18 learning chapters or
              affect your induction completion.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ChapterContent
          chapterNumber={20}
          sections={document.sections}
          takeaways={document.takeaways}
          endRef={endRef}
        />

        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <section className="rounded-2xl border border-[#E9DED2] bg-white p-4">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <ShieldCheck className="h-3 w-3" />
              How to use this page
            </div>
            <ul className="mt-2.5 space-y-2 text-[10.5px] leading-5 text-[#8A7A6C]">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8893A]" />
                Use these notes as a reference while you work through the learning chapters.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8893A]" />
                Return here whenever you need a definition, disclaimer or regulatory pointer.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8893A]" />
                Reference reading does not unlock chapters or change assessment results.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#E9DED2] bg-[#FFFCF7] p-4">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              Continue your journey
            </p>
            <p className="mt-2 text-[10.5px] leading-5 text-[#8A7A6C]">
              Your guided learning path is waiting in the chapter roadmap.
            </p>
            <Link
              to="/induction/chapters"
              className={buttonStyles('primary', 'sm', 'mt-3 w-full')}
            >
              Open learning chapters
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
