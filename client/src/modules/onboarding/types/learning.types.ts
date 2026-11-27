import type { LearnerAssessment } from '../data/assessmentBank';
import type { LearnerHandbookDocument } from '../data/handbookContent';

export type ChapterKind = 'learning' | 'final_assessment' | 'reference' | 'trainer';

/** Reading is tracked independently from assessment completion. */
export type ReadingStatus = 'not_started' | 'reading' | 'read';

/**
 * Derived chapter journey state used by the roadmap and guards.
 * - locked: a previous chapter has not been passed
 * - available: unlocked but not opened yet
 * - in_progress: reading has started
 * - reading_completed: reading is done, assessment not passed yet
 * - assessment_failed: reading is done and the last attempt failed
 * - completed: assessment passed
 */
export type ChapterJourneyStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'reading_completed'
  | 'assessment_failed'
  | 'completed';

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  fullName: string;
  firstName: string;
  department: string;
  designation: string;
  email: string;
  joiningDate: string;
  avatarUrl?: string;
}

export interface ChapterCatalogEntry {
  chapterNumber: number;
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  kind: ChapterKind;
  moduleLabel: string;
  moduleNumber: number;
}

export interface AssessmentAttempt {
  id: string;
  employeeId: string;
  chapterId: string;
  chapterNumber: number;
  attemptNumber: number;
  answers: Record<string, string>;
  score: number;
  correctCount: number;
  total: number;
  passed: boolean;
  passingPercentage: number;
  passingMark: number;
  missedQuestionIds: string[];
  attemptedAt: string;
}

export interface ChapterProgressRecord {
  readingStatus: ReadingStatus;
  readingCompletedAt?: string;
  completed: boolean;
  completedAt?: string;
  lastAccessedAt?: string;
  lastScore?: number;
  bestScore?: number;
}

export interface ChapterView extends ChapterCatalogEntry {
  status: ChapterJourneyStatus;
  readingStatus: ReadingStatus;
  completed: boolean;
  readingCompletedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  lastScore?: number;
  bestScore?: number;
  attempts: AssessmentAttempt[];
  latestAttempt: AssessmentAttempt | null;
  assessmentAvailable: boolean;
  isUnlocked: boolean;
}

export interface InductionSummary {
  totalLearningChapters: number;
  completedChapters: number;
  remainingChapters: number;
  lockedChapters: number;
  overallPercentage: number;
  currentChapter: ChapterView | null;
  nextChapter: ChapterView | null;
  finalAssessment: ChapterView;
  referenceChapter: ChapterCatalogEntry;
  averageScore: number;
  lastAccessedAt?: string;
  totalAttempts: number;
}

export interface InductionNotification {
  id: string;
  title: string;
  message: string;
  tone: 'info' | 'success' | 'warning';
  actionLabel?: string;
  actionPath?: string;
  read: boolean;
}

export interface ChapterLearningContent {
  chapter: ChapterView;
  document: LearnerHandbookDocument | null;
  assessment: LearnerAssessment | null;
}

export interface AssessmentSubmissionResult {
  attempt: AssessmentAttempt;
  nextChapter: ChapterView | null;
}
