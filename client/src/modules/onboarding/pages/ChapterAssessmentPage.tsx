import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, FileText } from 'lucide-react';
import { useChapterLearning } from '../hooks/useInductionLearning';
import { AssessmentRunner } from '../components/assessment/AssessmentRunner';
import { AccessDenied, EmptyState } from '../components/common/States';
import { buttonStyles } from '../components/ui/Button';

export function ChapterAssessmentPage() {
  const params = useParams<{ chapterNumber: string }>();
  const chapterNumber = Number(params.chapterNumber);
  const navigate = useNavigate();
  const { chapter, assessment, submitAssessment } = useChapterLearning(chapterNumber);

  useEffect(() => {
    document.getElementById('induction-scroll')?.scrollTo({ top: 0, behavior: 'auto' });
  }, [chapterNumber]);

  if (!Number.isFinite(chapterNumber) || !chapter) {
    return (
      <AccessDenied
        title="Assessment not found"
        message="This assessment is not part of the employee induction programme."
        backTo="/induction"
        backLabel="Back to induction"
      />
    );
  }

  if (chapter.kind === 'reference') {
    return (
      <AccessDenied
        title="Reference resources do not have assessments"
        message="Open the reference notes to read this resource."
        backTo="/induction/reference"
        backLabel="Open reference notes"
      />
    );
  }

  if (chapter.status === 'locked') {
    return (
      <AccessDenied
        title={`Chapter ${chapter.chapterNumber} is locked`}
        message="Pass the previous chapter assessment before starting this assessment."
        backTo="/induction"
        backLabel="Back to my current chapter"
      />
    );
  }

  if (chapter.kind === 'learning' && chapter.readingStatus !== 'read') {
    return (
      <AccessDenied
        title="Read the chapter first"
        message="The assessment opens after you have read the chapter and marked it as complete. Your reading progress is saved automatically."
        backTo={`/induction/chapters/${chapterNumber}`}
        backLabel="Go to the chapter"
      />
    );
  }

  if (!assessment) {
    return (
      <EmptyState
        icon={FileText}
        title="Assessment content requires configuration"
        description="The handbook does not currently provide questions for this assessment. The learning team must configure it before it can be attempted."
        action={
          <Link
            to={`/induction/chapters/${chapterNumber}`}
            className={buttonStyles('primary', 'md')}
          >
            Back to the chapter
          </Link>
        }
      />
    );
  }

  const isFinal = chapter.kind === 'final_assessment';

  return (
    <div>
      <div className="mx-auto mb-4 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={isFinal ? '/induction/final-assessment' : `/induction/chapters/${chapterNumber}`}
          className={buttonStyles('secondary', 'sm', 'w-fit')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isFinal ? 'Back to final assessment' : 'Back to chapter'}
        </Link>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <ClipboardCheck className="h-3 w-3 text-amber-500" />
          {isFinal ? 'Grand Final Quiz' : `Chapter ${chapter.chapterNumber} assessment`}
        </span>
      </div>

      <AssessmentRunner
        chapterNumber={chapterNumber}
        chapterTitle={chapter.title}
        assessment={assessment}
        attemptCount={chapter.attempts.length}
        isFinal={isFinal}
        onSubmit={async (answers) => {
          await submitAssessment(chapterNumber, answers);
          navigate(`/induction/chapters/${chapterNumber}/result`, { replace: true });
        }}
        onReviewChapter={() =>
          navigate(
            isFinal ? '/induction/final-assessment' : `/induction/chapters/${chapterNumber}`,
          )
        }
      />
    </div>
  );
}
