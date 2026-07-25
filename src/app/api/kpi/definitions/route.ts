import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function kpiBelongsToCompany(id: string, companyId: string): Promise<boolean> {
  const kpi = await prisma.kPI.findUnique({
    where: { id },
    select: {
      position: { select: { companyId: true } },
      entries: { take: 1, select: { employee: { select: { user: { select: { companyId: true } } } } } },
    },
  });
  if (!kpi) return false;
  if (kpi.position && kpi.position.companyId === companyId) return true;
  if (kpi.entries[0] && kpi.entries[0].employee.user.companyId === companyId) return true;
  return false;
}

// GET – list all KPI definitions
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const kpis = await prisma.kPI.findMany({
      where: {
        OR: [
          { position: { companyId: session.companyId } },
          { entries: { some: { employee: { user: { companyId: session.companyId } } } } },
        ],
      },
      include: {
        entries: {
          where: { employee: { user: { companyId: session.companyId } } },
          include: {
            employee: {
              include: { user: true }
            }
          },
          orderBy: { periodDate: 'desc' }
        },
        position: {
          select: { title: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching KPI definitions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST – create a new KPI definition
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, unit, targetValue, description, employeeId, positionId } = await request.json();

    if (!name || !unit || targetValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields: name, unit, targetValue' }, { status: 400 });
    }

    if (employeeId) {
      const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
      if (!employee || employee.user.companyId !== session.companyId) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
    }
    if (positionId) {
      const position = await prisma.position.findUnique({ where: { id: positionId }, select: { companyId: true } });
      if (!position || position.companyId !== session.companyId) {
        return NextResponse.json({ error: 'Position not found' }, { status: 404 });
      }
    }

    const kpi = await prisma.kPI.create({
      data: {
        name: name.trim(),
        unit: unit.trim(),
        targetValue: parseFloat(targetValue),
        description,
        employeeId,
        positionId,
      },
    });

    return NextResponse.json(kpi, { status: 201 });
  } catch (error) {
    console.error('Error creating KPI definition:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT – update an existing KPI definition
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'KPI id is required' }, { status: 400 });
    }

    if (!(await kpiBelongsToCompany(id, session.companyId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { name, unit, targetValue, description, employeeId, positionId } = await request.json();

    if (employeeId) {
      const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
      if (!employee || employee.user.companyId !== session.companyId) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
    }
    if (positionId) {
      const position = await prisma.position.findUnique({ where: { id: positionId }, select: { companyId: true } });
      if (!position || position.companyId !== session.companyId) {
        return NextResponse.json({ error: 'Position not found' }, { status: 404 });
      }
    }

    const kpi = await prisma.kPI.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(unit !== undefined && { unit: unit.trim() }),
        ...(targetValue !== undefined && { targetValue: parseFloat(targetValue) }),
        ...(description !== undefined && { description }),
        ...(employeeId !== undefined && { employeeId }),
        ...(positionId !== undefined && { positionId }),
      },
    });

    return NextResponse.json(kpi);
  } catch (error: any) {
    console.error('Error updating KPI definition:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE – remove a KPI definition and all its entries
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'KPI id is required' }, { status: 400 });
    }

    if (!(await kpiBelongsToCompany(id, session.companyId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete children first to respect FK constraints
    await prisma.kPIEntry.deleteMany({ where: { kpiId: id } });
    await prisma.kPI.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting KPI definition:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
