import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import type { InductionChapter, InductionSession } from '../types/induction.types';
import type {
  HandbookBlock,
  HandbookDocument,
  QuizAttempt,
  QuizEvaluation,
} from '../types/training.types';
import { ChapterQuiz } from './ChapterQuiz';

interface TrainingDocumentViewProps {
  session: InductionSession | null;
  chapter: InductionChapter;
  document: HandbookDocument | null;
  lastAttempt: QuizAttempt | null;
  nextChapter: InductionChapter | null;
  onBack: () => void;
  onStartChapter: (chapterId: string) => void;
  onSubmitQuiz: (chapterId: string, answers: Record<string, string>) => QuizEvaluation;
  onNavigateChapter: (chapter: InductionChapter) => void;
}

const CALLOUT_STYLES: Record<
  'important' | 'info' | 'example' | 'tip',
  { wrapper: string; icon: string; label: string; Icon: typeof AlertTriangle }
> = {
  important: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'bg-amber-500 text-white',
    label: 'text-amber-800',
    Icon: AlertTriangle,
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-950',
    icon: 'bg-sky-600 text-white',
    label: 'text-sky-800',
    Icon: Lightbulb,
  },
  example: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    icon: 'bg-emerald-600 text-white',
    label: 'text-emerald-800',
    Icon: Sparkles,
  },
  tip: {
    wrapper: 'border-violet-200 bg-violet-50 text-violet-950',
    icon: 'bg-violet-600 text-white',
    label: 'text-violet-800',
    Icon: Target,
  },
};

function renderBlock(block: HandbookBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-sm leading-7 text-stone-700">
          {block.text}
        </p>
      );
    case 'subheading':
      return (
        <h4 key={index} className="pt-2 text-sm font-bold text-[#2B1810]">
          {block.text}
        </h4>
      );
    case 'bullet':
      return (
        <div key={index} className="flex items-start gap-2.5 text-sm leading-6 text-stone-700">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
          <span>{block.text}</span>
        </div>
      );
    case 'callout': {
      const style = CALLOUT_STYLES[block.tone];
      const Icon = style.Icon;
      return (
        <div key={index} className={`rounded-2xl border p-4 ${style.wrapper}`}>
          <div className="flex items-start gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.icon}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <span className={`block text-[10px] font-extrabold uppercase tracking-wider ${style.label}`}>
                {block.label}
              </span>
              <p className="mt-0.5 text-xs leading-6">{block.text}</p>
            </div>
          </div>
        </div>
      );
    }
    case 'table':
      return (
        <div key={index} className="overflow-x-auto rounded-xl border border-[#E5DDD5]">
          <table className="w-full border-collapse text-left text-xs">
            {block.headers.length > 0 && (
              <thead className="bg-[#FAF7F2] text-[10px] uppercase tracking-wider text-[#8C6D37]">
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th key={headerIndex} className="border-b border-[#E5DDD5] px-3.5 py-2.5 font-bold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-[#F0EAE1] text-stone-700">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FCFAF7]'}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3.5 py-2.5 leading-relaxed">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export const TrainingDocumentView: React.FC<TrainingDocumentViewProps> = ({
  session,
  chapter,
  document: doc,
  lastAttempt,
  nextChapter,
  onBack,
  onStartChapter,
  onSubmitQuiz,
  onNavigateChapter,
}) => {
  const [quizOpen, setQuizOpen] = useState(false);
  const isCompleted = chapter.status === 'completed';
  const isLocked = chapter.status === 'locked';
  const isReference = Boolean(chapter.isResource);

  useEffect(() => {
    onStartChapter(chapter.id);
  }, [chapter.id, onStartChapter]);

  useEffect(() => {
    setQuizOpen(false);
  }, [chapter.id]);

  const sectionAnchors = useMemo(
    () =>
      doc?.sections.map((section, index) => ({
        id: `chapter-${chapter.chapterNumber}-section-${index}`,
        heading: section.heading,
      })) ?? [],
    [doc, chapter.chapterNumber],
  );

  const handleQuizSubmit = (answers: Record<string, string>) => onSubmitQuiz(chapter.id, answers);

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#DDD3C9] bg-white px-3.5 py-1.5 text-xs font-bold text-[#2B1810] shadow-2xs transition hover:bg-[#FAF7F2] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#8C6D37]" />
          Back to Training Library
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#EBDCB9] bg-[#FBF7EE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
            <FileText className="h-3.5 w-3.5" />
            Training Document &bull; Handbook v2.0
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold ${
              isCompleted
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : isLocked
                  ? 'border-slate-200 bg-slate-50 text-slate-500'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : isLocked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <BookOpen className="h-3.5 w-3.5" />
            )}
            {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'In progress'}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E5DDD5] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#EBDCB9] bg-[#FBF7EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                <Layers className="h-3.5 w-3.5" />
                Session {session?.sessionNumber ?? '—'} &bull; {session?.title ?? 'Induction'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500">
                <Clock className="h-3.5 w-3.5 text-[#8C6D37]" />
                {chapter.estimatedDuration}
              </span>
              {doc?.quiz && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500">
                  <ClipboardCheck className="h-3.5 w-3.5 text-[#8C6D37]" />
                  {doc.quiz.questions.length}-question MCQ
                </span>
              )}
              {isReference && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  <ShieldCheck className="h-3 w-3" />
                  Trainer reference
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#2B1810] sm:text-3xl">
              Chapter {chapter.chapterNumber} &mdash; {chapter.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {doc?.summary || chapter.description}
            </p>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-[#EFE7DE] bg-[#FAF7F2] p-4 lg:w-64">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
              <span>Chapter progress</span>
              <span>{isCompleted ? 100 : chapter.progressPercentage}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E8DFD8]">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-600' : 'bg-[#D4AF37]'
                }`}
                style={{ width: `${isCompleted ? 100 : chapter.progressPercentage}%` }}
              />
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] text-stone-600">
              <p className="flex items-center justify-between gap-2">
                <span>Status</span>
                <span className="font-bold text-[#2B1810]">
                  {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'In progress'}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span>Best score</span>
                <span className="font-bold text-[#2B1810]">
                  {typeof chapter.bestScore === 'number' ? `${chapter.bestScore}%` : '—'}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span>Last attempt</span>
                <span className="font-bold text-[#2B1810]">
                  {lastAttempt ? `${lastAttempt.score}%` : 'Not attempted'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-xs font-bold">This chapter is locked</p>
            <p className="mt-0.5 text-[11px]">
              Complete the earlier core chapters to unlock this milestone. Reference documents are
              released by HR as part of the trainer pack.
            </p>
          </div>
        </div>
      )}

      {quizOpen && doc?.quiz ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <ChapterQuiz
            chapterNumber={chapter.chapterNumber}
            chapterTitle={chapter.title}
            quiz={doc.quiz}
            onSubmit={handleQuizSubmit}
            onReviewDocument={() => setQuizOpen(false)}
            onNextChapter={nextChapter ? () => onNavigateChapter(nextChapter) : undefined}
          />

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[#E5DDD5] bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                <GraduationCap className="h-3.5 w-3.5" />
                Assessment rules
              </div>
              <ul className="mt-2.5 space-y-2 text-[11px] text-stone-600">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Answer all {doc.quiz.questions.length} questions before submitting.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Score at least {doc.quiz.passingScore}/{doc.quiz.questions.length} to complete the
                  chapter.
                </li>
                <li className="flex gap-2">
                  <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8C6D37]" />
                  You can retake the assessment as many times as you need.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#E5DDD5] bg-white p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                Chapter outline
              </div>
              <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
                {sectionAnchors.map((anchor) => (
                  <button
                    key={anchor.id}
                    type="button"
                    onClick={() => {
                      setQuizOpen(false);
                      window.setTimeout(() => {
                        window.document.getElementById(anchor.id)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 50);
                    }}
                    className="flex w-full items-start gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-stone-600 transition hover:bg-[#FAF7F2] hover:text-[#2B1810] cursor-pointer"
                  >
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[#D4AF37]" />
                    <span>{anchor.heading}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="rounded-3xl border border-[#E5DDD5] bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] px-6 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#8C6D37]" />
                <span className="text-xs font-bold text-[#2B1810]">Training Document</span>
              </div>
              <span className="text-[10px] font-semibold text-stone-400">
                {doc?.sections.length ?? 0} sections
              </span>
            </div>

            <div className="space-y-7 px-6 py-6 sm:px-8">
              {doc ? (
                doc.sections.map((section, sectionIndex) => (
                  <section
                    key={`${section.heading}-${sectionIndex}`}
                    id={`chapter-${chapter.chapterNumber}-section-${sectionIndex}`}
                    className="scroll-mt-28"
                  >
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#2B1810]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FBF7EE] text-[10px] font-extrabold text-[#8C6D37] border border-[#EBDCB9]">
                        {sectionIndex + 1}
                      </span>
                      {section.heading}
                    </h2>
                    <div className="space-y-2.5">
                      {section.blocks.map((block, blockIndex) => renderBlock(block, blockIndex))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#DDD3C9] bg-[#FAF7F2] p-6 text-center">
                  <FileText className="mx-auto h-6 w-6 text-[#8C6D37]" />
                  <p className="mt-2 text-sm font-bold text-[#2B1810]">Document coming soon</p>
                  <p className="mt-1 text-xs text-stone-500">
                    The training document for this chapter has not been imported yet.
                  </p>
                </div>
              )}

              {doc && doc.takeaways.length > 0 && (
                <div className="rounded-2xl border border-[#EBDCB9] bg-[#FBF7EE] p-4">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-[#8C6D37]">
                    <Award className="h-3.5 w-3.5" />
                    Key takeaways
                  </div>
                  <ul className="mt-2.5 space-y-2">
                    {doc.takeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs leading-5 text-[#2B1810]">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {doc?.quiz && !isReference && (
                <div className="rounded-2xl border border-[#E5DDD5] bg-white p-5 shadow-xs">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBF7EE] text-[#8C6D37] border border-[#EBDCB9]">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2B1810]">
                          {isCompleted ? 'Assessment completed' : 'Finish this chapter with an MCQ'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-stone-500">
                          {isCompleted
                            ? `You scored ${chapter.bestScore ?? lastAttempt?.score ?? 100}%. Retake the assessment any time to improve your score.`
                            : `Answer ${doc.quiz.questions.length} questions. Pass mark: ${doc.quiz.passingScore}/${doc.quiz.questions.length}. Completing it updates your dashboard instantly.`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        setQuizOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                        isLocked
                          ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                          : 'bg-[#D4AF37] text-[#1A120B] hover:bg-[#C29D29] cursor-pointer shadow-xs'
                      }`}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      {isCompleted ? 'Retake MCQ' : 'Complete chapter & start MCQ'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {isReference && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Reference document.</span> This chapter
                  supports trainers and HR administrators. It does not affect the employee induction
                  completion percentage.
                </div>
              )}
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {doc?.quiz && (
              <div className="rounded-2xl border border-[#E5DDD5] bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Chapter assessment
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isCompleted ? 'Passed' : 'Pending'}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-[11px] text-stone-600">
                  <p className="flex items-center justify-between">
                    <span>Questions</span>
                    <span className="font-bold text-[#2B1810]">{doc.quiz.questions.length}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Pass mark</span>
                    <span className="font-bold text-[#2B1810]">
                      {doc.quiz.passingScore}/{doc.quiz.questions.length}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Best score</span>
                    <span className="font-bold text-[#2B1810]">
                      {typeof chapter.bestScore === 'number' ? `${chapter.bestScore}%` : '—'}
                    </span>
                  </p>
                  {lastAttempt && (
                    <p className="flex items-center justify-between">
                      <span>Last attempt</span>
                      <span className="font-bold text-[#2B1810]">{lastAttempt.score}%</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    setQuizOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isLocked
                      ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                      : 'bg-[#2B1810] text-[#FAF7F2] hover:bg-[#3D2217] cursor-pointer'
                  }`}
                >
                  {isCompleted ? <RotateCcw className="h-3.5 w-3.5" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
                  {isCompleted ? 'Retake assessment' : 'Start assessment'}
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-[#E5DDD5] bg-white p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                In this document
              </div>
              <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
                {sectionAnchors.map((anchor) => (
                  <a
                    key={anchor.id}
                    href={`#${anchor.id}`}
                    className="flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-[#FAF7F2] hover:text-[#2B1810]"
                  >
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[#D4AF37]" />
                    <span>{anchor.heading}</span>
                  </a>
                ))}
              </div>
            </div>

            {nextChapter && (
              <div className="rounded-2xl border border-[#E5DDD5] bg-gradient-to-br from-[#2D1A10] to-[#1E110A] p-4 text-[#FAF7F2] shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  Up next
                </div>
                <p className="mt-1 text-xs font-bold leading-snug">
                  Chapter {nextChapter.chapterNumber} &mdash; {nextChapter.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-stone-400">
                  <Clock className="h-3 w-3 text-[#D4AF37]" />
                  {nextChapter.estimatedDuration}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateChapter(nextChapter)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-3 py-2 text-[11px] font-bold text-[#1A120B] transition hover:bg-[#C9A028] cursor-pointer"
                >
                  Open chapter
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
