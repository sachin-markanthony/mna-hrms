import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const all = await prisma.candidate.findMany({
    select: { id: true, fullName: true, status: true, department: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log('--- CANDIDATES IN NEON DB ---');
  for (const c of all) {
    console.log(`[${c.status}] ${c.fullName} (${c.department}) - ID: ${c.id}`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
