require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const company = await p.company.findUnique({ where: { slug: 'nexo-demo' } });
  if (!company) {
    console.error('nexo-demo company not found — run `npm run seed` first.');
    process.exit(1);
  }

  const lessons = await p.lesson.updateMany({
    where: { companyId: null },
    data: { companyId: company.id },
  });
  const tracks = await p.trainingTrack.updateMany({
    where: { companyId: null },
    data: { companyId: company.id },
  });
  const levels = await p.careerLevel.updateMany({
    where: { companyId: null },
    data: { companyId: company.id },
  });

  console.log(`Backfilled companyId=${company.id} onto:`);
  console.log(`  lessons: ${lessons.count}`);
  console.log(`  trainingTracks: ${tracks.count}`);
  console.log(`  careerLevels: ${levels.count}`);

  await p.$disconnect();
})();
