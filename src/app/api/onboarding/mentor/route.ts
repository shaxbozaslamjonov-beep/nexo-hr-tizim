import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  if (!employeeId) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  try {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        mentor: true,
      },
    });

    if (!employee || !employee.mentor) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      firstName: employee.mentor.firstName,
      lastName: employee.mentor.lastName,
      position: employee.mentor.position,
      email: null, // EmployeeProfile doesn't have email; would need User join
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
