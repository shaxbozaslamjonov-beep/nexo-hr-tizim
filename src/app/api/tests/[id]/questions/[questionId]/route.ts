import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, questionId: string }> }) {
  try {
    const { questionId } = await params;
    await prisma.question.delete({
      where: { id: questionId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string, questionId: string }> }) {
  try {
    const { questionId } = await params;
    const { text, type, options, correctIdx } = await request.json();
    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(text && { text }),
        ...(type && { type }),
        ...(options && { options: JSON.stringify(options) }),
        ...(correctIdx && { correctIdx: JSON.stringify(correctIdx) }),
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
