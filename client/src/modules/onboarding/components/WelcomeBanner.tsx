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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A170F] via-[#21120B] to-[#140A06] text-[#FAF7F2] p-6 sm:p-8 lg:p-9 border border-[#4A2E1F]/50 shadow-md">
      {/* Subtle luxury geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-8 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#D4AF37 1px, #140A06 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Decorative Gold Glow accent in top right */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B2317]/80 border border-[#D4AF37]/35 text-[#E6C687] text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>MA Ventures Employee Induction Journey</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Welcome to MA Ventures, {firstName}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            Your journey starts here. Discover our organisation, understand the real estate industry,
            learn our professional standards and get ready to contribute.
          </p>

          {/* Employee Meta Tags */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1.5 text-[11px] text-stone-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E1911] border border-[#4A2E1F]">
              <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-medium text-white">{employee?.designation || 'Senior Investment Advisor'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E1911] border border-[#4A2E1F]">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Joined {employee?.joiningDate || '10 Feb 2026'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E1911] border border-[#4A2E1F]">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Status: <strong className="text-emerald-300">{progress?.status || 'In Progress'}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Button & Architectural Emblem */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={onContinue}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E2C573] to-[#B8860B] hover:from-[#DFBD4F] hover:to-[#A37400] text-[#1A120B] font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] cursor-pointer"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Next: Session 3 &bull; Brokerage Journey</span>
          </div>
        </div>
      </div>
    </div>
  );
};
