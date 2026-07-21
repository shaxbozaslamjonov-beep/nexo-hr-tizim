import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { runScreening } from '@/lib/screening';
import { can } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// GET - list candidates (HR), or a candidate's own profile when role is CANDIDATE
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vacancyId = searchParams.get('vacancyId');

    // A candidate may only ever see their own profile, regardless of query params.
    if (session.role === 'CANDIDATE') {
      const own = await prisma.candidateProfile.findUnique({
        where: { userId: session.id },
        include: {
          applications: { include: { vacancy: true } },
          interviews: { orderBy: { scheduledAt: 'desc' } },
        },
      });
      return NextResponse.json(own ? [own] : []);
    }

    if (!can(session, 'manage_candidates')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const candidates = await prisma.candidateProfile.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      include: {
        applications: {
          where: vacancyId ? { vacancyId } : undefined,
          include: { vacancy: true },
        },
      },
      orderBy: { score: 'desc' },
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

// POST - submit candidate application (self-registration)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      birthDate,
      education,
      experienceMonths,
      shiftReady,
      computerSkill,
      hasManufacturingExp,
      vacancyId,
      cvUrl,
      source,
      region,
      hasRequiredDocs,
    } = body;

    if (!firstName || !lastName || !vacancyId) {
      return NextResponse.json({ error: 'Missing required fields', code: 'missing_fields' }, { status: 400 });
    }

    // Run automated screening
    const screeningResult = runScreening({
      experienceMonths: Number(experienceMonths) || 0,
      shiftReady: Boolean(shiftReady),
      hasManufacturingExp: Boolean(hasManufacturingExp),
      computerSkill: computerSkill || 'none',
      hasRequiredDocs: Boolean(hasRequiredDocs),
    });

    // Map screening status to Candidate status
    const candidateStatus = screeningResult.status === 'mini_interview'
      ? 'MINI_INTERVIEW'
      : screeningResult.status === 'screening_passed'
      ? 'SCREENING_PASSED'
      : screeningResult.status === 'reserve_pool'
      ? 'RESERVE_POOL'
      : 'REJECTED';

    // Create or find user account for candidate
    let userId: string;
    let tempPassword: string | undefined;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      userId = existingUser.id;

      // Check for duplicate application
      const existingApp = await prisma.application.findFirst({
        where: {
          candidate: { userId },
          vacancyId,
        },
      });
      if (existingApp) {
        return NextResponse.json({ error: 'Duplicate application for this vacancy', code: 'duplicate' }, { status: 400 });
      }
    } else {
      // Auto-create candidate account
      tempPassword = Math.random().toString(36).slice(-8);
      const { hashPassword } = await import('@/lib/password');
      const hashed = await hashPassword(tempPassword);

      const newUser = await prisma.user.create({
        data: { email, password: hashed, role: 'CANDIDATE' },
      });
      userId = newUser.id;
    }

    // Upsert candidate profile
    const existingProfile = await prisma.candidateProfile.findUnique({ where: { userId } });

    let candidateId: string;
    if (existingProfile) {
      const updated = await prisma.candidateProfile.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          phone,
          address,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          education,
          experience: Number(experienceMonths) || 0,
          shiftReady: Boolean(shiftReady),
          computerSkill,
          cvUrl,
          source,
          region,
          status: candidateStatus,
          score: screeningResult.totalScore,
        },
      });
      candidateId = updated.id;
    } else {
      const profile = await prisma.candidateProfile.create({
        data: {
          userId,
          firstName,
          lastName,
          phone,
          address,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          education,
          experience: Number(experienceMonths) || 0,
          shiftReady: Boolean(shiftReady),
          computerSkill,
          cvUrl,
          source,
          status: candidateStatus,
          score: screeningResult.totalScore,
        },
      });
      candidateId = profile.id;
    }

    // Create application linked to vacancy
    const application = await prisma.application.create({
      data: {
        candidateId,
        vacancyId,
        stage: candidateStatus,
        screeningScore: screeningResult.totalScore,
      },
    });

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        applicationId: application.id,
        screening: screeningResult,
        ...(tempPassword ? { account: { email, tempPassword } } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application Error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'server_error' }, { status: 500 });
  }
}
