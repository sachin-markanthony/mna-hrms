import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../../../../services/theme';
import type { ChapterView, InductionSummary } from '../../types/learning.types';

interface InductionTopbarProps {
  chapters: ChapterView[];
  summary: InductionSummary;
  onOpenMobileSidebar: () => void;
}

function getHeading(pathname: string, chapters: ChapterView[]) {
  if (pathname === '/induction' || pathname === '/induction/overview') {
    return { title: 'Employee Induction', caption: 'Read. Reflect. Pass the quiz.' };
  }

  const chapterMatch = pathname.match(/\/induction\/chapters\/(\d+)(\/assessment|\/result)?/);
  if (chapterMatch) {
    const chapterNumber = Number(chapterMatch[1]);
    const chapter = chapters.find((item) => item.chapterNumber === chapterNumber);
    const suffix =
      chapterMatch[2] === '/assessment'
        ? 'Assessment'
        : chapterMatch[2] === '/result'
          ? 'Result'
          : null;

    return {
      title: chapter ? `Chapter ${chapter.chapterNumber} · ${chapter.title}` : `Chapter ${chapterNumber}`,
      caption: suffix ?? (chapter ? chapter.moduleLabel : 'Learning chapter'),
    };
  }

  if (pathname.startsWith('/induction/final-assessment')) {
    return { title: 'The Grand Final Quiz', caption: 'Final assessment' };
  }

  return { title: 'Employee Induction', caption: 'MA Ventures' };
}

export function InductionTopbar({
  chapters,
  summary,
  onOpenMobileSidebar,
}: InductionTopbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const heading = getHeading(location.pathname, chapters);

  return (
    <header className="z-10 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0f172a]/95">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link
            to="/induction"
            className="hidden items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200 sm:flex"
          >
            Induction
          </Link>
          <ChevronRight className="hidden h-3.5 w-3.5 text-slate-300 dark:text-slate-600 sm:block" />

          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold text-slate-900 dark:text-white">
              {heading.title}
            </p>
            <p className="truncate text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {heading.caption}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10.5px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 sm:inline-flex">
            <BookOpen className="h-3 w-3 text-amber-500" />
            {summary.completedChapters}/{summary.totalLearningChapters}
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Back to HRMS dashboard"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-[#1e3a8a] to-amber-400 transition-all duration-500"
          style={{ width: `${summary.overallPercentage}%` }}
        />
      </div>
    </header>
  );
}
