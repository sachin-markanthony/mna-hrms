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
    <div className="bg-gradient-to-br from-[#2D1A10] to-[#1E110A] rounded-2xl p-6 sm:p-7 text-[#FAF7F2] border border-[#4D2E1C]/60 shadow-md relative overflow-hidden">
      {/* Decorative Warm Backlight */}
      <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#422616] text-[#E6C687] border border-[#D4AF37]/30 uppercase tracking-wider">
              {isStarted ? 'Continue Your Induction' : 'Start Your Induction'}
            </span>
            <span className="text-[11px] text-stone-400">
              Last accessed: Today, 11:20 AM
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#D4AF37] tracking-wide uppercase flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>
                {session ? `Session ${session.sessionNumber} — ${session.title}` : 'Session 1 — Welcome to MA Ventures'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {chapter ? `Chapter ${chapter.chapterNumber} — ${chapter.title}` : 'Chapter 1 — Welcome to MA Ventures'}
            </h3>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed font-sans">
            {chapter?.description ||
              'Explore company mission, real estate operations, leadership philosophy and professional onboarding pathways.'}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-stone-300 pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Est. {chapter?.estimatedDuration || '20 mins'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Chapter Progress: {chapter?.progressPercentage || 0}%</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={onContinue}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#C9A028] text-[#1A120B] font-bold text-xs uppercase tracking-wider transition shadow-md hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#1A120B] text-[#D4AF37] flex items-center justify-center">
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
