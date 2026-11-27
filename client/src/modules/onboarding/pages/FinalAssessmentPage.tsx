import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useChapterLearning } from '../hooks/useInductionLearning';
import { AccessDenied } from '../components/common/States';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { getChapterStatusMeta } from '../utils/chapterStatus';
import { getPassingMark, INDUCTION_CONFIG } from '../config/induction.config';

export function FinalAssessmentPage() {
  const navigate = useNavigate();
  const { chapter, assessment, summary } = useChapterLearning(21);

  if (!chapter) {
    return (
      <AccessDenied
        title="Final assessment not found"
        message="The Grand Final Quiz is not available in this induction programme."
      />
    );
  }

  if (chapter.status === 'locked') {
    return (
      <AccessDenied
        title="The Grand Final Quiz is locked"
        message={`Complete all 18 learning chapters to unlock the final assessment. You have completed ${summary.completedChapters} of ${summary.totalLearningChapters}.`}
        backTo="/induction/chapters"
        backLabel="Continue learning"
      />
    );
  }

  const meta = getChapterStatusMeta(chapter);
  const totalQuestions = assessment?.questions.length ?? 20;
  const passMark = getPassingMark(totalQuestions);
  const isCompleted = chapter.completed;
  const lastAttempt = chapter.latestAttempt;

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
        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-[#E2C48E] bg-[#3B2314] p-6 text-[#FFFDF9] shadow-[0_18px_50px_rgba(59,35,20,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#E6C687]/20" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full border border-[#E6C687]/15" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#B8893A]/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6C687]/25 bg-white/[0.08] px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#E6C687]">
              <Trophy className="h-3 w-3" />
              Final assessment
            </div>
            <h1 className="mt-3 font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              The Grand Final Quiz
            </h1>
            <p className="mt-2 text-[12px] leading-6 text-[#EADCCB]">
              {chapter.description} Answer all {totalQuestions} questions and score at least{' '}
              {INDUCTION_CONFIG.passingPercentage}% to complete your induction.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold text-[#F3E7D7]">
                <ClipboardCheck className="h-3.5 w-3.5 text-[#E6C687]" />
                {totalQuestions} questions
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold text-[#F3E7D7]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#A9D3B6]" />
                {passMark} correct to pass
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold text-[#F3E7D7]">
                <Clock3 className="h-3.5 w-3.5 text-[#E6C687]" />
                About {chapter.estimatedMinutes} minutes
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            {isCompleted ? (
              <>
                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  onClick={() => navigate('/induction/chapters/21/result')}
                  className="w-full"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  View final result
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/induction/chapters/21/assessment')}
                  className="w-full border-white/20 bg-white/10 text-[#FFFDF9] hover:bg-white/15"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retake final quiz
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="gold"
                size="lg"
                onClick={() => navigate('/induction/chapters/21/assessment')}
                className="w-full"
              >
                {chapter.status === 'assessment_failed' ? 'Retry Final Assessment' : 'Start Final Assessment'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
            <Sparkles className="h-3 w-3" />
            Before you begin
          </div>
          <div className="mt-4 space-y-3">
            {[
              'Set aside about 30 minutes and find a quiet space.',
              'Work alone. The quiz is designed to confirm your own understanding.',
              'Answer every question. You can move back and forth before submitting.',
              `You need ${INDUCTION_CONFIG.passingPercentage}% to pass. If you do not pass, you can review and retry.`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4F7F61]" />
                <p className="text-[11.5px] leading-6 text-[#5F4B3C]">{item}</p>
              </div>
            ))}
          </div>

          {lastAttempt && (
            <div className="mt-5 rounded-2xl border border-[#EFE5D9] bg-[#FFFCF7] p-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                Your latest attempt
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-lg font-extrabold text-[#3B2314]">
                  {lastAttempt.score}%
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9.5px] font-bold ${
                    lastAttempt.passed
                      ? 'bg-[#EEF6F0] text-[#356B4A]'
                      : 'bg-[#FDF3E1] text-[#9A6420]'
                  }`}
                >
                  {lastAttempt.passed ? 'Passed' : 'Not passed'}
                </span>
                <span className="text-[10px] text-[#8A7A6C]">
                  Attempt {lastAttempt.attemptNumber} · {lastAttempt.correctCount} of{' '}
                  {lastAttempt.total} correct
                </span>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-[#E9DED2] bg-[#FFFCF7] p-5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <Trophy className="h-3 w-3" />
              Your learning is complete
            </div>
            <p className="mt-2 text-[11px] leading-6 text-[#7A6A5C]">
              You have completed all {summary.totalLearningChapters} learning chapters. The final
              quiz brings the whole induction together.
            </p>
            <Link
              to="/induction/progress"
              className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#8A6427] underline decoration-[#D9BE92] underline-offset-4"
            >
              Review your progress
              <ArrowRight className="h-3 w-3" />
            </Link>
          </section>

          <section className="rounded-3xl border border-[#E9DED2] bg-white p-5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <ClipboardCheck className="h-3 w-3" />
              Attempts saved
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-[#3B2314]">
              {chapter.attempts.length}
            </p>
            <p className="mt-0.5 text-[10.5px] leading-5 text-[#8A7A6C]">
              Final assessment attempt{chapter.attempts.length === 1 ? '' : 's'} saved in your
              history.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
