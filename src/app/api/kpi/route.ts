import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  if (employeeId) {
    const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
    if (!employee || employee.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
  }

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
          where: employeeId ? { employeeId, employee: { user: { companyId: session.companyId } } } : { employee: { user: { companyId: session.companyId } } },
          include: {
            employee: {
              include: { user: true }
            }
          },
          orderBy: { periodDate: 'desc' }
        }
      }
    });
    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { kpiId, employeeId, value, periodDate, rating } = await request.json();

    if (!kpiId || !employeeId || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
    if (!employee || employee.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const entry = await prisma.kPIEntry.create({
      data: {
        kpiId,
        employeeId,
        value: parseFloat(value),
        periodDate: new Date(periodDate || Date.now()),
        rating,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error creating KPI entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'KPI Entry ID is required' }, { status: 400 });
    }

    const entry = await prisma.kPIEntry.findUnique({ where: { id }, select: { employee: { select: { user: { select: { companyId: true } } } } } });
    if (!entry || entry.employee.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.kPIEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting KPI entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
