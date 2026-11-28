import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useInductionLearning } from '../../hooks/useInductionLearning';
import { InductionSidebar } from './InductionSidebar';
import { InductionTopbar } from './InductionTopbar';
import '../../induction.css';

/**
 * Minimal, reading-first shell for the induction experience.
 *
 * The sidebar is the single navigation surface: it lists every learning
 * chapter in order, with locked chapters disabled until the previous
 * assessment has been passed. Everything else lives in the reading area.
 */
export function InductionLayout() {
  const { employee, chapters, learningChapters, finalAssessment, summary } =
    useInductionLearning();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="induction-shell flex h-screen w-full overflow-hidden antialiased">
      <InductionSidebar
        employee={employee}
        summary={summary}
        learningChapters={learningChapters}
        finalAssessment={finalAssessment}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <InductionTopbar
          chapters={chapters}
          summary={summary}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        <main
          id="induction-scroll"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
