import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, LockKeyhole, Map as MapIcon, Sparkles } from 'lucide-react';
import type { ChapterView, InductionSummary } from '../../types/learning.types';
import { MODULE_GROUPS } from '../../data/chapterCatalog';
import { ChapterCard } from './ChapterCard';

interface ChapterRoadmapProps {
  learningChapters: ChapterView[];
  finalAssessment: ChapterView;
  summary: InductionSummary;
}

export function ChapterRoadmap({
  learningChapters,
  finalAssessment,
  summary,
}: ChapterRoadmapProps) {
  const chapterByNumber = new Map(
    learningChapters.map((chapter) => [chapter.chapterNumber, chapter]),
  );

  return (
    <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-4 border-b border-[#F0E7DC] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
            <MapIcon className="h-3 w-3" />
            Learning chapters
          </div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#3B2314] sm:text-xl">
            Your guided learning roadmap
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#8A7A6C]">
            Read one chapter, pass its assessment, and the next chapter unlocks automatically.
            Completed chapters stay open for revision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE3D6] bg-[#EEF6F0] px-2.5 py-1 text-[9.5px] font-bold text-[#356B4A]">
            <CheckCircle2 className="h-3 w-3" />
            {summary.completedChapters} completed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E0D8] bg-[#F7F4F0] px-2.5 py-1 text-[9.5px] font-bold text-[#8A7F74]">
            <LockKeyhole className="h-3 w-3" />
            {summary.lockedChapters} locked
          </span>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#F0E7DC]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#B8893A] to-[#D8B777] transition-all duration-700"
          style={{ width: `${summary.overallPercentage}%` }}
        />
      </div>
      <p className="mt-1.5 text-[9.5px] font-semibold text-[#A09182]">
        {summary.overallPercentage}% of the 18 learning chapters completed
      </p>

      <div className="relative mt-6">
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-2 bottom-4 w-px bg-[#E7DCCF] sm:left-[21px]"
        />

        {MODULE_GROUPS.map((group) => {
          const groupChapters = group.chapters
            .map((chapter) => chapterByNumber.get(chapter.chapterNumber))
            .filter((chapter): chapter is ChapterView => Boolean(chapter));

          if (groupChapters.length === 0) return null;

          return (
            <div key={group.moduleNumber}>
              <div className="relative pb-3 pl-11 pt-2 sm:pl-14">
                <span className="absolute left-[12px] top-4 z-10 h-2.5 w-2.5 rounded-full border-2 border-[#B8893A] bg-[#FFFCF7] sm:left-[16px]" />
                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#A09182]">
                  Module {group.moduleNumber}
                </p>
                <h3 className="text-[12.5px] font-extrabold text-[#5F4B3C]">
                  {group.moduleLabel}
                </h3>
              </div>

              {groupChapters.map((chapter) => (
                <ChapterCard key={chapter.chapterNumber} chapter={chapter} showConnector={false} />
              ))}
            </div>
          );
        })}

        <div className="relative pb-2 pl-11 pt-2 sm:pl-14">
          <span className="absolute left-[11px] top-3 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#B8893A] bg-[#FFFCF7] sm:left-[15px]">
            <Sparkles className="h-2 w-2 text-[#B8893A]" />
          </span>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#A09182]">
            Module 9
          </p>
          <h3 className="text-[12.5px] font-extrabold text-[#5F4B3C]">Final Assessment</h3>
        </div>
        <ChapterCard chapter={finalAssessment} showConnector={false} />
      </div>

      <div className="mt-4 rounded-2xl border border-[#EDE2D6] bg-[#FFFCF7] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F0E4] text-[#9A7A45]">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#A09182]">
              Reference library
            </p>
            <p className="mt-0.5 text-[12px] font-bold text-[#3B2314]">
              Chapter 20 — {summary.referenceChapter.title}
            </p>
            <p className="mt-0.5 text-[10.5px] leading-5 text-[#8A7A6C]">
              Regulatory links, industry references and important disclaimers. This resource does
              not affect your induction completion.
            </p>
          </div>
        </div>
        <Link
          to="/induction/reference"
          className="mt-3 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3.5 py-2 text-[10.5px] font-bold text-[#6E5B4C] transition hover:border-[#C9A46A] hover:text-[#3B2314] sm:mt-0"
        >
          Open reference
          <ArrowRight className="h-3.5 w-3.5 text-[#B8893A]" />
        </Link>
      </div>
    </section>
  );
}
