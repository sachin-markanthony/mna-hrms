import { HANDBOOK_CHAPTERS, HANDBOOK_SESSIONS } from '../data/inductionSessions';
import { HANDBOOK_DOCUMENTS } from '../data/trainingDocuments';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import type {
  InductionChapter,
  InductionNotification,
  InductionProgress,
  InductionSession,
} from '../types/induction.types';
import type {
  ChapterProgressRecord,
  HandbookDocument,
  QuizAttempt,
  QuizEvaluation,
  TrainingSummary,
} from '../types/training.types';

const STORAGE_KEY = 'mna_induction_state_v2';
const STORE_VERSION = 2;
const UPDATE_EVENT = 'mna:induction-updated';

interface InductionState {
  version: number;
  chapters: Record<string, ChapterProgressRecord>;
  attempts: QuizAttempt[];
  notificationsRead: string[];
}

export interface InductionSnapshot {
  state: InductionState;
  chapters: InductionChapter[];
  sessions: InductionSession[];
  progress: InductionProgress;
  notifications: InductionNotification[];
  nextStep: { chapter: InductionChapter; session: InductionSession } | null;
  summary: TrainingSummary;
}

type Listener = () => void;

const CHAPTER_BY_ID = new Map(HANDBOOK_CHAPTERS.map((chapter) => [chapter.id, chapter]));
const SESSION_BY_ID = new Map(HANDBOOK_SESSIONS.map((session) => [session.id, session]));
const FINAL_ASSESSMENT_NUMBER = 21;

function createInitialState(): InductionState {
  const chapters: Record<string, ChapterProgressRecord> = {};
  for (const chapter of HANDBOOK_CHAPTERS) {
    chapters[chapter.id] = {
      status: chapter.status,
      progressPercentage: chapter.progressPercentage,
    };
  }

  return {
    version: STORE_VERSION,
    chapters,
    attempts: [],
    notificationsRead: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function loadState(): InductionState {
  const seed = createInitialState();
  if (typeof window === 'undefined') return seed;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== STORE_VERSION || !isRecord(parsed.chapters)) {
      return seed;
    }

    const storedChapters = parsed.chapters as Record<string, ChapterProgressRecord>;
    return {
      version: STORE_VERSION,
      chapters: {
        ...seed.chapters,
        ...storedChapters,
      },
      attempts: Array.isArray(parsed.attempts) ? (parsed.attempts as QuizAttempt[]) : [],
      notificationsRead: Array.isArray(parsed.notificationsRead)
        ? (parsed.notificationsRead as string[])
        : [],
    };
  } catch {
    return seed;
  }
}

function persist(state: InductionState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode/quota). The in-memory store still works.
  }
}

function parseDurationToMinutes(value: string): number {
  const hours = Number(value.match(/(\d+)\s*hr/i)?.[1] ?? 0);
  const minutes = Number(value.match(/(\d+)\s*min/i)?.[1] ?? 0);
  return hours * 60 + minutes;
}

function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return 'All chapters completed';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} mins`;
  if (hours > 0) return `${hours} hr`;
  return `${minutes} mins`;
}

function formatLastAccessed(value?: string): string {
  if (!value) return 'Not started yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not started yet';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function latestAttempt(state: InductionState): QuizAttempt | null {
  return state.attempts.length > 0 ? state.attempts[0] : null;
}

function buildChapters(state: InductionState): InductionChapter[] {
  const coreBeforeFinal = HANDBOOK_CHAPTERS.filter(
    (chapter) => !chapter.isResource && chapter.chapterNumber < FINAL_ASSESSMENT_NUMBER,
  );
  const finalUnlocked = coreBeforeFinal.every(
    (chapter) => (state.chapters[chapter.id]?.status ?? chapter.status) === 'completed',
  );

  return HANDBOOK_CHAPTERS.map((chapter) => {
    const record = state.chapters[chapter.id];
    let status = record?.status ?? chapter.status;

    if (chapter.chapterNumber === FINAL_ASSESSMENT_NUMBER) {
      if (status !== 'completed') status = finalUnlocked ? (record?.status ?? 'not_started') : 'locked';
    } else if (!chapter.isResource && status === 'locked') {
      status = 'not_started';
    }

    const progressPercentage =
      status === 'completed' ? 100 : (record?.progressPercentage ?? chapter.progressPercentage);
    const document = HANDBOOK_DOCUMENTS[chapter.chapterNumber];

    return {
      ...chapter,
      status,
      progressPercentage,
      quizAvailable: Boolean(document?.quiz),
      lastScore: record?.lastScore,
      bestScore: record?.bestScore,
    };
  });
}

function buildSessions(chapters: InductionChapter[]): InductionSession[] {
  return HANDBOOK_SESSIONS.map((session) => {
    const sessionChapters = chapters.filter((chapter) => chapter.sessionId === session.id);
    const total = sessionChapters.length;
    const completed = sessionChapters.filter((chapter) => chapter.status === 'completed').length;
    const inProgress = sessionChapters.filter((chapter) => chapter.status === 'in_progress').length;

    let status: InductionSession['status'] = 'not_started';
    if (total > 0 && completed === total) status = 'completed';
    else if (completed > 0 || inProgress > 0) status = 'in_progress';
    else if (session.sessionNumber === 7) status = 'locked';

    return {
      ...session,
      status,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      chapterIds: sessionChapters.map((chapter) => chapter.id),
    };
  });
}

function buildProgress(
  state: InductionState,
  chapters: InductionChapter[],
  sessions: InductionSession[],
): InductionProgress {
  const countable = chapters.filter((chapter) => !chapter.isResource);
  const completedChapters = countable.filter((chapter) => chapter.status === 'completed').length;
  const totalChapters = countable.length;
  const overallPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const nextChapter =
    countable.find((chapter) => chapter.status !== 'completed' && chapter.status !== 'locked') ?? null;

  const remainingMinutes = countable
    .filter((chapter) => chapter.status !== 'completed')
    .reduce((total, chapter) => total + parseDurationToMinutes(chapter.estimatedDuration), 0);

  const lastAccessed = Object.values(state.chapters)
    .map((record) => record.lastAccessedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  let status: InductionProgress['status'] = 'Not Started';
  if (completedChapters === totalChapters && totalChapters > 0) status = 'Completed';
  else if (completedChapters > 0 || countable.some((chapter) => chapter.status === 'in_progress')) {
    status = 'In Progress';
  }

  const scoredChapters = countable.filter((chapter) => typeof chapter.bestScore === 'number');
  const averageScore =
    scoredChapters.length > 0
      ? Math.round(
          scoredChapters.reduce((total, chapter) => total + (chapter.bestScore ?? 0), 0) /
            scoredChapters.length,
        )
      : 0;

  const pendingAssessments = countable.filter(
    (chapter) => chapter.status !== 'completed' && chapter.quizAvailable,
  ).length;

  return {
    employeeId: 'current-user',
    totalChapters,
    completedChapters,
    overallPercentage,
    currentSessionId: nextChapter?.sessionId ?? sessions[0]?.id ?? 'session-1',
    currentChapterId: nextChapter?.id ?? countable[0]?.id ?? 'chap-1',
    lastAccessedAt: formatLastAccessed(lastAccessed),
    completedSessions: sessions.filter((session) => session.status === 'completed').length,
    totalSessions: sessions.length,
    remainingDuration: formatDuration(remainingMinutes),
    status,
    pendingAssessments,
    averageScore,
  };
}

function buildNotifications(
  state: InductionState,
  progress: InductionProgress,
  summary: TrainingSummary,
): InductionNotification[] {
  const read = new Set(state.notificationsRead);
  const notifications: InductionNotification[] = MOCK_NOTIFICATIONS.map((notification) => ({
    ...notification,
    read: read.has(notification.id),
  }));

  const next = summary.nextChapter;
  if (next) {
    notifications[0] = {
      ...notifications[0],
      id: 'notif-progress',
      title: progress.status === 'Completed' ? 'Induction Completed' : 'Induction In Progress',
      message:
        progress.status === 'Completed'
          ? 'All core induction chapters are complete. Your learning record is fully up to date.'
          : `You have completed ${progress.completedChapters} of ${progress.totalChapters} chapters. Next chapter: ${next.title}.`,
      type: 'info',
      read: read.has('notif-progress'),
      actionLabel: `Resume Chapter ${next.chapterNumber}`,
      actionRoute: `#chapter-${next.chapterNumber}`,
    };
  }

  if (summary.lastAttempt) {
    const attempt = summary.lastAttempt;
    const id = `attempt-${attempt.chapterId}`;
    notifications.unshift({
      id,
      title: attempt.passed ? 'Assessment Passed' : 'Assessment Needs Review',
      message: attempt.passed
        ? `Chapter ${attempt.chapterNumber} completed with a score of ${attempt.score}%. Dashboard progress has been updated.`
        : `You scored ${attempt.score}% on Chapter ${attempt.chapterNumber}. Review the document and retake the MCQ to complete the chapter.`,
      type: attempt.passed ? 'success' : 'warning',
      timestamp: 'Just now',
      read: read.has(id),
      actionLabel: attempt.passed ? 'View Chapter' : 'Retake Assessment',
      actionRoute: `#chapter-${attempt.chapterNumber}`,
    });
  }

  return notifications;
}

function buildSnapshot(state: InductionState): InductionSnapshot {
  const chapters = buildChapters(state);
  const sessions = buildSessions(chapters);
  const progress = buildProgress(state, chapters, sessions);

  const nextChapter =
    chapters.find(
      (chapter) => !chapter.isResource && chapter.status !== 'completed' && chapter.status !== 'locked',
    ) ?? null;
  const nextSession = nextChapter ? (SESSION_BY_ID.get(nextChapter.sessionId) ?? null) : null;
  const lastAttempt = latestAttempt(state);

  const scoredChapters = chapters.filter(
    (chapter) => !chapter.isResource && typeof chapter.bestScore === 'number',
  );
  const averageScore =
    scoredChapters.length > 0
      ? Math.round(
          scoredChapters.reduce((total, chapter) => total + (chapter.bestScore ?? 0), 0) /
            scoredChapters.length,
        )
      : 0;

  const summary: TrainingSummary = {
    overallPercentage: progress.overallPercentage,
    completedChapters: progress.completedChapters,
    totalChapters: progress.totalChapters,
    completedSessions: progress.completedSessions,
    totalSessions: progress.totalSessions,
    status: progress.status,
    nextChapter,
    nextSession: nextSession
      ? {
          id: nextSession.id,
          title: nextSession.title,
          sessionNumber: nextSession.sessionNumber,
        }
      : null,
    pendingAssessments: progress.pendingAssessments ?? 0,
    averageScore,
    lastAttempt,
    lastAccessedAt: progress.lastAccessedAt,
    totalDocuments: Object.keys(HANDBOOK_DOCUMENTS).length,
    totalQuestions: Object.values(HANDBOOK_DOCUMENTS).reduce(
      (total, document) => total + (document.quiz?.questions.length ?? 0),
      0,
    ),
  };

  return {
    state,
    chapters,
    sessions,
    progress,
    notifications: buildNotifications(state, progress, summary),
    nextStep: nextChapter && nextSession ? { chapter: nextChapter, session: nextSession } : null,
    summary,
  };
}

class InductionStore {
  private state: InductionState = loadState();
  private snapshot: InductionSnapshot = buildSnapshot(this.state);
  private listeners = new Set<Listener>();
  private storageBound = false;

  constructor() {
    this.bindStorage();
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): InductionSnapshot => this.snapshot;

  getDocument = (chapterId: string): HandbookDocument | null => {
    const chapter = CHAPTER_BY_ID.get(chapterId);
    if (!chapter) return null;
    return HANDBOOK_DOCUMENTS[chapter.chapterNumber] ?? null;
  };

  getChapterRecord = (chapterId: string): ChapterProgressRecord | null =>
    this.state.chapters[chapterId] ?? null;

  getAttempts = (chapterId?: string): QuizAttempt[] =>
    chapterId
      ? this.state.attempts.filter((attempt) => attempt.chapterId === chapterId)
      : this.state.attempts;

  startChapter = (chapterId: string): void => {
    const chapter = CHAPTER_BY_ID.get(chapterId);
    if (!chapter) return;

    const current = this.state.chapters[chapterId] ?? {
      status: 'not_started',
      progressPercentage: 0,
    };
    if (current.status === 'completed' || current.status === 'in_progress') return;

    const now = new Date().toISOString();
    this.commit({
      ...this.state,
      chapters: {
        ...this.state.chapters,
        [chapterId]: {
          ...current,
          status: 'in_progress',
          progressPercentage: Math.max(current.progressPercentage, 10),
          lastAccessedAt: now,
        },
      },
    });
  };

  completeChapter = (chapterId: string, score?: number): void => {
    const chapter = CHAPTER_BY_ID.get(chapterId);
    if (!chapter) return;

    const current = this.state.chapters[chapterId] ?? {
      status: 'not_started',
      progressPercentage: 0,
    };
    const now = new Date().toISOString();

    this.commit({
      ...this.state,
      chapters: {
        ...this.state.chapters,
        [chapterId]: {
          ...current,
          status: 'completed',
          progressPercentage: 100,
          lastAccessedAt: now,
          completedAt: now,
          lastScore: score ?? current.lastScore,
          bestScore:
            score === undefined
              ? current.bestScore
              : Math.max(current.bestScore ?? 0, score),
        },
      },
    });
  };

  submitQuiz = (chapterId: string, answers: Record<string, string>): QuizEvaluation => {
    const chapter = CHAPTER_BY_ID.get(chapterId);
    const document = this.getDocument(chapterId);
    if (!chapter || !document?.quiz) {
      throw new Error('This chapter does not have an assessment.');
    }

    const quiz = document.quiz;
    const results = quiz.questions.map((question) => {
      const selected = answers[question.id] ?? '';
      return {
        questionId: question.id,
        selected,
        correctOption: question.correctOption,
        isCorrect: selected === question.correctOption,
      };
    });
    const correctCount = results.filter((result) => result.isCorrect).length;
    const total = quiz.questions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = correctCount >= quiz.passingScore;
    const now = new Date().toISOString();

    const attempt: QuizAttempt = {
      chapterId,
      chapterNumber: chapter.chapterNumber,
      score,
      correctCount,
      total,
      passed,
      attemptedAt: now,
    };

    const current = this.state.chapters[chapterId] ?? {
      status: 'not_started',
      progressPercentage: 0,
    };
    const nextRecord: ChapterProgressRecord = {
      ...current,
      lastAccessedAt: now,
      lastScore: score,
      bestScore: Math.max(current.bestScore ?? 0, score),
    };

    if (passed) {
      nextRecord.status = 'completed';
      nextRecord.progressPercentage = 100;
      nextRecord.completedAt = now;
    } else if (current.status !== 'completed') {
      nextRecord.status = 'in_progress';
      nextRecord.progressPercentage = Math.max(current.progressPercentage, 15);
    }

    this.commit({
      ...this.state,
      chapters: {
        ...this.state.chapters,
        [chapterId]: nextRecord,
      },
      attempts: [attempt, ...this.state.attempts].slice(0, 100),
    });

    return {
      ...attempt,
      answers,
      passingScore: quiz.passingScore,
      results,
    };
  };

  markNotificationRead = (id: string): void => {
    if (this.state.notificationsRead.includes(id)) return;
    this.commit({
      ...this.state,
      notificationsRead: [...this.state.notificationsRead, id],
    });
  };

  resetProgress = (): void => {
    this.commit(createInitialState());
  };

  refreshFromStorage = (): void => {
    this.commit(loadState(), false);
  };

  private commit(nextState: InductionState, shouldPersist = true) {
    this.state = nextState;
    this.snapshot = buildSnapshot(nextState);
    if (shouldPersist) persist(nextState);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
    }
    this.listeners.forEach((listener) => listener());
  }

  private bindStorage() {
    if (this.storageBound || typeof window === 'undefined') return;
    this.storageBound = true;
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        this.commit(loadState(), false);
      }
    });
  }
}

export const inductionStore = new InductionStore();
