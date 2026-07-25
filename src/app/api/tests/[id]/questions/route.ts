import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    const test = await prisma.test.findUnique({ where: { id }, select: { companyId: true } });
    if (!test || test.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const { text, type, options, correctIdx } = await request.json();

    const newQuestion = await prisma.question.create({
      data: {
        testId: id,
        text,
        type,
        options: JSON.stringify(options || []),
        correctIdx: JSON.stringify(correctIdx || []),
      }
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
