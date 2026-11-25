import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import type { HandbookQuiz, QuizEvaluation } from '../types/training.types';

interface ChapterQuizProps {
  chapterNumber: number;
  chapterTitle: string;
  quiz: HandbookQuiz;
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

  const resultByQuestion = new Map(
    evaluation?.results.map((result) => [result.questionId, result]) ?? [],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E5DDD5] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBF7EE] text-[#8C6D37] border border-[#EBDCB9]">
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
            className={`h-2 rounded-full transition-all duration-500 ${
              evaluation ? (evaluation.passed ? 'bg-emerald-600' : 'bg-amber-500') : 'bg-[#D4AF37]'
            }`}
            style={{ width: `${evaluation ? evaluation.score : progressPercentage}%` }}
          />
        </div>
      </div>

      {evaluation && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 ${
            evaluation.passed
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  evaluation.passed
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
                  className={`text-base font-bold ${
                    evaluation.passed ? 'text-emerald-900' : 'text-amber-900'
                  }`}
                >
                  {evaluation.passed
                    ? `Chapter ${chapterNumber} completed`
                    : `You need ${evaluation.passingScore} correct answers to pass`}
                </h3>
                <p
                  className={`mt-0.5 text-xs ${
                    evaluation.passed ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  Score: {evaluation.score}% ({evaluation.correctCount}/{evaluation.total} correct).
                  {evaluation.passed
                    ? ' Your induction progress and dashboard metrics have been updated automatically.'
                    : ' Review the highlighted answers below, revisit the document, then retake the assessment.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD3C9] bg-white px-3.5 py-2 text-xs font-bold text-[#2B1810] transition hover:bg-[#FAF7F2] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake MCQ
              </button>
              {evaluation.passed && onNextChapter && (
                <button
                  type="button"
                  onClick={onNextChapter}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2B1810] px-3.5 py-2 text-xs font-bold text-[#FAF7F2] transition hover:bg-[#3D2217] cursor-pointer"
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
          const result = resultByQuestion.get(question.id);
          const selected = answers[question.id];

          return (
            <div
              key={question.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition ${
                result
                  ? result.isCorrect
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                  : 'border-[#E5DDD5]'
              }`}
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
                {result && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      result.isCorrect
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {result.isCorrect ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-2">
                {question.options.map((option, index) => {
                  const isSelected = selected === option.key;
                  const isCorrectOption = result?.correctOption === option.key;
                  const isWrongSelection = Boolean(result && isSelected && !isCorrectOption);

                  let optionClass =
                    'border-[#E5DDD5] bg-white text-stone-700 hover:border-[#D4AF37] hover:bg-[#FBF7EE]';
                  if (!result && isSelected) {
                    optionClass = 'border-[#D4AF37] bg-[#FBF7EE] text-[#2B1810] ring-2 ring-[#D4AF37]/20';
                  }
                  if (result && isCorrectOption) {
                    optionClass = 'border-emerald-300 bg-emerald-50 text-emerald-900';
                  } else if (result && isWrongSelection) {
                    optionClass = 'border-rose-300 bg-rose-50 text-rose-900';
                  }

                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={Boolean(result)}
                      onClick={() => selectAnswer(question.id, option.key)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition cursor-pointer disabled:cursor-default ${optionClass}`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold ${
                          result && isCorrectOption
                            ? 'border-emerald-500 bg-emerald-600 text-white'
                            : result && isWrongSelection
                              ? 'border-rose-500 bg-rose-600 text-white'
                              : isSelected
                                ? 'border-[#D4AF37] bg-[#D4AF37] text-[#1A120B]'
                                : 'border-[#DDD3C9] bg-white text-stone-500'
                        }`}
                      >
                        {result && isCorrectOption ? (
                          <Check className="h-3 w-3" />
                        ) : result && isWrongSelection ? (
                          <X className="h-3 w-3" />
                        ) : (
                          OPTION_LETTERS[index] ?? option.key
                        )}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {result && !result.isCorrect && (
                <p className="mt-3 rounded-xl bg-[#FAF7F2] px-3 py-2 text-[11px] font-semibold text-[#8C6D37] border border-[#EFE7DE]">
                  Correct answer: {result.correctOption}.{' '}
                  {question.options.find((option) => option.key === result.correctOption)?.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5DDD5] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
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
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              isComplete
                ? 'bg-[#D4AF37] text-[#1A120B] hover:bg-[#C29D29] cursor-pointer shadow-xs'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            Submit assessment
          </button>
        )}

        {evaluation && !evaluation.passed && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
            <XCircle className="h-3.5 w-3.5" />
            {quiz.passingScore - evaluation.correctCount} more correct answer
            {quiz.passingScore - evaluation.correctCount === 1 ? '' : 's'} needed
          </span>
        )}
      </div>
    </div>
  );
};
