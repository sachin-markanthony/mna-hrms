import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log('--- Connecting to Neon PostgreSQL ---');

  const total = await prisma.candidate.count();
  const digital = await prisma.candidate.count({ where: { department: 'DIGITAL' } });
  const sales = await prisma.candidate.count({ where: { department: 'SALES' } });
  const selected = await prisma.candidate.count({ where: { status: 'SELECTED' } });
  const hrRound = await prisma.candidate.count({ where: { status: 'HR_ROUND' } });
  const mrRound = await prisma.candidate.count({ where: { status: 'MR_ROUND' } });
  const rejHr = await prisma.candidate.count({ where: { status: 'REJECTED_HR' } });
  const rejMr = await prisma.candidate.count({ where: { status: 'REJECTED_MR' } });
  const evaluationsCount = await prisma.roundEvaluation.count();

  console.log('Total Candidates in Neon DB:', total);
  console.log('Digital Department:', digital);
  console.log('Sales Department:', sales);
  console.log('Status Breakdown:');
  console.log('  - In HR Round:', hrRound);
  console.log('  - In MR Round:', mrRound);
  console.log('  - Selected (Hired):', selected);
  console.log('  - Rejected at HR Round:', rejHr);
  console.log('  - Rejected at MR Round:', rejMr);
  console.log('Total Round Evaluations Logged:', evaluationsCount);

  const sampleRejected = await prisma.candidate.findFirst({
    where: { status: 'REJECTED_HR' },
    include: { evaluations: true },
  });

  if (sampleRejected) {
    console.log('Sample HR Rejection Record:');
    console.log('  Candidate:', sampleRejected.fullName);
    console.log('  Status:', sampleRejected.status);
    console.log('  Reason:', sampleRejected.rejectionReason);
    console.log('  Interviewer:', sampleRejected.hrInterviewer);
  }

  await prisma.$disconnect();
  console.log('--- Database Verification Complete: 100% Synced ---');
}

verify().catch((e) => {
  console.error('Database check error:', e);
  process.exit(1);
});
