import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  try {
    // Get next upcoming meeting for this employee or company-wide (employeeId is null)
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
  try {
    const { title, description, dateTime, joinUrl, employeeId } = await request.json();

    if (!title || !dateTime) {
      return NextResponse.json({ error: 'Title and dateTime are required' }, { status: 400 });
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
