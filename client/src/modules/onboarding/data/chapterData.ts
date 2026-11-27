// Static chapter data for the induction handbook
export interface Chapter {
  id: string;
  title: string;
  content: string; // markdown
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
    content: `## Welcome\n\nWelcome to MA Ventures! This chapter introduces the company’s vision, values, and culture.`,
    quiz: {
      question: 'What is the core value of MA Ventures?',
      options: ['Profit above all', 'Integrity and professionalism', 'Rapid expansion only', 'Technology focus'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-2',
    title: 'Purpose and Objectives of Employee Induction',
    content: `## Purpose\n\nUnderstand why we have an induction program and what you should achieve during it.`,
    quiz: {
      question: 'What is the main purpose of the induction program?',
      options: ['Sell products', 'Familiarize new hires with the company', 'Reduce salaries', 'Increase vacation days'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-3',
    title: 'Understanding the Real Estate Industry',
    content: `## Industry Overview\n\nAn overview of the real‑estate market, key trends and our positioning.`,
    quiz: {
      question: 'Which sector does MA Ventures primarily operate in?',
      options: ['Technology', 'Healthcare', 'Real Estate', 'Retail'],
      correctOption: 2,
    },
  },
  {
    id: 'chapter-4',
    title: 'Types of Real Estate and Property Transactions',
    content: `## Types\n\nResidential, commercial, industrial, and mixed‑use properties explained.`,
    quiz: {
      question: 'Which type of transaction involves leasing a space for business?',
      options: ['Sale', 'Lease', 'Mortgage', 'Joint venture'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-5',
    title: 'Essential Real Estate Terminology',
    content: `## Terminology\n\nKey terms such as ROI, CAP rate, escrow, and more.`,
    quiz: {
      question: 'What does CAP rate stand for?',
      options: ['Capitalization rate', 'Capture rate', 'Capacity rate', 'Capable rate'],
      correctOption: 0,
    },
  },
  {
    id: 'chapter-6',
    title: 'Property Pricing and Cost Structure',
    content: `## Pricing\n\nHow property values are determined and the cost elements involved.`,
    quiz: {
      question: 'Which factor most directly affects property price?',
      options: ['Weather', 'Location', 'Color of walls', 'Number of windows'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-7',
    title: 'Property Documents and Approvals',
    content: `## Documents\n\nImportant legal documents and the approval workflow.`,
    quiz: {
      question: 'Which document confirms ownership?',
      options: ['Lease agreement', 'Title deed', 'Invoice', 'Blueprint'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-8',
    title: 'Understanding the Brokerage Business',
    content: `## Brokerage\n\nRoles of brokers, revenue models and client relationships.`,
    quiz: {
      question: 'What is a broker’s primary role?',
      options: ['Manufacture houses', 'Facilitate transactions', 'Provide insurance', 'Conduct inspections'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-9',
    title: 'The Complete Customer and Property Transaction Journey',
    content: `## Journey\n\nStep‑by‑step from prospecting to closing a deal.`,
    quiz: {
      question: 'Which stage comes after property viewing?',
      options: ['Offer', 'Negotiation', 'Closing', 'Inspection'],
      correctOption: 0,
    },
  },
  {
    id: 'chapter-10',
    title: 'Brokerage Revenue and Commission',
    content: `## Revenue\n\nHow brokers earn commissions and revenue sharing structures.`,
    quiz: {
      question: 'Commission is typically expressed as a percentage of what?',
      options: ['Purchase price', 'Square footage', 'Number of rooms', 'Construction cost'],
      correctOption: 0,
    },
  },
  {
    id: 'chapter-11',
    title: 'Customer Service and Professional Communication',
    content: `## Service\n\nBest practices for communicating with clients and handling issues.`,
    quiz: {
      question: 'Which communication style fosters trust?',
      options: ['Aggressive', 'Passive', 'Assertive', 'Indifferent'],
      correctOption: 2,
    },
  },
  {
    id: 'chapter-12',
    title: 'Ethics, Integrity and Workplace Conduct',
    content: `## Ethics\n\nOur code of conduct and expectations for professional behavior.`,
    quiz: {
      question: 'If you notice unethical behavior, you should?',
      options: ['Ignore', 'Report to manager', 'Confront publicly', 'Leave the company'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-13',
    title: 'Employee Responsibilities and HR Essentials',
    content: `## Responsibilities\n\nKey HR policies, attendance, and performance expectations.`,
    quiz: {
      question: 'Which document outlines your employment terms?',
      options: ['Handbook', 'Invoice', 'Blueprint', 'Tax form'],
      correctOption: 0,
    },
  },
  {
    id: 'chapter-14',
    title: 'Information Security, Data Privacy and Compliance',
    content: `## Security\n\nGuidelines for handling data, security protocols and compliance requirements.`,
    quiz: {
      question: 'What is the best practice for passwords?',
      options: ['Reuse', 'Share with colleagues', 'Use a password manager', 'Write on sticky notes'],
      correctOption: 2,
    },
  },
  {
    id: 'chapter-15',
    title: 'Team Coordination, Reporting and Performance',
    content: `## Coordination\n\nTools and processes for effective teamwork and reporting.`,
    quiz: {
      question: 'Which tool is recommended for daily stand‑ups?',
      options: ['Email chain', 'Slack', 'Physical board', 'Phone calls'],
      correctOption: 1,
    },
  },
  {
    id: 'chapter-16',
    title: 'Practical Activities and Case Studies',
    content: `## Activities\n\nHands‑on exercises to apply learned concepts.`,
    // No quiz for activity chapters (optional)
  },
  {
    id: 'chapter-17',
    title: 'Knowledge Assessment and Quiz',
    content: `## Assessment\n\nA comprehensive quiz covering all previous chapters.`,
    quiz: {
      question: 'How many chapters are in the induction program?',
      options: ['15', '16', '18', '20'],
      correctOption: 2,
    },
  },
  {
    id: 'chapter-18',
    title: 'Employee Commitment and Acknowledgement',
    content: `## Commitment\n\nSign the acknowledgment confirming completion of induction.`,
    // final chapter, no quiz needed
  },
];
