import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  LockKeyhole,
  LogOut,
  Trophy,
  X,
} from 'lucide-react';
import { BrandLogo } from '../../../../components/ui/BrandLogo';
import { useAuth } from '../../../auth';
import { MODULE_GROUPS } from '../../data/chapterCatalog';
import type {
  ChapterView,
  EmployeeProfile,
  InductionSummary,
} from '../../types/learning.types';
import { getInitials } from '../../utils/chapterStatus';

interface InductionSidebarProps {
  employee: EmployeeProfile;
  summary: InductionSummary;
  learningChapters: ChapterView[];
  finalAssessment: ChapterView;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function InductionSidebar({
  employee,
  summary,
  learningChapters,
  finalAssessment,
  mobileOpen,
  onCloseMobile,
}: InductionSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const activeItem = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    activeItem?.scrollIntoView({ block: 'nearest' });
  }, [location.pathname, mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openChapter = (chapterNumber: number) => {
    navigate(`/induction/chapters/${chapterNumber}`);
    onCloseMobile();
  };

  const openFinalAssessment = () => {
    navigate('/induction/final-assessment');
    onCloseMobile();
  };

  const finalActive =
    location.pathname.startsWith('/induction/final-assessment') ||
    location.pathname === '/induction/chapters/21' ||
    location.pathname.startsWith('/induction/chapters/21/');

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[286px] shrink-0 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 dark:border-slate-800/80 dark:bg-[#0f172a] lg:static lg:z-30 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800/80">
          <BrandLogo size="md" showSubtitle />
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Overall progress */}
        <div className="shrink-0 border-b border-slate-100 px-5 py-4 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Induction progress
            </p>
            <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
              {summary.overallPercentage}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-amber-400 transition-all duration-500"
              style={{ width: `${summary.overallPercentage}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
            {summary.completedChapters} of {summary.totalLearningChapters} chapters complete
          </p>
        </div>

        {/* Chapters */}
        <nav ref={navRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {MODULE_GROUPS.map((group) => (
            <div key={group.moduleNumber} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                {group.moduleLabel}
              </p>

              <div className="space-y-0.5">
                {group.chapters.map((entry) => {
                  const chapter = learningChapters.find(
                    (item) => item.chapterNumber === entry.chapterNumber,
                  );
                  if (!chapter) return null;

                  const chapterPath = `/induction/chapters/${chapter.chapterNumber}`;
                  const active =
                    location.pathname === chapterPath ||
                    location.pathname.startsWith(`${chapterPath}/`);
                  const locked = !chapter.isUnlocked;
                  const failed = chapter.status === 'assessment_failed';

                  const helper = chapter.completed
                    ? chapter.bestScore
                      ? `Passed · ${chapter.bestScore}%`
                      : 'Completed'
                    : failed
                      ? 'Retake assessment'
                      : locked
                        ? 'Locked'
                        : chapter.readingStatus === 'reading'
                          ? 'In progress'
                          : `${chapter.estimatedMinutes} min`;

                  return (
                    <button
                      key={chapter.chapterNumber}
                      type="button"
                      disabled={locked}
                      onClick={() => openChapter(chapter.chapterNumber)}
                      data-active={active ? 'true' : undefined}
                      aria-current={active ? 'page' : undefined}
                      title={locked ? 'Pass the previous assessment to unlock' : chapter.title}
                      className={`group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition ${
                        active
                          ? 'bg-[#0b2b52] text-white shadow-sm dark:bg-[#1e3a8a]'
                          : locked
                            ? 'cursor-not-allowed opacity-55'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold ${
                          chapter.completed
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : locked
                              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                              : active
                                ? 'bg-white/15 text-amber-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {chapter.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : locked ? (
                          <LockKeyhole className="h-3 w-3" />
                        ) : (
                          chapter.chapterNumber
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[12px] font-semibold leading-5">
                          {chapter.title}
                        </span>
                        <span
                          className={`mt-0.5 block text-[9.5px] font-medium ${
                            active
                              ? 'text-blue-100'
                              : chapter.completed
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : failed
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : locked
                                    ? 'text-slate-400 dark:text-slate-500'
                                    : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {helper}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Final assessment */}
          <div className="mt-1 border-t border-slate-100 pt-3 dark:border-slate-800/80">
            <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Final step
            </p>
            <button
              type="button"
              disabled={!finalAssessment.isUnlocked}
              onClick={openFinalAssessment}
              data-active={finalActive ? 'true' : undefined}
              aria-current={finalActive ? 'page' : undefined}
              className={`group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition ${
                finalActive
                  ? 'bg-[#0b2b52] text-white shadow-sm dark:bg-[#1e3a8a]'
                  : finalAssessment.isUnlocked
                    ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                    : 'cursor-not-allowed opacity-55'
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  finalAssessment.completed
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : finalAssessment.isUnlocked
                      ? finalActive
                        ? 'bg-white/15 text-amber-300'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {finalAssessment.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : finalAssessment.isUnlocked ? (
                  <Trophy className="h-3.5 w-3.5" />
                ) : (
                  <LockKeyhole className="h-3 w-3" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold leading-5">
                  The Grand Final Quiz
                </span>
                <span
                  className={`mt-0.5 block text-[9.5px] font-medium ${
                    finalActive
                      ? 'text-blue-100'
                      : finalAssessment.completed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : finalAssessment.isUnlocked
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {finalAssessment.completed
                    ? finalAssessment.bestScore
                      ? `Passed · ${finalAssessment.bestScore}%`
                      : 'Completed'
                    : finalAssessment.isUnlocked
                      ? 'Ready when you are'
                      : `Complete ${summary.totalLearningChapters} chapters`}
                </span>
              </span>
            </button>
          </div>
        </nav>

        {/* Employee */}
        <div className="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800/80">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#072b53] to-[#1e40af] text-[11px] font-black text-white ring-1 ring-slate-200 dark:ring-slate-700">
              {getInitials(employee.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold text-slate-900 dark:text-white">
                {employee.fullName}
              </p>
              <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {employee.designation}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
