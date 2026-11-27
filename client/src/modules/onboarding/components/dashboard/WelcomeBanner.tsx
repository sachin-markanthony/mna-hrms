import { ArrowRight, BookOpen, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import type { EmployeeProfile, InductionSummary } from '../../types/learning.types';
import { getMotivationalMessage } from '../../utils/chapterStatus';
import { Button } from '../ui/Button';

interface WelcomeBannerProps {
  employee: EmployeeProfile;
  summary: InductionSummary;
  onContinue: () => void;
}

export function WelcomeBanner({ employee, summary, onContinue }: WelcomeBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#3B2314] text-[#FFFDF9] shadow-[0_18px_50px_rgba(59,35,20,0.18)]">
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#D8B777]/25" />
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border border-[#D8B777]/20" />
      <div className="pointer-events-none absolute right-20 top-10 h-40 w-40 rounded-full border border-[#D8B777]/15" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#B8893A]/15 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(#F3DFC0 1px, transparent 1px), radial-gradient(#F3DFC0 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0, 14px 14px',
        }}
      />

      <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6C687]/25 bg-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#E6C687]">
            <Sparkles className="h-3 w-3" />
            Your MA Ventures induction
          </div>

          <h2 className="mt-4 font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[34px]">
            Welcome to MA Ventures, {employee.firstName}!
          </h2>

          <p className="mt-3 max-w-xl text-[12.5px] leading-6 text-[#EADCCB] sm:text-sm">
            We&apos;re excited to have you on board. Your journey with us starts here. Take your
            time to explore each chapter, understand how we work, and build the knowledge you need
            to succeed.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10.5px] font-semibold text-[#F3E7D7]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#A9D3B6]" />
              {summary.completedChapters} completed
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10.5px] font-semibold text-[#F3E7D7]">
              <BookOpen className="h-3.5 w-3.5 text-[#E6C687]" />
              {summary.remainingChapters} remaining
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10.5px] font-semibold text-[#F3E7D7]">
              <Clock3 className="h-3.5 w-3.5 text-[#E6C687]" />
              Self-paced learning
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="gold"
              size="lg"
              onClick={onContinue}
              className="w-full sm:w-auto"
            >
              {summary.currentChapter ? 'Continue learning' : 'Review your learning'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="max-w-sm text-[10.5px] leading-5 text-[#CBB69C]">
              {getMotivationalMessage(summary.overallPercentage)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-[#E6C687]/25 bg-white/5 sm:h-44 sm:w-44">
            <div className="absolute inset-3 rounded-full border border-[#E6C687]/15" />
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#CBB69C]">
                Overall
              </p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight text-[#FFFDF9]">
                {summary.overallPercentage}%
              </p>
              <p className="mt-1 text-[10px] font-semibold text-[#E6C687]">
                {summary.completedChapters} of {summary.totalLearningChapters} chapters
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

