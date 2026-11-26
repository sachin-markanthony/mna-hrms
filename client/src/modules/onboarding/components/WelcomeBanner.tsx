import React from 'react';
import { Sparkles, Calendar, Briefcase, Award, ArrowRight, BookOpen } from 'lucide-react';
import type { Employee, InductionProgress } from '../types/induction.types';

interface WelcomeBannerProps {
  employee: Employee | null;
  progress: InductionProgress | null;
  onContinue: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  employee,
  progress,
  onContinue,
}) => {
  const firstName = employee?.fullName ? employee.fullName.split(' ')[0] : 'Colleague';

  return (
    <div className="induction-hero-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-9">
      <div
        className="induction-hero-pattern absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--kindle-orange) 1px, transparent 1px), radial-gradient(var(--kindle-orange) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      <div className="induction-hero-glow absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3.5 max-w-2xl">
          <div className="induction-hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="induction-hero-accent w-3.5 h-3.5" />
            <span>MA Ventures Employee Induction Journey</span>
          </div>

          <h2 className="induction-hero-title text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Welcome to MA Ventures, {firstName}
          </h2>

          <p className="induction-hero-muted text-xs sm:text-sm leading-relaxed font-sans">
            Your journey starts here. Discover our organisation, understand the real estate industry,
            learn our professional standards and get ready to contribute.
          </p>

          {/* Employee Meta Tags */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1.5 text-[11px]">
            <div className="induction-hero-chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
              <Briefcase className="induction-hero-accent w-3.5 h-3.5" />
              <span className="induction-hero-title font-medium">{employee?.designation || 'Senior Investment Advisor'}</span>
            </div>

            <div className="induction-hero-chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
              <Calendar className="induction-hero-accent w-3.5 h-3.5" />
              <span>Joined {employee?.joiningDate || '10 Feb 2026'}</span>
            </div>

            <div className="induction-hero-chip flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
              <Award className="text-[#1A98FF] w-3.5 h-3.5" />
              <span>Status: <strong className="text-emerald-300">{progress?.status || 'In Progress'}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Button & Architectural Emblem */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={onContinue}
            className="induction-primary-button w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase transition hover:scale-[1.02] cursor-pointer"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="induction-hero-muted flex items-center gap-2 text-[11px] font-medium">
            <BookOpen className="induction-hero-accent w-3.5 h-3.5" />
            <span>Next: Session 3 &bull; Brokerage Journey</span>
          </div>
        </div>
      </div>
    </div>
  );
};
