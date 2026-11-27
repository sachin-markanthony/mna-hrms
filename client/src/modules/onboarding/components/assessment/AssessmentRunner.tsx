import { useMemo, useState } from 'react';
import {
  AlertCircle,
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
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#FBF5EA]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FBF5EA] text-[#9A7A45]">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                {isFinal ? 'Final assessment' : `Chapter ${chapterNumber} assessment`}
              </p>
              <h1 className="mt-1 font-serif text-xl font-bold tracking-tight text-[#3B2314] sm:text-2xl">
                {chapterTitle}
              </h1>
              <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-[#8A7A6C]">
                {assessment.instructions}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE3D6] bg-[#EEF6F0] px-2.5 py-1 text-[9.5px] font-bold text-[#356B4A]">
              <ShieldCheck className="h-3 w-3" />
              {INDUCTION_CONFIG.passingPercentage}% to pass
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DED2] bg-[#FFFCF7] px-2.5 py-1 text-[9.5px] font-bold text-[#6E5B4C]">
              Attempt {attemptCount + 1}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[#EFE5D9] bg-[#FFFCF7] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
              Questions
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#3B2314]">{total}</p>
          </div>
          <div className="rounded-xl border border-[#EFE5D9] bg-[#FFFCF7] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
              Pass mark
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#3B2314]">
              {passMark} of {total} correct
            </p>
          </div>
          <div className="rounded-xl border border-[#EFE5D9] bg-[#FFFCF7] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
              Answered
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#3B2314]">
              {answeredCount} of {total}
            </p>
          </div>
        </div>
      </section>

      {error && <ErrorState title="Assessment not submitted" message={error} onRetry={handleSubmit} />}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <section className="rounded-3xl border border-[#E9DED2] bg-white shadow-[0_10px_35px_rgba(59,35,20,0.05)]">
            <div className="border-b border-[#F0E7DC] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                    Question {currentIndex + 1} of {total}
                  </p>
                  <p className="mt-1 text-[10.5px] font-semibold text-[#8A7A6C]">
                    {answeredCount} answered · {total - answeredCount} remaining
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#F0E7DC]">
                    <div
                      className="h-full rounded-full bg-[#B8893A] transition-all duration-300"
                      style={{ width: `${questionProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-[#3B2314]">
                    {questionProgress}%
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBF5EA] text-[11px] font-extrabold text-[#8A6427]">
                  {currentQuestion.number}
                </span>
                <h2 className="pt-0.5 text-[14px] font-extrabold leading-6 text-[#3B2314]">
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
                      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        selected
                          ? 'border-[#C9A46A] bg-[#FBF5EA] shadow-[0_4px_14px_rgba(184,137,58,0.12)]'
                          : 'border-[#E9DED2] bg-white hover:border-[#D8C3A4] hover:bg-[#FFFCF8]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10px] font-extrabold ${
                          selected
                            ? 'border-[#B8893A] bg-[#B8893A] text-white'
                            : 'border-[#E3D8CB] bg-[#FFFCF7] text-[#9A8B7E]'
                        }`}
                      >
                        {OPTION_LETTERS[index] ?? option.key}
                      </span>
                      <span
                        className={`pt-0.5 text-[12px] leading-6 ${
                          selected ? 'font-semibold text-[#3B2314]' : 'text-[#5F4B3C]'
                        }`}
                      >
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#F0E7DC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
                  className="inline-flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[#8A7A6C] transition hover:text-[#3B2314]"
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
                  {submitting ? 'Submitting…' : 'Submit Assessment'}
                </Button>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-2 rounded-2xl border border-[#E9DED2] bg-[#FFFCF7] px-4 py-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B8893A]" />
            <p className="text-[10px] leading-5 text-[#8A7A6C]">
              Your answers are not graded until you submit. You can move between questions and
              change your selections before submitting. Correct answers are never shown in this
              assessment.
            </p>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <section className="rounded-2xl border border-[#E9DED2] bg-white p-4 shadow-[0_8px_24px_rgba(59,35,20,0.04)]">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <ClipboardCheck className="h-3 w-3" />
              Question navigator
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {assessment.questions.map((question, index) => {
                const answered = Boolean(answers[question.id]);
                const active = index === currentIndex;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to question ${index + 1}${answered ? ', answered' : ''}`}
                    className={`flex h-8 items-center justify-center rounded-lg border text-[10px] font-extrabold transition ${
                      active
                        ? 'border-[#3B2314] bg-[#3B2314] text-white'
                        : answered
                          ? 'border-[#D8C3A4] bg-[#FBF5EA] text-[#8A6427]'
                          : 'border-[#E9DED2] bg-white text-[#A09182] hover:border-[#D8C3A4]'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[9.5px] font-semibold text-[#8A7A6C]">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#B8893A]" />
                Answered
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#E3D8CB]" />
                Not answered
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E9DED2] bg-[#FFFCF7] p-4">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <ShieldCheck className="h-3 w-3" />
              Before you submit
            </div>
            <ul className="mt-2.5 space-y-2 text-[10.5px] leading-5 text-[#8A7A6C]">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#4F7F61]" />
                Answer all {total} questions.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#4F7F61]" />
                Score at least {passMark} of {total} ({INDUCTION_CONFIG.passingPercentage}%) to pass.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#4F7F61]" />
                A failed attempt keeps the next chapter locked. You can retry.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
