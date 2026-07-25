import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');
  const status = searchParams.get('status');
  // lessonTypeId isn't stored in Assignment directly, but we might filter via include

  try {
    const where: any = { employee: { user: { companyId: session.companyId } } };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const assignments = await prisma.lessonAssignment.findMany({
      where,
      include: {
        employee: true,
        lesson: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching lesson assignments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { lessonId, employeeId, dueDate } = await request.json();

    if (!employeeId || !lessonId) {
      return NextResponse.json({ error: 'Employee ID and lesson ID are required' }, { status: 400 });
    }

    const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
    if (!employee || employee.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { companyId: true } });
    if (!lesson || lesson.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const newAssignment = await prisma.lessonAssignment.create({
      data: {
        employeeId,
        lessonId,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newAssignment);
  } catch (error) {
    console.error('Error creating lesson assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
