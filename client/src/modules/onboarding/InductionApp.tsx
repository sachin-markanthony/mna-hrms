import { Navigate, Route, Routes } from 'react-router-dom';
import { InductionLayout } from './components/layout/InductionLayout';
import { InductionHomePage } from './pages/InductionHomePage';
import { ChapterReaderPage } from './pages/ChapterReaderPage';
import { ChapterAssessmentPage } from './pages/ChapterAssessmentPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { FinalAssessmentPage } from './pages/FinalAssessmentPage';
import { ReferencePage } from './pages/ReferencePage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Employee induction experience.
 *
 * The journey is intentionally linear and reading-first:
 * - the sidebar lists every chapter and only unlocks the next one after a pass
 * - `/induction` opens the chapter the employee should work on next
 * - reading completion opens the chapter assessment
 */
export function InductionApp() {
  return (
    <Routes>
      <Route element={<InductionLayout />}>
        <Route index element={<InductionHomePage />} />
        <Route path="overview" element={<Navigate to="/induction" replace />} />
        <Route path="chapters" element={<Navigate to="/induction" replace />} />
        <Route path="chapters/:chapterNumber" element={<ChapterReaderPage />} />
        <Route path="chapters/:chapterNumber/assessment" element={<ChapterAssessmentPage />} />
        <Route path="chapters/:chapterNumber/result" element={<AssessmentResultPage />} />
        <Route path="final-assessment" element={<FinalAssessmentPage />} />
        <Route path="reference" element={<ReferencePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default InductionApp;
