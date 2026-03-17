import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
       return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const milestoneProgress = await (prisma as any).employeeMilestoneProgress.findMany({
      where: { employeeId },
      include: { milestone: true }
    });

    const skillProgress = await (prisma as any).employeeSkillProgress.findMany({
      where: { employeeId },
      include: { skill: true }
    });

    return NextResponse.json({ milestoneProgress, skillProgress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { employeeId, type, itemId, completed } = await request.json();

    if (!employeeId || !type || !itemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'MILESTONE') {
      const progress = await (prisma as any).employeeMilestoneProgress.upsert({
        where: { employeeId_milestoneId: { employeeId, milestoneId: itemId } },
        update: { 
          completed,
          completedAt: completed ? new Date() : null 
        },
        create: { 
          employeeId, 
          milestoneId: itemId,
          completed,
          completedAt: completed ? new Date() : null
        }
      });
      
      // Update overall employee progress percentage
      await updateEmployeeOverallProgress(employeeId);
      
      return NextResponse.json(progress);
    }

    if (type === 'SKILL') {
      const progress = await (prisma as any).employeeSkillProgress.upsert({
        where: { employeeId_skillId: { employeeId, skillId: itemId } },
        update: { 
          completed,
          completedAt: completed ? new Date() : null 
        },
        create: { 
          employeeId, 
          skillId: itemId,
          completed,
          completedAt: completed ? new Date() : null
        }
      });

      // Update overall employee progress percentage
      await updateEmployeeOverallProgress(employeeId);

      return NextResponse.json(progress);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function updateEmployeeOverallProgress(employeeId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: employeeId },
    include: {
      careerPath: {
        include: {
          milestones: true,
          skills: true,
        }
      },
      milestoneProgress: { where: { completed: true } },
      skillProgress: { where: { completed: true } },
    } as any
  });

  if (!profile || !(profile as any).careerPath) return;
  const careerPath = (profile as any).careerPath;

  const totalItems = careerPath.milestones.length + careerPath.skills.length;
  if (totalItems === 0) return;

  const completedItems = (profile as any).milestoneProgress.length + (profile as any).skillProgress.length;
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  await prisma.employeeProfile.update({
    where: { id: employeeId },
    data: { careerProgress: progressPercent }
  });
}
