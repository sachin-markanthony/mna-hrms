import React from 'react';
import { Compass, ShieldCheck, MessageSquareCheck, Target, TrendingUp } from 'lucide-react';
import type { HandbookHighlight } from '../types/induction.types';

interface WorkingPrinciplesProps {
  principles: HandbookHighlight[];
}

export const WorkingPrinciples: React.FC<WorkingPrinciplesProps> = ({ principles }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-4 h-4 text-[#8C6D37]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#8C6D37]" />;
      case 'MessageSquareCheck':
        return <MessageSquareCheck className="w-4 h-4 text-[#8C6D37]" />;
      case 'Target':
        return <Target className="w-4 h-4 text-[#8C6D37]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-[#8C6D37]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#8C6D37]" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5DDD5] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0EAE1]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37]">
              Company Culture
            </span>
            <h3 className="text-base font-bold text-[#2B1810]">
              Our Working Principles
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#8C6D37] border border-[#EFE7DE]">
            MA Values
          </span>
        </div>

        <div className="space-y-3">
          {principles.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#FAF7F2] border border-[#EFE7DE] hover:border-[#D4AF37]/50 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-[#DDD3C9] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                {getIcon(item.iconName)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#8C6D37] font-bold">
                    0{idx + 1}.
                  </span>
                  <h4 className="text-xs font-bold text-[#2B1810] leading-tight">
                    {item.title}
                  </h4>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0EAE1] text-[10px] text-stone-400 text-center font-medium">
        MA Ventures Code of Conduct &bull; Operational Ethics
      </div>
    </div>
  );
};
