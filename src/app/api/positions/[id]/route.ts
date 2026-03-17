import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const position = await (prisma as any).position.findUnique({
      where: { id },
    });

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsedPosition = {
      ...position,
      responsibilities: JSON.parse(position.responsibilities || '[]'),
      kpi: JSON.parse(position.kpi || '[]'),
      requiredSkills: JSON.parse(position.requiredSkills || '[]'),
      requiredKnowledge: JSON.parse(position.requiredKnowledge || '[]'),
      requiredCertificates: JSON.parse(position.requiredCertificates || '[]'),
      behavioralCompetencies: JSON.parse(position.behavioralCompetencies || '[]'),
      leadershipCompetencies: JSON.parse(position.leadershipCompetencies || '[]'),
      nextPositions: JSON.parse(position.nextPositions || '[]'),
      lateralMoves: JSON.parse(position.lateralMoves || '[]'),
      trainingRoadmap: JSON.parse(position.trainingRoadmap || '[]'),
      assessmentRequirements: JSON.parse(position.assessmentRequirements || '[]'),
      promotionRequirements: JSON.parse(position.promotionRequirements || '{}'),
    };

    return NextResponse.json(parsedPosition);
  } catch (error) {
    console.error('Error fetching position:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const position = await (prisma as any).position.update({
      where: { id },
      data: {
        title: body.title,
        department: body.department,
        grade: parseInt(body.grade),
        reportsTo: body.reportsTo,
        rolePurpose: body.rolePurpose,
        responsibilities: JSON.stringify(body.responsibilities),
        kpi: JSON.stringify(body.kpi),
        requiredSkills: JSON.stringify(body.requiredSkills),
        requiredKnowledge: JSON.stringify(body.requiredKnowledge),
        requiredCertificates: JSON.stringify(body.requiredCertificates),
        minExperience: parseInt(body.minExperience),
        behavioralCompetencies: JSON.stringify(body.behavioralCompetencies),
        leadershipCompetencies: JSON.stringify(body.leadershipCompetencies),
        nextPositions: JSON.stringify(body.nextPositions),
        lateralMoves: JSON.stringify(body.lateralMoves),
        trainingRoadmap: JSON.stringify(body.trainingRoadmap),
        assessmentRequirements: JSON.stringify(body.assessmentRequirements),
        promotionRequirements: JSON.stringify(body.promotionRequirements),
      },
    });

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await (prisma as any).position.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
