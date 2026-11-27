import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  LockKeyhole,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useInductionLearning } from '../hooks/useInductionLearning';
import {
  formatDateTime,
  getAssessmentLabel,
  getChapterStatusMeta,
} from '../utils/chapterStatus';
import { EmptyState } from '../components/common/States';
import { StatusPill } from '../components/ui/StatusPill';
import { buttonStyles } from '../components/ui/Button';

export function AssessmentsPage() {
  const { learningChapters, finalAssessment, summary } = useInductionLearning();
  const assessments = [...learningChapters, finalAssessment];

  const passed = assessments.filter((chapter) => chapter.completed).length;
  const pending = assessments.filter(
    (chapter) =>
      !chapter.completed &&
      chapter.isUnlocked &&
      (chapter.status === 'reading_completed' || chapter.status === 'assessment_failed'),
  ).length;

  const attempts = [...assessments]
    .flatMap((chapter) => chapter.attempts)
    .sort(
      (first, second) =>
        new Date(second.attemptedAt).getTime() - new Date(first.attemptedAt).getTime(),
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
          <ClipboardCheck className="h-3 w-3" />
          My assessments
        </div>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#3B2314] sm:text-3xl">
          Assessments
        </h1>
        <p className="mt-1 max-w-2xl text-[11.5px] leading-6 text-[#8A7A6C]">
          Chapter assessments unlock after reading. Pass each assessment to complete the chapter
          and open the next step in your induction.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E9DED2] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
            <CheckCircle2 className="h-3 w-3 text-[#4F7F61]" />
            Passed
          </div>
          <p className="mt-1.5 text-2xl font-extrabold text-[#3B2314]">{passed}</p>
          <p className="mt-0.5 text-[10px] text-[#8A7A6C]">of {assessments.length} assessments</p>
        </div>
        <div className="rounded-2xl border border-[#E9DED2] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
            <Clock3 className="h-3 w-3 text-[#B8893A]" />
            Ready now
          </div>
          <p className="mt-1.5 text-2xl font-extrabold text-[#3B2314]">{pending}</p>
          <p className="mt-0.5 text-[10px] text-[#8A7A6C]">awaiting an attempt</p>
        </div>
        <div className="rounded-2xl border border-[#E9DED2] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
            <RotateCcw className="h-3 w-3 text-[#9A7A45]" />
            Attempts
          </div>
          <p className="mt-1.5 text-2xl font-extrabold text-[#3B2314]">{summary.totalAttempts}</p>
          <p className="mt-0.5 text-[10px] text-[#8A7A6C]">saved in your history</p>
        </div>
        <div className="rounded-2xl border border-[#E9DED2] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
            <Trophy className="h-3 w-3 text-[#B8893A]" />
            Average score
          </div>
          <p className="mt-1.5 text-2xl font-extrabold text-[#3B2314]">
            {summary.averageScore > 0 ? `${summary.averageScore}%` : '—'}
          </p>
          <p className="mt-0.5 text-[10px] text-[#8A7A6C]">best scores across chapters</p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
        <div className="flex flex-col gap-2 border-b border-[#F0E7DC] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#3B2314]">Assessment roadmap</h2>
            <p className="mt-0.5 text-[10.5px] text-[#8A7A6C]">
              Every chapter assessment in sequence, including the final assessment.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#E9DED2] bg-[#FFFCF7] px-2.5 py-1 text-[9.5px] font-bold text-[#6E5B4C]">
            <ClipboardCheck className="h-3 w-3 text-[#B8893A]" />
            {assessments.length} assessments
          </span>
        </div>

        <div className="mt-3 divide-y divide-[#F3ECE3]">
          {assessments.map((chapter) => {
            const meta = getChapterStatusMeta(chapter);
            const isFinal = chapter.kind === 'final_assessment';
            const locked = chapter.status === 'locked';
            return (
              <div
                key={chapter.chapterNumber}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold ${
                      chapter.completed
                        ? 'bg-[#EEF6F0] text-[#356B4A]'
                        : locked
                          ? 'bg-[#F5F2EE] text-[#A09182]'
                          : 'bg-[#FBF5EA] text-[#8A6427]'
                    }`}
                  >
                    {chapter.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : locked ? (
                      <LockKeyhole className="h-4 w-4" />
                    ) : (
                      chapter.chapterNumber
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12px] font-extrabold text-[#3B2314]">
                        {isFinal ? chapter.title : `Chapter ${chapter.chapterNumber} — ${chapter.title}`}
                      </p>
                      <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                    </div>
                    <p className="mt-0.5 text-[10.5px] text-[#8A7A6C]">
                      {getAssessmentLabel(chapter)}
                      {chapter.bestScore ? ` · Best ${chapter.bestScore}%` : ''}
                      {chapter.attempts.length > 0
                        ? ` · ${chapter.attempts.length} attempt${chapter.attempts.length === 1 ? '' : 's'}`
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {locked ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E0D8] bg-[#F7F4F0] px-3 py-2 text-[10px] font-bold text-[#A09182]">
                      <LockKeyhole className="h-3 w-3" />
                      Locked
                    </span>
                  ) : chapter.completed ? (
                    <>
                      <Link
                        to={`/induction/chapters/${chapter.chapterNumber}/result`}
                        className={buttonStyles('secondary', 'sm')}
                      >
                        View result
                      </Link>
                      <Link
                        to={`/induction/chapters/${chapter.chapterNumber}/assessment`}
                        className={buttonStyles('primary', 'sm')}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retake
                      </Link>
                    </>
                  ) : chapter.status === 'reading_completed' ||
                    chapter.status === 'assessment_failed' ? (
                    <Link
                      to={
                        isFinal
                          ? '/induction/final-assessment'
                          : `/induction/chapters/${chapter.chapterNumber}/assessment`
                      }
                      className={buttonStyles('primary', 'sm')}
                    >
                      <ClipboardCheck className="h-3 w-3" />
                      {chapter.status === 'assessment_failed' ? 'Retry' : 'Take assessment'}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <Link
                      to={`/induction/chapters/${chapter.chapterNumber}`}
                      className={buttonStyles('secondary', 'sm')}
                    >
                      Read chapter first
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-[#3B2314]">Attempt history</h2>
            <p className="mt-0.5 text-[10.5px] text-[#8A7A6C]">
              Every submission is stored separately, including failed attempts.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#E9DED2] bg-[#FFFCF7] px-2.5 py-1 text-[9.5px] font-bold text-[#6E5B4C]">
            {attempts.length} total
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={ClipboardCheck}
              title="No attempts yet"
              description="Complete your first chapter reading to unlock its assessment. Your attempt history will appear here."
              action={
                summary.currentChapter ? (
                  <Link
                    to={`/induction/chapters/${summary.currentChapter.chapterNumber}`}
                    className={buttonStyles('primary', 'md')}
                  >
                    Continue Chapter {summary.currentChapter.chapterNumber}
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#EFE5D9]">
            <table className="w-full min-w-[620px] border-collapse text-left text-[11px]">
              <thead className="bg-[#FBF5EA] text-[9px] uppercase tracking-[0.1em] text-[#8A6427]">
                <tr>
                  <th className="px-3.5 py-2.5 font-extrabold">Chapter</th>
                  <th className="px-3.5 py-2.5 font-extrabold">Attempt</th>
                  <th className="px-3.5 py-2.5 font-extrabold">Submitted</th>
                  <th className="px-3.5 py-2.5 font-extrabold">Score</th>
                  <th className="px-3.5 py-2.5 font-extrabold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EAE0]">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="bg-white">
                    <td className="px-3.5 py-2.5 font-bold text-[#3B2314]">
                      Chapter {attempt.chapterNumber}
                    </td>
                    <td className="px-3.5 py-2.5 text-[#7A6A5C]">#{attempt.attemptNumber}</td>
                    <td className="px-3.5 py-2.5 text-[#7A6A5C]">
                      {formatDateTime(attempt.attemptedAt)}
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-[#3B2314]">{attempt.score}%</td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                          attempt.passed
                            ? 'bg-[#EEF6F0] text-[#356B4A]'
                            : 'bg-[#FDF3E1] text-[#9A6420]'
                        }`}
                      >
                        {attempt.passed ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : (
                          <AlertCircle className="h-2.5 w-2.5" />
                        )}
                        {attempt.passed ? 'Passed' : 'Not passed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
