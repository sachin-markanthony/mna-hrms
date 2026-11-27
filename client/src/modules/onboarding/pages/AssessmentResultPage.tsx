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
      />
    );
  }

  if (chapter.kind === 'reference') {
    return (
      <AccessDenied
        title="No assessment result"
        message="Chapter 20 is a reference resource and does not have an assessment."
        backTo="/induction/reference"
        backLabel="Open reference library"
      />
    );
  }

  if (chapter.status === 'locked') {
    return (
      <AccessDenied
        title={`Chapter ${chapter.chapterNumber} is locked`}
        message="Complete the previous chapter and pass its assessment to view this result."
      />
    );
  }

  if (!chapter.latestAttempt) {
    return (
      <EmptyState
        icon={FileText}
        title="No assessment attempt yet"
        description="Once you submit the chapter assessment, your score and attempt history will appear here."
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
    if (!nextChapter) {
      navigate('/induction/progress');
      return;
    }
    if (nextChapter.kind === 'final_assessment') {
      navigate('/induction/final-assessment');
      return;
    }
    navigate(`/induction/chapters/${nextChapter.chapterNumber}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={isFinal ? '/induction/final-assessment' : `/induction/chapters/${chapterNumber}`}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3.5 py-2 text-[10.5px] font-bold text-[#6E5B4C] shadow-sm transition hover:border-[#C9A46A] hover:text-[#3B2314]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#B8893A]" />
          {isFinal ? 'Back to final assessment' : 'Back to chapter'}
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EBDCC4] bg-[#FBF5EA] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8A6427]">
          <ClipboardCheck className="h-3 w-3" />
          {isFinal ? 'Grand Final Quiz result' : `Chapter ${chapter.chapterNumber} result`}
        </span>
      </div>

      <AssessmentResult
        attempt={chapter.latestAttempt}
        chapter={chapter}
        assessment={assessment}
        attempts={chapter.attempts}
        nextChapter={nextChapter}
        onRetry={() => navigate(`/induction/chapters/${chapterNumber}/assessment`)}
        onReview={() =>
          navigate(
            isFinal ? '/induction/final-assessment' : `/induction/chapters/${chapterNumber}`,
          )
        }
        onContinue={goToNext}
        onViewProgress={() => navigate('/induction/progress')}
      />
    </div>
  );
}
