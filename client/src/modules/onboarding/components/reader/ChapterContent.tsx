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
    wrapper: 'border-[#EFD9B6] bg-[#FFF9EF] text-[#6B4A1D]',
    icon: 'bg-[#C58A3A] text-white',
    label: 'text-[#9A6420]',
    Icon: AlertTriangle,
  },
  info: {
    wrapper: 'border-[#D5E2E7] bg-[#F6FAFB] text-[#3E5F6B]',
    icon: 'bg-[#4F7C8A] text-white',
    label: 'text-[#406B7A]',
    Icon: Info,
  },
  example: {
    wrapper: 'border-[#D6E6DA] bg-[#F7FBF8] text-[#365743]',
    icon: 'bg-[#4F7F61] text-white',
    label: 'text-[#356B4A]',
    Icon: Sparkles,
  },
  tip: {
    wrapper: 'border-[#E7DCCB] bg-[#FCF9F4] text-[#5F4B3C]',
    icon: 'bg-[#B8893A] text-white',
    label: 'text-[#8A6427]',
    Icon: Lightbulb,
  },
};

function renderBlock(block: HandbookBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-[13px] leading-7 text-[#4F4237]">
          {block.text}
        </p>
      );
    case 'subheading':
      return (
        <h4 key={index} className="pt-1 text-[13px] font-extrabold text-[#3B2314]">
          {block.text}
        </h4>
      );
    case 'bullet':
      return (
        <div key={index} className="flex items-start gap-2.5">
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8893A]" />
          <p className="text-[13px] leading-7 text-[#4F4237]">{block.text}</p>
        </div>
      );
    case 'callout': {
      const style = CALLOUTS[block.tone];
      const Icon = style.Icon;
      return (
        <div key={index} className={`rounded-2xl border p-4 ${style.wrapper}`}>
          <div className="flex items-start gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className={`text-[9px] font-extrabold uppercase tracking-[0.14em] ${style.label}`}>
                {block.label}
              </p>
              <p className="mt-1 text-[12px] leading-6">{block.text}</p>
            </div>
          </div>
        </div>
      );
    }
    case 'table':
      return (
        <div key={index} className="overflow-x-auto rounded-2xl border border-[#E9DED2]">
          <table className="w-full min-w-[520px] border-collapse text-left text-[11.5px]">
            {block.headers.length > 0 && (
              <thead className="bg-[#FBF5EA] text-[9px] uppercase tracking-[0.1em] text-[#8A6427]">
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th
                      key={headerIndex}
                      className="border-b border-[#E9DED2] px-3.5 py-2.5 font-extrabold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-[#F2EAE0] text-[#4F4237]">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FFFCF8]'}>
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
    <article className="rounded-3xl border border-[#E9DED2] bg-white shadow-[0_10px_35px_rgba(59,35,20,0.05)]">
      <div className="flex items-center justify-between border-b border-[#F0E7DC] px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FBF5EA] text-[#9A7A45]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11px] font-extrabold text-[#3B2314]">Handbook content</p>
        </div>
        <span className="text-[9.5px] font-semibold text-[#A09182]">
          {sections.length} sections
        </span>
      </div>

      <div className="space-y-8 px-5 py-6 sm:px-7 sm:py-8">
        {sections.map((section, sectionIndex) => (
          <section key={`${section.heading}-${sectionIndex}`} id={`chapter-${chapterNumber}-section-${sectionIndex}`} className="scroll-mt-28">
            <h3 className="mb-3 flex items-start gap-2.5 text-[15px] font-extrabold leading-snug text-[#3B2314]">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#EBDCB9] bg-[#FBF5EA] text-[10px] font-extrabold text-[#8A6427]">
                {sectionIndex + 1}
              </span>
              {section.heading}
            </h3>
            <div className="space-y-2.5">
              {section.blocks.map((block, blockIndex) => renderBlock(block, blockIndex))}
            </div>
          </section>
        ))}

        {takeaways.length > 0 && (
          <div className="rounded-2xl border border-[#E7D9C2] bg-[#FBF5EA] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A6427]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Key takeaways
            </div>
            <ul className="mt-3 space-y-2">
              {takeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2 text-[12px] leading-6 text-[#4F4237]">
                  <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-[#4F7F61]" />
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
