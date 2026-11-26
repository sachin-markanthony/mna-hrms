import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { InductionChapter, InductionSession } from '../types/induction.types';
import type { TrainingSummary } from '../types/training.types';
import { getHandbookDocument, HANDBOOK_SOURCE } from '../data/trainingDocuments';

interface TrainingDocumentLibraryProps {
  chapters: InductionChapter[];
  sessions: InductionSession[];
  summary: TrainingSummary;
  onSelectChapter: (chapter: InductionChapter) => void;
  onResetProgress?: () => void;
}

const STATUS_STYLES: Record<
  InductionChapter['status'],
  { label: string; className: string }
> = {
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  not_started: { label: 'Not started', className: 'bg-slate-50 text-slate-600 border-slate-200' },
  locked: { label: 'Locked', className: 'bg-stone-100 text-stone-500 border-stone-200' },
};

export const TrainingDocumentLibrary: React.FC<TrainingDocumentLibraryProps> = ({
  chapters,
  sessions,
  summary,
  onSelectChapter,
  onResetProgress,
}) => {
  const groups = sessions
    .map((session) => ({
      session,
      chapters: chapters.filter((chapter) => chapter.sessionId === session.id),
    }))
    .filter((group) => group.chapters.length > 0);

  const referenceChapters = chapters.filter(
    (chapter) => !sessions.some((session) => session.id === chapter.sessionId),
  );

  const renderChapterCard = (chapter: InductionChapter) => {
    const document = getHandbookDocument(chapter.chapterNumber);
    const status = STATUS_STYLES[chapter.status];
    const isLocked = chapter.status === 'locked';

    return (
      <button
        key={chapter.id}
        type="button"
        disabled={isLocked}
        onClick={() => onSelectChapter(chapter)}
        className={`group flex h-full flex-col rounded-2xl border bg-white p-4 text-left shadow-xs transition ${
          isLocked
            ? 'cursor-not-allowed border-slate-200 opacity-70'
            : 'cursor-pointer border-[#E5DDD5] hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#EBDCB9] bg-[#FBF7EE] text-xs font-extrabold text-[#8C6D37]">
            {String(chapter.chapterNumber).padStart(2, '0')}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${status.className}`}>
            {chapter.status === 'completed' ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : chapter.status === 'locked' ? (
              <Lock className="h-2.5 w-2.5" />
            ) : (
              <BookOpen className="h-2.5 w-2.5" />
            )}
            {status.label}
          </span>
        </div>

        <h4 className="mt-3 text-xs font-bold leading-snug text-[#2B1810] group-hover:text-[#8C6D37]">
          {chapter.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-stone-500">
          {document?.summary || chapter.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[10px] font-semibold text-stone-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#8C6D37]" />
            {chapter.estimatedDuration}
          </span>
          {document?.quiz ? (
            <span className="inline-flex items-center gap-1">
              <ClipboardCheck className="h-3 w-3 text-[#8C6D37]" />
              {document.quiz.questions.length} MCQ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3 text-[#8C6D37]" />
              Reference
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#F0EAE1] pt-2.5">
          <span className="text-[10px] font-bold text-[#8C6D37]">
            {chapter.status === 'completed'
              ? `Best score ${chapter.bestScore ?? 100}%`
              : chapter.status === 'in_progress'
                ? `${chapter.progressPercentage}% read`
                : 'Open document'}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2B1810]">
            {isLocked ? 'Locked' : chapter.status === 'completed' ? 'Review' : 'Read'}
            {!isLocked && <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-[#E5DDD5] bg-white shadow-xs">
        <div className="bg-gradient-to-br from-[#2D1A10] via-[#24150D] to-[#1E110A] px-6 py-7 text-[#FAF7F2] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#422616] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E6C687]">
                <FileText className="h-3.5 w-3.5" />
                Official Training Document
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {HANDBOOK_SOURCE.title}
              </h2>
              <p className="mt-2 text-xs leading-6 text-stone-300">
                The complete MA Ventures induction handbook. Read each chapter as a training
                document, then pass its multiple-choice assessment to mark it complete. Your
                progress updates on the main dashboard automatically.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-stone-300">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {summary.totalDocuments} chapters
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClipboardCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {summary.totalQuestions} MCQ questions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {HANDBOOK_SOURCE.suggestedDuration} suggested
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                  Version {HANDBOOK_SOURCE.version}
                </span>
              </div>
            </div>

            <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:w-64">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-300">
                <span>Handbook completion</span>
                <span className="text-[#E6C687]">{summary.overallPercentage}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-2.5 rounded-full bg-[#D4AF37] transition-all duration-700"
                  style={{ width: `${summary.overallPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-stone-300">
                {summary.completedChapters} of {summary.totalChapters} core chapters completed
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/5 p-2.5">
                  <span className="block text-[9px] uppercase tracking-wider text-stone-400">Average</span>
                  <span className="text-sm font-bold text-white">{summary.averageScore}%</span>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5">
                  <span className="block text-[9px] uppercase tracking-wider text-stone-400">Pending</span>
                  <span className="text-sm font-bold text-white">{summary.pendingAssessments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {summary.nextChapter && (
          <div className="flex flex-col gap-3 border-t border-[#EFE7DE] bg-[#FAF7F2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#8C6D37] border border-[#EBDCB9]">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                  Continue where you left off
                </span>
                <p className="text-xs font-bold text-[#2B1810]">
                  Chapter {summary.nextChapter.chapterNumber} &mdash; {summary.nextChapter.title}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectChapter(summary.nextChapter as InductionChapter)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-bold text-[#1A120B] transition hover:bg-[#C29D29] cursor-pointer"
            >
              Resume chapter
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {groups.map(({ session, chapters: sessionChapters }) => (
        <section key={session.id} className="space-y-3">
          <div className="flex flex-col gap-2 border-b border-[#EAE2D8] pb-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
                Session {session.sessionNumber}
              </span>
              <h3 className="text-base font-bold text-[#2B1810]">{session.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-stone-500">
              <span>{sessionChapters.length} chapters</span>
              <span className="text-stone-300">&bull;</span>
              <span>{session.progressPercentage}% complete</span>
              <span
                className={`rounded-full border px-2 py-0.5 font-bold ${
                  session.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : session.status === 'locked'
                      ? 'border-stone-200 bg-stone-100 text-stone-500'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {session.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sessionChapters.map(renderChapterCard)}
          </div>
        </section>
      ))}

      {referenceChapters.length > 0 && (
        <section className="space-y-3">
          <div className="border-b border-[#EAE2D8] pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
              Reference &amp; Trainer Pack
            </span>
            <h3 className="text-base font-bold text-[#2B1810]">HR and trainer reference documents</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {referenceChapters.map(renderChapterCard)}
          </div>
        </section>
      )}

      {onResetProgress && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onResetProgress}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-stone-400 transition hover:text-rose-600 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset demo progress
          </button>
        </div>
      )}
    </div>
  );
};
