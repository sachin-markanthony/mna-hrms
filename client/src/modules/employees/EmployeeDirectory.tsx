import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../services/toast';
import { useAuth, type UserRole } from '../auth';
import { employeesApi } from './employees.api';
import type {
  DepartmentOption,
  EmployeeRecord,
  TeamOption,
} from './types';

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'ON_NOTICE' | 'ALL'>('ACTIVE');

  // Create Employee Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const prefillAppliedRef = useRef(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '1234',
    role: 'EMPLOYEE' as UserRole,
    phone: '',
    departmentId: '',
    teamId: '',
    jobTitle: '',
    salary: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const isHrAdminOrSuper =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'HR_ADMIN' ||
    hasPermission('employees:manage_all');

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metaRes, listRes] = await Promise.all([
        employeesApi.getMeta(),
        employeesApi.getAll({
          search: search || undefined,
          departmentId: departmentFilter || undefined,
          teamId: teamFilter || undefined,
          employmentStatus: statusFilter,
        }),
      ]);
      setDepartments(metaRes.departments);
      setTeams(metaRes.teams);
      setEmployees(listRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, teamFilter, statusFilter]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  // Pre-fill Add Employee modal once when navigated from an Accepted Offer Letter
  useEffect(() => {
    const prefill = (location.state as any)?.prefillFromLetter;
    if (!prefill) return;

    const matchedDept = departments.find(
      (d) =>
        d.name.toUpperCase().includes((prefill.departmentName || '').toUpperCase()) ||
        (prefill.departmentName || '').toUpperCase().includes(d.name.toUpperCase()),
    );

    if (!prefillAppliedRef.current) {
      prefillAppliedRef.current = true;
      setForm((prev) => ({
        ...prev,
        name: prefill.name || prev.name,
        email: prefill.email || prev.email,
        phone: prefill.phone || prev.phone,
        jobTitle: prefill.jobTitle || prev.jobTitle,
        salary: prefill.salary || prev.salary,
        departmentId: matchedDept?.id || prev.departmentId,
      }));
      setCreateOpen(true);
    } else if (matchedDept?.id) {
      setForm((prev) => (prev.departmentId ? prev : { ...prev, departmentId: matchedDept.id }));
    }
  }, [location.state, departments]);

  const pendingKycCount = useMemo(
    () =>
      employees.reduce(
        (acc, emp) => acc + emp.documents.filter((d) => !d.isVerified).length,
        0,
      ),
    [employees],
  );

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await employeesApi.create({
        employeeId: form.employeeId.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || undefined,
        departmentId: form.departmentId || undefined,
        teamId: form.teamId || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        salary: form.salary ? Number(form.salary) : undefined,
        bloodGroup: form.bloodGroup.trim() || undefined,
        emergencyContactName: form.emergencyContactName.trim() || undefined,
        emergencyContactPhone: form.emergencyContactPhone.trim() || undefined,
      });
      setCreateOpen(false);
      navigate(location.pathname, { replace: true, state: null });
      setForm({
        employeeId: '',
        name: '',
        email: '',
        password: '1234',
        role: 'EMPLOYEE',
        phone: '',
        departmentId: '',
        teamId: '',
        jobTitle: '',
        salary: '',
        bloodGroup: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
      });
      await loadDirectory();
      notifySuccess('Employee provisioned successfully.');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create employee';
      setCreateError(msg);
      notifyError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleArchive = async (emp: EmployeeRecord) => {
    if (!window.confirm(`Archive employee ${emp.user.name} (${emp.user.employeeId})?`)) {
      return;
    }
    try {
      await employeesApi.archive(emp.id);
      await loadDirectory();
      notifySuccess(`${emp.user.name} archived.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to archive employee';
      setError(msg);
      notifyError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Employee Directory &amp; KYC Vault
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized personnel dossiers, KYC verification vault, and digital QR ID badges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadDirectory()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isHrAdminOrSuper && (
            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Visible Headcount</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{employees.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Departments</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{departments.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Teams</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{teams.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending KYC Docs</span>
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{pendingKycCount}</p>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, email, or EMP ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'ACTIVE' | 'INACTIVE' | 'ON_NOTICE' | 'ALL')
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ACTIVE">Status: Active</option>
            <option value="INACTIVE">Status: Inactive / Exited</option>
            <option value="ON_NOTICE">Status: On Notice</option>
            <option value="ALL">Status: All</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department &amp; Team</th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">KYC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No employees matched your filters.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const verifiedCount = emp.documents.filter((d) => d.isVerified).length;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs flex items-center justify-center font-bold text-[11px]">
                            {emp.user.name
                              .split(' ')
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              <button
                                type="button"
                                onClick={() => navigate(`/employees/${emp.id}`)}
                                className="text-left hover:text-[#072b53] hover:underline cursor-pointer"
                              >
                                {emp.user.name}
                              </button>{' '}
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                                {emp.user.employeeId}
                              </span>
                              {emp.user.employmentStatus === 'INACTIVE' && (
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 ml-1">
                                  INACTIVE
                                </span>
                              )}
                              {emp.user.employmentStatus === 'ON_NOTICE' && (
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 ml-1">
                                  ON NOTICE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{emp.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {emp.department?.name ?? 'â€”'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {emp.user.team?.name ?? 'No Team'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {emp.jobTitle ?? 'â€”'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {emp.user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {emp.documents.length > 0 ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {verifiedCount}/{emp.documents.length} Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Restricted / None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          View Dossier
                        </button>
                        {isHrAdminOrSuper && emp.userId !== user?.id && (
                          <button
                            type="button"
                            onClick={() => void handleArchive(emp)}
                            title="Archive employee"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-slate-900">
                Add New Employee (Auto-Syncs Leave Balances)
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleCreateSubmit(e)} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    required
                    placeholder="EMP-011"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    placeholder="Neha Kulkarni"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="neha@markanthony.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password * (Default: 1234)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={4}
                    placeholder="1234"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="TEAM_LEADER">Team Lead</option>
                    <option value="HR_COORDINATOR">HR Coordinator</option>
                    <option value="HR_ADMIN">HR Admin</option>
                    {user?.role === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">SuperAdmin</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    placeholder="+919876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Team
                  </label>
                  <select
                    value={form.teamId}
                    onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="">Select Team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title
                  </label>
                  <input
                    placeholder="Field Sales Executive"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Gross Salary (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="45000"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <input
                    placeholder="O+"
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    placeholder="+919800000099"
                    value={form.emergencyContactPhone}
                    onChange={(e) =>
                      setForm({ ...form, emergencyContactPhone: e.target.value })
                    }
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
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {creating ? 'Provisioning...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
