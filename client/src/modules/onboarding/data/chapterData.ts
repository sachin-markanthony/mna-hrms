// Static chapter data for the induction handbook
export interface Chapter {
  id: string;
  title: string;
  content: string; // could be markdown or plain text
  quiz?: {
    question: string;
    options: string[];
    correctOption: number; // zero‑based index
  };
}

export const chapters: Chapter[] = [
  {
    id: 'chapter-1',
    title: 'Welcome to MA Ventures',
    content: `
## Welcome

Welcome to MA Ventures! This chapter introduces the company’s vision, values, and culture.\n\nYou will learn about our real‑estate portfolio, the market we operate in, and the standards we uphold.
    `,
    quiz: {
      question: 'What is the core value of MA Ventures?',
      options: [
        'Profit above all',
        'Integrity and professionalism',
        'Rapid expansion only',
        'Technology focus',
      ],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-2',
    title: 'Company Structure & Departments',
    content: `
## Structure

Learn about our department hierarchy, key teams, and how they collaborate to deliver projects.
    `,
    quiz: {
      question: 'Which department handles client negotiations?',
      options: ['Finance', 'Legal', 'Sales', 'Operations'],
      correctOption: 2,
    },
  },
  {
    id: 'chapter-3',
    title: 'Compliance & Ethics',
    content: `
## Compliance

Understand the compliance framework and ethical guidelines you must follow.
    `,
    quiz: {
      question: 'If you notice a conflict of interest, what should you do?',
      options: [
        'Ignore it',
        'Report to your manager',
        'Discuss with peers',
        'Leave the company',
      ],
      correctOption: 1,
    },
  },
  // Add more chapters as needed – keep them static
];
