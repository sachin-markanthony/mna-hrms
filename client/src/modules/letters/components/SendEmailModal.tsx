import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Paperclip,
} from 'lucide-react';
import { lettersApi } from '../letters.api';
import { exportElementToPdfBase64 } from '../utils/pdfExport';
import { LetterDocument } from './LetterDocument';
import type { OfficialLetter, SendEmailResponse } from '../types';

interface SendEmailModalProps {
  letter: OfficialLetter | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendEmailModal({
  letter,
  isOpen,
  onClose,
  onSuccess,
}: SendEmailModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<SendEmailResponse | null>(null);

  const defaultDeadline = letter?.validUntil
    ? new Date(letter.validUntil).toLocaleDateString('en-GB')
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toLocaleDateString('en-GB');
      })();

  const signName = letter?.headOfHrName || 'Shilpa Kumari P';
  const signTitle = letter?.headOfHrTitle || 'Head of Finance and Human Resources';

  const isExperience = letter?.letterType === 'EXPERIENCE_LETTER';

  const defaultBody = letter
    ? isExperience
      ? `Dear ${letter.recipientName},

Please find attached your official Experience & Relieving Certificate from M&A Ventures${letter.employeeCode ? ` (Employee ID: ${letter.employeeCode})` : ''}.

We appreciate the services rendered during your tenure with the organization and wish you success and prosperity in all your future endeavors.

Best regards,
${signName}
${signTitle}
Mark Anthony Ventures`
      : `Dear ${letter.recipientName},
 
We are pleased to offer you the position of ${letter.designation} at Mark Anthony Ventures.
 
Attached to this email is your offer letter, which includes details about your job title, start date, and other important information about your role. Please take the time to review this document carefully and let us know if you have any questions or concerns.
 
We ask that you review the offer letter by ${defaultDeadline} to confirm your acceptance of this position.
 
We look forward to welcoming you to our team and working with you in the coming weeks and months. Please let us know if you have any questions or concerns about the onboarding process or your new role.
 
Best regards,
${signName}
${signTitle} 
Mark Anthony Ventures`
    : '';

  useEffect(() => {
    if (letter && isOpen) {
      setRecipientEmail(letter.recipientEmail);
      setCcEmails('');
      setSubject(
        letter.letterType === 'EXPERIENCE_LETTER'
          ? `Experience & Relieving Certificate — ${letter.recipientName} (Ref: ${letter.refNumber})`
          : `Formal Offer of Employment: ${letter.designation} — Mark Anthony Ventures (Ref: ${letter.refNumber})`,
      );
      setMessageBody(defaultBody);
      setError(null);
      setSuccessResult(null);
    }
  }, [letter, isOpen]);

  if (!isOpen || !letter) return null;

  const pdfFileName = `${isExperience ? 'Experience_Letter' : 'Offer_Letter'}_${letter.recipientName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);

    try {
      // 1. Try to render exact pixel-perfect base64 PDF from rendered DOM
      let pdfBase64: string | undefined;
      try {
        pdfBase64 = await exportElementToPdfBase64('email-pdf-letterhead');
      } catch {
        // Fallback: server will generate PDF via pdfkit
      }

      const ccList = ccEmails
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await lettersApi.sendEmail(letter.id, {
        recipientEmail: recipientEmail.trim(),
        ccEmails: ccList.length > 0 ? ccList : undefined,
        subject: subject.trim(),
        customMessage: messageBody.trim(),
        pdfBase64,
        pdfFileName,
      });

      setSuccessResult(res);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch offer letter email.');
    } finally {
      setSending(false);
    }
  };

  const handleNativeMailto = () => {
    const encodedSub = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(messageBody);
    const ccParam = ccEmails.trim() ? `&cc=${encodeURIComponent(ccEmails.trim())}` : '';
    window.open(`mailto:${recipientEmail}?subject=${encodedSub}&body=${encodedBody}${ccParam}`, '_blank');
    lettersApi.logAction(letter.id, 'EMAILED').catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#072b53]/10 dark:bg-amber-500/10 text-[#072b53] dark:text-amber-400">
              <Mail className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Email Offer Letter with PDF Attachment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ref: <strong className="text-slate-800 dark:text-slate-200 font-mono">{letter.refNumber}</strong> &bull; {letter.recipientName}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {successResult ? (
            <div className="space-y-4 py-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Offer Letter PDF Dispatched!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sent to <strong className="text-slate-800 dark:text-slate-200">{successResult.sentTo}</strong> with attached PDF: <span className="font-mono text-emerald-600 font-bold">{pdfFileName}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Message-ID: {successResult.messageId}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form id="send-letter-email-form" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Recipient & CC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="candidate@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    CC (Optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={ccEmails}
                    onChange={(e) => setCcEmails(e.target.value)}
                    placeholder="sachin.markanthony@gmail.com, hr@..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53]"
                />
              </div>

              {/* Attached PDF Indicator */}
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Attached Document: <strong className="font-mono">{pdfFileName}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-200">
                  PDF Format
                </span>
              </div>

              {/* Email Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email Message Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setMessageBody(defaultBody)}
                    className="text-[10px] text-[#072b53] dark:text-amber-400 hover:underline font-semibold"
                  >
                    Reset to Default Message
                  </button>
                </div>
                <textarea
                  rows={8}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#072b53] resize-y font-sans leading-relaxed"
                />
              </div>

              {/* Collapsible Offer Letter Summary */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2">
                <div
                  onClick={() => setPreviewExpanded(!previewExpanded)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Offer Letter Terms Summary
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <span>{previewExpanded ? 'Hide Details' : 'View Terms'}</span>
                    {previewExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {previewExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Role:</span>{' '}
                      <strong className="text-slate-800 dark:text-slate-200">{letter.designation}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Department:</span>{' '}
                      <strong className="text-slate-800 dark:text-slate-200">{letter.department}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Annual Gross CTC:</span>{' '}
                      <strong className="text-[#072b53] dark:text-amber-400">
                        ₹{Number(letter.annualGrossCtc || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Monthly Gross:</span>{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        ₹{Number(letter.monthlyGross || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Joining Date:</span>{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {letter.joiningDate ? new Date(letter.joiningDate).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Signatories:</span>{' '}
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                        Mark Anthony F. & Shilpa Kumari P.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Notice */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>
                  &bull; PDF generated, attached &amp; logged to <strong>SystemAuditLog</strong>
                </span>
                <button
                  type="button"
                  onClick={handleNativeMailto}
                  className="text-[#072b53] dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Open in Mail Client</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!successResult && (
          <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="send-letter-email-form"
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>{sending ? 'Attaching PDF & Sending...' : 'Send Official Email with PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Off-screen A4 letterhead renderer so PDF attachment always matches exact layout */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        <LetterDocument id="email-pdf-letterhead" letter={letter} showWatermark={false} />
      </div>
    </div>
  );
}
