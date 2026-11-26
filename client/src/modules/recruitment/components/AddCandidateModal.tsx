import { useState, useEffect, type FormEvent } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import type { CreateCandidatePayload, RecruitmentDepartment, TeamLeaderSummary } from '../types';
import { recruitmentApi } from '../recruitment.api';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCandidatePayload) => Promise<void>;
}

export function AddCandidateModal({ isOpen, onClose, onSubmit }: AddCandidateModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState<RecruitmentDepartment>('SALES');
  const [appliedRole, setAppliedRole] = useState('Luxury Property Sales Manager');
  const [visitDate, setVisitDate] = useState(today);
  const [experienceYears, setExperienceYears] = useState(3);
  const [currentCompany, setCurrentCompany] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('₹12,00,000 / yr');
  const [teamLeaderName, setTeamLeaderName] = useState('');
  const [teamLeaders, setTeamLeaders] = useState<TeamLeaderSummary[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      recruitmentApi
        .getTeamLeaders()
        .then((tls) => {
          if (tls && tls.length > 0) {
            setTeamLeaders(tls);
          } else {
            setTeamLeaders([
              {
                id: 'EMP-004',
                name: 'Dhinesh Kumar',
                email: 'tl.dhinesh@markanthony.in',
                employeeId: 'EMP-004',
                jobTitle: 'Sales Team Leader',
              },
            ]);
          }
        })
        .catch(() => {
          setTeamLeaders([
            {
              id: 'EMP-004',
              name: 'Dhinesh Kumar',
              email: 'tl.dhinesh@markanthony.in',
              employeeId: 'EMP-004',
              jobTitle: 'Sales Team Leader',
            },
          ]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDepartmentChange = (dept: RecruitmentDepartment) => {
    setDepartment(dept);
    if (dept === 'DIGITAL') {
      setAppliedRole('Performance Marketer');
    } else {
      setAppliedRole('Luxury Property Sales Manager');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const matchedTl = teamLeaders.find(
      (tl) => tl.name.trim().toLowerCase() === teamLeaderName.trim().toLowerCase(),
    );

    try {
      await onSubmit({
        fullName,
        email,
        phone,
        department,
        appliedRole,
        visitDate,
        experienceYears,
        currentCompany: currentCompany || undefined,
        expectedSalary,
        teamLeaderName: teamLeaderName.trim() || undefined,
        teamLeaderId: matchedTl?.id,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Register Office Walk-In Candidate
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark Anthony Ventures &bull; Candidate Intake Desk
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Department Selection (Strictly 2 Departments: Digital & Sales) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Target Department *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDepartmentChange('DIGITAL')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-center ${
                  department === 'DIGITAL'
                    ? 'bg-[#072b53] text-white border-[#072b53] shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Digital Department
              </button>

              <button
                type="button"
                onClick={() => handleDepartmentChange('SALES')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-center ${
                  department === 'SALES'
                    ? 'bg-[#072b53] text-white border-[#072b53] shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                Sales Department
              </button>
            </div>
          </div>

          {/* Candidate Full Name & Visit Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Candidate Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Siddharth Verma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Office Visit Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="siddharth.v@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
            </div>
          </div>

          {/* Applied Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Role Interviewing For *
            </label>
            <input
              type="text"
              required
              value={appliedRole}
              onChange={(e) => setAppliedRole(e.target.value)}
              placeholder={
                department === 'DIGITAL'
                  ? 'e.g. Performance Marketer, Social Media Executive, SEO Specialist'
                  : 'e.g. Luxury Property Sales Manager, Inside Sales Executive'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
            />
          </div>

          {/* Assigned Team Leader (Links directly to Team Leader Dashboard) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                Team Leader (Team Assignment)
              </label>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Filters to TL Portal
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                list="team-leaders-list"
                value={teamLeaderName}
                onChange={(e) => setTeamLeaderName(e.target.value)}
                placeholder="e.g. Dhinesh Kumar (or select from list)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
              <datalist id="team-leaders-list">
                {teamLeaders.map((tl) => (
                  <option key={tl.id} value={tl.name}>
                    {tl.name} ({tl.jobTitle || 'Team Leader'})
                  </option>
                ))}
              </datalist>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Select or type a Team Leader (e.g. <strong>Dhinesh Kumar</strong>) to allow them to track hiring progress from their dashboard.
            </p>
          </div>

          {/* Experience, Employer & Expected Salary */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Experience (Yrs)
              </label>
              <input
                type="number"
                step={0.5}
                min={0}
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Current Employer
              </label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g. Square Yards"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Expected CTC
              </label>
              <input
                type="text"
                required
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="₹10,00,000 / yr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-sm"
            >
              {submitting ? 'Registering...' : 'Log Walk-In Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
