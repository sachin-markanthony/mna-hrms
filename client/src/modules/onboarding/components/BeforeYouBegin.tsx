import React from 'react';
import { Clock, BookOpen, Layers, CheckCircle, ShieldCheck, Award } from 'lucide-react';

export const BeforeYouBegin: React.FC = () => {
  const specs = [
    { label: 'Total Induction Duration', value: '3 Hours', icon: Clock, note: 'Self-paced completion' },
    { label: 'Handbook Chapters', value: '22 Chapters', icon: BookOpen, note: 'Comprehensive syllabus' },
    { label: 'Learning Sessions', value: '7 Sessions', icon: Layers, note: 'Modular learning path' },
    { label: 'Final Assessment', value: '20 Questions', icon: Award, note: 'Qualifying score 80%' },
    { label: 'Employee Sign-off', value: 'Acknowledgement', icon: ShieldCheck, note: 'Digital declaration' },
    { label: 'Progress Tracking', value: 'Real-time Sync', icon: CheckCircle, note: 'HRMS audit trail' },
  ];

  return (
    <div className="bg-white rounded-lg border border-[#E5DDD5] p-5 sm:p-6 shadow-xs">
      <div className="mb-4 pb-3 border-b border-[#F0EAE1]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
          Handbook Compliance
        </span>
        <h3 className="text-base font-bold text-[#2B1810]">
          Before You Begin
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Standard operational criteria mandated by the MA Ventures Employee Induction Handbook.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EFE7DE] flex flex-col justify-between"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-[#DDD3C9] flex items-center justify-center text-[#8C6D37] mb-2">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 uppercase font-semibold tracking-wider">
                  {item.label}
                </p>
                <p className="text-xs font-bold text-[#2B1810] mt-0.5">
                  {item.value}
                </p>
                <p className="text-[9px] text-stone-400 mt-1">
                  {item.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
