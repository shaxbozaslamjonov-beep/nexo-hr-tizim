import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// GET - list all vacancies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const vacancies = await prisma.vacancy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json(vacancies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch vacancies' }, { status: 500 });
  }
}

// POST - create a new vacancy
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!can(session, 'manage_vacancies')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, department, description, requirements, salaryRange, salaryMin, salaryMax, shift, positionId } = body;

    if (!title || !department || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vacancy = await (prisma as any).vacancy.create({
      data: {
        title,
        department,
        description,
        requirements: requirements || '',
        salaryRange: salaryRange || '',
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        shift: shift || '',
        status: 'PENDING_APPROVAL',
        createdBy: session.id,
        positionId: positionId || null,
      },
    });

    return NextResponse.json(vacancy, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create vacancy' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, title, department, description, requirements, salaryRange, salaryMin, salaryMax, shift, status, positionId } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const vacancy = await (prisma as any).vacancy.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(department && { department }),
        ...(description && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(salaryMin !== undefined && { salaryMin: Number(salaryMin) }),
        ...(salaryMax !== undefined && { salaryMax: Number(salaryMax) }),
        ...(shift !== undefined && { shift }),
        ...(status && { status }),
        ...(positionId !== undefined && { positionId: positionId || null }),
      },
    });

    return NextResponse.json(vacancy);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update vacancy' }, { status: 500 });
  }
}
