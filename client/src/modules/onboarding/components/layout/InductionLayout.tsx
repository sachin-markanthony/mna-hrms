import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useInductionLearning } from '../../hooks/useInductionLearning';
import { InductionSidebar } from './InductionSidebar';
import { InductionTopbar } from './InductionTopbar';
import '../../induction.css';

export function InductionLayout() {
  const {
    employee,
    chapters,
    summary,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetProgress,
  } = useInductionLearning();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="induction-shell flex h-screen w-full overflow-hidden antialiased">
      <InductionSidebar
        employee={employee}
        summary={summary}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <InductionTopbar
          employee={employee}
          summary={summary}
          chapters={chapters}
          notifications={notifications}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onMarkNotificationRead={markNotificationRead}
          onMarkAllNotificationsRead={markAllNotificationsRead}
          onResetProgress={resetProgress}
        />

        <main
          id="induction-scroll"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-4 sm:p-6 lg:p-8"
        >
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
