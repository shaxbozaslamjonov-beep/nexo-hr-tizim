import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const testResults = await prisma.testResult.findMany({
      where: { testId: id },
    });

    if (testResults.length === 0) {
      return NextResponse.json({
        totalAttempts: 0,
        averageScore: 0,
        successRate: 0,
        distribution: []
      });
    }

    const totalAttempts = testResults.length;
    let sumScore = 0;
    let passed = 0;
    
    // simplified distribution logic for mock UI
    const distribution = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    testResults.forEach(r => {
      sumScore += r.score;
      if (r.status === 'passed') passed++;
      
      if (r.score <= 20) distribution[0].count++;
      else if (r.score <= 40) distribution[1].count++;
      else if (r.score <= 60) distribution[2].count++;
      else if (r.score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    return NextResponse.json({
      totalAttempts,
      averageScore: Math.round(sumScore / totalAttempts),
      successRate: Math.round((passed / totalAttempts) * 100),
      distribution
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
