import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tracks = await prisma.trainingTrack.findMany({
    include: {
      modules: { orderBy: { id: 'asc' } },
    },
  });

  return NextResponse.json(tracks);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, roleTarget } = body;

  if (!title || !roleTarget) {
    return NextResponse.json({ error: 'Missing title or roleTarget' }, { status: 400 });
  }

  const track = await prisma.trainingTrack.create({
    data: { title, roleTarget },
  });

  return NextResponse.json(track, { status: 201 });
}
