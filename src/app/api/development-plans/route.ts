import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where = employeeId ? { employeeId } : {};
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
  try {
    const body = await request.json();
    
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
