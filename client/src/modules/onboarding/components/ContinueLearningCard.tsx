import React from 'react';
import { Play, Clock, ArrowRight, BookOpen, Layers } from 'lucide-react';
import type { InductionChapter, InductionSession } from '../types/induction.types';

interface ContinueLearningCardProps {
  chapter: InductionChapter | null;
  session: InductionSession | null;
  onContinue: () => void;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  chapter,
  session,
  onContinue,
}) => {
  const isStarted = !!chapter;

  return (
    <div className="induction-hero-surface relative overflow-hidden rounded-2xl p-6 sm:p-7">
      <div className="induction-hero-glow absolute right-0 bottom-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="induction-hero-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {isStarted ? 'Continue Your Induction' : 'Start Your Induction'}
            </span>
            <span className="induction-hero-muted text-[11px]">
              Last accessed: Today, 11:20 AM
            </span>
          </div>

          <div>
            <div className="induction-hero-accent text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>
                {session ? `Session ${session.sessionNumber} — ${session.title}` : 'Session 1 — Welcome to MA Ventures'}
              </span>
            </div>
            <h3 className="induction-hero-title text-xl sm:text-2xl font-bold tracking-tight">
              {chapter ? `Chapter ${chapter.chapterNumber} — ${chapter.title}` : 'Chapter 1 — Welcome to MA Ventures'}
            </h3>
          </div>

          <p className="induction-hero-muted text-xs leading-relaxed font-sans">
            {chapter?.description ||
              'Explore company mission, real estate operations, leadership philosophy and professional onboarding pathways.'}
          </p>

          <div className="induction-hero-muted flex items-center gap-4 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="induction-hero-accent w-3.5 h-3.5" />
              <span>Est. {chapter?.estimatedDuration || '20 mins'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="induction-hero-accent w-3.5 h-3.5" />
              <span>Chapter Progress: {chapter?.progressPercentage || 0}%</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={onContinue}
            className="induction-primary-button w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition hover:scale-[1.02] cursor-pointer"
          >
            <div className="induction-hero-icon-disc w-6 h-6 rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>
            <span>{isStarted ? 'Continue Chapter' : 'Start Chapter 1'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
