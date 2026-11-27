import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, CheckCircle2, Download, Check, XCircle, Clock, UserPlus } from 'lucide-react';
import { LetterDocument } from './LetterDocument';
import { SendEmailModal } from './SendEmailModal';
import { lettersApi } from '../letters.api';
import { downloadElementAsPdf } from '../utils/pdfExport';
import type { OfficialLetter } from '../types';

interface LetterViewModalProps {
  letter: OfficialLetter | null;
  isOpen: boolean;
  onClose: () => void;
  onRevoke?: (letterId: string) => void;
  onUpdated?: (updated?: OfficialLetter) => void;
}

export function LetterViewModal({
  letter,
  isOpen,
  onClose,
  onRevoke,
  onUpdated,
}: LetterViewModalProps) {
  const navigate = useNavigate();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [updatingResponse, setUpdatingResponse] = useState(false);

  if (!isOpen || !letter) return null;

  const isOfferLetter = letter.letterType === 'OFFER_LETTER';
  const isEmailSent = Boolean(letter.emailSentAt);
  const isAccepted = letter.candidateResponse === 'ACCEPTED';
  const isRejected = letter.candidateResponse === 'REJECTED';
  const canRespond =
    isOfferLetter && isEmailSent && !isAccepted && !isRejected && letter.status === 'ISSUED';

  const handleDownloadPdf = async () => {
    try {
      await lettersApi.logAction(letter.id, 'DOWNLOADED');
    } catch {
      // non-blocking
    }
    const prefix = letter.letterType === 'EXPERIENCE_LETTER' ? 'Experience_Letter' : 'Offer_Letter';
    const filename = `${prefix}_${letter.recipientName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    await downloadElementAsPdf('printable-letterhead', filename);
  };

  const handleCandidateResponse = async (response: 'ACCEPTED' | 'REJECTED') => {
    let remarks: string | undefined;
    if (response === 'REJECTED') {
      const input = window.prompt(
        `Enter reason for rejecting / closing ${letter.recipientName}'s candidature (optional):`,
      );
      if (input === null) return;
      remarks = input.trim() || undefined;
    } else {
      if (!window.confirm(`Mark ${letter.recipientName}'s letter as ACCEPTED?`)) {
        return;
      }
    }

    try {
      setUpdatingResponse(true);
      const updated = await lettersApi.recordResponse(letter.id, response, remarks);
      onUpdated?.(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to record response.');
    } finally {
      setUpdatingResponse(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
          {/* Header bar (Hidden during print) */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0f172a] print:hidden">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Official Letter: {letter.refNumber}
                  </h2>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                      letter.status === 'ISSUED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {letter.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Issued to <strong>{letter.recipientName}</strong> &bull; {letter.recipientEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEmailSent && letter.status === 'ISSUED' ? (
                <button
                  onClick={() => setEmailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Send official letter email with attached PDF via SMTP"
                >
                  <Mail className="w-4 h-4 text-[#072b53] dark:text-amber-400" />
                  <span>Email Candidate</span>
                </button>
              ) : isEmailSent ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {isAccepted
                      ? 'Accepted by Candidate'
                      : isRejected
                      ? 'Rejected'
                      : 'Email Sent • Awaiting Response'}
                  </span>
                </span>
              ) : null}

              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-xs cursor-pointer"
                title="Directly download PDF letter"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
            <div className="w-full max-w-[820px]">
              <LetterDocument letter={letter} showWatermark={true} />
            </div>
          </div>

          {/* Footer (Hidden during print) */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center justify-between shrink-0 print:hidden text-xs text-slate-500">
            <div>
              System Audit Trace: Logged under <strong>{letter.refNumber}</strong>
            </div>

            <div className="flex items-center gap-3">
              {canRespond && (
                <>
                  <button
                    type="button"
                    disabled={updatingResponse}
                    onClick={() => handleCandidateResponse('ACCEPTED')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    type="button"
                    disabled={updatingResponse}
                    onClick={() => handleCandidateResponse('REJECTED')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </>
              )}

              {isAccepted && (
                <>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    {letter.isEmployeeCreated || letter.employeeId ? 'Accepted & Onboarded' : 'Accepted'}
                  </span>
                  {isOfferLetter && !letter.isEmployeeCreated && !letter.employeeId && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/employees', {
                          state: {
                            prefillFromLetter: {
                              name: letter.recipientName,
                              email: letter.recipientEmail,
                              phone: letter.recipientPhone || '',
                              jobTitle: letter.designation,
                              departmentName: letter.department,
                              salary: letter.monthlyGross
                                ? String(Math.round(letter.monthlyGross))
                                : letter.annualGrossCtc
                                ? String(Math.round(letter.annualGrossCtc / 12))
                                : '',
                            },
                          },
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add to Employee</span>
                    </button>
                  )}
                </>
              )}

              {isRejected && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />
                  Declined / Rejected
                </span>
              )}

              {letter.status === 'ISSUED' &&
                !isAccepted &&
                !letter.isEmployeeCreated &&
                !letter.employeeId &&
                onRevoke && (
                  <button
                    onClick={() => onRevoke(letter.id)}
                    className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Revoke Letter
                  </button>
                )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <SendEmailModal
        letter={letter}
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSuccess={() => {
          onUpdated?.();
        }}
      />
    </>
  );
}
