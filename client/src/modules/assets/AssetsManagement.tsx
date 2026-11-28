import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Laptop,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../services/toast';
import { employeesApi } from '../employees/employees.api';
import type { EmployeeRecord } from '../employees/types';
import { assetsApi } from './assets.api';
import { buildAssetReportHtml, downloadAssetReportFile } from './downloadAssetReport';
import type { AssetAssignment, AssetStatus, AssetType } from './types';

function statusBadge(status: AssetStatus) {
  if (status === 'ASSIGNED') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (status === 'RETURNED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

export function AssetsManagement() {
  const [assets, setAssets] = useState<AssetAssignment[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AssetStatus>('ALL');

  const [createOpen, setCreateOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<AssetAssignment | null>(null);
  const [returnTarget, setReturnTarget] = useState<AssetAssignment | null>(null);
  const [returnStatus, setReturnStatus] = useState<AssetStatus>('RETURNED');
  const [returnNotes, setReturnNotes] = useState('');

  const todayDate = new Date().toISOString().slice(0, 10);
  const nowDateTime = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    assetType: 'LAPTOP' as AssetType,
    reportDate: todayDate,
    userId: '',
    employeeName: '',
    employeeCode: '',
    department: '',
    designation: '',
    contactNumber: '',
    laptopBrand: '',
    model: '',
    serialNumber: '',
    chargerReceived: true,
    mouseReceived: false,
    keyboardReceived: false,
    simCardReceived: false,
    simCardNumber: '',
    collectedAt: nowDateTime,
    employeeSignature: '',
    employeeSignedDate: todayDate,
    authorizedRepresentative: '',
    authorizedSignedDate: todayDate,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetRows, empRows] = await Promise.all([
        assetsApi.list({
          search: search || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
        employeesApi.getAll().catch(() => [] as EmployeeRecord[]),
      ]);
      setAssets(assetRows);
      setEmployees(empRows);
    } catch (err) {
      notifyError(err, 'Failed to load asset records');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(
    () => ({
      total: assets.length,
      assigned: assets.filter((a) => a.status === 'ASSIGNED').length,
      returned: assets.filter((a) => a.status === 'RETURNED').length,
      flagged: assets.filter((a) => a.status === 'DAMAGED' || a.status === 'LOST').length,
    }),
    [assets],
  );

  const handleSelectEmployee = (employeeRecordId: string) => {
    const emp = employees.find((e) => e.id === employeeRecordId);
    if (!emp) return;
    setForm((prev) => ({
      ...prev,
      userId: emp.userId,
      employeeName: emp.user.name,
      employeeCode: emp.user.employeeId,
      department: emp.department?.name ?? 'General',
      designation: emp.jobTitle ?? emp.user.role,
      contactNumber: emp.user.phone ?? prev.contactNumber,
      employeeSignature: emp.user.name,
    }));
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await assetsApi.create({
        assetType: form.assetType,
        reportDate: form.reportDate,
        userId: form.userId || undefined,
        employeeName: form.employeeName,
        employeeCode: form.employeeCode,
        department: form.department,
        designation: form.designation,
        contactNumber: form.contactNumber,
        laptopBrand: form.laptopBrand,
        model: form.model,
        serialNumber: form.serialNumber,
        chargerReceived: form.chargerReceived,
        mouseReceived: form.mouseReceived,
        keyboardReceived: form.keyboardReceived,
        simCardReceived: form.simCardReceived,
        simCardNumber: form.simCardNumber.trim() || undefined,
        collectedAt: new Date(form.collectedAt).toISOString(),
        employeeSignature: form.employeeSignature || undefined,
        employeeSignedDate: form.employeeSignedDate || undefined,
        authorizedRepresentative: form.authorizedRepresentative || undefined,
        authorizedSignedDate: form.authorizedSignedDate || undefined,
      });
      setCreateOpen(false);
      setForm({
        assetType: 'LAPTOP',
        reportDate: todayDate,
        userId: '',
        employeeName: '',
        employeeCode: '',
        department: '',
        designation: '',
        contactNumber: '',
        laptopBrand: '',
        model: '',
        serialNumber: '',
        chargerReceived: true,
        mouseReceived: false,
        keyboardReceived: false,
        simCardReceived: false,
        simCardNumber: '',
        collectedAt: new Date().toISOString().slice(0, 16),
        employeeSignature: '',
        employeeSignedDate: todayDate,
        authorizedRepresentative: '',
        authorizedSignedDate: todayDate,
      });
      notifySuccess('Laptop Collection Report saved successfully.');
      await loadData();
    } catch (err) {
      notifyError(err, 'Failed to save asset collection report');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;
    setBusy(true);
    try {
      await assetsApi.update(returnTarget.id, {
        status: returnStatus,
        returnedAt: returnStatus === 'RETURNED' ? new Date().toISOString() : undefined,
        returnNotes: returnNotes.trim() || undefined,
      });
      setReturnTarget(null);
      setReturnNotes('');
      notifySuccess(`Asset status updated to ${returnStatus}.`);
      await loadData();
    } catch (err) {
      notifyError(err, 'Failed to update asset status');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (asset: AssetAssignment) => {
    if (!window.confirm(`Delete asset record ${asset.assetTag} (${asset.serialNumber})?`)) return;
    setBusy(true);
    try {
      await assetsApi.remove(asset.id);
      notifySuccess('Asset record deleted.');
      await loadData();
    } catch (err) {
      notifyError(err, 'Failed to delete asset record');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Assets Management &amp; Laptop Collection Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Issue company laptops, record signed Laptop Collection Reports, track chargers, and manage returns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Collection Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Assets</span>
            <Laptop className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.total}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Currently Assigned</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-2">{stats.assigned}</div>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Returned</span>
            <RotateCcw className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">{stats.returned}</div>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Damaged / Lost</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">{stats.flagged}</div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee, brand, model, serial..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'ASSIGNED', 'RETURNED', 'DAMAGED', 'LOST'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                  statusFilter === st
                    ? 'bg-[#072b53] text-white border-[#072b53]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Asset Tag</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Asset &amp; Serial</th>
                <th className="py-3 px-4">Included Items</th>
                <th className="py-3 px-4">Collected On</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No asset collection reports found.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {asset.assetTag}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {asset.employeeName}{' '}
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                          {asset.employeeCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {asset.department} &bull; {asset.designation}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-1.5">
                          {asset.assetType.replace(/_/g, ' ')}
                        </span>
                        {asset.laptopBrand} {asset.model}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        S/N: {asset.serialNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {asset.chargerReceived && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Charger
                          </span>
                        )}
                        {asset.mouseReceived && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                            Mouse
                          </span>
                        )}
                        {asset.keyboardReceived && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Keyboard
                          </span>
                        )}
                        {asset.simCardReceived && (
                          <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                            SIM{asset.simCardNumber ? ` (${asset.simCardNumber})` : ''}
                          </span>
                        )}
                        {!asset.chargerReceived &&
                          !asset.mouseReceived &&
                          !asset.keyboardReceived &&
                          !asset.simCardReceived && (
                            <span className="text-[10px] text-slate-400">Device only</span>
                          )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {new Date(asset.collectedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge(
                          asset.status,
                        )}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewAsset(asset)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Report
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReturnTarget(asset);
                          setReturnStatus(asset.status === 'ASSIGNED' ? 'RETURNED' : asset.status);
                          setReturnNotes(asset.returnNotes ?? '');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Status
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(asset)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 inline-flex items-center"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Laptop Collection Report Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0f172a] z-10">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  MARK ANTHONY &amp; VENTURES &mdash; Laptop Collection Report
                </h2>
                <p className="text-[11px] text-slate-500">
                  All fields from the physical handover form are saved to the database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleCreateSubmit(e)} className="p-6 space-y-5 text-xs">
              {employees.length > 0 && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quick Auto-Fill from Employee Directory (Optional)
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => handleSelectEmployee(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    <option value="">-- Select Employee to Auto-Fill --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.user.name} ({emp.user.employeeId}) — {emp.department?.name ?? 'General'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Asset Type *</label>
                  <select
                    value={form.assetType}
                    onChange={(e) => setForm({ ...form, assetType: e.target.value as AssetType })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="MOUSE">Mouse</option>
                    <option value="KEYBOARD">Keyboard</option>
                    <option value="SIM_CARD">SIM Card</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Report Date *</label>
                  <input
                    type="date"
                    required
                    value={form.reportDate}
                    onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Employee Name *</label>
                  <input
                    required
                    value={form.employeeName}
                    onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Employee ID *</label>
                  <input
                    required
                    placeholder="EMP-005"
                    value={form.employeeCode}
                    onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Department *</label>
                  <input
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Designation *</label>
                  <input
                    required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Contact Number *</label>
                  <input
                    required
                    value={form.contactNumber}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Brand / Carrier *
                  </label>
                  <input
                    required
                    placeholder="Dell / Logitech / Airtel"
                    value={form.laptopBrand}
                    onChange={(e) => setForm({ ...form, laptopBrand: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Model *</label>
                  <input
                    required
                    placeholder="Latitude 5430 / MX Master / Postpaid SIM"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Serial Number *</label>
                  <input
                    required
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-semibold text-slate-700">
                    Accessories &amp; Peripherals Issued
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.chargerReceived}
                        onChange={(e) => setForm({ ...form, chargerReceived: e.target.checked })}
                      />
                      <span>Charger Received</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.mouseReceived}
                        onChange={(e) => setForm({ ...form, mouseReceived: e.target.checked })}
                      />
                      <span>Mouse Received</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.keyboardReceived}
                        onChange={(e) => setForm({ ...form, keyboardReceived: e.target.checked })}
                      />
                      <span>Keyboard Received</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.simCardReceived}
                        onChange={(e) => setForm({ ...form, simCardReceived: e.target.checked })}
                      />
                      <span>SIM Card Received</span>
                    </label>
                  </div>
                  {(form.simCardReceived || form.assetType === 'SIM_CARD') && (
                    <div className="max-w-sm">
                      <label className="block font-semibold text-slate-600 mb-1">
                        SIM Card / Mobile Number
                      </label>
                      <input
                        placeholder="e.g. +91 98765 43210 / ICCID"
                        value={form.simCardNumber}
                        onChange={(e) => setForm({ ...form, simCardNumber: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">
                    Date &amp; Time of Collection *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.collectedAt}
                    onChange={(e) => setForm({ ...form, collectedAt: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-slate-700 leading-relaxed">
                <strong>Company Laptop Description:</strong> Received a company-issued laptop from the HR department for official business purposes. Verified the laptop&apos;s condition, asset details, and all accompanying accessories, including the charger and any assigned peripherals, at the time of handover...
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Employee Signature
                  </label>
                  <input
                    value={form.employeeSignature}
                    onChange={(e) => setForm({ ...form, employeeSignature: e.target.value })}
                    placeholder="Employee full name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Employee Signature Date
                  </label>
                  <input
                    type="date"
                    value={form.employeeSignedDate}
                    onChange={(e) => setForm({ ...form, employeeSignedDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Authorized Representative
                  </label>
                  <input
                    value={form.authorizedRepresentative}
                    onChange={(e) =>
                      setForm({ ...form, authorizedRepresentative: e.target.value })
                    }
                    placeholder="HR / IT Representative"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Authorized Date
                  </label>
                  <input
                    type="date"
                    value={form.authorizedSignedDate}
                    onChange={(e) => setForm({ ...form, authorizedSignedDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {busy ? 'Saving...' : 'Save Collection Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Return / Status Modal */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Update Asset Status &bull; {returnTarget.assetTag}
              </h2>
              <button
                type="button"
                onClick={() => setReturnTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={(e) => void handleStatusUpdate(e)} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={returnStatus}
                  onChange={(e) => setReturnStatus(e.target.value as AssetStatus)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Return / Condition Notes</label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Condition details, charger returned, etc."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold disabled:opacity-50"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Report Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden text-slate-900">
            <div className="px-6 py-3.5 bg-[#072b53] text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold">
                  Laptop Collection Report &mdash; {previewAsset.employeeName}
                </h2>
                <p className="text-[11px] text-slate-200">
                  {previewAsset.assetTag} &bull; {previewAsset.laptopBrand} {previewAsset.model}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadAssetReportFile(previewAsset);
                    notifySuccess(`Downloaded report ${previewAsset.assetTag}`);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const frame = document.getElementById(
                      'asset-report-frame',
                    ) as HTMLIFrameElement | null;
                    frame?.contentWindow?.print();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAsset(null)}
                  className="p-1 rounded hover:bg-white/15"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              id="asset-report-frame"
              title="Laptop Collection Report Preview"
              srcDoc={buildAssetReportHtml(previewAsset)}
              className="w-full flex-1 border-0 bg-[#e5e7eb]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
