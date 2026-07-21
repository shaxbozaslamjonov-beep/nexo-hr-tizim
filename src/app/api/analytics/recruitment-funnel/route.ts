import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'view_analytics')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const candidates = await prisma.candidateProfile.findMany({
      where: { user: { companyId: session.companyId } },
      select: { status: true },
    });

    // Note: status vocabulary is inconsistent across the app ('NEW', 'SCREENING',
    // 'MINI_INTERVIEW', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', ...). We bucket
    // loosely on substring/known values, matching the convention used elsewhere
    // (see HRDashboardContent.tsx funnel and /api/hr/hire).
    let applications = 0;
    let screening = 0;
    let interview = 0;
    let training = 0;
    let hired = 0;

    applications = candidates.length;

    candidates.forEach((c: { status: string }) => {
      const s = c.status.toUpperCase();
      if (['SCREENING', 'SCREENING_PASSED', 'MINI_INTERVIEW', 'INTERVIEW', 'OFFER', 'TRAINING', 'HIRED', 'RESERVE_POOL'].includes(s)) {
        screening++;
      }
      if (['MINI_INTERVIEW', 'INTERVIEW', 'OFFER', 'TRAINING', 'HIRED'].includes(s)) {
        interview++;
      }
      if (['OFFER', 'TRAINING', 'HIRED'].includes(s)) {
        training++;
      }
      if (s === 'HIRED') {
        hired++;
      }
    });

    const funnelData = [
      { name: 'Application', value: applications },
      { name: 'Screening', value: screening },
      { name: 'Interview', value: interview },
      { name: 'Training', value: training },
      { name: 'Hired', value: hired },
    ];

    return NextResponse.json(funnelData);
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
