export type SessionStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';
export type ChapterStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  designation: string;
  joiningDate: string;
  profileImage?: string;
  email?: string;
}

export interface InductionChapter {
  id: string;
  chapterNumber: number;
  title: string;
  sessionId: string;
  estimatedDuration: string;
  description: string;
  status: ChapterStatus;
  progressPercentage: number;
  isAssessment?: boolean;
  isResource?: boolean;
  quizAvailable?: boolean;
  lastScore?: number;
  bestScore?: number;
}

export interface InductionSession {
  id: string;
  sessionNumber: number;
  title: string;
  subtitle?: string;
  description: string;
  chapterStart: number;
  chapterEnd: number;
  estimatedDuration: string;
  status: SessionStatus;
  progressPercentage: number;
  chapterIds: string[];
}

export interface InductionProgress {
  employeeId: string;
  totalChapters: number;
  completedChapters: number;
  overallPercentage: number;
  currentSessionId: string;
  currentChapterId: string;
  lastAccessedAt: string;
  completedSessions: number;
  totalSessions: number;
  remainingDuration: string;
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed';
  pendingAssessments?: number;
  averageScore?: number;
}

export interface InductionNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'action';
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

export interface HandbookHighlight {
  id: string;
  title: string;
  description: string;
  iconName: string;
}
