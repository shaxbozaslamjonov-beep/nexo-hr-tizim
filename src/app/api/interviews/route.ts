import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all interviews (HR)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const interviews = await prisma.interview.findMany({
    orderBy: { scheduledAt: 'desc' },
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      application: { include: { vacancy: { select: { title: true, department: true } } } },
    },
  });

  return NextResponse.json(interviews);
}

// POST create interview
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { applicationId, candidateId, scheduledAt } = body;

  if (!applicationId || !candidateId || !scheduledAt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const interview = await prisma.interview.create({
    data: {
      applicationId,
      candidateId,
      interviewerId: session.id,
      scheduledAt: new Date(scheduledAt),
    },
  });

  // Update application stage
  await prisma.application.update({
    where: { id: applicationId },
    data: { stage: 'INTERVIEW_SCHEDULED' },
  });

  return NextResponse.json(interview, { status: 201 });
}
