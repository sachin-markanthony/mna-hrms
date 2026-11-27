import type { ChapterCatalogEntry } from '../types/learning.types';

/**
 * Employee-facing chapter catalogue.
 * Chapters 19 (Trainer's Session Checklist) and 22 (Trainer's Answer Key) are
 * intentionally absent. Chapter 20 is a reference resource and Chapter 21 is
 * the final assessment, so neither is counted as an ordinary learning chapter.
 */
export const CHAPTER_CATALOG: ChapterCatalogEntry[] = [
  {
    chapterNumber: 1,
    id: 'chap-1',
    title: 'Welcome to MA Ventures',
    description:
      'Meet the organisation, understand why your role matters, and learn how this handbook will guide your first weeks.',
    estimatedMinutes: 12,
    kind: 'learning',
    moduleNumber: 1,
    moduleLabel: 'Welcome & Purpose',
  },
  {
    chapterNumber: 2,
    id: 'chap-2',
    title: 'Purpose and Objectives of Employee Induction',
    description:
      'Understand the purpose of induction, what you should achieve, and how a strong start supports your success.',
    estimatedMinutes: 15,
    kind: 'learning',
    moduleNumber: 1,
    moduleLabel: 'Welcome & Purpose',
  },
  {
    chapterNumber: 3,
    id: 'chap-3',
    title: 'Understanding the Real Estate Industry',
    description:
      'Build a practical understanding of the real estate industry, its participants, and the forces that shape it.',
    estimatedMinutes: 20,
    kind: 'learning',
    moduleNumber: 2,
    moduleLabel: 'Real Estate Fundamentals',
  },
  {
    chapterNumber: 4,
    id: 'chap-4',
    title: 'Types of Real Estate and Property Transactions',
    description:
      'Explore residential, commercial and other property types, plus the primary, secondary and rental transaction markets.',
    estimatedMinutes: 18,
    kind: 'learning',
    moduleNumber: 2,
    moduleLabel: 'Real Estate Fundamentals',
  },
  {
    chapterNumber: 5,
    id: 'chap-5',
    title: 'Essential Real Estate Terminology',
    description:
      'Learn the language of property: carpet area, built-up area, FSI, RERA, encumbrance, yield and more.',
    estimatedMinutes: 22,
    kind: 'learning',
    moduleNumber: 2,
    moduleLabel: 'Real Estate Fundamentals',
  },
  {
    chapterNumber: 6,
    id: 'chap-6',
    title: 'Property Pricing and Cost Structure',
    description:
      'Understand base selling price, PLC, floor rise, statutory charges, GST and the complete cost of a property.',
    estimatedMinutes: 25,
    kind: 'learning',
    moduleNumber: 2,
    moduleLabel: 'Real Estate Fundamentals',
  },
  {
    chapterNumber: 7,
    id: 'chap-7',
    title: 'Property Documents and Approvals',
    description:
      'Recognise title documents, approvals, occupancy certificates, RERA registration and the checks that protect a transaction.',
    estimatedMinutes: 24,
    kind: 'learning',
    moduleNumber: 2,
    moduleLabel: 'Real Estate Fundamentals',
  },
  {
    chapterNumber: 8,
    id: 'chap-8',
    title: 'Understanding the Brokerage Business',
    description:
      'See how a professional brokerage creates value for buyers, sellers, developers, landlords and tenants.',
    estimatedMinutes: 20,
    kind: 'learning',
    moduleNumber: 3,
    moduleLabel: 'Brokerage & Customer Journey',
  },
  {
    chapterNumber: 9,
    id: 'chap-9',
    title: 'The Complete Customer and Property Transaction Journey',
    description:
      'Follow the customer journey from first enquiry and site visit through booking, documentation, loan and handover.',
    estimatedMinutes: 25,
    kind: 'learning',
    moduleNumber: 3,
    moduleLabel: 'Brokerage & Customer Journey',
  },
  {
    chapterNumber: 10,
    id: 'chap-10',
    title: 'Brokerage Revenue and Commission',
    description:
      'Learn how brokerage revenue and commission work, including milestones, invoicing and professional transparency.',
    estimatedMinutes: 18,
    kind: 'learning',
    moduleNumber: 3,
    moduleLabel: 'Brokerage & Customer Journey',
  },
  {
    chapterNumber: 11,
    id: 'chap-11',
    title: 'Customer Service and Professional Communication',
    description:
      'Build trust through clear communication, active listening, timely follow-up and thoughtful service recovery.',
    estimatedMinutes: 20,
    kind: 'learning',
    moduleNumber: 4,
    moduleLabel: 'Customer Experience & Conduct',
  },
  {
    chapterNumber: 12,
    id: 'chap-12',
    title: 'Ethics, Integrity and Workplace Conduct',
    description:
      'Understand the ethical standards, confidentiality and professional conduct expected of every MA Ventures employee.',
    estimatedMinutes: 22,
    kind: 'learning',
    moduleNumber: 4,
    moduleLabel: 'Customer Experience & Conduct',
  },
  {
    chapterNumber: 13,
    id: 'chap-13',
    title: 'Employee Responsibilities and HR Essentials',
    description:
      'Review attendance, leave, workplace responsibilities and the HR policies that support your employment.',
    estimatedMinutes: 18,
    kind: 'learning',
    moduleNumber: 5,
    moduleLabel: 'HR & Compliance',
  },
  {
    chapterNumber: 14,
    id: 'chap-14',
    title: 'Information Security, Data Privacy and Compliance',
    description:
      'Protect client information, use systems responsibly and understand the compliance obligations that apply to your work.',
    estimatedMinutes: 20,
    kind: 'learning',
    moduleNumber: 5,
    moduleLabel: 'HR & Compliance',
  },
  {
    chapterNumber: 15,
    id: 'chap-15',
    title: 'Team Coordination, Reporting and Performance',
    description:
      'Work effectively across teams, keep reporting accurate, and understand how performance is measured and supported.',
    estimatedMinutes: 22,
    kind: 'learning',
    moduleNumber: 6,
    moduleLabel: 'Team Performance',
  },
  {
    chapterNumber: 16,
    id: 'chap-16',
    title: 'Practical Activities and Case Studies',
    description:
      'Apply what you have learned to realistic property scenarios, customer conversations and calculations.',
    estimatedMinutes: 25,
    kind: 'learning',
    moduleNumber: 7,
    moduleLabel: 'Practical Learning & Commitment',
  },
  {
    chapterNumber: 17,
    id: 'chap-17',
    title: 'Knowledge Assessment and Quiz',
    description:
      'Check your understanding of the handbook with the knowledge assessment provided in the induction programme.',
    estimatedMinutes: 25,
    kind: 'learning',
    moduleNumber: 7,
    moduleLabel: 'Practical Learning & Commitment',
  },
  {
    chapterNumber: 18,
    id: 'chap-18',
    title: 'Employee Commitment and Acknowledgement',
    description:
      'Reflect on the standards you will uphold and record your commitment to the MA Ventures way of working.',
    estimatedMinutes: 10,
    kind: 'learning',
    moduleNumber: 7,
    moduleLabel: 'Practical Learning & Commitment',
  },
  {
    chapterNumber: 20,
    id: 'chap-20',
    title: 'Reference Notes and Important Disclaimers',
    description:
      'A reference resource covering regulatory links, industry references and important disclaimers.',
    estimatedMinutes: 10,
    kind: 'reference',
    moduleNumber: 8,
    moduleLabel: 'Reference Library',
  },
  {
    chapterNumber: 21,
    id: 'chap-21',
    title: 'The Grand Final Quiz',
    description:
      'A comprehensive 20-question final assessment covering the full MA Ventures induction programme.',
    estimatedMinutes: 30,
    kind: 'final_assessment',
    moduleNumber: 9,
    moduleLabel: 'Final Assessment',
  },
];

export const LEARNING_CHAPTERS = CHAPTER_CATALOG.filter(
  (chapter) => chapter.kind === 'learning',
).sort((first, second) => first.chapterNumber - second.chapterNumber);

export const FINAL_ASSESSMENT_CHAPTER = CHAPTER_CATALOG.find(
  (chapter) => chapter.kind === 'final_assessment',
)!;

export const REFERENCE_CHAPTER = CHAPTER_CATALOG.find(
  (chapter) => chapter.kind === 'reference',
)!;

const CATALOG_BY_NUMBER = new Map(
  CHAPTER_CATALOG.map((chapter) => [chapter.chapterNumber, chapter]),
);

export function getChapterEntry(chapterNumber: number): ChapterCatalogEntry | null {
  return CATALOG_BY_NUMBER.get(chapterNumber) ?? null;
}

export function getNextLearningChapter(chapterNumber: number): ChapterCatalogEntry | null {
  const index = LEARNING_CHAPTERS.findIndex(
    (chapter) => chapter.chapterNumber === chapterNumber,
  );
  if (index < 0 || index === LEARNING_CHAPTERS.length - 1) return null;
  return LEARNING_CHAPTERS[index + 1];
}

export function getPreviousLearningChapter(
  chapterNumber: number,
): ChapterCatalogEntry | null {
  const index = LEARNING_CHAPTERS.findIndex(
    (chapter) => chapter.chapterNumber === chapterNumber,
  );
  if (index <= 0) return null;
  return LEARNING_CHAPTERS[index - 1];
}

export const MODULE_GROUPS = LEARNING_CHAPTERS.reduce<
  Array<{
    moduleNumber: number;
    moduleLabel: string;
    chapters: ChapterCatalogEntry[];
  }>
>((groups, chapter) => {
  const existing = groups.find((group) => group.moduleNumber === chapter.moduleNumber);
  if (existing) {
    existing.chapters.push(chapter);
    return groups;
  }
  groups.push({
    moduleNumber: chapter.moduleNumber,
    moduleLabel: chapter.moduleLabel,
    chapters: [chapter],
  });
  return groups;
}, []);
