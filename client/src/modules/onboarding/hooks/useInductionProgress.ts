import { useState, useEffect } from 'react';
import type {
  Employee,
  InductionProgress,
  InductionSession,
  InductionChapter,
  InductionNotification,
  HandbookHighlight,
} from '../types/induction.types';
import { inductionService } from '../services/induction.service';

export function useInductionProgress(authEmployee?: Partial<Employee>) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [sessions, setSessions] = useState<InductionSession[]>([]);
  const [chapters, setChapters] = useState<InductionChapter[]>([]);
  const [progress, setProgress] = useState<InductionProgress | null>(null);
  const [nextStep, setNextStep] = useState<{
    chapter: InductionChapter;
    session: InductionSession;
  } | null>(null);
  const [principles, setPrinciples] = useState<HandbookHighlight[]>([]);
  const [notifications, setNotifications] = useState<InductionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [emp, sess, chaps, prog, next, princs, notifs] = await Promise.all([
        inductionService.getEmployeeInduction(authEmployee),
        inductionService.getInductionSessions(),
        inductionService.getInductionChapters(),
        inductionService.getInductionProgress(),
        inductionService.getNextIncompleteChapter(),
        inductionService.getWorkingPrinciples(),
        inductionService.getNotifications(),
      ]);

      setEmployee(emp);
      setSessions(sess);
      setChapters(chaps);
      setProgress(prog);
      setNextStep(next);
      setPrinciples(princs);
      setNotifications(notifs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load induction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const execute = async () => {
      try {
        const [emp, sess, chaps, prog, next, princs, notifs] = await Promise.all([
          inductionService.getEmployeeInduction(authEmployee),
          inductionService.getInductionSessions(),
          inductionService.getInductionChapters(),
          inductionService.getInductionProgress(),
          inductionService.getNextIncompleteChapter(),
          inductionService.getWorkingPrinciples(),
          inductionService.getNotifications(),
        ]);

        if (!ignore) {
          setEmployee(emp);
          setSessions(sess);
          setChapters(chaps);
          setProgress(prog);
          setNextStep(next);
          setPrinciples(princs);
          setNotifications(notifs);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load induction data');
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      ignore = true;
    };
  }, [authEmployee]);

  const markNotificationAsRead = async (id: string) => {
    await inductionService.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markChapterAsComplete = async (chapterId: string) => {
    await inductionService.completeChapter(chapterId);
    await loadData();
  };

  return {
    employee,
    sessions,
    chapters,
    progress,
    nextStep,
    principles,
    notifications,
    loading,
    error,
    refresh: loadData,
    markNotificationAsRead,
    markChapterAsComplete,
  };
}
