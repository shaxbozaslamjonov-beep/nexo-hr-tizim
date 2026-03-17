import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const levels = await prisma.careerLevel.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching career levels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
      },
    });

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error creating career level:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Level ID is required' }, { status: 400 });
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Level ID is required' }, { status: 400 });
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
