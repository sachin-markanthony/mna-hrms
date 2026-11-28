import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useChapterLearning } from '../hooks/useInductionLearning';
import { useReadingProgress } from '../hooks/useReadingProgress';
import {
  getNextLearningChapter,
  getPreviousLearningChapter,
} from '../data/chapterCatalog';
import {
  formatMinutes,
  getAssessmentLabel,
  getChapterStatusMeta,
} from '../utils/chapterStatus';
import { AccessDenied, EmptyState, ErrorState } from '../components/common/States';
import { ChapterContent } from '../components/reader/ChapterContent';
import { StatusPill } from '../components/ui/StatusPill';
import { buttonStyles } from '../components/ui/Button';
import { INDUCTION_CONFIG } from '../config/induction.config';

export function ChapterReaderPage() {
  const params = useParams<{ chapterNumber: string }>();
  const chapterNumber = Number(params.chapterNumber);
  const navigate = useNavigate();
  const {
    chapter,
    document,
    assessment,
    startReading,
    markReadingComplete,
    learningChapters,
    finalAssessment,
  } = useChapterLearning(chapterNumber);
  const { progress, hasReachedEnd, endRef } = useReadingProgress(chapterNumber);
  const [error, setError] = useState<string | null>(null);
  const startedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!chapter || chapter.kind !== 'learning' || !chapter.isUnlocked) return;
    if (startedFor.current === chapterNumber) return;
    startedFor.current = chapterNumber;
    try {
      startReading(chapterNumber);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : 'This chapter could not be opened.',
      );
    }
  }, [chapter, chapterNumber, startReading]);

  if (!Number.isFinite(chapterNumber) || !chapter) {
    return (
      <AccessDenied
        title="Chapter not found"
        message="This chapter is not part of the employee induction programme."
        backTo="/induction"
        backLabel="Back to induction"
      />
    );
  }

  if (chapter.kind === 'reference') {
    return <Navigate to="/induction/reference" replace />;
  }

  if (chapter.kind === 'final_assessment') {
    return <Navigate to="/induction/final-assessment" replace />;
  }

  if (chapter.status === 'locked') {
    return (
      <AccessDenied
        title={`Chapter ${chapter.chapterNumber} is locked`}
        message="Pass the previous chapter assessment to unlock this chapter. Your progress is saved automatically."
        backTo="/induction"
        backLabel="Back to my current chapter"
      />
    );
  }

  if (!document) {
    return (
      <EmptyState
        icon={FileText}
        title="Chapter content is being prepared"
        description="The handbook content for this chapter has not been imported yet. Please contact the learning team if you need it urgently."
        action={
          <Link to="/induction" className={buttonStyles('primary', 'md')}>
            Back to induction
          </Link>
        }
      />
    );
  }

  const meta = getChapterStatusMeta(chapter);
  const isCompleted = chapter.status === 'completed';
  const isReadyForAssessment =
    chapter.readingStatus === 'read' ||
    chapter.status === 'reading_completed' ||
    chapter.status === 'assessment_failed' ||
    isCompleted;

  const previousEntry = getPreviousLearningChapter(chapterNumber);
  const nextEntry = getNextLearningChapter(chapterNumber);
  const previousChapter = previousEntry
    ? learningChapters.find((item) => item.chapterNumber === previousEntry.chapterNumber) ?? null
    : null;
  const nextChapter = nextEntry
    ? learningChapters.find((item) => item.chapterNumber === nextEntry.chapterNumber) ?? null
    : null;
  const nextIsFinal = !nextChapter && chapterNumber === 18 && finalAssessment.isUnlocked;

  const handleMarkRead = () => {
    if (!hasReachedEnd) return;
    try {
      markReadingComplete(chapterNumber);
      navigate(`/induction/chapters/${chapterNumber}/assessment`);
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : 'Your reading progress could not be saved.',
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Reading progress */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200/70 bg-slate-50/95 px-4 py-2 backdrop-blur-md dark:border-slate-800/70 dark:bg-[#091020]/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            Reading
          </span>
          <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-amber-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
            {progress}%
          </span>
        </div>
      </div>

      {/* Chapter heading */}
      <header className="pt-6 sm:pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#1e3a8a] dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300">
            <BookOpen className="h-3 w-3" />
            Chapter {chapter.chapterNumber}
          </span>
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {chapter.moduleLabel}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {chapter.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-500 dark:text-slate-400">
          {document.summary || chapter.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-amber-500" />
            {formatMinutes(chapter.estimatedMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-amber-500" />
            {document.sections.length} sections
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            {INDUCTION_CONFIG.passingPercentage}% to pass
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5 text-amber-500" />
            {getAssessmentLabel(chapter)}
          </span>
        </div>
      </header>

      {error && (
        <div className="mt-5">
          <ErrorState
            title="We could not update your reading progress"
            message={error}
            onRetry={() => setError(null)}
          />
        </div>
      )}

      {isCompleted && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11.5px] font-bold text-emerald-900 dark:text-emerald-300">
                Chapter completed
                {chapter.bestScore ? ` · Best score ${chapter.bestScore}%` : ''}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-5 text-emerald-700 dark:text-emerald-400">
                Revisit the content whenever you like. Your completion stays saved.
              </p>
            </div>
          </div>
          <Link
            to={`/induction/chapters/${chapterNumber}/result`}
            className={buttonStyles('secondary', 'sm', 'shrink-0')}
          >
            View result
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Handbook content */}
      <div className="mt-5">
        <ChapterContent
          chapterNumber={chapterNumber}
          sections={document.sections}
          takeaways={document.takeaways}
          endRef={endRef}
        />
      </div>

      {/* Assessment hand-off */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a] sm:p-6">
        {isCompleted ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                Chapter completed
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                You have already passed this assessment
              </h2>
              <p className="mt-1 text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
                Review the chapter or retake the assessment to improve your score.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/induction/chapters/${chapterNumber}/result`}
                className={buttonStyles('secondary', 'md')}
              >
                View result
              </Link>
              <Link
                to={`/induction/chapters/${chapterNumber}/assessment`}
                className={buttonStyles('primary', 'md')}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake assessment
              </Link>
            </div>
          </div>
        ) : isReadyForAssessment ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#1e3a8a] dark:text-blue-400">
                Reading complete
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                Your chapter assessment is ready
              </h2>
              <p className="mt-1 max-w-xl text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
                {chapter.status === 'assessment_failed'
                  ? 'Take another look at the chapter, then retry when you feel ready.'
                  : `Answer the questions and score ${INDUCTION_CONFIG.passingPercentage}% or more to unlock the next chapter.`}
              </p>
            </div>
            <Link
              to={`/induction/chapters/${chapterNumber}/assessment`}
              className={buttonStyles('primary', 'lg', 'w-full shrink-0 sm:w-auto')}
            >
              <ClipboardCheck className="h-4 w-4" />
              {chapter.status === 'assessment_failed' ? 'Retry assessment' : 'Take assessment'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
                  Finished reading?
                </p>
                <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  Continue to the chapter assessment
                </h2>
                <p className="mt-1 max-w-xl text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
                  Scroll to the end of the chapter to unlock this step. Your reading progress is
                  saved automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={handleMarkRead}
                disabled={!hasReachedEnd || !assessment}
                className={buttonStyles('primary', 'lg', 'w-full shrink-0 sm:w-auto')}
              >
                <CheckCircle2 className="h-4 w-4" />
                I&apos;ve read this chapter
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {!hasReachedEnd && (
              <p className="mt-3 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Keep scrolling to reach the end of the chapter.
              </p>
            )}
            {!assessment && (
              <div className="mt-3">
                <ErrorState
                  title="Assessment content requires configuration"
                  message="The handbook does not currently provide an assessment for this chapter. Reading completion can still be recorded, but the assessment step must be configured before it can be attempted."
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Chapter navigation */}
      <nav className="mt-5 flex items-center justify-between gap-3 pb-2">
        {previousChapter ? (
          <Link
            to={`/induction/chapters/${previousChapter.chapterNumber}`}
            className={buttonStyles('secondary', 'sm')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </Link>
        ) : (
          <span />
        )}

        {nextChapter ? (
          nextChapter.isUnlocked ? (
            <Link
              to={`/induction/chapters/${nextChapter.chapterNumber}`}
              className={buttonStyles('secondary', 'sm')}
            >
              Next chapter
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10.5px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5" />
              Next chapter locked
            </span>
          )
        ) : nextIsFinal ? (
          <Link to="/induction/final-assessment" className={buttonStyles('secondary', 'sm')}>
            Final assessment
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
