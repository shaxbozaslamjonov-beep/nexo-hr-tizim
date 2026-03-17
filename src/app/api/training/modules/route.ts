import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { trackId, title, description, contentUrl, type } = body;

  if (!trackId || !title || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const module = await prisma.trainingModule.create({
    data: {
      trackId,
      title,
      description,
      contentUrl,
      type,
    },
  });

  return NextResponse.json(module, { status: 201 });
}
