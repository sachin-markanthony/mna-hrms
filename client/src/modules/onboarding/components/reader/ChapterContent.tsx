import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { RefObject } from 'react';
import type { HandbookBlock, HandbookCalloutTone, HandbookSection } from '../../types/training.types';

const CALLOUTS: Record<
  HandbookCalloutTone,
  { wrapper: string; icon: string; label: string; Icon: LucideIcon }
> = {
  important: {
    wrapper:
      'border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100',
    icon: 'bg-amber-500 text-white',
    label: 'text-amber-700 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  info: {
    wrapper:
      'border-blue-200 bg-blue-50/80 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/25 dark:text-blue-100',
    icon: 'bg-blue-600 text-white',
    label: 'text-blue-700 dark:text-blue-400',
    Icon: Info,
  },
  example: {
    wrapper:
      'border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-100',
    icon: 'bg-emerald-600 text-white',
    label: 'text-emerald-700 dark:text-emerald-400',
    Icon: Sparkles,
  },
  tip: {
    wrapper:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
    icon: 'bg-slate-800 text-white dark:bg-slate-600',
    label: 'text-slate-600 dark:text-slate-300',
    Icon: Lightbulb,
  },
};

function renderBlock(block: HandbookBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          className="text-[13.5px] leading-7 text-slate-600 dark:text-slate-300"
        >
          {block.text}
        </p>
      );
    case 'subheading':
      return (
        <h4
          key={index}
          className="pt-1 text-[13px] font-bold text-slate-900 dark:text-white"
        >
          {block.text}
        </h4>
      );
    case 'bullet':
      return (
        <div key={index} className="flex items-start gap-2.5">
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          <p className="text-[13.5px] leading-7 text-slate-600 dark:text-slate-300">
            {block.text}
          </p>
        </div>
      );
    case 'callout': {
      const style = CALLOUTS[block.tone];
      const Icon = style.Icon;
      return (
        <div key={index} className={`rounded-xl border p-4 ${style.wrapper}`}>
          <div className="flex items-start gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className={`text-[9px] font-bold uppercase tracking-[0.14em] ${style.label}`}>
                {block.label}
              </p>
              <p className="mt-1 text-[12.5px] leading-6">{block.text}</p>
            </div>
          </div>
        </div>
      );
    }
    case 'table':
      return (
        <div
          key={index}
          className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <table className="w-full min-w-[520px] border-collapse text-left text-[11.5px]">
            {block.headers.length > 0 && (
              <thead className="bg-slate-50 text-[9px] uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th
                      key={headerIndex}
                      className="border-b border-slate-200 px-3.5 py-2.5 font-bold dark:border-slate-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100 text-slate-600 dark:divide-slate-800 dark:text-slate-300">
              {block.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex % 2 === 0
                      ? 'bg-white dark:bg-transparent'
                      : 'bg-slate-50/60 dark:bg-slate-800/30'
                  }
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3.5 py-2.5 leading-6">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

interface ChapterContentProps {
  chapterNumber: number;
  sections: HandbookSection[];
  takeaways: string[];
  endRef: RefObject<HTMLDivElement | null>;
}

export function ChapterContent({
  chapterNumber,
  sections,
  takeaways,
  endRef,
}: ChapterContentProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0f172a] sm:p-8">
      <div className="space-y-9">
        {sections.map((section, sectionIndex) => (
          <section
            key={`${section.heading}-${sectionIndex}`}
            id={`chapter-${chapterNumber}-section-${sectionIndex}`}
            className="scroll-mt-24"
          >
            <h3 className="mb-3 flex items-start gap-2.5 text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[10px] font-extrabold text-[#1e3a8a] dark:bg-blue-950/60 dark:text-blue-300">
                {sectionIndex + 1}
              </span>
              {section.heading}
            </h3>
            <div className="space-y-3">
              {section.blocks.map((block, blockIndex) => renderBlock(block, blockIndex))}
            </div>
          </section>
        ))}

        {takeaways.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/20 sm:p-5">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Key takeaways
            </div>
            <ul className="mt-3 space-y-2">
              {takeaways.map((takeaway, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-[12.5px] leading-6 text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div ref={endRef} className="h-2" aria-hidden="true" />
      </div>
    </article>
  );
}
