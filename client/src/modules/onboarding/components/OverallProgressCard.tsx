import React from 'react';
import { CheckCircle2, Clock, BookOpen, Layers, Award } from 'lucide-react';
import type { InductionProgress } from '../types/induction.types';

interface OverallProgressCardProps {
  progress: InductionProgress | null;
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({ progress }) => {
  const percentage = progress?.overallPercentage ?? 35;
  const completedChapters = progress?.completedChapters ?? 7;
  const totalChapters = progress?.totalChapters ?? 22;
  const completedSessions = progress?.completedSessions ?? 2;
  const totalSessions = progress?.totalSessions ?? 7;
  const remainingDuration = progress?.remainingDuration ?? '1 hour 57 minutes';

  // SVG circular progress calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-[#E5DDD5] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-[#F0EAE1]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
            Induction Progress
          </span>
          <h3 className="text-base font-bold text-[#2B1810]">
            Overall Journey Completion
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FBF7EE] text-[#8C6D37] border border-[#EBDCB9]">
          <Award className="w-3.5 h-3.5" />
          <span>{progress?.status || 'In Progress'}</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#F0EAE1"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#D4AF37"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-extrabold text-[#2B1810] font-sans">
              {percentage}%
            </span>
            <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">
              Done
            </span>
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {/* Metric 1: Chapters */}
          <div className="bg-[#FAF7F2] rounded-lg p-3 border border-[#EFE7DE]">
            <div className="flex items-center gap-2 text-stone-500 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#8C6D37]" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Chapters
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#2B1810]">
                {completedChapters}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                / {totalChapters} completed
              </span>
            </div>
            <div className="w-full bg-[#E8DFD8] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#2B1810] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedChapters / totalChapters) * 100}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Sessions */}
          <div className="bg-[#FAF7F2] rounded-lg p-3 border border-[#EFE7DE]">
            <div className="flex items-center gap-2 text-stone-500 mb-1">
              <Layers className="w-3.5 h-3.5 text-[#8C6D37]" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Sessions
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#2B1810]">
                {completedSessions}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                / {totalSessions} completed
              </span>
            </div>
            <div className="w-full bg-[#E8DFD8] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#8C6D37] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedSessions / totalSessions) * 100}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Time Remaining */}
          <div className="bg-[#FAF7F2] rounded-lg p-3 border border-[#EFE7DE]">
            <div className="flex items-center gap-2 text-stone-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#8C6D37]" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Time Remaining
              </span>
            </div>
            <div className="text-sm font-bold text-[#2B1810] leading-snug">
              {remainingDuration}
            </div>
            <div className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paced learning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
