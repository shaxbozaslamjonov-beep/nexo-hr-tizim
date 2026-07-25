import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const test = await prisma.test.findFirst({
      where: { id, companyId: session.companyId },
      include: {
        questions: true,
      }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.test.findUnique({ where: { id }, select: { companyId: true } });
    if (!existing || existing.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const { title, description, isActive } = await request.json();

    const updatedTest = await prisma.test.update({
      where: { id: id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        questions: true,
      }
    });

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
