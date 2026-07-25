import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { getDefaultCompanyId } from '@/lib/company';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublicOnly = searchParams.get('public') === 'true';

    const session = await getSession();
    let companyId = session?.companyId;

    if (!companyId) {
      companyId = await getDefaultCompanyId();
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        companyId,
        ...(isPublicOnly ? { isPublic: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('GET /api/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!can(session, 'manage_settings') && !can(session, 'view_hr_dashboard')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, isPublic } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Sarlavha va kontent majburiy' }, { status: 400 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        companyId: session.companyId,
        title: title.trim(),
        content: content.trim(),
        isPublic: isPublic !== false,
        authorId: session.id,
      },
    });

    return NextResponse.json({ announcement: newAnnouncement, message: 'E\'lon muvaffaqiyatli chop etildi' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!can(session, 'manage_settings')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const target = await prisma.announcement.findUnique({ where: { id } });
    if (!target || target.companyId !== session.companyId) {
      return NextResponse.json({ error: 'E\'lon topilmadi' }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ message: 'E\'lon o\'chirildi' });
  } catch (error) {
    console.error('DELETE /api/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
