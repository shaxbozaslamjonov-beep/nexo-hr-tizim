import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'view_analytics')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const companyId = session.companyId;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') === '7days' ? 7 : 30;

    const now = new Date();
    const periodStart = new Date(now.getTime() - range * 86400000);
    const prevPeriodStart = new Date(now.getTime() - range * 2 * 86400000);

    const [
      candidatesCount,
      vacanciesCount,
      lessonsCount,
      testResultsCount,
      applicationsThisMonth,
      applicationsLastMonth,
      vacanciesThisMonth,
      vacanciesLastMonth,
      closedVacancies,
      openVacancies,
      offeredOrHired,
      hired,
    ] = await Promise.all([
      prisma.candidateProfile.count({ where: { user: { companyId } } }),
      prisma.vacancy.count({ where: { companyId } }),
      prisma.lesson.count(),
      prisma.testResult.count({
        where: { OR: [{ candidate: { user: { companyId } } }, { employee: { user: { companyId } } }] },
      }),
      prisma.application.count({ where: { vacancy: { companyId }, createdAt: { gte: periodStart } } }),
      prisma.application.count({ where: { vacancy: { companyId }, createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
      prisma.vacancy.count({ where: { companyId, createdAt: { gte: periodStart } } }),
      prisma.vacancy.count({ where: { companyId, createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
      prisma.vacancy.findMany({ where: { companyId, status: 'CLOSED' }, select: { createdAt: true, updatedAt: true } }),
      prisma.vacancy.findMany({ where: { companyId, status: 'OPEN' }, select: { createdAt: true } }),
      prisma.candidateProfile.count({ where: { user: { companyId }, status: { in: ['OFFER', 'HIRED'] } } }),
      prisma.candidateProfile.count({ where: { user: { companyId }, status: 'HIRED' } }),
    ]);

    const avgDaysToFill = closedVacancies.length > 0
      ? Math.round(
          closedVacancies.reduce((sum, v) => sum + (v.updatedAt.getTime() - v.createdAt.getTime()) / 86400000, 0) /
            closedVacancies.length
        )
      : openVacancies.length > 0
      ? Math.round(
          openVacancies.reduce((sum, v) => sum + (now.getTime() - v.createdAt.getTime()) / 86400000, 0) /
            openVacancies.length
        )
      : null;

    const offerAcceptanceRate = offeredOrHired > 0 ? Math.round((hired / offeredOrHired) * 1000) / 10 : null;

    return NextResponse.json({
      candidates: candidatesCount,
      vacancies: vacanciesCount,
      lessons: lessonsCount,
      testResults: testResultsCount,
      trends: {
        candidates: pctChange(applicationsThisMonth, applicationsLastMonth),
        vacancies: pctChange(vacanciesThisMonth, vacanciesLastMonth),
      },
      extra: {
        avgDaysToFill,
        offerAcceptanceRate,
        positionsFilled: closedVacancies.length,
        positionsTotal: vacanciesCount,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
