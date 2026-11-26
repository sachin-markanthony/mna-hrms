import { Calendar, Award, ChevronRight, XCircle, CheckCircle2, Users } from 'lucide-react';
import type { Candidate, CandidateStatus } from '../types';
import { STATUS_CONFIG } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  canEvaluate?: boolean;
  showTeamLeader?: boolean;
  onOpenDetails: (candidate: Candidate) => void;
  onEvaluateRound: (candidate: Candidate) => void;
  onQuickAdvance?: (candidateId: string, nextStatus: CandidateStatus) => void;
}

export function CandidateCard({
  candidate,
  canEvaluate = true,
  showTeamLeader = true,
  onOpenDetails,
  onEvaluateRound,
}: CandidateCardProps) {
  const statusInfo = STATUS_CONFIG[candidate.status];

  return (
    <div
      onClick={() => onOpenDetails(candidate)}
      className="group relative bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
    >
      {/* Top Header: Candidate Name, Dept & Visit Date */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              {candidate.fullName}
            </h4>
            <span
              className={`text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase border ${candidate.department === 'DIGITAL'
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
            >
              {candidate.department}
            </span>
          </div>

          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {candidate.appliedRole}
          </p>
        </div>

        <span
          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} shrink-0`}
        >
          {statusInfo.title}
        </span>
      </div>

      {/* Visit Date & Experience */}
      <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          Walk-In: <strong className="text-slate-700 dark:text-slate-300">{candidate.visitDate?.split('T')[0] || candidate.visitDate}</strong>
        </span>
        <span>
          {candidate.experienceYears} yrs exp &bull; {candidate.currentCompany || 'Direct'}
        </span>
      </div>

      {/* Team Leader Badge - Only shown for HR / Admins, not in scoped Team Lead Portal */}
      {showTeamLeader &&
        (() => {
          const tlName =
            candidate.teamLeaderName ||
            candidate.tags?.find((t) => t.startsWith('TL:'))?.replace('TL:', '');
          if (!tlName) return null;
          return (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-bold border border-amber-200 dark:border-amber-800/60 w-fit">
              <Users className="w-3 h-3 text-amber-500 shrink-0" />
              <span>TL: {tlName}</span>
            </div>
          );
        })()}

      {/* If Rejected: Show Exact Rejection Reason Banner */}
      {(candidate.status === 'REJECTED_HR' || candidate.status === 'REJECTED_MR') && (
        <div className="mt-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10px] text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wide">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>
              Rejected at {candidate.status === 'REJECTED_HR' ? 'HR Round' : 'MR Round'}
            </span>
          </div>
          <p className="mt-0.5 truncate pl-4">
            {candidate.rejectionReason || 'Reason not logged'}
          </p>
        </div>
      )}

      {/* If Selected: Show Success Banner */}
      {candidate.status === 'SELECTED' && (
        <div className="mt-2.5 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Cleared HR & MR &bull; Selected</span>
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold text-slate-400">
          Expected: {candidate.expectedSalary || 'N/A'}
        </span>

        {canEvaluate &&
        candidate.status !== 'SELECTED' &&
        candidate.status !== 'REJECTED_HR' &&
        candidate.status !== 'REJECTED_MR' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEvaluateRound(candidate);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-2xs cursor-pointer"
          >
            <Award className="w-3 h-3 text-amber-400" />
            Evaluate {candidate.status === 'MR_ROUND' ? 'MR' : 'HR'}
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(candidate);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <span>View Details</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}
