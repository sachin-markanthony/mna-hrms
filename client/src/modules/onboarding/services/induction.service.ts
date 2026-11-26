// Client-side induction service backed by the local reactive store.
// No database or network calls are made, so existing backend schemas stay untouched.
import type {
  Employee,
  InductionProgress,
  InductionSession,
  InductionChapter,
  InductionNotification,
  HandbookHighlight,
} from '../types/induction.types';
import type { HandbookDocument, QuizAttempt, QuizEvaluation } from '../types/training.types';
import { WORKING_PRINCIPLES } from '../data/inductionSessions';
import { MOCK_EMPLOYEE } from '../data/mockEmployee';
import { inductionStore } from '../store/inductionStore';

class InductionService {
  private fallbackEmployee: Employee = { ...MOCK_EMPLOYEE };

  public async getEmployeeInduction(employeeOverride?: Partial<Employee>): Promise<Employee> {
    return employeeOverride
      ? { ...this.fallbackEmployee, ...employeeOverride }
      : this.fallbackEmployee;
  }

  public async getInductionSessions(): Promise<InductionSession[]> {
    return inductionStore.getSnapshot().sessions;
  }

  public async getInductionChapters(): Promise<InductionChapter[]> {
    return inductionStore.getSnapshot().chapters;
  }

  public async getWorkingPrinciples(): Promise<HandbookHighlight[]> {
    return WORKING_PRINCIPLES;
  }

  public async getNotifications(): Promise<InductionNotification[]> {
    return inductionStore.getSnapshot().notifications;
  }

  public async markNotificationRead(id: string): Promise<void> {
    inductionStore.markNotificationRead(id);
  }

  public async getInductionProgress(): Promise<InductionProgress> {
    return inductionStore.getSnapshot().progress;
  }

  public async getNextIncompleteChapter(): Promise<{
    chapter: InductionChapter;
    session: InductionSession;
  } | null> {
    return inductionStore.getSnapshot().nextStep;
  }

  /**
   * Returns the imported MA Ventures handbook document for a chapter.
   */
  public async getTrainingDocument(chapterId: string): Promise<HandbookDocument | null> {
    return inductionStore.getDocument(chapterId);
  }

  public getTrainingDocumentSync(chapterId: string): HandbookDocument | null {
    return inductionStore.getDocument(chapterId);
  }

  public async getQuizAttempts(chapterId: string): Promise<QuizAttempt[]> {
    return inductionStore.getAttempts(chapterId);
  }

  public getQuizAttemptsSync(chapterId: string): QuizAttempt[] {
    return inductionStore.getAttempts(chapterId);
  }

  /**
   * Starts a chapter (moves it to in-progress) so dashboard metrics update immediately.
   */
  public async startChapter(chapterId: string): Promise<void> {
    inductionStore.startChapter(chapterId);
  }

  /**
   * Legacy direct completion. The training portal uses submitQuiz instead so that
   * a chapter is only completed after the MCQ assessment is passed.
   */
  public async completeChapter(chapterId: string): Promise<void> {
    inductionStore.completeChapter(chapterId);
  }

  /**
   * Evaluates the chapter MCQ. Passing marks the chapter complete and refreshes
   * every derived metric used by the dashboard.
   */
  public async submitChapterQuiz(
    chapterId: string,
    answers: Record<string, string>,
  ): Promise<QuizEvaluation> {
    return inductionStore.submitQuiz(chapterId, answers);
  }

  public submitChapterQuizSync(
    chapterId: string,
    answers: Record<string, string>,
  ): QuizEvaluation {
    return inductionStore.submitQuiz(chapterId, answers);
  }

  public async resetProgress(): Promise<void> {
    inductionStore.resetProgress();
  }
}

export const inductionService = new InductionService();
