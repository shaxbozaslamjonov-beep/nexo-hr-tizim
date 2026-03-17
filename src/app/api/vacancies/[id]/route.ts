import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET single vacancy
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
      include: { applications: { include: { candidate: true } }, _count: true },
    });
    if (!vacancy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(vacancy);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PATCH - update vacancy (status, details)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Directors can approve, HRs can edit
    const vacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        ...body,
        approvedBy: body.status === 'APPROVED' ? session.id : undefined,
      },
    });

    return NextResponse.json(vacancy);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update vacancy' }, { status: 500 });
  }
}

// DELETE  
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!['HR_MANAGER', 'ADMIN'].includes(session?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    await prisma.vacancy.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
