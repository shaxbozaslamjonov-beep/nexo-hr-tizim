import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const grade = searchParams.get('grade');

    let where: any = {};
    if (department) where.department = department;
    if (grade) where.grade = parseInt(grade);

    const positions = await prisma.position.findMany({
      where,
      include: {
        _count: {
          select: {
            employees: true,
            vacancies: true,
          }
        }
      },
      orderBy: {
        grade: 'asc',
      },
    });

    // Parse JSON fields
    const parsedPositions = positions.map((pos: any) => ({
      ...pos,
      responsibilities: JSON.parse(pos.responsibilities || '[]'),
      kpi: JSON.parse(pos.kpi || '[]'),
      requiredSkills: JSON.parse(pos.requiredSkills || '[]'),
      requiredKnowledge: JSON.parse(pos.requiredKnowledge || '[]'),
      requiredCertificates: JSON.parse(pos.requiredCertificates || '[]'),
      behavioralCompetencies: JSON.parse(pos.behavioralCompetencies || '[]'),
      leadershipCompetencies: JSON.parse(pos.leadershipCompetencies || '[]'),
      nextPositions: JSON.parse(pos.nextPositions || '[]'),
      lateralMoves: JSON.parse(pos.lateralMoves || '[]'),
      trainingRoadmap: JSON.parse(pos.trainingRoadmap || '[]'),
      assessmentRequirements: JSON.parse(pos.assessmentRequirements || '[]'),
      promotionRequirements: JSON.parse(pos.promotionRequirements || '{}'),
    }));

    return NextResponse.json(parsedPositions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const position = await prisma.position.create({
      data: {
        title: body.title,
        department: body.department,
        grade: parseInt(body.grade) || 1,
        status: body.status || 'active',
        isCritical: !!body.isCritical,
        reportsTo: body.reportsTo || null,
        rolePurpose: body.rolePurpose || '',
        responsibilities: JSON.stringify(body.responsibilities || []),
        kpi: JSON.stringify(body.kpi || []),
        requiredSkills: JSON.stringify(body.requiredSkills || []),
        requiredKnowledge: JSON.stringify(body.requiredKnowledge || []),
        requiredCertificates: JSON.stringify(body.requiredCertificates || []),
        minExperience: parseInt(body.minExperience) || 0,
        behavioralCompetencies: JSON.stringify(body.behavioralCompetencies || []),
        leadershipCompetencies: JSON.stringify(body.leadershipCompetencies || []),
        nextPositions: JSON.stringify(body.nextPositions || []),
        lateralMoves: JSON.stringify(body.lateralMoves || []),
        trainingRoadmap: JSON.stringify(body.trainingRoadmap || []),
        assessmentRequirements: JSON.stringify(body.assessmentRequirements || []),
        promotionRequirements: JSON.stringify(body.promotionRequirements || {}),
      },
    });

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const body = await request.json();
    const position = await prisma.position.update({
      where: { id },
      data: {
        title: body.title,
        department: body.department,
        grade: parseInt(body.grade) || 1,
        status: body.status || 'active',
        isCritical: !!body.isCritical,
        reportsTo: body.reportsTo || null,
        rolePurpose: body.rolePurpose || '',
        responsibilities: JSON.stringify(body.responsibilities || []),
        kpi: JSON.stringify(body.kpi || []),
        requiredSkills: JSON.stringify(body.requiredSkills || []),
        requiredKnowledge: JSON.stringify(body.requiredKnowledge || []),
        requiredCertificates: JSON.stringify(body.requiredCertificates || []),
        minExperience: parseInt(body.minExperience) || 0,
        behavioralCompetencies: JSON.stringify(body.behavioralCompetencies || []),
        leadershipCompetencies: JSON.stringify(body.leadershipCompetencies || []),
        nextPositions: JSON.stringify(body.nextPositions || []),
        lateralMoves: JSON.stringify(body.lateralMoves || []),
        trainingRoadmap: JSON.stringify(body.trainingRoadmap || []),
        assessmentRequirements: JSON.stringify(body.assessmentRequirements || []),
        promotionRequirements: JSON.stringify(body.promotionRequirements || {}),
      },
    });

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Safeguard: Check if in use
    const relations = await Promise.all([
      prisma.employeeProfile.count({ where: { positionId: id } }),
      prisma.vacancy.count({ where: { positionId: id } }),
      prisma.onboardingTask.count({ where: { positionId: id } }),
      prisma.kPI.count({ where: { positionId: id } }),
      prisma.probationEvaluation.count({ where: { positionId: id } }),
    ]);

    const totalRelations = relations.reduce((a, b) => a + b, 0);

    if (totalRelations > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete position that is in use across modules', 
        details: {
          employees: relations[0],
          vacancies: relations[1],
          onboardingTasks: relations[2],
          kpis: relations[3],
          probationEvaluations: relations[4]
        }
      }, { status: 400 });
    }

    await prisma.position.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
