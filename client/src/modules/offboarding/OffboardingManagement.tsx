import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserX,
  X,
} from 'lucide-react';
import { useAuth } from '../auth';
import { notifyError, notifySuccess } from '../../services/toast';
import { employeesApi } from '../employees/employees.api';
import type { EmployeeRecord } from '../employees/types';
import { offboardingApi } from './offboarding.api';
import type {
  NocCheckpointType,
  NocStatus,
  OffboardingRecord,
  OffboardingStatus,
} from './types';

function addDaysISO(dateStr: string, days: number): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysRemaining(lwdStr: string): number {
  const lwd = new Date(lwdStr);
  const now = new Date();
  lwd.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((lwd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const CHECKPOINTS: Array<{
  key: NocCheckpointType;
  label: string;
  desc: string;
  statusField: keyof OffboardingRecord;
  byField: keyof OffboardingRecord;
  remarksField: keyof OffboardingRecord;
}> = [
  {
    key: 'ASSETS',
    label: '1. Assets Return & Clearance',
    desc: 'Laptop, ID card, SIM & company devices returned',
    statusField: 'assetsNocStatus',
    byField: 'assetsClearedBy',
    remarksField: 'assetsRemarks',
  },
  {
    key: 'EXPERIENCE_LETTER',
    label: '2. Experience & Relieving Letter',
    desc: 'Experience & Relieving Certificate issued to employee',
    statusField: 'hrNocStatus',
    byField: 'hrClearedBy',
    remarksField: 'hrRemarks',
  },
];

export function OffboardingManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHr =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'HR_ADMIN' ||
    user?.role === 'HR_COORDINATOR';
  const canUpdateNoc = isHr || user?.role === 'TEAM_LEADER';

  const [records, setRecords] = useState<OffboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OffboardingStatus | 'ALL'>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Initiate Resignation / Offboarding Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'RESIGNATION' | 'TERMINATION'>('RESIGNATION');
  const [resignationDate, setResignationDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );
  const [reason, setReason] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // HR Debounced Employee Search
  const [empQuery, setEmpQuery] = useState('');
  const [empResults, setEmpResults] = useState<EmployeeRecord[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  // Early Release LWD Modal
  const [lwdModalRecord, setLwdModalRecord] = useState<OffboardingRecord | null>(null);
  const [overrideLwd, setOverrideLwd] = useState('');
  const [earlyRemarks, setEarlyRemarks] = useState('');

  // In-app Confirmation Modal (replaces native browser confirm/alert)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    tone?: 'primary' | 'danger' | 'success';
    onConfirm: () => Promise<void>;
  } | null>(null);

  const loadOffboardings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offboardingApi.list(
        statusFilter === 'ALL' ? undefined : statusFilter,
      );
      setRecords(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load offboarding records.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadOffboardings();
  }, [loadOffboardings]);

  // Debounced employee search for HR initiating offboarding or termination
  useEffect(() => {
    if (!modalOpen || !isHr) return;
    const q = empQuery.trim();
    if (!q) {
      setEmpResults([]);
      setEmpLoading(false);
      return;
    }
    let active = true;
    setEmpLoading(true);
    const timer = setTimeout(async () => {
      try {
        const list = await employeesApi.getAll({ search: q });
        if (active) setEmpResults(list || []);
      } catch {
        // ignore
      } finally {
        if (active) setEmpLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [modalOpen, isHr, empQuery]);

  const stats = useMemo(() => {
    return {
      pending: records.filter((r) => r.status === 'PENDING_APPROVAL').length,
      inNotice: records.filter((r) => r.status === 'IN_NOTICE').length,
      completed: records.filter((r) => r.status === 'COMPLETED').length,
    };
  }, [records]);

  const openModal = (mode: 'RESIGNATION' | 'TERMINATION') => {
    setModalMode(mode);
    setFormError(null);
    setSelectedEmpId('');
    setEmpQuery('');
    setReason('');
    setHandoverNotes('');
    setResignationDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const submitModalAction = async () => {
    try {
      setSubmitting(true);
      if (modalMode === 'TERMINATION') {
        await offboardingApi.terminate({
          employeeId: selectedEmpId,
          effectiveDate: resignationDate,
          reason: reason.trim(),
        });
        notifySuccess('Employee terminated and termination email dispatched.');
      } else {
        await offboardingApi.initiate({
          employeeId: isHr ? selectedEmpId : undefined,
          resignationDate,
          reason: reason.trim(),
          handoverNotes: handoverNotes.trim() || undefined,
        });
        notifySuccess('Resignation / offboarding request submitted.');
      }
      setModalOpen(false);
      await loadOffboardings();
    } catch (err: any) {
      const msg = err?.message || 'Operation failed.';
      setFormError(msg);
      notifyError(err, msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitModal = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (isHr && !selectedEmpId) {
      setFormError('Please search and select an employee.');
      return;
    }
    if (!reason.trim()) {
      setFormError(
        modalMode === 'TERMINATION'
          ? 'Please enter the termination reason.'
          : 'Please enter a reason for resignation.',
      );
      return;
    }

    if (modalMode === 'TERMINATION') {
      setConfirmDialog({
        title: 'Confirm Employee Termination',
        message:
          'Terminate this employee immediately? Their portal access will be revoked and a termination email will be sent directly to them.',
        confirmLabel: 'Terminate Employee',
        tone: 'danger',
        onConfirm: submitModalAction,
      });
      return;
    }

    await submitModalAction();
  };

  const handleApprove = (rec: OffboardingRecord) => {
    if (busyId) return;
    setConfirmDialog({
      title: 'Accept Resignation',
      message: `Accept ${rec.user.name}'s resignation and start the 30-day notice period?`,
      confirmLabel: 'Accept & Start Notice',
      tone: 'primary',
      onConfirm: async () => {
        try {
          setBusyId(rec.id);
          await offboardingApi.approve(rec.id);
          notifySuccess(`Resignation accepted for ${rec.user.name}.`);
          await loadOffboardings();
        } catch (err: any) {
          notifyError(err, 'Failed to approve resignation.');
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleSaveLwd = async (e: FormEvent) => {
    e.preventDefault();
    if (!lwdModalRecord || !overrideLwd) return;
    try {
      setBusyId(lwdModalRecord.id);
      await offboardingApi.approve(lwdModalRecord.id, {
        lastWorkingDay: overrideLwd,
        earlyReleaseRemarks: earlyRemarks.trim() || undefined,
      });
      setLwdModalRecord(null);
      notifySuccess('Last Working Day updated successfully.');
      await loadOffboardings();
    } catch (err: any) {
      notifyError(err, 'Failed to update Last Working Day.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleNoc = async (
    rec: OffboardingRecord,
    checkpoint: NocCheckpointType,
    currentStatus: NocStatus,
  ) => {
    if (busyId) return;
    const nextStatus: NocStatus = currentStatus === 'CLEARED' ? 'PENDING' : 'CLEARED';
    const label = checkpoint === 'ASSETS' ? 'Assets Return & Clearance' : 'Experience Letter';

    try {
      setBusyId(`${rec.id}-${checkpoint}`);
      await offboardingApi.updateNoc(rec.id, { checkpoint, status: nextStatus });
      notifySuccess(
        nextStatus === 'CLEARED'
          ? `${label} marked as completed.`
          : `${label} reverted to pending.`,
      );
      await loadOffboardings();
    } catch (err: any) {
      notifyError(err, 'Failed to update clearance.');
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = (rec: OffboardingRecord) => {
    if (busyId) return;
    setConfirmDialog({
      title: 'Complete Offboarding',
      message: `Complete offboarding for ${rec.user.name}? They will retain 7-day portal access (Official Letters tab only) to download their letters and receive an email notification, after which their account becomes INACTIVE.`,
      confirmLabel: 'Complete Offboarding',
      tone: 'success',
      onConfirm: async () => {
        try {
          setBusyId(rec.id);
          await offboardingApi.complete(rec.id);
          notifySuccess(
            `Offboarding completed for ${rec.user.name}. 7-day letter portal access email sent.`,
          );
          await loadOffboardings();
        } catch (err: any) {
          notifyError(err, 'Failed to complete offboarding.');
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleWithdraw = (rec: OffboardingRecord) => {
    if (busyId) return;
    setConfirmDialog({
      title: 'Withdraw Resignation',
      message: `Withdraw resignation request for ${rec.user.name}?`,
      confirmLabel: 'Withdraw Request',
      tone: 'danger',
      onConfirm: async () => {
        try {
          setBusyId(rec.id);
          await offboardingApi.withdraw(rec.id);
          notifySuccess(`Resignation withdrawn for ${rec.user.name}.`);
          await loadOffboardings();
        } catch (err: any) {
          notifyError(err, 'Failed to withdraw resignation.');
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleIssueExperienceLetter = (rec: OffboardingRecord) => {
    navigate('/letters', {
      state: {
        prefillExperienceFromOffboarding: {
          fromOffboarding: true,
          employeeId: rec.employee.id,
          employeeCode: rec.user.employeeId,
          recipientName: rec.user.name,
          recipientEmail: rec.user.email,
          recipientPhone: rec.user.phone || '',
          designation: rec.employee.jobTitle || 'Employee',
          department: rec.employee.department?.name || 'SALES',
          joiningDate: rec.employee.hireDate
            ? new Date(rec.employee.hireDate).toISOString().split('T')[0]
            : '',
          relievingDate: new Date(rec.lastWorkingDay).toISOString().split('T')[0],
        },
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#072b53] text-amber-400 shadow-sm">
              <UserX className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Offboarding &amp; NOC Clearance
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            30-day notice period, direct HR termination, Assets clearance, and Experience Letter release.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadOffboardings()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh Offboarding Records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isHr && (
            <button
              type="button"
              onClick={() => openModal('TERMINATION')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              Terminate Employee
            </button>
          )}
          {!isHr && (
            <button
              type="button"
              onClick={() => openModal('RESIGNATION')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#072b53] hover:bg-[#0a3869] text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Submit Resignation
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pending HR Approval
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            In 30-Day Notice Period
          </div>
          <div className="text-2xl font-black text-[#072b53] dark:text-sky-400 mt-1">
            {stats.inNotice}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Completed / Terminated
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.completed}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: 'ALL', label: 'All Requests' },
            { key: 'PENDING_APPROVAL', label: 'Pending Approval' },
            { key: 'IN_NOTICE', label: 'In Notice (30 Days)' },
            { key: 'COMPLETED', label: 'Completed / Terminated' },
            { key: 'WITHDRAWN', label: 'Withdrawn' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-[#072b53] text-white'
                : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Offboarding Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading offboarding records...</div>
      ) : records.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-2">
          <LogOut className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-800 dark:text-white">
            No Offboarding Records Found
          </div>
          <p className="text-xs text-slate-500">
            {isHr
              ? 'Use "Initiate Offboarding" for 30-day notice or "Terminate Employee" for immediate termination.'
              : 'You have no active resignation or offboarding requests.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => {
            const daysLeft = getDaysRemaining(rec.lastWorkingDay);
            const isTermination = rec.offboardingType === 'TERMINATION';
            const assetsCleared = rec.assetsNocStatus === 'CLEARED';
            const experienceCleared = rec.hrNocStatus === 'CLEARED';
            const bothCleared = assetsCleared && experienceCleared;
            const isLastDayOrPast = !isTermination && rec.status === 'IN_NOTICE' && daysLeft <= 0;

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#072b53] dark:text-amber-400">
                        {rec.user.employeeId}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {rec.user.name}
                      </h2>
                      {isTermination && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                          TERMINATED
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          rec.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rec.status === 'IN_NOTICE'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : rec.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {rec.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {rec.employee.jobTitle || 'Staff'} &bull;{' '}
                      {rec.employee.department?.name || 'General'} &bull; {rec.user.email}
                    </p>
                  </div>

                  {/* Notice Period Countdown Pill */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-slate-400">
                        {isTermination ? 'Effective Date:' : 'Resigned:'}
                      </span>{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {formatDate(rec.resignationDate)}
                      </strong>
                    </div>
                    {!isTermination && (
                      <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-slate-400">Last Working Day:</span>{' '}
                        <strong className="text-[#072b53] dark:text-amber-400">
                          {formatDate(rec.lastWorkingDay)}
                        </strong>
                      </div>
                    )}
                    {rec.status === 'IN_NOTICE' && (
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                          daysLeft <= 0
                            ? 'bg-rose-600 text-white border-rose-700'
                            : daysLeft <= 5
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft} days left (${rec.noticePeriodDays}d notice)`
                            : 'Last Day Reached — Complete Procedure'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Working Day Banner for HR & Employee */}
                {isLastDayOrPast && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Notice period completed! Both employee and HR must complete the final procedure today:
                      <strong> (1) Assets Return</strong> &amp; <strong>(2) Experience &amp; Relieving Letter</strong>.
                    </span>
                  </div>
                )}

                {/* Reason & Handover Notes */}
                <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Reason: </strong>
                    {rec.reason}
                  </div>
                  {rec.handoverNotes && (
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Handover Notes: </strong>
                      {rec.handoverNotes}
                    </div>
                  )}
                  {rec.earlyReleaseRemarks && (
                    <div className="text-amber-700 dark:text-amber-400">
                      <strong>LWD Adjustment Note: </strong>
                      {rec.earlyReleaseRemarks}
                    </div>
                  )}
                </div>

                {/* 2-Thing Procedure Grid: 1. Assets & 2. Experience Letter (for both Resignation & Termination) */}
                {(rec.status === 'IN_NOTICE' || rec.status === 'COMPLETED') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CHECKPOINTS.map((cp) => {
                      const cpStatus = rec[cp.statusField] as NocStatus;
                      const clearedBy = rec[cp.byField] as string | null;
                      const cpRemarks = rec[cp.remarksField] as string | null;
                      const isCleared = cpStatus === 'CLEARED';

                      return (
                        <div
                          key={cp.key}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between gap-2.5 ${
                            isCleared
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {cp.label}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  isCleared
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isCleared ? 'COMPLETED' : 'PENDING'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">{cp.desc}</p>
                            {clearedBy && (
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1.5 font-semibold">
                                Cleared by {clearedBy}
                              </p>
                            )}
                            {cpRemarks && (
                              <p className="text-[10px] text-slate-500 italic mt-0.5">
                                &ldquo;{cpRemarks}&rdquo;
                              </p>
                            )}
                          </div>

                          {cp.key === 'ASSETS' && canUpdateNoc && rec.status === 'IN_NOTICE' && (
                            <button
                              type="button"
                              disabled={busyId === `${rec.id}-${cp.key}`}
                              onClick={() => void handleToggleNoc(rec, cp.key, cpStatus)}
                              className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                                isCleared
                                  ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                  : 'bg-[#072b53] hover:bg-[#0a3869] text-white'
                              }`}
                            >
                              {busyId === `${rec.id}-${cp.key}`
                                ? 'Updating...'
                                : isCleared
                                ? 'Mark Pending'
                                : 'Mark Cleared'}
                            </button>
                          )}

                          {cp.key === 'EXPERIENCE_LETTER' && isHr && !isCleared && rec.status === 'IN_NOTICE' && (
                            <button
                              type="button"
                              onClick={() => handleIssueExperienceLetter(rec)}
                              className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Issue Experience Letter
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isHr && rec.status === 'PENDING_APPROVAL' && (
                    <button
                      type="button"
                      disabled={busyId === rec.id}
                      onClick={() => void handleApprove(rec)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept Resignation (30-Day Notice)
                    </button>
                  )}

                  {isHr && !isTermination && (rec.status === 'PENDING_APPROVAL' || rec.status === 'IN_NOTICE') && (
                    <button
                      type="button"
                      onClick={() => {
                        setLwdModalRecord(rec);
                        setOverrideLwd(new Date(rec.lastWorkingDay).toISOString().split('T')[0]);
                        setEarlyRemarks(rec.earlyReleaseRemarks || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Adjust LWD (Early Release)
                    </button>
                  )}

                  {((isHr && (rec.status === 'PENDING_APPROVAL' || rec.status === 'IN_NOTICE')) ||
                    (!isHr && rec.status === 'PENDING_APPROVAL')) && (
                    <button
                      type="button"
                      disabled={busyId === rec.id}
                      onClick={() => void handleWithdraw(rec)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      Withdraw
                    </button>
                  )}

                  {isHr && rec.status === 'IN_NOTICE' && (
                    <button
                      type="button"
                      disabled={!bothCleared || busyId === rec.id}
                      onClick={() => void handleComplete(rec)}
                      title={
                        bothCleared
                          ? 'Complete offboarding (1-day portal access remains for letter downloads)'
                          : 'Clear Assets & issue/email Experience Letter first'
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#072b53] hover:bg-[#0a3869] disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      {busyId === rec.id ? 'Completing...' : 'Complete Offboarding'}
                    </button>
                  )}

                  {rec.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed &bull; 7-Day Portal Access for Official Letters
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Initiate Offboarding / Terminate Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {modalMode === 'TERMINATION' && (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {modalMode === 'TERMINATION'
                    ? 'Terminate Employee (Immediate + Email Notice)'
                    : isHr
                    ? 'Initiate Employee Offboarding (30-Day Notice)'
                    : 'Submit Resignation (30-Day Notice)'}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmitModal(e)} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              {isHr && (
                <div className="relative space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    Search Employee (ID or Name) *
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={empQuery}
                      onFocus={() => setEmpDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setEmpDropdownOpen(false), 180)}
                      onChange={(e) => {
                        setEmpQuery(e.target.value);
                        setSelectedEmpId('');
                        setEmpDropdownOpen(true);
                      }}
                      placeholder="Type Employee ID (e.g. MNA001) or Name..."
                      className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    {empLoading && (
                      <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {empDropdownOpen && empQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 z-20 max-h-44 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg divide-y divide-slate-100 dark:divide-slate-800">
                      {empResults.length === 0 ? (
                        <div className="px-3 py-2 text-[11px] text-slate-500">
                          {empLoading ? 'Searching...' : 'No matching employees found.'}
                        </div>
                      ) : (
                        empResults.slice(0, 12).map((emp) => (
                          <button
                            key={emp.id}
                            type="button"
                            onMouseDown={() => {
                              setSelectedEmpId(emp.id);
                              setEmpQuery(`${emp.user.employeeId} — ${emp.user.name}`);
                              setEmpDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {emp.user.employeeId} &bull; {emp.user.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {emp.jobTitle || 'Staff'} &bull; {emp.user.email}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className={modalMode === 'TERMINATION' ? '' : 'grid grid-cols-2 gap-3'}>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {modalMode === 'TERMINATION' ? 'Termination Effective Date *' : 'Resignation Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={resignationDate}
                    onChange={(e) => setResignationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                {modalMode === 'RESIGNATION' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Last Working Day (+30 Days)
                    </label>
                    <input
                      type="date"
                      disabled
                      value={addDaysISO(resignationDate, 30)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-[#072b53] dark:text-amber-400"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  {modalMode === 'TERMINATION'
                    ? 'Termination Reason (Included in Email to Employee) *'
                    : 'Reason *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    modalMode === 'TERMINATION'
                      ? 'State clear reason for termination...'
                      : 'Reason for resignation...'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {modalMode === 'RESIGNATION' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Handover Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="Pending tasks, client handover details..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl disabled:opacity-50 text-white text-xs font-bold cursor-pointer ${
                    modalMode === 'TERMINATION'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-[#072b53] hover:bg-[#0a3869]'
                  }`}
                >
                  {submitting
                    ? 'Processing...'
                    : modalMode === 'TERMINATION'
                    ? 'Terminate & Send Email'
                    : isHr
                    ? 'Start 30-Day Notice'
                    : 'Submit Resignation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Early Release / Adjust LWD Modal */}
      {lwdModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={(e) => void handleSaveLwd(e)}
            className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Adjust Last Working Day — {lwdModalRecord.user.name}
            </h3>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                New Last Working Day *
              </label>
              <input
                type="date"
                required
                value={overrideLwd}
                onChange={(e) => setOverrideLwd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Early Release / Buyout Remarks
              </label>
              <textarea
                rows={2}
                value={earlyRemarks}
                onChange={(e) => setEarlyRemarks(e.target.value)}
                placeholder="e.g. Early release approved by Management..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLwdModalRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyId === lwdModalRecord.id}
                className="px-4 py-2 rounded-xl bg-[#072b53] text-white text-xs font-bold cursor-pointer"
              >
                Save LWD
              </button>
            </div>
          </form>
        </div>
      )}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  await action();
                }}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer ${
                  confirmDialog.tone === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmDialog.tone === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#072b53] hover:bg-[#0a3a70]'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
