import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  if (!employeeId) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  try {
    const tasks = await prisma.onboardingTask.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching onboarding tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const updatedTask = await prisma.onboardingTask.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating onboarding task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { employeeId, title, description, dueDate, positionId } = await request.json();

    if (!employeeId || !title) {
      return NextResponse.json({ error: 'Employee ID and title are required' }, { status: 400 });
    }

    const newTask = await (prisma as any).onboardingTask.create({
      data: {
        employeeId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        positionId: positionId || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating onboarding task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await prisma.onboardingTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting onboarding task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, description, dueDate, status, positionId } = await request.json();

    if (!id || !title) {
      return NextResponse.json({ error: 'ID and title are required' }, { status: 400 });
    }

    const updatedTask = await (prisma as any).onboardingTask.update({
      where: { id },
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        positionId: positionId || null,
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating onboarding task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
