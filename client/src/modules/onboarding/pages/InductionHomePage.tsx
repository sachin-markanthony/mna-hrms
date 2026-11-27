import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ClipboardCheck, LifeBuoy, Sparkles, Unlock } from 'lucide-react';
import { useInductionLearning } from '../hooks/useInductionLearning';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { ProgressOverviewCard } from '../components/dashboard/ProgressOverviewCard';
import { ContinueLearningCard } from '../components/dashboard/ContinueLearningCard';
import { ChapterRoadmap } from '../components/dashboard/ChapterRoadmap';
import { getChapterStatusMeta } from '../utils/chapterStatus';
import { INDUCTION_CONFIG } from '../config/induction.config';

const JOURNEY_STEPS = [
  {
    icon: BookOpen,
    title: 'Read the chapter',
    description: 'Work through the handbook content at your own pace.',
  },
  {
    icon: ClipboardCheck,
    title: 'Pass the assessment',
    description: `Answer the chapter questions and score ${INDUCTION_CONFIG.passingPercentage}% or more.`,
  },
  {
    icon: Unlock,
    title: 'Unlock the next step',
    description: 'A pass opens the next chapter — one clear step at a time.',
  },
];

export function InductionHomePage() {
  const navigate = useNavigate();
  const { employee, summary, learningChapters, finalAssessment } = useInductionLearning();

  const current = summary.currentChapter;
  const currentMeta = current ? getChapterStatusMeta(current) : null;

  const handleContinue = () => {
    if (current && currentMeta?.primaryPath) {
      navigate(currentMeta.primaryPath);
      return;
    }
    if (!finalAssessment.completed && finalAssessment.isUnlocked) {
      navigate('/induction/final-assessment');
      return;
    }
    navigate('/induction/progress');
  };

  return (
    <div className="space-y-6">
      <WelcomeBanner employee={employee} summary={summary} onContinue={handleContinue} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <ProgressOverviewCard summary={summary} />
          <ContinueLearningCard summary={summary} />
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)]">
            <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <Sparkles className="h-3 w-3" />
              How it works
            </div>
            <div className="mt-4 space-y-4">
              {JOURNEY_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F7F0E4] text-[#9A7A45]">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#3B2314]">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-5 text-[#8A7A6C]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E9DED2] bg-[#FFFCF7] p-5">
            <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <CheckCircle2 className="h-3 w-3" />
              At a glance
            </div>
            <dl className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[10.5px] font-semibold text-[#8A7A6C]">Average score</dt>
                <dd className="text-[11px] font-extrabold text-[#3B2314]">
                  {summary.averageScore > 0 ? `${summary.averageScore}%` : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[10.5px] font-semibold text-[#8A7A6C]">Assessment attempts</dt>
                <dd className="text-[11px] font-extrabold text-[#3B2314]">
                  {summary.totalAttempts}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[10.5px] font-semibold text-[#8A7A6C]">Pass mark</dt>
                <dd className="text-[11px] font-extrabold text-[#3B2314]">
                  {INDUCTION_CONFIG.passingPercentage}%
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[10.5px] font-semibold text-[#8A7A6C]">Learning format</dt>
                <dd className="text-[11px] font-extrabold text-[#3B2314]">Self-paced</dd>
              </div>
            </dl>
            <Link
              to="/induction/progress"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#E9DED2] bg-white px-3 py-2 text-[10.5px] font-bold text-[#6E5B4C] transition hover:border-[#C9A46A] hover:text-[#3B2314]"
            >
              View full progress
            </Link>
          </section>

          <section className="rounded-3xl border border-[#E9DED2] bg-white p-5">
            <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <LifeBuoy className="h-3 w-3" />
              Need a hand?
            </div>
            <p className="mt-2 text-[10.5px] leading-5 text-[#8A7A6C]">
              Your HR learning team is here to help if a chapter feels unclear or you need more
              time.
            </p>
            <Link
              to="/induction/support"
              className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#8A6427] underline decoration-[#D9BE92] underline-offset-4 transition hover:text-[#3B2314]"
            >
              Contact learning support
            </Link>
          </section>
        </aside>
      </div>

      <ChapterRoadmap
        learningChapters={learningChapters}
        finalAssessment={finalAssessment}
        summary={summary}
      />
    </div>
  );
}
