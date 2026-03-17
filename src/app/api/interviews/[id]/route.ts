import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;

  const body = await request.json();
  const {
    communicationScore,
    disciplineScore,
    motivationScore,
    flexibilityScore,
    readinessScore,
    totalScore,
    notes,
    result,
  } = body;

  try {
    const interview = await prisma.interview.update({
      where: { id: resolvedParams.id },
      data: {
        communicationScore,
        disciplineScore,
        motivationScore,
        flexibilityScore,
        readinessScore,
        totalScore,
        notes,
        result,
      },
    });

    // Update Application and Candidate status based on result
    const stage = result === 'PASSED' ? 'TRAINING' : result === 'RESERVE' ? 'RESERVE_POOL' : 'REJECTED';

    await prisma.application.update({
      where: { id: interview.applicationId, },
      data: { stage },
    });

    await prisma.candidateProfile.update({
      where: { id: interview.candidateId },
      data: { status: stage },
    });

    if (result === 'RESERVE') {
      const app = await prisma.application.findUnique({
        where: { id: interview.applicationId },
        include: { vacancy: true }
      });
      
      await prisma.reserve.create({
        data: {
          candidateId: interview.candidateId,
          targetRole: app?.vacancy.title || 'Unknown',
          readiness: 80, // Default readiness for reserve
          branch: app?.vacancy.department,
        }
      });
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
}
