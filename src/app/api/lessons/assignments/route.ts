import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');
  const status = searchParams.get('status');
  // lessonTypeId isn't stored in Assignment directly, but we might filter via include
  
  try {
    const where: any = {};
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
  try {
    const { lessonId, employeeId, dueDate } = await request.json();

    if (!employeeId || !lessonId) {
      return NextResponse.json({ error: 'Employee ID and lesson ID are required' }, { status: 400 });
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
