import type { ChapterStatus, InductionChapter, InductionProgress } from './induction.types';

export type HandbookCalloutTone = 'important' | 'info' | 'example' | 'tip';

export type HandbookBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'callout'; tone: HandbookCalloutTone; label: string; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface HandbookSection {
  heading: string;
  blocks: HandbookBlock[];
}

export interface HandbookQuizOption {
  key: string;
  text: string;
}

export interface HandbookQuizQuestion {
  id: string;
  number: number;
  prompt: string;
  options: HandbookQuizOption[];
  correctOption: string;
}

export interface HandbookQuiz {
  passingScore: number;
  questions: HandbookQuizQuestion[];
}

export type HandbookQuizForLearner = Omit<HandbookQuiz, 'questions'> & {
  questions: Array<Omit<HandbookQuizQuestion, 'correctOption'>>;
};

export interface HandbookDocument {
  chapterNumber: number;
  title: string;
  summary: string;
  sections: HandbookSection[];
  takeaways: string[];
  quiz: HandbookQuiz | null;
}

export interface QuizAttempt {
  chapterId: string;
  chapterNumber: number;
  score: number;
  correctCount: number;
  total: number;
  passed: boolean;
  attemptedAt: string;
}

export interface QuizEvaluation extends QuizAttempt {
  answers: Record<string, string>;
  passingScore: number;
}

export interface ChapterProgressRecord {
  status: ChapterStatus;
  progressPercentage: number;
  lastAccessedAt?: string;
  completedAt?: string;
  lastScore?: number;
  bestScore?: number;
}

export interface TrainingSummary {
  overallPercentage: number;
  completedChapters: number;
  totalChapters: number;
  completedSessions: number;
  totalSessions: number;
  status: InductionProgress['status'];
  nextChapter: InductionChapter | null;
  nextSession: { id: string; title: string; sessionNumber: number } | null;
  pendingAssessments: number;
  averageScore: number;
  lastAttempt: QuizAttempt | null;
  lastAccessedAt: string;
  totalDocuments: number;
  totalQuestions: number;
}
