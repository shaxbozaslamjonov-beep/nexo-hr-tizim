import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function questionBelongsToCompany(questionId: string, companyId: string) {
  const question = await prisma.question.findUnique({ where: { id: questionId }, select: { test: { select: { companyId: true } } } });
  return !!question && question.test.companyId === companyId;
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, questionId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { questionId } = await params;
    if (!(await questionBelongsToCompany(questionId, session.companyId))) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
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
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { questionId } = await params;
    if (!(await questionBelongsToCompany(questionId, session.companyId))) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
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
