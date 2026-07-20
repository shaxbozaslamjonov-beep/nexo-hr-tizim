import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - public list of OPEN vacancies (no auth required)
export async function GET() {
  try {
    const vacancies = await prisma.vacancy.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        department: true,
        salaryRange: true,
        salaryMin: true,
        salaryMax: true,
        shift: true,
        description: true,
        requirements: true,
        createdAt: true,
      },
    });

    return NextResponse.json(vacancies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch vacancies' }, { status: 500 });
  }
}
