import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck,
  Plus,
  Search,
  RefreshCw,
  Eye,
  FileText,
  Mail,
  UserPlus,
} from 'lucide-react';
import { lettersApi } from './letters.api';
import { recruitmentApi } from '../recruitment/recruitment.api';
import { CreateLetterModal } from './components/CreateLetterModal';
import { LetterViewModal } from './components/LetterViewModal';
import { SendEmailModal } from './components/SendEmailModal';
import type { OfficialLetter, LetterType, LetterStatus } from './types';
import type { Candidate } from '../recruitment/types';

export function LettersManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedCandidateId = searchParams.get('candidateId');

  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<LetterType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<LetterStatus | 'ALL'>('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewLetter, setViewLetter] = useState<OfficialLetter | null>(null);
  const [emailLetter, setEmailLetter] = useState<OfficialLetter | null>(null);
  const [preSelectedCandidate, setPreSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    loadLetters();
    if (preSelectedCandidateId) {
      loadPreSelectedCandidate(preSelectedCandidateId);
    }
  }, [preSelectedCandidateId]);

  const loadLetters = async () => {
    try {
      setLoading(true);
      const data = await lettersApi.getLetters();
      setLetters(data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const loadPreSelectedCandidate = async (candId: string) => {
    try {
      const candidates = await recruitmentApi.getCandidates();
      const match = candidates.find((c) => c.id === candId);
      if (match) {
        setPreSelectedCandidate(match);
        setCreateModalOpen(true);
      }
    } catch {
      // ignore
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this official letter? This action is logged.')) {
      return;
    }
    try {
      await lettersApi.revokeLetter(id);
      await loadLetters();
      if (viewLetter?.id === id) {
        setViewLetter(null);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke letter.');
    }
  };

  const handleRecordResponse = async (
    letter: OfficialLetter,
    response: 'ACCEPTED' | 'REJECTED',
  ) => {
    let remarks: string | undefined;
    if (response === 'REJECTED') {
      const input = window.prompt(
        `Candidate ${letter.recipientName} declined the offer. Optional remarks:`,
      );
      if (input === null) return;
      remarks = input.trim() || undefined;
    } else {
      if (!window.confirm(`Mark ${letter.recipientName}'s offer letter as ACCEPTED?`)) {
        return;
      }
    }
    try {
      await lettersApi.recordResponse(letter.id, response, remarks);
      await loadLetters();
    } catch (err: any) {
      alert(err?.message || 'Failed to record response.');
    }
  };

  // Filtered letters
  const filteredLetters = useMemo(() => {
    return letters.filter((l) => {
      const matchesType = selectedType === 'ALL' || l.letterType === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.recipientName.toLowerCase().includes(q) ||
        l.recipientEmail.toLowerCase().includes(q) ||
        l.refNumber.toLowerCase().includes(q) ||
        l.designation.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [letters, selectedType, selectedStatus, searchQuery]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = letters.length;
    const offers = letters.filter((l) => l.letterType === 'OFFER_LETTER').length;
    const experiences = letters.filter((l) => l.letterType === 'EXPERIENCE_LETTER').length;
    const active = letters.filter((l) => l.status === 'ISSUED').length;
    return { total, offers, experiences, active };
  }, [letters]);

  const formatCurrency = (amt?: number) => {
    if (!amt && amt !== 0) return '—';
    return `₹${Number(amt).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ====================================================
          PAGE HEADER
          ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#072b53] text-amber-400 shadow-sm">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Official Letters Releasing &amp; Vault
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated issuance of Offer and Relieving letters with dual CEO &amp; HR signatures, gross salary, and corporate seal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadLetters()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh Letters"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setPreSelectedCandidate(null);
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Issue Official Letter
          </button>
        </div>
      </div>

      {/* ====================================================
          METRICS CARDS
          ==================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Letters */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Letters Issued
          </span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Corporate document registry</div>
        </div>

        {/* Offer Letters */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Offer Letters
          </span>
          <div className="mt-2 text-2xl font-black text-sky-900 dark:text-sky-200">
            {stats.offers}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Recruitment appointments</div>
        </div>

        {/* Experience Letters */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Experience Letters
          </span>
          <div className="mt-2 text-2xl font-black text-purple-900 dark:text-purple-200">
            {stats.experiences}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Service certificates</div>
        </div>

        {/* Active Ratio */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Active &bull; Valid
          </span>
          <div className="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-200">
            {stats.active}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 100}% verified in force
          </div>
        </div>
      </div>

      {/* ====================================================
          SEARCH & FILTER CONTROLS
          ==================================================== */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipient name, email, ref number, or role..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#072b53]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#072b53]"
          >
            <option value="ALL">All Document Types</option>
            <option value="OFFER_LETTER">Offer Letters</option>
            <option value="EXPERIENCE_LETTER">Experience Letters</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#072b53]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ISSUED">Issued</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* ====================================================
          LETTERS REGISTRY TABLE
          ==================================================== */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Ref Number</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Designation &amp; Dept</th>
                <th className="px-5 py-3.5">Gross CTC</th>
                <th className="px-5 py-3.5">Issue Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                      No official letters found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Generate your first official offer or relieving letter using the button above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setViewLetter(l)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* Ref Number */}
                    <td className="px-5 py-3.5 font-mono font-bold text-[#072b53] dark:text-amber-400">
                      {l.refNumber}
                    </td>

                    {/* Recipient */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {l.recipientName}
                      </div>
                      <div className="text-[10px] text-slate-400">{l.recipientEmail}</div>
                    </td>

                    {/* Designation & Dept */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {l.designation}
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded uppercase border border-slate-200 dark:border-slate-700 text-slate-500">
                        {l.department}
                      </span>
                    </td>

                    {/* Gross CTC */}
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {l.letterType === 'OFFER_LETTER' ? (
                        <div>
                          <div>{formatCurrency(l.annualGrossCtc)} / yr</div>
                          <div className="text-[10px] text-slate-400">
                            {formatCurrency(l.monthlyGross)} / mo
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A (Certificate)</span>
                      )}
                    </td>

                    {/* Issue Date */}
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {new Date(l.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          l.status === 'ISSUED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!l.emailSentAt && l.status === 'ISSUED' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmailLetter(l);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#072b53] dark:text-amber-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200/60 dark:border-sky-800/60 transition-colors cursor-pointer"
                            title="Email letter to candidate via SMTP"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>
                        ) : l.emailSentAt && l.letterType === 'OFFER_LETTER' && l.candidateResponse !== 'ACCEPTED' && l.candidateResponse !== 'REJECTED' && l.status === 'ISSUED' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecordResponse(l, 'ACCEPTED');
                              }}
                              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecordResponse(l, 'REJECTED');
                              }}
                              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : l.emailSentAt && l.letterType === 'OFFER_LETTER' && l.candidateResponse === 'ACCEPTED' ? (
                          l.isEmployeeCreated || l.employeeId ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Onboarded
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/employees', {
                                  state: {
                                    prefillFromLetter: {
                                      name: l.recipientName,
                                      email: l.recipientEmail,
                                      phone: l.recipientPhone || '',
                                      jobTitle: l.designation,
                                      departmentName: l.department,
                                      salary: l.monthlyGross
                                        ? String(Math.round(l.monthlyGross))
                                        : l.annualGrossCtc
                                        ? String(Math.round(l.annualGrossCtc / 12))
                                        : '',
                                    },
                                  },
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                              title="Onboard accepted candidate into Employee Directory"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Add to Employee</span>
                            </button>
                          )
                        ) : l.emailSentAt ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${
                              l.candidateResponse === 'ACCEPTED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : l.candidateResponse === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {l.candidateResponse === 'ACCEPTED'
                              ? 'Accepted'
                              : l.candidateResponse === 'REJECTED'
                              ? 'Rejected'
                              : 'Email Sent'}
                          </span>
                        ) : null}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewLetter(l);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View &amp; Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================
          MODALS
      ==================================================== */}
      <CreateLetterModal
        isOpen={createModalOpen}
        preSelectedCandidate={preSelectedCandidate}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(created) => {
          setCreateModalOpen(false);
          loadLetters();
          setViewLetter(created);
        }}
      />

      <LetterViewModal
        letter={viewLetter}
        isOpen={Boolean(viewLetter)}
        onClose={() => setViewLetter(null)}
        onRevoke={handleRevoke}
        onUpdated={(updated) => {
          loadLetters();
          if (updated) {
            setViewLetter(updated);
          } else {
            setViewLetter(null);
          }
        }}
      />

      <SendEmailModal
        letter={emailLetter}
        isOpen={Boolean(emailLetter)}
        onClose={() => setEmailLetter(null)}
        onSuccess={() => {
          loadLetters();
        }}
      />
    </div>
  );
}
