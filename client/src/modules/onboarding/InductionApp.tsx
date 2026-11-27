import { Route, Routes } from 'react-router-dom';
import { InductionLayout } from './components/layout/InductionLayout';
import { InductionHomePage } from './pages/InductionHomePage';
import { ChapterRoadmapPage } from './pages/ChapterRoadmapPage';
import { ChapterReaderPage } from './pages/ChapterReaderPage';
import { ChapterAssessmentPage } from './pages/ChapterAssessmentPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { ProgressPage } from './pages/ProgressPage';
import { FinalAssessmentPage } from './pages/FinalAssessmentPage';
import { ReferencePage } from './pages/ReferencePage';
import { SupportPage } from './pages/SupportPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Employee induction experience.
 *
 * Route guard behaviour lives in each page and in the induction store:
 * - locked chapters render an access-denied state instead of content
 * - assessments require reading completion (except the final assessment)
 * - results require an existing attempt
 */
export function InductionApp() {
  return (
    <Routes>
      <Route element={<InductionLayout />}>
        <Route index element={<InductionHomePage />} />
        <Route path="overview" element={<InductionHomePage />} />
        <Route path="chapters" element={<ChapterRoadmapPage />} />
        <Route path="chapters/:chapterNumber" element={<ChapterReaderPage />} />
        <Route path="chapters/:chapterNumber/assessment" element={<ChapterAssessmentPage />} />
        <Route path="chapters/:chapterNumber/result" element={<AssessmentResultPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="final-assessment" element={<FinalAssessmentPage />} />
        <Route path="reference" element={<ReferencePage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default InductionApp;
