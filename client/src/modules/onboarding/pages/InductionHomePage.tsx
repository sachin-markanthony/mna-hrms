import { Navigate } from 'react-router-dom';
import { useInductionLearning } from '../hooks/useInductionLearning';

/**
 * `/induction` is a reading-first experience. Send the employee straight to
 * the chapter they should work on next, so the sidebar and reader are always
 * the first thing they see.
 */
export function InductionHomePage() {
  const { summary } = useInductionLearning();
  const current = summary.currentChapter;

  if (current) {
    if (current.kind === 'final_assessment') {
      return <Navigate to="/induction/final-assessment" replace />;
    }
    return <Navigate to={`/induction/chapters/${current.chapterNumber}`} replace />;
  }

  if (summary.finalAssessment.completed) {
    return <Navigate to="/induction/chapters/21/result" replace />;
  }

  return <Navigate to="/induction/chapters/1" replace />;
}
