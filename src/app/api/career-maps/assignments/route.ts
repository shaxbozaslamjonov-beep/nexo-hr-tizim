import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function employeeBelongsToCompany(employeeId: string, companyId: string) {
  const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { user: { select: { companyId: true } } } });
  return !!employee && employee.user.companyId === companyId;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const pathId = searchParams.get('pathId');

    if (pathId) {
      const path = await prisma.careerPath.findUnique({ where: { id: pathId }, select: { companyId: true } });
      if (!path || path.companyId !== session.companyId) {
        return NextResponse.json({ error: 'Path not found' }, { status: 404 });
      }

      const employees = await prisma.employeeProfile.findMany({
        where: { careerPathId: pathId, user: { companyId: session.companyId } } as any,
        include: {
          user: {
            select: {
              email: true,
            }
          }
        }
      });
      return NextResponse.json(employees);
    }

    // Otherwise return all employees to allowed for assignment
    const employees = await prisma.employeeProfile.findMany({
      where: { user: { companyId: session.companyId } },
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { employeeId, pathId } = await request.json();

    if (!employeeId || !pathId) {
      return NextResponse.json({ error: 'Employee ID and Path ID are required' }, { status: 400 });
    }

    if (!(await employeeBelongsToCompany(employeeId, session.companyId))) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    const pathOwnerCheck = await prisma.careerPath.findUnique({ where: { id: pathId }, select: { companyId: true } });
    if (!pathOwnerCheck || pathOwnerCheck.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    const updatedEmployee = await prisma.employeeProfile.update({
      where: { id: employeeId },
      data: { careerPathId: pathId } as any,
    });

    // Initialize progress for the new path
    const path = await (prisma as any).careerPath.findUnique({
      where: { id: pathId },
      include: { milestones: true, skills: true }
    });

    if (path) {
      // Create initial progress entries if they don't exist
      for (const milestone of path.milestones) {
        await (prisma as any).employeeMilestoneProgress.upsert({
          where: { employeeId_milestoneId: { employeeId, milestoneId: milestone.id } } as any,
          update: {},
          create: { employeeId, milestoneId: milestone.id }
        });
      }
      for (const skill of path.skills) {
        await (prisma as any).employeeSkillProgress.upsert({
          where: { employeeId_skillId: { employeeId, skillId: skill.id } } as any,
          update: {},
          create: { employeeId, skillId: skill.id }
        });
      }
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Error assigning employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    if (!(await employeeBelongsToCompany(employeeId, session.companyId))) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const updatedEmployee = await prisma.employeeProfile.update({
      where: { id: employeeId },
      data: { careerPathId: null } as any,
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Error unassigning employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
