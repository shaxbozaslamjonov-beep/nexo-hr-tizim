import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

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
      applicationsThisMonth,
      applicationsLastMonth,
      totalEmployees,
      terminatedEmployees,
      openVacancies,
    ] = await Promise.all([
      prisma.application.count({ where: { vacancy: { companyId }, createdAt: { gte: periodStart } } }),
      prisma.application.count({ where: { vacancy: { companyId }, createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
      prisma.employeeProfile.count({ where: { user: { companyId }, status: { not: 'TERMINATED' } } }),
      prisma.employeeProfile.count({ where: { user: { companyId }, status: 'TERMINATED' } }),
      prisma.vacancy.findMany({
        where: { companyId, status: 'OPEN' },
        include: { applications: true },
      }),
    ]);

    const recruitmentGrowth = applicationsLastMonth === 0
      ? (applicationsThisMonth > 0 ? 100 : 0)
      : Math.round(((applicationsThisMonth - applicationsLastMonth) / applicationsLastMonth) * 1000) / 10;

    const totalEver = totalEmployees + terminatedEmployees;
    const retentionRate = totalEver === 0 ? 100 : Math.round((totalEmployees / totalEver) * 1000) / 10;

    const emptyVacancies = openVacancies.filter((v) => v.applications.length === 0).length;

    const insights = {
      recruitmentGrowth: {
        value: `${recruitmentGrowth >= 0 ? '+' : ''}${recruitmentGrowth}%`,
        trend: recruitmentGrowth >= 0 ? 'up' : 'down',
        applicationsThisMonth,
        applicationsLastMonth,
      },
      retentionRate: {
        value: `${retentionRate}%`,
        trend: retentionRate >= 90 ? 'stable' : 'down',
        churnRate: Math.round((100 - retentionRate) * 10) / 10,
      },
      actionRequired: {
        value: emptyVacancies,
        count: emptyVacancies,
      },
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching analytics insights:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
