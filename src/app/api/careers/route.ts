import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const levels = await prisma.careerLevel.findMany({
      where: { companyId: session.companyId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching career levels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { role, levelName, requirements, order } = await request.json();

    if (!role || !levelName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const level = await prisma.careerLevel.create({
      data: {
        role,
        levelName,
        requirements: requirements || '',
        order: parseInt(order) || 0,
        companyId: session.companyId,
      },
    });

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error creating career level:', error);
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
      return NextResponse.json({ error: 'Level ID is required' }, { status: 400 });
    }

    const existing = await prisma.careerLevel.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.careerLevel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting career level:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Level ID is required' }, { status: 400 });
    }

    const existing = await prisma.careerLevel.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { role, levelName, requirements, order } = await request.json();

    const updated = await prisma.careerLevel.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(levelName && { levelName }),
        ...(requirements !== undefined && { requirements }),
        ...(order !== undefined && { order: parseInt(order) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating career level:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
