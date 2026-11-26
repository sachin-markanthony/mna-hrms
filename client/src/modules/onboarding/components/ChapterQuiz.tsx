import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
} from 'lucide-react';
import type { HandbookQuizForLearner, QuizEvaluation } from '../types/training.types';

interface ChapterQuizProps {
  chapterNumber: number;
  chapterTitle: string;
  quiz: HandbookQuizForLearner;
  onSubmit: (answers: Record<string, string>) => QuizEvaluation;
  onReviewDocument: () => void;
  onNextChapter?: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const ChapterQuiz: React.FC<ChapterQuizProps> = ({
  chapterNumber,
  chapterTitle,
  quiz,
  onSubmit,
  onReviewDocument,
  onNextChapter,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);

  const answeredCount = useMemo(
    () => quiz.questions.filter((question) => Boolean(answers[question.id])).length,
    [answers, quiz.questions],
  );
  const isComplete = answeredCount === quiz.questions.length;
  const progressPercentage =
    quiz.questions.length > 0 ? Math.round((answeredCount / quiz.questions.length) * 100) : 0;

  const selectAnswer = (questionId: string, optionKey: string) => {
    if (evaluation) return;
    setAnswers((current) => ({ ...current, [questionId]: optionKey }));
  };

  const handleSubmit = () => {
    if (!isComplete || evaluation) return;
    setEvaluation(onSubmit(answers));
  };

  const handleRetry = () => {
    setAnswers({});
    setEvaluation(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#E5DDD5] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FBF7EE] text-[#8C6D37] border border-[#EBDCB9]">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                Chapter {chapterNumber} Assessment
              </span>
              <h3 className="text-lg font-bold text-[#2B1810]">Check Your Understanding</h3>
              <p className="mt-0.5 text-xs text-stone-500">
                {quiz.questions.length} multiple-choice questions &bull; pass mark{' '}
                {quiz.passingScore}/{quiz.questions.length} &bull; {chapterTitle}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#EBDCB9] bg-[#FBF7EE] px-3 py-1 text-[11px] font-bold text-[#8C6D37]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {evaluation ? (evaluation.passed ? 'Passed' : 'Not passed') : `${answeredCount}/${quiz.questions.length} answered`}
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#F0EAE1]">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${evaluation ? (evaluation.passed ? 'bg-emerald-600' : 'bg-amber-500') : 'bg-[#D4AF37]'
              }`}
            style={{ width: `${evaluation ? evaluation.score : progressPercentage}%` }}
          />
        </div>
      </div>

      {evaluation && (
        <div
          className={`rounded-lg border p-5 sm:p-6 ${evaluation.passed
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
            }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${evaluation.passed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
                  }`}
              >
                {evaluation.passed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3
                  className={`text-base font-bold ${evaluation.passed ? 'text-emerald-900' : 'text-amber-900'
                    }`}
                >
                  {evaluation.passed
                    ? `Chapter ${chapterNumber} completed`
                    : 'Assessment not passed'}
                </h3>
                <p
                  className={`mt-0.5 text-xs ${evaluation.passed ? 'text-emerald-800' : 'text-amber-800'
                    }`}
                >
                  Score: {evaluation.score}% ({evaluation.correctCount}/{evaluation.total} correct).
                  {evaluation.passed
                    ? onNextChapter
                      ? ' You can now continue to the next chapter.'
                      : ' You have completed the final assessment.'
                    : ' Review the learning material and retry the assessment. Correct answers are not shown.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!evaluation.passed && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD3C9] bg-white px-3.5 py-2 text-xs font-bold text-[#2B1810] transition hover:bg-[#FAF7F2] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry assessment
                </button>
              )}
              {evaluation.passed && onNextChapter && (
                <button
                  type="button"
                  onClick={onNextChapter}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2B1810] px-3.5 py-2 text-xs font-bold text-[#FAF7F2] transition hover:bg-[#3D2217] cursor-pointer"
                >
                  Next chapter
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {quiz.questions.map((question) => {
          const selected = answers[question.id];

          return (
            <div
              key={question.id}
              className="rounded-lg border border-[#E5DDD5] bg-white p-5 shadow-xs transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FAF7F2] text-[11px] font-bold text-[#8C6D37] border border-[#EFE7DE]">
                    {question.number}
                  </span>
                  <p className="pt-0.5 text-sm font-semibold leading-relaxed text-[#2B1810]">
                    {question.prompt}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {question.options.map((option, index) => {
                  const isSelected = selected === option.key;

                  let optionClass =
                    'border-[#E5DDD5] bg-white text-stone-700 hover:border-[#D4AF37] hover:bg-[#FBF7EE]';
                  if (isSelected) {
                    optionClass = 'border-[#D4AF37] bg-[#FBF7EE] text-[#2B1810] ring-2 ring-[#D4AF37]/20';
                  }

                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={Boolean(evaluation)}
                      onClick={() => selectAnswer(question.id, option.key)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition cursor-pointer disabled:cursor-default ${optionClass}`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold ${isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#1A120B]'
                          : 'border-[#DDD3C9] bg-white text-stone-500'
                          }`}
                      >
                        {OPTION_LETTERS[index] ?? option.key}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[#E5DDD5] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onReviewDocument}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C6D37] hover:underline cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Back to training document
        </button>

        {!evaluation && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition ${isComplete
              ? 'bg-[#D4AF37] text-[#1A120B] hover:bg-[#C29D29] cursor-pointer shadow-xs'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            Submit assessment
          </button>
        )}

      </div>
    </div>
  );
};
