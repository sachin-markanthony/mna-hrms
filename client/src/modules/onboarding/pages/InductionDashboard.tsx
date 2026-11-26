import React, { useState } from 'react';
import { useAuth } from '../../auth';
import { useInductionProgress } from '../hooks/useInductionProgress';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { OverallProgressCard } from '../components/OverallProgressCard';
import { ContinueLearningCard } from '../components/ContinueLearningCard';
import { LearningSessionsGrid } from '../components/LearningSessionsGrid';
import { LearningRoadmap } from '../components/LearningRoadmap';
import { BeforeYouBegin } from '../components/BeforeYouBegin';
import { WorkingPrinciples } from '../components/WorkingPrinciples';
import { LearningNotifications } from '../components/LearningNotifications';
import { TrainingDocumentView } from '../components/TrainingDocumentView';
import { TrainingDocumentLibrary } from '../components/TrainingDocumentLibrary';
import { InductionSubNav } from '../components/InductionSubNav';
import type { InductionTabType } from '../components/InductionSubNav';
import type { InductionSession, InductionChapter } from '../types/induction.types';
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import '../induction.css';

export const InductionDashboard: React.FC = () => {
  const { user } = useAuth();

  const authEmployee = user
    ? {
      fullName: user.name,
      department: user.department || 'Real Estate Advisory & Investments',
      designation: user.designation || 'Senior Investment Advisor',
      email: user.email,
    }
    : undefined;

  const {
    employee,
    sessions,
    chapters,
    progress,
    nextStep,
    principles,
    notifications,
    summary,
    loading,
    error,
    refresh,
    markNotificationAsRead,
    startChapter,
    submitChapterQuiz,
    getDocument,
    getQuizAttempts,
    resetProgress,
  } = useInductionProgress(authEmployee);

  const [currentTab, setCurrentTab] = useState<InductionTabType>('overview');

  // Selected state for interactive learning session/chapter viewer
  const [activeLearningState, setActiveLearningState] = useState<{
    isOpen: boolean;
    session: InductionSession | null;
    chapter: InductionChapter | null;
  }>({
    isOpen: false,
    session: null,
    chapter: null,
  });

  const handleContinueLearning = () => {
    if (nextStep) {
      setActiveLearningState({
        isOpen: true,
        session: nextStep.session,
        chapter: nextStep.chapter,
      });
    } else {
      setActiveLearningState({
        isOpen: true,
        session: sessions[0] || null,
        chapter: chapters[0] || null,
      });
    }
  };

  const handleSelectSession = (session: InductionSession) => {
    if (session.status === 'locked') return;

    const sessionChapters = chapters.filter((c) => c.sessionId === session.id);
    const sessionFirstChapter =
      sessionChapters.find((c) => c.status !== 'completed' && c.status !== 'locked') ??
      sessionChapters[0] ??
      null;

    setActiveLearningState({
      isOpen: true,
      session,
      chapter: sessionFirstChapter,
    });
  };

  const handleSelectChapter = (chapter: InductionChapter) => {
    if (chapter.status === 'locked') return;

    const session =
      sessions.find((s) => s.id === chapter.sessionId) || null;

    setActiveLearningState({
      isOpen: true,
      session,
      chapter,
    });
  };

  const handleNavigateAction = (route: string) => {
    const chapterMatch = route.match(/^#chapter-(\d+)$/);
    if (chapterMatch) {
      const target = chapters.find((c) => c.chapterNumber === Number(chapterMatch[1]));
      if (target) {
        handleSelectChapter(target);
        return;
      }
    }

    const sessionMatch = route.match(/^#session-(\d+)$/);
    if (sessionMatch) {
      const targetSession = sessions.find(
        (s) => s.sessionNumber === Number(sessionMatch[1]),
      );
      if (targetSession) handleSelectSession(targetSession);
    }
  };

  const getNextChapter = (chapter: InductionChapter | null): InductionChapter | null => {
    if (!chapter) return null;
    const index = chapters.findIndex((c) => c.id === chapter.id);
    if (index < 0) return null;
    return (
      chapters
        .slice(index + 1)
        .find((c) => !c.isResource && c.status !== 'locked') ?? null
    );
  };

  // Always read the latest chapter/session from the store so quiz results
  // are reflected immediately without closing the document.
  const activeChapter = activeLearningState.chapter
    ? chapters.find((c) => c.id === activeLearningState.chapter?.id) ??
    activeLearningState.chapter
    : null;
  const activeSession = activeLearningState.session
    ? sessions.find((s) => s.id === activeLearningState.session?.id) ??
    activeLearningState.session
    : null;

  if (loading) {
    return (
      <div className="induction-page induction-page--state py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-9 h-9 rounded-full border-3 border-[#1e3a8a] border-t-transparent animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Loading MA Ventures Learning Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="induction-page induction-page--state py-16 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Failed to load induction modules</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">{error}</p>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="induction-page space-y-6">
      {/* Module Title & Global Scope Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Employee Induction &amp; Learning Portal
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              MA Ventures
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 1 Module &bull; {sessions.length} Core Learning Sessions &bull;{' '}
            {summary.totalDocuments} Handbook Chapters &bull; Training Document + MCQ Assessments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Progress: {progress?.overallPercentage ?? 35}% Completed</span>
          </div>
        </div>
      </div>

      {/* Induction Sub-navigation & Search (Non-duplicated, page-level) */}
      <InductionSubNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setActiveLearningState({ isOpen: false, session: null, chapter: null });
        }}
        chapters={chapters}
        onSelectChapter={handleSelectChapter}
      />

      {/* Main Content Area */}
      {activeLearningState.isOpen && activeChapter ? (
        /* Interactive Training Document + MCQ Assessment View */
        <TrainingDocumentView
          session={activeSession}
          chapter={activeChapter}
          document={getDocument(activeChapter.id)}
          lastAttempt={getQuizAttempts(activeChapter.id)[0] ?? null}
          nextChapter={getNextChapter(activeChapter)}
          onBack={() => setActiveLearningState({ isOpen: false, session: null, chapter: null })}
          onStartChapter={startChapter}
          onSubmitQuiz={submitChapterQuiz}
          onNavigateChapter={handleSelectChapter}
        />
      ) : currentTab === 'documents' ? (
        /* Training Document Library */
        <TrainingDocumentLibrary
          chapters={chapters}
          sessions={sessions}
          summary={summary}
          onSelectChapter={handleSelectChapter}
          onResetProgress={() => {
            if (window.confirm('Reset all local induction progress to the demo starting point?')) {
              void resetProgress();
            }
          }}
        />
      ) : currentTab === 'overview' ? (
        /* Overview Master View */
        <>
          {/* 1. Welcome / Hero Section */}
          <WelcomeBanner
            employee={employee}
            progress={progress}
            onContinue={handleContinueLearning}
          />

          {/* 2. Overall Progress Section */}
          <OverallProgressCard progress={progress} />

          {/* 3. Continue Learning Card */}
          <ContinueLearningCard
            chapter={nextStep?.chapter || null}
            session={nextStep?.session || null}
            onContinue={handleContinueLearning}
          />

          {/* 4. Interactive Learning Roadmap */}
          <LearningRoadmap
            sessions={sessions}
            onSelectSession={handleSelectSession}
          />

          {/* 5. Learning Sessions Grid (All 7 sessions) */}
          <LearningSessionsGrid
            sessions={sessions}
            onSelectSession={handleSelectSession}
          />

          {/* 6. Before You Begin Matrix */}
          <BeforeYouBegin />

          {/* 7. Working Principles & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WorkingPrinciples principles={principles} />
            <LearningNotifications
              notifications={notifications}
              onMarkRead={markNotificationAsRead}
              onNavigateAction={handleNavigateAction}
            />
          </div>
        </>
      ) : currentTab === 'curriculum' ? (
        /* Curriculum Sessions & Chapters View */
        <div className="space-y-6">
          <LearningSessionsGrid
            sessions={sessions}
            onSelectSession={handleSelectSession}
          />
        </div>
      ) : currentTab === 'roadmap' ? (
        /* Roadmap View */
        <div className="space-y-6">
          <LearningRoadmap
            sessions={sessions}
            onSelectSession={handleSelectSession}
          />
        </div>
      ) : currentTab === 'compliance' ? (
        /* Compliance & Criteria View */
        <div className="space-y-6">
          <BeforeYouBegin />
        </div>
      ) : (
        /* Working Principles View */
        <div className="max-w-3xl mx-auto">
          <WorkingPrinciples principles={principles} />
        </div>
      )}
    </div>
  );
};
