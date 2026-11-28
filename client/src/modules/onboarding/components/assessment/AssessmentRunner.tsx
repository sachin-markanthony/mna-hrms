import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { LearnerAssessment } from '../../data/assessmentBank';
import { getPassingMark, INDUCTION_CONFIG } from '../../config/induction.config';
import { Button } from '../ui/Button';
import { ErrorState } from '../common/States';

interface AssessmentRunnerProps {
  chapterNumber: number;
  chapterTitle: string;
  assessment: LearnerAssessment;
  attemptCount: number;
  isFinal?: boolean;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onReviewChapter: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AssessmentRunner({
  chapterNumber,
  chapterTitle,
  assessment,
  attemptCount,
  isFinal = false,
  onSubmit,
  onReviewChapter,
}: AssessmentRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = assessment.questions.length;
  const currentQuestion = assessment.questions[currentIndex];
  const answeredCount = useMemo(
    () =>
      assessment.questions.filter((question) => Boolean(answers[question.id])).length,
    [answers, assessment.questions],
  );
  const allAnswered = answeredCount === total;
  const passMark = getPassingMark(total);
  const questionProgress = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  const selectAnswer = (questionId: string, optionKey: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionKey }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(answers);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Your assessment could not be submitted. Please try again.',
      );
      setSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <ErrorState
        title="Assessment requires configuration"
        message="The handbook does not currently provide questions for this assessment. Please contact the learning team."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Assessment heading */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a] dark:bg-blue-950/50 dark:text-blue-300">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#1e3a8a] dark:text-blue-400">
                {isFinal ? 'Final assessment' : `Chapter ${chapterNumber} assessment`}
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {chapterTitle}
              </h1>
              <p className="mt-1.5 max-w-xl text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
                {assessment.instructions}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9.5px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            {INDUCTION_CONFIG.passingPercentage}% to pass
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Questions
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">{total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Pass mark
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">
              {passMark} correct
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Attempt
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">
              {attemptCount + 1}
            </p>
          </div>
        </div>
      </section>

      {error && <ErrorState title="Assessment not submitted" message={error} onRetry={handleSubmit} />}

      {/* Question */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#1e3a8a] dark:text-blue-400">
                Question {currentIndex + 1} of {total}
              </p>
              <p className="mt-0.5 text-[10.5px] font-medium text-slate-400">
                {answeredCount} answered · {total - answeredCount} remaining
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-amber-400 transition-all duration-300"
                  style={{ width: `${questionProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                {questionProgress}%
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {currentQuestion.number}
            </span>
            <h2 className="pt-0.5 text-[14px] font-bold leading-6 text-slate-900 dark:text-white">
              {currentQuestion.prompt}
            </h2>
          </div>

          <div
            role="radiogroup"
            aria-label={`Question ${currentQuestion.number}`}
            className="mt-5 space-y-2.5"
          >
            {currentQuestion.options.map((option, index) => {
              const selected = answers[currentQuestion.id] === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => selectAnswer(currentQuestion.id, option.key)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-[#1e3a8a] bg-blue-50/70 shadow-sm ring-1 ring-[#1e3a8a]/15 dark:border-blue-500 dark:bg-blue-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-extrabold ${
                      selected
                        ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {OPTION_LETTERS[index] ?? option.key}
                  </span>
                  <span
                    className={`pt-0.5 text-[12.5px] leading-6 ${
                      selected
                        ? 'font-semibold text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex === 0 || submitting}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCurrentIndex((index) => Math.min(total - 1, index + 1))}
              disabled={currentIndex === total - 1 || submitting}
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onReviewChapter}
              className="inline-flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Review chapter
            </button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {submitting ? 'Submitting…' : 'Submit assessment'}
            </Button>
          </div>
        </div>
      </section>

      {/* Question navigator */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="flex items-center justify-between">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Question navigator
          </p>
          <p className="text-[10px] font-medium text-slate-400">
            {answeredCount} of {total} answered
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {assessment.questions.map((question, index) => {
            const answered = Boolean(answers[question.id]);
            const active = index === currentIndex;
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to question ${index + 1}${answered ? ', answered' : ''}`}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-[10px] font-extrabold transition ${
                  active
                    ? 'border-[#0b2b52] bg-[#0b2b52] text-white dark:border-[#1e3a8a] dark:bg-[#1e3a8a]'
                    : answered
                      ? 'border-blue-200 bg-blue-50 text-[#1e3a8a] dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] leading-5 text-slate-400 dark:text-slate-500">
          Answer all {total} questions. You can move between questions and change your selections
          before submitting. A failed attempt keeps the next chapter locked.
        </p>
      </section>
    </div>
  );
}
