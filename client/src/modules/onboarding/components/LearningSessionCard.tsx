import React from 'react';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
} from 'lucide-react';
import type { InductionSession } from '../types/induction.types';

interface LearningSessionCardProps {
  session: InductionSession;
  onSelect: (session: InductionSession) => void;
}

export const LearningSessionCard: React.FC<LearningSessionCardProps> = ({
  session,
  onSelect,
}) => {
  const isLocked = session.status === 'locked';
  const isCompleted = session.status === 'completed';
  const isInProgress = session.status === 'in_progress';

  // Badge configuration based on status
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Completed
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF8EB] text-[#8C6D37] border border-[#ECD9B5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          In Progress
        </span>
      );
    }
    if (isLocked) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
          <Lock className="w-3 h-3 text-stone-400" />
          Locked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
        Not Started
      </span>
    );
  };

  // Button text & style
  const getAction = () => {
    if (isLocked) {
      return {
        label: 'Locked',
        icon: Lock,
        disabled: true,
        className: 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200',
      };
    }
    if (isCompleted) {
      return {
        label: 'Review Session',
        icon: ArrowRight,
        disabled: false,
        className: 'bg-white hover:bg-[#FAF7F2] text-[#2B1810] border border-[#DDD3C9] hover:border-[#8C6D37]',
      };
    }
    if (isInProgress) {
      return {
        label: 'Continue',
        icon: Play,
        disabled: false,
        className: 'bg-[#2B1810] hover:bg-[#3D2217] text-white shadow-xs',
      };
    }
    return {
      label: 'Start Session',
      icon: Play,
      disabled: false,
      className: 'bg-[#8C6D37] hover:bg-[#785D2E] text-white shadow-xs',
    };
  };

  const action = getAction();
  const ActionIcon = action.icon;
  const chapterCount = session.chapterEnd - session.chapterStart + 1;

  return (
    <div
      onClick={() => !isLocked && onSelect(session)}
      className={`relative flex flex-col justify-between bg-white rounded-2xl border transition-all duration-200 p-5 ${
        isLocked
          ? 'border-[#EAE4DF] opacity-85 cursor-not-allowed bg-[#FAF8F5]'
          : 'border-[#E2D8CF] hover:border-[#8C6D37] hover:shadow-md cursor-pointer'
      }`}
    >
      <div>
        {/* Top Header: Session Number & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#2B1810] text-[#E6C687] text-[11px] font-bold flex items-center justify-center font-mono">
              0{session.sessionNumber}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D37]">
              Session {session.sessionNumber}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Title & Handbook Chapter Range */}
        <h4 className="text-sm font-bold text-[#2B1810] leading-snug line-clamp-1 mb-1">
          {session.title}
        </h4>

        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium mb-2.5">
          <BookOpen className="w-3.5 h-3.5 text-[#8C6D37]" />
          <span>
            Chapters {session.chapterStart}–{session.chapterEnd} ({chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'})
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {session.description}
        </p>
      </div>

      {/* Progress & Card Footer */}
      <div>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Progress</span>
            <span className="font-bold text-[#2B1810]">{session.progressPercentage}%</span>
          </div>
          <div className="w-full bg-[#EFE9E2] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-600' : 'bg-[#8C6D37]'
              }`}
              style={{ width: `${session.progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F0EAE1]">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#8C6D37]" />
            <span>{session.estimatedDuration}</span>
          </div>

          <button
            disabled={action.disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) onSelect(session);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${action.className}`}
          >
            <span>{action.label}</span>
            <ActionIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
