import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const reserve = await prisma.reserve.findMany({
    include: {
      candidate: {
        include: {
          user: { select: { email: true } },
          applications: { include: { vacancy: true }, take: 1 }
        }
      }
    },
    orderBy: { addedAt: 'desc' },
  });

  // Map to match the interface expected by the UI if needed, 
  // though the UI seems to access r.candidate.email now.
  const formatted = reserve.map((r: any) => ({
    ...r,
    candidate: {
      ...r.candidate,
      email: r.candidate.user.email
    }
  }));

  return NextResponse.json(formatted);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { candidateId } = body;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: { applications: { include: { vacancy: true }, take: 1 } }
    });

    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    const reserve = await prisma.reserve.create({
      data: {
        candidateId,
        targetRole: candidate.applications[0]?.vacancy.title || 'Unknown',
        branch: candidate.applications[0]?.vacancy.department || 'General',
        readiness: 80,
      },
    });

    return NextResponse.json(reserve, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.reserve.delete({ where: { id } });
    return NextResponse.json({ message: 'Removed from reserve' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
  }
}
