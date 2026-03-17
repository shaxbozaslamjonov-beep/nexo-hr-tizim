import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const assignment = await prisma.lessonAssignment.findUnique({
      where: { id },
      include: { employee: true }
    });
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const { status, score, submissionText, fileUrl } = await request.json();

    const data: any = {};
    if (status) data.status = status;
    if (score !== undefined) data.score = score;
    if (submissionText !== undefined) data.submissionText = submissionText;
    if (fileUrl !== undefined) data.fileUrl = fileUrl;

    if (status === 'SUBMITTED' || status === 'DONE') {
      data.submittedAt = new Date();
    }

    const updatedAssignment = await prisma.lessonAssignment.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await prisma.lessonAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
