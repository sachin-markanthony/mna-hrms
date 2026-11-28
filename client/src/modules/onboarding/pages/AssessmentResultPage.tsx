import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, FileText } from 'lucide-react';
import { useChapterLearning } from '../hooks/useInductionLearning';
import { getNextLearningChapter } from '../data/chapterCatalog';
import { AssessmentResult } from '../components/assessment/AssessmentResult';
import { AccessDenied, EmptyState } from '../components/common/States';
import { buttonStyles } from '../components/ui/Button';

export function AssessmentResultPage() {
  const params = useParams<{ chapterNumber: string }>();
  const chapterNumber = Number(params.chapterNumber);
  const navigate = useNavigate();
  const { chapter, assessment, learningChapters, finalAssessment } =
    useChapterLearning(chapterNumber);

  if (!Number.isFinite(chapterNumber) || !chapter) {
    return (
      <AccessDenied
        title="Result not found"
        message="This assessment result is not part of the employee induction programme."
        backTo="/induction"
        backLabel="Back to induction"
      />
    );
  }

  if (chapter.kind === 'reference') {
    return (
      <AccessDenied
        title="No assessment result"
        message="This reference resource does not have an assessment."
        backTo="/induction/reference"
        backLabel="Open reference notes"
      />
    );
  }

  if (chapter.status === 'locked') {
    return (
      <AccessDenied
        title={`Chapter ${chapter.chapterNumber} is locked`}
        message="Pass the previous chapter assessment to view this result."
        backTo="/induction"
        backLabel="Back to my current chapter"
      />
    );
  }

  if (!chapter.latestAttempt) {
    return (
      <EmptyState
        icon={FileText}
        title="No assessment attempt yet"
        description="Once you submit the chapter assessment, your score and next step will appear here."
        action={
          <Link
            to={`/induction/chapters/${chapterNumber}/assessment`}
            className={buttonStyles('primary', 'md')}
          >
            <ClipboardCheck className="h-4 w-4" />
            Go to assessment
          </Link>
        }
      />
    );
  }

  const isFinal = chapter.kind === 'final_assessment';
  const nextEntry = isFinal ? null : getNextLearningChapter(chapterNumber);
  const nextChapter = nextEntry
    ? learningChapters.find((item) => item.chapterNumber === nextEntry.chapterNumber) ?? null
    : !isFinal && chapterNumber === 18
      ? finalAssessment
      : null;

  const goToNext = () => {
    if (isFinal) {
      navigate('/dashboard');
      return;
    }
    if (!nextChapter) {
      navigate('/induction');
      return;
    }
    if (nextChapter.kind === 'final_assessment') {
      navigate('/induction/final-assessment');
      return;
    }
    navigate(`/induction/chapters/${nextChapter.chapterNumber}`);
  };

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
          {isFinal ? 'Final quiz result' : `Chapter ${chapter.chapterNumber} result`}
        </span>
      </div>

      <AssessmentResult
        attempt={chapter.latestAttempt}
        chapter={chapter}
        assessment={assessment}
        nextChapter={nextChapter}
        onRetry={() => navigate(`/induction/chapters/${chapterNumber}/assessment`)}
        onReview={() =>
          navigate(
            isFinal ? '/induction/final-assessment' : `/induction/chapters/${chapterNumber}`,
          )
        }
        onContinue={goToNext}
      />
    </div>
  );
}
