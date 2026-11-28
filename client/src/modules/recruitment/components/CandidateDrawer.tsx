import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Star,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Award,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Users,
  FileCheck,
  Lock,
  ArrowRight,
  Save,
} from 'lucide-react';
import { recruitmentApi } from '../recruitment.api';
import { notifyError, notifySuccess } from '../../../services/toast';
import type { Candidate, RecruitmentDepartment, TeamLeaderSummary } from '../types';
import { STATUS_CONFIG } from '../types';

interface CandidateDrawerProps {
  candidate: Candidate | null;
  isOpen: boolean;
  canEvaluate?: boolean;
  canEvaluateMr?: boolean;
  showTeamLeader?: boolean;
  onClose: () => void;
  onVerified?: (updated: Candidate) => void;
  onEvaluateRound: (candidate: Candidate) => void;
}

export function CandidateDrawer({
  candidate,
  isOpen,
  canEvaluate = true,
  canEvaluateMr = false,
  showTeamLeader = true,
  onClose,
  onVerified,
  onEvaluateRound,
}: CandidateDrawerProps) {
  const navigate = useNavigate();
  const [teamLeaders, setTeamLeaders] = useState<TeamLeaderSummary[]>([]);
  const [dept, setDept] = useState<RecruitmentDepartment>('SALES');
  const [appliedRole, setAppliedRole] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [teamLeaderId, setTeamLeaderId] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');
  const [savingVerify, setSavingVerify] = useState(false);

  useEffect(() => {
    if (!isOpen || !candidate) return;
    setDept(candidate.department);
    setAppliedRole(candidate.appliedRole);
    setExpectedSalary(candidate.expectedSalary || '');
    setTeamLeaderId(candidate.teamLeaderId || '');
    setConfidentialNotes(candidate.confidentialNotes || '');
    if (canEvaluate) {
      recruitmentApi.getTeamLeaders().then(setTeamLeaders).catch(() => {});
    }
  }, [isOpen, candidate, canEvaluate]);

  if (!isOpen || !candidate) return null;

  const handleVerifySave = async (proceedToHr: boolean) => {
    try {
      setSavingVerify(true);
      const selectedTl = teamLeaders.find((tl) => tl.id === teamLeaderId);
      const updated = await recruitmentApi.verifyCandidate(candidate.id, {
        department: dept,
        appliedRole: appliedRole.trim() || candidate.appliedRole,
        expectedSalary: expectedSalary.trim() || undefined,
        teamLeaderId: teamLeaderId || undefined,
        teamLeaderName: selectedTl?.name || undefined,
        confidentialNotes: confidentialNotes.trim() || undefined,
        proceedToHr,
      });
      notifySuccess(
        proceedToHr
          ? `${updated.fullName} verified & forwarded to HR Round!`
          : 'Walk-in verification & confidential details saved.',
      );
      onVerified?.(updated);
    } catch (err: any) {
      notifyError(err, 'Failed to save verification details.');
    } finally {
      setSavingVerify(false);
    }
  };

  const statusInfo = STATUS_CONFIG[candidate.status];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-[#0f172a] shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {candidate.fullName}
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
              >
                {statusInfo.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <strong className="text-slate-800 dark:text-slate-200">
                {candidate.department} Department
              </strong>{' '}
              &bull; {candidate.appliedRole}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rejection Alert Banner (if candidate was rejected) */}
          {(candidate.status === 'REJECTED_HR' || candidate.status === 'REJECTED_MR') && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  Disqualified at{' '}
                  {candidate.status === 'REJECTED_HR' ? 'Round 1 (HR Round)' : 'Round 2 (MR Round)'}
                </span>
              </div>
              <p className="text-xs pl-6">
                <strong>Reason: </strong>
                {candidate.rejectionReason || 'Reason not specified.'}
              </p>
            </div>
          )}

          {/* Selection Banner */}
          {candidate.status === 'SELECTED' && (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Candidate has cleared both HR & MR Rounds and is Selected for Offer!</span>
            </div>
          )}

          {/* Quick Contact & Visit Info Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-[#072b53] dark:text-amber-400" />
              <span>
                <strong>Visit Date: </strong>
                {candidate.visitDate?.split('T')[0] || candidate.visitDate}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-[#072b53] dark:text-amber-400" />
              <span>
                <strong>Dept: </strong>
                {candidate.department}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{candidate.experienceYears} Yrs Experience</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-700 dark:text-slate-300">Expected:</span>
              <span>{candidate.expectedSalary || 'Not Disclosed'}</span>
            </div>

            {showTeamLeader &&
              (() => {
                const tlName =
                  candidate.teamLeaderName ||
                  candidate.tags?.find((t) => t.startsWith('TL:'))?.replace('TL:', '');
                if (!tlName) return null;
                return (
                  <div className="col-span-2 flex items-center gap-2 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 font-medium">
                    <Users className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      <strong>Assigned Team Leader: </strong>
                      {tlName}
                    </span>
                  </div>
                );
              })()}
          </div>

          {/* HR Verification, Team Lead & Confidential Notes (Walk-In Stage) */}
          {canEvaluate && candidate.status === 'REGISTERED' && (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#072b53] dark:text-amber-300">
                  <Lock className="w-4 h-4 text-amber-600" />
                  HR Verification &amp; Confidential Assignment
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Walk-In Review
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value as RecruitmentDepartment)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="SALES">Sales &amp; Leasing</option>
                    <option value="DIGITAL">Digital Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Assign Team Lead
                  </label>
                  <select
                    value={teamLeaderId}
                    onChange={(e) => setTeamLeaderId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="">-- Select Team Lead --</option>
                    {teamLeaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.name} ({tl.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Applied Role
                  </label>
                  <input
                    type="text"
                    value={appliedRole}
                    onChange={(e) => setAppliedRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Validated Expected CTC
                  </label>
                  <input
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. ₹4,80,000 / yr"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Company Confidential Notes (HR &amp; MR Only)
                </label>
                <textarea
                  rows={2}
                  value={confidentialNotes}
                  onChange={(e) => setConfidentialNotes(e.target.value)}
                  placeholder="Salary band approval, internal referral notes, background remarks..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={savingVerify}
                  onClick={() => void handleVerifySave(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Details
                </button>
                <button
                  type="button"
                  disabled={savingVerify}
                  onClick={() => void handleVerifySave(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#072b53] hover:bg-[#0a3869] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Proceed to HR Round
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* Confidential Notes Display (HR & MR only, after Walk-In stage) */}
          {showTeamLeader && candidate.status !== 'REGISTERED' && candidate.confidentialNotes && (
            <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <Lock className="w-3.5 h-3.5" />
                Confidential HR / Management Notes
              </div>
              <p className="text-slate-700 dark:text-slate-300">{candidate.confidentialNotes}</p>
              {candidate.hrVerifiedBy && (
                <p className="text-[10px] text-slate-400">
                  Verified by {candidate.hrVerifiedBy}
                </p>
              )}
            </div>
          )}

          {/* Two-Round Evaluation Tracking Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Interview Evaluation Rounds (2 Rounds Only)
            </h3>

            {/* Round 1: HR Round */}
            <div
              className={`p-4 rounded-lg border transition-all ${candidate.status === 'REJECTED_HR'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  : candidate.hrEvaluatedAt
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Round 1: HR Round
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Initial screening, culture & compensation alignment
                  </p>
                </div>

                {candidate.hrEvaluatedAt ? (
                  candidate.status === 'REJECTED_HR' ? (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Pending Evaluation</span>
                )}
              </div>

              {candidate.hrEvaluatedAt && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Evaluated by <strong>{candidate.hrInterviewer}</strong>
                    </span>
                    {candidate.hrRating && (
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {candidate.hrRating}.0 / 5.0
                      </span>
                    )}
                  </div>
                  {candidate.hrFeedback && (
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                      &ldquo;{candidate.hrFeedback}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Round 2: MR Round (Management Round) */}
            <div
              className={`p-4 rounded-lg border transition-all ${candidate.status === 'REJECTED_MR'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  : candidate.status === 'SELECTED'
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Round 2: MR Round (Management Round)
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Final technical/commercial deep dive & hire authority
                  </p>
                </div>

                {candidate.mrEvaluatedAt ? (
                  candidate.status === 'REJECTED_MR' ? (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejected at MR
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    {candidate.status === 'REJECTED_HR' ? 'Ineligible (Failed HR)' : 'Pending MR'}
                  </span>
                )}
              </div>

              {candidate.mrEvaluatedAt && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Evaluated by <strong>{candidate.mrInterviewer}</strong>
                    </span>
                    {candidate.mrRating && (
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {candidate.mrRating}.0 / 5.0
                      </span>
                    )}
                  </div>
                  {candidate.mrFeedback && (
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                      &ldquo;{candidate.mrFeedback}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {candidate.status === 'SELECTED' && canEvaluate && (
            <button
              onClick={() => {
                onClose();
                navigate(`/letters?candidateId=${candidate.id}`);
              }}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-200" />
              Issue Official Offer Letter
            </button>
          )}

          {canEvaluate && candidate.status === 'HR_ROUND' && (
            <button
              onClick={() => onEvaluateRound(candidate)}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              Evaluate HR Round
            </button>
          )}

          {candidate.status === 'MR_ROUND' &&
            (canEvaluateMr ? (
              <button
                onClick={() => onEvaluateRound(candidate)}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                Evaluate MR Round
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                Awaiting MR Evaluation (Team Lead / Management)
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
