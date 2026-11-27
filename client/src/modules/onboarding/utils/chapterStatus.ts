import type { ChapterView, ReadingStatus } from '../types/learning.types';
import type { StatusTone } from '../components/ui/StatusPill';

export interface ChapterStatusMeta {
  tone: StatusTone;
  label: string;
  helper: string;
  primaryLabel?: string;
  primaryPath?: string;
  secondaryLabel?: string;
  secondaryPath?: string;
}

export function getChapterStatusMeta(chapter: ChapterView): ChapterStatusMeta {
  const base = `/induction/chapters/${chapter.chapterNumber}`;
  const assessment = `${base}/assessment`;
  const result = `${base}/result`;
  const isFinal = chapter.kind === 'final_assessment';

  if (chapter.status === 'locked') {
    return {
      tone: 'locked',
      label: 'Locked',
      helper: isFinal
        ? 'Complete all 18 learning chapters to unlock the final assessment.'
        : 'Complete the previous chapter to unlock this chapter.',
    };
  }

  if (chapter.status === 'completed') {
    return {
      tone: 'completed',
      label: isFinal ? 'Final Assessment Passed' : 'Completed',
      helper: chapter.bestScore
        ? `Best score ${chapter.bestScore}% · ${chapter.attempts.length} attempt${chapter.attempts.length === 1 ? '' : 's'}`
        : 'Chapter completed',
      primaryLabel: isFinal ? 'View Result' : 'Review Chapter',
      primaryPath: isFinal ? result : base,
      secondaryLabel: isFinal ? undefined : 'Retake Assessment',
      secondaryPath: isFinal ? undefined : assessment,
    };
  }

  if (chapter.status === 'assessment_failed') {
    return {
      tone: 'failed',
      label: 'Assessment Not Passed',
      helper: 'You are almost there. Review the chapter and give it another try.',
      primaryLabel: isFinal ? 'Retry Final Assessment' : 'Retry Assessment',
      primaryPath: isFinal ? '/induction/final-assessment' : assessment,
      secondaryLabel: 'Review Chapter',
      secondaryPath: isFinal ? '/induction/chapters' : base,
    };
  }

  if (chapter.status === 'reading_completed') {
    return {
      tone: 'reading',
      label: 'Ready for Assessment',
      helper: 'Reading complete. Your assessment is ready when you are.',
      primaryLabel: 'Take Assessment',
      primaryPath: assessment,
      secondaryLabel: 'Review Chapter',
      secondaryPath: base,
    };
  }

  if (chapter.status === 'in_progress') {
    return {
      tone: 'progress',
      label: 'In Progress',
      helper: 'You have started this chapter. Pick up where you left off.',
      primaryLabel: 'Continue Chapter',
      primaryPath: base,
    };
  }

  return {
    tone: 'available',
    label: isFinal ? 'Final Assessment Ready' : 'Ready to begin',
    helper: isFinal
      ? 'All learning chapters are complete. The final assessment is ready.'
      : 'This chapter is unlocked and ready for you.',
    primaryLabel: isFinal ? 'Start Final Assessment' : 'Start Chapter',
    primaryPath: isFinal ? '/induction/final-assessment' : base,
  };
}

export function getReadingLabel(status: ReadingStatus): string {
  switch (status) {
    case 'read':
      return 'Reading completed';
    case 'reading':
      return 'Reading in progress';
    default:
      return 'Not started';
  }
}

export function getAssessmentLabel(chapter: ChapterView): string {
  if (chapter.kind === 'reference') return 'Reference only';
  if (chapter.status === 'locked') return 'Locked';
  if (chapter.status === 'available' || chapter.status === 'in_progress') {
    return 'Not attempted';
  }
  if (chapter.latestAttempt) {
    return chapter.latestAttempt.passed
      ? `Passed · ${chapter.latestAttempt.score}%`
      : `Not passed · ${chapter.latestAttempt.score}%`;
  }
  return chapter.readingStatus === 'read' ? 'Ready to start' : 'Awaiting reading';
}

export function getMotivationalMessage(percentage: number): string {
  if (percentage >= 100) {
    return 'Congratulations! You have completed your induction learning journey. Welcome to the MA Ventures team.';
  }
  if (percentage >= 75) {
    return "You're in the final stretch. Keep going — your induction completion is within reach.";
  }
  if (percentage >= 50) {
    return "You're making great progress. Keep going — you're one step closer to completing your induction!";
  }
  if (percentage > 0) {
    return 'A strong start. Each chapter builds your confidence and prepares you for the next conversation.';
  }
  return 'Your journey starts here. Take your time, explore each chapter, and build the knowledge you need to succeed.';
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function formatDateTime(value?: string): string {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not yet';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
