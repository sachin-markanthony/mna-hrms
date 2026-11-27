import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  LockKeyhole,
  Sparkles,
  Target,
} from 'lucide-react';
import type { InductionSummary } from '../../types/learning.types';
import { ProgressRing } from '../ui/ProgressRing';

interface ProgressOverviewCardProps {
  summary: InductionSummary;
}

export function ProgressOverviewCard({ summary }: ProgressOverviewCardProps) {
  const current = summary.currentChapter;

  return (
    <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[#F0E7DC] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
            <Target className="h-3 w-3" />
            Induction progress
          </div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#3B2314]">
            {summary.completedChapters} of {summary.totalLearningChapters} learning chapters completed
          </h2>
          <p className="mt-1 text-[11px] text-[#8A7A6C]">
            {summary.remainingChapters === 0
              ? 'All learning chapters are complete. Your final assessment is waiting.'
              : `${summary.remainingChapters} chapter${summary.remainingChapters === 1 ? '' : 's'} left in your guided journey.`}
          </p>
        </div>
        <Link
          to="/induction/chapters"
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-[#FFFCF7] px-3.5 py-2 text-[10.5px] font-bold text-[#6E5B4C] transition hover:border-[#C9A46A] hover:text-[#3B2314]"
        >
          View roadmap
          <ArrowRight className="h-3.5 w-3.5 text-[#B8893A]" />
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center justify-center sm:justify-start">
          <ProgressRing
            percentage={summary.overallPercentage}
            caption="Complete"
            size={136}
            strokeWidth={10}
            tone={summary.overallPercentage === 100 ? 'green' : 'gold'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                <CheckCircle2 className="h-3 w-3 text-[#4F7F61]" />
                Completed
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-[#3B2314]">
                {summary.completedChapters}
              </p>
            </div>

            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                <BookOpen className="h-3 w-3 text-[#B8893A]" />
                Current
              </div>
              <p className="mt-1.5 truncate text-[11px] font-bold text-[#3B2314]">
                {current
                  ? `Chapter ${current.chapterNumber}`
                  : summary.finalAssessment.completed
                    ? 'Induction complete'
                    : 'Final assessment'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                <LockKeyhole className="h-3 w-3 text-[#A09182]" />
                Locked
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-[#3B2314]">
                {summary.lockedChapters}
              </p>
            </div>

            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                <CircleDashed className="h-3 w-3 text-[#9A7A45]" />
                Remaining
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-[#3B2314]">
                {summary.remainingChapters}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#F0E1C8] bg-[#FBF5EA] px-3 py-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#B8893A]" />
            <p className="text-[10.5px] font-semibold leading-5 text-[#7A5C2E]">
              {summary.overallPercentage === 100
                ? 'Every learning chapter is complete. You are ready for the Grand Final Quiz.'
                : 'Read a chapter, pass its assessment, and the next chapter unlocks automatically.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
