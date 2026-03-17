import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateReadinessScore, calculateSkillMatch } from '@/lib/readiness';

export async function POST(request: Request) {
  try {
    const { employeeId, targetPositionId } = await request.json();

    if (!employeeId || !targetPositionId) {
      return NextResponse.json({ error: 'Employee ID and Target Position ID are required' }, { status: 400 });
    }

    // 1. Fetch Employee Career Profile
    const profile = await (prisma as any).employeeCareerProfile.findUnique({
      where: { employeeId },
      include: {
        employee: {
          include: {
            kpis: true,
            assignments: true,
            testResults: true
          }
        }
      }
    });

    // 2. Fetch Target Position
    const position = await (prisma as any).position.findUnique({
      where: { id: targetPositionId }
    });

    if (!profile || !position) {
      return NextResponse.json({ error: 'Profile or Position not found' }, { status: 404 });
    }

    // 3. Parse Data
    const actualSkills = JSON.parse(profile.skills || '[]');
    const requiredSkills = JSON.parse(position.requiredSkills || '[]');
    const kpiHistory = JSON.parse(profile.kpiHistory || '[]');
    
    // 4. Calculate Components
    
    // Skill Match (40%)
    const skillMatch = calculateSkillMatch(actualSkills, requiredSkills);
    
    // KPI Achievement (20%) - last 6 months
    const lastSixMonthsKPI = kpiHistory.slice(-6);
    const avgKPI = lastSixMonthsKPI.length > 0 
      ? lastSixMonthsKPI.reduce((acc: number, curr: any) => acc + (curr.score / (curr.target || 100)), 0) / lastSixMonthsKPI.length
      : 0.7; // Default to 70% if no data

    // Assessments (15%)
    const assessments = JSON.parse(profile.assessments || '[]');
    const avgAssessment = assessments.length > 0
      ? assessments.reduce((acc: number, curr: any) => acc + (curr.score / 100), 0) / assessments.length
      : 0.7;

    // Behavioral Competencies (10%)
    // For now, using performance rating as proxy if specific behavioral ratings aren't present
    const behavioral = (profile.performanceRating || 3.5) / 5;

    // Learning Completion (10%)
    const trainingHistory = JSON.parse(profile.trainingHistory || '[]');
    const trainingRoadmap = JSON.parse(position.trainingRoadmap || '[]');
    const learningCompletion = trainingRoadmap.length > 0
      ? trainingRoadmap.filter((course: any) => trainingHistory.some((h: any) => h.title === course.title)).length / trainingRoadmap.length
      : 1.0;

    // Manager Review (5%)
    const managerReview = (profile.performanceRating || 3.5) / 5;

    // 5. Final Score
    const finalScore = calculateReadinessScore({
      skills: skillMatch,
      kpi: Math.min(avgKPI, 1.0),
      assessments: Math.min(avgAssessment, 1.0),
      behavioral: Math.min(behavioral, 1.0),
      learning: Math.min(learningCompletion, 1.0),
      manager: Math.min(managerReview, 1.0),
    });

    return NextResponse.json({
      score: finalScore,
      components: {
        skillMatch,
        avgKPI,
        avgAssessment,
        behavioral,
        learningCompletion,
        managerReview
      }
    });
  } catch (error) {
    console.error('Error calculating readiness:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
