import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  ShieldCheck,
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
        backTo="/induction"
        backLabel="Back to induction"
      />
    );
  }

  if (chapter.status === 'locked') {
    return (
      <AccessDenied
        title="The Grand Final Quiz is locked"
        message={`Complete all ${summary.totalLearningChapters} learning chapters to unlock the final assessment. You have completed ${summary.completedChapters} so far.`}
        backTo="/induction"
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
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/induction/chapters/18"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10.5px] font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Chapter 18
        </Link>
        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1e3a8a] bg-gradient-to-br from-[#072b53] via-[#0f3d75] to-[#1e3a8a] p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-300">
              <Trophy className="h-3 w-3" />
              Final assessment
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              The Grand Final Quiz
            </h1>
            <p className="mt-2 text-[12.5px] leading-6 text-blue-100">
              {chapter.description} Answer all {totalQuestions} questions and score at least{' '}
              {INDUCTION_CONFIG.passingPercentage}% to complete your induction.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-blue-50">
                <ClipboardCheck className="h-3.5 w-3.5 text-amber-300" />
                {totalQuestions} questions
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-blue-50">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                {passMark} correct to pass
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-blue-50">
                <Clock3 className="h-3.5 w-3.5 text-amber-300" />
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
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15 dark:border-white/20 dark:bg-white/10 dark:text-white"
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
                {chapter.status === 'assessment_failed'
                  ? 'Retry final assessment'
                  : 'Start final assessment'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a] sm:p-6">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#1e3a8a] dark:text-blue-400">
          Before you begin
        </p>
        <div className="mt-4 space-y-3">
          {[
            'Set aside about 30 minutes and find a quiet space.',
            'Work alone. The quiz confirms your own understanding.',
            'Answer every question. You can move back and forth before submitting.',
            `You need ${INDUCTION_CONFIG.passingPercentage}% to pass. If you do not pass, you can review and retry.`,
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[12px] leading-6 text-slate-600 dark:text-slate-300">{item}</p>
            </div>
          ))}
        </div>

        {lastAttempt && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Latest attempt
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {lastAttempt.score}%
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9.5px] font-bold ${
                lastAttempt.passed
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
              }`}
            >
              {lastAttempt.passed ? 'Passed' : 'Not passed'}
            </span>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
              Attempt {lastAttempt.attemptNumber} · {lastAttempt.correctCount} of{' '}
              {lastAttempt.total} correct
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
