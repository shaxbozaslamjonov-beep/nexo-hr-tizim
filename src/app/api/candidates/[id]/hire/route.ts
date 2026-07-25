import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!can(session, 'manage_candidates') && !can(session, 'manage_employees')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: candidateId } = await params;
    const body = await request.json().catch(() => ({}));
    const { department, positionTitle, salary } = body;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        user: true,
        applications: {
          include: { vacancy: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Nomzod topilmadi' }, { status: 404 });
    }

    if (candidate.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Forbidden: Boshqa kompaniya nomzodi' }, { status: 403 });
    }

    const latestApp = candidate.applications[0];
    const dept = department || latestApp?.vacancy?.department || 'Boshqaruv';
    const pos = positionTitle || latestApp?.vacancy?.title || 'Xodim';

    // 1. Update CandidateProfile & Application status
    await prisma.candidateProfile.update({
      where: { id: candidateId },
      data: { status: 'HIRED' },
    });

    if (latestApp) {
      await prisma.application.update({
        where: { id: latestApp.id },
        data: { stage: 'OFFER_ACCEPTED' },
      });
    }

    // 2. Change User role from CANDIDATE to EMPLOYEE
    await prisma.user.update({
      where: { id: candidate.userId },
      data: { role: 'EMPLOYEE' },
    });

    // 3. Upsert EmployeeProfile
    const employee = await prisma.employeeProfile.upsert({
      where: { userId: candidate.userId },
      create: {
        userId: candidate.userId,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        department: dept,
        position: pos,
        salary: salary ? parseFloat(salary) : undefined,
        hireDate: new Date(),
        status: 'ONBOARDING',
      },
      update: {
        department: dept,
        position: pos,
        status: 'ONBOARDING',
        hireDate: new Date(),
        salary: salary ? parseFloat(salary) : undefined,
      },
    });

    // 4. Create initial Onboarding Tasks
    const initialTasks = [
      { title: 'Mehnat shartnomasini va hujjatlarni rasmiylashtirish', description: 'HR bo\'limiga pasport va diplom nusxalarini topshirish' },
      { title: 'Ish o\'rni va texnikalarni sozlash', description: 'Kompyuter va korporativ email huquqlarini olish' },
      { title: 'Jamoa bilan tanishuv va O\'quv modullarini boshlash', description: 'Nexo HR platformasidagi kirish darslarini ko\'rib chiqish' },
    ];

    await prisma.onboardingTask.createMany({
      data: initialTasks.map(task => ({
        employeeId: employee.id,
        title: task.title,
        description: task.description,
        status: 'PENDING',
      })),
    });

    // 5. Log Audit Action
    await logAudit({
      companyId: session.companyId,
      userId: session.id,
      userEmail: session.email,
      action: 'CANDIDATE_HIRED',
      entityType: 'EmployeeProfile',
      entityId: employee.id,
      details: {
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        position: pos,
        department: dept,
      },
    });

    return NextResponse.json({
      message: 'Nomzod muvaffaqiyatli ishga qabul qilindi va xodim profiliga o\'tkazildi!',
      employeeId: employee.id,
    });
  } catch (error: any) {
    console.error('Hire Candidate Error:', error);
    return NextResponse.json({ error: error.message || 'Ishga qabul qilishda xatolik' }, { status: 500 });
  }
}
