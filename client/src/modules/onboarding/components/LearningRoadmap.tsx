import React from 'react';
import { CheckCircle2, Lock, Play, MapPin } from 'lucide-react';
import type { InductionSession } from '../types/induction.types';

interface LearningRoadmapProps {
  sessions: InductionSession[];
  onSelectSession: (session: InductionSession) => void;
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({
  sessions,
  onSelectSession,
}) => {
  return (
    <div className="bg-white rounded-lg border border-[#E5DDD5] p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive Roadmap</span>
          </div>
          <h3 className="text-base font-bold text-[#2B1810]">
            Induction Learning Journey Milestones
          </h3>
        </div>
        <p className="text-xs text-stone-500">
          Welcome &rarr; Real Estate Fundamentals &rarr; Brokerage &rarr; Customer Experience &rarr; Compliance &rarr; Team Performance &rarr; Assessment
        </p>
      </div>

      {/* Desktop Horizontal Stepper / Mobile Vertical Timeline */}
      <div className="hidden lg:flex items-start justify-between relative py-2">
        {/* Horizontal Connector Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#EAE2D8] -z-0" />

        {sessions.map((session) => {
          const isCompleted = session.status === 'completed';
          const isInProgress = session.status === 'in_progress';
          const isLocked = session.status === 'locked';

          return (
            <div
              key={session.id}
              onClick={() => !isLocked && onSelectSession(session)}
              className={`relative z-10 flex flex-col items-center group ${isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                } flex-1 px-1`}
            >
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 border-2 shadow-2xs ${isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200'
                  : isInProgress
                    ? 'bg-[#2B1810] border-[#D4AF37] text-[#D4AF37] ring-4 ring-[#D4AF37]/20 scale-105'
                    : isLocked
                      ? 'bg-stone-100 border-stone-300 text-stone-400'
                      : 'bg-white border-[#8C6D37] text-[#8C6D37]'
                  }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isInProgress ? (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-stone-400" />
                ) : (
                  <span className="text-xs font-bold font-mono">0{session.sessionNumber}</span>
                )}
              </div>

              {/* Title & Stage Details */}
              <div className="text-center mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37] block">
                  Session {session.sessionNumber}
                </span>
                <p className="text-xs font-bold text-[#2B1810] group-hover:text-[#8C6D37] transition leading-tight mt-0.5 max-w-[120px] mx-auto">
                  {session.subtitle || session.title}
                </p>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Ch. {session.chapterStart}–{session.chapterEnd}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet Vertical Roadmap */}
      <div className="lg:hidden space-y-3 relative pl-4 border-l-2 border-[#EAE2D8] ml-3">
        {sessions.map((session) => {
          const isCompleted = session.status === 'completed';
          const isInProgress = session.status === 'in_progress';
          const isLocked = session.status === 'locked';

          return (
            <div
              key={session.id}
              onClick={() => !isLocked && onSelectSession(session)}
              className={`relative pl-4 py-2 flex items-start gap-3 rounded-lg transition ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-[#FAF7F2]'
                }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold ${isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : isInProgress
                    ? 'bg-[#2B1810] border-[#D4AF37] text-[#D4AF37]'
                    : isLocked
                      ? 'bg-stone-100 border-stone-300 text-stone-400'
                      : 'bg-white border-[#8C6D37] text-[#8C6D37]'
                  }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : session.sessionNumber}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2B1810]">
                    Session {session.sessionNumber}: {session.title}
                  </span>
                  <span className="text-[10px] font-medium text-stone-500">
                    Ch. {session.chapterStart}–{session.chapterEnd}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-1">{session.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
