import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where: any = { employee: { user: { companyId: session.companyId } } };
    if (employeeId) where.employeeId = employeeId;
    const plans = await (prisma as any).developmentPlan.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsedPlans = plans.map((plan: any) => ({
      ...plan,
      actionItems: JSON.parse(plan.actionItems || '[]'),
      training: JSON.parse(plan.training || '[]'),
      checkpoints: JSON.parse(plan.checkpoints || '[]'),
    }));

    return NextResponse.json(parsedPlans);
  } catch (error) {
    console.error('Error fetching development plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    const employee = await prisma.employeeProfile.findUnique({ where: { id: body.employeeId }, select: { user: { select: { companyId: true } } } });
    if (!employee || employee.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const plan = await (prisma as any).developmentPlan.create({
      data: {
        employeeId: body.employeeId,
        objectives: body.objectives,
        actionItems: JSON.stringify(body.actionItems || []),
        training: JSON.stringify(body.training || []),
        projectAssignment: body.projectAssignment || '',
        mentorId: body.mentorId || '',
        checkpoints: JSON.stringify(body.checkpoints || []),
        status: body.status || 'active',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating development plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
