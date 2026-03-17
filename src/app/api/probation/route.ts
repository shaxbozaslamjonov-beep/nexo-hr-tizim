import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const evaluations = await (prisma as any).probationEvaluation.findMany({
      include: {
        employee: {
          include: {
            user: true
          }
        },
        evaluator: true,
        position: true
      },
      orderBy: { evaluatedAt: 'desc' },
    });
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching probation evaluations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      employeeId, 
      evaluatorId, 
      periodDays, 
      startDate,
      endDate,
      disciplineScore, 
      learningScore, 
      qualityScore, 
      comments, 
      result,
      positionId
    } = body;

    if (!employeeId || !evaluatorId || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const evaluation = await (prisma as any).probationEvaluation.create({
      data: {
        employeeId,
        evaluatorId,
        periodDays: parseInt(periodDays),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        disciplineScore: parseInt(disciplineScore),
        learningScore: parseInt(learningScore),
        qualityScore: parseInt(qualityScore),
        comments,
        result,
        positionId: positionId || null,
      },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error creating probation evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Evaluation ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      evaluatorId,
      periodDays, 
      startDate,
      endDate,
      disciplineScore, 
      learningScore, 
      qualityScore, 
      comments, 
      result,
      positionId 
    } = body;

    const evaluation = await (prisma as any).probationEvaluation.update({
      where: { id },
      data: {
        ...(evaluatorId && { evaluatorId }),
        ...(periodDays !== undefined && { periodDays: parseInt(periodDays) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(disciplineScore !== undefined && { disciplineScore: parseInt(disciplineScore) }),
        ...(learningScore !== undefined && { learningScore: parseInt(learningScore) }),
        ...(qualityScore !== undefined && { qualityScore: parseInt(qualityScore) }),
        ...(comments !== undefined && { comments }),
        ...(result !== undefined && { result }),
        ...(positionId !== undefined && { positionId: positionId || null }),
      },
      include: {
        employee: { include: { user: true } },
        evaluator: true,
      },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error updating probation evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Evaluation ID is required' }, { status: 400 });
    }

    await prisma.probationEvaluation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
