import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  try {
    const kpis = await prisma.kPI.findMany({
      include: {
        entries: {
          where: employeeId ? { employeeId } : undefined,
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
  try {
    const { kpiId, employeeId, value, periodDate, rating } = await request.json();

    if (!kpiId || !employeeId || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'KPI Entry ID is required' }, { status: 400 });
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
