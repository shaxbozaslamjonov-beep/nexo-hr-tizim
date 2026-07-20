import prisma from '@/lib/prisma';

/** Builds a compact, real-data snapshot of the HR pipeline to ground AI answers. */
export async function buildHrSnapshot(): Promise<string> {
  const [vacanciesByStatus, applicationsByStage, candidatesByStatus, upcomingInterviews, staleApplications] =
    await Promise.all([
      prisma.vacancy.groupBy({ by: ['status'], _count: true }),
      prisma.application.groupBy({ by: ['stage'], _count: true }),
      prisma.candidateProfile.groupBy({ by: ['status'], _count: true }),
      prisma.interview.findMany({
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
        include: { candidate: true },
      }),
      prisma.application.findMany({
        where: {
          updatedAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          stage: { notIn: ['REJECTED', 'HIRED'] },
        },
        include: { vacancy: true, candidate: true },
        take: 20,
      }),
    ]);

  const lines: string[] = [];

  lines.push('## Vakansiyalar statusi bo\'yicha:');
  vacanciesByStatus.forEach((v) => lines.push(`- ${v.status}: ${v._count}`));

  lines.push('\n## Arizalar bosqichi bo\'yicha:');
  applicationsByStage.forEach((a) => lines.push(`- ${a.stage}: ${a._count}`));

  lines.push('\n## Nomzodlar statusi bo\'yicha:');
  candidatesByStatus.forEach((c) => lines.push(`- ${c.status}: ${c._count}`));

  lines.push('\n## Yaqinlashib kelayotgan suhbatlar:');
  if (upcomingInterviews.length === 0) lines.push('- Yo\'q');
  upcomingInterviews.forEach((iv) =>
    lines.push(`- ${iv.candidate.firstName} ${iv.candidate.lastName}: ${iv.scheduledAt.toISOString()}`)
  );

  lines.push('\n## 7 kundan ortiq harakatsiz qolgan arizalar (potentsial muammo):');
  if (staleApplications.length === 0) lines.push('- Yo\'q');
  staleApplications.forEach((a) =>
    lines.push(
      `- ${a.candidate.firstName} ${a.candidate.lastName} → "${a.vacancy.title}" (bosqich: ${a.stage}, oxirgi yangilanish: ${a.updatedAt.toISOString().slice(0, 10)})`
    )
  );

  return lines.join('\n');
}

/** Self-scoped snapshot for a CANDIDATE — never includes other candidates' data. */
export async function buildCandidateSelfContext(userId: string): Promise<string> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      applications: { include: { vacancy: true } },
      interviews: { orderBy: { scheduledAt: 'desc' } },
      trainingAssignments: { include: { module: true } },
      testResults: { include: { test: true } },
    },
  });

  if (!profile) return 'Bu foydalanuvchi uchun nomzod profili topilmadi.';

  const lines: string[] = [];
  lines.push(`## Nomzod: ${profile.firstName} ${profile.lastName} (status: ${profile.status}, ball: ${profile.score})`);

  lines.push('\n## Arizalar:');
  if (profile.applications.length === 0) lines.push('- Hozircha ariza yo\'q');
  profile.applications.forEach((a) =>
    lines.push(`- "${a.vacancy.title}" (${a.vacancy.department}): bosqich ${a.stage}, screening ball: ${a.screeningScore ?? '—'}`)
  );

  lines.push('\n## Suhbatlar:');
  if (profile.interviews.length === 0) lines.push('- Hozircha suhbat belgilanmagan');
  profile.interviews.forEach((iv) =>
    lines.push(`- ${iv.scheduledAt.toISOString().slice(0, 16)}: natija ${iv.result ?? 'kutilmoqda'}`)
  );

  lines.push('\n## O\'quv/testlar:');
  if (profile.trainingAssignments.length === 0 && profile.testResults.length === 0) {
    lines.push('- Hozircha tayinlangan o\'quv/test yo\'q');
  }
  profile.trainingAssignments.forEach((ta) => lines.push(`- ${ta.module.title}: ${ta.status}`));
  profile.testResults.forEach((tr) => lines.push(`- ${tr.test.title}: ${tr.score} ball (${tr.status})`));

  return lines.join('\n');
}

/** Self-scoped snapshot for an EMPLOYEE — never includes other employees' data. */
export async function buildEmployeeSelfContext(userId: string): Promise<string> {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      kpis: { include: { kpi: true }, orderBy: { periodDate: 'desc' }, take: 10 },
      assignments: { include: { module: true } },
      careerPath: true,
      careerLevel: true,
      onboardingTasks: true,
    },
  });

  if (!profile) return 'Bu foydalanuvchi uchun xodim profili topilmadi.';

  const lines: string[] = [];
  lines.push(
    `## Xodim: ${profile.firstName} ${profile.lastName} — ${profile.position} (${profile.department}), status: ${profile.status}`
  );
  lines.push(`Ishga qabul sanasi: ${profile.hireDate.toISOString().slice(0, 10)}`);
  if (profile.careerPath) lines.push(`Karyera yo'li: ${profile.careerPath.name} (progress: ${profile.careerProgress}%)`);

  lines.push('\n## So\'nggi KPI yozuvlari:');
  if (profile.kpis.length === 0) lines.push('- Hozircha KPI yozuvi yo\'q');
  profile.kpis.forEach((k) =>
    lines.push(`- ${k.periodDate.toISOString().slice(0, 10)}: ${k.kpi.name} = ${k.value}${k.kpi.unit} (maqsad: ${k.kpi.targetValue}${k.kpi.unit}, baho: ${k.rating ?? '—'})`)
  );

  lines.push('\n## O\'quv tayinlovlari:');
  if (profile.assignments.length === 0) lines.push('- Hozircha yo\'q');
  profile.assignments.forEach((a) => lines.push(`- ${a.module.title}: ${a.status}`));

  lines.push('\n## Onboarding vazifalari:');
  if (profile.onboardingTasks.length === 0) lines.push('- Yo\'q');
  profile.onboardingTasks.forEach((t) => lines.push(`- ${t.title}: ${t.status}`));

  return lines.join('\n');
}
