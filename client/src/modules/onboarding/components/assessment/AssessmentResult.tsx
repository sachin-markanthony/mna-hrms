import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import type { AssessmentAttempt, ChapterView } from '../../types/learning.types';
import type { LearnerAssessment } from '../../data/assessmentBank';
import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';

interface AssessmentResultProps {
  attempt: AssessmentAttempt;
  chapter: ChapterView;
  assessment: LearnerAssessment | null;
  nextChapter: ChapterView | null;
  onRetry: () => void;
  onReview: () => void;
  onContinue: () => void;
}

export function AssessmentResult({
  attempt,
  chapter,
  assessment,
  nextChapter,
  onRetry,
  onReview,
  onContinue,
}: AssessmentResultProps) {
  const isFinal = chapter.kind === 'final_assessment';
  const missedQuestions = assessment
    ? assessment.questions.filter((question) =>
      attempt.missedQuestionIds.includes(question.id),
    )
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section
        className={`overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-8 ${
          attempt.passed
            ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25'
            : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/25'
        }`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={attempt.passed ? 'completed' : 'failed'}>
                {attempt.passed ? 'Assessment passed' : 'Assessment not passed'}
              </StatusPill>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Attempt {attempt.attemptNumber}
              </span>
            </div>

            <div className="mt-3 flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${
                  attempt.passed ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
              >
                {attempt.passed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {attempt.passed
                    ? isFinal
                      ? 'Induction complete'
                      : 'Chapter complete'
                    : 'Almost there'}
                </h1>
                <p className="mt-2 text-[12.5px] leading-6 text-slate-600 dark:text-slate-300">
                  {attempt.passed
                    ? isFinal
                      ? 'You have completed every learning chapter and the Grand Final Quiz. Welcome to the MA Ventures team.'
                      : 'You met the pass mark. The next chapter is now unlocked and ready when you are.'
                    : 'Review the chapter and try again. Learning takes practice — the next chapter stays locked until you pass.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md border border-white/60 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                Score {attempt.score}%
              </span>
              <span className="rounded-md border border-white/60 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                {attempt.correctCount} of {attempt.total} correct
              </span>
              <span className="rounded-md border border-white/60 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                Pass mark {attempt.passingMark} of {attempt.total}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3">
            <ProgressRing
              percentage={attempt.score}
              size={132}
              strokeWidth={10}
              tone={attempt.passed ? 'green' : 'gold'}
              caption={attempt.passed ? 'Passed' : 'Keep going'}
            />
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                attempt.passed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              {attempt.passed ? <Trophy className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
              {attempt.passed ? 'Chapter complete' : 'Retry available'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {attempt.passed ? (
            <>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={onContinue}
                className="w-full sm:w-auto"
              >
                {isFinal ? 'Back to dashboard' : 'Continue to next chapter'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onReview}
                className="w-full sm:w-auto"
              >
                {isFinal ? 'Review final quiz' : 'Review chapter'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={onRetry}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Retry assessment
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onReview}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to chapter
              </Button>
            </>
          )}
        </div>
      </section>

      {!attempt.passed && missedQuestions.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a] sm:p-6">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
            Areas to revisit
          </p>
          <p className="mt-1 text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
            These questions need a little more attention. Re-read the relevant section, then try
            again. Correct answers are not shown.
          </p>
          <div className="mt-3 space-y-2">
            {missedQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 dark:border-amber-900/60 dark:bg-amber-950/20"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  {question.number}
                </span>
                <p className="pt-0.5 text-[11.5px] leading-5 text-slate-700 dark:text-slate-300">
                  {question.prompt}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {attempt.passed && nextChapter && !isFinal && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0f172a]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Up next
              </p>
              <p className="mt-1 text-[12.5px] font-bold text-slate-900 dark:text-white">
                Chapter {nextChapter.chapterNumber} — {nextChapter.title}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {nextChapter.description}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onContinue}
              className="shrink-0"
            >
              Open next chapter
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
