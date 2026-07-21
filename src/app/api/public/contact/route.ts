import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - public contact/lead submission (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!fullName || !phone || !message) {
      return NextResponse.json({ error: 'fullName, phone and message are required' }, { status: 400 });
    }

    const contactRequest = await prisma.contactRequest.create({
      data: { fullName, phone, message },
    });

    return NextResponse.json({ id: contactRequest.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit contact request' }, { status: 500 });
  }
}
