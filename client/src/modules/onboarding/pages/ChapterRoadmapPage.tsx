import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock3, Layers, ShieldCheck } from 'lucide-react';
import { useInductionLearning } from '../hooks/useInductionLearning';
import { ChapterRoadmap } from '../components/dashboard/ChapterRoadmap';
import { MODULE_GROUPS } from '../data/chapterCatalog';
import { INDUCTION_CONFIG } from '../config/induction.config';

export function ChapterRoadmapPage() {
  const { summary, learningChapters, finalAssessment } = useInductionLearning();

  const totalMinutes = learningChapters.reduce(
    (total, chapter) => total + chapter.estimatedMinutes,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/induction"
            className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#8A7A6C] transition hover:text-[#3B2314]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to induction overview
          </Link>
          <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#3B2314] sm:text-3xl">
            Learning chapters
          </h1>
          <p className="mt-1 max-w-2xl text-[11.5px] leading-6 text-[#8A7A6C]">
            Your complete induction roadmap. Each chapter is read, assessed and completed in
            sequence, so you always know exactly what to do next.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3 py-2 text-[10px] font-bold text-[#6E5B4C]">
            <BookOpen className="h-3.5 w-3.5 text-[#B8893A]" />
            {learningChapters.length} chapters
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3 py-2 text-[10px] font-bold text-[#6E5B4C]">
            <Layers className="h-3.5 w-3.5 text-[#B8893A]" />
            {MODULE_GROUPS.length} modules
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3 py-2 text-[10px] font-bold text-[#6E5B4C]">
            <Clock3 className="h-3.5 w-3.5 text-[#B8893A]" />
            {Math.round(totalMinutes / 60)} hr guided
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9DED2] bg-white px-3 py-2 text-[10px] font-bold text-[#6E5B4C]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4F7F61]" />
            {INDUCTION_CONFIG.passingPercentage}% pass mark
          </span>
        </div>
      </div>

      <ChapterRoadmap
        learningChapters={learningChapters}
        finalAssessment={finalAssessment}
        summary={summary}
      />
    </div>
  );
}
