import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const levels = await prisma.careerLevel.findMany({
      orderBy: { levelName: 'asc' }, // Or any other logical level sorting
    });
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching career map:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
