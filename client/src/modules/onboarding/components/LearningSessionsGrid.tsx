import React from 'react';
import type { InductionSession } from '../types/induction.types';
import { LearningSessionCard } from './LearningSessionCard';

interface LearningSessionsGridProps {
  sessions: InductionSession[];
  onSelectSession: (session: InductionSession) => void;
}

export const LearningSessionsGrid: React.FC<LearningSessionsGridProps> = ({
  sessions,
  onSelectSession,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#EAE2D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
              Curriculum Structure
            </span>
            <span className="text-[10px] font-semibold bg-[#F5ECE1] text-[#7A4E2D] px-2 py-0.5 rounded-md">
              7 Core Sessions
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#2B1810]">
            Employee Induction Learning Sessions
          </h3>
        </div>

        <p className="text-xs text-stone-500 max-w-md">
          Structured curriculum covering company heritage, real estate market mechanics,
          compliance regulations, and practical closing case studies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sessions.map((session) => (
          <LearningSessionCard
            key={session.id}
            session={session}
            onSelect={onSelectSession}
          />
        ))}
      </div>
    </div>
  );
};
