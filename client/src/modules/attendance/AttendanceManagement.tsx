import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../services/toast';
import { useAuth } from '../auth';
import { attendanceApi } from './attendance.api';
import type {
  AttendanceMasterRecord,
  AttendanceRawLog,
  AttendanceRegularization,
  AttendanceStatus,
  SiteVisitRecord,
} from './types';

function statusBadge(status: AttendanceStatus) {
  switch (status) {
    case 'PRESENT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'HALF_DAY':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ON_LEAVE':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'LOP':
    case 'ABSENT':
      return 'bg-rose-50 text-rose-700 border-rose-200';
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return 'â€”';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatTime(iso?: string | null) {
  if (!iso) return 'â€”';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AttendanceManagement() {
  const { user, hasPermission } = useAuth();
  const [master, setMaster] = useState<AttendanceMasterRecord[]>([]);
  const [rawLogs, setRawLogs] = useState<AttendanceRawLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRecord[]>([]);
  const [regularizations, setRegularizations] = useState<AttendanceRegularization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'master' | 'raw' | 'site-visits' | 'regularizations'
  >('master');

  // Regularization Modal
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    attendanceDate: new Date().toISOString().slice(0, 10),
    reason: '',
  });
  const [regError, setRegError] = useState<string | null>(null);

  const isHrAdminOrSuper =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'HR_ADMIN' ||
    hasPermission('attendance:latecomer_control');
  const canReviewReg =
    isHrAdminOrSuper ||
    user?.role === 'HR_COORDINATOR' ||
    user?.role === 'TEAM_LEADER';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, rRes, sRes, regRes] = await Promise.all([
        attendanceApi.getMaster(),
        attendanceApi.getRawLogs(),
        attendanceApi.getSiteVisits(),
        attendanceApi.getRegularizations(),
      ]);
      setMaster(mRes);
      setRawLogs(rRes);
      setSiteVisits(sRes);
      setRegularizations(regRes);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load attendance data';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(
    () => ({
      present: master.filter((m) => m.status === 'PRESENT').length,
      late: master.filter((m) => m.isLate).length,
      visits: siteVisits.length,
      pendingReg: regularizations.filter((r) => r.status === 'PENDING').length,
    }),
    [master, siteVisits, regularizations],
  );

  const handleRegSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setBusy(true);
    try {
      await attendanceApi.requestRegularization({
        attendanceDate: regForm.attendanceDate,
        reason: regForm.reason,
      });
      setRegModalOpen(false);
      setRegForm({ attendanceDate: new Date().toISOString().slice(0, 10), reason: '' });
      await loadData();
      notifySuccess('Regularization request submitted.');
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit regularization';
      setRegError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleRegDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setBusy(true);
    setError(null);
    try {
      await attendanceApi.decideRegularization(id, decision);
      await loadData();
      notifySuccess(`Regularization ${decision.toLowerCase()}.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update regularization';
      setError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleReconcile = async () => {
    setBusy(true);
    setError(null);
    try {
      await attendanceApi.reconcile();
      await loadData();
      notifySuccess('Attendance reconciliation completed.');
    } catch (err: any) {
      const msg = err?.message || 'Reconciliation failed';
      setError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Attendance &amp; Time Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable Tier 1 punch logs, field sales GPS site visits, 09:45 AM latecomer engine &amp; leave-synced reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRegError(null);
              setRegModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Request Regularization
          </button>
          {isHrAdminOrSuper && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleReconcile()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100"
            >
              Reconcile Today
            </button>
          )}
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Present Days</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.present}</p>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Latecomer Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.late}</p>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>GPS Site Visits</span>
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.visits}</p>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Regularizations</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.pendingReg}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'master', label: `Daily Master (${master.length})` },
              { id: 'raw', label: `Raw Punch Stream (${rawLogs.length})` },
              { id: 'site-visits', label: `GPS Site Visits (${siteVisits.length})` },
              { id: 'regularizations', label: `Regularizations (${regularizations.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === t.id
                ? 'bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'master' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">First In / Last Out</th>
                  <th className="py-3 px-4">Hours (Office + Site)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {master.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No reconciled attendance records yet.
                    </td>
                  </tr>
                ) : (
                  master.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.user.name}{' '}
                        <span className="font-mono text-[10px] text-slate-500">
                          ({row.user.employeeId})
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(row.attendanceDate)}</td>
                      <td className="py-3 px-4">
                        {formatTime(row.firstPunchIn)} &rarr; {formatTime(row.lastPunchOut)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{row.totalWorkHours}h</span>{' '}
                        <span className="text-slate-400">
                          ({row.officeHours}h + {row.siteVisitHours}h)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge(row.status)}`}
                        >
                          {row.status}
                        </span>
                        {row.isLate && (
                          <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            LATE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{row.remarks ?? 'â€”'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {rawLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No raw punch logs yet.</div>
            ) : (
              rawLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-900">{log.user.name}</span>{' '}
                      <span className="text-slate-500">({log.user.employeeId})</span> &bull;{' '}
                      <span className="font-semibold text-indigo-700">{log.source}</span> &bull;{' '}
                      <span className="font-bold">{log.direction}</span>
                    </div>
                  </div>
                  <div className="text-slate-500">
                    {formatDate(log.rawTimestamp)} {formatTime(log.rawTimestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'site-visits' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {siteVisits.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No GPS site visits logged.</div>
            ) : (
              siteVisits.map((sv) => (
                <div key={sv.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">
                      {sv.user.name} &bull; {sv.projectName}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      In: {formatTime(sv.checkInTime)} &bull; Out: {formatTime(sv.checkOutTime)} &bull;
                      Geofence: {sv.distanceMeters ?? 0}m
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {sv.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'regularizations' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {regularizations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No regularization requests found.
              </div>
            ) : (
              regularizations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {reg.user.name} ({reg.user.employeeId}) &bull; {formatDate(reg.attendanceDate)}
                    </div>
                    <div className="text-slate-500 mt-0.5">Reason: {reg.reason}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {reg.status}
                    </span>
                    {reg.status === 'PENDING' &&
                      canReviewReg &&
                      (reg.userId !== user?.id || user?.role === 'SUPER_ADMIN') && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleRegDecision(reg.id, 'APPROVED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleRegDecision(reg.id, 'REJECTED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Regularization Modal */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Request Attendance Regularization</h2>
              <button
                type="button"
                onClick={() => setRegModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={(e) => void handleRegSubmit(e)} className="p-6 space-y-3 text-xs">
              {regError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  {regError}
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attendance Date</label>
                <input
                  type="date"
                  required
                  value={regForm.attendanceDate}
                  onChange={(e) => setRegForm({ ...regForm, attendanceDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  rows={3}
                  required
                  minLength={3}
                  placeholder="Missed punch / terminal offline..."
                  value={regForm.reason}
                  onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
