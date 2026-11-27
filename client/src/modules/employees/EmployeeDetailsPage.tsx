import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Copy,
  CreditCard,
  Edit3,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth, type UserRole } from '../auth';
import { employeesApi } from './employees.api';
import type {
  DepartmentOption,
  DocumentType,
  EmployeeQrBadge,
  EmployeeRecord,
  TeamOption,
} from './types';

function formatCurrency(amount?: number | null) {
  if (amount == null) return 'Restricted / Not set';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toDateInputValue(value?: string | null) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

export function EmployeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [qrBadge, setQrBadge] = useState<EmployeeQrBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'vault' | 'qr'>('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'EMPLOYEE' as UserRole,
    departmentId: '',
    teamId: '',
    jobTitle: '',
    salary: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
  });

  const [docForm, setDocForm] = useState({
    docType: 'PAN' as DocumentType,
    fileName: '',
    fileUrl: '',
  });
  const [docBusy, setDocBusy] = useState(false);
  const [copiedVCard, setCopiedVCard] = useState(false);

  const isHrAdminOrSuper =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'HR_ADMIN' ||
    hasPermission('employees:manage_all');
  const canVerifyKyc =
    isHrAdminOrSuper ||
    user?.role === 'HR_COORDINATOR' ||
    hasPermission('documents:vault_all');
  const isSelf = Boolean(employee && user?.id === employee.userId);
  const canEdit = isHrAdminOrSuper || isSelf;

  const hydrateEditForm = (emp: EmployeeRecord) => {
    setEditForm({
      name: emp.user.name ?? '',
      phone: emp.user.phone ?? '',
      role: emp.user.role,
      departmentId: emp.departmentId ?? '',
      teamId: emp.user.teamId ?? '',
      jobTitle: emp.jobTitle ?? '',
      salary: emp.salary != null ? String(emp.salary) : '',
      gender: emp.gender ?? '',
      dateOfBirth: toDateInputValue(emp.dateOfBirth),
      bloodGroup: emp.bloodGroup ?? '',
      address: emp.address ?? '',
      emergencyContactName: emp.emergencyContactName ?? '',
      emergencyContactPhone: emp.emergencyContactPhone ?? '',
      bankName: emp.bankName ?? '',
      bankAccountNumber: emp.bankAccountNumber ?? '',
      bankIfsc: emp.bankIfsc ?? '',
      panNumber: emp.panNumber ?? '',
      aadhaarNumber: emp.aadhaarNumber ?? '',
      uanNumber: emp.uanNumber ?? '',
    });
  };

  const loadEmployee = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [empRes, metaRes, qrRes] = await Promise.all([
        employeesApi.getOne(id),
        employeesApi.getMeta(),
        employeesApi.getQrBadge(id).catch(() => null),
      ]);
      setEmployee(empRes);
      setDepartments(metaRes.departments);
      setTeams(metaRes.teams);
      setQrBadge(qrRes);
      hydrateEditForm(empRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadEmployee();
  }, [loadEmployee]);

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const payload: Record<string, unknown> = {
        name: editForm.name.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        gender: editForm.gender.trim() || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
        bloodGroup: editForm.bloodGroup.trim() || undefined,
        address: editForm.address.trim() || undefined,
        emergencyContactName: editForm.emergencyContactName.trim() || undefined,
        emergencyContactPhone: editForm.emergencyContactPhone.trim() || undefined,
        bankName: editForm.bankName.trim() || undefined,
        bankAccountNumber: editForm.bankAccountNumber.trim() || undefined,
        bankIfsc: editForm.bankIfsc.trim() || undefined,
        panNumber: editForm.panNumber.trim() || undefined,
        aadhaarNumber: editForm.aadhaarNumber.trim() || undefined,
        uanNumber: editForm.uanNumber.trim() || undefined,
      };

      if (isHrAdminOrSuper) {
        payload.role = editForm.role;
        payload.departmentId = editForm.departmentId || undefined;
        payload.teamId = editForm.teamId || undefined;
        payload.jobTitle = editForm.jobTitle.trim() || undefined;
        if (editForm.salary.trim() !== '') {
          payload.salary = Number(editForm.salary);
        }
      }

      const updated = await employeesApi.update(employee.id, payload);
      setEmployee(updated);
      hydrateEditForm(updated);
      setEditing(false);
      setSaveMessage('Employee details updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee details');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!employee) return;
    if (!confirm(`Archive ${employee.user.name} (${employee.user.employeeId})?`)) return;
    try {
      await employeesApi.archive(employee.id);
      navigate('/employees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive employee');
    }
  };

  const handleAddDocument = async (e: FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setDocBusy(true);
    try {
      await employeesApi.addDocument(employee.id, docForm);
      setDocForm({ docType: 'PAN', fileName: '', fileUrl: '' });
      const refreshed = await employeesApi.getOne(employee.id);
      setEmployee(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add document');
    } finally {
      setDocBusy(false);
    }
  };

  const handleVerifyDoc = async (docId: string) => {
    if (!employee) return;
    setDocBusy(true);
    try {
      await employeesApi.verifyDocument(docId);
      const refreshed = await employeesApi.getOne(employee.id);
      setEmployee(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify document');
    } finally {
      setDocBusy(false);
    }
  };

  const copyVCard = async () => {
    if (!qrBadge) return;
    await navigator.clipboard.writeText(qrBadge.vCard);
    setCopiedVCard(true);
    setTimeout(() => setCopiedVCard(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center text-xs text-slate-500">
        Loading employee dossier...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employee Directory
        </button>
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error ?? 'Employee record could not be found.'}
        </div>
      </div>
    );
  }

  const initials = employee.user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employee Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadEmployee()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white dark:bg-[#0f172a] dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          {canEdit && !editing && (
            <button
              type="button"
              onClick={() => {
                hydrateEditForm(employee);
                setActiveTab('profile');
                setEditing(true);
                setSaveMessage(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Details
            </button>
          )}

          {isHrAdminOrSuper && employee.userId !== user?.id && !employee.user.isArchived && (
            <button
              type="button"
              onClick={() => void handleArchive()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Archive
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          {saveMessage}
        </div>
      )}

      {/* Profile Hero Header */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#072b53] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {employee.user.name}
                </h1>
                <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">
                  {employee.user.employeeId}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    employee.user.employmentStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {employee.user.employmentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {employee.jobTitle ?? 'Team Member'} &bull;{' '}
                {employee.department?.name ?? 'General'} &bull;{' '}
                {employee.user.team?.name ?? 'No Team Assigned'}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {employee.user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {employee.user.phone ?? 'No phone'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  {employee.user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Monthly Gross</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(employee.salary)}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Joined</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatDate(employee.hireDate ?? employee.user.dateOfJoining)}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-semibold uppercase text-slate-400">KYC Docs</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {employee.documents.filter((d) => d.isVerified).length}/{employee.documents.length}{' '}
                Verified
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-6 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          {(['profile', 'vault', 'qr'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#072b53] text-[#072b53] dark:border-white dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'profile'
                ? 'Full Employee Dossier'
                : tab === 'vault'
                  ? `KYC Document Vault (${employee.documents.length})`
                  : 'Digital ID & vCard QR'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Full Profile */}
      {activeTab === 'profile' && !editing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Employment & Organization */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#072b53]" />
              Employment &amp; Organization
            </div>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Employee ID</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {employee.user.employeeId}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">System Role</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.user.role}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Department</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.department?.name ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Team</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.user.team?.name ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Job Title</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.jobTitle ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Hire Date</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(employee.hireDate ?? employee.user.dateOfJoining)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500">Monthly Gross</dt>
                <dd className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(employee.salary)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Personal & Emergency Contact */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-[#072b53]" />
              Personal &amp; Emergency Contact
            </div>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.user.phone ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Gender</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.gender ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Date of Birth</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatDate(employee.dateOfBirth)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Blood Group</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.bloodGroup ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Emergency Contact</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                  {employee.emergencyContactName ?? '—'}
                  {employee.emergencyContactPhone ? ` (${employee.emergencyContactPhone})` : ''}
                </dd>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <dt className="text-slate-500 inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Address
                </dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {employee.address ?? 'Not provided'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Banking & Statutory KYC */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Landmark className="w-4 h-4 text-[#072b53]" />
              Banking &amp; Statutory KYC
            </div>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Bank Name</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">
                  {employee.bankName ?? 'Restricted / Not set'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Account Number</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {employee.bankAccountNumber ?? 'Restricted / Not set'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">IFSC Code</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {employee.bankIfsc ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 inline-flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  PAN Number
                </dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {employee.panNumber ?? 'Restricted / Not set'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Aadhaar Number</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {employee.aadhaarNumber ?? 'Restricted / Not set'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">UAN Number</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {employee.uanNumber ?? 'Restricted / Not set'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Tab 1: Edit Form */}
      {activeTab === 'profile' && editing && (
        <form
          onSubmit={(e) => void handleSaveEdit(e)}
          className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Edit Employee Dossier
            </h2>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Phone</label>
              <input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            {isHrAdminOrSuper && (
              <>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="TEAM_LEADER">TEAM_LEADER</option>
                    <option value="HR_COORDINATOR">HR_COORDINATOR</option>
                    <option value="HR_ADMIN">HR_ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="">None</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Team</label>
                  <select
                    value={editForm.teamId}
                    onChange={(e) => setEditForm({ ...editForm, teamId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="">None</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Job Title</label>
                  <input
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Monthly Gross (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Gender</label>
              <input
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Date of Birth</label>
              <input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Blood Group</label>
              <input
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Emergency Contact Name
              </label>
              <input
                value={editForm.emergencyContactName}
                onChange={(e) =>
                  setEditForm({ ...editForm, emergencyContactName: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Emergency Contact Phone
              </label>
              <input
                value={editForm.emergencyContactPhone}
                onChange={(e) =>
                  setEditForm({ ...editForm, emergencyContactPhone: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-semibold text-slate-600 mb-1">Address</label>
              <input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Bank Name</label>
              <input
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Bank Account Number</label>
              <input
                value={editForm.bankAccountNumber}
                onChange={(e) => setEditForm({ ...editForm, bankAccountNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">IFSC Code</label>
              <input
                value={editForm.bankIfsc}
                onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">PAN Number</label>
              <input
                value={editForm.panNumber}
                onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Aadhaar Number</label>
              <input
                value={editForm.aadhaarNumber}
                onChange={(e) => setEditForm({ ...editForm, aadhaarNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">UAN Number</label>
              <input
                value={editForm.uanNumber}
                onChange={(e) => setEditForm({ ...editForm, uanNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: KYC Document Vault */}
      {activeTab === 'vault' && (
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          {canEdit && (
            <form
              onSubmit={(e) => void handleAddDocument(e)}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Doc Type
                </label>
                <select
                  value={docForm.docType}
                  onChange={(e) =>
                    setDocForm({ ...docForm, docType: e.target.value as DocumentType })
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                >
                  <option value="PAN">PAN</option>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="DEGREE">Degree</option>
                  <option value="OFFER_LETTER">Offer Letter</option>
                  <option value="NDA">NDA</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  File Name
                </label>
                <input
                  required
                  placeholder="pan_card.pdf"
                  value={docForm.fileName}
                  onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Document URL
                </label>
                <input
                  required
                  placeholder="https://..."
                  value={docForm.fileUrl}
                  onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={docBusy}
                className="px-3 py-1.5 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold disabled:opacity-50"
              >
                Add to Vault
              </button>
            </form>
          )}

          {employee.documents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No KYC documents uploaded (or restricted by RBAC).
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-lg">
              {employee.documents.map((doc) => (
                <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {doc.docType} &bull; {doc.fileName}
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 hover:underline"
                      >
                        Open Document
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : canVerifyKyc ? (
                      <button
                        type="button"
                        disabled={docBusy}
                        onClick={() => void handleVerifyDoc(doc.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
                      >
                        Verify KYC
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        Pending HR Verification
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Digital QR & vCard */}
      {activeTab === 'qr' && (
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center gap-2 min-w-[180px]">
            <QrCode className="w-24 h-24 text-slate-900" />
            <span className="text-xs font-mono font-bold text-slate-800">
              {qrBadge?.employeeId ?? employee.user.employeeId}
            </span>
            <span className="text-[11px] text-slate-500">Mark Anthony Realty ID</span>
          </div>
          <div className="flex-1 space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">
              vCard Digital Business Card
            </div>
            <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] overflow-x-auto">
              {qrBadge?.vCard ?? 'Loading vCard...'}
            </pre>
            <button
              type="button"
              onClick={() => void copyVCard()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedVCard ? 'Copied!' : 'Copy vCard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
