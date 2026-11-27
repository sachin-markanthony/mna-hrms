import {
  getChapterEntry,
  LEARNING_CHAPTERS,
  FINAL_ASSESSMENT_CHAPTER,
  REFERENCE_CHAPTER,
} from '../data/chapterCatalog';
import { getEmployeeId, INDUCTION_CONFIG } from '../config/induction.config';
import { gradeAssessment } from '../services/mockAssessmentServer';
import type {
  AssessmentAttempt,
  ChapterCatalogEntry,
  ChapterJourneyStatus,
  ChapterProgressRecord,
  ChapterView,
  InductionNotification,
  InductionSummary,
} from '../types/learning.types';

interface PersistedInductionState {
  version: number;
  chapters: Record<number, ChapterProgressRecord>;
  attempts: AssessmentAttempt[];
  notificationsRead: string[];
}

export interface InductionSnapshot {
  state: PersistedInductionState;
  chapters: ChapterView[];
  learningChapters: ChapterView[];
  finalAssessment: ChapterView;
  referenceChapter: ChapterCatalogEntry;
  summary: InductionSummary;
  notifications: InductionNotification[];
}

type Listener = () => void;

const UPDATE_EVENT = 'mav:induction-learning-updated';

function emptyRecord(): ChapterProgressRecord {
  return { readingStatus: 'not_started', completed: false };
}

function createInitialState(): PersistedInductionState {
  const chapters: Record<number, ChapterProgressRecord> = {};
  for (const chapter of [ ...LEARNING_CHAPTERS, REFERENCE_CHAPTER, FINAL_ASSESSMENT_CHAPTER ]) {
    chapters[chapter.chapterNumber] = emptyRecord();
  }
  return {
    version: INDUCTION_CONFIG.storeVersion,
    chapters,
    attempts: [],
    notificationsRead: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeAttempt(value: unknown): AssessmentAttempt | null {
  if (!isRecord(value)) return null;
  const chapterNumber = Number(value.chapterNumber);
  const chapter = getChapterEntry(chapterNumber);
  if (!chapter) return null;
  if (
    typeof value.id !== 'string' ||
    typeof value.employeeId !== 'string' ||
    typeof value.attemptNumber !== 'number' ||
    typeof value.score !== 'number' ||
    typeof value.correctCount !== 'number' ||
    typeof value.total !== 'number' ||
    typeof value.passed !== 'boolean' ||
    typeof value.attemptedAt !== 'string'
  ) {
    return null;
  }
  return {
    id: value.id,
    employeeId: value.employeeId,
    chapterId: typeof value.chapterId === 'string' ? value.chapterId : chapter.id,
    chapterNumber,
    attemptNumber: value.attemptNumber,
    answers: isRecord(value.answers)
      ? Object.fromEntries(
        Object.entries(value.answers).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
      : {},
    score: value.score,
    correctCount: value.correctCount,
    total: value.total,
    passed: value.passed,
    passingPercentage:
      typeof value.passingPercentage === 'number'
        ? value.passingPercentage
        : INDUCTION_CONFIG.passingPercentage,
    passingMark: typeof value.passingMark === 'number' ? value.passingMark : 0,
    missedQuestionIds: Array.isArray(value.missedQuestionIds)
      ? value.missedQuestionIds.filter((id): id is string => typeof id === 'string')
      : [],
    attemptedAt: value.attemptedAt,
  };
}

function sanitizeRecord(value: unknown): ChapterProgressRecord {
  if (!isRecord(value)) return emptyRecord();
  const readingStatus =
    value.readingStatus === 'reading' || value.readingStatus === 'read'
      ? value.readingStatus
      : 'not_started';
  return {
    readingStatus,
    readingCompletedAt:
      typeof value.readingCompletedAt === 'string' ? value.readingCompletedAt : undefined,
    completed: Boolean(value.completed),
    completedAt: typeof value.completedAt === 'string' ? value.completedAt : undefined,
    lastAccessedAt:
      typeof value.lastAccessedAt === 'string' ? value.lastAccessedAt : undefined,
    lastScore: typeof value.lastScore === 'number' ? value.lastScore : undefined,
    bestScore: typeof value.bestScore === 'number' ? value.bestScore : undefined,
  };
}

function loadState(): PersistedInductionState {
  const seed = createInitialState();
  if (typeof window === 'undefined') return seed;

  try {
    const raw = window.localStorage.getItem(INDUCTION_CONFIG.storageKey);
    if (!raw) return seed;
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== INDUCTION_CONFIG.storeVersion ||
      !isRecord(parsed.chapters)
    ) {
      return seed;
    }

    const chapters = { ...seed.chapters };
    for (const [key, value] of Object.entries(parsed.chapters)) {
      const chapterNumber = Number(key);
      if (chapters[chapterNumber]) {
        chapters[chapterNumber] = sanitizeRecord(value);
      }
    }

    const attempts = Array.isArray(parsed.attempts)
      ? parsed.attempts
        .map(sanitizeAttempt)
        .filter((attempt): attempt is AssessmentAttempt => attempt !== null)
        .sort(
          (first, second) =>
            new Date(second.attemptedAt).getTime() - new Date(first.attemptedAt).getTime(),
        )
      : [];

    return {
      version: INDUCTION_CONFIG.storeVersion,
      chapters,
      attempts,
      notificationsRead: Array.isArray(parsed.notificationsRead)
        ? parsed.notificationsRead.filter((id): id is string => typeof id === 'string')
        : [],
    };
  } catch {
    return seed;
  }
}

function persist(state: PersistedInductionState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(INDUCTION_CONFIG.storageKey, JSON.stringify(state));
  } catch {
    // Private browsing or quota limits: keep the in-memory session working.
  }
}

function attemptsForChapter(state: PersistedInductionState, chapterNumber: number) {
  return state.attempts.filter((attempt) => attempt.chapterNumber === chapterNumber);
}

function latestAttemptForChapter(
  state: PersistedInductionState,
  chapterNumber: number,
): AssessmentAttempt | null {
  return attemptsForChapter(state, chapterNumber)[0] ?? null;
}

function isChapterUnlocked(
  state: PersistedInductionState,
  chapter: ChapterCatalogEntry,
): boolean {
  if (chapter.kind === 'reference') return true;
  if (state.chapters[chapter.chapterNumber]?.completed) return true;

  if (chapter.kind === 'final_assessment') {
    return LEARNING_CHAPTERS.every(
      (learningChapter) => state.chapters[learningChapter.chapterNumber]?.completed,
    );
  }

  const index = LEARNING_CHAPTERS.findIndex(
    (learningChapter) => learningChapter.chapterNumber === chapter.chapterNumber,
  );
  if (index <= 0) return true;
  return LEARNING_CHAPTERS.slice(0, index).every(
    (previous) => state.chapters[previous.chapterNumber]?.completed,
  );
}

function deriveStatus(
  state: PersistedInductionState,
  chapter: ChapterCatalogEntry,
  unlocked: boolean,
  record: ChapterProgressRecord,
): ChapterJourneyStatus {
  if (chapter.kind === 'reference') return 'available';
  if (!unlocked) return 'locked';
  if (record.completed) return 'completed';

  const latestAttempt = latestAttemptForChapter(state, chapter.chapterNumber);

  if (chapter.kind === 'final_assessment') {
    if (latestAttempt && !latestAttempt.passed) return 'assessment_failed';
    return record.readingStatus === 'reading' ? 'in_progress' : 'available';
  }

  if (record.readingStatus === 'read') {
    if (latestAttempt && !latestAttempt.passed) return 'assessment_failed';
    return 'reading_completed';
  }
  if (record.readingStatus === 'reading') return 'in_progress';
  return 'available';
}

function buildChapterView(
  state: PersistedInductionState,
  chapter: ChapterCatalogEntry,
): ChapterView {
  const record = state.chapters[chapter.chapterNumber] ?? emptyRecord();
  const unlocked = isChapterUnlocked(state, chapter);
  const attempts = attemptsForChapter(state, chapter.chapterNumber);
  const latestAttempt = attempts[0] ?? null;
  const status = deriveStatus(state, chapter, unlocked, record);

  return {
    ...chapter,
    status,
    readingStatus: record.readingStatus,
    completed: record.completed,
    readingCompletedAt: record.readingCompletedAt,
    completedAt: record.completedAt,
    lastAccessedAt: record.lastAccessedAt,
    lastScore: record.lastScore,
    bestScore: record.bestScore,
    attempts,
    latestAttempt,
    assessmentAvailable: chapter.kind === 'learning' || chapter.kind === 'final_assessment',
    isUnlocked: unlocked,
  };
}

function buildNotifications(
  state: PersistedInductionState,
  summary: InductionSummary,
): InductionNotification[] {
  const read = new Set(state.notificationsRead);
  const notifications: InductionNotification[] = [];

  if (summary.completedChapters === 0) {
    notifications.push({
      id: 'notif-welcome',
      title: 'Your induction is ready',
      message:
        'Start with Chapter 1: Welcome to MA Ventures. Take your time — your progress is saved automatically.',
      tone: 'info',
      actionLabel: 'Start Chapter 1',
      actionPath: '/induction/chapters/1',
      read: read.has('notif-welcome'),
    });
  }

  if (summary.currentChapter) {
    const current = summary.currentChapter;
    notifications.push({
      id: `notif-current-${current.chapterNumber}`,
      title:
        current.status === 'assessment_failed'
          ? `Chapter ${current.chapterNumber} needs another attempt`
          : `Continue Chapter ${current.chapterNumber}`,
      message:
        current.status === 'reading_completed'
          ? `You have finished reading "${current.title}". Your assessment is ready when you are.`
          : current.status === 'assessment_failed'
            ? `Review "${current.title}" and retry the assessment. You are closer than you think.`
            : `Pick up where you left off with "${current.title}".`,
      tone: current.status === 'assessment_failed' ? 'warning' : 'info',
      actionLabel:
        current.status === 'reading_completed' || current.status === 'assessment_failed'
          ? 'Open assessment'
          : 'Continue chapter',
      actionPath:
        current.status === 'reading_completed' || current.status === 'assessment_failed'
          ? `/induction/chapters/${current.chapterNumber}/assessment`
          : `/induction/chapters/${current.chapterNumber}`,
      read: read.has(`notif-current-${current.chapterNumber}`),
    });
  }

  if (summary.completedChapters === summary.totalLearningChapters && !summary.finalAssessment.completed) {
    notifications.push({
      id: 'notif-final-ready',
      title: 'The Grand Final Quiz is unlocked',
      message:
        'You have completed all 18 learning chapters. The final assessment is ready when you are.',
      tone: 'success',
      actionLabel: 'Open final assessment',
      actionPath: '/induction/final-assessment',
      read: read.has('notif-final-ready'),
    });
  }

  if (state.attempts[0]) {
    const attempt = state.attempts[0];
    const id = `notif-attempt-${attempt.id}`;
    notifications.push({
      id,
      title: attempt.passed ? 'Assessment passed' : 'Assessment not passed',
      message: attempt.passed
        ? `Chapter ${attempt.chapterNumber} is complete with a score of ${attempt.score}%. The next chapter is now available.`
        : `You scored ${attempt.score}% on Chapter ${attempt.chapterNumber}. Review the chapter and try again — the next chapter stays locked until you pass.`,
      tone: attempt.passed ? 'success' : 'warning',
      actionLabel: attempt.passed ? 'View result' : 'Review result',
      actionPath: `/induction/chapters/${attempt.chapterNumber}/result`,
      read: read.has(id),
    });
  }

  if (summary.finalAssessment.completed) {
    notifications.push({
      id: 'notif-induction-complete',
      title: 'Induction complete',
      message:
        'You have completed every learning chapter and the Grand Final Quiz. Welcome to the MA Ventures team.',
      tone: 'success',
      actionLabel: 'View your progress',
      actionPath: '/induction/progress',
      read: read.has('notif-induction-complete'),
    });
  }

  return notifications;
}

function buildSnapshot(state: PersistedInductionState): InductionSnapshot {
  const chapters = [
    ...LEARNING_CHAPTERS.map((chapter) => buildChapterView(state, chapter)),
    buildChapterView(state, REFERENCE_CHAPTER),
    buildChapterView(state, FINAL_ASSESSMENT_CHAPTER),
  ];

  const learningChapters = chapters
    .filter((chapter) => chapter.kind === 'learning')
    .sort((first, second) => first.chapterNumber - second.chapterNumber);
  const finalAssessment = chapters.find(
    (chapter) => chapter.kind === 'final_assessment',
  )!;
  const referenceChapter = REFERENCE_CHAPTER;

  const completedChapters = learningChapters.filter((chapter) => chapter.completed).length;
  const totalLearningChapters = learningChapters.length;
  const remainingChapters = totalLearningChapters - completedChapters;
  const lockedChapters = learningChapters.filter(
    (chapter) => chapter.status === 'locked',
  ).length;
  const overallPercentage =
    totalLearningChapters > 0
      ? Math.round((completedChapters / totalLearningChapters) * 100)
      : 0;

  const currentChapter =
    learningChapters.find(
      (chapter) => !chapter.completed && chapter.status !== 'locked',
    ) ??
    (!finalAssessment.completed && finalAssessment.isUnlocked ? finalAssessment : null);

  const nextChapter = currentChapter
    ? learningChapters.find(
      (chapter) =>
        chapter.chapterNumber > currentChapter.chapterNumber &&
        !chapter.completed &&
        chapter.status !== 'locked',
    ) ?? (finalAssessment.isUnlocked && !finalAssessment.completed ? finalAssessment : null)
    : null;

  const scoredChapters = learningChapters.filter(
    (chapter) => typeof chapter.bestScore === 'number',
  );
  const averageScore =
    scoredChapters.length > 0
      ? Math.round(
        scoredChapters.reduce((total, chapter) => total + (chapter.bestScore ?? 0), 0) /
        scoredChapters.length,
      )
      : 0;

  const lastAccessedAt = Object.values(state.chapters)
    .map((record) => record.lastAccessedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  const summary: InductionSummary = {
    totalLearningChapters,
    completedChapters,
    remainingChapters,
    lockedChapters,
    overallPercentage,
    currentChapter,
    nextChapter,
    finalAssessment,
    referenceChapter,
    averageScore,
    lastAccessedAt,
    totalAttempts: state.attempts.length,
  };

  return {
    state,
    chapters,
    learningChapters,
    finalAssessment,
    referenceChapter,
    summary,
    notifications: buildNotifications(state, summary),
  };
}

class InductionLearningStore {
  private state: PersistedInductionState = loadState();
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

  getChapter = (chapterNumber: number): ChapterView | null =>
    this.snapshot.chapters.find(
      (chapter) => chapter.chapterNumber === chapterNumber,
    ) ?? null;

  getAttempts = (chapterNumber: number): AssessmentAttempt[] =>
    attemptsForChapter(this.state, chapterNumber);

  getLatestAttempt = (chapterNumber: number): AssessmentAttempt | null =>
    latestAttemptForChapter(this.state, chapterNumber);

  startReading = (chapterNumber: number): void => {
    const chapter = this.requireChapter(chapterNumber);
    if (!chapter.isUnlocked) {
      throw new Error(
        'Complete the previous chapter assessment to unlock this chapter.',
      );
    }
    if (chapter.kind !== 'learning') {
      throw new Error('This resource does not have a reading step.');
    }
    if (chapter.completed || chapter.readingStatus === 'read') {
      this.touchChapter(chapterNumber);
      return;
    }

    const current = this.state.chapters[chapterNumber] ?? emptyRecord();
    if (current.readingStatus === 'reading') {
      this.touchChapter(chapterNumber);
      return;
    }

    this.commit({
      ...this.state,
      chapters: {
        ...this.state.chapters,
        [chapterNumber]: {
          ...current,
          readingStatus: 'reading',
          lastAccessedAt: new Date().toISOString(),
        },
      },
    });
  };

  markReadingComplete = (chapterNumber: number): void => {
    const chapter = this.requireChapter(chapterNumber);
    if (!chapter.isUnlocked) {
      throw new Error(
        'Complete the previous chapter assessment to unlock this chapter.',
      );
    }
    if (chapter.kind !== 'learning') {
      throw new Error('This resource does not have a reading step.');
    }

    const current = this.state.chapters[chapterNumber] ?? emptyRecord();
    const now = new Date().toISOString();
    this.commit({
      ...this.state,
      chapters: {
        ...this.state.chapters,
        [chapterNumber]: {
          ...current,
          readingStatus: 'read',
          readingCompletedAt: current.readingCompletedAt ?? now,
          lastAccessedAt: now,
        },
      },
    });
  };

  submitAssessment = async (
    chapterNumber: number,
    answers: Record<string, string>,
  ): Promise<AssessmentAttempt> => {
    const chapter = this.requireChapter(chapterNumber);
    if (!chapter.isUnlocked) {
      throw new Error(
        'Complete the previous chapter assessment to unlock this chapter.',
      );
    }
    if (chapter.assessmentAvailable === false) {
      throw new Error('This chapter does not have an assessment.');
    }
    if (chapter.kind === 'learning' && chapter.readingStatus !== 'read') {
      throw new Error('Read the chapter before starting its assessment.');
    }

    const result = await gradeAssessment({
      employeeId: getEmployeeId(),
      chapterId: chapter.id,
      chapterNumber,
      answers,
    });

    const previousAttempts = attemptsForChapter(this.state, chapterNumber);
    const attempt: AssessmentAttempt = {
      id: `attempt-${chapterNumber}-${Date.now()}-${previousAttempts.length + 1}`,
      employeeId: getEmployeeId(),
      chapterId: chapter.id,
      chapterNumber,
      attemptNumber: previousAttempts.length + 1,
      answers,
      score: result.score,
      correctCount: result.correctCount,
      total: result.total,
      passed: result.passed,
      passingPercentage: result.passingPercentage,
      passingMark: result.passingMark,
      missedQuestionIds: result.missedQuestionIds,
      attemptedAt: new Date().toISOString(),
    };

    const current = this.state.chapters[chapterNumber] ?? emptyRecord();
    const nextRecord: ChapterProgressRecord = {
      ...current,
      readingStatus:
        chapter.kind === 'final_assessment' ? 'read' : current.readingStatus,
      lastAccessedAt: attempt.attemptedAt,
      lastScore: attempt.score,
      bestScore: Math.max(current.bestScore ?? 0, attempt.score),
    };

    if (attempt.passed) {
      nextRecord.completed = true;
      nextRecord.completedAt = attempt.attemptedAt;
    } else if (!current.completed) {
      // A failed attempt never completes the chapter or unlocks the next one.
      nextRecord.completed = false;
    }

    this.commit({
      ...this.state,
      chapters: {
        ...this.state.chapters,
        [chapterNumber]: nextRecord,
      },
      attempts: [attempt, ...this.state.attempts],
    });

    return attempt;
  };

  markNotificationRead = (notificationId: string): void => {
    if (this.state.notificationsRead.includes(notificationId)) return;
    this.commit({
      ...this.state,
      notificationsRead: [...this.state.notificationsRead, notificationId],
    });
  };

  markAllNotificationsRead = (): void => {
    const unread = this.snapshot.notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);
    if (unread.length === 0) return;
    this.commit({
      ...this.state,
      notificationsRead: Array.from(
        new Set([...this.state.notificationsRead, ...unread]),
      ),
    });
  };

  resetProgress = (): void => {
    this.commit(createInitialState());
  };

  refreshFromStorage = (): void => {
    this.commit(loadState(), false);
  };

  private requireChapter(chapterNumber: number): ChapterView {
    const chapter = this.getChapter(chapterNumber);
    if (!chapter || chapter.kind === 'trainer') {
      throw new Error('Chapter not found.');
    }
    return chapter;
  }

  private touchChapter(chapterNumber: number): void {
    const current = this.state.chapters[chapterNumber] ?? emptyRecord();
    this.commit({
      ...this.state,
      chapters: {
        ...this.state.chapters,
        [chapterNumber]: {
          ...current,
          lastAccessedAt: new Date().toISOString(),
        },
      },
    });
  }

  private commit(nextState: PersistedInductionState, shouldPersist = true) {
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
      if (event.key === INDUCTION_CONFIG.storageKey) {
        this.commit(loadState(), false);
      }
    });
  }
}

export const inductionLearningStore = new InductionLearningStore();
