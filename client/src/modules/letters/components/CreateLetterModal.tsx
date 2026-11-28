import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  FileCheck,
  Sparkles,
  AlertCircle,
  Search,
  Loader2,
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../../services/toast';
import { LetterDocument } from './LetterDocument';
import { lettersApi } from '../letters.api';
import { recruitmentApi } from '../../recruitment/recruitment.api';
import { employeesApi } from '../../employees/employees.api';
import type { Candidate } from '../../recruitment/types';
import type { EmployeeRecord } from '../../employees/types';
import type { OfficialLetter, CreateLetterPayload } from '../types';

interface PrefillExperiencePayload {
  fromOffboarding?: boolean;
  employeeId?: string;
  employeeCode?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  relievingDate?: string;
}

interface CreateLetterModalProps {
  isOpen: boolean;
  preSelectedCandidate?: Candidate | null;
  prefillExperience?: PrefillExperiencePayload | null;
  onClose: () => void;
  onSuccess: (letter: OfficialLetter) => void;
}

export function CreateLetterModal({
  isOpen,
  preSelectedCandidate,
  prefillExperience,
  onClose,
  onSuccess,
}: CreateLetterModalProps) {
  const [selectedCandidateList, setSelectedCandidateList] = useState<Candidate[]>([]);
  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateDropdownOpen, setCandidateDropdownOpen] = useState(false);

  const [employeeList, setEmployeeList] = useState<EmployeeRecord[]>([]);
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  // Form State
  const [letterType, setLetterType] = useState<'OFFER_LETTER' | 'EXPERIENCE_LETTER'>('OFFER_LETTER');
  const [candidateId, setCandidateId] = useState<string>(preSelectedCandidate?.id || '');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('MNA001');
  const [recipientGender, setRecipientGender] = useState<string>('MR');
  const [recipientName, setRecipientName] = useState(preSelectedCandidate?.fullName || '');
  const [recipientEmail, setRecipientEmail] = useState(preSelectedCandidate?.email || '');
  const [recipientPhone, setRecipientPhone] = useState(preSelectedCandidate?.phone || '');
  const [designation, setDesignation] = useState(preSelectedCandidate?.appliedRole || '');
  const [department, setDepartment] = useState<string>(preSelectedCandidate?.department || 'SALES');

  // Parse salary if available from candidate
  const initialCtc = preSelectedCandidate?.expectedSalary
    ? Number(preSelectedCandidate.expectedSalary.replace(/[^0-9]/g, '')) || 600000
    : 600000;

  const [annualGrossCtc, setAnnualGrossCtc] = useState<number>(initialCtc);
  const [monthlyGross, setMonthlyGross] = useState<number>(Math.round(initialCtc / 12));
  const [joiningDate, setJoiningDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [relievingDate, setRelievingDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [workLocation, setWorkLocation] = useState('Bangalore, Karnataka');
  const [probationMonths, setProbationMonths] = useState(3);
  const [customNotes, setCustomNotes] = useState('');

  // Dual Signatories
  const ceoName = 'Mark Anthony Fegradoe';
  const ceoTitle = 'Founder & Chief Executive Officer';
  const headOfHrName = 'Shilpa Kumari P';
  const headOfHrTitle = 'Head of Finance and Human Resources';

  const [previewScale, setPreviewScale] = useState<'85' | '100'>('85');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search for Selected Candidates (Offer Letter)
  useEffect(() => {
    if (!isOpen || letterType !== 'OFFER_LETTER') return;
    let active = true;
    setCandidateLoading(true);
    const timer = setTimeout(async () => {
      try {
        const candidates = await recruitmentApi.getCandidates({
          status: 'SELECTED',
          search: candidateQuery.trim() || undefined,
        });
        if (active) {
          setSelectedCandidateList(candidates || []);
        }
      } catch {
        // fallback gracefully
      } finally {
        if (active) setCandidateLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, letterType, candidateQuery]);

  // Debounced search for Employees by Employee ID or Name (Experience Letter)
  useEffect(() => {
    if (!isOpen || letterType !== 'EXPERIENCE_LETTER') return;
    const q = employeeQuery.trim();
    if (!q) {
      setEmployeeList([]);
      setEmployeeLoading(false);
      return;
    }

    let active = true;
    setEmployeeLoading(true);
    const timer = setTimeout(async () => {
      try {
        const emps = await employeesApi.getAll({ search: q });
        if (active) {
          setEmployeeList(emps || []);
        }
      } catch {
        // fallback gracefully
      } finally {
        if (active) setEmployeeLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, letterType, employeeQuery]);

  // Synchronize when prefillExperience changes (from Offboarding -> Issue Experience Letter)
  useEffect(() => {
    if (prefillExperience) {
      setLetterType('EXPERIENCE_LETTER');
      setEmployeeId(prefillExperience.employeeId || '');
      setEmployeeCode(prefillExperience.employeeCode || 'MNA001');
      setRecipientGender('MR');
      setRecipientName(prefillExperience.recipientName || '');
      setRecipientEmail(prefillExperience.recipientEmail || '');
      setRecipientPhone(prefillExperience.recipientPhone || '');
      setDesignation(prefillExperience.designation || '');
      const deptName = (prefillExperience.department || '').toUpperCase();
      setDepartment(deptName.includes('DIGITAL') ? 'DIGITAL' : 'SALES');
      if (prefillExperience.joiningDate) {
        setJoiningDate(prefillExperience.joiningDate);
      }
      if (prefillExperience.relievingDate) {
        setRelievingDate(prefillExperience.relievingDate);
      }
    }
  }, [prefillExperience]);

  // Synchronize when preSelectedCandidate changes
  useEffect(() => {
    if (preSelectedCandidate) {
      setCandidateId(preSelectedCandidate.id);
      setRecipientName(preSelectedCandidate.fullName);
      setRecipientEmail(preSelectedCandidate.email);
      setRecipientPhone(preSelectedCandidate.phone);
      setDesignation(preSelectedCandidate.appliedRole);
      setDepartment(preSelectedCandidate.department);
      if (preSelectedCandidate.expectedSalary) {
        const num = Number(preSelectedCandidate.expectedSalary.replace(/[^0-9]/g, ''));
        if (num > 0) {
          setAnnualGrossCtc(num);
          setMonthlyGross(Math.round(num / 12));
        }
      }
    }
  }, [preSelectedCandidate]);

  const handleSelectEmployee = (emp: EmployeeRecord) => {
    setEmployeeId(emp.id);
    setEmployeeQuery(`${emp.user?.employeeId || ''} — ${emp.user?.name || ''}`.trim());
    setEmployeeDropdownOpen(false);
    setRecipientName(emp.user?.name || '');
    setRecipientEmail(emp.user?.email || '');
    setRecipientPhone(emp.user?.phone || '');
    setDesignation(emp.jobTitle || '');
    const deptName = (emp.department?.name || '').toUpperCase();
    setDepartment(deptName.includes('DIGITAL') ? 'DIGITAL' : 'SALES');
    setEmployeeCode(emp.user?.employeeId || 'MNA001');
    if (emp.hireDate || emp.user?.dateOfJoining) {
      const d = emp.hireDate || emp.user?.dateOfJoining;
      if (d) setJoiningDate(new Date(d).toISOString().split('T')[0]);
    }
    setRecipientGender('MR');
  };

  const handleSelectCandidate = (cand: Candidate) => {
    setCandidateId(cand.id);
    setCandidateQuery(`${cand.fullName} — ${cand.appliedRole}`);
    setCandidateDropdownOpen(false);
    setRecipientName(cand.fullName);
    setRecipientEmail(cand.email);
    setRecipientPhone(cand.phone);
    setDesignation(cand.appliedRole);
    setDepartment(cand.department);
    if (cand.expectedSalary) {
      const num = Number(cand.expectedSalary.replace(/[^0-9]/g, ''));
      if (num > 0) {
        setAnnualGrossCtc(num);
        setMonthlyGross(Math.round(num / 12));
      }
    }
  };

  const handleAnnualChange = (val: number) => {
    setAnnualGrossCtc(val);
    setMonthlyGross(Math.round(val / 12));
  };

  const handleMonthlyChange = (val: number) => {
    setMonthlyGross(val);
    setAnnualGrossCtc(val * 12);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipientName.trim() || !recipientEmail.trim() || !designation.trim()) {
      const msg = 'Please provide recipient name, email, and designation.';
      setError(msg);
      notifyError(msg);
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateLetterPayload = {
        letterType,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim().toLowerCase(),
        recipientPhone: recipientPhone.trim() || undefined,
        designation: designation.trim(),
        department: department.trim(),
        annualGrossCtc: letterType === 'OFFER_LETTER' ? Number(annualGrossCtc) || undefined : undefined,
        monthlyGross: letterType === 'OFFER_LETTER' ? Number(monthlyGross) || undefined : undefined,
        joiningDate: joiningDate || undefined,
        relievingDate: letterType === 'EXPERIENCE_LETTER' ? relievingDate || undefined : undefined,
        employeeCode: letterType === 'EXPERIENCE_LETTER' ? employeeCode.trim() || undefined : undefined,
        recipientGender: letterType === 'EXPERIENCE_LETTER' ? recipientGender : undefined,
        workLocation: workLocation || 'Bangalore, Karnataka',
        probationMonths: Number(probationMonths) || 3,
        ceoName,
        ceoTitle,
        headOfHrName,
        headOfHrTitle,
        customNotes: customNotes.trim() || undefined,
        candidateId: candidateId || undefined,
        employeeId: employeeId || undefined,
      };

      const created = await lettersApi.createLetter(payload);
      notifySuccess(`Official letter ${created.refNumber} created.`);
      onSuccess(created);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create official letter.';
      setError(msg);
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Preview object synthesized from live form state
  const livePreviewData: Partial<OfficialLetter> = {
    refNumber: letterType === 'EXPERIENCE_LETTER' ? 'MAV/HR/EL/2026/PREVIEW' : 'MAV/HR/OL/2026/PREVIEW',
    letterType,
    status: 'ISSUED',
    recipientName: recipientName || 'Recipient Name',
    recipientEmail: recipientEmail || 'candidate@example.com',
    recipientPhone,
    designation: designation || 'Role / Designation',
    department: department || 'Department',
    annualGrossCtc: Number(annualGrossCtc) || 0,
    monthlyGross: Number(monthlyGross) || 0,
    joiningDate,
    relievingDate,
    employeeCode,
    recipientGender,
    workLocation,
    probationMonths: Number(probationMonths) || 3,
    ceoName,
    ceoTitle,
    headOfHrName,
    headOfHrTitle,
    customNotes,
    createdAt: new Date().toISOString(),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#072b53]/10 dark:bg-amber-500/10 text-[#072b53] dark:text-amber-400">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Official Letter Studio & Releasing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate executive Mark Anthony Ventures letterhead with live preview, dual signatures, and corporate seal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Panel Studio */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* ====================================================
              LEFT PANEL: FORM CONTROLS & DYNAMIC INPUTS (5 cols)
              ==================================================== */}
          <div className="lg:col-span-5 border-r border-slate-100 dark:border-slate-800 p-6 overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-[#0b1220]">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Search & Import from Selected Candidates (Offer Letter) */}
            {letterType === 'OFFER_LETTER' && (
              <div className="relative p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Search Selected Candidates
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    {selectedCandidateList.length} Found
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={candidateQuery}
                    onFocus={() => setCandidateDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setCandidateDropdownOpen(false), 180)}
                    onChange={(e) => {
                      setCandidateQuery(e.target.value);
                      setCandidateDropdownOpen(true);
                    }}
                    placeholder="Search selected candidate by name, role, or email..."
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {candidateLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  ) : candidateQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateQuery('');
                        setCandidateId('');
                      }}
                      className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>

                {candidateDropdownOpen && (
                  <div className="absolute left-3.5 right-3.5 z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 shadow-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedCandidateList.length === 0 ? (
                      <div className="px-3 py-2.5 text-[11px] text-slate-500">
                        {candidateLoading ? 'Searching candidates...' : 'No matching selected candidates.'}
                      </div>
                    ) : (
                      selectedCandidateList.slice(0, 15).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={() => handleSelectCandidate(c)}
                          className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {c.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {c.appliedRole} &bull; {c.department} &bull; {c.email}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Debounced Search & Import from Employees (Experience Letter) */}
            {letterType === 'EXPERIENCE_LETTER' && (
              <div className="relative p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Search Employee Directory
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    ID / Name
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={employeeQuery}
                    onFocus={() => setEmployeeDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setEmployeeDropdownOpen(false), 180)}
                    onChange={(e) => {
                      setEmployeeQuery(e.target.value);
                      setEmployeeDropdownOpen(true);
                    }}
                    placeholder="Type Employee ID (e.g. MNA001) or Name..."
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {employeeLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  ) : employeeQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEmployeeQuery('');
                        setEmployeeId('');
                        setEmployeeList([]);
                      }}
                      className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>

                {employeeDropdownOpen && employeeQuery.trim().length > 0 && (
                  <div className="absolute left-3.5 right-3.5 z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 shadow-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {employeeList.length === 0 ? (
                      <div className="px-3 py-2.5 text-[11px] text-slate-500">
                        {employeeLoading ? 'Searching employees...' : 'No employee found matching ID or name.'}
                      </div>
                    ) : (
                      employeeList.slice(0, 15).map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onMouseDown={() => handleSelectEmployee(emp)}
                          className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            <span className="font-mono text-[#072b53] dark:text-amber-400">
                              {emp.user?.employeeId}
                            </span>{' '}
                            &bull; {emp.user?.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {emp.jobTitle || 'Staff'} &bull; {emp.department?.name || 'N/A'} &bull; {emp.user?.email}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} id="create-letter-form" className="space-y-4">
              {/* Letter Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLetterType('OFFER_LETTER')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      letterType === 'OFFER_LETTER'
                        ? 'bg-[#072b53] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Job Offer Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setLetterType('EXPERIENCE_LETTER')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      letterType === 'EXPERIENCE_LETTER'
                        ? 'bg-[#072b53] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Experience Letter
                  </button>
                </div>
              </div>

              {/* Recipient Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Abhishek Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. abhishek@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Sales Executive"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                  >
                    <option value="SALES">SALES</option>
                    <option value="DIGITAL">DIGITAL</option>
                  </select>
                </div>
              </div>

              {/* Remuneration (Simply Gross Salary) */}
              {letterType === 'OFFER_LETTER' && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Gross Salary Structure
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-computed</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Annual Gross CTC (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={annualGrossCtc}
                        onChange={(e) => handleAnnualChange(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Monthly Gross (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={monthlyGross}
                        onChange={(e) => handleMonthlyChange(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-[#072b53] dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Letter Specific Fields: Employee ID & Salutation/Pronoun */}
              {letterType === 'EXPERIENCE_LETTER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="e.g. MNA000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Salutation &amp; Pronoun
                    </label>
                    <select
                      value={recipientGender}
                      onChange={(e) => setRecipientGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                    >
                      <option value="MR">Mr.</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dates & Location / Probation */}
              {letterType === 'OFFER_LETTER' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Work Location
                    </label>
                    <input
                      type="text"
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Probation (Months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={probationMonths}
                      onChange={(e) => setProbationMonths(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Employment From Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Relieving / To Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={relievingDate}
                      onChange={(e) => setRelievingDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                    />
                  </div>
                </div>
              )}

              {/* Custom Notes / Remarks */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Custom Terms / Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Target sales milestone bonus, shift timings..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                />
              </div>

              {/* Signatories Inspection */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Authorized Dual Signatories:</span>
                  <span className="text-emerald-600 font-semibold text-[10px]">Active & Verified</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span>Left: <strong>{ceoName}</strong> ({ceoTitle})</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span>Right: <strong>{headOfHrName}</strong> ({headOfHrTitle})</span>
                </div>
              </div>
            </form>
          </div>

          {/* ====================================================
              RIGHT PANEL: REAL-TIME LETTERHEAD PREVIEW (7 cols)
              ==================================================== */}
          <div className="lg:col-span-7 bg-slate-200/60 dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
            <div className="w-full mb-3 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FileCheck className="w-4 h-4 text-[#072b53] dark:text-amber-400" />
                Live Letterhead Preview (A4 Dimensions)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  ↕ Scroll to view salary & dual signatures
                </span>
                <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewScale('85')}
                    className={`px-2 py-0.5 transition-colors cursor-pointer ${
                      previewScale === '85'
                        ? 'bg-[#072b53] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Fit View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewScale('100')}
                    className={`px-2 py-0.5 transition-colors cursor-pointer ${
                      previewScale === '100'
                        ? 'bg-[#072b53] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    100%
                  </button>
                </div>
              </div>
            </div>

            {/* Scaled Preview of Document */}
            <div
              className="w-full bg-white shadow-xl rounded-sm transition-transform origin-top"
              style={{
                transform: previewScale === '85' ? 'scale(0.88)' : 'scale(1)',
                marginBottom: previewScale === '85' ? '-100px' : '0px',
              }}
            >
              <LetterDocument letter={livePreviewData} showWatermark={true} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              form="create-letter-form"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              {submitting ? 'Generating & Recording...' : 'Issue & Record Official Letter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
