import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  IndianRupee,
  Lock,
  Play,
  Printer,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../services/toast';
import { useAuth } from '../auth';
import { downloadPayslipFile, buildPayslipHtml } from './downloadPayslip';
import { exportPayrollRunToExcel } from './exportPayrollExcel';
import { payrollApi } from './payroll.api';
import type { PayrollRunDetail, PayrollRunSummary, PayslipItem } from './types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusBadge(status: PayrollRunSummary['status']) {
  if (status === 'PAID') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status === 'LOCKED') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

export function PayrollManagement() {
  const { user, hasPermission } = useAuth();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [runs, setRuns] = useState<PayrollRunSummary[]>([]);
  const [activeRun, setActiveRun] = useState<PayrollRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Edit adjustment modal (DRAFT only)
  const [editingSlip, setEditingSlip] = useState<PayslipItem | null>(null);
  const [editForm, setEditForm] = useState({
    bonus: '0',
    otherDeductions: '0',
    lopDays: '0',
    remarks: '',
  });

  // Payslip preview modal
  const [previewSlip, setPreviewSlip] = useState<PayslipItem | null>(null);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canExportExcel = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN';
  const canEditSalaries = isSuperAdmin || hasPermission('payroll:salary_manage');

  const loadRuns = useCallback(
    async (preferRunId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const list = await payrollApi.listRuns();
        setRuns(list);

        const targetId =
          preferRunId ??
          list.find((r) => r.month === month && r.year === year)?.id ??
          list[0]?.id;

        if (targetId) {
          const detail = await payrollApi.getRun(targetId);
          setActiveRun(detail);
          setMonth(detail.month);
          setYear(detail.year);
        } else {
          setActiveRun(null);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load payroll runs';
        setError(msg);
        notifyError(msg);
      } finally {
        setLoading(false);
      }
    },
    [month, year],
  );

  useEffect(() => {
    void loadRuns();
  }, []);

  const handleSelectMonthYear = async (nextMonth: number, nextYear: number) => {
    setMonth(nextMonth);
    setYear(nextYear);
    setNotice(null);
    const match = runs.find((r) => r.month === nextMonth && r.year === nextYear);
    if (match) {
      setBusy(true);
      try {
        const detail = await payrollApi.getRun(match.id);
        setActiveRun(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load run details');
      } finally {
        setBusy(false);
      }
    } else {
      setActiveRun(null);
    }
  };

  const handleGenerate = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const detail = await payrollApi.generateRun({ month, year });
      setActiveRun(detail);
      await loadRuns(detail.id);
      const msg = `Draft payroll generated for ${MONTHS[month - 1]} ${year} (${detail.totalEmployees} employees).`;
      setNotice(msg);
      notifySuccess(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate payroll';
      setError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleLock = async () => {
    if (!activeRun) return;
    if (
      !window.confirm(
        `Lock payroll for ${MONTHS[activeRun.month - 1]} ${activeRun.year}? Locked figures cannot be edited.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await payrollApi.lockRun(activeRun.id);
      setActiveRun(updated);
      await loadRuns(updated.id);
      const msg = `Payroll for ${MONTHS[updated.month - 1]} ${updated.year} is now LOCKED.`;
      setNotice(msg);
      notifySuccess(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to lock payroll run';
      setError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!activeRun) return;
    if (
      !window.confirm(
        `Mark ${MONTHS[activeRun.month - 1]} ${activeRun.year} payroll as PAID?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await payrollApi.markPaid(activeRun.id);
      setActiveRun(updated);
      await loadRuns(updated.id);
      const msg = `Payroll for ${MONTHS[updated.month - 1]} ${updated.year} marked as PAID.`;
      setNotice(msg);
      notifySuccess(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to mark payroll as paid';
      setError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePortalVisibility = async () => {
    if (!activeRun) return;
    const nextVisible = !activeRun.isPayslipVisible;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await payrollApi.setVisibility(activeRun.id, nextVisible);
      setActiveRun(updated);
      await loadRuns(updated.id);
      const msg = nextVisible
        ? `Salary slips for ${MONTHS[updated.month - 1]} ${updated.year} are now visible for employee download in My Payslips.`
        : `Salary slips for ${MONTHS[updated.month - 1]} ${updated.year} are now hidden from the employee portal.`;
      setNotice(msg);
      notifySuccess(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update portal visibility';
      setError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  const openEditModal = (slip: PayslipItem) => {
    setEditingSlip(slip);
    setEditForm({
      bonus: String(slip.bonus),
      otherDeductions: String(slip.otherDeductions),
      lopDays: String(slip.lopDays),
      remarks: slip.remarks ?? '',
    });
  };

  const handleSaveAdjustment = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSlip || !activeRun) return;
    setBusy(true);
    setError(null);
    try {
      await payrollApi.updatePayslip(editingSlip.id, {
        bonus: Number(editForm.bonus) || 0,
        otherDeductions: Number(editForm.otherDeductions) || 0,
        lopDays: Number(editForm.lopDays) || 0,
        remarks: editForm.remarks.trim() || undefined,
      });
      setEditingSlip(null);
      const refreshed = await payrollApi.getRun(activeRun.id);
      setActiveRun(refreshed);
      const msg = `Updated payslip adjustment for ${editingSlip.user.name}.`;
      setNotice(msg);
      notifySuccess(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update payslip adjustment';
      setError(msg);
      notifyError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Payroll Engine &amp; Automated Payslips
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            DRAFT &rarr; LOCKED (SuperAdmin) &rarr; PAID state machine with attendance LOP deductions and HR/SuperAdmin portal release controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={month}
            onChange={(e) => void handleSelectMonthYear(Number(e.target.value), year)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {MONTHS.map((label, idx) => (
              <option key={label} value={idx + 1}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => void handleSelectMonthYear(month, Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {(!activeRun || activeRun.status === 'DRAFT') && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleGenerate()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {activeRun ? <RefreshCw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {activeRun ? 'Recalculate Draft' : 'Generate Draft Run'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {notice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          {notice}
        </div>
      )}

      {/* Active Run State Bar & KPIs */}
      {loading ? (
        <div className="p-10 text-center text-xs text-slate-500">Loading payroll data...</div>
      ) : !activeRun ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-10 text-center space-y-3">
          <IndianRupee className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-800 dark:text-white">
            No Payroll Run for {MONTHS[month - 1]} {year}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click <strong>Generate Draft Run</strong> above to compute salaries, LOP attendance deductions, and payslips for all active employees.
          </p>
        </div>
      ) : (
        <>
          {/* State Machine & Workflow Actions */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {MONTHS[activeRun.month - 1]} {activeRun.year} Cycle
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge(
                  activeRun.status,
                )}`}
              >
                {activeRun.status}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className={activeRun.status === 'DRAFT' ? 'font-bold text-slate-900' : ''}>
                  1. Draft
                </span>
                <span>&rarr;</span>
                <span className={activeRun.status === 'LOCKED' ? 'font-bold text-indigo-700' : ''}>
                  2. Locked (SuperAdmin)
                </span>
                <span>&rarr;</span>
                <span className={activeRun.status === 'PAID' ? 'font-bold text-emerald-700' : ''}>
                  3. Paid
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeRun.status === 'DRAFT' && isSuperAdmin && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleLock()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Lock Payroll
                </button>
              )}

              {activeRun.status === 'LOCKED' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleMarkPaid()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Mark as Paid
                </button>
              )}

              {(activeRun.status === 'LOCKED' || activeRun.status === 'PAID') && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleTogglePortalVisibility()}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold disabled:opacity-50 ${
                    activeRun.isPayslipVisible
                      ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                      : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeRun.isPayslipVisible ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Hide from Employee Portal
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Release to Employee Portal
                    </>
                  )}
                </button>
              )}

              {canExportExcel && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => exportPayrollRunToExcel(activeRun)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Excel (.xlsx)
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Employees</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {activeRun.totalEmployees}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Total Monthly Gross</span>
                <IndianRupee className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {formatINR(activeRun.totalGross)}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Total LOP &amp; Deductions</span>
                <FileText className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-rose-600 mt-2">
                -{formatINR(activeRun.totalDeductions)}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Total Net Payable</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">
                {formatINR(activeRun.totalNetPay)}
              </div>
            </div>
          </div>

          {/* Payslips Table */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4 text-right">Monthly Gross</th>
                    <th className="py-3 px-4 text-right">LOP Days</th>
                    <th className="py-3 px-4 text-right">LOP Deduction</th>
                    <th className="py-3 px-4 text-right">Prof. Tax</th>
                    <th className="py-3 px-4 text-right">Bonus</th>
                    <th className="py-3 px-4 text-right">Other Ded.</th>
                    <th className="py-3 px-4 text-right">Net Pay</th>
                    <th className="py-3 px-4">Portal</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {activeRun.payslips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {slip.user.name}{' '}
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                            {slip.user.employeeId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {slip.user.employee?.jobTitle ?? slip.user.role}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatINR(slip.monthlyGross)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {slip.lopDays}d
                        </span>
                        <div className="text-[10px] text-slate-400">
                          P:{slip.presentDays} H:{slip.halfDays}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                        -{formatINR(slip.lopDeduction)}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600">
                        -{formatINR(slip.professionalTax)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                        +{formatINR(slip.bonus)}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600">
                        -{formatINR(slip.otherDeductions)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatINR(slip.netPay)}
                      </td>
                      <td className="py-3 px-4">
                        {activeRun.isPayslipVisible ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Released
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewSlip(slip)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Payslip
                        </button>
                        {activeRun.status === 'DRAFT' && canEditSalaries && (
                          <button
                            type="button"
                            onClick={() => openEditModal(slip)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 inline-flex items-center"
                            title="Edit adjustment"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Adjustment Modal (DRAFT only) */}
      {editingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Adjust Payslip &bull; {editingSlip.user.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditingSlip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSaveAdjustment(e)} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">LOP Days</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={editingSlip.workingDaysInMonth}
                  value={editForm.lopDays}
                  onChange={(e) => setEditForm({ ...editForm, lopDays: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Bonus / Incentive (INR)</label>
                <input
                  type="number"
                  min={0}
                  value={editForm.bonus}
                  onChange={(e) => setEditForm({ ...editForm, bonus: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Other Deductions (INR)</label>
                <input
                  type="number"
                  min={0}
                  value={editForm.otherDeductions}
                  onChange={(e) => setEditForm({ ...editForm, otherDeductions: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Remarks</label>
                <input
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  placeholder="Optional note..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlip(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold disabled:opacity-50"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Preview Modal */}
      {previewSlip && activeRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden text-slate-900">
            <div className="px-6 py-3.5 bg-[#072b53] text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold">Mark Anthony Ventures &mdash; Salary Slip</h2>
                <p className="text-[11px] text-slate-200">
                  {MONTHS[previewSlip.month - 1]} {previewSlip.year} &bull; {activeRun.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void downloadPayslipFile(previewSlip)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const frame = document.getElementById('admin-payslip-frame') as HTMLIFrameElement | null;
                    frame?.contentWindow?.print();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSlip(null)}
                  className="p-1 rounded hover:bg-white/15"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <iframe
              id="admin-payslip-frame"
              title="Salary Slip Preview"
              srcDoc={buildPayslipHtml(previewSlip)}
              className="w-full flex-1 border-0 bg-[#e8e8e8]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
