import 'dotenv/config';
import { PrismaClient, RecruitmentDepartment, CandidateRecruitmentStatus, InterviewRoundType, RoundEvaluationResult } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('Seeding initial walk-in recruitment records to Neon PostgreSQL...');

  const today = new Date();
  today.setHours(10, 0, 0, 0);

  // 1. Candidate in MR_ROUND (Digital)
  const c1 = await prisma.candidate.create({
    data: {
      fullName: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@gmail.com',
      phone: '+91 98234 56789',
      department: RecruitmentDepartment.DIGITAL,
      appliedRole: 'Senior Performance Marketer',
      visitDate: today,
      status: CandidateRecruitmentStatus.MR_ROUND,
      experienceYears: 4.5,
      currentCompany: 'Social Panga',
      expectedSalary: '₹14,00,000 / yr',
      tags: ['Meta Ads', 'Google Ads', 'CAC Optimization'],
      hrInterviewer: 'Sarah Jenkins',
      hrRating: 4.5,
      hrFeedback: 'Strong analytical skills, solid track record in real estate lead generation campaigns.',
      hrEvaluatedAt: new Date(),
    },
  });

  await prisma.roundEvaluation.create({
    data: {
      candidateId: c1.id,
      round: InterviewRoundType.HR_ROUND,
      result: RoundEvaluationResult.PASSED,
      interviewerName: 'Sarah Jenkins',
      rating: 4.5,
      feedback: 'Cleared HR Round with strong culture fit and salary alignment.',
    },
  });

  // 2. Candidate SELECTED (Sales)
  const c2 = await prisma.candidate.create({
    data: {
      fullName: 'Aditya Kulkarni',
      email: 'aditya.k@gmail.com',
      phone: '+91 98765 43210',
      department: RecruitmentDepartment.SALES,
      appliedRole: 'Luxury Property Sales Manager',
      visitDate: today,
      status: CandidateRecruitmentStatus.SELECTED,
      experienceYears: 6,
      currentCompany: 'Lodha Group',
      expectedSalary: '₹22,00,000 / yr',
      tags: ['HNI Client Handling', 'Site Closures', 'Team Handling'],
      hrInterviewer: 'Sarah Jenkins',
      hrRating: 5.0,
      hrFeedback: 'Excellent executive communication and proven luxury sales volume.',
      hrEvaluatedAt: new Date(),
      mrInterviewer: 'Alexander Anthony',
      mrRating: 4.8,
      mrFeedback: 'Visionary alignment, great commercial drive. Approved for offer.',
      mrEvaluatedAt: new Date(),
    },
  });

  await prisma.roundEvaluation.createMany({
    data: [
      {
        candidateId: c2.id,
        round: InterviewRoundType.HR_ROUND,
        result: RoundEvaluationResult.PASSED,
        interviewerName: 'Sarah Jenkins',
        rating: 5.0,
        feedback: 'Cleared HR Round with flying colors.',
      },
      {
        candidateId: c2.id,
        round: InterviewRoundType.MR_ROUND,
        result: RoundEvaluationResult.PASSED,
        interviewerName: 'Alexander Anthony',
        rating: 4.8,
        feedback: 'Approved for hire.',
      },
    ],
  });

  // 3. Candidate REJECTED_HR (Sales)
  const c3 = await prisma.candidate.create({
    data: {
      fullName: 'Pooja Verma',
      email: 'pooja.verma@yahoo.com',
      phone: '+91 91234 56780',
      department: RecruitmentDepartment.SALES,
      appliedRole: 'Inside Sales Executive',
      visitDate: today,
      status: CandidateRecruitmentStatus.REJECTED_HR,
      experienceYears: 2,
      currentCompany: 'Square Yards',
      expectedSalary: '₹8,00,000 / yr',
      tags: ['Cold Calling', 'CRM Handling'],
      rejectionReason: 'Communication skills and fluency below the benchmark required for corporate clients.',
      hrInterviewer: 'Sarah Jenkins',
      hrRating: 2.5,
      hrFeedback: 'Unable to handle objection scenarios during mock sales call.',
      hrEvaluatedAt: new Date(),
    },
  });

  await prisma.roundEvaluation.create({
    data: {
      candidateId: c3.id,
      round: InterviewRoundType.HR_ROUND,
      result: RoundEvaluationResult.REJECTED,
      interviewerName: 'Sarah Jenkins',
      rating: 2.5,
      feedback: 'Communication and mock call objections rejected.',
      rejectionReason: 'Communication skills and fluency below the benchmark required for corporate clients.',
    },
  });

  // 4. Candidate REJECTED_MR (Digital)
  const c4 = await prisma.candidate.create({
    data: {
      fullName: 'Sameer Sheikh',
      email: 'sameer.s@outlook.com',
      phone: '+91 98989 12345',
      department: RecruitmentDepartment.DIGITAL,
      appliedRole: 'SEO & Content Strategist',
      visitDate: today,
      status: CandidateRecruitmentStatus.REJECTED_MR,
      experienceYears: 3,
      currentCompany: 'Webchutney',
      expectedSalary: '₹10,50,000 / yr',
      tags: ['Technical SEO', 'Schema Markup'],
      rejectionReason: 'Failed MR technical case study on organic luxury search growth.',
      hrInterviewer: 'Sarah Jenkins',
      hrRating: 4.0,
      hrFeedback: 'Positive personality and energetic.',
      hrEvaluatedAt: new Date(),
      mrInterviewer: 'Alexander Anthony',
      mrRating: 2.0,
      mrFeedback: 'Knowledge is limited to superficial blogging, lacking technical indexing and core web vitals expertise.',
      mrEvaluatedAt: new Date(),
    },
  });

  await prisma.roundEvaluation.createMany({
    data: [
      {
        candidateId: c4.id,
        round: InterviewRoundType.HR_ROUND,
        result: RoundEvaluationResult.PASSED,
        interviewerName: 'Sarah Jenkins',
        rating: 4.0,
        feedback: 'Cleared to MR round.',
      },
      {
        candidateId: c4.id,
        round: InterviewRoundType.MR_ROUND,
        result: RoundEvaluationResult.REJECTED,
        interviewerName: 'Alexander Anthony',
        rating: 2.0,
        feedback: 'Failed case study presentation.',
        rejectionReason: 'Failed MR technical case study on organic luxury search growth.',
      },
    ],
  });

  // 5. Candidate in HR_ROUND (Sales)
  await prisma.candidate.create({
    data: {
      fullName: 'Neha Bansal',
      email: 'neha.b@gmail.com',
      phone: '+91 97766 55443',
      department: RecruitmentDepartment.SALES,
      appliedRole: 'Direct Channel Sales Associate',
      visitDate: today,
      status: CandidateRecruitmentStatus.HR_ROUND,
      experienceYears: 1.5,
      currentCompany: 'Anarock Property',
      expectedSalary: '₹6,50,000 / yr',
      tags: ['Broker Network', 'Site Visits'],
    },
  });

  // 6. Candidate REGISTERED (Digital)
  await prisma.candidate.create({
    data: {
      fullName: 'Vikas Pandey',
      email: 'vikas.p@gmail.com',
      phone: '+91 96655 44332',
      department: RecruitmentDepartment.DIGITAL,
      appliedRole: 'Social Media & Graphic Designer',
      visitDate: today,
      status: CandidateRecruitmentStatus.REGISTERED,
      experienceYears: 2,
      currentCompany: 'Freelance',
      expectedSalary: '₹7,00,000 / yr',
      tags: ['Canva', 'Premiere Pro', 'Reels'],
    },
  });

  console.log('Seeded 6 candidates successfully into Neon PostgreSQL!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
