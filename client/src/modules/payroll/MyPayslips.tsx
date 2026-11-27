import { useCallback, useEffect, useState } from 'react';
import {
  Briefcase,
  Download,
  Eye,
  FileCheck,
  FileText,
  IndianRupee,
  Printer,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  buildOfficialLetterHtml,
  buildPayslipHtml,
  downloadOfficialLetterFile,
  downloadPayslipFile,
} from './downloadPayslip';
import { payrollApi } from './payroll.api';
import type { OfficialLetterItem, PayslipItem } from './types';

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

export function MyPayslips() {
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [letters, setLetters] = useState<OfficialLetterItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'payslips' | 'letters'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [previewSlip, setPreviewSlip] = useState<PayslipItem | null>(null);
  const [previewLetter, setPreviewLetter] = useState<OfficialLetterItem | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [slipData, letterData] = await Promise.all([
        payrollApi.getMyPayslips(),
        payrollApi.getMyOfficialLetters(),
      ]);
      setPayslips(slipData);
      setLetters(letterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load official letters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const showPayslips = activeTab === 'all' || activeTab === 'payslips';
  const showLetters = activeTab === 'all' || activeTab === 'letters';
  const totalCount = payslips.length + letters.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Official Letters
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View and download your official HR documents — Monthly Salary Slips, Offer Letters, and HR Letters — in one click.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDocuments()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: 'all', label: `All Documents (${totalCount})` },
            { key: 'payslips', label: `Salary Slips (${payslips.length})` },
            { key: 'letters', label: `Offer & HR Letters (${letters.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-[#072b53] text-white shadow-xs'
                : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-500">Loading official letters...</div>
      ) : totalCount === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-10 text-center space-y-2.5">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-800 dark:text-white">
            No Official Letters Available Yet
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your Offer Letters and HR-released Monthly Salary Slips will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Offer & HR Letters */}
          {showLetters && letters.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Offer &amp; HR Letters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {letters.map((letter) => (
                  <div
                    key={letter.id}
                    className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            {letter.letterType.replace(/_/g, ' ')}
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {letter.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 mt-1">
                          Ref: {letter.refNumber}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {letter.designation} &bull; {letter.department}
                        </p>
                      </div>
                      <FileCheck className="w-5 h-5 text-[#072b53] shrink-0" />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPreviewLetter(letter)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => void downloadOfficialLetterFile(letter)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salary Slips */}
          {showPayslips && payslips.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                Monthly Salary Slips
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payslips.map((slip) => (
                  <div
                    key={slip.id}
                    className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            {MONTHS[slip.month - 1]} {slip.year}
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {slip.payrollRun?.status ?? 'RELEASED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          In-Hand: {formatINR(slip.monthlyGross)} &bull; PT:{' '}
                          {formatINR(slip.professionalTax)} &bull; LOP: {slip.lopDays}d (-
                          {formatINR(slip.lopDeduction)})
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">
                          Net Pay
                        </div>
                        <div className="text-lg font-extrabold text-[#072b53] dark:text-white flex items-center justify-end gap-0.5">
                          <IndianRupee className="w-4 h-4" />
                          {slip.netPay.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPreviewSlip(slip)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => void downloadPayslipFile(slip)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white text-xs font-semibold shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Salary Slip Preview Modal */}
      {previewSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden text-slate-900">
            <div className="px-6 py-3.5 bg-[#072b53] text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold">Mark Anthony Ventures &mdash; Salary Slip</h2>
                <p className="text-[11px] text-slate-200">
                  {MONTHS[previewSlip.month - 1]} {previewSlip.year} &bull;{' '}
                  {previewSlip.payrollRun?.status ?? 'RELEASED'}
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
                    const frame = document.getElementById(
                      'employee-payslip-frame',
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
                  onClick={() => setPreviewSlip(null)}
                  className="p-1 rounded hover:bg-white/15"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <iframe
              id="employee-payslip-frame"
              title="Salary Slip Preview"
              srcDoc={buildPayslipHtml(previewSlip)}
              className="w-full flex-1 border-0 bg-[#e8e8e8]"
            />
          </div>
        </div>
      )}

      {/* Official Letter Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden text-slate-900">
            <div className="px-6 py-3.5 bg-[#072b53] text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold">
                  Mark Anthony Ventures &mdash; {previewLetter.letterType.replace(/_/g, ' ')}
                </h2>
                <p className="text-[11px] text-slate-200">
                  Ref: {previewLetter.refNumber} &bull; {previewLetter.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void downloadOfficialLetterFile(previewLetter)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const frame = document.getElementById(
                      'employee-letter-frame',
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
                  onClick={() => setPreviewLetter(null)}
                  className="p-1 rounded hover:bg-white/15"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <iframe
              id="employee-letter-frame"
              title="Official Letter Preview"
              srcDoc={buildOfficialLetterHtml(previewLetter)}
              className="w-full flex-1 border-0 bg-[#e8e8e8]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
