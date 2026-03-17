import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
