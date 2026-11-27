import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { AssessmentAttempt, ChapterView } from '../../types/learning.types';
import type { LearnerAssessment } from '../../data/assessmentBank';
import { formatDateTime } from '../../utils/chapterStatus';
import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';

interface AssessmentResultProps {
  attempt: AssessmentAttempt;
  chapter: ChapterView;
  assessment: LearnerAssessment | null;
  attempts: AssessmentAttempt[];
  nextChapter: ChapterView | null;
  onRetry: () => void;
  onReview: () => void;
  onContinue: () => void;
  onViewProgress: () => void;
}

export function AssessmentResult({
  attempt,
  chapter,
  assessment,
  attempts,
  nextChapter,
  onRetry,
  onReview,
  onContinue,
  onViewProgress,
}: AssessmentResultProps) {
  const isFinal = chapter.kind === 'final_assessment';
  const missedQuestions = assessment
    ? assessment.questions.filter((question) =>
      attempt.missedQuestionIds.includes(question.id),
    )
    : [];

  return (
    <div className="space-y-5">
      <section
        className={`relative overflow-hidden rounded-3xl border p-6 shadow-[0_14px_45px_rgba(59,35,20,0.07)] sm:p-8 ${
          attempt.passed
            ? 'border-[#CFE3D6] bg-[#F3F8F4]'
            : 'border-[#EFD9B6] bg-[#FFF9EF]'
        }`}
      >
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full ${
            attempt.passed ? 'bg-[#DCEBDD]' : 'bg-[#F8E8CC]'
          }`}
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={attempt.passed ? 'completed' : 'failed'}>
                {attempt.passed ? 'Assessment passed' : 'Assessment not passed'}
              </StatusPill>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#8A7A6C]">
                Attempt {attempt.attemptNumber}
              </span>
            </div>

            <div className="mt-3 flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${
                  attempt.passed ? 'bg-[#4F7F61]' : 'bg-[#C58A3A]'
                }`}
              >
                {attempt.passed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h1
                  className={`font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl ${
                    attempt.passed ? 'text-[#264A34]' : 'text-[#6B4A1D]'
                  }`}
                >
                  {attempt.passed
                    ? isFinal
                      ? 'You have completed the Grand Final Quiz!'
                      : 'Excellent work! You have successfully completed this chapter.'
                    : "You're almost there!"}
                </h1>
                <p
                  className={`mt-2 text-[12px] leading-6 ${
                    attempt.passed ? 'text-[#4F6B58]' : 'text-[#7A5C2E]'
                  }`}
                >
                  {attempt.passed
                    ? isFinal
                      ? 'You have completed every learning chapter and the final assessment. Your MA Ventures induction is complete.'
                      : 'Your score meets the pass mark. The next chapter is now unlocked and ready when you are.'
                    : 'Take another look at this chapter and give it another try. Learning takes practice, and we are here to help you succeed.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg border border-white/60 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-[#3B2314]">
                Score {attempt.score}%
              </span>
              <span className="rounded-lg border border-white/60 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-[#3B2314]">
                {attempt.correctCount} of {attempt.total} correct
              </span>
              <span className="rounded-lg border border-white/60 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-[#3B2314]">
                Pass mark {attempt.passingMark} of {attempt.total} ({attempt.passingPercentage}%)
              </span>
            </div>

            <p className="mt-3 text-[10px] font-semibold text-[#8A7A6C]">
              Submitted {formatDateTime(attempt.attemptedAt)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-4">
            <ProgressRing
              percentage={attempt.score}
              size={148}
              strokeWidth={11}
              tone={attempt.passed ? 'green' : 'gold'}
              caption={attempt.passed ? 'Passed' : 'Keep going'}
            />
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                attempt.passed
                  ? 'bg-[#E3F0E6] text-[#356B4A]'
                  : 'bg-[#F8E8CC] text-[#8A6427]'
              }`}
            >
              {attempt.passed ? <Trophy className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
              {attempt.passed ? 'Chapter complete' : 'Retry available'}
            </span>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {attempt.passed ? (
            <>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={isFinal ? onViewProgress : onContinue}
                className="w-full sm:w-auto"
              >
                {isFinal ? 'View my induction progress' : 'Continue to Next Chapter'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              {!isFinal && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={onReview}
                  className="w-full sm:w-auto"
                >
                  Review chapter
                </Button>
              )}
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
                Retry Assessment
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onReview}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back to Chapter
              </Button>
            </>
          )}
        </div>
      </section>

      {!attempt.passed && missedQuestions.length > 0 && (
        <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
            <Sparkles className="h-3 w-3" />
            Areas to revisit
          </div>
          <p className="mt-1 text-[11px] leading-5 text-[#8A7A6C]">
            These questions need a little more attention. Re-read the relevant section, then try
            again. Correct answers are not shown.
          </p>
          <div className="mt-3 space-y-2">
            {missedQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-start gap-2.5 rounded-xl border border-[#F0E1C8] bg-[#FFFBF5] px-3 py-2.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F8E8CC] text-[10px] font-extrabold text-[#8A6427]">
                  {question.number}
                </span>
                <p className="pt-0.5 text-[11px] leading-5 text-[#6B4A1D]">{question.prompt}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <ClipboardCheck className="h-3 w-3" />
              Attempt history
            </div>
            <p className="mt-1 text-[11px] text-[#8A7A6C]">
              Every attempt is saved separately. Retrying never deletes an earlier attempt.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#E9DED2] bg-[#FFFCF7] px-2.5 py-1 text-[9.5px] font-bold text-[#6E5B4C]">
            {attempts.length} attempt{attempts.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#EFE5D9]">
          <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
            <thead className="bg-[#FBF5EA] text-[9px] uppercase tracking-[0.1em] text-[#8A6427]">
              <tr>
                <th className="px-3.5 py-2.5 font-extrabold">Attempt</th>
                <th className="px-3.5 py-2.5 font-extrabold">Submitted</th>
                <th className="px-3.5 py-2.5 font-extrabold">Score</th>
                <th className="px-3.5 py-2.5 font-extrabold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EAE0]">
              {attempts.map((item) => (
                <tr
                  key={item.id}
                  className={item.id === attempt.id ? 'bg-[#FFFCF8]' : 'bg-white'}
                >
                  <td className="px-3.5 py-2.5 font-bold text-[#3B2314]">#{item.attemptNumber}</td>
                  <td className="px-3.5 py-2.5 text-[#7A6A5C]">{formatDateTime(item.attemptedAt)}</td>
                  <td className="px-3.5 py-2.5 font-bold text-[#3B2314]">{item.score}%</td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                        item.passed
                          ? 'bg-[#EEF6F0] text-[#356B4A]'
                          : 'bg-[#FDF3E1] text-[#9A6420]'
                      }`}
                    >
                      {item.passed ? (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      ) : (
                        <AlertCircle className="h-2.5 w-2.5" />
                      )}
                      {item.passed ? 'Passed' : 'Not passed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {attempt.passed && nextChapter && !isFinal && (
        <section className="rounded-3xl border border-[#E9DED2] bg-[#FFFCF7] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                Up next
              </p>
              <p className="mt-1 text-[12px] font-bold text-[#3B2314]">
                Chapter {nextChapter.chapterNumber} — {nextChapter.title}
              </p>
              <p className="mt-0.5 text-[10.5px] text-[#8A7A6C]">
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
