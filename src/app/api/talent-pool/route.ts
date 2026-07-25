import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const talent = await (prisma as any).talentPool.findMany({
      where: { employee: { user: { companyId: session.companyId } } },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error fetching talent pool:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    const employee = await prisma.employeeProfile.findUnique({ where: { id: body.employeeId }, select: { user: { select: { companyId: true } } } });
    if (!employee || employee.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const talent = await (prisma as any).talentPool.create({
      data: {
        employeeId: body.employeeId,
        readiness: body.readiness,
        addedBy: body.addedBy,
        notes: body.notes || '',
      },
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error adding to talent pool:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
