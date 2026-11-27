import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  LockKeyhole,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { ChapterView } from '../../types/learning.types';
import {
  formatMinutes,
  formatShortDate,
  getAssessmentLabel,
  getChapterStatusMeta,
  getReadingLabel,
} from '../../utils/chapterStatus';
import { StatusPill } from '../ui/StatusPill';
import { buttonStyles } from '../ui/Button';

interface ChapterCardProps {
  chapter: ChapterView;
  showConnector?: boolean;
}

const CARD_STYLES: Record<ChapterView['status'], string> = {
  locked: 'border-[#E7E0D8] bg-[#F7F4F0]',
  available: 'border-[#E9DED2] bg-white shadow-[0_6px_24px_rgba(59,35,20,0.04)]',
  in_progress:
    'border-[#E6C687] bg-[#FFFCF7] shadow-[0_10px_30px_rgba(184,137,58,0.12)]',
  reading_completed: 'border-[#CFE0E6] bg-[#F8FBFC]',
  assessment_failed: 'border-[#EFD6B4] bg-[#FFFBF5]',
  completed: 'border-[#CFE3D6] bg-[#FBFDFB]',
};

const NODE_STYLES: Record<ChapterView['status'], string> = {
  locked: 'border-[#E3DCD4] bg-[#F3EFEA] text-[#A09182]',
  available: 'border-[#E8D9C2] bg-[#FBF5EA] text-[#9A7A45]',
  in_progress: 'border-[#D8B777] bg-[#B8893A] text-white',
  reading_completed: 'border-[#B9D3DC] bg-[#4F7C8A] text-white',
  assessment_failed: 'border-[#E2B77D] bg-[#C58A3A] text-white',
  completed: 'border-[#A9C9B4] bg-[#4F7F61] text-white',
};

export function ChapterCard({ chapter, showConnector = true }: ChapterCardProps) {
  const meta = getChapterStatusMeta(chapter);
  const isFinal = chapter.kind === 'final_assessment';

  const nodeIcon =
    chapter.status === 'completed' ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : chapter.status === 'locked' ? (
      <LockKeyhole className="h-4 w-4" />
    ) : chapter.status === 'in_progress' ? (
      <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
    ) : chapter.status === 'reading_completed' ? (
      <BookOpen className="h-4 w-4" />
    ) : chapter.status === 'assessment_failed' ? (
      <AlertCircle className="h-4 w-4" />
    ) : isFinal ? (
      <Trophy className="h-4 w-4" />
    ) : (
      <span className="text-[11px] font-extrabold">{chapter.chapterNumber}</span>
    );

  return (
    <div className="relative pb-4 pl-11 sm:pl-14">
      {showConnector && (
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-10 h-[calc(100%-1rem)] w-px bg-[#E7DCCF] sm:left-[21px]"
        />
      )}
      <span
        className={`absolute left-0 top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm sm:h-11 sm:w-11 ${NODE_STYLES[chapter.status]}`}
      >
        {nodeIcon}
      </span>

      <article
        className={`rounded-2xl border p-4 transition sm:p-5 ${
          CARD_STYLES[chapter.status]
        } ${chapter.status === 'locked' ? 'opacity-80' : ''} ${
          isFinal ? 'border-[#E2C48E]' : ''
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#A09182]">
                {isFinal ? 'Final assessment' : `Chapter ${chapter.chapterNumber}`}
              </span>
              <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
              {chapter.status === 'completed' && typeof chapter.bestScore === 'number' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF6F0] px-2 py-0.5 text-[9.5px] font-bold text-[#356B4A]">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {chapter.bestScore}% score
                </span>
              )}
              {chapter.status === 'assessment_failed' && chapter.latestAttempt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF3E1] px-2 py-0.5 text-[9.5px] font-bold text-[#9A6420]">
                  <RotateCcw className="h-2.5 w-2.5" />
                  Attempt {chapter.latestAttempt.attemptNumber}
                </span>
              )}
            </div>

            <h3
              className={`mt-1.5 text-[13.5px] font-extrabold leading-snug sm:text-sm ${
                chapter.status === 'locked' ? 'text-[#8A7F74]' : 'text-[#3B2314]'
              }`}
            >
              {isFinal ? chapter.title : `Chapter ${chapter.chapterNumber} — ${chapter.title}`}
            </h3>
            <p
              className={`mt-1 max-w-2xl text-[11px] leading-5 ${
                chapter.status === 'locked' ? 'text-[#9A9087]' : 'text-[#7A6A5C]'
              }`}
            >
              {chapter.description}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 text-[9.5px] font-semibold text-[#A09182]">
            <Clock3 className="h-3 w-3" />
            {formatMinutes(chapter.estimatedMinutes)}
          </span>
        </div>

        {chapter.status !== 'locked' && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#F0E7DC] pt-3 text-[10px] font-semibold text-[#8A7A6C]">
            {!isFinal && (
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3 w-3 text-[#B8893A]" />
                {getReadingLabel(chapter.readingStatus)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <ClipboardCheck className="h-3 w-3 text-[#B8893A]" />
              {getAssessmentLabel(chapter)}
            </span>
            {chapter.completedAt && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-[#4F7F61]" />
                Completed {formatShortDate(chapter.completedAt)}
              </span>
            )}
            {chapter.attempts.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="h-3 w-3 text-[#A09182]" />
                {chapter.attempts.length} attempt{chapter.attempts.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        )}

        {chapter.status === 'locked' ? (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#E7E0D8] bg-white/60 px-3 py-2">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A09182]" />
            <p className="text-[10px] font-semibold leading-5 text-[#8A7F74]">
              {meta.helper}
            </p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-medium leading-5 text-[#8A7A6C]">{meta.helper}</p>
            <div className="flex flex-wrap items-center gap-2">
              {meta.secondaryPath && meta.secondaryLabel && (
                <Link
                  to={meta.secondaryPath}
                  className={buttonStyles('secondary', 'sm', 'w-full sm:w-auto')}
                >
                  {meta.secondaryLabel}
                </Link>
              )}
              {meta.primaryPath && meta.primaryLabel && (
                <Link
                  to={meta.primaryPath}
                  className={buttonStyles(
                    chapter.status === 'completed' ? 'secondary' : 'primary',
                    'sm',
                    'w-full sm:w-auto',
                  )}
                >
                  {meta.primaryLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {chapter.status === 'completed' && (
          <div className="mt-3 flex items-center gap-1.5 text-[9.5px] font-bold text-[#4F7F61]">
            <Sparkles className="h-3 w-3" />
            Chapter complete — the next chapter is unlocked.
          </div>
        )}
      </article>
    </div>
  );
}
