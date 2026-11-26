import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../auth';
import { leaveApi } from './leave.api';
import type {
  ApprovalDecision,
  LeaveBalance,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from './types';

const LEAVE_TYPE_META: Record<
  LeaveType,
  { label: string; accent: string; bg: string }
> = {
  CASUAL: {
    label: 'Casual Leave',
    accent: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  SICK: {
    label: 'Sick Leave',
    accent: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
  EARNED: {
    label: 'Earned Leave',
    accent: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  LOP: {
    label: 'Loss of Pay (LOP)',
    accent: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
};

function decisionBadge(decision: ApprovalDecision) {
  if (decision === 'APPROVED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (decision === 'REJECTED') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function statusBadge(status: LeaveStatus) {
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (status === 'REJECTED') return 'bg-rose-100 text-rose-800 border-rose-200';
  if (status === 'CANCELLED') return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-amber-100 text-amber-800 border-amber-200';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function LeaveManagement() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [calendarItems, setCalendarItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'requests' | 'calendar'>('requests');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeaveStatus>('ALL');

  // Apply modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const [balRes, reqRes, calRes] = await Promise.all([
        leaveApi.getMyBalances(now.getUTCFullYear()),
        leaveApi.getRequests(statusFilter === 'ALL' ? undefined : { status: statusFilter }),
        leaveApi.getCalendar(now.getUTCMonth() + 1, now.getUTCFullYear()),
      ]);
      setBalances(balRes);
      setRequests(reqRes);
      setCalendarItems(calRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leave records');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const requestedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
    return Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1;
  }, [startDate, endDate]);

  const canActAsTeamLead =
    user?.role === 'TEAM_LEADER' || user?.role === 'SUPER_ADMIN';

  const canActAsHr =
    user?.role === 'HR_ADMIN' ||
    user?.role === 'HR_COORDINATOR' ||
    user?.role === 'SUPER_ADMIN';

  const handleApplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!startDate || !endDate) {
      setFormError('Please select both start and end dates.');
      return;
    }
    if (requestedDays <= 0) {
      setFormError('End date must be on or after start date.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveApi.applyLeave({ leaveType, startDate, endDate, reason });
      setModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStageDecision = async (
    req: LeaveRequest,
    stage: 'TEAM_LEAD' | 'HR',
    decision: 'APPROVED' | 'REJECTED',
  ) => {
    const remarks = window.prompt(
      `${stage === 'TEAM_LEAD' ? 'Team Lead' : 'HR'} ${decision.toLowerCase()} remarks (optional):`,
      '',
    );
    if (remarks === null) return;

    setActionBusyId(req.id);
    setError(null);
    try {
      if (stage === 'TEAM_LEAD') {
        await leaveApi.submitTeamLeadDecision(req.id, decision, remarks || undefined);
      } else {
        await leaveApi.submitHrDecision(req.id, decision, remarks || undefined);
      }
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update leave approval');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this pending leave request?')) return;
    setActionBusyId(id);
    setError(null);
    try {
      await leaveApi.cancelLeave(id);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel leave request');
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Leave Management
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Dual Approval: Team Lead + HR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Requests require both Team Lead and HR approval before finalizing and syncing to Attendance Master.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Apply Leave
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* Balance Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['CASUAL', 'SICK', 'EARNED', 'LOP'] as LeaveType[]).map((lt) => {
          const bal = balances.find((b) => b.leaveType === lt);
          const meta = LEAVE_TYPE_META[lt];
          return (
            <div
              key={lt}
              className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.bg} ${meta.accent}`}>
                  {meta.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {bal?.year ?? new Date().getUTCFullYear()}
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {lt === 'LOP' ? bal?.usedDays ?? 0 : bal?.remainingDays ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {lt === 'LOP' ? 'Days Taken (Unpaid)' : 'Days Remaining'}
                  </p>
                </div>
                {lt !== 'LOP' && (
                  <div className="text-right text-[11px] text-slate-500">
                    <div>Allocated: {bal?.allocatedDays ?? 0}</div>
                    <div>Used: {bal?.usedDays ?? 0}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Leave Requests ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Team Leave Calendar ({calendarItems.length})
            </button>
          </div>

          {activeTab === 'requests' && (
            <div className="flex items-center gap-1.5">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                    statusFilter === st
                      ? 'bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'requests' ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Loading leave requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No leave requests found for this view.
              </div>
            ) : (
              requests.map((req) => {
                const isOwn = req.userId === user?.id;
                const showTeamLeadActions =
                  req.status === 'PENDING' &&
                  req.teamLeadStatus === 'PENDING' &&
                  canActAsTeamLead &&
                  (!isOwn || user?.role === 'SUPER_ADMIN');

                const showHrActions =
                  req.status === 'PENDING' &&
                  req.hrStatus === 'PENDING' &&
                  canActAsHr &&
                  (!isOwn || user?.role === 'SUPER_ADMIN');

                const showCancel = req.status === 'PENDING' && isOwn;
                const meta = LEAVE_TYPE_META[req.leaveType];

                return (
                  <div
                    key={req.id}
                    className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {req.user.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {req.user.employeeId}
                        </span>
                        {req.user.team?.name && (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {req.user.team.name}
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${meta.bg} ${meta.accent}`}>
                          {meta.label}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-medium">
                        {formatDate(req.startDate)} &rarr; {formatDate(req.endDate)} ({req.totalDays}{' '}
                        {req.totalDays === 1 ? 'day' : 'days'})
                      </div>
                      <p className="text-xs text-slate-500">Reason: {req.reason}</p>

                      {/* Dual-Stage Approval Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${decisionBadge(req.teamLeadStatus)}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Team Lead: {req.teamLeadStatus}
                          {req.teamLeadApprovedBy ? ` (${req.teamLeadApprovedBy.name})` : ''}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${decisionBadge(req.hrStatus)}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          HR: {req.hrStatus}
                          {req.hrApprovedBy ? ` (${req.hrApprovedBy.name})` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {showTeamLeadActions && (
                        <>
                          <button
                            type="button"
                            disabled={actionBusyId === req.id}
                            onClick={() => void handleStageDecision(req, 'TEAM_LEAD', 'APPROVED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            TL Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionBusyId === req.id}
                            onClick={() => void handleStageDecision(req, 'TEAM_LEAD', 'REJECTED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            TL Reject
                          </button>
                        </>
                      )}

                      {showHrActions && (
                        <>
                          <button
                            type="button"
                            disabled={actionBusyId === req.id}
                            onClick={() => void handleStageDecision(req, 'HR', 'APPROVED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            HR Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionBusyId === req.id}
                            onClick={() => void handleStageDecision(req, 'HR', 'REJECTED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            HR Reject
                          </button>
                        </>
                      )}

                      {showCancel && (
                        <button
                          type="button"
                          disabled={actionBusyId === req.id}
                          onClick={() => void handleCancel(req.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="p-6">
            {calendarItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No scheduled leaves for the current month.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calendarItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {item.user.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(item.startDate)} &ndash; {formatDate(item.endDate)} ({item.totalDays}d)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {LEAVE_TYPE_META[item.leaveType].label} &bull; {item.user.team?.name ?? 'Org'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Apply for Leave</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleApplySubmit(e)} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                  <option value="LOP">Loss of Pay (LOP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {requestedDays > 0 && (
                <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl">
                  Total Duration: {requestedDays} {requestedDays === 1 ? 'day' : 'days'}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={3}
                  placeholder="Provide reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
