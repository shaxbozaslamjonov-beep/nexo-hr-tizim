import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const positions = await (prisma as any).position.findMany({
      where: { companyId: session.companyId },
      select: {
        requiredSkills: true,
      },
    });

    const allSkills = new Set<string>();
    positions.forEach((pos: any) => {
      try {
        const skills = JSON.parse(pos.requiredSkills || '[]');
        if (Array.isArray(skills)) {
          skills.forEach((skill: any) => {
            if (typeof skill === 'string') {
              allSkills.add(skill);
            } else if (skill && typeof skill === 'object' && skill.name) {
              allSkills.add(skill.name);
            }
          });
        }
      } catch (e) {
        console.error('Error parsing skills for a position:', e);
      }
    });

    return NextResponse.json(Array.from(allSkills).sort());
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
