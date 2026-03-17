import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Calculate Readiness (Average performance rating of all employee career profiles)
    const profiles = await prisma.employeeCareerProfile.findMany({
      select: { performanceRating: true }
    });
    const avgReadiness = profiles.length > 0 
      ? Math.round((profiles.reduce((sum, p) => sum + (p.performanceRating || 0), 0) / profiles.length) * 10) 
      : 74; // Fallback to mock if no data

    // 2. Calculate Coverage (Critical positions with at least one successor)
    const criticalPositions = await (prisma as any).position.findMany({
      where: { isCritical: true },
      include: { successionPlans: true }
    });
    const totalCritical = criticalPositions.length;
    const withSuccessor = criticalPositions.filter((p: any) => p.successionPlans && p.successionPlans.length > 0).length;
    const coverage = totalCritical > 0 ? Math.round((withSuccessor / totalCritical) * 100) : 65;

    // 3. Talent Pool Counts
    const talentPoolCount = await prisma.talentPool.count();
    const readyNow = await prisma.talentPool.count({ where: { readiness: 'ready_now' } });
    const ready6m = await prisma.talentPool.count({ where: { readiness: 'ready_6m' } });
    const ready1y = await prisma.talentPool.count({ where: { readiness: 'ready_1y+' } });

    // 4. Return aggregated data merged with manual rating if exists
    const healthRecord = await (prisma as any).careerHealth.findUnique({ where: { id: 'default' } });

    return NextResponse.json({
      id: 'default',
      readiness: avgReadiness || healthRecord?.readiness || 74,
      coverage: coverage || healthRecord?.coverage || 65,
      talentPool: talentPoolCount || healthRecord?.talentPool || 18,
      filledRoles: withSuccessor || healthRecord?.filledRoles || 4,
      totalRoles: totalCritical || healthRecord?.totalRoles || 6,
      nowReady: readyNow || healthRecord?.nowReady || 12,
      ready6m: ready6m || healthRecord?.ready6m || 8,
      ready1y: ready1y || healthRecord?.ready1y || 5,
      rating: healthRecord?.rating || 'B+',
      lastUpdated: healthRecord?.lastUpdated || new Date(),
    });

  } catch (error) {
    console.error('Career Health GET error:', error);
    return NextResponse.json({ error: 'Failed to calculate career health data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Manual updates still allowed for rating or as a fallback/target setting
    const health = await (prisma as any).careerHealth.upsert({
      where: { id: 'default' },
      update: {
        ...data,
        lastUpdated: new Date(),
      },
      create: {
        id: 'default',
        ...data,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json(health);
  } catch (error) {
    console.error('Career Health PUT error:', error);
    return NextResponse.json({ error: 'Failed to update career health data' }, { status: 500 });
  }
}
