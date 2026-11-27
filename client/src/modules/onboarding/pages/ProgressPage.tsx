import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { useInductionLearning } from '../hooks/useInductionLearning';
import { MODULE_GROUPS } from '../data/chapterCatalog';
import { formatShortDate, getChapterStatusMeta } from '../utils/chapterStatus';
import { ProgressRing } from '../components/ui/ProgressRing';
import { StatusPill } from '../components/ui/StatusPill';
import { buttonStyles } from '../components/ui/Button';
import { INDUCTION_CONFIG } from '../config/induction.config';

export function ProgressPage() {
  const { summary, learningChapters, finalAssessment } = useInductionLearning();
  const chapterByNumber = new Map(
    learningChapters.map((chapter) => [chapter.chapterNumber, chapter]),
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
          <BarChart3 className="h-3 w-3" />
          My progress
        </div>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#3B2314] sm:text-3xl">
          Your induction progress
        </h1>
        <p className="mt-1 max-w-2xl text-[11.5px] leading-6 text-[#8A7A6C]">
          A clear view of every chapter, assessment and attempt. Your progress is saved
          automatically and remains available after a refresh.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing
              percentage={summary.overallPercentage}
              size={150}
              strokeWidth={11}
              caption="Complete"
              tone={summary.overallPercentage === 100 ? 'green' : 'gold'}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={summary.overallPercentage === 100 ? 'completed' : 'progress'}>
                  {summary.overallPercentage === 100 ? 'Induction complete' : 'In progress'}
                </StatusPill>
                <span className="text-[10px] font-semibold text-[#8A7A6C]">
                  {summary.completedChapters} of {summary.totalLearningChapters} learning chapters
                </span>
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-[#3B2314]">
                {summary.remainingChapters === 0
                  ? 'Every learning chapter is complete'
                  : `${summary.remainingChapters} chapter${summary.remainingChapters === 1 ? '' : 's'} to go`}
              </h2>
              <p className="mt-1 text-[11px] leading-6 text-[#8A7A6C]">
                {summary.currentChapter
                  ? `You are currently on Chapter ${summary.currentChapter.chapterNumber} — ${summary.currentChapter.title}.`
                  : summary.finalAssessment.completed
                    ? 'You have completed the Grand Final Quiz. Well done.'
                    : 'Your final assessment is ready when you are.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {summary.currentChapter && (
                  <Link
                    to={`/induction/chapters/${summary.currentChapter.chapterNumber}`}
                    className={buttonStyles('primary', 'md')}
                  >
                    Continue Chapter {summary.currentChapter.chapterNumber}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <Link to="/induction/chapters" className={buttonStyles('secondary', 'md')}>
                  View roadmap
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                Completed
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#3B2314]">
                {summary.completedChapters}
              </p>
            </div>
            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                Remaining
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#3B2314]">
                {summary.remainingChapters}
              </p>
            </div>
            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                Locked
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#3B2314]">
                {summary.lockedChapters}
              </p>
            </div>
            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FFFCF7] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A09182]">
                Average score
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#3B2314]">
                {summary.averageScore > 0 ? `${summary.averageScore}%` : '—'}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-[#E9DED2] bg-white p-5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <Trophy className="h-3 w-3" />
              Final assessment
            </div>
            <p className="mt-2 text-[12px] font-bold text-[#3B2314]">
              {finalAssessment.title}
            </p>
            <p className="mt-1 text-[10.5px] leading-5 text-[#8A7A6C]">
              {finalAssessment.completed
                ? `Completed with a best score of ${finalAssessment.bestScore ?? 0}%.`
                : finalAssessment.isUnlocked
                  ? `Unlocked and ready. Twenty questions, ${INDUCTION_CONFIG.passingPercentage}% to pass.`
                  : 'Complete all 18 learning chapters to unlock the final assessment.'}
            </p>
            <Link
              to={
                finalAssessment.completed
                  ? '/induction/chapters/21/result'
                  : '/induction/final-assessment'
              }
              className={buttonStyles(
                finalAssessment.isUnlocked ? 'primary' : 'secondary',
                'sm',
                'mt-3 w-full',
              )}
            >
              {finalAssessment.completed ? 'View final result' : 'Open final assessment'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </section>

          <section className="rounded-3xl border border-[#E9DED2] bg-[#FFFCF7] p-5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <Sparkles className="h-3 w-3" />
              Attempts saved
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-[#3B2314]">
              {summary.totalAttempts}
            </p>
            <p className="mt-0.5 text-[10.5px] leading-5 text-[#8A7A6C]">
              Every submission is stored with its score, date and pass/fail result.
            </p>
            <Link
              to="/induction/assessments"
              className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#8A6427] underline decoration-[#D9BE92] underline-offset-4"
            >
              View attempt history
              <ArrowRight className="h-3 w-3" />
            </Link>
          </section>
        </aside>
      </div>

      <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
        <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
          <Target className="h-3 w-3" />
          Chapter-by-chapter progress
        </div>

        <div className="mt-4 space-y-5">
          {MODULE_GROUPS.map((group) => {
            const groupChapters = group.chapters
              .map((chapter) => chapterByNumber.get(chapter.chapterNumber))
              .filter((chapter) => Boolean(chapter));
            const completed = groupChapters.filter((chapter) => chapter?.completed).length;
            const percentage =
              groupChapters.length > 0
                ? Math.round((completed / groupChapters.length) * 100)
                : 0;

            return (
              <div key={group.moduleNumber}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#A09182]">
                      Module {group.moduleNumber}
                    </p>
                    <p className="text-[11.5px] font-extrabold text-[#3B2314]">
                      {group.moduleLabel}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#8A7A6C]">
                    {completed}/{groupChapters.length} · {percentage}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0E7DC]">
                  <div
                    className="h-full rounded-full bg-[#B8893A] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-2.5 divide-y divide-[#F3ECE3]">
                  {groupChapters.map((chapter) => {
                    if (!chapter) return null;
                    const meta = getChapterStatusMeta(chapter);
                    return (
                      <div
                        key={chapter.chapterNumber}
                        className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-2.5">
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-extrabold ${
                              chapter.completed
                                ? 'bg-[#EEF6F0] text-[#356B4A]'
                                : chapter.status === 'locked'
                                  ? 'bg-[#F5F2EE] text-[#A09182]'
                                  : 'bg-[#FBF5EA] text-[#8A6427]'
                            }`}
                          >
                            {chapter.completed ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : chapter.status === 'locked' ? (
                              <LockKeyhole className="h-3 w-3" />
                            ) : (
                              chapter.chapterNumber
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[11.5px] font-bold text-[#3B2314]">
                              Chapter {chapter.chapterNumber} — {chapter.title}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#8A7A6C]">
                              {chapter.completed
                                ? `Completed ${formatShortDate(chapter.completedAt)}${chapter.bestScore ? ` · Best ${chapter.bestScore}%` : ''}`
                                : meta.helper}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
                          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                          {chapter.completed && (
                            <Link
                              to={`/induction/chapters/${chapter.chapterNumber}/result`}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8A6427] hover:underline"
                            >
                              Result
                              <ArrowRight className="h-2.5 w-2.5" />
                            </Link>
                          )}
                          {chapter.status === 'reading_completed' && (
                            <Link
                              to={`/induction/chapters/${chapter.chapterNumber}/assessment`}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8A6427] hover:underline"
                            >
                              <ClipboardCheck className="h-2.5 w-2.5" />
                              Assess
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E9DED2] bg-[#FFFCF7] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7A45]" />
          <p className="text-[10.5px] leading-5 text-[#8A7A6C]">
            Need to start again? You can reset the demo progress from the profile menu. Resetting
            clears your saved chapter progress and assessment history.
          </p>
        </div>
        <Link to="/induction/support" className={buttonStyles('secondary', 'sm', 'shrink-0')}>
          Get help
        </Link>
      </div>
    </div>
  );
}
