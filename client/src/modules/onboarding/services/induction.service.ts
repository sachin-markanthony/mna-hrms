import type {
  Employee,
  InductionProgress,
  InductionSession,
  InductionChapter,
  InductionNotification,
  HandbookHighlight,
} from '../types/induction.types';
import { HANDBOOK_SESSIONS, HANDBOOK_CHAPTERS, WORKING_PRINCIPLES } from '../data/inductionSessions';
import { MOCK_EMPLOYEE } from '../data/mockEmployee';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { httpClient } from '../../../services/httpClient';

class InductionService {
  private fallbackEmployee: Employee = { ...MOCK_EMPLOYEE };
  private fallbackSessions: InductionSession[] = [...HANDBOOK_SESSIONS];
  private fallbackChapters: InductionChapter[] = [...HANDBOOK_CHAPTERS];
  private fallbackNotifications: InductionNotification[] = [...MOCK_NOTIFICATIONS];

  /**
   * Retrieves employee profile, attempting live NestJS API first with mock fallback
   */
  public async getEmployeeInduction(employeeOverride?: Partial<Employee>): Promise<Employee> {
    try {
      const data = await httpClient.get<Employee>('/onboarding/induction/employee');
      if (data && data.fullName) {
        return employeeOverride ? { ...data, ...employeeOverride } : data;
      }
    } catch {
      // Gracefully fall back to local store
    }
    return employeeOverride ? { ...this.fallbackEmployee, ...employeeOverride } : this.fallbackEmployee;
  }

  /**
   * Retrieves all 7 induction sessions
   */
  public async getInductionSessions(): Promise<InductionSession[]> {
    try {
      const data = await httpClient.get<InductionSession[]>('/onboarding/induction/sessions');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
    return this.fallbackSessions;
  }

  /**
   * Retrieves all 22 induction chapters
   */
  public async getInductionChapters(): Promise<InductionChapter[]> {
    try {
      const data = await httpClient.get<InductionChapter[]>('/onboarding/induction/chapters');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
    return this.fallbackChapters;
  }

  /**
   * Retrieves static working principles
   */
  public async getWorkingPrinciples(): Promise<HandbookHighlight[]> {
    return WORKING_PRINCIPLES;
  }

  /**
   * Retrieves notifications from live DB or fallback
   */
  public async getNotifications(): Promise<InductionNotification[]> {
    try {
      const data = await httpClient.get<InductionNotification[]>('/onboarding/induction/notifications');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
    return this.fallbackNotifications;
  }

  /**
   * Marks notification as read in database
   */
  public async markNotificationRead(id: string): Promise<void> {
    try {
      await httpClient.patch(`/onboarding/induction/notifications/${id}/read`);
    } catch {
      // Local fallback
    }
    this.fallbackNotifications = this.fallbackNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  }

  /**
   * Calculates overall progress dynamically from live database or chapters
   */
  public async getInductionProgress(): Promise<InductionProgress> {
    try {
      const data = await httpClient.get<InductionProgress>('/onboarding/induction/progress');
      if (data && data.totalChapters) {
        return data;
      }
    } catch {
      // Fallback
    }

    const totalChapters = this.fallbackChapters.length;
    const completedChapters = this.fallbackChapters.filter((c) => c.status === 'completed').length;
    const completedSessions = this.fallbackSessions.filter((s) => s.status === 'completed').length;
    const totalSessions = this.fallbackSessions.length;

    const overallPercentage = Math.round((completedChapters / totalChapters) * 100);
    const nextChapter = this.fallbackChapters.find((c) => c.status !== 'completed' && !c.isResource);
    const currentSessionId = nextChapter ? nextChapter.sessionId : 'session-1';
    const currentChapterId = nextChapter ? nextChapter.id : this.fallbackChapters[0].id;

    let status: InductionProgress['status'] = 'Not Started';
    if (completedChapters === totalChapters) {
      status = 'Completed';
    } else if (completedChapters > 0) {
      status = 'In Progress';
    }

    return {
      employeeId: this.fallbackEmployee.id,
      totalChapters,
      completedChapters,
      overallPercentage,
      currentSessionId,
      currentChapterId,
      lastAccessedAt: 'Today, 11:20 AM',
      completedSessions,
      totalSessions,
      remainingDuration: '1 hour 57 minutes',
      status,
    };
  }

  /**
   * Retrieves the next incomplete chapter for the Continue Learning feature
   */
  public async getNextIncompleteChapter(): Promise<{
    chapter: InductionChapter;
    session: InductionSession;
  } | null> {
    const chapters = await this.getInductionChapters();
    const sessions = await this.getInductionSessions();

    const nextChapter = chapters.find(
      (c) => c.status === 'in_progress' || (c.status === 'not_started' && !c.isResource)
    );

    if (!nextChapter) {
      return null;
    }

    const session =
      sessions.find((s) => s.id === nextChapter.sessionId) || sessions[0];

    return {
      chapter: nextChapter,
      session,
    };
  }

  /**
   * Dynamically marks a chapter as completed in the database
   */
  public async completeChapter(chapterId: string): Promise<void> {
    try {
      await httpClient.patch(`/onboarding/induction/chapters/${chapterId}/progress`, {
        status: 'COMPLETED',
        progressPercentage: 100,
      });
    } catch {
      // Local fallback
      this.fallbackChapters = this.fallbackChapters.map((c) =>
        c.id === chapterId ? { ...c, status: 'completed', progressPercentage: 100 } : c
      );
    }
  }
}

export const inductionService = new InductionService();
