import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SESSIONS_DATA = [
  {
    sessionNumber: 1,
    title: 'Welcome to MA Ventures',
    subtitle: 'Welcome & Purpose',
    description: 'Welcome and purpose of employee induction.',
    chapterStart: 1,
    chapterEnd: 2,
    estimatedDuration: '27 mins',
    orderIndex: 1,
  },
  {
    sessionNumber: 2,
    title: 'Understanding Real Estate',
    subtitle: 'Real Estate Fundamentals',
    description: 'Industry fundamentals, property types, terminology, pricing, documents and approvals.',
    chapterStart: 3,
    chapterEnd: 7,
    estimatedDuration: '1 hr 49 mins',
    orderIndex: 2,
  },
  {
    sessionNumber: 3,
    title: 'Brokerage and Customer Journey',
    subtitle: 'Brokerage Business',
    description: 'Brokerage business, customer transaction journey, revenue and commission.',
    chapterStart: 8,
    chapterEnd: 10,
    estimatedDuration: '1 hr 3 mins',
    orderIndex: 3,
  },
  {
    sessionNumber: 4,
    title: 'Customer Service and Workplace Conduct',
    subtitle: 'Customer Experience',
    description: 'Professional communication, ethics, integrity and workplace conduct.',
    chapterStart: 11,
    chapterEnd: 12,
    estimatedDuration: '42 mins',
    orderIndex: 4,
  },
  {
    sessionNumber: 5,
    title: 'Employee Responsibilities and Compliance',
    subtitle: 'Compliance & HR',
    description: 'HR essentials, employee responsibilities, information security, data privacy and compliance.',
    chapterStart: 13,
    chapterEnd: 14,
    estimatedDuration: '38 mins',
    orderIndex: 5,
  },
  {
    sessionNumber: 6,
    title: 'Team Coordination and Performance',
    subtitle: 'Team Performance',
    description: 'Team coordination, reporting and performance.',
    chapterStart: 15,
    chapterEnd: 15,
    estimatedDuration: '22 mins',
    orderIndex: 6,
  },
  {
    sessionNumber: 7,
    title: 'Practical Learning and Assessment',
    subtitle: 'Practical & Assessment',
    description: 'Practical activities, case studies, knowledge assessment and employee acknowledgement.',
    chapterStart: 16,
    chapterEnd: 18,
    estimatedDuration: '1 hr',
    orderIndex: 7,
  },
];

const CHAPTERS_DATA = [
  // Session 1
  {
    chapterNumber: 1,
    sessionNumber: 1,
    title: 'Welcome to MA Ventures',
    description: 'Welcome orientation, mission, vision, core values, leadership and real estate ecosystem of MA Ventures.',
    estimatedDuration: '12 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 1,
  },
  {
    chapterNumber: 2,
    sessionNumber: 1,
    title: 'Purpose and Objectives of Employee Induction',
    description: 'Understanding why structured induction matters, professional onboarding milestones, and success metrics.',
    estimatedDuration: '15 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 2,
  },
  // Session 2
  {
    chapterNumber: 3,
    sessionNumber: 2,
    title: 'Understanding the Real Estate Industry',
    description: 'Overview of macro-market drivers, primary vs secondary markets, regional trends, and developer dynamics.',
    estimatedDuration: '20 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 3,
  },
  {
    chapterNumber: 4,
    sessionNumber: 2,
    title: 'Types of Real Estate and Property Transactions',
    description: 'Residential, commercial, retail, warehousing, plots, leaseholds, freeholds, and transaction types.',
    estimatedDuration: '18 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 4,
  },
  {
    chapterNumber: 5,
    sessionNumber: 2,
    title: 'Essential Real Estate Terminology',
    description: 'Carpet area, built-up area, super built-up, FSI/FAR, RERA registration, NOC, conveyance, encumbrance.',
    estimatedDuration: '22 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 5,
  },
  {
    chapterNumber: 6,
    sessionNumber: 2,
    title: 'Property Pricing and Cost Structure',
    description: 'Base selling price (BSP), PLC, floor rise, parking, clubhouse, stamp duty, registration, and GST.',
    estimatedDuration: '25 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 6,
  },
  {
    chapterNumber: 7,
    sessionNumber: 2,
    title: 'Property Documents and Approvals',
    description: 'Title deeds, mother deeds, sanctioned plans, occupancy certificates (OC), completion certificates (CC), RERA.',
    estimatedDuration: '24 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 7,
  },
  // Session 3
  {
    chapterNumber: 8,
    sessionNumber: 3,
    title: 'Understanding the Brokerage Business',
    description: 'Value proposition of advisory-driven brokerage, mandated projects, channel partner ecosystem, and ethics.',
    estimatedDuration: '20 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 8,
  },
  {
    chapterNumber: 9,
    sessionNumber: 3,
    title: 'The Complete Customer and Property Transaction Journey',
    description: 'Lead generation, qualification, site visits, booking token, builder agreement, home loan disbursement to handover.',
    estimatedDuration: '25 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 9,
  },
  {
    chapterNumber: 10,
    sessionNumber: 3,
    title: 'Brokerage Revenue and Commission',
    description: 'Commission calculation models, milestone invoice raising, GST billing, payouts, and compliance reconciliations.',
    estimatedDuration: '18 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 10,
  },
  // Session 4
  {
    chapterNumber: 11,
    sessionNumber: 4,
    title: 'Customer Service and Professional Communication',
    description: 'Client verbal etiquette, written correspondence standards, handling objections, and trust building.',
    estimatedDuration: '20 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 11,
  },
  {
    chapterNumber: 12,
    sessionNumber: 4,
    title: 'Ethics, Integrity and Workplace Conduct',
    description: 'Non-disclosure, conflict of interest, anti-bribery, professional decorum, and zero tolerance policies.',
    estimatedDuration: '22 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 12,
  },
  // Session 5
  {
    chapterNumber: 13,
    sessionNumber: 5,
    title: 'Employee Responsibilities and HR Essentials',
    description: 'Attendance policies, shift grace periods, leave workflows, expense claims, and performance reviews.',
    estimatedDuration: '18 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 13,
  },
  {
    chapterNumber: 14,
    sessionNumber: 5,
    title: 'Information Security, Data Privacy and Compliance',
    description: 'Client PII protection, secure CRM usage, password hygiene, device security, and compliance protocols.',
    estimatedDuration: '20 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 14,
  },
  // Session 6
  {
    chapterNumber: 15,
    sessionNumber: 6,
    title: 'Team Coordination, Reporting and Performance',
    description: 'Inter-departmental alignment, CRM pipeline hygiene, daily activity logs, KRAs, and growth pathways.',
    estimatedDuration: '22 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 15,
  },
  // Session 7
  {
    chapterNumber: 16,
    sessionNumber: 7,
    title: 'Practical Activities and Case Studies',
    description: 'Hands-on client simulation scenarios, real estate objection management, and mock site-visit drills.',
    estimatedDuration: '25 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 16,
  },
  {
    chapterNumber: 17,
    sessionNumber: 7,
    title: 'Knowledge Assessment and Quiz',
    description: 'Interactive mid-module milestone quiz verifying key terminology, pricing math, and compliance knowledge.',
    estimatedDuration: '25 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 17,
  },
  {
    chapterNumber: 18,
    sessionNumber: 7,
    title: 'Employee Commitment and Acknowledgement',
    description: 'Formal digital sign-off, adherence declaration to MA Ventures standards, and induction certificate unlocking.',
    estimatedDuration: '10 mins',
    isAssessment: false,
    isResource: false,
    orderIndex: 18,
  },
  // Reference / HR / Assessment Chapters
  {
    chapterNumber: 19,
    sessionNumber: 7,
    title: "Trainer's Session Checklist",
    description: 'HR Trainer verification guidelines and induction session execution checklist (Trainer reference).',
    estimatedDuration: '15 mins',
    isAssessment: false,
    isResource: true,
    orderIndex: 19,
  },
  {
    chapterNumber: 20,
    sessionNumber: 7,
    title: 'Reference Notes and Important Disclaimers',
    description: 'Legal disclaimers, industry regulatory body contacts, and reference bibliographies.',
    estimatedDuration: '10 mins',
    isAssessment: false,
    isResource: true,
    orderIndex: 20,
  },
  {
    chapterNumber: 21,
    sessionNumber: 7,
    title: 'The Grand Final Quiz',
    description: 'Comprehensive 20-question final assessment evaluating full understanding of MA Ventures induction topics.',
    estimatedDuration: '30 mins',
    isAssessment: true,
    isResource: false,
    orderIndex: 21,
  },
  {
    chapterNumber: 22,
    sessionNumber: 7,
    title: "Trainer's Answer Key",
    description: 'Confidential examination rubric and answer key strictly reserved for HR administrators.',
    estimatedDuration: '10 mins',
    isAssessment: false,
    isResource: true,
    orderIndex: 22,
  },
];

const NOTIFICATIONS_DATA = [
  {
    title: 'Induction In Progress',
    message: 'You have completed 7 of 22 chapters. Next chapter: Understanding the Brokerage Business.',
    type: 'info',
    actionLabel: 'Resume Session 3',
    actionRoute: '#session-3',
  },
  {
    title: 'Pending HR Milestone',
    message: 'Complete Sessions 1 through 7 to unlock your formal Grand Final Quiz.',
    type: 'warning',
  },
  {
    title: 'Digital Commitment Notice',
    message: 'Employee acknowledgement sign-off required following Chapter 18 completion.',
    type: 'action',
  },
  {
    title: 'Orientation Milestone Achieved',
    message: 'Congratulations on finishing Session 2: Understanding Real Estate fundamentals.',
    type: 'success',
  },
];

async function seed() {
  console.log('Seeding MA Ventures Induction Handbook data into Neon DB...');

  // Upsert Sessions
  const sessionMap = new Map<number, string>();
  for (const s of SESSIONS_DATA) {
    const session = await prisma.inductionSession.upsert({
      where: { sessionNumber: s.sessionNumber },
      update: s,
      create: s,
    });
    sessionMap.set(s.sessionNumber, session.id);
  }
  console.log(`✓ Seeded ${sessionMap.size} induction sessions.`);

  // Upsert Chapters
  for (const c of CHAPTERS_DATA) {
    const sessionId = sessionMap.get(c.sessionNumber);
    if (!sessionId) continue;

    await prisma.inductionChapter.upsert({
      where: { chapterNumber: c.chapterNumber },
      update: {
        title: c.title,
        description: c.description,
        estimatedDuration: c.estimatedDuration,
        sessionId,
        isAssessment: c.isAssessment,
        isResource: c.isResource,
        orderIndex: c.orderIndex,
      },
      create: {
        chapterNumber: c.chapterNumber,
        title: c.title,
        description: c.description,
        estimatedDuration: c.estimatedDuration,
        sessionId,
        isAssessment: c.isAssessment,
        isResource: c.isResource,
        orderIndex: c.orderIndex,
      },
    });
  }
  console.log(`✓ Seeded ${CHAPTERS_DATA.length} handbook chapters.`);

  // Create default induction notifications if empty
  const notifCount = await prisma.inductionNotification.count();
  if (notifCount === 0) {
    for (const n of NOTIFICATIONS_DATA) {
      await prisma.inductionNotification.create({
        data: n,
      });
    }
    console.log(`✓ Seeded ${NOTIFICATIONS_DATA.length} initial notifications.`);
  }

  // Ensure default Rahul Sharma employee exists in DB for induction demo
  const rahulUser = await prisma.user.upsert({
    where: { email: 'rahul.sharma@maventures.com' },
    update: {
      name: 'Rahul Sharma',
    },
    create: {
      employeeId: 'MA-2026-089',
      email: 'rahul.sharma@maventures.com',
      name: 'Rahul Sharma',
      passwordHash: 'dummy_hash',
      role: 'EMPLOYEE',
      dateOfJoining: new Date('2026-02-10'),
    },
  });

  // Seed default progress for chapters 1-7 as completed, chapter 8 in_progress
  for (let chNum = 1; chNum <= 8; chNum++) {
    const chapter = await prisma.inductionChapter.findUnique({
      where: { chapterNumber: chNum },
    });
    if (!chapter) continue;

    const status = chNum <= 7 ? 'COMPLETED' : 'IN_PROGRESS';
    const progressPercentage = chNum <= 7 ? 100 : 40;

    await prisma.inductionProgress.upsert({
      where: {
        userId_chapterId: {
          userId: rahulUser.id,
          chapterId: chapter.id,
        },
      },
      update: {
        status,
        progressPercentage,
      },
      create: {
        userId: rahulUser.id,
        chapterId: chapter.id,
        status,
        progressPercentage,
      },
    });
  }
  console.log('✓ Seeded initial chapter progress for Rahul Sharma.');

  console.log('Database seeding successfully finished!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
