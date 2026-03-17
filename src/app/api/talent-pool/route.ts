import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const talent = await (prisma as any).talentPool.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error fetching talent pool:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const talent = await (prisma as any).talentPool.create({
      data: {
        employeeId: body.employeeId,
        readiness: body.readiness,
        addedBy: body.addedBy,
        notes: body.notes || '',
      },
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error adding to talent pool:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
