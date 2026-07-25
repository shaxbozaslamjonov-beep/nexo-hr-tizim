import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const levels = await prisma.careerLevel.findMany({
      where: { companyId: session.companyId },
      orderBy: { levelName: 'asc' }, // Or any other logical level sorting
    });
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching career map:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
