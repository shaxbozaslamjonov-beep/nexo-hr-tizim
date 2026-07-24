import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

// PATCH - update status/title/description/file of a task
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'use_ai_assistant')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const existing = await prisma.aiTask.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { status, title, description, fileUrl, fileName } = await request.json();
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.aiTask.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileName !== undefined && { fileName }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update AI task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - remove a task
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session, 'use_ai_assistant')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.aiTask.findUnique({ where: { id } });
  if (!existing || existing.companyId !== session.companyId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.aiTask.delete({ where: { id } });
  return NextResponse.json({ message: 'Deleted' });
}
