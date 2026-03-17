import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !['HR_MANAGER', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { candidateId, position, department, mentorId } = await req.json();

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: { user: true }
    });

    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    // 1. Transaction to hire
    await prisma.$transaction([
      // Create employee profile
      prisma.employeeProfile.create({
        data: {
          userId: candidate.userId,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          position: position || 'Employee',
          department: department || 'Production',
          hireDate: new Date(),
          status: 'ONBOARDING',
          mentorId: mentorId,
        }
      }),
      // Update candidate status
      prisma.candidateProfile.update({
        where: { id: candidateId },
        data: { status: 'HIRED' }
      }),
      // Update user role
      prisma.user.update({
        where: { id: candidate.userId },
        data: { role: 'EMPLOYEE' }
      }),
      // Remove from reserve if exists
      prisma.reserve.deleteMany({
        where: { candidateId: candidateId }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Candidate hired successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
