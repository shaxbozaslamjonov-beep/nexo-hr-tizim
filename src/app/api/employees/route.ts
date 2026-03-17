import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const employees = await prisma.employeeProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        careerProfile: true,
        positionRef: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function PATCH(request: Request) {
  try {
    const { userId, positionId, department, probationEnd } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedProfile = await prisma.employeeProfile.update({
      where: { userId },
      data: {
        ...(positionId !== undefined && { positionId: positionId || null }),
        ...(department !== undefined && { department }),
        ...(probationEnd !== undefined && { probationEnd: probationEnd ? new Date(probationEnd) : null }),
      },
      include: {
        user: true,
        positionRef: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
