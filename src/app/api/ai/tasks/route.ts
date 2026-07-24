import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// GET - list all Kanban tasks for the caller's company
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session, 'use_ai_assistant')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tasks = await prisma.aiTask.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tasks);
}

// POST - create a new task, optionally with an attached file (data URL)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!can(session, 'use_ai_assistant')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, description, fileUrl, fileName } = await request.json();
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.aiTask.create({
      data: {
        companyId: session.companyId,
        title: title.trim(),
        description: description || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        createdBy: session.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create AI task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
