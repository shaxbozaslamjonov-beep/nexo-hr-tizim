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
      select: { computerSkill: true, education: true },
    });

    const skillCounts: Record<string, number> = { none: 0, basic: 0, advanced: 0 };
    const educationCounts: Record<string, number> = { secondary: 0, college: 0, bachelor: 0, master: 0 };

    for (const c of candidates) {
      const skill = (c.computerSkill || 'none').toLowerCase();
      if (skill in skillCounts) skillCounts[skill]++;

      const edu = (c.education || '').toLowerCase();
      if (edu in educationCounts) educationCounts[edu]++;
    }

    return NextResponse.json({
      total: candidates.length,
      computerSkill: [
        { name: 'none', value: skillCounts.none },
        { name: 'basic', value: skillCounts.basic },
        { name: 'advanced', value: skillCounts.advanced },
      ],
      education: [
        { name: 'secondary', value: educationCounts.secondary },
        { name: 'college', value: educationCounts.college },
        { name: 'bachelor', value: educationCounts.bachelor },
        { name: 'master', value: educationCounts.master },
      ],
    });
  } catch (error) {
    console.error('Error fetching candidate skills data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
