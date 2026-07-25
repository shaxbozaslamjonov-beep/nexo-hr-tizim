import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function pathBelongsToCompany(pathId: string, companyId: string) {
  const path = await prisma.careerPath.findUnique({ where: { id: pathId }, select: { companyId: true } });
  return !!path && path.companyId === companyId;
}

async function milestoneBelongsToCompany(id: string, companyId: string) {
  const milestone = await prisma.careerMilestone.findUnique({ where: { id }, select: { path: { select: { companyId: true } } } });
  return !!milestone && milestone.path.companyId === companyId;
}

async function skillBelongsToCompany(id: string, companyId: string) {
  const skill = await prisma.careerSkill.findUnique({ where: { id }, select: { path: { select: { companyId: true } } } });
  return !!skill && skill.path.companyId === companyId;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const paths = await (prisma as any).careerPath.findMany({
      where: { companyId: session.companyId },
      include: {
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
        skills: true,
        employees: true,
        nextPath: true,
      },
      orderBy: {
        level: 'asc',
      },
    });
    return NextResponse.json(paths);
  } catch (error) {
    console.error('Error fetching career maps:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'PATH') {
      const path = await (prisma as any).careerPath.create({
        data: {
          name: data.name,
          description: data.description || '',
          level: parseInt(data.level) || 1,
          nextPathId: data.nextPathId || null,
          companyId: session.companyId,
        },
      });
      return NextResponse.json(path);
    }

    if (type === 'MILESTONE') {
      if (!(await pathBelongsToCompany(data.pathId, session.companyId))) {
        return NextResponse.json({ error: 'Path not found' }, { status: 404 });
      }
      const milestone = await (prisma as any).careerMilestone.create({
        data: {
          name: data.name,
          description: data.description || '',
          order: parseInt(data.order) || 0,
          pathId: data.pathId,
        },
      });
      return NextResponse.json(milestone);
    }

    if (type === 'SKILL') {
      if (!(await pathBelongsToCompany(data.pathId, session.companyId))) {
        return NextResponse.json({ error: 'Path not found' }, { status: 404 });
      }
      const skill = await (prisma as any).careerSkill.create({
        data: {
          name: data.name,
          description: data.description || '',
          level: data.level || 'BEGINNER',
          pathId: data.pathId,
        },
      });
      return NextResponse.json(skill);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating career element:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    if (type === 'PATH') {
      if (!(await pathBelongsToCompany(id, session.companyId))) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const path = await (prisma as any).careerPath.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description || '',
          level: parseInt(data.level) || 1,
          nextPathId: data.nextPathId || null
        },
      });
      return NextResponse.json(path);
    }

    if (type === 'MILESTONE') {
      if (!(await milestoneBelongsToCompany(id, session.companyId))) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const milestone = await (prisma as any).careerMilestone.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description || '',
          order: parseInt(data.order) || 0,
        },
      });
      return NextResponse.json(milestone);
    }

    if (type === 'SKILL') {
      if (!(await skillBelongsToCompany(id, session.companyId))) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const skill = await (prisma as any).careerSkill.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description || '',
          level: data.level,
        },
      });
      return NextResponse.json(skill);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error updating career element:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) return NextResponse.json({ error: 'ID and type are required' }, { status: 400 });

    if (type === 'PATH') {
      if (!(await pathBelongsToCompany(id, session.companyId))) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      await (prisma as any).careerPath.delete({ where: { id } });
    } else if (type === 'MILESTONE') {
      if (!(await milestoneBelongsToCompany(id, session.companyId))) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      await (prisma as any).careerMilestone.delete({ where: { id } });
    } else if (type === 'SKILL') {
      if (!(await skillBelongsToCompany(id, session.companyId))) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      await (prisma as any).careerSkill.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting career element:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
