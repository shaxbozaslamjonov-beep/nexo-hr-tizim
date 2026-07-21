import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'view_analytics')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const vacancies = await prisma.vacancy.findMany({
      where: { companyId: session.companyId },
      select: {
        status: true
      }
    });

    let open = 0;
    let pending = 0;
    let closed = 0;

    vacancies.forEach((v) => {
      const s = v.status?.toUpperCase() || '';
      if (s === 'OPEN') {
        open++;
      } else if (s === 'PENDING' || s === 'PENDING_APPROVAL') {
        pending++;
      } else if (s === 'CLOSED') {
        closed++;
      } else {
        // Assume anything else is open if not pending or closed, or just ignore
        open++;
      }
    });

    const statusData = [
      { name: 'Open', value: open },
      { name: 'Pending', value: pending },
      { name: 'Closed', value: closed }
    ];

    return NextResponse.json(statusData);
  } catch (error) {
    console.error('Error fetching vacancy status data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
