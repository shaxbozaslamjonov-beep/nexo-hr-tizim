import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [candidatesBaseCount, vacanciesCount, lessonsCount, testResultsCount] = await Promise.all([
      prisma.candidateProfile.count(),
      prisma.vacancy.count(),
      prisma.lesson.count(),
      prisma.testResult.count()
    ]);

    return NextResponse.json({
      candidates: candidatesBaseCount,
      vacancies: vacanciesCount,
      lessons: lessonsCount,
      testResults: testResultsCount,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
