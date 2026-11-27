import { useMemo, useSyncExternalStore } from 'react';
import { getEmployeeProfile } from '../config/induction.config';
import { getHandbookContent } from '../data/handbookContent';
import { getLearnerAssessment } from '../data/assessmentBank';
import { inductionLearningStore } from '../store/inductionLearningStore';

/**
 * Single hook for the induction journey. Locking, progress and attempt history
 * all come from the store so UI components never calculate unlock rules.
 */
export function useInductionLearning() {
  const snapshot = useSyncExternalStore(
    inductionLearningStore.subscribe,
    inductionLearningStore.getSnapshot,
    inductionLearningStore.getSnapshot,
  );

  const employee = useMemo(() => getEmployeeProfile(), []);

  return {
    ...snapshot,
    employee,
    loading: false,
    error: null as string | null,
    refresh: () => inductionLearningStore.refreshFromStorage(),
    startReading: inductionLearningStore.startReading,
    markReadingComplete: inductionLearningStore.markReadingComplete,
    submitAssessment: inductionLearningStore.submitAssessment,
    markNotificationRead: inductionLearningStore.markNotificationRead,
    markAllNotificationsRead: inductionLearningStore.markAllNotificationsRead,
    resetProgress: inductionLearningStore.resetProgress,
  };
}

export function useChapterLearning(chapterNumber: number) {
  const induction = useInductionLearning();
  const chapter =
    induction.chapters.find((item) => item.chapterNumber === chapterNumber) ?? null;

  return {
    ...induction,
    chapter,
    document: getHandbookContent(chapterNumber),
    assessment: getLearnerAssessment(chapterNumber),
  };
}
