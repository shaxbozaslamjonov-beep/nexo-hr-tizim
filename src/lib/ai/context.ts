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
