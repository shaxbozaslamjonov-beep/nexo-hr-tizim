import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  if (employeeId) {
    const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
    if (!employee || employee.user.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
  }

  try {
    // Get next upcoming meeting for this employee or company-wide (employeeId is null)
    // NOTE: Meeting has no companyId field yet, so "company-wide" (employeeId: null)
    // meetings are currently global across all tenants — a schema gap, not fixable by query scoping alone.
    const now = new Date();
    const meeting = await prisma.meeting.findFirst({
      where: {
        dateTime: { gte: now },
        OR: [
          { employeeId: employeeId || undefined },
          { employeeId: null }, // company-wide meetings
        ],
      },
      orderBy: { dateTime: 'asc' },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, description, dateTime, joinUrl, employeeId } = await request.json();

    if (!title || !dateTime) {
      return NextResponse.json({ error: 'Title and dateTime are required' }, { status: 400 });
    }

    if (employeeId) {
      const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
      if (!employee || employee.user.companyId !== session.companyId) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        dateTime: new Date(dateTime),
        joinUrl: joinUrl || null,
        employeeId: employeeId || null,
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
