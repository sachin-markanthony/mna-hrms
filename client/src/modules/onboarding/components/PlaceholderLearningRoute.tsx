import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  Check,
} from 'lucide-react';
import type { InductionSession, InductionChapter } from '../types/induction.types';

interface PlaceholderLearningRouteProps {
  session: InductionSession | null;
  chapter: InductionChapter | null;
  onBack: () => void;
  onCompleteChapter?: (chapterId: string) => Promise<void>;
}

export const PlaceholderLearningRoute: React.FC<PlaceholderLearningRouteProps> = ({
  session,
  chapter,
  onBack,
  onCompleteChapter,
}) => {
  const [marking, setMarking] = useState(false);
  const isCompleted = chapter?.status === 'completed';

  const handleMarkComplete = async () => {
    if (!chapter || !onCompleteChapter || isCompleted) return;
    try {
      setMarking(true);
      await onCompleteChapter(chapter.id);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Back to Overview Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#DDD3C9] text-xs font-bold text-[#2B1810] hover:bg-[#FAF7F2] transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#8C6D37]" />
          <span>Back to Induction Overview</span>
        </button>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-[#FAF7F2] text-[#8C6D37] border border-[#E8DFD8]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Learning Mode</span>
        </span>
      </div>

      {/* Featured Card */}
      <div className="bg-white rounded-3xl border border-[#E5DDD5] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FBF7EE] text-[#8C6D37] border border-[#EBDCB9] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Session {session?.sessionNumber || 1} &bull; {session?.title || 'Welcome'}</span>
          </div>

          {/* Interactive Live Completion Button */}
          {onCompleteChapter && chapter && (
            <button
              onClick={handleMarkComplete}
              disabled={isCompleted || marking}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${isCompleted
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                : 'bg-[#D4AF37] hover:bg-[#C29D29] text-[#1A120B]'
                }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Completed in Database</span>
                </>
              ) : marking ? (
                <span>Syncing to Neon DB...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Mark Chapter as Completed</span>
                </>
              )}
            </button>
          )}
        </div>

        <h2 className="text-2xl font-bold text-[#2B1810] tracking-tight">
          {chapter ? `Chapter ${chapter.chapterNumber} — ${chapter.title}` : 'Selected Learning Content'}
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6 leading-relaxed">
          {chapter?.description ||
            'Detailed chapter contents, interactive lecture videos, PDF transcripts, and interactive assessments will be unlocked in Phase 2.'}
        </p>

        {/* Milestone Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EFE7DE]">
            <span className="text-[10px] uppercase font-bold text-stone-500">Duration</span>
            <p className="text-xs font-bold text-[#2B1810] mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8C6D37]" />
              <span>{chapter?.estimatedDuration || '20 mins'}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EFE7DE]">
            <span className="text-[10px] uppercase font-bold text-stone-500">Curriculum Status</span>
            <p className="text-xs font-bold text-[#2B1810] mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-[#8C6D37]'}`} />
              <span>{isCompleted ? 'Completed' : 'In Progress'}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EFE7DE]">
            <span className="text-[10px] uppercase font-bold text-stone-500">Assessment</span>
            <p className="text-xs font-bold text-[#2B1810] mt-0.5 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#8C6D37]" />
              <span>{chapter?.isAssessment ? 'Mandatory Quiz' : 'Concept Check'}</span>
            </p>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E2D8CF] text-xs text-[#2B1810] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold block text-sm">Neon PostgreSQL Connected</span>
            <p className="text-stone-600 text-xs mt-0.5">
              Progress updates persist directly to your cloud PostgreSQL database and recalculate dashboard metrics in real time.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-[#2B1810] text-[#FAF7F2] font-bold text-xs hover:bg-[#3D2217] transition shrink-0 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
