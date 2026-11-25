import { useMemo } from 'react';
import type { Employee } from '../types/induction.types';
import type { QuizAttempt, QuizEvaluation } from '../types/training.types';
import { MOCK_EMPLOYEE } from '../data/mockEmployee';
import { WORKING_PRINCIPLES } from '../data/inductionSessions';
import { inductionStore } from '../store/inductionStore';
import { useInductionSnapshot } from './useInductionStore';

export function useInductionProgress(authEmployee?: Partial<Employee>) {
  const snapshot = useInductionSnapshot();

  const { id, fullName, email, department, designation } = authEmployee ?? {};
  const employee = useMemo<Employee>(
    () => ({
      ...MOCK_EMPLOYEE,
      ...(id ? { id } : {}),
      ...(fullName ? { fullName } : {}),
      ...(email ? { email } : {}),
      ...(department ? { department } : {}),
      ...(designation ? { designation } : {}),
    }),
    [id, fullName, email, department, designation],
  );

  const markNotificationAsRead = async (id: string) => {
    inductionStore.markNotificationRead(id);
  };

  const markChapterAsComplete = async (chapterId: string) => {
    inductionStore.completeChapter(chapterId);
  };

  const startChapter = (chapterId: string) => {
    inductionStore.startChapter(chapterId);
  };

  const submitChapterQuiz = (
    chapterId: string,
    answers: Record<string, string>,
  ): QuizEvaluation => inductionStore.submitQuiz(chapterId, answers);

  const getDocument = (chapterId: string) => inductionStore.getDocument(chapterId);

  const getQuizAttempts = (chapterId: string): QuizAttempt[] =>
    inductionStore.getAttempts(chapterId);

  return {
    employee,
    sessions: snapshot.sessions,
    chapters: snapshot.chapters,
    progress: snapshot.progress,
    nextStep: snapshot.nextStep,
    principles: WORKING_PRINCIPLES,
    notifications: snapshot.notifications,
    summary: snapshot.summary,
    loading: false,
    error: null as string | null,
    refresh: async () => inductionStore.refreshFromStorage(),
    markNotificationAsRead,
    markChapterAsComplete,
    startChapter,
    submitChapterQuiz,
    getDocument,
    getQuizAttempts,
    resetProgress: async () => inductionStore.resetProgress(),
  };
}
