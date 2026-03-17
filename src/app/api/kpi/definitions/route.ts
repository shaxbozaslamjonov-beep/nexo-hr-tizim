import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET – list all KPI definitions
export async function GET() {
  try {
    const kpis = await prisma.kPI.findMany({
      include: {
        entries: {
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
  try {
    const { name, unit, targetValue, description, employeeId, positionId } = await request.json();

    if (!name || !unit || targetValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields: name, unit, targetValue' }, { status: 400 });
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'KPI id is required' }, { status: 400 });
    }

    const { name, unit, targetValue, description, employeeId, positionId } = await request.json();

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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'KPI id is required' }, { status: 400 });
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
