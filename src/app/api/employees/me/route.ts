import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await prisma.employeeProfile.findFirst({
        where: {
            user: {
                id: session.id
            }
        },
        include: {
            user: true,
            careerLevel: true,
            targetMilestone: true,
            careerProfile: true
        }
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching current employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
