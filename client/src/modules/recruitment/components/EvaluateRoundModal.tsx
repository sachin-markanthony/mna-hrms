import { useState, type FormEvent } from 'react';
import { X, Star, CheckCircle2, XCircle, Award, AlertTriangle, Lock } from 'lucide-react';
import type { Candidate, InterviewRoundType, RoundEvaluationResult, EvaluateRoundPayload } from '../types';

interface EvaluateRoundModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateId: string, payload: EvaluateRoundPayload) => Promise<void>;
}

export function EvaluateRoundModal({
  candidate,
  isOpen,
  onClose,
  onSubmit,
}: EvaluateRoundModalProps) {
  const isFinalized =
    candidate.status === 'SELECTED' ||
    candidate.status === 'REJECTED_HR' ||
    candidate.status === 'REJECTED_MR';

  const hasClearedHr =
    candidate.status === 'MR_ROUND' ||
    Boolean(candidate.hrEvaluatedAt) ||
    candidate.status === 'SELECTED' ||
    candidate.status === 'REJECTED_MR';

  // If candidate is already in MR_ROUND, strictly enforce MR_ROUND; otherwise HR_ROUND
  const activeRound: InterviewRoundType = hasClearedHr ? 'MR_ROUND' : 'HR_ROUND';

  const [round, setRound] = useState<InterviewRoundType>(activeRound);
  const [result, setResult] = useState<RoundEvaluationResult>('PASSED');
  const [interviewerName, setInterviewerName] = useState(
    activeRound === 'HR_ROUND' ? 'Sarah Jenkins (HR)' : 'Alexander Anthony (MR)'
  );
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRoundChange = (newRound: InterviewRoundType) => {
    // Prevent switching back to HR Round if HR is already cleared
    if (hasClearedHr && newRound === 'HR_ROUND') return;
    // Prevent switching to MR Round if HR is not yet cleared
    if (!hasClearedHr && newRound === 'MR_ROUND') return;

    setRound(newRound);
    setInterviewerName(
      newRound === 'HR_ROUND' ? 'Sarah Jenkins (HR)' : 'Alexander Anthony (MR)'
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFinalized) {
      setError('Candidate is already finalized and cannot be re-evaluated.');
      return;
    }

    if (result === 'REJECTED' && !rejectionReason.trim()) {
      setError('Please provide a specific reason for rejection to maintain our audit record.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(candidate.id, {
        round,
        result,
        interviewerName,
        rating,
        feedback,
        rejectionReason: result === 'REJECTED' ? rejectionReason.trim() : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#072b53]/10 dark:bg-amber-500/10 text-[#072b53] dark:text-amber-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Round Evaluation & Decision
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {candidate.fullName} &bull; {candidate.department} Department &bull; {candidate.appliedRole}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Select Round (HR Round vs MR Round) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Round to Evaluate
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoundChange('HR_ROUND')}
                className={`py-3 px-4 rounded-lg border text-xs font-bold transition-all text-left flex flex-col ${round === 'HR_ROUND'
                  ? 'bg-[#072b53] text-white border-[#072b53] shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
              >
                <span className="text-sm font-extrabold">Round 1: HR Round</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">
                  Initial screening, culture & basic fit
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRoundChange('MR_ROUND')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-left flex flex-col ${
                  round === 'MR_ROUND'
                    ? 'bg-[#072b53] text-white border-[#072b53] shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <span className="text-sm font-extrabold">Round 2: MR Round</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">
                  Management round & final commercial sign-off
                </span>
              </button>
            </div>
          </div>

          {/* 2. Decision Result (Pass vs Reject) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Round Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResult('PASSED')}
                className={`py-3 px-4 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${result === 'PASSED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {round === 'HR_ROUND' ? 'Pass to MR Round' : 'Select Candidate'}
              </button>

              <button
                type="button"
                onClick={() => setResult('REJECTED')}
                className={`py-3 px-4 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${result === 'REJECTED'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                  }`}
              >
                <XCircle className="w-4 h-4" />
                {round === 'HR_ROUND' ? 'Reject at HR Round' : 'Reject at MR Round'}
              </button>
            </div>
          </div>

          {/* Rejection Reason (Mandatory if Rejected) */}
          {result === 'REJECTED' && (
            <div className="p-4 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Reason for Rejection *
              </label>
              <textarea
                rows={2}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={
                  round === 'HR_ROUND'
                    ? 'e.g. Communication benchmark not met, expected salary far above budget, notice period 90 days...'
                    : 'e.g. Failed sales case study, lacked commercial depth, cultural mismatch...'
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Interviewer Name & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Interviewer Name
              </label>
              <input
                type="text"
                required
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Score / Rating
              </label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                        }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Round Observations & Feedback *
            </label>
            <textarea
              rows={3}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Candidate strengths, specific domain questions asked, clarity of answers..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm ${result === 'PASSED'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
                }`}
            >
              {submitting ? 'Recording Decision...' : 'Save Round Evaluation'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
