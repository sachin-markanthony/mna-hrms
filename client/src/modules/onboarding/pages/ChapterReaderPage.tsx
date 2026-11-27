import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  HelpCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
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
  getReadingLabel,
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
        message="Complete the previous chapter and pass its assessment to unlock this chapter. Your progress is saved automatically."
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
          <Link to="/induction/chapters" className={buttonStyles('primary', 'md')}>
            Back to learning chapters
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

  const scrollToSection = (index: number) => {
    window.document
      .getElementById(`chapter-${chapterNumber}-section-${index}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-20 -mx-4 -mt-6 border-b border-[#E9DED2] bg-[#FAF7F2]/95 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="mx-auto flex max-w-[1320px] items-center gap-3">
          <span className="shrink-0 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-[#8A7A6C]">
            Reading progress
          </span>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#EDE3D7]">
            <div
              className="h-full rounded-full bg-[#B8893A] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-[10px] font-extrabold text-[#3B2314]">
            {progress}%
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/induction/chapters"
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3.5 py-2 text-[10.5px] font-bold text-[#6E5B4C] shadow-sm transition hover:border-[#C9A46A] hover:text-[#3B2314]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#B8893A]" />
          Back to learning chapters
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EBDCC4] bg-[#FBF5EA] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8A6427]">
            <BookOpen className="h-3 w-3" />
            Handbook chapter
          </span>
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
        </div>
      </div>

      {error && (
        <ErrorState
          title="We could not update your reading progress"
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      <header className="relative overflow-hidden rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FBF5EA]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDCB9] bg-[#FBF5EA] px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-[#8A6427]">
                <Sparkles className="h-3 w-3" />
                Chapter {chapter.chapterNumber}
              </span>
              <span className="text-[9.5px] font-semibold text-[#A09182]">
                {chapter.moduleLabel}
              </span>
            </div>

            <h1 className="mt-2 font-serif text-2xl font-bold leading-tight tracking-tight text-[#3B2314] sm:text-3xl">
              {chapter.title}
            </h1>
            <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#7A6A5C]">
              {document.summary || chapter.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-[#8A7A6C]">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-[#B8893A]" />
                {formatMinutes(chapter.estimatedMinutes)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#B8893A]" />
                {getReadingLabel(chapter.readingStatus)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5 text-[#B8893A]" />
                {getAssessmentLabel(chapter)}
              </span>
              {assessment && (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#4F7F61]" />
                  {assessment.questions.length} questions · {INDUCTION_CONFIG.passingPercentage}% to pass
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {previousChapter && (
              <Link
                to={`/induction/chapters/${previousChapter.chapterNumber}`}
                className={buttonStyles('secondary', 'sm')}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </Link>
            )}
            {nextChapter && (
              nextChapter.isUnlocked ? (
                <Link
                  to={`/induction/chapters/${nextChapter.chapterNumber}`}
                  className={buttonStyles('secondary', 'sm')}
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E0D8] bg-[#F7F4F0] px-3 py-2 text-[10.5px] font-bold text-[#A09182]">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Next locked
                </span>
              )
            )}
          </div>
        </div>
      </header>

      {isCompleted && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#CFE3D6] bg-[#F3F8F4] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4F7F61] text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold text-[#264A34]">
                Chapter completed{chapter.bestScore ? ` · Best score ${chapter.bestScore}%` : ''}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-5 text-[#4F6B58]">
                You can revisit the content at any time. Your completion and assessment history
                will not be reset.
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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <ChapterContent
            chapterNumber={chapterNumber}
            sections={document.sections}
            takeaways={document.takeaways}
            endRef={endRef}
          />

          <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
            {isCompleted ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#4F7F61]">
                    Chapter completed
                  </p>
                  <h3 className="mt-1 text-base font-extrabold text-[#3B2314]">
                    You have already passed this assessment
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-[#8A7A6C]">
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
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#4F7C8A]">
                    Reading complete
                  </p>
                  <h3 className="mt-1 text-base font-extrabold text-[#3B2314]">
                    Your chapter assessment is ready
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-[#8A7A6C]">
                    {chapter.status === 'assessment_failed'
                      ? 'Take another look at the chapter, then retry when you feel ready.'
                      : 'Answer the handbook questions when you are ready. You can retake the assessment if needed.'}
                  </p>
                </div>
                <Link
                  to={`/induction/chapters/${chapterNumber}/assessment`}
                  className={buttonStyles('primary', 'lg', 'w-full sm:w-auto')}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {chapter.status === 'assessment_failed' ? 'Retry Assessment' : 'Take Assessment'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                      Finished reading?
                    </p>
                    <h3 className="mt-1 text-base font-extrabold text-[#3B2314]">
                      Continue to the chapter assessment
                    </h3>
                    <p className="mt-1 max-w-xl text-[11px] leading-5 text-[#8A7A6C]">
                      Scroll to the end of the chapter to unlock this action. Your reading
                      completion is saved automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkRead}
                    disabled={!hasReachedEnd || !assessment}
                    className={buttonStyles(
                      'primary',
                      'lg',
                      'w-full shrink-0 sm:w-auto',
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    I&apos;ve Read This Chapter — Continue to Assessment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {!hasReachedEnd && (
                  <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#A09182]">
                    <ChevronRight className="h-3 w-3" />
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
        </div>

        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <section className="rounded-2xl border border-[#E9DED2] bg-white p-4 shadow-[0_8px_24px_rgba(59,35,20,0.04)]">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <FileText className="h-3 w-3" />
              In this chapter
            </div>
            <div className="mt-2.5 max-h-72 space-y-1 overflow-y-auto pr-1">
              {document.sections.map((section, index) => (
                <button
                  key={`${section.heading}-${index}`}
                  type="button"
                  onClick={() => scrollToSection(index)}
                  className="flex w-full items-start gap-1.5 rounded-lg px-2 py-1.5 text-left text-[10.5px] font-semibold text-[#7A6A5C] transition hover:bg-[#FBF5EA] hover:text-[#3B2314]"
                >
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[#B8893A]" />
                  <span>{section.heading}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E9DED2] bg-white p-4 shadow-[0_8px_24px_rgba(59,35,20,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                <ClipboardCheck className="h-3 w-3" />
                Assessment status
              </div>
              <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
            </div>
            <dl className="mt-3 space-y-2 text-[10.5px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[#8A7A6C]">Reading</dt>
                <dd className="font-bold text-[#3B2314]">
                  {getReadingLabel(chapter.readingStatus)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[#8A7A6C]">Attempts</dt>
                <dd className="font-bold text-[#3B2314]">{chapter.attempts.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[#8A7A6C]">Best score</dt>
                <dd className="font-bold text-[#3B2314]">
                  {typeof chapter.bestScore === 'number' ? `${chapter.bestScore}%` : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[#8A7A6C]">Pass mark</dt>
                <dd className="font-bold text-[#3B2314]">
                  {assessment
                    ? `${Math.ceil((assessment.questions.length * INDUCTION_CONFIG.passingPercentage) / 100)} of ${assessment.questions.length}`
                    : `${INDUCTION_CONFIG.passingPercentage}%`}
                </dd>
              </div>
            </dl>

            {isReadyForAssessment && !isCompleted && (
              <Link
                to={`/induction/chapters/${chapterNumber}/assessment`}
                className={buttonStyles('primary', 'sm', 'mt-3 w-full')}
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                {chapter.status === 'assessment_failed' ? 'Retry assessment' : 'Start assessment'}
              </Link>
            )}
          </section>

          <section className="rounded-2xl border border-[#E9DED2] bg-[#FFFCF7] p-4">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <HelpCircle className="h-3 w-3" />
              Need help?
            </div>
            <p className="mt-2 text-[10.5px] leading-5 text-[#8A7A6C]">
              If something in this chapter is unclear, your learning team can help.
            </p>
            <Link
              to="/induction/support"
              className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-[#8A6427] underline decoration-[#D9BE92] underline-offset-4"
            >
              Contact learning support
              <ChevronRight className="h-3 w-3" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
