import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { getCompanyLimits } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyDetails = await getCompanyLimits(session.companyId);
    return NextResponse.json(companyDetails);
  } catch (error) {
    console.error('GET /api/company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!can(session, 'manage_settings')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, plan } = body;

    const updated = await prisma.company.update({
      where: { id: session.companyId },
      data: {
        name: name ? String(name).trim() : undefined,
        plan: plan ? String(plan).toLowerCase() : undefined,
      },
    });

    return NextResponse.json({ message: 'Company updated successfully', company: updated });
  } catch (error) {
    console.error('PUT /api/company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
