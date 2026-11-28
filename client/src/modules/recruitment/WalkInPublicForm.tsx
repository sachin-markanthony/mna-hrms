import { useState, type FormEvent } from 'react';
import { CheckCircle2, Building2, Loader2, Send } from 'lucide-react';
import { recruitmentApi } from './recruitment.api';
import type { RecruitmentDepartment } from './types';
import { notifyError, notifySuccess } from '../../services/toast';
import logoImg from '../../assets/malogo.png';

type FieldErrors = Partial<
  Record<
    | 'fullName'
    | 'email'
    | 'phone'
    | 'department'
    | 'experienceYears'
    | 'currentCompany'
    | 'currentCtc'
    | 'expectedSalary',
    string
  >
>;

export function WalkInPublicForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState<RecruitmentDepartment>('SALES');
  const [experienceType, setExperienceType] = useState<'FRESHER' | 'EXPERIENCED'>('FRESHER');
  const [experienceYears, setExperienceYears] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentCtc, setCurrentCtc] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedCandidate, setSubmittedCandidate] = useState<string | null>(null);

  const isExperienced = experienceType === 'EXPERIENCED';
  const expNum = isExperienced ? Number(experienceYears) : 0;

  const validateAllFields = (): FieldErrors => {
    const errs: FieldErrors = {};
    const nameTrimmed = fullName.trim();
    const emailTrimmed = email.trim().toLowerCase();
    const phoneTrimmed = phone.trim();

    if (!nameTrimmed) {
      errs.fullName = 'Full name is required.';
    } else if (nameTrimmed.length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      errs.fullName = 'Full name must contain only alphabetic characters.';
    }

    if (!emailTrimmed) {
      errs.email = 'Email address is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailTrimmed)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!phoneTrimmed) {
      errs.phone = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(phoneTrimmed)) {
      errs.phone = 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }

    if (department !== 'SALES' && department !== 'DIGITAL') {
      errs.department = 'Please select Sales or Digital.';
    }

    if (isExperienced) {
      if (
        experienceYears.trim() === '' ||
        Number.isNaN(expNum) ||
        expNum <= 0 ||
        expNum > 50
      ) {
        errs.experienceYears = 'Enter valid years of experience (greater than 0, up to 50).';
      }
      if (!currentCompany.trim() || currentCompany.trim().length < 2) {
        errs.currentCompany = 'Current / Previous company name is required.';
      }
      if (!currentCtc.trim() || !/\d/.test(currentCtc)) {
        errs.currentCtc = 'Current CTC is required (include amount).';
      }
      if (!expectedSalary.trim() || !/\d/.test(expectedSalary)) {
        errs.expectedSalary = 'Expected CTC is required (include amount).';
      }
    }

    return errs;
  };

  const clearFieldError = (key: keyof FieldErrors) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errs = validateAllFields();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      return;
    }

    const tags = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15);

    if (isExperienced && currentCtc.trim()) {
      tags.push(`Current CTC: ${currentCtc.trim()}`);
    } else {
      tags.push('Fresher');
    }

    try {
      setSubmitting(true);
      await recruitmentApi.registerWalkIn({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        experienceYears: expNum,
        currentCompany: isExperienced ? currentCompany.trim() : undefined,
        expectedSalary: isExperienced ? expectedSalary.trim() : undefined,
        tags,
      });
      notifySuccess('Walk-in registration submitted successfully!');
      setSubmittedCandidate(fullName.trim());
    } catch (err: any) {
      const msg = err?.message || 'Unable to submit your walk-in registration. Please inform HR.';
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 flex flex-col items-center px-3 py-4 sm:p-6">
      <div className="w-full max-w-xl my-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden shrink-0">
        {/* Brand Header (White Mark Anthony Ventures, no HRMS badge) */}
        <div className="bg-[#072b53] px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={logoImg}
              alt="Mark Anthony Ventures"
              className="h-8 sm:h-9 w-auto object-contain shrink-0"
            />
            <div className="flex flex-col leading-none">
              <span className="font-serif font-extrabold tracking-widest uppercase text-white text-sm sm:text-base">
                MARK ANTHONY
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-300 mt-0.5">
                VENTURES
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Walk-In Registration
          </span>
        </div>

        {submittedCandidate ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Registration Submitted!</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Thank you, <strong>{submittedCandidate}</strong>. Your walk-in profile has been
              received by our HR team. Please have a seat in the reception area — our HR Coordinator
              will call you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-5 space-y-3">
            <div>
              <h1 className="text-base font-bold text-slate-900">Candidate Walk-In Form</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Welcome to Mark Anthony Ventures. Please fill in your details below to begin your
                interview process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    const onlyChars = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFullName(onlyChars);
                    clearFieldError('fullName');
                  }}
                  placeholder="e.g. Rohan Deshmukh"
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.fullName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-[#072b53]/20'
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder="rohan@gmail.com"
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-[#072b53]/20'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => {
                    const rawDigits = e.target.value.replace(/\D/g, '');
                    if (rawDigits.length > 0 && /^[0-5]/.test(rawDigits)) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        phone: 'Please enter a mobile number starting with 6, 7, 8, or 9.',
                      }));
                      const validDigits = rawDigits.replace(/^[0-5]+/, '').slice(0, 10);
                      setPhone(validDigits);
                      return;
                    }
                    setPhone(rawDigits.slice(0, 10));
                    clearFieldError('phone');
                  }}
                  placeholder="10-digit mobile (6-9...)"
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.phone
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-[#072b53]/20'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Department *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value as RecruitmentDepartment);
                      clearFieldError('department');
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#072b53]/20"
                  >
                    <option value="SALES">Sales</option>
                    <option value="DIGITAL">Digital</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Experience Level *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setExperienceType('FRESHER');
                      setExperienceYears('');
                      setCurrentCompany('');
                      setCurrentCtc('');
                      setExpectedSalary('');
                      setFieldErrors((prev) => ({
                        ...prev,
                        experienceYears: undefined,
                        currentCompany: undefined,
                        currentCtc: undefined,
                        expectedSalary: undefined,
                      }));
                    }}
                    className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      experienceType === 'FRESHER'
                        ? 'bg-[#072b53] text-white border-[#072b53]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Fresher
                  </button>
                  <button
                    type="button"
                    onClick={() => setExperienceType('EXPERIENCED')}
                    className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      experienceType === 'EXPERIENCED'
                        ? 'bg-[#072b53] text-white border-[#072b53]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Experienced
                  </button>
                </div>
              </div>

              {isExperienced && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Years of Experience *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={experienceYears}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setExperienceYears(val);
                        clearFieldError('experienceYears');
                      }}
                      placeholder="e.g. 2.5"
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                        fieldErrors.experienceYears
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-[#072b53]/20'
                      }`}
                    />
                    {fieldErrors.experienceYears && (
                      <p className="text-[10px] text-rose-600 mt-0.5">
                        {fieldErrors.experienceYears}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Current / Previous Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentCompany}
                      onChange={(e) => {
                        setCurrentCompany(e.target.value);
                        clearFieldError('currentCompany');
                      }}
                      placeholder="e.g. ABC Realty"
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                        fieldErrors.currentCompany
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-[#072b53]/20'
                      }`}
                    />
                    {fieldErrors.currentCompany && (
                      <p className="text-[10px] text-rose-600 mt-0.5">
                        {fieldErrors.currentCompany}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Current CTC *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentCtc}
                      onChange={(e) => {
                        setCurrentCtc(e.target.value);
                        clearFieldError('currentCtc');
                      }}
                      placeholder="e.g. ₹3,60,000 / yr"
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                        fieldErrors.currentCtc
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-[#072b53]/20'
                      }`}
                    />
                    {fieldErrors.currentCtc && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors.currentCtc}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Expected CTC *
                    </label>
                    <input
                      type="text"
                      required
                      value={expectedSalary}
                      onChange={(e) => {
                        setExpectedSalary(e.target.value);
                        clearFieldError('expectedSalary');
                      }}
                      placeholder="e.g. ₹4,80,000 / yr"
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                        fieldErrors.expectedSalary
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-[#072b53]/20'
                      }`}
                    />
                    {fieldErrors.expectedSalary && (
                      <p className="text-[10px] text-rose-600 mt-0.5">
                        {fieldErrors.expectedSalary}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Key Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. Real Estate Sales, CRM, Negotiation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#072b53]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#072b53] hover:bg-[#0a3869] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  Submit Walk-In Registration
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
