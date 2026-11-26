import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { useTrainingSummary } from '../../onboarding/hooks/useInductionStore';

export function TrainingProgressCard() {
  const navigate = useNavigate();
  const summary = useTrainingSummary();
  const next = summary.nextChapter;
  const isCompleted = summary.status === 'Completed';

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#111c35]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">
                Induction &amp; Training
              </h3>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                Handbook v2.0
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              MA Ventures Employee Induction &bull; Training Document + MCQ assessments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${isCompleted
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
            {summary.status}
          </span>
          <button
            type="button"
            onClick={() => navigate('/training')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#072b53] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#041c38] dark:bg-[#1e3a8a] dark:hover:bg-[#1e40af] cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            Open Training Document
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Overall induction completion
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {summary.overallPercentage}%
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {summary.completedChapters}/{summary.totalChapters} chapters
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Live sync
            </span>
          </div>

          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#072b53] to-[#D4AF37] transition-all duration-700 dark:from-[#1e3a8a] dark:to-[#D4AF37]"
              style={{ width: `${summary.overallPercentage}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Chapters
              </span>
              <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {summary.completedChapters}
                <span className="text-xs font-semibold text-slate-400"> / {summary.totalChapters}</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <ClipboardCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                MCQs pending
              </span>
              <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {summary.pendingAssessments}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Award className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                Avg. score
              </span>
              <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {summary.averageScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          {next ? (
            <>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Continue where you left off
                </span>
                <p className="mt-1.5 text-sm font-extrabold leading-snug text-slate-900 dark:text-white">
                  Chapter {next.chapterNumber} &mdash; {next.title}
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {summary.nextSession
                    ? `Session ${summary.nextSession.sessionNumber} · ${summary.nextSession.title}`
                    : 'Induction curriculum'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {next.estimatedDuration}
                  </span>
                  {next.quizAvailable && (
                    <span className="inline-flex items-center gap-1">
                      <ClipboardCheck className="h-3.5 w-3.5 text-slate-400" />
                      MCQ assessment
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/training')}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-[#1A120B] transition hover:bg-[#C29D29] cursor-pointer"
              >
                Continue training
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Award className="h-3.5 w-3.5" />
                  Induction complete
                </span>
                <p className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">
                  All core chapters and assessments are complete.
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Your training record is up to date. You can revisit any document or retake an MCQ
                  at any time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/training')}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer"
              >
                Review training document
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-3 text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {summary.lastAttempt
            ? `Last assessment: Chapter ${summary.lastAttempt.chapterNumber} · ${summary.lastAttempt.score}% (${summary.lastAttempt.passed ? 'passed' : 'not passed'})`
            : 'No assessment attempted yet'}
        </span>
        <span>
          Last activity: {summary.lastAccessedAt} &bull; Chapter completion is unlocked by passing the
          MCQ
        </span>
      </div>
    </section>
  );
}
