import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Play,
  Sparkles,
} from 'lucide-react';
import type { InductionSummary } from '../../types/learning.types';
import {
  formatMinutes,
  getAssessmentLabel,
  getChapterStatusMeta,
  getReadingLabel,
} from '../../utils/chapterStatus';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';

interface ContinueLearningCardProps {
  summary: InductionSummary;
}

export function ContinueLearningCard({ summary }: ContinueLearningCardProps) {
  const chapter =
    summary.currentChapter ??
    (!summary.finalAssessment.completed ? summary.finalAssessment : null);

  if (!chapter) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-[#CFE3D6] bg-[#F3F8F4] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#A9C9B4]/40" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4F7F61] text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#356B4A]">
                Induction complete
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-[#264A34]">
                You have completed your induction journey
              </h2>
              <p className="mt-1.5 max-w-xl text-xs leading-6 text-[#4F6B58]">
                Every learning chapter and the Grand Final Quiz are complete. Your progress and
                assessment history are saved in My Progress.
              </p>
            </div>
          </div>
          <Link
            to="/induction/progress"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#264A34] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#356B4A]"
          >
            View my progress
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  const meta = getChapterStatusMeta(chapter);
  const isFinal = chapter.kind === 'final_assessment';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#E7D7BE] bg-white p-5 shadow-[0_12px_40px_rgba(59,35,20,0.07)] sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#F7EEDF]" />
      <div className="pointer-events-none absolute -right-4 top-6 h-24 w-24 rounded-full border border-[#E6C687]/40" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#3B2314] text-[#F3DFC0] shadow-[0_8px_18px_rgba(59,35,20,0.18)]">
            <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#CBB69C]">
              {isFinal ? 'Final' : 'Chapter'}
            </span>
            <span className="text-xl font-extrabold leading-tight">
              {isFinal ? '21' : chapter.chapterNumber}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                <Sparkles className="h-3 w-3" />
                {chapter.status === 'assessment_failed'
                  ? 'One more try'
                  : chapter.status === 'reading_completed'
                    ? 'Assessment ready'
                    : 'Continue learning'}
              </span>
              <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
            </div>

            <h2 className="mt-1.5 text-lg font-extrabold leading-snug tracking-tight text-[#3B2314] sm:text-xl">
              {isFinal ? chapter.title : `Chapter ${chapter.chapterNumber} — ${chapter.title}`}
            </h2>
            <p className="mt-1 max-w-xl text-[11.5px] leading-6 text-[#7A6A5C]">
              {chapter.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] font-semibold text-[#8A7A6C]">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-[#B8893A]" />
                {formatMinutes(chapter.estimatedMinutes)}
              </span>
              {!isFinal && (
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#B8893A]" />
                  Reading: {getReadingLabel(chapter.readingStatus)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5 text-[#B8893A]" />
                Assessment: {getAssessmentLabel(chapter)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch">
          <Link to={meta.primaryPath ?? `/induction/chapters/${chapter.chapterNumber}`}>
            <Button type="button" variant="primary" size="lg" className="w-full">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3DFC0] text-[#3B2314]">
                {chapter.status === 'reading_completed' || chapter.status === 'assessment_failed' ? (
                  <ClipboardCheck className="h-3 w-3" />
                ) : (
                  <Play className="ml-0.5 h-3 w-3 fill-current" />
                )}
              </span>
              {meta.primaryLabel ?? 'Continue Reading'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            to="/induction/chapters"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[10.5px] font-bold text-[#7A6A5C] transition hover:bg-[#F8F1E7] hover:text-[#3B2314]"
          >
            See all chapters
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
